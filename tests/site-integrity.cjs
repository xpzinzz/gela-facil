const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const root = path.resolve(__dirname, '..');
const publicPages = ['index.html', 'pages/products.html', 'pages/product-detail.html', 'pages/privacidade-e-termos.html'];
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
  if (relativePath === 'pages/product-detail.html') {
    assert.match(html, /<meta\s+name="robots"\s+content="noindex, follow"[^>]*>/);
  } else {
    assert.match(html, /<meta\s+name="robots"\s+content="index, follow, max-image-preview:large"[^>]*>/);
  }
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
const homeBannersCss = fs.readFileSync(path.join(root, 'style/home-banners.css'), 'utf8');
assert.match(homeHtml, /"@type": "HVACBusiness"/, 'página inicial precisa identificar o negócio local');
assert.match(homeHtml, /legacy-bento-card/, 'blocos antigos da home precisam estar identificados para remoção visual');
assert.match(homeBannersCss, /legacy-bento-card[\s\S]*display:\s*none\s*!important/, 'blocos antigos da home não podem aparecer');
assert.match(homeHtml, /id="assorted-products-search"/, 'home precisa oferecer busca para os itens variados');
assert.match(homeHtml, /id="assorted-products-search-clear"/, 'busca de itens variados precisa oferecer limpeza rápida');
const homeSource = fs.readFileSync(path.join(root, 'js/script.js'), 'utf8');
assert.match(homeHtml, /href="https:\/\/craftevolution\.vercel\.app\/"[^>]*>Desenvolvido por Craft Evolution<\/a>/, 'rodapé da home precisa creditar a Craft Evolution com o link correto');
assert.match(homeSource, /function adjustProductImageToSize\(image\)/, 'imagens dos produtos precisam ser ajustadas conforme suas dimensões');
assert.match(homeSource, /image\.naturalWidth \/ image\.naturalHeight/, 'ajuste das imagens precisa respeitar a proporção original');
assert.match(homeSource, /image\.dataset\.imageShape/, 'formato calculado da imagem precisa ficar disponível para o CSS');
assert.match(homeSource, /storefrontSection === 'air-conditioners'/, 'escolha administrativa precisa ter prioridade na classificação da home');
assert.match(homeSource, /storefrontSection === 'assorted'/, 'home precisa respeitar a escolha por itens variados');
assert.match(homeSource, /productName\.includes\('frigobar'\)/, 'itens legados precisam separar frigobares da categoria genérica de bebidas');
assert.match(homeSource, /productName\.includes\('cervejeira'\)/, 'itens legados precisam separar cervejeiras da categoria genérica de bebidas');
assert.match(homeSource, /setupAssortedProductsSearch\(assortedProducts\)/, 'home precisa configurar a busca de itens variados no local indicado');
assert.match(homeSource, /queryTerms\.every\(term => searchableText\.includes\(term\)\)/, 'busca precisa considerar todos os termos digitados');
assert.doesNotMatch(homeSource, /data-assorted-filter/, 'botões antigos de filtro não devem permanecer na home');
const catalogHtml = fs.readFileSync(path.join(root, 'pages/products.html'), 'utf8');
assert.match(catalogHtml, /href="https:\/\/craftevolution\.vercel\.app\/"[^>]*>Desenvolvido por Craft Evolution<\/a>/, 'rodapé do catálogo precisa creditar a Craft Evolution com o link correto');
assert.match(catalogHtml, /"@type": "BreadcrumbList"/, 'catálogo precisa declarar breadcrumbs');
assert.match(catalogHtml, /id="air-conditioners-group"/, 'catálogo precisa separar a seção de ar-condicionados');
assert.match(catalogHtml, /id="assorted-products-group"/, 'catálogo precisa separar a seção de itens variados');
const catalogSource = fs.readFileSync(path.join(root, 'js/products-catalog.js'), 'utf8');
assert.match(catalogSource, /filteredProducts\.filter\(isAirConditionerProduct\)/, 'catálogo precisa classificar ar-condicionados explicitamente');
const legalHtml = fs.readFileSync(path.join(root, 'pages/privacidade-e-termos.html'), 'utf8');
assert.match(legalHtml, /href="https:\/\/craftevolution\.vercel\.app\/"[^>]*>Desenvolvido por Craft Evolution<\/a>/, 'rodapé jurídico precisa creditar a Craft Evolution com o link correto');
assert.match(legalHtml, /id="politica-de-privacidade"/, 'página jurídica precisa conter a Política de Privacidade');
assert.match(legalHtml, /id="termos-de-uso"/, 'página jurídica precisa conter os Termos de Uso');
assert.match(legalHtml, /class="legal-navbar"/, 'página jurídica precisa ter navbar fixa');
assert.match(legalHtml, />Voltar ao site</, 'página jurídica precisa oferecer retorno ao site');
const productSeoSource = fs.readFileSync(path.join(root, 'js/product-detail.js'), 'utf8');
const productDetailHtml = fs.readFileSync(path.join(root, 'pages/product-detail.html'), 'utf8');
assert.match(productSeoSource, /'@type': 'BreadcrumbList'/, 'produto precisa gerar breadcrumbs dinâmicos');
assert.match(productSeoSource, /const publicSiteOrigin = 'https:\/\/gelafacilref\.com\.br'/, 'produto precisa usar o domínio canônico oficial');
assert.match(productSeoSource, /window\.location\.replace\('\/pages\/products\.html'\)/, 'produto sem ID ou inexistente precisa substituir a URL pelo catálogo');
assert.match(productSeoSource, /meta\[name="robots"\].*index, follow/s, 'produto válido precisa ser indexável');
assert.match(productSeoSource, /window\.open\(detailProduct\.affiliateUrl/, 'botão de compra precisa abrir o link de afiliado');
assert.doesNotMatch(productSeoSource, /window\.open\(`https:\/\/wa\.me/, 'botão de compra não pode abrir WhatsApp');
assert.ok(productDetailHtml.indexOf('class="actions-row"') < productDetailHtml.indexOf('class="detail-summary-box"'), 'botão de compra precisa ficar acima do card de resumo');

const rewriteMap = new Map(vercelConfig.rewrites.map(rewrite => [rewrite.source, rewrite.destination]));
assert.ok(!rewriteMap.has('/robots.txt'), 'robots.txt deve ser servido como arquivo estático');
assert.ok(!rewriteMap.has('/sitemap.xml'), 'sitemap.xml deve ser servido como arquivo estático');
assert.equal(rewriteMap.get('/api/:path*'), 'https://gela-facil.onrender.com/api/:path*', 'API pública precisa chegar ao backend');

const robots = fs.readFileSync(path.join(root, 'robots.txt'), 'utf8');
assert.match(robots, /^User-agent: \*$/m, 'robots.txt precisa declarar o robô');
assert.match(robots, /^Disallow: \/admin\/$/m, 'robots.txt precisa bloquear o painel');
assert.match(robots, /^Sitemap: https:\/\/gelafacilref\.com\.br\/sitemap\.xml$/m, 'robots.txt precisa indicar o sitemap público');

const sitemap = fs.readFileSync(path.join(root, 'sitemap.xml'), 'utf8');
assert.match(sitemap, /^<\?xml version="1\.0" encoding="UTF-8"\?>/, 'sitemap.xml precisa ter cabeçalho XML');
assert.match(sitemap, /<urlset xmlns="http:\/\/www\.sitemaps\.org\/schemas\/sitemap\/0\.9">/, 'sitemap.xml precisa usar o protocolo oficial');
const sitemapLocations = [...sitemap.matchAll(/<loc>([^<]+)<\/loc>/g)].map(match => match[1]);
assert.ok(sitemapLocations.length >= 2, 'sitemap.xml precisa listar as páginas públicas');
assert.equal(new Set(sitemapLocations).size, sitemapLocations.length, 'sitemap.xml não pode repetir URLs');
sitemapLocations.forEach(location => assert.ok(location.startsWith('https://gelafacilref.com.br/'), `URL inválida no sitemap: ${location}`));
assert.ok(!sitemapLocations.some(location => /\/pages\/product-detail(?:\.html)?$/.test(location)), 'sitemap não pode listar a rota genérica sem produto');

const adminHeaders = vercelConfig.headers.find(rule => rule.source === '/admin/:path*')?.headers || [];
const robotsHeader = adminHeaders.find(header => header.key.toLowerCase() === 'x-robots-tag')?.value || '';
assert.match(robotsHeader, /noindex/i, 'painel administrativo precisa enviar X-Robots-Tag noindex');

const serverSource = fs.readFileSync(path.join(root, 'backend/server.js'), 'utf8');
const databaseSource = fs.readFileSync(path.join(root, 'backend/src/db.js'), 'utf8');
const adminHtml = fs.readFileSync(path.join(root, 'admin/index.html'), 'utf8');
const adminSource = fs.readFileSync(path.join(root, 'admin/admin.js'), 'utf8');
assert.match(adminHtml, /id="prod-storefront-section"/, 'painel precisa permitir escolher a seção do produto');
assert.match(adminHtml, /value="air-conditioners"/, 'painel precisa oferecer a seção de ar-condicionados');
assert.match(adminHtml, /value="assorted"/, 'painel precisa oferecer a seção de itens variados');
assert.match(adminSource, /storefrontSection:\s*document\.getElementById\('prod-storefront-section'\)\.value/, 'painel precisa enviar a seção escolhida');
assert.match(serverSource, /storefrontSections\.has\(product\.storefrontSection\)/, 'API precisa validar a seção escolhida');
assert.match(databaseSource, /__storefrontSection/, 'banco precisa persistir a seção escolhida nos metadados do produto');

for (const relativePath of referenceFiles) {
  const contents = fs.readFileSync(path.join(root, relativePath), 'utf8');
  for (const match of contents.matchAll(/https:\/\/wa\.me\/[^"'`\s]+/g)) {
    const whatsappUrl = decodeURIComponent(match[0]);
    assert.match(whatsappUrl, /ar-condicionado/i, `${relativePath}: WhatsApp fora do atendimento de ar-condicionado`);
    assert.match(whatsappUrl, /(instala|manuten|limpeza|higien|reparo|PMOC)/i, `${relativePath}: WhatsApp fora de instalação ou manutenção`);
  }
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
