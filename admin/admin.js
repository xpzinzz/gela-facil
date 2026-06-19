/* =====================================================
   GELA FÁCIL – ADMIN PANEL JAVASCRIPT
   Painel administrativo completo com:
   - Autenticação local
   - Navegação entre páginas
   - CRUD de Produtos
   - Controle de Estoque
   - Gestão de Pedidos
   - Clientes
   - Relatórios com Chart.js
   ===================================================== */

// ── DATA STORE ────────────────────────────────────────────
const DB = {
  products: [
    { id: 1, brand: 'Samsung', name: 'WindFree Inverter 12.000 BTU', category: 'inverter', price: 2399, oldPrice: 2899, stock: 8, minStock: 5, sku: 'SAM-WF-12K', specs: 'Inverter, 12.000 BTU, A+++', status: 'active', image: '../assets/produtos/samsung_windfree.png' },
    { id: 2, brand: 'LG', name: 'Dual Inverter Voice 9.000 BTU', category: 'inverter', price: 1849, oldPrice: 2199, stock: 3, minStock: 5, sku: 'LG-DI-9K', specs: 'Inverter, 9.000 BTU, Wi-Fi', status: 'active', image: '../assets/produtos/lg_dual_inverter.png' },
    { id: 3, brand: 'Midea', name: 'Xtreme Save Inverter 18.000 BTU', category: 'inverter', price: 2899, oldPrice: 3499, stock: 12, minStock: 5, sku: 'MID-XS-18K', specs: 'Inverter, 18.000 BTU, A++', status: 'active', image: '../assets/produtos/midea_xtreme_save.png' },
    { id: 4, brand: 'Elgin', name: 'Eco Inverter Plus 24.000 BTU', category: 'inverter', price: 3699, oldPrice: 4299, stock: 5, minStock: 4, sku: 'ELG-EI-24K', specs: 'Inverter, 24.000 BTU, Quente/Frio', status: 'active', image: '../assets/produtos/elgin_eco_inverter.png' },
    { id: 5, brand: 'Springer', name: 'Silentia 7.500 BTU Split', category: 'split', price: 1299, oldPrice: 1699, stock: 0, minStock: 4, sku: 'SPR-SL-7.5K', specs: 'Split, 7.500 BTU, Silencioso', status: 'active', image: '../assets/produtos/springer_silentia.png' },
    { id: 6, brand: 'Philco', name: 'Portable Portátil 12.000 BTU', category: 'portatil', price: 1749, oldPrice: 2099, stock: 2, minStock: 3, sku: 'PHI-PB-12K', specs: 'Portátil, 12.000 BTU, Sem obra', status: 'active', image: '../assets/produtos/philco_portable.png' },
    { id: 7, brand: 'Electrolux', name: 'Frigobar 122 Litros EM120', category: 'bebidas', price: 1209, oldPrice: 1809, stock: 7, minStock: 3, sku: 'ELX-FB-122L', specs: '122 Litros, Branco, 110V', status: 'active', image: '../assets/clima-bebidas/electrolux_frigobar.png' },
    { id: 8, brand: 'Electrolux', name: 'Cervejeira Home Bar EB100', category: 'bebidas', price: 2229, oldPrice: 2729, stock: 4, minStock: 3, sku: 'ELX-CB-100L', specs: '100 Litros, Frost Free, 110V', status: 'active', image: '../assets/clima-bebidas/electrolux_cervejeira.png' },
    { id: 9, brand: 'Venax', name: 'Cervejeira Blue Light 102L', category: 'bebidas', price: 2529, oldPrice: 3423, stock: 1, minStock: 3, sku: 'VNX-BL-102L', specs: '102 Litros, Blue Light, 220V', status: 'inactive', image: '../assets/clima-bebidas/venax_cervejeira.png' },
    { id: 10, brand: 'Electrolux', name: 'Cervejeira com Torre de Chopp EB10C', category: 'bebidas', price: 2799, oldPrice: 3693, stock: 0, minStock: 2, sku: 'ELX-TC-100L', specs: 'Torre de Chopp, 100 Litros, 110V', status: 'active', image: '../assets/clima-bebidas/electrolux_chopp.png' },
  ],

  orders: [
    { id: 'GF-2026001', customer: 'Ana Beatriz Santos', product: 'Samsung WindFree 12.000 BTU', value: 2399, date: '2026-06-18', status: 'pending', city: 'Vitória – ES', payment: 'Pix', phone: '(27) 99111-2233' },
    { id: 'GF-2026002', customer: 'Carlos Eduardo Lima', product: 'Midea Xtreme Save 18.000 BTU', value: 2899, date: '2026-06-18', status: 'processing', city: 'Vila Velha – ES', payment: 'Cartão Crédito', phone: '(27) 99222-3344' },
    { id: 'GF-2026003', customer: 'Fernanda Oliveira', product: 'LG Dual Inverter 9.000 BTU', value: 1849, date: '2026-06-17', status: 'shipped', city: 'Serra – ES', payment: 'Boleto', phone: '(27) 99333-4455' },
    { id: 'GF-2026004', customer: 'Marcelo Rocha', product: 'Elgin Eco Inverter 24.000 BTU', value: 3699, date: '2026-06-17', status: 'delivered', city: 'Cariacica – ES', payment: 'Pix', phone: '(27) 99444-5566' },
    { id: 'GF-2026005', customer: 'Juliana Matos', product: 'Electrolux Frigobar 122L', value: 1209, date: '2026-06-16', status: 'delivered', city: 'Vitória – ES', payment: 'Cartão Débito', phone: '(27) 99555-6677' },
    { id: 'GF-2026006', customer: 'Roberto Carvalho', product: 'Springer Silentia 7.500 BTU', value: 1299, date: '2026-06-16', status: 'cancelled', city: 'Vitória – ES', payment: 'Pix', phone: '(27) 99666-7788' },
    { id: 'GF-2026007', customer: 'Priscila Ferreira', product: 'Electrolux Cervejeira EB100', value: 2229, date: '2026-06-15', status: 'delivered', city: 'Serra – ES', payment: 'Cartão Crédito', phone: '(27) 99777-8899' },
    { id: 'GF-2026008', customer: 'Diego Almeida', product: 'Philco Portable 12.000 BTU', value: 1749, date: '2026-06-15', status: 'processing', city: 'Vila Velha – ES', payment: 'Pix', phone: '(27) 99888-9900' },
    { id: 'GF-2026009', customer: 'Tatiana Braga', product: 'Samsung WindFree 12.000 BTU', value: 2399, date: '2026-06-14', status: 'delivered', city: 'Vitória – ES', payment: 'Pix', phone: '(27) 99001-1122' },
    { id: 'GF-2026010', customer: 'Luiz Mendes', product: 'Cervejeira Torre de Chopp EB10C', value: 2799, date: '2026-06-13', status: 'pending', city: 'Serra – ES', payment: 'Cartão Crédito', phone: '(27) 99112-2334' },
  ],

  customers: [
    { id: 1, name: 'Ana Beatriz Santos', email: 'ana.santos@email.com', phone: '(27) 99111-2233', city: 'Vitória – ES', orders: 3, totalSpent: 7197 },
    { id: 2, name: 'Carlos Eduardo Lima', email: 'carlos.lima@email.com', phone: '(27) 99222-3344', city: 'Vila Velha – ES', orders: 2, totalSpent: 4748 },
    { id: 3, name: 'Fernanda Oliveira', email: 'fernanda.o@email.com', phone: '(27) 99333-4455', city: 'Serra – ES', orders: 1, totalSpent: 1849 },
    { id: 4, name: 'Marcelo Rocha', email: 'marcelo.rocha@email.com', phone: '(27) 99444-5566', city: 'Cariacica – ES', orders: 4, totalSpent: 12496 },
    { id: 5, name: 'Juliana Matos', email: 'juliana.matos@email.com', phone: '(27) 99555-6677', city: 'Vitória – ES', orders: 2, totalSpent: 3438 },
    { id: 6, name: 'Roberto Carvalho', email: 'roberto.cv@email.com', phone: '(27) 99666-7788', city: 'Vitória – ES', orders: 1, totalSpent: 0 },
    { id: 7, name: 'Priscila Ferreira', email: 'priscila.f@email.com', phone: '(27) 99777-8899', city: 'Serra – ES', orders: 5, totalSpent: 11145 },
    { id: 8, name: 'Diego Almeida', email: 'diego.almeida@email.com', phone: '(27) 99888-9900', city: 'Vila Velha – ES', orders: 2, totalSpent: 4148 },
  ],

  stockHistory: [
    { date: '2026-06-18', product: 'Samsung WindFree 12.000 BTU', type: 'in', qty: 5, user: 'Admin Gela' },
    { date: '2026-06-17', product: 'LG Dual Inverter 9.000 BTU', type: 'out', qty: 2, user: 'Admin Gela' },
    { date: '2026-06-16', product: 'Midea Xtreme Save 18.000 BTU', type: 'in', qty: 10, user: 'Admin Gela' },
    { date: '2026-06-15', product: 'Springer Silentia 7.500 BTU', type: 'out', qty: 4, user: 'Admin Gela' },
    { date: '2026-06-14', product: 'Electrolux Frigobar 122L', type: 'adjust', qty: 7, user: 'Admin Gela' },
    { date: '2026-06-13', product: 'Philco Portable 12.000 BTU', type: 'in', qty: 3, user: 'Admin Gela' },
    { date: '2026-06-12', product: 'Venax Cervejeira 102L', type: 'out', qty: 2, user: 'Admin Gela' },
    { date: '2026-06-11', product: 'Elgin Eco Inverter 24.000 BTU', type: 'in', qty: 5, user: 'Admin Gela' },
  ],

  nextProductId: 11,
  nextOrderId: 11,
};

let charts = {};
let currentOrderFilter = 'all';
let editingProductId = null;

// ── HELPERS ───────────────────────────────────────────────
const fmt = (n) => 'R$ ' + n.toLocaleString('pt-BR', { minimumFractionDigits: 0 });
const fmtDate = (d) => new Date(d + 'T00:00:00').toLocaleDateString('pt-BR');
const initials = (name) => name.split(' ').slice(0,2).map(w => w[0]).join('').toUpperCase();
const avatarColors = ['#4A91C4','#22C55E','#F59E0B','#EF4444','#8B5CF6','#EC4899','#06B6D4'];
const avatarColor = (name) => avatarColors[name.charCodeAt(0) % avatarColors.length];

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
function setupLogin() {
  const form = document.getElementById('login-form');
  const overlay = document.getElementById('login-overlay');
  const layout = document.getElementById('admin-layout');

  form.addEventListener('submit', (e) => {
    e.preventDefault();
    const user = document.getElementById('admin-user').value.trim();
    const pass = document.getElementById('admin-pass').value;
    const errEl = document.getElementById('login-error');

    if (user === 'admin' && pass === 'admin123') {
      errEl.classList.remove('visible');
      overlay.classList.add('hidden');
      layout.classList.add('visible');
      initApp();
    } else {
      errEl.classList.add('visible');
      document.getElementById('admin-user').classList.add('error');
      document.getElementById('admin-pass').classList.add('error');
      setTimeout(() => {
        document.getElementById('admin-user').classList.remove('error');
        document.getElementById('admin-pass').classList.remove('error');
      }, 600);
    }
  });

  document.getElementById('btn-logout').addEventListener('click', () => {
    layout.classList.remove('visible');
    overlay.classList.remove('hidden');
    form.reset();
  });
}

// ── NAVIGATION ────────────────────────────────────────────
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
    navItems.forEach(n => n.classList.remove('active'));
    pages.forEach(p => p.classList.remove('active'));
    const navEl = document.getElementById('nav-' + pageId);
    if (navEl) navEl.classList.add('active');
    const pageEl = document.getElementById('page-' + pageId);
    if (pageEl) pageEl.classList.add('active');
    pageTitle.textContent = pageTitles[pageId] || pageId;
    // Close mobile sidebar
    document.getElementById('sidebar').classList.remove('mobile-open');
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
  document.getElementById('mobile-menu-btn').addEventListener('click', () => {
    sidebar.classList.toggle('mobile-open');
  });
}

// ── DATE ──────────────────────────────────────────────────
function setTodayDate() {
  const now = new Date();
  const opts = { weekday: 'long', day: '2-digit', month: 'long', year: 'numeric' };
  document.getElementById('today-date').textContent = now.toLocaleDateString('pt-BR', opts);
}

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
function openModal(id) { document.getElementById(id).classList.add('open'); }
function closeModal(id) { document.getElementById(id).classList.remove('open'); }

// ── DASHBOARD ─────────────────────────────────────────────
function renderDashboard() {
  setTodayDate();
  renderRecentOrders();
  renderStockAlerts();
  renderStockBadge();
  renderCharts();
}

function renderRecentOrders() {
  const tbody = document.getElementById('recent-orders-body');
  const recent = DB.orders.slice(0, 5);
  tbody.innerHTML = recent.map(o => `
    <tr>
      <td><strong>${o.id}</strong></td>
      <td>${o.customer}</td>
      <td style="max-width:180px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap">${o.product}</td>
      <td><strong>${fmt(o.value)}</strong></td>
      <td>${getStatusBadge(o.status)}</td>
    </tr>
  `).join('');
}

function renderStockAlerts() {
  const list = document.getElementById('stock-alerts-list');
  const alerts = DB.products.filter(p => getStockStatus(p) !== 'ok');
  if (alerts.length === 0) {
    list.innerHTML = '<p style="color:var(--admin-muted);font-size:0.85rem;text-align:center;padding:20px">Nenhum alerta de estoque 🎉</p>';
    return;
  }
  list.innerHTML = alerts.map(p => {
    const st = getStockStatus(p);
    const iconCls = st === 'out' ? 'alert-icon-out' : 'alert-icon-low';
    const label = st === 'out' ? 'SEM' : 'BAIXO';
    return `
    <div class="stock-alert-item">
      <div class="stock-alert-icon ${iconCls}">${label}</div>
      <div class="stock-alert-info">
        <div class="stock-alert-name">${p.name}</div>
        <div class="stock-alert-qty">Qtd: ${p.stock} | Mín: ${p.minStock}</div>
      </div>
    </div>`;
  }).join('');
}

function renderStockBadge() {
  const alerts = DB.products.filter(p => getStockStatus(p) !== 'ok');
  const badge = document.getElementById('stock-alert-badge');
  if (alerts.length > 0) { badge.style.display = 'flex'; badge.textContent = alerts.length; }
  else badge.style.display = 'none';
}

// ── CHARTS ────────────────────────────────────────────────
Chart.defaults.color = '#8892A4';
Chart.defaults.font.family = "'Inter', sans-serif";

function renderCharts() {
  renderRevenueChart();
  renderCategoryChart();
}

function renderRevenueChart() {
  const ctx = document.getElementById('revenue-chart');
  if (!ctx) return;
  if (charts.revenue) { charts.revenue.destroy(); }
  const months = ['Jan','Fev','Mar','Abr','Mai','Jun','Jul','Ago','Set','Out','Nov','Dez'];
  const revenue = [52000, 61000, 58000, 73000, 68000, 84320, 0, 0, 0, 0, 0, 0];
  const meta = [60000, 65000, 65000, 70000, 75000, 80000, 85000, 88000, 90000, 92000, 95000, 100000];
  charts.revenue = new Chart(ctx, {
    type: 'bar',
    data: {
      labels: months,
      datasets: [
        {
          label: 'Receita',
          data: revenue,
          backgroundColor: 'rgba(74,145,196,0.7)',
          borderRadius: 6,
          borderSkipped: false,
        },
        {
          label: 'Meta',
          data: meta,
          type: 'line',
          borderColor: 'rgba(126,181,214,0.5)',
          backgroundColor: 'rgba(126,181,214,0.05)',
          borderWidth: 2,
          borderDash: [5,4],
          pointRadius: 3,
          pointBackgroundColor: 'rgba(126,181,214,0.7)',
          fill: false,
          tension: 0.4,
        }
      ]
    },
    options: {
      responsive: true, maintainAspectRatio: false,
      plugins: { legend: { display: false }, tooltip: { mode: 'index', intersect: false } },
      scales: {
        x: { grid: { color: 'rgba(255,255,255,0.05)' }, ticks: { color: '#8892A4' } },
        y: { grid: { color: 'rgba(255,255,255,0.05)' }, ticks: { color: '#8892A4', callback: v => 'R$' + (v/1000).toFixed(0)+'k' } }
      }
    }
  });
}

function renderCategoryChart() {
  const ctx = document.getElementById('category-chart');
  if (!ctx) return;
  if (charts.category) { charts.category.destroy(); }
  const categories = ['Inverter','Split','Portátil','Bebidas'];
  const data = [142, 48, 29, 28];
  const colors = ['#4A91C4','#22C55E','#F59E0B','#8B5CF6'];
  charts.category = new Chart(ctx, {
    type: 'doughnut',
    data: {
      labels: categories,
      datasets: [{ data, backgroundColor: colors, borderColor: 'var(--admin-card)', borderWidth: 3, hoverBorderWidth: 3 }]
    },
    options: {
      responsive: true, maintainAspectRatio: false, cutout: '68%',
      plugins: {
        legend: { display: false },
        tooltip: { callbacks: { label: ctx => ` ${ctx.label}: ${ctx.raw} pedidos` } }
      }
    }
  });
  const legend = document.getElementById('donut-legend');
  legend.innerHTML = categories.map((c, i) => `
    <div class="donut-legend-item">
      <span class="donut-legend-dot" style="background:${colors[i]}"></span>${c}: ${data[i]}
    </div>`).join('');
}

// Reports Charts
function renderReportCharts() {
  renderTopProductsChart();
  renderWeeklyChart();
  renderPaymentChart();
}

function renderTopProductsChart() {
  const ctx = document.getElementById('top-products-chart');
  if (!ctx) return;
  if (charts.topProducts) { charts.topProducts.destroy(); }
  const products = ['Samsung WindFree 12K','LG Dual Inv. 9K','Midea Xtreme 18K','Elgin Eco 24K','Electrolux Cerv.','Philco Portátil'];
  const values = [48200, 36980, 43485, 29592, 22290, 13992];
  charts.topProducts = new Chart(ctx, {
    type: 'bar',
    data: {
      labels: products,
      datasets: [{
        label: 'Receita (R$)',
        data: values,
        backgroundColor: ['#4A91C4','#22C55E','#F59E0B','#8B5CF6','#EC4899','#06B6D4'],
        borderRadius: 8, borderSkipped: false,
      }]
    },
    options: {
      responsive: true, maintainAspectRatio: false, indexAxis: 'y',
      plugins: { legend: { display: false }, tooltip: { callbacks: { label: ctx => ' R$ ' + ctx.raw.toLocaleString('pt-BR') } } },
      scales: {
        x: { grid: { color: 'rgba(255,255,255,0.05)' }, ticks: { callback: v => 'R$' + (v/1000).toFixed(0)+'k' } },
        y: { grid: { display: false }, ticks: { color: '#8892A4' } }
      }
    }
  });
}

function renderWeeklyChart() {
  const ctx = document.getElementById('weekly-chart');
  if (!ctx) return;
  if (charts.weekly) { charts.weekly.destroy(); }
  charts.weekly = new Chart(ctx, {
    type: 'line',
    data: {
      labels: ['Sem 1','Sem 2','Sem 3','Sem 4'],
      datasets: [{
        label: 'Receita',
        data: [18200, 22100, 21040, 22980],
        borderColor: '#4A91C4',
        backgroundColor: 'rgba(74,145,196,0.1)',
        fill: true, tension: 0.4, pointRadius: 5,
        pointBackgroundColor: '#4A91C4', borderWidth: 2.5,
      }]
    },
    options: {
      responsive: true, maintainAspectRatio: false,
      plugins: { legend: { display: false } },
      scales: {
        x: { grid: { color: 'rgba(255,255,255,0.05)' } },
        y: { grid: { color: 'rgba(255,255,255,0.05)' }, ticks: { callback: v => 'R$' + (v/1000).toFixed(0)+'k' } }
      }
    }
  });
}

function renderPaymentChart() {
  const ctx = document.getElementById('payment-chart');
  if (!ctx) return;
  if (charts.payment) { charts.payment.destroy(); }
  const methods = ['Pix','Cartão Crédito','Cartão Débito','Boleto'];
  const data = [48, 32, 12, 8];
  const colors = ['#22C55E','#4A91C4','#F59E0B','#8B5CF6'];
  charts.payment = new Chart(ctx, {
    type: 'doughnut',
    data: {
      labels: methods,
      datasets: [{ data, backgroundColor: colors, borderColor: 'var(--admin-card)', borderWidth: 3 }]
    },
    options: {
      responsive: true, maintainAspectRatio: false, cutout: '65%',
      plugins: { legend: { display: false }, tooltip: { callbacks: { label: ctx => ` ${ctx.label}: ${ctx.raw}%` } } }
    }
  });
  const legend = document.getElementById('payment-legend');
  legend.innerHTML = methods.map((m, i) => `
    <div class="donut-legend-item">
      <span class="donut-legend-dot" style="background:${colors[i]}"></span>${m}: ${data[i]}%
    </div>`).join('');
}

// ── PRODUCTS ──────────────────────────────────────────────
function renderProducts() {
  const searchTerm = document.getElementById('product-search').value.toLowerCase();
  const catFilter = document.getElementById('product-category-filter').value;
  const sort = document.getElementById('product-sort').value;

  let list = DB.products.filter(p => {
    const matchSearch = p.name.toLowerCase().includes(searchTerm) || p.brand.toLowerCase().includes(searchTerm) || p.sku.toLowerCase().includes(searchTerm);
    const matchCat = catFilter === 'all' || p.category === catFilter;
    return matchSearch && matchCat;
  });

  if (sort === 'name') list.sort((a, b) => a.name.localeCompare(b.name));
  else if (sort === 'price-asc') list.sort((a, b) => a.price - b.price);
  else if (sort === 'price-desc') list.sort((a, b) => b.price - a.price);
  else if (sort === 'stock') list.sort((a, b) => a.stock - b.stock);

  const tbody = document.getElementById('products-body');
  tbody.innerHTML = list.map(p => {
    const st = getStockStatus(p);
    const letter = (p.brand[0] || 'P').toUpperCase();
    return `
    <tr>
      <td>
        <div class="product-thumb">
          <div class="product-thumb-fallback" style="background:${avatarColor(p.brand)}22;color:${avatarColor(p.brand)}">${letter}</div>
          <div class="product-thumb-info">
            <strong>${p.name}</strong>
            <span>${p.brand} · ${p.sku}</span>
          </div>
        </div>
      </td>
      <td>${p.category.charAt(0).toUpperCase() + p.category.slice(1)}</td>
      <td><strong>${fmt(p.price)}</strong>${p.oldPrice ? `<br><small style="color:var(--admin-muted);text-decoration:line-through">${fmt(p.oldPrice)}</small>` : ''}</td>
      <td>
        <div class="stock-progress-wrap">
          <div class="stock-progress-bar"><div class="stock-progress-fill fill-${st}" style="width:${Math.min(100, (p.stock / Math.max(p.minStock*2,1))*100)}%"></div></div>
          <span class="stock-progress-num">${p.stock}</span>
        </div>
      </td>
      <td>${getStatusBadge(p.status)}</td>
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
  }).join('');
}

function openAddProduct() {
  editingProductId = null;
  document.getElementById('product-modal-title').textContent = 'Novo Produto';
  document.getElementById('product-form').reset();
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
  document.getElementById('prod-sku').value = p.sku;
  document.getElementById('prod-specs').value = p.specs;
  openModal('product-modal-overlay');
}
function deleteProduct(id) {
  if (!confirm('Tem certeza que deseja excluir este produto?')) return;
  const idx = DB.products.findIndex(p => p.id === id);
  if (idx !== -1) { DB.products.splice(idx, 1); renderProducts(); renderStockAlerts(); renderStockBadge(); showToast('Produto excluído com sucesso.'); }
}

function setupProductForm() {
  document.getElementById('btn-add-product').addEventListener('click', openAddProduct);
  document.getElementById('product-form').addEventListener('submit', (e) => {
    e.preventDefault();
    const data = {
      name: document.getElementById('prod-name').value.trim(),
      brand: document.getElementById('prod-brand').value.trim(),
      category: document.getElementById('prod-category').value,
      status: document.getElementById('prod-status').value,
      price: parseFloat(document.getElementById('prod-price').value),
      oldPrice: parseFloat(document.getElementById('prod-old-price').value) || null,
      stock: parseInt(document.getElementById('prod-stock').value),
      sku: document.getElementById('prod-sku').value.trim(),
      specs: document.getElementById('prod-specs').value.trim(),
      minStock: 3,
    };
    if (editingProductId) {
      const idx = DB.products.findIndex(p => p.id === editingProductId);
      if (idx !== -1) Object.assign(DB.products[idx], data);
      showToast('Produto atualizado com sucesso!');
    } else {
      DB.products.push({ id: DB.nextProductId++, ...data, image: '' });
      showToast('Produto adicionado com sucesso!');
    }
    closeModal('product-modal-overlay');
    renderProducts();
    renderStockAlerts();
    renderStockBadge();
    populateStockProductSelect();
  });
  ['product-search','product-category-filter','product-sort'].forEach(id => {
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
    const matchSearch = p.name.toLowerCase().includes(search) || p.sku.toLowerCase().includes(search);
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
    return `
    <tr>
      <td>
        <div class="product-thumb">
          <div class="product-thumb-fallback" style="background:${avatarColor(p.brand)}22;color:${avatarColor(p.brand)}">${p.brand[0]}</div>
          <div class="product-thumb-info"><strong>${p.name}</strong><span>${p.brand}</span></div>
        </div>
      </td>
      <td><code style="background:rgba(255,255,255,0.05);padding:3px 8px;border-radius:5px;font-size:0.78rem">${p.sku}</code></td>
      <td>${p.category}</td>
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
        </div>
      </td>
    </tr>`;
  }).join('');

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
      <td>${h.product}</td>
      <td><span style="color:${typeColor};font-weight:700">${typeLabel}</span></td>
      <td><strong>${h.qty} un.</strong></td>
      <td>${h.user}</td>
    </tr>`;
  }).join('');
}

function populateStockProductSelect() {
  const sel = document.getElementById('stock-product-select');
  sel.innerHTML = DB.products.map(p => `<option value="${p.id}">${p.name} (${p.stock} em estoque)</option>`).join('');
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
  document.getElementById('stock-form').addEventListener('submit', (e) => {
    e.preventDefault();
    const productId = parseInt(document.getElementById('stock-product-select').value);
    const type = document.getElementById('stock-type').value;
    const qty = parseInt(document.getElementById('stock-qty').value);
    const note = document.getElementById('stock-note').value.trim();

    const product = DB.products.find(p => p.id === productId);
    if (!product) return;

    if (type === 'in') product.stock += qty;
    else if (type === 'out') product.stock = Math.max(0, product.stock - qty);
    else if (type === 'adjust') product.stock = qty;

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
    renderStockAlerts();
    renderStockBadge();
    renderDashboard();
    showToast('Estoque atualizado com sucesso!');
  });

  ['stock-search','stock-status-filter'].forEach(id => {
    document.getElementById(id).addEventListener('input', renderStock);
    document.getElementById(id).addEventListener('change', renderStock);
  });
}

// ── ORDERS ────────────────────────────────────────────────
function renderOrders() {
  const search = document.getElementById('order-search').value.toLowerCase();
  const filter = currentOrderFilter;
  const dateFilter = document.getElementById('order-date-filter').value;
  const today = new Date().toISOString().split('T')[0];
  const weekAgo = new Date(Date.now() - 7*24*60*60*1000).toISOString().split('T')[0];

  let list = DB.orders.filter(o => {
    const matchSearch = o.id.toLowerCase().includes(search) || o.customer.toLowerCase().includes(search);
    const matchStatus = filter === 'all' || o.status === filter;
    let matchDate = true;
    if (dateFilter === 'today') matchDate = o.date === today;
    else if (dateFilter === 'week') matchDate = o.date >= weekAgo;
    else if (dateFilter === 'month') matchDate = o.date.startsWith(today.slice(0,7));
    return matchSearch && matchStatus && matchDate;
  });

  // Update tab counts
  const statuses = ['all','pending','processing','shipped','delivered','cancelled'];
  statuses.forEach(s => {
    const count = s === 'all' ? DB.orders.length : DB.orders.filter(o => o.status === s).length;
    const el = document.getElementById('tab-count-' + s);
    if (el) el.textContent = count;
  });

  const tbody = document.getElementById('orders-body');
  tbody.innerHTML = list.map(o => `
    <tr>
      <td><strong style="color:var(--admin-blue)">${o.id}</strong></td>
      <td>
        <div class="product-thumb">
          <div class="customer-avatar" style="background:${avatarColor(o.customer)}22;color:${avatarColor(o.customer)}">${initials(o.customer)}</div>
          <span>${o.customer}</span>
        </div>
      </td>
      <td style="max-width:160px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap">${o.product}</td>
      <td><strong>${fmt(o.value)}</strong></td>
      <td>${fmtDate(o.date)}</td>
      <td>${getStatusBadge(o.status)}</td>
      <td>
        <div class="action-btns">
          <button class="btn-action" title="Ver detalhes" onclick="openOrderDetail('${o.id}')">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>
          </button>
        </div>
      </td>
    </tr>`).join('');

  // Orders new badge
  const newBadge = document.getElementById('orders-new-badge');
  const pendingCount = DB.orders.filter(o => o.status === 'pending').length;
  newBadge.textContent = pendingCount;
  newBadge.style.display = pendingCount > 0 ? 'flex' : 'none';
}

function openOrderDetail(orderId) {
  const o = DB.orders.find(x => x.id === orderId);
  if (!o) return;
  document.getElementById('order-modal-title').textContent = `Pedido ${o.id}`;
  document.getElementById('order-modal-body').innerHTML = `
    <div class="order-detail-grid">
      <div class="order-detail-item"><label>Cliente</label><span>${o.customer}</span></div>
      <div class="order-detail-item"><label>Telefone</label><span>${o.phone}</span></div>
      <div class="order-detail-item"><label>Produto</label><span>${o.product}</span></div>
      <div class="order-detail-item"><label>Valor</label><span>${fmt(o.value)}</span></div>
      <div class="order-detail-item"><label>Data do Pedido</label><span>${fmtDate(o.date)}</span></div>
      <div class="order-detail-item"><label>Cidade</label><span>${o.city}</span></div>
      <div class="order-detail-item"><label>Pagamento</label><span>${o.payment}</span></div>
      <div class="order-detail-item"><label>Status Atual</label><span>${getStatusBadge(o.status)}</span></div>
    </div>
    <div class="section-divider" style="margin:16px 0"></div>
    <div class="order-status-update">
      <label>Atualizar Status:</label>
      <select class="settings-input" id="order-status-select" style="flex:1;min-width:150px">
        <option value="pending" ${o.status==='pending'?'selected':''}>Pendente</option>
        <option value="processing" ${o.status==='processing'?'selected':''}>Processando</option>
        <option value="shipped" ${o.status==='shipped'?'selected':''}>Enviado</option>
        <option value="delivered" ${o.status==='delivered'?'selected':''}>Entregue</option>
        <option value="cancelled" ${o.status==='cancelled'?'selected':''}>Cancelado</option>
      </select>
      <button class="btn-primary-admin" onclick="updateOrderStatus('${o.id}')">Salvar</button>
    </div>`;
  openModal('order-modal-overlay');
}

function updateOrderStatus(orderId) {
  const newStatus = document.getElementById('order-status-select').value;
  const o = DB.orders.find(x => x.id === orderId);
  if (o) { o.status = newStatus; renderOrders(); showToast('Status do pedido atualizado!'); closeModal('order-modal-overlay'); }
}

function setupOrders() {
  document.querySelectorAll('.status-tab').forEach(tab => {
    tab.addEventListener('click', () => {
      document.querySelectorAll('.status-tab').forEach(t => t.classList.remove('active'));
      tab.classList.add('active');
      currentOrderFilter = tab.dataset.status;
      renderOrders();
    });
  });
  ['order-search','order-date-filter'].forEach(id => {
    document.getElementById(id).addEventListener('input', renderOrders);
    document.getElementById(id).addEventListener('change', renderOrders);
  });
  document.getElementById('btn-new-order').addEventListener('click', () => showToast('Funcionalidade de novo pedido manual em breve!'));
}

// ── CUSTOMERS ─────────────────────────────────────────────
function renderCustomers() {
  const search = document.getElementById('customer-search').value.toLowerCase();
  const sort = document.getElementById('customer-sort').value;

  let list = DB.customers.filter(c => c.name.toLowerCase().includes(search) || c.email.toLowerCase().includes(search));
  if (sort === 'name') list.sort((a,b) => a.name.localeCompare(b.name));
  else if (sort === 'orders') list.sort((a,b) => b.orders - a.orders);
  else if (sort === 'value') list.sort((a,b) => b.totalSpent - a.totalSpent);

  const tbody = document.getElementById('customers-body');
  tbody.innerHTML = list.map(c => `
    <tr>
      <td>
        <div class="product-thumb">
          <div class="customer-avatar" style="background:${avatarColor(c.name)}22;color:${avatarColor(c.name)}">${initials(c.name)}</div>
          <strong>${c.name}</strong>
        </div>
      </td>
      <td style="color:var(--admin-muted)">${c.email}</td>
      <td>${c.phone}</td>
      <td><strong>${c.orders}</strong></td>
      <td><strong>${fmt(c.totalSpent)}</strong></td>
      <td>${c.city}</td>
      <td>
        <div class="action-btns">
          <button class="btn-action" title="Detalhes" onclick="showToast('Perfil do cliente em breve!')">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>
          </button>
          <button class="btn-action" title="Mensagem via WhatsApp" onclick="window.open('https://wa.me/55${c.phone.replace(/\D/g,'')}','_blank')">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"/></svg>
          </button>
        </div>
      </td>
    </tr>`).join('');
}

function setupCustomers() {
  ['customer-search','customer-sort'].forEach(id => {
    document.getElementById(id).addEventListener('input', renderCustomers);
    document.getElementById(id).addEventListener('change', renderCustomers);
  });
  document.getElementById('btn-add-customer').addEventListener('click', () => showToast('Formulário de novo cliente em breve!'));
}

// ── REPORTS ───────────────────────────────────────────────
function setupReports() {
  document.getElementById('btn-export-full').addEventListener('click', () => {
    exportCSV();
  });
}

function exportCSV() {
  const rows = [['ID','Produto','Marca','Categoria','Preço','Estoque','Status']];
  DB.products.forEach(p => rows.push([p.id, p.name, p.brand, p.category, p.price, p.stock, p.status]));
  const csv = rows.map(r => r.join(',')).join('\n');
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a'); a.href = url; a.download = 'gelafacil_produtos.csv'; a.click();
  URL.revokeObjectURL(url);
  showToast('CSV exportado com sucesso!');
}

// ── EXPORT BUTTON ─────────────────────────────────────────
function setupExport() {
  document.getElementById('export-report-btn').addEventListener('click', () => {
    exportCSV();
  });
}

// ── GLOBAL SEARCH ─────────────────────────────────────────
function setupGlobalSearch() {
  document.getElementById('global-search').addEventListener('input', function () {
    const q = this.value.toLowerCase();
    if (!q) return;
    // Navigate to products if matches product
    const match = DB.products.find(p => p.name.toLowerCase().includes(q) || p.brand.toLowerCase().includes(q));
    if (match) {
      document.getElementById('product-search').value = this.value;
    }
  });
}

// ── OBSERVER: render charts when reports page becomes visible ──
function setupPageObserver() {
  let reportsRendered = false;
  const observer = new MutationObserver(() => {
    const reportsPage = document.getElementById('page-reports');
    if (reportsPage && reportsPage.classList.contains('active') && !reportsRendered) {
      renderReportCharts();
      reportsRendered = true;
    }
  });
  observer.observe(document.getElementById('page-reports'), { attributes: true, attributeFilter: ['class'] });
}

// ── NOTIFICATION BUTTON ───────────────────────────────────
function setupNotifications() {
  document.getElementById('notif-btn').addEventListener('click', () => {
    showToast('4 novos alertas: 3 pedidos pendentes, 1 estoque crítico.');
  });
}

// ── SETTINGS ──────────────────────────────────────────────
function setupSettings() {
  document.querySelectorAll('.settings-form button.btn-primary-admin').forEach(btn => {
    btn.addEventListener('click', () => showToast('Configurações salvas com sucesso!'));
  });
}

// ── APP INIT ──────────────────────────────────────────────
function initApp() {
  renderDashboard();
  renderProducts();
  renderStock();
  renderOrders();
  renderCustomers();
  setupPageObserver();
}

// ── BOOT ────────────────────────────────────────────────
document.addEventListener('DOMContentLoaded', () => {
  // Logout apenas redireciona para uma página ou faz reload (sem login por enquanto)
  document.getElementById('btn-logout').addEventListener('click', () => {
    if (confirm('Deseja sair do painel?')) location.reload();
  });

  setupNavigation();
  setupProductForm();
  setupStockForm();
  setupOrders();
  setupCustomers();
  setupReports();
  setupExport();
  setupGlobalSearch();
  setupModals();
  setupNotifications();
  setupSettings();

  // Inicializa o app direto (sem login)
  initApp();
});
