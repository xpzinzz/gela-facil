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
window.addEventListener('scroll', () => {
  if (window.scrollY > 40) {
    navbar.classList.add('scrolled');
  } else {
    navbar.classList.remove('scrolled');
  }
});

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

// ── DYNAMIC PRODUCT DETAIL MODAL & CHECKOUT ─────────────
const modal = document.getElementById('product-modal');
const modalCloseBtn = document.getElementById('modal-close-btn');
const modalOptionCards = document.querySelectorAll('.modal-option-card');
const checkoutBtn = document.getElementById('modal-checkout-btn');

// Elements inside modal to fill
const mIconContainer = document.getElementById('modal-product-icon-container');
const mBrand = document.getElementById('modal-product-brand');
const mTitle = document.getElementById('modal-product-title');
const mBasePrice = document.getElementById('modal-base-price-val');
const mSummaryProductVal = document.getElementById('summary-product-val');
const mSummaryServiceVal = document.getElementById('summary-service-val');
const mSummaryTotalVal = document.getElementById('summary-total-val');

function openProductModal(card) {
  const dataset = card.dataset;
  
  // Save current product to state
  currentProduct = {
    id: dataset.id,
    brand: dataset.brand,
    name: dataset.name,
    price: parseInt(dataset.price),
    emoji: dataset.image || 'split',
    selectedOption: 'delivery',
    selectedOptionName: 'Apenas Entrega',
    selectedOptionPrice: 0
  };
  
  // Set modal details
  const cardIconContainer = card.querySelector('.product-icon-container');
  if (cardIconContainer && mIconContainer) {
    mIconContainer.innerHTML = cardIconContainer.innerHTML;
  }
  mBrand.textContent = currentProduct.brand;
  mTitle.textContent = currentProduct.name;
  
  const formattedBase = formatPrice(currentProduct.price);
  mBasePrice.textContent = formattedBase;
  mSummaryProductVal.textContent = formattedBase;
  
  // Reset selected options UI
  modalOptionCards.forEach(card => card.classList.remove('selected'));
  const defaultOptionCard = document.querySelector('.modal-option-card[data-option="delivery"]');
  if (defaultOptionCard) defaultOptionCard.classList.add('selected');
  
  updateModalTotals();
  
  // Open modal
  modal.classList.add('active');
  document.body.style.overflow = 'hidden'; // block page scroll when modal is open
}

function updateModalTotals() {
  if (!currentProduct) return;
  
  const totalVal = currentProduct.price + currentProduct.selectedOptionPrice;
  
  mSummaryServiceVal.textContent = currentProduct.selectedOptionPrice === 0 
    ? 'Grátis' 
    : `+ ${formatPrice(currentProduct.selectedOptionPrice)}`;
    
  mSummaryTotalVal.textContent = formatPrice(totalVal);
}

// Option selector clicks
modalOptionCards.forEach(optionCard => {
  optionCard.addEventListener('click', () => {
    modalOptionCards.forEach(c => c.classList.remove('selected'));
    optionCard.classList.add('selected');
    
    if (currentProduct) {
      currentProduct.selectedOption = optionCard.getAttribute('data-option');
      currentProduct.selectedOptionPrice = parseInt(optionCard.getAttribute('data-extra'));
      currentProduct.selectedOptionName = optionCard.querySelector('.option-title').textContent;
      
      updateModalTotals();
    }
  });
});

// Close modal handlers
function closeModal() {
  modal.classList.remove('active');
  document.body.style.overflow = ''; // restore scroll
}

if (modalCloseBtn) {
  modalCloseBtn.addEventListener('click', closeModal);
}

// Close when clicking outside card
window.addEventListener('click', (e) => {
  if (e.target === modal) {
    closeModal();
  }
});

// WhatsApp Checkout Click
if (checkoutBtn) {
  checkoutBtn.addEventListener('click', () => {
    if (!currentProduct) return;
    
    const totalVal = currentProduct.price + currentProduct.selectedOptionPrice;
    
    // Construct message template
    const message = `Olá Gela Fácil! Gostaria de fazer o pedido do seguinte aparelho:

*Aparelho:* ${currentProduct.name}
*Marca:* ${currentProduct.brand}
*Opção de Serviço:* ${currentProduct.selectedOptionName}
*Valor Total Estimado:* ${formatPrice(totalVal)}

Por favor, me confirme a disponibilidade de entrega e a data para instalação.`;

    const encodedMsg = encodeURIComponent(message);
    const whatsappUrl = `https://wa.me/5527999999999?text=${encodedMsg}`;
    
    window.open(whatsappUrl, '_blank');
  });
};

// Click listener on product card to open details modal
productCards.forEach(card => {
  card.addEventListener('click', (e) => {
    // Prevent modal if parent track was dragged
    const track = card.closest('.clima-bebidas-track');
    if (track && track.getAttribute('data-dragged') === 'true') {
      // Reset after click event finishes
      setTimeout(() => track.setAttribute('data-dragged', 'false'), 50);
      return;
    }

    // If user clicked on the Quick Cart button "+", don't open the modal!
    if (e.target.classList.contains('btn-cart-add')) {
      return;
    }
    openProductModal(card);
  });
});

// ── FLOATING CART & QUICK ADD ───────────────────────────
const cartBtn = document.getElementById('cart-float-btn');
const cartCountSpan = document.querySelector('.cart-float-count');
const quickAddBtns = document.querySelectorAll('.btn-cart-add');

quickAddBtns.forEach(btn => {
  btn.addEventListener('click', (e) => {
    e.stopPropagation(); // prevent modal opening
    
    cartCount++;
    if (cartCountSpan) cartCountSpan.textContent = cartCount;
    
    // Highlight animation on cart button
    if (cartBtn) {
      cartBtn.style.transform = 'scale(1.25)';
      setTimeout(() => {
        cartBtn.style.transform = 'scale(1)';
      }, 300);
    }
    
    // Simple visual toast confirmation
    const card = btn.closest('.product-card');
    const productName = card ? card.getAttribute('data-name') : 'Ar-condicionado';
    showToast(`${productName} adicionado ao carrinho!`);
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
  // Create toast element
  const toast = document.createElement('div');
  toast.className = 'toast-notification';
  toast.textContent = message;
  
  document.body.appendChild(toast);
  
  // Fade in, wait, fade out, then remove
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
});
