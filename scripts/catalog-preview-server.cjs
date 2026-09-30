const http = require('http');
const fs = require('fs');
const path = require('path');

const root = path.resolve(__dirname, '..');
const products = [
  { id: 1, brand: 'Samsung', name: 'WindFree Inverter 12.000 BTU', category: 'inverter', price: 2399, oldPrice: 2899, specs: 'Inverter, 12.000 BTU, A+++', image: 'assets/produtos/samsung_windfree.webp' },
  { id: 2, brand: 'LG', name: 'Dual Inverter Voice 9.000 BTU', category: 'split', price: 1849, oldPrice: 2199, specs: 'Split, 9.000 BTU, Wi-Fi', image: 'assets/produtos/lg_dual_inverter.webp' },
  { id: 3, brand: 'Philco', name: 'Ar Portatil 12.000 BTU', category: 'portatil', price: 1749, oldPrice: 2099, specs: 'Portatil, 12.000 BTU, Sem obra', image: 'assets/produtos/philco_portable.webp' },
  { id: 4, brand: 'Electrolux', name: 'Frigobar 122 Litros', category: 'bebidas', price: 1209, oldPrice: 1809, specs: '122 Litros, Branco, 110V', image: 'assets/clima-bebidas/electrolux_frigobar.webp' },
  { id: 5, brand: 'Electrolux', name: 'Cervejeira Home Bar', category: 'bebidas', price: 2229, oldPrice: 2729, specs: '100 Litros, Frost Free, 110V', image: 'assets/clima-bebidas/electrolux_cervejeira.webp' }
];
const types = { '.html': 'text/html; charset=utf-8', '.js': 'text/javascript; charset=utf-8', '.css': 'text/css; charset=utf-8', '.svg': 'image/svg+xml', '.webp': 'image/webp', '.xml': 'application/xml' };

http.createServer((request, response) => {
  if (request.url === '/api/products') {
    response.writeHead(200, { 'Content-Type': 'application/json' });
    response.end(JSON.stringify(products));
    return;
  }

  const urlPath = decodeURIComponent(request.url.split('?')[0]);
  const requested = urlPath === '/' ? '/index.html' : urlPath;
  const filePath = path.resolve(root, `.${requested}`);
  if (!filePath.startsWith(root) || !fs.existsSync(filePath) || fs.statSync(filePath).isDirectory()) {
    response.writeHead(404);
    response.end('Not found');
    return;
  }

  response.writeHead(200, { 'Content-Type': types[path.extname(filePath)] || 'application/octet-stream' });
  fs.createReadStream(filePath).pipe(response);
}).listen(3000, '127.0.0.1');
