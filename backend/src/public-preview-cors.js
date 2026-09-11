// Only public product reads from local Live Server previews need CORS.
module.exports = function publicPreviewCors(req, res, next) {
  if (process.env.NODE_ENV !== 'production' && req.method === 'GET'
    && /^\/api\/products(?:\/[^/]+)?$/.test(req.path)
    && /^http:\/\/(?:localhost|127\.0\.0\.1|\[::1\]):55\d{2}$/.test(req.headers.origin || '')) {
    res.setHeader('Access-Control-Allow-Origin', req.headers.origin);
    res.vary('Origin');
  }
  next();
};
