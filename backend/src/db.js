const { createClient } = require('@supabase/supabase-js');
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
  { brand: 'Samsung', name: 'WindFree Inverter 12.000 BTU', category: 'inverter', price: 2399, oldPrice: 2899, stock: 8, minStock: 5, sku: 'SAM-WF-12K', specs: 'Inverter, 12.000 BTU, A+++', status: 'active', image: 'assets/produtos/samsung_windfree.png', affiliateUrl: '' },
  { brand: 'LG', name: 'Dual Inverter Voice 9.000 BTU', category: 'inverter', price: 1849, oldPrice: 2199, stock: 3, minStock: 5, sku: 'LG-DI-9K', specs: 'Inverter, 9.000 BTU, Wi-Fi', status: 'active', image: 'assets/produtos/lg_dual_inverter.png', affiliateUrl: '' },
  { brand: 'Midea', name: 'Xtreme Save Inverter 18.000 BTU', category: 'inverter', price: 2899, oldPrice: 3499, stock: 12, minStock: 5, sku: 'MID-XS-18K', specs: 'Inverter, 18.000 BTU, A++', status: 'active', image: 'assets/produtos/midea_xtreme_save.png', affiliateUrl: '' },
  { brand: 'Elgin', name: 'Eco Inverter Plus 24.000 BTU', category: 'inverter', price: 3699, oldPrice: 4299, stock: 5, minStock: 4, sku: 'ELG-EI-24K', specs: 'Inverter, 24.000 BTU, Quente/Frio', status: 'active', image: 'assets/produtos/elgin_eco_inverter.png', affiliateUrl: '' },
  { brand: 'Springer', name: 'Silentia 7.500 BTU Split', category: 'split', price: 1299, oldPrice: 1699, stock: 0, minStock: 4, sku: 'SPR-SL-7.5K', specs: 'Split, 7.500 BTU, Silencioso', status: 'active', image: 'assets/produtos/springer_silentia.png', affiliateUrl: '' },
  { brand: 'Philco', name: 'Portable Portatil 12.000 BTU', category: 'portatil', price: 1749, oldPrice: 2099, stock: 2, minStock: 3, sku: 'PHI-PB-12K', specs: 'Portatil, 12.000 BTU, Sem obra', status: 'active', image: 'assets/produtos/philco_portable.png', affiliateUrl: '' },
  { brand: 'Electrolux', name: 'Frigobar 122 Litros EM120', category: 'bebidas', price: 1209, oldPrice: 1809, stock: 7, minStock: 3, sku: 'ELX-FB-122L', specs: '122 Litros, Branco, 110V', status: 'active', image: 'assets/clima-bebidas/electrolux_frigobar.png', affiliateUrl: '' },
  { brand: 'Electrolux', name: 'Cervejeira Home Bar EB100', category: 'bebidas', price: 2229, oldPrice: 2729, stock: 4, minStock: 3, sku: 'ELX-CB-100L', specs: '100 Litros, Frost Free, 110V', status: 'active', image: 'assets/clima-bebidas/electrolux_cervejeira.png', affiliateUrl: '' },
  { brand: 'Venax', name: 'Cervejeira Blue Light 102L', category: 'bebidas', price: 2529, oldPrice: 3423, stock: 1, minStock: 3, sku: 'VNX-BL-102L', specs: '102 Litros, Blue Light, 220V', status: 'inactive', image: 'assets/clima-bebidas/venax_cervejeira.png', affiliateUrl: '' },
  { brand: 'Electrolux', name: 'Cervejeira com Torre de Chopp EB10C', category: 'bebidas', price: 2799, oldPrice: 3693, stock: 0, minStock: 2, sku: 'ELX-TC-100L', specs: 'Torre de Chopp, 100 Litros, 110V', status: 'active', image: 'assets/clima-bebidas/electrolux_chopp.png', affiliateUrl: '' },
];

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
  };
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
    image: row.image,
    affiliateUrl: row.affiliate_url || '',
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
    image: row.image,
    affiliateUrl: row.affiliate_url || '',
  };
}

const publicProductColumns = 'id, brand, name, category, price, old_price, specs, image, affiliate_url';
const publicProductColumnsWithoutAffiliate = 'id, brand, name, category, price, old_price, specs, image';

function isMissingAffiliateColumn(error) {
  return error?.code === '42703' && /affiliate_url/i.test(error.message || '');
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
}

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
    if (isMissingAffiliateColumn(error)) {
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
    if (isMissingAffiliateColumn(error)) {
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
    const { data, error } = await supabase
      .from('products')
      .insert(toDbProduct(product))
      .select('*')
      .single();
    throwIfError(error);
    return fromDbProduct(data);
  },
  async update(id, product) {
    const { data, error } = await supabase
      .from('products')
      .update(toDbProduct(product))
      .eq('id', id)
      .select('*')
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

module.exports = { initDb, productRepo, uploadProductImage };
