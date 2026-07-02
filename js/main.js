/* ========================================
   PAYEL FOOD PRODUCTS - Main JavaScript
   Production-Ready E-commerce Logic
   ======================================== */

// ===== PRODUCT DATA (Loaded from Admin Panel via localStorage) =====
// No hardcoded products! Only shows products added through Admin Panel.
const PRODUCTS = (function() {
    const adminProducts = JSON.parse(localStorage.getItem('payel_admin_products')) || [];
    // Convert admin products to storefront format
    return adminProducts.map(p => ({
        id: p.id,
        name: p.name,
        category: (p.category || '').toLowerCase().replace(' ', ''),
        price: p.price,
        mrp: p.mrp || p.price,
        weight: p.weight,
        rating: 4.5,
        reviews: Math.floor(Math.random() * 50) + 10,
        image: p.photo || getCategoryEmojiStatic(p.category),
        badge: p.stock === 0 ? '' : (p.mrp && p.mrp > p.price) ? 'offer' : 'new',
        stock: p.stock > 0,
        desc: p.desc || p.name
    }));
})();

// Helper for initial load (before getCategoryEmoji is defined)
function getCategoryEmojiStatic(cat) {
    const map = { 'Chanachur':'🥨', 'Bhujia':'🍿', 'Mixture':'🥜', 'Namkeen':'🍘', 'Peanut':'🥜', 'Moong Dal':'🫘', 'Chips':'🍟', 'Papad':'🫓', 'Sweets':'🍬', 'Pickles':'🥒' };
    return map[cat] || '📦';
}


// ===== CART STATE =====
let cart = JSON.parse(localStorage.getItem('payel_cart')) || [];
let wishlist = JSON.parse(localStorage.getItem('payel_wishlist')) || [];

// ===== UTILITIES =====
function saveCart() { localStorage.setItem('payel_cart', JSON.stringify(cart)); updateCartUI(); }
function saveWishlist() { localStorage.setItem('payel_wishlist', JSON.stringify(wishlist)); updateWishlistUI(); }
function getDiscount(price, mrp) { return Math.round(((mrp - price) / mrp) * 100); }
function getCategoryEmoji(cat) {
    const map = { chanachur:'🥨', bhujia:'🍿', mixture:'🥜', namkeen:'🍘', peanut:'🥜', moongdal:'🫘', chips:'🍟', papad:'🫓' };
    return map[cat] || '📦';
}

// ===== TOAST =====
function showToast(message, icon = 'check-circle') {
    const container = document.getElementById('toastContainer');
    if (!container) return;
    const toast = document.createElement('div');
    toast.className = 'toast';
    toast.innerHTML = `<i class="fas fa-${icon}"></i> ${message}`;
    container.appendChild(toast);
    setTimeout(() => { toast.style.opacity = '0'; toast.style.transform = 'translateX(100%)'; toast.style.transition = '0.3s'; setTimeout(() => toast.remove(), 300); }, 3000);
}

// ===== CART LOGIC =====
function addToCart(productId) {
    const product = PRODUCTS.find(p => p.id === productId);
    if (!product || !product.stock) return;
    const existing = cart.find(item => item.id === productId);
    if (existing) { existing.qty++; }
    else { cart.push({ id: product.id, qty: 1 }); }
    saveCart();
    showToast(`${product.name} added to cart`);
}

function removeFromCart(productId) {
    cart = cart.filter(item => item.id !== productId);
    saveCart();
}

function updateQty(productId, delta) {
    const item = cart.find(i => i.id === productId);
    if (!item) return;
    item.qty += delta;
    if (item.qty <= 0) { removeFromCart(productId); return; }
    saveCart();
}

function getCartTotal() {
    return cart.reduce((sum, item) => {
        const p = PRODUCTS.find(pr => pr.id === item.id);
        return sum + (p ? p.price * item.qty : 0);
    }, 0);
}

function getCartCount() { return cart.reduce((sum, item) => sum + item.qty, 0); }

function updateCartUI() {
    const countEl = document.getElementById('cartCount');
    const itemCountEl = document.getElementById('cartItemCount');
    const totalEl = document.getElementById('cartTotal');
    const bodyEl = document.getElementById('cartBody');
    const footerEl = document.getElementById('cartFooter');
    const emptyEl = document.getElementById('cartEmpty');

    const count = getCartCount();
    if (countEl) countEl.textContent = count;
    if (itemCountEl) itemCountEl.textContent = `(${cart.length} items)`;

    if (!bodyEl) return;

    if (cart.length === 0) {
        if (emptyEl) emptyEl.style.display = 'block';
        if (footerEl) footerEl.style.display = 'none';
        bodyEl.innerHTML = '';
        bodyEl.appendChild(emptyEl || document.createElement('div'));
        return;
    }

    if (emptyEl) emptyEl.style.display = 'none';
    if (footerEl) footerEl.style.display = 'block';
    if (totalEl) totalEl.textContent = `₹${getCartTotal()}`;

    bodyEl.innerHTML = cart.map(item => {
        const p = PRODUCTS.find(pr => pr.id === item.id);
        if (!p) return '';
        return `<div class="cart-item">
            <div class="cart-item-img">${p.image}</div>
            <div class="cart-item-details">
                <div class="cart-item-name">${p.name}</div>
                <div class="cart-item-meta">${p.weight} · ${p.category}</div>
                <div class="cart-item-bottom">
                    <span class="cart-item-price">₹${p.price * item.qty}</span>
                    <div class="qty-control">
                        <button onclick="updateQty(${p.id}, -1)">−</button>
                        <span>${item.qty}</span>
                        <button onclick="updateQty(${p.id}, 1)">+</button>
                    </div>
                </div>
            </div>
        </div>`;
    }).join('');
}


// ===== WISHLIST =====
function toggleWishlist(productId) {
    const idx = wishlist.indexOf(productId);
    if (idx > -1) { wishlist.splice(idx, 1); showToast('Removed from wishlist', 'heart-broken'); }
    else { wishlist.push(productId); showToast('Added to wishlist', 'heart'); }
    saveWishlist();
}

function updateWishlistUI() {
    const el = document.getElementById('wishlistCount');
    if (el) el.textContent = wishlist.length;
    document.querySelectorAll('.product-wishlist').forEach(btn => {
        const id = parseInt(btn.dataset.id);
        btn.classList.toggle('active', wishlist.includes(id));
        btn.querySelector('i').className = wishlist.includes(id) ? 'fas fa-heart' : 'far fa-heart';
    });
}

// ===== PRODUCT CARD RENDERER =====
function renderProductCard(product) {
    const discount = getDiscount(product.price, product.mrp);
    const isWished = wishlist.includes(product.id);
    return `<div class="product-card" data-id="${product.id}">
        ${product.badge ? `<span class="product-badge ${product.badge}">${product.badge === 'best' ? 'Bestseller' : product.badge === 'new' ? 'New' : discount + '% OFF'}</span>` : ''}
        <button class="product-wishlist ${isWished ? 'active' : ''}" data-id="${product.id}" onclick="toggleWishlist(${product.id})">
            <i class="${isWished ? 'fas' : 'far'} fa-heart"></i>
        </button>
    <a href="pages/product-detail.html?id=${product.id}" class="product-img">${
        product.image.startsWith('data:') || product.image.startsWith('http')
            ? `<img src="${product.image}" alt="${product.name}" style="max-width:80%;max-height:80%;object-fit:contain;">`
            : `<span>${product.image}</span>`
    }</a>
        <div class="product-info">
            <span class="product-weight">${product.weight}</span>
            <a href="pages/product-detail.html?id=${product.id}" class="product-name">${product.name}</a>
            <div class="product-rating"><i class="fas fa-star"></i> ${product.rating} <span>(${product.reviews})</span></div>
            <div class="product-price">
                <span class="price-current">₹${product.price}</span>
                <span class="price-original">₹${product.mrp}</span>
                <span class="price-discount">${discount}% OFF</span>
            </div>
            ${product.stock ? `<div class="product-stock">In Stock</div>` : `<div class="product-stock out">Out of Stock</div>`}
            <button class="product-add" onclick="addToCart(${product.id})" ${!product.stock ? 'disabled style="opacity:0.5;cursor:not-allowed;"' : ''}>
                ${product.stock ? 'Add' : 'Sold Out'}
            </button>
        </div>
    </div>`;
}

// ===== RENDER PRODUCT ROWS =====
function renderProductSection(containerId, products) {
    const el = document.getElementById(containerId);
    if (!el) return;
    el.innerHTML = products.map(p => renderProductCard(p)).join('');
}

// ===== HERO SLIDER =====
let currentSlide = 0;
let slideInterval;

function initHeroSlider() {
    const slides = document.querySelectorAll('.hero-slide');
    const dotsContainer = document.getElementById('heroDots');
    if (!slides.length || !dotsContainer) return;

    // Create dots
    slides.forEach((_, i) => {
        const dot = document.createElement('div');
        dot.className = `hero-dot ${i === 0 ? 'active' : ''}`;
        dot.onclick = () => goToSlide(i);
        dotsContainer.appendChild(dot);
    });

    slideInterval = setInterval(() => goToSlide(currentSlide + 1), 5000);
}

function goToSlide(index) {
    const slides = document.querySelectorAll('.hero-slide');
    const dots = document.querySelectorAll('.hero-dot');
    if (!slides.length) return;

    slides[currentSlide].classList.remove('active');
    currentSlide = (index + slides.length) % slides.length;
    slides[currentSlide].classList.add('active');
    dots.forEach((d, i) => d.classList.toggle('active', i === currentSlide));
}


// ===== SEARCH =====
function initSearch() {
    const input = document.getElementById('searchInput');
    const dropdown = document.getElementById('searchDropdown');
    if (!input || !dropdown) return;

    input.addEventListener('input', () => {
        const q = input.value.toLowerCase().trim();
        if (q.length < 2) { dropdown.classList.remove('active'); return; }

        const results = PRODUCTS.filter(p =>
            p.name.toLowerCase().includes(q) ||
            p.category.includes(q)
        ).slice(0, 6);

        if (results.length === 0) {
            dropdown.innerHTML = '<div style="padding:16px;text-align:center;color:#999;font-size:0.85rem;">No results found</div>';
        } else {
            dropdown.innerHTML = results.map(p => `
                <a href="pages/product-detail.html?id=${p.id}" style="display:flex;align-items:center;gap:12px;padding:10px 14px;border-bottom:1px solid #f0f0f0;transition:background 0.15s;">
                    <span style="font-size:1.5rem;">${p.image}</span>
                    <div style="flex:1;">
                        <div style="font-size:0.85rem;font-weight:500;">${p.name}</div>
                        <div style="font-size:0.75rem;color:#999;">${p.category} · ${p.weight}</div>
                    </div>
                    <strong style="font-size:0.9rem;color:#C41E3A;">₹${p.price}</strong>
                </a>
            `).join('');
        }
        dropdown.classList.add('active');
    });

    // Close on outside click
    document.addEventListener('click', (e) => {
        if (!e.target.closest('.search-wrapper')) dropdown.classList.remove('active');
    });

    // Keyboard shortcut Ctrl+K
    document.addEventListener('keydown', (e) => {
        if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
            e.preventDefault();
            input.focus();
        }
    });
}

// ===== CART SIDEBAR TOGGLE =====
function initCartSidebar() {
    const toggle = document.getElementById('cartToggle');
    const sidebar = document.getElementById('cartSidebar');
    const overlay = document.getElementById('cartOverlay');
    const close = document.getElementById('cartClose');

    if (!toggle || !sidebar) return;

    const openCart = () => { sidebar.classList.add('active'); overlay.classList.add('active'); document.body.style.overflow = 'hidden'; };
    const closeCart = () => { sidebar.classList.remove('active'); overlay.classList.remove('active'); document.body.style.overflow = ''; };

    toggle.addEventListener('click', openCart);
    if (close) close.addEventListener('click', closeCart);
    if (overlay) overlay.addEventListener('click', closeCart);
}

// ===== MOBILE MENU =====
function initMobileMenu() {
    const btn = document.getElementById('mobileMenuBtn');
    const menu = document.getElementById('mobileMenu');
    const overlay = document.getElementById('mobileOverlay');
    const close = document.getElementById('mobileClose');

    if (!btn || !menu) return;

    const openMenu = () => { menu.classList.add('active'); overlay.classList.add('active'); document.body.style.overflow = 'hidden'; };
    const closeMenu = () => { menu.classList.remove('active'); overlay.classList.remove('active'); document.body.style.overflow = ''; };

    btn.addEventListener('click', openMenu);
    if (close) close.addEventListener('click', closeMenu);
    if (overlay) overlay.addEventListener('click', closeMenu);
}

// ===== TOP BAR =====
function closeTopBar() {
    const bar = document.getElementById('topBar');
    if (bar) { bar.style.transform = 'translateY(-100%)'; bar.style.transition = '0.3s'; setTimeout(() => bar.style.display = 'none', 300); }
}

// ===== HEADER SCROLL SHADOW =====
function initHeaderScroll() {
    const header = document.getElementById('header');
    if (!header) return;
    window.addEventListener('scroll', () => {
        header.style.boxShadow = window.scrollY > 10 ? '0 2px 10px rgba(0,0,0,0.08)' : 'none';
    });
}


// ===== INITIALIZE =====
document.addEventListener('DOMContentLoaded', () => {
    // Hero Slider
    initHeroSlider();

    // Search
    initSearch();

    // Cart Sidebar
    initCartSidebar();

    // Mobile Menu
    initMobileMenu();

    // Header Scroll
    initHeaderScroll();

    // Render product sections on homepage
    const bestSellers = PRODUCTS.filter(p => p.badge === 'best');
    const newArrivals = PRODUCTS.filter(p => p.badge === 'new');
    const topChanachur = PRODUCTS.filter(p => p.category === 'chanachur');
    const popularBhujia = PRODUCTS.filter(p => p.category === 'bhujia' || p.category === 'namkeen');

    renderProductSection('bestSellers', bestSellers);
    renderProductSection('newArrivals', newArrivals);
    renderProductSection('topChanachur', topChanachur);
    renderProductSection('popularBhujia', popularBhujia);

    // Update cart & wishlist UI
    updateCartUI();
    updateWishlistUI();
});
