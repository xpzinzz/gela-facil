// Gela Fácil: catálogo conectado à API própria.
const DB = { products: [] };
let editingProductId = null;

const fmt = (n) => 'R$ ' + n.toLocaleString('pt-BR', { minimumFractionDigits: 2 });
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

  const contentType = response.headers?.get?.('content-type') || 'application/json';
  if (!contentType.toLowerCase().includes('application/json')) {
    const isStaticLocalPreview = ['localhost', '127.0.0.1'].includes(window.location.hostname)
      && window.location.port !== '3000';
    throw new Error(isStaticLocalPreview
      ? 'Esta prévia não está conectada à API. Abra o painel em http://127.0.0.1:3000/admin/login.html após iniciar o backend.'
      : 'A API do painel respondeu em um formato inválido. Tente novamente em instantes.');
  }

  const data = response.status === 204 ? null : await response.json();
  if (!response.ok) throw new Error(data?.error || 'Falha na requisicao.');
  return data;
}

async function uploadProductImage(file) {
  if (!['image/jpeg', 'image/png', 'image/webp'].includes(file.type) || file.size > 5 * 1024 * 1024) throw new Error('Envie apenas imagens JPEG, PNG ou WebP de até 5 MB.');
  const formData = new FormData();
  formData.append('image', file);

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

async function uploadProductImageIfNeeded() {
  const selectedFile = document.getElementById('prod-image-file')?.files?.[0];
  return selectedFile ? uploadProductImage(selectedFile) : document.getElementById('prod-image').value.trim();
}

async function buildProductGallery(primaryImage) {
  const files = [...(document.getElementById('prod-gallery-files')?.files || [])];
  const typedImages = document.getElementById('prod-gallery').value
    .split(/\r?\n/)
    .map(value => value.trim())
    .filter(Boolean);

  if (files.length + typedImages.length > 11) throw new Error('Adicione no máximo 11 fotos extras.');
  const uploadedImages = await Promise.all(files.map(uploadProductImage));
  return [...new Set([primaryImage, ...typedImages, ...uploadedImages].filter(Boolean))].slice(0, 12);
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
  };
  const [cls, label] = map[status] || ['badge-inactive', status];
  return `<span class="status-badge ${cls}">${label}</span>`;
}

// ── AUTHENTICATION ────────────────────────────────────────
function setupNavigation() {
  const navItems = document.querySelectorAll('.nav-item');
  const pages = document.querySelectorAll('.page');
  const pageTitle = document.getElementById('page-title');

  const pageTitles = {
    dashboard: 'Dashboard',
    products: 'Produtos',
    orders: 'Pedidos',
    customers: 'Clientes',
    reports: 'Relatórios',
    settings: 'Configurações',
  };

  function navigateTo(pageId) {
    if (pageId !== 'products') return;
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
  document.querySelectorAll('.modal-close').forEach(btn => {
    btn.addEventListener('click', () => {
      const modalId = btn.dataset.modal;
      if (modalId) closeModal(modalId);
    });
  });
}
let modalReturnFocus;
function openModal(id) { modalReturnFocus = document.activeElement; const overlay = document.getElementById(id); overlay.classList.add('open'); document.body.style.overflow = 'hidden'; overlay.querySelector('input, select, button')?.focus(); }
function closeModal(id) { document.getElementById(id).classList.remove('open'); document.body.style.overflow = ''; modalReturnFocus?.focus(); }
document.addEventListener('keydown', event => {
 const overlay = document.querySelector('.modal-overlay.open'); if (!overlay) return;
 if (event.key === 'Tab') { const items = [...overlay.querySelectorAll('button, input, select, textarea, a[href]')].filter(el => !el.disabled && el.getClientRects().length); const first = items[0], last = items.at(-1); if (event.shiftKey && document.activeElement === first) { event.preventDefault(); last?.focus(); } else if (!event.shiftKey && document.activeElement === last) { event.preventDefault(); first?.focus(); } }
});

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
    return matchSearch && matchCat && (status === 'all' || p.status === status);
  });

  if (sort === 'name') list.sort((a, b) => a.name.localeCompare(b.name));
  else if (sort === 'price-asc') list.sort((a, b) => a.price - b.price);
  else if (sort === 'price-desc') list.sort((a, b) => b.price - a.price);

  const tbody = document.getElementById('products-body');
  tbody.innerHTML = list.map(p => {
    const letter = (p.brand[0] || 'P').toUpperCase();
    const name = escapeHtml(p.name);
    const brand = escapeHtml(p.brand);
    const sku = escapeHtml(p.sku);
    const image = escapeHtml(p.image?.startsWith('assets/') ? '/' + p.image : p.image);
    const category = escapeHtml(p.category);
    const affiliateUrl = escapeHtml(p.affiliateUrl);
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
      <td>${p.oldPrice && p.oldPrice > p.price ? `<small style="color:var(--admin-muted);text-decoration:line-through">${fmt(p.oldPrice)}</small><br>` : ''}<strong>${fmt(p.price)}</strong></td>
      <td>${getStatusBadge(p.status)}${p.affiliateUrl ? `<br><a href="${affiliateUrl}" target="_blank" rel="noopener noreferrer" class="table-link">Abrir link de afiliado</a>` : '<br><small style="color:var(--admin-danger)">Link não cadastrado</small>'}</td>
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
  }).join('') || '<tr><td colspan="5" class="empty-state"><strong>Nenhum produto encontrado</strong><span>Cadastre um produto ou ajuste os filtros da busca.</span></td></tr>';
  document.getElementById('products-pagination').textContent = `${list.length} de ${DB.products.length} produtos`;
}

function openAddProduct() {
  editingProductId = null;
  document.getElementById('product-modal-title').textContent = 'Adicionar produto';
  document.getElementById('product-save-button').textContent = 'Adicionar produto';
  document.getElementById('product-form').reset();
  openModal('product-modal-overlay');
}

function openEditProduct(id) {
  const p = DB.products.find(x => x.id === id);
  if (!p) return;
  editingProductId = id;
  document.getElementById('product-modal-title').textContent = 'Editar produto';
  document.getElementById('product-save-button').textContent = 'Salvar alterações';
  document.getElementById('prod-name').value = p.name;
  document.getElementById('prod-brand').value = p.brand;
  document.getElementById('prod-category').value = p.category;
  document.getElementById('prod-status').value = p.status;
  document.getElementById('prod-price').value = p.price;
  document.getElementById('prod-old-price').value = p.oldPrice || '';
  document.getElementById('prod-affiliate-url').value = p.affiliateUrl || '';
  document.getElementById('prod-image-file').value = '';
  document.getElementById('prod-image').value = p.image || '';
  document.getElementById('prod-gallery-files').value = '';
  document.getElementById('prod-gallery').value = (p.gallery || []).filter(image => image && image !== p.image).join('\n');
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
        affiliateUrl: document.getElementById('prod-affiliate-url').value.trim(),
        sku: document.getElementById('prod-sku').value.trim(),
        specs: document.getElementById('prod-specs').value.trim(),
      };

      data.image = await uploadProductImageIfNeeded();
      data.gallery = await buildProductGallery(data.image);
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
    } catch (err) {
      showToast(err.message, true);
    }
  });
  ['product-search','product-category-filter','product-sort','product-status-filter'].forEach(id => {
    document.getElementById(id).addEventListener('input', renderProducts);
    document.getElementById(id).addEventListener('change', renderProducts);
  });
}

// ── APP INIT ──────────────────────────────────────────────
async function initApp() {
  await loadStoredProducts();
  renderProducts();
}

// ── BOOT ────────────────────────────────────────────────
document.addEventListener('DOMContentLoaded', () => {
  document.getElementById('btn-logout').addEventListener('click', async () => {
    if (!confirm('Deseja sair do painel?')) return;
    try { await apiFetch('/api/admin/logout', { method: 'POST' }); window.location.href = '/admin/login.html'; } catch (error) { showToast(error.message, true); }
  });

  setupNavigation();
  setupProductForm();
  setupModals();
  document.getElementById('retry-products').addEventListener('click', refreshCatalog);
  refreshCatalog();
  apiFetch('/api/admin/me').then(data => { document.querySelector('.admin-name').textContent = data.user; }).catch(() => {});
});

function renderCatalogSummary() {
 document.getElementById('summary-total').textContent = DB.products.length;
 document.getElementById('summary-active').textContent = DB.products.filter(p => p.status === 'active').length;
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
