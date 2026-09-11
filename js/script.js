// ── SPLASH SCREEN LOGIC ────────────────────────────────
(function () {
  // Generate random floating snowflakes for splash screen
  const flakesWrap = document.getElementById('spl-flakes');
  if (flakesWrap) {
    for (let i = 0; i < 25; i++) {
      const f = document.createElement('span');
      f.className = 'spl-flake';
      const size = (4 + Math.random() * 8) + 'px';
      f.style.width = size;
      f.style.height = size;
      f.style.left = Math.random() * 100 + '%';
      f.style.animationDuration = (6 + Math.random() * 8) + 's';
      f.style.animationDelay = (Math.random() * 5) + 's';
      f.style.opacity = (0.15 + Math.random() * 0.35);
      flakesWrap.appendChild(f);
    }
  }

  const fill = document.getElementById('spl-fill');
  const step = document.getElementById('spl-step');
  const cta = document.getElementById('spl-cta');

  const steps = [
    { pct: 20, msg: 'Carregando catálogo...' },
    { pct: 50, msg: 'Buscando melhores ofertas...' },
    { pct: 75, msg: 'Verificando técnicos ativos...' },
    { pct: 100, msg: 'Pronto para refrescar seu dia!' }
  ];

  let idx = 0;
  function nextStep() {
    if (idx >= steps.length) {
      if (cta) cta.classList.add('visible');
      return;
    }
    const s = steps[idx++];
    if (fill) fill.style.width = s.pct + '%';
    if (step) step.textContent = s.msg;
    setTimeout(nextStep, idx === steps.length ? 600 : 800);
  }

  // Start progress sequence
  setTimeout(nextStep, 300);

  // Global exit splash function
  window.enterSite = function () {
    const splash = document.getElementById('splash');
    if (splash) {
      splash.classList.add('hidden');
      setTimeout(() => {
        splash.remove();
        document.body.style.overflowY = 'auto'; // allow scroll
      }, 700);
    }
  };
}());

// ── GLOBAL STATE ────────────────────────────────────────
let cartCount = 0;
let currentProduct = null; // Holds info for the opened product in the modal

// ── NAVBAR LOGIC & SCROLL TRANSITIONS ────────────────────
const navbar = document.getElementById('navbar');
const menuToggle = document.getElementById('menu-toggle');
const navLinksContainer = document.getElementById('nav-links');
const navLinks = document.querySelectorAll('.nav-links a');

// Toggle transparent vs solid navbar on scroll
if (navbar) {
  if (!document.getElementById('hero-section')) {
    navbar.classList.add('scrolled');
  }
  
  window.addEventListener('scroll', () => {
    if (!document.getElementById('hero-section')) {
      navbar.classList.add('scrolled');
      return;
    }
    
    if (window.scrollY > 40) {
      navbar.classList.add('scrolled');
    } else {
      navbar.classList.remove('scrolled');
    }
  });
}

// Toggle Mobile Menu
if (menuToggle) {
  menuToggle.addEventListener('click', () => {
    menuToggle.classList.toggle('active');
    navLinksContainer.classList.toggle('active');
  });
}

// Close Mobile Menu when clicking on links
navLinks.forEach(link => {
  link.addEventListener('click', () => {
    menuToggle.classList.remove('active');
    navLinksContainer.classList.remove('active');
  });
});

// ── HERO CAROUSEL LOGIC ─────────────────────────────────
const slides = document.querySelectorAll('.carousel-slide');
const dots = document.querySelectorAll('.carousel-dots .dot');
const prevBtn = document.getElementById('carousel-prev');
const nextBtn = document.getElementById('carousel-next');
let slideIndex = 0;
let carouselInterval;

function showSlide(n) {
  if (!slides || slides.length === 0) return;
  slides.forEach(slide => slide.classList.remove('active'));
  dots.forEach(dot => dot.classList.remove('active'));
  
  // Wrap index
  slideIndex = (n + slides.length) % slides.length;
  
  if (slides[slideIndex]) slides[slideIndex].classList.add('active');
  if (dots[slideIndex]) dots[slideIndex].classList.add('active');
}

function nextSlide() {
  showSlide(slideIndex + 1);
}

function prevSlide() {
  showSlide(slideIndex - 1);
}

function startCarouselAutoplay() {
  if (!slides || slides.length === 0) return;
  carouselInterval = setInterval(nextSlide, 7000); // changes slide every 7 seconds
}

function stopCarouselAutoplay() {
  if (carouselInterval) clearInterval(carouselInterval);
}

// Event Listeners for Controls
if (nextBtn) {
  nextBtn.addEventListener('click', () => {
    stopCarouselAutoplay();
    nextSlide();
    startCarouselAutoplay();
  });
}

if (prevBtn) {
  prevBtn.addEventListener('click', () => {
    stopCarouselAutoplay();
    prevSlide();
    startCarouselAutoplay();
  });
}

// Dots indicators clicks
dots.forEach(dot => {
  dot.addEventListener('click', (e) => {
    stopCarouselAutoplay();
    const targetIdx = parseInt(e.target.getAttribute('data-slide'));
    showSlide(targetIdx);
    startCarouselAutoplay();
  });
});

// Initialize Carousel Autoplay if slides exist
if (slides && slides.length > 0) {
  startCarouselAutoplay();
}

// ── PRODUCT CATALOG FILTERS ─────────────────────────────
const filterTabs = document.querySelectorAll('.filter-tab');

filterTabs.forEach(tab => {
  tab.addEventListener('click', () => {
    // Toggle active class on tabs
    filterTabs.forEach(t => t.classList.remove('active'));
    tab.classList.add('active');
    
    const filterValue = tab.getAttribute('data-filter');
    applyProductFilter(filterValue);
  });
});

// ── PRODUCT DETAILS DATABASE ────────────────────────────
// Produtos são carregados exclusivamente da API e cadastrados pelo painel.
const productDetailsDb = {};

function escapeHtml(value) {
  return String(value ?? '').replace(/[&<>'"]/g, char => ({
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    "'": '&#39;',
    '"': '&quot;',
  }[char]));
}

function isValidAffiliateUrl(value) {
  try {
    const url = new URL(value);
    const host = url.hostname.toLowerCase();
    return url.protocol === 'https:' && (
      host === 'meli.la' ||
      host === 'mercadolivre.com.br' ||
      host.endsWith('.mercadolivre.com.br')
    );
  } catch {
    return false;
  }
}

function productSpecsToTags(specs) {
  return String(specs || '')
    .split(',')
    .map(item => item.trim())
    .filter(Boolean)
    .slice(0, 3);
}

function productCategoriesFor(product) {
  const categories = [product.category].filter(Boolean);
  if (product.category === 'inverter') categories.push('split');
  return categories;
}

function normalizeProductImage(path) {
  const imagePath = path || 'assets/produtos/banner-climatizacao-premium.png';
  // Imagens cadastradas usam "assets/...". Torná-las absolutas evita que a
  // mesma referência vire /pages/assets/... quando renderizada em subpáginas.
  if (imagePath.startsWith('assets/')) return '/' + imagePath;
  return imagePath;
}

function renderHomeProductCard(product, index) {
  const id = String(product.id);
  const image = normalizeProductImage(product.image);
  const categories = productCategoriesFor(product);
  const specTags = productSpecsToTags(product.specs);
  const oldPriceHtml = product.oldPrice ? `<span class="old-price">${formatPrice(product.oldPrice)}</span>` : '';
  const tagHtml = product.oldPrice && index < 3 ? '<div class="product-tag promo">Oferta</div>' : '';
  const safeName = escapeHtml(product.name);
  const safeBrand = escapeHtml(product.brand);
  const safeImage = escapeHtml(image);
  const safeCategories = escapeHtml(categories.join(' '));
  const specsHtml = specTags.map(tag => `<span class="spec-tag">${escapeHtml(tag)}</span>`).join('');

  productDetailsDb[id] = {
    name: product.name,
    brand: product.brand,
    category: product.category,
    price: product.price,
    image,
    affiliateUrl: product.affiliateUrl || '',
    rating: 5,
    ratingCount: 0,
    gallery: [image],
    desc: product.specs || '',
    specs: Object.fromEntries(specTags.map((tag, tagIndex) => [`Info ${tagIndex + 1}`, tag])),
    reviews: []
  };

  return `
    <div class="product-card" data-id="${id}" data-brand="${safeBrand}" data-name="${safeName}"
      data-price="${product.price}" data-category="${safeCategories}" data-image="${safeImage}">
      <div class="product-img-wrap">
        <div class="product-icon-container">
          <img src="${safeImage}" alt="${safeName}" class="product-image" loading="lazy" decoding="async" />
        </div>
        ${tagHtml}
        <div class="product-hover-overlay"><span class="view-details-btn">Ver detalhes</span></div>
      </div>
      <div class="product-info">
        <div class="product-brand">${safeBrand}</div>
        <h3 class="product-name">${safeName}</h3>
        <div class="product-specs">${specsHtml}</div>
        <div class="product-footer">
          <div class="product-price-wrap">${oldPriceHtml}<span class="product-price">${formatPrice(product.price)}</span></div>
          <button class="btn-cart-add" aria-label="Ver produto e consultar link do Mercado Livre">↗</button>
        </div>
      </div>
    </div>`;
}

async function loadHomeProductsFromApi() {
  const grid = document.getElementById('products-grid');
  const drinksTrack = document.getElementById('clima-bebidas-track');
  if (!grid || !drinksTrack || !window.location.protocol.startsWith('http')) return;

  try {
    const response = await fetch(window.publicApiUrl('/api/products'));
    if (!response.ok) throw new Error('Falha ao carregar produtos.');

    const products = await response.json();
    if (!Array.isArray(products) || products.length === 0) {
      grid.innerHTML = '<p class="products-loading-state">Nenhum produto ativo cadastrado.</p>';
      drinksTrack.innerHTML = '<p class="products-loading-state">Nenhum produto para bebidas cadastrado.</p>';
      return;
    }

    Object.keys(productDetailsDb).forEach(id => delete productDetailsDb[id]);
    const airConditioners = products.filter(product => product.category !== 'bebidas');
    const drinks = products.filter(product => product.category === 'bebidas');

    grid.innerHTML = airConditioners.length
      ? airConditioners.map(renderHomeProductCard).join('')
      : '<p class="products-loading-state">Nenhum ar-condicionado ativo cadastrado.</p>';
    drinksTrack.innerHTML = drinks.length
      ? drinks.map(renderHomeProductCard).join('')
      : '<p class="products-loading-state">Nenhum produto para bebidas cadastrado.</p>';

    const activeFilter = document.querySelector('.filter-tab.active')?.getAttribute('data-filter') || 'all';
    applyProductFilter(activeFilter);
  } catch (err) {
    grid.innerHTML = '<p class="products-loading-state">Não foi possível carregar os produtos.</p>';
    drinksTrack.innerHTML = '<p class="products-loading-state">Não foi possível carregar os produtos.</p>';
  }
}

function applyProductFilter(filterValue) {
  document.querySelectorAll('#products-grid .product-card').forEach(card => {
    const categories = card.getAttribute('data-category').split(' ');
    if (filterValue === 'all' || categories.includes(filterValue)) {
      card.style.display = 'flex';
      card.style.animation = 'fadeInCard 0.4s ease forwards';
    } else {
      card.style.display = 'none';
    }
  });
}

// ── SHOPPING CART STATE & MANAGEMENT ────────────────────
let cart = JSON.parse(localStorage.getItem('gela_facil_cart') || '[]');

function saveCart() {
  localStorage.setItem('gela_facil_cart', JSON.stringify(cart));
  updateCartCounters();
}

function updateCartCounters() {
  const totalItemsCount = cart.reduce((acc, item) => acc + item.quantity, 0);
  
  const navCartCounts = document.querySelectorAll('.nav-cart-count');
  navCartCounts.forEach(el => el.textContent = totalItemsCount);
  
  const floatCartCounts = document.querySelectorAll('.cart-float-count');
  floatCartCounts.forEach(el => el.textContent = totalItemsCount);
}

window.addToCart = function(id, name, brand, price, image, option, optionName, optionPrice, quantity = 1) {
  const existingItemIndex = cart.findIndex(item => item.id === id && item.option === option);
  
  if (existingItemIndex > -1) {
    cart[existingItemIndex].quantity += quantity;
  } else {
    cart.push({
      id,
      name,
      brand,
      price,
      image,
      option,
      optionName,
      optionPrice,
      quantity
    });
  }
  
  saveCart();
  updateCartDrawerUI();
  showToast(`"${name}" adicionado ao carrinho!`);
  
  // Animate floating cart button
  const floatBtn = document.getElementById('cart-float-btn');
  if (floatBtn) {
    floatBtn.style.transform = 'scale(1.25)';
    setTimeout(() => {
      floatBtn.style.transform = 'scale(1)';
    }, 300);
  }
};

window.updateCartItemQty = function(index, delta) {
  if (cart[index]) {
    cart[index].quantity += delta;
    if (cart[index].quantity <= 0) {
      cart.splice(index, 1);
    }
    saveCart();
    updateCartDrawerUI();
  }
};

window.removeCartItem = function(index) {
  if (cart[index]) {
    const name = cart[index].name;
    cart.splice(index, 1);
    saveCart();
    updateCartDrawerUI();
    showToast(`"${name}" removido do carrinho.`);
  }
};

function updateCartDrawerUI() {
  const emptyState = document.getElementById('cart-empty-state');
  const itemsContainer = document.getElementById('cart-items-container');
  const checkoutBtn = document.getElementById('cart-checkout-btn');
  
  if (cart.length === 0) {
    if (emptyState) emptyState.style.display = 'flex';
    if (itemsContainer) itemsContainer.style.display = 'none';
    if (checkoutBtn) checkoutBtn.disabled = true;
    
    document.getElementById('cart-subtotal-val').textContent = formatPrice(0);
    document.getElementById('cart-services-val').textContent = formatPrice(0);
    document.getElementById('cart-total-val').textContent = formatPrice(0);
    return;
  }
  
  if (emptyState) emptyState.style.display = 'none';
  if (itemsContainer) {
    itemsContainer.style.display = 'flex';
    let itemsHtml = '';
    cart.forEach((item, index) => {
      itemsHtml += `
        <div class="cart-item">
          <div class="cart-item-img">
            <img src="${(window.location.pathname.includes('/pages/') && !item.image.startsWith('..') && !item.image.startsWith('http') && !item.image.startsWith('/')) ? '../' + item.image : item.image}" alt="${item.name}">
          </div>
          <div class="cart-item-details">
            <span class="cart-item-title">${item.name}</span>
            <span class="cart-item-option">+ ${item.optionName}</span>
            <span class="cart-item-price">${formatPrice(item.price + item.optionPrice)}</span>
          </div>
          <div class="cart-item-actions">
            <button class="cart-item-remove-btn" onclick="removeCartItem(${index})" aria-label="Remover item">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/><line x1="10" y1="11" x2="10" y2="17"/><line x1="14" y1="11" x2="14" y2="17"/></svg>
            </button>
            <div class="cart-item-qty-row">
              <button class="qty-btn" onclick="updateCartItemQty(${index}, -1)">-</button>
              <span class="qty-val">${item.quantity}</span>
              <button class="qty-btn" onclick="updateCartItemQty(${index}, 1)">+</button>
            </div>
          </div>
        </div>
      `;
    });
    itemsContainer.innerHTML = itemsHtml;
  }
  
  if (checkoutBtn) checkoutBtn.disabled = false;
  
  const subtotal = cart.reduce((acc, item) => acc + (item.price * item.quantity), 0);
  const servicesTotal = cart.reduce((acc, item) => acc + (item.optionPrice * item.quantity), 0);
  const total = subtotal + servicesTotal;
  
  document.getElementById('cart-subtotal-val').textContent = formatPrice(subtotal);
  document.getElementById('cart-services-val').textContent = servicesTotal === 0 ? 'Grátis' : `+ ${formatPrice(servicesTotal)}`;
  document.getElementById('cart-total-val').textContent = formatPrice(total);
}

window.openCartDrawer = function() {
  document.getElementById('cart-drawer').classList.add('active');
  document.getElementById('cart-drawer-overlay').classList.add('active');
  document.body.style.overflow = 'hidden';
  updateCartDrawerUI();
};

window.closeCartDrawer = function() {
  document.getElementById('cart-drawer').classList.remove('active');
  document.getElementById('cart-drawer-overlay').classList.remove('active');
  document.body.style.overflow = '';
};

// Affiliate storefront: product sales happen on Mercado Livre, never on this site.
window.openMercadoLivreProduct = function(productId, directAffiliateUrl = '') {
  const product = productDetailsDb[String(productId)];
  const affiliateUrl = directAffiliateUrl || (product && product.affiliateUrl);
  if (isValidAffiliateUrl(affiliateUrl)) {
    window.open(affiliateUrl, '_blank', 'noopener,noreferrer');
    return;
  }
  showToast('Link deste produto no Mercado Livre em breve.');
};

document.addEventListener('DOMContentLoaded', async () => {
  document.title = 'Gela Fácil | Produtos no Mercado Livre e climatização no ES';
  const metaDescription = document.querySelector('meta[name="description"]');
  if (metaDescription) metaDescription.content = 'Encontre produtos anunciados no Mercado Livre e contrate instalação ou manutenção de ar-condicionado com a Gela Fácil em Linhares, Sooretama, Aracruz e Rio Bananal.';

  // Keep every existing contact shortcut pointed at the official number.
  document.querySelectorAll('a[href*="wa.me/5527999999999"]').forEach(link => {
    link.href = link.href.replace('5527999999999', '5527999735745');
  });
  document.querySelectorAll('a[href="tel:+5527999999999"]').forEach(link => {
    link.href = 'tel:+5527999735745';
    const textNode = Array.from(link.childNodes).find(node => node.nodeType === Node.TEXT_NODE);
    if (textNode) textNode.textContent = ' (27) 99973-5745';
  });

  // The old local checkout is intentionally disabled in affiliate mode.
  document.querySelectorAll('#cart-float-btn, #cart-drawer, #cart-drawer-overlay').forEach(el => {
    el.style.display = 'none';
  });

  const main = document.querySelector('main') || document.querySelector('#produtos');
  if (main && !document.querySelector('.affiliate-disclosure')) {
    const notice = document.createElement('aside');
    notice.className = 'affiliate-disclosure';
    notice.setAttribute('aria-label', 'Como funcionam as compras e os serviços');
    notice.innerHTML = `
      <strong>Compra segura pelo Mercado Livre</strong>
      <span>Pagamento, entrega, troca e garantia do produto são tratados diretamente pelo Mercado Livre e pelo vendedor. A Gela Fácil apenas indica os produtos como afiliada.</span>
      <span><b>Serviço separado:</b> instalação e manutenção somente de ar-condicionado em Linhares, Sooretama, Aracruz e Rio Bananal. Não atendemos outros refrigeradores.</span>`;
    if (main.classList.contains('product-detail-container')) {
      // Na página de detalhes, o aviso precisa ficar dentro da área com
      // espaçamento próprio, abaixo da barra fixa de navegação.
      main.classList.add('has-affiliate-disclosure');
      main.prepend(notice);
    } else {
      main.parentNode.insertBefore(notice, main);
    }
  }

  const firstHeroTitle = document.querySelector('.carousel-slide:first-child h1');
  const firstHeroText = document.querySelector('.carousel-slide:first-child .hero-sub');
  if (firstHeroTitle) firstHeroTitle.innerHTML = 'Escolha seu <em>ar-condicionado</em><br>e compre pelo<br>Mercado Livre.';
  if (firstHeroText) firstHeroText.textContent = 'Compare modelos selecionados e finalize a compra com pagamento e entrega pelo Mercado Livre. Em Linhares, Sooretama, Aracruz e Rio Bananal, você também pode contratar nossa instalação e manutenção separadamente.';
  const commercialText = document.querySelector('.carousel-slide:nth-child(3) .hero-sub');
  if (commercialText) commercialText.textContent = 'Instalação, dimensionamento e manutenção de sistemas de ar-condicionado para empresas em Linhares, Sooretama, Aracruz e Rio Bananal. Fale conosco para avaliar seu projeto.';

  const statCopies = [
    ['Mercado Livre', 'Pagamento e entrega'],
    ['4 cidades', 'Atendimento no ES'],
    ['Sob consulta', 'Orçamento do serviço'],
    ['Equipe local', 'Instalação e manutenção']
  ];
  document.querySelectorAll('.stats-bar .stat-text').forEach((box, index) => {
    if (!statCopies[index]) return;
    const strong = box.querySelector('strong');
    const span = box.querySelector('span');
    if (strong) strong.textContent = statCopies[index][0];
    if (span) span.textContent = statCopies[index][1];
  });

  const catalogTitle = document.querySelector('.catalog-title');
  const catalogSubtitle = document.querySelector('.catalog-subtitle');
  if (catalogTitle) catalogTitle.textContent = 'Produtos selecionados para você';
  if (catalogSubtitle) catalogSubtitle.textContent = 'Consulte os detalhes aqui e finalize a compra diretamente no Mercado Livre. Os links de afiliado serão disponibilizados em breve.';

  await loadHomeProductsFromApi();

  document.querySelectorAll('.footer-brand > p').forEach(p => {
    p.textContent = 'Curadoria de produtos anunciados no Mercado Livre e serviços de instalação e manutenção de ar-condicionado em Linhares, Sooretama, Aracruz e Rio Bananal.';
  });
  document.querySelectorAll('.footer-contact a').forEach(link => {
    if (link.textContent.includes('Atendemos')) link.lastChild.textContent = ' Atendemos Linhares, Sooretama, Aracruz e Rio Bananal';
  });

  const bento = document.querySelector('.bento-section .bento-container');
  if (bento) {
    bento.innerHTML = `
      <div class="bento-grid">
        <div class="bento-card card-vrf">
          <a class="installation-mobile-banner" href="https://wa.me/5527999735745?text=Ol%C3%A1!%20Gostaria%20de%20um%20or%C3%A7amento%20para%20instala%C3%A7%C3%A3o%20de%20ar-condicionado." target="_blank" rel="noopener noreferrer" aria-label="Pedir orçamento de instalação de ar-condicionado pelo WhatsApp">
            <img src="assets/bento/banner-instalacao-mobile-blended.png" width="1088" height="1446" alt="Instalação profissional para o seu conforto. Atendimento em Linhares, Sooretama, Aracruz e Rio Bananal. Instalação segura, equipe especializada e mais desempenho. Pedir orçamento." loading="lazy" decoding="async">
          </a>
          <img class="home-service-image" src="assets/bento/banner-instalacao-v2.png" alt="Instalação profissional de ar-condicionado" loading="lazy" decoding="async">
          <div class="bento-card-content"><div class="bento-tag yellow-text">AR-CONDICIONADO</div><h3>Instalação profissional <span class="service-accent">para o seu conforto.</span></h3><p class="service-description">Atendimento em Linhares, Sooretama, Aracruz e Rio Bananal.</p><a class="bento-btn-sm service-banner-btn" target="_blank" rel="noopener noreferrer" href="https://wa.me/5527999735745?text=Ol%C3%A1!%20Gostaria%20de%20um%20or%C3%A7amento%20para%20instala%C3%A7%C3%A3o%20de%20ar-condicionado."><span>Pedir orçamento</span><i aria-hidden="true"><svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><path d="M5 12h14M12 5l7 7-7 7"/></svg></i></a></div>
        </div>
        <div class="bento-card card-camaras">
          <a class="maintenance-mobile-banner" href="https://wa.me/5527999735745?text=Ol%C3%A1!%20Gostaria%20de%20agendar%20manuten%C3%A7%C3%A3o%20ou%20limpeza%20de%20ar-condicionado." target="_blank" rel="noopener noreferrer" aria-label="Agendar limpeza e manutenção de ar-condicionado pelo WhatsApp">
            <img src="assets/bento/banner-manutencao-mobile-blended.png" width="1120" height="1404" alt="Limpeza e manutenção para respirar melhor. Atendimento em Linhares, Sooretama, Aracruz e Rio Bananal. Limpeza completa, equipe especializada e mais eficiência. Agendar atendimento." loading="lazy" decoding="async">
          </a>
          <img class="home-service-image" src="assets/bento/banner-manutencao-v2.png" alt="Limpeza e manutenção de ar-condicionado" loading="lazy" decoding="async">
          <div class="bento-card-content"><div class="bento-tag yellow-text">ASSISTÊNCIA TÉCNICA</div><h3>Limpeza e manutenção <span class="service-accent">para respirar melhor.</span></h3><p class="service-description">Cuide do seu ar-condicionado com atendimento em Linhares, Sooretama, Aracruz e Rio Bananal.</p><a class="bento-btn-sm service-banner-btn" target="_blank" rel="noopener noreferrer" href="https://wa.me/5527999735745?text=Ol%C3%A1!%20Gostaria%20de%20agendar%20manuten%C3%A7%C3%A3o%20ou%20limpeza%20de%20ar-condicionado."><span>Agendar atendimento</span><i aria-hidden="true"><svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><path d="M5 12h14M12 5l7 7-7 7"/></svg></i></a></div>
        </div>
      </div>`;
  }

  const relabelProductActions = root => {
    root.querySelectorAll('.view-details-btn').forEach(el => {
      if (el.textContent !== 'Ver detalhes') el.textContent = 'Ver detalhes';
    });
    root.querySelectorAll('.rating-summary, .product-rating').forEach(el => el.style.display = 'none');
    root.querySelectorAll('.btn-cart-add').forEach(btn => {
      if (btn.textContent.trim() !== '↗') btn.textContent = '↗';
      const label = 'Ver produto e consultar link do Mercado Livre';
      if (btn.getAttribute('aria-label') !== label) btn.setAttribute('aria-label', label);
    });
  };
  relabelProductActions(document);
  new MutationObserver(() => relabelProductActions(document)).observe(document.body, { childList: true, subtree: true });
});

// ── PRODUCT CARD EVENT LISTENER ADJUSTMENT ──────────────
document.addEventListener('click', (e) => {
  const card = e.target.closest('.product-card');
  if (!card) return;

  const track = card.closest('.clima-bebidas-track');
  if (track && track.getAttribute('data-dragged') === 'true') {
    setTimeout(() => track.setAttribute('data-dragged', 'false'), 50);
    return;
  }

  if (e.target.closest('.btn-cart-add')) {
    e.stopPropagation();
    openMercadoLivreProduct(card.dataset.id);
    return;
  }

  const id = card.dataset.id;
  if (!id) return;

  if (window.location.pathname.includes('/pages/')) {
    window.location.href = `./product-detail.html?id=${id}`;
  } else {
    window.location.href = `./pages/product-detail.html?id=${id}`;
  }
});

function scrollToProducts() {
  const dest = document.getElementById('produtos');
  if (dest) {
    dest.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }
}

// Helper: Format number to BRL Currency
function formatPrice(value) {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0
  }).format(value);
}

// Visual Toast feedback
function showToast(message) {
  const toast = document.createElement('div');
  toast.className = 'toast-notification';
  toast.textContent = message;
  
  document.body.appendChild(toast);
  
  setTimeout(() => {
    toast.classList.add('visible');
  }, 10);
  
  setTimeout(() => {
    toast.classList.remove('visible');
    setTimeout(() => {
      toast.remove();
    }, 400);
  }, 3500);
}

// Duplicates removed

// float code removed

// Duplicated float cart & helpers removed

// ── SMOOTH SCROLL FOR NAV LINKS ─────────────────────────
document.querySelectorAll('a[href^="#"]').forEach(a => {
  a.addEventListener('click', function(e) {
    const href = this.getAttribute('href');
    if (href === '#') return;
    
    const target = document.querySelector(href);
    if (target) {
      e.preventDefault();
      
      // Calculate navbar height offset
      const navHeight = navbar.offsetHeight || 70;
      const targetPosition = target.getBoundingClientRect().top + window.scrollY - navHeight + 5;
      
      window.scrollTo({
        top: targetPosition,
        behavior: 'smooth'
      });
    }
  });
});

// ── GENERIC SLIDER DRAG TO SCROLL & NAVIGATION ───────────
function setupSliderDragAndNav(trackId, prevBtnId, nextBtnId, clickCallback = null) {
  const track = document.getElementById(trackId);
  if (!track) return;

  let isDown = false;
  let startX;
  let scrollLeft;
  let wasDragged = false;
  let lastScrollTime = 0;

  // Track scroll momentum
  track.addEventListener('scroll', () => {
    lastScrollTime = Date.now();
  });

  track.addEventListener('mousedown', (e) => {
    isDown = true;
    track.classList.add('active-dragging');
    track.setAttribute('data-dragged', 'false');
    startX = e.pageX - track.offsetLeft;
    scrollLeft = track.scrollLeft;
    wasDragged = false;
  });

  track.addEventListener('mouseleave', () => {
    if (isDown) {
      isDown = false;
      track.classList.remove('active-dragging');
    }
  });

  track.addEventListener('mouseup', () => {
    if (isDown) {
      isDown = false;
      track.classList.remove('active-dragging');
      if (wasDragged) {
        track.setAttribute('data-dragged', 'true');
      }
    }
  });

  track.addEventListener('mousemove', (e) => {
    if (!isDown) return;
    e.preventDefault();
    const x = e.pageX - track.offsetLeft;
    const walk = (x - startX) * 1.5;
    if (Math.abs(walk) > 5) {
      wasDragged = true;
      track.setAttribute('data-dragged', 'true');
    }
    track.scrollLeft = scrollLeft - walk;
  });

  // Event delegation keeps drag protection working for cards loaded from the API.
  track.addEventListener('click', (e) => {
    const card = e.target.closest('.destaque-card, .product-card');
    if (!card || !track.contains(card)) return;
    const timeSinceScroll = Date.now() - lastScrollTime;
    if (track.getAttribute('data-dragged') === 'true' || wasDragged || timeSinceScroll < 150) {
      e.preventDefault();
      e.stopPropagation();
      return;
    }
    if (clickCallback) clickCallback(card);
  });

  // Prev / Next button navigation
  const prevBtn = document.getElementById(prevBtnId);
  const nextBtn = document.getElementById(nextBtnId);
  if (prevBtn && nextBtn) {
    prevBtn.addEventListener('click', () => {
      const cardWidth = track.firstElementChild?.offsetWidth || 300;
      const gap = parseInt(window.getComputedStyle(track).gap) || 24;
      track.scrollBy({
        left: -(cardWidth + gap),
        behavior: 'smooth'
      });
    });

    nextBtn.addEventListener('click', () => {
      const cardWidth = track.firstElementChild?.offsetWidth || 300;
      const gap = parseInt(window.getComputedStyle(track).gap) || 24;
      track.scrollBy({
        left: cardWidth + gap,
        behavior: 'smooth'
      });
    });
  }
}

function scrollToProducts() {
  const target = document.getElementById('produtos');
  if (target) {
    const navHeight = document.getElementById('navbar')?.offsetHeight || 70;
    const targetPosition = target.getBoundingClientRect().top + window.scrollY - navHeight + 5;
    window.scrollTo({
      top: targetPosition,
      behavior: 'smooth'
    });
  }
}

// Initialize remaining generic sliders
setupSliderDragAndNav('clima-bebidas-track', 'clima-bebidas-prev', 'clima-bebidas-next');

// ── DESTAQUES CAROUSEL DRAG & ARROWS ─────────────────────
function initDestaquesCarousel() {
  const track = document.getElementById('destaques-track');
  const prevBtn = document.getElementById('destaques-prev');
  const nextBtn = document.getElementById('destaques-next');
  const progressFill = document.getElementById('destaques-progress-fill');
  const counter = document.getElementById('destaques-counter');

  if (!track) return;

  const cards = Array.from(track.querySelectorAll('.destaque-card'));
  const totalCards = cards.length;
  const sliderWrap = track.closest('.destaques-slider-wrap');
  let isDown = false;
  let startX = 0;
  let startScrollLeft = 0;
  let dragged = false;
  const mobileDragQuery = window.matchMedia('(max-width: 900px)');

  const getCardStep = () => {
    const firstCard = cards[0];
    const gap = parseFloat(window.getComputedStyle(track).gap) || 18;
    return (firstCard?.offsetWidth || 280) + gap;
  };

  const updateProgress = () => {
    const maxScroll = Math.max(0, track.scrollWidth - track.clientWidth);
    const currentScroll = Math.max(0, track.scrollLeft);
    const currentIndex = Math.min(totalCards, Math.round(currentScroll / getCardStep()) + 1);

    if (progressFill) progressFill.style.width = `${Math.max(100 / totalCards, (currentIndex / totalCards) * 100)}%`;
    if (counter) counter.textContent = String(currentIndex).padStart(2, '0');
    if (prevBtn) prevBtn.disabled = currentScroll <= 2;
    if (nextBtn) nextBtn.disabled = currentScroll >= maxScroll - 2;
    if (sliderWrap) {
      sliderWrap.classList.toggle('has-scrolled', currentScroll > 8);
      sliderWrap.classList.toggle('is-at-end', currentScroll >= maxScroll - 8);
    }
  };

  const scrollOneCard = (direction) => {
    track.scrollBy({ left: direction * getCardStep(), behavior: 'smooth' });
  };

  prevBtn?.addEventListener('click', () => scrollOneCard(-1));
  nextBtn?.addEventListener('click', () => scrollOneCard(1));
  track.addEventListener('scroll', updateProgress, { passive: true });
  window.addEventListener('resize', updateProgress, { passive: true });

  track.addEventListener('mousedown', (event) => {
    if (!mobileDragQuery.matches) return;
    isDown = true;
    dragged = false;
    startX = event.pageX;
    startScrollLeft = track.scrollLeft;
    track.classList.add('is-dragging');
  });

  const releaseDrag = () => {
    isDown = false;
    track.classList.remove('is-dragging');
  };

  track.addEventListener('mouseleave', releaseDrag);
  track.addEventListener('mouseup', releaseDrag);
  track.addEventListener('mousemove', (event) => {
    if (!mobileDragQuery.matches || !isDown) return;
    const distance = event.pageX - startX;
    if (Math.abs(distance) > 5) dragged = true;
    if (dragged) event.preventDefault();
    track.scrollLeft = startScrollLeft - distance * 1.35;
  });

  cards.forEach(card => {
    card.setAttribute('tabindex', '0');
    card.setAttribute('role', 'link');
    card.addEventListener('click', (event) => {
      if (dragged) {
        event.preventDefault();
        return;
      }
      scrollToProducts();
    });
    card.addEventListener('keydown', event => {
      if (event.key === 'Enter' || event.key === ' ') {
        event.preventDefault();
        scrollToProducts();
      }
    });
  });

  updateProgress();
}

document.addEventListener('DOMContentLoaded', () => {
  updateCartCounters();
  initDestaquesCarousel();
  
  const navCartBtn = document.getElementById('nav-cart-btn');
  if (navCartBtn) {
    navCartBtn.addEventListener('click', (e) => {
      e.preventDefault();
      openCartDrawer();
    });
  }
});
