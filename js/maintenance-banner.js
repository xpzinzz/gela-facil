(() => {
  const banners = document.querySelectorAll('.maintenance-banner');
  const key = 'gela-facil:maintenance-banner-dismissed';
  const reduceMotion = window.matchMedia?.('(prefers-reduced-motion: reduce)').matches ?? false;
  let dismissed = false;
  try { dismissed = sessionStorage.getItem(key) === '1'; } catch {}

  const hideBanner = (banner) => new Promise((resolve) => {
    if (reduceMotion) {
      banner.hidden = true;
      resolve();
      return;
    }

    banner.style.height = `${banner.offsetHeight}px`;
    void banner.offsetHeight;
    banner.classList.add('is-closing');
    banner.inert = true;

    let finished = false;
    const finish = () => {
      if (finished) return;
      finished = true;
      banner.removeEventListener('transitionend', handleTransitionEnd);
      banner.hidden = true;
      banner.classList.remove('is-closing');
      banner.style.removeProperty('height');
      banner.inert = false;
      resolve();
    };

    const handleTransitionEnd = (event) => {
      if (event.target === banner && event.propertyName === 'height') finish();
    };
    banner.addEventListener('transitionend', handleTransitionEnd);
    window.setTimeout(finish, 400);
  });

  banners.forEach((banner) => {
    banner.hidden = dismissed;
    const closeButton = banner.querySelector('.maintenance-banner-close');
    if (!closeButton) return;

    closeButton.addEventListener('click', async () => {
      if (banner.classList.contains('is-closing')) return;
      const restoreFocus = document.activeElement === closeButton;
      closeButton.disabled = true;
      try { sessionStorage.setItem(key, '1'); } catch {}
      await Promise.all([...banners].filter((item) => !item.hidden).map(hideBanner));
      if (restoreFocus) document.querySelector('#search-input')?.focus();
    });
  });
})();
