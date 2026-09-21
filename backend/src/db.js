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
  { brand: 'Samsung', name: 'WindFree Inverter 12.000 BTU', category: 'inverter', price: 2399, oldPrice: 2899, stock: 8, minStock: 5, sku: 'SAM-WF-12K', specs: 'Inverter, 12.000 BTU, A+++', status: 'active', image: 'assets/produtos/samsung_windfree.webp', affiliateUrl: '' },
  { brand: 'LG', name: 'Dual Inverter Voice 9.000 BTU', category: 'inverter', price: 1849, oldPrice: 2199, stock: 3, minStock: 5, sku: 'LG-DI-9K', specs: 'Inverter, 9.000 BTU, Wi-Fi', status: 'active', image: 'assets/produtos/lg_dual_inverter.webp', affiliateUrl: '' },
  { brand: 'Midea', name: 'Xtreme Save Inverter 18.000 BTU', category: 'inverter', price: 2899, oldPrice: 3499, stock: 12, minStock: 5, sku: 'MID-XS-18K', specs: 'Inverter, 18.000 BTU, A++', status: 'active', image: 'assets/produtos/midea_xtreme_save.webp', affiliateUrl: '' },
  { brand: 'Elgin', name: 'Eco Inverter Plus 24.000 BTU', category: 'inverter', price: 3699, oldPrice: 4299, stock: 5, minStock: 4, sku: 'ELG-EI-24K', specs: 'Inverter, 24.000 BTU, Quente/Frio', status: 'active', image: 'assets/produtos/elgin_eco_inverter.webp', affiliateUrl: '' },
  { brand: 'Springer', name: 'Silentia 7.500 BTU Split', category: 'split', price: 1299, oldPrice: 1699, stock: 0, minStock: 4, sku: 'SPR-SL-7.5K', specs: 'Split, 7.500 BTU, Silencioso', status: 'active', image: 'assets/produtos/springer_silentia.webp', affiliateUrl: '' },
  { brand: 'Philco', name: 'Portable Portatil 12.000 BTU', category: 'portatil', price: 1749, oldPrice: 2099, stock: 2, minStock: 3, sku: 'PHI-PB-12K', specs: 'Portatil, 12.000 BTU, Sem obra', status: 'active', image: 'assets/produtos/philco_portable.webp', affiliateUrl: '' },
  { brand: 'Electrolux', name: 'Frigobar 122 Litros EM120', category: 'bebidas', price: 1209, oldPrice: 1809, stock: 7, minStock: 3, sku: 'ELX-FB-122L', specs: '122 Litros, Branco, 110V', status: 'active', image: 'assets/clima-bebidas/electrolux_frigobar.webp', affiliateUrl: '' },
  { brand: 'Electrolux', name: 'Cervejeira Home Bar EB100', category: 'bebidas', price: 2229, oldPrice: 2729, stock: 4, minStock: 3, sku: 'ELX-CB-100L', specs: '100 Litros, Frost Free, 110V', status: 'active', image: 'assets/clima-bebidas/electrolux_cervejeira.webp', affiliateUrl: '' },
  { brand: 'Venax', name: 'Cervejeira Blue Light 102L', category: 'bebidas', price: 2529, oldPrice: 3423, stock: 1, minStock: 3, sku: 'VNX-BL-102L', specs: '102 Litros, Blue Light, 220V', status: 'inactive', image: 'assets/clima-bebidas/venax_cervejeira.webp', affiliateUrl: '' },
  { brand: 'Electrolux', name: 'Cervejeira com Torre de Chopp EB10C', category: 'bebidas', price: 2799, oldPrice: 3693, stock: 0, minStock: 2, sku: 'ELX-TC-100L', specs: 'Torre de Chopp, 100 Litros, 110V', status: 'active', image: 'assets/clima-bebidas/electrolux_chopp.webp', affiliateUrl: '' },
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
    affiliate_url: product.affiliateUrl || null,
    mercado_livre_id: product.mercadoLivreId || null,
    description: product.description || null,
    gallery: product.gallery || [],
    source_attributes: product.attributes || {},
    rating: product.rating || 0,
    rating_count: product.ratingCount || 0,
    reviews: product.reviews || [],
    source_status: product.sourceStatus || null,
    source_synced_at: product.sourceSyncedAt || null,
  };
}

function toLegacyDbProduct(product) {
  const data = toDbProduct(product);
  delete data.mercado_livre_id;
  delete data.description;
  delete data.gallery;
  delete data.source_attributes;
  delete data.rating;
  delete data.rating_count;
  delete data.reviews;
  delete data.source_status;
  delete data.source_synced_at;
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
    affiliateUrl: row.affiliate_url || '',
    mercadoLivreId: row.mercado_livre_id || '',
    description: row.description || '',
    gallery: Array.isArray(row.gallery) ? row.gallery : [],
    attributes: row.source_attributes && typeof row.source_attributes === 'object' ? row.source_attributes : {},
    rating: Number(row.rating || 0),
    ratingCount: Number(row.rating_count || 0),
    reviews: Array.isArray(row.reviews) ? row.reviews : [],
    sourceStatus: row.source_status || '',
    sourceSyncedAt: row.source_synced_at || null,
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
    affiliateUrl: row.affiliate_url || '',
    mercadoLivreId: row.mercado_livre_id || '',
    description: row.description || '',
    gallery: Array.isArray(row.gallery) ? row.gallery : [],
    attributes: row.source_attributes && typeof row.source_attributes === 'object' ? row.source_attributes : {},
    rating: Number(row.rating || 0),
    ratingCount: Number(row.rating_count || 0),
    reviews: Array.isArray(row.reviews) ? row.reviews : [],
    sourceStatus: row.source_status || '',
    sourceSyncedAt: row.source_synced_at || null,
  };
}

const publicProductColumns = 'id, brand, name, category, price, old_price, specs, image, affiliate_url, mercado_livre_id, description, gallery, source_attributes, rating, rating_count, reviews, source_status, source_synced_at';
const publicProductColumnsWithoutAffiliate = 'id, brand, name, category, price, old_price, specs, image';

function isMissingCatalogColumn(error) {
  return ['42703', 'PGRST204'].includes(error?.code) && /(affiliate_url|mercado_livre_id|source_attributes|source_status|gallery|rating_count)/i.test(error.message || '');
}

function migrationRequiredError() {
  return new Error('Aplique supabase/migrations/202609200003_mercado_livre_catalog.sql antes de salvar produtos importados.');
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

function mercadoLivreTokenMigrationError() {
  return new Error('Aplique supabase/migrations/202609210001_mercado_livre_oauth.sql antes de conectar o Mercado Livre.');
}

function isMissingMercadoLivreTokenTable(error) {
  return ['42P01', 'PGRST205'].includes(error?.code) || /mercado_livre_oauth_tokens/i.test(error?.message || '');
}

const mercadoLivreTokenRepo = {
  async get() {
    const { data, error } = await supabase
      .from('mercado_livre_oauth_tokens')
      .select('access_token, refresh_token, token_type, expires_at, user_id, scope')
      .eq('integration', 'catalog')
      .maybeSingle();
    if (isMissingMercadoLivreTokenTable(error)) throw mercadoLivreTokenMigrationError();
    throwIfError(error);
    if (!data) return null;
    return {
      accessToken: data.access_token,
      refreshToken: data.refresh_token,
      tokenType: data.token_type,
      expiresAt: data.expires_at,
      userId: data.user_id,
      scope: data.scope || '',
    };
  },

  async save(tokens) {
    const { error } = await supabase
      .from('mercado_livre_oauth_tokens')
      .upsert({
        integration: 'catalog',
        access_token: tokens.accessToken,
        refresh_token: tokens.refreshToken,
        token_type: tokens.tokenType || 'Bearer',
        expires_at: tokens.expiresAt,
        user_id: tokens.userId,
        scope: tokens.scope || '',
        updated_at: new Date().toISOString(),
      }, { onConflict: 'integration' });
    if (isMissingMercadoLivreTokenTable(error)) throw mercadoLivreTokenMigrationError();
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
        .select(publicProductColumnsWithoutAffiliate)
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
        .select(publicProductColumnsWithoutAffiliate)
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
      if (product.mercadoLivreId) throw migrationRequiredError();
      ({ data, error } = await supabase
        .from('products')
        .insert(toLegacyDbProduct(product))
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
      if (product.mercadoLivreId) throw migrationRequiredError();
      ({ data, error } = await supabase
        .from('products')
        .update(toLegacyDbProduct(product))
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
  async updateMercadoLivreData(id, snapshot) {
    const update = toDbProduct({
      ...snapshot,
      stock: 0,
      minStock: 0,
      sku: '',
      status: 'active',
    });
    const allowedFields = {
      name: update.name,
      brand: update.brand,
      category: update.category,
      price: update.price,
      old_price: update.old_price,
      specs: update.specs,
      image: update.image,
      mercado_livre_id: update.mercado_livre_id,
      description: update.description,
      gallery: update.gallery,
      source_attributes: update.source_attributes,
      rating: update.rating,
      rating_count: update.rating_count,
      reviews: update.reviews,
      source_status: update.source_status,
      source_synced_at: update.source_synced_at,
    };
    const { data, error } = await supabase
      .from('products')
      .update(allowedFields)
      .eq('id', id)
      .select('*')
      .maybeSingle();
    if (isMissingCatalogColumn(error)) throw migrationRequiredError();
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

module.exports = { initDb, adminRepo, mercadoLivreTokenRepo, productRepo, uploadProductImage };
