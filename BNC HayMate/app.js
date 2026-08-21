'use strict';

// ============================================================
// CONFIGURATION - Replace with your Supabase credentials
// ============================================================
const SUPABASE_URL = 'YOUR_SUPABASE_URL';
const SUPABASE_ANON_KEY = 'YOUR_SUPABASE_ANON_KEY';

const IS_CONFIGURED = SUPABASE_URL !== 'YOUR_SUPABASE_URL' && SUPABASE_ANON_KEY !== 'YOUR_SUPABASE_ANON_KEY';

// ============================================================
// PART 2: Application State
// ============================================================
const state = {
  user: null,
  profile: null,
  store: null,
  storeSettings: null,
  page: 'dashboard',
  products: [],
  categories: [],
  orders: [],
  customers: [],
  reviews: [],
  promotions: [],
  stockMovements: [],
  cart: {},
  cartCustomer: null,
  cartPromo: null,
  ordersPage: 1,
  customersPage: 1,
  productsPage: 1,
  ordersFilter: { status: '', search: '', date: '' },
  productsFilter: { category: '', search: '' },
  customersFilter: { tag: '', search: '' },
  selectedOrder: null,
  selectedCustomer: null,
  selectedProduct: null,
  sidebarCollapsed: false,
  darkMode: false,
  channels: [],
  notifications: [],
  reportPeriod: 'monthly',
  settingsTab: 'store',
  storeTab: 'home',
  storeLastOrderId: null,
};

// ============================================================
// PART 3: Supabase Init
// ============================================================
let supabase = null;

function initSupabase() {
  if (!IS_CONFIGURED) return false;
  if (!window.supabase) {
    console.error('Supabase client not loaded');
    return false;
  }
  const { createClient } = window.supabase;
  supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
    realtime: { params: { eventsPerSecond: 10 } }
  });
  return true;
}

// ============================================================
// PART 4: DOM Helpers
// ============================================================
const $ = (sel, ctx = document) => ctx.querySelector(sel);
const $$ = (sel, ctx = document) => [...ctx.querySelectorAll(sel)];

function el(tag, attrs = {}, children = []) {
  const element = document.createElement(tag);
  Object.entries(attrs).forEach(([k, v]) => {
    if (k === 'class') element.className = v;
    else if (k === 'html') element.innerHTML = v;
    else if (k === 'text') element.textContent = v;
    else if (k.startsWith('on') && typeof v === 'function') element.addEventListener(k.slice(2).toLowerCase(), v);
    else element.setAttribute(k, v);
  });
  children.forEach(child => {
    if (typeof child === 'string') element.appendChild(document.createTextNode(child));
    else if (child) element.appendChild(child);
  });
  return element;
}

function money(amount, currency = 'THB') {
  const sym = currency === 'THB' ? '฿' : currency;
  return `${sym}${Number(amount || 0).toLocaleString('th-TH', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}

function escapeHTML(str) {
  if (!str) return '';
  return String(str).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;').replace(/'/g,'&#39;');
}

function formatDate(dateStr) {
  if (!dateStr) return '-';
  return new Date(dateStr).toLocaleDateString('th-TH', { year:'numeric', month:'short', day:'numeric', hour:'2-digit', minute:'2-digit' });
}

function formatDateShort(dateStr) {
  if (!dateStr) return '-';
  return new Date(dateStr).toLocaleDateString('th-TH', { month:'short', day:'numeric' });
}

function getInitials(name) {
  if (!name) return '?';
  return name.split(' ').map(w => w[0]).join('').toUpperCase().slice(0, 2);
}

// ============================================================
// PART 5: Toast System
// ============================================================
function toast(message, type = 'success', duration = 4000) {
  let container = $('#toast-container');
  if (!container) {
    container = el('div', { id: 'toast-container', class: 'fixed bottom-4 right-4 z-50 flex flex-col gap-2' });
    document.body.appendChild(container);
  }
  const icons = { success: '✓', error: '✕', warning: '⚠', info: 'ℹ' };
  const t = el('div', { class: `toast toast-${type} flex items-center p-4 bg-white shadow-lg rounded-lg border-l-4 ${type === 'success' ? 'border-green-500' : type === 'error' ? 'border-red-500' : 'border-blue-500'} mb-2 transition-all` }, [
    el('div', { class: 'toast-icon mr-3 text-lg font-bold' }, [icons[type] || 'ℹ']),
    el('div', { class: 'toast-content flex-grow' }, [
      el('div', { class: 'toast-message text-gray-800', text: message })
    ]),
    el('button', { class: 'toast-close ml-3 text-gray-400 hover:text-gray-600', onclick: () => t.remove() }, ['×'])
  ]);
  container.appendChild(t);
  
  if (type !== 'info') {
    state.notifications.unshift({ message, type, time: new Date() });
    updateNotifBadge();
  }
  
  setTimeout(() => {
    t.style.opacity = '0';
    setTimeout(() => t.remove(), 300);
  }, duration);
}

// ============================================================
// PART 6: Modal System
// ============================================================
function openModal({ title, body, actions = [], size = 'md' }) {
  const overlay = $('#modal-overlay');
  const box = $('#modal-box');
  const titleEl = $('#modal-title');
  const bodyEl = $('#modal-body');
  const footerEl = $('#modal-footer');
  
  if (!overlay || !box || !titleEl || !bodyEl || !footerEl) return;
  
  box.className = `modal-box modal-${size} bg-white rounded-lg shadow-xl w-full max-w-${size === 'md' ? 'md' : size === 'lg' ? '2xl' : 'sm'} p-6 flex flex-col mx-4 max-h-[90vh] overflow-hidden`;
  titleEl.textContent = title;
  
  if (typeof body === 'string') bodyEl.innerHTML = body;
  else { bodyEl.innerHTML = ''; bodyEl.appendChild(body); }
  
  footerEl.innerHTML = '';
  actions.forEach(action => {
    const btn = el('button', {
      class: `btn ${action.class || 'btn-outline'} px-4 py-2 rounded-md font-medium`,
      onclick: action.handler
    }, [action.label]);
    footerEl.appendChild(btn);
  });
  
  overlay.style.display = 'flex';
  box.style.animation = 'modalIn 0.2s ease';
}

function closeModal() {
  const overlay = $('#modal-overlay');
  if (overlay) overlay.style.display = 'none';
  const body = $('#modal-body');
  if (body) body.innerHTML = '';
  const footer = $('#modal-footer');
  if (footer) footer.innerHTML = '';
}

function confirmDialog({ title, message, icon = '⚠️', onConfirm, confirmLabel = 'Confirm', confirmClass = 'btn-danger bg-red-600 text-white' }) {
  return new Promise((resolve) => {
    let overlay = $('#confirm-overlay');
    if (!overlay) {
      overlay = el('div', { id: 'confirm-overlay', class: 'fixed inset-0 bg-black bg-opacity-50 z-[60] hidden items-center justify-center' }, [
        el('div', { class: 'bg-white rounded-lg p-6 max-w-sm w-full mx-4 text-center' }, [
          el('div', { id: 'confirm-icon', class: 'text-4xl mb-4' }),
          el('h3', { id: 'confirm-title', class: 'text-xl font-bold mb-2' }),
          el('p', { id: 'confirm-message', class: 'text-gray-600 mb-6' }),
          el('div', { class: 'flex justify-center gap-4' }, [
            el('button', { id: 'confirm-cancel', class: 'px-4 py-2 bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300' }, ['Cancel']),
            el('button', { id: 'confirm-ok', class: 'px-4 py-2 rounded-md font-medium' })
          ])
        ])
      ]);
      document.body.appendChild(overlay);
    }
    
    $('#confirm-title').textContent = title;
    $('#confirm-message').textContent = message;
    $('#confirm-icon').textContent = icon;
    $('#confirm-ok').textContent = confirmLabel;
    $('#confirm-ok').className = `px-4 py-2 rounded-md font-medium ${confirmClass}`;
    
    overlay.style.display = 'flex';
    
    $('#confirm-ok').onclick = () => {
      overlay.style.display = 'none';
      resolve(true);
      if (onConfirm) onConfirm();
    };
    
    $('#confirm-cancel').onclick = () => {
      overlay.style.display = 'none';
      resolve(false);
    };
  });
}

function showLoading() { 
  const el = $('#loading-overlay');
  if (el) el.style.display = 'flex'; 
}
function hideLoading() { 
  const el = $('#loading-overlay');
  if (el) el.style.display = 'none'; 
}

// ============================================================
// PART 7: Empty State & Pagination
// ============================================================
function emptyState(emoji, title, subtitle = '', action = null) {
  return `
    <div class="empty-state flex flex-col items-center justify-center p-12 text-center">
      <div class="empty-state-emoji text-6xl mb-4">${emoji}</div>
      <div class="empty-state-title text-xl font-bold text-gray-800">${escapeHTML(title)}</div>
      ${subtitle ? `<div class="empty-state-sub text-gray-500 mt-2">${escapeHTML(subtitle)}</div>` : ''}
      ${action ? `<button class="btn btn-primary mt-6 px-4 py-2 bg-blue-600 text-white rounded-md" onclick="${action.handler}">${escapeHTML(action.label)}</button>` : ''}
    </div>
  `;
}

function renderPagination(container, currentPage, totalPages, onPageChange) {
  if (!container) return;
  if (totalPages <= 1) { container.innerHTML = ''; return; }
  let html = '<div class="pagination flex gap-2 justify-center mt-6">';
  html += `<button class="page-btn px-3 py-1 border rounded ${currentPage === 1 ? 'opacity-50 cursor-not-allowed' : 'hover:bg-gray-100'}" ${currentPage === 1 ? 'disabled' : ''} data-page="${currentPage - 1}">←</button>`;
  for (let i = 1; i <= totalPages; i++) {
    if (i === 1 || i === totalPages || (i >= currentPage - 2 && i <= currentPage + 2)) {
      html += `<button class="page-btn px-3 py-1 border rounded ${i === currentPage ? 'bg-blue-600 text-white font-bold' : 'hover:bg-gray-100'}" data-page="${i}">${i}</button>`;
    } else if (i === currentPage - 3 || i === currentPage + 3) {
      html += `<span class="page-ellipsis px-2 self-center text-gray-400">…</span>`;
    }
  }
  html += `<button class="page-btn px-3 py-1 border rounded ${currentPage === totalPages ? 'opacity-50 cursor-not-allowed' : 'hover:bg-gray-100'}" ${currentPage === totalPages ? 'disabled' : ''} data-page="${currentPage + 1}">→</button>`;
  html += '</div>';
  container.innerHTML = html;
  
  container.querySelectorAll('.page-btn[data-page]').forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.preventDefault();
      const p = parseInt(btn.dataset.page, 10);
      if (p < 1 || p > totalPages || p === currentPage) return;
      if (typeof onPageChange === 'function') onPageChange(p);
      else if (typeof window[onPageChange] === 'function') window[onPageChange](p);
    });
  });
}

function badge(text, type = 'muted') {
  const colors = {
    muted: 'bg-gray-100 text-gray-800',
    info: 'bg-blue-100 text-blue-800',
    success: 'bg-green-100 text-green-800',
    warning: 'bg-yellow-100 text-yellow-800',
    danger: 'bg-red-100 text-red-800'
  };
  return `<span class="badge ${colors[type] || colors.muted} px-2 py-1 rounded text-xs font-semibold whitespace-nowrap">${escapeHTML(String(text))}</span>`;
}

function statusBadge(status) {
  const map = {
    waiting: ['Waiting', 'info'],
    verify: ['Verify', 'warning'],
    preparing: ['Preparing', 'warning'],
    completed: ['Completed', 'success'],
    cancelled: ['Cancelled', 'danger'],
    active: ['Active', 'success'],
    inactive: ['Inactive', 'muted'],
    out_of_stock: ['Out of Stock', 'danger'],
    paid: ['Paid', 'success'],
    pending: ['Pending', 'warning'],
    refunded: ['Refunded', 'danger'],
  };
  const [label, type] = map[status] || [status, 'muted'];
  return badge(label, type);
}

// ============================================================
// PART 8: Theme System
// ============================================================
function initTheme() {
  const saved = localStorage.getItem('haypos_theme') || 'light';
  state.darkMode = saved === 'dark';
  applyTheme();
}

function applyTheme() {
  document.documentElement.setAttribute('data-theme', state.darkMode ? 'dark' : 'light');
  if (state.darkMode) {
    document.documentElement.classList.add('dark');
  } else {
    document.documentElement.classList.remove('dark');
  }
  const btn = $('#theme-toggle');
  if (btn) btn.textContent = state.darkMode ? '☀️' : '🌙';
}

function toggleTheme() {
  state.darkMode = !state.darkMode;
  localStorage.setItem('haypos_theme', state.darkMode ? 'dark' : 'light');
  applyTheme();
}

async function initApp() {
  initTheme();
  
  if (IS_CONFIGURED) {
    const initialized = initSupabase();
    if (initialized) {
      try {
        supabase.auth.onAuthStateChange(async (event, session) => {
          if (event === 'SIGNED_IN' && session) {
            await handleSignIn(session.user);
          } else if (event === 'SIGNED_OUT') {
            handleSignOut();
          }
        });
        
        const { data: { session } } = await supabase.auth.getSession();
        if (session) {
          await handleSignIn(session.user);
        } else {
          showAuthScreen();
        }
        return;
      } catch (err) {
        console.warn('Supabase auth error, starting demo mode', err);
      }
    }
  }
  
  // Auto-launch live interactive demo mode by default
  startDemoMode();
}

async function handleSignIn(user) {
  showLoading();
  state.user = user;
  
  try {
    const { data: profile, error: pErr } = await supabase
      .from('profiles')
      .select('*')
      .eq('user_id', user.id)
      .single();
    
    if (pErr || !profile) {
      hideLoading();
      showAuthScreen();
      toast('Account not linked to a store. Please contact your administrator.', 'error');
      await supabase.auth.signOut();
      return;
    }
    
    state.profile = profile;
    
    const { data: store, error: sErr } = await supabase
      .from('stores')
      .select('*')
      .eq('id', profile.store_id)
      .single();
    
    if (sErr || !store) {
      hideLoading();
      toast('Store not found', 'error');
      await supabase.auth.signOut();
      return;
    }
    
    state.store = store;
    
    const { data: settings } = await supabase
      .from('store_settings')
      .select('*')
      .eq('store_id', profile.store_id)
      .single();
    
    state.storeSettings = settings;
    
    await loadInitialData();
    setupRealtimeSubscriptions();
    
    showAppScreen();
    renderUserInfo();
    renderSidebar();
    navigateTo('dashboard');
    
  } catch (err) {
    console.error('Sign in error:', err);
    toast('Failed to load application data', 'error');
  } finally {
    hideLoading();
  }
}

function handleSignOut() {
  state.channels.forEach(channel => supabase.removeChannel(channel));
  state.channels = [];
  
  state.user = null;
  state.profile = null;
  state.store = null;
  state.storeSettings = null;
  state.products = [];
  state.categories = [];
  state.orders = [];
  state.customers = [];
  state.reviews = [];
  state.promotions = [];
  state.cart = {};
  state.notifications = [];
  
  showAuthScreen();
}

async function logout() {
  const confirmed = await confirmDialog({
    title: 'Sign Out',
    message: 'Are you sure you want to sign out?',
    icon: '👋',
    confirmLabel: 'Sign Out',
    confirmClass: 'bg-red-600 text-white'
  });
  if (!confirmed) return;
  if (supabase) {
    await supabase.auth.signOut();
  } else {
    handleSignOut();
  }
}

async function loadInitialData() {
  const storeId = state.store.id;
  const [cats, prods, custs, ords, revs, promos] = await Promise.all([
    supabase.from('categories').select('*').eq('store_id', storeId).order('sort_order'),
    supabase.from('products').select('*, categories(name)').eq('store_id', storeId).order('name'),
    supabase.from('customers').select('*').eq('store_id', storeId).order('created_at', { ascending: false }),
    supabase.from('orders').select('*, customers(name), order_items(*)').eq('store_id', storeId).order('created_at', { ascending: false }).limit(100),
    supabase.from('reviews').select('*').eq('store_id', storeId).order('created_at', { ascending: false }),
    supabase.from('promotions').select('*').eq('store_id', storeId).order('created_at', { ascending: false }),
  ]);
  
  if (cats.data) state.categories = cats.data;
  if (prods.data) state.products = prods.data;
  if (custs.data) state.customers = custs.data;
  if (ords.data) state.orders = ords.data;
  if (revs.data) state.reviews = revs.data;
  if (promos.data) state.promotions = promos.data;
}

// ============================================================
// PART 10: Screen Management
// ============================================================
function showSetupScreen() {
  if ($('#setup-screen')) $('#setup-screen').style.display = 'flex';
  if ($('#auth-screen')) $('#auth-screen').style.display = 'none';
  if ($('#app-screen')) $('#app-screen').style.display = 'none';
}

function showAuthScreen() {
  if ($('#setup-screen')) $('#setup-screen').style.display = 'none';
  if ($('#auth-screen')) $('#auth-screen').style.display = 'flex';
  if ($('#app-screen')) $('#app-screen').style.display = 'none';
}

function showAppScreen() {
  if ($('#setup-screen')) $('#setup-screen').style.display = 'none';
  if ($('#auth-screen')) $('#auth-screen').style.display = 'none';
  if ($('#app-screen')) $('#app-screen').style.display = 'flex';
}

// ============================================================
// PART 11: Realtime Subscriptions
// ============================================================
function setupRealtimeSubscriptions() {
  state.channels.forEach(ch => supabase.removeChannel(ch));
  state.channels = [];
  
  const storeId = state.store.id;
  
  const ordersChannel = supabase.channel('orders-' + storeId)
    .on('postgres_changes', {
      event: '*',
      schema: 'public',
      table: 'orders',
      filter: `store_id=eq.${storeId}`
    }, async (payload) => {
      await refreshOrders();
      if (payload.eventType === 'INSERT') {
        const o = payload.new;
        toast(`New order #${o.order_number} received!`, 'info');
        addNotification(`New order #${o.order_number}`, 'info');
      } else if (payload.eventType === 'UPDATE') {
        const o = payload.new;
        addNotification(`Order #${o.order_number} status: ${o.status}`, 'info');
      }
      if (state.page === 'orders') renderPage();
      if (state.page === 'dashboard') renderDashboardPage();
    })
    .subscribe();
  state.channels.push(ordersChannel);
  
  const productsChannel = supabase.channel('products-' + storeId)
    .on('postgres_changes', {
      event: '*',
      schema: 'public',
      table: 'products',
      filter: `store_id=eq.${storeId}`
    }, async (payload) => {
      await refreshProducts();
      if (state.page === 'products') renderPage();
      if (state.page === 'stock') renderStockPage();
      if (state.page === 'dashboard') renderDashboardPage();
    })
    .subscribe();
  state.channels.push(productsChannel);
  
  const customersChannel = supabase.channel('customers-' + storeId)
    .on('postgres_changes', {
      event: '*',
      schema: 'public',
      table: 'customers',
      filter: `store_id=eq.${storeId}`
    }, async () => {
      await refreshCustomers();
      if (state.page === 'customers') renderPage();
      if (state.page === 'dashboard') renderDashboardPage();
    })
    .subscribe();
  state.channels.push(customersChannel);
  
  const stockChannel = supabase.channel('stock-' + storeId)
    .on('postgres_changes', {
      event: 'INSERT',
      schema: 'public',
      table: 'stock_movements',
      filter: `store_id=eq.${storeId}`
    }, async () => {
      if (state.page === 'stock') renderStockPage();
    })
    .subscribe();
  state.channels.push(stockChannel);
}

function addNotification(message, type = 'info') {
  state.notifications.unshift({ message, type, time: new Date() });
  updateNotifBadge();
}

function updateNotifBadge() {
  const badge = $('#notif-badge');
  if (!badge) return;
  const count = state.notifications.length;
  badge.textContent = count > 9 ? '9+' : count;
  badge.style.display = count > 0 ? 'flex' : 'none';
}

async function refreshOrders() {
  const { data } = await supabase
    .from('orders')
    .select('*, customers(name), order_items(*)')
    .eq('store_id', state.store.id)
    .order('created_at', { ascending: false })
    .limit(100);
  if (data) state.orders = data;
}

async function refreshProducts() {
  const { data } = await supabase
    .from('products')
    .select('*, categories(name)')
    .eq('store_id', state.store.id)
    .order('name');
  if (data) state.products = data;
}

async function refreshCustomers() {
  const { data } = await supabase
    .from('customers')
    .select('*')
    .eq('store_id', state.store.id)
    .order('created_at', { ascending: false });
  if (data) state.customers = data;
}

// ============================================================
// PART 12: Router & Navigation
// ============================================================
const ROLE_PAGES = {
  owner: ['dashboard','orders','products','categories','stock','customers','reviews','promotions','reports','settings','store'],
  admin: ['dashboard','orders','products','categories','stock','customers','reviews','promotions','reports'],
  staff: ['dashboard','orders','products','stock','customers','store'],
};

const PAGE_META = [
  { id: 'dashboard', label: 'Dashboard', icon: '🏠' },
  { id: 'orders', label: 'Orders', icon: '📦' },
  { id: 'products', label: 'Products', icon: '🛍' },
  { id: 'categories', label: 'Categories', icon: '📂' },
  { id: 'stock', label: 'Stock', icon: '📊' },
  { id: 'customers', label: 'Customers', icon: '👥' },
  { id: 'reviews', label: 'Reviews', icon: '⭐' },
  { id: 'promotions', label: 'Promotions', icon: '🎁' },
  { id: 'reports', label: 'Reports', icon: '📈' },
  { id: 'settings', label: 'Settings', icon: '⚙' },
  { id: 'store', label: 'Customer Store', icon: '🛒' },
];

function canAccess(page) {
  const role = state.profile?.role || 'staff';
  return (ROLE_PAGES[role] || []).includes(page);
}

function navigateTo(page) {
  if (!canAccess(page)) {
    toast('Access denied', 'error');
    return;
  }
  state.page = page;
  renderPage();
  updateActiveNav(page);
  
  const sidebar = $('#sidebar');
  if (window.innerWidth < 1024 && sidebar) {
    sidebar.classList.remove('sidebar-open');
  }
}

function renderPage() {
  const content = $('#page-content');
  if (!content) return;
  
  const renderers = {
    dashboard: renderDashboardPage,
    orders: renderOrdersPage,
    products: renderProductsPage,
    categories: renderCategoriesPage,
    stock: renderStockPage,
    customers: renderCustomersPage,
    reviews: renderReviewsPage,
    promotions: renderPromotionsPage,
    reports: renderReportsPage,
    settings: renderSettingsPage,
    store: renderStorePage,
  };
  
  const renderer = renderers[state.page];
  if (renderer) renderer();
  else content.innerHTML = emptyState('🚧', 'Page not found');
}

function updateActiveNav(page) {
  $$('.nav-item').forEach(item => {
    item.classList.toggle('bg-blue-100', item.dataset.page === page);
    item.classList.toggle('text-blue-600', item.dataset.page === page);
  });
}

// ============================================================
// PART 13: Sidebar & User Info
// ============================================================
function renderSidebar() {
  const nav = $('#sidebar-nav');
  if (!nav) return;
  
  const role = state.profile?.role || 'staff';
  const allowedPages = ROLE_PAGES[role] || [];
  
  nav.innerHTML = '';
  PAGE_META.forEach(page => {
    if (!allowedPages.includes(page.id)) return;
    const item = el('button', {
      class: `nav-item flex items-center w-full px-4 py-3 mb-1 rounded-lg transition-colors hover:bg-gray-100 ${state.page === page.id ? 'bg-blue-100 text-blue-600' : 'text-gray-700'}`,
      'data-page': page.id,
      onclick: () => navigateTo(page.id)
    }, [
      el('span', { class: 'nav-icon text-xl mr-3' }, [page.icon]),
      el('span', { class: 'nav-label font-medium' }, [page.label])
    ]);
    nav.appendChild(item);
  });
  
  const storeNameEl = $('#sidebar-store-name');
  if (storeNameEl) storeNameEl.textContent = state.store?.name || 'HayPOS';
}

function renderUserInfo() {
  const name = state.profile?.full_name || state.user?.email || 'User';
  const role = state.profile?.role || 'staff';
  const initials = getInitials(name);
  
  const userNameEl = $('#user-name');
  const userRoleEl = $('#user-role');
  const userAvatarEl = $('#user-avatar');
  if (userNameEl) userNameEl.textContent = name;
  if (userRoleEl) userRoleEl.textContent = role.charAt(0).toUpperCase() + role.slice(1);
  if (userAvatarEl) userAvatarEl.textContent = initials;
  
  const topbarName = $('#topbar-name');
  const topbarRole = $('#topbar-role');
  const topbarAvatar = $('#topbar-avatar');
  if (topbarName) topbarName.textContent = name;
  if (topbarRole) topbarRole.textContent = role.charAt(0).toUpperCase() + role.slice(1);
  if (topbarAvatar) topbarAvatar.textContent = initials;
}

// ============================================================
// PART 14: Dashboard Page
// ============================================================
function renderDashboardPage() {
  const content = $('#page-content');
  const today = new Date().toISOString().split('T')[0];
  
  const todaysOrders = state.orders.filter(o => o.created_at.startsWith(today));
  const todaySales = todaysOrders.reduce((sum, o) => sum + Number(o.total), 0);
  
  const prodCounts = {};
  state.orders.forEach(o => {
    if (o.status !== 'cancelled') {
      (o.order_items || []).forEach(item => {
        prodCounts[item.product_id] = (prodCounts[item.product_id] || 0) + item.quantity;
      });
    }
  });
  let bestSellerId = null;
  let maxCount = 0;
  Object.entries(prodCounts).forEach(([pid, count]) => {
    if (count > maxCount) { maxCount = count; bestSellerId = pid; }
  });
  const bestSeller = state.products.find(p => p.id === bestSellerId)?.name || 'N/A';
  
  const lowStockProducts = state.products.filter(p => p.stock < 10);
  const recentOrders = state.orders.slice(0, 5);
  const recentReviews = state.reviews.slice(0, 3);
  
  content.innerHTML = `
    <div class="space-y-6">
      <h1 class="text-2xl font-bold">Dashboard</h1>
      
      <!-- Stats Grid -->
      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div class="bg-white p-6 rounded-lg shadow-sm border border-gray-100">
          <div class="text-gray-500 text-sm mb-1">Today's Sales</div>
          <div class="text-2xl font-bold text-green-600">${money(todaySales)}</div>
        </div>
        <div class="bg-white p-6 rounded-lg shadow-sm border border-gray-100">
          <div class="text-gray-500 text-sm mb-1">Total Orders (Today)</div>
          <div class="text-2xl font-bold">${todaysOrders.length}</div>
        </div>
        <div class="bg-white p-6 rounded-lg shadow-sm border border-gray-100">
          <div class="text-gray-500 text-sm mb-1">Total Customers</div>
          <div class="text-2xl font-bold">${state.customers.length}</div>
        </div>
        <div class="bg-white p-6 rounded-lg shadow-sm border border-gray-100">
          <div class="text-gray-500 text-sm mb-1">Best Seller</div>
          <div class="text-xl font-bold truncate" title="${bestSeller}">${bestSeller}</div>
        </div>
      </div>
      
      <!-- Charts & Actions -->
      <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div class="lg:col-span-2 bg-white p-6 rounded-lg shadow-sm border border-gray-100">
          <div class="flex justify-between items-center mb-4">
            <h2 class="text-lg font-bold">Sales Overview</h2>
          </div>
          <div class="h-64">
            <canvas id="dashboard-chart"></canvas>
          </div>
        </div>
        
        <div class="bg-white p-6 rounded-lg shadow-sm border border-gray-100">
          <h2 class="text-lg font-bold mb-4">Quick Actions</h2>
          <div class="grid grid-cols-2 gap-4">
            <button class="p-4 bg-blue-50 text-blue-700 rounded-lg text-center hover:bg-blue-100 transition" onclick="navigateTo('products')">
              <div class="text-2xl mb-2">🛍</div>
              <div class="font-medium text-sm">POS / Sale</div>
            </button>
            <button class="p-4 bg-purple-50 text-purple-700 rounded-lg text-center hover:bg-purple-100 transition" onclick="navigateTo('orders')">
              <div class="text-2xl mb-2">📦</div>
              <div class="font-medium text-sm">View Orders</div>
            </button>
            <button class="p-4 bg-green-50 text-green-700 rounded-lg text-center hover:bg-green-100 transition" onclick="navigateTo('customers')">
              <div class="text-2xl mb-2">👥</div>
              <div class="font-medium text-sm">Customers</div>
            </button>
            <button class="p-4 bg-orange-50 text-orange-700 rounded-lg text-center hover:bg-orange-100 transition" onclick="navigateTo('stock')">
              <div class="text-2xl mb-2">📊</div>
              <div class="font-medium text-sm">Check Stock</div>
            </button>
          </div>
        </div>
      </div>
      
      <!-- Bottom Grid -->
      <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div class="lg:col-span-2 bg-white p-6 rounded-lg shadow-sm border border-gray-100">
          <div class="flex justify-between items-center mb-4">
            <h2 class="text-lg font-bold">Recent Orders</h2>
            <button class="text-blue-600 text-sm hover:underline" onclick="navigateTo('orders')">View All</button>
          </div>
          <div class="overflow-x-auto">
            <table class="w-full text-left border-collapse">
              <thead>
                <tr class="bg-gray-50 border-b border-gray-200">
                  <th class="p-3 text-sm font-semibold text-gray-600">Order #</th>
                  <th class="p-3 text-sm font-semibold text-gray-600">Customer</th>
                  <th class="p-3 text-sm font-semibold text-gray-600">Total</th>
                  <th class="p-3 text-sm font-semibold text-gray-600">Status</th>
                </tr>
              </thead>
              <tbody>
                ${recentOrders.length === 0 ? `<tr><td colspan="4" class="p-4 text-center text-gray-500">No orders yet</td></tr>` : 
                  recentOrders.map(o => `
                  <tr class="border-b border-gray-100 hover:bg-gray-50 cursor-pointer" onclick="state.selectedOrder = state.orders.find(ord => ord.id === '${o.id}'); navigateTo('orders');">
                    <td class="p-3 text-sm font-medium text-blue-600">${o.order_number}</td>
                    <td class="p-3 text-sm">${escapeHTML(o.customers?.name || 'Walk-in')}</td>
                    <td class="p-3 text-sm font-medium">${money(o.total)}</td>
                    <td class="p-3 text-sm">${statusBadge(o.status)}</td>
                  </tr>
                `).join('')}
              </tbody>
            </table>
          </div>
        </div>
        
        <div class="bg-white p-6 rounded-lg shadow-sm border border-gray-100">
          <h2 class="text-lg font-bold mb-4 text-red-600 flex items-center gap-2">⚠️ Low Stock Alerts</h2>
          <div class="space-y-3 max-h-[300px] overflow-y-auto">
            ${lowStockProducts.length === 0 ? `<p class="text-gray-500 text-sm text-center py-4">All stock levels are good!</p>` : 
              lowStockProducts.map(p => `
              <div class="flex justify-between items-center p-3 bg-red-50 rounded border border-red-100">
                <div class="flex items-center gap-2">
                  <span class="text-xl">${p.emoji || '📦'}</span>
                  <div>
                    <div class="font-medium text-sm text-gray-800">${escapeHTML(p.name)}</div>
                    <div class="text-xs text-gray-500">${escapeHTML(p.sku || '-')}</div>
                  </div>
                </div>
                <div class="font-bold text-red-600 text-sm bg-white px-2 py-1 rounded shadow-sm">${p.stock} left</div>
              </div>
            `).join('')}
          </div>
        </div>
      </div>
    </div>
  `;
  
  // Render Chart.js
  setTimeout(() => {
    const ctx = document.getElementById('dashboard-chart');
    if (!ctx || !window.Chart) return;
    
    // Last 7 days data
    const labels = [];
    const data = [];
    for (let i = 6; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      const ds = d.toISOString().split('T')[0];
      labels.push(d.toLocaleDateString('th-TH', { weekday: 'short' }));
      const daySales = state.orders.filter(o => o.created_at.startsWith(ds) && o.status !== 'cancelled').reduce((sum, o) => sum + Number(o.total), 0);
      data.push(daySales);
    }
    
    new Chart(ctx, {
      type: 'line',
      data: {
        labels,
        datasets: [{
          label: 'Sales (THB)',
          data,
          borderColor: '#2563eb',
          backgroundColor: 'rgba(37, 99, 235, 0.1)',
          tension: 0.4,
          fill: true
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: { legend: { display: false } },
        scales: { y: { beginAtZero: true } }
      }
    });
  }, 100);
}

// ============================================================
// PART 15: Orders Page
// ============================================================
function renderOrdersPage() {
  const content = $('#page-content');
  if (state.selectedOrder) {
    renderOrderDetail();
    return;
  }
  
  // Filter
  const f = state.ordersFilter;
  let filtered = state.orders.filter(o => {
    let m = true;
    if (f.status && f.status !== 'all') m = m && o.status === f.status;
    if (f.search) m = m && (o.order_number.toLowerCase().includes(f.search.toLowerCase()) || (o.customers?.name || '').toLowerCase().includes(f.search.toLowerCase()));
    if (f.date) m = m && o.created_at.startsWith(f.date);
    return m;
  });
  
  const perPage = 20;
  const totalPages = Math.ceil(filtered.length / perPage) || 1;
  const curPage = Math.min(state.ordersPage, totalPages);
  const paged = filtered.slice((curPage - 1) * perPage, curPage * perPage);
  
  content.innerHTML = `
    <div class="space-y-4">
      <h1 class="text-2xl font-bold">Orders</h1>
      
      <div class="flex flex-wrap gap-4 bg-white p-4 rounded-lg shadow-sm border border-gray-100">
        <input type="text" id="order-search" placeholder="Search order # or customer..." class="input border rounded p-2 flex-grow" value="${escapeHTML(f.search)}">
        <select id="order-status" class="input border rounded p-2">
          <option value="all" ${f.status === 'all' ? 'selected' : ''}>All Status</option>
          <option value="waiting" ${f.status === 'waiting' ? 'selected' : ''}>Waiting</option>
          <option value="verify" ${f.status === 'verify' ? 'selected' : ''}>Verify</option>
          <option value="preparing" ${f.status === 'preparing' ? 'selected' : ''}>Preparing</option>
          <option value="completed" ${f.status === 'completed' ? 'selected' : ''}>Completed</option>
          <option value="cancelled" ${f.status === 'cancelled' ? 'selected' : ''}>Cancelled</option>
        </select>
        <input type="date" id="order-date" class="input border rounded p-2" value="${f.date}">
        <button class="btn bg-gray-200 px-4 py-2 rounded" onclick="state.ordersFilter = {status:'', search:'', date:''}; renderPage();">Clear</button>
      </div>
      
      <div class="bg-white rounded-lg shadow-sm border border-gray-100 overflow-hidden">
        ${paged.length === 0 ? emptyState('📦', 'No orders found', 'Try changing your filters') : `
        <div class="overflow-x-auto">
          <table class="w-full text-left border-collapse">
            <thead>
              <tr class="bg-gray-50 border-b border-gray-200">
                <th class="p-3 text-sm font-semibold text-gray-600">Order #</th>
                <th class="p-3 text-sm font-semibold text-gray-600">Date</th>
                <th class="p-3 text-sm font-semibold text-gray-600">Customer</th>
                <th class="p-3 text-sm font-semibold text-gray-600">Items</th>
                <th class="p-3 text-sm font-semibold text-gray-600">Total</th>
                <th class="p-3 text-sm font-semibold text-gray-600">Status</th>
                <th class="p-3 text-sm font-semibold text-gray-600">Action</th>
              </tr>
            </thead>
            <tbody>
              ${paged.map(o => `
                <tr class="border-b border-gray-100 hover:bg-gray-50">
                  <td class="p-3 text-sm font-medium text-blue-600">${o.order_number}</td>
                  <td class="p-3 text-sm text-gray-500">${formatDateShort(o.created_at)}</td>
                  <td class="p-3 text-sm">${escapeHTML(o.customers?.name || 'Walk-in')}</td>
                  <td class="p-3 text-sm text-gray-500">${(o.order_items || []).reduce((sum, i) => sum + i.quantity, 0)} items</td>
                  <td class="p-3 text-sm font-medium">${money(o.total)}</td>
                  <td class="p-3 text-sm">${statusBadge(o.status)}</td>
                  <td class="p-3 text-sm">
                    <button class="text-blue-600 hover:underline" onclick="state.selectedOrder = state.orders.find(ord => ord.id === '${o.id}'); renderPage();">View</button>
                  </td>
                </tr>
              `).join('')}
            </tbody>
          </table>
        </div>
        `}
      </div>
      <div id="orders-pagination"></div>
    </div>
  `;
  
  renderPagination($('#orders-pagination'), curPage, totalPages, (p) => { state.ordersPage = p; renderPage(); });
  
  // Attach listeners
  $('#order-search')?.addEventListener('input', e => { state.ordersFilter.search = e.target.value; renderPage(); });
  $('#order-status')?.addEventListener('change', e => { state.ordersFilter.status = e.target.value; renderPage(); });
  $('#order-date')?.addEventListener('change', e => { state.ordersFilter.date = e.target.value; renderPage(); });
}

function renderOrderDetail() {
  const o = state.selectedOrder;
  if (!o) { renderOrdersPage(); return; }
  
  const items = o.order_items || [];
  
  let actionHtml = '';
  if (o.status === 'waiting') actionHtml = `<button class="btn bg-blue-600 text-white px-4 py-2 rounded" onclick="updateOrderStatus('${o.id}', 'verify')">Verify Payment</button>`;
  else if (o.status === 'verify') actionHtml = `<button class="btn bg-yellow-500 text-white px-4 py-2 rounded" onclick="updateOrderStatus('${o.id}', 'preparing')">Prepare Order</button>`;
  else if (o.status === 'preparing') actionHtml = `<button class="btn bg-green-600 text-white px-4 py-2 rounded" onclick="updateOrderStatus('${o.id}', 'completed')">Complete Order</button>`;
  
  if (o.status !== 'completed' && o.status !== 'cancelled') {
    actionHtml += `<button class="btn bg-red-100 text-red-600 px-4 py-2 rounded ml-2" onclick="updateOrderStatus('${o.id}', 'cancelled')">Cancel</button>`;
  }
  
  $('#page-content').innerHTML = `
    <div class="max-w-4xl mx-auto space-y-6">
      <div class="flex items-center gap-4">
        <button class="text-gray-500 hover:text-gray-800 text-xl" onclick="state.selectedOrder = null; renderPage();">←</button>
        <h1 class="text-2xl font-bold flex-grow">Order ${o.order_number}</h1>
        ${statusBadge(o.status)}
      </div>
      
      <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div class="md:col-span-2 space-y-6">
          <div class="bg-white p-6 rounded-lg shadow-sm border border-gray-100">
            <h2 class="text-lg font-bold mb-4 border-b pb-2">Order Items</h2>
            <div class="space-y-4">
              ${items.map(item => `
                <div class="flex justify-between items-center">
                  <div>
                    <div class="font-medium">${escapeHTML(item.product_name)}</div>
                    <div class="text-sm text-gray-500">${money(item.unit_price)} x ${item.quantity}</div>
                  </div>
                  <div class="font-medium">${money(item.unit_price * item.quantity)}</div>
                </div>
              `).join('')}
            </div>
            <div class="mt-6 pt-4 border-t space-y-2">
              <div class="flex justify-between text-gray-600">
                <span>Subtotal</span>
                <span>${money(o.subtotal)}</span>
              </div>
              <div class="flex justify-between text-gray-600">
                <span>Discount</span>
                <span>${money(o.discount)}</span>
              </div>
              <div class="flex justify-between text-gray-600">
                <span>Tax</span>
                <span>${money(o.tax)}</span>
              </div>
              <div class="flex justify-between text-lg font-bold mt-2 pt-2 border-t">
                <span>Total</span>
                <span class="text-blue-600">${money(o.total)}</span>
              </div>
            </div>
          </div>
          
          <div class="bg-white p-6 rounded-lg shadow-sm border border-gray-100">
            <h2 class="text-lg font-bold mb-4 border-b pb-2">Notes</h2>
            <p class="text-gray-600 whitespace-pre-wrap">${escapeHTML(o.note || 'No notes provided.')}</p>
          </div>
        </div>
        
        <div class="space-y-6">
          <div class="bg-white p-6 rounded-lg shadow-sm border border-gray-100">
            <h2 class="text-lg font-bold mb-4 border-b pb-2">Customer Info</h2>
            ${o.customers ? `
              <div class="font-medium">${escapeHTML(o.customers.name)}</div>
              <div class="text-sm text-gray-600 mt-1">📞 ${escapeHTML(o.customers.phone || '-')}</div>
              <div class="text-sm text-gray-600 mt-1">✉️ ${escapeHTML(o.customers.email || '-')}</div>
            ` : `<div class="text-gray-500 italic">Walk-in Customer</div>`}
          </div>
          
          <div class="bg-white p-6 rounded-lg shadow-sm border border-gray-100">
            <h2 class="text-lg font-bold mb-4 border-b pb-2">Payment Info</h2>
            <div class="text-sm">
              <span class="text-gray-500">Method:</span> <span class="font-medium capitalize">${escapeHTML(o.payment_method || 'Cash')}</span>
            </div>
            <div class="text-sm mt-2">
              <span class="text-gray-500">Date:</span> <span class="font-medium">${formatDate(o.created_at)}</span>
            </div>
          </div>
          
          <div class="bg-white p-6 rounded-lg shadow-sm border border-gray-100">
            <h2 class="text-lg font-bold mb-4 border-b pb-2">Actions</h2>
            <div class="flex flex-col gap-2">
              ${actionHtml}
            </div>
          </div>
        </div>
      </div>
    </div>
  `;
}

async function updateOrderStatus(orderId, newStatus) {
  const confirmed = await confirmDialog({
    title: 'Update Status',
    message: `Change order status to ${newStatus}?`,
    confirmLabel: 'Update',
    confirmClass: 'bg-blue-600 text-white'
  });
  if (!confirmed) return;
  
  showLoading();
  const { error } = await supabase
    .from('orders')
    .update({ status: newStatus })
    .eq('id', orderId);
    
  hideLoading();
  if (error) {
    toast(error.message, 'error');
  } else {
    toast(`Order status updated to ${newStatus}`);
    const idx = state.orders.findIndex(o => o.id === orderId);
    if (idx !== -1) state.orders[idx].status = newStatus;
    if (state.selectedOrder && state.selectedOrder.id === orderId) {
      state.selectedOrder.status = newStatus;
      renderOrderDetail();
    }
  }
}

// ============================================================
// PART 16: Products Page (POS View)
// ============================================================
function renderProductsPage() {
  const content = $('#page-content');
  const cats = state.categories;
  const f = state.productsFilter;
  
  let filtered = state.products.filter(p => {
    let m = true;
    if (f.category) m = m && p.category_id === f.category;
    if (f.search) m = m && p.name.toLowerCase().includes(f.search.toLowerCase());
    return m;
  });
  
  content.innerHTML = `
    <div class="flex flex-col h-[calc(100vh-100px)] -mx-6 -my-6">
      <div class="flex-grow flex overflow-hidden">
        
        <!-- Left: Products Grid -->
        <div class="flex-grow flex flex-col bg-gray-50 overflow-hidden">
          <!-- Filters -->
          <div class="bg-white p-4 shadow-sm z-10 flex gap-4 items-center">
            <div class="flex-grow flex gap-2 overflow-x-auto pb-2 hide-scrollbar">
              <button class="px-4 py-2 rounded-full whitespace-nowrap ${!f.category ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-700'}" onclick="state.productsFilter.category = ''; renderPage();">All</button>
              ${cats.map(c => `
                <button class="px-4 py-2 rounded-full whitespace-nowrap ${f.category === c.id ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-700'}" onclick="state.productsFilter.category = '${c.id}'; renderPage();">
                  ${c.emoji || ''} ${escapeHTML(c.name)}
                </button>
              `).join('')}
            </div>
            <div class="relative min-w-[200px]">
              <input type="text" id="pos-search" placeholder="Search..." class="w-full border rounded-full px-4 py-2 pl-10" value="${escapeHTML(f.search)}">
              <span class="absolute left-3 top-2 text-gray-400">🔍</span>
            </div>
            ${canAccess('settings') ? `
              <button class="btn bg-blue-600 text-white px-4 py-2 rounded-lg whitespace-nowrap" onclick="openAddProductModal()">+ Add</button>
            ` : ''}
          </div>
          
          <!-- Grid -->
          <div class="flex-grow overflow-y-auto p-4">
            ${filtered.length === 0 ? emptyState('🛍', 'No products found') : `
              <div class="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
                ${filtered.map(p => `
                  <div class="bg-white rounded-xl shadow-sm border border-gray-100 hover:shadow-md transition cursor-pointer relative flex flex-col h-full"
                       onclick="addToCart('${p.id}')" oncontextmenu="event.preventDefault(); decreaseCart('${p.id}');">
                    <div class="aspect-square bg-gray-50 rounded-t-xl flex items-center justify-center text-5xl relative">
                      ${p.emoji || '📦'}
                      <div class="absolute top-2 right-2 w-3 h-3 rounded-full ${p.stock > 10 ? 'bg-green-500' : p.stock > 0 ? 'bg-yellow-500' : 'bg-red-500'}"></div>
                      ${state.cart[p.id] ? `<div class="absolute -top-2 -right-2 bg-blue-600 text-white text-xs font-bold w-6 h-6 rounded-full flex items-center justify-center">${state.cart[p.id]}</div>` : ''}
                    </div>
                    <div class="p-3 flex flex-col flex-grow">
                      <div class="font-medium text-sm text-gray-800 line-clamp-2 leading-tight flex-grow">${escapeHTML(p.name)}</div>
                      <div class="text-blue-600 font-bold mt-2">${money(p.price)}</div>
                    </div>
                  </div>
                `).join('')}
              </div>
            `}
          </div>
        </div>
        
        <!-- Right: Cart Panel -->
        <div id="cart-panel-container" class="w-80 lg:w-96 bg-white shadow-xl flex flex-col border-l border-gray-200 z-20"></div>
      </div>
    </div>
  `;
  
  $('#pos-search')?.addEventListener('input', e => { state.productsFilter.search = e.target.value; renderPage(); });
  renderCartPanel();
}

function addToCart(productId) {
  const p = state.products.find(x => x.id === productId);
  if (!p) return;
  const currentQty = state.cart[productId] || 0;
  if (currentQty >= p.stock) {
    toast(`Only ${p.stock} in stock!`, 'warning');
    return;
  }
  state.cart[productId] = currentQty + 1;
  if (state.page === 'products') {
    renderPage();
  } else {
    renderCartPanel();
  }
}

function decreaseCart(productId) {
  if (!state.cart[productId]) return;
  state.cart[productId] -= 1;
  if (state.cart[productId] <= 0) delete state.cart[productId];
  if (state.page === 'products') renderPage();
  else renderCartPanel();
}

function removeFromCart(productId) {
  delete state.cart[productId];
  if (state.page === 'products') renderPage();
  else renderCartPanel();
}

function clearCart() {
  state.cart = {};
  state.cartCustomer = null;
  state.cartPromo = null;
  if (state.page === 'products') renderPage();
  else renderCartPanel();
}

function getCartTotals() {
  let subtotal = 0;
  Object.entries(state.cart).forEach(([id, qty]) => {
    const p = state.products.find(x => x.id === id);
    if (p) subtotal += p.price * qty;
  });
  
  let discount = 0;
  if (state.cartPromo) {
    if (state.cartPromo.type === 'percent') {
      discount = subtotal * (state.cartPromo.discount / 100);
    } else {
      discount = state.cartPromo.discount;
    }
  }
  
  const total = Math.max(0, subtotal - discount);
  const tax = total * 0.07; // Assuming 7% VAT included or added, simplified here as 0 for pos usually unless specified. Wait, standard says return { subtotal, discount, tax, total }. Let's say 0 tax for now.
  return { subtotal, discount, tax: 0, total };
}

function renderCartPanel() {
  const container = $('#cart-panel-container');
  if (!container) return;
  
  const { subtotal, discount, total } = getCartTotals();
  const items = Object.entries(state.cart).map(([id, qty]) => {
    const p = state.products.find(x => x.id === id);
    return p ? { ...p, qty } : null;
  }).filter(Boolean);
  
  container.innerHTML = `
    <!-- Cart Header -->
    <div class="p-4 border-b flex justify-between items-center bg-gray-50">
      <h2 class="font-bold text-lg flex items-center gap-2">🛒 Current Order</h2>
      <button class="text-red-500 text-sm hover:underline" onclick="clearCart()">Clear</button>
    </div>
    
    <!-- Customer Selection -->
    <div class="p-3 border-b">
      ${state.cartCustomer ? `
        <div class="flex justify-between items-center bg-blue-50 p-2 rounded border border-blue-100">
          <div class="text-sm font-medium text-blue-800">👤 ${escapeHTML(state.cartCustomer.name)}</div>
          <button class="text-blue-500 hover:text-blue-700 text-xs" onclick="state.cartCustomer = null; renderCartPanel();">✕</button>
        </div>
      ` : `
        <button class="w-full py-2 border-2 border-dashed border-gray-300 rounded text-gray-500 text-sm hover:bg-gray-50 hover:border-blue-300 hover:text-blue-500 transition" onclick="openCheckoutCustomerSelect()">+ Add Customer</button>
      `}
    </div>

    <!-- Promo Code Section -->
    <div class="p-3 border-b bg-gray-50/50">
      ${state.cartPromo ? `
        <div class="flex justify-between items-center bg-green-50 p-2 rounded border border-green-200">
          <div class="text-xs font-bold text-green-700">🏷️ ${escapeHTML(state.cartPromo.code)} (${state.cartPromo.type === 'percent' ? state.cartPromo.discount + '%' : money(state.cartPromo.discount)} off)</div>
          <button class="text-red-500 hover:text-red-700 text-xs font-bold ml-2" onclick="removeCartPromo()">✕</button>
        </div>
      ` : `
        <div class="flex gap-1">
          <input type="text" id="cart-promo-input" placeholder="Promo code..." class="input border rounded px-2 py-1 text-xs uppercase flex-grow">
          <button class="btn bg-gray-800 text-white text-xs px-3 py-1 rounded font-bold hover:bg-black" onclick="applyCartPromo()">Apply</button>
        </div>
      `}
    </div>

    <!-- Items -->
    <div class="flex-grow overflow-y-auto p-4 space-y-4">
      ${items.length === 0 ? `<div class="text-center text-gray-400 mt-10">Cart is empty</div>` : 
        items.map(item => `
        <div class="flex items-start justify-between group">
          <div class="flex-grow pr-2">
            <div class="font-medium text-sm text-gray-800 leading-tight">${escapeHTML(item.name)}</div>
            <div class="text-blue-600 font-medium text-sm mt-1">${money(item.price)}</div>
          </div>
          <div class="flex items-center gap-2 bg-gray-100 rounded-lg p-1">
            <button class="w-6 h-6 flex items-center justify-center bg-white rounded shadow-sm text-gray-600 hover:text-blue-600" onclick="decreaseCart('${item.id}')">-</button>
            <span class="w-6 text-center text-sm font-medium">${item.qty}</span>
            <button class="w-6 h-6 flex items-center justify-center bg-white rounded shadow-sm text-gray-600 hover:text-blue-600" onclick="addToCart('${item.id}')">+</button>
          </div>
        </div>
      `).join('')}
    </div>
    
    <!-- Totals -->
    <div class="p-4 border-t bg-gray-50 space-y-2">
      <div class="flex justify-between text-sm text-gray-600">
        <span>Subtotal</span>
        <span>${money(subtotal)}</span>
      </div>
      ${discount > 0 ? `
        <div class="flex justify-between text-sm text-red-500">
          <span>Discount (${state.cartPromo?.code || 'Promo'})</span>
          <span>-${money(discount)}</span>
        </div>
      ` : ''}
      <div class="flex justify-between text-lg font-bold pt-2 border-t mt-2">
        <span>Total</span>
        <span class="text-blue-600">${money(total)}</span>
      </div>
      <button class="w-full py-3 mt-4 bg-blue-600 text-white rounded-lg font-bold text-lg hover:bg-blue-700 transition shadow-md disabled:opacity-50 disabled:cursor-not-allowed" 
              onclick="openCheckout()" ${items.length === 0 ? 'disabled' : ''}>
        Pay ${money(total)}
      </button>
    </div>
  `;
}

function applyCartPromo() {
  const input = $('#cart-promo-input');
  const code = (input ? input.value : '').trim().toUpperCase();
  if (!code) { toast('Please enter a promotion code', 'warning'); return; }
  
  const promo = (state.promotions || []).find(p => p.code === code);
  if (!promo) { toast('Invalid promotion code', 'error'); return; }
  if (promo.status !== 'active') { toast('This promotion is not active', 'warning'); return; }
  
  const now = new Date();
  if (promo.start_date && new Date(promo.start_date) > now) { toast('This promotion has not started yet', 'warning'); return; }
  if (promo.end_date && new Date(promo.end_date) < now) { toast('This promotion has expired', 'warning'); return; }
  if (promo.max_uses && (promo.used_count || 0) >= promo.max_uses) { toast('Promotion usage limit reached', 'warning'); return; }
  
  const { subtotal } = getCartTotals();
  if (promo.min_order && subtotal < promo.min_order) {
    toast(`Minimum order amount for this code is ${money(promo.min_order)}`, 'warning');
    return;
  }
  
  state.cartPromo = promo;
  toast(`Applied promotion ${promo.code}!`);
  renderCartPanel();
}

function removeCartPromo() {
  state.cartPromo = null;
  renderCartPanel();
}

function openCheckoutCustomerSelect() {
  const body = el('div', { class: 'space-y-4' }, [
    el('input', { type: 'text', id: 'cust-search-modal', class: 'input border rounded w-full p-2', placeholder: 'Search customers...', oninput: (e) => {
      const q = e.target.value.toLowerCase();
      const res = state.customers.filter(c => c.name.toLowerCase().includes(q) || (c.phone||'').includes(q)).slice(0,5);
      const list = $('#cust-search-results');
      list.innerHTML = res.map(c => `
        <div class="p-2 border-b cursor-pointer hover:bg-gray-50" onclick="state.cartCustomer = state.customers.find(x=>x.id==='${c.id}'); closeModal(); renderCartPanel();">
          <div class="font-medium">${escapeHTML(c.name)}</div>
          <div class="text-xs text-gray-500">${escapeHTML(c.phone || '')}</div>
        </div>
      `).join('');
    }}),
    el('div', { id: 'cust-search-results', class: 'max-h-48 overflow-y-auto border rounded' })
  ]);
  
  openModal({ title: 'Select Customer', body });
}

// ============================================================
// PART 17: Checkout
// ============================================================
function openCheckout() {
  const { total } = getCartTotals();
  const html = `
    <div class="space-y-4">
      <div>
        <label class="block text-sm font-medium mb-1">Payment Method</label>
        <div class="grid grid-cols-3 gap-2">
          <button type="button" class="pay-method-btn border-2 rounded p-2 border-blue-500 bg-blue-50 font-bold" data-val="cash" onclick="$$('.pay-method-btn').forEach(b=>{b.classList.remove('border-blue-500','bg-blue-50');b.classList.add('border-gray-200');}); this.classList.remove('border-gray-200'); this.classList.add('border-blue-500','bg-blue-50'); $('#co-method').value='cash';">💵 Cash</button>
          <button type="button" class="pay-method-btn border-2 rounded p-2 border-gray-200" data-val="qr" onclick="$$('.pay-method-btn').forEach(b=>{b.classList.remove('border-blue-500','bg-blue-50');b.classList.add('border-gray-200');}); this.classList.remove('border-gray-200'); this.classList.add('border-blue-500','bg-blue-50'); $('#co-method').value='qr';">📱 QR</button>
          <button type="button" class="pay-method-btn border-2 rounded p-2 border-gray-200" data-val="card" onclick="$$('.pay-method-btn').forEach(b=>{b.classList.remove('border-blue-500','bg-blue-50');b.classList.add('border-gray-200');}); this.classList.remove('border-gray-200'); this.classList.add('border-blue-500','bg-blue-50'); $('#co-method').value='card';">💳 Card</button>
        </div>
        <input type="hidden" id="co-method" value="cash">
      </div>
      <div>
        <label class="block text-sm font-medium mb-1">Amount Received (for cash)</label>
        <input type="number" id="co-received" class="input border rounded w-full p-2" value="${total}" min="${total}">
      </div>
      <div>
        <label class="block text-sm font-medium mb-1">Notes</label>
        <textarea id="co-notes" class="input border rounded w-full p-2" rows="2"></textarea>
      </div>
      <div class="bg-gray-100 p-4 rounded-lg font-bold text-xl flex justify-between">
        <span>Total:</span>
        <span class="text-blue-600">${money(total)}</span>
      </div>
    </div>
  `;
  
  openModal({
    title: 'Complete Payment',
    body: html,
    actions: [
      { label: 'Cancel', class: 'btn-outline text-gray-600', handler: closeModal },
      { label: `Place Order`, class: 'bg-green-600 text-white font-bold', handler: placeOrder }
    ]
  });
}

async function placeOrder() {
  const method = $('#co-method').value;
  const notes = $('#co-notes').value;
  const { subtotal, discount, tax, total } = getCartTotals();
  
  const d = new Date();
  const dateStr = d.getFullYear() + String(d.getMonth()+1).padStart(2,'0') + String(d.getDate()).padStart(2,'0');
  
  // Dummy order number generation, in real app use RPC or sequence
  const randNum = String(Math.floor(Math.random() * 9999)).padStart(4, '0');
  const orderNumber = `ORD-${dateStr}-${randNum}`;
  
  const items = Object.entries(state.cart).map(([id, qty]) => {
    const p = state.products.find(x => x.id === id);
    return { product_id: id, quantity: qty, unit_price: p.price, total: p.price * qty, product_name: p.name };
  });
  
  const orderData = {
    store_id: state.store.id,
    order_number: orderNumber,
    customer_id: state.cartCustomer ? state.cartCustomer.id : null,
    subtotal,
    discount,
    tax,
    total,
    status: 'completed',
    payment_method: method,
    note: notes
  };

  if (state.isDemo) {
    const newOrd = {
      ...orderData,
      id: 'ord-' + Date.now(),
      created_at: new Date().toISOString(),
      order_items: items.map((i, idx) => ({
        id: 'item-' + Date.now() + '-' + idx,
        product_id: i.product_id,
        product_name: i.product_name,
        quantity: i.quantity,
        unit_price: i.unit_price,
        total: i.total
      }))
    };
    state.orders.unshift(newOrd);
    for (const item of items) {
      const p = state.products.find(x => x.id === item.product_id);
      if (p) p.stock = Math.max(0, p.stock - item.quantity);
    }
    toast('Order placed successfully!');
    clearCart();
    closeModal();
    state.selectedOrder = newOrd;
    showOrderReceiptModal(newOrd, newOrd.order_items);
    return;
  }

  showLoading();
  // Call RPC in a real scenario to handle transaction, but here we simulate with separate inserts due to unknown RPC schema
  try {
    const { data: ord, error: errO } = await supabase.from('orders').insert({ ...orderData, id: crypto.randomUUID() }).select().single();
    if (errO) throw errO;
    
    const itemsData = items.map(i => ({
      id: crypto.randomUUID(),
      order_id: ord.id,
      product_id: i.product_id,
      product_name: i.product_name,
      quantity: i.quantity,
      unit_price: i.unit_price,
      total: i.total
    }));
    const { error: errI } = await supabase.from('order_items').insert(itemsData);
    if (errI) throw errI;
    
    // Update stock
    for (const item of items) {
      const p = state.products.find(x => x.id === item.product_id);
      if (p) {
        await supabase.from('products').update({ stock: p.stock - item.quantity }).eq('id', p.id);
      }
    }
    
    toast('Order placed successfully!');
    clearCart();
    closeModal();
    state.selectedOrder = ord;
    showOrderReceiptModal(ord, itemsData);
    
  } catch (err) {
    toast(err.message, 'error');
  } finally {
    hideLoading();
  }
}

function showOrderReceiptModal(order, items = []) {
  const store = state.store || {};
  const html = `
    <div id="printable-receipt" class="p-4 bg-white text-gray-800 text-sm font-mono max-w-sm mx-auto border rounded shadow-sm space-y-3">
      <div class="text-center border-b pb-3">
        <div class="text-xl font-bold font-sans">${escapeHTML(store.name || 'HayBerry Café')}</div>
        <div class="text-xs text-gray-500">${escapeHTML(store.tagline || 'Fresh Bakery & Drinks')}</div>
        ${store.address ? `<div class="text-xs text-gray-500 mt-1">${escapeHTML(store.address)}</div>` : ''}
        ${store.phone ? `<div class="text-xs text-gray-500">Tel: ${escapeHTML(store.phone)}</div>` : ''}
      </div>
      <div class="text-xs space-y-1 border-b pb-2">
        <div class="flex justify-between"><span>Order #:</span> <span class="font-bold">${order.order_number}</span></div>
        <div class="flex justify-between"><span>Date:</span> <span>${new Date(order.created_at || Date.now()).toLocaleString('th-TH')}</span></div>
        <div class="flex justify-between"><span>Payment:</span> <span class="uppercase font-bold">${order.payment_method}</span></div>
      </div>
      <div class="space-y-1 border-b pb-2">
        ${items.map(i => `
          <div class="flex justify-between">
            <span class="truncate pr-2">${escapeHTML(i.product_name)} x${i.quantity}</span>
            <span>${money(i.total || (i.unit_price * i.quantity))}</span>
          </div>
        `).join('')}
      </div>
      <div class="space-y-1 text-xs">
        <div class="flex justify-between text-gray-600"><span>Subtotal:</span> <span>${money(order.subtotal)}</span></div>
        ${order.discount > 0 ? `<div class="flex justify-between text-red-500"><span>Discount:</span> <span>-${money(order.discount)}</span></div>` : ''}
        <div class="flex justify-between text-base font-bold pt-1 border-t"><span>Total:</span> <span class="text-blue-600">${money(order.total)}</span></div>
      </div>
      <div class="text-center pt-2 text-xs text-gray-400 border-t">
        Thank you for your visit! 🙏
      </div>
    </div>
  `;

  openModal({
    title: 'Order Receipt 🧾',
    body: html,
    actions: [
      { label: 'Print 🖨️', class: 'bg-blue-600 text-white font-bold', handler: () => { window.print(); } },
      { label: 'View Orders List', class: 'btn-outline', handler: () => { closeModal(); navigateTo('orders'); } }
    ]
  });
}

// ============================================================
// PART 18: Product CRUD
// ============================================================
function openAddProductModal() {
  openEditProductModal(null);
}

function openEditProductModal(p) {
  const cats = state.categories;
  const isEdit = !!p;
  
  const html = `
    <form id="product-form" class="space-y-4">
      <div class="grid grid-cols-2 gap-4">
        <div class="col-span-2">
          <label class="block text-sm font-medium mb-1">Name *</label>
          <input type="text" id="prod-name" class="input border rounded w-full p-2" value="${escapeHTML(p?.name || '')}" required>
        </div>
        <div>
          <label class="block text-sm font-medium mb-1">Category</label>
          <select id="prod-cat" class="input border rounded w-full p-2">
            <option value="">None</option>
            ${cats.map(c => `<option value="${c.id}" ${p?.category_id === c.id ? 'selected' : ''}>${escapeHTML(c.name)}</option>`).join('')}
          </select>
        </div>
        <div>
          <label class="block text-sm font-medium mb-1">Emoji</label>
          <input type="text" id="prod-emoji" class="input border rounded w-full p-2" value="${escapeHTML(p?.emoji || '📦')}" maxlength="2">
        </div>
        <div>
          <label class="block text-sm font-medium mb-1">Price *</label>
          <input type="number" id="prod-price" class="input border rounded w-full p-2" value="${p?.price || ''}" step="0.01" required>
        </div>
        <div>
          <label class="block text-sm font-medium mb-1">Stock</label>
          <input type="number" id="prod-stock" class="input border rounded w-full p-2" value="${p?.stock || '0'}">
        </div>
        <div class="col-span-2">
          <label class="block text-sm font-medium mb-1">SKU</label>
          <input type="text" id="prod-sku" class="input border rounded w-full p-2" value="${escapeHTML(p?.sku || '')}" placeholder="Leave blank to auto-generate">
        </div>
      </div>
    </form>
  `;
  
  openModal({
    title: isEdit ? 'Edit Product' : 'Add Product',
    body: html,
    actions: [
      { label: 'Cancel', class: 'btn-outline', handler: closeModal },
      { label: 'Save', class: 'bg-blue-600 text-white', handler: () => saveProduct(p?.id) }
    ]
  });
}

async function saveProduct(id = null) {
  const form = $('#product-form');
  if (!form.checkValidity()) { form.reportValidity(); return; }
  
  let sku = $('#prod-sku').value.trim();
  const name = $('#prod-name').value.trim();
  const catId = $('#prod-cat').value || null;
  if (!sku) {
    const cname = state.categories.find(c => c.id === catId)?.name || 'GEN';
    sku = `${cname.substring(0,3).toUpperCase()}-${name.substring(0,3).toUpperCase()}-${Math.floor(Math.random()*1000)}`;
  }
  
  const data = {
    store_id: state.store.id,
    name,
    category_id: catId,
    emoji: $('#prod-emoji').value.trim() || '📦',
    price: parseFloat($('#prod-price').value),
    stock: parseInt($('#prod-stock').value, 10) || 0,
    sku,
    status: 'active'
  };
  
  if (state.isDemo) {
    if (id) {
      const idx = state.products.findIndex(x => x.id === id);
      if (idx !== -1) state.products[idx] = { ...state.products[idx], ...data };
    } else {
      state.products.unshift({ ...data, id: 'prod-' + Date.now() });
    }
    toast('Product saved');
    closeModal();
    renderPage();
    return;
  }
  showLoading();
  let err;
  if (id) {
    const res = await supabase.from('products').update(data).eq('id', id);
    err = res.error;
  } else {
    const res = await supabase.from('products').insert({ ...data, id: crypto.randomUUID() });
    err = res.error;
  }
  hideLoading();
  
  if (err) toast(err.message, 'error');
  else {
    toast('Product saved');
    closeModal();
  }
}

async function deleteProduct(id) {
  const confirmed = await confirmDialog({
    title: 'Delete Product',
    message: 'Are you sure? This cannot be undone.',
  });
  if (!confirmed) return;
  
  showLoading();
  const { error } = await supabase.from('products').delete().eq('id', id);
  hideLoading();
  if (error) toast(error.message, 'error');
  else toast('Product deleted');
}

// ============================================================
// PART 19: Categories Page
// ============================================================
function renderCategoriesPage() {
  const content = $('#page-content');
  const cats = state.categories;
  
  content.innerHTML = `
    <div class="space-y-4">
      <div class="flex justify-between items-center">
        <h1 class="text-2xl font-bold">Categories</h1>
        ${canAccess('settings') ? `<button class="btn bg-blue-600 text-white px-4 py-2 rounded" onclick="openAddCategoryModal()">+ Add Category</button>` : ''}
      </div>
      
      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        ${cats.length === 0 ? `<div class="col-span-full">${emptyState('📂', 'No categories found')}</div>` : 
          cats.map(c => {
            const pCount = state.products.filter(p => p.category_id === c.id).length;
            return `
              <div class="bg-white p-4 rounded-lg shadow-sm border border-gray-100 flex items-center justify-between">
                <div class="flex items-center gap-3">
                  <div class="text-3xl">${c.emoji || '📁'}</div>
                  <div>
                    <div class="font-bold text-gray-800">${escapeHTML(c.name)}</div>
                    <div class="text-sm text-gray-500">${pCount} products</div>
                  </div>
                </div>
                ${canAccess('settings') ? `
                  <div class="flex gap-2">
                    <button class="text-blue-500 hover:text-blue-700" onclick="openEditCategoryModal('${c.id}')">✏️</button>
                    <button class="text-red-500 hover:text-red-700" onclick="deleteCategory('${c.id}')">🗑️</button>
                  </div>
                ` : ''}
              </div>
            `;
          }).join('')
        }
      </div>
    </div>
  `;
}

function openAddCategoryModal() { openEditCategoryModal(null); }
function openEditCategoryModal(id) {
  const c = state.categories.find(x => x.id === id);
  const html = `
    <form id="cat-form" class="space-y-4">
      <div>
        <label class="block text-sm font-medium mb-1">Name *</label>
        <input type="text" id="cat-name" class="input border rounded w-full p-2" value="${escapeHTML(c?.name || '')}" required>
      </div>
      <div>
        <label class="block text-sm font-medium mb-1">Emoji</label>
        <input type="text" id="cat-emoji" class="input border rounded w-full p-2" value="${escapeHTML(c?.emoji || '📁')}" maxlength="2">
      </div>
      <div>
        <label class="block text-sm font-medium mb-1">Sort Order</label>
        <input type="number" id="cat-sort" class="input border rounded w-full p-2" value="${c?.sort_order || '0'}">
      </div>
    </form>
  `;
  openModal({
    title: c ? 'Edit Category' : 'Add Category',
    body: html,
    actions: [
      { label: 'Cancel', class: 'btn-outline', handler: closeModal },
      { label: 'Save', class: 'bg-blue-600 text-white', handler: () => saveCategory(id) }
    ]
  });
}

async function saveCategory(id = null) {
  const form = $('#cat-form');
  if (!form.checkValidity()) { form.reportValidity(); return; }
  const data = {
    store_id: state.store.id,
    name: $('#cat-name').value.trim(),
    emoji: $('#cat-emoji').value.trim() || '📁',
    sort_order: parseInt($('#cat-sort').value, 10) || 0
  };
  if (state.isDemo) {
    if (id) {
      const idx = state.categories.findIndex(c => c.id === id);
      if (idx !== -1) state.categories[idx] = { ...state.categories[idx], ...data };
    } else {
      state.categories.push({ ...data, id: 'cat-' + Date.now() });
    }
    toast('Category saved');
    closeModal();
    renderPage();
    return;
  }
  showLoading();
  let err;
  if (id) err = (await supabase.from('categories').update(data).eq('id', id)).error;
  else err = (await supabase.from('categories').insert({ ...data, id: crypto.randomUUID() })).error;
  hideLoading();
  if (err) toast(err.message, 'error');
  else { toast('Category saved'); closeModal(); await refreshCategories(); renderPage(); }
}

async function refreshCategories() {
  const { data } = await supabase.from('categories').select('*').eq('store_id', state.store.id).order('sort_order');
  if (data) state.categories = data;
}

async function deleteCategory(id) {
  const confirmed = await confirmDialog({ title: 'Delete Category', message: 'Products will lose this category. Continue?' });
  if (!confirmed) return;
  showLoading();
  const { error } = await supabase.from('categories').delete().eq('id', id);
  hideLoading();
  if (error) toast(error.message, 'error');
  else { toast('Deleted'); await refreshCategories(); renderPage(); }
}

// ============================================================
// PART 20: Stock Page
// ============================================================
function renderStockPage() {
  const content = $('#page-content');
  const prods = state.products;
  const lowStock = prods.filter(p => p.stock > 0 && p.stock < 10);
  const outOfStock = prods.filter(p => p.stock <= 0);
  const totalValue = prods.reduce((sum, p) => sum + (p.price * Math.max(0, p.stock)), 0);
  
  content.innerHTML = `
    <div class="space-y-6">
      <h1 class="text-2xl font-bold">Stock Management</h1>
      
      <div class="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div class="bg-white p-6 rounded-lg shadow-sm border border-gray-100">
          <div class="text-gray-500 text-sm mb-1">Total Products</div>
          <div class="text-2xl font-bold">${prods.length}</div>
        </div>
        <div class="bg-white p-6 rounded-lg shadow-sm border border-red-200 bg-red-50">
          <div class="text-red-800 text-sm mb-1">Out of Stock</div>
          <div class="text-2xl font-bold text-red-600">${outOfStock.length}</div>
        </div>
        <div class="bg-white p-6 rounded-lg shadow-sm border border-yellow-200 bg-yellow-50">
          <div class="text-yellow-800 text-sm mb-1">Low Stock (< 10)</div>
          <div class="text-2xl font-bold text-yellow-600">${lowStock.length}</div>
        </div>
        <div class="bg-white p-6 rounded-lg shadow-sm border border-gray-100">
          <div class="text-gray-500 text-sm mb-1">Est. Stock Value</div>
          <div class="text-2xl font-bold text-green-600">${money(totalValue)}</div>
        </div>
      </div>
      
      <div class="bg-white rounded-lg shadow-sm border border-gray-100 overflow-hidden">
        <div class="p-4 border-b flex justify-between items-center">
          <h2 class="font-bold text-lg">Inventory List</h2>
        </div>
        <div class="overflow-x-auto">
          <table class="w-full text-left border-collapse">
            <thead>
              <tr class="bg-gray-50 border-b border-gray-200">
                <th class="p-3 text-sm font-semibold text-gray-600">Product</th>
                <th class="p-3 text-sm font-semibold text-gray-600">SKU</th>
                <th class="p-3 text-sm font-semibold text-gray-600">Category</th>
                <th class="p-3 text-sm font-semibold text-gray-600">Stock</th>
                <th class="p-3 text-sm font-semibold text-gray-600">Action</th>
              </tr>
            </thead>
            <tbody>
              ${prods.map(p => `
                <tr class="border-b border-gray-100 hover:bg-gray-50">
                  <td class="p-3 text-sm">
                    <div class="flex items-center gap-2">
                      <span>${p.emoji || '📦'}</span>
                      <span class="font-medium">${escapeHTML(p.name)}</span>
                    </div>
                  </td>
                  <td class="p-3 text-sm text-gray-500">${escapeHTML(p.sku || '-')}</td>
                  <td class="p-3 text-sm text-gray-500">${escapeHTML(p.categories?.name || '-')}</td>
                  <td class="p-3 text-sm font-bold ${p.stock <= 0 ? 'text-red-600' : p.stock < 10 ? 'text-yellow-600' : 'text-green-600'}">${p.stock}</td>
                  <td class="p-3 text-sm">
                    <button class="btn bg-blue-100 text-blue-700 px-3 py-1 rounded text-xs font-bold" onclick="openRestockModal('${p.id}')">Restock</button>
                    ${canAccess('settings') ? `<button class="btn bg-gray-100 text-gray-700 px-3 py-1 rounded text-xs font-bold ml-2" onclick="openEditProductModal(state.products.find(x=>x.id==='${p.id}'))">Edit</button>` : ''}
                  </td>
                </tr>
              `).join('')}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  `;
}

function openRestockModal(id) {
  const p = state.products.find(x => x.id === id);
  const html = `
    <form id="restock-form" class="space-y-4">
      <div class="bg-gray-50 p-3 rounded border text-sm">
        Current stock for <strong>${escapeHTML(p.name)}</strong> is <strong>${p.stock}</strong>
      </div>
      <div>
        <label class="block text-sm font-medium mb-1">Add Quantity *</label>
        <input type="number" id="restock-qty" class="input border rounded w-full p-2" min="1" value="10" required>
      </div>
      <div>
        <label class="block text-sm font-medium mb-1">Notes</label>
        <input type="text" id="restock-notes" class="input border rounded w-full p-2" placeholder="e.g. Supplier delivery">
      </div>
    </form>
  `;
  openModal({
    title: 'Restock Product',
    body: html,
    actions: [
      { label: 'Cancel', class: 'btn-outline', handler: closeModal },
      { label: 'Update Stock', class: 'bg-blue-600 text-white', handler: () => handleRestock(p) }
    ]
  });
}

async function handleRestock(p) {
  const form = $('#restock-form');
  if (!form.checkValidity()) { form.reportValidity(); return; }
  const addQty = parseInt($('#restock-qty').value, 10);
  const notes = $('#restock-notes').value.trim();
  
  const newStock = p.stock + addQty;
  if (state.isDemo) {
    p.stock = newStock;
    toast(`Stock updated to ${newStock}`);
    closeModal();
    renderPage();
    return;
  }
  showLoading();
  const { error: errP } = await supabase.from('products').update({ stock: newStock }).eq('id', p.id);
  if (errP) { hideLoading(); toast(errP.message, 'error'); return; }
  
  await supabase.from('stock_movements').insert({
    id: crypto.randomUUID(),
    store_id: state.store.id,
    product_id: p.id,
    quantity: addQty,
    type: 'in',
    note: notes || 'Manual restock'
  });
  
  hideLoading();
  toast(`Stock updated to ${newStock}`);
  closeModal();
}

// ============================================================
// PART 21: Customers Page
// ============================================================
function renderCustomersPage() {
  const content = $('#page-content');
  if (state.selectedCustomer) { renderCustomerDetail(); return; }
  
  const f = state.customersFilter;
  let filtered = state.customers.filter(c => {
    let m = true;
    if (f.search) m = m && (c.name.toLowerCase().includes(f.search.toLowerCase()) || (c.phone||'').includes(f.search));
    return m;
  });
  
  content.innerHTML = `
    <div class="space-y-4">
      <div class="flex justify-between items-center">
        <h1 class="text-2xl font-bold">Customers</h1>
        <button class="btn bg-blue-600 text-white px-4 py-2 rounded" onclick="openAddCustomerModal()">+ Add Customer</button>
      </div>
      
      <div class="flex gap-4 bg-white p-4 rounded-lg shadow-sm border border-gray-100">
        <input type="text" id="cust-search" placeholder="Search name or phone..." class="input border rounded p-2 flex-grow" value="${escapeHTML(f.search)}">
      </div>
      
      <div class="bg-white rounded-lg shadow-sm border border-gray-100 overflow-hidden">
        <table class="w-full text-left border-collapse">
          <thead>
            <tr class="bg-gray-50 border-b border-gray-200">
              <th class="p-3 text-sm font-semibold text-gray-600">Customer</th>
              <th class="p-3 text-sm font-semibold text-gray-600">Contact</th>
              <th class="p-3 text-sm font-semibold text-gray-600">Tags</th>
              <th class="p-3 text-sm font-semibold text-gray-600">Action</th>
            </tr>
          </thead>
          <tbody>
            ${filtered.length === 0 ? `<tr><td colspan="4" class="p-8 text-center text-gray-500">No customers found</td></tr>` : 
              filtered.map(c => `
              <tr class="border-b border-gray-100 hover:bg-gray-50">
                <td class="p-3">
                  <div class="flex items-center gap-3">
                    <div class="w-10 h-10 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center font-bold text-sm">
                      ${getInitials(c.name)}
                    </div>
                    <div class="font-medium text-gray-800">${escapeHTML(c.name)}</div>
                  </div>
                </td>
                <td class="p-3 text-sm text-gray-600">
                  <div>${escapeHTML(c.phone || '-')}</div>
                  <div class="text-xs text-gray-400">${escapeHTML(c.email || '')}</div>
                </td>
                <td class="p-3">
                  ${c.tag ? badge(c.tag, c.tag === 'VIP' ? 'warning' : c.tag === 'Regular' ? 'info' : 'muted') : badge('New', 'muted')}
                </td>
                <td class="p-3">
                  <button class="text-blue-600 hover:underline" onclick="state.selectedCustomer = state.customers.find(x=>x.id==='${c.id}'); renderPage();">View Profile</button>
                </td>
              </tr>
            `).join('')}
          </tbody>
        </table>
      </div>
    </div>
  `;
  $('#cust-search')?.addEventListener('input', e => { state.customersFilter.search = e.target.value; renderPage(); });
}

function renderCustomerDetail() {
  const c = state.selectedCustomer;
  if (!c) { renderCustomersPage(); return; }
  
  const cOrders = state.orders.filter(o => o.customer_id === c.id);
  const totalSpent = cOrders.filter(o => o.status === 'completed').reduce((sum, o) => sum + Number(o.total), 0);
  
  $('#page-content').innerHTML = `
    <div class="space-y-6 max-w-5xl mx-auto">
      <div class="flex items-center gap-4">
        <button class="text-gray-500 hover:text-gray-800 text-xl" onclick="state.selectedCustomer = null; renderPage();">←</button>
        <h1 class="text-2xl font-bold flex-grow">Customer Profile</h1>
        <button class="btn bg-gray-100 text-gray-700 px-4 py-2 rounded" onclick="openEditCustomerModal(state.selectedCustomer)">Edit</button>
      </div>
      
      <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div class="md:col-span-1 space-y-6">
          <div class="bg-white p-6 rounded-lg shadow-sm border border-gray-100 text-center">
            <div class="w-24 h-24 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center font-bold text-3xl mx-auto mb-4">
              ${getInitials(c.name)}
            </div>
            <h2 class="text-xl font-bold mb-1">${escapeHTML(c.name)}</h2>
            <div class="text-gray-500 mb-4">${c.tag ? badge(c.tag, c.tag === 'VIP' ? 'warning' : c.tag === 'Regular' ? 'info' : 'muted') : badge('New', 'muted')}</div>
            
            <div class="text-left space-y-3 mt-6 border-t pt-4 text-sm">
              <div><span class="text-gray-500">Phone:</span> <span class="font-medium">${escapeHTML(c.phone || '-')}</span></div>
              <div><span class="text-gray-500">Email:</span> <span class="font-medium">${escapeHTML(c.email || '-')}</span></div>
              <div><span class="text-gray-500">Joined:</span> <span class="font-medium">${formatDateShort(c.created_at)}</span></div>
            </div>
          </div>
          
          <div class="grid grid-cols-2 gap-4">
            <div class="bg-white p-4 rounded-lg shadow-sm border border-gray-100 text-center">
              <div class="text-gray-500 text-xs mb-1">Total Orders</div>
              <div class="text-xl font-bold text-blue-600">${cOrders.length}</div>
            </div>
            <div class="bg-white p-4 rounded-lg shadow-sm border border-gray-100 text-center">
              <div class="text-gray-500 text-xs mb-1">Total Spent</div>
              <div class="text-xl font-bold text-green-600">${money(totalSpent)}</div>
            </div>
          </div>
        </div>
        
        <div class="md:col-span-2 bg-white rounded-lg shadow-sm border border-gray-100 overflow-hidden">
          <div class="p-4 border-b font-bold text-lg">Order History</div>
          <table class="w-full text-left border-collapse">
            <thead>
              <tr class="bg-gray-50 border-b border-gray-200">
                <th class="p-3 text-sm font-semibold text-gray-600">Order #</th>
                <th class="p-3 text-sm font-semibold text-gray-600">Date</th>
                <th class="p-3 text-sm font-semibold text-gray-600">Total</th>
                <th class="p-3 text-sm font-semibold text-gray-600">Status</th>
              </tr>
            </thead>
            <tbody>
              ${cOrders.length === 0 ? `<tr><td colspan="4" class="p-8 text-center text-gray-500">No orders yet</td></tr>` : 
                cOrders.map(o => `
                <tr class="border-b border-gray-100 hover:bg-gray-50 cursor-pointer" onclick="state.selectedOrder = state.orders.find(x=>x.id==='${o.id}'); navigateTo('orders');">
                  <td class="p-3 text-sm text-blue-600 font-medium">${o.order_number}</td>
                  <td class="p-3 text-sm text-gray-500">${formatDateShort(o.created_at)}</td>
                  <td class="p-3 text-sm font-medium">${money(o.total)}</td>
                  <td class="p-3 text-sm">${statusBadge(o.status)}</td>
                </tr>
              `).join('')}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  `;
}

function openAddCustomerModal() { openEditCustomerModal(null); }
function openEditCustomerModal(c) {
  const html = `
    <form id="cust-form" class="space-y-4">
      <div>
        <label class="block text-sm font-medium mb-1">Full Name *</label>
        <input type="text" id="cust-name" class="input border rounded w-full p-2" value="${escapeHTML(c?.name || '')}" required>
      </div>
      <div class="grid grid-cols-2 gap-4">
        <div>
          <label class="block text-sm font-medium mb-1">Phone</label>
          <input type="text" id="cust-phone" class="input border rounded w-full p-2" value="${escapeHTML(c?.phone || '')}">
        </div>
        <div>
          <label class="block text-sm font-medium mb-1">Email</label>
          <input type="email" id="cust-email" class="input border rounded w-full p-2" value="${escapeHTML(c?.email || '')}">
        </div>
      </div>
      <div>
        <label class="block text-sm font-medium mb-1">Address</label>
        <textarea id="cust-addr" class="input border rounded w-full p-2" rows="2">${escapeHTML(c?.address || '')}</textarea>
      </div>
      <div>
        <label class="block text-sm font-medium mb-1">Tag</label>
        <select id="cust-tag" class="input border rounded w-full p-2">
          <option value="New" ${!c?.tag || c?.tag === 'New' ? 'selected' : ''}>New</option>
          <option value="Regular" ${c?.tag === 'Regular' ? 'selected' : ''}>Regular</option>
          <option value="VIP" ${c?.tag === 'VIP' ? 'selected' : ''}>VIP</option>
        </select>
      </div>
    </form>
  `;
  openModal({
    title: c ? 'Edit Customer' : 'Add Customer',
    body: html,
    actions: [
      { label: 'Cancel', class: 'btn-outline', handler: closeModal },
      { label: 'Save', class: 'bg-blue-600 text-white', handler: () => saveCustomer(c?.id) }
    ]
  });
}

async function saveCustomer(id = null) {
  const form = $('#cust-form');
  if (!form.checkValidity()) { form.reportValidity(); return; }
  
  const data = {
    store_id: state.store.id,
    name: $('#cust-name').value.trim(),
    phone: $('#cust-phone').value.trim() || null,
    email: $('#cust-email').value.trim() || null,
    address: $('#cust-addr').value.trim() || null,
    tag: $('#cust-tag').value
  };
  
  if (state.isDemo) {
    if (id) {
      const idx = state.customers.findIndex(c => c.id === id);
      if (idx !== -1) state.customers[idx] = { ...state.customers[idx], ...data };
    } else {
      state.customers.unshift({ ...data, id: 'cust-' + Date.now(), created_at: new Date().toISOString() });
    }
    toast('Customer saved');
    closeModal();
    if (state.selectedCustomer && state.selectedCustomer.id === id) {
      state.selectedCustomer = { ...state.selectedCustomer, ...data };
      renderCustomerDetail();
    } else {
      renderPage();
    }
    return;
  }
  showLoading();
  let err;
  if (id) err = (await supabase.from('customers').update(data).eq('id', id)).error;
  else err = (await supabase.from('customers').insert({ ...data, id: crypto.randomUUID() })).error;
  hideLoading();
  
  if (err) toast(err.message, 'error');
  else {
    toast('Customer saved');
    closeModal();
    if (state.selectedCustomer && state.selectedCustomer.id === id) {
      // simulate refresh detail
      state.selectedCustomer = { ...state.selectedCustomer, ...data };
      renderCustomerDetail();
    }
  }
}

// ============================================================
// PART 22-26: Reviews, Promos, Reports, Settings, Store
// ============================================================

function renderReviewsPage() {
  const content = $('#page-content');
  const reviews = state.reviews || [];
  const avg = reviews.length ? (reviews.reduce((s, r) => s + r.rating, 0) / reviews.length).toFixed(1) : 0;
  
  if (!state.reviewsFilter) state.reviewsFilter = 'all';
  
  let filtered = reviews.filter(r => state.reviewsFilter === 'all' || r.rating === parseInt(state.reviewsFilter));
  
  filtered.sort((a,b) => {
    if (a.is_pinned !== b.is_pinned) return a.is_pinned ? -1 : 1;
    return new Date(b.created_at) - new Date(a.created_at);
  });
  
  content.innerHTML = `
    <div class="space-y-6">
      <div class="flex justify-between items-center">
        <h1 class="text-2xl font-bold">Reviews</h1>
      </div>
      
      <div class="grid grid-cols-2 gap-4">
        <div class="bg-white p-6 rounded-lg shadow-sm border border-gray-100">
          <div class="text-gray-500 text-sm mb-1">Average Rating</div>
          <div class="text-2xl font-bold text-yellow-500">${avg} ★</div>
        </div>
        <div class="bg-white p-6 rounded-lg shadow-sm border border-gray-100">
          <div class="text-gray-500 text-sm mb-1">Total Reviews</div>
          <div class="text-2xl font-bold">${reviews.length}</div>
        </div>
      </div>
      
      <div class="bg-white p-4 rounded-lg shadow-sm border border-gray-100 flex gap-2">
        <select class="input border rounded p-2" onchange="state.reviewsFilter = this.value; renderPage()">
          <option value="all" ${state.reviewsFilter === 'all' ? 'selected' : ''}>All Ratings</option>
          <option value="5" ${state.reviewsFilter === '5' ? 'selected' : ''}>5 ★</option>
          <option value="4" ${state.reviewsFilter === '4' ? 'selected' : ''}>4 ★</option>
          <option value="3" ${state.reviewsFilter === '3' ? 'selected' : ''}>3 ★</option>
          <option value="2" ${state.reviewsFilter === '2' ? 'selected' : ''}>2 ★</option>
          <option value="1" ${state.reviewsFilter === '1' ? 'selected' : ''}>1 ★</option>
        </select>
      </div>
      
      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        ${filtered.length === 0 ? `<div class="col-span-full text-center p-8 text-gray-500">No reviews found</div>` : 
          filtered.map(r => `
            <div class="bg-white p-4 rounded-lg shadow-sm border border-gray-100 flex flex-col gap-3 ${r.is_pinned ? 'border-yellow-400 bg-yellow-50' : ''} ${r.is_hidden ? 'opacity-50' : ''}">
              <div class="flex justify-between items-start">
                <div class="flex items-center gap-2">
                  <div class="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center text-xs font-bold">${getInitials(r.customer_name)}</div>
                  <div>
                    <div class="font-medium text-sm">${escapeHTML(r.customer_name)}</div>
                    <div class="text-xs text-gray-500">${formatDateShort(r.created_at)}</div>
                  </div>
                </div>
                <div class="text-yellow-500 text-sm">${'★'.repeat(r.rating)}${'☆'.repeat(5-r.rating)}</div>
              </div>
              <p class="text-gray-700 text-sm flex-grow">${escapeHTML(r.comment)}</p>
              ${r.reply ? `<div class="bg-gray-100 p-2 rounded text-xs mt-2 text-gray-700 border-l-2 border-blue-500"><strong>Reply:</strong> ${escapeHTML(r.reply)}</div>` : ''}
              <div class="flex gap-2 pt-2 border-t mt-auto">
                <button class="text-xs text-blue-600 hover:underline" onclick="openReplyModal('${r.id}')">Reply</button>
                <button class="text-xs text-gray-600 hover:underline" onclick="toggleReviewPin('${r.id}', ${!r.is_pinned})">${r.is_pinned ? 'Unpin' : 'Pin'}</button>
                <button class="text-xs text-gray-600 hover:underline" onclick="toggleReviewHide('${r.id}', ${!r.is_hidden})">${r.is_hidden ? 'Show' : 'Hide'}</button>
              </div>
            </div>
          `).join('')
        }
      </div>
    </div>
  `;
}

function openReplyModal(id) {
  const r = state.reviews.find(x => x.id === id);
  const html = `
    <textarea id="reply-text" class="input border rounded w-full p-2" rows="4" placeholder="Type your reply...">${escapeHTML(r.reply || '')}</textarea>
  `;
  openModal({
    title: 'Reply to Review',
    body: html,
    actions: [
      { label: 'Cancel', class: 'btn-outline', handler: closeModal },
      { label: 'Save', class: 'bg-blue-600 text-white', handler: () => saveReply(id) }
    ]
  });
}

async function saveReply(id) {
  const text = $('#reply-text').value.trim();
  showLoading();
  const { error } = await supabase.from('reviews').update({ reply: text }).eq('id', id);
  hideLoading();
  if (error) toast(error.message, 'error');
  else { toast('Reply saved'); await refreshReviews(); renderPage(); closeModal(); }
}

async function toggleReviewPin(id, is_pinned) {
  const { error } = await supabase.from('reviews').update({ is_pinned }).eq('id', id);
  if (error) toast(error.message, 'error');
  else { await refreshReviews(); renderPage(); }
}

async function toggleReviewHide(id, is_hidden) {
  const { error } = await supabase.from('reviews').update({ is_hidden }).eq('id', id);
  if (error) toast(error.message, 'error');
  else { await refreshReviews(); renderPage(); }
}

async function refreshReviews() {
  const { data } = await supabase.from('reviews').select('*').eq('store_id', state.store.id).order('created_at', { ascending: false });
  if (data) state.reviews = data;
}

function renderPromotionsPage() {
  const content = $('#page-content');
  const promos = state.promotions || [];
  
  content.innerHTML = `
    <div class="space-y-4">
      <div class="flex justify-between items-center">
        <h1 class="text-2xl font-bold">Promotions</h1>
        ${canAccess('settings') ? `<button class="btn bg-blue-600 text-white px-4 py-2 rounded" onclick="openAddPromotionModal()">+ Add Promotion</button>` : ''}
      </div>
      
      <div class="bg-white rounded-lg shadow-sm border border-gray-100 overflow-hidden">
        <div class="overflow-x-auto">
          <table class="w-full text-left border-collapse">
            <thead>
              <tr class="bg-gray-50 border-b border-gray-200">
                <th class="p-3 text-sm font-semibold text-gray-600">Code</th>
                <th class="p-3 text-sm font-semibold text-gray-600">Discount</th>
                <th class="p-3 text-sm font-semibold text-gray-600">Min Order</th>
                <th class="p-3 text-sm font-semibold text-gray-600">Dates</th>
                <th class="p-3 text-sm font-semibold text-gray-600">Status</th>
                <th class="p-3 text-sm font-semibold text-gray-600">Usage</th>
                <th class="p-3 text-sm font-semibold text-gray-600">Actions</th>
              </tr>
            </thead>
            <tbody>
              ${promos.length === 0 ? `<tr><td colspan="7" class="p-8 text-center text-gray-500">No promotions found</td></tr>` : 
                promos.map(p => `
                <tr class="border-b border-gray-100 hover:bg-gray-50">
                  <td class="p-3 font-mono font-bold text-blue-600">${escapeHTML(p.code)}</td>
                  <td class="p-3 text-sm">${p.type === 'percent' ? p.discount + '%' : money(p.discount)}</td>
                  <td class="p-3 text-sm">${money(p.min_order)}</td>
                  <td class="p-3 text-sm text-gray-500">${formatDateShort(p.start_date)} - ${formatDateShort(p.end_date)}</td>
                  <td class="p-3 text-sm">${statusBadge(p.status || 'inactive')}</td>
                  <td class="p-3 text-sm">${p.used_count || 0} / ${p.max_uses || '∞'}</td>
                  <td class="p-3 text-sm flex gap-2">
                    ${canAccess('settings') ? `
                      <button class="text-blue-500 hover:text-blue-700" onclick="openEditPromotionModal('${p.id}')">Edit</button>
                      <button class="text-red-500 hover:text-red-700" onclick="deletePromotion('${p.id}')">Delete</button>
                    ` : ''}
                  </td>
                </tr>
              `).join('')}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  `;
}

function openAddPromotionModal() { openEditPromotionModal(null); }
function openEditPromotionModal(id) {
  const p = id ? state.promotions.find(x => x.id === id) : null;
  const html = `
    <form id="promo-form" class="space-y-4">
      <div class="flex gap-2 items-end">
        <div class="flex-grow">
          <label class="block text-sm font-medium mb-1">Code *</label>
          <input type="text" id="promo-code" class="input border rounded w-full p-2 uppercase" value="${escapeHTML(p?.code || '')}" required>
        </div>
        <button type="button" class="btn bg-gray-200 px-3 py-2 rounded" onclick="$('#promo-code').value = 'PROMO' + Math.random().toString(36).substring(2,6).toUpperCase()">Generate</button>
      </div>
      <div class="grid grid-cols-2 gap-4">
        <div>
          <label class="block text-sm font-medium mb-1">Type</label>
          <select id="promo-type" class="input border rounded w-full p-2">
            <option value="percent" ${p?.type === 'percent' ? 'selected' : ''}>Percentage (%)</option>
            <option value="fixed" ${p?.type === 'fixed' ? 'selected' : ''}>Fixed Amount (฿)</option>
          </select>
        </div>
        <div>
          <label class="block text-sm font-medium mb-1">Discount Value *</label>
          <input type="number" id="promo-value" class="input border rounded w-full p-2" step="0.01" value="${p?.discount || ''}" required>
        </div>
        <div>
          <label class="block text-sm font-medium mb-1">Min Order Amount</label>
          <input type="number" id="promo-min" class="input border rounded w-full p-2" step="0.01" value="${p?.min_order || '0'}">
        </div>
        <div>
          <label class="block text-sm font-medium mb-1">Max Uses</label>
          <input type="number" id="promo-max" class="input border rounded w-full p-2" value="${p?.max_uses || ''}" placeholder="Leave blank for unlimited">
        </div>
        <div>
          <label class="block text-sm font-medium mb-1">Start Date</label>
          <input type="datetime-local" id="promo-start" class="input border rounded w-full p-2" value="${p?.start_date ? new Date(p.start_date).toISOString().slice(0,16) : ''}">
        </div>
        <div>
          <label class="block text-sm font-medium mb-1">End Date</label>
          <input type="datetime-local" id="promo-end" class="input border rounded w-full p-2" value="${p?.end_date ? new Date(p.end_date).toISOString().slice(0,16) : ''}">
        </div>
      </div>
      <div class="flex items-center gap-2">
        <input type="checkbox" id="promo-active" ${!p || p.status === 'active' ? 'checked' : ''}>
        <label for="promo-active" class="text-sm font-medium">Active</label>
      </div>
    </form>
  `;
  openModal({
    title: p ? 'Edit Promotion' : 'Add Promotion',
    body: html,
    actions: [
      { label: 'Cancel', class: 'btn-outline', handler: closeModal },
      { label: 'Save', class: 'bg-blue-600 text-white', handler: () => savePromotion(p?.id) }
    ]
  });
}

async function savePromotion(id = null) {
  const form = $('#promo-form');
  if (!form.checkValidity()) { form.reportValidity(); return; }
  const data = {
    store_id: state.store.id,
    code: $('#promo-code').value.trim().toUpperCase(),
    type: $('#promo-type').value,
    discount: parseFloat($('#promo-value').value),
    min_order: parseFloat($('#promo-min').value) || 0,
    max_uses: parseInt($('#promo-max').value, 10) || null,
    start_date: $('#promo-start').value || null,
    end_date: $('#promo-end').value || null,
    status: $('#promo-active').checked ? 'active' : 'inactive'
  };
  if (state.isDemo) {
    if (id) {
      const idx = state.promotions.findIndex(p => p.id === id);
      if (idx !== -1) state.promotions[idx] = { ...state.promotions[idx], ...data };
    } else {
      state.promotions.unshift({ ...data, id: 'promo-' + Date.now(), used_count: 0 });
    }
    toast('Promotion saved');
    closeModal();
    renderPage();
    return;
  }
  showLoading();
  let err;
  if (id) err = (await supabase.from('promotions').update(data).eq('id', id)).error;
  else err = (await supabase.from('promotions').insert({ ...data, id: crypto.randomUUID() })).error;
  hideLoading();
  if (err) toast(err.message, 'error');
  else { toast('Promotion saved'); closeModal(); await refreshPromotions(); renderPage(); }
}

async function deletePromotion(id) {
  const confirmed = await confirmDialog({ title: 'Delete Promotion', message: 'Are you sure?' });
  if (!confirmed) return;
  showLoading();
  const { error } = await supabase.from('promotions').delete().eq('id', id);
  hideLoading();
  if (error) toast(error.message, 'error');
  else { toast('Deleted'); await refreshPromotions(); renderPage(); }
}

async function refreshPromotions() {
  const { data } = await supabase.from('promotions').select('*').eq('store_id', state.store.id).order('created_at', { ascending: false });
  if (data) state.promotions = data;
}

function renderReportsPage() {
  const content = $('#page-content');
  const p = state.reportPeriod;
  
  const now = new Date();
  let startTime = new Date();
  if (p === 'daily') startTime.setHours(0,0,0,0);
  else if (p === 'weekly') startTime.setDate(now.getDate() - 7);
  else if (p === 'monthly') startTime.setMonth(now.getMonth() - 1);
  else if (p === 'yearly') startTime.setFullYear(now.getFullYear() - 1);
  
  const periodOrders = state.orders.filter(o => new Date(o.created_at) >= startTime);
  const compOrders = periodOrders.filter(o => o.status === 'completed');
  
  const totalRev = compOrders.reduce((s,o) => s + Number(o.total), 0);
  const aov = compOrders.length ? totalRev / compOrders.length : 0;
  
  content.innerHTML = `
    <div class="space-y-6">
      <div class="flex justify-between items-center print:hidden">
        <h1 class="text-2xl font-bold">Reports</h1>
        <div class="flex gap-2">
          <button class="btn bg-gray-200 px-3 py-1 rounded hover:bg-gray-300" onclick="exportCSV()">CSV</button>
          <button class="btn bg-gray-200 px-3 py-1 rounded hover:bg-gray-300" onclick="window.print()">Print</button>
        </div>
      </div>
      
      <div class="flex gap-2 mb-4 print:hidden">
        ${['daily','weekly','monthly','yearly'].map(t => `
          <button class="px-4 py-2 rounded-lg font-medium ${p === t ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-700'}" onclick="state.reportPeriod = '${t}'; renderPage()">${t.charAt(0).toUpperCase() + t.slice(1)}</button>
        `).join('')}
      </div>
      
      <div class="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div class="bg-white p-6 rounded-lg shadow-sm border border-gray-100">
          <div class="text-gray-500 text-sm mb-1">Total Revenue</div>
          <div class="text-2xl font-bold text-green-600">${money(totalRev)}</div>
        </div>
        <div class="bg-white p-6 rounded-lg shadow-sm border border-gray-100">
          <div class="text-gray-500 text-sm mb-1">Total Orders</div>
          <div class="text-2xl font-bold">${periodOrders.length}</div>
        </div>
        <div class="bg-white p-6 rounded-lg shadow-sm border border-gray-100">
          <div class="text-gray-500 text-sm mb-1">Average Order Value</div>
          <div class="text-2xl font-bold text-blue-600">${money(aov)}</div>
        </div>
        <div class="bg-white p-6 rounded-lg shadow-sm border border-gray-100">
          <div class="text-gray-500 text-sm mb-1">Completed Orders</div>
          <div class="text-2xl font-bold">${compOrders.length}</div>
        </div>
      </div>
      
      <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div class="bg-white p-4 rounded-lg shadow-sm border border-gray-100">
          <h2 class="font-bold mb-4">Revenue</h2>
          <div class="h-64"><canvas id="report-line"></canvas></div>
        </div>
        <div class="bg-white p-4 rounded-lg shadow-sm border border-gray-100">
          <h2 class="font-bold mb-4">Revenue by Category</h2>
          <div class="h-64"><canvas id="report-doughnut"></canvas></div>
        </div>
      </div>
      
      <div class="bg-white rounded-lg shadow-sm border border-gray-100 overflow-hidden">
        <div class="p-4 border-b font-bold">Orders in Period</div>
        <div class="overflow-x-auto">
          <table class="w-full text-left border-collapse">
            <thead>
              <tr class="bg-gray-50 border-b border-gray-200">
                <th class="p-3 text-sm font-semibold text-gray-600">Order #</th>
                <th class="p-3 text-sm font-semibold text-gray-600">Date</th>
                <th class="p-3 text-sm font-semibold text-gray-600">Total</th>
                <th class="p-3 text-sm font-semibold text-gray-600">Status</th>
              </tr>
            </thead>
            <tbody>
              ${periodOrders.length === 0 ? `<tr><td colspan="4" class="p-4 text-center text-gray-500">No data</td></tr>` : 
                periodOrders.map(o => `
                <tr class="border-b border-gray-100">
                  <td class="p-3 text-sm">${o.order_number}</td>
                  <td class="p-3 text-sm text-gray-500">${formatDateShort(o.created_at)}</td>
                  <td class="p-3 text-sm font-medium">${money(o.total)}</td>
                  <td class="p-3 text-sm">${statusBadge(o.status)}</td>
                </tr>
              `).join('')}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  `;
  
  setTimeout(() => {
    if (!window.Chart) return;
    const catTotals = {};
    compOrders.forEach(o => {
      (o.order_items||[]).forEach(i => {
        const p = state.products.find(x=>x.id===i.product_id);
        const cname = p?.categories?.name || 'Unknown';
        catTotals[cname] = (catTotals[cname] || 0) + (i.unit_price * i.quantity);
      });
    });
    
    new Chart(document.getElementById('report-doughnut'), {
      type: 'doughnut',
      data: {
        labels: Object.keys(catTotals),
        datasets: [{ data: Object.values(catTotals), backgroundColor: ['#3b82f6','#10b981','#f59e0b','#ef4444','#8b5cf6'] }]
      },
      options: { responsive: true, maintainAspectRatio: false }
    });
    
    const lineData = {};
    compOrders.forEach(o => {
      const d = o.created_at.split('T')[0];
      lineData[d] = (lineData[d] || 0) + Number(o.total);
    });
    const sortedDates = Object.keys(lineData).sort();
    
    new Chart(document.getElementById('report-line'), {
      type: 'line',
      data: {
        labels: sortedDates,
        datasets: [{ label: 'Revenue', data: sortedDates.map(d => lineData[d]), borderColor: '#3b82f6', tension: 0.1 }]
      },
      options: { responsive: true, maintainAspectRatio: false }
    });
  }, 100);
}

function exportCSV() {
  const p = state.reportPeriod;
  const now = new Date();
  let startTime = new Date();
  if (p === 'daily') startTime.setHours(0,0,0,0);
  else if (p === 'weekly') startTime.setDate(now.getDate() - 7);
  else if (p === 'monthly') startTime.setMonth(now.getMonth() - 1);
  else if (p === 'yearly') startTime.setFullYear(now.getFullYear() - 1);
  
  const periodOrders = state.orders.filter(o => new Date(o.created_at) >= startTime);
  
  let csv = 'Order Number,Date,Customer,Total Amount,Status\\n';
  periodOrders.forEach(o => {
    const cust = (o.customers?.name || 'Walk-in').replace(/,/g, '');
    csv += `${o.order_number},${o.created_at},${cust},${o.total},${o.status}\\n`;
  });
  
  const blob = new Blob([csv], { type: 'text/csv' });
  const url = window.URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `haypos_orders_${p}.csv`;
  a.click();
}

function renderSettingsPage() {
  const content = $('#page-content');
  const t = state.settingsTab;
  
  content.innerHTML = `
    <div class="space-y-6">
      <h1 class="text-2xl font-bold">Settings</h1>
      
      <div class="flex gap-4 border-b">
        ${['store','payment','appearance','staff'].map(tab => `
          <button class="px-4 py-2 font-medium ${t === tab ? 'border-b-2 border-blue-600 text-blue-600' : 'text-gray-500'}" onclick="state.settingsTab = '${tab}'; renderPage()">
            ${tab.charAt(0).toUpperCase() + tab.slice(1)}
          </button>
        `).join('')}
      </div>
      
      ${t === 'store' ? `
        <div class="bg-white p-6 rounded-lg shadow-sm border border-gray-100 max-w-2xl">
          <form id="set-store-form" class="space-y-4">
            <div><label class="block text-sm font-medium mb-1">Store Name</label><input type="text" id="set-name" class="input border rounded w-full p-2" value="${escapeHTML(state.store?.name || '')}" required></div>
            <div><label class="block text-sm font-medium mb-1">Tagline</label><input type="text" id="set-tag" class="input border rounded w-full p-2" value="${escapeHTML(state.store?.tagline || '')}"></div>
            <div><label class="block text-sm font-medium mb-1">Phone</label><input type="text" id="set-phone" class="input border rounded w-full p-2" value="${escapeHTML(state.store?.phone || '')}"></div>
            <div><label class="block text-sm font-medium mb-1">Address</label><textarea id="set-addr" class="input border rounded w-full p-2" rows="2">${escapeHTML(state.store?.address || '')}</textarea></div>
            <div class="grid grid-cols-2 gap-4">
              <div><label class="block text-sm font-medium mb-1">Currency</label><input type="text" id="set-curr" class="input border rounded w-full p-2" value="${escapeHTML(state.store?.currency || 'THB')}"></div>
              <div><label class="block text-sm font-medium mb-1">Timezone</label><input type="text" id="set-tz" class="input border rounded w-full p-2" value="${escapeHTML(state.store?.timezone || 'Asia/Bangkok')}"></div>
            </div>
            <button type="button" class="btn bg-blue-600 text-white px-4 py-2 rounded mt-4" onclick="saveStoreDetails()">Save Store Details</button>
          </form>
        </div>
      ` : t === 'payment' ? `
        <div class="bg-white p-6 rounded-lg shadow-sm border border-gray-100 max-w-2xl">
          <form id="set-pay-form" class="space-y-4">
            <div><label class="block text-sm font-medium mb-1">Bank Name</label><input type="text" id="pay-bank" class="input border rounded w-full p-2" value="${escapeHTML(state.storeSettings?.bank_name || '')}"></div>
            <div><label class="block text-sm font-medium mb-1">Account Number</label><input type="text" id="pay-acc" class="input border rounded w-full p-2" value="${escapeHTML(state.storeSettings?.bank_account || '')}"></div>
            <div><label class="block text-sm font-medium mb-1">Account Holder</label><input type="text" id="pay-holder" class="input border rounded w-full p-2" value="${escapeHTML(state.storeSettings?.account_holder || '')}"></div>
            <button type="button" class="btn bg-blue-600 text-white px-4 py-2 rounded mt-4" onclick="savePaymentSettings()">Save Payment Info</button>
          </form>
        </div>
      ` : t === 'appearance' ? `
        <div class="bg-white p-6 rounded-lg shadow-sm border border-gray-100 max-w-2xl space-y-6">
          <div>
            <label class="block text-sm font-medium mb-2">Theme Mode</label>
            <button class="btn border px-4 py-2 rounded" onclick="toggleTheme()">${state.darkMode ? 'Switch to Light Mode ☀️' : 'Switch to Dark Mode 🌙'}</button>
          </div>
          <div>
            <label class="block text-sm font-medium mb-2">Primary Color</label>
            <div class="flex gap-2">
              ${['#3b82f6','#10b981','#f43f5e','#8b5cf6','#f59e0b'].map(c => `
                <button class="w-8 h-8 rounded-full border-2 border-white shadow-md cursor-pointer" style="background-color: ${c}" onclick="document.documentElement.style.setProperty('--primary', '${c}')"></button>
              `).join('')}
            </div>
          </div>
          <div>
            <label class="block text-sm font-medium mb-2">Font Size</label>
            <select class="input border rounded p-2" onchange="document.documentElement.style.fontSize = this.value">
              <option value="14px">Small</option>
              <option value="16px" selected>Normal</option>
              <option value="18px">Large</option>
            </select>
          </div>
        </div>
      ` : `
        <div class="bg-white p-6 rounded-lg shadow-sm border border-gray-100">
          <div class="flex justify-between items-center mb-4">
            <h2 class="font-bold">Staff Members</h2>
            <button class="btn bg-blue-600 text-white px-3 py-1 rounded text-sm" onclick="alert('To add staff, create a user in Supabase Auth, then insert a row into profiles table linked to this store_id.')">+ Add Staff</button>
          </div>
          <p class="text-sm text-gray-500 mb-4">Staff management requires owner privileges. Note: real staff management logic would dynamically fetch from profiles where store_id matches.</p>
          <table class="w-full text-left border-collapse">
            <thead>
              <tr class="bg-gray-50 border-b border-gray-200">
                <th class="p-3 text-sm font-semibold text-gray-600">Name</th>
                <th class="p-3 text-sm font-semibold text-gray-600">Role</th>
                <th class="p-3 text-sm font-semibold text-gray-600">Status</th>
              </tr>
            </thead>
            <tbody>
              <tr><td class="p-3 text-sm">${escapeHTML(state.profile?.full_name || 'You')}</td><td class="p-3 text-sm">${escapeHTML(state.profile?.role || 'owner')}</td><td class="p-3 text-sm">Active</td></tr>
            </tbody>
          </table>
        </div>
      `}
    </div>
  `;
}

async function saveStoreDetails() {
  const data = {
    name: $('#set-name').value,
    tagline: $('#set-tag').value,
    phone: $('#set-phone').value,
    address: $('#set-addr').value,
    currency: $('#set-curr').value,
    timezone: $('#set-tz').value,
  };
  showLoading();
  const { error } = await supabase.from('stores').update(data).eq('id', state.store.id);
  hideLoading();
  if (error) toast(error.message, 'error');
  else { toast('Store details saved'); state.store = { ...state.store, ...data }; renderSidebar(); }
}

async function savePaymentSettings() {
  const data = {
    bank_name: $('#pay-bank').value,
    bank_account: $('#pay-acc').value,
    account_holder: $('#pay-holder').value,
  };
  showLoading();
  let error;
  if (state.storeSettings?.id) {
    error = (await supabase.from('store_settings').update(data).eq('id', state.storeSettings.id)).error;
  } else {
    data.store_id = state.store.id;
    error = (await supabase.from('store_settings').insert({ ...data, id: crypto.randomUUID() })).error;
  }
  hideLoading();
  if (error) toast(error.message, 'error');
  else { toast('Payment info saved'); state.storeSettings = { ...state.storeSettings, ...data }; }
}

function renderStorePage() {
  const content = $('#page-content');
  const tab = state.storeTab;
  
  let tabHtml = '';
  if (tab === 'home') {
    const featured = state.products.filter(p => p.status === 'active').slice(0,8);
    tabHtml = `
      <div class="bg-blue-600 text-white p-12 text-center rounded-lg mb-8">
        <h2 class="text-4xl font-bold mb-2">${escapeHTML(state.store?.name || 'Welcome to Our Store')}</h2>
        <p class="text-xl opacity-90">${escapeHTML(state.store?.tagline || 'The best products at the best prices')}</p>
        <button class="mt-6 bg-white text-blue-600 px-6 py-2 rounded-full font-bold shadow hover:bg-gray-100" onclick="state.storeTab='products'; renderPage()">Shop Now</button>
      </div>
      <h3 class="text-2xl font-bold mb-4">Featured Products</h3>
      <div class="grid grid-cols-2 md:grid-cols-4 gap-4">
        ${featured.map(p => `
          <div class="border rounded-lg p-4 text-center shadow-sm bg-white hover:shadow-md transition">
            <div class="text-6xl mb-4">${p.emoji || '📦'}</div>
            <div class="font-bold text-gray-800 line-clamp-1">${escapeHTML(p.name)}</div>
            <div class="text-blue-600 font-bold mt-2">${money(p.price)}</div>
            <button class="mt-4 w-full bg-gray-100 hover:bg-blue-100 text-blue-600 py-2 rounded text-sm font-bold" onclick="addToCart('${p.id}'); toast('Added to cart')">Add to Cart</button>
          </div>
        `).join('')}
      </div>
    `;
  } else if (tab === 'products') {
    const active = state.products.filter(p => p.status === 'active');
    tabHtml = `
      <h3 class="text-2xl font-bold mb-4">All Products</h3>
      <div class="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
        ${active.map(p => `
          <div class="border rounded-lg p-4 text-center shadow-sm bg-white hover:shadow-md transition flex flex-col">
            <div class="text-6xl mb-4">${p.emoji || '📦'}</div>
            <div class="font-bold text-gray-800 flex-grow">${escapeHTML(p.name)}</div>
            <div class="text-blue-600 font-bold mt-2">${money(p.price)}</div>
            <button class="mt-4 w-full bg-gray-100 hover:bg-blue-100 text-blue-600 py-2 rounded text-sm font-bold" onclick="addToCart('${p.id}'); toast('Added to cart')">Add to Cart</button>
          </div>
        `).join('')}
      </div>
    `;
  } else if (tab === 'cart') {
    const items = Object.entries(state.cart).map(([id, qty]) => {
      const p = state.products.find(x => x.id === id);
      return p ? { ...p, qty } : null;
    }).filter(Boolean);
    const { total } = getCartTotals();
    
    tabHtml = `
      <h3 class="text-2xl font-bold mb-4">Your Cart</h3>
      ${items.length === 0 ? `<div class="text-center p-12 bg-white rounded-lg border text-gray-500">Your cart is empty. <br><button class="mt-4 text-blue-600 hover:underline" onclick="state.storeTab='products'; renderPage()">Continue Shopping</button></div>` : `
        <div class="bg-white rounded-lg border p-4 space-y-4">
          ${items.map(item => `
            <div class="flex items-center justify-between border-b pb-4">
              <div class="flex items-center gap-4">
                <div class="text-4xl">${item.emoji || '📦'}</div>
                <div>
                  <div class="font-bold">${escapeHTML(item.name)}</div>
                  <div class="text-gray-500">${money(item.price)}</div>
                </div>
              </div>
              <div class="flex items-center gap-4">
                <div class="flex items-center gap-2 bg-gray-100 rounded p-1">
                  <button class="w-8 h-8 flex items-center justify-center bg-white rounded shadow-sm font-bold" onclick="decreaseCart('${item.id}'); renderPage()">-</button>
                  <span class="w-8 text-center font-bold">${item.qty}</span>
                  <button class="w-8 h-8 flex items-center justify-center bg-white rounded shadow-sm font-bold" onclick="addToCart('${item.id}'); renderPage()">+</button>
                </div>
                <div class="font-bold text-lg w-24 text-right">${money(item.price * item.qty)}</div>
              </div>
            </div>
          `).join('')}
          <div class="text-right text-2xl font-bold pt-4">Total: <span class="text-blue-600">${money(total)}</span></div>
          <div class="flex justify-end gap-4 pt-4">
            <button class="btn btn-outline px-6 py-2 rounded" onclick="clearCart(); renderPage()">Clear</button>
            <button class="btn bg-blue-600 text-white px-8 py-2 rounded font-bold" onclick="state.storeTab='checkout'; renderPage()">Checkout</button>
          </div>
        </div>
      `}
    `;
  } else if (tab === 'checkout') {
    const { total } = getCartTotals();
    tabHtml = `
      <div class="max-w-2xl mx-auto bg-white rounded-lg border p-6 space-y-6">
        <h3 class="text-2xl font-bold border-b pb-4">Checkout</h3>
        <div class="space-y-4">
          <div><label class="block font-medium mb-1">Your Name</label><input type="text" id="chk-name" class="input border rounded w-full p-2" required></div>
          <div><label class="block font-medium mb-1">Phone Number</label><input type="text" id="chk-phone" class="input border rounded w-full p-2" required></div>
          <div>
            <label class="block font-medium mb-1">Payment Method</label>
            <select id="chk-method" class="input border rounded w-full p-2">
              <option value="qr">PromptPay / QR</option>
              <option value="card">Credit Card</option>
              <option value="cash">Cash on Delivery</option>
            </select>
          </div>
          <div><label class="block font-medium mb-1">Promo Code</label><input type="text" id="chk-promo" class="input border rounded w-full p-2"></div>
          <div><label class="block font-medium mb-1">Note to Seller</label><textarea id="chk-note" class="input border rounded w-full p-2" rows="2"></textarea></div>
          
          <div class="bg-gray-50 p-4 rounded text-xl font-bold flex justify-between items-center">
            <span>Amount to Pay</span>
            <span class="text-blue-600">${money(total)}</span>
          </div>
          
          <button class="w-full bg-green-600 text-white py-3 rounded-lg font-bold text-lg hover:bg-green-700" onclick="handleStoreCheckout()">Place Order</button>
        </div>
      </div>
    `;
  } else if (tab === 'tracking') {
    tabHtml = `
      <div class="max-w-xl mx-auto space-y-6">
        <h3 class="text-2xl font-bold text-center">Track Your Order</h3>
        <div class="flex gap-2">
          <input type="text" id="track-input" class="input border rounded p-3 w-full text-center text-lg uppercase" placeholder="Enter Order Number (e.g. ORD-...)">
          <button class="bg-blue-600 text-white px-6 rounded font-bold" onclick="trackOrder()">Track</button>
        </div>
        <div id="track-result" class="bg-white rounded-lg border p-6 hidden"></div>
      </div>
    `;
  } else if (tab === 'receipt') {
    tabHtml = `
      <div class="max-w-md mx-auto bg-white rounded-lg border shadow-lg p-8 text-center space-y-4">
        <div class="text-6xl text-green-500 mb-4">✅</div>
        <h3 class="text-2xl font-bold">Order Placed!</h3>
        <p class="text-gray-500">Thank you for your purchase.</p>
        <div class="bg-gray-50 border rounded p-4 text-lg">
          Order Number:<br>
          <strong class="text-2xl text-blue-600">${state.storeLastOrderId || ''}</strong>
        </div>
        <p class="text-sm text-gray-500">Please save this order number to track your order.</p>
        <button class="mt-6 bg-blue-600 text-white px-6 py-2 rounded font-bold hover:bg-blue-700" onclick="state.storeTab='home'; renderPage()">Continue Shopping</button>
      </div>
    `;
  }
  
  content.innerHTML = `
    <div class="bg-gray-50 -mx-6 -my-6 p-6 min-h-[calc(100vh-100px)]">
      <div class="max-w-6xl mx-auto space-y-6">
        <div class="bg-white rounded-lg shadow-sm p-4 flex justify-center gap-6 text-sm font-bold text-gray-600 border border-gray-200">
          <button class="${tab==='home'?'text-blue-600':''}" onclick="state.storeTab='home'; renderPage()">HOME</button>
          <button class="${tab==='products'?'text-blue-600':''}" onclick="state.storeTab='products'; renderPage()">PRODUCTS</button>
          <button class="${tab==='cart'?'text-blue-600':''}" onclick="state.storeTab='cart'; renderPage()">CART (${Object.keys(state.cart).length})</button>
          <button class="${tab==='tracking'?'text-blue-600':''}" onclick="state.storeTab='tracking'; renderPage()">TRACKING</button>
        </div>
        ${tabHtml}
      </div>
    </div>
  `;
}

async function handleStoreCheckout() {
  const name = $('#chk-name').value.trim();
  const phone = $('#chk-phone').value.trim();
  if (!name || !phone) { toast('Please enter name and phone', 'warning'); return; }
  
  const d = new Date();
  const dateStr = d.getFullYear() + String(d.getMonth()+1).padStart(2,'0') + String(d.getDate()).padStart(2,'0');
  const randNum = String(Math.floor(Math.random() * 9999)).padStart(4, '0');
  const orderNumber = `ORD-${dateStr}-${randNum}`;
  
  const { total } = getCartTotals();
  const items = Object.entries(state.cart).map(([id, qty]) => {
    const p = state.products.find(x => x.id === id);
    return { product_id: id, quantity: qty, unit_price: p.price, total: p.price * qty, product_name: p.name };
  });
  
  const orderData = {
    store_id: state.store.id,
    order_number: orderNumber,
    subtotal: total, discount: 0, tax: 0, total: total,
    status: 'waiting',
    payment_method: $('#chk-method').value,
    note: $('#chk-note').value + ` (Customer: ${name}, ${phone})`
  };
  
  showLoading();
  const { data: ord, error: errO } = await supabase.from('orders').insert({ ...orderData, id: crypto.randomUUID() }).select().single();
  if (errO) { hideLoading(); toast(errO.message, 'error'); return; }
  
  const itemsData = items.map(i => ({
    id: crypto.randomUUID(),
    order_id: ord.id,
    product_id: i.product_id,
    product_name: i.product_name,
    quantity: i.quantity,
    unit_price: i.unit_price,
    total: i.total
  }));
  await supabase.from('order_items').insert(itemsData);
  
  hideLoading();
  clearCart();
  state.storeLastOrderId = orderNumber;
  state.storeTab = 'receipt';
  renderPage();
}

async function trackOrder() {
  const num = $('#track-input').value.trim().toUpperCase();
  if (!num) return;
  
  showLoading();
  const { data, error } = await supabase.from('orders').select('*, order_items(*)').eq('order_number', num).single();
  hideLoading();
  
  const res = $('#track-result');
  res.style.display = 'block';
  
  if (error || !data) {
    res.innerHTML = `<div class="text-red-500 text-center py-4">Order not found. Please check your number.</div>`;
    return;
  }
  
  const steps = ['waiting', 'verify', 'preparing', 'completed'];
  const cIdx = steps.indexOf(data.status);
  const isCancelled = data.status === 'cancelled';
  
  if (isCancelled) {
    res.innerHTML = `<div class="text-red-500 text-center py-4 font-bold text-xl">Order Cancelled</div>`;
    return;
  }
  
  res.innerHTML = `
    <h4 class="font-bold text-lg mb-4 text-center">Status: ${data.status.toUpperCase()}</h4>
    <div class="flex justify-between items-center relative mb-8">
      <div class="absolute left-0 right-0 top-1/2 h-1 bg-gray-200 -z-10 -translate-y-1/2"></div>
      ${steps.map((s, i) => `
        <div class="flex flex-col items-center bg-white px-2">
          <div class="w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm ${i <= cIdx ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-500'}">
            ${i < cIdx ? '✓' : i+1}
          </div>
          <div class="text-xs mt-1 capitalize ${i <= cIdx ? 'text-gray-800 font-bold' : 'text-gray-400'}">${s}</div>
        </div>
      `).join('')}
    </div>
    <div class="text-center font-bold text-lg border-t pt-4">Total: ${money(data.total)}</div>
  `;
}

// ============================================================
// PART 27: Login Form
// ============================================================
async function handleLogin(e) {
  e.preventDefault();
  const email = $('#login-email').value.trim();
  const password = $('#login-password').value;
  const btn = $('#login-btn');
  const errorEl = $('#auth-error');
  
  if (!email || !password) {
    errorEl.textContent = 'Please enter email and password';
    errorEl.style.display = 'block';
    return;
  }
  
  btn.textContent = 'Signing in...';
  btn.disabled = true;
  errorEl.style.display = 'none';
  
  const { error } = await supabase.auth.signInWithPassword({ email, password });
  
  btn.textContent = 'Sign In';
  btn.disabled = false;
  
  if (error) {
    errorEl.textContent = error.message;
    errorEl.style.display = 'block';
  }
}

// ============================================================
// PART 28: Event Listeners (DOMContentLoaded)
// ============================================================
function setupEventListeners() {
  initApp();
  
  const loginForm = $('#login-form');
  if (loginForm) loginForm.addEventListener('submit', handleLogin);
  
  const forgotLink = $('#forgot-link');
  if (forgotLink) forgotLink.addEventListener('click', async (e) => {
    e.preventDefault();
    const email = $('#login-email').value.trim();
    if (!email) { toast('Please enter your email first', 'warning'); return; }
    if (supabase) {
      const { error } = await supabase.auth.resetPasswordForEmail(email);
      if (error) toast(error.message, 'error');
      else toast('Password reset email sent!', 'success');
    } else {
      toast('Demo mode: Password reset email sent!', 'success');
    }
  });
  
  const themeToggleEl = $('#theme-toggle');
  if (themeToggleEl) themeToggleEl.addEventListener('click', toggleTheme);
  
  const logoutBtn = $('#logout-btn');
  if (logoutBtn) logoutBtn.addEventListener('click', logout);
  
  const modalCloseBtn = $('#modal-close');
  if (modalCloseBtn) modalCloseBtn.addEventListener('click', closeModal);
  const modalOverlay = $('#modal-overlay');
  if (modalOverlay) modalOverlay.addEventListener('click', (e) => {
    if (e.target === modalOverlay) closeModal();
  });
  
  const sidebarToggleEl = $('#sidebar-toggle');
  if (sidebarToggleEl) sidebarToggleEl.addEventListener('click', toggleSidebar);
  
  const mobileMenuBtn = $('#mobile-menu-btn');
  if (mobileMenuBtn) mobileMenuBtn.addEventListener('click', () => {
    $('#sidebar').classList.toggle('sidebar-open');
  });
  
  const notifBtn = $('#notif-btn');
  if (notifBtn) notifBtn.addEventListener('click', toggleNotifPanel);
  const notifClose = $('#notif-close');
  if (notifClose) notifClose.addEventListener('click', () => {
    $('#notif-panel').style.display = 'none';
  });
  
  const globalSearchEl = $('#global-search');
  if (globalSearchEl) globalSearchEl.addEventListener('input', handleGlobalSearch);
  
  window.addEventListener('resize', handleResize);
  handleResize();
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', setupEventListeners);
} else {
  setupEventListeners();
}

function toggleSidebar() {
  state.sidebarCollapsed = !state.sidebarCollapsed;
  const sidebar = $('#sidebar');
  const wrapper = $('.main-wrapper');
  if (sidebar) sidebar.classList.toggle('collapsed', state.sidebarCollapsed);
  if (wrapper) wrapper.classList.toggle('sidebar-collapsed', state.sidebarCollapsed);
  localStorage.setItem('haypos_sidebar', state.sidebarCollapsed ? 'collapsed' : 'expanded');
}

function handleResize() {
  const sidebar = $('#sidebar');
  if (!sidebar) return;
  if (window.innerWidth < 1024) {
    sidebar.classList.remove('collapsed');
  } else {
    const savedState = localStorage.getItem('haypos_sidebar');
    if (savedState === 'collapsed') sidebar.classList.add('collapsed');
  }
}

function toggleNotifPanel() {
  const panel = $('#notif-panel');
  if (!panel) return;
  const isVisible = panel.style.display !== 'none';
  panel.style.display = isVisible ? 'none' : 'block';
  
  if (!isVisible) {
    const list = $('#notif-list');
    if (list) {
      if (state.notifications.length === 0) {
        list.innerHTML = '<div class="notif-empty p-4 text-center text-gray-500">No notifications</div>';
      } else {
        list.innerHTML = state.notifications.slice(0, 20).map(n => `
          <div class="notif-item p-3 border-b hover:bg-gray-50 flex items-start gap-3">
            <span class="notif-dot w-2 h-2 mt-1.5 rounded-full ${n.type === 'error' ? 'bg-red-500' : n.type === 'success' ? 'bg-green-500' : 'bg-blue-500'}"></span>
            <div>
              <div class="notif-msg text-sm text-gray-800">${escapeHTML(n.message)}</div>
              <div class="notif-time text-xs text-gray-500 mt-1">${formatDate(n.time)}</div>
            </div>
          </div>
        `).join('');
      }
    }
    state.notifications = [];
    updateNotifBadge();
  }
}

function handleGlobalSearch(e) {
  const query = e.target.value.toLowerCase().trim();
  if (!query) return;
  
  const prodMatch = state.products.find(p => p.name.toLowerCase().includes(query));
  const custMatch = state.customers.find(c => c.name.toLowerCase().includes(query));
  const orderMatch = state.orders.find(o => o.order_number.toLowerCase().includes(query));
  
  if (orderMatch) {
    state.ordersFilter.search = query;
    navigateTo('orders');
  } else if (prodMatch) {
    state.productsFilter.search = query;
    navigateTo('products');
  } else if (custMatch) {
    state.customersFilter.search = query;
    navigateTo('customers');
  }
}


// ============================================================
// DEMO & MOCK DATA MODE
// ============================================================
const DEMO_STORE = {
  id: '00000000-0000-0000-0000-000000000001',
  name: 'HayBerry Café',
  tagline: 'Premium Café & Bakery',
  phone: '+66 81 234 5678',
  address: '123 Sukhumvit Rd, Bangkok 10110',
  currency: 'THB',
  timezone: 'Asia/Bangkok'
};

const DEMO_CATEGORIES = [
  {
    "id": "00000000-0000-0000-0001-000000000001",
    "name": "Bakery",
    "emoji": "🧁",
    "color": "#F8BFD4",
    "sort_order": 1
  },
  {
    "id": "00000000-0000-0000-0001-000000000002",
    "name": "Drinks",
    "emoji": "☕",
    "color": "#8BB6E8",
    "sort_order": 2
  },
  {
    "id": "00000000-0000-0000-0001-000000000003",
    "name": "Snacks",
    "emoji": "🍿",
    "color": "#F0B265",
    "sort_order": 3
  },
  {
    "id": "00000000-0000-0000-0001-000000000004",
    "name": "Seasonal",
    "emoji": "🌸",
    "color": "#7CC59A",
    "sort_order": 4
  },
  {
    "id": "00000000-0000-0000-0001-000000000005",
    "name": "Gift Box",
    "emoji": "🎁",
    "color": "#E58B94",
    "sort_order": 5
  }
];

const DEMO_PRODUCTS = [
  {
    "id": "00000000-0000-0000-0002-000000000001",
    "store_id": "00000000-0000-0000-0000-000000000001",
    "category_id": "00000000-0000-0000-0001-000000000001",
    "sku": "BAK-001",
    "name": "Strawberry Lava Cake",
    "flavor": "Strawberry",
    "emoji": "🧁",
    "price": 125,
    "stock": 10,
    "status": "active"
  },
  {
    "id": "00000000-0000-0000-0002-000000000002",
    "store_id": "00000000-0000-0000-0000-000000000001",
    "category_id": "00000000-0000-0000-0001-000000000001",
    "sku": "BAK-002",
    "name": "Matcha Honey Croissant",
    "flavor": "Matcha",
    "emoji": "🥐",
    "price": 85,
    "stock": 15,
    "status": "active"
  },
  {
    "id": "00000000-0000-0000-0002-000000000003",
    "store_id": "00000000-0000-0000-0000-000000000001",
    "category_id": "00000000-0000-0000-0001-000000000001",
    "sku": "BAK-003",
    "name": "Vanilla Dream Eclair",
    "flavor": "Vanilla",
    "emoji": "🍰",
    "price": 95,
    "stock": 0,
    "status": "out_of_stock"
  },
  {
    "id": "00000000-0000-0000-0002-000000000004",
    "store_id": "00000000-0000-0000-0000-000000000001",
    "category_id": "00000000-0000-0000-0001-000000000001",
    "sku": "BAK-004",
    "name": "Chocolate Truffle Cake",
    "flavor": "Chocolate",
    "emoji": "🎂",
    "price": 250,
    "stock": 5,
    "status": "active"
  },
  {
    "id": "00000000-0000-0000-0002-000000000005",
    "store_id": "00000000-0000-0000-0000-000000000001",
    "category_id": "00000000-0000-0000-0001-000000000001",
    "sku": "BAK-005",
    "name": "Blueberry Scone",
    "flavor": "Blueberry",
    "emoji": "🫐",
    "price": 65,
    "stock": 20,
    "status": "active"
  },
  {
    "id": "00000000-0000-0000-0002-000000000006",
    "store_id": "00000000-0000-0000-0000-000000000001",
    "category_id": "00000000-0000-0000-0001-000000000001",
    "sku": "BAK-006",
    "name": "Rose Petal Cupcake",
    "flavor": "Rose",
    "emoji": "🧁",
    "price": 75,
    "stock": 12,
    "status": "active"
  },
  {
    "id": "00000000-0000-0000-0002-000000000007",
    "store_id": "00000000-0000-0000-0000-000000000001",
    "category_id": "00000000-0000-0000-0001-000000000001",
    "sku": "BAK-007",
    "name": "Peach Tart",
    "flavor": "Peach",
    "emoji": "🥧",
    "price": 110,
    "stock": 8,
    "status": "active"
  },
  {
    "id": "00000000-0000-0000-0002-000000000008",
    "store_id": "00000000-0000-0000-0000-000000000001",
    "category_id": "00000000-0000-0000-0001-000000000001",
    "sku": "BAK-008",
    "name": "Mango Choux Cream",
    "flavor": "Mango",
    "emoji": "🥟",
    "price": 85,
    "stock": 0,
    "status": "out_of_stock"
  },
  {
    "id": "00000000-0000-0000-0002-000000000009",
    "store_id": "00000000-0000-0000-0000-000000000001",
    "category_id": "00000000-0000-0000-0001-000000000001",
    "sku": "BAK-009",
    "name": "Sakura Cheesecake",
    "flavor": "Sakura",
    "emoji": "🍰",
    "price": 150,
    "stock": 6,
    "status": "active"
  },
  {
    "id": "00000000-0000-0000-0002-000000000010",
    "store_id": "00000000-0000-0000-0000-000000000001",
    "category_id": "00000000-0000-0000-0001-000000000001",
    "sku": "BAK-010",
    "name": "Caramel Almond Biscotti",
    "flavor": "Caramel",
    "emoji": "🍪",
    "price": 55,
    "stock": 30,
    "status": "active"
  },
  {
    "id": "00000000-0000-0000-0002-000000000011",
    "store_id": "00000000-0000-0000-0000-000000000001",
    "category_id": "00000000-0000-0000-0001-000000000001",
    "sku": "BAK-011",
    "name": "Honey Lavender Madeleine",
    "flavor": "Honey",
    "emoji": "🥮",
    "price": 45,
    "stock": 25,
    "status": "active"
  },
  {
    "id": "00000000-0000-0000-0002-000000000012",
    "store_id": "00000000-0000-0000-0000-000000000001",
    "category_id": "00000000-0000-0000-0001-000000000001",
    "sku": "BAK-012",
    "name": "Almond Croissant",
    "flavor": "Almond",
    "emoji": "🥐",
    "price": 95,
    "stock": 10,
    "status": "active"
  },
  {
    "id": "00000000-0000-0000-0002-000000000013",
    "store_id": "00000000-0000-0000-0000-000000000001",
    "category_id": "00000000-0000-0000-0001-000000000001",
    "sku": "BAK-013",
    "name": "Chocolate Donut",
    "flavor": "Chocolate",
    "emoji": "🍩",
    "price": 60,
    "stock": 18,
    "status": "active"
  },
  {
    "id": "00000000-0000-0000-0002-000000000014",
    "store_id": "00000000-0000-0000-0000-000000000001",
    "category_id": "00000000-0000-0000-0001-000000000001",
    "sku": "BAK-014",
    "name": "Matcha Pound Cake",
    "flavor": "Matcha",
    "emoji": "🍞",
    "price": 120,
    "stock": 5,
    "status": "active"
  },
  {
    "id": "00000000-0000-0000-0002-000000000015",
    "store_id": "00000000-0000-0000-0000-000000000001",
    "category_id": "00000000-0000-0000-0001-000000000001",
    "sku": "BAK-015",
    "name": "Strawberry Shortcake",
    "flavor": "Strawberry",
    "emoji": "🍰",
    "price": 135,
    "stock": 0,
    "status": "out_of_stock"
  },
  {
    "id": "00000000-0000-0000-0002-000000000016",
    "store_id": "00000000-0000-0000-0000-000000000001",
    "category_id": "00000000-0000-0000-0001-000000000001",
    "sku": "BAK-016",
    "name": "Blueberry Muffin",
    "flavor": "Blueberry",
    "emoji": "🧁",
    "price": 70,
    "stock": 14,
    "status": "active"
  },
  {
    "id": "00000000-0000-0000-0002-000000000017",
    "store_id": "00000000-0000-0000-0000-000000000001",
    "category_id": "00000000-0000-0000-0001-000000000001",
    "sku": "BAK-017",
    "name": "Vanilla Mille Crepe",
    "flavor": "Vanilla",
    "emoji": "🍰",
    "price": 145,
    "stock": 7,
    "status": "active"
  },
  {
    "id": "00000000-0000-0000-0002-000000000018",
    "store_id": "00000000-0000-0000-0000-000000000001",
    "category_id": "00000000-0000-0000-0001-000000000001",
    "sku": "BAK-018",
    "name": "Rose Lychee Macaron",
    "flavor": "Rose",
    "emoji": "🍪",
    "price": 55,
    "stock": 40,
    "status": "active"
  },
  {
    "id": "00000000-0000-0000-0002-000000000019",
    "store_id": "00000000-0000-0000-0000-000000000001",
    "category_id": "00000000-0000-0000-0001-000000000001",
    "sku": "BAK-019",
    "name": "Peach Danish",
    "flavor": "Peach",
    "emoji": "🥐",
    "price": 85,
    "stock": 11,
    "status": "active"
  },
  {
    "id": "00000000-0000-0000-0002-000000000020",
    "store_id": "00000000-0000-0000-0000-000000000001",
    "category_id": "00000000-0000-0000-0001-000000000001",
    "sku": "BAK-020",
    "name": "Mango Sticky Rice Tart",
    "flavor": "Mango",
    "emoji": "🥧",
    "price": 160,
    "stock": 0,
    "status": "out_of_stock"
  },
  {
    "id": "00000000-0000-0000-0002-000000000021",
    "store_id": "00000000-0000-0000-0000-000000000001",
    "category_id": "00000000-0000-0000-0001-000000000001",
    "sku": "BAK-021",
    "name": "Sakura Mochi Roll",
    "flavor": "Sakura",
    "emoji": "🍥",
    "price": 115,
    "stock": 9,
    "status": "active"
  },
  {
    "id": "00000000-0000-0000-0002-000000000022",
    "store_id": "00000000-0000-0000-0000-000000000001",
    "category_id": "00000000-0000-0000-0001-000000000001",
    "sku": "BAK-022",
    "name": "Honey Toast",
    "flavor": "Honey",
    "emoji": "🍞",
    "price": 180,
    "stock": 4,
    "status": "active"
  },
  {
    "id": "00000000-0000-0000-0002-000000000023",
    "store_id": "00000000-0000-0000-0000-000000000001",
    "category_id": "00000000-0000-0000-0001-000000000001",
    "sku": "BAK-023",
    "name": "Caramel Pudding",
    "flavor": "Caramel",
    "emoji": "🍮",
    "price": 80,
    "stock": 15,
    "status": "active"
  },
  {
    "id": "00000000-0000-0000-0002-000000000024",
    "store_id": "00000000-0000-0000-0000-000000000001",
    "category_id": "00000000-0000-0000-0001-000000000001",
    "sku": "BAK-024",
    "name": "Almond Brownie",
    "flavor": "Almond",
    "emoji": "🍫",
    "price": 75,
    "stock": 20,
    "status": "active"
  },
  {
    "id": "00000000-0000-0000-0002-000000000025",
    "store_id": "00000000-0000-0000-0000-000000000001",
    "category_id": "00000000-0000-0000-0001-000000000001",
    "sku": "BAK-025",
    "name": "Strawberry Tart",
    "flavor": "Strawberry",
    "emoji": "🥧",
    "price": 130,
    "stock": 0,
    "status": "out_of_stock"
  },
  {
    "id": "00000000-0000-0000-0002-000000000026",
    "store_id": "00000000-0000-0000-0000-000000000001",
    "category_id": "00000000-0000-0000-0001-000000000001",
    "sku": "BAK-026",
    "name": "Blueberry Cheesecake",
    "flavor": "Blueberry",
    "emoji": "🍰",
    "price": 140,
    "stock": 6,
    "status": "active"
  },
  {
    "id": "00000000-0000-0000-0002-000000000027",
    "store_id": "00000000-0000-0000-0000-000000000001",
    "category_id": "00000000-0000-0000-0001-000000000001",
    "sku": "BAK-027",
    "name": "Vanilla Choux",
    "flavor": "Vanilla",
    "emoji": "🧁",
    "price": 65,
    "stock": 22,
    "status": "active"
  },
  {
    "id": "00000000-0000-0000-0002-000000000028",
    "store_id": "00000000-0000-0000-0000-000000000001",
    "category_id": "00000000-0000-0000-0001-000000000001",
    "sku": "BAK-028",
    "name": "Chocolate Lava",
    "flavor": "Chocolate",
    "emoji": "🎂",
    "price": 155,
    "stock": 8,
    "status": "active"
  },
  {
    "id": "00000000-0000-0000-0002-000000000029",
    "store_id": "00000000-0000-0000-0000-000000000001",
    "category_id": "00000000-0000-0000-0001-000000000001",
    "sku": "BAK-029",
    "name": "Matcha Tiramisu",
    "flavor": "Matcha",
    "emoji": "🍰",
    "price": 165,
    "stock": 5,
    "status": "active"
  },
  {
    "id": "00000000-0000-0000-0002-000000000030",
    "store_id": "00000000-0000-0000-0000-000000000001",
    "category_id": "00000000-0000-0000-0001-000000000001",
    "sku": "BAK-030",
    "name": "Rose Cake",
    "flavor": "Rose",
    "emoji": "🎂",
    "price": 200,
    "stock": 0,
    "status": "out_of_stock"
  },
  {
    "id": "00000000-0000-0000-0002-000000000031",
    "store_id": "00000000-0000-0000-0000-000000000001",
    "category_id": "00000000-0000-0000-0001-000000000001",
    "sku": "BAK-031",
    "name": "Peach Cobbler",
    "flavor": "Peach",
    "emoji": "🥧",
    "price": 125,
    "stock": 10,
    "status": "active"
  },
  {
    "id": "00000000-0000-0000-0002-000000000032",
    "store_id": "00000000-0000-0000-0000-000000000001",
    "category_id": "00000000-0000-0000-0001-000000000001",
    "sku": "BAK-032",
    "name": "Mango Pudding",
    "flavor": "Mango",
    "emoji": "🍮",
    "price": 75,
    "stock": 16,
    "status": "active"
  },
  {
    "id": "00000000-0000-0000-0002-000000000033",
    "store_id": "00000000-0000-0000-0000-000000000001",
    "category_id": "00000000-0000-0000-0001-000000000001",
    "sku": "BAK-033",
    "name": "Sakura Macaron",
    "flavor": "Sakura",
    "emoji": "🍪",
    "price": 55,
    "stock": 35,
    "status": "active"
  },
  {
    "id": "00000000-0000-0000-0002-000000000034",
    "store_id": "00000000-0000-0000-0000-000000000001",
    "category_id": "00000000-0000-0000-0001-000000000001",
    "sku": "BAK-034",
    "name": "Honey Cake",
    "flavor": "Honey",
    "emoji": "🍰",
    "price": 95,
    "stock": 12,
    "status": "active"
  },
  {
    "id": "00000000-0000-0000-0002-000000000035",
    "store_id": "00000000-0000-0000-0000-000000000001",
    "category_id": "00000000-0000-0000-0001-000000000001",
    "sku": "BAK-035",
    "name": "Caramel Macchiato Cake",
    "flavor": "Caramel",
    "emoji": "🎂",
    "price": 175,
    "stock": 0,
    "status": "out_of_stock"
  },
  {
    "id": "00000000-0000-0000-0002-000000000036",
    "store_id": "00000000-0000-0000-0000-000000000001",
    "category_id": "00000000-0000-0000-0001-000000000001",
    "sku": "BAK-036",
    "name": "Almond Cookie",
    "flavor": "Almond",
    "emoji": "🍪",
    "price": 45,
    "stock": 50,
    "status": "active"
  },
  {
    "id": "00000000-0000-0000-0002-000000000037",
    "store_id": "00000000-0000-0000-0000-000000000001",
    "category_id": "00000000-0000-0000-0001-000000000001",
    "sku": "BAK-037",
    "name": "Strawberry Donut",
    "flavor": "Strawberry",
    "emoji": "🍩",
    "price": 65,
    "stock": 20,
    "status": "active"
  },
  {
    "id": "00000000-0000-0000-0002-000000000038",
    "store_id": "00000000-0000-0000-0000-000000000001",
    "category_id": "00000000-0000-0000-0001-000000000001",
    "sku": "BAK-038",
    "name": "Blueberry Crepe",
    "flavor": "Blueberry",
    "emoji": "🌯",
    "price": 105,
    "stock": 8,
    "status": "active"
  },
  {
    "id": "00000000-0000-0000-0002-000000000039",
    "store_id": "00000000-0000-0000-0000-000000000001",
    "category_id": "00000000-0000-0000-0001-000000000001",
    "sku": "BAK-039",
    "name": "Vanilla Macaron",
    "flavor": "Vanilla",
    "emoji": "🍪",
    "price": 55,
    "stock": 30,
    "status": "active"
  },
  {
    "id": "00000000-0000-0000-0002-000000000040",
    "store_id": "00000000-0000-0000-0000-000000000001",
    "category_id": "00000000-0000-0000-0001-000000000001",
    "sku": "BAK-040",
    "name": "Chocolate Croissant",
    "flavor": "Chocolate",
    "emoji": "🥐",
    "price": 90,
    "stock": 0,
    "status": "out_of_stock"
  },
  {
    "id": "00000000-0000-0000-0002-000000000041",
    "store_id": "00000000-0000-0000-0000-000000000001",
    "category_id": "00000000-0000-0000-0001-000000000001",
    "sku": "BAK-041",
    "name": "Matcha Tart",
    "flavor": "Matcha",
    "emoji": "🥧",
    "price": 120,
    "stock": 10,
    "status": "active"
  },
  {
    "id": "00000000-0000-0000-0002-000000000042",
    "store_id": "00000000-0000-0000-0000-000000000001",
    "category_id": "00000000-0000-0000-0001-000000000001",
    "sku": "BAK-042",
    "name": "Rose Panna Cotta",
    "flavor": "Rose",
    "emoji": "🍮",
    "price": 95,
    "stock": 12,
    "status": "active"
  },
  {
    "id": "00000000-0000-0000-0002-000000000043",
    "store_id": "00000000-0000-0000-0000-000000000001",
    "category_id": "00000000-0000-0000-0001-000000000001",
    "sku": "BAK-043",
    "name": "Peach Shortcake",
    "flavor": "Peach",
    "emoji": "🍰",
    "price": 135,
    "stock": 6,
    "status": "active"
  },
  {
    "id": "00000000-0000-0000-0002-000000000044",
    "store_id": "00000000-0000-0000-0000-000000000001",
    "category_id": "00000000-0000-0000-0001-000000000001",
    "sku": "BAK-044",
    "name": "Mango Roll",
    "flavor": "Mango",
    "emoji": "🍥",
    "price": 110,
    "stock": 9,
    "status": "active"
  },
  {
    "id": "00000000-0000-0000-0002-000000000045",
    "store_id": "00000000-0000-0000-0000-000000000001",
    "category_id": "00000000-0000-0000-0001-000000000001",
    "sku": "BAK-045",
    "name": "Sakura Tart",
    "flavor": "Sakura",
    "emoji": "🥧",
    "price": 145,
    "stock": 0,
    "status": "out_of_stock"
  },
  {
    "id": "00000000-0000-0000-0002-000000000046",
    "store_id": "00000000-0000-0000-0000-000000000001",
    "category_id": "00000000-0000-0000-0001-000000000001",
    "sku": "BAK-046",
    "name": "Honey Pancake",
    "flavor": "Honey",
    "emoji": "🥞",
    "price": 150,
    "stock": 5,
    "status": "active"
  },
  {
    "id": "00000000-0000-0000-0002-000000000047",
    "store_id": "00000000-0000-0000-0000-000000000001",
    "category_id": "00000000-0000-0000-0001-000000000001",
    "sku": "BAK-047",
    "name": "Caramel Waffle",
    "flavor": "Caramel",
    "emoji": "🧇",
    "price": 130,
    "stock": 8,
    "status": "active"
  },
  {
    "id": "00000000-0000-0000-0002-000000000048",
    "store_id": "00000000-0000-0000-0000-000000000001",
    "category_id": "00000000-0000-0000-0001-000000000001",
    "sku": "BAK-048",
    "name": "Almond Tart",
    "flavor": "Almond",
    "emoji": "🥧",
    "price": 115,
    "stock": 10,
    "status": "active"
  },
  {
    "id": "00000000-0000-0000-0002-000000000049",
    "store_id": "00000000-0000-0000-0000-000000000001",
    "category_id": "00000000-0000-0000-0001-000000000001",
    "sku": "BAK-049",
    "name": "Strawberry Macaron",
    "flavor": "Strawberry",
    "emoji": "🍪",
    "price": 55,
    "stock": 40,
    "status": "active"
  },
  {
    "id": "00000000-0000-0000-0002-000000000050",
    "store_id": "00000000-0000-0000-0000-000000000001",
    "category_id": "00000000-0000-0000-0001-000000000001",
    "sku": "BAK-050",
    "name": "Blueberry Tart",
    "flavor": "Blueberry",
    "emoji": "🥧",
    "price": 125,
    "stock": 0,
    "status": "out_of_stock"
  },
  {
    "id": "00000000-0000-0000-0002-000000000051",
    "store_id": "00000000-0000-0000-0000-000000000001",
    "category_id": "00000000-0000-0000-0001-000000000001",
    "sku": "BAK-051",
    "name": "Vanilla Pudding",
    "flavor": "Vanilla",
    "emoji": "🍮",
    "price": 70,
    "stock": 15,
    "status": "active"
  },
  {
    "id": "00000000-0000-0000-0002-000000000052",
    "store_id": "00000000-0000-0000-0000-000000000001",
    "category_id": "00000000-0000-0000-0001-000000000001",
    "sku": "BAK-052",
    "name": "Chocolate Tart",
    "flavor": "Chocolate",
    "emoji": "🥧",
    "price": 135,
    "stock": 7,
    "status": "active"
  },
  {
    "id": "00000000-0000-0000-0002-000000000053",
    "store_id": "00000000-0000-0000-0000-000000000001",
    "category_id": "00000000-0000-0000-0001-000000000001",
    "sku": "BAK-053",
    "name": "Matcha Macaron",
    "flavor": "Matcha",
    "emoji": "🍪",
    "price": 55,
    "stock": 30,
    "status": "active"
  },
  {
    "id": "00000000-0000-0000-0002-000000000054",
    "store_id": "00000000-0000-0000-0000-000000000001",
    "category_id": "00000000-0000-0000-0001-000000000001",
    "sku": "BAK-054",
    "name": "Rose Tart",
    "flavor": "Rose",
    "emoji": "🥧",
    "price": 140,
    "stock": 6,
    "status": "active"
  },
  {
    "id": "00000000-0000-0000-0002-000000000055",
    "store_id": "00000000-0000-0000-0000-000000000001",
    "category_id": "00000000-0000-0000-0001-000000000001",
    "sku": "BAK-055",
    "name": "Peach Macaron",
    "flavor": "Peach",
    "emoji": "🍪",
    "price": 55,
    "stock": 0,
    "status": "out_of_stock"
  },
  {
    "id": "00000000-0000-0000-0002-000000000056",
    "store_id": "00000000-0000-0000-0000-000000000001",
    "category_id": "00000000-0000-0000-0001-000000000001",
    "sku": "BAK-056",
    "name": "Mango Tart",
    "flavor": "Mango",
    "emoji": "🥧",
    "price": 130,
    "stock": 8,
    "status": "active"
  },
  {
    "id": "00000000-0000-0000-0002-000000000057",
    "store_id": "00000000-0000-0000-0000-000000000001",
    "category_id": "00000000-0000-0000-0001-000000000001",
    "sku": "BAK-057",
    "name": "Sakura Pudding",
    "flavor": "Sakura",
    "emoji": "🍮",
    "price": 85,
    "stock": 12,
    "status": "active"
  },
  {
    "id": "00000000-0000-0000-0002-000000000058",
    "store_id": "00000000-0000-0000-0000-000000000001",
    "category_id": "00000000-0000-0000-0001-000000000001",
    "sku": "BAK-058",
    "name": "Honey Tart",
    "flavor": "Honey",
    "emoji": "🥧",
    "price": 120,
    "stock": 10,
    "status": "active"
  },
  {
    "id": "00000000-0000-0000-0002-000000000059",
    "store_id": "00000000-0000-0000-0000-000000000001",
    "category_id": "00000000-0000-0000-0001-000000000001",
    "sku": "BAK-059",
    "name": "Caramel Tart",
    "flavor": "Caramel",
    "emoji": "🥧",
    "price": 125,
    "stock": 9,
    "status": "active"
  },
  {
    "id": "00000000-0000-0000-0002-000000000060",
    "store_id": "00000000-0000-0000-0000-000000000001",
    "category_id": "00000000-0000-0000-0001-000000000001",
    "sku": "BAK-060",
    "name": "Almond Macaron",
    "flavor": "Almond",
    "emoji": "🍪",
    "price": 55,
    "stock": 0,
    "status": "out_of_stock"
  },
  {
    "id": "00000000-0000-0000-0002-000000000061",
    "store_id": "00000000-0000-0000-0000-000000000001",
    "category_id": "00000000-0000-0000-0001-000000000001",
    "sku": "BAK-061",
    "name": "Strawberry Crepe",
    "flavor": "Strawberry",
    "emoji": "🌯",
    "price": 110,
    "stock": 7,
    "status": "active"
  },
  {
    "id": "00000000-0000-0000-0002-000000000062",
    "store_id": "00000000-0000-0000-0000-000000000001",
    "category_id": "00000000-0000-0000-0001-000000000001",
    "sku": "BAK-062",
    "name": "Blueberry Macaron",
    "flavor": "Blueberry",
    "emoji": "🍪",
    "price": 55,
    "stock": 25,
    "status": "active"
  },
  {
    "id": "00000000-0000-0000-0002-000000000063",
    "store_id": "00000000-0000-0000-0000-000000000001",
    "category_id": "00000000-0000-0000-0001-000000000001",
    "sku": "BAK-063",
    "name": "Vanilla Crepe",
    "flavor": "Vanilla",
    "emoji": "🌯",
    "price": 105,
    "stock": 10,
    "status": "active"
  },
  {
    "id": "00000000-0000-0000-0002-000000000064",
    "store_id": "00000000-0000-0000-0000-000000000001",
    "category_id": "00000000-0000-0000-0001-000000000001",
    "sku": "BAK-064",
    "name": "Chocolate Crepe",
    "flavor": "Chocolate",
    "emoji": "🌯",
    "price": 115,
    "stock": 8,
    "status": "active"
  },
  {
    "id": "00000000-0000-0000-0002-000000000065",
    "store_id": "00000000-0000-0000-0000-000000000001",
    "category_id": "00000000-0000-0000-0001-000000000002",
    "sku": "DRK-001",
    "name": "Strawberry Milk",
    "flavor": "Strawberry",
    "emoji": "🍓",
    "price": 85,
    "stock": 0,
    "status": "out_of_stock"
  },
  {
    "id": "00000000-0000-0000-0002-000000000066",
    "store_id": "00000000-0000-0000-0000-000000000001",
    "category_id": "00000000-0000-0000-0001-000000000002",
    "sku": "DRK-002",
    "name": "Blueberry Smoothie",
    "flavor": "Blueberry",
    "emoji": "🫐",
    "price": 120,
    "stock": 15,
    "status": "active"
  },
  {
    "id": "00000000-0000-0000-0002-000000000067",
    "store_id": "00000000-0000-0000-0000-000000000001",
    "category_id": "00000000-0000-0000-0001-000000000002",
    "sku": "DRK-003",
    "name": "Vanilla Latte",
    "flavor": "Vanilla",
    "emoji": "☕",
    "price": 95,
    "stock": 30,
    "status": "active"
  },
  {
    "id": "00000000-0000-0000-0002-000000000068",
    "store_id": "00000000-0000-0000-0000-000000000001",
    "category_id": "00000000-0000-0000-0001-000000000002",
    "sku": "DRK-004",
    "name": "Chocolate Frappe",
    "flavor": "Chocolate",
    "emoji": "🥤",
    "price": 135,
    "stock": 12,
    "status": "active"
  },
  {
    "id": "00000000-0000-0000-0002-000000000069",
    "store_id": "00000000-0000-0000-0000-000000000001",
    "category_id": "00000000-0000-0000-0001-000000000002",
    "sku": "DRK-005",
    "name": "Matcha Latte",
    "flavor": "Matcha",
    "emoji": "🍵",
    "price": 110,
    "stock": 0,
    "status": "out_of_stock"
  },
  {
    "id": "00000000-0000-0000-0002-000000000070",
    "store_id": "00000000-0000-0000-0000-000000000001",
    "category_id": "00000000-0000-0000-0001-000000000002",
    "sku": "DRK-006",
    "name": "Rose Milk Tea",
    "flavor": "Rose",
    "emoji": "🧋",
    "price": 100,
    "stock": 20,
    "status": "active"
  },
  {
    "id": "00000000-0000-0000-0002-000000000071",
    "store_id": "00000000-0000-0000-0000-000000000001",
    "category_id": "00000000-0000-0000-0001-000000000002",
    "sku": "DRK-007",
    "name": "Peach Oolong Tea",
    "flavor": "Peach",
    "emoji": "🫖",
    "price": 90,
    "stock": 18,
    "status": "active"
  },
  {
    "id": "00000000-0000-0000-0002-000000000072",
    "store_id": "00000000-0000-0000-0000-000000000001",
    "category_id": "00000000-0000-0000-0001-000000000002",
    "sku": "DRK-008",
    "name": "Mango Passion Smoothie",
    "flavor": "Mango",
    "emoji": "🍹",
    "price": 125,
    "stock": 10,
    "status": "active"
  },
  {
    "id": "00000000-0000-0000-0002-000000000073",
    "store_id": "00000000-0000-0000-0000-000000000001",
    "category_id": "00000000-0000-0000-0001-000000000002",
    "sku": "DRK-009",
    "name": "Sakura Tea",
    "flavor": "Sakura",
    "emoji": "🌸",
    "price": 115,
    "stock": 0,
    "status": "out_of_stock"
  },
  {
    "id": "00000000-0000-0000-0002-000000000074",
    "store_id": "00000000-0000-0000-0000-000000000001",
    "category_id": "00000000-0000-0000-0001-000000000002",
    "sku": "DRK-010",
    "name": "Honey Lemon Tea",
    "flavor": "Honey",
    "emoji": "🍋",
    "price": 80,
    "stock": 25,
    "status": "active"
  },
  {
    "id": "00000000-0000-0000-0002-000000000075",
    "store_id": "00000000-0000-0000-0000-000000000001",
    "category_id": "00000000-0000-0000-0001-000000000002",
    "sku": "DRK-011",
    "name": "Caramel Macchiato",
    "flavor": "Caramel",
    "emoji": "☕",
    "price": 105,
    "stock": 15,
    "status": "active"
  },
  {
    "id": "00000000-0000-0000-0002-000000000076",
    "store_id": "00000000-0000-0000-0000-000000000001",
    "category_id": "00000000-0000-0000-0001-000000000002",
    "sku": "DRK-012",
    "name": "Almond Milk Latte",
    "flavor": "Almond",
    "emoji": "☕",
    "price": 110,
    "stock": 12,
    "status": "active"
  },
  {
    "id": "00000000-0000-0000-0002-000000000077",
    "store_id": "00000000-0000-0000-0000-000000000001",
    "category_id": "00000000-0000-0000-0001-000000000002",
    "sku": "DRK-013",
    "name": "Strawberry Frappe",
    "flavor": "Strawberry",
    "emoji": "🥤",
    "price": 130,
    "stock": 0,
    "status": "out_of_stock"
  },
  {
    "id": "00000000-0000-0000-0002-000000000078",
    "store_id": "00000000-0000-0000-0000-000000000001",
    "category_id": "00000000-0000-0000-0001-000000000002",
    "sku": "DRK-014",
    "name": "Blueberry Soda",
    "flavor": "Blueberry",
    "emoji": "🍹",
    "price": 85,
    "stock": 20,
    "status": "active"
  },
  {
    "id": "00000000-0000-0000-0002-000000000079",
    "store_id": "00000000-0000-0000-0000-000000000001",
    "category_id": "00000000-0000-0000-0001-000000000002",
    "sku": "DRK-015",
    "name": "Vanilla Frappe",
    "flavor": "Vanilla",
    "emoji": "🥤",
    "price": 125,
    "stock": 10,
    "status": "active"
  },
  {
    "id": "00000000-0000-0000-0002-000000000080",
    "store_id": "00000000-0000-0000-0000-000000000001",
    "category_id": "00000000-0000-0000-0001-000000000002",
    "sku": "DRK-016",
    "name": "Chocolate Milk",
    "flavor": "Chocolate",
    "emoji": "🥛",
    "price": 75,
    "stock": 0,
    "status": "out_of_stock"
  },
  {
    "id": "00000000-0000-0000-0002-000000000081",
    "store_id": "00000000-0000-0000-0000-000000000001",
    "category_id": "00000000-0000-0000-0001-000000000002",
    "sku": "DRK-017",
    "name": "Matcha Frappe",
    "flavor": "Matcha",
    "emoji": "🥤",
    "price": 140,
    "stock": 8,
    "status": "active"
  },
  {
    "id": "00000000-0000-0000-0002-000000000082",
    "store_id": "00000000-0000-0000-0000-000000000001",
    "category_id": "00000000-0000-0000-0001-000000000002",
    "sku": "DRK-018",
    "name": "Rose Soda",
    "flavor": "Rose",
    "emoji": "🍹",
    "price": 95,
    "stock": 15,
    "status": "active"
  },
  {
    "id": "00000000-0000-0000-0002-000000000083",
    "store_id": "00000000-0000-0000-0000-000000000001",
    "category_id": "00000000-0000-0000-0001-000000000002",
    "sku": "DRK-019",
    "name": "Peach Soda",
    "flavor": "Peach",
    "emoji": "🍹",
    "price": 95,
    "stock": 0,
    "status": "out_of_stock"
  },
  {
    "id": "00000000-0000-0000-0002-000000000084",
    "store_id": "00000000-0000-0000-0000-000000000001",
    "category_id": "00000000-0000-0000-0001-000000000002",
    "sku": "DRK-020",
    "name": "Mango Soda",
    "flavor": "Mango",
    "emoji": "🍹",
    "price": 95,
    "stock": 14,
    "status": "active"
  },
  {
    "id": "00000000-0000-0000-0002-000000000085",
    "store_id": "00000000-0000-0000-0000-000000000001",
    "category_id": "00000000-0000-0000-0001-000000000002",
    "sku": "DRK-021",
    "name": "Sakura Latte",
    "flavor": "Sakura",
    "emoji": "☕",
    "price": 120,
    "stock": 11,
    "status": "active"
  },
  {
    "id": "00000000-0000-0000-0002-000000000086",
    "store_id": "00000000-0000-0000-0000-000000000001",
    "category_id": "00000000-0000-0000-0001-000000000002",
    "sku": "DRK-022",
    "name": "Honey Milk",
    "flavor": "Honey",
    "emoji": "🥛",
    "price": 85,
    "stock": 18,
    "status": "active"
  },
  {
    "id": "00000000-0000-0000-0002-000000000087",
    "store_id": "00000000-0000-0000-0000-000000000001",
    "category_id": "00000000-0000-0000-0001-000000000002",
    "sku": "DRK-023",
    "name": "Caramel Frappe",
    "flavor": "Caramel",
    "emoji": "🥤",
    "price": 135,
    "stock": 0,
    "status": "out_of_stock"
  },
  {
    "id": "00000000-0000-0000-0002-000000000088",
    "store_id": "00000000-0000-0000-0000-000000000001",
    "category_id": "00000000-0000-0000-0001-000000000002",
    "sku": "DRK-024",
    "name": "Almond Frappe",
    "flavor": "Almond",
    "emoji": "🥤",
    "price": 140,
    "stock": 9,
    "status": "active"
  },
  {
    "id": "00000000-0000-0000-0002-000000000089",
    "store_id": "00000000-0000-0000-0000-000000000001",
    "category_id": "00000000-0000-0000-0001-000000000002",
    "sku": "DRK-025",
    "name": "Strawberry Soda",
    "flavor": "Strawberry",
    "emoji": "🍹",
    "price": 90,
    "stock": 16,
    "status": "active"
  },
  {
    "id": "00000000-0000-0000-0002-000000000090",
    "store_id": "00000000-0000-0000-0000-000000000001",
    "category_id": "00000000-0000-0000-0001-000000000002",
    "sku": "DRK-026",
    "name": "Blueberry Milk",
    "flavor": "Blueberry",
    "emoji": "🥛",
    "price": 85,
    "stock": 15,
    "status": "active"
  },
  {
    "id": "00000000-0000-0000-0002-000000000091",
    "store_id": "00000000-0000-0000-0000-000000000001",
    "category_id": "00000000-0000-0000-0001-000000000002",
    "sku": "DRK-027",
    "name": "Vanilla Milk",
    "flavor": "Vanilla",
    "emoji": "🥛",
    "price": 80,
    "stock": 0,
    "status": "out_of_stock"
  },
  {
    "id": "00000000-0000-0000-0002-000000000092",
    "store_id": "00000000-0000-0000-0000-000000000001",
    "category_id": "00000000-0000-0000-0001-000000000002",
    "sku": "DRK-028",
    "name": "Chocolate Smoothie",
    "flavor": "Chocolate",
    "emoji": "🥤",
    "price": 125,
    "stock": 10,
    "status": "active"
  },
  {
    "id": "00000000-0000-0000-0002-000000000093",
    "store_id": "00000000-0000-0000-0000-000000000001",
    "category_id": "00000000-0000-0000-0001-000000000002",
    "sku": "DRK-029",
    "name": "Matcha Smoothie",
    "flavor": "Matcha",
    "emoji": "🥤",
    "price": 130,
    "stock": 8,
    "status": "active"
  },
  {
    "id": "00000000-0000-0000-0002-000000000094",
    "store_id": "00000000-0000-0000-0000-000000000001",
    "category_id": "00000000-0000-0000-0001-000000000002",
    "sku": "DRK-030",
    "name": "Rose Frappe",
    "flavor": "Rose",
    "emoji": "🥤",
    "price": 135,
    "stock": 7,
    "status": "active"
  },
  {
    "id": "00000000-0000-0000-0002-000000000095",
    "store_id": "00000000-0000-0000-0000-000000000001",
    "category_id": "00000000-0000-0000-0001-000000000002",
    "sku": "DRK-031",
    "name": "Peach Smoothie",
    "flavor": "Peach",
    "emoji": "🥤",
    "price": 120,
    "stock": 0,
    "status": "out_of_stock"
  },
  {
    "id": "00000000-0000-0000-0002-000000000096",
    "store_id": "00000000-0000-0000-0000-000000000001",
    "category_id": "00000000-0000-0000-0001-000000000002",
    "sku": "DRK-032",
    "name": "Mango Milk",
    "flavor": "Mango",
    "emoji": "🥛",
    "price": 90,
    "stock": 12,
    "status": "active"
  },
  {
    "id": "00000000-0000-0000-0002-000000000097",
    "store_id": "00000000-0000-0000-0000-000000000001",
    "category_id": "00000000-0000-0000-0001-000000000002",
    "sku": "DRK-033",
    "name": "Sakura Frappe",
    "flavor": "Sakura",
    "emoji": "🥤",
    "price": 145,
    "stock": 5,
    "status": "active"
  },
  {
    "id": "00000000-0000-0000-0002-000000000098",
    "store_id": "00000000-0000-0000-0000-000000000001",
    "category_id": "00000000-0000-0000-0001-000000000002",
    "sku": "DRK-034",
    "name": "Honey Frappe",
    "flavor": "Honey",
    "emoji": "🥤",
    "price": 125,
    "stock": 9,
    "status": "active"
  },
  {
    "id": "00000000-0000-0000-0002-000000000099",
    "store_id": "00000000-0000-0000-0000-000000000001",
    "category_id": "00000000-0000-0000-0001-000000000002",
    "sku": "DRK-035",
    "name": "Caramel Latte",
    "flavor": "Caramel",
    "emoji": "☕",
    "price": 100,
    "stock": 0,
    "status": "out_of_stock"
  },
  {
    "id": "00000000-0000-0000-0002-000000000100",
    "store_id": "00000000-0000-0000-0000-000000000001",
    "category_id": "00000000-0000-0000-0001-000000000002",
    "sku": "DRK-036",
    "name": "Almond Smoothie",
    "flavor": "Almond",
    "emoji": "🥤",
    "price": 135,
    "stock": 11,
    "status": "active"
  },
  {
    "id": "00000000-0000-0000-0002-000000000101",
    "store_id": "00000000-0000-0000-0000-000000000001",
    "category_id": "00000000-0000-0000-0001-000000000002",
    "sku": "DRK-037",
    "name": "Strawberry Tea",
    "flavor": "Strawberry",
    "emoji": "🫖",
    "price": 90,
    "stock": 16,
    "status": "active"
  },
  {
    "id": "00000000-0000-0000-0002-000000000102",
    "store_id": "00000000-0000-0000-0000-000000000001",
    "category_id": "00000000-0000-0000-0001-000000000002",
    "sku": "DRK-038",
    "name": "Blueberry Tea",
    "flavor": "Blueberry",
    "emoji": "🫖",
    "price": 90,
    "stock": 15,
    "status": "active"
  },
  {
    "id": "00000000-0000-0000-0002-000000000103",
    "store_id": "00000000-0000-0000-0000-000000000001",
    "category_id": "00000000-0000-0000-0001-000000000002",
    "sku": "DRK-039",
    "name": "Vanilla Tea",
    "flavor": "Vanilla",
    "emoji": "🫖",
    "price": 85,
    "stock": 0,
    "status": "out_of_stock"
  },
  {
    "id": "00000000-0000-0000-0002-000000000104",
    "store_id": "00000000-0000-0000-0000-000000000001",
    "category_id": "00000000-0000-0000-0001-000000000002",
    "sku": "DRK-040",
    "name": "Chocolate Tea",
    "flavor": "Chocolate",
    "emoji": "🫖",
    "price": 95,
    "stock": 12,
    "status": "active"
  },
  {
    "id": "00000000-0000-0000-0002-000000000105",
    "store_id": "00000000-0000-0000-0000-000000000001",
    "category_id": "00000000-0000-0000-0001-000000000002",
    "sku": "DRK-041",
    "name": "Matcha Tea",
    "flavor": "Matcha",
    "emoji": "🫖",
    "price": 95,
    "stock": 14,
    "status": "active"
  },
  {
    "id": "00000000-0000-0000-0002-000000000106",
    "store_id": "00000000-0000-0000-0000-000000000001",
    "category_id": "00000000-0000-0000-0001-000000000002",
    "sku": "DRK-042",
    "name": "Rose Tea",
    "flavor": "Rose",
    "emoji": "🫖",
    "price": 100,
    "stock": 18,
    "status": "active"
  },
  {
    "id": "00000000-0000-0000-0002-000000000107",
    "store_id": "00000000-0000-0000-0000-000000000001",
    "category_id": "00000000-0000-0000-0001-000000000002",
    "sku": "DRK-043",
    "name": "Peach Frappe",
    "flavor": "Peach",
    "emoji": "🥤",
    "price": 125,
    "stock": 0,
    "status": "out_of_stock"
  },
  {
    "id": "00000000-0000-0000-0002-000000000108",
    "store_id": "00000000-0000-0000-0000-000000000001",
    "category_id": "00000000-0000-0000-0001-000000000002",
    "sku": "DRK-044",
    "name": "Mango Tea",
    "flavor": "Mango",
    "emoji": "🫖",
    "price": 90,
    "stock": 10,
    "status": "active"
  },
  {
    "id": "00000000-0000-0000-0002-000000000109",
    "store_id": "00000000-0000-0000-0000-000000000001",
    "category_id": "00000000-0000-0000-0001-000000000002",
    "sku": "DRK-045",
    "name": "Sakura Smoothie",
    "flavor": "Sakura",
    "emoji": "🥤",
    "price": 140,
    "stock": 6,
    "status": "active"
  },
  {
    "id": "00000000-0000-0000-0002-000000000110",
    "store_id": "00000000-0000-0000-0000-000000000001",
    "category_id": "00000000-0000-0000-0001-000000000002",
    "sku": "DRK-046",
    "name": "Honey Smoothie",
    "flavor": "Honey",
    "emoji": "🥤",
    "price": 120,
    "stock": 9,
    "status": "active"
  },
  {
    "id": "00000000-0000-0000-0002-000000000111",
    "store_id": "00000000-0000-0000-0000-000000000001",
    "category_id": "00000000-0000-0000-0001-000000000002",
    "sku": "DRK-047",
    "name": "Caramel Smoothie",
    "flavor": "Caramel",
    "emoji": "🥤",
    "price": 130,
    "stock": 0,
    "status": "out_of_stock"
  },
  {
    "id": "00000000-0000-0000-0002-000000000112",
    "store_id": "00000000-0000-0000-0000-000000000001",
    "category_id": "00000000-0000-0000-0001-000000000002",
    "sku": "DRK-048",
    "name": "Almond Tea",
    "flavor": "Almond",
    "emoji": "🫖",
    "price": 85,
    "stock": 12,
    "status": "active"
  },
  {
    "id": "00000000-0000-0000-0002-000000000113",
    "store_id": "00000000-0000-0000-0000-000000000001",
    "category_id": "00000000-0000-0000-0001-000000000002",
    "sku": "DRK-049",
    "name": "Strawberry Lemonade",
    "flavor": "Strawberry",
    "emoji": "🍹",
    "price": 85,
    "stock": 15,
    "status": "active"
  },
  {
    "id": "00000000-0000-0000-0002-000000000114",
    "store_id": "00000000-0000-0000-0000-000000000001",
    "category_id": "00000000-0000-0000-0001-000000000002",
    "sku": "DRK-050",
    "name": "Blueberry Lemonade",
    "flavor": "Blueberry",
    "emoji": "🍹",
    "price": 85,
    "stock": 16,
    "status": "active"
  },
  {
    "id": "00000000-0000-0000-0002-000000000115",
    "store_id": "00000000-0000-0000-0000-000000000001",
    "category_id": "00000000-0000-0000-0001-000000000002",
    "sku": "DRK-051",
    "name": "Vanilla Lemonade",
    "flavor": "Vanilla",
    "emoji": "🍹",
    "price": 80,
    "stock": 0,
    "status": "out_of_stock"
  },
  {
    "id": "00000000-0000-0000-0002-000000000116",
    "store_id": "00000000-0000-0000-0000-000000000001",
    "category_id": "00000000-0000-0000-0001-000000000002",
    "sku": "DRK-052",
    "name": "Chocolate Macchiato",
    "flavor": "Chocolate",
    "emoji": "☕",
    "price": 110,
    "stock": 10,
    "status": "active"
  },
  {
    "id": "00000000-0000-0000-0002-000000000117",
    "store_id": "00000000-0000-0000-0000-000000000001",
    "category_id": "00000000-0000-0000-0001-000000000002",
    "sku": "DRK-053",
    "name": "Matcha Macchiato",
    "flavor": "Matcha",
    "emoji": "☕",
    "price": 115,
    "stock": 12,
    "status": "active"
  },
  {
    "id": "00000000-0000-0000-0002-000000000118",
    "store_id": "00000000-0000-0000-0000-000000000001",
    "category_id": "00000000-0000-0000-0001-000000000002",
    "sku": "DRK-054",
    "name": "Rose Macchiato",
    "flavor": "Rose",
    "emoji": "☕",
    "price": 120,
    "stock": 8,
    "status": "active"
  },
  {
    "id": "00000000-0000-0000-0002-000000000119",
    "store_id": "00000000-0000-0000-0000-000000000001",
    "category_id": "00000000-0000-0000-0001-000000000002",
    "sku": "DRK-055",
    "name": "Peach Lemonade",
    "flavor": "Peach",
    "emoji": "🍹",
    "price": 85,
    "stock": 0,
    "status": "out_of_stock"
  },
  {
    "id": "00000000-0000-0000-0002-000000000120",
    "store_id": "00000000-0000-0000-0000-000000000001",
    "category_id": "00000000-0000-0000-0001-000000000002",
    "sku": "DRK-056",
    "name": "Mango Lemonade",
    "flavor": "Mango",
    "emoji": "🍹",
    "price": 85,
    "stock": 14,
    "status": "active"
  },
  {
    "id": "00000000-0000-0000-0002-000000000121",
    "store_id": "00000000-0000-0000-0000-000000000001",
    "category_id": "00000000-0000-0000-0001-000000000002",
    "sku": "DRK-057",
    "name": "Sakura Lemonade",
    "flavor": "Sakura",
    "emoji": "🍹",
    "price": 95,
    "stock": 11,
    "status": "active"
  },
  {
    "id": "00000000-0000-0000-0002-000000000122",
    "store_id": "00000000-0000-0000-0000-000000000001",
    "category_id": "00000000-0000-0000-0001-000000000002",
    "sku": "DRK-058",
    "name": "Honey Macchiato",
    "flavor": "Honey",
    "emoji": "☕",
    "price": 105,
    "stock": 10,
    "status": "active"
  },
  {
    "id": "00000000-0000-0000-0002-000000000123",
    "store_id": "00000000-0000-0000-0000-000000000001",
    "category_id": "00000000-0000-0000-0001-000000000002",
    "sku": "DRK-059",
    "name": "Caramel Milk",
    "flavor": "Caramel",
    "emoji": "🥛",
    "price": 85,
    "stock": 0,
    "status": "out_of_stock"
  },
  {
    "id": "00000000-0000-0000-0002-000000000124",
    "store_id": "00000000-0000-0000-0000-000000000001",
    "category_id": "00000000-0000-0000-0001-000000000002",
    "sku": "DRK-060",
    "name": "Almond Macchiato",
    "flavor": "Almond",
    "emoji": "☕",
    "price": 115,
    "stock": 8,
    "status": "active"
  },
  {
    "id": "00000000-0000-0000-0002-000000000125",
    "store_id": "00000000-0000-0000-0000-000000000001",
    "category_id": "00000000-0000-0000-0001-000000000002",
    "sku": "DRK-061",
    "name": "Strawberry Latte",
    "flavor": "Strawberry",
    "emoji": "☕",
    "price": 95,
    "stock": 15,
    "status": "active"
  },
  {
    "id": "00000000-0000-0000-0002-000000000126",
    "store_id": "00000000-0000-0000-0000-000000000001",
    "category_id": "00000000-0000-0000-0001-000000000002",
    "sku": "DRK-062",
    "name": "Blueberry Latte",
    "flavor": "Blueberry",
    "emoji": "☕",
    "price": 95,
    "stock": 12,
    "status": "active"
  },
  {
    "id": "00000000-0000-0000-0002-000000000127",
    "store_id": "00000000-0000-0000-0000-000000000001",
    "category_id": "00000000-0000-0000-0001-000000000002",
    "sku": "DRK-063",
    "name": "Vanilla Soda",
    "flavor": "Vanilla",
    "emoji": "🍹",
    "price": 80,
    "stock": 0,
    "status": "out_of_stock"
  },
  {
    "id": "00000000-0000-0000-0002-000000000128",
    "store_id": "00000000-0000-0000-0000-000000000001",
    "category_id": "00000000-0000-0000-0001-000000000002",
    "sku": "DRK-064",
    "name": "Chocolate Soda",
    "flavor": "Chocolate",
    "emoji": "🍹",
    "price": 85,
    "stock": 10,
    "status": "active"
  },
  {
    "id": "00000000-0000-0000-0002-000000000129",
    "store_id": "00000000-0000-0000-0000-000000000001",
    "category_id": "00000000-0000-0000-0001-000000000003",
    "sku": "SNK-001",
    "name": "Strawberry Popcorn",
    "flavor": "Strawberry",
    "emoji": "🍿",
    "price": 55,
    "stock": 30,
    "status": "active"
  },
  {
    "id": "00000000-0000-0000-0002-000000000130",
    "store_id": "00000000-0000-0000-0000-000000000001",
    "category_id": "00000000-0000-0000-0001-000000000003",
    "sku": "SNK-002",
    "name": "Blueberry Almonds",
    "flavor": "Blueberry",
    "emoji": "🥜",
    "price": 75,
    "stock": 25,
    "status": "active"
  },
  {
    "id": "00000000-0000-0000-0002-000000000131",
    "store_id": "00000000-0000-0000-0000-000000000001",
    "category_id": "00000000-0000-0000-0001-000000000003",
    "sku": "SNK-003",
    "name": "Vanilla Chocolate Bar",
    "flavor": "Vanilla",
    "emoji": "🍫",
    "price": 45,
    "stock": 0,
    "status": "out_of_stock"
  },
  {
    "id": "00000000-0000-0000-0002-000000000132",
    "store_id": "00000000-0000-0000-0000-000000000001",
    "category_id": "00000000-0000-0000-0001-000000000003",
    "sku": "SNK-004",
    "name": "Chocolate Candy",
    "flavor": "Chocolate",
    "emoji": "🍬",
    "price": 35,
    "stock": 40,
    "status": "active"
  },
  {
    "id": "00000000-0000-0000-0002-000000000133",
    "store_id": "00000000-0000-0000-0000-000000000001",
    "category_id": "00000000-0000-0000-0001-000000000003",
    "sku": "SNK-005",
    "name": "Matcha Lollipop",
    "flavor": "Matcha",
    "emoji": "🍭",
    "price": 25,
    "stock": 50,
    "status": "active"
  },
  {
    "id": "00000000-0000-0000-0002-000000000134",
    "store_id": "00000000-0000-0000-0000-000000000001",
    "category_id": "00000000-0000-0000-0001-000000000003",
    "sku": "SNK-006",
    "name": "Rose Pretzel",
    "flavor": "Rose",
    "emoji": "🥨",
    "price": 65,
    "stock": 15,
    "status": "active"
  },
  {
    "id": "00000000-0000-0000-0002-000000000135",
    "store_id": "00000000-0000-0000-0000-000000000001",
    "category_id": "00000000-0000-0000-0001-000000000003",
    "sku": "SNK-007",
    "name": "Peach Jar",
    "flavor": "Peach",
    "emoji": "🫙",
    "price": 95,
    "stock": 0,
    "status": "out_of_stock"
  },
  {
    "id": "00000000-0000-0000-0002-000000000136",
    "store_id": "00000000-0000-0000-0000-000000000001",
    "category_id": "00000000-0000-0000-0001-000000000003",
    "sku": "SNK-008",
    "name": "Mango Rice Cracker",
    "flavor": "Mango",
    "emoji": "🍘",
    "price": 45,
    "stock": 35,
    "status": "active"
  },
  {
    "id": "00000000-0000-0000-0002-000000000137",
    "store_id": "00000000-0000-0000-0000-000000000001",
    "category_id": "00000000-0000-0000-0001-000000000003",
    "sku": "SNK-009",
    "name": "Sakura Popcorn",
    "flavor": "Sakura",
    "emoji": "🍿",
    "price": 60,
    "stock": 20,
    "status": "active"
  },
  {
    "id": "00000000-0000-0000-0002-000000000138",
    "store_id": "00000000-0000-0000-0000-000000000001",
    "category_id": "00000000-0000-0000-0001-000000000003",
    "sku": "SNK-010",
    "name": "Honey Almonds",
    "flavor": "Honey",
    "emoji": "🥜",
    "price": 80,
    "stock": 25,
    "status": "active"
  },
  {
    "id": "00000000-0000-0000-0002-000000000139",
    "store_id": "00000000-0000-0000-0000-000000000001",
    "category_id": "00000000-0000-0000-0001-000000000003",
    "sku": "SNK-011",
    "name": "Caramel Chocolate Bar",
    "flavor": "Caramel",
    "emoji": "🍫",
    "price": 55,
    "stock": 0,
    "status": "out_of_stock"
  },
  {
    "id": "00000000-0000-0000-0002-000000000140",
    "store_id": "00000000-0000-0000-0000-000000000001",
    "category_id": "00000000-0000-0000-0001-000000000003",
    "sku": "SNK-012",
    "name": "Almond Candy",
    "flavor": "Almond",
    "emoji": "🍬",
    "price": 40,
    "stock": 45,
    "status": "active"
  },
  {
    "id": "00000000-0000-0000-0002-000000000141",
    "store_id": "00000000-0000-0000-0000-000000000001",
    "category_id": "00000000-0000-0000-0001-000000000003",
    "sku": "SNK-013",
    "name": "Strawberry Lollipop",
    "flavor": "Strawberry",
    "emoji": "🍭",
    "price": 25,
    "stock": 50,
    "status": "active"
  },
  {
    "id": "00000000-0000-0000-0002-000000000142",
    "store_id": "00000000-0000-0000-0000-000000000001",
    "category_id": "00000000-0000-0000-0001-000000000003",
    "sku": "SNK-014",
    "name": "Blueberry Pretzel",
    "flavor": "Blueberry",
    "emoji": "🥨",
    "price": 65,
    "stock": 20,
    "status": "active"
  },
  {
    "id": "00000000-0000-0000-0002-000000000143",
    "store_id": "00000000-0000-0000-0000-000000000001",
    "category_id": "00000000-0000-0000-0001-000000000003",
    "sku": "SNK-015",
    "name": "Vanilla Jar",
    "flavor": "Vanilla",
    "emoji": "🫙",
    "price": 90,
    "stock": 0,
    "status": "out_of_stock"
  },
  {
    "id": "00000000-0000-0000-0002-000000000144",
    "store_id": "00000000-0000-0000-0000-000000000001",
    "category_id": "00000000-0000-0000-0001-000000000003",
    "sku": "SNK-016",
    "name": "Chocolate Rice Cracker",
    "flavor": "Chocolate",
    "emoji": "🍘",
    "price": 50,
    "stock": 30,
    "status": "active"
  },
  {
    "id": "00000000-0000-0000-0002-000000000145",
    "store_id": "00000000-0000-0000-0000-000000000001",
    "category_id": "00000000-0000-0000-0001-000000000003",
    "sku": "SNK-017",
    "name": "Matcha Popcorn",
    "flavor": "Matcha",
    "emoji": "🍿",
    "price": 65,
    "stock": 25,
    "status": "active"
  },
  {
    "id": "00000000-0000-0000-0002-000000000146",
    "store_id": "00000000-0000-0000-0000-000000000001",
    "category_id": "00000000-0000-0000-0001-000000000003",
    "sku": "SNK-018",
    "name": "Rose Almonds",
    "flavor": "Rose",
    "emoji": "🥜",
    "price": 85,
    "stock": 15,
    "status": "active"
  },
  {
    "id": "00000000-0000-0000-0002-000000000147",
    "store_id": "00000000-0000-0000-0000-000000000001",
    "category_id": "00000000-0000-0000-0001-000000000003",
    "sku": "SNK-019",
    "name": "Peach Chocolate Bar",
    "flavor": "Peach",
    "emoji": "🍫",
    "price": 55,
    "stock": 0,
    "status": "out_of_stock"
  },
  {
    "id": "00000000-0000-0000-0002-000000000148",
    "store_id": "00000000-0000-0000-0000-000000000001",
    "category_id": "00000000-0000-0000-0001-000000000003",
    "sku": "SNK-020",
    "name": "Mango Candy",
    "flavor": "Mango",
    "emoji": "🍬",
    "price": 35,
    "stock": 45,
    "status": "active"
  },
  {
    "id": "00000000-0000-0000-0002-000000000149",
    "store_id": "00000000-0000-0000-0000-000000000001",
    "category_id": "00000000-0000-0000-0001-000000000003",
    "sku": "SNK-021",
    "name": "Sakura Lollipop",
    "flavor": "Sakura",
    "emoji": "🍭",
    "price": 30,
    "stock": 40,
    "status": "active"
  },
  {
    "id": "00000000-0000-0000-0002-000000000150",
    "store_id": "00000000-0000-0000-0000-000000000001",
    "category_id": "00000000-0000-0000-0001-000000000003",
    "sku": "SNK-022",
    "name": "Honey Pretzel",
    "flavor": "Honey",
    "emoji": "🥨",
    "price": 70,
    "stock": 18,
    "status": "active"
  },
  {
    "id": "00000000-0000-0000-0002-000000000151",
    "store_id": "00000000-0000-0000-0000-000000000001",
    "category_id": "00000000-0000-0000-0001-000000000003",
    "sku": "SNK-023",
    "name": "Caramel Jar",
    "flavor": "Caramel",
    "emoji": "🫙",
    "price": 95,
    "stock": 0,
    "status": "out_of_stock"
  },
  {
    "id": "00000000-0000-0000-0002-000000000152",
    "store_id": "00000000-0000-0000-0000-000000000001",
    "category_id": "00000000-0000-0000-0001-000000000003",
    "sku": "SNK-024",
    "name": "Almond Rice Cracker",
    "flavor": "Almond",
    "emoji": "🍘",
    "price": 55,
    "stock": 25,
    "status": "active"
  },
  {
    "id": "00000000-0000-0000-0002-000000000153",
    "store_id": "00000000-0000-0000-0000-000000000001",
    "category_id": "00000000-0000-0000-0001-000000000003",
    "sku": "SNK-025",
    "name": "Strawberry Almonds",
    "flavor": "Strawberry",
    "emoji": "🥜",
    "price": 75,
    "stock": 22,
    "status": "active"
  },
  {
    "id": "00000000-0000-0000-0002-000000000154",
    "store_id": "00000000-0000-0000-0000-000000000001",
    "category_id": "00000000-0000-0000-0001-000000000003",
    "sku": "SNK-026",
    "name": "Blueberry Chocolate Bar",
    "flavor": "Blueberry",
    "emoji": "🍫",
    "price": 50,
    "stock": 30,
    "status": "active"
  },
  {
    "id": "00000000-0000-0000-0002-000000000155",
    "store_id": "00000000-0000-0000-0000-000000000001",
    "category_id": "00000000-0000-0000-0001-000000000003",
    "sku": "SNK-027",
    "name": "Vanilla Candy",
    "flavor": "Vanilla",
    "emoji": "🍬",
    "price": 35,
    "stock": 0,
    "status": "out_of_stock"
  },
  {
    "id": "00000000-0000-0000-0002-000000000156",
    "store_id": "00000000-0000-0000-0000-000000000001",
    "category_id": "00000000-0000-0000-0001-000000000003",
    "sku": "SNK-028",
    "name": "Chocolate Lollipop",
    "flavor": "Chocolate",
    "emoji": "🍭",
    "price": 25,
    "stock": 45,
    "status": "active"
  },
  {
    "id": "00000000-0000-0000-0002-000000000157",
    "store_id": "00000000-0000-0000-0000-000000000001",
    "category_id": "00000000-0000-0000-0001-000000000003",
    "sku": "SNK-029",
    "name": "Matcha Pretzel",
    "flavor": "Matcha",
    "emoji": "🥨",
    "price": 70,
    "stock": 16,
    "status": "active"
  },
  {
    "id": "00000000-0000-0000-0002-000000000158",
    "store_id": "00000000-0000-0000-0000-000000000001",
    "category_id": "00000000-0000-0000-0001-000000000003",
    "sku": "SNK-030",
    "name": "Rose Jar",
    "flavor": "Rose",
    "emoji": "🫙",
    "price": 105,
    "stock": 12,
    "status": "active"
  },
  {
    "id": "00000000-0000-0000-0002-000000000159",
    "store_id": "00000000-0000-0000-0000-000000000001",
    "category_id": "00000000-0000-0000-0001-000000000003",
    "sku": "SNK-031",
    "name": "Peach Rice Cracker",
    "flavor": "Peach",
    "emoji": "🍘",
    "price": 45,
    "stock": 0,
    "status": "out_of_stock"
  },
  {
    "id": "00000000-0000-0000-0002-000000000160",
    "store_id": "00000000-0000-0000-0000-000000000001",
    "category_id": "00000000-0000-0000-0001-000000000003",
    "sku": "SNK-032",
    "name": "Mango Popcorn",
    "flavor": "Mango",
    "emoji": "🍿",
    "price": 60,
    "stock": 28,
    "status": "active"
  },
  {
    "id": "00000000-0000-0000-0002-000000000161",
    "store_id": "00000000-0000-0000-0000-000000000001",
    "category_id": "00000000-0000-0000-0001-000000000003",
    "sku": "SNK-033",
    "name": "Sakura Almonds",
    "flavor": "Sakura",
    "emoji": "🥜",
    "price": 80,
    "stock": 24,
    "status": "active"
  },
  {
    "id": "00000000-0000-0000-0002-000000000162",
    "store_id": "00000000-0000-0000-0000-000000000001",
    "category_id": "00000000-0000-0000-0001-000000000003",
    "sku": "SNK-034",
    "name": "Honey Chocolate Bar",
    "flavor": "Honey",
    "emoji": "🍫",
    "price": 60,
    "stock": 20,
    "status": "active"
  },
  {
    "id": "00000000-0000-0000-0002-000000000163",
    "store_id": "00000000-0000-0000-0000-000000000001",
    "category_id": "00000000-0000-0000-0001-000000000003",
    "sku": "SNK-035",
    "name": "Caramel Candy",
    "flavor": "Caramel",
    "emoji": "🍬",
    "price": 45,
    "stock": 0,
    "status": "out_of_stock"
  },
  {
    "id": "00000000-0000-0000-0002-000000000164",
    "store_id": "00000000-0000-0000-0000-000000000001",
    "category_id": "00000000-0000-0000-0001-000000000003",
    "sku": "SNK-036",
    "name": "Almond Lollipop",
    "flavor": "Almond",
    "emoji": "🍭",
    "price": 30,
    "stock": 42,
    "status": "active"
  },
  {
    "id": "00000000-0000-0000-0002-000000000165",
    "store_id": "00000000-0000-0000-0000-000000000001",
    "category_id": "00000000-0000-0000-0001-000000000003",
    "sku": "SNK-037",
    "name": "Strawberry Pretzel",
    "flavor": "Strawberry",
    "emoji": "🥨",
    "price": 65,
    "stock": 18,
    "status": "active"
  },
  {
    "id": "00000000-0000-0000-0002-000000000166",
    "store_id": "00000000-0000-0000-0000-000000000001",
    "category_id": "00000000-0000-0000-0001-000000000003",
    "sku": "SNK-038",
    "name": "Blueberry Jar",
    "flavor": "Blueberry",
    "emoji": "🫙",
    "price": 95,
    "stock": 14,
    "status": "active"
  },
  {
    "id": "00000000-0000-0000-0002-000000000167",
    "store_id": "00000000-0000-0000-0000-000000000001",
    "category_id": "00000000-0000-0000-0001-000000000003",
    "sku": "SNK-039",
    "name": "Vanilla Rice Cracker",
    "flavor": "Vanilla",
    "emoji": "🍘",
    "price": 45,
    "stock": 0,
    "status": "out_of_stock"
  },
  {
    "id": "00000000-0000-0000-0002-000000000168",
    "store_id": "00000000-0000-0000-0000-000000000001",
    "category_id": "00000000-0000-0000-0001-000000000003",
    "sku": "SNK-040",
    "name": "Chocolate Popcorn",
    "flavor": "Chocolate",
    "emoji": "🍿",
    "price": 60,
    "stock": 26,
    "status": "active"
  },
  {
    "id": "00000000-0000-0000-0002-000000000169",
    "store_id": "00000000-0000-0000-0000-000000000001",
    "category_id": "00000000-0000-0000-0001-000000000003",
    "sku": "SNK-041",
    "name": "Matcha Almonds",
    "flavor": "Matcha",
    "emoji": "🥜",
    "price": 85,
    "stock": 22,
    "status": "active"
  },
  {
    "id": "00000000-0000-0000-0002-000000000170",
    "store_id": "00000000-0000-0000-0000-000000000001",
    "category_id": "00000000-0000-0000-0001-000000000003",
    "sku": "SNK-042",
    "name": "Rose Chocolate Bar",
    "flavor": "Rose",
    "emoji": "🍫",
    "price": 65,
    "stock": 18,
    "status": "active"
  },
  {
    "id": "00000000-0000-0000-0002-000000000171",
    "store_id": "00000000-0000-0000-0000-000000000001",
    "category_id": "00000000-0000-0000-0001-000000000003",
    "sku": "SNK-043",
    "name": "Peach Candy",
    "flavor": "Peach",
    "emoji": "🍬",
    "price": 40,
    "stock": 0,
    "status": "out_of_stock"
  },
  {
    "id": "00000000-0000-0000-0002-000000000172",
    "store_id": "00000000-0000-0000-0000-000000000001",
    "category_id": "00000000-0000-0000-0001-000000000003",
    "sku": "SNK-044",
    "name": "Mango Lollipop",
    "flavor": "Mango",
    "emoji": "🍭",
    "price": 30,
    "stock": 45,
    "status": "active"
  },
  {
    "id": "00000000-0000-0000-0002-000000000173",
    "store_id": "00000000-0000-0000-0000-000000000001",
    "category_id": "00000000-0000-0000-0001-000000000003",
    "sku": "SNK-045",
    "name": "Sakura Pretzel",
    "flavor": "Sakura",
    "emoji": "🥨",
    "price": 70,
    "stock": 15,
    "status": "active"
  },
  {
    "id": "00000000-0000-0000-0002-000000000174",
    "store_id": "00000000-0000-0000-0000-000000000001",
    "category_id": "00000000-0000-0000-0001-000000000003",
    "sku": "SNK-046",
    "name": "Honey Jar",
    "flavor": "Honey",
    "emoji": "🫙",
    "price": 95,
    "stock": 12,
    "status": "active"
  },
  {
    "id": "00000000-0000-0000-0002-000000000175",
    "store_id": "00000000-0000-0000-0000-000000000001",
    "category_id": "00000000-0000-0000-0001-000000000003",
    "sku": "SNK-047",
    "name": "Caramel Rice Cracker",
    "flavor": "Caramel",
    "emoji": "🍘",
    "price": 50,
    "stock": 0,
    "status": "out_of_stock"
  },
  {
    "id": "00000000-0000-0000-0002-000000000176",
    "store_id": "00000000-0000-0000-0000-000000000001",
    "category_id": "00000000-0000-0000-0001-000000000003",
    "sku": "SNK-048",
    "name": "Almond Popcorn",
    "flavor": "Almond",
    "emoji": "🍿",
    "price": 65,
    "stock": 24,
    "status": "active"
  },
  {
    "id": "00000000-0000-0000-0002-000000000177",
    "store_id": "00000000-0000-0000-0000-000000000001",
    "category_id": "00000000-0000-0000-0001-000000000003",
    "sku": "SNK-049",
    "name": "Strawberry Chocolate Bar",
    "flavor": "Strawberry",
    "emoji": "🍫",
    "price": 55,
    "stock": 28,
    "status": "active"
  },
  {
    "id": "00000000-0000-0000-0002-000000000178",
    "store_id": "00000000-0000-0000-0000-000000000001",
    "category_id": "00000000-0000-0000-0001-000000000003",
    "sku": "SNK-050",
    "name": "Blueberry Candy",
    "flavor": "Blueberry",
    "emoji": "🍬",
    "price": 40,
    "stock": 35,
    "status": "active"
  },
  {
    "id": "00000000-0000-0000-0002-000000000179",
    "store_id": "00000000-0000-0000-0000-000000000001",
    "category_id": "00000000-0000-0000-0001-000000000003",
    "sku": "SNK-051",
    "name": "Vanilla Lollipop",
    "flavor": "Vanilla",
    "emoji": "🍭",
    "price": 25,
    "stock": 0,
    "status": "out_of_stock"
  },
  {
    "id": "00000000-0000-0000-0002-000000000180",
    "store_id": "00000000-0000-0000-0000-000000000001",
    "category_id": "00000000-0000-0000-0001-000000000003",
    "sku": "SNK-052",
    "name": "Chocolate Pretzel",
    "flavor": "Chocolate",
    "emoji": "🥨",
    "price": 65,
    "stock": 20,
    "status": "active"
  },
  {
    "id": "00000000-0000-0000-0002-000000000181",
    "store_id": "00000000-0000-0000-0000-000000000001",
    "category_id": "00000000-0000-0000-0001-000000000003",
    "sku": "SNK-053",
    "name": "Matcha Jar",
    "flavor": "Matcha",
    "emoji": "🫙",
    "price": 105,
    "stock": 10,
    "status": "active"
  },
  {
    "id": "00000000-0000-0000-0002-000000000182",
    "store_id": "00000000-0000-0000-0000-000000000001",
    "category_id": "00000000-0000-0000-0001-000000000003",
    "sku": "SNK-054",
    "name": "Rose Rice Cracker",
    "flavor": "Rose",
    "emoji": "🍘",
    "price": 50,
    "stock": 25,
    "status": "active"
  },
  {
    "id": "00000000-0000-0000-0002-000000000183",
    "store_id": "00000000-0000-0000-0000-000000000001",
    "category_id": "00000000-0000-0000-0001-000000000003",
    "sku": "SNK-055",
    "name": "Peach Popcorn",
    "flavor": "Peach",
    "emoji": "🍿",
    "price": 60,
    "stock": 0,
    "status": "out_of_stock"
  },
  {
    "id": "00000000-0000-0000-0002-000000000184",
    "store_id": "00000000-0000-0000-0000-000000000001",
    "category_id": "00000000-0000-0000-0001-000000000003",
    "sku": "SNK-056",
    "name": "Mango Almonds",
    "flavor": "Mango",
    "emoji": "🥜",
    "price": 80,
    "stock": 20,
    "status": "active"
  },
  {
    "id": "00000000-0000-0000-0002-000000000185",
    "store_id": "00000000-0000-0000-0000-000000000001",
    "category_id": "00000000-0000-0000-0001-000000000003",
    "sku": "SNK-057",
    "name": "Sakura Chocolate Bar",
    "flavor": "Sakura",
    "emoji": "🍫",
    "price": 65,
    "stock": 15,
    "status": "active"
  },
  {
    "id": "00000000-0000-0000-0002-000000000186",
    "store_id": "00000000-0000-0000-0000-000000000001",
    "category_id": "00000000-0000-0000-0001-000000000003",
    "sku": "SNK-058",
    "name": "Honey Candy",
    "flavor": "Honey",
    "emoji": "🍬",
    "price": 45,
    "stock": 30,
    "status": "active"
  },
  {
    "id": "00000000-0000-0000-0002-000000000187",
    "store_id": "00000000-0000-0000-0000-000000000001",
    "category_id": "00000000-0000-0000-0001-000000000003",
    "sku": "SNK-059",
    "name": "Caramel Lollipop",
    "flavor": "Caramel",
    "emoji": "🍭",
    "price": 35,
    "stock": 0,
    "status": "out_of_stock"
  },
  {
    "id": "00000000-0000-0000-0002-000000000188",
    "store_id": "00000000-0000-0000-0000-000000000001",
    "category_id": "00000000-0000-0000-0001-000000000003",
    "sku": "SNK-060",
    "name": "Almond Pretzel",
    "flavor": "Almond",
    "emoji": "🥨",
    "price": 75,
    "stock": 16,
    "status": "active"
  },
  {
    "id": "00000000-0000-0000-0002-000000000189",
    "store_id": "00000000-0000-0000-0000-000000000001",
    "category_id": "00000000-0000-0000-0001-000000000003",
    "sku": "SNK-061",
    "name": "Strawberry Jar",
    "flavor": "Strawberry",
    "emoji": "🫙",
    "price": 90,
    "stock": 12,
    "status": "active"
  },
  {
    "id": "00000000-0000-0000-0002-000000000190",
    "store_id": "00000000-0000-0000-0000-000000000001",
    "category_id": "00000000-0000-0000-0001-000000000003",
    "sku": "SNK-062",
    "name": "Blueberry Rice Cracker",
    "flavor": "Blueberry",
    "emoji": "🍘",
    "price": 45,
    "stock": 28,
    "status": "active"
  },
  {
    "id": "00000000-0000-0000-0002-000000000191",
    "store_id": "00000000-0000-0000-0000-000000000001",
    "category_id": "00000000-0000-0000-0001-000000000003",
    "sku": "SNK-063",
    "name": "Vanilla Popcorn",
    "flavor": "Vanilla",
    "emoji": "🍿",
    "price": 55,
    "stock": 0,
    "status": "out_of_stock"
  },
  {
    "id": "00000000-0000-0000-0002-000000000192",
    "store_id": "00000000-0000-0000-0000-000000000001",
    "category_id": "00000000-0000-0000-0001-000000000003",
    "sku": "SNK-064",
    "name": "Chocolate Almonds",
    "flavor": "Chocolate",
    "emoji": "🥜",
    "price": 85,
    "stock": 22,
    "status": "active"
  },
  {
    "id": "00000000-0000-0000-0002-000000000193",
    "store_id": "00000000-0000-0000-0000-000000000001",
    "category_id": "00000000-0000-0000-0001-000000000004",
    "sku": "SEA-001",
    "name": "Strawberry Flower",
    "flavor": "Strawberry",
    "emoji": "🌸",
    "price": 110,
    "stock": 10,
    "status": "active"
  },
  {
    "id": "00000000-0000-0000-0002-000000000194",
    "store_id": "00000000-0000-0000-0000-000000000001",
    "category_id": "00000000-0000-0000-0001-000000000004",
    "sku": "SEA-002",
    "name": "Blueberry Blossom",
    "flavor": "Blueberry",
    "emoji": "🌺",
    "price": 115,
    "stock": 12,
    "status": "active"
  },
  {
    "id": "00000000-0000-0000-0002-000000000195",
    "store_id": "00000000-0000-0000-0000-000000000001",
    "category_id": "00000000-0000-0000-0001-000000000004",
    "sku": "SEA-003",
    "name": "Vanilla Leaf",
    "flavor": "Vanilla",
    "emoji": "🍃",
    "price": 105,
    "stock": 0,
    "status": "out_of_stock"
  },
  {
    "id": "00000000-0000-0000-0002-000000000196",
    "store_id": "00000000-0000-0000-0000-000000000001",
    "category_id": "00000000-0000-0000-0001-000000000004",
    "sku": "SEA-004",
    "name": "Chocolate Sunflower",
    "flavor": "Chocolate",
    "emoji": "🌻",
    "price": 120,
    "stock": 15,
    "status": "active"
  },
  {
    "id": "00000000-0000-0000-0002-000000000197",
    "store_id": "00000000-0000-0000-0000-000000000001",
    "category_id": "00000000-0000-0000-0001-000000000004",
    "sku": "SEA-005",
    "name": "Matcha Snow",
    "flavor": "Matcha",
    "emoji": "❄️",
    "price": 130,
    "stock": 8,
    "status": "active"
  },
  {
    "id": "00000000-0000-0000-0002-000000000198",
    "store_id": "00000000-0000-0000-0000-000000000001",
    "category_id": "00000000-0000-0000-0001-000000000004",
    "sku": "SEA-006",
    "name": "Rose Pumpkin",
    "flavor": "Rose",
    "emoji": "🎃",
    "price": 125,
    "stock": 10,
    "status": "active"
  },
  {
    "id": "00000000-0000-0000-0002-000000000199",
    "store_id": "00000000-0000-0000-0000-000000000001",
    "category_id": "00000000-0000-0000-0001-000000000004",
    "sku": "SEA-007",
    "name": "Peach Tree",
    "flavor": "Peach",
    "emoji": "🎄",
    "price": 135,
    "stock": 0,
    "status": "out_of_stock"
  },
  {
    "id": "00000000-0000-0000-0002-000000000200",
    "store_id": "00000000-0000-0000-0000-000000000001",
    "category_id": "00000000-0000-0000-0001-000000000004",
    "sku": "SEA-008",
    "name": "Mango Rose",
    "flavor": "Mango",
    "emoji": "🌹",
    "price": 140,
    "stock": 6,
    "status": "active"
  },
  {
    "id": "00000000-0000-0000-0002-000000000201",
    "store_id": "00000000-0000-0000-0000-000000000001",
    "category_id": "00000000-0000-0000-0001-000000000004",
    "sku": "SEA-009",
    "name": "Sakura Blossom",
    "flavor": "Sakura",
    "emoji": "🌸",
    "price": 150,
    "stock": 12,
    "status": "active"
  },
  {
    "id": "00000000-0000-0000-0002-000000000202",
    "store_id": "00000000-0000-0000-0000-000000000001",
    "category_id": "00000000-0000-0000-0001-000000000004",
    "sku": "SEA-010",
    "name": "Honey Leaf",
    "flavor": "Honey",
    "emoji": "🍃",
    "price": 110,
    "stock": 18,
    "status": "active"
  },
  {
    "id": "00000000-0000-0000-0002-000000000203",
    "store_id": "00000000-0000-0000-0000-000000000001",
    "category_id": "00000000-0000-0000-0001-000000000004",
    "sku": "SEA-011",
    "name": "Caramel Sunflower",
    "flavor": "Caramel",
    "emoji": "🌻",
    "price": 125,
    "stock": 0,
    "status": "out_of_stock"
  },
  {
    "id": "00000000-0000-0000-0002-000000000204",
    "store_id": "00000000-0000-0000-0000-000000000001",
    "category_id": "00000000-0000-0000-0001-000000000004",
    "sku": "SEA-012",
    "name": "Almond Snow",
    "flavor": "Almond",
    "emoji": "❄️",
    "price": 135,
    "stock": 9,
    "status": "active"
  },
  {
    "id": "00000000-0000-0000-0002-000000000205",
    "store_id": "00000000-0000-0000-0000-000000000001",
    "category_id": "00000000-0000-0000-0001-000000000004",
    "sku": "SEA-013",
    "name": "Strawberry Pumpkin",
    "flavor": "Strawberry",
    "emoji": "🎃",
    "price": 130,
    "stock": 11,
    "status": "active"
  },
  {
    "id": "00000000-0000-0000-0002-000000000206",
    "store_id": "00000000-0000-0000-0000-000000000001",
    "category_id": "00000000-0000-0000-0001-000000000004",
    "sku": "SEA-014",
    "name": "Blueberry Tree",
    "flavor": "Blueberry",
    "emoji": "🎄",
    "price": 145,
    "stock": 7,
    "status": "active"
  },
  {
    "id": "00000000-0000-0000-0002-000000000207",
    "store_id": "00000000-0000-0000-0000-000000000001",
    "category_id": "00000000-0000-0000-0001-000000000004",
    "sku": "SEA-015",
    "name": "Vanilla Rose",
    "flavor": "Vanilla",
    "emoji": "🌹",
    "price": 115,
    "stock": 0,
    "status": "out_of_stock"
  },
  {
    "id": "00000000-0000-0000-0002-000000000208",
    "store_id": "00000000-0000-0000-0000-000000000001",
    "category_id": "00000000-0000-0000-0001-000000000004",
    "sku": "SEA-016",
    "name": "Chocolate Flower",
    "flavor": "Chocolate",
    "emoji": "🌸",
    "price": 125,
    "stock": 14,
    "status": "active"
  },
  {
    "id": "00000000-0000-0000-0002-000000000209",
    "store_id": "00000000-0000-0000-0000-000000000001",
    "category_id": "00000000-0000-0000-0001-000000000004",
    "sku": "SEA-017",
    "name": "Matcha Blossom",
    "flavor": "Matcha",
    "emoji": "🌺",
    "price": 135,
    "stock": 10,
    "status": "active"
  },
  {
    "id": "00000000-0000-0000-0002-000000000210",
    "store_id": "00000000-0000-0000-0000-000000000001",
    "category_id": "00000000-0000-0000-0001-000000000004",
    "sku": "SEA-018",
    "name": "Rose Leaf",
    "flavor": "Rose",
    "emoji": "🍃",
    "price": 120,
    "stock": 16,
    "status": "active"
  },
  {
    "id": "00000000-0000-0000-0002-000000000211",
    "store_id": "00000000-0000-0000-0000-000000000001",
    "category_id": "00000000-0000-0000-0001-000000000004",
    "sku": "SEA-019",
    "name": "Peach Sunflower",
    "flavor": "Peach",
    "emoji": "🌻",
    "price": 130,
    "stock": 0,
    "status": "out_of_stock"
  },
  {
    "id": "00000000-0000-0000-0002-000000000212",
    "store_id": "00000000-0000-0000-0000-000000000001",
    "category_id": "00000000-0000-0000-0001-000000000004",
    "sku": "SEA-020",
    "name": "Mango Snow",
    "flavor": "Mango",
    "emoji": "❄️",
    "price": 140,
    "stock": 8,
    "status": "active"
  },
  {
    "id": "00000000-0000-0000-0002-000000000213",
    "store_id": "00000000-0000-0000-0000-000000000001",
    "category_id": "00000000-0000-0000-0001-000000000004",
    "sku": "SEA-021",
    "name": "Sakura Pumpkin",
    "flavor": "Sakura",
    "emoji": "🎃",
    "price": 155,
    "stock": 5,
    "status": "active"
  },
  {
    "id": "00000000-0000-0000-0002-000000000214",
    "store_id": "00000000-0000-0000-0000-000000000001",
    "category_id": "00000000-0000-0000-0001-000000000004",
    "sku": "SEA-022",
    "name": "Honey Tree",
    "flavor": "Honey",
    "emoji": "🎄",
    "price": 125,
    "stock": 12,
    "status": "active"
  },
  {
    "id": "00000000-0000-0000-0002-000000000215",
    "store_id": "00000000-0000-0000-0000-000000000001",
    "category_id": "00000000-0000-0000-0001-000000000004",
    "sku": "SEA-023",
    "name": "Caramel Rose",
    "flavor": "Caramel",
    "emoji": "🌹",
    "price": 135,
    "stock": 0,
    "status": "out_of_stock"
  },
  {
    "id": "00000000-0000-0000-0002-000000000216",
    "store_id": "00000000-0000-0000-0000-000000000001",
    "category_id": "00000000-0000-0000-0001-000000000004",
    "sku": "SEA-024",
    "name": "Almond Flower",
    "flavor": "Almond",
    "emoji": "🌸",
    "price": 145,
    "stock": 9,
    "status": "active"
  },
  {
    "id": "00000000-0000-0000-0002-000000000217",
    "store_id": "00000000-0000-0000-0000-000000000001",
    "category_id": "00000000-0000-0000-0001-000000000004",
    "sku": "SEA-025",
    "name": "Strawberry Blossom",
    "flavor": "Strawberry",
    "emoji": "🌺",
    "price": 115,
    "stock": 14,
    "status": "active"
  },
  {
    "id": "00000000-0000-0000-0002-000000000218",
    "store_id": "00000000-0000-0000-0000-000000000001",
    "category_id": "00000000-0000-0000-0001-000000000004",
    "sku": "SEA-026",
    "name": "Blueberry Leaf",
    "flavor": "Blueberry",
    "emoji": "🍃",
    "price": 120,
    "stock": 10,
    "status": "active"
  },
  {
    "id": "00000000-0000-0000-0002-000000000219",
    "store_id": "00000000-0000-0000-0000-000000000001",
    "category_id": "00000000-0000-0000-0001-000000000004",
    "sku": "SEA-027",
    "name": "Vanilla Sunflower",
    "flavor": "Vanilla",
    "emoji": "🌻",
    "price": 110,
    "stock": 0,
    "status": "out_of_stock"
  },
  {
    "id": "00000000-0000-0000-0002-000000000220",
    "store_id": "00000000-0000-0000-0000-000000000001",
    "category_id": "00000000-0000-0000-0001-000000000004",
    "sku": "SEA-028",
    "name": "Chocolate Snow",
    "flavor": "Chocolate",
    "emoji": "❄️",
    "price": 130,
    "stock": 15,
    "status": "active"
  },
  {
    "id": "00000000-0000-0000-0002-000000000221",
    "store_id": "00000000-0000-0000-0000-000000000001",
    "category_id": "00000000-0000-0000-0001-000000000004",
    "sku": "SEA-029",
    "name": "Matcha Pumpkin",
    "flavor": "Matcha",
    "emoji": "🎃",
    "price": 140,
    "stock": 8,
    "status": "active"
  },
  {
    "id": "00000000-0000-0000-0002-000000000222",
    "store_id": "00000000-0000-0000-0000-000000000001",
    "category_id": "00000000-0000-0000-0001-000000000004",
    "sku": "SEA-030",
    "name": "Rose Tree",
    "flavor": "Rose",
    "emoji": "🎄",
    "price": 145,
    "stock": 12,
    "status": "active"
  },
  {
    "id": "00000000-0000-0000-0002-000000000223",
    "store_id": "00000000-0000-0000-0000-000000000001",
    "category_id": "00000000-0000-0000-0001-000000000004",
    "sku": "SEA-031",
    "name": "Peach Rose",
    "flavor": "Peach",
    "emoji": "🌹",
    "price": 135,
    "stock": 0,
    "status": "out_of_stock"
  },
  {
    "id": "00000000-0000-0000-0002-000000000224",
    "store_id": "00000000-0000-0000-0000-000000000001",
    "category_id": "00000000-0000-0000-0001-000000000004",
    "sku": "SEA-032",
    "name": "Mango Flower",
    "flavor": "Mango",
    "emoji": "🌸",
    "price": 145,
    "stock": 10,
    "status": "active"
  },
  {
    "id": "00000000-0000-0000-0002-000000000225",
    "store_id": "00000000-0000-0000-0000-000000000001",
    "category_id": "00000000-0000-0000-0001-000000000004",
    "sku": "SEA-033",
    "name": "Sakura Blossom",
    "flavor": "Sakura",
    "emoji": "🌺",
    "price": 160,
    "stock": 6,
    "status": "active"
  },
  {
    "id": "00000000-0000-0000-0002-000000000226",
    "store_id": "00000000-0000-0000-0000-000000000001",
    "category_id": "00000000-0000-0000-0001-000000000004",
    "sku": "SEA-034",
    "name": "Honey Leaf",
    "flavor": "Honey",
    "emoji": "🍃",
    "price": 115,
    "stock": 16,
    "status": "active"
  },
  {
    "id": "00000000-0000-0000-0002-000000000227",
    "store_id": "00000000-0000-0000-0000-000000000001",
    "category_id": "00000000-0000-0000-0001-000000000004",
    "sku": "SEA-035",
    "name": "Caramel Sunflower",
    "flavor": "Caramel",
    "emoji": "🌻",
    "price": 130,
    "stock": 0,
    "status": "out_of_stock"
  },
  {
    "id": "00000000-0000-0000-0002-000000000228",
    "store_id": "00000000-0000-0000-0000-000000000001",
    "category_id": "00000000-0000-0000-0001-000000000004",
    "sku": "SEA-036",
    "name": "Almond Snow",
    "flavor": "Almond",
    "emoji": "❄️",
    "price": 140,
    "stock": 9,
    "status": "active"
  },
  {
    "id": "00000000-0000-0000-0002-000000000229",
    "store_id": "00000000-0000-0000-0000-000000000001",
    "category_id": "00000000-0000-0000-0001-000000000004",
    "sku": "SEA-037",
    "name": "Strawberry Pumpkin",
    "flavor": "Strawberry",
    "emoji": "🎃",
    "price": 135,
    "stock": 11,
    "status": "active"
  },
  {
    "id": "00000000-0000-0000-0002-000000000230",
    "store_id": "00000000-0000-0000-0000-000000000001",
    "category_id": "00000000-0000-0000-0001-000000000004",
    "sku": "SEA-038",
    "name": "Blueberry Tree",
    "flavor": "Blueberry",
    "emoji": "🎄",
    "price": 150,
    "stock": 7,
    "status": "active"
  },
  {
    "id": "00000000-0000-0000-0002-000000000231",
    "store_id": "00000000-0000-0000-0000-000000000001",
    "category_id": "00000000-0000-0000-0001-000000000004",
    "sku": "SEA-039",
    "name": "Vanilla Rose",
    "flavor": "Vanilla",
    "emoji": "🌹",
    "price": 120,
    "stock": 0,
    "status": "out_of_stock"
  },
  {
    "id": "00000000-0000-0000-0002-000000000232",
    "store_id": "00000000-0000-0000-0000-000000000001",
    "category_id": "00000000-0000-0000-0001-000000000004",
    "sku": "SEA-040",
    "name": "Chocolate Flower",
    "flavor": "Chocolate",
    "emoji": "🌸",
    "price": 130,
    "stock": 14,
    "status": "active"
  },
  {
    "id": "00000000-0000-0000-0002-000000000233",
    "store_id": "00000000-0000-0000-0000-000000000001",
    "category_id": "00000000-0000-0000-0001-000000000004",
    "sku": "SEA-041",
    "name": "Matcha Blossom",
    "flavor": "Matcha",
    "emoji": "🌺",
    "price": 140,
    "stock": 10,
    "status": "active"
  },
  {
    "id": "00000000-0000-0000-0002-000000000234",
    "store_id": "00000000-0000-0000-0000-000000000001",
    "category_id": "00000000-0000-0000-0001-000000000004",
    "sku": "SEA-042",
    "name": "Rose Leaf",
    "flavor": "Rose",
    "emoji": "🍃",
    "price": 125,
    "stock": 16,
    "status": "active"
  },
  {
    "id": "00000000-0000-0000-0002-000000000235",
    "store_id": "00000000-0000-0000-0000-000000000001",
    "category_id": "00000000-0000-0000-0001-000000000004",
    "sku": "SEA-043",
    "name": "Peach Sunflower",
    "flavor": "Peach",
    "emoji": "🌻",
    "price": 135,
    "stock": 0,
    "status": "out_of_stock"
  },
  {
    "id": "00000000-0000-0000-0002-000000000236",
    "store_id": "00000000-0000-0000-0000-000000000001",
    "category_id": "00000000-0000-0000-0001-000000000004",
    "sku": "SEA-044",
    "name": "Mango Snow",
    "flavor": "Mango",
    "emoji": "❄️",
    "price": 145,
    "stock": 8,
    "status": "active"
  },
  {
    "id": "00000000-0000-0000-0002-000000000237",
    "store_id": "00000000-0000-0000-0000-000000000001",
    "category_id": "00000000-0000-0000-0001-000000000004",
    "sku": "SEA-045",
    "name": "Sakura Pumpkin",
    "flavor": "Sakura",
    "emoji": "🎃",
    "price": 160,
    "stock": 5,
    "status": "active"
  },
  {
    "id": "00000000-0000-0000-0002-000000000238",
    "store_id": "00000000-0000-0000-0000-000000000001",
    "category_id": "00000000-0000-0000-0001-000000000004",
    "sku": "SEA-046",
    "name": "Honey Tree",
    "flavor": "Honey",
    "emoji": "🎄",
    "price": 130,
    "stock": 12,
    "status": "active"
  },
  {
    "id": "00000000-0000-0000-0002-000000000239",
    "store_id": "00000000-0000-0000-0000-000000000001",
    "category_id": "00000000-0000-0000-0001-000000000004",
    "sku": "SEA-047",
    "name": "Caramel Rose",
    "flavor": "Caramel",
    "emoji": "🌹",
    "price": 140,
    "stock": 0,
    "status": "out_of_stock"
  },
  {
    "id": "00000000-0000-0000-0002-000000000240",
    "store_id": "00000000-0000-0000-0000-000000000001",
    "category_id": "00000000-0000-0000-0001-000000000004",
    "sku": "SEA-048",
    "name": "Almond Flower",
    "flavor": "Almond",
    "emoji": "🌸",
    "price": 150,
    "stock": 9,
    "status": "active"
  },
  {
    "id": "00000000-0000-0000-0002-000000000241",
    "store_id": "00000000-0000-0000-0000-000000000001",
    "category_id": "00000000-0000-0000-0001-000000000004",
    "sku": "SEA-049",
    "name": "Strawberry Blossom",
    "flavor": "Strawberry",
    "emoji": "🌺",
    "price": 120,
    "stock": 14,
    "status": "active"
  },
  {
    "id": "00000000-0000-0000-0002-000000000242",
    "store_id": "00000000-0000-0000-0000-000000000001",
    "category_id": "00000000-0000-0000-0001-000000000004",
    "sku": "SEA-050",
    "name": "Blueberry Leaf",
    "flavor": "Blueberry",
    "emoji": "🍃",
    "price": 125,
    "stock": 10,
    "status": "active"
  },
  {
    "id": "00000000-0000-0000-0002-000000000243",
    "store_id": "00000000-0000-0000-0000-000000000001",
    "category_id": "00000000-0000-0000-0001-000000000004",
    "sku": "SEA-051",
    "name": "Vanilla Sunflower",
    "flavor": "Vanilla",
    "emoji": "🌻",
    "price": 115,
    "stock": 0,
    "status": "out_of_stock"
  },
  {
    "id": "00000000-0000-0000-0002-000000000244",
    "store_id": "00000000-0000-0000-0000-000000000001",
    "category_id": "00000000-0000-0000-0001-000000000004",
    "sku": "SEA-052",
    "name": "Chocolate Snow",
    "flavor": "Chocolate",
    "emoji": "❄️",
    "price": 135,
    "stock": 15,
    "status": "active"
  },
  {
    "id": "00000000-0000-0000-0002-000000000245",
    "store_id": "00000000-0000-0000-0000-000000000001",
    "category_id": "00000000-0000-0000-0001-000000000004",
    "sku": "SEA-053",
    "name": "Matcha Pumpkin",
    "flavor": "Matcha",
    "emoji": "🎃",
    "price": 145,
    "stock": 8,
    "status": "active"
  },
  {
    "id": "00000000-0000-0000-0002-000000000246",
    "store_id": "00000000-0000-0000-0000-000000000001",
    "category_id": "00000000-0000-0000-0001-000000000004",
    "sku": "SEA-054",
    "name": "Rose Tree",
    "flavor": "Rose",
    "emoji": "🎄",
    "price": 150,
    "stock": 12,
    "status": "active"
  },
  {
    "id": "00000000-0000-0000-0002-000000000247",
    "store_id": "00000000-0000-0000-0000-000000000001",
    "category_id": "00000000-0000-0000-0001-000000000004",
    "sku": "SEA-055",
    "name": "Peach Rose",
    "flavor": "Peach",
    "emoji": "🌹",
    "price": 140,
    "stock": 0,
    "status": "out_of_stock"
  },
  {
    "id": "00000000-0000-0000-0002-000000000248",
    "store_id": "00000000-0000-0000-0000-000000000001",
    "category_id": "00000000-0000-0000-0001-000000000004",
    "sku": "SEA-056",
    "name": "Mango Flower",
    "flavor": "Mango",
    "emoji": "🌸",
    "price": 150,
    "stock": 10,
    "status": "active"
  },
  {
    "id": "00000000-0000-0000-0002-000000000249",
    "store_id": "00000000-0000-0000-0000-000000000001",
    "category_id": "00000000-0000-0000-0001-000000000004",
    "sku": "SEA-057",
    "name": "Sakura Blossom",
    "flavor": "Sakura",
    "emoji": "🌺",
    "price": 165,
    "stock": 6,
    "status": "active"
  },
  {
    "id": "00000000-0000-0000-0002-000000000250",
    "store_id": "00000000-0000-0000-0000-000000000001",
    "category_id": "00000000-0000-0000-0001-000000000004",
    "sku": "SEA-058",
    "name": "Honey Leaf",
    "flavor": "Honey",
    "emoji": "🍃",
    "price": 120,
    "stock": 16,
    "status": "active"
  },
  {
    "id": "00000000-0000-0000-0002-000000000251",
    "store_id": "00000000-0000-0000-0000-000000000001",
    "category_id": "00000000-0000-0000-0001-000000000004",
    "sku": "SEA-059",
    "name": "Caramel Sunflower",
    "flavor": "Caramel",
    "emoji": "🌻",
    "price": 135,
    "stock": 0,
    "status": "out_of_stock"
  },
  {
    "id": "00000000-0000-0000-0002-000000000252",
    "store_id": "00000000-0000-0000-0000-000000000001",
    "category_id": "00000000-0000-0000-0001-000000000004",
    "sku": "SEA-060",
    "name": "Almond Snow",
    "flavor": "Almond",
    "emoji": "❄️",
    "price": 145,
    "stock": 9,
    "status": "active"
  },
  {
    "id": "00000000-0000-0000-0002-000000000253",
    "store_id": "00000000-0000-0000-0000-000000000001",
    "category_id": "00000000-0000-0000-0001-000000000004",
    "sku": "SEA-061",
    "name": "Strawberry Pumpkin",
    "flavor": "Strawberry",
    "emoji": "🎃",
    "price": 140,
    "stock": 11,
    "status": "active"
  },
  {
    "id": "00000000-0000-0000-0002-000000000254",
    "store_id": "00000000-0000-0000-0000-000000000001",
    "category_id": "00000000-0000-0000-0001-000000000004",
    "sku": "SEA-062",
    "name": "Blueberry Tree",
    "flavor": "Blueberry",
    "emoji": "🎄",
    "price": 155,
    "stock": 7,
    "status": "active"
  },
  {
    "id": "00000000-0000-0000-0002-000000000255",
    "store_id": "00000000-0000-0000-0000-000000000001",
    "category_id": "00000000-0000-0000-0001-000000000004",
    "sku": "SEA-063",
    "name": "Vanilla Rose",
    "flavor": "Vanilla",
    "emoji": "🌹",
    "price": 125,
    "stock": 0,
    "status": "out_of_stock"
  },
  {
    "id": "00000000-0000-0000-0002-000000000256",
    "store_id": "00000000-0000-0000-0000-000000000001",
    "category_id": "00000000-0000-0000-0001-000000000004",
    "sku": "SEA-064",
    "name": "Chocolate Flower",
    "flavor": "Chocolate",
    "emoji": "🌸",
    "price": 135,
    "stock": 14,
    "status": "active"
  },
  {
    "id": "00000000-0000-0000-0002-000000000257",
    "store_id": "00000000-0000-0000-0000-000000000001",
    "category_id": "00000000-0000-0000-0001-000000000005",
    "sku": "GFB-001",
    "name": "Strawberry Box",
    "flavor": "Strawberry",
    "emoji": "🎁",
    "price": 250,
    "stock": 10,
    "status": "active"
  },
  {
    "id": "00000000-0000-0000-0002-000000000258",
    "store_id": "00000000-0000-0000-0000-000000000001",
    "category_id": "00000000-0000-0000-0001-000000000005",
    "sku": "GFB-002",
    "name": "Blueberry Ribbon",
    "flavor": "Blueberry",
    "emoji": "🎀",
    "price": 220,
    "stock": 15,
    "status": "active"
  },
  {
    "id": "00000000-0000-0000-0002-000000000259",
    "store_id": "00000000-0000-0000-0000-000000000001",
    "category_id": "00000000-0000-0000-0001-000000000005",
    "sku": "GFB-003",
    "name": "Vanilla Celebration",
    "flavor": "Vanilla",
    "emoji": "🎊",
    "price": 210,
    "stock": 0,
    "status": "out_of_stock"
  },
  {
    "id": "00000000-0000-0000-0002-000000000260",
    "store_id": "00000000-0000-0000-0000-000000000001",
    "category_id": "00000000-0000-0000-0001-000000000005",
    "sku": "GFB-004",
    "name": "Chocolate Party",
    "flavor": "Chocolate",
    "emoji": "🎉",
    "price": 280,
    "stock": 5,
    "status": "active"
  },
  {
    "id": "00000000-0000-0000-0002-000000000261",
    "store_id": "00000000-0000-0000-0000-000000000001",
    "category_id": "00000000-0000-0000-0001-000000000005",
    "sku": "GFB-005",
    "name": "Matcha Bag",
    "flavor": "Matcha",
    "emoji": "🛍️",
    "price": 260,
    "stock": 8,
    "status": "active"
  },
  {
    "id": "00000000-0000-0000-0002-000000000262",
    "store_id": "00000000-0000-0000-0000-000000000001",
    "category_id": "00000000-0000-0000-0001-000000000005",
    "sku": "GFB-006",
    "name": "Rose Heart",
    "flavor": "Rose",
    "emoji": "💝",
    "price": 290,
    "stock": 12,
    "status": "active"
  },
  {
    "id": "00000000-0000-0000-0002-000000000263",
    "store_id": "00000000-0000-0000-0000-000000000001",
    "category_id": "00000000-0000-0000-0001-000000000005",
    "sku": "GFB-007",
    "name": "Peach Box",
    "flavor": "Peach",
    "emoji": "🎁",
    "price": 230,
    "stock": 0,
    "status": "out_of_stock"
  },
  {
    "id": "00000000-0000-0000-0002-000000000264",
    "store_id": "00000000-0000-0000-0000-000000000001",
    "category_id": "00000000-0000-0000-0001-000000000005",
    "sku": "GFB-008",
    "name": "Mango Ribbon",
    "flavor": "Mango",
    "emoji": "🎀",
    "price": 240,
    "stock": 18,
    "status": "active"
  },
  {
    "id": "00000000-0000-0000-0002-000000000265",
    "store_id": "00000000-0000-0000-0000-000000000001",
    "category_id": "00000000-0000-0000-0001-000000000005",
    "sku": "GFB-009",
    "name": "Sakura Celebration",
    "flavor": "Sakura",
    "emoji": "🎊",
    "price": 300,
    "stock": 6,
    "status": "active"
  },
  {
    "id": "00000000-0000-0000-0002-000000000266",
    "store_id": "00000000-0000-0000-0000-000000000001",
    "category_id": "00000000-0000-0000-0001-000000000005",
    "sku": "GFB-010",
    "name": "Honey Party",
    "flavor": "Honey",
    "emoji": "🎉",
    "price": 215,
    "stock": 14,
    "status": "active"
  },
  {
    "id": "00000000-0000-0000-0002-000000000267",
    "store_id": "00000000-0000-0000-0000-000000000001",
    "category_id": "00000000-0000-0000-0001-000000000005",
    "sku": "GFB-011",
    "name": "Caramel Bag",
    "flavor": "Caramel",
    "emoji": "🛍️",
    "price": 245,
    "stock": 0,
    "status": "out_of_stock"
  },
  {
    "id": "00000000-0000-0000-0002-000000000268",
    "store_id": "00000000-0000-0000-0000-000000000001",
    "category_id": "00000000-0000-0000-0001-000000000005",
    "sku": "GFB-012",
    "name": "Almond Heart",
    "flavor": "Almond",
    "emoji": "💝",
    "price": 255,
    "stock": 11,
    "status": "active"
  },
  {
    "id": "00000000-0000-0000-0002-000000000269",
    "store_id": "00000000-0000-0000-0000-000000000001",
    "category_id": "00000000-0000-0000-0001-000000000005",
    "sku": "GFB-013",
    "name": "Strawberry Ribbon",
    "flavor": "Strawberry",
    "emoji": "🎀",
    "price": 225,
    "stock": 16,
    "status": "active"
  },
  {
    "id": "00000000-0000-0000-0002-000000000270",
    "store_id": "00000000-0000-0000-0000-000000000001",
    "category_id": "00000000-0000-0000-0001-000000000005",
    "sku": "GFB-014",
    "name": "Blueberry Celebration",
    "flavor": "Blueberry",
    "emoji": "🎊",
    "price": 235,
    "stock": 10,
    "status": "active"
  },
  {
    "id": "00000000-0000-0000-0002-000000000271",
    "store_id": "00000000-0000-0000-0000-000000000001",
    "category_id": "00000000-0000-0000-0001-000000000005",
    "sku": "GFB-015",
    "name": "Vanilla Party",
    "flavor": "Vanilla",
    "emoji": "🎉",
    "price": 205,
    "stock": 0,
    "status": "out_of_stock"
  },
  {
    "id": "00000000-0000-0000-0002-000000000272",
    "store_id": "00000000-0000-0000-0000-000000000001",
    "category_id": "00000000-0000-0000-0001-000000000005",
    "sku": "GFB-016",
    "name": "Chocolate Bag",
    "flavor": "Chocolate",
    "emoji": "🛍️",
    "price": 285,
    "stock": 7,
    "status": "active"
  },
  {
    "id": "00000000-0000-0000-0002-000000000273",
    "store_id": "00000000-0000-0000-0000-000000000001",
    "category_id": "00000000-0000-0000-0001-000000000005",
    "sku": "GFB-017",
    "name": "Matcha Heart",
    "flavor": "Matcha",
    "emoji": "💝",
    "price": 270,
    "stock": 13,
    "status": "active"
  },
  {
    "id": "00000000-0000-0000-0002-000000000274",
    "store_id": "00000000-0000-0000-0000-000000000001",
    "category_id": "00000000-0000-0000-0001-000000000005",
    "sku": "GFB-018",
    "name": "Rose Box",
    "flavor": "Rose",
    "emoji": "🎁",
    "price": 295,
    "stock": 8,
    "status": "active"
  },
  {
    "id": "00000000-0000-0000-0002-000000000275",
    "store_id": "00000000-0000-0000-0000-000000000001",
    "category_id": "00000000-0000-0000-0001-000000000005",
    "sku": "GFB-019",
    "name": "Peach Ribbon",
    "flavor": "Peach",
    "emoji": "🎀",
    "price": 235,
    "stock": 0,
    "status": "out_of_stock"
  },
  {
    "id": "00000000-0000-0000-0002-000000000276",
    "store_id": "00000000-0000-0000-0000-000000000001",
    "category_id": "00000000-0000-0000-0001-000000000005",
    "sku": "GFB-020",
    "name": "Mango Celebration",
    "flavor": "Mango",
    "emoji": "🎊",
    "price": 245,
    "stock": 15,
    "status": "active"
  },
  {
    "id": "00000000-0000-0000-0002-000000000277",
    "store_id": "00000000-0000-0000-0000-000000000001",
    "category_id": "00000000-0000-0000-0001-000000000005",
    "sku": "GFB-021",
    "name": "Sakura Party",
    "flavor": "Sakura",
    "emoji": "🎉",
    "price": 310,
    "stock": 5,
    "status": "active"
  },
  {
    "id": "00000000-0000-0000-0002-000000000278",
    "store_id": "00000000-0000-0000-0000-000000000001",
    "category_id": "00000000-0000-0000-0001-000000000005",
    "sku": "GFB-022",
    "name": "Honey Bag",
    "flavor": "Honey",
    "emoji": "🛍️",
    "price": 225,
    "stock": 12,
    "status": "active"
  },
  {
    "id": "00000000-0000-0000-0002-000000000279",
    "store_id": "00000000-0000-0000-0000-000000000001",
    "category_id": "00000000-0000-0000-0001-000000000005",
    "sku": "GFB-023",
    "name": "Caramel Heart",
    "flavor": "Caramel",
    "emoji": "💝",
    "price": 255,
    "stock": 0,
    "status": "out_of_stock"
  },
  {
    "id": "00000000-0000-0000-0002-000000000280",
    "store_id": "00000000-0000-0000-0000-000000000001",
    "category_id": "00000000-0000-0000-0001-000000000005",
    "sku": "GFB-024",
    "name": "Almond Box",
    "flavor": "Almond",
    "emoji": "🎁",
    "price": 265,
    "stock": 9,
    "status": "active"
  },
  {
    "id": "00000000-0000-0000-0002-000000000281",
    "store_id": "00000000-0000-0000-0000-000000000001",
    "category_id": "00000000-0000-0000-0001-000000000005",
    "sku": "GFB-025",
    "name": "Strawberry Celebration",
    "flavor": "Strawberry",
    "emoji": "🎊",
    "price": 235,
    "stock": 14,
    "status": "active"
  },
  {
    "id": "00000000-0000-0000-0002-000000000282",
    "store_id": "00000000-0000-0000-0000-000000000001",
    "category_id": "00000000-0000-0000-0001-000000000005",
    "sku": "GFB-026",
    "name": "Blueberry Party",
    "flavor": "Blueberry",
    "emoji": "🎉",
    "price": 245,
    "stock": 11,
    "status": "active"
  },
  {
    "id": "00000000-0000-0000-0002-000000000283",
    "store_id": "00000000-0000-0000-0000-000000000001",
    "category_id": "00000000-0000-0000-0001-000000000005",
    "sku": "GFB-027",
    "name": "Vanilla Bag",
    "flavor": "Vanilla",
    "emoji": "🛍️",
    "price": 215,
    "stock": 0,
    "status": "out_of_stock"
  },
  {
    "id": "00000000-0000-0000-0002-000000000284",
    "store_id": "00000000-0000-0000-0000-000000000001",
    "category_id": "00000000-0000-0000-0001-000000000005",
    "sku": "GFB-028",
    "name": "Chocolate Heart",
    "flavor": "Chocolate",
    "emoji": "💝",
    "price": 295,
    "stock": 6,
    "status": "active"
  },
  {
    "id": "00000000-0000-0000-0002-000000000285",
    "store_id": "00000000-0000-0000-0000-000000000001",
    "category_id": "00000000-0000-0000-0001-000000000005",
    "sku": "GFB-029",
    "name": "Matcha Box",
    "flavor": "Matcha",
    "emoji": "🎁",
    "price": 280,
    "stock": 10,
    "status": "active"
  },
  {
    "id": "00000000-0000-0000-0002-000000000286",
    "store_id": "00000000-0000-0000-0000-000000000001",
    "category_id": "00000000-0000-0000-0001-000000000005",
    "sku": "GFB-030",
    "name": "Rose Ribbon",
    "flavor": "Rose",
    "emoji": "🎀",
    "price": 305,
    "stock": 7,
    "status": "active"
  },
  {
    "id": "00000000-0000-0000-0002-000000000287",
    "store_id": "00000000-0000-0000-0000-000000000001",
    "category_id": "00000000-0000-0000-0001-000000000005",
    "sku": "GFB-031",
    "name": "Peach Celebration",
    "flavor": "Peach",
    "emoji": "🎊",
    "price": 245,
    "stock": 0,
    "status": "out_of_stock"
  },
  {
    "id": "00000000-0000-0000-0002-000000000288",
    "store_id": "00000000-0000-0000-0000-000000000001",
    "category_id": "00000000-0000-0000-0001-000000000005",
    "sku": "GFB-032",
    "name": "Mango Party",
    "flavor": "Mango",
    "emoji": "🎉",
    "price": 255,
    "stock": 12,
    "status": "active"
  },
  {
    "id": "00000000-0000-0000-0002-000000000289",
    "store_id": "00000000-0000-0000-0000-000000000001",
    "category_id": "00000000-0000-0000-0001-000000000005",
    "sku": "GFB-033",
    "name": "Sakura Bag",
    "flavor": "Sakura",
    "emoji": "🛍️",
    "price": 320,
    "stock": 8,
    "status": "active"
  },
  {
    "id": "00000000-0000-0000-0002-000000000290",
    "store_id": "00000000-0000-0000-0000-000000000001",
    "category_id": "00000000-0000-0000-0001-000000000005",
    "sku": "GFB-034",
    "name": "Honey Heart",
    "flavor": "Honey",
    "emoji": "💝",
    "price": 235,
    "stock": 10,
    "status": "active"
  },
  {
    "id": "00000000-0000-0000-0002-000000000291",
    "store_id": "00000000-0000-0000-0000-000000000001",
    "category_id": "00000000-0000-0000-0001-000000000005",
    "sku": "GFB-035",
    "name": "Caramel Box",
    "flavor": "Caramel",
    "emoji": "🎁",
    "price": 265,
    "stock": 0,
    "status": "out_of_stock"
  },
  {
    "id": "00000000-0000-0000-0002-000000000292",
    "store_id": "00000000-0000-0000-0000-000000000001",
    "category_id": "00000000-0000-0000-0001-000000000005",
    "sku": "GFB-036",
    "name": "Almond Ribbon",
    "flavor": "Almond",
    "emoji": "🎀",
    "price": 275,
    "stock": 11,
    "status": "active"
  },
  {
    "id": "00000000-0000-0000-0002-000000000293",
    "store_id": "00000000-0000-0000-0000-000000000001",
    "category_id": "00000000-0000-0000-0001-000000000005",
    "sku": "GFB-037",
    "name": "Strawberry Party",
    "flavor": "Strawberry",
    "emoji": "🎉",
    "price": 245,
    "stock": 15,
    "status": "active"
  },
  {
    "id": "00000000-0000-0000-0002-000000000294",
    "store_id": "00000000-0000-0000-0000-000000000001",
    "category_id": "00000000-0000-0000-0001-000000000005",
    "sku": "GFB-038",
    "name": "Blueberry Bag",
    "flavor": "Blueberry",
    "emoji": "🛍️",
    "price": 255,
    "stock": 12,
    "status": "active"
  },
  {
    "id": "00000000-0000-0000-0002-000000000295",
    "store_id": "00000000-0000-0000-0000-000000000001",
    "category_id": "00000000-0000-0000-0001-000000000005",
    "sku": "GFB-039",
    "name": "Vanilla Heart",
    "flavor": "Vanilla",
    "emoji": "💝",
    "price": 225,
    "stock": 0,
    "status": "out_of_stock"
  },
  {
    "id": "00000000-0000-0000-0002-000000000296",
    "store_id": "00000000-0000-0000-0000-000000000001",
    "category_id": "00000000-0000-0000-0001-000000000005",
    "sku": "GFB-040",
    "name": "Chocolate Box",
    "flavor": "Chocolate",
    "emoji": "🎁",
    "price": 305,
    "stock": 7,
    "status": "active"
  },
  {
    "id": "00000000-0000-0000-0002-000000000297",
    "store_id": "00000000-0000-0000-0000-000000000001",
    "category_id": "00000000-0000-0000-0001-000000000005",
    "sku": "GFB-041",
    "name": "Matcha Ribbon",
    "flavor": "Matcha",
    "emoji": "🎀",
    "price": 290,
    "stock": 10,
    "status": "active"
  },
  {
    "id": "00000000-0000-0000-0002-000000000298",
    "store_id": "00000000-0000-0000-0000-000000000001",
    "category_id": "00000000-0000-0000-0001-000000000005",
    "sku": "GFB-042",
    "name": "Rose Celebration",
    "flavor": "Rose",
    "emoji": "🎊",
    "price": 315,
    "stock": 8,
    "status": "active"
  },
  {
    "id": "00000000-0000-0000-0002-000000000299",
    "store_id": "00000000-0000-0000-0000-000000000001",
    "category_id": "00000000-0000-0000-0001-000000000005",
    "sku": "GFB-043",
    "name": "Peach Party",
    "flavor": "Peach",
    "emoji": "🎉",
    "price": 255,
    "stock": 0,
    "status": "out_of_stock"
  },
  {
    "id": "00000000-0000-0000-0002-000000000300",
    "store_id": "00000000-0000-0000-0000-000000000001",
    "category_id": "00000000-0000-0000-0001-000000000005",
    "sku": "GFB-044",
    "name": "Mango Bag",
    "flavor": "Mango",
    "emoji": "🛍️",
    "price": 265,
    "stock": 13,
    "status": "active"
  },
  {
    "id": "00000000-0000-0000-0002-000000000301",
    "store_id": "00000000-0000-0000-0000-000000000001",
    "category_id": "00000000-0000-0000-0001-000000000005",
    "sku": "GFB-045",
    "name": "Sakura Heart",
    "flavor": "Sakura",
    "emoji": "💝",
    "price": 330,
    "stock": 9,
    "status": "active"
  },
  {
    "id": "00000000-0000-0000-0002-000000000302",
    "store_id": "00000000-0000-0000-0000-000000000001",
    "category_id": "00000000-0000-0000-0001-000000000005",
    "sku": "GFB-046",
    "name": "Honey Box",
    "flavor": "Honey",
    "emoji": "🎁",
    "price": 245,
    "stock": 11,
    "status": "active"
  },
  {
    "id": "00000000-0000-0000-0002-000000000303",
    "store_id": "00000000-0000-0000-0000-000000000001",
    "category_id": "00000000-0000-0000-0001-000000000005",
    "sku": "GFB-047",
    "name": "Caramel Ribbon",
    "flavor": "Caramel",
    "emoji": "🎀",
    "price": 275,
    "stock": 0,
    "status": "out_of_stock"
  },
  {
    "id": "00000000-0000-0000-0002-000000000304",
    "store_id": "00000000-0000-0000-0000-000000000001",
    "category_id": "00000000-0000-0000-0001-000000000005",
    "sku": "GFB-048",
    "name": "Almond Celebration",
    "flavor": "Almond",
    "emoji": "🎊",
    "price": 285,
    "stock": 12,
    "status": "active"
  },
  {
    "id": "00000000-0000-0000-0002-000000000305",
    "store_id": "00000000-0000-0000-0000-000000000001",
    "category_id": "00000000-0000-0000-0001-000000000005",
    "sku": "GFB-049",
    "name": "Strawberry Bag",
    "flavor": "Strawberry",
    "emoji": "🛍️",
    "price": 255,
    "stock": 16,
    "status": "active"
  },
  {
    "id": "00000000-0000-0000-0002-000000000306",
    "store_id": "00000000-0000-0000-0000-000000000001",
    "category_id": "00000000-0000-0000-0001-000000000005",
    "sku": "GFB-050",
    "name": "Blueberry Heart",
    "flavor": "Blueberry",
    "emoji": "💝",
    "price": 265,
    "stock": 13,
    "status": "active"
  },
  {
    "id": "00000000-0000-0000-0002-000000000307",
    "store_id": "00000000-0000-0000-0000-000000000001",
    "category_id": "00000000-0000-0000-0001-000000000005",
    "sku": "GFB-051",
    "name": "Vanilla Box",
    "flavor": "Vanilla",
    "emoji": "🎁",
    "price": 235,
    "stock": 0,
    "status": "out_of_stock"
  },
  {
    "id": "00000000-0000-0000-0002-000000000308",
    "store_id": "00000000-0000-0000-0000-000000000001",
    "category_id": "00000000-0000-0000-0001-000000000005",
    "sku": "GFB-052",
    "name": "Chocolate Ribbon",
    "flavor": "Chocolate",
    "emoji": "🎀",
    "price": 315,
    "stock": 8,
    "status": "active"
  },
  {
    "id": "00000000-0000-0000-0002-000000000309",
    "store_id": "00000000-0000-0000-0000-000000000001",
    "category_id": "00000000-0000-0000-0001-000000000005",
    "sku": "GFB-053",
    "name": "Matcha Celebration",
    "flavor": "Matcha",
    "emoji": "🎊",
    "price": 300,
    "stock": 11,
    "status": "active"
  },
  {
    "id": "00000000-0000-0000-0002-000000000310",
    "store_id": "00000000-0000-0000-0000-000000000001",
    "category_id": "00000000-0000-0000-0001-000000000005",
    "sku": "GFB-054",
    "name": "Rose Party",
    "flavor": "Rose",
    "emoji": "🎉",
    "price": 325,
    "stock": 9,
    "status": "active"
  },
  {
    "id": "00000000-0000-0000-0002-000000000311",
    "store_id": "00000000-0000-0000-0000-000000000001",
    "category_id": "00000000-0000-0000-0001-000000000005",
    "sku": "GFB-055",
    "name": "Peach Bag",
    "flavor": "Peach",
    "emoji": "🛍️",
    "price": 265,
    "stock": 0,
    "status": "out_of_stock"
  },
  {
    "id": "00000000-0000-0000-0002-000000000312",
    "store_id": "00000000-0000-0000-0000-000000000001",
    "category_id": "00000000-0000-0000-0001-000000000005",
    "sku": "GFB-056",
    "name": "Mango Heart",
    "flavor": "Mango",
    "emoji": "💝",
    "price": 275,
    "stock": 14,
    "status": "active"
  },
  {
    "id": "00000000-0000-0000-0002-000000000313",
    "store_id": "00000000-0000-0000-0000-000000000001",
    "category_id": "00000000-0000-0000-0001-000000000005",
    "sku": "GFB-057",
    "name": "Sakura Box",
    "flavor": "Sakura",
    "emoji": "🎁",
    "price": 340,
    "stock": 10,
    "status": "active"
  },
  {
    "id": "00000000-0000-0000-0002-000000000314",
    "store_id": "00000000-0000-0000-0000-000000000001",
    "category_id": "00000000-0000-0000-0001-000000000005",
    "sku": "GFB-058",
    "name": "Honey Ribbon",
    "flavor": "Honey",
    "emoji": "🎀",
    "price": 255,
    "stock": 12,
    "status": "active"
  },
  {
    "id": "00000000-0000-0000-0002-000000000315",
    "store_id": "00000000-0000-0000-0000-000000000001",
    "category_id": "00000000-0000-0000-0001-000000000005",
    "sku": "GFB-059",
    "name": "Caramel Celebration",
    "flavor": "Caramel",
    "emoji": "🎊",
    "price": 285,
    "stock": 0,
    "status": "out_of_stock"
  },
  {
    "id": "00000000-0000-0000-0002-000000000316",
    "store_id": "00000000-0000-0000-0000-000000000001",
    "category_id": "00000000-0000-0000-0001-000000000005",
    "sku": "GFB-060",
    "name": "Almond Party",
    "flavor": "Almond",
    "emoji": "🎉",
    "price": 295,
    "stock": 13,
    "status": "active"
  },
  {
    "id": "00000000-0000-0000-0002-000000000317",
    "store_id": "00000000-0000-0000-0000-000000000001",
    "category_id": "00000000-0000-0000-0001-000000000005",
    "sku": "GFB-061",
    "name": "Strawberry Heart",
    "flavor": "Strawberry",
    "emoji": "💝",
    "price": 265,
    "stock": 15,
    "status": "active"
  },
  {
    "id": "00000000-0000-0000-0002-000000000318",
    "store_id": "00000000-0000-0000-0000-000000000001",
    "category_id": "00000000-0000-0000-0001-000000000005",
    "sku": "GFB-062",
    "name": "Blueberry Box",
    "flavor": "Blueberry",
    "emoji": "🎁",
    "price": 275,
    "stock": 12,
    "status": "active"
  },
  {
    "id": "00000000-0000-0000-0002-000000000319",
    "store_id": "00000000-0000-0000-0000-000000000001",
    "category_id": "00000000-0000-0000-0001-000000000005",
    "sku": "GFB-063",
    "name": "Vanilla Ribbon",
    "flavor": "Vanilla",
    "emoji": "🎀",
    "price": 245,
    "stock": 0,
    "status": "out_of_stock"
  },
  {
    "id": "00000000-0000-0000-0002-000000000320",
    "store_id": "00000000-0000-0000-0000-000000000001",
    "category_id": "00000000-0000-0000-0001-000000000005",
    "sku": "GFB-064",
    "name": "Chocolate Celebration",
    "flavor": "Chocolate",
    "emoji": "🎊",
    "price": 325,
    "stock": 9,
    "status": "active"
  }
];

const DEMO_CUSTOMERS = [
  { id: 'c1', name: 'Somchai Jaidee', phone: '081-234-5678', email: 'somchai@gmail.com', address: 'Bangkok', tag: 'VIP', created_at: new Date(Date.now() - 30*86400000).toISOString() },
  { id: 'c2', name: 'Nattapong Srisuk', phone: '089-876-5432', email: 'natta@outlook.com', address: 'Nonthaburi', tag: 'Regular', created_at: new Date(Date.now() - 20*86400000).toISOString() },
  { id: 'c3', name: 'Ploy Supaporn', phone: '086-555-1234', email: 'ploy@yahoo.com', address: 'Bangkok', tag: 'VIP', created_at: new Date(Date.now() - 15*86400000).toISOString() },
  { id: 'c4', name: 'Kittisak Wong', phone: '082-111-9988', email: 'kitti@work.co', address: 'Samut Prakan', tag: 'New', created_at: new Date(Date.now() - 5*86400000).toISOString() },
  { id: 'c5', name: 'Ananya Saelim', phone: '095-444-7777', email: 'ananya@live.com', address: 'Bangkok', tag: 'Regular', created_at: new Date(Date.now() - 2*86400000).toISOString() }
];

const DEMO_PROMOTIONS = [
  { id: 'promo1', code: 'SAVE10', type: 'percent', discount: 10, min_order: 100, status: 'active', used_count: 14, max_uses: 100, start_date: '2025-01-01T00:00:00', end_date: '2026-12-31T23:59:59' },
  { id: 'promo2', code: 'WELCOME50', type: 'fixed', discount: 50, min_order: 250, status: 'active', used_count: 28, max_uses: 50, start_date: '2025-01-01T00:00:00', end_date: '2026-12-31T23:59:59' },
  { id: 'promo3', code: 'BERRY20', type: 'percent', discount: 20, min_order: 300, status: 'active', used_count: 5, max_uses: 30, start_date: '2025-01-01T00:00:00', end_date: '2026-12-31T23:59:59' }
];

const DEMO_REVIEWS = [
  { id: 'r1', customer_name: 'Somchai Jaidee', rating: 5, comment: 'ขนมเค้กสตรอว์เบอร์รีอร่อยมากครับ นุ่มละมุน ไม่หวานเกินไป แนะนำเลย!', reply: 'ขอบพระคุณมากครับ ทางร้านคัดสรรผลไม้สดใหม่ทุกวันครับ ❤️', is_pinned: true, is_hidden: false, created_at: new Date(Date.now() - 2*86400000).toISOString() },
  { id: 'r2', customer_name: 'Ploy Supaporn', rating: 5, comment: 'Matcha Latte เข้มข้น หอมมัทฉะแท้ๆ ขนมครัวซองต์กรอบนอกนุ่มใน ฟินมากค่ะ', reply: 'ยินดีให้บริการครับ ขอบคุณที่แวะมาอุดหนุนนะครับ 🙏', is_pinned: true, is_hidden: false, created_at: new Date(Date.now() - 4*86400000).toISOString() },
  { id: 'r3', customer_name: 'Nattapong S.', rating: 4, comment: 'บรรยากาศร้านดี เครื่องดื่มอร่อย ที่จอดรถสะดวก', reply: null, is_pinned: false, is_hidden: false, created_at: new Date(Date.now() - 7*86400000).toISOString() },
  { id: 'r4', customer_name: 'Ananya S.', rating: 5, comment: 'เซ็ตของขวัญ Gift Box จัดสวยมาก คนรับชอบมากค่ะ สั่งรอบที่ 2 แล้ว', reply: 'ขอบคุณมากครับ ทางร้านยินดีให้บริการเสมอครับ 🎁', is_pinned: false, is_hidden: false, created_at: new Date(Date.now() - 10*86400000).toISOString() }
];

function generateDemoOrders() {
  const ords = [];
  const now = Date.now();
  for (let i = 0; i < 20; i++) {
    const daysAgo = Math.floor(i / 3);
    const date = new Date(now - daysAgo * 86400000 - (i % 3) * 3600000 * 2).toISOString();
    const cust = DEMO_CUSTOMERS[i % DEMO_CUSTOMERS.length];
    const p1 = DEMO_PRODUCTS[i % DEMO_PRODUCTS.length];
    const p2 = DEMO_PRODUCTS[(i + 3) % DEMO_PRODUCTS.length];
    const q1 = (i % 2) + 1;
    const q2 = (i % 3) + 1;
    const subtotal = (p1.price * q1) + (p2.price * q2);
    const discount = i % 4 === 0 ? 50 : 0;
    const total = Math.max(0, subtotal - discount);
    const statuses = ['completed', 'completed', 'completed', 'waiting', 'preparing', 'verify'];
    const status = statuses[i % statuses.length];
    
    ords.push({
      id: 'ord-' + (1000 + i),
      order_number: 'ORD-' + date.slice(0,10).replace(/-/g,'') + '-' + String(1000 + i).padStart(4,'0'),
      customer_id: cust.id,
      customers: cust,
      store_id: DEMO_STORE.id,
      subtotal,
      discount,
      tax: 0,
      total,
      status,
      payment_method: i % 2 === 0 ? 'qr' : 'cash',
      note: i % 3 === 0 ? 'หวานน้อย' : '',
      created_at: date,
      order_items: [
        { id: 'item-' + i + '-1', product_id: p1.id, product_name: p1.name, unit_price: p1.price, quantity: q1, total: p1.price * q1 },
        { id: 'item-' + i + '-2', product_id: p2.id, product_name: p2.name, unit_price: p2.price, quantity: q2, total: p2.price * q2 }
      ]
    });
  }
  return ords;
}

function startDemoMode() {
  state.isDemo = true;
  state.user = { id: 'demo-user-001', email: 'demo@hayberry.com' };
  state.profile = { id: 'prof-001', full_name: 'HayBerry Café Manager', role: 'owner' };
  state.store = DEMO_STORE;
  state.storeSettings = { tax_rate: 7, bank_name: 'Kasikorn Bank', bank_account: '123-4-56789-0', account_holder: 'HayBerry Café' };
  state.categories = DEMO_CATEGORIES;
  state.products = DEMO_PRODUCTS;
  state.customers = DEMO_CUSTOMERS;
  state.orders = generateDemoOrders();
  state.promotions = DEMO_PROMOTIONS;
  state.reviews = DEMO_REVIEWS;
  
  localStorage.setItem('haypos_demo', 'true');
  toast('Welcome to HayBerry Café POS (Demo Mode)! 🧁');
  
  showAppScreen();
  renderSidebar();
  renderUserInfo();
  navigateTo('dashboard');
}
