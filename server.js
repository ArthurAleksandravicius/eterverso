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
app.use(express.json({ limit: '100kb' }));
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

app.use(function (req, res) {
  if (req.path.startsWith('/api/')) return res.status(404).json({ error: 'Rota não encontrada.' });
  res.redirect('/');
});

const port = Number(process.env.PORT) || 3000;
app.listen(port, function () {
  console.log('Éterverso no ar na porta ' + port);
});
