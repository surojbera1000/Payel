/* ========================================
   PAYEL FOOD PRODUCTS - Main JavaScript
   Production-Ready E-commerce Logic
   ======================================== */

// ===== PRODUCT DATA =====
const PRODUCTS = [
    { id: 1, name: "Premium Chanachur Special", category: "chanachur", price: 149, mrp: 189, weight: "200g", rating: 4.8, reviews: 128, image: "🥨", badge: "best", stock: true, desc: "Our signature chanachur blend with premium spices and crunchy texture." },
    { id: 2, name: "Classic Bhujia Sev", category: "bhujia", price: 129, mrp: 159, weight: "400g", rating: 4.6, reviews: 96, image: "🍿", badge: "best", stock: true, desc: "Thin, crispy bhujia sev made with besan and secret spice mix." },
    { id: 3, name: "Royal Mix Namkeen", category: "mixture", price: 179, mrp: 219, weight: "250g", rating: 4.9, reviews: 215, image: "🥜", badge: "best", stock: true, desc: "A royal blend of nuts, sev, and crispy elements." },
    { id: 4, name: "Spicy Aloo Bhujia", category: "namkeen", price: 99, mrp: 129, weight: "200g", rating: 4.5, reviews: 87, image: "🍘", badge: "offer", stock: true, desc: "Potato-based bhujia with bold spices for snack lovers." },
    { id: 5, name: "Crispy Moong Dal", category: "moongdal", price: 89, mrp: 109, weight: "150g", rating: 4.7, reviews: 64, image: "🫘", badge: "new", stock: true, desc: "Light and crunchy moong dal, lightly salted and roasted." },
    { id: 6, name: "Masala Potato Chips", category: "chips", price: 69, mrp: 89, weight: "100g", rating: 4.4, reviews: 43, image: "🍟", badge: "new", stock: true, desc: "Thick-cut potato chips with authentic masala seasoning." },
    { id: 7, name: "Chanachur Family Pack", category: "chanachur", price: 299, mrp: 399, weight: "1kg", rating: 4.9, reviews: 312, image: "🥨", badge: "best", stock: true, desc: "Family-size pack of our premium chanachur. Great value!" },
    { id: 8, name: "Dal Moth Premium", category: "mixture", price: 119, mrp: 149, weight: "200g", rating: 4.6, reviews: 78, image: "🥜", badge: "offer", stock: true, desc: "Traditional dal moth with tangy spices and fried lentils." },
    { id: 9, name: "Masala Peanut", category: "peanut", price: 109, mrp: 139, weight: "250g", rating: 4.5, reviews: 93, image: "🥜", badge: "best", stock: true, desc: "Crunchy peanuts coated with spicy masala." },
    { id: 10, name: "Khasta Papad", category: "papad", price: 79, mrp: 99, weight: "200g", rating: 4.3, reviews: 55, image: "🫓", badge: "new", stock: true, desc: "Crispy urad dal papad, ready to fry or roast." },
    { id: 11, name: "Jhaal Chanachur", category: "chanachur", price: 159, mrp: 199, weight: "300g", rating: 4.8, reviews: 156, image: "🥨", badge: "offer", stock: true, desc: "Extra spicy chanachur for those who love heat!" },
    { id: 12, name: "Bhujia Family Jar", category: "bhujia", price: 249, mrp: 329, weight: "500g", rating: 4.7, reviews: 134, image: "🍿", badge: "best", stock: true, desc: "Reusable jar packed with our finest bhujia sev." },
    { id: 13, name: "Bengali Mixture", category: "mixture", price: 139, mrp: 169, weight: "200g", rating: 4.6, reviews: 105, image: "🥜", badge: "new", stock: true, desc: "Authentic Bengali-style mixture with puffed rice and chanachur." },
    { id: 14, name: "Roasted Chana", category: "peanut", price: 59, mrp: 79, weight: "150g", rating: 4.2, reviews: 42, image: "🥜", badge: "", stock: true, desc: "Lightly salted roasted chickpeas - healthy snacking." },
    { id: 15, name: "Nimki Pack", category: "namkeen", price: 89, mrp: 109, weight: "200g", rating: 4.4, reviews: 61, image: "🍘", badge: "new", stock: true, desc: "Flaky, diamond-shaped nimki with cumin seeds." },
    { id: 16, name: "Hot Chips Combo", category: "chips", price: 149, mrp: 199, weight: "300g", rating: 4.5, reviews: 72, image: "🍟", badge: "offer", stock: false, desc: "Spicy chips combo pack - 3 flavors in one!" },
];


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
        <a href="pages/product-detail.html?id=${product.id}" class="product-img"><span>${product.image}</span></a>
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
