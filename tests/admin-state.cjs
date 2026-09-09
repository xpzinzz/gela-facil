const fs = require('fs');
const vm = require('vm');
const assert = require('node:assert/strict');
const elements = new Map();
const get = id => {
 if (!elements.has(id)) elements.set(id, { value: '', textContent: '', innerHTML: '', style: {}, hidden: false, disabled: false, listeners: {}, setAttribute() {}, removeAttribute() {}, addEventListener(type, fn) { this.listeners[type] = fn; }, querySelector() { return get(id + '-child'); } });
 return elements.get(id);
};
const context = vm.createContext({ document: { getElementById: get, addEventListener() {} }, window: {}, console, setTimeout, fetch: async () => ({ok:true,json:async()=>[]}) });
vm.runInContext(fs.readFileSync('admin/admin.js','utf8'), context);
for (const id of ['product-category-filter','product-status-filter','stock-status-filter']) get(id).value='all';
get('product-sort').value='name';
vm.runInContext(`DB.products = [
 {id:1,name:'Ar <teste>',brand:'Marca',sku:null,category:'split',price:123.45,stock:0,minStock:0,status:'active',affiliateUrl:'',image:'assets/test.png'},
 {id:2,name:'Outro',brand:'Marca',sku:'SKU2',category:'split',price:22,stock:4,minStock:2,status:'inactive',affiliateUrl:'https://meli.la/test',image:''}
]; renderProducts(); renderStock();`,context);
assert.equal(get('summary-total').textContent,2);
assert.equal(get('summary-active').textContent,1);
assert.equal(get('summary-pending').textContent,1);
assert.match(get('products-body').innerHTML,/Ar &lt;teste&gt;/);
assert.match(get('products-body').innerHTML,/src="\/assets\/test.png"/);
assert.match(get('products-body').innerHTML,/123,45/);
assert.match(get('stock-history-body').innerHTML,/Nenhuma movimentação/);
get('product-status-filter').value='missing-link';
vm.runInContext('renderProducts()',context);
assert.equal(get('products-pagination').textContent,'1 de 2 produtos');
get('product-search').value='nonexistent';
vm.runInContext('renderProducts()',context);
assert.match(get('products-body').innerHTML,/Nenhum produto encontrado/);
vm.runInContext('DB.products = []; renderStock()',context);
assert.equal(get('btn-stock-entry').disabled,true);
assert.match(get('stock-body').innerHTML,/Nenhum produto/);
(async()=>{
 context.fetch=async()=>{throw Error('offline');};
 await vm.runInContext('refreshCatalog()',context);
 assert.equal(get('retry-products').hidden,false);
 assert.match(get('catalog-feedback-child').textContent,/offline/);
 context.fetch=async()=>({ok:true,json:async()=>[]});
 await vm.runInContext('refreshCatalog()',context);
 assert.equal(get('catalog-feedback').hidden,true);
 let calls=0, finish;
 context.save = () => { calls++; return new Promise(resolve=>{finish=resolve;}); };
 vm.runInContext("bindBusyForm('test-form', save)",context);
 const submit=get('test-form').listeners.submit;
 const pending=submit({preventDefault(){}});
 await submit({preventDefault(){}});
 assert.equal(calls,1); assert.equal(get('test-form-child').disabled,true);
 finish(); await pending;
 assert.equal(get('test-form-child').disabled,false);
 const html=fs.readFileSync('admin/index.html','utf8');
 const ids=[...html.matchAll(/\bid="([^"]+)"/g)].map(m=>m[1]);
 assert.equal(new Set(ids).size,ids.length,'Duplicate HTML ids');
 assert.ok(!html.includes('page-orders'));
 for(const match of html.matchAll(/<label for="([^"]+)"/g)) assert.ok(ids.includes(match[1]));
 console.log('PASS: summary, filters, escaping, images, currency, empty stock/history, API failure/retry, duplicate submit prevention, HTML ids and labels.');
})().catch(error=>{console.error(error);process.exitCode=1;});
