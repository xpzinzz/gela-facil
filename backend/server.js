const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '.env') });
const express = require('express');
const session = require('express-session');
const helmet = require('helmet');
const bcrypt = require('bcryptjs');
const multer = require('multer');
const { initDb, adminRepo, productRepo, uploadProductImage } = require('./src/db');

const app = express();
const port = Number(process.env.PORT || 3000);
const rootDir = path.resolve(__dirname, '..');
const isProduction = process.env.NODE_ENV === 'production';
const requiredEnv = ['SESSION_SECRET'];
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

app.set('trust proxy', isProduction ? true : false);
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
app.use(require('./src/public-preview-cors'));
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

function parseProductId(value) {
  const id = Number(value);
  return Number.isInteger(id) && id > 0 ? id : null;
}

function publicBaseUrl(req) {
  const configuredUrl = String(process.env.PUBLIC_SITE_URL || '').trim();
  if (configuredUrl) {
    try {
      return new URL(configuredUrl).origin;
    } catch {
      throw new Error('PUBLIC_SITE_URL precisa ser uma URL absoluta valida.');
    }
  }
  return `${req.protocol}://${req.get('host')}`;
}

function escapeXml(value) {
  return String(value).replace(/[<>&'\"]/g, character => ({
    '<': '&lt;',
    '>': '&gt;',
    '&': '&amp;',
    "'": '&apos;',
    '"': '&quot;',
  }[character]));
}

function normalizeProductPayload(body) {
  const gallery = Array.isArray(body.gallery) ? body.gallery.slice(0, 12).map(value => String(value || '').trim()).filter(Boolean) : [];
  const attributes = body.attributes && typeof body.attributes === 'object' && !Array.isArray(body.attributes) ? body.attributes : {};
  const reviews = Array.isArray(body.reviews) ? body.reviews.slice(0, 5) : [];
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
    specs: String(body.specs || '').trim(),
    description: String(body.description || '').trim(),
    gallery,
    attributes,
    rating: Number(body.rating || 0),
    ratingCount: Number.parseInt(body.ratingCount || 0, 10),
    reviews,
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
  if (product.gallery.some(image => !isSafeImageReference(image))) return 'Uma imagem da galeria e invalida.';
  if (product.description.length > 10000) return 'Descricao excede o limite de 10000 caracteres.';
  if (!Number.isFinite(product.rating) || product.rating < 0 || product.rating > 5) return 'Avaliacao invalida.';
  if (!Number.isInteger(product.ratingCount) || product.ratingCount < 0) return 'Quantidade de avaliacoes invalida.';
  if (Object.keys(product.attributes).length > 30) return 'Quantidade de atributos excedida.';
  return null;
}

app.post('/api/admin/login', async (req, res) => {
  const { user, password } = req.body || {};
  const admin = await adminRepo.findByUsername(String(user || '').trim());
  const validPassword = admin?.active
    ? await bcrypt.compare(String(password || ''), admin.passwordHash)
    : false;

  if (!admin || !validPassword) {
    return res.status(401).json({ error: 'Usuario ou senha invalidos.' });
  }

  await adminRepo.recordLogin(admin.id);

  req.session.regenerate((err) => {
    if (err) return res.status(500).json({ error: 'Falha ao criar sessao.' });
    req.session.admin = true;
    req.session.adminUser = admin.username;
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
  res.json({ user: _req.session.adminUser });
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

app.get('/robots.txt', (req, res) => {
  const baseUrl = publicBaseUrl(req);
  res.set('Cache-Control', 'public, max-age=3600, stale-while-revalidate=86400');
  res.type('text/plain; charset=utf-8').send([
    'User-agent: *',
    'Allow: /',
    'Disallow: /admin/',
    'Disallow: /api/admin/',
    `Sitemap: ${baseUrl}/sitemap.xml`,
    '',
  ].join('\n'));
});

app.get('/sitemap.xml', asyncHandler(async (req, res) => {
  const baseUrl = publicBaseUrl(req);
  const products = await productRepo.listPublic();
  const urls = [
    `${baseUrl}/`,
    `${baseUrl}/pages/products.html`,
    ...products.map(product => `${baseUrl}/pages/product-detail.html?id=${encodeURIComponent(product.id)}`),
  ];
  const body = urls.map(url => `  <url><loc>${escapeXml(url)}</loc></url>`).join('\n');
  res.set('Cache-Control', 'public, max-age=3600, stale-while-revalidate=86400');
  res.type('application/xml; charset=utf-8').send(`<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${body}\n</urlset>\n`);
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
// express.static precisa receber um diretorio. Quando ele recebe o caminho de
// um arquivo, como acontecia aqui, remove o prefixo da rota e procura algo como
// "admin.css/", fazendo todos os assets do login/painel retornarem 404.
app.get('/admin/login.js', (_req, res) => {
  res.sendFile(path.join(rootDir, 'admin', 'login.js'));
});
app.get('/admin/admin.css', (_req, res) => {
  res.sendFile(path.join(rootDir, 'admin', 'admin.css'));
});
app.get('/admin/refresh.css', (_req, res) => {
  res.sendFile(path.join(rootDir, 'admin', 'refresh.css'));
});
app.get('/admin/admin.js', requireAdmin, (_req, res) => {
  res.sendFile(path.join(rootDir, 'admin', 'admin.js'));
});
app.get(['/admin', '/admin/', '/admin/index.html'], (req, res) => {
  if (!req.session || req.session.admin !== true) return res.redirect('/admin/login.html');
  return res.sendFile(path.join(rootDir, 'admin', 'index.html'));
});
app.get('/admin.css', (_req, res) => res.redirect(301, '/admin/admin.css'));
app.get('/refresh.css', (_req, res) => res.redirect(301, '/admin/refresh.css'));
app.get('/admin.js', (_req, res) => res.redirect(301, '/admin/admin.js'));

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
