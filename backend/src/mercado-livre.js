const API_ORIGIN = 'https://api.mercadolibre.com';
const ITEM_ID_PATTERN = /\bMLB-?(\d{6,})\b/i;
const ALLOWED_WEB_HOSTS = new Set(['meli.la', 'mercadolivre.com.br', 'www.mercadolivre.com.br']);

class MercadoLivreError extends Error {
  constructor(message, statusCode = 502, code = 'MERCADO_LIVRE_ERROR') {
    super(message);
    this.name = 'MercadoLivreError';
    this.statusCode = statusCode;
    this.code = code;
  }
}

function normalizeItemId(value) {
  const match = String(value || '').match(ITEM_ID_PATTERN);
  return match ? `MLB${match[1]}` : null;
}

function isAllowedMercadoLivreHost(hostname) {
  const host = String(hostname || '').toLowerCase();
  return ALLOWED_WEB_HOSTS.has(host) || host.endsWith('.mercadolivre.com.br');
}

function parseMercadoLivreUrl(value) {
  try {
    const url = new URL(String(value || '').trim());
    if (url.protocol !== 'https:' || !isAllowedMercadoLivreHost(url.hostname)) return null;
    return url;
  } catch {
    return null;
  }
}

async function resolveShortUrl(url, fetchImpl) {
  let current = url;
  for (let redirectCount = 0; redirectCount < 5; redirectCount += 1) {
    const response = await fetchImpl(current, {
      method: 'GET',
      redirect: 'manual',
      headers: { 'User-Agent': 'GelaFacilAffiliateCatalog/1.0' },
    });
    response.body?.cancel?.();

    if (response.status < 300 || response.status >= 400) return current;
    const location = response.headers.get('location');
    if (!location) throw new MercadoLivreError('O link encurtado nao informou o destino.', 400, 'INVALID_AFFILIATE_LINK');

    const next = new URL(location, current);
    if (next.protocol !== 'https:' || !isAllowedMercadoLivreHost(next.hostname)) {
      throw new MercadoLivreError('O link redirecionou para um dominio nao permitido.', 400, 'INVALID_AFFILIATE_LINK');
    }
    current = next;
  }
  throw new MercadoLivreError('O link possui redirecionamentos demais.', 400, 'INVALID_AFFILIATE_LINK');
}

async function resolveItemReference(reference, fetchImpl = fetch) {
  const raw = String(reference || '').trim();
  const directId = normalizeItemId(raw);
  const sourceUrl = parseMercadoLivreUrl(raw);
  const looksLikeUrl = /^https?:\/\//i.test(raw);

  if (looksLikeUrl && !sourceUrl) {
    throw new MercadoLivreError('Use somente links HTTPS oficiais do Mercado Livre.', 400, 'INVALID_ITEM_REFERENCE');
  }
  if (directId) return { itemId: directId, sourceUrl: sourceUrl?.toString() || '' };
  if (!sourceUrl) {
    throw new MercadoLivreError('Informe um ID MLB ou link HTTPS do Mercado Livre.', 400, 'INVALID_ITEM_REFERENCE');
  }

  const resolvedUrl = sourceUrl.hostname.toLowerCase() === 'meli.la'
    ? await resolveShortUrl(sourceUrl, fetchImpl)
    : sourceUrl;
  const itemId = normalizeItemId(resolvedUrl.toString());
  if (!itemId) {
    throw new MercadoLivreError('Nao foi possivel identificar o ID MLB neste link.', 400, 'ITEM_ID_NOT_FOUND');
  }
  return { itemId, sourceUrl: sourceUrl.toString() };
}

function apiErrorMessage(status) {
  if (status === 401 || status === 403) return 'O token do Mercado Livre esta ausente, expirado ou sem permissao.';
  if (status === 404) return 'O anuncio nao foi encontrado ou nao esta mais disponivel.';
  if (status === 429) return 'O Mercado Livre limitou temporariamente as consultas. Tente novamente em instantes.';
  return 'O Mercado Livre nao respondeu como esperado.';
}

async function fetchApiJson(path, { fetchImpl, accessToken, optional = false }) {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 12000);
  try {
    const response = await fetchImpl(`${API_ORIGIN}${path}`, {
      headers: {
        Authorization: `Bearer ${accessToken}`,
        Accept: 'application/json',
        'User-Agent': 'GelaFacilAffiliateCatalog/1.0',
      },
      signal: controller.signal,
    });
    if (!response.ok) {
      if (optional && response.status === 404) return null;
      throw new MercadoLivreError(apiErrorMessage(response.status), response.status === 429 ? 503 : 502, `MELI_HTTP_${response.status}`);
    }
    return response.json();
  } catch (error) {
    if (error instanceof MercadoLivreError) throw error;
    if (error?.name === 'AbortError') throw new MercadoLivreError('A consulta ao Mercado Livre excedeu o tempo limite.', 504, 'MELI_TIMEOUT');
    throw new MercadoLivreError('Nao foi possivel conectar a API do Mercado Livre.', 502, 'MELI_CONNECTION_ERROR');
  } finally {
    clearTimeout(timeout);
  }
}

function findAttribute(item, ids) {
  const accepted = new Set(ids);
  const attribute = (item.attributes || []).find(entry => accepted.has(entry.id));
  return String(attribute?.value_name || '').trim();
}

function inferCategory(item) {
  const text = `${item.title || ''} ${findAttribute(item, ['PRODUCT_TYPE', 'MODEL'])}`.toLowerCase();
  if (/cervejeira|frigobar|freezer|adega|chopp|refrigerador/.test(text)) return 'bebidas';
  if (/port[aá]til/.test(text)) return 'portatil';
  if (/inverter/.test(text)) return 'inverter';
  return 'split';
}

function normalizeAttributes(item) {
  const result = {};
  for (const attribute of item.attributes || []) {
    const name = String(attribute.name || '').trim();
    const value = String(attribute.value_name || '').trim();
    if (!name || !value || Object.keys(result).length >= 24) continue;
    result[name] = value;
  }
  return result;
}

function attributesToSpecs(attributes) {
  const preferred = ['Marca', 'Modelo', 'Capacidade de refrigeração', 'Voltagem', 'Tecnologia', 'Tipo de ar condicionado'];
  const entries = Object.entries(attributes);
  const ordered = [
    ...preferred.flatMap(name => entries.filter(([key]) => key.toLowerCase() === name.toLowerCase())),
    ...entries.filter(([key]) => !preferred.some(name => name.toLowerCase() === key.toLowerCase())),
  ];
  return [...new Set(ordered.map(([, value]) => value))].slice(0, 6).join(', ');
}

function normalizeReviews(payload) {
  return (payload?.reviews || []).slice(0, 5).map(review => ({
    title: String(review.title || '').slice(0, 160),
    comment: String(review.content || '').slice(0, 2000),
    stars: Math.min(5, Math.max(1, Number(review.rate) || 1)),
    date: review.date_created || null,
  })).filter(review => review.title || review.comment);
}

async function importMercadoLivreProduct(reference, options = {}) {
  const fetchImpl = options.fetchImpl || fetch;
  const accessToken = String(options.accessToken ?? process.env.MERCADO_LIVRE_ACCESS_TOKEN ?? '').trim();
  if (!accessToken) {
    throw new MercadoLivreError('Configure MERCADO_LIVRE_ACCESS_TOKEN no backend/.env para importar anuncios.', 503, 'MELI_TOKEN_MISSING');
  }

  const { itemId, sourceUrl } = await resolveItemReference(reference, fetchImpl);
  const item = await fetchApiJson(`/items/${encodeURIComponent(itemId)}`, { fetchImpl, accessToken });
  const warnings = [];
  const [descriptionResult, reviewsResult] = await Promise.allSettled([
    fetchApiJson(`/items/${encodeURIComponent(itemId)}/description`, { fetchImpl, accessToken, optional: true }),
    fetchApiJson(`/reviews/item/${encodeURIComponent(itemId)}?limit=5`, { fetchImpl, accessToken, optional: true }),
  ]);
  const description = descriptionResult.status === 'fulfilled' ? descriptionResult.value : null;
  const reviews = reviewsResult.status === 'fulfilled' ? reviewsResult.value : null;
  if (descriptionResult.status === 'rejected') warnings.push('A descricao nao pode ser importada agora.');
  if (reviewsResult.status === 'rejected') warnings.push('As avaliacoes nao podem ser importadas agora.');

  const attributes = normalizeAttributes(item);
  const gallery = (item.pictures || [])
    .map(picture => picture.secure_url || picture.url)
    .filter(url => typeof url === 'string' && url.startsWith('https://'))
    .slice(0, 12);
  const image = gallery[0] || item.secure_thumbnail || item.thumbnail || '';
  const brand = findAttribute(item, ['BRAND']) || String(item.domain_id || 'Mercado Livre').replace(/^MLB-/, '').replaceAll('-', ' ');

  return {
    mercadoLivreId: itemId,
    name: String(item.title || '').trim(),
    brand,
    category: inferCategory(item),
    price: Number(item.price || 0),
    oldPrice: item.original_price == null ? null : Number(item.original_price),
    image,
    gallery,
    affiliateUrl: sourceUrl,
    description: String(description?.plain_text || '').slice(0, 10000),
    specs: attributesToSpecs(attributes),
    attributes,
    rating: Number(reviews?.rating_average || 0),
    ratingCount: Number(reviews?.paging?.total || 0),
    reviews: normalizeReviews(reviews),
    sourceStatus: String(item.status || 'unknown'),
    available: item.status === 'active',
    sourceSyncedAt: new Date().toISOString(),
    warnings,
  };
}

module.exports = {
  MercadoLivreError,
  importMercadoLivreProduct,
  isAllowedMercadoLivreHost,
  normalizeItemId,
  resolveItemReference,
};
