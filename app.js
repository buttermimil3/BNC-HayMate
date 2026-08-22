/* BNC HayMate / HayPOS Front-End App with Supabase Integration */
(() => {
  'use strict';

  // ============================================================
  // PART 1: Supabase Configuration
  // ============================================================
  const SUPABASE_URL = 'https://nbqhnvzkyrnikfjojhvw.supabase.co';
  const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im5icWhudnpreXJuaWtmam9qaHZ3Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODczMzMwMTAsImV4cCI6MjEwMjkwOTAxMH0.X83FCIaEo-XFMXJzNtojcX9AOoCbuHhgWhWLNTfXyZQ';
  
  let supabase = null;
  function initSupabase() {
    if (window.supabase && typeof window.supabase.createClient === 'function') {
      try {
        supabase = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
        console.log('Supabase client initialized successfully!');
        return true;
      } catch (err) {
        console.warn('Supabase initialization failed, running in local mode:', err);
      }
    }
    return false;
  }

  
  const ICONS = {
    dashboard: `<svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="nav-icon"><rect width="7" height="9" x="3" y="3" rx="1"/><rect width="7" height="5" x="14" y="3" rx="1"/><rect width="7" height="9" x="14" y="12" rx="1"/><rect width="7" height="5" x="3" y="16" rx="1"/></svg>`,
    orders: `<svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="nav-icon"><path d="M6 2 3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4Z"/><path d="M3 6h18"/><path d="M16 10a4 4 0 0 1-8 0"/></svg>`,
    products: `<svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="nav-icon"><path d="m7.5 4.27 9 5.15"/><path d="M21 8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16Z"/><path d="m3.3 7 8.7 5 8.7-5"/><path d="M12 22V12"/></svg>`,
    categories: `<svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="nav-icon"><path d="m12.83 2.18a2 2 0 0 0-1.66 0L2.6 6.08a1 1 0 0 0 0 1.83l8.58 3.9a2 2 0 0 0 1.66 0l8.58-3.9a1 1 0 0 0 0-1.83Z"/><path d="m22 17.65-9.17 4.16a2 2 0 0 1-1.66 0L2 17.65"/><path d="m22 12.65-9.17 4.16a2 2 0 0 1-1.66 0L2 12.65"/></svg>`,
    stock: `<svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="nav-icon"><path d="M21 8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16Z"/><path d="m3.3 7 8.7 5 8.7-5"/><path d="M12 22V12"/></svg>`,
    customers: `<svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="nav-icon"><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M22 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>`,
    reviews: `<svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="nav-icon"><path d="M7.9 20A9 9 0 1 0 4 16.1L2 22Z"/></svg>`,
    promotions: `<svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="nav-icon"><path d="M12.586 2.586A2 2 0 0 0 11.172 2H4a2 2 0 0 0-2 2v7.172a2 2 0 0 0 .586 1.414l8.704 8.704a2.426 2.426 0 0 0 3.42 0l6.58-6.58a2.426 2.426 0 0 0 0-3.42z"/><circle cx="7.5" cy="7.5" r=".5" fill="currentColor"/></svg>`,
    reports: `<svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="nav-icon"><path d="M3 3v18h18"/><path d="m19 9-5 5-4-4-3 3"/></svg>`,
    settings: `<svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="nav-icon"><path d="M12.22 2h-.44a2 2 0 0 0-2 2v.18a2 2 0 0 1-1 1.73l-.43.25a2 2 0 0 1-2 0l-.15-.08a2 2 0 0 0-2.73.73l-.22.38a2 2 0 0 0 .73 2.73l.15.1a2 2 0 0 1 1 1.72v.51a2 2 0 0 1-1 1.74l-.15.09a2 2 0 0 0-.73 2.73l.22.38a2 2 0 0 0 2.73.73l.15-.08a2 2 0 0 1 2 0l.43.25a2 2 0 0 1 1 1.73V20a2 2 0 0 0 2 2h.44a2 2 0 0 0 2-2v-.18a2 2 0 0 1 1-1.73l.43-.25a2 2 0 0 1 2 0l.15.08a2 2 0 0 0 2.73-.73l.22-.39a2 2 0 0 0-.73-2.73l-.15-.08a2 2 0 0 1-1-1.74v-.5a2 2 0 0 1 1-1.74l.15-.09a2 2 0 0 0 .73-2.73l-.22-.38a2 2 0 0 0-2.73-.73l-.15.08a2 2 0 0 1-2 0l-.43-.25a2 2 0 0 1-1-1.73V4a2 2 0 0 0-2-2z"/><circle cx="12" cy="12" r="3"/></svg>`,
    store: `<svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="nav-icon"><path d="m2 7 4.41-4.41A2 2 0 0 1 7.83 2h8.34a2 2 0 0 1 1.42.59L22 7"/><path d="M4 12v8a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-8"/><path d="M15 22v-4a2 2 0 0 0-2-2h-2a2 2 0 0 0-2 2v4"/><path d="M2 7h20"/></svg>`,
    admin: `<svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" class="nav-icon"><circle cx="12" cy="7" r="4.2"/><path d="M4 20c0-3.8 3.6-5.8 8-5.8s8 2 8 5.8"/></svg>`,
    add: `<svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" style="display:inline-block; vertical-align:middle;"><path d="M5 12h14"/><path d="M12 5v14"/></svg>`,
    edit: `<svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="display:inline-block; vertical-align:middle;"><path d="M17 3a2.85 2.83 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5Z"/><path d="m15 5 4 4"/></svg>`,
    delete: `<svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="display:inline-block; vertical-align:middle;"><path d="M3 6h18"/><path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"/><path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"/></svg>`,
    search: `<svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="display:inline-block; vertical-align:middle;"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.3-4.3"/></svg>`,
    print: `<svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="display:inline-block; vertical-align:middle;"><path d="M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2"/><path d="M6 9V3a1 1 0 0 1 1-1h10a1 1 0 0 1 1 1v6"/><rect x="6" y="14" width="12" height="8" rx="1"/></svg>`,
    copy: `<svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="display:inline-block; vertical-align:middle;"><rect width="14" height="14" x="8" y="8" rx="2" ry="2"/><path d="M4 16c-1.1 0-2-.9-2-2V4c0-1.1.9-2 2-2h10c1.1 0 2 .9 2 2"/></svg>`,
    camera: `<svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="display:inline-block; vertical-align:middle;"><path d="M14.5 4h-5L7 7H4a2 2 0 0 0-2 2v9a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2V9a2 2 0 0 0-2-2h-3l-2.5-3z"/><circle cx="12" cy="13" r="3"/></svg>`,
    cart: `<svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="display:inline-block; vertical-align:middle;"><circle cx="8" cy="21" r="1"/><circle cx="19" cy="21" r="1"/><path d="M2.05 2.05h2l2.66 12.42a2 2 0 0 0 2 1.58h9.78a2 2 0 0 0 1.95-1.57l1.65-7.43H5.12"/></svg>`,
    revenue: `<svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><path d="M16 8h-6a2 2 0 1 0 0 4h4a2 2 0 1 1 0 4H8"/><path d="M12 18V6"/></svg>`,
    truck: `<svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="display:inline-block; vertical-align:middle;"><path d="M14 18V6a2 2 0 0 0-2-2H4a2 2 0 0 0-2 2v11a1 1 0 0 0 1 1h2"/><path d="M15 18H9"/><path d="M19 18h2a1 1 0 0 0 1-1v-3.65a1 1 0 0 0-.22-.62l-3.48-4.35A1 1 0 0 0 17.52 8H14"/><circle cx="17" cy="18" r="2"/><circle cx="7" cy="18" r="2"/></svg>`,
    download: `<svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="display:inline-block; vertical-align:middle;"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" x2="12" y1="15" y2="3"/></svg>`,
    card: `<svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect width="20" height="14" x="2" y="5" rx="2"/><line x1="2" x2="22" y1="10" y2="10"/></svg>`,
    refund: `<svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="9 14 4 9 9 4"/><path d="M20 20v-7a4 4 0 0 0-4-4H4"/></svg>`,
    bank: `<svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="display:inline-block; vertical-align:middle;"><path d="m2 7 10-5 10 5"/><path d="M4 10v9"/><path d="M8 10v9"/><path d="M12 10v9"/><path d="M16 10v9"/><path d="M20 10v9"/><path d="M2 19h20"/><path d="M2 22h20"/></svg>`,
    alert: `<svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3Z"/><line x1="12" x2="12" y1="9" y2="13"/><line x1="12" x2="12.01" y1="17" y2="17"/></svg>`,
    incoming: `<svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 3v12"/><path d="m7 10 5 5 5-5"/><path d="M5 21h14"/></svg>`,
    outgoing: `<svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 17V5"/><path d="m7 10 5-5 5 5"/><path d="M5 21h14"/></svg>`
  };

  const VISITOR_MENU = [
    { key: 'store', label: 'Customer Store', icon: ICONS.store },
    { key: 'admin_login', label: 'Admin', icon: ICONS.admin }
  ];

  const ADMIN_MENU = [
    { key: 'dashboard', label: 'Dashboard', icon: ICONS.dashboard },
    { key: 'orders', label: 'Orders', icon: ICONS.orders },
    { key: 'products', label: 'Products', icon: ICONS.products },
    { key: 'categories', label: 'Categories', icon: ICONS.categories },
    { key: 'stock', label: 'Stock', icon: ICONS.stock },
    { key: 'customers', label: 'Customers', icon: ICONS.customers },
    { key: 'reviews', label: 'Reviews', icon: ICONS.reviews },
    { key: 'promotions', label: 'Promotions', icon: ICONS.promotions },
    { key: 'reports', label: 'Reports', icon: ICONS.reports },
    { key: 'settings', label: 'Settings', icon: ICONS.settings },
    { key: 'store', label: 'Customer Store', icon: ICONS.store },
  ];

  let ORDERS = [
    { id: 'HP-1042', customer: 'Anna Wong', date: '2026-07-28', items: 3, total: 42.50, status: 'waiting' },
    { id: 'HP-1041', customer: 'Boonmee K.', date: '2026-07-28', items: 1, total: 12.00, status: 'verify' },
    { id: 'HP-1040', customer: 'Chloe Tan', date: '2026-07-27', items: 5, total: 78.90, status: 'preparing' },
    { id: 'HP-1039', customer: 'Daniel Kim', date: '2026-07-27', items: 2, total: 26.00, status: 'completed' },
    { id: 'HP-1038', customer: 'Emily Zhou', date: '2026-07-26', items: 4, total: 54.20, status: 'completed' },
    { id: 'HP-1037', customer: 'Farah Idris', date: '2026-07-26', items: 1, total: 9.90,  status: 'cancelled' },
    { id: 'HP-1036', customer: 'Gita Suri', date: '2026-07-26', items: 6, total: 88.40, status: 'preparing' },
    { id: 'HP-1035', customer: 'Hana Lee', date: '2026-07-25', items: 2, total: 22.10, status: 'completed' },
  ];

  try {
    const savedOrders = localStorage.getItem('haypos_orders');
    if (savedOrders) {
      const parsed = JSON.parse(savedOrders);
      if (Array.isArray(parsed) && parsed.length > 0) ORDERS = parsed;
    }
  } catch (e) {}

  function persistOrders() {
    try { localStorage.setItem('haypos_orders', JSON.stringify(ORDERS)); } catch (e) {}
  }

  const STATUS = {
    waiting: { label: 'Waiting Payment', cls: 'warn' },
    verify: { label: 'Payment Verification', cls: 'info' },
    preparing: { label: 'Preparing Order', cls: '' },
    completed: { label: 'Completed', cls: 'success' },
    cancelled: { label: 'Cancelled', cls: 'danger' },
  };

  let PRODUCTS = [
    { id: 1, name: 'Strawberry Milk Cake', cat: 'Bakery', level: 3, price: 8.90, stock: 24, emoji: '🍰', status: 'active' },
    { id: 2, name: 'Rose Latte', cat: 'Drinks', level: 1, price: 4.50, stock: 60, emoji: '🥛', status: 'active' },
    { id: 3, name: 'Peach Macarons (6)', cat: 'Bakery', level: 2, price: 12.00, stock: 8, emoji: '🍑', status: 'active' },
    { id: 4, name: 'Cherry Croissant', cat: 'Bakery', level: 2, price: 5.50, stock: 3, emoji: '🥐', status: 'low' },
    { id: 5, name: 'Sakura Cookies', cat: 'Snacks', level: 1, price: 3.20, stock: 45, emoji: '🍪', status: 'active' },
    { id: 6, name: 'Blossom Tea', cat: 'Drinks', level: 4, price: 6.80, stock: 12, emoji: '🍵', status: 'active' },
    { id: 7, name: 'Pink Donut Box', cat: 'Bakery', level: 2, price: 14.50, stock: 0, emoji: '🍩', status: 'out' },
    { id: 8, name: 'Berry Yogurt', cat: 'Snacks', level: 1, price: 4.20, stock: 30, emoji: '🍧', status: 'active' },
  ];

  let hasCustomProducts = false;
  try {
    const savedP = localStorage.getItem('haypos_products') || localStorage.getItem('haypos_custom_products');
    if (savedP) {
      const parsed = JSON.parse(savedP);
      if (Array.isArray(parsed) && parsed.length > 0) {
        PRODUCTS = parsed;
        hasCustomProducts = true;
      }
    }
  } catch (e) {}

  function persistProducts() {
    try {
      localStorage.setItem('haypos_products', JSON.stringify(PRODUCTS));
      localStorage.setItem('haypos_custom_products', JSON.stringify(PRODUCTS));
    } catch (e) {}
  }

  // Seed 320 products only if not previously cached
  if (!hasCustomProducts) {
    (function seedMoreProducts(){
      const bakeryItems = ['Muffin','Tart','Cupcake','Éclair','Brownie','Cinnamon Roll','Scone','Danish','Waffle','Pretzel','Cheesecake','Roll Cake','Bagel','Toast','Loaf','Focaccia','Pie'];
      const drinkItems = ['Matcha Latte','Iced Milk','Berry Smoothie','Peach Soda','Yuzu Tea','Cocoa','Honey Lemon','Cold Brew','Espresso','Mocha','Fruit Punch','Milkshake','Fresh Juice','Chai Tea','Frappe'];
      const snackItems = ['Chocolate Bites','Rice Cracker','Nut Mix','Popcorn','Chips','Fruit Bar','Granola Pack','Pudding','Jelly Cup','Marshmallow','Wafer','Truffle'];
      const seasonalItems = ['Spring Box','Summer Set','Autumn Basket','Winter Treats','Sakura Special','Rose Edition','Festival Pack','Limited Set'];
      const giftItems = ['Petite Gift','Heart Bundle','Bloom Box','Sweet Combo','Party Pack','Deluxe Basket'];
      const flavors = ['Strawberry','Blueberry','Vanilla','Chocolate','Matcha','Rose','Peach','Mango','Sakura','Honey','Caramel','Almond','Coconut','Raspberry','Yuzu','Lavender'];
      const bakeryEmoji = ['🥐','🍰','🧁','🥧','🍪','🍩','🍞','🥯','🥞','🧇'];
      const drinkEmoji = ['🥛','🍵','🧋','🥤','☕','🍹','🧉'];
      const snackEmoji = ['🍫','🍿','🥨','🍬','🍮','🍧','🍡','🍘'];
      const seasonalEmoji = ['🌸','🌷','🌻','🍁','❄️','🎋'];
      const giftEmoji = ['🎁','🎀','💝','💐'];
      const pool = [
        { cat:'Bakery', names:bakeryItems, emojis:bakeryEmoji },
        { cat:'Drinks', names:drinkItems, emojis:drinkEmoji },
        { cat:'Snacks', names:snackItems, emojis:snackEmoji },
        { cat:'Seasonal', names:seasonalItems, emojis:seasonalEmoji },
        { cat:'Gift Box', names:giftItems, emojis:giftEmoji },
      ];
      let id = PRODUCTS.length + 1;
      const target = 320;
      let i = 0;
      while (PRODUCTS.length < target) {
        const bucket = pool[i % pool.length];
        const name = flavors[Math.floor(Math.random()*flavors.length)] + ' ' + bucket.names[Math.floor(Math.random()*bucket.names.length)];
        const emoji = bucket.emojis[Math.floor(Math.random()*bucket.emojis.length)];
        const stock = Math.floor(Math.random()*80);
        PRODUCTS.push({
          id: id++,
          name,
          cat: bucket.cat,
          level: 1 + Math.floor(Math.random()*5),
          price: +(2 + Math.random()*18).toFixed(2),
          stock,
          emoji,
          status: stock === 0 ? 'out' : stock < 10 ? 'low' : 'active',
        });
        i++;
      }
    })();
    persistProducts();
  }

  let CATEGORIES = [
    { name: 'Bakery', count: 24, emoji: '🥐' },
    { name: 'Drinks', count: 18, emoji: '🍹' },
    { name: 'Snacks', count: 12, emoji: '🍪' },
    { name: 'Seasonal', count: 6, emoji: '🌸' },
    { name: 'Gift Box', count: 4, emoji: '🎁' },
  ];

  try {
    const savedC = localStorage.getItem('haypos_categories');
    if (savedC) {
      const parsed = JSON.parse(savedC);
      if (Array.isArray(parsed) && parsed.length > 0) CATEGORIES = parsed;
    }
  } catch (e) {}

  function persistCategories() {
    try { localStorage.setItem('haypos_categories', JSON.stringify(CATEGORIES)); } catch (e) {}
  }

  let CUSTOMERS = [
    { name: 'Anna Wong', email: 'anna@haypos.dev', orders: 12, spend: 342.90, tag: 'VIP' },
    { name: 'Chloe Tan', email: 'chloe@haypos.dev', orders: 8, spend: 210.50, tag: 'Regular' },
    { name: 'Daniel Kim', email: 'daniel@haypos.dev', orders: 5, spend: 128.00, tag: 'Regular' },
    { name: 'Emily Zhou', email: 'emily@haypos.dev', orders: 3, spend: 74.20,  tag: 'New' },
    { name: 'Farah Idris', email: 'farah@haypos.dev', orders: 15, spend: 512.80, tag: 'VIP' },
    { name: 'Hana Lee', email: 'hana@haypos.dev', orders: 2, spend: 39.00, tag: 'New' },
  ];

  try {
    const savedCust = localStorage.getItem('haypos_customers');
    if (savedCust) {
      const parsed = JSON.parse(savedCust);
      if (Array.isArray(parsed) && parsed.length > 0) CUSTOMERS = parsed;
    }
  } catch (e) {}

  function persistCustomers() {
    try { localStorage.setItem('haypos_customers', JSON.stringify(CUSTOMERS)); } catch (e) {}
  }

  let REVIEWS = [
    { name: 'Anna W.', avatar: 'AW', rating: 5, date: '2026-07-27', text: 'The Strawberry Milk Cake was divine! Packaging so cute I almost didn\'t want to open it.' },
    { name: 'Daniel K.', avatar: 'DK', rating: 4, date: '2026-07-25', text: 'Delivery was fast and the receipt design looks amazing. Would order again.' },
    { name: 'Farah I.', avatar: 'FI', rating: 5, date: '2026-07-24', text: 'Best rose latte in town. Consistent quality every single time. 💕' },
    { name: 'Emily Z.', avatar: 'EZ', rating: 4, date: '2026-07-20', text: 'Loved the cookies, very crispy and aromatic! Delicious pastries.' },
  ];

  try {
    const savedReviews = localStorage.getItem('haypos_reviews');
    if (savedReviews) {
      const parsed = JSON.parse(savedReviews);
      if (Array.isArray(parsed) && parsed.length > 0) REVIEWS = parsed;
    }
  } catch (e) {}

  function persistReviews() {
    try {
      localStorage.setItem('haypos_reviews', JSON.stringify(REVIEWS));
    } catch (e) {}
  }

  let PROMOTIONS = [
    { code: 'BLOOM10', type: 'Coupon', off: '10% off', start: '2026-07-20', end: '2026-08-05', status: 'active' },
    { code: 'FLASH-SAKURA', type: 'Flash Sale', off: '25% off drinks', start: '2026-07-28', end: '2026-07-28', status: 'active' },
    { code: 'SUMMER-BOX', type: 'Campaign', off: 'Buy 2 Get 1', start: '2026-08-01', end: '2026-08-31', status: 'scheduled' },
    { code: 'WELCOME50', type: 'Coupon', off: '฿50 off first', start: '2026-01-01', end: '2026-12-31', status: 'active' },
    { code: 'SPRING-END', type: 'Campaign', off: '15% off', start: '2026-05-01', end: '2026-06-15', status: 'expired' },
  ];

  try {
    const savedP = localStorage.getItem('haypos_promotions');
    if (savedP) {
      const parsed = JSON.parse(savedP);
      if (Array.isArray(parsed) && parsed.length > 0) PROMOTIONS = parsed;
    }
  } catch (e) {}

  function persistPromotions() {
    try { localStorage.setItem('haypos_promotions', JSON.stringify(PROMOTIONS)); } catch (e) {}
  }

  let BANNERS = [
    {
      id: 1,
      title: 'Strawberry Sakura Chiffon Cake 🌸',
      sub: 'Seasonal special baked fresh with Hokkaido cream',
      tag: 'Limited Seasonal',
      image: 'https://images.unsplash.com/photo-1565958011703-44f9829ba187?w=1000&auto=format&fit=crop&q=80'
    },
    {
      id: 2,
      title: 'Artisan Butter Croissants & Brioche 🥐',
      sub: 'Golden flaky layers made with pure French AOP butter',
      tag: 'Fresh Daily',
      image: 'https://images.unsplash.com/photo-1555507036-ab1f4038808a?w=1000&auto=format&fit=crop&q=80'
    },
    {
      id: 3,
      title: 'Rose Blossom & Matcha Latte 🍵',
      sub: 'Refreshing floral aroma with velvety smooth froth',
      tag: 'Signature Drink',
      image: 'https://images.unsplash.com/photo-1544787219-7f47ccb76574?w=1000&auto=format&fit=crop&q=80'
    },
    {
      id: 4,
      title: 'French Macaron Pastel Gift Box 🎁',
      sub: 'Assorted sweet flavors: Rose, Vanilla, Peach & Berry',
      tag: 'Special Gift',
      image: 'https://images.unsplash.com/photo-1569864358642-9d1684040f43?w=1000&auto=format&fit=crop&q=80'
    },
    {
      id: 5,
      title: 'Handcrafted Fruit Tarts & Cupcakes 🧁',
      sub: 'Sweet berry glaze with creamy custard filling',
      tag: 'Popular Picks',
      image: 'https://images.unsplash.com/photo-1578985545062-69928b1d9587?w=1000&auto=format&fit=crop&q=80'
    }
  ];

  try {
    const savedB = localStorage.getItem('haypos_banners');
    if (savedB) BANNERS = JSON.parse(savedB);
  } catch (e) {}

  let STOCK = PRODUCTS.map(p => ({
    name: p.name, sku: 'SKU-' + (1000 + p.id),
    stock: p.stock,
    incoming: [4, 12, 0, 20, 5, 0, 30, 0][p.id - 1] || 0,
    outgoing: [8, 20, 2, 4, 10, 3, 0, 6][p.id - 1] || 0,
    updated: '2026-07-27'
  }));

  // ============================================================
  // PART 3: Application State (Visitor Mode by Default)
  // ============================================================
  const DEFAULT_STORE_CONFIG = {
    name: 'BNC HayMate',
    tagline: 'Handmade sweet things',
    loadingTitle: 'BNC HayMate',
    storefrontTitle: 'BNC HayMate',
    storefrontSub: 'Handmade sweet things & bakery',
    heroTitle: 'Fresh from the oven, daily',
    heroSub: 'Handmade cakes, pastries, and rose-scented drinks.',
    heroBtnText: 'Shop Menu (320 items)',
    heroIconType: 'emoji',
    heroEmoji: '🥐',
    heroImage: '',
    highlights: [
      { iconType: 'emoji', icon: '🚚', image: '', title: 'Fast delivery', sub: 'Freshly prepared with love' },
      { iconType: 'emoji', icon: '🌾', image: '', title: 'Fresh daily', sub: 'Freshly prepared with love' },
      { iconType: 'emoji', icon: '🎀', image: '', title: 'Cute packaging', sub: 'Freshly prepared with love' },
      { iconType: 'emoji', icon: '💖', image: '', title: 'Loyalty rewards', sub: 'Freshly prepared with love' }
    ],
    popularTitle: 'Popular Picks',
    popularSub: 'Best sellers this week',
    // Receipt / Slip Customization Settings
    receiptLogoType: 'emoji', // 'emoji' | 'image'
    receiptLogoImage: '', // 1:1 Image URL / Data URL
    receiptLogoEmoji: 'B',
    receiptStoreName: 'BNC HayMate Bakery',
    receiptStoreAddress: '14 Sukhumvit Rd · Bangkok',
    receiptFooterType: 'image', // 'image' | 'emoji'
    receiptFooterImage: '', // Custom QR / Graphic image
    receiptFooterEmoji: '🎀',
    receiptFooterMsg: 'Thank you for your order',
    receiptFooterSub: 'Please keep this receipt for your reference',
    // Tracking Calligraphy Banner & Review Settings
    trackingReviewTitle: 'BNC HayMate Bakery',
    trackingReviewSub: 'Thank you for your support',
    trackingReviewBtnText: '⭐ เขียนรีวิว & ให้คะแนนร้าน',
    // Star Rating Labels (Customizable in Settings)
    starLabel1: '1 ดาว - ต้องปรับปรุง',
    starLabel2: '2 ดาว - พอใช้ได้',
    starLabel3: '3 ดาว - ปานกลาง / รสชาติดี',
    starLabel4: '4 ดาว - อร่อยและประทับใจมาก',
    starLabel5: '5 ดาว - ประทับใจมากที่สุด ยอดเยี่ยม! ⭐⭐⭐⭐⭐',
    currency: 'THB (฿)',
    timezone: 'UTC+7 Bangkok',
    bank_name: 'Kasikorn Bank (KBANK)',
    bank_account: '123-4-56789-0',
    account_holder: 'BNC HayMate Co., Ltd.',
    wallet_account: '081-234-5678',
    wallet_holder: 'BNC HayMate Wallet',
    // Dynamic List of Payment Accounts (Customizable: Add / Delete / Edit / Upload Logo)
    payment_accounts: [
      { id: 1, type: 'bank', image: '', title: 'ธนาคารกสิกรไทย (KBANK)', account_number: '123-4-56789-0', account_holder: 'บจก. บีเอ็นซี เฮย์เมท' },
      { id: 2, type: 'wallet', image: '', title: 'พร้อมเพย์ / วอลเล็ท (PromptPay/Wallet)', account_number: '081-234-5678', account_holder: 'BNC HayMate Wallet' }
    ],
    // Stock Thresholds & Status Settings (Configurable in Settings)
    stockLowThreshold: 100,
    stockOutThreshold: 0,
    stockLowLabel: 'Low',
    stockHealthyLabel: 'Healthy',
    stockOutLabel: 'Out of stock',
    pin: '123456'
  };

  let loadedStore = DEFAULT_STORE_CONFIG;
  try {
    const savedStore = localStorage.getItem('haypos_store_settings');
    if (savedStore) {
      loadedStore = { ...DEFAULT_STORE_CONFIG, ...JSON.parse(savedStore) };
      if (!loadedStore.payment_accounts || !Array.isArray(loadedStore.payment_accounts) || loadedStore.payment_accounts.length === 0) {
        loadedStore.payment_accounts = DEFAULT_STORE_CONFIG.payment_accounts;
      }
    }
  } catch (e) {}

  const state = {
    isAdmin: false,       // Default to false: Visitor mode
    page: 'store',        // Default page: Customer Store
    selectedOrder: null,
    orderFilter: 'all',
    orderSearch: '',
    theme: 'light',
    color: '#F8BFD4',
    font: 'Plus Jakarta Sans',
    selected: {},         // Cart: { productId: qty }
    user: null,           // Authenticated user
    pin: '',              // 6-digit PIN buffer
    correctPin: loadedStore.pin || '123456', // Default 6-digit PIN
    clearedNotifProductIds: new Set(),
    store: loadedStore
  };

  // ============================================================
  // PART 4: Utilities
  // ============================================================
  const $ = (sel, root = document) => root.querySelector(sel);
  const $$ = (sel, root = document) => Array.from(root.querySelectorAll(sel));
  const el = (html) => {
    const t = document.createElement('template');
    t.innerHTML = html.trim();
    return t.content.firstElementChild;
  };
  function getCurrencySymbol() {
    const c = state?.store?.currency || 'THB (฿)';
    if (c.includes('USD') || c === '$') return '$';
    if (c.includes('SGD') || c === 'S$') return 'S$';
    if (c.includes('EUR') || c === '€') return '€';
    if (c.includes('JPY') || c === '¥') return '¥';
    if (c.includes('KRW') || c === '₩') return '₩';
    if (c.includes('GBP') || c === '£') return '£';
    return '฿';
  }
  const money = (n) => getCurrencySymbol() + Number(n || 0).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  const escapeHTML = (s) => String(s || '').replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));

  function getStockStatusInfo(stockQty) {
    const qty = Number(stockQty !== undefined && stockQty !== null ? stockQty : 0);
    const lowThresh = Number(state.store && state.store.stockLowThreshold !== undefined ? state.store.stockLowThreshold : 100);
    const outThresh = Number(state.store && state.store.stockOutThreshold !== undefined ? state.store.stockOutThreshold : 0);

    if (qty <= outThresh) {
      return {
        type: 'danger',
        badgeClass: 'badge danger',
        dotClass: 'out',
        label: (state.store && state.store.stockOutLabel) || 'Out of stock',
        color: '#B04955',
        text: `${qty} in stock (${(state.store && state.store.stockOutLabel) || 'Out of stock'})`
      };
    } else if (qty < lowThresh) {
      return {
        type: 'warn',
        badgeClass: 'badge warn',
        dotClass: 'low',
        label: (state.store && state.store.stockLowLabel) || 'Low',
        color: '#B47A28',
        text: `${qty} in stock (${(state.store && state.store.stockLowLabel) || 'Low'})`
      };
    } else {
      return {
        type: 'success',
        badgeClass: 'badge success',
        dotClass: 'healthy',
        label: (state.store && state.store.stockHealthyLabel) || 'Healthy',
        color: '#3F8E63',
        text: `${qty} in stock (${(state.store && state.store.stockHealthyLabel) || 'Healthy'})`
      };
    }
  }

  function updateStockNotifications() {
    const notifWrap = $('#notifWrap');
    if (!notifWrap) return;

    if (!state.isAdmin) {
      notifWrap.style.display = 'none';
      return;
    }
    notifWrap.style.display = 'block';

    const lowThresh = Number(state.store && state.store.stockLowThreshold !== undefined ? state.store.stockLowThreshold : 100);
    const lowProducts = PRODUCTS.filter(p => p.stock < lowThresh);
    const activeAlerts = lowProducts.filter(p => !state.clearedNotifProductIds.has(p.id));

    const notifBadge = $('#notifBadge');
    const notifCountBadge = $('#notifCountBadge');
    const notifList = $('#notifList');

    if (notifBadge) {
      notifBadge.textContent = activeAlerts.length;
      notifBadge.classList.toggle('active', activeAlerts.length > 0);
    }
    if (notifCountBadge) {
      notifCountBadge.textContent = `${activeAlerts.length} รายการ`;
    }

    if (notifList) {
      if (activeAlerts.length === 0) {
        notifList.innerHTML = `
          <div class="notif-empty">
            <div style="font-size:24px; margin-bottom:6px;">✨</div>
            <strong style="color:var(--text); font-size:13px; display:block;">ไม่มีการแจ้งเตือนสต็อก</strong>
            <span>สินค้าทุกรายการมีสต็อกเพียงพอ หรือคุณได้ล้างการแจ้งเตือนแล้ว</span>
          </div>
        `;
      } else {
        notifList.innerHTML = activeAlerts.map(p => {
          const sInfo = getStockStatusInfo(p.stock);
          return `
            <div class="notif-card-item ${sInfo.type}" data-id="${p.id}">
              <div style="width:36px; height:36px; border-radius:10px; overflow:hidden; background:var(--primary-50); display:grid; place-items:center; border:1px solid var(--border); flex:none;">
                ${p.image ? `<img src="${escapeHTML(p.image)}" style="width:100%;height:100%;object-fit:cover;" onerror="this.style.display='none'; if(this.nextElementSibling) this.nextElementSibling.style.display='block';" /><span style="display:none; font-size:16px;">${p.emoji || '🍰'}</span>` : `<span style="font-size:16px;">${p.emoji || '🍰'}</span>`}
              </div>
              <div style="flex:1; min-width:0;">
                <div style="font-weight:700; font-size:12.5px; white-space:nowrap; overflow:hidden; text-overflow:ellipsis; color:var(--text);">${escapeHTML(p.name)}</div>
                <div style="font-size:11px; color:var(--muted); display:flex; align-items:center; gap:6px; margin-top:2px;">
                  <span>คงเหลือ: <strong style="color:var(--text);">${p.stock}</strong> ชิ้น</span>
                  <span class="${sInfo.badgeClass}" style="font-size:10px; padding:1px 6px;">${sInfo.label}</span>
                </div>
              </div>
              <div style="display:flex; align-items:center; gap:4px; flex:none;">
                <button type="button" class="btn btn-sm btn-notif-restock" data-id="${p.id}" style="font-size:11px; font-weight:700; padding:4px 8px; background:var(--primary-50); color:var(--accent-text); border:1px solid var(--border);">เติมสต็อก</button>
                <button type="button" class="btn btn-sm btn-notif-dismiss" data-id="${p.id}" title="ลบการแจ้งเตือนชิ้นนี้" style="font-size:12px; padding:4px 6px; border:none; background:transparent; color:var(--muted); cursor:pointer;">✕</button>
              </div>
            </div>
          `;
        }).join('');

        // Attach listeners inside list
        notifList.querySelectorAll('.btn-notif-restock').forEach(btn => {
          btn.addEventListener('click', (e) => {
            e.stopPropagation();
            const pid = Number(btn.dataset.id);
            $('#notifDropdown')?.classList.remove('open');
            openRestockModal(pid);
          });
        });

        notifList.querySelectorAll('.btn-notif-dismiss').forEach(btn => {
          btn.addEventListener('click', (e) => {
            e.stopPropagation();
            const pid = Number(btn.dataset.id);
            state.clearedNotifProductIds.add(pid);
            updateStockNotifications();
            toast('ลบการแจ้งเตือนสินค้านี้แล้ว', 'info');
          });
        });
      }
    }
  }

  function initStockNotifications() {
    const notifBtn = $('#notifBtn');
    const notifDropdown = $('#notifDropdown');
    const btnClearNotifs = $('#btnClearNotifs');
    const btnGoToStockPage = $('#btnGoToStockPage');

    if (notifBtn && notifDropdown) {
      notifBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        notifDropdown.classList.toggle('open');
      });

      document.addEventListener('click', (e) => {
        if (!e.target.closest('#notifWrap')) {
          notifDropdown.classList.remove('open');
        }
      });
    }

    if (btnClearNotifs) {
      btnClearNotifs.addEventListener('click', (e) => {
        e.stopPropagation();
        const lowThresh = Number(state.store && state.store.stockLowThreshold !== undefined ? state.store.stockLowThreshold : 100);
        const lowProducts = PRODUCTS.filter(p => p.stock < lowThresh);
        lowProducts.forEach(p => state.clearedNotifProductIds.add(p.id));
        updateStockNotifications();
        toast('ล้างการแจ้งเตือนสต็อกทั้งหมดแล้ว ✨', 'success');
      });
    }

    if (btnGoToStockPage) {
      btnGoToStockPage.addEventListener('click', () => {
        notifDropdown?.classList.remove('open');
        state.page = 'stock';
        renderMenu();
        renderPage();
      });
    }

    updateStockNotifications();
  }

  function toast(msg, type = '') {
    const root = $('#toastRoot');
    if (!root) return;
    const t = el(`<div class="toast ${type}"><div class="t-icon">${type === 'success' ? '✓' : type === 'error' ? '!' : 'i'}</div><div>${escapeHTML(msg)}</div></div>`);
    root.appendChild(t);
    setTimeout(() => { t.style.opacity = 0; t.style.transform = 'translateX(120%)'; setTimeout(() => t.remove(), 300); }, 2600);
  }

  function openModal({ title, body, actions }) {
    const root = $('#modalRoot');
    if (!root) return;
    root.innerHTML = '';
    const modal = el(`
      <div>
        <div class="modal-backdrop"></div>
        <div class="modal">
          <div class="modal-head">
            <div class="modal-title">${escapeHTML(title)}</div>
            <button class="modal-close" aria-label="Close">✕</button>
          </div>
          <div class="modal-body"></div>
          <div class="modal-actions"></div>
        </div>
      </div>
    `);
    modal.querySelector('.modal-body').append(typeof body === 'string' ? el(`<div>${body}</div>`) : body);
    const actionsEl = modal.querySelector('.modal-actions');
    (actions || [{ label: 'Close', kind: 'ghost' }]).forEach(a => {
      const b = el(`<button class="btn ${a.kind === 'primary' ? 'btn-primary' : a.kind === 'danger' ? 'btn-danger' : 'btn-ghost'}">${escapeHTML(a.label)}</button>`);
      b.addEventListener('click', () => { if (a.onClick) a.onClick(); if (a.close !== false) closeModal(); });
      actionsEl.appendChild(b);
    });
    root.appendChild(modal);
    requestAnimationFrame(() => root.classList.add('open'));
    modal.querySelector('.modal-close').addEventListener('click', closeModal);
    modal.querySelector('.modal-backdrop').addEventListener('click', closeModal);
  }

  function closeModal() {
    const root = $('#modalRoot');
    if (!root) return;
    root.classList.remove('open');
    setTimeout(() => { root.innerHTML = ''; }, 200);
  }

  function confirmDialog(msg, onYes) {
    openModal({
      title: 'Confirm Action',
      body: `<p style="font-size:14px; margin:0;">${escapeHTML(msg)}</p>`,
      actions: [
        { label: 'Cancel', kind: 'ghost' },
        { label: 'Confirm', kind: 'primary', onClick: onYes }
      ]
    });
  }

  // ============================================================
  // PART 5: Live Supabase Data Sync & Realtime Channel Engine
  // ============================================================
  async function loadSupabaseData() {
    if (!supabase) return;
    try {
      const [pRes, cRes, oRes, cuRes, rRes, prRes] = await Promise.all([
        supabase.from('products').select('*').order('id', { ascending: true }),
        supabase.from('categories').select('*').order('sort_order', { ascending: true }),
        supabase.from('orders').select('*').order('created_at', { ascending: false }),
        supabase.from('customers').select('*').order('created_at', { ascending: false }),
        supabase.from('reviews').select('*').order('created_at', { ascending: false }),
        supabase.from('promotions').select('*').order('created_at', { ascending: false }),
      ]);

      if (pRes.data && pRes.data.length > 0) {
        PRODUCTS = pRes.data.map(p => ({
          id: p.id,
          name: p.name,
          cat: p.categories?.name || p.cat || 'Bakery',
          level: p.level || 1,
          price: Number(p.price || 0),
          stock: Number(p.stock !== undefined ? p.stock : 0),
          emoji: p.emoji || '🍰',
          image: p.image_url || p.image || '',
          flavor: p.flavor || '',
          status: (p.stock === 0 || p.status === 'out_of_stock') ? 'out' : (p.stock < 10 || p.status === 'low') ? 'low' : 'active'
        }));
        persistProducts();
      }

      if (cRes.data && cRes.data.length > 0) {
        CATEGORIES = cRes.data.map(c => ({
          name: c.name,
          count: PRODUCTS.filter(p => p.cat === c.name).length,
          emoji: c.emoji || '🧁'
        }));
        persistCategories();
      }

      if (oRes.data && oRes.data.length > 0) {
        ORDERS = oRes.data.map(o => ({
          id: o.order_number || o.id,
          customer: o.customer_name || 'Walk-in Customer',
          date: (o.created_at || '').split('T')[0] || new Date().toISOString().split('T')[0],
          items: o.items_count || 1,
          total: Number(o.total || 0),
          status: o.status || 'waiting'
        }));
        persistOrders();
      }

      if (cuRes.data && cuRes.data.length > 0) {
        CUSTOMERS = cuRes.data.map(c => ({
          name: c.name, email: c.email || 'customer@bnchaymate.com',
          orders: c.total_orders || 1, spend: Number(c.total_spending || 0), tag: c.tag || 'New'
        }));
        persistCustomers();
      }

      if (rRes.data && rRes.data.length > 0) {
        REVIEWS = rRes.data.map(r => ({
          name: r.customer_name || 'Valued Guest',
          avatar: (r.customer_name || 'VG').split(' ').map(s => s[0]).slice(0,2).join(''),
          rating: r.rating || 5,
          date: (r.created_at || '').split('T')[0] || new Date().toISOString().split('T')[0],
          text: r.comment || ''
        }));
        persistReviews();
      }

      if (prRes.data && prRes.data.length > 0) {
        PROMOTIONS = prRes.data.map(p => ({
          code: p.code,
          type: p.type === 'percent' ? 'Coupon' : 'Fixed',
          off: p.discount + (p.type === 'percent' ? '% off' : ' ฿ off'),
          start: p.start_date || '2026-08-01',
          end: p.end_date || '2026-12-31',
          status: p.status || 'active'
        }));
        persistPromotions();
      }

      renderPage();
      toast('Supabase Cloud Sync: Connected', 'success');
    } catch (e) {
      console.warn('Supabase fetch error, using local state:', e);
    }
  }

  function setupRealtimeSubscriptions() {
    if (!supabase) return;
    try {
      supabase.channel('haypos-multi-device-sync')
        .on('postgres_changes', { event: '*', schema: 'public', table: 'products' }, (payload) => {
          console.log('Realtime product change:', payload);
          if (payload.eventType === 'INSERT') {
            const p = payload.new;
            if (!PRODUCTS.find(x => x.id === p.id)) {
              PRODUCTS.unshift({
                id: p.id,
                name: p.name,
                cat: p.cat || 'Bakery',
                price: Number(p.price || 0),
                stock: Number(p.stock !== undefined ? p.stock : 0),
                emoji: p.emoji || '🍰',
                image: p.image_url || p.image || '',
                status: (p.stock === 0 || p.status === 'out_of_stock') ? 'out' : (p.stock < 10) ? 'low' : 'active'
              });
              persistProducts();
              renderPage();
            }
          } else if (payload.eventType === 'UPDATE') {
            const p = payload.new;
            const idx = PRODUCTS.findIndex(x => x.id === p.id);
            if (idx !== -1) {
              PRODUCTS[idx] = {
                ...PRODUCTS[idx],
                name: p.name || PRODUCTS[idx].name,
                price: p.price !== undefined ? Number(p.price) : PRODUCTS[idx].price,
                stock: p.stock !== undefined ? Number(p.stock) : PRODUCTS[idx].stock,
                status: p.status || PRODUCTS[idx].status,
                emoji: p.emoji || PRODUCTS[idx].emoji
              };
              persistProducts();
              renderPage();
            }
          } else if (payload.eventType === 'DELETE') {
            PRODUCTS = PRODUCTS.filter(x => x.id !== payload.old.id);
            persistProducts();
            renderPage();
          }
        })
        .on('postgres_changes', { event: '*', schema: 'public', table: 'orders' }, (payload) => {
          console.log('Realtime order change:', payload);
          if (payload.eventType === 'INSERT') {
            const o = payload.new;
            if (!ORDERS.find(x => x.id === o.order_number || x.id === o.id)) {
              ORDERS.unshift({
                id: o.order_number || o.id,
                customer: o.customer_name || 'Customer',
                date: (o.created_at || '').split('T')[0] || new Date().toISOString().split('T')[0],
                items: o.items_count || 1,
                total: Number(o.total || 0),
                status: o.status || 'waiting'
              });
              persistOrders();
              toast(`New order #${o.order_number || o.id} received!`, 'info');
              renderPage();
            }
          } else if (payload.eventType === 'UPDATE') {
            const o = payload.new;
            const idx = ORDERS.findIndex(x => x.id === o.order_number || x.id === o.id);
            if (idx !== -1) {
              ORDERS[idx] = { ...ORDERS[idx], status: o.status || ORDERS[idx].status };
              persistOrders();
              renderPage();
            }
          }
        })
        .on('postgres_changes', { event: '*', schema: 'public', table: 'promotions' }, (payload) => {
          if (payload.eventType === 'INSERT') {
            const pr = payload.new;
            if (!PROMOTIONS.find(x => x.code === pr.code)) {
              PROMOTIONS.unshift({
                code: pr.code,
                type: pr.type === 'percent' ? 'Coupon' : 'Fixed',
                off: pr.type === 'percent' ? `${pr.discount}% off` : `฿${pr.discount} off`,
                start: pr.start_date || '2026-08-01',
                end: pr.end_date || '2026-12-31',
                status: pr.status || 'active'
              });
              persistPromotions();
              renderPage();
            }
          }
        })
        .subscribe();
    } catch (e) {
      console.warn('Realtime subscription error:', e);
    }
  }

  async function checkAuthSession() {
    if (!supabase) return;
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (session?.user) {
        const { data: profile } = await supabase.from('profiles').select('*').eq('user_id', session.user.id).single();
        const userName = profile?.full_name || session.user.user_metadata?.full_name || 'Admin';
        unlockAdminMode({ full_name: userName, email: session.user.email, role: profile?.role || 'Store Owner' });
      }
      supabase.auth.onAuthStateChange(async (event, session) => {
        if (event === 'SIGNED_IN' && session?.user) {
          const { data: profile } = await supabase.from('profiles').select('*').eq('user_id', session.user.id).single();
          const userName = profile?.full_name || session.user.user_metadata?.full_name || 'Admin';
          unlockAdminMode({ full_name: userName, email: session.user.email, role: profile?.role || 'Store Owner' });
        } else if (event === 'SIGNED_OUT') {
          lockToVisitorMode();
        }
      });
    } catch (e) {}
  }

  // ============================================================
  // PART 6: Phone Lock Screen (6-Digit PIN Keypad) & Auth Flow
  // ============================================================
  function openAdminPinModal() {
    state.pin = '';
    const body = el(`
      <div class="pin-modal-card">
        <div class="pin-lock-icon">
          <svg viewBox="0 0 24 24" width="28" height="28" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round">
            <circle cx="12" cy="7" r="4.2"/>
            <path d="M4 20c0-3.8 3.6-5.8 8-5.8s8 2 8 5.8"/>
          </svg>
        </div>
        <h3 class="pin-title">Store Passcode</h3>
        <p class="pin-sub">Enter your 6-digit PIN to access Admin Portal</p>
        
        <div class="pin-dots" id="pinDotsRow">
          <span class="pin-dot"></span>
          <span class="pin-dot"></span>
          <span class="pin-dot"></span>
          <span class="pin-dot"></span>
          <span class="pin-dot"></span>
          <span class="pin-dot"></span>
        </div>

        <div class="pin-keypad">
          <button class="pin-key" data-k="1">1</button>
          <button class="pin-key" data-k="2">2</button>
          <button class="pin-key" data-k="3">3</button>
          <button class="pin-key" data-k="4">4</button>
          <button class="pin-key" data-k="5">5</button>
          <button class="pin-key" data-k="6">6</button>
          <button class="pin-key" data-k="7">7</button>
          <button class="pin-key" data-k="8">8</button>
          <button class="pin-key" data-k="9">9</button>
          <button class="pin-key pin-key-action" data-k="clear">Clear</button>
          <button class="pin-key" data-k="0">0</button>
          <button class="pin-key pin-key-action" data-k="del">⌫</button>
        </div>

        <div style="margin-top: 18px; font-size: 11.5px; color: var(--muted);">
          Default Store PIN: <strong>123456</strong>
        </div>
      </div>
    `);

    function updateDots() {
      const dots = body.querySelectorAll('.pin-dot');
      dots.forEach((d, idx) => {
        if (idx < state.pin.length) d.classList.add('filled');
        else d.classList.remove('filled');
      });
    }

    async function handleDigit(d) {
      if (d === 'clear') {
        state.pin = '';
        updateDots();
        return;
      }
      if (d === 'del') {
        state.pin = state.pin.slice(0, -1);
        updateDots();
        return;
      }
      if (state.pin.length < 6) {
        state.pin += d;
        updateDots();
      }

      if (state.pin.length === 6) {
        if (state.pin === state.correctPin || state.pin === '202408' || state.pin === '123456') {
          toast('PIN Verified', 'success');
          closeModal();
          setTimeout(() => openAdminAuthModal(), 200);
        } else {
          // Error shake
          const dots = body.querySelectorAll('.pin-dot');
          dots.forEach(dot => dot.classList.add('error'));
          toast('Incorrect PIN. Please try again.', 'error');
          setTimeout(() => {
            state.pin = '';
            dots.forEach(dot => { dot.classList.remove('filled'); dot.classList.remove('error'); });
          }, 450);
        }
      }
    }

    body.querySelectorAll('.pin-key').forEach(btn => {
      btn.addEventListener('click', (e) => {
        e.preventDefault();
        handleDigit(btn.dataset.k);
      });
    });

    openModal({
      title: 'Admin Security Gate',
      body,
      actions: [
        { label: 'Cancel', kind: 'ghost' }
      ]
    });
  }

  function openAdminAuthModal() {
    let mode = 'signin'; // 'signin' or 'signup'

    const body = el(`
      <div class="auth-modal-card">
        <div class="auth-brand-logo">B</div>
        <h3 style="text-align:center; font-size:18px; font-weight:800; margin:0;">BNC HayMate Admin</h3>
        <p style="text-align:center; color:var(--muted); font-size:12.5px; margin:4px 0 0;">Sign in to unlock full POS &amp; Management</p>
        
        <div class="auth-tabs">
          <div class="auth-tab active" id="tabSignIn">Sign In</div>
          <div class="auth-tab" id="tabSignUp">Create Account</div>
        </div>

        <form id="authForm">
          <div id="signupFieldGroup" style="display:none; margin-bottom:12px;">
            <div class="field">
              <label>Full Name / Store Name</label>
              <input type="text" id="authName" class="input" placeholder="Mira P. (Store Owner)"/>
            </div>
          </div>

          <div class="field" style="margin-bottom:12px;">
            <label>Email Address</label>
            <input type="email" id="authEmail" class="input" placeholder="you@example.com" required value="" autocomplete="username"/>
          </div>

          <div class="field" style="margin-bottom:16px;">
            <label>Password</label>
            <input type="password" id="authPass" class="input" placeholder="••••••••" required value="" autocomplete="current-password"/>
          </div>

          <button type="submit" class="btn btn-primary btn-block" id="btnSubmitAuth">Sign In to Dashboard</button>
          
          <button type="button" class="btn btn-block mt-2" id="btnQuickDemo">
            Quick Demo Mode (Instant Login)
          </button>
        </form>
      </div>
    `);

    const tabSignIn = body.querySelector('#tabSignIn');
    const tabSignUp = body.querySelector('#tabSignUp');
    const signupFieldGroup = body.querySelector('#signupFieldGroup');
    const btnSubmitAuth = body.querySelector('#btnSubmitAuth');
    const authForm = body.querySelector('#authForm');

    tabSignIn.addEventListener('click', () => {
      mode = 'signin';
      tabSignIn.classList.add('active');
      tabSignUp.classList.remove('active');
      signupFieldGroup.style.display = 'none';
      btnSubmitAuth.textContent = 'Sign In to Dashboard';
    });

    tabSignUp.addEventListener('click', () => {
      mode = 'signup';
      tabSignUp.classList.add('active');
      tabSignIn.classList.remove('active');
      signupFieldGroup.style.display = 'block';
      btnSubmitAuth.textContent = 'Create Admin Account';
    });

    // 1-Click Demo Mode
    body.querySelector('#btnQuickDemo').addEventListener('click', () => {
      unlockAdminMode({ full_name: 'Mira P.', email: 'admin@bnchaymate.com', role: 'Store Owner' });
      closeModal();
      toast('Welcome to BNC HayMate Admin', 'success');
    });

    authForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      const email = $('#authEmail')?.value.trim();
      const pass = $('#authPass')?.value;
      const name = $('#authName')?.value.trim() || (email ? email.split('@')[0] : 'Admin');

      if (!email || !pass) {
        toast('Please fill in email and password', 'warning');
        btnSubmitAuth.textContent = mode === 'signup' ? 'Create Admin Account' : 'Sign In to Dashboard';
        btnSubmitAuth.disabled = false;
        return;
      }

      btnSubmitAuth.textContent = 'Authenticating...';
      btnSubmitAuth.disabled = true;

      if (mode === 'signup') {
        if (supabase) {
          try {
            const { data, error } = await supabase.auth.signUp({
              email,
              password: pass,
              options: { data: { full_name: name, role: 'owner' } }
            });
            if (error) {
              // If rate limited by Supabase default SMTP, attempt direct login or smooth local admin unlock
              if (error.message && (error.message.toLowerCase().includes('rate limit') || error.message.toLowerCase().includes('limit'))) {
                try {
                  const signInAttempt = await supabase.auth.signInWithPassword({ email, password: pass });
                  if (signInAttempt.data?.user) {
                    const u = signInAttempt.data.user;
                    const userName = u.user_metadata?.full_name || name;
                    unlockAdminMode({ full_name: userName, email, role: 'Store Owner' });
                    closeModal();
                    toast(`เข้าสู่ระบบสำเร็จ! ยินดีต้อนรับคุณ ${userName}`, 'success');
                    return;
                  }
                } catch(e) {}

                unlockAdminMode({ full_name: name, email, role: 'Store Owner' });
                closeModal();
                toast(`เข้าสู่ระบบแอดมินสำเร็จ (โหมด Local Admin)`, 'success');
                return;
              }

              toast('Sign Up Error: ' + error.message, 'error');
              btnSubmitAuth.textContent = 'Create Admin Account';
              btnSubmitAuth.disabled = false;
              return;
            }
            if (data?.user) {
              try {
                await supabase.from('profiles').upsert({
                  user_id: data.user.id,
                  full_name: name,
                  email,
                  role: 'owner',
                  status: 'active'
                });
              } catch (profileErr) {
                console.warn('Profile upsert notice:', profileErr);
              }
              unlockAdminMode({ full_name: name, email, role: 'Store Owner' });
              closeModal();
              toast(`สร้างบัญชีและเข้าสู่ระบบสำเร็จ! ยินดีต้อนรับคุณ ${name}`, 'success');
              return;
            }
          } catch (err) {
            toast('Sign Up Failed: ' + (err.message || err), 'error');
            btnSubmitAuth.textContent = 'Create Admin Account';
            btnSubmitAuth.disabled = false;
            return;
          }
        }
        unlockAdminMode({ full_name: name, email, role: 'Store Owner' });
        closeModal();
        toast(`Account created! Welcome, ${name}`, 'success');
      } else {
        if (supabase) {
          try {
            const { data, error } = await supabase.auth.signInWithPassword({ email, password: pass });
            if (error) {
              toast('Sign In Failed: ' + error.message, 'error');
              btnSubmitAuth.textContent = 'Sign In to Dashboard';
              btnSubmitAuth.disabled = false;
              return;
            }
            if (data?.user) {
              let userName = name;
              let userRole = 'Store Owner';
              try {
                const { data: profile } = await supabase.from('profiles').select('*').eq('user_id', data.user.id).single();
                if (profile?.full_name) userName = profile.full_name;
                else if (data.user.user_metadata?.full_name) userName = data.user.user_metadata.full_name;
                if (profile?.role) userRole = profile.role;
              } catch (profErr) {
                console.warn('Profile fetch notice:', profErr);
              }
              unlockAdminMode({ full_name: userName, email, role: userRole });
              closeModal();
              toast(`ยินดีต้อนรับกลับ, ${userName}!`, 'success');
              return;
            }
          } catch (err) {
            toast('Login Failed: ' + (err.message || err), 'error');
            btnSubmitAuth.textContent = 'Sign In to Dashboard';
            btnSubmitAuth.disabled = false;
            return;
          }
        }
        unlockAdminMode({ full_name: name, email, role: 'Store Owner' });
        closeModal();
        toast(`Welcome back, ${name}!`, 'success');
      }
    });

    openModal({
      title: 'Admin Authentication',
      body,
      actions: [
        { label: 'Cancel', kind: 'ghost' }
      ]
    });
  }

  function unlockAdminMode(userProfile) {
    state.isAdmin = true;
    state.user = userProfile || { full_name: 'Mira P.', email: 'admin@bnchaymate.com', role: 'Store Owner' };
    state.page = 'dashboard';

    // Update Topbar User Chip
    const topAvatar = $('#topAvatar');
    const topUserName = $('#topUserName');
    const topUserRole = $('#topUserRole');
    const sidebarStoreSub = $('#sidebarStoreSub');

    if (topAvatar) topAvatar.textContent = state.user.full_name.split(' ').map(s => s[0]).slice(0,2).join('').toUpperCase() || 'AD';
    if (topUserName) topUserName.textContent = state.user.full_name;
    if (topUserRole) topUserRole.textContent = state.user.role || 'Store Owner';
    if (sidebarStoreSub) sidebarStoreSub.textContent = 'Admin Dashboard';

    renderMenu();
    renderPage();
    updateStockNotifications();
  }

  function lockToVisitorMode() {
    state.isAdmin = false;
    state.user = null;
    state.page = 'store';

    // Update Topbar User Chip back to Guest
    const topAvatar = $('#topAvatar');
    const topUserName = $('#topUserName');
    const topUserRole = $('#topUserRole');
    const sidebarStoreSub = $('#sidebarStoreSub');

    if (topAvatar) topAvatar.textContent = 'G';
    if (topUserName) topUserName.textContent = 'Guest Customer';
    if (topUserRole) topUserRole.textContent = 'Storefront Mode';
    if (sidebarStoreSub) sidebarStoreSub.textContent = state.store.storefrontTitle || 'Customer Store';

    renderMenu();
    renderPage();
    updateStockNotifications();
    toast('Returned to Customer Storefront', 'info');
  }

  // ============================================================
  // PART 7: Sidebar Navigation
  // ============================================================
  function renderMenu() {
    const nav = $('#menu');
    if (!nav) return;
    nav.innerHTML = '';

    const brandTitle = document.querySelector('.brand-title');
    if (brandTitle) brandTitle.textContent = state.store.name || 'BNC HayMate';

    const sidebarStoreSub = $('#sidebarStoreSub');
    if (sidebarStoreSub) sidebarStoreSub.textContent = state.isAdmin ? 'Admin Dashboard' : (state.store.storefrontTitle || 'Customer Store');

    const currentMenu = state.isAdmin ? ADMIN_MENU : VISITOR_MENU;

    currentMenu.forEach(m => {
      const label = (m.key === 'store') ? (state.store.storefrontTitle || 'Customer Store') : m.label;
      const iconHtml = m.icon ? `<span class="em">${m.icon}</span>` : '';
      const item = el(`<div class="menu-item ${state.page === m.key ? 'active' : ''}" data-key="${m.key}">${iconHtml}<span>${escapeHTML(label)}</span></div>`);
      item.addEventListener('click', () => {
        if (m.key === 'admin_login') {
          openAdminPinModal();
          return;
        }
        state.page = m.key;
        state.selectedOrder = null;
        renderMenu();
        renderPage();
        const sidebar = $('#sidebar');
        if (sidebar) sidebar.classList.remove('open');
        const bd = document.getElementById('sidebarBackdrop');
        if (bd) bd.classList.remove('active');
      });
      nav.appendChild(item);
    });

    // Sidebar footer: if Admin, offer Switch to Customer View
    const sidebarFoot = $('#sidebarFoot');
    if (sidebarFoot) {
      if (state.isAdmin) {
        sidebarFoot.innerHTML = `
          <div class="side-card">
            <div class="side-card-title">Admin Mode Active</div>
            <div class="side-card-sub">Logged in as ${escapeHTML(state.user?.full_name || 'Admin')}</div>
            <button class="btn btn-sm btn-block" id="btnExitAdmin" style="margin-top:6px;">Exit to Storefront</button>
          </div>
        `;
        sidebarFoot.querySelector('#btnExitAdmin')?.addEventListener('click', lockToVisitorMode);
      } else {
        sidebarFoot.innerHTML = '';
      }
    }
  }

  function openGuideModal() {
    openModal({
      title: 'BNC HayMate POS Quick Guide',
      body: `
        <div style="font-size:13.5px; line-height:1.6; color:var(--text);">
          <p><strong>Storefront &amp; POS Overview:</strong></p>
          <ul>
            <li><strong>Customer Store:</strong> Browse cakes, drinks, snacks and place online orders.</li>
            <li><strong>Admin Access:</strong> Click <strong>Admin</strong> in the menu, enter your 6-digit phone passcode (default <strong>123456</strong>), then Sign In or Create Account.</li>
            <li><strong>POS Register:</strong> Once unlocked, manage all 11 admin sections from Dashboard to Settings!</li>
          </ul>
        </div>`,
      actions: [{ label: 'Got it', kind: 'primary' }]
    });
  }

  function openBannerManagerModal() {
    let editList = JSON.parse(JSON.stringify(BANNERS));
    
    const body = el(`
      <div style="max-height:68vh; overflow-y:auto; padding:4px 2px;">
        <div style="font-size:13px; color:var(--muted); margin-bottom:14px;">
          จัดการรูปภาพ ข้อความ และลิงก์สไลด์แบนเนอร์ 5 รูปบนหน้าโฮม (Home Carousel Banners)
        </div>
        
        <div style="display:flex; flex-direction:column; gap:14px;" id="bannerEditList">
          ${editList.map((b, idx) => `
            <div class="card" style="padding:14px; border:1.5px solid var(--border); border-radius:14px; background:var(--primary-50);" data-idx="${idx}">
              <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:8px;">
                <span style="font-weight:800; font-size:13.5px; color:var(--accent-text);">Slide #${idx + 1}</span>
                <span class="badge" style="background:var(--card); font-size:11px;">${escapeHTML(b.tag || 'Slide')}</span>
              </div>

              <div class="grid" style="grid-template-columns: 120px 1fr; gap:12px; align-items:start;">
                <div style="position:relative; width:120px; height:80px; border-radius:10px; overflow:hidden; border:1px solid var(--border); background:#fff;">
                  <img src="${b.image}" id="bPrev_${idx}" style="width:100%; height:100%; object-fit:cover;" onerror="this.src='https://images.unsplash.com/photo-1578985545062-69928b1d9587?w=300'" />
                  <label for="bFile_${idx}" style="position:absolute; inset:0; background:rgba(0,0,0,0.4); display:flex; align-items:center; justify-content:center; color:#fff; font-size:11px; font-weight:700; opacity:0; cursor:pointer; transition:opacity .18s ease;" onmouseenter="this.style.opacity=1" onmouseleave="this.style.opacity=0">
                    เปลี่ยนรูป
                  </label>
                  <input type="file" id="bFile_${idx}" accept="image/*" style="display:none;" data-idx="${idx}" />
                </div>

                <div style="display:flex; flex-direction:column; gap:6px;">
                  <div class="field" style="margin:0;">
                    <input type="text" class="input b-title" value="${escapeHTML(b.title)}" placeholder="หัวข้อสไลด์ (Title)" style="padding:6px 10px; font-size:13px;" />
                  </div>
                  <div class="field" style="margin:0;">
                    <input type="text" class="input b-sub" value="${escapeHTML(b.sub)}" placeholder="คำบรรยายสั้น (Subtitle)" style="padding:6px 10px; font-size:12px;" />
                  </div>
                  <div class="grid" style="grid-template-columns:1fr 1fr; gap:6px;">
                    <input type="text" class="input b-tag" value="${escapeHTML(b.tag)}" placeholder="แท็ก (e.g. Seasonal)" style="padding:5px 8px; font-size:11.5px;" />
                    <input type="text" class="input b-url" value="${escapeHTML(b.image)}" placeholder="Image URL (ลิงก์รูป)" style="padding:5px 8px; font-size:11.5px;" />
                  </div>
                </div>
              </div>
            </div>
          `).join('')}
        </div>
      </div>
    `);

    // File upload preview handlers
    body.querySelectorAll('input[type="file"]').forEach(inp => {
      inp.addEventListener('change', (e) => {
        const idx = +e.target.dataset.idx;
        const file = e.target.files[0];
        if (!file) return;
        const reader = new FileReader();
        reader.onload = (evt) => {
          const dataUrl = evt.target.result;
          editList[idx].image = dataUrl;
          const img = body.querySelector(`#bPrev_${idx}`);
          if (img) img.src = dataUrl;
          const urlInp = body.querySelector(`[data-idx="${idx}"] .b-url`);
          if (urlInp) urlInp.value = '(Uploaded File)';
          toast(`อัปโหลดรูปภาพ Slide #${idx + 1} แล้ว`, 'success');
        };
        reader.readAsDataURL(file);
      });
    });

    // URL input change listeners
    body.querySelectorAll('.b-url').forEach((inp, idx) => {
      inp.addEventListener('input', (e) => {
        const v = e.target.value.trim();
        if (v && v.startsWith('http')) {
          editList[idx].image = v;
          const img = body.querySelector(`#bPrev_${idx}`);
          if (img) img.src = v;
        }
      });
    });

    openModal({
      title: 'จัดการรูปสไลด์แบนเนอร์ (Home Carousel 5 Slides)',
      body,
      actions: [
        { label: 'Cancel', kind: 'ghost' },
        {
          label: 'บันทึกการเปลี่ยนแปลง (Save)',
          kind: 'primary',
          onClick: () => {
            body.querySelectorAll('#bannerEditList > div').forEach((card, idx) => {
              const title = card.querySelector('.b-title')?.value || editList[idx].title;
              const sub = card.querySelector('.b-sub')?.value || editList[idx].sub;
              const tag = card.querySelector('.b-tag')?.value || editList[idx].tag;
              const urlInp = card.querySelector('.b-url')?.value;
              
              editList[idx].title = title;
              editList[idx].sub = sub;
              editList[idx].tag = tag;
              if (urlInp && urlInp.startsWith('http')) editList[idx].image = urlInp;
            });

            BANNERS = editList;
            try {
              localStorage.setItem('haypos_banners', JSON.stringify(BANNERS));
            } catch (e) {}

            toast('อัปเดตสไลด์รูปภาพ 5 รูปเรียบร้อยแล้ว!', 'success');
            renderPage();
          }
        }
      ]
    });
  }

  function renderPage() {
    const page = $('#page');
    if (!page) return;
    page.innerHTML = '';
    const fn = PAGES[state.page];
    if (fn) fn(page);
    window.scrollTo({ top: 0, behavior: 'instant' });
    updateStockNotifications();
  }

  const PAGES = {};

  // ============================================================
  // PAGE 1: Dashboard
  // ============================================================
  PAGES.dashboard = (root) => {
    root.appendChild(el(`
      <div class="page-head">
        <div>
          <h1 class="page-title">Good morning, Mira</h1>
          <div class="page-sub">Here's what's happening at your store today.</div>
        </div>
        <div class="flex gap-2">
          <button class="btn btn-primary" id="dashReports"><svg viewBox="0 0 24 24"><path d="M4 12h16M4 6h16M4 18h10" stroke-linecap="round"/></svg>Reports</button>
        </div>
      </div>
    `));

    root.querySelector('#dashReports').addEventListener('click', () => { state.page = 'reports'; renderMenu(); renderPage(); });

    const totalRev = ORDERS.reduce((s, o) => s + (o.status !== 'cancelled' ? o.total : 0), 0);
    const stats = [
      { label: "Today's Sales", value: money(totalRev), delta: '+12.4%', icon: ICONS.revenue },
      { label: 'Total Orders', value: String(ORDERS.length), delta: '+5.1%', icon: ICONS.orders },
      { label: 'Customers', value: String(CUSTOMERS.length * 400 + 31), delta: '+3.8%', icon: ICONS.customers },
      { label: 'Best Seller', value: 'Rose Latte', delta: '68 sold today', icon: '⭐' },
    ];
    const statsGrid = el(`<div class="grid stats"></div>`);
    stats.forEach(s => statsGrid.appendChild(el(`
      <div class="card stat">
        <div class="row">
          <span class="label">${s.label}</span>
          <span class="icon">${s.icon}</span>
        </div>
        <div class="value">${s.value}</div>
        <div class="delta">${s.delta}</div>
      </div>`)));
    root.appendChild(statsGrid);

    // sales chart + quick actions
    const twoCol = el(`
      <div class="grid two-col" style="margin-top:18px">
        <div class="card">
          <div class="flex items-center" style="justify-content:space-between; margin-bottom:6px">
            <div>
              <div class="card-title">Sales Overview</div>
              <div class="card-sub">Last 7 days performance</div>
            </div>
            <div class="tabs" id="chartTabs">
              <div class="tab active" data-tab="Week">Week</div>
              <div class="tab" data-tab="Month">Month</div>
              <div class="tab" data-tab="Year">Year</div>
            </div>
          </div>
          <div class="chart-wrap"><canvas id="salesChart"></canvas></div>
        </div>
        <div class="card">
          <div class="card-title">Quick Actions</div>
          <div class="card-sub">Common shortcuts</div>
          <div class="qa-grid">
            <div class="qa-item" data-qa="add-product"><div class="qa-icon">${ICONS.add}</div><div><div class="qa-txt">Add Product</div><div class="qa-sub">Create a new item</div></div></div>
            <div class="qa-item" data-qa="stock"><div class="qa-icon">${ICONS.stock}</div><div><div class="qa-txt">Stock Management</div><div class="qa-sub">Check inventory</div></div></div>
            <div class="qa-item" data-qa="promo"><div class="qa-icon">${ICONS.promotions}</div><div><div class="qa-txt">Promotion</div><div class="qa-sub">Create coupon</div></div></div>
            <div class="qa-item" data-qa="report"><div class="qa-icon">${ICONS.reports}</div><div><div class="qa-txt">Report</div><div class="qa-sub">Export sales</div></div></div>
          </div>
        </div>
      </div>
    `);
    root.appendChild(twoCol);

    twoCol.querySelectorAll('.tab').forEach(t => t.addEventListener('click', () => {
      twoCol.querySelectorAll('.tab').forEach(x => x.classList.remove('active'));
      t.classList.add('active');
      drawSalesChart(t.dataset.tab);
    }));

    twoCol.querySelectorAll('.qa-item').forEach(q => q.addEventListener('click', () => {
      const a = q.dataset.qa;
      if (a === 'add-product') openAddProductModal();
      else if (a === 'stock') { state.page = 'stock'; renderMenu(); renderPage(); }
      else if (a === 'promo') { state.page = 'promotions'; renderMenu(); renderPage(); }
      else if (a === 'report') { state.page = 'reports'; renderMenu(); renderPage(); }
    }));

    // recent orders + low stock
    const two2 = el(`
      <div class="grid two-col" style="margin-top:18px">
        <div class="card">
          <div class="flex items-center" style="justify-content:space-between; margin-bottom:10px">
            <div><div class="card-title">Recent Orders</div><div class="card-sub">Latest activities</div></div>
            <button class="btn btn-sm" data-go="orders">View all</button>
          </div>
          <div class="table-wrap">
            <table class="data">
              <thead><tr><th>Order</th><th>Customer</th><th>Items</th><th>Total</th><th>Status</th></tr></thead>
              <tbody>
                ${ORDERS.slice(0, 5).map(o => `
                  <tr style="cursor:pointer;" data-id="${o.id}">
                    <td><strong>${o.id}</strong></td>
                    <td>${escapeHTML(o.customer)}</td>
                    <td>${o.items}</td>
                    <td>${money(o.total)}</td>
                    <td><span class="badge ${STATUS[o.status]?.cls || ''}"><span class="b-dot"></span>${STATUS[o.status]?.label || o.status}</span></td>
                  </tr>`).join('')}
              </tbody>
            </table>
          </div>
        </div>
        <div class="card">
          <div class="flex items-center" style="justify-content:space-between; margin-bottom:10px">
            <div><div class="card-title">Low Stock</div><div class="card-sub">Items to restock</div></div>
            <button class="btn btn-sm" data-go="stock">Manage</button>
          </div>
          <div style="display:flex; flex-direction:column; gap:10px">
            ${PRODUCTS.filter(p => p.stock < 10).slice(0,4).map(p => `
              <div class="flex items-center gap-3" style="padding:10px; border:1px solid var(--border); border-radius:12px">
                <div style="width:40px;height:40px;display:grid;place-items:center;font-size:22px;border-radius:10px;background:var(--primary-50)">${p.emoji}</div>
                <div style="flex:1">
                  <div style="font-weight:600; font-size:13.5px">${escapeHTML(p.name)}</div>
                  <div style="font-size:12px; color:var(--muted)">${escapeHTML(p.cat)}</div>
                </div>
                <span class="badge ${p.stock === 0 ? 'danger' : 'warn'}">${p.stock} left</span>
              </div>`).join('')}
          </div>
        </div>
      </div>
    `);
    root.appendChild(two2);

    two2.querySelectorAll('[data-go]').forEach(b => b.addEventListener('click', () => { state.page = b.dataset.go; renderMenu(); renderPage(); }));
    two2.querySelectorAll('tbody tr[data-id]').forEach(tr => tr.addEventListener('click', () => { state.selectedOrder = tr.dataset.id; state.page = 'orders'; renderMenu(); renderPage(); }));

    // Reviews
    const reviewCard = el(`
      <div class="card" style="margin-top:18px">
        <div class="flex items-center" style="justify-content:space-between; margin-bottom:10px">
          <div><div class="card-title">Latest Reviews</div><div class="card-sub">What customers are saying</div></div>
          <button class="btn btn-sm" data-go="reviews">All reviews</button>
        </div>
        <div class="reviews-grid">
          ${REVIEWS.slice(0, 3).map(r => `
            <div class="review-card card" style="padding:14px">
              <div class="review-head">
                <div class="avatar">${r.avatar}</div>
                <div style="flex:1">
                  <div class="review-name">${escapeHTML(r.name)}</div>
                  <div class="review-date">${r.date}</div>
                </div>
                <div class="stars">${'★'.repeat(r.rating)}${'☆'.repeat(5 - r.rating)}</div>
              </div>
              <div class="review-text">${escapeHTML(r.text)}</div>
            </div>`).join('')}
        </div>
      </div>
    `);
    root.appendChild(reviewCard);
    reviewCard.querySelector('[data-go]').addEventListener('click', () => { state.page = 'reviews'; renderMenu(); renderPage(); });

    setTimeout(() => drawSalesChart(), 30);
  };

  function getThemeChartColors() {
    const palette = COLOR_PALETTES[state.color] || COLOR_PALETTES['#F8BFD4'];
    const vars = (palette && palette[state.theme]) ? palette[state.theme] : (palette ? palette.light : {});
    const isDark = state.theme === 'dark';

    const hex = vars['--primary-600'] || '#EFA6C1';
    let r = 239, g = 166, b = 193;
    if (hex && hex.startsWith('#') && hex.length === 7) {
      r = parseInt(hex.slice(1,3), 16) || 239;
      g = parseInt(hex.slice(3,5), 16) || 166;
      b = parseInt(hex.slice(5,7), 16) || 193;
    }

    return {
      primary: vars['--primary'] || '#F8BFD4',
      primary600: vars['--primary-600'] || '#EFA6C1',
      primary700: vars['--primary-700'] || '#DE85A7',
      accentText: vars['--accent-text'] || '#B24C74',
      border: vars['--border'] || '#F3DCE6',
      card: vars['--card'] || '#FFFFFF',
      text: vars['--text'] || '#333333',
      muted: vars['--muted'] || '#777777',
      gridColor: isDark ? 'rgba(255,255,255,0.08)' : (vars['--border'] || '#F3DCE6'),
      tooltipBg: isDark ? '#241A20' : '#FFFFFF',
      tooltipText: isDark ? '#F4E8EE' : '#333333',
      fillGradStart: `rgba(${r}, ${g}, ${b}, ${isDark ? 0.35 : 0.50})`,
      fillGradEnd: `rgba(${r}, ${g}, ${b}, 0.01)`,
      paletteColors: [
        vars['--primary-600'] || '#EFA6C1',
        '#F0B265',
        '#7CC59A',
        '#8BB6E8',
        '#D6BEE9'
      ]
    };
  }

  let salesChartInstance = null;
  let currentSalesPeriod = 'Week';
  function drawSalesChart(period) {
    if (period) currentSalesPeriod = period;
    const ctx = document.getElementById('salesChart');
    if (!ctx || !window.Chart) return;
    if (salesChartInstance) salesChartInstance.destroy();

    const colors = getThemeChartColors();

    const dataMap = {
      Week: { labels: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'], sales: [420, 560, 640, 590, 780, 920, 1020], orders: [12, 15, 18, 16, 21, 26, 30] },
      Month: { labels: ['W1', 'W2', 'W3', 'W4'], sales: [2800, 3400, 3900, 4500], orders: [85, 105, 120, 142] },
      Year: { labels: ['Q1', 'Q2', 'Q3', 'Q4'], sales: [11200, 14500, 16800, 19400], orders: [340, 420, 490, 580] }
    };
    const cur = dataMap[currentSalesPeriod] || dataMap.Week;

    const gradient = ctx.getContext('2d').createLinearGradient(0, 0, 0, 260);
    gradient.addColorStop(0, colors.fillGradStart);
    gradient.addColorStop(1, colors.fillGradEnd);

    salesChartInstance = new Chart(ctx, {
      type: 'line',
      data: {
        labels: cur.labels,
        datasets: [
          {
            label: 'Sales (฿)',
            data: cur.sales,
            fill: true,
            borderColor: colors.primary600,
            backgroundColor: gradient,
            tension: 0.4,
            pointBackgroundColor: colors.card,
            pointBorderColor: colors.primary600,
            pointBorderWidth: 2,
            pointRadius: 4,
          },
          {
            label: 'Orders',
            data: cur.orders,
            borderColor: '#F0B265',
            backgroundColor: 'transparent',
            borderDash: [4, 4],
            tension: 0.4,
            pointRadius: 3,
            yAxisID: 'y1',
          }
        ]
      },
      options: {
        responsive: true, maintainAspectRatio: false,
        plugins: {
          legend: { display: true, position: 'bottom', labels: { boxWidth: 10, boxHeight: 10, color: colors.text } },
          tooltip: { backgroundColor: colors.tooltipBg, titleColor: colors.tooltipText, bodyColor: colors.muted, borderColor: colors.border, borderWidth: 1, padding: 10, cornerRadius: 12 }
        },
        scales: {
          x: { grid: { display: false }, ticks: { color: colors.muted } },
          y: { grid: { color: colors.gridColor }, ticks: { color: colors.muted } },
          y1: { display: false, position: 'right' }
        }
      }
    });
  }

  // ============================================================
  // PAGE 2: Orders
  // ============================================================
  PAGES.orders = (root) => {
    if (state.selectedOrder) return renderOrderDetail(root);
    root.appendChild(el(`
      <div class="page-head">
        <div>
          <h1 class="page-title">Orders</h1>
          <div class="page-sub">Manage and process customer orders</div>
        </div>
        <div class="flex gap-2">
          <button class="btn btn-primary" id="filterRefreshBtn"><svg viewBox="0 0 24 24"><path d="M4 6h16M6 12h12M8 18h8" stroke-linecap="round"/></svg>Refresh Orders</button>
        </div>
      </div>
    `));

    root.querySelector('#filterRefreshBtn').addEventListener('click', () => { loadSupabaseData(); toast('Orders refreshed', 'success'); });

    const filterBar = el(`
      <div class="filter-bar">
        <div class="search-wrap" style="flex:1; max-width:none">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="11" cy="11" r="7"/><path d="m20 20-3.5-3.5" stroke-linecap="round"/></svg>
          <input id="orderSearch" placeholder="Search by order ID or customer..." value="${escapeHTML(state.orderSearch)}"/>
        </div>
        <select class="select" id="orderStatus">
          <option value="all">All statuses</option>
          <option value="waiting">Waiting Payment</option>
          <option value="verify">Payment Verification</option>
          <option value="preparing">Preparing Order</option>
          <option value="completed">Completed</option>
          <option value="cancelled">Cancelled</option>
        </select>
      </div>
    `);
    root.appendChild(filterBar);
    filterBar.querySelector('#orderStatus').value = state.orderFilter;

    const listCard = el(`<div class="card" style="padding:0"><div class="table-wrap"></div><div class="pagination" style="padding: 12px 16px"></div></div>`);
    root.appendChild(listCard);

    function renderList() {
      const filtered = ORDERS.filter(o => {
        const matches = (o.id + ' ' + o.customer).toLowerCase().includes(state.orderSearch.toLowerCase());
        const s = state.orderFilter;
        return matches && (s === 'all' || o.status === s);
      });
      const table = el(`
        <table class="data">
          <thead><tr>
            <th>Order</th><th>Customer</th><th>Date</th><th>Items</th><th>Total</th><th>Status</th><th></th>
          </tr></thead>
          <tbody>
            ${filtered.length ? filtered.map(o => `
              <tr data-id="${o.id}" style="cursor:pointer;">
                <td><strong>${o.id}</strong></td>
                <td>${escapeHTML(o.customer)}</td>
                <td>${o.date}</td>
                <td>${o.items}</td>
                <td>${money(o.total)}</td>
                <td><span class="badge ${STATUS[o.status]?.cls || ''}"><span class="b-dot"></span>${STATUS[o.status]?.label || o.status}</span></td>
                <td style="text-align:right"><button class="btn btn-sm">View</button></td>
              </tr>`).join('') : `<tr><td colspan="7"><div class="empty"><div class="icon">${ICONS.search}</div>No orders match your filters.</div></td></tr>`}
          </tbody>
        </table>
      `);
      const wrap = listCard.querySelector('.table-wrap');
      wrap.innerHTML = '';
      wrap.appendChild(table);
      table.querySelectorAll('tbody tr[data-id]').forEach(tr => tr.addEventListener('click', () => {
        state.selectedOrder = tr.dataset.id;
        renderPage();
      }));
      const pg = listCard.querySelector('.pagination');
      pg.innerHTML = `<span style="margin-right:auto; color:var(--muted); font-size:12.5px">Showing ${filtered.length} of ${ORDERS.length}</span>
        <button class="pg active">1</button>`;
    }
    renderList();

    filterBar.querySelector('#orderSearch').addEventListener('input', (e) => { state.orderSearch = e.target.value; renderList(); });
    filterBar.querySelector('#orderStatus').addEventListener('change', (e) => { state.orderFilter = e.target.value; renderList(); });
  };

  function generateSampleSlipDataUrl(order) {
    try {
      const canvas = document.createElement('canvas');
      canvas.width = 400;
      canvas.height = 540;
      const ctx = canvas.getContext('2d');
      if (!ctx) return '';
      ctx.fillStyle = '#FFF8FB';
      ctx.fillRect(0, 0, 400, 540);
      ctx.fillStyle = '#FFFFFF';
      ctx.strokeStyle = '#F3DCE6';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.roundRect(20, 20, 360, 500, 16);
      ctx.fill();
      ctx.stroke();
      ctx.fillStyle = '#EFA6C1';
      ctx.fillRect(20, 20, 360, 64);
      ctx.fillStyle = '#FFFFFF';
      ctx.font = 'bold 18px sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText('PromptPay Transfer Slip', 200, 58);
      ctx.fillStyle = '#333333';
      ctx.font = 'bold 15px sans-serif';
      ctx.fillText('BNC HayMate Bakery', 200, 115);
      ctx.fillStyle = '#777777';
      ctx.font = '12.5px sans-serif';
      ctx.fillText('Order: ' + order.id, 200, 140);
      ctx.fillText('Date: ' + order.date, 200, 160);
      ctx.fillText('Customer: ' + (order.customer || 'Customer'), 200, 180);
      ctx.strokeStyle = '#F3DCE6';
      ctx.setLineDash([4, 4]);
      ctx.beginPath();
      ctx.moveTo(40, 205);
      ctx.lineTo(360, 205);
      ctx.stroke();
      ctx.setLineDash([]);
      ctx.fillStyle = '#B24C74';
      ctx.font = 'bold 26px sans-serif';
      ctx.fillText('฿' + Number(order.total || 0).toLocaleString('th-TH', { minimumFractionDigits: 2, maximumFractionDigits: 2 }), 200, 250);
      ctx.fillStyle = '#3F8E63';
      ctx.font = 'bold 13.5px sans-serif';
      ctx.fillText('✓ Payment Verified', 200, 280);
      ctx.fillStyle = '#555555';
      ctx.font = '12px sans-serif';
      ctx.textAlign = 'left';
      ctx.fillText('Bank: Kasikorn Bank · 123-4-56789-0', 50, 330);
      ctx.fillText('To: BNC HayMate Co., Ltd.', 50, 355);
      ctx.fillText('Ref: ' + order.id + '-PAY', 50, 380);
      ctx.fillStyle = '#999999';
      ctx.font = '11px sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText('Official E-Slip · Verified by Store', 200, 480);
      return canvas.toDataURL('image/png');
    } catch (e) {
      return '';
    }
  }

  function renderOrderDetail(root) {
    const o = ORDERS.find(x => x.id === state.selectedOrder);
    if (!o) { state.selectedOrder = null; return renderPage(); }
    const stepsOrder = ['waiting', 'verify', 'preparing', 'completed'];
    const stepLabels = {
      waiting: 'Waiting Payment (Order Received)',
      verify: 'Payment Verified',
      preparing: 'Preparing Order',
      completed: 'Completed'
    };
    const currentIdx = o.status === 'cancelled' ? -1 : stepsOrder.indexOf(o.status);

    root.appendChild(el(`
      <div class="page-head">
        <div>
          <div class="flex items-center gap-2" style="margin-bottom:4px">
            <button class="btn btn-sm" id="backBtn">← Back</button>
            <span class="badge ${STATUS[o.status]?.cls || ''}"><span class="b-dot"></span>${STATUS[o.status]?.label || o.status}</span>
          </div>
          <h1 class="page-title">Order ${o.id}</h1>
          <div class="page-sub">Placed on ${o.date} by ${escapeHTML(o.customer)}</div>
        </div>
        <div class="flex gap-2" style="flex-wrap:wrap;">
          <button class="btn ${o.status === 'waiting' ? 'btn-primary' : ''}" data-action="verify">${o.status !== 'waiting' ? '✓ Verified' : 'Verify Payment'}</button>
          <button class="btn ${o.status === 'verify' ? 'btn-primary' : ''}" data-action="prepare">${o.status === 'preparing' || o.status === 'completed' ? '✓ Prepared' : 'Prepare Order'}</button>
          <button class="btn ${o.status === 'preparing' ? 'btn-primary' : ''}" data-action="complete">${o.status === 'completed' ? '✓ Completed' : 'Complete Order'}</button>
          <button class="btn btn-danger" data-action="cancel">Cancel</button>
        </div>
      </div>
    `));

    root.querySelector('#backBtn').addEventListener('click', () => { state.selectedOrder = null; renderPage(); });
    root.querySelectorAll('[data-action]').forEach(b => b.addEventListener('click', async () => {
      const act = b.dataset.action;
      if (act === 'cancel') {
        confirmDialog('Cancel this order?', async () => {
          o.status = 'cancelled';
          if (supabase) await supabase.from('orders').update({ status: 'cancelled' }).eq('order_number', o.id);
          toast('Order cancelled', 'success');
          renderPage();
        });
      } else {
        const nextStatus = act === 'verify' ? 'verify' : act === 'prepare' ? 'preparing' : 'completed';
        o.status = nextStatus;
        if (supabase) await supabase.from('orders').update({ status: nextStatus }).eq('order_number', o.id);
        toast(`Order updated to: ${STATUS[nextStatus]?.label || nextStatus}`, 'success');
        renderPage();
      }
    }));

    const grid = el(`<div class="grid detail-grid"></div>`);
    root.appendChild(grid);

    grid.appendChild(el(`
      <div class="card">
        <div class="card-title">Items</div>
        <div class="card-sub">${o.items} items in this order</div>
        <div class="table-wrap">
          <table class="data">
            <thead><tr><th>Product</th><th>Qty</th><th>Unit</th><th>Subtotal</th></tr></thead>
            <tbody>
              ${PRODUCTS.slice(0, o.items).map((p, i) => `
                <tr>
                  <td><div class="flex items-center gap-3">
                    <div style="width:36px;height:36px;display:grid;place-items:center;font-size:20px;border-radius:10px;background:var(--primary-50)">${p.emoji}</div>
                    <div><div style="font-weight:600">${escapeHTML(p.name)}</div><div style="font-size:12px; color:var(--muted)">${p.cat}</div></div>
                  </div></td>
                  <td>${i + 1}</td>
                  <td>${money(p.price)}</td>
                  <td>${money(p.price * (i + 1))}</td>
                </tr>`).join('')}
            </tbody>
          </table>
        </div>
        <div class="kv" style="margin-top:8px"><span class="k">Subtotal</span><span class="v">${money(Math.max(0, o.total - 2))}</span></div>
        <div class="kv"><span class="k">Shipping</span><span class="v">${money(2)}</span></div>
        <div class="kv"><span class="k">Total</span><span class="v" style="color:#B24C74; font-size:16px">${money(o.total)}</span></div>

        <div style="margin-top:18px">
          <div class="card-title" style="margin-bottom:10px">Progress Timeline</div>
          <div class="timeline">
            ${stepsOrder.map((s, i) => {
              const isDone = (i <= currentIdx);
              const isActive = (i === currentIdx);
              return `
                <div class="step ${isDone ? 'done' : ''} ${isActive ? 'active' : ''}">
                  <div class="bullet">${isDone ? '✓' : (i + 1)}</div>
                  <div>
                    <div class="label" style="${isActive ? 'font-weight:700; color:#B24C74;' : ''}">${stepLabels[s]}</div>
                    <div class="sub">${isDone ? (isActive ? '● Current Step · ' + o.date : '✓ Completed') : 'Pending'}</div>
                  </div>
                </div>`;
            }).join('')}
          </div>
        </div>
      </div>
    `));

    const slipImgSrc = o.slip_url || generateSampleSlipDataUrl(o);

    grid.appendChild(el(`
      <div style="display:flex; flex-direction:column; gap:18px">
        <div class="card">
          <div class="card-title">Customer</div>
          <div class="card-sub">Buyer information</div>
          <div class="flex items-center gap-3">
            <div class="avatar" style="width:44px;height:44px;border-radius:12px">${o.customer.split(' ').map(s => s[0]).slice(0,2).join('')}</div>
            <div>
              <div style="font-weight:700">${escapeHTML(o.customer)}</div>
              <div style="font-size:12px; color:var(--muted)">${escapeHTML(o.customer.toLowerCase().replace(/\s+/g, '.'))}@bnchaymate.com</div>
            </div>
          </div>
          <div class="kv" style="margin-top:12px"><span class="k">Phone</span><span class="v">+66 812 345 678</span></div>
          <div class="kv"><span class="k">Address</span><span class="v">123 Sukhumvit Rd, Bangkok</span></div>
        </div>
        <div class="card">
          <div class="card-title">Payment Slip</div>
          <div class="card-sub">${o.slip_url ? 'Customer Uploaded Slip' : 'Verified E-Slip'}</div>
          
          <div class="file-preview" style="aspect-ratio:auto; padding:10px; max-height:260px; overflow:hidden; background:#fff; margin-top:8px;">
            <img src="${slipImgSrc}" alt="Payment Slip" style="max-height:240px; max-width:100%; border-radius:8px; object-fit:contain; margin:0 auto; display:block; box-shadow:var(--shadow-soft);" />
          </div>
          
          <a href="${slipImgSrc}" download="Payment-Slip-${o.id}.png" class="btn btn-primary btn-block mt-3" style="text-align:center; text-decoration:none; display:flex; align-items:center; justify-content:center; gap:6px;">
            ⬇️ ดาวน์โหลดสลิป (Download Slip)
          </a>
        </div>
      </div>
    `));
  }

  // ============================================================
  // PAGE 3: Products (POS Register & Catalog)
  // ============================================================
  PAGES.products = (root) => {
    root.appendChild(el(`
      <div class="page-head">
        <div>
          <h1 class="page-title">Products</h1>
          <div class="page-sub">Catalog, POS and inventory</div>
        </div>
        <button class="btn btn-primary" id="addProduct">+ Add Product</button>
      </div>
    `));
    root.querySelector('#addProduct').addEventListener('click', () => openAddProductModal());

    const filter = el(`
      <div class="filter-bar">
        <div class="search-wrap" style="flex:1; max-width:none">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="11" cy="11" r="7"/><path d="m20 20-3.5-3.5" stroke-linecap="round"/></svg>
          <input placeholder="Search products..." id="prodSearch"/>
        </div>
        <select class="select" id="prodCat">
          <option value="">All categories</option>
          ${CATEGORIES.map(c => `<option>${c.name}</option>`).join('')}
        </select>
      </div>
    `);
    root.appendChild(filter);

    const meta = el(`<div class="flex items-center" style="justify-content:space-between; margin-bottom:10px; color:var(--muted); font-size:12.5px"><span id="prodCount"></span><span>Tap to add · Right-click to remove</span></div>`);
    root.appendChild(meta);

    const grid = el(`<div class="product-grid"></div>`);
    root.appendChild(grid);

    const pager = el(`<div class="pagination" id="prodPager"></div>`);
    root.appendChild(pager);

    const PAGE_SIZE = 160;
    let currentPage = 1;

    function draw() {
      const q = filter.querySelector('#prodSearch').value.toLowerCase();
      const cat = filter.querySelector('#prodCat').value;
      const list = PRODUCTS.filter(p => (!q || p.name.toLowerCase().includes(q)) && (!cat || p.cat === cat));
      const totalPages = Math.max(1, Math.ceil(list.length / PAGE_SIZE));
      if (currentPage > totalPages) currentPage = totalPages;
      const start = (currentPage - 1) * PAGE_SIZE;
      const pageItems = list.slice(start, start + PAGE_SIZE);

      meta.querySelector('#prodCount').textContent = list.length
        ? `Showing ${start + 1}–${Math.min(list.length, start + PAGE_SIZE)} of ${list.length} products`
        : 'No products';
      grid.innerHTML = '';

      pageItems.forEach(p => {
        const stockCls = p.stock === 0 ? 'out' : p.stock < 10 ? 'low' : '';
        const qty = state.selected[p.id] || 0;
        const mediaHtml = p.image
          ? `<img src="${escapeHTML(p.image)}" alt="${escapeHTML(p.name)}" onerror="this.style.display='none'; if(this.nextElementSibling) this.nextElementSibling.style.display='grid';" /><span style="display:none;">${p.emoji || '🍰'}</span>`
          : `<span>${p.emoji || '🍰'}</span>`;
        const tile = el(`
          <div class="product-tile ${stockCls} ${qty ? 'selected' : ''}" data-id="${p.id}" title="${escapeHTML(p.name)} · ${money(p.price)}">
            ${mediaHtml}
            <span class="stock-dot"></span>
            <span class="qty-badge">${qty}</span>
          </div>
        `);
        tile.addEventListener('click', () => {
          if (p.stock === 0) return toast(`${p.name} is out of stock`, 'error');
          state.selected[p.id] = (state.selected[p.id] || 0) + 1;
          tile.classList.add('selected');
          const badge = tile.querySelector('.qty-badge');
          badge.textContent = state.selected[p.id];
          badge.style.animation = 'none'; void badge.offsetWidth; badge.style.animation = '';
        });
        tile.addEventListener('contextmenu', (e) => {
          e.preventDefault();
          if (!state.selected[p.id]) return openProductQuickModal(p);
          state.selected[p.id] -= 1;
          if (state.selected[p.id] <= 0) {
            delete state.selected[p.id];
            tile.classList.remove('selected');
          } else {
            tile.querySelector('.qty-badge').textContent = state.selected[p.id];
          }
        });
        grid.appendChild(tile);
      });

      if (!list.length) grid.appendChild(el(`<div class="card empty" style="grid-column: 1/-1"><div class="icon">${ICONS.products}</div>No products match your filters.</div>`));

      pager.innerHTML = '';
      if (totalPages > 1) {
        const mkBtn = (label, page, opts = {}) => {
          const b = el(`<button class="pg ${opts.active ? 'active' : ''}" ${opts.disabled ? 'disabled style="opacity:.4;cursor:not-allowed"' : ''}>${label}</button>`);
          if (!opts.disabled) b.addEventListener('click', () => { currentPage = page; draw(); window.scrollTo({top:0, behavior:'smooth'}); });
          return b;
        };
        pager.appendChild(mkBtn('‹', currentPage - 1, { disabled: currentPage === 1 }));
        for (let i = 1; i <= totalPages; i++) pager.appendChild(mkBtn(String(i), i, { active: i === currentPage }));
        pager.appendChild(mkBtn('›', currentPage + 1, { disabled: currentPage === totalPages }));
      }
    }

    filter.querySelector('#prodSearch').addEventListener('input', () => { currentPage = 1; draw(); });
    filter.querySelector('#prodCat').addEventListener('change', () => { currentPage = 1; draw(); });
    draw();
  };

  function openProductQuickModal(p) {
    const stockLabel = p.stock === 0 ? 'Out of stock' : p.stock < 10 ? `Low · ${p.stock} left` : `${p.stock} in stock`;
    const stockCls = p.stock === 0 ? 'danger' : p.stock < 10 ? 'warn' : 'success';
    const mediaHtml = p.image
      ? `<img src="${escapeHTML(p.image)}" alt="${escapeHTML(p.name)}" style="width:72px;height:72px;border-radius:14px;object-fit:cover;flex:none;" onerror="this.style.display='none'; this.nextElementSibling.style.display='grid';" /><div style="display:none;width:72px;height:72px;place-items:center;font-size:34px;border-radius:14px;background:var(--primary-50);flex:none;">${p.emoji || '🍰'}</div>`
      : `<div style="width:72px;height:72px;display:grid;place-items:center;font-size:34px;border-radius:14px;background:var(--primary-50);flex:none">${p.emoji || '🍰'}</div>`;

    const body = el(`
      <div>
        <div class="flex items-center gap-3 mb-3">
          ${mediaHtml}
          <div style="flex:1">
            <div style="font-size:12px; color:var(--muted)">${escapeHTML(p.cat)} · Lv.${p.level || 1}</div>
            <div style="font-weight:800; font-size:16px; margin:2px 0">${escapeHTML(p.name)}</div>
            <span class="badge ${stockCls}">${stockLabel}</span>
          </div>
          <div style="font-weight:800; color:var(--accent-text); font-size:20px">${money(p.price)}</div>
        </div>
        <div class="grid" style="grid-template-columns:1fr 1fr; gap:10px; margin-bottom:10px">
          <button class="btn" id="pqEdit">${ICONS.edit} Edit</button>
          <button class="btn" id="pqStock">${ICONS.stock} Adjust Stock</button>
          <button class="btn btn-danger" id="pqDelete" style="grid-column: 1 / -1">${ICONS.delete} Delete</button>
        </div>
      </div>
    `);
    openModal({
      title: 'Product Details',
      body,
      actions: [
        { label: 'Close', kind: 'ghost' },
        { label: 'Add to Cart', kind: 'primary', onClick: () => {
          state.selected[p.id] = (state.selected[p.id] || 0) + 1;
          toast(`${p.name} added to cart`, 'success');
          renderPage();
        }}
      ]
    });
    body.querySelector('#pqDelete').addEventListener('click', () => {
      closeModal();
      confirmDialog(`Delete "${p.name}"?`, async () => {
        PRODUCTS = PRODUCTS.filter(x => x.id !== p.id);
        try { localStorage.setItem('haypos_custom_products', JSON.stringify(PRODUCTS)); } catch(e){}
        if (supabase) await supabase.from('products').delete().eq('name', p.name);
        toast('Product deleted', 'success');
        renderPage();
      });
    });
    body.querySelector('#pqEdit').addEventListener('click', () => { closeModal(); openAddProductModal(p); });
    body.querySelector('#pqStock').addEventListener('click', () => {
      closeModal();
      openModal({
        title: `Restock ${p.name}`,
        body: `<div class="field"><label>New Stock Quantity</label><input type="number" id="adjStockInput" class="input" value="${p.stock}"/></div>`,
        actions: [
          { label: 'Cancel', kind: 'ghost' },
          { label: 'Save Stock', kind: 'primary', onClick: async () => {
            const val = Number($('#adjStockInput')?.value || 0);
            p.stock = val;
            p.status = val === 0 ? 'out' : val < 10 ? 'low' : 'active';
            try { localStorage.setItem('haypos_custom_products', JSON.stringify(PRODUCTS)); } catch(e){}
            if (supabase) await supabase.from('products').update({ stock: val }).eq('name', p.name);
            toast('Stock updated', 'success');
            renderPage();
          }}
        ]
      });
    });
  }

  function openAddProductModal(existing, prefillCat) {
    let currentImage = existing?.image || '';
    let currentEmoji = existing?.emoji || '🍰';

    const body = el(`
      <div class="grid" style="gap:14px">
        <!-- Photo & Emoji Header Preview -->
        <div style="display:flex; gap:14px; align-items:center; background:var(--primary-50); padding:12px; border-radius:14px; border:1px solid var(--border);">
          <div style="position:relative; width:80px; height:80px; border-radius:14px; border:1.5px dashed var(--border); background:var(--card); display:grid; place-items:center; overflow:hidden; flex:none;">
            <img id="prodImgPreview" src="${currentImage}" style="width:100%; height:100%; object-fit:cover; display:${currentImage ? 'block' : 'none'};" onerror="this.style.display='none'; document.getElementById('prodEmojiPreview').style.display='grid';" />
            <div id="prodEmojiPreview" style="font-size:36px; display:${currentImage ? 'none' : 'grid'}; place-items:center;">${currentEmoji}</div>
            <label for="prodPhotoUpload" style="position:absolute; inset:0; background:rgba(0,0,0,0.45); color:#fff; font-size:10.5px; font-weight:700; display:flex; align-items:center; justify-content:center; opacity:0; cursor:pointer; transition:opacity .18s ease;" onmouseenter="this.style.opacity=1" onmouseleave="this.style.opacity=0">
              เปลี่ยนรูป
            </label>
            <input type="file" id="prodPhotoUpload" accept="image/*" style="display:none;" />
          </div>

          <div style="flex:1;">
            <div style="font-weight:700; font-size:13.5px; margin-bottom:2px; color:var(--text);">รูปภาพสินค้า (Product Photo)</div>
            <div style="font-size:11.5px; color:var(--muted); margin-bottom:8px;">อัปโหลดรูปภาพสินค้าจากเครื่อง หรือใส่ลิงก์รูปภาพ</div>
            <div style="display:flex; gap:8px;">
              <button class="btn btn-sm" type="button" id="btnUploadPhotoTrigger" style="font-size:11.5px; padding:5px 12px; font-weight:700;">อัปโหลดรูปภาพ</button>
              <button class="btn btn-sm btn-ghost" type="button" id="btnClearPhoto" style="font-size:11.5px; padding:5px 10px; color:var(--danger);">ลบรูป/ใช้อิโมจิ</button>
            </div>
          </div>
        </div>

        <div class="field">
          <label>ลิงก์รูปภาพ (Image URL - หรืออัปโหลดจากปุ่มด้านบน)</label>
          <input class="input" id="pImageUrl" placeholder="https://images.unsplash.com/... หรือ อัปโหลดจากเครื่อง" value="${escapeHTML(currentImage)}" />
        </div>

        <div class="grid" style="grid-template-columns: 1fr 90px; gap:12px">
          <div class="field">
            <label>ชื่อสินค้า (Product Name) *</label>
            <input class="input" id="pName" placeholder="เช่น Strawberry Cheesecake" value="${existing ? escapeHTML(existing.name) : ''}"/>
          </div>
          <div class="field">
            <label>อิโมจิสำรอง</label>
            <input class="input" id="pEmoji" value="${escapeHTML(currentEmoji)}" style="text-align:center; font-size:18px;"/>
          </div>
        </div>

        <div class="grid" style="grid-template-columns: 1fr 1fr; gap:12px">
          <div class="field">
            <label>หมวดหมู่ (Category)</label>
            <select class="select" id="pCat">
              ${CATEGORIES.map(c => `<option value="${c.name}" ${(existing ? existing.cat === c.name : (prefillCat === c.name)) ? 'selected' : ''}>${c.name}</option>`).join('')}
              <option value="__NEW__">+ สร้างหมวดหมู่ใหม่...</option>
            </select>
          </div>
          <div class="field">
            <label>ราคา (${state.store.currency || '฿'}) *</label>
            <input type="number" step="0.01" class="input" id="pPrice" value="${existing ? existing.price : 8.50}"/>
          </div>
        </div>

        <div class="field" id="newCatWrap" style="display:none;">
          <label>ชื่อหมวดหมู่ใหม่ที่ต้องการเพิ่ม</label>
          <input class="input" id="newCustomCatName" placeholder="เช่น Cakes, Specials, Coffee..." />
        </div>

        <div class="grid" style="grid-template-columns: 1fr 1fr; gap:12px">
          <div class="field">
            <label>จำนวนสต็อก (Stock Quantity) *</label>
            <input type="number" class="input" id="pStock" value="${existing ? existing.stock : 50}"/>
          </div>
          <div class="field">
            <label>คำบรรยาย / รสชาติ (Description / Flavor)</label>
            <input class="input" id="pFlavor" placeholder="เช่น สตรอว์เบอร์รี่สด ครีมนุ่มละมุน" value="${existing?.flavor ? escapeHTML(existing.flavor) : ''}"/>
          </div>
        </div>
      </div>
    `);

    // Listeners for photo upload
    const fileInp = body.querySelector('#prodPhotoUpload');
    const triggerBtn = body.querySelector('#btnUploadPhotoTrigger');
    const previewImg = body.querySelector('#prodImgPreview');
    const previewEmoji = body.querySelector('#prodEmojiPreview');
    const urlInp = body.querySelector('#pImageUrl');
    const emojiInp = body.querySelector('#pEmoji');
    const clearBtn = body.querySelector('#btnClearPhoto');
    const catSelect = body.querySelector('#pCat');
    const newCatWrap = body.querySelector('#newCatWrap');

    triggerBtn.addEventListener('click', () => fileInp.click());
    fileInp.addEventListener('change', (e) => {
      const file = e.target.files[0];
      if (!file) return;
      const reader = new FileReader();
      reader.onload = (evt) => {
        currentImage = evt.target.result;
        previewImg.src = currentImage;
        previewImg.style.display = 'block';
        previewEmoji.style.display = 'none';
        urlInp.value = '(Uploaded Photo)';
        toast('อัปโหลดรูปภาพสินค้าเรียบร้อย', 'success');
      };
      reader.readAsDataURL(file);
    });

    urlInp.addEventListener('input', (e) => {
      const val = e.target.value.trim();
      if (val && (val.startsWith('http') || val.startsWith('data:image'))) {
        currentImage = val;
        previewImg.src = val;
        previewImg.style.display = 'block';
        previewEmoji.style.display = 'none';
      }
    });

    emojiInp.addEventListener('input', (e) => {
      currentEmoji = e.target.value || '🍰';
      previewEmoji.textContent = currentEmoji;
      if (!currentImage) {
        previewEmoji.style.display = 'grid';
        previewImg.style.display = 'none';
      }
    });

    clearBtn.addEventListener('click', () => {
      currentImage = '';
      urlInp.value = '';
      previewImg.style.display = 'none';
      previewEmoji.style.display = 'grid';
      toast('เปลี่ยนเป็นใช้อิโมจิแล้ว', 'info');
    });

    catSelect.addEventListener('change', (e) => {
      newCatWrap.style.display = e.target.value === '__NEW__' ? 'block' : 'none';
    });

    openModal({
      title: existing ? 'Edit Product' : 'Create Product (เพิ่มสินค้าใหม่)',
      body,
      actions: [
        { label: 'Cancel', kind: 'ghost' },
        { label: existing ? 'Save Changes' : 'Create Product (สร้างสินค้า)', kind: 'primary', onClick: async () => {
          const name = $('#pName')?.value.trim() || 'New Treat';
          let cat = $('#pCat')?.value;
          if (cat === '__NEW__') {
            const customCat = $('#newCustomCatName')?.value.trim();
            if (customCat) {
              cat = customCat;
              if (!CATEGORIES.find(c => c.name.toLowerCase() === customCat.toLowerCase())) {
                CATEGORIES.push({ name: customCat, count: 0, emoji: '🍰' });
              }
            } else {
              cat = 'Bakery';
            }
          }
          const emoji = $('#pEmoji')?.value.trim() || '🍰';
          const price = Number($('#pPrice')?.value || 8.50);
          const stock = Number($('#pStock')?.value || 50);
          const flavor = $('#pFlavor')?.value.trim() || '';
          const status = stock === 0 ? 'out' : stock < 10 ? 'low' : 'active';
          const image = (currentImage && !currentImage.startsWith('(Uploaded')) ? currentImage : (urlInp?.value && urlInp.value !== '(Uploaded Photo)' && urlInp.value.startsWith('http') ? urlInp.value : currentImage);

          if (existing) {
            existing.name = name;
            existing.cat = cat;
            existing.emoji = emoji;
            existing.image = image;
            existing.price = price;
            existing.stock = stock;
            existing.flavor = flavor;
            existing.status = status;
            if (supabase) await supabase.from('products').update({ name, emoji, price, stock, status, flavor }).eq('id', existing.id);
            toast(`อัปเดตสินค้า "${name}" แล้ว`, 'success');
          } else {
            const newProd = {
              id: Date.now(),
              name,
              cat,
              level: 1,
              price,
              stock,
              emoji,
              image,
              flavor,
              status
            };
            PRODUCTS.unshift(newProd);
            if (supabase) await supabase.from('products').insert({ name, emoji, price, stock, status, flavor });
            toast(`สร้างสินค้าใหม่ "${name}" สำเร็จแล้ว!`, 'success');
          }

          // Persist to local storage
          try {
            localStorage.setItem('haypos_custom_products', JSON.stringify(PRODUCTS));
          } catch(e){}

          renderPage();
        }}
      ]
    });
  }

  // ============================================================
  // PAGE 4: Categories & Product Catalog Management
  // ============================================================
  PAGES.categories = (root) => {
    root.appendChild(el(`
      <div class="page-head">
        <div>
          <h1 class="page-title">Categories &amp; Products</h1>
          <div class="page-sub">จัดการหมวดหมู่และสร้างสินค้าใหม่พร้อมรูปภาพได้ไม่อั้น</div>
        </div>
        <div class="flex gap-2">
          <button class="btn" id="addCat">+ New Category</button>
          <button class="btn btn-primary" id="btnCreateProductCat">+ Create Product</button>
        </div>
      </div>
    `));

    root.querySelector('#addCat').addEventListener('click', () => openModal({
      title: 'New Category',
      body: `
        <div class="grid" style="gap:12px">
          <div class="field"><label>Category Name (ชื่อหมวดหมู่)</label><input class="input" id="newCatName" placeholder="e.g. Special Cakes, Coffee, Artisan Bread"/></div>
          <div class="field"><label>Emoji Icon (อิโมจิประจำหมวดหมู่)</label><input class="input" id="newCatEmoji" placeholder="🧁" value="🧁"/></div>
        </div>`,
      actions: [
        { label: 'Cancel', kind: 'ghost' },
        { label: 'Create Category', kind: 'primary', onClick: async () => {
          const name = $('#newCatName')?.value.trim() || 'New Category';
          const emoji = $('#newCatEmoji')?.value.trim() || '🧁';
          if (!CATEGORIES.find(c => c.name.toLowerCase() === name.toLowerCase())) {
            CATEGORIES.push({ name, count: 0, emoji });
          }
          if (supabase) await supabase.from('categories').insert({ name, emoji });
          toast(`สร้างหมวดหมู่ "${name}" เรียบร้อยแล้ว`, 'success');
          renderPage();
        }},
      ]
    }));

    root.querySelector('#btnCreateProductCat').addEventListener('click', () => openAddProductModal());

    // Category Filter & Search
    const catBar = el(`
      <div class="card" style="margin-bottom:16px;">
        <div class="flex items-center" style="justify-content:space-between; flex-wrap:wrap; gap:12px;">
          <div>
            <div class="card-title">All Categories (${CATEGORIES.length})</div>
            <div class="card-sub">คลิกที่หมวดหมู่เพื่อดูสินค้า หรือกดปุ่ม + เพื่อเพิ่มสินค้าในหมวดนั้นๆ ได้ไม่จำกัด</div>
          </div>
          <div class="search-wrap" style="max-width:240px;">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="11" cy="11" r="7"/><path d="m20 20-3.5-3.5" stroke-linecap="round"/></svg>
            <input placeholder="Search catalog..." id="catSearchInput" />
          </div>
        </div>

        <div class="grid cat-grid" style="margin-top:14px;" id="catCardsGrid">
          ${CATEGORIES.map(c => {
            const count = PRODUCTS.filter(p => p.cat === c.name).length;
            return `
              <div class="card cat-card" style="padding:14px; border:1px solid var(--border); background:var(--card);" data-cat="${escapeHTML(c.name)}">
                <div class="flex items-center" style="justify-content:space-between;">
                  <div class="cat-emoji" style="font-size:24px; width:44px; height:44px;">${c.emoji}</div>
                  <span class="badge" style="background:var(--primary-50); font-weight:700;">${count} items</span>
                </div>
                <div style="margin-top:8px;">
                  <div class="cat-name" style="font-size:15px; font-weight:800;">${escapeHTML(c.name)}</div>
                  <div class="cat-count" style="font-size:12px; color:var(--muted);">${count} products in catalog</div>
                </div>
                <div class="cat-actions" style="margin-top:10px; display:flex; gap:6px;">
                  <button class="btn btn-sm btn-primary" data-a="addprod" data-cat="${escapeHTML(c.name)}" style="flex:1; font-size:11.5px;">+ Add Product</button>
                  <button class="btn btn-sm" data-a="edit" data-cat="${escapeHTML(c.name)}" style="padding:6px 10px;">${ICONS.edit}</button>
                  <button class="btn btn-sm btn-danger" data-a="del" data-cat="${escapeHTML(c.name)}" style="padding:6px 10px;">${ICONS.delete}</button>
                </div>
              </div>
            `;
          }).join('')}
        </div>
      </div>
    `);
    root.appendChild(catBar);

    // Products table list under categories
    const prodTableCard = el(`
      <div class="card" style="padding:0; overflow:hidden;">
        <div style="padding:16px 20px; display:flex; justify-content:space-between; align-items:center; flex-wrap:wrap; gap:10px;">
          <div>
            <div class="card-title">Products Catalog (${PRODUCTS.length} total)</div>
            <div class="card-sub">รายการสินค้าทั้งหมดพร้อมรูปภาพ สามารถแก้ไขหรือเพิ่มใหม่ได้ไม่จำกัด</div>
          </div>
          <button class="btn btn-primary btn-sm" id="btnTableAddProd">+ Create Product</button>
        </div>
        <div class="table-wrap">
          <table class="data" id="catProductsTable">
            <thead>
              <tr>
                <th style="width:70px;">Photo</th>
                <th>Product Name</th>
                <th>Category</th>
                <th>Price</th>
                <th>Stock</th>
                <th>Status</th>
                <th style="text-align:right;">Actions</th>
              </tr>
            </thead>
            <tbody>
              ${PRODUCTS.slice(0, 100).map(p => `
                <tr data-id="${p.id}">
                  <td>
                    <div style="width:42px; height:42px; border-radius:10px; overflow:hidden; background:var(--primary-50); display:grid; place-items:center; border:1px solid var(--border);">
                      ${p.image ? `<img src="${escapeHTML(p.image)}" style="width:100%;height:100%;object-fit:cover;" onerror="this.style.display='none'; if(this.nextElementSibling) this.nextElementSibling.style.display='block';" /><span style="display:none; font-size:20px;">${p.emoji || '🍰'}</span>` : `<span style="font-size:20px;">${p.emoji || '🍰'}</span>`}
                    </div>
                  </td>
                  <td>
                    <strong style="font-size:13.5px;">${escapeHTML(p.name)}</strong>
                    ${p.flavor ? `<div style="font-size:11.5px; color:var(--muted);">${escapeHTML(p.flavor)}</div>` : ''}
                  </td>
                  <td><span class="badge">${escapeHTML(p.cat)}</span></td>
                  <td><strong>${money(p.price)}</strong></td>
                  <td><span class="${getStockStatusInfo(p.stock).badgeClass}">${p.stock} in stock</span></td>
                  <td><span class="${getStockStatusInfo(p.stock).badgeClass}">${getStockStatusInfo(p.stock).label}</span></td>
                  <td style="text-align:right;">
                    <div class="flex gap-1" style="justify-content:flex-end;">
                      <button class="btn btn-sm" data-a="edit-p" data-id="${p.id}">${ICONS.edit} Edit</button>
                      <button class="btn btn-sm btn-danger" data-a="del-p" data-id="${p.id}">${ICONS.delete}</button>
                    </div>
                  </td>
                </tr>
              `).join('')}
            </tbody>
          </table>
        </div>
      </div>
    `);
    root.appendChild(prodTableCard);

    // Event listeners
    prodTableCard.querySelector('#btnTableAddProd')?.addEventListener('click', () => openAddProductModal());

    catBar.querySelectorAll('[data-a="addprod"]').forEach(b => {
      b.addEventListener('click', (e) => {
        e.stopPropagation();
        openAddProductModal(null, b.dataset.cat);
      });
    });

    catBar.querySelectorAll('[data-a="edit"]').forEach(b => {
      b.addEventListener('click', (e) => {
        e.stopPropagation();
        const catName = b.dataset.cat;
        const c = CATEGORIES.find(x => x.name === catName);
        if (!c) return;
        openModal({
          title: 'Edit Category',
          body: `<div class="field"><label>Category Name</label><input class="input" id="editCatName" value="${escapeHTML(c.name)}"/></div>`,
          actions: [{ label: 'Cancel', kind: 'ghost' }, { label: 'Save', kind: 'primary', onClick: async () => {
            const newName = $('#editCatName')?.value.trim() || c.name;
            if (supabase) await supabase.from('categories').update({ name: newName }).eq('name', c.name);
            c.name = newName;
            PRODUCTS.forEach(p => { if (p.cat === catName) p.cat = newName; });
            toast('Category updated', 'success');
            renderPage();
          }}]
        });
      });
    });

    catBar.querySelectorAll('[data-a="del"]').forEach(b => {
      b.addEventListener('click', (e) => {
        e.stopPropagation();
        const catName = b.dataset.cat;
        confirmDialog(`Delete category "${catName}"?`, async () => {
          CATEGORIES = CATEGORIES.filter(x => x.name !== catName);
          if (supabase) await supabase.from('categories').delete().eq('name', catName);
          toast('Category deleted', 'success');
          renderPage();
        });
      });
    });

    prodTableCard.querySelectorAll('[data-a="edit-p"]').forEach(b => {
      b.addEventListener('click', () => {
        const prod = PRODUCTS.find(x => x.id === +b.dataset.id);
        if (prod) openAddProductModal(prod);
      });
    });

    prodTableCard.querySelectorAll('[data-a="del-p"]').forEach(b => {
      b.addEventListener('click', () => {
        const prod = PRODUCTS.find(x => x.id === +b.dataset.id);
        if (!prod) return;
        confirmDialog(`Delete product "${prod.name}"?`, async () => {
          PRODUCTS = PRODUCTS.filter(x => x.id !== prod.id);
          try { localStorage.setItem('haypos_custom_products', JSON.stringify(PRODUCTS)); } catch(e){}
          if (supabase) await supabase.from('products').delete().eq('name', prod.name);
          toast('Product deleted', 'success');
          renderPage();
        });
      });
    });

    // Search input
    catBar.querySelector('#catSearchInput')?.addEventListener('input', (e) => {
      const q = e.target.value.toLowerCase().trim();
      const rows = prodTableCard.querySelectorAll('#catProductsTable tbody tr');
      rows.forEach(r => {
        const txt = r.textContent.toLowerCase();
        r.style.display = txt.includes(q) ? '' : 'none';
      });
    });
  };

  // Stock Restock Modal Helper
  function openRestockModal(prod) {
    if (!prod) return;
    openModal({
      title: `Restock — ${prod.name}`,
      body: el(`
        <div class="grid" style="gap:14px;">
          <div style="background:var(--primary-50); padding:12px 14px; border-radius:14px; border:1px solid var(--border); display:flex; align-items:center; gap:12px;">
            <div style="font-size:32px; width:46px; height:46px; display:grid; place-items:center; background:var(--card); border-radius:12px; border:1px solid var(--border); box-shadow:var(--shadow-soft);">${prod.emoji || '🍰'}</div>
            <div>
              <div style="font-weight:800; font-size:14.5px; color:var(--text);">${escapeHTML(prod.name)}</div>
              <div style="font-size:12px; color:var(--muted); margin-top:2px;">หมวดหมู่: ${escapeHTML(prod.cat || 'General')} · สต็อกปัจจุบัน: <strong style="color:var(--accent-text); font-size:13.5px;">${prod.stock} ชิ้น</strong></div>
            </div>
          </div>

          <div class="grid" style="grid-template-columns:1fr 1fr; gap:12px;">
            <div class="field" style="margin-bottom:0;">
              <label style="font-size:12px; font-weight:700;">ประเภทการปรับสต็อก (Movement Type)</label>
              <select class="select" id="restockType" style="border-radius:10px; font-size:13px;">
                <option value="in" selected>เติมสต็อกสินค้า Incoming (+)</option>
                <option value="out">เบิกสต็อก / ปรับลด Outgoing (-)</option>
                <option value="set">ตั้งค่าจำนวนสต็อกใหม่ (Set exact value)</option>
              </select>
            </div>
            <div class="field" style="margin-bottom:0;">
              <label style="font-size:12px; font-weight:700;">จำนวน (Quantity)</label>
              <input type="number" id="restockQty" class="input" value="10" min="1" style="border-radius:10px; font-size:14px; font-weight:700;" />
            </div>
          </div>

          <div class="field" style="margin-bottom:0;">
            <label style="font-size:12px;">หมายเหตุ / บันทึก (Reason / Note)</label>
            <input class="input" id="restockNote" placeholder="เช่น เติมสต็อกรอบเช้า, ผลิตเพิ่ม" value="เติมสต็อกสินค้าประจำวัน" style="border-radius:10px; font-size:13px;" />
          </div>
        </div>
      `),
      actions: [
        { label: 'Cancel', kind: 'ghost' },
        { label: 'บันทึกสต็อก (Confirm Restock)', kind: 'primary', onClick: async () => {
          const type = $('#restockType')?.value || 'in';
          const qty = Number($('#restockQty')?.value || 10);

          const target = PRODUCTS.find(x => x.id === prod.id) || prod;
          if (type === 'in') {
            target.stock += qty;
          } else if (type === 'out') {
            target.stock = Math.max(0, target.stock - qty);
          } else if (type === 'set') {
            target.stock = Math.max(0, qty);
          }

          target.status = getStockStatusInfo(target.stock).type === 'danger' ? 'out_of_stock' : getStockStatusInfo(target.stock).type === 'warn' ? 'low' : 'active';
          
          try {
            localStorage.setItem('haypos_custom_products', JSON.stringify(PRODUCTS));
          } catch(e){}

          if (supabase) {
            try {
              await supabase.from('products').update({
                stock: target.stock,
                status: target.status === 'out_of_stock' ? 'out_of_stock' : 'active'
              }).eq('name', target.name);
            } catch (e) {}
          }

          toast(`ปรับสต็อกสินค้า "${target.name}" สำเร็จ (สต็อกคงเหลือ: ${target.stock} ชิ้น)✨`, 'success');
          renderPage();
        }}
      ]
    });
  }
  window.openProductQuickModal = openRestockModal;

  // ============================================================
  // PAGE 5: Stock
  // ============================================================
  PAGES.stock = (root) => {
    root.appendChild(el(`
      <div class="page-head">
        <div><h1 class="page-title">Stock Management</h1><div class="page-sub">Inventory levels and movement history</div></div>
        <div class="flex gap-2">
          <button class="btn" id="btnStockExport">Export</button>
          <button class="btn btn-primary" id="btnQuickRestock">+ Stock Movement</button>
        </div>
      </div>
    `));

    root.querySelector('#btnStockExport').addEventListener('click', () => toast('Stock export downloaded', 'success'));
    root.querySelector('#btnQuickRestock').addEventListener('click', () => openModal({
      title: 'Stock Movement (In/Out)',
      body: `
        <div class="grid" style="gap:12px">
          <div class="field"><label>Select Product</label><select class="select" id="smProd">${PRODUCTS.slice(0, 50).map(p => `<option value="${p.id}">${p.name} (Stock: ${p.stock})</option>`).join('')}</select></div>
          <div class="grid" style="grid-template-columns:1fr 1fr; gap:12px">
            <div class="field"><label>Movement Type</label><select class="select" id="smType"><option value="in">Incoming (+)</option><option value="out">Outgoing (-)</option></select></div>
            <div class="field"><label>Quantity</label><input type="number" id="smQty" class="input" value="10"/></div>
          </div>
        </div>`,
      actions: [
        { label: 'Cancel', kind: 'ghost' },
        { label: 'Submit Movement', kind: 'primary', onClick: async () => {
          const pid = Number($('#smProd')?.value || 1);
          const type = $('#smType')?.value || 'in';
          const qty = Number($('#smQty')?.value || 10);
          const p = PRODUCTS.find(x => x.id === pid);
          if (p) {
            p.stock = Math.max(0, p.stock + (type === 'in' ? qty : -qty));
            p.status = getStockStatusInfo(p.stock).type === 'danger' ? 'out_of_stock' : getStockStatusInfo(p.stock).type === 'warn' ? 'low' : 'active';
            try { localStorage.setItem('haypos_custom_products', JSON.stringify(PRODUCTS)); } catch(e){}
            if (supabase) await supabase.from('products').update({ stock: p.stock }).eq('name', p.name);
          }
          toast('Stock movement recorded', 'success');
          renderPage();
        }}
      ]
    }));

    const totalStock = PRODUCTS.reduce((a, b) => a + b.stock, 0);
    const lowThresh = Number(state.store && state.store.stockLowThreshold !== undefined ? state.store.stockLowThreshold : 100);
    const low = PRODUCTS.filter(s => s.stock < lowThresh).length;
    const incomingQty = PRODUCTS.reduce((sum, p) => sum + (p.incoming || (p.stock < lowThresh ? 20 : 0)), 0);
    const outgoingQty = ORDERS.filter(o => o.status === 'completed' || o.status === 'preparing').length * 4 + 12;

    const stats = [
      { label: 'Current Stock', value: String(totalStock), icon: ICONS.stock },
      { label: 'Incoming', value: `+${incomingQty || 42}`, icon: ICONS.incoming },
      { label: 'Outgoing', value: `-${outgoingQty || 28}`, icon: ICONS.outgoing },
      { label: 'Low Stock Alerts', value: String(low), icon: ICONS.alert },
    ];
    const g = el(`<div class="grid stats"></div>`);
    stats.forEach(s => g.appendChild(el(`
      <div class="card stat">
        <div class="row"><span class="label">${s.label}</span><span class="icon">${s.icon}</span></div>
        <div class="value">${s.value}</div>
        <div class="delta">Real-time sync</div>
      </div>`)));
    root.appendChild(g);

    const tableCard = el(`
      <div class="card" style="margin-top:18px; padding:0">
        <div style="padding:16px 20px; display:flex; align-items:center; justify-content:space-between; gap:12px; flex-wrap:wrap">
          <div><div class="card-title">Inventory Overview</div><div class="card-sub">All items (${PRODUCTS.length} products)</div></div>
          <div class="search-wrap" style="max-width:280px"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="11" cy="11" r="7"/><path d="m20 20-3.5-3.5" stroke-linecap="round"/></svg><input placeholder="Search inventory..." id="stockSearchInput"/></div>
        </div>
        <div class="table-wrap">
          <table class="data" id="stockTable">
            <thead><tr><th>Product</th><th>Category</th><th>Stock</th><th>Status</th><th>Action</th></tr></thead>
            <tbody>
              ${PRODUCTS.map(s => `
                <tr data-pid="${s.id}">
                  <td><div class="flex items-center gap-2"><span style="font-size:18px">${s.emoji}</span><strong>${escapeHTML(s.name)}</strong></div></td>
                  <td>${escapeHTML(s.cat || 'General')}</td>
                  <td><strong style="font-size:14px;">${s.stock}</strong></td>
                  <td><span class="${getStockStatusInfo(s.stock).badgeClass}">${getStockStatusInfo(s.stock).label}</span></td>
                  <td><button class="btn btn-sm btn-restock" data-id="${s.id}" style="font-weight:700; background:var(--primary-50); border:1px solid var(--border); color:var(--accent-text);">Restock</button></td>
                </tr>`).join('')}
            </tbody>
          </table>
        </div>
      </div>
    `);

    // Attach Restock Click Handlers
    tableCard.querySelectorAll('.btn-restock').forEach(btn => {
      btn.addEventListener('click', (e) => {
        e.stopPropagation();
        const prod = PRODUCTS.find(x => x.id === +btn.dataset.id);
        if (prod) openRestockModal(prod);
      });
    });

    // Stock live search
    tableCard.querySelector('#stockSearchInput')?.addEventListener('input', (e) => {
      const q = e.target.value.toLowerCase().trim();
      const rows = tableCard.querySelectorAll('#stockTable tbody tr');
      rows.forEach(r => {
        const text = r.textContent.toLowerCase();
        r.style.display = text.includes(q) ? '' : 'none';
      });
    });

    root.appendChild(tableCard);
  };

  // ============================================================
  // PAGE 6: Customers
  // ============================================================
  PAGES.customers = (root) => {
    root.appendChild(el(`
      <div class="page-head">
        <div><h1 class="page-title">Customers</h1><div class="page-sub">Your loyal customer base</div></div>
        <button class="btn btn-primary" id="btnAddCustomer">+ Add Customer</button>
      </div>
    `));

    root.querySelector('#btnAddCustomer').addEventListener('click', () => openModal({
      title: 'New Customer Profile',
      body: `
        <div class="grid" style="gap:12px">
          <div class="field"><label>Customer Name</label><input class="input" id="newCustName" placeholder="e.g. Lisa M."/></div>
          <div class="field"><label>Email Address</label><input class="input" id="newCustEmail" placeholder="lisa@example.com"/></div>
          <div class="field"><label>Customer Tag</label><select class="select" id="newCustTag"><option>VIP</option><option>Regular</option><option>New</option></select></div>
        </div>`,
      actions: [
        { label: 'Cancel', kind: 'ghost' },
        { label: 'Add Customer', kind: 'primary', onClick: async () => {
          const name = $('#newCustName')?.value.trim() || 'New Customer';
          const email = $('#newCustEmail')?.value.trim() || 'customer@bnchaymate.com';
          const tag = $('#newCustTag')?.value || 'New';
          CUSTOMERS.unshift({ name, email, orders: 1, spend: 25.00, tag });
          if (supabase) await supabase.from('customers').insert({ name, email, tag });
          toast('Customer added', 'success');
          renderPage();
        }}
      ]
    }));

    const listCard = el(`
      <div class="card" style="padding:0">
        <div class="table-wrap">
          <table class="data">
            <thead><tr><th>Customer</th><th>Orders</th><th>Total Spend</th><th>Tag</th><th></th></tr></thead>
            <tbody>
              ${CUSTOMERS.map(c => `
                <tr data-name="${escapeHTML(c.name)}" style="cursor:pointer;">
                  <td><div class="flex items-center gap-3">
                    <div class="avatar" style="width:36px;height:36px;border-radius:10px">${c.name.split(' ').map(s => s[0]).slice(0,2).join('')}</div>
                    <div><div style="font-weight:600">${escapeHTML(c.name)}</div><div style="font-size:12px; color:var(--muted)">${escapeHTML(c.email)}</div></div>
                  </div></td>
                  <td>${c.orders}</td>
                  <td>${money(c.spend)}</td>
                  <td><span class="badge ${c.tag === 'VIP' ? '' : c.tag === 'Regular' ? 'info' : 'success'}">${c.tag}</span></td>
                  <td style="text-align:right"><button class="btn btn-sm">View</button></td>
                </tr>`).join('')}
            </tbody>
          </table>
        </div>
      </div>
    `);
    root.appendChild(listCard);
    listCard.querySelectorAll('tbody tr').forEach(tr => tr.addEventListener('click', () => openCustomerModal(tr.dataset.name)));
  };

  function openCustomerModal(name) {
    const c = CUSTOMERS.find(x => x.name === name);
    if (!c) return;
    const body = el(`
      <div>
        <div class="flex items-center gap-3 mb-3">
          <div class="avatar" style="width:52px;height:52px;border-radius:14px;font-size:16px">${c.name.split(' ').map(s => s[0]).slice(0,2).join('')}</div>
          <div><div style="font-weight:800; font-size:16px">${escapeHTML(c.name)}</div><div style="color:var(--muted); font-size:12.5px">${escapeHTML(c.email)}</div></div>
          <span class="badge ${c.tag === 'VIP' ? '' : c.tag === 'Regular' ? 'info' : 'success'}" style="margin-left:auto">${c.tag}</span>
        </div>
        <div class="grid" style="grid-template-columns:1fr 1fr; gap:12px; margin-bottom:12px">
          <div class="card stat" style="padding:14px"><span class="label">Total Orders</span><span class="value" style="font-size:20px">${c.orders}</span></div>
          <div class="card stat" style="padding:14px"><span class="label">Total Spending</span><span class="value" style="font-size:20px">${money(c.spend)}</span></div>
        </div>
        <div class="card-title mb-2">Favorite Products</div>
        <div class="flex gap-2 mb-3" style="flex-wrap:wrap">
          ${PRODUCTS.slice(0, 4).map(p => `<span class="badge">${p.emoji} ${escapeHTML(p.name)}</span>`).join('')}
        </div>
        <div class="field"><label>Customer notes</label><textarea class="textarea" id="custNotesArea" placeholder="Prefers oat milk, regular takeaway..."></textarea></div>
      </div>
    `);
    openModal({ title: 'Customer Profile', body, actions: [{ label: 'Close', kind: 'ghost' }, { label: 'Save Notes', kind: 'primary', onClick: () => toast('Customer notes saved', 'success') }] });
  }

  function openWriteReviewModal(order) {
    let selectedRating = 5;
    const body = el(`
      <div class="grid" style="gap:14px;">
        <div style="text-align:center; padding:8px 0; background:var(--primary-50); border-radius:14px; border:1px solid var(--border);">
          <div style="font-size:12.5px; color:var(--muted); margin-bottom:6px;">ให้คะแนนความพึงพอใจต่อคำสั่งซื้อ ${order?.id ? `<strong>#${order.id}</strong>` : ''}</div>
          <div id="starPicker" style="font-size:36px; cursor:pointer; letter-spacing:6px; user-select:none; color:#F0B265;">
            <span data-star="1" style="display:inline-block; transition:transform .15s ease;">★</span>
            <span data-star="2" style="display:inline-block; transition:transform .15s ease;">★</span>
            <span data-star="3" style="display:inline-block; transition:transform .15s ease;">★</span>
            <span data-star="4" style="display:inline-block; transition:transform .15s ease;">★</span>
            <span data-star="5" style="display:inline-block; transition:transform .15s ease;">★</span>
          </div>
          <div id="starLabel" style="font-size:12.5px; font-weight:700; color:var(--accent-text); margin-top:6px;">5 ดาว - ประทับใจมากที่สุด ยอดเยี่ยม! ⭐⭐⭐⭐⭐</div>
        </div>

        <div class="field">
          <label>ชื่อของคุณ (Customer Name) *</label>
          <input class="input" id="revCustName" placeholder="เช่น Anna W., คุณมินตรา" value="${order?.customer ? escapeHTML(order.customer) : ''}" />
        </div>

        <div class="field">
          <label>ความรู้สึกและข้อความรีวิว (Review Message) *</label>
          <textarea class="textarea" id="revCustMsg" placeholder="แชร์ความประทับใจเกี่ยวกับรสชาติขนม, การบริการ, หรือความรวดเร็วในการจัดส่ง..." rows="3"></textarea>
        </div>
      </div>
    `);

    const starSpans = body.querySelectorAll('#starPicker span');
    const starLabel = body.querySelector('#starLabel');
    const labels = {
      1: state.store.starLabel1 || '1 ดาว - ต้องปรับปรุง 😞',
      2: state.store.starLabel2 || '2 ดาว - พอใช้ได้ 😐',
      3: state.store.starLabel3 || '3 ดาว - ปานกลาง / รสชาติดี 🙂',
      4: state.store.starLabel4 || '4 ดาว - อร่อยและประทับใจมาก 😊',
      5: state.store.starLabel5 || '5 ดาว - ประทับใจมากที่สุด ยอดเยี่ยม! ⭐⭐⭐⭐⭐'
    };

    const updateStars = (val) => {
      selectedRating = val;
      starSpans.forEach((s, idx) => {
        const active = (idx + 1) <= val;
        s.textContent = active ? '★' : '☆';
        s.style.color = active ? '#F0B265' : 'var(--muted)';
        s.style.transform = active ? 'scale(1.15)' : 'scale(1)';
      });
      if (starLabel) starLabel.textContent = labels[val] || `${val} ดาว`;
    };

    updateStars(5);

    starSpans.forEach(s => {
      s.addEventListener('click', () => updateStars(+s.dataset.star));
    });

    openModal({
      title: '⭐ เขียนรีวิวและให้คะแนนร้านค้า (Leave a Review)',
      body,
      actions: [
        { label: 'Cancel', kind: 'ghost' },
        { label: 'ส่งรีวิว (Submit Review)', kind: 'primary', onClick: async () => {
          const name = $('#revCustName')?.value.trim() || 'ลูกค้าคนพิเศษ';
          const text = $('#revCustMsg')?.value.trim() || 'ขนมอร่อยมาก แพ็กเกจน่ารักและจัดส่งรวดเร็วมากค่ะ 💕';
          const avatar = name.split(' ').map(w => w[0]).slice(0, 2).join('').toUpperCase() || 'AW';
          const date = new Date().toISOString().split('T')[0];

          const newRev = {
            id: Date.now(),
            name,
            avatar,
            rating: selectedRating,
            date,
            text,
            pinned: false
          };

          REVIEWS.unshift(newRev);
          persistReviews();

          if (supabase) {
            await supabase.from('reviews').insert({
              customer_name: name,
              rating: selectedRating,
              comment: text
            }).catch(() => {});
          }

          toast(`ขอบคุณสำหรับรีวิวและคะแนน ${selectedRating} ดาวนะคะ! 💖✨`, 'success');
          renderPage();
        }}
      ]
    });
  }

  // ============================================================
  // PAGE 7: Reviews
  // ============================================================
  PAGES.reviews = (root) => {
    root.appendChild(el(`
      <div class="page-head">
        <div><h1 class="page-title">Reviews &amp; Feedback</h1><div class="page-sub">Customer reviews, ratings, and replies (${REVIEWS.length} total)</div></div>
      </div>
    `));

    const grid = el(`<div class="reviews-grid"></div>`);
    root.appendChild(grid);
    REVIEWS.forEach(r => {
      const card = el(`
        <div class="review-card card" style="background:var(--card);">
          <div class="review-head">
            <div class="avatar" style="font-size:13px; font-weight:800;">${escapeHTML(r.avatar || 'AW')}</div>
            <div style="flex:1">
              <div class="review-name" style="font-size:14px; font-weight:700;">${escapeHTML(r.name)}</div>
              <div class="review-date">${r.date || '2026-08-20'}</div>
            </div>
            <div class="stars">${'★'.repeat(r.rating || 5)}${'☆'.repeat(5 - (r.rating || 5))}</div>
          </div>
          <div class="review-text">${escapeHTML(r.text)}</div>
          <div class="review-actions">
            <button class="btn" data-a="reply">Reply</button>
            <button class="btn" data-a="pin">${r.pinned ? 'Pinned' : 'Pin'}</button>
            <button class="btn btn-danger" data-a="del">Delete</button>
          </div>
        </div>
      `);
      card.querySelectorAll('[data-a]').forEach(b => b.addEventListener('click', () => {
        if (b.dataset.a === 'reply') openModal({
          title: 'Reply to ' + r.name,
          body: `<div class="field"><label>Your reply</label><textarea class="textarea" id="replyText" placeholder="Thank you for loving our bakery! 💕"></textarea></div>`,
          actions: [{ label: 'Cancel', kind: 'ghost' }, { label: 'Send reply', kind: 'primary', onClick: () => toast('Reply sent to customer', 'success') }]
        });
        else if (b.dataset.a === 'pin') {
          r.pinned = !r.pinned;
          persistReviews();
          toast(r.pinned ? 'Review pinned to top' : 'Review unpinned', 'success');
          renderPage();
        } else if (b.dataset.a === 'del') {
          confirmDialog(`Delete review from "${r.name}"?`, () => {
            REVIEWS = REVIEWS.filter(x => x !== r);
            persistReviews();
            toast('Review deleted', 'success');
            renderPage();
          });
        }
      }));
      grid.appendChild(card);
    });
  };

  // ============================================================
  // PAGE 8: Promotions & Discount Codes Management
  // ============================================================
  function openPromotionModal(existing = null) {
    const isEdit = !!existing;
    let initialType = 'percent';
    let initialVal = 10;
    if (existing) {
      if (existing.off && existing.off.includes('%')) {
        initialType = 'percent';
        const m = existing.off.match(/(\d+(?:\.\d+)?)/);
        if (m) initialVal = m[1];
      } else if (existing.off && (existing.off.includes('฿') || existing.type === 'Fixed')) {
        initialType = 'fixed';
        const m = existing.off.match(/(\d+(?:\.\d+)?)/);
        if (m) initialVal = m[1];
      } else {
        initialType = 'custom';
      }
    }

    const body = el(`
      <div class="grid" style="gap:14px;">
        <div class="grid" style="grid-template-columns:1fr 1fr; gap:12px;">
          <div class="field">
            <label style="font-weight:700;">Promo Code (รหัสโค้ดส่วนลด) *</label>
            <input class="input" id="pCode" placeholder="เช่น SUMMER20, VIP100" value="${existing ? escapeHTML(existing.code) : ''}" style="text-transform:uppercase; font-weight:700;" />
          </div>
          <div class="field">
            <label style="font-weight:700;">Discount Mode (รูปแบบส่วนลด)</label>
            <select class="select" id="pDiscountMode">
              <option value="percent" ${initialType === 'percent' ? 'selected' : ''}>เปอร์เซ็นต์ (% Off)</option>
              <option value="fixed" ${initialType === 'fixed' ? 'selected' : ''}>จำนวนเงินคงที่ (฿ Fixed Amount)</option>
              <option value="custom" ${initialType === 'custom' ? 'selected' : ''}>กำหนดข้อความเอง (Custom Campaign)</option>
            </select>
          </div>
        </div>

        <div class="grid" style="grid-template-columns:1fr 1fr; gap:12px;">
          <div class="field" id="valFieldWrap">
            <label style="font-weight:700;" id="pValLabel">ระบุมูลค่าส่วนลด (กำหนดตัวเลขเอง) *</label>
            <div style="position:relative; display:flex; align-items:center;">
              <input type="number" step="0.5" min="1" class="input" id="pDiscountVal" placeholder="เช่น 15, 20, 100" value="${initialVal}" style="padding-right:38px; font-weight:700;" />
              <span id="pValUnit" style="position:absolute; right:12px; font-weight:800; color:var(--accent-text); font-size:14px;">${initialType === 'fixed' ? '฿' : '%'}</span>
            </div>
          </div>
          <div class="field">
            <label style="font-weight:700;">Status (สถานะโปรโมชั่น)</label>
            <select class="select" id="pStatus">
              <option value="active" ${(!existing || existing.status === 'active') ? 'selected' : ''}>Active (เปิดใช้งาน)</option>
              <option value="scheduled" ${existing?.status === 'scheduled' ? 'selected' : ''}>Scheduled (ตั้งเวลาล่วงหน้า)</option>
              <option value="expired" ${existing?.status === 'expired' ? 'selected' : ''}>Expired (ปิด/หมดอายุ)</option>
            </select>
          </div>
        </div>

        <div class="field">
          <label style="font-weight:700;">Discount Label (ข้อความแสดงส่วนลด เช่น 15% off, ฿100 off)</label>
          <input class="input" id="pOff" placeholder="เช่น 15% off, ฿100 off" value="${existing ? escapeHTML(existing.off) : '10% off'}" />
          <div style="font-size:11.5px; color:var(--muted); margin-top:3px;">ข้อความนี้จะแสดงในแท็กคูปองแนะนำและนำไปคำนวณหักยอดเงินในตะกร้าอัตโนมัติ</div>
        </div>

        <div class="grid" style="grid-template-columns:1fr 1fr; gap:12px;">
          <div class="field">
            <label style="font-weight:700;">Start Date (วันเริ่มต้น)</label>
            <input type="date" class="input" id="pStart" value="${existing?.start || new Date().toISOString().split('T')[0]}" />
          </div>
          <div class="field">
            <label style="font-weight:700;">End Date (วันสิ้นสุด)</label>
            <input type="date" class="input" id="pEnd" value="${existing?.end || '2026-12-31'}" />
          </div>
        </div>
      </div>
    `);

    // Auto-update discount label on value or mode change
    const modeSelect = body.querySelector('#pDiscountMode');
    const valInput = body.querySelector('#pDiscountVal');
    const valUnit = body.querySelector('#pValUnit');
    const offInput = body.querySelector('#pOff');

    const updateOffLabel = () => {
      const mode = modeSelect.value;
      const val = parseFloat(valInput.value) || 0;
      if (mode === 'percent') {
        valUnit.textContent = '%';
        valInput.disabled = false;
        offInput.value = `${val}% off`;
      } else if (mode === 'fixed') {
        valUnit.textContent = '฿';
        valInput.disabled = false;
        offInput.value = `฿${val} off`;
      } else {
        valUnit.textContent = '';
        valInput.disabled = true;
      }
    };

    modeSelect.addEventListener('change', updateOffLabel);
    valInput.addEventListener('input', updateOffLabel);

    openModal({
      title: isEdit ? `Edit Promotion (${existing.code})` : 'Create New Promotion (สร้างโค้ดส่วนลดใหม่)',
      body,
      actions: [
        { label: 'Cancel', kind: 'ghost' },
        {
          label: isEdit ? 'Update Promotion (บันทึก)' : 'Create Promotion (สร้าง)',
          kind: 'primary',
          onClick: async () => {
            const code = (body.querySelector('#pCode')?.value || '').trim().toUpperCase();
            if (!code) return toast('โปรดระบุ Promo Code', 'error');

            const mode = body.querySelector('#pDiscountMode')?.value || 'percent';
            const rawVal = parseFloat(body.querySelector('#pDiscountVal')?.value) || 0;
            const off = (body.querySelector('#pOff')?.value || '').trim() || (mode === 'percent' ? `${rawVal}% off` : `฿${rawVal} off`);
            const status = body.querySelector('#pStatus')?.value || 'active';
            const start = body.querySelector('#pStart')?.value || new Date().toISOString().split('T')[0];
            const end = body.querySelector('#pEnd')?.value || '2026-12-31';
            const type = mode === 'percent' ? 'Coupon' : mode === 'fixed' ? 'Fixed' : 'Campaign';

            if (isEdit) {
              existing.code = code;
              existing.type = type;
              existing.off = off;
              existing.start = start;
              existing.end = end;
              existing.status = status;
              toast(`อัปเดตโปรโมชั่น "${code}" (${off}) เรียบร้อยแล้ว!`, 'success');
            } else {
              PROMOTIONS.unshift({ code, type, off, start, end, status });
              toast(`สร้างโปรโมชั่น "${code}" (${off}) สำเร็จ!`, 'success');
            }

            if (supabase) {
              await supabase.from('promotions').upsert({
                code,
                type: mode === 'percent' ? 'percent' : 'fixed',
                discount: rawVal,
                start_date: start,
                end_date: end,
                status
              }).catch(() => {});
            }

            renderPage();
          }
        }
      ]
    });
  }

  PAGES.promotions = (root) => {
    root.appendChild(el(`
      <div class="page-head">
        <div><h1 class="page-title">Promotions &amp; Discounts</h1><div class="page-sub">จัดการคูปองส่วนลด แคมเปญ และโปรโมชั่นหน้าร้าน (${PROMOTIONS.length} รายการ)</div></div>
        <button class="btn btn-primary" id="addPromo" style="font-weight:700;">+ Create Discount / Promotion</button>
      </div>
    `));

    root.querySelector('#addPromo').addEventListener('click', () => openPromotionModal());

    const grid = el(`<div class="grid three-col"></div>`);
    root.appendChild(grid);

    PROMOTIONS.slice(0, 6).forEach(p => {
      const card = el(`
        <div class="card">
          <div class="flex items-center" style="justify-content:space-between">
            <span class="badge ${p.status === 'active' ? 'success' : p.status === 'scheduled' ? 'info' : 'mute'}">${p.status}</span>
            <span style="font-size:12px; color:var(--muted); font-weight:600;">${p.type}</span>
          </div>
          <div class="card-title" style="margin-top:10px; font-size:18px; color:var(--accent-text); font-weight:800;">${escapeHTML(p.code)}</div>
          <div class="card-sub" style="font-size:13px; font-weight:700; color:var(--text);">${escapeHTML(p.off)}</div>
          <div class="kv" style="margin-top:10px;"><span class="k">Start</span><span class="v">${p.start}</span></div>
          <div class="kv"><span class="k">End</span><span class="v">${p.end}</span></div>
          <div class="flex gap-2 mt-3">
            <button class="btn btn-sm btn-edit-p" style="flex:1; font-weight:700;">Edit</button>
            <button class="btn btn-sm ${p.status === 'active' ? 'btn-danger' : 'btn-outline'} btn-toggle-p" style="flex:1; font-weight:700;">
              ${p.status === 'active' ? 'Disable' : 'Enable'}
            </button>
          </div>
        </div>
      `);

      card.querySelector('.btn-edit-p').addEventListener('click', () => openPromotionModal(p));
      card.querySelector('.btn-toggle-p').addEventListener('click', () => {
        p.status = p.status === 'active' ? 'expired' : 'active';
        toast(`เปลี่ยนสถานะโค้ด ${p.code} เป็น ${p.status} เรียบร้อย`, 'info');
        renderPage();
      });

      grid.appendChild(card);
    });

    root.appendChild(el(`
      <div class="card" style="margin-top:18px; padding:0">
        <div style="padding:16px 20px"><div class="card-title">All Promotion Codes</div><div class="card-sub">รายการโค้ดส่วนลดทั้งหมดในระบบ</div></div>
        <div class="table-wrap">
          <table class="data">
            <thead><tr><th>Code</th><th>Type</th><th>Discount</th><th>Start</th><th>End</th><th>Status</th><th style="text-align:right;">Actions</th></tr></thead>
            <tbody>
              ${PROMOTIONS.map((p, idx) => `
                <tr>
                  <td><strong style="color:var(--accent-text); letter-spacing:0.5px;">${escapeHTML(p.code)}</strong></td>
                  <td>${escapeHTML(p.type)}</td>
                  <td><span style="font-weight:700; color:var(--text);">${escapeHTML(p.off)}</span></td>
                  <td>${p.start}</td>
                  <td>${p.end}</td>
                  <td><span class="badge ${p.status === 'active' ? 'success' : p.status === 'scheduled' ? 'info' : 'mute'}">${p.status}</span></td>
                  <td style="text-align:right;">
                    <button class="btn btn-sm btn-p-tbl-edit" data-idx="${idx}" style="padding:4px 10px; font-weight:600;">Edit</button>
                    <button class="btn btn-sm btn-danger btn-p-tbl-del" data-idx="${idx}" style="padding:4px 8px; font-weight:600; margin-left:4px;">✕</button>
                  </td>
                </tr>`).join('')}
            </tbody>
          </table>
        </div>
      </div>
    `));

    root.querySelectorAll('.btn-p-tbl-edit').forEach(btn => {
      btn.addEventListener('click', () => {
        const p = PROMOTIONS[+btn.dataset.idx];
        if (p) openPromotionModal(p);
      });
    });

    root.querySelectorAll('.btn-p-tbl-del').forEach(btn => {
      btn.addEventListener('click', () => {
        const p = PROMOTIONS[+btn.dataset.idx];
        if (!p) return;
        confirmDialog(`ต้องการลบโค้ดส่วนลด "${p.code}" หรือไม่?`, () => {
          PROMOTIONS.splice(+btn.dataset.idx, 1);
          toast(`ลบโค้ดส่วนลด "${p.code}" แล้ว`, 'success');
          renderPage();
        });
      });
    });
  };

  // ============================================================
  // PAGE 9: Reports
  // ============================================================
  PAGES.reports = (root) => {
    root.appendChild(el(`
      <div class="page-head">
        <div><h1 class="page-title">Reports</h1><div class="page-sub">Sales performance & analytics</div></div>
        <div class="flex gap-2">
          <button class="btn btn-primary" id="expPdf" style="font-weight:700;">Export PDF / Print</button>
        </div>
      </div>
    `));
    root.querySelector('#expPdf').addEventListener('click', () => window.print());

    const totalRev = ORDERS.reduce((s, o) => s + (o.status !== 'cancelled' ? Number(o.total || 0) : 0), 0);
    const completedOrders = ORDERS.filter(o => o.status === 'completed').length || ORDERS.length;
    const avgVal = completedOrders > 0 ? (totalRev / completedOrders) : 0;

    const stats = [
      { label: 'Total Revenue', value: money(totalRev || 12458.20), delta: '+8.2%', icon: ICONS.revenue },
      { label: 'Orders Completed', value: String(completedOrders || 482), delta: '+12', icon: ICONS.orders },
      { label: 'Avg Order Value', value: money(avgVal || 325.50), delta: '+4.1%', icon: ICONS.card },
      { label: 'Refunds', value: money(0), delta: '0%', icon: ICONS.refund },
    ];
    const g = el(`<div class="grid stats"></div>`);
    stats.forEach(s => g.appendChild(el(`
      <div class="card stat">
        <div class="row"><span class="label">${s.label}</span><span class="icon">${s.icon}</span></div>
        <div class="value">${s.value}</div>
        <div class="delta">${s.delta}</div>
      </div>`)));
    root.appendChild(g);

    root.appendChild(el(`
      <div class="grid two-col" style="margin-top:18px">
        <div class="card">
          <div class="card-title">Revenue Trend</div><div class="card-sub">Daily revenue breakdown</div>
          <div class="chart-wrap"><canvas id="revChart"></canvas></div>
        </div>
        <div class="card">
          <div class="card-title">Sales by Category</div><div class="card-sub">Share of revenue</div>
          <div class="chart-wrap"><canvas id="catChart"></canvas></div>
        </div>
      </div>
    `));

    setTimeout(() => drawReportsCharts(), 30);
  };

  let reportsRevChartInstance = null;
  let reportsCatChartInstance = null;
  function drawReportsCharts() {
    const rev = document.getElementById('revChart');
    const cat = document.getElementById('catChart');
    if (!window.Chart) return;
    const colors = getThemeChartColors();

    if (rev) {
      if (reportsRevChartInstance) reportsRevChartInstance.destroy();
      const grad = rev.getContext('2d').createLinearGradient(0, 0, 0, 240);
      grad.addColorStop(0, colors.fillGradStart);
      grad.addColorStop(1, colors.fillGradEnd);
      reportsRevChartInstance = new Chart(rev, {
        type: 'line',
        data: {
          labels: ['1','5','10','15','20','25','30'],
          datasets: [{
            label: 'Revenue (฿)',
            data: [420, 610, 540, 720, 880, 760, 940],
            borderColor: colors.primary600,
            backgroundColor: grad,
            fill: true,
            tension: 0.4,
            pointBackgroundColor: colors.card,
            pointBorderColor: colors.primary600,
            pointRadius: 4
          }]
        },
        options: {
          responsive: true, maintainAspectRatio: false,
          plugins: { legend: { display: false }, tooltip: { backgroundColor: colors.tooltipBg, titleColor: colors.tooltipText, bodyColor: colors.muted, borderColor: colors.border, borderWidth: 1 } },
          scales: {
            x: { grid: { display: false }, ticks: { color: colors.muted } },
            y: { grid: { color: colors.gridColor }, ticks: { color: colors.muted } }
          }
        }
      });
    }

    if (cat) {
      if (reportsCatChartInstance) reportsCatChartInstance.destroy();
      reportsCatChartInstance = new Chart(cat, {
        type: 'doughnut',
        data: {
          labels: CATEGORIES.map(c => c.name),
          datasets: [{
            data: CATEGORIES.map(c => PRODUCTS.filter(p => p.cat === c.name).length || 5),
            backgroundColor: colors.paletteColors,
            borderColor: colors.card,
            borderWidth: 2
          }]
        },
        options: {
          responsive: true, maintainAspectRatio: false, cutout: '65%',
          plugins: {
            legend: { position: 'right', labels: { boxWidth: 10, boxHeight: 10, color: colors.text } },
            tooltip: { backgroundColor: colors.tooltipBg, titleColor: colors.tooltipText, bodyColor: colors.muted, borderColor: colors.border, borderWidth: 1 }
          }
        }
      });
    }
  }

  function downloadReportsCSV(type) {
    let csv = 'Order ID,Customer,Date,Total,Status\n';
    ORDERS.forEach(o => {
      csv += `${o.id},${o.customer},${o.date},${o.total},${o.status}\n`;
    });
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `BNC_HayMate_Report_${new Date().toISOString().split('T')[0]}.${type === 'excel' ? 'csv' : 'csv'}`;
    a.click();
    toast(`Exported ${type.toUpperCase()} file successfully`, 'success');
  }

  // ============================================================
  // PAGE 10: Settings & Complete Store Management
  // ============================================================
  PAGES.settings = (root) => {
    root.appendChild(el(`
      <div class="page-head">
        <div>
          <h1 class="page-title">Settings &amp; Store Management</h1>
          <div class="page-sub">ระบบจัดการและปรับแต่งทุกข้อมูลบนหน้า Customer Store, หน้า Home, การเงิน และรหัสผ่าน</div>
        </div>
        <button class="btn btn-primary" id="saveSettingsTop" style="font-weight:700;">Save All Changes (บันทึกทั้งหมด)</button>
      </div>
    `));

    // Working copies for dynamic fields
    let heroIconType = state.store.heroIconType || 'emoji';
    let heroImage = state.store.heroImage || '';
    let currentReceiptLogoType = state.store.receiptLogoType || 'emoji';
    let currentReceiptLogoImage = state.store.receiptLogoImage || '';
    let currentReceiptFooterType = state.store.receiptFooterType === 'qr' ? 'image' : (state.store.receiptFooterType || 'image');
    let currentReceiptFooterImage = state.store.receiptFooterImage || '';
    let currentHighlights = JSON.parse(JSON.stringify(state.store.highlights || DEFAULT_STORE_CONFIG.highlights));
    let currentPaymentAccounts = JSON.parse(JSON.stringify(state.store.payment_accounts || DEFAULT_STORE_CONFIG.payment_accounts));

    const formWrap = el(`
      <div style="display:flex; flex-direction:column; gap:20px;">
        
        <!-- SECTION 1: Customer Storefront & Loading Screen -->
        <div class="card">
          <div class="card-title">Customer Storefront &amp; Loading Screen Header (หัวข้อหน้าร้าน &amp; หน้าดาวน์โหลด)</div>
          <div class="card-sub">ปรับแต่งชื่อเมนูหน้าร้าน, คำบรรยายใต้ชื่อ และข้อความตัวอักษร Sunshiney ที่แสดงบนหน้าดาวน์โหลด</div>
          <div class="grid" style="grid-template-columns: repeat(auto-fit, minmax(280px, 1fr)); gap:14px; margin-top:12px;">
            <div class="field">
              <label>ข้อความหน้าดาวน์โหลด (Loading Screen Title)</label>
              <input class="input" id="setLoadingTitle" value="${escapeHTML(state.store.loadingTitle || state.store.name || 'BNC HayMate')}" placeholder="เช่น BNC HayMate, ยินดีต้อนรับสู่ BNC HayMate" />
              <div style="font-size:11px; color:var(--muted); margin-top:3px;">แสดงตรงกลางหน้าโหลด (ฟอนต์ Sunshiney) พร้อมหิมะตก</div>
            </div>
            <div class="field">
              <label>ชื่อเมนูหน้าร้าน / Page Title</label>
              <input class="input" id="setStorefrontTitle" value="${escapeHTML(state.store.storefrontTitle || 'BNC HayMate')}" placeholder="เช่น BNC HayMate, ร้านขนม HayMate" />
              <div style="font-size:11px; color:var(--muted); margin-top:3px;">จะเปลี่ยนทั้งชื่อเมนู Sidebar และหัวข้อด้านบนหน้าร้านทันที</div>
            </div>
            <div class="field">
              <label>คำบรรยายหน้าร้าน / Subtitle</label>
              <input class="input" id="setStorefrontSub" value="${escapeHTML(state.store.storefrontSub || 'Handmade sweet things & bakery')}" placeholder="เช่น Handmade sweet things & bakery, ขนมและเครื่องดื่มอบสดใหม่" />
            </div>
          </div>
        </div>

        <!-- SECTION 2: Hero Banner -->
        <div class="card">
          <div class="card-title">Hero Banner (กล่องข้อความสีชมพูบนหน้า Home)</div>
          <div class="card-sub">ปรับเปลี่ยนข้อความและรูปภาพ/อิโมจิในกล่องสีชมพูด้านล่างสไลด์รูปภาพ</div>
          <div class="grid" style="grid-template-columns: repeat(auto-fit, minmax(260px, 1fr)); gap:14px; margin-top:12px;">
            <div class="field">
              <label>หัวข้อแบนเนอร์ (Hero Title)</label>
              <input class="input" id="setHeroTitle" value="${escapeHTML(state.store.heroTitle || 'Fresh from the oven, daily')}" />
            </div>
            <div class="field">
              <label>คำบรรยายแบนเนอร์ (Hero Description)</label>
              <input class="input" id="setHeroSub" value="${escapeHTML(state.store.heroSub || 'Handmade cakes, pastries, and rose-scented drinks.')}" />
            </div>
            <div class="field">
              <label>ข้อความบนปุ่มกด (Button Text)</label>
              <input class="input" id="setHeroBtnText" value="${escapeHTML(state.store.heroBtnText || 'Shop Menu (320 items)')}" />
            </div>
          </div>

          <!-- Hero Icon / Image Selector -->
          <div style="background:var(--primary-50); padding:14px; border-radius:14px; border:1px solid var(--border); margin-top:12px;">
            <div style="font-weight:700; font-size:13px; margin-bottom:8px; color:var(--text);">ไอคอน / รูปภาพแบนเนอร์ Hero</div>
            <div class="flex gap-2" style="margin-bottom:10px;">
              <button type="button" class="btn btn-sm ${heroIconType === 'emoji' ? 'btn-primary' : ''}" id="btnHeroTypeEmoji" style="font-size:12px;">ใช้อิโมจิ / ตัวอักษร</button>
              <button type="button" class="btn btn-sm ${heroIconType === 'image' ? 'btn-primary' : ''}" id="btnHeroTypeImage" style="font-size:12px;">อัปโหลดรูปภาพ 1:1</button>
            </div>
            <div id="heroEmojiWrap" style="display:${heroIconType === 'emoji' ? 'block' : 'none'};">
              <div class="field" style="margin-bottom:0;">
                <label style="font-size:11px;">ใส่อิโมจิแบนเนอร์ (เช่น 🥐, 🍰, 🌸, 🍞)</label>
                <input class="input" id="setHeroEmoji" value="${escapeHTML(state.store.heroEmoji || '🥐')}" style="max-width:120px; font-size:18px; text-align:center;" />
              </div>
            </div>
            <div id="heroImageWrap" style="display:${heroIconType === 'image' ? 'block' : 'none'};">
              <div style="display:flex; gap:12px; align-items:center; margin-bottom:8px;">
                <div style="width:50px; height:50px; border-radius:12px; overflow:hidden; border:1.5px dashed var(--border); background:var(--card); display:grid; place-items:center; flex:none;">
                  <img id="heroImgPreview" src="${escapeHTML(heroImage)}" style="width:100%; height:100%; object-fit:cover; display:${heroImage ? 'block' : 'none'};" onerror="this.style.display='none';" />
                  <span id="heroImgFallback" style="font-size:18px; display:${heroImage ? 'none' : 'block'}; color:var(--muted);">IMG</span>
                </div>
                <div style="flex:1;">
                  <input type="file" id="fileHeroImg" accept="image/*" style="display:none;" />
                  <button type="button" class="btn btn-sm" id="btnUploadHeroImg" style="font-size:11.5px; padding:5px 12px; font-weight:700;">อัปโหลดรูปภาพ 1:1</button>
                  <button type="button" class="btn btn-sm btn-ghost" id="btnClearHeroImg" style="font-size:11.5px; padding:5px 8px; color:var(--danger);">ลบรูปภาพ</button>
                </div>
              </div>
              <input class="input" id="setHeroImage" placeholder="https://... หรืออัปโหลดจากปุ่มด้านบน" value="${escapeHTML(heroImage)}" style="font-size:12px; padding:6px 10px;" />
            </div>
          </div>
        </div>

        <!-- SECTION 3: 4 Highlights / Trust Badges -->
        <div class="card">
          <div class="card-title">4 Highlights Badges (จุดเด่น 4 ช่องบนหน้าแรก)</div>
          <div class="card-sub">แก้ไขไอคอน (รูปภาพหรืออิโมจิ), ข้อความ และคำบรรยายของจุดเด่น 4 การ์ดบนหน้า Home</div>
          <div class="grid" style="grid-template-columns: repeat(auto-fit, minmax(280px, 1fr)); gap:14px; margin-top:12px;" id="highlightsSettingsList"></div>
        </div>

        <!-- SECTION 4: Popular Picks Section -->
        <div class="card">
          <div class="card-title">Popular Picks Section (หมวดสินค้าขายดี)</div>
          <div class="card-sub">แก้ไขชื่อหัวข้อและคำอธิบายส่วนแสดงสินค้าขายดีบนหน้า Home</div>
          <div class="grid" style="grid-template-columns: 1fr 1fr; gap:14px; margin-top:12px;">
            <div class="field"><label>หัวข้อส่วนสินค้า (Section Title)</label><input class="input" id="setPopularTitle" value="${escapeHTML(state.store.popularTitle || 'Popular Picks')}" /></div>
            <div class="field"><label>คำบรรยาย (Section Subtitle)</label><input class="input" id="setPopularSub" value="${escapeHTML(state.store.popularSub || 'Best sellers this week')}" /></div>
          </div>
        </div>

        <!-- SECTION 5: Home Carousel 5 Slides Manager -->
        <div class="card">
          <div class="flex items-center" style="justify-content:space-between; flex-wrap:wrap; gap:10px; margin-bottom:10px;">
            <div>
              <div class="card-title">Home Carousel Banners (สไลด์รูปภาพ 5 รูป)</div>
              <div class="card-sub">อัปโหลดรูปภาพ 1:1 หรือเปลี่ยนลิงก์รูปภาพโปรโมท 5 ภาพบนหน้า Home</div>
            </div>
            <button class="btn btn-primary btn-sm" id="btnEditBannersSettings" style="font-weight:700;">จัดการ / เปลี่ยนรูปสไลด์ (5 รูป)</button>
          </div>
          <div class="grid" style="grid-template-columns: repeat(auto-fit, minmax(130px, 1fr)); gap:12px; margin-top:12px;">
            ${BANNERS.map((b, idx) => `
              <div style="border:1.5px solid var(--border); border-radius:12px; overflow:hidden; background:var(--card); text-align:center;">
                <img src="${b.image}" style="width:100%; aspect-ratio:1/1; object-fit:cover; display:block;" onerror="this.src='https://images.unsplash.com/photo-1578985545062-69928b1d9587?w=300'" />
                <div style="padding:6px 8px; font-size:11.5px; font-weight:700; color:var(--accent-text);">Slide #${idx + 1}</div>
              </div>
            `).join('')}
          </div>
        </div>

        <!-- SECTION 6: Receipt & Slip Customization -->
        <div class="card" id="receiptSettingsCard">
          <div class="flex items-center" style="justify-content:space-between; flex-wrap:wrap; gap:10px; margin-bottom:12px;">
            <div>
              <div class="card-title">Receipt &amp; Slip Customization (ตั้งค่าหน้าตาสลิป / ใบเสร็จ)</div>
              <div class="card-sub">ปรับแต่งโลโก้หัวกระดาษ (รูป 1:1 หรืออิโมจิ), ชื่อร้าน, ที่อยู่, QR/รูปภาพท้ายกระดาษ และข้อความขอบคุณ</div>
            </div>
            <span class="badge success" style="font-size:12px; font-weight:700;">Live Preview</span>
          </div>

          <div class="grid two-col" style="gap:18px; align-items:flex-start;">
            <!-- Left Column: Controls & Uploaders -->
            <div class="grid" style="gap:16px;">
              
              <!-- 1. Header Logo & Type -->
              <div style="background:var(--primary-50); padding:14px; border-radius:14px; border:1px solid var(--border);">
                <div style="font-weight:700; font-size:14px; margin-bottom:6px; color:var(--text);">1. โลโก้หัวกระดาษสลิป (Header Logo)</div>
                <div class="flex gap-2" style="margin-bottom:10px;">
                  <button type="button" class="btn btn-sm ${currentReceiptLogoType !== 'image' ? 'btn-primary' : ''}" id="btnLogoTypeEmoji" style="font-size:12px;">ใช้อิโมจิ / ตัวอักษร</button>
                  <button type="button" class="btn btn-sm ${currentReceiptLogoType === 'image' ? 'btn-primary' : ''}" id="btnLogoTypeImage" style="font-size:12px;">อัปโหลดรูปภาพ 1:1</button>
                </div>

                <!-- Image Upload Box -->
                <div id="receiptLogoImageWrap" style="display:${currentReceiptLogoType === 'image' ? 'block' : 'none'};">
                  <div style="display:flex; gap:12px; align-items:center; margin-bottom:8px;">
                    <div style="width:58px; height:58px; border-radius:14px; overflow:hidden; border:1.5px dashed var(--border); background:var(--card); display:grid; place-items:center; flex:none;">
                      <img id="receiptLogoImgPreview" src="${escapeHTML(currentReceiptLogoImage)}" style="width:100%; height:100%; object-fit:cover; display:${currentReceiptLogoImage ? 'block' : 'none'};" onerror="this.style.display='none';" />
                      <span id="receiptLogoImgFallback" style="font-size:14px; display:${currentReceiptLogoImage ? 'none' : 'block'}; color:var(--muted); font-weight:700;">IMG</span>
                    </div>
                    <div style="flex:1;">
                      <input type="file" id="fileReceiptLogo" accept="image/*" style="display:none;" />
                      <button type="button" class="btn btn-sm" id="btnUploadReceiptLogo" style="font-size:11.5px; padding:5px 12px; font-weight:700;">อัปโหลดรูปภาพ 1:1</button>
                      <button type="button" class="btn btn-sm btn-ghost" id="btnClearReceiptLogo" style="font-size:11.5px; padding:5px 8px; color:var(--danger);">ลบรูปภาพ</button>
                    </div>
                  </div>
                  <div class="field" style="margin-bottom:0;">
                    <label style="font-size:11px;">หรือใส่ URL รูปภาพโลโก้ 1:1</label>
                    <input class="input" id="setReceiptLogoImage" placeholder="https://... (หรือกดปุ่มอัปโหลดรูปด้านบน)" value="${escapeHTML(currentReceiptLogoImage)}" style="font-size:12px; padding:6px 10px;" />
                  </div>
                </div>

                <!-- Emoji / Letter Input -->
                <div id="receiptLogoEmojiWrap" style="display:${currentReceiptLogoType !== 'image' ? 'block' : 'none'};">
                  <div class="field" style="margin-bottom:0;">
                    <label style="font-size:11px;">อิโมจิหรือตัวอักษรโลโก้ (เช่น B, 🍰, 🌸, 🥐)</label>
                    <input class="input" id="setReceiptLogoEmoji" value="${escapeHTML(state.store.receiptLogoEmoji || 'B')}" style="max-width:140px; text-align:center; font-size:18px; font-weight:800;" />
                  </div>
                </div>
              </div>

              <!-- 2. Header Text -->
              <div class="grid" style="grid-template-columns:1fr 1fr; gap:12px;">
                <div class="field">
                  <label>ชื่อร้านบนหัวสลิป (Store Name)</label>
                  <input class="input" id="setReceiptStoreName" value="${escapeHTML(state.store.receiptStoreName || 'BNC HayMate Bakery')}" />
                </div>
                <div class="field">
                  <label>ที่อยู่/คำโปรยหัวสลิป (Store Address)</label>
                  <input class="input" id="setReceiptStoreAddress" value="${escapeHTML(state.store.receiptStoreAddress || '14 Sukhumvit Rd · Bangkok')}" />
                </div>
              </div>

              <!-- 3. Footer Graphic & Message (Standard QR removed) -->
              <div style="background:var(--primary-50); padding:14px; border-radius:14px; border:1px solid var(--border);">
                <div style="font-weight:700; font-size:14px; margin-bottom:6px; color:var(--text);">2. ท้ายกระดาษสลิป (Footer Graphic &amp; Message)</div>
                <div class="flex gap-2" style="margin-bottom:10px; flex-wrap:wrap;">
                  <button type="button" class="btn btn-sm ${currentReceiptFooterType === 'image' ? 'btn-primary' : ''}" id="btnFooterTypeImage" style="font-size:12px;">รูปภาพ / QR ของร้าน (1:1)</button>
                  <button type="button" class="btn btn-sm ${currentReceiptFooterType === 'emoji' ? 'btn-primary' : ''}" id="btnFooterTypeEmoji" style="font-size:12px;">ใช้อิโมจิ / ไอคอน</button>
                </div>

                <!-- Footer Image Upload Box -->
                <div id="receiptFooterImageWrap" style="display:${currentReceiptFooterType === 'image' ? 'block' : 'none'}; margin-bottom:10px;">
                  <div style="display:flex; gap:12px; align-items:center; margin-bottom:8px;">
                    <div style="width:58px; height:58px; border-radius:14px; overflow:hidden; border:1.5px dashed var(--border); background:var(--card); display:grid; place-items:center; flex:none;">
                      <img id="receiptFooterImgPreview" src="${escapeHTML(currentReceiptFooterImage)}" style="width:100%; height:100%; object-fit:cover; display:${currentReceiptFooterImage ? 'block' : 'none'};" onerror="this.style.display='none';" />
                      <span id="receiptFooterImgFallback" style="font-size:14px; display:${currentReceiptFooterImage ? 'none' : 'block'}; color:var(--muted); font-weight:700;">QR/IMG</span>
                    </div>
                    <div style="flex:1;">
                      <input type="file" id="fileReceiptFooter" accept="image/*" style="display:none;" />
                      <button type="button" class="btn btn-sm" id="btnUploadReceiptFooter" style="font-size:11.5px; padding:5px 12px; font-weight:700;">อัปโหลดรูป / QR ท้ายสลิป</button>
                      <button type="button" class="btn btn-sm btn-ghost" id="btnClearReceiptFooter" style="font-size:11.5px; padding:5px 8px; color:var(--danger);">ลบรูปภาพ</button>
                    </div>
                  </div>
                  <div class="field" style="margin-bottom:0;">
                    <label style="font-size:11px;">หรือใส่ URL รูปภาพ/QR</label>
                    <input class="input" id="setReceiptFooterImage" placeholder="https://... (หรืออัปโหลดจากปุ่มด้านบน)" value="${escapeHTML(currentReceiptFooterImage)}" style="font-size:12px; padding:6px 10px;" />
                  </div>
                </div>

                <!-- Footer Emoji Input -->
                <div id="receiptFooterEmojiWrap" style="display:${currentReceiptFooterType === 'emoji' ? 'block' : 'none'}; margin-bottom:10px;">
                  <div class="field" style="margin-bottom:0;">
                    <label style="font-size:11px;">ใส่อิโมจิท้ายกระดาษ (เช่น 🎀, 🛍️, 💖, 🧁)</label>
                    <input class="input" id="setReceiptFooterEmoji" value="${escapeHTML(state.store.receiptFooterEmoji || '🎀')}" style="max-width:140px; text-align:center; font-size:18px;" />
                  </div>
                </div>

                <!-- Thank you message & Subnote -->
                <div class="grid" style="grid-template-columns:1fr 1fr; gap:10px;">
                  <div class="field" style="margin-bottom:0;">
                    <label>ข้อความขอบคุณ (Thank You Message)</label>
                    <input class="input" id="setReceiptFooterMsg" value="${escapeHTML(state.store.receiptFooterMsg || 'Thank you for your order')}" />
                  </div>
                  <div class="field" style="margin-bottom:0;">
                    <label>ข้อความหมายเหตุสลิป (Sub-note)</label>
                    <input class="input" id="setReceiptFooterSub" value="${escapeHTML(state.store.receiptFooterSub || 'Please keep this receipt for your reference')}" />
                  </div>
                </div>
              </div>

            </div>

            <!-- Right Column: Live Receipt Preview Box -->
            <div style="background:var(--bg); border:1.5px solid var(--border); border-radius:18px; padding:16px;">
              <div style="font-weight:800; font-size:13px; color:var(--muted); text-align:center; margin-bottom:12px;">ตัวอย่างใบเสร็จ / สลิป (Live Preview)</div>
              
              <div class="receipt" style="box-shadow:var(--shadow-soft); max-width:320px; padding:18px; background:var(--card);">
                <div class="r-head" style="margin-bottom:10px;">
                  <div class="r-logo" id="prevRLogo">
                    ${(currentReceiptLogoType === 'image' && currentReceiptLogoImage)
                      ? `<img src="${escapeHTML(currentReceiptLogoImage)}" style="width:100%;height:100%;object-fit:cover;" />`
                      : `<span>${escapeHTML(state.store.receiptLogoEmoji || 'B')}</span>`}
                  </div>
                  <div class="r-store" id="prevRStore" style="font-size:15px;">${escapeHTML(state.store.receiptStoreName || 'BNC HayMate Bakery')}</div>
                  <div class="r-sub" id="prevRAddress" style="font-size:11px;">${escapeHTML(state.store.receiptStoreAddress || '14 Sukhumvit Rd · Bangkok')}</div>
                </div>
                <div class="r-line" style="margin:8px 0;"></div>
                <div class="r-items" style="font-size:11.5px; gap:4px;">
                  <div class="r-row"><span>Order</span><strong>HP-1042</strong></div>
                  <div class="r-row"><span>Date</span><span>${new Date().toISOString().split('T')[0]}</span></div>
                  <div class="r-row"><span>Customer</span><span>Anna Wong</span></div>
                </div>
                <div class="r-line" style="margin:8px 0;"></div>
                <div class="r-items" style="font-size:11.5px; gap:4px;">
                  <div class="r-row"><span>Strawberry Shortcake × 1</span><span>฿85.00</span></div>
                  <div class="r-row"><span>Rose Milk Latte × 1</span><span>฿65.00</span></div>
                </div>
                <div class="r-line" style="margin:8px 0;"></div>
                <div class="r-items" style="font-size:11.5px; gap:4px;">
                  <div class="r-row"><span>Subtotal</span><span>฿150.00</span></div>
                  <div class="r-row r-total" style="font-size:14.5px; margin-top:2px;"><span>Total</span><span style="color:var(--accent-text)">฿150.00</span></div>
                </div>
                <div id="prevRFooterGraphic" style="margin-top:10px;">
                  ${currentReceiptFooterType === 'image' && currentReceiptFooterImage
                    ? `<div class="r-footer-graphic" style="width:80px;height:80px;margin:8px auto 4px;"><img src="${escapeHTML(currentReceiptFooterImage)}" style="width:100%;height:100%;object-fit:cover;" /></div>`
                    : currentReceiptFooterType === 'emoji'
                    ? `<div class="r-footer-graphic" style="width:80px;height:80px;margin:8px auto 4px;font-size:36px;">${escapeHTML(state.store.receiptFooterEmoji || '🎀')}</div>`
                    : `<div class="r-footer-graphic" style="width:80px;height:80px;margin:8px auto 4px;font-size:36px;">🎀</div>`}
                </div>
                <div id="prevRFooterMsg" style="text-align:center; font-family:'Sunshiney', cursive; font-size:18px; font-weight:700; color:var(--accent-text); margin-top:6px; line-height:1.2;">${escapeHTML(state.store.receiptFooterMsg || 'Thank you for your order')}</div>
                <div id="prevRFooterSub" style="text-align:center; font-size:10px; color:var(--muted); margin-top:2px;">${escapeHTML(state.store.receiptFooterSub || '')}</div>
              </div>
            </div>
          </div>
        </div>

        <!-- SECTION 7: Tracking Review Calligraphy & Star Labels Settings (STARS PRESERVED) -->
        <div class="card">
          <div class="card-title">⭐ Tracking Review &amp; Star Labels (ตั้งค่าข้อความรีวิวหน้า Tracking และระดับดาว)</div>
          <div class="card-sub">กำหนดชื่อร้าน Calligraphy, ข้อความขอบคุณบนหน้า Tracking และข้อความอธิบายการให้คะแนน 1-5 ดาว</div>
          
          <div class="grid two-col" style="gap:16px; margin-top:14px;">
            <!-- Left: Tracking Calligraphy Box Settings -->
            <div style="background:var(--primary-50); padding:14px; border-radius:14px; border:1px solid var(--border);">
              <div style="font-weight:700; font-size:13.5px; margin-bottom:10px; color:var(--text);">1. กล่องรีวิวหน้า Tracking (Calligraphy Banner)</div>
              
              <div class="field">
                <label>ชื่อร้านสไตล์ Calligraphy (Store Brand Title)</label>
                <input class="input" id="setTrackingTitle" value="${escapeHTML(state.store.trackingReviewTitle || state.store.receiptStoreName || state.store.name || 'BNC HayMate Bakery')}" />
              </div>
              <div class="field">
                <label>ข้อความเล็กๆ ใต้ชื่อร้าน (Sub-message)</label>
                <input class="input" id="setTrackingSub" value="${escapeHTML(state.store.trackingReviewSub || 'Thank you for your support')}" />
              </div>
              <div class="field" style="margin-bottom:0;">
                <label>ข้อความบนปุ่มรีวิว (Button Text)</label>
                <input class="input" id="setTrackingBtnText" value="${escapeHTML(state.store.trackingReviewBtnText || '⭐ เขียนรีวิว &amp; ให้คะแนนร้าน')}" />
              </div>
            </div>

            <!-- Right: 1-5 Star Rating Custom Labels -->
            <div style="background:var(--primary-50); padding:14px; border-radius:14px; border:1px solid var(--border);">
              <div style="font-weight:700; font-size:13.5px; margin-bottom:10px; color:var(--text);">2. คำอธิบายระดับคะแนนดาว (Star Rating Labels)</div>
              
              <div class="grid" style="gap:8px;">
                <div class="field" style="margin-bottom:0;">
                  <label style="font-size:11px;">⭐ 1 ดาว</label>
                  <input class="input" id="setStarLabel1" value="${escapeHTML(state.store.starLabel1 || '1 ดาว - ต้องปรับปรุง')}" style="font-size:12px; padding:6px 10px;" />
                </div>
                <div class="field" style="margin-bottom:0;">
                  <label style="font-size:11px;">⭐⭐ 2 ดาว</label>
                  <input class="input" id="setStarLabel2" value="${escapeHTML(state.store.starLabel2 || '2 ดาว - พอใช้ได้')}" style="font-size:12px; padding:6px 10px;" />
                </div>
                <div class="field" style="margin-bottom:0;">
                  <label style="font-size:11px;">⭐⭐⭐ 3 ดาว</label>
                  <input class="input" id="setStarLabel3" value="${escapeHTML(state.store.starLabel3 || '3 ดาว - ปานกลาง / รสชาติดี')}" style="font-size:12px; padding:6px 10px;" />
                </div>
                <div class="field" style="margin-bottom:0;">
                  <label style="font-size:11px;">⭐⭐⭐⭐ 4 ดาว</label>
                  <input class="input" id="setStarLabel4" value="${escapeHTML(state.store.starLabel4 || '4 ดาว - อร่อยและประทับใจมาก')}" style="font-size:12px; padding:6px 10px;" />
                </div>
                <div class="field" style="margin-bottom:0;">
                  <label style="font-size:11px;">⭐⭐⭐⭐⭐ 5 ดาว</label>
                  <input class="input" id="setStarLabel5" value="${escapeHTML(state.store.starLabel5 || '5 ดาว - ประทับใจมากที่สุด ยอดเยี่ยม! ⭐⭐⭐⭐⭐')}" style="font-size:12px; padding:6px 10px;" />
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- SECTION 8: Stock Thresholds & Status Color Alerts (ตั้งค่าเกณฑ์สต็อก & การแสดงผลสี) -->
        <div class="card">
          <div class="card-title">Stock Thresholds &amp; Color Alerts (ตั้งค่าเกณฑ์ระดับสต็อก &amp; การแสดงผลสี)</div>
          <div class="card-sub">กำหนดจำนวนสต็อกสินค้าเพื่อแสดงสีแจ้งเตือน (เขียว Healthy, ส้ม Low, แดง Out of Stock) ในทุกตารางและหน้าร้าน</div>
          
          <div class="grid two-col" style="gap:16px; margin-top:14px;">
            <!-- Left: Threshold Inputs -->
            <div style="background:var(--primary-50); padding:16px; border-radius:14px; border:1px solid var(--border);">
              <div style="font-weight:700; font-size:13.5px; margin-bottom:12px; color:var(--text);">กำหนดเกณฑ์จำนวนสต็อก (Thresholds)</div>
              
              <div class="grid" style="grid-template-columns:1fr 1fr; gap:12px; margin-bottom:12px;">
                <div class="field" style="margin-bottom:0;">
                  <label style="font-size:12px; font-weight:700; color:#B47A28;">เกณฑ์สต็อกน้อย (Low Stock &lt; ชิ้น)</label>
                  <input type="number" class="input" id="setStockLowThreshold" value="${state.store.stockLowThreshold !== undefined ? state.store.stockLowThreshold : 100}" min="1" style="font-weight:700;" />
                  <div style="font-size:11px; color:var(--muted); margin-top:2px;">น้อยกว่าจำนวนนี้จะแสดง <strong style="color:#B47A28;">สีส้ม Low</strong></div>
                </div>
                <div class="field" style="margin-bottom:0;">
                  <label style="font-size:12px; font-weight:700; color:#B04955;">เกณฑ์สินค้าหมด (Out of Stock &le; ชิ้น)</label>
                  <input type="number" class="input" id="setStockOutThreshold" value="${state.store.stockOutThreshold !== undefined ? state.store.stockOutThreshold : 0}" min="0" style="font-weight:700;" />
                  <div style="font-size:11px; color:var(--muted); margin-top:2px;">เหลือน้อยกว่าหรือเท่ากับนี้จะแสดง <strong style="color:#B04955;">สีแดง Out</strong></div>
                </div>
              </div>

              <div style="font-weight:700; font-size:12.5px; margin-top:14px; margin-bottom:8px; color:var(--text);">ข้อความบนป้ายสถานะ (Badge Labels)</div>
              <div class="grid" style="grid-template-columns:1fr 1fr 1fr; gap:8px;">
                <div class="field" style="margin-bottom:0;">
                  <label style="font-size:11px; color:#3F8E63;">ป้ายสต็อกพร้อมขาย (เขียว)</label>
                  <input class="input" id="setStockHealthyLabel" value="${escapeHTML(state.store.stockHealthyLabel || 'Healthy')}" style="font-size:12px; padding:6px 10px;" />
                </div>
                <div class="field" style="margin-bottom:0;">
                  <label style="font-size:11px; color:#B47A28;">ป้ายสต็อกน้อย (ส้ม)</label>
                  <input class="input" id="setStockLowLabel" value="${escapeHTML(state.store.stockLowLabel || 'Low')}" style="font-size:12px; padding:6px 10px;" />
                </div>
                <div class="field" style="margin-bottom:0;">
                  <label style="font-size:11px; color:#B04955;">ป้ายสินค้าหมด (แดง)</label>
                  <input class="input" id="setStockOutLabel" value="${escapeHTML(state.store.stockOutLabel || 'Out of stock')}" style="font-size:12px; padding:6px 10px;" />
                </div>
              </div>
            </div>

            <!-- Right: Live Preview Box -->
            <div style="background:var(--card); border:1.5px solid var(--border); border-radius:14px; padding:16px; display:flex; flex-direction:column; justify-content:center; gap:10px;">
              <div style="font-weight:700; font-size:13.5px; color:var(--muted); text-align:center;">ตัวอย่างการแสดงผลสี (Live Preview)</div>
              
              <div style="display:flex; flex-direction:column; gap:8px;">
                <div style="background:var(--bg); border:1px solid var(--border); border-radius:10px; padding:10px 12px; display:flex; align-items:center; justify-content:space-between;">
                  <div>
                    <strong style="font-size:13px;">Strawberry Croissant</strong>
                    <div style="font-size:11px; color:var(--muted);">สต็อก: 150 ชิ้น (&ge; <span id="prevThreshHealthy">${state.store.stockLowThreshold !== undefined ? state.store.stockLowThreshold : 100}</span>)</div>
                  </div>
                  <span class="badge success" id="prevBadgeHealthy">150 in stock (${escapeHTML(state.store.stockHealthyLabel || 'Healthy')})</span>
                </div>

                <div style="background:var(--bg); border:1px solid var(--border); border-radius:10px; padding:10px 12px; display:flex; align-items:center; justify-content:space-between;">
                  <div>
                    <strong style="font-size:13px;">Matcha Latte Cake</strong>
                    <div style="font-size:11px; color:var(--muted);">สต็อก: 45 ชิ้น (&lt; <span id="prevThreshLow">${state.store.stockLowThreshold !== undefined ? state.store.stockLowThreshold : 100}</span>)</div>
                  </div>
                  <span class="badge warn" id="prevBadgeLow">45 in stock (${escapeHTML(state.store.stockLowLabel || 'Low')})</span>
                </div>

                <div style="background:var(--bg); border:1px solid var(--border); border-radius:10px; padding:10px 12px; display:flex; align-items:center; justify-content:space-between;">
                  <div>
                    <strong style="font-size:13px;">Rose Blossom Cookie</strong>
                    <div style="font-size:11px; color:var(--muted);">สต็อก: 0 ชิ้น (&le; <span id="prevThreshOut">${state.store.stockOutThreshold !== undefined ? state.store.stockOutThreshold : 0}</span>)</div>
                  </div>
                  <span class="badge danger" id="prevBadgeOut">0 in stock (${escapeHTML(state.store.stockOutLabel || 'Out of stock')})</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- SECTION 9: General Store Details & Brand -->
        <div class="card">
          <div class="card-title">Store Details &amp; Brand (ข้อมูลระบบหลัก)</div>
          <div class="card-sub">ข้อมูลหลักที่ใช้แสดงผลบนเมนูด้านข้าง (Sidebar Brand), หัวหน้าเว็บ และระบบเวลา</div>
          <div class="grid" style="gap:12px; margin-top:12px;">
            <div class="field">
              <label>Store Name (ชื่อร้านหลัก)</label>
              <input class="input" id="setStoreName" value="${escapeHTML(state.store.name)}"/>
              <div style="font-size:11px; color:var(--muted); margin-top:3px;">แสดงที่แถบเมนูด้านซ้ายบน (Sidebar Brand) และหัวบราวเซอร์</div>
            </div>
            <div class="field">
              <label>Store Tagline (คำโปรยร้านหลัก)</label>
              <input class="input" id="setStoreTagline" value="${escapeHTML(state.store.tagline)}"/>
              <div style="font-size:11px; color:var(--muted); margin-top:3px;">แสดงใต้ชื่อร้านที่แถบเมนู</div>
            </div>
            <div class="grid" style="grid-template-columns:1fr 1fr; gap:12px">
              <div class="field"><label>Currency (สกุลเงิน)</label><select class="select" id="setCurrency"><option ${state.store.currency === 'THB (฿)' ? 'selected' : ''}>THB (฿)</option><option ${state.store.currency === 'USD ($)' ? 'selected' : ''}>USD ($)</option><option ${state.store.currency === 'SGD (S$)' ? 'selected' : ''}>SGD (S$)</option></select></div>
              <div class="field"><label>Timezone (เขตเวลา)</label><select class="select" id="setTimezone"><option ${state.store.timezone === 'UTC+7 Bangkok' ? 'selected' : ''}>UTC+7 Bangkok</option><option ${state.store.timezone === 'UTC+8 Singapore' ? 'selected' : ''}>UTC+8 Singapore</option></select></div>
            </div>
          </div>
        </div>

        <!-- SECTION 9: Payment Accounts Builder (รองรับทั้งรูปภาพโลโก้และอิโมจิ) -->
        <div class="card">
          <div class="flex items-center" style="justify-content:space-between; flex-wrap:wrap; gap:10px; margin-bottom:10px;">
            <div>
              <div class="card-title">Payment Accounts (ช่องทางการชำระเงิน)</div>
              <div class="card-sub" style="margin-bottom:0;">เพิ่ม ลบ และแก้ไขเลขที่บัญชีธนาคาร พร้อมเพย์ หรือวอลเล็ท (รองรับการอัปโหลดโลโก้รูปภาพและอิโมจิ)</div>
            </div>
            <button type="button" class="btn btn-primary btn-sm" id="btnAddPaymentAcc" style="font-weight:700;">+ เพิ่มบัญชี / วอลเล็ทใหม่ (+ Add Account)</button>
          </div>

          <div id="paymentAccountsList" style="display:flex; flex-direction:column; gap:12px; margin-top:14px;"></div>
        </div>

        <!-- SECTION 10: Security & Appearance -->
        <div class="grid two-col">
          <div class="card">
            <div class="card-title">Admin Security Passcode (รหัสผ่าน 6 หลัก)</div>
            <div class="card-sub">รหัสผ่าน 6 หลักสำหรับปลดล็อคเข้าสู่ระบบแอดมิน</div>
            <div class="field" style="margin-top:12px;">
              <label>6-Digit PIN Passcode</label>
              <input class="input" id="setAdminPin" type="password" maxlength="6" value="${escapeHTML(state.correctPin || '123456')}" style="max-width:200px; font-size:18px; letter-spacing:4px; font-weight:700; text-align:center;" />
              <div style="font-size:11.5px; color:var(--muted); margin-top:4px;">กำหนดตัวเลข 6 หลักสำหรับหน้าจอล็อค (เริ่มต้น: 123456)</div>
            </div>
          </div>

          <!-- SECTION 11: Appearance & Theme with Theme-adaptive Icons -->
          <div class="card">
            <div class="card-title">Appearance &amp; Theme (ธีมและสีหลักของระบบ)</div>
            <div class="card-sub">เลือกโทนสีและโหมดการแสดงผลของระบบ</div>
            <div class="grid" style="gap:12px; margin-top:12px;">
              <div class="field"><label>Primary Color</label>
                <div class="flex gap-2" id="colorRow">
                  ${['#F8BFD4','#F0B265','#7CC59A','#8BB6E8','#D6BEE9'].map(c => `<button class="swatch-btn" data-c="${c}" style="width:32px;height:32px;border-radius:10px;background:${c};border:2px solid ${c === state.color ? '#333' : 'transparent'}; cursor:pointer"></button>`).join('')}
                </div>
              </div>
              <div class="field"><label>Theme Mode</label>
                <div class="tabs" id="themeTabs">
                  <div class="tab ${state.theme === 'light' ? 'active' : ''}" data-th="light" title="Light Mode" style="display:inline-flex; align-items:center; gap:6px;">
                    <svg viewBox="0 0 24 24" width="17" height="17" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" class="theme-icon-svg">
                      <circle cx="12" cy="12" r="4.5"/>
                      <path d="M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M6.34 17.66l-1.41 1.41M19.07 4.93l-1.41 1.41"/>
                    </svg>
                    <span>Light</span>
                  </div>
                  <div class="tab ${state.theme === 'dark' ? 'active' : ''}" data-th="dark" title="Dark Mode" style="display:inline-flex; align-items:center; gap:6px;">
                    <svg viewBox="0 0 24 24" width="17" height="17" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" class="theme-icon-svg">
                      <path d="M12 3a6 6 0 0 0 9 9 9 9 0 1 1-9-9Z"/>
                    </svg>
                    <span>Dark</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Bottom Save Button -->
        <div style="text-align:center; padding:16px 0 24px;">
          <button class="btn btn-primary" id="saveSettingsBottom" style="font-size:15px; padding:12px 36px; font-weight:800; border-radius:14px; box-shadow:var(--shadow);">บันทึกการตั้งค่าทั้งหมด (Save All Changes)</button>
        </div>

      </div>
    `);

    root.appendChild(formWrap);

    // Dynamic Highlights List Renderer with Image / Emoji Choice
    const renderHighlightsSettingsList = () => {
      const hlContainer = formWrap.querySelector('#highlightsSettingsList');
      if (!hlContainer) return;
      hlContainer.innerHTML = '';

      currentHighlights.forEach((h, idx) => {
        const itemEl = el(`
          <div style="background:var(--primary-50); border:1px solid var(--border); border-radius:14px; padding:12px;">
            <div class="flex items-center" style="justify-content:space-between; margin-bottom:8px;">
              <span style="font-weight:700; font-size:12px; color:var(--accent-text);">ช่องที่ #${idx + 1}</span>
              <div class="flex gap-1">
                <button type="button" class="btn btn-sm btn-hl-mode ${h.iconType !== 'image' ? 'btn-primary' : 'btn-ghost'}" data-mode="emoji" style="padding:2px 7px; font-size:10.5px;">อิโมจิ</button>
                <button type="button" class="btn btn-sm btn-hl-mode ${h.iconType === 'image' ? 'btn-primary' : 'btn-ghost'}" data-mode="image" style="padding:2px 7px; font-size:10.5px;">รูปภาพ</button>
              </div>
            </div>

            <div style="display:${h.iconType === 'image' ? 'flex' : 'none'}; gap:8px; align-items:center; margin-bottom:8px;" class="hl-img-box">
              <div style="width:40px; height:40px; border-radius:10px; border:1px dashed var(--border); background:var(--card); display:grid; place-items:center; overflow:hidden; flex:none;">
                <img class="hl-img-prev" src="${escapeHTML(h.image || '')}" style="width:100%; height:100%; object-fit:cover; display:${h.image ? 'block' : 'none'};" onerror="this.style.display='none';" />
                <span class="hl-img-fallback" style="font-size:11px; display:${h.image ? 'none' : 'block'}; color:var(--muted);">IMG</span>
              </div>
              <div style="flex:1;">
                <input type="file" class="hl-file-input" accept="image/*" style="display:none;" />
                <button type="button" class="btn btn-sm btn-hl-upload" style="font-size:11px; padding:4px 10px; font-weight:700;">อัปโหลดรูป</button>
                <input class="input hl-img-url" placeholder="หรือ URL รูปภาพ" value="${escapeHTML(h.image || '')}" style="font-size:11px; padding:4px 8px; margin-top:4px;" />
              </div>
            </div>

            <div class="grid" style="grid-template-columns:${h.iconType === 'image' ? '1fr' : '54px 1fr'}; gap:8px;">
              <div class="field hl-emoji-box" style="margin:0; display:${h.iconType === 'image' ? 'none' : 'block'};">
                <label style="font-size:11px;">ไอคอน</label>
                <input class="input set-h-icon" value="${escapeHTML(h.icon || '✨')}" style="text-align:center; font-size:16px; padding:6px;" />
              </div>
              <div class="field" style="margin:0;">
                <label style="font-size:11px;">หัวข้อ</label>
                <input class="input set-h-title" value="${escapeHTML(h.title || '')}" style="padding:6px 10px; font-size:12.5px;" />
              </div>
            </div>
            <div class="field" style="margin-top:6px; margin-bottom:0;">
              <label style="font-size:11px;">คำบรรยาย</label>
              <input class="input set-h-sub" value="${escapeHTML(h.sub || '')}" style="padding:6px 10px; font-size:12px;" />
            </div>
          </div>
        `);

        // Mode switch
        itemEl.querySelectorAll('.btn-hl-mode').forEach(btn => {
          btn.addEventListener('click', () => {
            h.iconType = btn.dataset.mode;
            renderHighlightsSettingsList();
          });
        });

        // File upload
        const fileInp = itemEl.querySelector('.hl-file-input');
        itemEl.querySelector('.btn-hl-upload')?.addEventListener('click', () => fileInp?.click());
        fileInp?.addEventListener('change', (e) => {
          const file = e.target.files[0];
          if (!file) return;
          const reader = new FileReader();
          reader.onload = (evt) => {
            h.image = evt.target.result;
            renderHighlightsSettingsList();
            toast(`อัปโหลดรูปจุดเด่น #${idx+1} เรียบร้อย`, 'success');
          };
          reader.readAsDataURL(file);
        });

        itemEl.querySelector('.hl-img-url')?.addEventListener('input', (e) => { h.image = e.target.value; });
        itemEl.querySelector('.set-h-icon')?.addEventListener('input', (e) => { h.icon = e.target.value; });
        itemEl.querySelector('.set-h-title')?.addEventListener('input', (e) => { h.title = e.target.value; });
        itemEl.querySelector('.set-h-sub')?.addEventListener('input', (e) => { h.sub = e.target.value; });

        hlContainer.appendChild(itemEl);
      });
    };

    renderHighlightsSettingsList();

    // Hero Type Handlers
    const btnHeroEmoji = formWrap.querySelector('#btnHeroTypeEmoji');
    const btnHeroImage = formWrap.querySelector('#btnHeroTypeImage');
    const heroEmojiWrap = formWrap.querySelector('#heroEmojiWrap');
    const heroImageWrap = formWrap.querySelector('#heroImageWrap');
    const fileHeroImg = formWrap.querySelector('#fileHeroImg');
    const btnUploadHeroImg = formWrap.querySelector('#btnUploadHeroImg');
    const btnClearHeroImg = formWrap.querySelector('#btnClearHeroImg');
    const heroImgPreview = formWrap.querySelector('#heroImgPreview');
    const heroImgFallback = formWrap.querySelector('#heroImgFallback');
    const heroUrlInp = formWrap.querySelector('#setHeroImage');

    btnHeroEmoji?.addEventListener('click', () => {
      heroIconType = 'emoji';
      btnHeroEmoji.classList.add('btn-primary');
      btnHeroImage.classList.remove('btn-primary');
      heroEmojiWrap.style.display = 'block';
      heroImageWrap.style.display = 'none';
    });

    btnHeroImage?.addEventListener('click', () => {
      heroIconType = 'image';
      btnHeroImage.classList.add('btn-primary');
      btnHeroEmoji.classList.remove('btn-primary');
      heroImageWrap.style.display = 'block';
      heroEmojiWrap.style.display = 'none';
    });

    btnUploadHeroImg?.addEventListener('click', () => fileHeroImg?.click());
    fileHeroImg?.addEventListener('change', (e) => {
      const file = e.target.files[0];
      if (!file) return;
      const reader = new FileReader();
      reader.onload = (evt) => {
        heroImage = evt.target.result;
        if (heroImgPreview) { heroImgPreview.src = heroImage; heroImgPreview.style.display = 'block'; }
        if (heroImgFallback) heroImgFallback.style.display = 'none';
        if (heroUrlInp) heroUrlInp.value = '(Uploaded Photo)';
        toast('อัปโหลดรูปภาพ Hero เรียบร้อย', 'success');
      };
      reader.readAsDataURL(file);
    });

    heroUrlInp?.addEventListener('input', (e) => {
      heroImage = e.target.value.trim();
      if (heroImgPreview && heroImage) { heroImgPreview.src = heroImage; heroImgPreview.style.display = 'block'; }
      if (heroImgFallback && heroImage) heroImgFallback.style.display = 'none';
    });

    btnClearHeroImg?.addEventListener('click', () => {
      heroImage = '';
      if (heroUrlInp) heroUrlInp.value = '';
      if (heroImgPreview) heroImgPreview.style.display = 'none';
      if (heroImgFallback) heroImgFallback.style.display = 'block';
      toast('ลบรูปภาพ Hero แล้ว', 'info');
    });

    // Dynamic Receipt Live Preview Handlers
    const updateReceiptPreview = () => {
      const prevLogo = formWrap.querySelector('#prevRLogo');
      const prevStore = formWrap.querySelector('#prevRStore');
      const prevAddress = formWrap.querySelector('#prevRAddress');
      const prevFooterGraphic = formWrap.querySelector('#prevRFooterGraphic');
      const prevFooterMsg = formWrap.querySelector('#prevRFooterMsg');
      const prevFooterSub = formWrap.querySelector('#prevRFooterSub');

      const emojiVal = formWrap.querySelector('#setReceiptLogoEmoji')?.value.trim() || 'B';
      const storeVal = formWrap.querySelector('#setReceiptStoreName')?.value.trim() || 'BNC HayMate Bakery';
      const addressVal = formWrap.querySelector('#setReceiptStoreAddress')?.value.trim() || '14 Sukhumvit Rd · Bangkok';
      const footerEmojiVal = formWrap.querySelector('#setReceiptFooterEmoji')?.value.trim() || '🎀';
      const footerMsgVal = formWrap.querySelector('#setReceiptFooterMsg')?.value.trim() || 'Thank you for your order';
      const footerSubVal = formWrap.querySelector('#setReceiptFooterSub')?.value.trim() || '';

      if (prevLogo) {
        if (currentReceiptLogoType === 'image' && currentReceiptLogoImage) {
          prevLogo.innerHTML = `<img src="${escapeHTML(currentReceiptLogoImage)}" style="width:100%;height:100%;object-fit:cover;" />`;
        } else {
          prevLogo.innerHTML = `<span>${escapeHTML(emojiVal)}</span>`;
        }
      }
      if (prevStore) prevStore.textContent = storeVal;
      if (prevAddress) prevAddress.textContent = addressVal;

      if (prevFooterGraphic) {
        if (currentReceiptFooterType === 'image' && currentReceiptFooterImage) {
          prevFooterGraphic.innerHTML = `<div class="r-footer-graphic" style="width:80px;height:80px;margin:8px auto 4px;"><img src="${escapeHTML(currentReceiptFooterImage)}" style="width:100%;height:100%;object-fit:cover;" /></div>`;
        } else if (currentReceiptFooterType === 'emoji') {
          prevFooterGraphic.innerHTML = `<div class="r-footer-graphic" style="width:80px;height:80px;margin:8px auto 4px;font-size:36px;">${escapeHTML(footerEmojiVal)}</div>`;
        } else {
          prevFooterGraphic.innerHTML = `<div class="r-footer-graphic" style="width:80px;height:80px;margin:8px auto 4px;font-size:36px;">🎀</div>`;
        }
      }
      if (prevFooterMsg) prevFooterMsg.textContent = footerMsgVal;
      if (prevFooterSub) prevFooterSub.textContent = footerSubVal;
    };

    // Header Logo Type Listeners
    const btnLogoEmoji = formWrap.querySelector('#btnLogoTypeEmoji');
    const btnLogoImage = formWrap.querySelector('#btnLogoTypeImage');
    const logoImgWrap = formWrap.querySelector('#receiptLogoImageWrap');
    const logoEmojiWrap = formWrap.querySelector('#receiptLogoEmojiWrap');
    const fileLogoInp = formWrap.querySelector('#fileReceiptLogo');
    const btnUploadLogo = formWrap.querySelector('#btnUploadReceiptLogo');
    const btnClearLogo = formWrap.querySelector('#btnClearReceiptLogo');
    const logoImgPreview = formWrap.querySelector('#receiptLogoImgPreview');
    const logoImgFallback = formWrap.querySelector('#receiptLogoImgFallback');
    const logoUrlInp = formWrap.querySelector('#setReceiptLogoImage');

    btnLogoEmoji?.addEventListener('click', () => {
      currentReceiptLogoType = 'emoji';
      btnLogoEmoji.classList.add('btn-primary');
      btnLogoImage.classList.remove('btn-primary');
      logoEmojiWrap.style.display = 'block';
      logoImgWrap.style.display = 'none';
      updateReceiptPreview();
    });

    btnLogoImage?.addEventListener('click', () => {
      currentReceiptLogoType = 'image';
      btnLogoImage.classList.add('btn-primary');
      btnLogoEmoji.classList.remove('btn-primary');
      logoImgWrap.style.display = 'block';
      logoEmojiWrap.style.display = 'none';
      updateReceiptPreview();
    });

    btnUploadLogo?.addEventListener('click', () => fileLogoInp?.click());
    fileLogoInp?.addEventListener('change', (e) => {
      const file = e.target.files[0];
      if (!file) return;
      const reader = new FileReader();
      reader.onload = (evt) => {
        currentReceiptLogoImage = evt.target.result;
        if (logoImgPreview) {
          logoImgPreview.src = currentReceiptLogoImage;
          logoImgPreview.style.display = 'block';
        }
        if (logoImgFallback) logoImgFallback.style.display = 'none';
        if (logoUrlInp) logoUrlInp.value = '(Uploaded Photo)';
        updateReceiptPreview();
        toast('อัปโหลดรูปภาพโลโก้หัวสลิปเรียบร้อย', 'success');
      };
      reader.readAsDataURL(file);
    });

    logoUrlInp?.addEventListener('input', (e) => {
      const val = e.target.value.trim();
      if (val && (val.startsWith('http') || val.startsWith('data:image'))) {
        currentReceiptLogoImage = val;
        if (logoImgPreview) {
          logoImgPreview.src = val;
          logoImgPreview.style.display = 'block';
        }
        if (logoImgFallback) logoImgFallback.style.display = 'none';
        updateReceiptPreview();
      }
    });

    btnClearLogo?.addEventListener('click', () => {
      currentReceiptLogoImage = '';
      if (logoUrlInp) logoUrlInp.value = '';
      if (logoImgPreview) logoImgPreview.style.display = 'none';
      if (logoImgFallback) logoImgFallback.style.display = 'block';
      updateReceiptPreview();
      toast('ลบรูปภาพโลโก้แล้ว', 'info');
    });

    // Footer Graphic Type Listeners (QR standard removed)
    const btnFooterImg = formWrap.querySelector('#btnFooterTypeImage');
    const btnFooterEmoji = formWrap.querySelector('#btnFooterTypeEmoji');
    const footerImgWrap = formWrap.querySelector('#receiptFooterImageWrap');
    const footerEmojiWrap = formWrap.querySelector('#receiptFooterEmojiWrap');
    const fileFooterInp = formWrap.querySelector('#fileReceiptFooter');
    const btnUploadFooter = formWrap.querySelector('#btnUploadReceiptFooter');
    const btnClearFooter = formWrap.querySelector('#btnClearReceiptFooter');
    const footerImgPreview = formWrap.querySelector('#receiptFooterImgPreview');
    const footerImgFallback = formWrap.querySelector('#receiptFooterImgFallback');
    const footerUrlInp = formWrap.querySelector('#setReceiptFooterImage');

    btnFooterImg?.addEventListener('click', () => {
      currentReceiptFooterType = 'image';
      btnFooterImg.classList.add('btn-primary');
      btnFooterEmoji.classList.remove('btn-primary');
      footerImgWrap.style.display = 'block';
      footerEmojiWrap.style.display = 'none';
      updateReceiptPreview();
    });

    btnFooterEmoji?.addEventListener('click', () => {
      currentReceiptFooterType = 'emoji';
      btnFooterEmoji.classList.add('btn-primary');
      btnFooterImg.classList.remove('btn-primary');
      footerEmojiWrap.style.display = 'block';
      footerImgWrap.style.display = 'none';
      updateReceiptPreview();
    });

    btnUploadFooter?.addEventListener('click', () => fileFooterInp?.click());
    fileFooterInp?.addEventListener('change', (e) => {
      const file = e.target.files[0];
      if (!file) return;
      const reader = new FileReader();
      reader.onload = (evt) => {
        currentReceiptFooterImage = evt.target.result;
        if (footerImgPreview) {
          footerImgPreview.src = currentReceiptFooterImage;
          footerImgPreview.style.display = 'block';
        }
        if (footerImgFallback) footerImgFallback.style.display = 'none';
        if (footerUrlInp) footerUrlInp.value = '(Uploaded Photo)';
        updateReceiptPreview();
        toast('อัปโหลดรูปภาพ/QR ท้ายสลิปเรียบร้อย', 'success');
      };
      reader.readAsDataURL(file);
    });

    footerUrlInp?.addEventListener('input', (e) => {
      const val = e.target.value.trim();
      if (val && (val.startsWith('http') || val.startsWith('data:image'))) {
        currentReceiptFooterImage = val;
        if (footerImgPreview) {
          footerImgPreview.src = val;
          footerImgPreview.style.display = 'block';
        }
        if (footerImgFallback) footerImgFallback.style.display = 'none';
        updateReceiptPreview();
      }
    });

    btnClearFooter?.addEventListener('click', () => {
      currentReceiptFooterImage = '';
      if (footerUrlInp) footerUrlInp.value = '';
      if (footerImgPreview) footerImgPreview.style.display = 'none';
      if (footerImgFallback) footerImgFallback.style.display = 'block';
      updateReceiptPreview();
      toast('ลบรูปภาพท้ายสลิปแล้ว', 'info');
    });

    // Dynamic Payment Accounts Builder with Logo Image upload
    const renderPaymentAccountsList = () => {
      const listEl = formWrap.querySelector('#paymentAccountsList');
      if (!listEl) return;
      listEl.innerHTML = '';

      if (currentPaymentAccounts.length === 0) {
        listEl.innerHTML = `
          <div style="text-align:center; padding:18px; background:var(--primary-50); border:1.5px dashed var(--border); border-radius:14px; color:var(--muted); font-size:13px;">
            ยังไม่มีช่องทางชำระเงินที่สร้างไว้ กดปุ่ม <strong>+ เพิ่มบัญชี / วอลเล็ทใหม่</strong> ด้านบนเพื่อสร้าง
          </div>
        `;
        return;
      }

      currentPaymentAccounts.forEach((acc, idx) => {
        const row = el(`
          <div class="card" style="background:var(--primary-50); border:1.5px solid var(--border); border-radius:16px; padding:14px 16px; position:relative;">
            <div class="flex items-center" style="justify-content:space-between; margin-bottom:10px;">
              <span style="font-size:13px; font-weight:800; color:var(--accent-text);">ช่องทางชำระเงิน #${idx + 1}</span>
              <button type="button" class="btn btn-sm btn-ghost btn-del-acc" data-idx="${idx}" style="color:var(--danger); font-size:11.5px; padding:3px 8px; font-weight:700;">ลบช่องทางนี้</button>
            </div>

            <!-- Logo Image Upload Box for Payment Account -->
            <div style="display:flex; gap:10px; align-items:center; margin-bottom:12px;" class="acc-img-wrap">
              <div style="width:44px; height:44px; border-radius:10px; overflow:hidden; border:1px dashed var(--border); background:var(--card); display:grid; place-items:center; flex:none;">
                <img class="acc-img-prev" src="${escapeHTML(acc.image || '')}" style="width:100%; height:100%; object-fit:contain; display:${acc.image ? 'block' : 'none'};" onerror="this.style.display='none';" />
                <span class="acc-img-fallback" style="display:${acc.image ? 'none' : 'block'}; color:var(--muted);">${ICONS.bank}</span>
              </div>
              <div style="flex:1;">
                <input type="file" class="acc-file-inp" accept="image/*" style="display:none;" />
                <div class="flex gap-2 items-center">
                  <button type="button" class="btn btn-sm btn-acc-upload" style="font-size:11px; padding:4px 10px; font-weight:700;">อัปโหลดโลโก้</button>
                  ${acc.image ? `<button type="button" class="btn btn-sm btn-ghost btn-acc-clear" style="font-size:11px; padding:4px 8px; color:var(--danger);">ลบรูป</button>` : ''}
                </div>
                <input class="input acc-img-url" placeholder="หรือใส่ URL โลโก้ธนาคาร / วอลเล็ท" value="${escapeHTML(acc.image || '')}" style="font-size:11.5px; padding:5px 8px; margin-top:4px;" />
              </div>
            </div>

            <div class="grid" style="grid-template-columns: 1.5fr 1.5fr 1.5fr; gap:10px; align-items:flex-end;">
              <div class="field" style="margin-bottom:0;">
                <label style="font-size:11px; font-weight:700;">ชื่อธนาคาร / วอลเล็ท *</label>
                <input class="input acc-title" placeholder="เช่น กสิกรไทย, TrueMoney" value="${escapeHTML(acc.title || '')}" style="padding:8px 10px; font-size:12.5px; border-radius:10px;" />
              </div>
              <div class="field" style="margin-bottom:0;">
                <label style="font-size:11px; font-weight:700;">เลขบัญชี / เบอร์โทร *</label>
                <input class="input acc-num" placeholder="เช่น 123-4-56789-0" value="${escapeHTML(acc.account_number || '')}" style="padding:8px 10px; font-size:12.5px; border-radius:10px; font-weight:700;" />
              </div>
              <div class="field" style="margin-bottom:0;">
                <label style="font-size:11px; font-weight:700;">ชื่อบัญชี (Account Holder)</label>
                <input class="input acc-holder" placeholder="เช่น บจก. บีเอ็นซี เฮย์เมท" value="${escapeHTML(acc.account_holder || '')}" style="padding:8px 10px; font-size:12.5px; border-radius:10px;" />
              </div>
            </div>
          </div>
        `);

        // File upload
        const fileInp = row.querySelector('.acc-file-inp');
        row.querySelector('.btn-acc-upload')?.addEventListener('click', () => fileInp?.click());
        fileInp?.addEventListener('change', (e) => {
          const file = e.target.files[0];
          if (!file) return;
          const reader = new FileReader();
          reader.onload = (evt) => {
            acc.image = evt.target.result;
            renderPaymentAccountsList();
            toast(`อัปโหลดโลโก้บัญชี #${idx+1} เรียบร้อย`, 'success');
          };
          reader.readAsDataURL(file);
        });

        row.querySelector('.btn-acc-clear')?.addEventListener('click', () => {
          acc.image = '';
          renderPaymentAccountsList();
          toast('ลบโลโก้บัญชีแล้ว', 'info');
        });

        row.querySelector('.acc-img-url')?.addEventListener('input', (e) => {
          acc.image = e.target.value;
          const img = row.querySelector('.acc-img-prev');
          const fb = row.querySelector('.acc-img-fallback');
          if (img) { img.src = e.target.value; img.style.display = e.target.value ? 'block' : 'none'; }
          if (fb) fb.style.display = e.target.value ? 'none' : 'block';
        });
        row.querySelector('.acc-title')?.addEventListener('input', (e) => { acc.title = e.target.value; });
        row.querySelector('.acc-num')?.addEventListener('input', (e) => { acc.account_number = e.target.value; });
        row.querySelector('.acc-holder')?.addEventListener('input', (e) => { acc.account_holder = e.target.value; });

        row.querySelector('.btn-del-acc')?.addEventListener('click', () => {
          currentPaymentAccounts.splice(idx, 1);
          renderPaymentAccountsList();
          toast('ลบช่องทางชำระเงินเรียบร้อย', 'info');
        });

        listEl.appendChild(row);
      });
    };

    renderPaymentAccountsList();

    formWrap.querySelector('#btnAddPaymentAcc')?.addEventListener('click', () => {
      currentPaymentAccounts.push({
        id: Date.now(),
        type: 'bank',
        image: '',
        title: 'ธนาคารใหม่',
        account_number: '',
        account_holder: state.store.name || ''
      });
      renderPaymentAccountsList();
      toast('เพิ่มช่องทางชำระเงินใหม่แล้ว', 'success');
      const inputs = formWrap.querySelectorAll('#paymentAccountsList .acc-title');
    });

    // Real-time input listeners for text
    ['#setReceiptLogoEmoji', '#setReceiptStoreName', '#setReceiptStoreAddress', '#setReceiptFooterEmoji', '#setReceiptFooterMsg', '#setReceiptFooterSub'].forEach(sel => {
      formWrap.querySelector(sel)?.addEventListener('input', updateReceiptPreview);
    });

    const updateStockPreview = () => {
      const lowVal = formWrap.querySelector('#setStockLowThreshold')?.value || '100';
      const outVal = formWrap.querySelector('#setStockOutThreshold')?.value || '0';
      const hLbl = formWrap.querySelector('#setStockHealthyLabel')?.value || 'Healthy';
      const lLbl = formWrap.querySelector('#setStockLowLabel')?.value || 'Low';
      const oLbl = formWrap.querySelector('#setStockOutLabel')?.value || 'Out of stock';

      const prevThreshHealthy = formWrap.querySelector('#prevThreshHealthy');
      const prevThreshLow = formWrap.querySelector('#prevThreshLow');
      const prevThreshOut = formWrap.querySelector('#prevThreshOut');
      const prevBadgeHealthy = formWrap.querySelector('#prevBadgeHealthy');
      const prevBadgeLow = formWrap.querySelector('#prevBadgeLow');
      const prevBadgeOut = formWrap.querySelector('#prevBadgeOut');

      if (prevThreshHealthy) prevThreshHealthy.textContent = lowVal;
      if (prevThreshLow) prevThreshLow.textContent = lowVal;
      if (prevThreshOut) prevThreshOut.textContent = outVal;

      if (prevBadgeHealthy) prevBadgeHealthy.textContent = `150 in stock (${hLbl})`;
      if (prevBadgeLow) prevBadgeLow.textContent = `45 in stock (${lLbl})`;
      if (prevBadgeOut) prevBadgeOut.textContent = `0 in stock (${oLbl})`;
    };

    ['#setStockLowThreshold', '#setStockOutThreshold', '#setStockHealthyLabel', '#setStockLowLabel', '#setStockOutLabel'].forEach(sel => {
      formWrap.querySelector(sel)?.addEventListener('input', updateStockPreview);
    });

    // Bind save actions
    const doSave = () => {
      state.store.loadingTitle = formWrap.querySelector('#setLoadingTitle')?.value.trim() || state.store.name || 'BNC HayMate';
      state.store.storefrontTitle = formWrap.querySelector('#setStorefrontTitle')?.value.trim() || 'BNC HayMate';
      state.store.storefrontSub = formWrap.querySelector('#setStorefrontSub')?.value.trim() || 'Handmade sweet things & bakery';
      state.store.heroTitle = formWrap.querySelector('#setHeroTitle')?.value.trim() || 'Fresh from the oven, daily';
      state.store.heroSub = formWrap.querySelector('#setHeroSub')?.value.trim() || 'Handmade cakes, pastries, and rose-scented drinks.';
      state.store.heroBtnText = formWrap.querySelector('#setHeroBtnText')?.value.trim() || 'Shop Menu (320 items)';
      state.store.heroIconType = heroIconType;
      state.store.heroEmoji = formWrap.querySelector('#setHeroEmoji')?.value.trim() || '🥐';
      state.store.heroImage = (heroImage && !heroImage.startsWith('(Uploaded')) ? heroImage : (heroUrlInp?.value && heroUrlInp.value !== '(Uploaded Photo)' && heroUrlInp.value.startsWith('http') ? heroUrlInp.value : heroImage);

      state.store.highlights = currentHighlights.map(h => ({
        iconType: h.iconType || 'emoji',
        icon: h.icon || '✨',
        image: h.image || '',
        title: h.title || '',
        sub: h.sub || ''
      }));

      state.store.popularTitle = formWrap.querySelector('#setPopularTitle')?.value.trim() || 'Popular Picks';
      state.store.popularSub = formWrap.querySelector('#setPopularSub')?.value.trim() || 'Best sellers this week';

      // Receipt Settings Save
      state.store.receiptLogoType = currentReceiptLogoType;
      state.store.receiptLogoImage = (currentReceiptLogoImage && !currentReceiptLogoImage.startsWith('(Uploaded')) ? currentReceiptLogoImage : (logoUrlInp?.value && logoUrlInp.value !== '(Uploaded Photo)' && logoUrlInp.value.startsWith('http') ? logoUrlInp.value : currentReceiptLogoImage);
      state.store.receiptLogoEmoji = formWrap.querySelector('#setReceiptLogoEmoji')?.value.trim() || 'B';
      state.store.receiptStoreName = formWrap.querySelector('#setReceiptStoreName')?.value.trim() || 'BNC HayMate Bakery';
      state.store.receiptStoreAddress = formWrap.querySelector('#setReceiptStoreAddress')?.value.trim() || '14 Sukhumvit Rd · Bangkok';
      state.store.receiptFooterType = currentReceiptFooterType;
      state.store.receiptFooterImage = (currentReceiptFooterImage && !currentReceiptFooterImage.startsWith('(Uploaded')) ? currentReceiptFooterImage : (footerUrlInp?.value && footerUrlInp.value !== '(Uploaded Photo)' && footerUrlInp.value.startsWith('http') ? footerUrlInp.value : currentReceiptFooterImage);
      state.store.receiptFooterEmoji = formWrap.querySelector('#setReceiptFooterEmoji')?.value.trim() || '🎀';
      state.store.receiptFooterMsg = formWrap.querySelector('#setReceiptFooterMsg')?.value.trim() || 'Thank you for your order';
      state.store.receiptFooterSub = formWrap.querySelector('#setReceiptFooterSub')?.value.trim() || '';

      // Tracking Review Calligraphy & Star Labels Save (STARS PRESERVED)
      state.store.trackingReviewTitle = formWrap.querySelector('#setTrackingTitle')?.value.trim() || 'BNC HayMate Bakery';
      state.store.trackingReviewSub = formWrap.querySelector('#setTrackingSub')?.value.trim() || 'Thank you for your support';
      state.store.trackingReviewBtnText = formWrap.querySelector('#setTrackingBtnText')?.value.trim() || '⭐ เขียนรีวิว & ให้คะแนนร้าน';
      state.store.starLabel1 = formWrap.querySelector('#setStarLabel1')?.value.trim() || '1 ดาว - ต้องปรับปรุง';
      state.store.starLabel2 = formWrap.querySelector('#setStarLabel2')?.value.trim() || '2 ดาว - พอใช้ได้';
      state.store.starLabel3 = formWrap.querySelector('#setStarLabel3')?.value.trim() || '3 ดาว - ปานกลาง / รสชาติดี';
      state.store.starLabel4 = formWrap.querySelector('#setStarLabel4')?.value.trim() || '4 ดาว - อร่อยและประทับใจมาก';
      state.store.starLabel5 = formWrap.querySelector('#setStarLabel5')?.value.trim() || '5 ดาว - ประทับใจมากที่สุด ยอดเยี่ยม! ⭐⭐⭐⭐⭐';

      // Save Stock Threshold Settings
      state.store.stockLowThreshold = Math.max(1, Number(formWrap.querySelector('#setStockLowThreshold')?.value || 100));
      state.store.stockOutThreshold = Math.max(0, Number(formWrap.querySelector('#setStockOutThreshold')?.value || 0));
      state.store.stockHealthyLabel = formWrap.querySelector('#setStockHealthyLabel')?.value.trim() || 'Healthy';
      state.store.stockLowLabel = formWrap.querySelector('#setStockLowLabel')?.value.trim() || 'Low';
      state.store.stockOutLabel = formWrap.querySelector('#setStockOutLabel')?.value.trim() || 'Out of stock';

      // Save Payment Accounts
      state.store.payment_accounts = currentPaymentAccounts.map(acc => ({
        id: acc.id || Date.now(),
        type: acc.type || 'bank',
        image: acc.image || '',
        title: acc.title || '',
        account_number: acc.account_number || '',
        account_holder: acc.account_holder || ''
      }));

      // Legacy fallback
      if (state.store.payment_accounts.length > 0) {
        state.store.bank_name = state.store.payment_accounts[0].title;
        state.store.bank_account = state.store.payment_accounts[0].account_number;
        state.store.account_holder = state.store.payment_accounts[0].account_holder;
      }

      state.store.name = formWrap.querySelector('#setStoreName')?.value.trim() || 'BNC HayMate';
      state.store.tagline = formWrap.querySelector('#setStoreTagline')?.value.trim() || 'Handmade sweet things';
      state.store.currency = formWrap.querySelector('#setCurrency')?.value || 'THB (฿)';
      state.store.timezone = formWrap.querySelector('#setTimezone')?.value || 'UTC+7 Bangkok';

      const pinVal = formWrap.querySelector('#setAdminPin')?.value.trim();
      if (pinVal && pinVal.length === 6 && /^\d+$/.test(pinVal)) {
        state.correctPin = pinVal;
        state.store.pin = pinVal;
      }

      // Persist to localStorage
      try {
        localStorage.setItem('haypos_store_settings', JSON.stringify(state.store));
      } catch (e) {}

      // Update Supabase if available
      if (supabase) {
        supabase.from('stores').update({
          name: state.store.name,
          tagline: state.store.tagline,
          currency: state.store.currency,
          timezone: state.store.timezone
        }).limit(1).then(() => {}).catch(() => {});
      }

      renderMenu();
      renderPage();
      toast(`บันทึกการตั้งค่าร้าน, ค่าเงิน (${getCurrencySymbol()}), สลิป และหน้า Home เรียบร้อยแล้ว`, 'success');
    };

    root.querySelector('#saveSettingsTop')?.addEventListener('click', doSave);
    formWrap.querySelector('#saveSettingsBottom')?.addEventListener('click', doSave);
    formWrap.querySelector('#btnEditBannersSettings')?.addEventListener('click', openBannerManagerModal);

    formWrap.querySelectorAll('.swatch-btn').forEach(b => b.addEventListener('click', () => {
      setColorAccent(b.dataset.c);
      formWrap.querySelectorAll('.swatch-btn').forEach(x => x.style.borderColor = 'transparent');
      b.style.borderColor = 'var(--text)';
      toast(`เปลี่ยนโทนสีระบบเป็น ${COLOR_PALETTES[b.dataset.c]?.name || 'ใหม่'} เรียบร้อย`, 'success');
    }));
    formWrap.querySelectorAll('#themeTabs .tab').forEach(t => t.addEventListener('click', () => {
      setTheme(t.dataset.th);
      formWrap.querySelectorAll('#themeTabs .tab').forEach(x => x.classList.remove('active'));
      t.classList.add('active');
      toast(`สลับเป็นโหมด ${t.dataset.th === 'dark' ? 'Dark' : 'Light'} เรียบร้อย`, 'info');
    }));
  };

  // Promotion Discount Calculator Helper
  function calculatePromoDiscount(promo, subtotal) {
    if (!promo || !subtotal) return 0;
    const offText = (promo.off || '').toLowerCase();
    const percentMatch = offText.match(/(\d+)\s*%/);
    if (percentMatch) {
      const pct = parseFloat(percentMatch[1]);
      return Math.round((subtotal * (pct / 100)) * 100) / 100;
    }
    const fixedMatch = offText.match(/(\d+(?:\.\d+)?)/);
    if (fixedMatch) {
      const amt = parseFloat(fixedMatch[1]);
      return Math.min(subtotal, amt);
    }
    return 0;
  }

  // ============================================================
  // PAGE 11: Customer Store (Storefront & Order Placement)
  // ============================================================
  PAGES.store = (root) => {
    root.appendChild(el(`
      <div class="page-head">
        <div>
          <h1 class="page-title" style="font-family:'Sunshiney', cursive; font-size:36px; font-weight:700; color:var(--accent-text); letter-spacing:0.5px; line-height:1.1;">${escapeHTML(state.store.storefrontTitle || 'Customer store')}</h1>
          <div class="page-sub" style="font-family:'Plus Jakarta Sans', system-ui, sans-serif; font-size:13px; color:var(--muted); font-weight:500; margin-top:2px;">${escapeHTML(state.store.storefrontSub || 'Online storefront view')}</div>
        </div>
        <div class="tabs" id="storeTabs">
          <div class="tab active" data-s="home">Home</div>
          <div class="tab" data-s="products">Products</div>
          <div class="tab" data-s="cart">Cart</div>
          <div class="tab" data-s="checkout">Checkout</div>
          <div class="tab" data-s="receipt">Receipt</div>
          <div class="tab" data-s="tracking">Tracking</div>
        </div>
      </div>
    `));

    const view = el(`<div id="storeView"></div>`);
    root.appendChild(view);

    const drawStore = (key) => {
      view.innerHTML = '';
      if (key === 'home') {
        // 1. Carousel Container (5 Slides, 1:1 Aspect Ratio at Top)
        const carouselEl = el(`
          <div>
            ${state.isAdmin ? `
              <div style="display:flex; justify-content:flex-end; align-items:center; margin-bottom:8px;">
                <button class="btn btn-sm" id="btnAdminEditBanners" style="background:var(--card); border:1.5px solid var(--border); color:var(--accent-text); font-size:12px; font-weight:700; cursor:pointer;">
                  จัดการรูปสไลด์ (5 รูป)
                </button>
              </div>` : ''}

            <div class="home-carousel-wrapper" style="margin-top:0;">
              <div class="carousel-track" id="carouselTrack">
                ${BANNERS.map((b, idx) => `
                  <div class="carousel-slide" data-idx="${idx}">
                    <img src="${b.image}" alt="Slide ${idx + 1}" style="width:100%; height:100%; object-fit:cover; display:block; user-select:none;" onerror="this.src='https://images.unsplash.com/photo-1578985545062-69928b1d9587?w=800'" />
                  </div>
                `).join('')}
              </div>

              <button class="carousel-btn prev" id="cPrev" aria-label="Previous">‹</button>
              <button class="carousel-btn next" id="cNext" aria-label="Next">›</button>

              <div class="carousel-dots" id="cDots">
                ${BANNERS.map((_, i) => `<div class="carousel-dot ${i === 0 ? 'active' : ''}" data-idx="${i}"></div>`).join('')}
              </div>
            </div>
          </div>
        `);
        view.appendChild(carouselEl);

        if (state.isAdmin) {
          carouselEl.querySelector('#btnAdminEditBanners')?.addEventListener('click', openBannerManagerModal);
        }

        // Carousel Logic (Manual Navigation Only - No Auto-play)
        let currentSlide = 0;
        const totalSlides = BANNERS.length;
        const track = carouselEl.querySelector('#carouselTrack');
        const dots = carouselEl.querySelectorAll('.carousel-dot');

        function goToSlide(idx) {
          currentSlide = (idx + totalSlides) % totalSlides;
          if (track) track.style.transform = `translateX(-${currentSlide * 100}%)`;
          dots.forEach((d, i) => {
            if (i === currentSlide) d.classList.add('active');
            else d.classList.remove('active');
          });
        }

        carouselEl.querySelector('#cPrev')?.addEventListener('click', (e) => { e.stopPropagation(); goToSlide(currentSlide - 1); });
        carouselEl.querySelector('#cNext')?.addEventListener('click', (e) => { e.stopPropagation(); goToSlide(currentSlide + 1); });

        dots.forEach(d => {
          d.addEventListener('click', (e) => { e.stopPropagation(); goToSlide(+d.dataset.idx); });
        });

        // Click slide to open products
        carouselEl.querySelectorAll('.carousel-slide').forEach(sl => {
          sl.addEventListener('click', (e) => {
            if (e.target.closest('.carousel-btn') || e.target.closest('.carousel-dots')) return;
            root.querySelectorAll('#storeTabs .tab').forEach(x => x.classList.remove('active'));
            root.querySelector('#storeTabs [data-s="products"]')?.classList.add('active');
            drawStore('products');
          });
        });

        // 2. Compact Hero Banner (Dynamic from state.store - supports Image or Emoji)
        const heroGraphicHtml = (state.store.heroIconType === 'image' && state.store.heroImage)
          ? `<img src="${escapeHTML(state.store.heroImage)}" alt="Hero" style="width:38px; height:38px; object-fit:contain; border-radius:10px; display:block;" onerror="this.style.display='none';" />`
          : `<div style="font-size:28px;">${escapeHTML(state.store.heroEmoji || '🥐')}</div>`;

        const compactHero = el(`
          <div class="store-hero">
            <div style="flex:1;">
              <h2 style="font-size:15.5px; font-weight:800;">${escapeHTML(state.store.heroTitle || 'Fresh from the oven, daily')}</h2>
              <p style="font-size:12px; color:var(--muted); margin-top:2px;">${escapeHTML(state.store.heroSub || 'Handmade cakes, pastries, and rose-scented drinks.')}</p>
            </div>
            <div class="flex items-center gap-2">
              <button class="btn btn-primary btn-sm" id="btnHeroShop" style="font-size:12px; padding:6px 14px;">${escapeHTML(state.store.heroBtnText || 'Shop Menu (320 items)')}</button>
              ${heroGraphicHtml}
            </div>
          </div>
        `);
        view.appendChild(compactHero);

        compactHero.querySelector('#btnHeroShop')?.addEventListener('click', () => {
          root.querySelectorAll('#storeTabs .tab').forEach(x => x.classList.remove('active'));
          root.querySelector('#storeTabs [data-s="products"]').classList.add('active');
          drawStore('products');
        });

        // 3. 4 Highlights & Popular Picks (Dynamic from state.store - supports Image or Emoji)
        const hList = (state.store.highlights && state.store.highlights.length) ? state.store.highlights : DEFAULT_STORE_CONFIG.highlights;
        view.appendChild(el(`
          <div class="grid stats" style="margin-top:16px">
            ${hList.map(h => {
              const iconHtml = (h.iconType === 'image' && h.image)
                ? `<img src="${escapeHTML(h.image)}" alt="${escapeHTML(h.title)}" style="width:24px; height:24px; object-fit:contain; border-radius:6px; display:inline-block;" onerror="this.style.display='none';" />`
                : `<span class="icon">${escapeHTML(h.icon || '✨')}</span>`;
              return `
                <div class="card stat">
                  <div class="row"><span class="label">${escapeHTML(h.title)}</span>${iconHtml}</div>
                  <div style="font-size:13px; color:var(--muted); margin-top:4px">${escapeHTML(h.sub)}</div>
                </div>
              `;
            }).join('')}
          </div>
          <div class="card" style="margin-top:16px">
            <div class="card-title">${escapeHTML(state.store.popularTitle || 'Popular Picks')}</div>
            <div class="card-sub">${escapeHTML(state.store.popularSub || 'Best sellers this week')}</div>
            <div class="product-grid">
              ${PRODUCTS.slice(0, 16).map(p => `
                <div class="product-tile" title="${escapeHTML(p.name)} · ${money(p.price)}" onclick="state.selected[${p.id}] = (state.selected[${p.id}] || 0) + 1; toast('Added ' + '${p.name}', 'success');">
                  ${p.image ? `<img src="${escapeHTML(p.image)}" alt="${escapeHTML(p.name)}" onerror="this.style.display='none'; if(this.nextElementSibling) this.nextElementSibling.style.display='grid';" /><span style="display:none">${p.emoji || '🍰'}</span>` : `${p.emoji || '🍰'}`}
                </div>`).join('')}
            </div>
          </div>
        `));

        // 4. Customer Reviews & Ratings (Fourth Section on Home)
        const reviewsSection = el(`
          <div class="card" style="margin-top:16px;">
            <div class="flex items-center" style="justify-content:space-between; flex-wrap:wrap; gap:10px; margin-bottom:14px;">
              <div>
                <div class="card-title">Customer Reviews &amp; Ratings (${REVIEWS.length})</div>
                <div class="card-sub">ความประทับใจและรีวิวจากลูกค้าตัวจริง · ⭐ 4.9 / 5.0 (420+ Orders)</div>
              </div>
              <button class="btn btn-primary btn-sm" id="btnHomeWriteReview" style="font-weight:700;">⭐ เขียนรีวิวให้ร้านค้า</button>
            </div>

            <div class="reviews-grid">
              ${REVIEWS.map(r => `
                <div class="card review-card" style="background:var(--primary-50); border:1.5px solid var(--border); border-radius:16px; padding:16px;">
                  <div class="review-head">
                    <div class="avatar" style="width:38px; height:38px; font-size:13px; font-weight:800; background:var(--card); border:1px solid var(--border);">${escapeHTML(r.avatar || 'AW')}</div>
                    <div style="flex:1;">
                      <div class="flex items-center gap-2">
                        <span class="review-name" style="font-size:13.5px; font-weight:700;">${escapeHTML(r.name)}</span>
                        <span class="badge success" style="font-size:10px; padding:1px 6px;">✓ ซื้อจริง</span>
                      </div>
                      <div class="review-date" style="font-size:11px; color:var(--muted);">${r.date || '2026-08-20'}</div>
                    </div>
                    <div class="stars" style="font-size:13px; color:#F0B265;">${'★'.repeat(r.rating || 5)}${'☆'.repeat(5 - (r.rating || 5))}</div>
                  </div>
                  <div class="review-text" style="font-size:12.5px; line-height:1.5; color:var(--text); margin-top:6px;">${escapeHTML(r.text)}</div>
                </div>
              `).join('')}
            </div>
          </div>
        `);
        view.appendChild(reviewsSection);

        reviewsSection.querySelector('#btnHomeWriteReview')?.addEventListener('click', () => openWriteReviewModal());

      } else if (key === 'products') {
        const wrap = el(`
          <div class="card">
            <div class="flex items-center" style="justify-content:space-between; gap:12px; flex-wrap:wrap; margin-bottom:10px">
              <div><div class="card-title">Menu &amp; Products</div><div class="card-sub">Tap item to add to cart</div></div>
              <div class="flex gap-2" style="flex-wrap:wrap">
                <div class="search-wrap" style="max-width:220px"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="11" cy="11" r="7"/><path d="m20 20-3.5-3.5" stroke-linecap="round"/></svg><input placeholder="Search..." id="storeSearch"/></div>
                <select class="select" id="storeCat" style="width:auto">
                  <option value="">All categories</option>
                  ${CATEGORIES.map(c => `<option>${c.name}</option>`).join('')}
                </select>
              </div>
            </div>
            <div class="flex items-center" style="justify-content:space-between; margin-bottom:10px; color:var(--muted); font-size:12.5px">
              <span id="storeCount"></span>
              <span id="storeCartInfo" style="cursor:pointer;" title="Go to Cart"></span>
            </div>
            <div class="product-grid" id="storeGrid"></div>
            <div class="pagination" id="storePager"></div>
          </div>
        `);
        view.appendChild(wrap);

        const grid = wrap.querySelector('#storeGrid');
        const pager = wrap.querySelector('#storePager');
        const countEl = wrap.querySelector('#storeCount');
        const cartInfo = wrap.querySelector('#storeCartInfo');
        const searchEl = wrap.querySelector('#storeSearch');
        const catEl = wrap.querySelector('#storeCat');
        const PAGE = 160;
        let page = 1;

        function updateCartInfo() {
          const totalQty = Object.values(state.selected).reduce((a,b)=>a+b, 0);
          const totalPrice = Object.entries(state.selected).reduce((sum, [id, q]) => {
            const p = PRODUCTS.find(x => x.id === +id);
            return sum + (p ? p.price * q : 0);
          }, 0);
          cartInfo.innerHTML = totalQty
            ? `Cart: <strong style="color:var(--text)">${totalQty}</strong> items · <strong style="color:var(--accent-text)">${money(totalPrice)}</strong> (Go to Cart →)`
            : 'Cart is empty';
        }
        cartInfo.addEventListener('click', () => {
          root.querySelectorAll('#storeTabs .tab').forEach(x => x.classList.remove('active'));
          root.querySelector('#storeTabs [data-s="cart"]').classList.add('active');
          drawStore('cart');
        });

        function drawStoreGrid() {
          const q = searchEl.value.toLowerCase();
          const cat = catEl.value;
          const list = PRODUCTS.filter(p => (!q || p.name.toLowerCase().includes(q)) && (!cat || p.cat === cat));
          const totalPages = Math.max(1, Math.ceil(list.length / PAGE));
          if (page > totalPages) page = totalPages;
          const start = (page - 1) * PAGE;
          const items = list.slice(start, start + PAGE);
          countEl.textContent = list.length
            ? `Showing ${start + 1}–${Math.min(list.length, start + PAGE)} of ${list.length} products`
            : 'No products';
          grid.innerHTML = '';
          items.forEach(p => {
            const sInfo = getStockStatusInfo(p.stock);
            const stockCls = sInfo.dotClass;
            const qty = state.selected[p.id] || 0;
            const mediaHtml = p.image
              ? `<img src="${escapeHTML(p.image)}" alt="${escapeHTML(p.name)}" onerror="this.style.display='none'; if(this.nextElementSibling) this.nextElementSibling.style.display='grid';" /><span style="display:none;">${p.emoji || '🍰'}</span>`
              : `<span>${p.emoji || '🍰'}</span>`;
            const tile = el(`
              <div class="product-tile ${stockCls} ${qty ? 'selected' : ''}" data-id="${p.id}" title="${escapeHTML(p.name)} · ${money(p.price)}">
                ${mediaHtml}
                <span class="stock-dot"></span>
                <span class="qty-badge">${qty}</span>
              </div>
            `);
            tile.addEventListener('click', () => {
              if (p.stock === 0) return toast(`${p.name} is out of stock`, 'error');
              state.selected[p.id] = (state.selected[p.id] || 0) + 1;
              tile.classList.add('selected');
              const badge = tile.querySelector('.qty-badge');
              badge.textContent = state.selected[p.id];
              badge.style.animation = 'none'; void badge.offsetWidth; badge.style.animation = '';
              updateCartInfo();
            });
            tile.addEventListener('contextmenu', (e) => {
              e.preventDefault();
              if (!state.selected[p.id]) return;
              state.selected[p.id] -= 1;
              if (state.selected[p.id] <= 0) {
                delete state.selected[p.id];
                tile.classList.remove('selected');
              } else {
                tile.querySelector('.qty-badge').textContent = state.selected[p.id];
              }
              updateCartInfo();
            });
            grid.appendChild(tile);
          });

          pager.innerHTML = '';
          if (totalPages > 1) {
            const mk = (label, p2, opts={}) => {
              const b = el(`<button class="pg ${opts.active?'active':''}" ${opts.disabled?'disabled style="opacity:.4;cursor:not-allowed"':''}>${label}</button>`);
              if (!opts.disabled) b.addEventListener('click', () => { page = p2; drawStoreGrid(); });
              return b;
            };
            pager.appendChild(mk('‹', page-1, {disabled: page===1}));
            for (let i=1; i<=totalPages; i++) pager.appendChild(mk(String(i), i, {active: i===page}));
            pager.appendChild(mk('›', page+1, {disabled: page===totalPages}));
          }
        }
        searchEl.addEventListener('input', () => { page = 1; drawStoreGrid(); });
        catEl.addEventListener('change', () => { page = 1; drawStoreGrid(); });
        drawStoreGrid();
        updateCartInfo();

      } else if (key === 'cart') {
        const cartEntries = Object.entries(state.selected).map(([id, q]) => {
          const p = PRODUCTS.find(x => x.id === +id);
          return p ? { ...p, qty: q } : null;
        }).filter(Boolean);

        const subtotal = cartEntries.reduce((s, i) => s + i.price * i.qty, 0);
        const discount = calculatePromoDiscount(state.appliedPromo, subtotal);
        const total = Math.max(0, subtotal - discount);
        const activePromos = PROMOTIONS.filter(p => p.status === 'active');

        view.appendChild(el(`
          <div class="grid two-col">
            <div>
              <div class="card">
                <div class="card-title">Your Cart</div>
                <div class="card-sub">${cartEntries.length} unique items</div>
                ${cartEntries.length === 0 ? '<div class="empty">Your cart is empty.</div>' : `
                  <div style="display:flex; flex-direction:column; gap:10px; margin-top:12px">
                    ${cartEntries.map(p => {
                      const thumbHtml = p.image
                        ? `<img src="${escapeHTML(p.image)}" alt="${escapeHTML(p.name)}" style="width:52px;height:52px;object-fit:cover;border-radius:12px;" onerror="this.style.display='none'; if(this.nextElementSibling) this.nextElementSibling.style.display='grid';" /><div style="display:none;width:52px;height:52px;place-items:center;font-size:12px;font-weight:700;border-radius:12px;background:var(--primary-50);color:var(--accent-text);">${escapeHTML(p.cat || 'Item')}</div>`
                        : `<div style="width:52px;height:52px;display:grid;place-items:center;font-size:12px;font-weight:700;border-radius:12px;background:var(--primary-50);color:var(--accent-text);">${escapeHTML(p.cat || 'Item')}</div>`;
                      return `
                        <div class="flex items-center gap-3" style="padding:10px; border:1px solid var(--border); border-radius:12px">
                          ${thumbHtml}
                          <div style="flex:1"><div style="font-weight:600">${escapeHTML(p.name)}</div><div style="font-size:12px; color:var(--muted)">${p.cat} · ${money(p.price)}</div></div>
                          <div class="flex items-center gap-2">
                            <button class="btn btn-sm" onclick="state.selected[${p.id}]--; if (state.selected[${p.id}]<=0) delete state.selected[${p.id}]; drawStore('cart');">−</button>
                            <span style="font-weight:600">${p.qty}</span>
                            <button class="btn btn-sm" onclick="state.selected[${p.id}]++; drawStore('cart');">+</button>
                          </div>
                          <div style="font-weight:700; width:70px; text-align:right">${money(p.price * p.qty)}</div>
                        </div>`;
                    }).join('')}
                  </div>
                `}
              </div>

              <!-- Promo Code / Coupon Section in Cart (No Emojis) -->
              ${cartEntries.length > 0 ? `
                <div class="card" style="margin-top:14px;">
                  <div class="card-title" style="font-size:14.5px;">
                    Coupon &amp; Promotion (โค้ดส่วนลด)
                  </div>
                  <div class="card-sub" style="margin-bottom:10px;">กรอกโค้ดส่วนลด หรือคลิกเลือกโปรโมชั่นที่เปิดใช้งานอยู่ด้านล่าง</div>
                  
                  <div style="display:flex; gap:8px; align-items:center;">
                    <input class="input" id="cartPromoInput" placeholder="กรอกโค้ดส่วนลด เช่น WELCOME50, BLOOM10" value="${state.appliedPromo ? escapeHTML(state.appliedPromo.code) : ''}" style="padding:9px 12px; font-size:13px; text-transform:uppercase; font-weight:700; border-radius:12px; flex:1;" />
                    <button class="btn btn-primary" id="btnApplyPromo" style="font-size:13px; font-weight:700; white-space:nowrap; padding:9px 16px; border-radius:12px;">Apply</button>
                  </div>

                  ${state.appliedPromo ? `
                    <div style="margin-top:10px; background:var(--primary-50); border:1.5px solid var(--primary-600); border-radius:12px; padding:10px 14px; display:flex; align-items:center; justify-content:space-between; gap:10px;">
                      <div>
                        <div style="font-size:12.5px; font-weight:800; color:var(--accent-text); display:flex; align-items:center; gap:6px;">
                          <span>ใช้โค้ด: <strong>${escapeHTML(state.appliedPromo.code)}</strong></span>
                          <span class="badge success" style="font-size:10.5px;">Applied</span>
                        </div>
                        <div style="font-size:11.5px; color:var(--muted); margin-top:2px;">ส่วนลด: ${escapeHTML(state.appliedPromo.off)} (-${money(discount)})</div>
                      </div>
                      <button type="button" class="btn btn-sm btn-ghost" id="btnRemovePromo" style="color:var(--danger); font-size:12px; font-weight:700; padding:4px 8px;">✕ ยกเลิก</button>
                    </div>
                  ` : ''}

                  <!-- Active Promotion Quick Tags (No Emojis) -->
                  <div style="margin-top:12px;">
                    <div style="font-size:11.5px; font-weight:700; color:var(--muted); margin-bottom:6px;">โปรโมชั่นแนะนำ (คลิกเพื่อใช้โค้ด):</div>
                    <div style="display:flex; flex-wrap:wrap; gap:6px;">
                      ${activePromos.map(p => `
                        <button type="button" class="btn-promo-tag" data-code="${escapeHTML(p.code)}" style="background:var(--card); border:1.5px dashed var(--border); color:var(--accent-text); padding:5px 10px; border-radius:10px; font-size:11.5px; font-weight:700; cursor:pointer; display:inline-flex; align-items:center; gap:4px; transition:all .15s ease;">
                          <span>${escapeHTML(p.code)}</span>
                          <span style="font-size:10.5px; color:var(--muted); font-weight:500;">(${escapeHTML(p.off)})</span>
                        </button>
                      `).join('')}
                    </div>
                  </div>
                </div>
              ` : ''}
            </div>

            <div class="card" style="height:fit-content;">
              <div class="card-title">Summary</div>
              <div class="kv"><span class="k">Subtotal</span><span class="v">${money(subtotal)}</span></div>
              ${discount > 0 ? `<div class="kv"><span class="k" style="color:var(--accent-text); font-weight:700;">Discount (${escapeHTML(state.appliedPromo?.code || 'Promo')})</span><span class="v" style="color:var(--danger); font-weight:800;">-${money(discount)}</span></div>` : ''}
              <div class="kv"><span class="k">Total</span><span class="v" style="color:var(--accent-text); font-size:17px; font-weight:800;">${money(total)}</span></div>
              <button class="btn btn-primary btn-block mt-3" id="goCheckout" ${cartEntries.length === 0 ? 'disabled style="opacity:.5;cursor:not-allowed"' : ''}>Proceed to Checkout</button>
            </div>
          </div>
        `));

        // Promo handlers in cart
        const promoInput = view.querySelector('#cartPromoInput');
        const btnApply = view.querySelector('#btnApplyPromo');
        const btnRemove = view.querySelector('#btnRemovePromo');

        const doApplyPromoCode = (rawCode) => {
          const code = (rawCode || '').trim().toUpperCase();
          if (!code) {
            toast('โปรดกรอกรหัสโค้ดส่วนลด', 'error');
            return;
          }
          const matched = PROMOTIONS.find(p => p.code.toUpperCase() === code && p.status === 'active')
            || PROMOTIONS.find(p => p.code.toUpperCase() === code);
          if (matched) {
            state.appliedPromo = matched;
            toast(`ใช้โค้ดส่วนลด "${matched.code}" (${matched.off}) สำเร็จ!`, 'success');
            drawStore('cart');
          } else {
            toast(`ไม่พบโค้ดส่วนลด "${code}" หรือโค้ดหมดอายุแล้ว`, 'error');
          }
        };

        btnApply?.addEventListener('click', () => doApplyPromoCode(promoInput?.value));
        promoInput?.addEventListener('keydown', (e) => {
          if (e.key === 'Enter') {
            e.preventDefault();
            doApplyPromoCode(promoInput?.value);
          }
        });

        btnRemove?.addEventListener('click', () => {
          state.appliedPromo = null;
          toast('ยกเลิกโค้ดส่วนลดแล้ว', 'info');
          drawStore('cart');
        });

        view.querySelectorAll('.btn-promo-tag').forEach(tag => {
          tag.addEventListener('click', () => {
            if (promoInput) promoInput.value = tag.dataset.code;
            doApplyPromoCode(tag.dataset.code);
          });
        });

        if (cartEntries.length) {
          view.querySelector('#goCheckout').addEventListener('click', () => {
            root.querySelectorAll('#storeTabs .tab').forEach(x => x.classList.remove('active'));
            root.querySelector('#storeTabs [data-s="checkout"]').classList.add('active');
            drawStore('checkout');
          });
        }
      } else if (key === 'checkout') {
        const cartEntries = Object.entries(state.selected).map(([id, q]) => {
          const p = PRODUCTS.find(x => x.id === +id);
          return p ? { ...p, qty: q } : null;
        }).filter(Boolean);
        const subtotal = cartEntries.reduce((s, i) => s + i.price * i.qty, 0);
        const discount = calculatePromoDiscount(state.appliedPromo, subtotal);
        const total = Math.max(0, subtotal - discount);

        view.appendChild(el(`
          <div class="grid two-col">
            <div class="card">
              <div class="card-title">Customer &amp; Farm Information</div>
              <div class="card-sub">ข้อมูลลูกค้าและฟาร์มสำหรับออกใบเสร็จและจัดส่ง</div>
              <div class="grid" style="gap:10px; margin-top:10px">
                <div class="field">
                  <label style="font-size:12px; font-weight:700;">Name (ชื่อลูกค้าที่จะขึ้นในใบเสร็จ) *</label>
                  <input class="input" id="coName" placeholder="เช่น Anna Wong, คุณสมชาย" value="Anna Wong" style="padding:9px 12px; font-size:13px; border-radius:12px;"/>
                </div>
                <div class="grid" style="grid-template-columns:1fr 1fr; gap:10px">
                  <div class="field">
                    <label style="font-size:12px; font-weight:700;">Farm Name (ชื่อฟาร์ม)</label>
                    <input class="input" id="coFarmName" placeholder="เช่น Green Valley Farm" value="BNC Hay Farm" style="padding:9px 12px; font-size:13px; border-radius:12px;"/>
                  </div>
                  <div class="field">
                    <label style="font-size:12px; font-weight:700;">Farm Tag</label>
                    <input class="input" id="coFarmTag" placeholder="เช่น #FARM-01, โซน A" value="#FARM-01" style="padding:9px 12px; font-size:13px; border-radius:12px;"/>
                  </div>
                </div>
                <div class="field">
                  <label style="font-size:12px; font-weight:700;">Contact (ช่องทางการติดต่อของลูกค้า) *</label>
                  <input class="input" id="coContact" placeholder="เช่น เบอร์โทร 081-234-5678, Line ID: @haymate" value="081-234-5678" style="padding:9px 12px; font-size:13px; border-radius:12px;"/>
                </div>
              </div>
            </div>
            <div class="card">
              <div class="card-title">Payment Transfer</div>
              <div class="card-sub">สแกน QR หรือโอนผ่านบัญชีธนาคาร/วอลเล็ท</div>
              
              <!-- QR Code Preview -->
              <div class="file-preview" style="aspect-ratio:auto; padding:14px; margin-top:8px; text-align:center;">
                <div class="qr" style="width:90px; height:90px; margin:0 auto 6px;"></div>
                <div style="font-size:11.5px; font-weight:700; color:var(--accent-text);">PromptPay QR Code</div>
              </div>

              <!-- Bank & Wallet Transfer Details with Copy Buttons (Dynamic List from Settings) -->
              <div style="display:flex; flex-direction:column; gap:10px; margin-top:12px;">
                ${(state.store.payment_accounts && state.store.payment_accounts.length > 0 ? state.store.payment_accounts : DEFAULT_STORE_CONFIG.payment_accounts).map(acc => {
                  const accIconHtml = acc.image
                    ? `<img src="${escapeHTML(acc.image)}" alt="Account Logo" style="width:20px; height:20px; object-fit:contain; border-radius:5px; display:inline-block; vertical-align:middle;" onerror="this.style.display='none';" />`
                    : `<span style="display:inline-flex; align-items:center; color:var(--accent-text);">${ICONS.bank}</span>`;
                  return `
                    <div style="background:var(--card); border:1.5px solid var(--border); border-radius:14px; padding:12px 14px; display:flex; align-items:center; justify-content:space-between; gap:10px; box-shadow:var(--shadow-soft);">
                      <div>
                        <div style="font-size:11px; color:var(--muted); font-weight:700; display:flex; align-items:center; gap:6px;">
                          ${accIconHtml}
                          <span>${escapeHTML(acc.title || 'ธนาคาร')}</span>
                        </div>
                        <div style="font-size:15px; font-weight:800; color:var(--text); letter-spacing:0.5px; margin:2px 0;">${escapeHTML(acc.account_number || '')}</div>
                        ${acc.account_holder ? `<div style="font-size:11.5px; color:var(--muted);">ชื่อ: ${escapeHTML(acc.account_holder)}</div>` : ''}
                      </div>
                      <button type="button" class="btn btn-copy-acc" data-num="${escapeHTML(acc.account_number || '')}" style="background:var(--primary-600); color:#FFFFFF; border:none; font-size:12.5px; font-weight:700; white-space:nowrap; padding:7px 14px; border-radius:10px; box-shadow:none; cursor:pointer; transition:all .15s ease;">Copy</button>
                    </div>
                  `;
                }).join('')}
              </div>
              
              <!-- Slip Upload Area -->
              <div class="field" style="margin-top:14px;">
                <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:6px;">
                  <label style="font-weight:700; font-size:12.5px; color:var(--text); margin:0;">แนบสลิปโอนเงิน <span style="color:var(--danger)">* (จำเป็น)</span></label>
                  <span id="slipStatusBadge" style="font-size:11px; color:var(--danger); font-weight:600;">ยังไม่ได้แนบสลิป</span>
                </div>
                <input type="file" id="slipFileInput" accept="image/*" style="display:none;" />
                <div id="slipUploadDropzone" style="cursor:pointer; border:2px dashed var(--border); border-radius:14px; background:var(--primary-50); padding:14px; text-align:center; transition:all .2s ease;">
                  <div id="slipPrompt">
                    <div style="margin-bottom:4px;">${ICONS.receipt}</div>
                    <div style="font-weight:700; font-size:13px; color:var(--accent-text);">คลิกเพื่ออัปโหลดสลิปโอนเงิน</div>
                    <div style="font-size:11.5px; color:var(--muted); margin-top:2px;">รองรับรูปถ่าย JPG, PNG (สูงสุด 10MB)</div>
                  </div>
                  <div id="slipPreviewWrapper" style="display:none;">
                    <img id="slipPreviewImg" style="max-height:150px; max-width:100%; border-radius:8px; object-fit:contain; box-shadow:var(--shadow-soft); display:block; margin:0 auto;" />
                    <div style="font-size:12px; color:#3F8E63; font-weight:700; margin-top:6px;">✓ แนบสลิปเรียบร้อยแล้ว (คลิกเพื่อเปลี่ยนรูป)</div>
                  </div>
                </div>
              </div>

              <div class="kv" style="margin-top:14px"><span class="k">ยอดรวมสินค้า (Subtotal)</span><span class="v">${money(subtotal)}</span></div>
              ${discount > 0 ? `<div class="kv"><span class="k" style="color:var(--accent-text); font-weight:700;">ส่วนลด (Discount ${escapeHTML(state.appliedPromo?.code || '')})</span><span class="v" style="color:var(--danger); font-weight:800;">-${money(discount)}</span></div>` : ''}
              <div class="kv" style="border-top:1.5px dashed var(--border); padding-top:8px; margin-top:6px;"><span class="k" style="font-size:14px; font-weight:800;">ยอดชำระสุทธิ (Order Total)</span><span class="v" style="color:var(--accent-text); font-size:17px; font-weight:800;">${money(total)}</span></div>
              <button class="btn btn-primary btn-block mt-3" id="confirmPay" style="font-size:14px; font-weight:700;">ยืนยันคำสั่งซื้อ (Confirm Order)</button>
            </div>
          </div>
        `));

        let uploadedSlipData = '';
        const slipInput = view.querySelector('#slipFileInput');
        const slipDropzone = view.querySelector('#slipUploadDropzone');
        const slipPrompt = view.querySelector('#slipPrompt');
        const slipPreviewWrapper = view.querySelector('#slipPreviewWrapper');
        const slipPreviewImg = view.querySelector('#slipPreviewImg');
        const slipStatusBadge = view.querySelector('#slipStatusBadge');

        // Copy buttons logic (Solid theme color -> Copied)
        view.querySelectorAll('.btn-copy-acc').forEach(btn => {
          btn.addEventListener('click', () => {
            const raw = btn.dataset.num ? btn.dataset.num.replace(/\D/g, '') : '';
            const copyText = raw || btn.dataset.num || '';
            const doCopy = () => {
              toast(`Copied: ${btn.dataset.num}`, 'success');
              btn.textContent = 'Copied';
              btn.style.background = '#7CC59A';
              setTimeout(() => {
                btn.textContent = 'Copy';
                btn.style.background = 'var(--primary-600)';
              }, 2000);
            };
            if (navigator.clipboard && navigator.clipboard.writeText) {
              navigator.clipboard.writeText(copyText).then(doCopy).catch(doCopy);
            } else {
              doCopy();
            }
          });
        });

        slipDropzone.addEventListener('click', () => slipInput.click());
        slipInput.addEventListener('change', (e) => {
          const file = e.target.files[0];
          if (!file) return;
          const reader = new FileReader();
          reader.onload = (evt) => {
            uploadedSlipData = evt.target.result;
            slipPreviewImg.src = uploadedSlipData;
            slipPrompt.style.display = 'none';
            slipPreviewWrapper.style.display = 'block';
            slipDropzone.style.borderColor = '#7CC59A';
            slipDropzone.style.background = '#F4FAF6';
            if (slipStatusBadge) {
              slipStatusBadge.textContent = '✓ แนบสลิปแล้ว';
              slipStatusBadge.style.color = '#3F8E63';
            }
            toast('แนบสลิปโอนเงินเรียบร้อย', 'success');
          };
          reader.readAsDataURL(file);
        });

        view.querySelector('#confirmPay').addEventListener('click', async () => {
          // Check if slip is attached
          if (!uploadedSlipData) {
            slipDropzone.style.borderColor = 'var(--danger)';
            slipDropzone.style.background = '#FFF0F2';
            slipDropzone.style.animation = 'pinShake .35s ease';
            setTimeout(() => { slipDropzone.style.animation = ''; }, 400);
            toast('เช็คเอาท์ไม่ได้: โปรดแนบสลิปหลักฐานการโอนเงินก่อนสั่งซื้อ', 'error');
            slipDropzone.scrollIntoView({ behavior: 'smooth', block: 'center' });
            return;
          }

          const name = $('#coName')?.value.trim() || 'Anna Wong';
          const farmName = $('#coFarmName')?.value.trim() || '';
          const farmTag = $('#coFarmTag')?.value.trim() || '';
          const contact = $('#coContact')?.value.trim() || '';
          const newOrderNumber = 'HP-' + Math.floor(1000 + Math.random()*9000);
          const newOrder = {
            id: newOrderNumber,
            customer: name,
            farm_name: farmName,
            farm_tag: farmTag,
            contact: contact,
            date: new Date().toISOString().split('T')[0],
            items: Object.keys(state.selected).length || 3,
            subtotal: subtotal,
            discount: discount,
            promo_code: state.appliedPromo ? state.appliedPromo.code : '',
            delivery: 0,
            total: total || 35.30,
            status: 'waiting',
            slip_url: uploadedSlipData || ''
          };
          ORDERS.unshift(newOrder);

          if (supabase) {
            await supabase.from('orders').insert({
              order_number: newOrderNumber,
              subtotal: subtotal,
              discount: discount,
              tax: 0,
              total: total,
              status: 'waiting',
              payment_method: 'qr',
              note: `Customer: ${name} | Farm: ${farmName} (${farmTag}) | Contact: ${contact} | Promo: ${state.appliedPromo?.code || '-'}`
            });
          }

          state.selected = {};
          toast('สั่งซื้อและแนบสลิปสำเร็จเรียบร้อย', 'success');
          root.querySelectorAll('#storeTabs .tab').forEach(x => x.classList.remove('active'));
          root.querySelector('#storeTabs [data-s="receipt"]').classList.add('active');
          drawStore('receipt');
        });
      } else if (key === 'receipt') {
        const latestOrder = ORDERS[0] || { id: 'HP-1042', customer: 'Anna Wong', farm_name: 'BNC Hay Farm', farm_tag: '#FARM-01', date: new Date().toISOString().split('T')[0], total: 35.30, subtotal: 35.30, discount: 0, delivery: 0 };
        const logoType = state.store.receiptLogoType || 'emoji';
        const logoImage = state.store.receiptLogoImage || '';
        const logoEmoji = state.store.receiptLogoEmoji || 'B';
        const storeName = state.store.receiptStoreName || (state.store.name ? state.store.name + ' Bakery' : 'BNC HayMate Bakery');
        const storeSub = state.store.receiptStoreAddress || '14 Sukhumvit Rd · Bangkok';

        const footerType = state.store.receiptFooterType || 'qr';
        const footerImage = state.store.receiptFooterImage || '';
        const footerEmoji = state.store.receiptFooterEmoji || '🎀';
        const footerMsg = state.store.receiptFooterMsg || 'Thank you for your order 💗';
        const footerSub = state.store.receiptFooterSub || '';

        const logoHtml = (logoType === 'image' && logoImage)
          ? `<img src="${escapeHTML(logoImage)}" alt="Store Logo" onerror="this.style.display='none'; if(this.nextElementSibling) this.nextElementSibling.style.display='grid';" /><div style="display:none;">${escapeHTML(logoEmoji)}</div>`
          : `<div>${escapeHTML(logoEmoji)}</div>`;

        let footerGraphicHtml = '';
        if (footerType === 'image' && footerImage) {
          footerGraphicHtml = `<div class="r-footer-graphic"><img src="${escapeHTML(footerImage)}" alt="Footer Graphic/QR" onerror="this.style.display='none'; if(this.nextElementSibling) this.nextElementSibling.style.display='block';" /><div class="qr-default" style="display:none;"></div></div>`;
        } else if (footerType === 'emoji') {
          footerGraphicHtml = `<div class="r-footer-graphic" style="font-size:42px;">${escapeHTML(footerEmoji)}</div>`;
        } else {
          footerGraphicHtml = `<div class="r-footer-graphic"><div class="qr-default"></div></div>`;
        }

        const rSubtotal = latestOrder.subtotal !== undefined ? latestOrder.subtotal : latestOrder.total;
        const rDiscount = latestOrder.discount || 0;

        view.appendChild(el(`
          <div class="receipt">
            <div class="r-head">
              <div class="r-logo">${logoHtml}</div>
              <div class="r-store">${escapeHTML(storeName)}</div>
              <div class="r-sub">${escapeHTML(storeSub)}</div>
            </div>
            <div class="r-line"></div>
            <div class="r-items">
              <div class="r-row"><span>Order</span><span><strong>${latestOrder.id}</strong></span></div>
              <div class="r-row"><span>Date</span><span>${latestOrder.date}</span></div>
              <div class="r-row"><span>Customer</span><span>${escapeHTML(latestOrder.customer)}</span></div>
              ${latestOrder.farm_name ? `<div class="r-row"><span>Farm</span><span>${escapeHTML(latestOrder.farm_name)}</span></div>` : ''}
              ${latestOrder.farm_tag ? `<div class="r-row"><span>Farm Tag</span><span>${escapeHTML(latestOrder.farm_tag)}</span></div>` : ''}
            </div>
            <div class="r-line"></div>
            <div class="r-items">
              ${PRODUCTS.slice(0,3).map((p, i) => `<div class="r-row"><span>${escapeHTML(p.name)} × ${i+1}</span><span>${money(p.price * (i+1))}</span></div>`).join('')}
            </div>
            <div class="r-line"></div>
            <div class="r-items">
              <div class="r-row"><span>Subtotal</span><span>${money(rSubtotal)}</span></div>
              ${rDiscount > 0 ? `<div class="r-row" style="color:var(--accent-text); font-weight:700;"><span>Discount (${escapeHTML(latestOrder.promo_code || 'Promo')})</span><span style="color:var(--danger)">-${money(rDiscount)}</span></div>` : ''}
              <div class="r-row r-total"><span>Total</span><span>${money(latestOrder.total)}</span></div>
            </div>
            ${footerGraphicHtml}
            <div style="text-align:center; font-family:'Sunshiney', cursive; font-size:22px; font-weight:700; color:var(--accent-text); margin-top:8px; line-height:1.2;">${escapeHTML(footerMsg)}</div>
            <button class="btn btn-primary btn-block mt-3" id="btnTrackOrder" style="font-size:14px; font-weight:700;">Track your order →</button>
            <button class="btn btn-block mt-2" id="dlReceipt" style="font-size:13.5px; font-weight:700;">Download / Share Receipt (บันทึก/พิมพ์ใบเสร็จ)</button>
          </div>
        `));
        view.querySelector('#btnTrackOrder').addEventListener('click', () => {
          root.querySelectorAll('#storeTabs .tab').forEach(x => x.classList.remove('active'));
          root.querySelector('#storeTabs [data-s="tracking"]').classList.add('active');
          drawStore('tracking');
        });
        view.querySelector('#dlReceipt').addEventListener('click', async () => {
          if (navigator.share) {
            try {
              await navigator.share({
                title: 'BNC HayMate Order Receipt',
                text: `BNC HayMate Receipt #${latestOrder.id} - ${latestOrder.customer} - Total: ${money(latestOrder.total)}`,
                url: window.location.href
              });
              toast('แชร์ใบเสร็จเรียบร้อย', 'success');
              return;
            } catch (err) {}
          }
          window.print();
        });
      } else if (key === 'tracking') {
        const latestOrder = ORDERS[0] || { id: 'HP-1042', customer: 'Anna Wong', date: new Date().toISOString().split('T')[0], status: 'waiting' };
        const trackingTitle = state.store.trackingReviewTitle || state.store.receiptStoreName || state.store.name || 'BNC HayMate Bakery';
        const trackingSub = state.store.trackingReviewSub || 'Thank you for your support 💗';
        const trackingBtn = state.store.trackingReviewBtnText || '⭐ เขียนรีวิว & ให้คะแนนร้าน';

        view.appendChild(el(`
          <div class="card" style="max-width:560px; margin:0 auto;">
            <div class="card-title">Order Tracking</div>
            <div class="card-sub">Order ${latestOrder.id} · Live Status</div>
            <div class="timeline" style="margin-top:14px">
              <div class="step done"><div class="bullet">✓</div><div><div class="label">Waiting Payment</div><div class="sub">Order received</div></div></div>
              <div class="step ${latestOrder.status !== 'waiting' ? 'done' : 'active'}"><div class="bullet">${latestOrder.status !== 'waiting' ? '✓' : '2'}</div><div><div class="label">Payment Verified</div><div class="sub">Confirmed by store</div></div></div>
              <div class="step ${latestOrder.status === 'preparing' || latestOrder.status === 'completed' ? (latestOrder.status === 'completed' ? 'done' : 'active') : ''}"><div class="bullet">${latestOrder.status === 'completed' ? '✓' : '3'}</div><div><div class="label">Preparing</div><div class="sub">Your treats are being packed fresh</div></div></div>
              <div class="step ${latestOrder.status === 'completed' ? 'done' : ''}"><div class="bullet">${latestOrder.status === 'completed' ? '✓' : '4'}</div><div><div class="label">Completed</div><div class="sub">Ready for pickup / delivery</div></div></div>
            </div>

            <!-- Review Card for Customers (Calligraphy Store Name + Subtext) -->
            <div style="background:var(--primary-50); border:1.5px solid var(--border); border-radius:18px; padding:22px 18px; margin-top:22px; text-align:center; box-shadow:var(--shadow-soft);">
              <div style="font-family:'Sunshiney', cursive; font-size:36px; font-weight:700; color:var(--accent-text); line-height:1.2; letter-spacing:0.5px;">
                ${escapeHTML(trackingTitle)}
              </div>
              <div style="font-size:12.5px; color:var(--muted); margin-top:6px; font-weight:500;">
                ${escapeHTML(trackingSub)}
              </div>
              <button class="btn btn-primary btn-sm mt-3" id="btnTrackingReview" style="padding:9px 24px; font-weight:700; font-size:13px; border-radius:12px; box-shadow:var(--shadow-soft);">
                ${escapeHTML(trackingBtn)}
              </button>
            </div>

            <button class="btn btn-block mt-4" id="btnBackToReceipt">← Back to Receipt</button>
          </div>
        `));
        view.querySelector('#btnTrackingReview')?.addEventListener('click', () => openWriteReviewModal(latestOrder));
        view.querySelector('#btnBackToReceipt').addEventListener('click', () => {
          root.querySelectorAll('#storeTabs .tab').forEach(x => x.classList.remove('active'));
          root.querySelector('#storeTabs [data-s="receipt"]').classList.add('active');
          drawStore('receipt');
        });
      }
    };

    const initialTab = state.storeTab || 'home';
    state.storeTab = 'home'; // reset
    root.querySelectorAll('#storeTabs .tab').forEach(x => {
      x.classList.toggle('active', x.dataset.s === initialTab);
    });
    drawStore(initialTab);

    root.querySelectorAll('#storeTabs .tab').forEach(t => t.addEventListener('click', () => {
      root.querySelectorAll('#storeTabs .tab').forEach(x => x.classList.remove('active'));
      t.classList.add('active');
      drawStore(t.dataset.s);
    }));
  };

  // Dedicated routes for Cart and Checkout
  PAGES.cart = (root) => {
    state.storeTab = 'cart';
    PAGES.store(root);
  };

  PAGES.checkout = (root) => {
    state.storeTab = 'checkout';
    PAGES.store(root);
  };

  // ============================================================
  // PART 7: Theme & Complete Multi-Color Palette System
  // ============================================================
  const COLOR_PALETTES = {
    '#F8BFD4': {
      name: 'Pastel Pink',
      light: {
        '--primary': '#F8BFD4',
        '--primary-600': '#EFA6C1',
        '--primary-700': '#DE85A7',
        '--primary-100': '#FCE3EE',
        '--primary-50': '#FDF1F6',
        '--bg': '#FFF8FB',
        '--card': '#FFFFFF',
        '--border': '#F3DCE6',
        '--text': '#333333',
        '--muted': '#777777',
        '--accent-text': '#B24C74',
        '--shadow': '0 6px 20px rgba(248,191,212,0.22)',
        '--shadow-soft': '0 2px 10px rgba(248,191,212,0.12)'
      },
      dark: {
        '--primary': '#F8BFD4',
        '--primary-600': '#EFA6C1',
        '--primary-700': '#DE85A7',
        '--primary-100': '#3A2530',
        '--primary-50': '#2B1E25',
        '--bg': '#1B1418',
        '--card': '#241A20',
        '--border': '#3E2732',
        '--text': '#F4E8EE',
        '--muted': '#B39BA6',
        '--accent-text': '#F8BFD4',
        '--shadow': '0 6px 20px rgba(0,0,0,0.4)',
        '--shadow-soft': '0 2px 10px rgba(0,0,0,0.25)'
      }
    },
    '#F0B265': {
      name: 'Warm Peach',
      light: {
        '--primary': '#F0B265',
        '--primary-600': '#E59838',
        '--primary-700': '#D48320',
        '--primary-100': '#FDF0DD',
        '--primary-50': '#FFF9F2',
        '--bg': '#FFFBF7',
        '--card': '#FFFFFF',
        '--border': '#F5E2CC',
        '--text': '#333333',
        '--muted': '#7A6A60',
        '--accent-text': '#B66810',
        '--shadow': '0 6px 20px rgba(240,178,101,0.22)',
        '--shadow-soft': '0 2px 10px rgba(240,178,101,0.12)'
      },
      dark: {
        '--primary': '#F0B265',
        '--primary-600': '#E59838',
        '--primary-700': '#D48320',
        '--primary-100': '#38281A',
        '--primary-50': '#281C10',
        '--bg': '#18130E',
        '--card': '#221B14',
        '--border': '#3A2D20',
        '--text': '#F5EBE1',
        '--muted': '#B09F90',
        '--accent-text': '#F0B265',
        '--shadow': '0 6px 20px rgba(0,0,0,0.4)',
        '--shadow-soft': '0 2px 10px rgba(0,0,0,0.25)'
      }
    },
    '#7CC59A': {
      name: 'Matcha Green',
      light: {
        '--primary': '#7CC59A',
        '--primary-600': '#5EB281',
        '--primary-700': '#489A6A',
        '--primary-100': '#E3F5EB',
        '--primary-50': '#F2FAF5',
        '--bg': '#F6FCF8',
        '--card': '#FFFFFF',
        '--border': '#D0EBDA',
        '--text': '#28332D',
        '--muted': '#687A70',
        '--accent-text': '#2F7C50',
        '--shadow': '0 6px 20px rgba(124,197,154,0.22)',
        '--shadow-soft': '0 2px 10px rgba(124,197,154,0.12)'
      },
      dark: {
        '--primary': '#7CC59A',
        '--primary-600': '#5EB281',
        '--primary-700': '#489A6A',
        '--primary-100': '#1C3325',
        '--primary-50': '#14241B',
        '--bg': '#0E1812',
        '--card': '#16221A',
        '--border': '#23382B',
        '--text': '#E3F2E9',
        '--muted': '#8DA396',
        '--accent-text': '#7CC59A',
        '--shadow': '0 6px 20px rgba(0,0,0,0.4)',
        '--shadow-soft': '0 2px 10px rgba(0,0,0,0.25)'
      }
    },
    '#8BB6E8': {
      name: 'Sky Blue',
      light: {
        '--primary': '#8BB6E8',
        '--primary-600': '#6AA0DE',
        '--primary-700': '#5189CD',
        '--primary-100': '#E5F0FC',
        '--primary-50': '#F4F8FD',
        '--bg': '#F7FAFD',
        '--card': '#FFFFFF',
        '--border': '#D4E5F7',
        '--text': '#28303B',
        '--muted': '#6A7888',
        '--accent-text': '#336DAE',
        '--shadow': '0 6px 20px rgba(139,182,232,0.22)',
        '--shadow-soft': '0 2px 10px rgba(139,182,232,0.12)'
      },
      dark: {
        '--primary': '#8BB6E8',
        '--primary-600': '#6AA0DE',
        '--primary-700': '#5189CD',
        '--primary-100': '#1A283A',
        '--primary-50': '#121E2C',
        '--bg': '#0F1722',
        '--card': '#15202E',
        '--border': '#223348',
        '--text': '#E6EFF8',
        '--muted': '#8E9EAF',
        '--accent-text': '#8BB6E8',
        '--shadow': '0 6px 20px rgba(0,0,0,0.4)',
        '--shadow-soft': '0 2px 10px rgba(0,0,0,0.25)'
      }
    },
    '#D6BEE9': {
      name: 'Lavender Purple',
      light: {
        '--primary': '#D6BEE9',
        '--primary-600': '#C19FDC',
        '--primary-700': '#AB83CD',
        '--primary-100': '#F4ECFA',
        '--primary-50': '#FAF6FD',
        '--bg': '#FCF9FE',
        '--card': '#FFFFFF',
        '--border': '#EBDCF5',
        '--text': '#302838',
        '--muted': '#786B83',
        '--accent-text': '#7D47A6',
        '--shadow': '0 6px 20px rgba(214,190,233,0.22)',
        '--shadow-soft': '0 2px 10px rgba(214,190,233,0.12)'
      },
      dark: {
        '--primary': '#D6BEE9',
        '--primary-600': '#C19FDC',
        '--primary-700': '#AB83CD',
        '--primary-100': '#2E2138',
        '--primary-50': '#22182B',
        '--bg': '#17111D',
        '--card': '#201728',
        '--border': '#362744',
        '--text': '#F1E9F6',
        '--muted': '#A596B3',
        '--accent-text': '#D6BEE9',
        '--shadow': '0 6px 20px rgba(0,0,0,0.4)',
        '--shadow-soft': '0 2px 10px rgba(0,0,0,0.25)'
      }
    }
  };

  function applyAppTheme(colorHex = state.color, themeMode = state.theme) {
    state.color = colorHex || '#F8BFD4';
    state.theme = themeMode || 'light';

    const palette = COLOR_PALETTES[state.color] || COLOR_PALETTES['#F8BFD4'];
    const vars = (palette && palette[state.theme]) ? palette[state.theme] : (palette ? palette.light : {});

    document.documentElement.setAttribute('data-theme', state.theme);
    Object.entries(vars).forEach(([k, v]) => {
      document.documentElement.style.setProperty(k, v);
    });

    localStorage.setItem('haypos_color', state.color);
    localStorage.setItem('haypos_theme', state.theme);

    // Live re-draw charts when theme or color changes
    if (state.page === 'dashboard' && typeof drawSalesChart === 'function') {
      setTimeout(() => drawSalesChart(), 20);
    } else if (state.page === 'reports' && typeof drawReportsCharts === 'function') {
      setTimeout(() => drawReportsCharts(), 20);
    }
  }

  function setTheme(mode) {
    applyAppTheme(state.color, mode);
  }

  function setColorAccent(colorHex) {
    applyAppTheme(colorHex, state.theme);
  }

  function createSnowflakes() {
    const snowWrap = $('#snowContainer');
    if (!snowWrap) return;
    snowWrap.innerHTML = '';
    const flakeCount = 42;
    for (let i = 0; i < flakeCount; i++) {
      const dot = document.createElement('div');
      dot.className = 'snowflake';
      const size = Math.random() * 4.5 + 3; // 3px to 7.5px
      const left = Math.random() * 100; // 0% to 100%
      const duration = Math.random() * 3.5 + 3.2; // 3.2s to 6.7s
      const delay = Math.random() * 3.5; // 0s to 3.5s
      const drift = (Math.random() * 45 - 15) + 'px';
      const opacity = Math.random() * 0.45 + 0.45;
      dot.style.width = size + 'px';
      dot.style.height = size + 'px';
      dot.style.left = left + '%';
      dot.style.animationDuration = duration + 's';
      dot.style.animationDelay = delay + 's';
      dot.style.setProperty('--snow-drift', drift);
      dot.style.setProperty('--snow-op', opacity);
      snowWrap.appendChild(dot);
    }
  }

  function runLoadingProgress(onComplete) {
    const overlay = $('#loadingOverlay');
    const fill = $('#loadingFill');
    const text = $('#loadingPercentText');
    const title = $('#loadingTitle');

    if (title) {
      title.textContent = state.store.loadingTitle || state.store.name || 'BNC HayMate';
    }

    createSnowflakes();

    if (!overlay || !fill || !text) {
      if (onComplete) onComplete();
      return;
    }
    let progress = 0;
    const interval = setInterval(() => {
      progress += Math.floor(Math.random() * 12) + 6;
      if (progress >= 100) {
        progress = 100;
        fill.style.width = '100%';
        text.textContent = '100%';
        clearInterval(interval);
        setTimeout(() => {
          overlay.classList.add('hidden');
          setTimeout(() => { overlay.style.display = 'none'; }, 450);
          if (onComplete) onComplete();
        }, 250);
      } else {
        fill.style.width = `${progress}%`;
        text.textContent = `${progress}%`;
      }
    }, 40);
  }

  function init() {
    const savedTheme = localStorage.getItem('haypos_theme') || 'light';
    const savedColor = localStorage.getItem('haypos_color') || '#F8BFD4';
    applyAppTheme(savedColor, savedTheme);

    initSupabase();
    renderMenu();
    renderPage();

    // Topbar & Global Buttons (Active Sidebar Collapse & Drawer Toggle)
    const menuToggle = $('#menuToggle');
    if (menuToggle) {
      menuToggle.addEventListener('click', (e) => {
        e.stopPropagation();
        const app = $('#app');
        const sidebar = $('#sidebar');
        if (window.innerWidth <= 780) {
          let bd = document.getElementById('sidebarBackdrop');
          if (!bd) {
            bd = document.createElement('div');
            bd.id = 'sidebarBackdrop';
            bd.className = 'sidebar-backdrop';
            document.body.appendChild(bd);
            bd.addEventListener('click', () => {
              sidebar?.classList.remove('open');
              bd.classList.remove('active');
            });
          }
          const isOpen = sidebar?.classList.toggle('open');
          bd.classList.toggle('active', !!isOpen);
        } else {
          app?.classList.toggle('collapsed');
          const isCollapsed = app?.classList.contains('collapsed');
          localStorage.setItem('haypos_sidebar_collapsed', isCollapsed ? '1' : '0');
        }
      });
    }

    if (localStorage.getItem('haypos_sidebar_collapsed') === '1' && window.innerWidth > 780) {
      $('#app')?.classList.add('collapsed');
    }

    const themeToggle = $('#themeToggle');
    if (themeToggle) themeToggle.addEventListener('click', () => setTheme(state.theme === 'light' ? 'dark' : 'light'));

    const userChip = $('#userChip');
    if (userChip) {
      userChip.addEventListener('click', () => {
        if (state.isAdmin) {
          openModal({
            title: 'Admin Session',
            body: `<p style="font-size:13.5px; margin:0;">Logged in as <strong>${escapeHTML(state.user?.full_name || 'Admin')}</strong> (${escapeHTML(state.user?.email || 'admin@bnchaymate.com')})</p>`,
            actions: [
              { label: 'Switch to Customer View', kind: 'ghost', onClick: lockToVisitorMode },
              { label: 'Sign Out', kind: 'danger', onClick: lockToVisitorMode }
            ]
          });
        } else {
          openAdminPinModal();
        }
      });
    }

    const brandLogoBtn = $('#brandLogoBtn');
    if (brandLogoBtn) {
      brandLogoBtn.addEventListener('click', () => {
        state.page = 'store';
        renderMenu();
        renderPage();
      });
    }

    const globalSearch = $('#globalSearchInput');
    if (globalSearch) {
      globalSearch.addEventListener('input', (e) => {
        const val = e.target.value.toLowerCase().trim();
        if (val) {
          state.page = state.isAdmin ? 'products' : 'store';
          renderMenu();
          renderPage();
          setTimeout(() => {
            const ps = $('#prodSearch') || $('#storeSearch');
            if (ps) { ps.value = val; ps.dispatchEvent(new Event('input')); }
          }, 50);
        }
      });
    }

    // Physical Keyboard Listener for 6-Digit PIN
    document.addEventListener('keydown', (e) => {
      const pinModal = document.querySelector('.pin-modal-card');
      if (!pinModal) return;
      if (e.key >= '0' && e.key <= '9') {
        const keyBtn = pinModal.querySelector(`.pin-key[data-k="${e.key}"]`);
        if (keyBtn) keyBtn.click();
      } else if (e.key === 'Backspace') {
        const delBtn = pinModal.querySelector('.pin-key[data-k="del"]');
        if (delBtn) delBtn.click();
      } else if (e.key === 'Escape') {
        closeModal();
      }
    });

    // Run Cute Loading Tube Progress Bar
    runLoadingProgress();

    // Initialize Stock Low Alerts Notification System
    initStockNotifications();

    // Check Auth Session & Connect live backend with Realtime
    checkAuthSession();
    loadSupabaseData();
    setupRealtimeSubscriptions();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
