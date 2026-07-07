require('dotenv').config();

const path = require('path');
const express = require('express');
const cookieSession = require('cookie-session');
const bcrypt = require('bcryptjs');
const postgres = require('postgres');

if (!process.env.DATABASE_URL) {
  console.error('DATABASE_URL não definida. Configure o .env antes de iniciar.');
  process.exit(1);
}
if (!process.env.SESSION_SECRET) {
  console.error('SESSION_SECRET não definida. Configure o .env antes de iniciar.');
  process.exit(1);
}

// prepare: false é obrigatório com o pooler do Supabase em modo transaction
const sql = postgres(process.env.DATABASE_URL, { prepare: false });

const app = express();
app.set('trust proxy', 1);
app.use(express.json({ limit: '1mb' }));
app.use(function (req, res, next) {
  if (!req.body) req.body = {};
  next();
});
app.use(
  cookieSession({
    name: 'eterverso_session',
    keys: [process.env.SESSION_SECRET],
    maxAge: 30 * 24 * 60 * 60 * 1000,
    httpOnly: true,
    sameSite: 'lax',
    secure: !!(process.env.RENDER || process.env.NODE_ENV === 'production'),
  })
);

// ---------- Arquivos estáticos (allowlist: nada além do site é servido) ----------

const STATIC_FILES = {
  '/': 'index.html',
  '/index.html': 'index.html',
  '/app.js': 'app.js',
  '/editor.js': 'editor.js',
  '/style.css': 'style.css',
};
Object.keys(STATIC_FILES).forEach(function (route) {
  app.get(route, function (req, res) {
    res.sendFile(path.join(__dirname, STATIC_FILES[route]));
  });
});

// ---------- Autenticação por usuário e senha ----------

function publicUser(u) {
  return {
    id: u.id,
    username: u.username,
    email: u.email,
    avatar: u.avatar,
    title: u.title,
    bio: u.bio,
    role: u.role,
    posts: u.posts_count,
    joinDate: u.join_date,
    admTentativaUsada: u.adm_tentativa_usada,
  };
}

const USERNAME_RE = /^[A-Za-z0-9_.\- ]{3,50}$/;
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

app.post('/api/auth/signup', async function (req, res) {
  try {
    const username = String(req.body.username || '').trim();
    const email = String(req.body.email || '').trim().toLowerCase();
    const password = String(req.body.password || '');

    if (!USERNAME_RE.test(username)) {
      return res.status(400).json({ error: 'Usuário inválido: use 3 a 50 caracteres (letras, números, espaço, _ . -).' });
    }
    if (!EMAIL_RE.test(email) || email.length > 120) {
      return res.status(400).json({ error: 'Email inválido.' });
    }
    if (password.length < 6 || password.length > 200) {
      return res.status(400).json({ error: 'A senha deve ter pelo menos 6 caracteres.' });
    }

    const existing = await sql`
      SELECT username, email FROM users
      WHERE lower(username) = lower(${username}) OR lower(email) = ${email}
      LIMIT 1`;
    if (existing.length > 0) {
      const taken = existing[0].username.toLowerCase() === username.toLowerCase() ? 'nome de usuário' : 'email';
      return res.status(409).json({ error: 'Esse ' + taken + ' já está em uso.' });
    }

    const passwordHash = await bcrypt.hash(password, 10);
    const rows = await sql`
      INSERT INTO users (username, email, password_hash, title)
      VALUES (${username}, ${email}, ${passwordHash}, 'Membro')
      RETURNING *`;

    req.session.userId = rows[0].id;
    res.status(201).json({ user: publicUser(rows[0]) });
  } catch (err) {
    console.error('signup:', err);
    res.status(500).json({ error: 'Erro interno ao criar a conta.' });
  }
});

app.post('/api/auth/login', async function (req, res) {
  try {
    const username = String(req.body.username || '').trim();
    const password = String(req.body.password || '');
    if (!username || !password) {
      return res.status(400).json({ error: 'Preencha usuário e senha.' });
    }

    const rows = await sql`
      SELECT * FROM users WHERE lower(username) = lower(${username}) LIMIT 1`;
    const user = rows[0];
    const ok = user && user.password_hash && (await bcrypt.compare(password, user.password_hash));
    if (!ok) {
      return res.status(401).json({ error: 'Usuário ou senha incorretos.' });
    }

    req.session.userId = user.id;
    res.json({ user: publicUser(user) });
  } catch (err) {
    console.error('login:', err);
    res.status(500).json({ error: 'Erro interno ao fazer login.' });
  }
});

app.post('/api/auth/logout', function (req, res) {
  req.session = null;
  res.json({ ok: true });
});

app.get('/api/auth/me', async function (req, res) {
  try {
    if (!req.session.userId) return res.status(401).json({ user: null });
    const rows = await sql`SELECT * FROM users WHERE id = ${req.session.userId} LIMIT 1`;
    if (rows.length === 0) {
      req.session = null;
      return res.status(401).json({ user: null });
    }
    res.json({ user: publicUser(rows[0]) });
  } catch (err) {
    console.error('me:', err);
    res.status(500).json({ error: 'Erro interno.' });
  }
});

// ---------- Personagens (fichas) ----------

const STAT_KEYS = ['ataque', 'destreza', 'defesa', 'reserva', 'controle', 'refino', 'emissao', 'alma', 'inteligencia', 'habilidade'];
const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

function publicPersonagem(p) {
  return {
    id: p.id,
    nome: p.nome,
    categoria: p.categoria,
    titulo: p.titulo,
    raca: p.raca,
    faccao: p.faccao,
    status: p.status,
    imagem: p.imagem,
    descricao: p.descricao,
    stats: p.stats || {},
    skills: p.skills || [],
    mascaraTier: p.mascara_tier,
  };
}

function sanitizeStats(raw) {
  const stats = {};
  if (!raw || typeof raw !== 'object') return stats;
  STAT_KEYS.forEach(function (k) {
    if (raw[k] === undefined || raw[k] === null || raw[k] === '') return;
    let n = parseInt(raw[k], 10);
    if (isNaN(n)) n = 0;
    stats[k] = Math.max(0, Math.min(100, n));
  });
  return stats;
}

function sanitizeSkills(raw) {
  if (!Array.isArray(raw)) return [];
  const skills = [];
  for (const item of raw) {
    if (skills.length >= 60) break;
    if (!item || typeof item !== 'object') continue;
    const nome = String(item.nome || '').trim().slice(0, 100);
    const descricao = String(item.descricao || '').trim().slice(0, 2000);
    const tipo = item.tipo === 'equipamento' ? 'equipamento' : 'skill';
    if (nome || descricao) skills.push({ nome, descricao, tipo });
  }
  return skills;
}

const PERSONAGEM_CAMPOS = [
  ['nome', 100],
  ['categoria', 50],
  ['titulo', 100],
  ['raca', 80],
  ['faccao', 120],
  ['status', 80],
  ['imagem', 500],
  ['mascaraTier', 60],
];

function lerPersonagemBody(body) {
  const v = {};
  for (const [campo, max] of PERSONAGEM_CAMPOS) {
    const valor = String(body[campo] || '').trim();
    if (valor.length > max) return { error: 'O campo "' + campo + '" excede ' + max + ' caracteres.' };
    v[campo] = valor;
  }
  if (!v.nome) return { error: 'O nome é obrigatório.' };
  v.descricao = String(body.descricao || '');
  if (!v.descricao || v.descricao === '<br>') return { error: 'A descrição é obrigatória.' };
  if (v.descricao.length > 200000) return { error: 'A descrição é longa demais.' };
  v.stats = sanitizeStats(body.stats);
  v.skills = sanitizeSkills(body.skills);
  return { valores: v };
}

async function requireModOrAdmin(req, res) {
  if (!req.session.userId) {
    res.status(401).json({ error: 'Faça login para gerenciar personagens.' });
    return null;
  }
  const rows = await sql`SELECT * FROM users WHERE id = ${req.session.userId} LIMIT 1`;
  const user = rows[0];
  if (!user || (user.role !== 'admin' && user.role !== 'moderador')) {
    res.status(403).json({ error: 'Apenas administradores e moderadores podem gerenciar personagens.' });
    return null;
  }
  return user;
}

app.get('/api/personagens', async function (req, res) {
  try {
    const rows = await sql`SELECT * FROM personagens ORDER BY created_at ASC`;
    res.json({ personagens: rows.map(publicPersonagem) });
  } catch (err) {
    console.error('personagens list:', err);
    res.status(500).json({ error: 'Erro interno ao listar personagens.' });
  }
});

app.post('/api/personagens', async function (req, res) {
  try {
    const user = await requireModOrAdmin(req, res);
    if (!user) return;
    const { error, valores: v } = lerPersonagemBody(req.body);
    if (error) return res.status(400).json({ error });

    const rows = await sql`
      INSERT INTO personagens (author_id, nome, categoria, titulo, raca, faccao, status, imagem, descricao, stats, skills, mascara_tier)
      VALUES (${user.id}, ${v.nome}, ${v.categoria}, ${v.titulo}, ${v.raca}, ${v.faccao}, ${v.status}, ${v.imagem}, ${v.descricao}, ${sql.json(v.stats)}, ${sql.json(v.skills)}, ${v.mascaraTier})
      RETURNING *`;
    res.status(201).json({ personagem: publicPersonagem(rows[0]) });
  } catch (err) {
    console.error('personagem create:', err);
    res.status(500).json({ error: 'Erro interno ao cadastrar o personagem.' });
  }
});

app.put('/api/personagens/:id', async function (req, res) {
  try {
    const user = await requireModOrAdmin(req, res);
    if (!user) return;
    if (!UUID_RE.test(req.params.id)) return res.status(404).json({ error: 'Personagem não encontrado.' });
    const { error, valores: v } = lerPersonagemBody(req.body);
    if (error) return res.status(400).json({ error });

    const rows = await sql`
      UPDATE personagens SET
        nome = ${v.nome}, categoria = ${v.categoria}, titulo = ${v.titulo}, raca = ${v.raca},
        faccao = ${v.faccao}, status = ${v.status}, imagem = ${v.imagem}, descricao = ${v.descricao},
        stats = ${sql.json(v.stats)}, skills = ${sql.json(v.skills)}, mascara_tier = ${v.mascaraTier}, updated_at = now()
      WHERE id = ${req.params.id}
      RETURNING *`;
    if (rows.length === 0) return res.status(404).json({ error: 'Personagem não encontrado.' });
    res.json({ personagem: publicPersonagem(rows[0]) });
  } catch (err) {
    console.error('personagem update:', err);
    res.status(500).json({ error: 'Erro interno ao salvar o personagem.' });
  }
});

app.delete('/api/personagens/:id', async function (req, res) {
  try {
    const user = await requireModOrAdmin(req, res);
    if (!user) return;
    if (!UUID_RE.test(req.params.id)) return res.status(404).json({ error: 'Personagem não encontrado.' });
    const rows = await sql`DELETE FROM personagens WHERE id = ${req.params.id} RETURNING id`;
    if (rows.length === 0) return res.status(404).json({ error: 'Personagem não encontrado.' });
    res.json({ ok: true });
  } catch (err) {
    console.error('personagem delete:', err);
    res.status(500).json({ error: 'Erro interno ao excluir o personagem.' });
  }
});

app.use(function (req, res) {
  if (req.path.startsWith('/api/')) return res.status(404).json({ error: 'Rota não encontrada.' });
  res.redirect('/');
});

const port = Number(process.env.PORT) || 3000;
app.listen(port, function () {
  console.log('Éterverso no ar na porta ' + port);
});
