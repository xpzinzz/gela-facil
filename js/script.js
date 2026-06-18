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
  slides.forEach(slide => slide.classList.remove('active'));
  dots.forEach(dot => dot.classList.remove('active'));
  
  // Wrap index
  slideIndex = (n + slides.length) % slides.length;
  
  slides[slideIndex].classList.add('active');
  if (dots[slideIndex]) dots[slideIndex].classList.add('active');
}

function nextSlide() {
  showSlide(slideIndex + 1);
}

function prevSlide() {
  showSlide(slideIndex - 1);
}

function startCarouselAutoplay() {
  carouselInterval = setInterval(nextSlide, 7000); // changes slide every 7 seconds
}

function stopCarouselAutoplay() {
  clearInterval(carouselInterval);
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

// Initialize Carousel Autoplay
startCarouselAutoplay();

// ── PRODUCT CATALOG FILTERS ─────────────────────────────
const filterTabs = document.querySelectorAll('.filter-tab');
const productCards = document.querySelectorAll('.product-card');

filterTabs.forEach(tab => {
  tab.addEventListener('click', () => {
    // Toggle active class on tabs
    filterTabs.forEach(t => t.classList.remove('active'));
    tab.classList.add('active');
    
    const filterValue = tab.getAttribute('data-filter');
    
    // Filter cards
    productCards.forEach(card => {
      const categories = card.getAttribute('data-category').split(' ');
      if (filterValue === 'all' || categories.includes(filterValue)) {
        card.style.display = 'flex';
        // Add a micro animation class
        card.style.animation = 'fadeInCard 0.4s ease forwards';
      } else {
        card.style.display = 'none';
      }
    });
  });
});

// ── PRODUCT DETAILS DATABASE ────────────────────────────
const productDetailsDb = {
  "1": {
    name: "WindFree Inverter 12.000 BTU",
    brand: "Samsung",
    price: 2399,
    image: "assets/produtos/samsung_windfree.png",
    rating: 5.0,
    ratingCount: 34,
    gallery: [
      "assets/produtos/samsung_windfree.png",
      "assets/produtos/seção-slipt.png"
    ],
    desc: "O ar-condicionado Samsung WindFree proporciona um resfriamento suave sem vento direto, mantendo o ambiente confortavelmente frio sem correntes de ar frio incômodas. Economiza até 77% de energia em comparação com modelos tradicionais através da tecnologia Digital Inverter Ultra.",
    specs: {
      "Voltagem": "220V",
      "Selo Procel": "A+++",
      "Gás Ecológico": "R-32",
      "Garantia": "10 anos (compressor)",
      "Capacidade": "12.000 BTUs",
      "Tecnologia": "WindFree Inverter"
    },
    reviews: [
      { author: "Carlos Eduardo", stars: 5, date: "14/05/2026", comment: "Excelente ar-condicionado. A tecnologia WindFree realmente funciona e não gera vento direto na cama. Muito silencioso!" },
      { author: "Ana Beatriz", stars: 5, date: "28/04/2026", comment: "Economia de energia perceptível na primeira conta. O app SmartThings ajuda muito a controlar pelo celular." }
    ]
  },
  "2": {
    name: "DUAL Inverter Voice 9.000 BTU",
    brand: "LG",
    price: 1999,
    image: "assets/produtos/lg_dual_inverter.png",
    rating: 4.8,
    ratingCount: 42,
    gallery: [
      "assets/produtos/lg_dual_inverter.png",
      "assets/produtos/seção-slipt.png"
    ],
    desc: "O LG DUAL Inverter Voice garante até 70% de economia de energia e refrigeração até 40% mais rápida. Com controle de voz via Google Assistente e Alexa, você comanda o clima de qualquer lugar. Super silencioso, ideal para quartos e escritórios.",
    specs: {
      "Voltagem": "220V",
      "Selo Procel": "A",
      "Gás Ecológico": "R-410A",
      "Garantia": "10 anos (compressor)",
      "Capacidade": "9.000 BTUs",
      "Tecnologia": "Dual Inverter"
    },
    reviews: [
      { author: "Juliano Lima", stars: 5, date: "03/05/2026", comment: "Muito silencioso e conecta perfeitamente na Alexa. Recomendo bastante." },
      { author: "Mariana Silva", stars: 4, date: "15/04/2026", comment: "Esfria rápido demais. Só achei o controle remoto simples, mas pelo app é excelente." }
    ]
  },
  "3": {
    name: "Xtreme Save Inverter 18.000 BTU",
    brand: "Midea",
    price: 3299,
    image: "assets/produtos/midea_xtreme_save.png",
    rating: 4.9,
    ratingCount: 28,
    gallery: [
      "assets/produtos/midea_xtreme_save.png",
      "assets/produtos/seção-slipt.png"
    ],
    desc: "O split Midea Xtreme Save traz excelente eficiência energética com a tecnologia Inverter. Possui filtro com tripla filtragem que elimina até 99.9% dos vírus e bactérias do ar, mantendo sua família protegida e o ar sempre puro.",
    specs: {
      "Voltagem": "220V",
      "Selo Procel": "A++",
      "Gás Ecológico": "R-410A",
      "Garantia": "2 anos (compressor)",
      "Capacidade": "18.000 BTUs",
      "Tecnologia": "Inverter"
    },
    reviews: [
      { author: "Rodrigo Assis", stars: 5, date: "11/05/2026", comment: "Instalado na minha sala de 25m² e dá conta perfeitamente. Fluxo de ar bem distribuído." }
    ]
  },
  "4": {
    name: "Eco Inverter Plus 24.000 BTU",
    brand: "Elgin",
    price: 4199,
    image: "assets/produtos/elgin_eco_inverter.png",
    rating: 4.7,
    ratingCount: 19,
    gallery: [
      "assets/produtos/elgin_eco_inverter.png",
      "assets/produtos/seção-slipt.png"
    ],
    desc: "Ideal para grandes ambientes comerciais ou residenciais, o Elgin Eco Inverter Plus oferece refrigeração e aquecimento eficientes. Tem baixo nível de ruído e utiliza gás ecológico que não agride a camada de ozônio.",
    specs: {
      "Voltagem": "220V",
      "Selo Procel": "A",
      "Gás Ecológico": "R-410A",
      "Garantia": "3 anos (compressor)",
      "Capacidade": "24.000 BTUs",
      "Tecnologia": "Eco Inverter"
    },
    reviews: [
      { author: "Fernando G.", stars: 5, date: "02/05/2026", comment: "Excelente robustez, fluxo de vento muito forte. Excelente para comércios." }
    ]
  },
  "5": {
    name: "Springer Silentia de Janela 7.500 BTU",
    brand: "Springer Midea",
    price: 1499,
    image: "assets/produtos/springer_silentia.png",
    rating: 4.6,
    ratingCount: 31,
    gallery: [
      "assets/produtos/springer_silentia.png"
    ],
    desc: "O Springer Silentia une simplicidade e eficiência para pequenos ambientes. Possui operação silenciosa, design discreto e excelente fluxo de ar direcionável, garantindo um ambiente fresco rapidamente.",
    specs: {
      "Voltagem": "110V / 220V",
      "Selo Procel": "A",
      "Gás Ecológico": "R-410A",
      "Garantia": "1 ano",
      "Capacidade": "7.500 BTUs",
      "Tecnologia": "Convencional Split"
    },
    reviews: [
      { author: "Pedro Henrique", stars: 4, date: "09/04/2026", comment: "Ar de janela clássico e eficiente. O ruído é bem menor que os antigos." }
    ]
  },
  "6": {
    name: "Portátil Philco 12.000 BTU",
    brand: "Philco",
    price: 2799,
    image: "assets/produtos/philco_portable.png",
    rating: 4.5,
    ratingCount: 25,
    gallery: [
      "assets/produtos/philco_portable.png"
    ],
    desc: "O Ar Condicionado Portátil Philco é ideal para quem não quer ou não pode quebrar a parede. Com rodinhas de fácil transporte, ele refrigera rapidamente qualquer cômodo da casa. Possui funções de ventilação, desumidificação e controle remoto prático.",
    specs: {
      "Voltagem": "110V",
      "Selo Procel": "A",
      "Gás Ecológico": "R-410A",
      "Garantia": "1 ano",
      "Capacidade": "12.000 BTUs",
      "Tecnologia": "Portátil"
    },
    reviews: [
      { author: "Aline Costa", stars: 4, date: "23/04/2026", comment: "Prático, levo para o quarto e para a sala. Precisa colocar o duto na janela, mas esfria muito bem." }
    ]
  },
  "b1": {
    name: "Frigobar Efficient 122L",
    brand: "Electrolux",
    price: 1299,
    image: "assets/clima-bebidas/electrolux_frigobar.png",
    rating: 4.8,
    ratingCount: 38,
    gallery: [
      "assets/clima-bebidas/electrolux_frigobar.png",
      "assets/clima-bebidas/seção-de-cards-da-ultima-seção.png"
    ],
    desc: "Compacto, elegante e super eficiente. O Frigobar Electrolux 122L possui prateleiras reguláveis e compartimento para latas e garrafas grandes, mantendo suas bebidas geladas com o menor consumo de energia da categoria.",
    specs: {
      "Voltagem": "110V",
      "Selo Procel": "A+++",
      "Capacidade": "122 Litros",
      "Garantia": "1 ano",
      "Cor": "Branco",
      "Tipo": "Frigobar Efficient"
    },
    reviews: [
      { author: "Marcos V.", stars: 5, date: "29/04/2026", comment: "Excelente espaço interno para latinhas e petiscos. Silencioso para deixar no quarto." }
    ]
  },
  "b2": {
    name: "Cervejeira Digital Premium 100L",
    brand: "Electrolux",
    price: 2499,
    image: "assets/clima-bebidas/electrolux_cervejeira.png",
    rating: 4.9,
    ratingCount: 47,
    gallery: [
      "assets/clima-bebidas/electrolux_cervejeira.png",
      "assets/clima-bebidas/seção-de-cards-da-ultima-seção.png"
    ],
    desc: "A cerveja no ponto ideal para receber os amigos! Com controle de temperatura digital de -5°C a 10°C, porta de vidro triplo anti-embaçante e iluminação em LED interna. Design Home Bar premium.",
    specs: {
      "Voltagem": "110V",
      "Selo Procel": "A",
      "Capacidade": "100 Litros",
      "Garantia": "1 ano",
      "Degelo": "Frost Free",
      "Tipo": "Cervejeira Digital"
    },
    reviews: [
      { author: "Tiago Schultz", stars: 5, date: "04/05/2026", comment: "Gela super rápido e fica linda na área gourmet. Temperatura de -5 graus deixa a cerveja trincando!" }
    ]
  },
  "b3": {
    name: "Cervejeira Blue Light 102L",
    brand: "Venax",
    price: 2299,
    image: "assets/clima-bebidas/venax_cervejeira.png",
    rating: 4.8,
    ratingCount: 16,
    gallery: [
      "assets/clima-bebidas/venax_cervejeira.png",
      "assets/clima-bebidas/seção-de-cards-da-ultima-seção.png"
    ],
    desc: "Destaque visual incomparável com a iluminação interna Blue Light. A cervejeira Venax possui regulador eletrônico de temperatura, porta de vidro com moldura preta e prateleiras reguláveis de alta resistência.",
    specs: {
      "Voltagem": "220V",
      "Selo Procel": "A",
      "Capacidade": "102 Litros",
      "Garantia": "1 ano",
      "Iluminação": "LED Blue Light",
      "Tipo": "Cervejeira Exclusiva"
    },
    reviews: [
      { author: "Maurício L.", stars: 5, date: "19/04/2026", comment: "O design com LED azul chama muita atenção. Espaço excelente." }
    ]
  },
  "b4": {
    name: "Torre de Chopp Home Bar 100L",
    brand: "Electrolux",
    price: 3999,
    image: "assets/clima-bebidas/electrolux_chopp.png",
    rating: 5.0,
    ratingCount: 12,
    gallery: [
      "assets/clima-bebidas/electrolux_chopp.png",
      "assets/clima-bebidas/seção-de-cards-da-ultima-seção.png"
    ],
    desc: "O ápice do churrasco em casa. Esta cervejeira inovadora integra uma torre de chopp na parte superior, permitindo extrair chopp gelado diretamente do barril instalado dentro do gabinete de 100L. Praticidade extrema.",
    specs: {
      "Voltagem": "110V",
      "Selo Procel": "A",
      "Capacidade": "100L + Chopeira",
      "Garantia": "1 ano",
      "Degelo": "Frost Free",
      "Tipo": "Torre de Chopp"
    },
    reviews: [
      { author: "Gabriel N.", stars: 5, date: "01/05/2026", comment: "Melhor aquisição que fiz. Chopp gelado e cremoso na hora, sem complicação." }
    ]
  }
};

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

// ── CHECKOUT & PAYMENT LOGIC ────────────────────────────
window.goToCheckout = function() {
  closeCartDrawer();
  if (window.location.pathname.includes('/pages/')) {
    window.location.href = './payment.html';
  } else {
    window.location.href = './pages/payment.html';
  }
};

// ── PRODUCT CARD EVENT LISTENER ADJUSTMENT ──────────────
productCards.forEach(card => {
  card.addEventListener('click', (e) => {
    // Prevent redirect if parent track was dragged
    const track = card.closest('.clima-bebidas-track');
    if (track && track.getAttribute('data-dragged') === 'true') {
      setTimeout(() => track.setAttribute('data-dragged', 'false'), 50);
      return;
    }

    // If user clicked on the Quick Cart button "+", don't open details page
    if (e.target.closest('.btn-cart-add')) {
      return;
    }
    const id = card.dataset.id;
    if (window.location.pathname.includes('/pages/')) {
      window.location.href = `./product-detail.html?id=${id}`;
    } else {
      window.location.href = `./pages/product-detail.html?id=${id}`;
    }
  });
});

// Quick Add button click listener
const quickAddBtns = document.querySelectorAll('.btn-cart-add');
quickAddBtns.forEach(btn => {
  btn.addEventListener('click', (e) => {
    e.stopPropagation(); // prevent modal opening
    const card = btn.closest('.product-card');
    if (!card) return;
    const dataset = card.dataset;
    
    addToCart(
      dataset.id,
      dataset.name,
      dataset.brand,
      parseInt(dataset.price),
      dataset.image || 'split',
      'delivery',
      'Apenas Entrega',
      0,
      1
    );
  });
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

  // Tap/Click handling on children (prevent actions when dragged)
  const childCards = track.querySelectorAll('.destaque-card, .product-card');
  childCards.forEach(card => {
    card.addEventListener('click', (e) => {
      const timeSinceScroll = Date.now() - lastScrollTime;
      // If we dragged, or scroll momentum is running, prevent event
      if (track.getAttribute('data-dragged') === 'true' || wasDragged || timeSinceScroll < 150) {
        e.preventDefault();
        e.stopPropagation();
        return;
      }
      if (clickCallback) {
        clickCallback(card);
      }
    });
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

// Initialize sliders
setupSliderDragAndNav('destaques-track', 'destaques-prev', 'destaques-next', () => {
  scrollToProducts();
});

setupSliderDragAndNav('clima-bebidas-track', 'clima-bebidas-prev', 'clima-bebidas-next');

// ── BEBIDAS COUNTDOWN TIMER ──────────────────────────────
function startCountdown() {
  const hoursEl = document.getElementById('timer-hours');
  const minutesEl = document.getElementById('timer-minutes');
  const secondsEl = document.getElementById('timer-seconds');
  
  if (!hoursEl || !minutesEl || !secondsEl) return;
  
  let totalSeconds = localStorage.getItem('clima_countdown_seconds');
  if (totalSeconds === null || totalSeconds <= 0) {
    totalSeconds = 2 * 3600 + 33 * 60 + 23; // 2h 33m 23s
  } else {
    totalSeconds = parseInt(totalSeconds);
  }

  function updateTimer() {
    if (totalSeconds <= 0) {
      totalSeconds = 3 * 3600; // Reset to 3 hours
    }
    
    totalSeconds--;
    localStorage.setItem('clima_countdown_seconds', totalSeconds);
    
    const h = Math.floor(totalSeconds / 3600);
    const m = Math.floor((totalSeconds % 3600) / 60);
    const s = totalSeconds % 60;
    
    hoursEl.textContent = String(h).padStart(2, '0');
    minutesEl.textContent = String(m).padStart(2, '0');
    secondsEl.textContent = String(s).padStart(2, '0');
  }
  
  updateTimer();
  setInterval(updateTimer, 1000);
}

document.addEventListener('DOMContentLoaded', () => {
  startCountdown();
  updateCartCounters();
  
  const navCartBtn = document.getElementById('nav-cart-btn');
  if (navCartBtn) {
    navCartBtn.addEventListener('click', (e) => {
      e.preventDefault();
      openCartDrawer();
    });
  }
});
