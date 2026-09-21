const assert = require('node:assert/strict');

process.env.MERCADO_LIVRE_CLIENT_ID = '123456';
process.env.MERCADO_LIVRE_CLIENT_SECRET = 'test-secret';
process.env.MERCADO_LIVRE_REDIRECT_URI = 'https://example.com/oauth/mercado-livre/callback';

const {
  createAuthorizationUrl,
  exchangeAuthorizationCode,
  getValidAccessToken,
} = require('../backend/src/mercado-livre-oauth');

function tokenResponse(data) {
  return new Response(JSON.stringify(data), {
    status: 200,
    headers: { 'Content-Type': 'application/json' },
  });
}

(async () => {
  const authorizationUrl = new URL(createAuthorizationUrl('secure-state'));
  assert.equal(authorizationUrl.origin + authorizationUrl.pathname, 'https://auth.mercadolivre.com.br/authorization');
  assert.equal(authorizationUrl.searchParams.get('client_id'), '123456');
  assert.equal(authorizationUrl.searchParams.get('state'), 'secure-state');
  assert.equal(authorizationUrl.searchParams.get('redirect_uri'), process.env.MERCADO_LIVRE_REDIRECT_URI);

  let savedTokens = null;
  const tokenRepo = {
    async get() { return savedTokens; },
    async save(tokens) { savedTokens = tokens; },
  };

  await exchangeAuthorizationCode('authorization-code', tokenRepo, async (_url, options) => {
    const body = new URLSearchParams(String(options.body));
    assert.equal(body.get('grant_type'), 'authorization_code');
    assert.equal(body.get('client_secret'), 'test-secret');
    assert.equal(body.get('code'), 'authorization-code');
    return tokenResponse({
      access_token: 'first-access-token',
      refresh_token: 'first-refresh-token',
      expires_in: 21600,
      token_type: 'Bearer',
      user_id: 987,
      scope: 'read offline_access',
    });
  });
  assert.equal(savedTokens.accessToken, 'first-access-token');
  assert.equal(savedTokens.refreshToken, 'first-refresh-token');
  assert.equal(await getValidAccessToken(tokenRepo), 'first-access-token');

  savedTokens.expiresAt = new Date(Date.now() - 1000).toISOString();
  const refreshed = await getValidAccessToken(tokenRepo, async (_url, options) => {
    const body = new URLSearchParams(String(options.body));
    assert.equal(body.get('grant_type'), 'refresh_token');
    assert.equal(body.get('refresh_token'), 'first-refresh-token');
    return tokenResponse({
      access_token: 'second-access-token',
      refresh_token: 'second-refresh-token',
      expires_in: 21600,
      token_type: 'Bearer',
      user_id: 987,
      scope: 'read offline_access',
    });
  });
  assert.equal(refreshed, 'second-access-token');
  assert.equal(savedTokens.refreshToken, 'second-refresh-token');

  console.log('PASS: Mercado Livre OAuth URL, code exchange, token persistence and automatic refresh.');
})().catch(error => {
  console.error(error);
  process.exitCode = 1;
});
