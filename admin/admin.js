// Gela Fácil: catálogo e estoque conectados à API.
const DB = { products: [], stockHistory: [] };
let editingProductId = null;

const fmt = (n) => 'R$ ' + n.toLocaleString('pt-BR', { minimumFractionDigits: 2 });
const fmtDate = (d) => new Date(d + 'T00:00:00').toLocaleDateString('pt-BR');
const initials = (name) => name.split(' ').slice(0,2).map(w => w[0]).join('').toUpperCase();
const avatarColors = ['#4A91C4','#22C55E','#F59E0B','#EF4444','#8B5CF6','#EC4899','#06B6D4'];
const avatarColor = (name) => avatarColors[name.charCodeAt(0) % avatarColors.length];
const escapeHtml = (value) => String(value ?? '').replace(/[&<>'"]/g, char => ({
  '&': '&amp;', '<': '&lt;', '>': '&gt;', "'": '&#39;', '"': '&quot;',
}[char]));

async function apiFetch(url, options = {}) {
  const response = await fetch(url, {
    credentials: 'same-origin',
    headers: { 'Content-Type': 'application/json', ...(options.headers || {}) },
    ...options,
  });

  if (response.status === 401) {
    window.location.href = '/admin/login.html';
    throw new Error('Nao autorizado.');
  }

  const data = response.status === 204 ? null : await response.json();
  if (!response.ok) throw new Error(data?.error || 'Falha na requisicao.');
  return data;
}

async function uploadProductImageIfNeeded() {
  const fileInput = document.getElementById('prod-image-file');
  const selectedFile = fileInput?.files?.[0];

  if (!selectedFile) return document.getElementById('prod-image').value.trim();
  if (!['image/jpeg', 'image/png', 'image/webp'].includes(selectedFile.type) || selectedFile.size > 5 * 1024 * 1024) throw new Error('Envie uma imagem JPEG, PNG ou WebP de até 5 MB.');

  const formData = new FormData();
  formData.append('image', selectedFile);

  const response = await fetch('/api/admin/upload', {
    method: 'POST',
    credentials: 'same-origin',
    body: formData,
  });

  if (response.status === 401) {
    window.location.href = '/admin/login.html';
    throw new Error('Nao autorizado.');
  }

  const data = await response.json();
  if (!response.ok) throw new Error(data?.error || 'Falha ao enviar imagem.');
  return data.url;
}

async function loadStoredProducts() {
  DB.products = await apiFetch('/api/admin/products');
}

function showToast(msg, isError = false) {
  const t = document.getElementById('toast');
  const icon = t.querySelector('.toast-icon');
  document.getElementById('toast-msg').textContent = msg;
  icon.textContent = isError ? '✕' : '✓';
  t.style.borderColor = isError ? 'rgba(239,68,68,0.3)' : 'rgba(34,197,94,0.3)';
  icon.style.color = isError ? 'var(--admin-danger)' : 'var(--admin-success)';
  t.classList.add('visible');
  setTimeout(() => t.classList.remove('visible'), 3000);
}

function getStatusBadge(status) {
  const map = {
    active:     ['badge-active',     'Ativo'],
    inactive:   ['badge-inactive',   'Inativo'],
    pending:    ['badge-pending',    'Pendente'],
    processing: ['badge-processing', 'Processando'],
    shipped:    ['badge-shipped',    'Enviado'],
    delivered:  ['badge-delivered',  'Entregue'],
    cancelled:  ['badge-cancelled',  'Cancelado'],
    ok:         ['badge-ok',         'Em Estoque'],
    low:        ['badge-low',        'Baixo'],
    out:        ['badge-out',        'Sem Estoque'],
  };
  const [cls, label] = map[status] || ['badge-inactive', status];
  return `<span class="status-badge ${cls}">${label}</span>`;
}

function getStockStatus(product) {
  if (product.stock === 0) return 'out';
  if (product.stock <= product.minStock) return 'low';
  return 'ok';
}

// ── AUTHENTICATION ────────────────────────────────────────
function setupNavigation() {
  const navItems = document.querySelectorAll('.nav-item');
  const pages = document.querySelectorAll('.page');
  const pageTitle = document.getElementById('page-title');

  const pageTitles = {
    dashboard: 'Dashboard',
    products: 'Produtos',
    stock: 'Estoque',
    orders: 'Pedidos',
    customers: 'Clientes',
    reports: 'Relatórios',
    settings: 'Configurações',
  };

  function navigateTo(pageId) {
    if (!['products', 'stock'].includes(pageId)) return;
    navItems.forEach(n => n.classList.remove('active'));
    pages.forEach(p => p.classList.remove('active'));
    const navEl = document.getElementById('nav-' + pageId);
    if (navEl) navEl.classList.add('active');
    const pageEl = document.getElementById('page-' + pageId);
    if (pageEl) pageEl.classList.add('active');
    navItems.forEach(n => n.setAttribute('aria-current', n === navEl ? 'page' : 'false'));
    pageTitle.textContent = pageTitles[pageId] || pageId;
    // Close mobile sidebar
    document.getElementById('sidebar').classList.remove('mobile-open');
    document.getElementById('mobile-sidebar-backdrop').classList.remove('visible');
    document.getElementById('mobile-menu-btn').setAttribute('aria-expanded', 'false');
  }

  navItems.forEach(item => {
    item.addEventListener('click', (e) => {
      e.preventDefault();
      navigateTo(item.dataset.page);
    });
  });

  // "View all" links in dashboard
  document.querySelectorAll('.link-view-all').forEach(link => {
    link.addEventListener('click', (e) => {
      e.preventDefault();
      navigateTo(link.dataset.page);
    });
  });

  // Sidebar toggle (collapse)
  const sidebar = document.getElementById('sidebar');
  const adminMain = document.getElementById('admin-main');
  document.getElementById('sidebar-toggle').addEventListener('click', () => {
    sidebar.classList.toggle('collapsed');
    adminMain.classList.toggle('collapsed');
  });

  // Mobile menu
  const mobileMenuBtn = document.getElementById('mobile-menu-btn');
  const mobileBackdrop = document.getElementById('mobile-sidebar-backdrop');
  const closeMobileMenu = () => {
    sidebar.classList.remove('mobile-open');
    mobileBackdrop.classList.remove('visible');
    mobileMenuBtn.setAttribute('aria-expanded', 'false');
  };

  mobileMenuBtn.addEventListener('click', () => {
    const isOpen = sidebar.classList.toggle('mobile-open');
    mobileBackdrop.classList.toggle('visible', isOpen);
    mobileMenuBtn.setAttribute('aria-expanded', String(isOpen));
  });
  mobileBackdrop.addEventListener('click', closeMobileMenu);
  document.addEventListener('keydown', event => {
    if (event.key === 'Escape') closeMobileMenu();
  });
}

// ── DATE ──────────────────────────────────────────────────


// ── MODALS ────────────────────────────────────────────────
function setupModals() {
  document.querySelectorAll('.modal-close, .btn-cancel').forEach(btn => {
    btn.addEventListener('click', () => {
      const modalId = btn.dataset.modal;
      if (modalId) closeModal(modalId);
    });
  });
  document.querySelectorAll('.modal-overlay').forEach(overlay => {
    overlay.addEventListener('click', (e) => {
      if (e.target === overlay) closeModal(overlay.id);
    });
  });
}
let modalReturnFocus;
function openModal(id) { modalReturnFocus = document.activeElement; const overlay = document.getElementById(id); overlay.classList.add('open'); document.body.style.overflow = 'hidden'; overlay.querySelector('input, select, button')?.focus(); }
function closeModal(id) { document.getElementById(id).classList.remove('open'); document.body.style.overflow = ''; modalReturnFocus?.focus(); }
document.addEventListener('keydown', event => {
 const overlay = document.querySelector('.modal-overlay.open'); if (!overlay) return;
 if (event.key === 'Escape') closeModal(overlay.id);
 if (event.key === 'Tab') { const items = [...overlay.querySelectorAll('button, input, select, textarea, a[href]')].filter(el => !el.disabled && el.getClientRects().length); const first = items[0], last = items.at(-1); if (event.shiftKey && document.activeElement === first) { event.preventDefault(); last?.focus(); } else if (!event.shiftKey && document.activeElement === last) { event.preventDefault(); first?.focus(); } }
});

function renderStockBadge() {
  const alerts = DB.products.filter(p => getStockStatus(p) !== 'ok');
  const badge = document.getElementById('stock-alert-badge');
  if (alerts.length > 0) { badge.style.display = 'flex'; badge.textContent = alerts.length; }
  else badge.style.display = 'none';
}

// ── PRODUCTS ──────────────────────────────────────────────
function renderProducts() {
  renderCatalogSummary();
  const searchTerm = document.getElementById('product-search').value.toLowerCase();
  const catFilter = document.getElementById('product-category-filter').value;
  const sort = document.getElementById('product-sort').value;
  const status = document.getElementById('product-status-filter').value;

  let list = DB.products.filter(p => {
    const matchSearch = p.name.toLowerCase().includes(searchTerm) || p.brand.toLowerCase().includes(searchTerm) || (p.sku || '').toLowerCase().includes(searchTerm);
    const matchCat = catFilter === 'all' || p.category === catFilter;
    return matchSearch && matchCat && (status === 'all' || (status === 'missing-link' ? !p.affiliateUrl : p.status === status));
  });

  if (sort === 'name') list.sort((a, b) => a.name.localeCompare(b.name));
  else if (sort === 'price-asc') list.sort((a, b) => a.price - b.price);
  else if (sort === 'price-desc') list.sort((a, b) => b.price - a.price);
  else if (sort === 'stock') list.sort((a, b) => a.stock - b.stock);

  const tbody = document.getElementById('products-body');
  tbody.innerHTML = list.map(p => {
    const st = getStockStatus(p);
    const letter = (p.brand[0] || 'P').toUpperCase();
    const name = escapeHtml(p.name);
    const brand = escapeHtml(p.brand);
    const sku = escapeHtml(p.sku);
    const image = escapeHtml(p.image?.startsWith('assets/') ? '/' + p.image : p.image);
    const category = escapeHtml(p.category);
    return `
    <tr>
      <td>
        <div class="product-thumb">
          ${p.image ? `<img src="${image}" alt="${name}" class="product-thumb-img" />` : `<div class="product-thumb-fallback" style="background:${avatarColor(p.brand)}22;color:${avatarColor(p.brand)}">${escapeHtml(letter)}</div>`}
          <div class="product-thumb-info">
            <strong>${name}</strong>
            <span>${brand} · ${sku}</span>
          </div>
        </div>
      </td>
      <td>${category.charAt(0).toUpperCase() + category.slice(1)}</td>
      <td><strong>${fmt(p.price)}</strong>${p.oldPrice ? `<br><small style="color:var(--admin-muted);text-decoration:line-through">${fmt(p.oldPrice)}</small>` : ''}</td>
      <td>
        <div class="stock-progress-wrap">
          <div class="stock-progress-bar"><div class="stock-progress-fill fill-${st}" style="width:${Math.min(100, (p.stock / Math.max(p.minStock*2,1))*100)}%"></div></div>
          <span class="stock-progress-num">${p.stock}</span>
        </div>
      </td>
      <td>${getStatusBadge(p.status)}<small class="affiliate-state ${p.affiliateUrl ? 'ready' : 'pending'}">${p.affiliateUrl ? 'Link cadastrado' : 'Sem link de afiliado'}</small></td>
      <td>
        <div class="action-btns">
          <button class="btn-action" title="Editar" onclick="openEditProduct(${p.id})">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>
          </button>
          <button class="btn-action danger" title="Excluir" onclick="deleteProduct(${p.id})">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"/><path d="M10 11v6"/><path d="M14 11v6"/><path d="M9 6V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2"/></svg>
          </button>
        </div>
      </td>
    </tr>`;
  }).join('') || '<tr><td colspan="6" class="empty-state"><strong>Nenhum produto encontrado</strong><span>Cadastre um produto ou ajuste os filtros da busca.</span></td></tr>';
  document.getElementById('products-pagination').textContent = `${list.length} de ${DB.products.length} produtos`;
}

function openAddProduct() {
  editingProductId = null;
  document.getElementById('product-modal-title').textContent = 'Novo Produto';
  document.getElementById('product-form').reset();
  document.getElementById('prod-stock').value = 0;
  document.getElementById('prod-min-stock').value = 3;
  openModal('product-modal-overlay');
}
function openEditProduct(id) {
  const p = DB.products.find(x => x.id === id);
  if (!p) return;
  editingProductId = id;
  document.getElementById('product-modal-title').textContent = 'Editar Produto';
  document.getElementById('prod-name').value = p.name;
  document.getElementById('prod-brand').value = p.brand;
  document.getElementById('prod-category').value = p.category;
  document.getElementById('prod-status').value = p.status;
  document.getElementById('prod-price').value = p.price;
  document.getElementById('prod-old-price').value = p.oldPrice || '';
  document.getElementById('prod-stock').value = p.stock;
  document.getElementById('prod-min-stock').value = p.minStock;
  document.getElementById('prod-image-file').value = '';
  document.getElementById('prod-image').value = p.image || '';
  document.getElementById('prod-affiliate-url').value = p.affiliateUrl || '';
  document.getElementById('prod-sku').value = p.sku;
  document.getElementById('prod-specs').value = p.specs;
  openModal('product-modal-overlay');
}
async function deleteProduct(id) {
  if (!confirm('Tem certeza que deseja remover este produto?')) return;
  try {
    await apiFetch(`/api/admin/products/${id}`, { method: 'DELETE' });
    await loadStoredProducts();
    renderProducts();
    renderStock();
    renderStockBadge();
    populateStockProductSelect();
    showToast('Produto removido com sucesso.');
  } catch (err) {
    showToast(err.message, true);
  }
}

function setupProductForm() {
  document.getElementById('btn-add-product').addEventListener('click', openAddProduct);
  bindBusyForm('product-form', async (e) => {
    e.preventDefault();
    const productId = editingProductId;
    try {
      const data = {
        name: document.getElementById('prod-name').value.trim(),
        brand: document.getElementById('prod-brand').value.trim(),
        category: document.getElementById('prod-category').value,
        status: document.getElementById('prod-status').value,
        price: parseFloat(document.getElementById('prod-price').value),
        oldPrice: parseFloat(document.getElementById('prod-old-price').value) || null,
        stock: parseInt(document.getElementById('prod-stock').value),
        minStock: Number.parseInt(document.getElementById('prod-min-stock').value || '3', 10),
        sku: document.getElementById('prod-sku').value.trim(),
        affiliateUrl: document.getElementById('prod-affiliate-url').value.trim(),
        specs: document.getElementById('prod-specs').value.trim(),
      };

      data.image = await uploadProductImageIfNeeded();
      if (productId) {
        await apiFetch(`/api/admin/products/${productId}`, {
          method: 'PUT',
          body: JSON.stringify(data),
        });
        showToast('Produto atualizado com sucesso!');
      } else {
        await apiFetch('/api/admin/products', {
          method: 'POST',
          body: JSON.stringify(data),
        });
        showToast('Produto adicionado com sucesso!');
      }
      await loadStoredProducts();
      closeModal('product-modal-overlay');
      renderProducts();
      renderStock();
      renderStockBadge();
      populateStockProductSelect();
    } catch (err) {
      showToast(err.message, true);
    }
  });
  ['product-search','product-category-filter','product-sort','product-status-filter'].forEach(id => {
    document.getElementById(id).addEventListener('input', renderProducts);
    document.getElementById(id).addEventListener('change', renderProducts);
  });
}

// ── STOCK ─────────────────────────────────────────────────
function renderStock() {
  const search = document.getElementById('stock-search').value.toLowerCase();
  const statusFilter = document.getElementById('stock-status-filter').value;

  let list = DB.products.filter(p => {
    const st = getStockStatus(p);
    const matchSearch = p.name.toLowerCase().includes(search) || (p.sku || '').toLowerCase().includes(search);
    const matchStatus = statusFilter === 'all' || st === statusFilter;
    return matchSearch && matchStatus;
  });

  // KPIs
  const okCount = DB.products.filter(p => getStockStatus(p) === 'ok').length;
  const lowCount = DB.products.filter(p => getStockStatus(p) === 'low').length;
  const outCount = DB.products.filter(p => getStockStatus(p) === 'out').length;
  const totalValue = DB.products.reduce((s, p) => s + (p.price * p.stock), 0);
  document.getElementById('stock-ok-count').textContent = okCount;
  document.getElementById('stock-low-count').textContent = lowCount;
  document.getElementById('stock-out-count').textContent = outCount;
  document.getElementById('stock-total-value').textContent = fmt(totalValue);

  const tbody = document.getElementById('stock-body');
  tbody.innerHTML = list.map(p => {
    const st = getStockStatus(p);
    const pct = Math.min(100, (p.stock / Math.max(p.minStock*2, 1)) * 100);
    const name = escapeHtml(p.name);
    const brand = escapeHtml(p.brand);
    const sku = escapeHtml(p.sku);
    const category = escapeHtml(p.category);
    return `
    <tr>
      <td>
        <div class="product-thumb">
          <div class="product-thumb-fallback" style="background:${avatarColor(p.brand)}22;color:${avatarColor(p.brand)}">${escapeHtml(p.brand[0])}</div>
          <div class="product-thumb-info"><strong>${name}</strong><span>${brand}</span></div>
        </div>
      </td>
      <td><code style="background:rgba(255,255,255,0.05);padding:3px 8px;border-radius:5px;font-size:0.78rem">${sku}</code></td>
      <td>${category}</td>
      <td>
        <div class="stock-progress-wrap">
          <div class="stock-progress-bar"><div class="stock-progress-fill fill-${st}" style="width:${pct}%"></div></div>
          <span class="stock-progress-num" style="color:${st==='out'?'var(--admin-danger)':st==='low'?'var(--admin-warning)':'var(--admin-white)'}">${p.stock}</span>
        </div>
      </td>
      <td>${p.minStock}</td>
      <td>${getStatusBadge(st)}</td>
      <td>
        <div class="action-btns">
          <button class="btn-action" title="Ajustar estoque" onclick="openStockAdjust(${p.id})">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
          </button>
          <button class="btn-action danger" title="Remover produto" onclick="deleteProduct(${p.id})">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"/><path d="M10 11v6"/><path d="M14 11v6"/><path d="M9 6V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2"/></svg>
          </button>
        </div>
      </td>
    </tr>`;
  }).join('');

  if (!list.length) tbody.innerHTML = '<tr><td colspan="7" class="empty-state">Nenhum produto encontrado para este filtro.</td></tr>';
  document.getElementById('btn-stock-entry').disabled = DB.products.length === 0;
  renderStockHistory();
}

function renderStockHistory() {
  const tbody = document.getElementById('stock-history-body');
  tbody.innerHTML = DB.stockHistory.map(h => {
    const typeLabel = { in: 'Entrada', out: 'Saída', adjust: 'Ajuste' }[h.type];
    const typeColor = { in: 'var(--admin-success)', out: 'var(--admin-danger)', adjust: 'var(--admin-warning)' }[h.type];
    return `
    <tr>
      <td>${fmtDate(h.date)}</td>
      <td>${escapeHtml(h.product)}</td>
      <td><span style="color:${typeColor};font-weight:700">${typeLabel}</span></td>
      <td><strong>${h.qty} un.</strong></td>
      <td>${escapeHtml(h.user)}</td>
    </tr>`;
  }).join('') || '<tr><td colspan="5" class="empty-state">Nenhuma movimentação registrada nesta sessão.</td></tr>';
}

function populateStockProductSelect() {
  const sel = document.getElementById('stock-product-select');
  sel.innerHTML = DB.products.map(p => `<option value="${p.id}">${escapeHtml(p.name)} (${p.stock} em estoque)</option>`).join('');
}

function openStockAdjust(productId) {
  populateStockProductSelect();
  document.getElementById('stock-product-select').value = productId;
  openModal('stock-modal-overlay');
}

function setupStockForm() {
  document.getElementById('btn-stock-entry').addEventListener('click', () => {
    populateStockProductSelect();
    openModal('stock-modal-overlay');
  });
  bindBusyForm('stock-form', async (e) => {
    e.preventDefault();
    const productId = parseInt(document.getElementById('stock-product-select').value);
    const type = document.getElementById('stock-type').value;
    const qty = parseInt(document.getElementById('stock-qty').value);
    const note = document.getElementById('stock-note').value.trim();

    const product = DB.products.find(p => p.id === productId);
    if (!product) return;

    try {
      await apiFetch(`/api/admin/products/${productId}/stock`, {
        method: 'PATCH',
        body: JSON.stringify({ type, qty }),
      });
      await loadStoredProducts();
    } catch (err) {
      showToast(err.message, true);
      return;
    }

    DB.stockHistory.unshift({
      date: new Date().toISOString().split('T')[0],
      product: product.name,
      type, qty,
      user: 'Admin Gela',
      note
    });

    closeModal('stock-modal-overlay');
    document.getElementById('stock-form').reset();
    renderStock();
    renderStockBadge();
    renderProducts();
    showToast('Estoque atualizado com sucesso!');
  });

  ['stock-search','stock-status-filter'].forEach(id => {
    document.getElementById(id).addEventListener('input', renderStock);
    document.getElementById(id).addEventListener('change', renderStock);
  });
}

// ── APP INIT ──────────────────────────────────────────────
async function initApp() {
  await loadStoredProducts();
  renderProducts();
  renderStock();
  renderStockBadge();
}

// ── BOOT ────────────────────────────────────────────────
document.addEventListener('DOMContentLoaded', () => {
  document.getElementById('btn-logout').addEventListener('click', async () => {
    if (!confirm('Deseja sair do painel?')) return;
    try { await apiFetch('/api/admin/logout', { method: 'POST' }); window.location.href = '/admin/login.html'; } catch (error) { showToast(error.message, true); }
  });

  setupNavigation();
  setupProductForm();
  setupStockForm();
  setupModals();

  document.getElementById('retry-products').addEventListener('click', refreshCatalog);
  refreshCatalog();
  apiFetch('/api/admin/me').then(data => { document.querySelector('.admin-name').textContent = data.user; }).catch(() => {});
});

function renderCatalogSummary() {
 document.getElementById('summary-total').textContent = DB.products.length;
 document.getElementById('summary-active').textContent = DB.products.filter(p => p.status === 'active').length;
 document.getElementById('summary-pending').textContent = DB.products.filter(p => !p.affiliateUrl).length;
 document.getElementById('summary-inactive').textContent = DB.products.filter(p => p.status === 'inactive').length;
}
async function refreshCatalog() {
 const feedback = document.getElementById('catalog-feedback'); const retry = document.getElementById('retry-products');
 feedback.hidden = false; retry.hidden = true; feedback.querySelector('span').textContent = 'Carregando seu catálogo…';
 try { await initApp(); feedback.hidden = true; }
 catch (error) { feedback.querySelector('span').textContent = 'Não foi possível carregar o catálogo. ' + error.message; retry.hidden = false; }
}

function bindBusyForm(id, handler) {
 const form = document.getElementById(id); let busy = false;
 form.addEventListener('submit', async event => {
  event.preventDefault(); if (busy) return; busy = true;
  const button = form.querySelector('button[type="submit"]'), label = button.textContent;
  button.disabled = true; button.textContent = 'Salvando…'; form.setAttribute('aria-busy', 'true');
  try { await handler(event); } catch (error) { showToast(error.message, true); }
  finally { busy = false; button.disabled = false; button.textContent = label; form.removeAttribute('aria-busy'); }
 });
}
