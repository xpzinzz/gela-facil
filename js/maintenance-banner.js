(() => {
  const banners = document.querySelectorAll('.maintenance-banner');
  const key = 'gela-facil:maintenance-banner-dismissed';
  let dismissed = false;
  try { dismissed = sessionStorage.getItem(key) === '1'; } catch {}
  banners.forEach((banner) => {
    banner.hidden = dismissed;
    banner.querySelector('.maintenance-banner-close').addEventListener('click', () => {
      banners.forEach((item) => { item.hidden = true; });
      try { sessionStorage.setItem(key, '1'); } catch {}
    });
  });
})();
