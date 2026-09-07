require('dotenv').config({ path: require('path').join(__dirname, '..', '.env') });

const fs = require('fs');
const path = require('path');
const { createClient } = require('@supabase/supabase-js');
const WebSocket = require('ws');

const rootDir = path.resolve(__dirname, '..', '..');
const htmlPath = path.join(rootDir, 'index.html');

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

const html = fs.readFileSync(htmlPath, 'utf8');

function decodeHtml(value) {
  return String(value || '')
    .replace(/&amp;/g, '&')
    .replace(/&nbsp;/g, ' ')
    .replace(/&#(\d+);/g, (_, code) => String.fromCharCode(Number(code)))
    .trim();
}

function attr(source, name) {
  const match = source.match(new RegExp(`${name}="([^"]*)"`, 'i'));
  return match ? decodeHtml(match[1]) : '';
}

function parsePrice(value) {
  const onlyNumber = String(value || '').replace(/[^\d]/g, '');
  return onlyNumber ? Number(onlyNumber) : null;
}

function categoryFrom(raw) {
  const categories = String(raw || '').split(/\s+/).filter(Boolean);
  return categories[0] || 'split';
}

function skuFrom(product) {
  const id = String(product.sourceId).toUpperCase().replace(/[^A-Z0-9]/g, '');
  const brand = product.brand.toUpperCase().replace(/[^A-Z0-9]/g, '').slice(0, 3) || 'GEL';
  return `IDX-${brand}-${id}`;
}

function extractProducts() {
  const products = [];
  const cardRegex = /<div class="product-card"\s+([\s\S]*?data-image="[^"]*"[\s\S]*?)(?=<div class="product-card"|<!-- Banner|<\/div>\s*<\/div>\s*<\/section>)/g;
  let match;

  while ((match = cardRegex.exec(html))) {
    const card = match[1];
    const sourceId = attr(card, 'data-id');
    const brand = attr(card, 'data-brand');
    const name = attr(card, 'data-name');
    const price = Number(attr(card, 'data-price'));
    const category = categoryFrom(attr(card, 'data-category'));
    const image = attr(card, 'data-image');
    const oldPriceMatch = card.match(/<span class="old-price">([^<]*)<\/span>/i);
    const specMatches = [...card.matchAll(/<span class="spec-tag">([^<]+)<\/span>/gi)];
    const specs = specMatches.map(item => decodeHtml(item[1])).join(', ');

    if (!sourceId || !brand || !name || !Number.isFinite(price)) continue;

    products.push({
      brand,
      name,
      category,
      price,
      old_price: oldPriceMatch ? parsePrice(oldPriceMatch[1]) : null,
      stock: 0,
      min_stock: 3,
      sku: skuFrom({ sourceId, brand }),
      specs,
      status: 'active',
      image,
    });
  }

  return products;
}

async function main() {
  const products = extractProducts();
  if (products.length === 0) throw new Error('Nenhum produto encontrado no index.html');

  const { error: deleteError } = await supabase
    .from('products')
    .delete()
    .gte('id', 0);
  if (deleteError) throw deleteError;

  const { data, error: insertError } = await supabase
    .from('products')
    .insert(products)
    .select('id, name, sku');
  if (insertError) throw insertError;

  console.log(`Importados ${data.length} produtos do index.html para o Supabase.`);
  data.forEach(product => console.log(`${product.id} - ${product.sku} - ${product.name}`));
}

main().catch((err) => {
  console.error('Falha ao importar produtos:', err.message);
  process.exit(1);
});

