/* ========================================
   Payel Food Products - Main JavaScript
   ======================================== */

// ===== Product Data =====
const products = [
    { id: 1, name: 'Premium Chanachur Special', category: 'Chanachur', price: 149, originalPrice: 189, weight: '200g | 500g | 1kg', rating: 5, reviews: 128, image: '🥨', badge: 'sale', badgeText: '20% OFF', stock: true },
    { id: 2, name: 'Classic Bhujia Sev', category: 'Bhujia', price: 129, originalPrice: 159, weight: '150g | 400g | 1kg', rating: 4, reviews: 96, image: '🍿', badge: 'new', badgeText: 'NEW', stock: true },
    { id: 3, name: 'Royal Mix Namkeen', category: 'Mixture', price: 179, originalPrice: 219, weight: '250g | 500g', rating: 5, reviews: 215, image: '🥜', badge: 'bestseller', badgeText: 'BESTSELLER', stock: true },
    { id: 4, name: 'Spicy Aloo Bhujia', category: 'Namkeen', price: 99, originalPrice: 129, weight: '200g | 500g', rating: 4, reviews: 87, image: '🍘', badge: '', badgeText: '', stock: true },
    { id: 5, name: 'Crispy Moong Dal', category: 'Moong Dal', price: 89, originalPrice: 109, weight: '150g | 300g', rating: 5, reviews: 64, image: '🫘', badge: 'sale', badgeText: '15% OFF', stock: true },
    { id: 6, name: 'Masala Potato Chips', category: 'Chips', price: 69, originalPrice: 89, weight: '100g | 200g | 500g', rating: 4, reviews: 43, image: '🍟', badge: 'new', badgeText: 'NEW', stock: true },
    { id: 7, name: 'Special Chanachur Family Pack', category: 'Chanachur', price: 299, originalPrice: 399, weight: '1kg', rating: 5, reviews: 312, image: '🥨', badge: 'bestseller', badgeText: 'BESTSELLER', stock: true },
    { id: 8, name: 'Premium Bhujia Combo', category: 'Bhujia', price: 249, originalPrice: 329, weight: '500g + 500g', rating: 5, reviews: 256, image: '🍿', badge: 'sale', badgeText: '25% OFF', stock: true },
    { id: 9, name: 'Masala Peanut Jar', category: 'Peanut', price: 199, originalPrice: 249, weight: '500g', rating: 4, reviews: 189, image: '🥜', badge: '', badgeText: '', stock: true },
    { id: 10, name: 'Traditional Papad Pack', category: 'Papad', price: 79, originalPrice: 99, weight: '200g', rating: 4, reviews: 55, image: '🫓', badge: '', badgeText: '', stock: true },
];

// ===== Cart =====
let cart = JSON.parse(localStorage.getItem('payel_cart')) || [];

function updateCartCount() {
    const count = cart.reduce((sum, item) => sum + item.quantity, 0);
    document.getElementById('cartCount').textContent = count;
}


function addToCart(productId) {
    const product = products.find(p => p.id === productId);
    if (!product) return;
    
    const existing = cart.find(item => item.id === productId);
    if (existing) {
        existing.quantity++;
    } else {
        cart.push({ ...product, quantity: 1 });
    }
    
    localStorage.setItem('payel_cart', JSON.stringify(cart));
    updateCartCount();
    showToast(`${product.name} added to cart!`);
}

function buyNow(productId) {
    addToCart(productId);
    window.location.href = 'pages/cart.html';
}

function removeFromCart(productId) {
    cart = cart.filter(item => item.id !== productId);
    localStorage.setItem('payel_cart', JSON.stringify(cart));
    updateCartCount();
}

function updateQuantity(productId, change) {
    const item = cart.find(i => i.id === productId);
    if (item) {
        item.quantity += change;
        if (item.quantity <= 0) {
            removeFromCart(productId);
        } else {
            localStorage.setItem('payel_cart', JSON.stringify(cart));
            updateCartCount();
        }
    }
}

// ===== Toast Notification =====
function showToast(message) {
    const toast = document.createElement('div');
    toast.className = 'toast-notification';
    toast.innerHTML = `<i class="fas fa-check-circle"></i> ${message}`;
    toast.style.cssText = `
        position: fixed; top: 80px; right: 20px; background: #10b981; color: white;
        padding: 14px 24px; border-radius: 10px; font-size: 0.9rem; z-index: 10000;
        display: flex; align-items: center; gap: 10px; box-shadow: 0 5px 20px rgba(0,0,0,0.15);
        animation: slideDown 0.3s ease; font-family: 'Poppins', sans-serif;
    `;
    document.body.appendChild(toast);
    setTimeout(() => {
        toast.style.opacity = '0';
        toast.style.transform = 'translateX(100%)';
        toast.style.transition = 'all 0.3s ease';
        setTimeout(() => toast.remove(), 300);
    }, 3000);
}

// ===== Hero Slider =====
let currentSlide = 0;
const slides = document.querySelectorAll('.hero-slide');
const dotsContainer = document.getElementById('heroDots');

function initSlider() {
    if (!dotsContainer || slides.length === 0) return;
    slides.forEach((_, index) => {
        const dot = document.createElement('div');
        dot.className = `hero-dot ${index === 0 ? 'active' : ''}`;
        dot.onclick = () => goToSlide(index);
        dotsContainer.appendChild(dot);
    });
}

function goToSlide(index) {
    slides[currentSlide].classList.remove('active');
    currentSlide = index;
    if (currentSlide >= slides.length) currentSlide = 0;
    if (currentSlide < 0) currentSlide = slides.length - 1;
    slides[currentSlide].classList.add('active');
    
    const dots = document.querySelectorAll('.hero-dot');
    dots.forEach((dot, i) => dot.classList.toggle('active', i === currentSlide));
}

function nextSlide() { goToSlide(currentSlide + 1); }
function prevSlide() { goToSlide(currentSlide - 1); }

// Auto slide
setInterval(nextSlide, 5000);


// ===== Mobile Menu =====
const mobileMenuBtn = document.getElementById('mobileMenuBtn');
const navMenu = document.getElementById('navMenu');

if (mobileMenuBtn) {
    mobileMenuBtn.addEventListener('click', () => {
        navMenu.classList.toggle('active');
        const icon = mobileMenuBtn.querySelector('i');
        icon.className = navMenu.classList.contains('active') ? 'fas fa-times' : 'fas fa-bars';
    });
}

// ===== Dark Mode =====
const darkModeToggle = document.getElementById('darkModeToggle');
let isDarkMode = localStorage.getItem('payel_dark_mode') === 'true';

function toggleDarkMode() {
    isDarkMode = !isDarkMode;
    document.documentElement.setAttribute('data-theme', isDarkMode ? 'dark' : 'light');
    localStorage.setItem('payel_dark_mode', isDarkMode);
    const icon = darkModeToggle.querySelector('i');
    icon.className = isDarkMode ? 'fas fa-sun' : 'fas fa-moon';
}

if (darkModeToggle) {
    darkModeToggle.addEventListener('click', toggleDarkMode);
    // Apply saved theme
    if (isDarkMode) {
        document.documentElement.setAttribute('data-theme', 'dark');
        darkModeToggle.querySelector('i').className = 'fas fa-sun';
    }
}

// ===== Notification Bar =====
function closeNotification() {
    const bar = document.getElementById('notificationBar');
    if (bar) {
        bar.style.transform = 'translateY(-100%)';
        bar.style.transition = 'transform 0.3s ease';
        setTimeout(() => bar.style.display = 'none', 300);
    }
}

// ===== Back to Top =====
const backToTop = document.getElementById('backToTop');
window.addEventListener('scroll', () => {
    if (backToTop) {
        backToTop.classList.toggle('visible', window.scrollY > 500);
    }
    // Header shadow
    const header = document.getElementById('header');
    if (header) {
        header.style.boxShadow = window.scrollY > 50 ? '0 4px 20px rgba(0,0,0,0.1)' : 'none';
    }
});

function scrollToTop() {
    window.scrollTo({ top: 0, behavior: 'smooth' });
}

// ===== Countdown Timer =====
function updateTimer() {
    const target = new Date();
    target.setDate(target.getDate() + 15);
    
    function tick() {
        const now = new Date();
        const diff = target - now;
        
        const days = Math.floor(diff / (1000 * 60 * 60 * 24));
        const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
        const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
        const seconds = Math.floor((diff % (1000 * 60)) / 1000);
        
        const daysEl = document.getElementById('days');
        const hoursEl = document.getElementById('hours');
        const minutesEl = document.getElementById('minutes');
        const secondsEl = document.getElementById('seconds');
        
        if (daysEl) daysEl.textContent = String(days).padStart(2, '0');
        if (hoursEl) hoursEl.textContent = String(hours).padStart(2, '0');
        if (minutesEl) minutesEl.textContent = String(minutes).padStart(2, '0');
        if (secondsEl) secondsEl.textContent = String(seconds).padStart(2, '0');
    }
    
    tick();
    setInterval(tick, 1000);
}


// ===== Quick View Modal =====
function openQuickView(productId) {
    const product = products.find(p => p.id === productId);
    if (!product) return;
    
    const modal = document.getElementById('quickViewModal');
    const body = document.getElementById('quickViewBody');
    
    body.innerHTML = `
        <div class="quick-view-grid">
            <div class="quick-view-image">
                <div class="product-placeholder" style="font-size:8rem;">${product.image}</div>
            </div>
            <div class="quick-view-info">
                <span class="product-category">${product.category}</span>
                <h2 style="font-family:var(--font-heading);margin:10px 0;font-size:1.5rem;">${product.name}</h2>
                <div class="product-rating">
                    <div class="stars">${'★'.repeat(product.rating)}${'☆'.repeat(5-product.rating)}</div>
                    <span>(${product.reviews} reviews)</span>
                </div>
                <div class="product-weight" style="margin:10px 0;">${product.weight}</div>
                <div class="product-price" style="margin:15px 0;">
                    <span class="current-price" style="font-size:1.8rem;">₹${product.price}</span>
                    <span class="original-price">₹${product.originalPrice}</span>
                    <span style="color:#10b981;font-weight:600;font-size:0.9rem;">${Math.round((1-product.price/product.originalPrice)*100)}% OFF</span>
                </div>
                <p style="color:var(--text-light);margin-bottom:15px;font-size:0.9rem;">Premium quality ${product.category.toLowerCase()} made with fresh ingredients. FSSAI certified, hygienically packed for your safety.</p>
                <div style="display:flex;gap:10px;margin-top:20px;">
                    <button class="btn btn-cart" onclick="addToCart(${product.id});closeQuickView()"><i class="fas fa-cart-plus"></i> Add to Cart</button>
                    <button class="btn btn-buy" onclick="buyNow(${product.id})">Buy Now</button>
                </div>
            </div>
        </div>
    `;
    
    modal.classList.add('active');
    document.body.style.overflow = 'hidden';
}

function closeQuickView() {
    const modal = document.getElementById('quickViewModal');
    modal.classList.remove('active');
    document.body.style.overflow = 'auto';
}

// ===== Search =====
const searchInput = document.getElementById('searchInput');
const searchSuggestions = document.getElementById('searchSuggestions');

if (searchInput) {
    searchInput.addEventListener('input', (e) => {
        const query = e.target.value.toLowerCase().trim();
        if (query.length < 2) {
            searchSuggestions.style.display = 'none';
            return;
        }
        
        const results = products.filter(p => 
            p.name.toLowerCase().includes(query) || 
            p.category.toLowerCase().includes(query)
        );
        
        if (results.length > 0) {
            searchSuggestions.style.display = 'block';
            searchSuggestions.innerHTML = results.slice(0, 5).map(p => `
                <a href="pages/products.html?id=${p.id}" style="display:flex;align-items:center;gap:12px;padding:12px 15px;border-bottom:1px solid var(--border);transition:var(--transition);">
                    <span style="font-size:1.5rem;">${p.image}</span>
                    <div>
                        <div style="font-weight:500;font-size:0.9rem;">${p.name}</div>
                        <div style="font-size:0.8rem;color:var(--text-muted);">${p.category} · ₹${p.price}</div>
                    </div>
                </a>
            `).join('');
        } else {
            searchSuggestions.style.display = 'block';
            searchSuggestions.innerHTML = '<div style="padding:15px;text-align:center;color:var(--text-muted);">No products found</div>';
        }
    });
    
    // Close suggestions on click outside
    document.addEventListener('click', (e) => {
        if (!e.target.closest('.search-bar')) {
            searchSuggestions.style.display = 'none';
        }
    });
}

// ===== Newsletter =====
function subscribeNewsletter(e) {
    e.preventDefault();
    const input = e.target.querySelector('input');
    showToast(`Subscribed successfully! Welcome aboard!`);
    input.value = '';
}

// ===== Wishlist =====
function toggleWishlist(btn) {
    btn.classList.toggle('active');
    const icon = btn.querySelector('i');
    icon.className = btn.classList.contains('active') ? 'fas fa-heart' : 'far fa-heart';
}

// Attach wishlist handlers
document.querySelectorAll('.wishlist-btn').forEach(btn => {
    btn.addEventListener('click', () => toggleWishlist(btn));
});

// ===== Scroll Animations =====
function handleScrollAnimations() {
    const elements = document.querySelectorAll('.category-card, .product-card, .feature-card, .testimonial-card, .blog-card');
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.style.opacity = '1';
                entry.target.style.transform = 'translateY(0)';
            }
        });
    }, { threshold: 0.1 });
    
    elements.forEach(el => {
        el.style.opacity = '0';
        el.style.transform = 'translateY(20px)';
        el.style.transition = 'all 0.5s ease';
        observer.observe(el);
    });
}

// ===== Quick View Grid Style =====
const quickViewStyle = document.createElement('style');
quickViewStyle.textContent = `
    .quick-view-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 30px; align-items: center; }
    .quick-view-image { display: flex; align-items: center; justify-content: center; background: var(--bg-light); border-radius: var(--radius); padding: 40px; }
    @media (max-width: 768px) { .quick-view-grid { grid-template-columns: 1fr; } }
`;
document.head.appendChild(quickViewStyle);

// ===== Initialize =====
document.addEventListener('DOMContentLoaded', () => {
    initSlider();
    updateCartCount();
    updateTimer();
    handleScrollAnimations();
});
