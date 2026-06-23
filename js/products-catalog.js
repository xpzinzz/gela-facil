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

// Current filter state
const state = {
  search: '',
  category: 'all',
  brand: 'all',
  sortBy: 'featured'
};

document.addEventListener('DOMContentLoaded', () => {
  // Parse initial state from URL params (e.g. ?category=split or ?search=lg)
  const params = new URLSearchParams(window.location.search);
  if (params.has('category')) {
    state.category = params.get('category');
    updateActiveChips('category', state.category);
  }
  if (params.has('brand')) {
    state.brand = params.get('brand');
    updateActiveChips('brand', state.brand);
  }
  if (params.has('search')) {
    state.search = params.get('search');
    const searchInput = document.getElementById('search-input');
    if (searchInput) searchInput.value = state.search;
  }

  // Setup DOM Event Listeners
  setupEventListeners();

  // Initial render
  filterAndRender();
});

// Update the visual active class on chips
function updateActiveChips(type, value) {
  if (type === 'category') {
    const chips = document.querySelectorAll('#category-chips .chip');
    chips.forEach(chip => {
      if (chip.getAttribute('data-category') === value) {
        chip.classList.add('active');
      } else {
        chip.classList.remove('active');
      }
    });
  } else if (type === 'brand') {
    const chips = document.querySelectorAll('#brand-chips .chip-brand');
    chips.forEach(chip => {
      if (chip.getAttribute('data-brand') === value) {
        chip.classList.add('active');
      } else {
        chip.classList.remove('active');
      }
    });
  }
}

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
      filterAndRender();
    });
  }

  // Category chips click
  const categoryChips = document.querySelectorAll('#category-chips .chip');
  categoryChips.forEach(chip => {
    chip.addEventListener('click', () => {
      categoryChips.forEach(c => c.classList.remove('active'));
      chip.classList.add('active');
      state.category = chip.getAttribute('data-category');
      filterAndRender();
    });
  });

  // Brand chips click
  const brandChips = document.querySelectorAll('#brand-chips .chip-brand');
  brandChips.forEach(chip => {
    chip.addEventListener('click', () => {
      brandChips.forEach(c => c.classList.remove('active'));
      chip.classList.add('active');
      state.brand = chip.getAttribute('data-brand');
      filterAndRender();
    });
  });

  // Clear all filters button
  const clearAllBtn = document.getElementById('btn-clear-all-filters');
  if (clearAllBtn) {
    clearAllBtn.addEventListener('click', resetFilters);
  }

  // Reset empty state button
  const resetEmptyBtn = document.getElementById('btn-reset-catalog');
  if (resetEmptyBtn) {
    resetEmptyBtn.addEventListener('click', resetFilters);
  }
}

function resetFilters() {
  state.search = '';
  state.category = 'all';
  state.brand = 'all';
  state.sortBy = 'featured';

  const searchInput = document.getElementById('search-input');
  if (searchInput) searchInput.value = '';
  
  const searchClearBtn = document.getElementById('search-clear-btn');
  if (searchClearBtn) searchClearBtn.style.display = 'none';

  const sortSelect = document.getElementById('sort-select');
  if (sortSelect) sortSelect.value = 'featured';

  updateActiveChips('category', 'all');
  updateActiveChips('brand', 'all');

  filterAndRender();
}

function filterAndRender() {
  const grid = document.getElementById('catalog-grid');
  const emptyState = document.getElementById('catalog-empty-state');
  const resultsCount = document.getElementById('results-count');
  
  if (!grid) return;

  // 1. Filter products
  const filteredProducts = [];
  const query = state.search.toLowerCase();

  for (const [id, product] of Object.entries(productDetailsDb)) {
    // Search query filter
    const matchesSearch = !query || 
      product.name.toLowerCase().includes(query) ||
      product.brand.toLowerCase().includes(query) ||
      product.desc.toLowerCase().includes(query);

    // Category filter
    const categories = productCategories[id] || [];
    const matchesCategory = state.category === 'all' || categories.includes(state.category);

    // Brand filter
    const matchesBrand = state.brand === 'all' || product.brand.toLowerCase() === state.brand.toLowerCase();

    if (matchesSearch && matchesCategory && matchesBrand) {
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

  // 4. Update Active Filters Tag Row
  updateActiveFiltersUI();

  // 5. Render
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

      html += `
        <div class="product-card" data-id="${prod.id}" data-brand="${prod.brand}" data-name="${prod.name}" data-price="${prod.price}" data-category="${(productCategories[prod.id] || []).join(' ')}" data-image="${prod.image}">
          <div class="product-img-wrap">
            <div class="product-icon-container">
              <img src="${catalogAdjustPath(prod.image)}" alt="${prod.name}" class="product-image" />
            </div>
            ${tagHtml}
            <div class="product-hover-overlay">
              <span class="view-details-btn">Comprar &amp; Instalar</span>
            </div>
          </div>
          <div class="product-info">
            <div class="product-brand">${prod.brand}</div>
            <h3 class="product-name">${prod.name}</h3>
            <div class="product-specs">
              ${specsHtml}
            </div>
            <div class="product-footer">
              <div class="product-price-wrap">
                ${oldPriceHtml}
                <span class="product-price">${formatPrice(prod.price)}</span>
              </div>
              <button class="btn-cart-add">+</button>
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
      
      // Call global addToCart (from script.js)
      if (window.addToCart) {
        window.addToCart(
          id,
          name,
          brand,
          price,
          image,
          'delivery',
          'Apenas Entrega',
          0,
          1
        );
      }
    });
  });
}

function updateActiveFiltersUI() {
  const row = document.getElementById('active-filters-row');
  const container = document.getElementById('active-filters-container');
  
  if (!row || !container) return;

  const tags = [];

  if (state.search) {
    tags.push({ type: 'search', label: `Busca: "${state.search}"` });
  }
  if (state.category !== 'all') {
    const catLabels = {
      inverter: 'Ar Inverter',
      split: 'Ar Split',
      portatil: 'Ar Portátil',
      bebidas: 'Cervejeiras & Frigobares'
    };
    tags.push({ type: 'category', label: catLabels[state.category] || state.category });
  }
  if (state.brand !== 'all') {
    tags.push({ type: 'brand', label: `Marca: ${state.brand}` });
  }

  if (tags.length === 0) {
    row.style.display = 'none';
  } else {
    row.style.display = 'flex';
    container.innerHTML = tags.map(tag => `
      <div class="active-filter-tag">
        <span>${tag.label}</span>
        <button onclick="removeFilter('${tag.type}')" aria-label="Remover filtro">&times;</button>
      </div>
    `).join('');
  }
}

// Globally expose filter removal helper
window.removeFilter = function(type) {
  if (type === 'search') {
    state.search = '';
    const searchInput = document.getElementById('search-input');
    if (searchInput) searchInput.value = '';
    const searchClearBtn = document.getElementById('search-clear-btn');
    if (searchClearBtn) searchClearBtn.style.display = 'none';
  } else if (type === 'category') {
    state.category = 'all';
    updateActiveChips('category', 'all');
  } else if (type === 'brand') {
    state.brand = 'all';
    updateActiveChips('brand', 'all');
  }
  filterAndRender();
};
