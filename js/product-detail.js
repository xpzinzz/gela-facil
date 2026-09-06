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
  
  detailProduct = Object.hasOwn(productDetailsDb, id) ? productDetailsDb[id] : null;
  
  if (!detailProduct) {
    document.title = 'Produto não encontrado | Gela Fácil';
    document.querySelector('main').innerHTML = '<h1>Produto não encontrado</h1><p>Este produto não está no catálogo.</p><a class="btn-primary" href="products.html">Ver todos os produtos</a>';
    document.querySelector('.extra-details-section')?.remove();
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

  const servicesBox = document.querySelector('.services-container-box');
  if (servicesBox) {
    servicesBox.innerHTML = `
      <div class="services-section-title">Serviços Gela Fácil (contratação separada):</div>
      <p>Venda, instalação, manutenção e higienização de ar-condicionado, geladeira e freezer. Base em Bebedouro, Linhares–ES, com atendimento também em outras cidades. Consulte a disponibilidade para sua cidade.</p>
      <p>Solicite avaliação e orçamento pelo WhatsApp. Os serviços são contratados separadamente da compra pelo Mercado Livre.</p>
      <a class="btn-primary" target="_blank" rel="noopener noreferrer" href="https://wa.me/5527999735745?text=Ol%C3%A1!%20Gostaria%20de%20um%20or%C3%A7amento%20de%20venda%2C%20instala%C3%A7%C3%A3o%2C%20manuten%C3%A7%C3%A3o%20ou%20higieniza%C3%A7%C3%A3o%20de%20ar-condicionado%2C%20geladeira%20ou%20freezer.">Pedir orçamento de serviço</a>`;
  }
  
  // Populate basic text details
  document.getElementById('modal-product-brand').textContent = detailProduct.brand;
  document.getElementById('modal-product-title').textContent = detailProduct.name;
  document.getElementById('product-detail-desc').textContent = detailProduct.desc;
  document.title = `${detailProduct.brand} ${detailProduct.name} | Gela Fácil`;
  document.querySelector('meta[name="description"]').content = `Confira fotos e especificações de ${detailProduct.brand} ${detailProduct.name}. Consulte preço e disponibilidade no Mercado Livre.`;
  
  // Format prices
  const formattedPrice = formatPrice(detailProduct.price);
  document.getElementById('original-price-val').textContent = formattedPrice;
  document.getElementById('summary-product-val').textContent = formattedPrice;
  
  document.getElementById('installments-preview-txt').textContent = Number.isFinite(detailProduct.price)
    ? 'Preço de referência. Confirme valor, parcelamento e disponibilidade no anúncio.'
    : 'Confira preço, voltagem, parcelamento e disponibilidade no anúncio.';
  
  // Populate Rating Summary
  const rating = Number.isFinite(detailProduct.rating) ? detailProduct.rating : 0;
  const starsString = '★'.repeat(Math.round(rating)) + '☆'.repeat(5 - Math.round(rating));
  document.getElementById('product-stars').textContent = starsString;
  document.getElementById('product-rating-text').textContent = detailProduct.ratingCount ? `${rating.toFixed(1)} (${detailProduct.ratingCount} avaliações)` : '';
  
  // Render main image
  const imgContainer = document.getElementById('detail-img-container');
  imgContainer.innerHTML = `<img id="main-product-image" src="${adjustImagePath(detailProduct.image)}" alt="${detailProduct.name}">`;
  
  // Render thumbnails
  renderThumbnails();
  
  // Render specifications
  renderSpecs();
  
  const buyNowBtn = document.getElementById('modal-buy-now-btn');
  if (buyNowBtn) {
    buyNowBtn.textContent = isValidAffiliateUrl(detailProduct.affiliateUrl) ? 'Ver no Mercado Livre' : 'Link do produto em breve';
    buyNowBtn.addEventListener('click', () => {
      openMercadoLivreProduct(currentProduct.id);
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
    btn.setAttribute('aria-label', `Ver foto ${idx + 1} de ${detailProduct.name}`);
    btn.setAttribute('aria-pressed', String(idx === 0));
    btn.innerHTML = `<img src="${adjustImagePath(img)}" alt="Foto ${idx + 1}">`;
    btn.onclick = () => {
      document.querySelectorAll('.thumb-btn').forEach(b => {
        b.classList.remove('active');
        b.setAttribute('aria-pressed', 'false');
      });
      btn.classList.add('active');
      btn.setAttribute('aria-pressed', 'true');
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

// The specs are the only local detail tab; reviews belong to the marketplace.
window.switchTab = function(tabName) {
  if (tabName !== 'specs') return;
  document.getElementById('tab-specs')?.classList.add('active');
};
