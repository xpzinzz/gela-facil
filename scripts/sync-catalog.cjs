// Run after editing productDetailsDb: node scripts/sync-catalog.cjs
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const root = path.resolve(__dirname, '..');
const source = fs.readFileSync(path.join(root, 'js/script.js'), 'utf8');
const database = source.slice(source.indexOf('const productDetailsDb ='), source.indexOf('// ── SHOPPING CART'));
const products = vm.runInNewContext(database + '\nproductDetailsDb');
const escape = value => String(value).replace(/[&<>"']/g, char => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[char]));
const file = path.join(root, 'index.html');
const html = fs.readFileSync(file, 'utf8').replace(/<div class="product-card"[\s\S]*?(?=<div class="product-card"|<\/section>)/g, card => {
  const id = card.match(/data-id="([^"]+)"/)?.[1];
  const product = products[id];
  if (!product) throw new Error(`Unknown product: ${id}`);
  return card.replace(/data-price="[^"]*"/, `data-price="${product.price}"`)
    .replace(/data-name="[^"]*"/, `data-name="${escape(product.name)}"`)
    .replace(/(<h3 class="product-name">)[\s\S]*?(<\/h3>)/, `$1${escape(product.name)}$2`)
    .replace(/(<span class="product-price">)[\s\S]*?(<\/span>)/, `$1${Number.isFinite(product.price) ? product.price.toLocaleString('pt-BR', {style:'currency',currency:'BRL'}) : 'Consulte no Mercado Livre'}$2`);
});
fs.writeFileSync(file, html);
console.log('Home synchronized with productDetailsDb.');
