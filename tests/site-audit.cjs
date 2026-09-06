const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const root = path.resolve(__dirname, '..');
const read = file => fs.readFileSync(path.join(root, file), 'utf8');
let checks = 0;
function check(name, fn) { fn(); checks++; console.log('OK ' + name); }
function element() {
  const attributes = {};
  const classes = new Set();
  return { style: {}, dataset: {}, value: '', textContent: '', innerHTML: '', hidden: false, parentNode: {insertBefore() {}},
    classList: { add: v => classes.add(v), remove: v => classes.delete(v), contains: v => classes.has(v), toggle(v, on) { on ? classes.add(v) : classes.delete(v); } },
    setAttribute: (k,v) => attributes[k] = v, getAttribute: k => attributes[k],
    addEventListener() {}, querySelectorAll: () => [], querySelector: () => null,
    appendChild() {}, remove() {}, focus() {}, contains: () => false };
}
function runtime(ids = [], search = '') {
  const elements = new Map(ids.map(id => [id, element()]));
  const listeners = [];
  const meta = element();
  const document = { hidden: false, title: '', body: element(),
    getElementById: id => elements.get(id) || null,
    querySelectorAll: () => [], querySelector: selector => selector === 'meta[name="description"]' ? meta : null,
    createElement: element, addEventListener: (event, callback) => { if(event === 'DOMContentLoaded') listeners.push(callback); } };
  const opened = [];
  const window = { location: { pathname: '/pages/products.html', search }, matchMedia: () => ({matches: false}), addEventListener() {}, open: (...args) => opened.push(args) };
  const context = vm.createContext({document, window, URL, URLSearchParams, Node: {TEXT_NODE:3},
    localStorage: {getItem() {throw new Error('Storage unavailable');}},
    setTimeout() {}, setInterval() {}, clearInterval() {}, MutationObserver: class {observe() {}}, console});
  const run = code => vm.runInContext(code, context);
  run(read('js/script.js'));
  // Browser globals assigned through window are visible as global identifiers.
  Object.assign(context, window);
  return {run, context, elements, document, opened, ready: () => listeners.forEach(fn => fn())};
}
const app = runtime();
const products = app.run('productDetailsDb');
check('Storefront boots when browser storage is unavailable', () => app.ready());
check('Every product image exists', () => {
  for(const product of Object.values(products)) for(const image of [product.image,...product.gallery]) assert.ok(fs.existsSync(path.join(root,image)), image);
});
check('Affiliate links reject scripts and misleading hosts', () => {
  for(const url of ['javascript:alert(1)','https://mercadolivre.com.br.attacker.test/item','http://mercadolivre.com.br/item','https://user:pass@mercadolivre.com.br/item']) assert.equal(app.run(`isValidAffiliateUrl(${JSON.stringify(url)})`),false);
  for(const url of ['https://mercadolivre.com.br/item','https://produto.mercadolivre.com.br/item','https://meli.la/example']) assert.equal(app.run(`isValidAffiliateUrl(${JSON.stringify(url)})`),true);
  app.run("openMercadoLivreProduct('__proto__')");
  assert.equal(app.opened.length,0);
});
check('Home prices and product names match detail database', () => {
  const cards = [...read('index.html').matchAll(/<div class="product-card"[\s\S]*?(?=<div class="product-card"|<\/section>)/g)];
  assert.equal(cards.length,Object.keys(products).length);
  for(const [card] of cards) {
    const id = card.match(/data-id="([^"]+)"/)[1];
    assert.equal(JSON.parse(card.match(/data-price="([^"]+)"/)[1]),products[id].price, id);
    assert.ok(card.includes(products[id].name),id);
    const displayed = card.match(/<span class="product-price">([^<]+)/)[1];
    if (Number.isFinite(products[id].price)) assert.equal(Number(displayed.replace(/[^\d,]/g,'').replace(',','.')),products[id].price,id);
    else assert.equal(displayed,'Consulte no Mercado Livre');
  }
});
const catalog = runtime(['catalog-grid','results-count','catalog-empty-state','search-input','search-clear-btn'],'?category=bebidas');
catalog.run(read('js/products-catalog.js'));
catalog.ready();
check('Category links include all six beverage products', () => {
  assert.equal(catalog.elements.get('results-count').textContent,6);
  assert.equal(catalog.elements.get('search-clear-btn').style.display,'block');
});
check('Search handles accents, BTU punctuation and empty results', () => {
  for(const [query,count] of [['portátil',1],['12000',2],['janela',1],['split',4],['inexistente xyz',0]]) {
    catalog.run(`state.search = ${JSON.stringify(query)}; filterAndRender()`);
    assert.equal(catalog.elements.get('results-count').textContent,count,query);
  }
  assert.equal(catalog.elements.get('catalog-empty-state').style.display,'block');
});
check('Price sorting and resetting filters work', () => {
  catalog.run("resetFilters(); state.sortBy='price-asc'; filterAndRender()");
  const prices = [...catalog.elements.get('catalog-grid').innerHTML.matchAll(/data-price="(\d+)"/g)].map(m => Number(m[1]));
  assert.equal(prices.length,12);
  assert.deepEqual(prices,[...prices].sort((a,b)=>a-b));
  catalog.run('resetFilters()');
  assert.equal(catalog.elements.get('results-count').textContent,Object.keys(products).length);
});
check('All local HTML links and assets resolve, including fragment targets', () => {
  for(const file of ['index.html','pages/products.html','pages/product-detail.html','pages/payment.html','admin/index.html']) {
    const html = read(file);
    const ids = [...html.matchAll(/\bid="([^"]+)"/g)].map(m=>m[1]);
    assert.equal(new Set(ids).size,ids.length,`Duplicate IDs: ${file}`);
    for(const [,reference] of html.matchAll(/(?:href|src)="([^"]+)"/g)) {
      if(/^(?:https?:|mailto:|tel:|data:)/.test(reference) || reference === '#') continue;
      const [relative,hash] = reference.split('#');
      const target = relative.split('?')[0];
      const resolved = target ? path.resolve(root,path.dirname(file),decodeURIComponent(target)) : path.join(root,file);
      assert.ok(fs.existsSync(resolved),`${file}: ${reference}`);
      if(hash && resolved.endsWith('.html')) assert.ok(fs.readFileSync(resolved,'utf8').includes(`id="${hash}"`),`${file}: missing #${hash}`);
    }
    assert.ok(!html.includes('5527999999999'),`${file}: outdated contact`);
  }
});
check('CLIN16 is searchable and unknown prices sort last without showing zero', () => {
  catalog.run("state.search='climatizador'; filterAndRender()");
  assert.equal(catalog.elements.get('results-count').textContent,1);
  assert.ok(catalog.elements.get('catalog-grid').innerHTML.includes('Consulte no Mercado Livre'));
  for (const sort of ['price-asc', 'price-desc']) {
    catalog.run(`state.search=''; state.sortBy='${sort}'; filterAndRender()`);
    const ids = [...catalog.elements.get('catalog-grid').innerHTML.matchAll(/data-id="([^"]+)"/g)].map(match => match[1]);
    assert.equal(ids.at(-1),'ventisol-clin16');
  }
  app.run("openMercadoLivreProduct('ventisol-clin16')");
  assert.equal(app.opened.at(-1)[0],'https://meli.la/1isvNAZ');
  assert.equal(products['ventisol-clin16'].gallery.length,3);
});
check('Retired payment page never collects card or customer data', () => {
  assert.ok(!/<(?:input|form)\b/.test(read('pages/payment.html')));
  assert.ok(!read('pages/payment.html').includes('payment.js'));
  assert.ok(!read('js/payment.js').includes('showSuccessScreen'));
});
check('All product details initialize, including missing and inherited IDs', () => {
  const ids = [...read('pages/product-detail.html').matchAll(/\bid="([^"]+)"/g)].map(m => m[1]);
  for(const id of [...Object.keys(products), 'missing', '__proto__', 'constructor']) {
    const detail = runtime(ids, '?id=' + id);
    const main = element();
    const meta = element();
    detail.document.querySelector = selector => selector === 'main' ? main : selector === 'meta[name="description"]' ? meta : null;
    detail.run(read('js/product-detail.js'));
    detail.ready();
    if(Object.hasOwn(products,id)) {
      assert.equal(detail.elements.get('modal-product-title').textContent,products[id].name);
      assert.ok(detail.document.title.includes(products[id].name));
      assert.equal(detail.elements.get('modal-buy-now-btn').textContent, products[id].affiliateUrl ? 'Ver no Mercado Livre' : 'Link do produto em breve');
    } else assert.ok(main.innerHTML.includes('Produto não encontrado'));
  }
});
check('Admin helpers boot without remote Chart.js and escape exported values', () => {
  const admin = vm.createContext({document:{addEventListener() {}}});
  vm.runInContext(read('admin/admin.js'),admin);
  assert.equal(vm.runInContext('escapeHtml("<img>")',admin),'&lt;img&gt;');
  assert.equal(vm.runInContext('csvCell(\'=SUM(A1)\')',admin),'"\'=SUM(A1)"');
  assert.equal(vm.runInContext('csvCell(\'a"b;c\')',admin),'"a""b;c"');
});
console.log(`${checks} audit groups passed.`);
