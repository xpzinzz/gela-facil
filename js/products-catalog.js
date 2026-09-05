// ── PRODUCTS CATALOG CONTROLLER ──
// Note: formatPrice() is global, declared in script.js (loaded first).

// Helper to adjust relative image paths for subfolder page context
function catalogAdjustPath(path) {
  if (!path) return '';
  if (path.startsWith('http') || path.startsWith('/') || path.startsWith('..')) {
    return path;
  }
  return '../' + path;
}

// Category mappings for static products database
const productCategories = {
  "1": ["inverter", "split"],
  "2": ["inverter", "split"],
  "3": ["inverter", "split"],
  "4": ["inverter", "split"],
  "5": ["split"],
  "6": ["portatil"],
  "b1": ["bebidas"],
  "b2": ["bebidas"],
  "b3": ["bebidas"],
  "b4": ["bebidas"]
};

// Promotional metadata to match index.html design
const productPromoData = {
  "1": { oldPrice: 2899, tag: "-17% OFF", tagClass: "promo" },
  "2": { oldPrice: 2199, tag: null, tagClass: null },
  "3": { oldPrice: 3499, tag: "Mais Vendido", tagClass: "highlight" },
  "4": { oldPrice: 4299, tag: null, tagClass: null },
  "5": { oldPrice: 1699, tag: "-22% OFF", tagClass: "promo" },
  "6": { oldPrice: 2099, tag: null, tagClass: null },
  "b1": { oldPrice: 1809, tag: "-17% OFF", tagClass: "promo" },
  "b2": { oldPrice: 2729, tag: "-9% OFF", tagClass: "promo" },
  "b3": { oldPrice: 3423, tag: "-18% OFF", tagClass: "promo" },
  "b4": { oldPrice: 3693, tag: "-16% OFF", tagClass: "promo" }
};

// Extract spec tags from the product structure
function getCardSpecTags(product) {
  const tags = [];
  if (product.specs) {
    if (product.specs["Tecnologia"]) {
      const tech = product.specs["Tecnologia"];
      if (tech.includes("Inverter")) tags.push("Inverter");
      else if (tech.includes("Split")) tags.push("Split");
      else if (tech.includes("Portátil")) tags.push("Portátil");
    }
    if (product.specs["Capacidade"]) {
      tags.push(product.specs["Capacidade"].replace('s', '').replace('S', ''));
    }
    if (product.specs["Selo Procel"]) {
      tags.push(product.specs["Selo Procel"]);
    }
    if (product.specs["Cor"]) {
      tags.push(product.specs["Cor"]);
    }
    if (product.specs["Voltagem"]) {
      tags.push(product.specs["Voltagem"]);
    }
    if (product.specs["Iluminação"]) {
      tags.push(product.specs["Iluminação"]);
    }
  }
  return tags.length > 0 ? tags : ["Premium"];
}

function normalizeCatalogSearch(value) {
  return String(value || '')
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLocaleLowerCase('pt-BR')
    .replace(/\s+/g, ' ')
    .trim();
}

// Current catalog state
const state = {
  search: '',
  sortBy: 'featured'
};

function updateCustomSortUI(value) {
  const nativeSelect = document.getElementById('sort-select');
  const valueLabel = document.getElementById('custom-sort-value');
  const options = document.querySelectorAll('.custom-sort-option');
  const selectedOption = Array.from(options).find(option => option.dataset.value === value);

  if (nativeSelect && nativeSelect.value !== value) nativeSelect.value = value;
  if (valueLabel && selectedOption) valueLabel.textContent = selectedOption.textContent.trim();

  options.forEach(option => {
    const isSelected = option.dataset.value === value;
    option.classList.toggle('selected', isSelected);
    option.setAttribute('aria-selected', String(isSelected));
  });
}

function closeCustomSort(restoreFocus = false) {
  const customSort = document.getElementById('custom-sort');
  const trigger = document.getElementById('custom-sort-trigger');
  const optionsPanel = document.getElementById('custom-sort-options');
  if (!customSort || !trigger || !optionsPanel) return;

  customSort.classList.remove('open');
  trigger.setAttribute('aria-expanded', 'false');
  optionsPanel.hidden = true;
  if (restoreFocus) trigger.focus();
}

document.addEventListener('DOMContentLoaded', () => {
  // Preserve links that arrive with search, brand or category in the URL.
  const params = new URLSearchParams(window.location.search);
  const initialSearch = params.get('search') || params.get('brand') || params.get('category') || '';
  if (initialSearch) {
    state.search = initialSearch;
    const searchInput = document.getElementById('search-input');
    if (searchInput) searchInput.value = state.search;
  }

  // Setup DOM Event Listeners
  setupEventListeners();

  // Initial render
  filterAndRender();
});

function setupEventListeners() {
  // Search input change
  const searchInput = document.getElementById('search-input');
  const searchClearBtn = document.getElementById('search-clear-btn');
  
  if (searchInput) {
    searchInput.addEventListener('input', (e) => {
      state.search = e.target.value.trim();
      if (state.search.length > 0) {
        if (searchClearBtn) searchClearBtn.style.display = 'block';
      } else {
        if (searchClearBtn) searchClearBtn.style.display = 'none';
      }
      filterAndRender();
    });
  }

  if (searchClearBtn) {
    searchClearBtn.addEventListener('click', () => {
      if (searchInput) {
        searchInput.value = '';
        state.search = '';
      }
      searchClearBtn.style.display = 'none';
      filterAndRender();
    });
  }

  // Sort select change
  const sortSelect = document.getElementById('sort-select');
  if (sortSelect) {
    sortSelect.addEventListener('change', (e) => {
      state.sortBy = e.target.value;
      updateCustomSortUI(state.sortBy);
      filterAndRender();
    });
  }

  const customSort = document.getElementById('custom-sort');
  const customSortTrigger = document.getElementById('custom-sort-trigger');
  const customSortPanel = document.getElementById('custom-sort-options');
  const customSortOptions = Array.from(document.querySelectorAll('.custom-sort-option'));

  if (customSort && customSortTrigger && customSortPanel && sortSelect) {
    const openCustomSort = () => {
      customSort.classList.add('open');
      customSortTrigger.setAttribute('aria-expanded', 'true');
      customSortPanel.hidden = false;
    };

    const chooseSortOption = (option) => {
      sortSelect.value = option.dataset.value;
      sortSelect.dispatchEvent(new Event('change', { bubbles: true }));
      closeCustomSort(true);
    };

    customSortTrigger.addEventListener('click', () => {
      if (customSort.classList.contains('open')) {
        closeCustomSort();
      } else {
        openCustomSort();
      }
    });

    customSortTrigger.addEventListener('keydown', (event) => {
      if (event.key === 'ArrowDown' || event.key === 'ArrowUp') {
        event.preventDefault();
        openCustomSort();
        const selectedIndex = Math.max(0, customSortOptions.findIndex(option => option.classList.contains('selected')));
        customSortOptions[selectedIndex].focus();
      }
    });

    customSortOptions.forEach((option, index) => {
      option.addEventListener('click', () => chooseSortOption(option));
      option.addEventListener('keydown', (event) => {
        if (event.key === 'ArrowDown' || event.key === 'ArrowUp') {
          event.preventDefault();
          const direction = event.key === 'ArrowDown' ? 1 : -1;
          const nextIndex = (index + direction + customSortOptions.length) % customSortOptions.length;
          customSortOptions[nextIndex].focus();
        } else if (event.key === 'Enter' || event.key === ' ') {
          event.preventDefault();
          chooseSortOption(option);
        } else if (event.key === 'Escape') {
          event.preventDefault();
          closeCustomSort(true);
        }
      });
    });

    document.addEventListener('click', (event) => {
      if (!customSort.contains(event.target)) closeCustomSort();
    });

    updateCustomSortUI(state.sortBy);
  }

  // Reset empty state button
  const resetEmptyBtn = document.getElementById('btn-reset-catalog');
  if (resetEmptyBtn) {
    resetEmptyBtn.addEventListener('click', resetFilters);
  }
}

function resetFilters() {
  state.search = '';
  state.sortBy = 'featured';

  const searchInput = document.getElementById('search-input');
  if (searchInput) searchInput.value = '';
  
  const searchClearBtn = document.getElementById('search-clear-btn');
  if (searchClearBtn) searchClearBtn.style.display = 'none';

  const sortSelect = document.getElementById('sort-select');
  if (sortSelect) sortSelect.value = 'featured';
  updateCustomSortUI('featured');
  closeCustomSort();

  filterAndRender();
}

function filterAndRender() {
  const grid = document.getElementById('catalog-grid');
  const emptyState = document.getElementById('catalog-empty-state');
  const resultsCount = document.getElementById('results-count');
  
  if (!grid) return;

  // 1. Filter products
  const filteredProducts = [];
  const query = normalizeCatalogSearch(state.search);
  const queryTerms = query.split(' ').filter(Boolean);

  for (const [id, product] of Object.entries(productDetailsDb)) {
    const categories = productCategories[id] || [];
    const specValues = Object.entries(product.specs || {}).flatMap(([key, value]) => [key, value]);
    const searchableText = normalizeCatalogSearch([
      product.name,
      product.brand,
      product.desc,
      ...categories,
      ...specValues
    ].join(' '));
    const compactQuery = query.replace(/[^a-z0-9]/g, '');
    const compactSearchableText = searchableText.replace(/[^a-z0-9]/g, '');
    const matchesSearch = !query ||
      queryTerms.every(term => searchableText.includes(term)) ||
      (compactQuery.length > 1 && compactSearchableText.includes(compactQuery));

    if (matchesSearch) {
      filteredProducts.push({ id, ...product });
    }
  }

  // 2. Sort products
  if (state.sortBy === 'price-asc') {
    filteredProducts.sort((a, b) => a.price - b.price);
  } else if (state.sortBy === 'price-desc') {
    filteredProducts.sort((a, b) => b.price - a.price);
  } else if (state.sortBy === 'rating') {
    filteredProducts.sort((a, b) => b.rating - a.rating);
  } else if (state.sortBy === 'name-asc') {
    filteredProducts.sort((a, b) => a.name.localeCompare(b.name));
  }
  // 'featured' keeps original DB order

  // 3. Update count stat
  if (resultsCount) resultsCount.textContent = filteredProducts.length;

  // 4. Render
  if (filteredProducts.length === 0) {
    grid.style.display = 'none';
    if (emptyState) emptyState.style.display = 'block';
  } else {
    if (emptyState) emptyState.style.display = 'none';
    grid.style.display = 'grid';
    
    let html = '';
    filteredProducts.forEach(prod => {
      const promo = productPromoData[prod.id] || { oldPrice: null, tag: null, tagClass: null };
      const specTags = getCardSpecTags(prod);
      
      const tagHtml = promo.tag 
        ? `<div class="product-tag ${promo.tagClass}">${promo.tag}</div>` 
        : '';
        
      const oldPriceHtml = promo.oldPrice 
        ? `<span class="old-price">${formatPrice(promo.oldPrice)}</span>` 
        : '';

      const specsHtml = specTags.map(t => `<span class="spec-tag">${t}</span>`).join('');
      const rating = Number(prod.rating || 0).toFixed(1);
      const ratingCount = prod.ratingCount || 0;

      html += `
        <div class="product-card" tabindex="0" role="link" aria-label="Ver detalhes de ${prod.name}" data-id="${prod.id}" data-brand="${prod.brand}" data-name="${prod.name}" data-price="${prod.price}" data-category="${(productCategories[prod.id] || []).join(' ')}" data-image="${prod.image}">
          <div class="product-img-wrap">
            <div class="product-icon-container">
              <img src="${catalogAdjustPath(prod.image)}" alt="${prod.name}" class="product-image" loading="lazy" decoding="async" />
            </div>
            ${tagHtml}
            <div class="product-availability"><span aria-hidden="true"></span> Disponível</div>
            <div class="product-hover-overlay">
              <span class="view-details-btn">Ver detalhes <span aria-hidden="true">→</span></span>
            </div>
          </div>
          <div class="product-info">
            <div class="product-meta-row">
              <div class="product-brand">${prod.brand}</div>
              <div class="product-rating" aria-label="Avaliação ${rating} de 5">
                <span aria-hidden="true">★</span> ${rating} <small>(${ratingCount})</small>
              </div>
            </div>
            <h3 class="product-name">${prod.name}</h3>
            <div class="product-specs">
              ${specsHtml}
            </div>
            <div class="product-footer">
              <div class="product-price-wrap">
                ${oldPriceHtml}
                <span class="product-price">${formatPrice(prod.price)}</span>
                <span class="product-payment-note">Compra, pagamento e entrega pelo Mercado Livre</span>
              </div>
              <button class="btn-cart-add" aria-label="Consultar ${prod.name} no Mercado Livre">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2">
                  <circle cx="9" cy="20" r="1" /><circle cx="19" cy="20" r="1" />
                  <path d="M3 4h2l2.4 10.2a2 2 0 0 0 2 1.55h7.8a2 2 0 0 0 1.95-1.55L21 7H6" />
                  <path d="M15 9v4M13 11h4" />
                </svg>
              </button>
            </div>
          </div>
        </div>
      `;
    });
    grid.innerHTML = html;

    // Attach click listeners to dynamically rendered cards
    setupCardClickListeners();
  }
}

function setupCardClickListeners() {
  const cards = document.querySelectorAll('#catalog-grid .product-card');
  cards.forEach(card => {
    card.addEventListener('click', (e) => {
      // Don't navigate if user clicked the quick-add cart button
      if (e.target.closest('.btn-cart-add')) {
        return;
      }
      const id = card.getAttribute('data-id');
      window.location.href = `./product-detail.html?id=${id}`;
    });

    card.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' && !e.target.closest('.btn-cart-add')) {
        const id = card.getAttribute('data-id');
        window.location.href = `./product-detail.html?id=${id}`;
      }
    });
  });

  // Attach quick-add buttons click
  const quickAddBtns = document.querySelectorAll('#catalog-grid .btn-cart-add');
  quickAddBtns.forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.stopPropagation();
      const card = btn.closest('.product-card');
      if (!card) return;
      
      const id = card.getAttribute('data-id');
      const name = card.getAttribute('data-name');
      const brand = card.getAttribute('data-brand');
      const price = parseInt(card.getAttribute('data-price'));
      const image = card.getAttribute('data-image');
      
      openMercadoLivreProduct(id);
    });
  });
}
