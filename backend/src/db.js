const { createClient } = require('@supabase/supabase-js');
const bcrypt = require('bcryptjs');
const WebSocket = require('ws');

const supabaseUrl = process.env.SUPABASE_URL;
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !serviceRoleKey) {
  throw new Error('Configure SUPABASE_URL e SUPABASE_SERVICE_ROLE_KEY no backend/.env');
}

const supabase = createClient(supabaseUrl, serviceRoleKey, {
  auth: {
    persistSession: false,
    autoRefreshToken: false,
  },
  realtime: {
    transport: WebSocket,
  },
});

const seedProducts = [
  { brand: 'Samsung', name: 'WindFree Inverter 12.000 BTU', category: 'inverter', price: 2399, oldPrice: 2899, stock: 8, minStock: 5, sku: 'SAM-WF-12K', specs: 'Inverter, 12.000 BTU, A+++', status: 'active', image: 'assets/produtos/samsung_windfree.webp' },
  { brand: 'LG', name: 'Dual Inverter Voice 9.000 BTU', category: 'inverter', price: 1849, oldPrice: 2199, stock: 3, minStock: 5, sku: 'LG-DI-9K', specs: 'Inverter, 9.000 BTU, Wi-Fi', status: 'active', image: 'assets/produtos/lg_dual_inverter.webp' },
  { brand: 'Midea', name: 'Xtreme Save Inverter 18.000 BTU', category: 'inverter', price: 2899, oldPrice: 3499, stock: 12, minStock: 5, sku: 'MID-XS-18K', specs: 'Inverter, 18.000 BTU, A++', status: 'active', image: 'assets/produtos/midea_xtreme_save.webp' },
  { brand: 'Elgin', name: 'Eco Inverter Plus 24.000 BTU', category: 'inverter', price: 3699, oldPrice: 4299, stock: 5, minStock: 4, sku: 'ELG-EI-24K', specs: 'Inverter, 24.000 BTU, Quente/Frio', status: 'active', image: 'assets/produtos/elgin_eco_inverter.webp' },
  { brand: 'Springer', name: 'Silentia 7.500 BTU Split', category: 'split', price: 1299, oldPrice: 1699, stock: 0, minStock: 4, sku: 'SPR-SL-7.5K', specs: 'Split, 7.500 BTU, Silencioso', status: 'active', image: 'assets/produtos/springer_silentia.webp' },
  { brand: 'Philco', name: 'Portable Portatil 12.000 BTU', category: 'portatil', price: 1749, oldPrice: 2099, stock: 2, minStock: 3, sku: 'PHI-PB-12K', specs: 'Portatil, 12.000 BTU, Sem obra', status: 'active', image: 'assets/produtos/philco_portable.webp' },
  { brand: 'Electrolux', name: 'Frigobar 122 Litros EM120', category: 'bebidas', price: 1209, oldPrice: 1809, stock: 7, minStock: 3, sku: 'ELX-FB-122L', specs: '122 Litros, Branco, 110V', status: 'active', image: 'assets/clima-bebidas/electrolux_frigobar.webp' },
  { brand: 'Electrolux', name: 'Cervejeira Home Bar EB100', category: 'bebidas', price: 2229, oldPrice: 2729, stock: 4, minStock: 3, sku: 'ELX-CB-100L', specs: '100 Litros, Frost Free, 110V', status: 'active', image: 'assets/clima-bebidas/electrolux_cervejeira.webp' },
  { brand: 'Venax', name: 'Cervejeira Blue Light 102L', category: 'bebidas', price: 2529, oldPrice: 3423, stock: 1, minStock: 3, sku: 'VNX-BL-102L', specs: '102 Litros, Blue Light, 220V', status: 'inactive', image: 'assets/clima-bebidas/venax_cervejeira.webp' },
  { brand: 'Electrolux', name: 'Cervejeira com Torre de Chopp EB10C', category: 'bebidas', price: 2799, oldPrice: 3693, stock: 0, minStock: 2, sku: 'ELX-TC-100L', specs: 'Torre de Chopp, 100 Litros, 110V', status: 'active', image: 'assets/clima-bebidas/electrolux_chopp.webp' },
];

const localWebpReplacements = new Map([
  ['assets/produtos/samsung_windfree.png', 'assets/produtos/samsung_windfree.webp'],
  ['assets/produtos/lg_dual_inverter.png', 'assets/produtos/lg_dual_inverter.webp'],
  ['assets/produtos/midea_xtreme_save.png', 'assets/produtos/midea_xtreme_save.webp'],
  ['assets/produtos/elgin_eco_inverter.png', 'assets/produtos/elgin_eco_inverter.webp'],
  ['assets/produtos/springer_silentia.png', 'assets/produtos/springer_silentia.webp'],
  ['assets/produtos/philco_portable.png', 'assets/produtos/philco_portable.webp'],
  ['assets/clima-bebidas/electrolux_frigobar.png', 'assets/clima-bebidas/electrolux_frigobar.webp'],
  ['assets/clima-bebidas/electrolux_cervejeira.png', 'assets/clima-bebidas/electrolux_cervejeira.webp'],
  ['assets/clima-bebidas/venax_cervejeira.png', 'assets/clima-bebidas/venax_cervejeira.webp'],
  ['assets/clima-bebidas/electrolux_chopp.png', 'assets/clima-bebidas/electrolux_chopp.webp'],
  ['assets/produtos/ventisol_clin16.jpg', 'assets/produtos/ventisol_clin16.webp'],
  ['assets/produtos/ventisol_clin16_2.jpg', 'assets/produtos/ventisol_clin16_2.webp'],
  ['assets/produtos/ventisol_clin16_3.jpg', 'assets/produtos/ventisol_clin16_3.webp'],
]);

function normalizeImageReference(image) {
  return localWebpReplacements.get(image) || image;
}

function toDbProduct(product) {
  return {
    brand: product.brand,
    name: product.name,
    category: product.category,
    price: product.price,
    old_price: product.oldPrice,
    stock: product.stock,
    min_stock: product.minStock,
    sku: product.sku,
    specs: product.specs,
    status: product.status,
    image: product.image,
    description: product.description || null,
    gallery: product.gallery || [],
    source_attributes: product.attributes || {},
    rating: product.rating || 0,
    rating_count: product.ratingCount || 0,
    reviews: product.reviews || [],
  };
}

function toBasicDbProduct(product) {
  const data = toDbProduct(product);
  delete data.description;
  delete data.gallery;
  delete data.source_attributes;
  delete data.rating;
  delete data.rating_count;
  delete data.reviews;
  return data;
}

function fromDbProduct(row) {
  return {
    id: row.id,
    brand: row.brand,
    name: row.name,
    category: row.category,
    price: Number(row.price),
    oldPrice: row.old_price === null ? null : Number(row.old_price),
    stock: row.stock,
    minStock: row.min_stock,
    sku: row.sku,
    specs: row.specs,
    status: row.status,
    image: normalizeImageReference(row.image),
    description: row.description || '',
    gallery: Array.isArray(row.gallery) ? row.gallery : [],
    attributes: row.source_attributes && typeof row.source_attributes === 'object' ? row.source_attributes : {},
    rating: Number(row.rating || 0),
    ratingCount: Number(row.rating_count || 0),
    reviews: Array.isArray(row.reviews) ? row.reviews : [],
  };
}

function fromPublicDbProduct(row) {
  return {
    id: row.id,
    brand: row.brand,
    name: row.name,
    category: row.category,
    price: Number(row.price),
    oldPrice: row.old_price === null ? null : Number(row.old_price),
    specs: row.specs,
    image: normalizeImageReference(row.image),
    description: row.description || '',
    gallery: Array.isArray(row.gallery) ? row.gallery : [],
    attributes: row.source_attributes && typeof row.source_attributes === 'object' ? row.source_attributes : {},
    rating: Number(row.rating || 0),
    ratingCount: Number(row.rating_count || 0),
    reviews: Array.isArray(row.reviews) ? row.reviews : [],
  };
}

const publicProductColumns = 'id, brand, name, category, price, old_price, specs, image, description, gallery, source_attributes, rating, rating_count, reviews';
const basicPublicProductColumns = 'id, brand, name, category, price, old_price, specs, image';

function isMissingCatalogColumn(error) {
  return ['42703', 'PGRST204'].includes(error?.code) && /(description|source_attributes|gallery|rating_count|reviews)/i.test(error.message || '');
}

function throwIfError(error) {
  if (error) throw new Error(error.message);
}

async function initDb() {
  const { count, error } = await supabase
    .from('products')
    .select('id', { count: 'exact', head: true });
  throwIfError(error);

  if (count === 0) {
    const { error: seedError } = await supabase
      .from('products')
      .insert(seedProducts.map(toDbProduct));
    throwIfError(seedError);
  }

  const { count: adminCount, error: adminCountError } = await supabase
    .from('admin_users')
    .select('id', { count: 'exact', head: true });
  throwIfError(adminCountError);

  if (adminCount === 0) {
    const username = String(process.env.ADMIN_USER || '').trim();
    const configuredPassword = String(process.env.ADMIN_PASSWORD || '');
    if (!username || !configuredPassword) {
      throw new Error('Configure ADMIN_USER e ADMIN_PASSWORD para criar o primeiro administrador.');
    }
    if (!/^[a-zA-Z0-9._-]{3,64}$/.test(username)) {
      throw new Error('ADMIN_USER deve ter de 3 a 64 caracteres e usar apenas letras, numeros, ponto, hifen ou sublinhado.');
    }
    if (!configuredPassword.startsWith('$2') && (configuredPassword.length < 12 || configuredPassword.length > 128)) {
      throw new Error('ADMIN_PASSWORD deve ter entre 12 e 128 caracteres.');
    }

    const passwordHash = configuredPassword.startsWith('$2')
      ? configuredPassword
      : await bcrypt.hash(configuredPassword, 12);
    const { error: adminSeedError } = await supabase
      .from('admin_users')
      .insert({ username, password_hash: passwordHash });
    throwIfError(adminSeedError);
  }
}

const adminRepo = {
  async findByUsername(username) {
    const { data, error } = await supabase
      .from('admin_users')
      .select('id, username, password_hash, active')
      .eq('username', username)
      .maybeSingle();
    throwIfError(error);
    if (!data) return null;
    return {
      id: data.id,
      username: data.username,
      passwordHash: data.password_hash,
      active: data.active,
    };
  },

  async recordLogin(id) {
    const { error } = await supabase
      .from('admin_users')
      .update({ last_login_at: new Date().toISOString() })
      .eq('id', id);
    throwIfError(error);
  },
};

const productRepo = {
  async listAdmin() {
    const { data, error } = await supabase
      .from('products')
      .select('*')
      .order('id', { ascending: false });
    throwIfError(error);
    return data.map(fromDbProduct);
  },
  async listPublic() {
    let { data, error } = await supabase
      .from('products')
      .select(publicProductColumns)
      .eq('status', 'active')
      .order('id', { ascending: false });
    if (isMissingCatalogColumn(error)) {
      ({ data, error } = await supabase
        .from('products')
        .select(basicPublicProductColumns)
        .eq('status', 'active')
        .order('id', { ascending: false }));
    }
    throwIfError(error);
    return data.map(fromPublicDbProduct);
  },
  async getPublic(id) {
    let { data, error } = await supabase
      .from('products')
      .select(publicProductColumns)
      .eq('id', id)
      .eq('status', 'active')
      .maybeSingle();
    if (isMissingCatalogColumn(error)) {
      ({ data, error } = await supabase
        .from('products')
        .select(basicPublicProductColumns)
        .eq('id', id)
        .eq('status', 'active')
        .maybeSingle());
    }
    throwIfError(error);
    return data ? fromPublicDbProduct(data) : null;
  },
  async create(product) {
    let { data, error } = await supabase
      .from('products')
      .insert(toDbProduct(product))
      .select('*')
      .single();
    if (isMissingCatalogColumn(error)) {
      ({ data, error } = await supabase
        .from('products')
        .insert(toBasicDbProduct(product))
        .select('*')
        .single());
    }
    throwIfError(error);
    return fromDbProduct(data);
  },
  async update(id, product) {
    let { data, error } = await supabase
      .from('products')
      .update(toDbProduct(product))
      .eq('id', id)
      .select('*')
      .maybeSingle();
    if (isMissingCatalogColumn(error)) {
      ({ data, error } = await supabase
        .from('products')
        .update(toBasicDbProduct(product))
        .eq('id', id)
        .select('*')
        .maybeSingle());
    }
    throwIfError(error);
    return data ? fromDbProduct(data) : null;
  },
  async getAdmin(id) {
    const { data, error } = await supabase
      .from('products')
      .select('*')
      .eq('id', id)
      .maybeSingle();
    throwIfError(error);
    return data ? fromDbProduct(data) : null;
  },
  async updateStock(id, type, qty) {
    const { data: current, error: findError } = await supabase
      .from('products')
      .select('*')
      .eq('id', id)
      .maybeSingle();
    throwIfError(findError);
    if (!current) return null;

    let nextStock = current.stock;
    if (type === 'in') nextStock += qty;
    if (type === 'out') nextStock = Math.max(0, nextStock - qty);
    if (type === 'adjust') nextStock = qty;

    const { data, error } = await supabase
      .from('products')
      .update({ stock: nextStock })
      .eq('id', id)
      .select('*')
      .single();
    throwIfError(error);
    return fromDbProduct(data);
  },
  async remove(id) {
    const { error, count } = await supabase
      .from('products')
      .delete({ count: 'exact' })
      .eq('id', id);
    throwIfError(error);
    return count > 0;
  },
};

async function uploadProductImage(file) {
  const bucket = process.env.SUPABASE_PRODUCT_IMAGES_BUCKET || 'products';
  const ext = file.originalname.includes('.') ? file.originalname.split('.').pop().toLowerCase() : 'bin';
  const safeBaseName = file.originalname
    .replace(/\.[^.]+$/, '')
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-zA-Z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .toLowerCase() || 'produto';
  const objectPath = `${Date.now()}-${safeBaseName}.${ext}`;

  const { error } = await supabase.storage
    .from(bucket)
    .upload(objectPath, file.buffer, {
      contentType: file.mimetype,
      upsert: false,
    });
  throwIfError(error);

  const { data } = supabase.storage
    .from(bucket)
    .getPublicUrl(objectPath);

  return {
    path: objectPath,
    url: data.publicUrl,
  };
}

module.exports = { initDb, adminRepo, productRepo, uploadProductImage };
