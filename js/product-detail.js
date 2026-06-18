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

document.addEventListener('DOMContentLoaded', () => {
  // Parse ID from URL
  const params = new URLSearchParams(window.location.search);
  const id = params.get('id') || '1';
  
  detailProduct = productDetailsDb[id];
  
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
    selectedOption: 'delivery',
    selectedOptionName: 'Apenas Entrega',
    selectedOptionPrice: 0
  };
  
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
  const starsString = '★'.repeat(Math.round(detailProduct.rating)) + '☆'.repeat(5 - Math.round(detailProduct.rating));
  document.getElementById('product-stars').textContent = starsString;
  document.getElementById('product-rating-text').textContent = `${detailProduct.rating.toFixed(1)} (${detailProduct.ratingCount} avaliações)`;
  
  // Render main image
  const imgContainer = document.getElementById('detail-img-container');
  imgContainer.innerHTML = `<img id="main-product-image" src="${adjustImagePath(detailProduct.image)}" alt="${detailProduct.name}">`;
  
  // Render thumbnails
  renderThumbnails();
  
  // Render specifications
  renderSpecs();
  
  // Render reviews
  renderReviews();
  
  // Setup additional services cards click listeners
  setupServices();
  
  // Setup review star selection clicks
  setupReviewStarSelection();
  
  // Add Event Listeners to Buttons
  const cartAddBtn = document.getElementById('modal-cart-add-btn');
  if (cartAddBtn) {
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
    buyNowBtn.addEventListener('click', () => {
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
      goToCheckout();
    });
  }
  
  // Recalculate totals
  updateDetailTotals();
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
    btn.innerHTML = `<img src="${adjustImagePath(img)}" alt="Foto ${idx + 1}">`;
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
    row.innerHTML = `
      <span class="spec-label">${key}</span>
      <span class="spec-val">${value}</span>
    `;
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
