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
app.use(express.json({ limit: '5mb' }));
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

// Garante que a tabela de posts/cenas da wikia e colunas extras existam no banco
async function ensureSchema() {
  try {
    await sql`
      CREATE TABLE IF NOT EXISTS "wiki_posts" (
        "id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
        "author_id" uuid REFERENCES "users"("id") ON DELETE SET NULL,
        "titulo" varchar(200) NOT NULL,
        "subtitulo" varchar(200) DEFAULT '',
        "categoria" varchar(80) DEFAULT 'Cena de RPG',
        "status" varchar(80) DEFAULT 'Em Andamento',
        "resumo" text DEFAULT '',
        "banner" text DEFAULT '',
        "descricao" text DEFAULT '',
        "theme" jsonb DEFAULT '{}'::jsonb,
        "infobox" jsonb DEFAULT '{}'::jsonb,
        "blocks" jsonb DEFAULT '[]'::jsonb,
        "turns" jsonb DEFAULT '[]'::jsonb,
        "created_at" timestamp DEFAULT now() NOT NULL,
        "updated_at" timestamp DEFAULT now() NOT NULL
      )`;
    await sql`ALTER TABLE "personagens" ADD COLUMN IF NOT EXISTS "blocks" jsonb DEFAULT '[]'::jsonb`;
    await sql`ALTER TABLE "personagens" ADD COLUMN IF NOT EXISTS "theme" jsonb DEFAULT '{}'::jsonb`;
  } catch (err) {
    console.warn('Aviso ao verificar schema do banco:', err.message);
  }
}
ensureSchema();

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

app.put('/api/auth/profile', async function (req, res) {
  try {
    const user = await requireAuthUser(req, res);
    if (!user) return;

    const avatar = String(req.body.avatar !== undefined ? req.body.avatar : user.avatar).trim().slice(0, 500);
    const title = String(req.body.title !== undefined ? req.body.title : user.title).trim().slice(0, 80) || 'Membro';
    const bio = String(req.body.bio !== undefined ? req.body.bio : user.bio).trim().slice(0, 2000);
    const newPassword = String(req.body.newPassword || '');

    if (newPassword) {
      if (newPassword.length < 6 || newPassword.length > 200) {
        return res.status(400).json({ error: 'A nova senha deve ter pelo menos 6 caracteres.' });
      }
      const passwordHash = await bcrypt.hash(newPassword, 10);
      const rows = await sql`
        UPDATE users SET avatar = ${avatar}, title = ${title}, bio = ${bio}, password_hash = ${passwordHash}
        WHERE id = ${user.id}
        RETURNING *`;
      return res.json({ user: publicUser(rows[0]) });
    }

    const rows = await sql`
      UPDATE users SET avatar = ${avatar}, title = ${title}, bio = ${bio}
      WHERE id = ${user.id}
      RETURNING *`;
    res.json({ user: publicUser(rows[0]) });
  } catch (err) {
    console.error('profile update:', err);
    res.status(500).json({ error: 'Erro interno ao atualizar perfil.' });
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
    blocks: Array.isArray(p.blocks) ? p.blocks : [],
    theme: p.theme && typeof p.theme === 'object' ? p.theme : {},
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

function sanitizeBlocks(raw) {
  if (!Array.isArray(raw)) return [];
  return raw.slice(0, 40).filter(function (b) { return b && typeof b === 'object' && b.type; });
}

function sanitizeTheme(raw) {
  if (!raw || typeof raw !== 'object') return {};
  return {
    accentColor: String(raw.accentColor || '').slice(0, 30),
    bannerStyle: String(raw.bannerStyle || '').slice(0, 30),
    layout: String(raw.layout || '').slice(0, 30),
    fontFamily: String(raw.fontFamily || '').slice(0, 40),
    bgEffect: String(raw.bgEffect || '').slice(0, 30),
    bgm: String(raw.bgm || '').slice(0, 300),
  };
}

function sanitizeInfobox(raw) {
  if (!raw || typeof raw !== 'object') return {};
  const fields = Array.isArray(raw.fields)
    ? raw.fields.slice(0, 30).map(function (f) {
        return {
          label: String((f && f.label) || '').trim().slice(0, 80),
          value: String((f && f.value) || '').trim().slice(0, 300),
        };
      }).filter(function (f) { return f.label || f.value; })
    : [];
  const participants = Array.isArray(raw.participants)
    ? raw.participants.slice(0, 30).map(function (p) { return String(p || '').trim().slice(0, 100); }).filter(Boolean)
    : [];
  return {
    show: raw.show !== false,
    title: String(raw.title || '').trim().slice(0, 120),
    image: String(raw.image || '').trim().slice(0, 600),
    caption: String(raw.caption || '').trim().slice(0, 200),
    location: String(raw.location || '').trim().slice(0, 160),
    timeline: String(raw.timeline || '').trim().slice(0, 160),
    participants: participants,
    fields: fields,
  };
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
  if (v.descricao.length > 250000) return { error: 'A descrição é longa demais.' };
  v.stats = sanitizeStats(body.stats);
  v.skills = sanitizeSkills(body.skills);
  v.blocks = sanitizeBlocks(body.blocks);
  v.theme = sanitizeTheme(body.theme);
  return { valores: v };
}

async function requireAuthUser(req, res) {
  if (!req.session.userId) {
    res.status(401).json({ error: 'Faça login para realizar esta ação.' });
    return null;
  }
  const rows = await sql`SELECT * FROM users WHERE id = ${req.session.userId} LIMIT 1`;
  const user = rows[0];
  if (!user) {
    res.status(401).json({ error: 'Sessão inválida. Faça login novamente.' });
    return null;
  }
  return user;
}

async function requireModOrAdmin(req, res) {
  if (!req.session.userId) {
    res.status(401).json({ error: 'Faça login para gerenciar a wikia.' });
    return null;
  }
  const rows = await sql`SELECT * FROM users WHERE id = ${req.session.userId} LIMIT 1`;
  const user = rows[0];
  if (!user || (user.role !== 'admin' && user.role !== 'moderador')) {
    res.status(403).json({ error: 'Apenas administradores e moderadores podem gerenciar páginas da wikia.' });
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
      INSERT INTO personagens (author_id, nome, categoria, titulo, raca, faccao, status, imagem, descricao, stats, skills, mascara_tier, blocks, theme)
      VALUES (${user.id}, ${v.nome}, ${v.categoria}, ${v.titulo}, ${v.raca}, ${v.faccao}, ${v.status}, ${v.imagem}, ${v.descricao}, ${sql.json(v.stats)}, ${sql.json(v.skills)}, ${v.mascaraTier}, ${sql.json(v.blocks)}, ${sql.json(v.theme)})
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
        stats = ${sql.json(v.stats)}, skills = ${sql.json(v.skills)}, mascara_tier = ${v.mascaraTier},
        blocks = ${sql.json(v.blocks)}, theme = ${sql.json(v.theme)}, updated_at = now()
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

// ---------- Wikia Posts / Cenas de RPG ----------

function publicWikiPost(w) {
  return {
    id: w.id,
    authorId: w.author_id,
    titulo: w.titulo,
    subtitulo: w.subtitulo || '',
    categoria: w.categoria || 'Cena de RPG',
    status: w.status || 'Em Andamento',
    resumo: w.resumo || '',
    banner: w.banner || '',
    descricao: w.descricao || '',
    theme: w.theme && typeof w.theme === 'object' ? w.theme : {},
    infobox: w.infobox && typeof w.infobox === 'object' ? w.infobox : {},
    blocks: Array.isArray(w.blocks) ? w.blocks : [],
    turns: Array.isArray(w.turns) ? w.turns : [],
    createdAt: w.created_at,
    updatedAt: w.updated_at,
  };
}

function lerWikiPostBody(body) {
  const titulo = String(body.titulo || '').trim().slice(0, 200);
  if (!titulo) return { error: 'O título da cena/post é obrigatório.' };
  const subtitulo = String(body.subtitulo || '').trim().slice(0, 200);
  const categoria = String(body.categoria || 'Cena de RPG').trim().slice(0, 80);
  const status = String(body.status || 'Em Andamento').trim().slice(0, 80);
  const resumo = String(body.resumo || '').trim().slice(0, 1000);
  const banner = String(body.banner || '').trim().slice(0, 600);
  const descricao = String(body.descricao || '');
  if (descricao.length > 300000) return { error: 'O conteúdo principal é longo demais.' };
  const theme = sanitizeTheme(body.theme);
  const infobox = sanitizeInfobox(body.infobox);
  const blocks = sanitizeBlocks(body.blocks);
  const turns = Array.isArray(body.turns) ? body.turns : undefined;
  return {
    valores: { titulo, subtitulo, categoria, status, resumo, banner, descricao, theme, infobox, blocks, turns },
  };
}

function sanitizeTurnBody(body, user) {
  const content = String(body.content || '').trim();
  if (!content || content === '<br>') return { error: 'O texto do turno não pode ficar vazio.' };
  if (content.length > 150000) return { error: 'O turno é longo demais.' };
  const images = Array.isArray(body.images)
    ? body.images.slice(0, 20).map(function (img) {
        if (typeof img === 'string') return { url: img.trim().slice(0, 600), caption: '' };
        if (!img || typeof img !== 'object') return null;
        const url = String(img.url || '').trim().slice(0, 600);
        const caption = String(img.caption || '').trim().slice(0, 240);
        return url ? { url, caption } : null;
      }).filter(Boolean)
    : [];
  return {
    turno: {
      id: String(body.id || (Date.now() + '-' + Math.random().toString(36).slice(2, 8))),
      authorId: user ? user.id : (body.authorId || null),
      authorName: user ? user.username : String(body.authorName || 'Viajante').slice(0, 60),
      authorRole: user ? user.role : String(body.authorRole || 'member'),
      characterName: String(body.characterName || '').trim().slice(0, 100),
      characterTitle: String(body.characterTitle || '').trim().slice(0, 120),
      characterAvatar: String(body.characterAvatar || '').trim().slice(0, 600),
      turnTitle: String(body.turnTitle || '').trim().slice(0, 160),
      location: String(body.location || '').trim().slice(0, 120),
      banner: String(body.banner || '').trim().slice(0, 600),
      bannerStyle: String(body.bannerStyle || 'panoramic').slice(0, 30),
      images: images,
      content: content,
      oocNotes: String(body.oocNotes || '').trim().slice(0, 4000),
      accentColor: String(body.accentColor || '').trim().slice(0, 30),
      fontFamily: String(body.fontFamily || '').trim().slice(0, 30),
      date: String(body.date || new Date().toLocaleString('pt-BR', { dateStyle: 'short', timeStyle: 'short' })),
      edited: !!body.edited,
    },
  };
}

app.get('/api/wiki-posts', async function (req, res) {
  try {
    const rows = await sql`SELECT * FROM wiki_posts ORDER BY created_at DESC`;
    res.json({ wikiPosts: rows.map(publicWikiPost) });
  } catch (err) {
    console.error('wiki-posts list:', err);
    res.status(500).json({ error: 'Erro interno ao listar cenas da wikia.' });
  }
});

app.post('/api/wiki-posts', async function (req, res) {
  try {
    const user = await requireModOrAdmin(req, res);
    if (!user) return;
    const { error, valores: v } = lerWikiPostBody(req.body);
    if (error) return res.status(400).json({ error });

    const initialTurns = Array.isArray(v.turns) ? v.turns : [];
    const rows = await sql`
      INSERT INTO wiki_posts (author_id, titulo, subtitulo, categoria, status, resumo, banner, descricao, theme, infobox, blocks, turns)
      VALUES (${user.id}, ${v.titulo}, ${v.subtitulo}, ${v.categoria}, ${v.status}, ${v.resumo}, ${v.banner}, ${v.descricao}, ${sql.json(v.theme)}, ${sql.json(v.infobox)}, ${sql.json(v.blocks)}, ${sql.json(initialTurns)})
      RETURNING *`;
    res.status(201).json({ wikiPost: publicWikiPost(rows[0]) });
  } catch (err) {
    console.error('wiki-post create:', err);
    res.status(500).json({ error: 'Erro interno ao criar a página da wikia.' });
  }
});

app.put('/api/wiki-posts/:id', async function (req, res) {
  try {
    const user = await requireModOrAdmin(req, res);
    if (!user) return;
    if (!UUID_RE.test(req.params.id)) return res.status(404).json({ error: 'Página não encontrada.' });
    const { error, valores: v } = lerWikiPostBody(req.body);
    if (error) return res.status(400).json({ error });

    const rows = await sql`
      UPDATE wiki_posts SET
        titulo = ${v.titulo}, subtitulo = ${v.subtitulo}, categoria = ${v.categoria}, status = ${v.status},
        resumo = ${v.resumo}, banner = ${v.banner}, descricao = ${v.descricao},
        theme = ${sql.json(v.theme)}, infobox = ${sql.json(v.infobox)}, blocks = ${sql.json(v.blocks)},
        updated_at = now()
      WHERE id = ${req.params.id}
      RETURNING *`;
    if (rows.length === 0) return res.status(404).json({ error: 'Página não encontrada.' });
    res.json({ wikiPost: publicWikiPost(rows[0]) });
  } catch (err) {
    console.error('wiki-post update:', err);
    res.status(500).json({ error: 'Erro interno ao salvar a página da wikia.' });
  }
});

app.delete('/api/wiki-posts/:id', async function (req, res) {
  try {
    const user = await requireModOrAdmin(req, res);
    if (!user) return;
    if (!UUID_RE.test(req.params.id)) return res.status(404).json({ error: 'Página não encontrada.' });
    const rows = await sql`DELETE FROM wiki_posts WHERE id = ${req.params.id} RETURNING id`;
    if (rows.length === 0) return res.status(404).json({ error: 'Página não encontrada.' });
    res.json({ ok: true });
  } catch (err) {
    console.error('wiki-post delete:', err);
    res.status(500).json({ error: 'Erro interno ao excluir a página da wikia.' });
  }
});

app.post('/api/wiki-posts/:id/turns', async function (req, res) {
  try {
    const user = await requireAuthUser(req, res);
    if (!user) return;
    if (!UUID_RE.test(req.params.id)) return res.status(404).json({ error: 'Cena não encontrada.' });
    const existing = await sql`SELECT * FROM wiki_posts WHERE id = ${req.params.id} LIMIT 1`;
    if (existing.length === 0) return res.status(404).json({ error: 'Cena não encontrada.' });

    const { error, turno } = sanitizeTurnBody(req.body, user);
    if (error) return res.status(400).json({ error });

    const turns = Array.isArray(existing[0].turns) ? existing[0].turns.slice() : [];
    turns.push(turno);

    const rows = await sql`
      UPDATE wiki_posts SET turns = ${sql.json(turns)}, updated_at = now()
      WHERE id = ${req.params.id}
      RETURNING *`;
    res.status(201).json({ wikiPost: publicWikiPost(rows[0]), turno });
  } catch (err) {
    console.error('wiki-post turn create:', err);
    res.status(500).json({ error: 'Erro interno ao publicar turno.' });
  }
});

app.put('/api/wiki-posts/:id/turns/:turnId', async function (req, res) {
  try {
    const user = await requireAuthUser(req, res);
    if (!user) return;
    if (!UUID_RE.test(req.params.id)) return res.status(404).json({ error: 'Cena não encontrada.' });
    const existing = await sql`SELECT * FROM wiki_posts WHERE id = ${req.params.id} LIMIT 1`;
    if (existing.length === 0) return res.status(404).json({ error: 'Cena não encontrada.' });

    const turns = Array.isArray(existing[0].turns) ? existing[0].turns.slice() : [];
    const idx = turns.findIndex(function (t) { return String(t.id) === String(req.params.turnId); });
    if (idx === -1) return res.status(404).json({ error: 'Turno não encontrado.' });

    const oldTurn = turns[idx];
    const canEdit = user.role === 'admin' || user.role === 'moderador' || String(oldTurn.authorId) === String(user.id);
    if (!canEdit) return res.status(403).json({ error: 'Sem permissão para editar este turno.' });

    const { error, turno } = sanitizeTurnBody(Object.assign({}, oldTurn, req.body, { id: oldTurn.id, date: oldTurn.date, edited: true }), null);
    if (error) return res.status(400).json({ error });
    turno.authorId = oldTurn.authorId;
    turno.authorName = oldTurn.authorName;
    turno.authorRole = oldTurn.authorRole;
    turns[idx] = turno;

    const rows = await sql`
      UPDATE wiki_posts SET turns = ${sql.json(turns)}, updated_at = now()
      WHERE id = ${req.params.id}
      RETURNING *`;
    res.json({ wikiPost: publicWikiPost(rows[0]), turno });
  } catch (err) {
    console.error('wiki-post turn update:', err);
    res.status(500).json({ error: 'Erro interno ao editar turno.' });
  }
});

app.delete('/api/wiki-posts/:id/turns/:turnId', async function (req, res) {
  try {
    const user = await requireAuthUser(req, res);
    if (!user) return;
    if (!UUID_RE.test(req.params.id)) return res.status(404).json({ error: 'Cena não encontrada.' });
    const existing = await sql`SELECT * FROM wiki_posts WHERE id = ${req.params.id} LIMIT 1`;
    if (existing.length === 0) return res.status(404).json({ error: 'Cena não encontrada.' });

    const turns = Array.isArray(existing[0].turns) ? existing[0].turns.slice() : [];
    const idx = turns.findIndex(function (t) { return String(t.id) === String(req.params.turnId); });
    if (idx === -1) return res.status(404).json({ error: 'Turno não encontrado.' });

    const oldTurn = turns[idx];
    const canDelete = user.role === 'admin' || user.role === 'moderador' || String(oldTurn.authorId) === String(user.id);
    if (!canDelete) return res.status(403).json({ error: 'Sem permissão para excluir este turno.' });

    turns.splice(idx, 1);
    const rows = await sql`
      UPDATE wiki_posts SET turns = ${sql.json(turns)}, updated_at = now()
      WHERE id = ${req.params.id}
      RETURNING *`;
    res.json({ wikiPost: publicWikiPost(rows[0]) });
  } catch (err) {
    console.error('wiki-post turn delete:', err);
    res.status(500).json({ error: 'Erro interno ao excluir turno.' });
  }
});

app.use(function (req, res) {
  if (req.path.startsWith('/api/')) return res.status(404).json({ error: 'Rota não encontrada.' });
  res.redirect('/');
});

const port = Number(process.env.PORT) || 3000;
app.listen(port, function () {
  console.log('aetherverse vault no ar na porta ' + port);
});
