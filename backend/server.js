require('dotenv').config();

const path = require('path');
const express = require('express');
const session = require('express-session');
const helmet = require('helmet');
const bcrypt = require('bcryptjs');
const multer = require('multer');
const { initDb, productRepo, uploadProductImage } = require('./src/db');

const app = express();
const port = Number(process.env.PORT || 3000);
const rootDir = path.resolve(__dirname, '..');
const isProduction = process.env.NODE_ENV === 'production';
const requiredEnv = ['SESSION_SECRET', 'ADMIN_USER', 'ADMIN_PASSWORD'];
const missingEnv = requiredEnv.filter(name => !process.env[name]);

if (missingEnv.length > 0) {
  throw new Error(`Configure as variaveis obrigatorias: ${missingEnv.join(', ')}`);
}

if (process.env.SESSION_SECRET.length < 32) {
  throw new Error('SESSION_SECRET precisa ter ao menos 32 caracteres aleatorios.');
}

const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 5 * 1024 * 1024,
  },
  fileFilter: (_req, file, cb) => {
    if (!['image/jpeg', 'image/png', 'image/webp'].includes(file.mimetype)) {
      cb(new Error('Envie imagens JPEG, PNG ou WebP.'));
      return;
    }
    cb(null, true);
  },
});

app.set('trust proxy', isProduction ? 1 : 0);
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      ...helmet.contentSecurityPolicy.getDefaultDirectives(),
      'script-src': ["'self'", "'unsafe-inline'", 'https://cdn.jsdelivr.net'],
      // O front-end ainda usa handlers declarados no HTML (onclick, onsubmit
      // e onblur). Helmet define script-src-attr como 'none' por padrão, o
      // que bloqueava esses controles apesar de script-src permitir inline.
      'script-src-attr': ["'unsafe-inline'"],
      'style-src': ["'self'", "'unsafe-inline'", 'https://fonts.googleapis.com'],
      'font-src': ["'self'", 'https://fonts.gstatic.com'],
      'img-src': ["'self'", 'data:', 'https:'],
      // Permite chamadas da propria aplicacao e evita alertas do DevTools ao
      // verificar recursos locais do navegador.
      'connect-src': ["'self'"],
      'object-src': ["'none'"],
      'base-uri': ["'self'"],
      'frame-ancestors': ["'none'"],
    },
  },
}));
app.use(express.json({ limit: '200kb' }));
app.use(session({
  name: 'gela_admin_sid',
  secret: process.env.SESSION_SECRET,
  resave: false,
  saveUninitialized: false,
  cookie: {
    httpOnly: true,
    sameSite: 'lax',
    secure: isProduction,
    maxAge: 1000 * 60 * 60 * 8,
  },
}));

function requireAdmin(req, res, next) {
  if (req.session && req.session.admin === true) return next();
  return res.status(401).json({ error: 'Nao autorizado.' });
}

function asyncHandler(handler) {
  return (req, res, next) => Promise.resolve(handler(req, res, next)).catch(next);
}

const productCategories = new Set(['inverter', 'split', 'portatil', 'bebidas']);
const productStatuses = new Set(['active', 'inactive']);
const unsafeText = /[<>\u0000-\u001F\u007F]/;

function validateText(value, label, maxLength, { required = false } = {}) {
  if (required && !value) return `${label} e obrigatorio.`;
  if (value.length > maxLength) return `${label} excede o limite de ${maxLength} caracteres.`;
  if (unsafeText.test(value)) return `${label} contem caracteres nao permitidos.`;
  return null;
}

function isSafeImageReference(value) {
  if (!value) return true;
  if (/^assets\/[a-zA-Z0-9_./-]+$/.test(value)) return true;
  try {
    return new URL(value).protocol === 'https:';
  } catch {
    return false;
  }
}

function isMercadoLivreAffiliateUrl(value) {
  if (!value) return true;
  try {
    const url = new URL(value);
    const host = url.hostname.toLowerCase();
    return url.protocol === 'https:' && (
      host === 'meli.la' ||
      host === 'mercadolivre.com.br' ||
      host.endsWith('.mercadolivre.com.br')
    );
  } catch {
    return false;
  }
}

function parseProductId(value) {
  const id = Number(value);
  return Number.isInteger(id) && id > 0 ? id : null;
}

function normalizeProductPayload(body) {
  return {
    name: String(body.name || '').trim(),
    brand: String(body.brand || '').trim(),
    category: String(body.category || '').trim(),
    status: String(body.status || 'active').trim(),
    price: Number(body.price || 0),
    oldPrice: body.oldPrice === null || body.oldPrice === '' ? null : Number(body.oldPrice),
    stock: Number.parseInt(body.stock || 0, 10),
    minStock: Number.parseInt(body.minStock || 3, 10),
    sku: String(body.sku || '').trim(),
    image: String(body.image || '').trim(),
    affiliateUrl: String(body.affiliateUrl || '').trim(),
    specs: String(body.specs || '').trim(),
  };
}

function validateProduct(product) {
  const textError =
    validateText(product.name, 'Nome do produto', 160, { required: true }) ||
    validateText(product.brand, 'Marca', 80, { required: true }) ||
    validateText(product.sku, 'SKU', 80) ||
    validateText(product.specs, 'Especificacoes', 500);
  if (textError) return textError;
  if (!productCategories.has(product.category)) return 'Categoria invalida.';
  if (!productStatuses.has(product.status)) return 'Status invalido.';
  if (!Number.isFinite(product.price) || product.price < 0) return 'Preco invalido.';
  if (product.oldPrice !== null && (!Number.isFinite(product.oldPrice) || product.oldPrice < 0)) return 'Preco original invalido.';
  if (!Number.isInteger(product.stock) || product.stock < 0) return 'Estoque invalido.';
  if (!Number.isInteger(product.minStock) || product.minStock < 0) return 'Estoque minimo invalido.';
  if (!isSafeImageReference(product.image)) return 'URL da imagem invalida.';
  if (!isMercadoLivreAffiliateUrl(product.affiliateUrl)) return 'Link de afiliado do Mercado Livre invalido.';
  return null;
}

app.post('/api/admin/login', async (req, res) => {
  const expectedUser = process.env.ADMIN_USER;
  const expectedPassword = process.env.ADMIN_PASSWORD;
  const { user, password } = req.body || {};

  const validUser = String(user || '') === expectedUser;
  const validPassword = expectedPassword.startsWith('$2')
    ? await bcrypt.compare(String(password || ''), expectedPassword)
    : String(password || '') === expectedPassword;

  if (!validUser || !validPassword) {
    return res.status(401).json({ error: 'Usuario ou senha invalidos.' });
  }

  req.session.regenerate((err) => {
    if (err) return res.status(500).json({ error: 'Falha ao criar sessao.' });
    req.session.admin = true;
    res.json({ ok: true });
  });
});

app.post('/api/admin/logout', requireAdmin, (req, res) => {
  req.session.destroy(() => {
    res.clearCookie('gela_admin_sid');
    res.json({ ok: true });
  });
});

app.get('/api/admin/me', requireAdmin, (_req, res) => {
  res.json({ user: process.env.ADMIN_USER });
});

app.post('/api/admin/upload', requireAdmin, upload.single('image'), asyncHandler(async (req, res) => {
  if (!req.file) return res.status(400).json({ error: 'Imagem obrigatoria.' });
  res.status(201).json(await uploadProductImage(req.file));
}));

app.get('/api/products', asyncHandler(async (_req, res) => {
  res.json(await productRepo.listPublic());
}));

app.get('/api/products/:id', asyncHandler(async (req, res) => {
  const id = Number(req.params.id);
  if (!Number.isInteger(id) || id <= 0) return res.status(400).json({ error: 'ID invalido.' });

  const product = await productRepo.getPublic(id);
  if (!product) return res.status(404).json({ error: 'Produto nao encontrado.' });
  return res.json(product);
}));

app.get('/api/admin/products', requireAdmin, asyncHandler(async (_req, res) => {
  res.json(await productRepo.listAdmin());
}));

app.post('/api/admin/products', requireAdmin, asyncHandler(async (req, res) => {
  const product = normalizeProductPayload(req.body);
  const error = validateProduct(product);
  if (error) return res.status(400).json({ error });
  res.status(201).json(await productRepo.create(product));
}));

app.put('/api/admin/products/:id', requireAdmin, asyncHandler(async (req, res) => {
  const id = parseProductId(req.params.id);
  if (!id) return res.status(400).json({ error: 'ID invalido.' });
  const product = normalizeProductPayload(req.body);
  const error = validateProduct(product);
  if (error) return res.status(400).json({ error });
  const updated = await productRepo.update(id, product);
  if (!updated) return res.status(404).json({ error: 'Produto nao encontrado.' });
  res.json(updated);
}));

app.patch('/api/admin/products/:id/stock', requireAdmin, asyncHandler(async (req, res) => {
  const id = parseProductId(req.params.id);
  if (!id) return res.status(400).json({ error: 'ID invalido.' });
  const qty = Number.parseInt(req.body.qty, 10);
  const type = String(req.body.type || '');
  if (!Number.isInteger(qty) || qty < 0) return res.status(400).json({ error: 'Quantidade invalida.' });
  if (!['in', 'out', 'adjust'].includes(type)) return res.status(400).json({ error: 'Tipo invalido.' });

  const updated = await productRepo.updateStock(id, type, qty);
  if (!updated) return res.status(404).json({ error: 'Produto nao encontrado.' });
  res.json(updated);
}));

app.delete('/api/admin/products/:id', requireAdmin, asyncHandler(async (req, res) => {
  const id = parseProductId(req.params.id);
  if (!id) return res.status(400).json({ error: 'ID invalido.' });
  const deleted = await productRepo.remove(id);
  if (!deleted) return res.status(404).json({ error: 'Produto nao encontrado.' });
  res.json({ ok: true });
}));

app.get('/admin/login.html', (_req, res) => {
  res.sendFile(path.join(rootDir, 'admin', 'login.html'));
});
app.use('/admin/login.js', express.static(path.join(rootDir, 'admin', 'login.js')));
app.use('/admin/admin.css', express.static(path.join(rootDir, 'admin', 'admin.css')));
app.use('/admin/refresh.css', express.static(path.join(rootDir, 'admin', 'refresh.css')));
app.use('/admin/admin.js', requireAdmin, express.static(path.join(rootDir, 'admin', 'admin.js')));
app.get(['/admin', '/admin/', '/admin/index.html'], (req, res) => {
  if (!req.session || req.session.admin !== true) return res.redirect('/admin/login.html');
  return res.sendFile(path.join(rootDir, 'admin', 'index.html'));
});

app.use('/assets', express.static(path.join(rootDir, 'assets')));
app.use('/js', express.static(path.join(rootDir, 'js')));
app.use('/style', express.static(path.join(rootDir, 'style')));
app.use('/pages', express.static(path.join(rootDir, 'pages')));
app.get(['/', '/index.html'], (_req, res) => res.sendFile(path.join(rootDir, 'index.html')));

app.use((err, _req, res, _next) => {
  console.error(err);
  res.status(500).json({ error: 'Erro interno do servidor.' });
});

initDb()
  .then(() => {
    app.listen(port, () => {
      console.log(`Gela Facil rodando em http://localhost:${port}`);
    });
  })
  .catch((err) => {
    console.error('Falha ao conectar no Supabase:', err.message);
    process.exit(1);
  });
