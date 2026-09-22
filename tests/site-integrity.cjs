const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const root = path.resolve(__dirname, '..');
const publicPages = ['index.html', 'pages/products.html', 'pages/product-detail.html'];
const vercelConfig = JSON.parse(fs.readFileSync(path.join(root, 'vercel.json'), 'utf8'));
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
  assert.match(html, /<meta\s+property="og:url"/, `${relativePath}: og:url ausente`);
  assert.match(html, /<meta\s+name="twitter:card"/);
  assert.equal((html.match(/<h1\b/g) || []).length, 1, `${relativePath}: deve existir exatamente um h1`);

  for (const image of html.matchAll(/<img\b[^>]*>/g)) {
    assert.match(image[0], /\salt="[^"]*"/, `${relativePath}: imagem sem alt`);
  }

  for (const jsonLd of html.matchAll(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/g)) {
    JSON.parse(jsonLd[1]);
  }
}

const homeHtml = fs.readFileSync(path.join(root, 'index.html'), 'utf8');
assert.match(homeHtml, /"@type": "HVACBusiness"/, 'página inicial precisa identificar o negócio local');
const catalogHtml = fs.readFileSync(path.join(root, 'pages/products.html'), 'utf8');
assert.match(catalogHtml, /"@type": "BreadcrumbList"/, 'catálogo precisa declarar breadcrumbs');
const productSeoSource = fs.readFileSync(path.join(root, 'js/product-detail.js'), 'utf8');
assert.match(productSeoSource, /'@type': 'BreadcrumbList'/, 'produto precisa gerar breadcrumbs dinâmicos');

const rewriteMap = new Map(vercelConfig.rewrites.map(rewrite => [rewrite.source, rewrite.destination]));
assert.ok(!rewriteMap.has('/robots.txt'), 'robots.txt deve ser servido como arquivo estático');
assert.ok(!rewriteMap.has('/sitemap.xml'), 'sitemap.xml deve ser servido como arquivo estático');
assert.equal(rewriteMap.get('/api/:path*'), 'https://gela-facil.onrender.com/api/:path*', 'API pública precisa chegar ao backend');

const robots = fs.readFileSync(path.join(root, 'robots.txt'), 'utf8');
assert.match(robots, /^User-agent: \*$/m, 'robots.txt precisa declarar o robô');
assert.match(robots, /^Disallow: \/admin\/$/m, 'robots.txt precisa bloquear o painel');
assert.match(robots, /^Sitemap: https:\/\/gela-facil\.vercel\.app\/sitemap\.xml$/m, 'robots.txt precisa indicar o sitemap público');

const sitemap = fs.readFileSync(path.join(root, 'sitemap.xml'), 'utf8');
assert.match(sitemap, /^<\?xml version="1\.0" encoding="UTF-8"\?>/, 'sitemap.xml precisa ter cabeçalho XML');
assert.match(sitemap, /<urlset xmlns="http:\/\/www\.sitemaps\.org\/schemas\/sitemap\/0\.9">/, 'sitemap.xml precisa usar o protocolo oficial');
const sitemapLocations = [...sitemap.matchAll(/<loc>([^<]+)<\/loc>/g)].map(match => match[1]);
assert.ok(sitemapLocations.length >= 2, 'sitemap.xml precisa listar as páginas públicas');
assert.equal(new Set(sitemapLocations).size, sitemapLocations.length, 'sitemap.xml não pode repetir URLs');
sitemapLocations.forEach(location => assert.ok(location.startsWith('https://gela-facil.vercel.app/'), `URL inválida no sitemap: ${location}`));

const adminHeaders = vercelConfig.headers.find(rule => rule.source === '/admin/:path*')?.headers || [];
const robotsHeader = adminHeaders.find(header => header.key.toLowerCase() === 'x-robots-tag')?.value || '';
assert.match(robotsHeader, /noindex/i, 'painel administrativo precisa enviar X-Robots-Tag noindex');

const serverSource = fs.readFileSync(path.join(root, 'backend/server.js'), 'utf8');

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
