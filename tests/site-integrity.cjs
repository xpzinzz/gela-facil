const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const root = path.resolve(__dirname, '..');
const publicPages = ['index.html', 'pages/products.html', 'pages/product-detail.html'];
const referenceFiles = [
  ...publicPages,
  ...fs.readdirSync(path.join(root, 'style')).filter(name => name.endsWith('.css')).map(name => `style/${name}`),
  ...fs.readdirSync(path.join(root, 'js')).filter(name => name.endsWith('.js')).map(name => `js/${name}`),
];

for (const relativePath of publicPages) {
  const html = fs.readFileSync(path.join(root, relativePath), 'utf8');
  const title = html.match(/<title>([^<]+)<\/title>/)?.[1].trim() || '';
  const description = html.match(/<meta\s+name="description"[^>]*content="([^"]+)"/s)?.[1].trim() || '';

  assert.ok(title.length >= 30 && title.length <= 65, `${relativePath}: tamanho inadequado do title`);
  assert.ok(description.length >= 70 && description.length <= 170, `${relativePath}: tamanho inadequado da description`);
  assert.match(html, /<meta\s+name="robots"\s+content="index, follow, max-image-preview:large"[^>]*>/);
  assert.match(html, /<link\s+rel="canonical"/);
  assert.match(html, /<meta\s+property="og:title"/);
  assert.match(html, /<meta\s+name="twitter:card"/);
  assert.equal((html.match(/<h1\b/g) || []).length, 1, `${relativePath}: deve existir exatamente um h1`);

  for (const image of html.matchAll(/<img\b[^>]*>/g)) {
    assert.match(image[0], /\salt="[^"]*"/, `${relativePath}: imagem sem alt`);
  }

  for (const jsonLd of html.matchAll(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/g)) {
    JSON.parse(jsonLd[1]);
  }
}

for (const relativePath of referenceFiles) {
  const contents = fs.readFileSync(path.join(root, relativePath), 'utf8');
  for (const match of contents.matchAll(/(?:\.\.\/|\/)?(assets\/[A-Za-z0-9_./-]+\.(?:webp|svg))/g)) {
    const asset = path.join(root, ...match[1].split('/'));
    assert.ok(fs.existsSync(asset), `${relativePath}: ativo ausente ${match[1]}`);
  }
  assert.ok(!contents.includes('5527999999999'), `${relativePath}: número fictício ainda presente`);
}

const rasterFiles = [];
function collectRasterFiles(directory) {
  for (const entry of fs.readdirSync(directory, { withFileTypes: true })) {
    const entryPath = path.join(directory, entry.name);
    if (entry.isDirectory()) collectRasterFiles(entryPath);
    else if (/\.(?:png|jpe?g|webp)$/i.test(entry.name)) rasterFiles.push(entryPath);
  }
}
collectRasterFiles(path.join(root, 'assets'));

assert.ok(rasterFiles.length > 0, 'Nenhuma imagem raster encontrada');
for (const file of rasterFiles) {
  assert.equal(path.extname(file).toLowerCase(), '.webp', `Formato legado restante: ${file}`);
  const header = fs.readFileSync(file).subarray(0, 12);
  assert.equal(header.subarray(0, 4).toString('ascii'), 'RIFF', `${file}: cabeçalho RIFF inválido`);
  assert.equal(header.subarray(8, 12).toString('ascii'), 'WEBP', `${file}: cabeçalho WebP inválido`);
}

console.log(`PASS: SEO básico, contatos, referências e ${rasterFiles.length} imagens WebP validados.`);
