const crypto = require('crypto');
const { MercadoLivreError } = require('./mercado-livre');

const AUTHORIZATION_URL = 'https://auth.mercadolivre.com.br/authorization';
const TOKEN_URL = 'https://api.mercadolibre.com/oauth/token';
const REFRESH_MARGIN_MS = 5 * 60 * 1000;

let refreshInFlight = null;

function oauthConfig() {
  const config = {
    clientId: String(process.env.MERCADO_LIVRE_CLIENT_ID || '').trim(),
    clientSecret: String(process.env.MERCADO_LIVRE_CLIENT_SECRET || '').trim(),
    redirectUri: String(process.env.MERCADO_LIVRE_REDIRECT_URI || '').trim(),
  };
  if (Object.values(config).some(value => !value)) {
    throw new MercadoLivreError('Configure as credenciais OAuth do Mercado Livre no backend/.env.', 503, 'MELI_OAUTH_CONFIG_MISSING');
  }
  try {
    const redirect = new URL(config.redirectUri);
    if (redirect.protocol !== 'https:' && redirect.hostname !== 'localhost' && redirect.hostname !== '127.0.0.1') throw new Error();
  } catch {
    throw new MercadoLivreError('MERCADO_LIVRE_REDIRECT_URI precisa ser uma URL valida.', 503, 'MELI_OAUTH_REDIRECT_INVALID');
  }
  return config;
}

function createOAuthState() {
  return crypto.randomBytes(32).toString('base64url');
}

function createAuthorizationUrl(state) {
  const { clientId, redirectUri } = oauthConfig();
  const url = new URL(AUTHORIZATION_URL);
  url.searchParams.set('response_type', 'code');
  url.searchParams.set('client_id', clientId);
  url.searchParams.set('redirect_uri', redirectUri);
  url.searchParams.set('state', state);
  return url.toString();
}

function normalizeTokenResponse(payload, previousRefreshToken = '') {
  const accessToken = String(payload?.access_token || '').trim();
  const refreshToken = String(payload?.refresh_token || previousRefreshToken || '').trim();
  const expiresIn = Number(payload?.expires_in);
  if (!accessToken || !refreshToken || !Number.isFinite(expiresIn) || expiresIn <= 0) {
    throw new MercadoLivreError('O Mercado Livre retornou credenciais incompletas.', 502, 'MELI_OAUTH_INVALID_RESPONSE');
  }
  return {
    accessToken,
    refreshToken,
    tokenType: String(payload.token_type || 'Bearer'),
    expiresAt: new Date(Date.now() + expiresIn * 1000).toISOString(),
    userId: payload.user_id == null ? null : String(payload.user_id),
    scope: String(payload.scope || ''),
  };
}

async function requestToken(parameters, fetchImpl = fetch) {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 12000);
  try {
    const response = await fetchImpl(TOKEN_URL, {
      method: 'POST',
      headers: {
        Accept: 'application/json',
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: new URLSearchParams(parameters),
      signal: controller.signal,
    });
    const payload = await response.json().catch(() => ({}));
    if (!response.ok) {
      const invalidGrant = payload?.error === 'invalid_grant';
      throw new MercadoLivreError(
        invalidGrant ? 'A autorizacao do Mercado Livre expirou ou ja foi utilizada. Conecte a conta novamente.' : 'Nao foi possivel concluir a autorizacao com o Mercado Livre.',
        502,
        invalidGrant ? 'MELI_OAUTH_INVALID_GRANT' : `MELI_OAUTH_HTTP_${response.status}`,
      );
    }
    return payload;
  } catch (error) {
    if (error instanceof MercadoLivreError) throw error;
    if (error?.name === 'AbortError') throw new MercadoLivreError('A autorizacao do Mercado Livre excedeu o tempo limite.', 504, 'MELI_OAUTH_TIMEOUT');
    throw new MercadoLivreError('Nao foi possivel conectar ao OAuth do Mercado Livre.', 502, 'MELI_OAUTH_CONNECTION_ERROR');
  } finally {
    clearTimeout(timeout);
  }
}

async function exchangeAuthorizationCode(code, tokenRepo, fetchImpl = fetch) {
  const { clientId, clientSecret, redirectUri } = oauthConfig();
  const payload = await requestToken({
    grant_type: 'authorization_code',
    client_id: clientId,
    client_secret: clientSecret,
    code,
    redirect_uri: redirectUri,
  }, fetchImpl);
  const tokens = normalizeTokenResponse(payload);
  await tokenRepo.save(tokens);
  return tokens;
}

async function refreshAccessToken(current, tokenRepo, fetchImpl = fetch) {
  const { clientId, clientSecret } = oauthConfig();
  const payload = await requestToken({
    grant_type: 'refresh_token',
    client_id: clientId,
    client_secret: clientSecret,
    refresh_token: current.refreshToken,
  }, fetchImpl);
  const tokens = normalizeTokenResponse(payload, current.refreshToken);
  await tokenRepo.save(tokens);
  return tokens;
}

async function getValidAccessToken(tokenRepo, fetchImpl = fetch) {
  const saved = await tokenRepo.get();
  if (!saved) {
    const legacyToken = String(process.env.MERCADO_LIVRE_ACCESS_TOKEN || '').trim();
    if (legacyToken) return legacyToken;
    throw new MercadoLivreError('Conecte a conta do Mercado Livre no painel antes de importar produtos.', 503, 'MELI_OAUTH_NOT_CONNECTED');
  }

  const expiresAt = Date.parse(saved.expiresAt);
  if (Number.isFinite(expiresAt) && expiresAt - Date.now() > REFRESH_MARGIN_MS) return saved.accessToken;
  if (!saved.refreshToken) throw new MercadoLivreError('A conexao com o Mercado Livre precisa ser refeita.', 503, 'MELI_OAUTH_RECONNECT_REQUIRED');

  if (!refreshInFlight) {
    refreshInFlight = refreshAccessToken(saved, tokenRepo, fetchImpl).finally(() => {
      refreshInFlight = null;
    });
  }
  return (await refreshInFlight).accessToken;
}

module.exports = {
  AUTHORIZATION_URL,
  TOKEN_URL,
  createAuthorizationUrl,
  createOAuthState,
  exchangeAuthorizationCode,
  getValidAccessToken,
  normalizeTokenResponse,
  refreshAccessToken,
};
