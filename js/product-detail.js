// ── STANDALONE PRODUCT DETAIL CONTROLLER ──

// State variables specific to this details page
let detailProduct = null;
let currentRatingSelection = 5;

// Helper to adjust relative image paths when running on a subfolder page
function adjustImagePath(path) {
  if (!path) return '';
  if (path.startsWith('http') || path.startsWith('/') || path.startsWith('..')) {
    return path;
  }
  return '../' + path;
}

function specsTextToDetailObject(specs) {
  return String(specs || '')
    .split(',')
    .map(item => item.trim())
    .filter(Boolean)
    .reduce((acc, value, index) => {
      acc[`Info ${index + 1}`] = value;
      return acc;
    }, {});
}

function normalizeApiDetailProduct(product) {
  const image = product.image || 'assets/produtos/banner-climatizacao-premium.png';
  return {
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
    specs: specsTextToDetailObject(product.specs),
    reviews: []
  };
}

async function loadDetailProductFromApi(id) {
  if (!window.location.protocol.startsWith('http')) return null;

  try {
    const response = await fetch(`/api/products/${encodeURIComponent(id)}`);
    if (!response.ok) return null;
    return normalizeApiDetailProduct(await response.json());
  } catch {
    return null;
  }
}

document.addEventListener('DOMContentLoaded', async () => {
  // Parse ID from URL
  const params = new URLSearchParams(window.location.search);
  const id = params.get('id');
  if (!id) {
    window.location.href = '../index.html';
    return;
  }

  detailProduct = await loadDetailProductFromApi(id);
  
  if (!detailProduct) {
    showToast('Produto não encontrado. Redirecionando para a página principal...');
    setTimeout(() => {
      window.location.href = '../index.html';
    }, 2000);
    return;
  }
  
  // Set global currentProduct state for cart actions
  currentProduct = {
    id: id,
    brand: detailProduct.brand,
    name: detailProduct.name,
    price: detailProduct.price,
    image: detailProduct.image,
    affiliateUrl: detailProduct.affiliateUrl || '',
    selectedOption: 'delivery',
    selectedOptionName: 'Apenas Entrega',
    selectedOptionPrice: 0
  };

  const isAirConditioner = detailProduct.category !== 'bebidas' && !String(id).startsWith('b');
  const servicesBox = document.querySelector('.services-container-box');
  if (servicesBox) {
    servicesBox.innerHTML = isAirConditioner ? `
      <div class="services-section-title">Serviços Gela Fácil (contratação separada):</div>
      <p>Instalação e manutenção de ar-condicionado em Linhares-ES e região. Solicite avaliação e orçamento pelo WhatsApp.</p>
      <a class="btn-primary" target="_blank" rel="noopener noreferrer" href="https://wa.me/5527999735745?text=Ol%C3%A1!%20Vi%20um%20ar-condicionado%20no%20site%20e%20gostaria%20de%20um%20or%C3%A7amento%20de%20instala%C3%A7%C3%A3o%20ou%20manuten%C3%A7%C3%A3o.">Pedir orçamento de serviço</a>` : `
      <div class="services-section-title">Importante sobre este produto</div>
      <p>A Gela Fácil não oferece instalação nem manutenção para geladeiras, frigobares, cervejeiras ou outros refrigeradores. Compra, entrega e demais responsabilidades ficam com o Mercado Livre e o vendedor.</p>`;
  }
  
  // Populate basic text details
  document.getElementById('modal-product-brand').textContent = detailProduct.brand;
  document.getElementById('modal-product-title').textContent = detailProduct.name;
  document.getElementById('product-detail-desc').textContent = detailProduct.desc;
  
  // Format prices
  const formattedPrice = formatPrice(detailProduct.price);
  document.getElementById('original-price-val').textContent = formattedPrice;
  document.getElementById('summary-product-val').textContent = formattedPrice;
  
  const installmentVal = Math.round(detailProduct.price / 10);
  document.getElementById('installments-preview-txt').textContent = `ou em até 10x sem juros de ${formatPrice(installmentVal)} no cartão`;
  
  // Populate Rating Summary
  detailProduct.rating = Number(detailProduct.rating || 5);
  detailProduct.ratingCount = Number(detailProduct.ratingCount || 0);
  const starsString = '★'.repeat(Math.round(detailProduct.rating)) + '☆'.repeat(5 - Math.round(detailProduct.rating));
  document.getElementById('product-stars').textContent = starsString;
  document.getElementById('product-rating-text').textContent = `${detailProduct.rating.toFixed(1)} (${detailProduct.ratingCount} avaliações)`;
  
  // Render main image
  const imgContainer = document.getElementById('detail-img-container');
  const mainImage = document.createElement('img');
  mainImage.id = 'main-product-image';
  mainImage.src = adjustImagePath(detailProduct.image);
  mainImage.alt = detailProduct.name;
  imgContainer.replaceChildren(mainImage);
  
  // Render thumbnails
  renderThumbnails();
  
  // Render specifications
  renderSpecs();
  
  // Render reviews
  const reviewsTab = document.querySelector("[onclick=\"switchTab('reviews')\"]");
  if (reviewsTab) reviewsTab.style.display = 'none';
  
  // Services are quoted separately and are never added to the product price.
  
  // Setup review star selection clicks
  setupReviewStarSelection();
  
  // Add Event Listeners to Buttons
  const cartAddBtn = document.getElementById('modal-cart-add-btn');
  if (cartAddBtn) {
    cartAddBtn.style.display = 'none';
    cartAddBtn.addEventListener('click', () => {
      addToCart(
        currentProduct.id,
        currentProduct.name,
        currentProduct.brand,
        currentProduct.price,
        currentProduct.image,
        currentProduct.selectedOption,
        currentProduct.selectedOptionName,
        currentProduct.selectedOptionPrice,
        1
      );
      openCartDrawer();
    });
  }
  
  const buyNowBtn = document.getElementById('modal-buy-now-btn');
  if (buyNowBtn) {
    buyNowBtn.textContent = 'Ver no Mercado Livre';
    buyNowBtn.addEventListener('click', () => {
      openMercadoLivreProduct(currentProduct.id, currentProduct.affiliateUrl);
    });
  }

  const summaryBox = document.querySelector('.detail-summary-box');
  if (summaryBox) {
    summaryBox.innerHTML = '<strong>Valor anunciado no Mercado Livre</strong><p style="margin:8px 0 0">O preço, parcelamento, disponibilidade e frete devem ser confirmados no anúncio. Serviços da Gela Fácil não estão incluídos.</p>';
  }
  
  // Recalculate totals
  // No local checkout or combined product/service total in affiliate mode.
});

// Render dynamic thumbnails
function renderThumbnails() {
  const row = document.getElementById('thumbnails-row');
  if (!row) return;
  row.innerHTML = '';
  
  const images = detailProduct.gallery || [detailProduct.image];
  
  images.forEach((img, idx) => {
    const btn = document.createElement('button');
    btn.className = `thumb-btn ${idx === 0 ? 'active' : ''}`;
    const thumbnail = document.createElement('img');
    thumbnail.src = adjustImagePath(img);
    thumbnail.alt = `Foto ${idx + 1}`;
    btn.appendChild(thumbnail);
    btn.onclick = () => {
      document.querySelectorAll('.thumb-btn').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      document.getElementById('main-product-image').src = adjustImagePath(img);
    };
    row.appendChild(btn);
  });
}

// Render specs table
function renderSpecs() {
  const grid = document.getElementById('detail-specs-grid');
  if (!grid) return;
  grid.innerHTML = '';
  
  const specs = detailProduct.specs || {};
  for (const [key, value] of Object.entries(specs)) {
    const row = document.createElement('div');
    row.className = 'spec-row';
    const label = document.createElement('span');
    label.className = 'spec-label';
    label.textContent = key;
    const detail = document.createElement('span');
    detail.className = 'spec-val';
    detail.textContent = value;
    row.append(label, detail);
    grid.appendChild(row);
  }
}

// Render dynamic user reviews
function renderReviews() {
  const list = document.getElementById('reviews-list');
  const scoreVal = document.getElementById('average-score-val');
  const starsRow = document.getElementById('average-stars-row');
  const totalText = document.getElementById('average-total-text');
  
  if (!list) return;
  list.innerHTML = '';
  
  // Update general score card
  if (scoreVal) scoreVal.textContent = detailProduct.rating.toFixed(1);
  if (starsRow) starsRow.textContent = '★'.repeat(Math.round(detailProduct.rating)) + '☆'.repeat(5 - Math.round(detailProduct.rating));
  if (totalText) totalText.textContent = `Baseado em ${detailProduct.ratingCount} avaliações`;
  
  const reviews = detailProduct.reviews || [];
  if (reviews.length === 0) {
    list.innerHTML = '<p style="color: rgba(255,255,255,0.4); text-align: center; padding: 20px 0;">Este produto ainda não possui avaliações. Seja o primeiro a avaliar!</p>';
    return;
  }
  
  reviews.forEach(rev => {
    const card = document.createElement('div');
    card.className = 'review-card';
    card.innerHTML = `
      <div class="review-card-header">
        <div class="reviewer-name">
          ${rev.author}
          <span class="verified-badge">Compra Verificada</span>
        </div>
        <div class="stars">${'★'.repeat(rev.stars)}${'☆'.repeat(5 - rev.stars)}</div>
      </div>
      <div class="review-date">Avaliado em ${rev.date}</div>
      <div class="review-comment" style="margin-top: 8px;">${rev.comment}</div>
    `;
    list.appendChild(card);
  });
}

// Setup additional service selectors
function setupServices() {
  const cards = document.querySelectorAll('.service-card');
  cards.forEach(card => {
    card.addEventListener('click', () => {
      cards.forEach(c => c.classList.remove('selected'));
      card.classList.add('selected');
      
      if (currentProduct) {
        currentProduct.selectedOption = card.getAttribute('data-option');
        currentProduct.selectedOptionPrice = parseInt(card.getAttribute('data-extra'));
        currentProduct.selectedOptionName = card.querySelector('.service-title').textContent;
        
        updateDetailTotals();
      }
    });
  });
}

// Update calculated totals box
function updateDetailTotals() {
  if (!currentProduct) return;
  
  const total = currentProduct.price + currentProduct.selectedOptionPrice;
  
  document.getElementById('summary-service-val').textContent = currentProduct.selectedOptionPrice === 0 
    ? 'Grátis' 
    : `+ ${formatPrice(currentProduct.selectedOptionPrice)}`;
    
  document.getElementById('summary-total-val').textContent = formatPrice(total);
  
  const installmentPrice = Math.round(total / 10);
  document.getElementById('summary-installments').textContent = `ou em até 10x sem juros de ${formatPrice(installmentPrice)} no cartão`;
}

// Tab switcher (specs vs reviews)
window.switchTab = function(tabName) {
  document.querySelectorAll('.tab-nav-btn').forEach(btn => btn.classList.remove('active'));
  document.querySelectorAll('.tab-content').forEach(content => content.classList.remove('active'));
  
  const activeBtn = Array.from(document.querySelectorAll('.tab-nav-btn')).find(btn => btn.textContent.toLowerCase().includes(tabName === 'specs' ? 'técnicas' : 'avaliações'));
  if (activeBtn) activeBtn.classList.add('active');
  
  const activeContent = document.getElementById(`tab-${tabName}`);
  if (activeContent) activeContent.classList.add('active');
};

// Stars selection on form
function setupReviewStarSelection() {
  const stars = document.querySelectorAll('.rating-star-option');
  stars.forEach(star => {
    star.addEventListener('click', () => {
      const selectedVal = parseInt(star.getAttribute('data-star'));
      currentRatingSelection = selectedVal;
      
      stars.forEach(s => {
        const val = parseInt(s.getAttribute('data-star'));
        if (val <= selectedVal) {
          s.classList.add('active');
        } else {
          s.classList.remove('active');
        }
      });
    });
  });
}

// Handle review submit
window.handleReviewSubmit = function(e) {
  e.preventDefault();
  
  const authorInput = document.getElementById('review-author');
  const commentInput = document.getElementById('review-comment');
  
  if (!authorInput.value || !commentInput.value) return;
  
  const today = new Date();
  const dateFormatted = `${String(today.getDate()).padStart(2, '0')}/${String(today.getMonth() + 1).padStart(2, '0')}/${today.getFullYear()}`;
  
  const newReview = {
    author: authorInput.value,
    stars: currentRatingSelection,
    date: dateFormatted,
    comment: commentInput.value
  };
  
  // Prepend to product reviews array
  if (!detailProduct.reviews) detailProduct.reviews = [];
  detailProduct.reviews.unshift(newReview);
  
  // Update rating score math
  detailProduct.ratingCount++;
  const ratingSum = detailProduct.reviews.reduce((acc, rev) => acc + rev.stars, 0);
  detailProduct.rating = ratingSum / detailProduct.reviews.length;
  
  // Re-render
  renderReviews();
  
  // Reset form
  authorInput.value = '';
  document.getElementById('review-email').value = '';
  commentInput.value = '';
  
  // Highlight stars back to 5
  document.querySelectorAll('.rating-star-option').forEach(s => s.classList.add('active'));
  currentRatingSelection = 5;
  
  showToast('Avaliação enviada com sucesso! Obrigado pelo feedback.');
};
