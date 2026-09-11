(() => {
  const { hostname, port, protocol, origin } = window.location;
  const localPreview = ['localhost', '127.0.0.1', '[::1]'].includes(hostname)
    && /^55\d{2}$/.test(port);
  const apiOrigin = localPreview ? `${protocol}//${hostname}:3000` : origin;
  window.publicApiUrl = (path) => new URL(path, apiOrigin).href;
})();
