const assert = require('node:assert/strict');
const {
  importMercadoLivreProduct,
  normalizeItemId,
  resolveItemReference,
} = require('../backend/src/mercado-livre');

function jsonResponse(data, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: { 'Content-Type': 'application/json' },
  });
}

assert.equal(normalizeItemId('MLB-1234567890'), 'MLB1234567890');
assert.equal(normalizeItemId('https://produto.mercadolivre.com.br/MLB-1234567890-item'), 'MLB1234567890');
assert.equal(normalizeItemId('sem id'), null);

(async () => {
  const redirected = await resolveItemReference('https://meli.la/teste', async url => {
    if (String(url) !== 'https://meli.la/teste') return new Response('', { status: 200 });
    return new Response(null, {
      status: 302,
      headers: { location: 'https://produto.mercadolivre.com.br/MLB-1234567890-produto' },
    });
  });
  assert.equal(redirected.itemId, 'MLB1234567890');
  assert.equal(redirected.sourceUrl, 'https://meli.la/teste');

  const calls = [];
  const product = await importMercadoLivreProduct('MLB1234567890', {
    accessToken: 'test-token',
    fetchImpl: async (url, options = {}) => {
      calls.push({ url: String(url), authorization: options.headers?.Authorization });
      if (String(url).endsWith('/description')) return jsonResponse({ plain_text: 'Descricao oficial do produto.' });
      if (String(url).includes('/sale_price')) return jsonResponse({ amount: 2299.9, regular_amount: 2799.9, currency_id: 'BRL' });
      if (String(url).includes('/reviews/item/')) return jsonResponse({
        rating_average: 4.8,
        paging: { total: 27 },
        reviews: [{ title: 'Excelente', content: 'Produto muito bom.', rate: 5, date_created: '2026-09-01T00:00:00Z' }],
      });
      return jsonResponse({
        id: 'MLB1234567890',
        title: 'Ar Condicionado LG Dual Inverter 12000 BTUs',
        price: 2399.9,
        original_price: 2799.9,
        catalog_product_id: 'MLB12345',
        status: 'active',
        domain_id: 'MLB-AIR_CONDITIONERS',
        attributes: [
          { id: 'BRAND', name: 'Marca', value_name: 'LG' },
          { id: 'MODEL', name: 'Modelo', value_name: 'Dual Inverter' },
          { id: 'VOLTAGE', name: 'Voltagem', value_name: '220V' },
        ],
        pictures: [{ secure_url: 'https://http2.mlstatic.com/teste.jpg' }],
      });
    },
  });

  assert.equal(product.mercadoLivreId, 'MLB1234567890');
  assert.equal(product.brand, 'LG');
  assert.equal(product.category, 'inverter');
  assert.equal(product.available, true);
  assert.equal(product.description, 'Descricao oficial do produto.');
  assert.equal(product.price, 2299.9);
  assert.equal(product.oldPrice, 2799.9);
  assert.equal(product.rating, 4.8);
  assert.equal(product.ratingCount, 27);
  assert.equal(product.reviews.length, 1);
  assert.ok(calls.some(call => call.url.includes('catalog_product_id=MLB12345')));
  assert.ok(calls.every(call => call.authorization === 'Bearer test-token'));

  await assert.rejects(
    importMercadoLivreProduct('MLB1234567890', { accessToken: '' }),
    error => error.code === 'MELI_TOKEN_MISSING' && error.statusCode === 503,
  );
  await assert.rejects(
    resolveItemReference('https://example.com/MLB1234567890'),
    error => error.code === 'INVALID_ITEM_REFERENCE',
  );

  console.log('PASS: Mercado Livre ID/link resolution, safe redirects, normalized item data and token protection.');
})().catch(error => {
  console.error(error);
  process.exitCode = 1;
});
