/* ========================================
   Payel Food Products - Admin Panel JS
   ======================================== */

// ===== Data Store =====
let adminProducts = JSON.parse(localStorage.getItem('payel_admin_products')) || [];
let deleteTargetId = null;

// ===== Login =====
function handleLogin(e) {
    e.preventDefault();
    const username = document.getElementById('loginUsername').value;
    const password = document.getElementById('loginPassword').value;
    
    if (username === 'admin' && password === 'admin123') {
        document.getElementById('loginScreen').style.display = 'none';
        document.getElementById('adminWrapper').style.display = 'flex';
        localStorage.setItem('payel_admin_logged', 'true');
        refreshDashboard();
        showToast('Welcome back, Admin!', 'success');
    } else {
        showToast('Invalid credentials! Try admin / admin123', 'error');
    }
}

function handleLogout() {
    localStorage.removeItem('payel_admin_logged');
    document.getElementById('adminWrapper').style.display = 'none';
    document.getElementById('loginScreen').style.display = 'flex';
    document.getElementById('loginUsername').value = '';
    document.getElementById('loginPassword').value = '';
}

// Check if already logged in
if (localStorage.getItem('payel_admin_logged') === 'true') {
    document.getElementById('loginScreen').style.display = 'none';
    document.getElementById('adminWrapper').style.display = 'flex';
}


// ===== Navigation =====
function showSection(section) {
    // Hide all sections
    document.querySelectorAll('.content-section').forEach(s => s.classList.remove('active'));
    // Show target section
    const target = document.getElementById(`section-${section}`);
    if (target) target.classList.add('active');
    
    // Update nav active state
    document.querySelectorAll('.nav-item').forEach(item => item.classList.remove('active'));
    const navItems = document.querySelectorAll('.nav-item');
    const sectionMap = { 'dashboard': 0, 'products': 1, 'add-product': 2, 'orders': 3, 'categories': 4, 'customers': 5, 'settings': 6 };
    if (navItems[sectionMap[section]]) navItems[sectionMap[section]].classList.add('active');
    
    // Update page title
    const titles = { 'dashboard': 'Dashboard', 'products': 'Products', 'add-product': 'Add Product', 'orders': 'Orders', 'categories': 'Categories', 'customers': 'Customers', 'settings': 'Settings' };
    document.getElementById('pageTitle').textContent = titles[section] || 'Dashboard';
    
    // Refresh data
    if (section === 'dashboard') refreshDashboard();
    if (section === 'products') renderProducts();
    if (section === 'categories') updateCategoryCounts();
    
    // Close mobile sidebar
    document.getElementById('sidebar').classList.remove('active');
}

function toggleSidebar() {
    document.getElementById('sidebar').classList.toggle('active');
}


// ===== Product CRUD =====
function handleProductSubmit(e) {
    e.preventDefault();
    
    const editId = document.getElementById('editProductId').value;
    const product = {
        id: editId ? parseInt(editId) : Date.now(),
        name: document.getElementById('prodName').value.trim(),
        category: document.getElementById('prodCategory').value,
        price: parseFloat(document.getElementById('prodPrice').value),
        originalPrice: parseFloat(document.getElementById('prodOriginalPrice').value) || 0,
        weight: document.getElementById('prodWeight').value.trim(),
        stock: parseInt(document.getElementById('prodStock').value),
        sku: document.getElementById('prodSku').value.trim(),
        photo: document.getElementById('photoPreview').src || '',
        description: document.getElementById('prodDescription').value.trim(),
        ingredients: document.getElementById('prodIngredients').value.trim(),
        shelfLife: document.getElementById('prodShelfLife').value.trim(),
        fssai: document.getElementById('prodFssai').value.trim(),
        createdAt: editId ? getProductById(parseInt(editId))?.createdAt || new Date().toISOString() : new Date().toISOString(),
        updatedAt: new Date().toISOString()
    };
    
    if (editId) {
        // Update existing
        const index = adminProducts.findIndex(p => p.id === parseInt(editId));
        if (index !== -1) {
            adminProducts[index] = product;
            showToast(`"${product.name}" updated successfully!`, 'success');
        }
    } else {
        // Add new
        adminProducts.unshift(product);
        showToast(`"${product.name}" added successfully!`, 'success');
    }
    
    saveProducts();
    resetForm();
    showSection('products');
}

function editProduct(id) {
    const product = getProductById(id);
    if (!product) return;
    
    document.getElementById('editProductId').value = product.id;
    document.getElementById('prodName').value = product.name;
    document.getElementById('prodCategory').value = product.category;
    document.getElementById('prodPrice').value = product.price;
    document.getElementById('prodOriginalPrice').value = product.originalPrice || '';
    document.getElementById('prodWeight').value = product.weight;
    document.getElementById('prodStock').value = product.stock;
    document.getElementById('prodSku').value = product.sku || '';
    document.getElementById('prodDescription').value = product.description;
    document.getElementById('prodIngredients').value = product.ingredients || '';
    document.getElementById('prodShelfLife').value = product.shelfLife || '';
    document.getElementById('prodFssai').value = product.fssai || '';
    
    // Show photo if exists
    if (product.photo) {
        document.getElementById('photoPreview').src = product.photo;
        document.getElementById('photoPreview').style.display = 'block';
        document.getElementById('uploadPlaceholder').style.display = 'none';
    }
    
    document.getElementById('formTitle').innerHTML = '<i class="fas fa-edit"></i> Edit Product';
    document.getElementById('submitBtn').innerHTML = '<i class="fas fa-save"></i> Update Product';
    
    showSection('add-product');
}

function deleteProduct(id) {
    deleteTargetId = id;
    document.getElementById('deleteModal').classList.add('active');
    document.getElementById('confirmDeleteBtn').onclick = () => confirmDelete();
}

function confirmDelete() {
    if (deleteTargetId) {
        const product = getProductById(deleteTargetId);
        adminProducts = adminProducts.filter(p => p.id !== deleteTargetId);
        saveProducts();
        renderProducts();
        refreshDashboard();
        showToast(`"${product?.name}" deleted!`, 'info');
    }
    closeDeleteModal();
}

function closeDeleteModal() {
    document.getElementById('deleteModal').classList.remove('active');
    deleteTargetId = null;
}

function resetForm() {
    document.getElementById('productForm').reset();
    document.getElementById('editProductId').value = '';
    document.getElementById('photoPreview').style.display = 'none';
    document.getElementById('photoPreview').src = '';
    document.getElementById('uploadPlaceholder').style.display = 'flex';
    document.getElementById('formTitle').innerHTML = '<i class="fas fa-plus-circle"></i> Add New Product';
    document.getElementById('submitBtn').innerHTML = '<i class="fas fa-save"></i> Save Product';
}


// ===== Photo Upload =====
function handlePhotoUpload(e) {
    const file = e.target.files[0];
    if (!file) return;
    
    if (file.size > 5 * 1024 * 1024) {
        showToast('File too large! Maximum 5MB allowed.', 'error');
        return;
    }
    
    const reader = new FileReader();
    reader.onload = (event) => {
        const img = document.getElementById('photoPreview');
        img.src = event.target.result;
        img.style.display = 'block';
        document.getElementById('uploadPlaceholder').style.display = 'none';
    };
    reader.readAsDataURL(file);
}

// ===== Render Products Table =====
function renderProducts() {
    const tbody = document.getElementById('productsTableBody');
    const tableEmpty = document.getElementById('tableEmpty');
    const searchQuery = document.getElementById('productSearch')?.value.toLowerCase().trim() || '';
    const categoryFilter = document.getElementById('filterCategory')?.value || '';
    const stockFilter = document.getElementById('filterStock')?.value || '';
    
    let filtered = [...adminProducts];
    
    // Search
    if (searchQuery) {
        filtered = filtered.filter(p =>
            p.name.toLowerCase().includes(searchQuery) ||
            p.category.toLowerCase().includes(searchQuery) ||
            (p.sku && p.sku.toLowerCase().includes(searchQuery))
        );
    }
    
    // Category filter
    if (categoryFilter) {
        filtered = filtered.filter(p => p.category === categoryFilter);
    }
    
    // Stock filter
    if (stockFilter === 'instock') filtered = filtered.filter(p => p.stock > 10);
    if (stockFilter === 'outofstock') filtered = filtered.filter(p => p.stock === 0);
    if (stockFilter === 'lowstock') filtered = filtered.filter(p => p.stock > 0 && p.stock <= 10);
    
    // Update count text
    document.getElementById('productCountText').textContent = `${filtered.length} product${filtered.length !== 1 ? 's' : ''}`;
    
    if (filtered.length === 0) {
        tbody.innerHTML = '';
        tableEmpty.style.display = 'block';
        document.querySelector('.data-table').style.display = 'none';
        return;
    }
    
    tableEmpty.style.display = 'none';
    document.querySelector('.data-table').style.display = 'table';
    
    tbody.innerHTML = filtered.map(p => {
        const stockStatus = p.stock === 0 ? 'out-of-stock' : p.stock <= 10 ? 'low-stock' : 'in-stock';
        const stockLabel = p.stock === 0 ? 'Out of Stock' : p.stock <= 10 ? 'Low Stock' : 'In Stock';
        const thumb = p.photo 
            ? `<img src="${p.photo}" alt="${p.name}">`
            : `<span class="emoji-thumb">${getCategoryEmoji(p.category)}</span>`;
        
        return `
            <tr>
                <td><input type="checkbox" class="product-checkbox" value="${p.id}"></td>
                <td><div class="product-thumb">${thumb}</div></td>
                <td><div class="product-name-cell">${p.name}<small>SKU: ${p.sku || 'N/A'}</small></div></td>
                <td>${p.category}</td>
                <td><strong>₹${p.price}</strong>${p.originalPrice ? `<br><small style="text-decoration:line-through;color:var(--text-muted);">₹${p.originalPrice}</small>` : ''}</td>
                <td>${p.weight}</td>
                <td>${p.stock}</td>
                <td><span class="status-badge ${stockStatus}"><i class="fas fa-circle" style="font-size:0.5rem;"></i> ${stockLabel}</span></td>
                <td>
                    <div class="action-btns">
                        <button class="action-btn" title="Edit" onclick="editProduct(${p.id})"><i class="fas fa-edit"></i></button>
                        <button class="action-btn delete" title="Delete" onclick="deleteProduct(${p.id})"><i class="fas fa-trash"></i></button>
                    </div>
                </td>
            </tr>
        `;
    }).join('');
    
    // Handle select all checkbox state
    document.getElementById('selectAll').checked = false;
    updateBulkActions();
}


// ===== Bulk Actions =====
function toggleSelectAll() {
    const checked = document.getElementById('selectAll').checked;
    document.querySelectorAll('.product-checkbox').forEach(cb => cb.checked = checked);
    updateBulkActions();
}

function updateBulkActions() {
    const checkedCount = document.querySelectorAll('.product-checkbox:checked').length;
    const bulkActions = document.getElementById('bulkActions');
    if (checkedCount > 0) {
        bulkActions.style.display = 'flex';
        bulkActions.querySelector('button').innerHTML = `<i class="fas fa-trash"></i> Delete Selected (${checkedCount})`;
    } else {
        bulkActions.style.display = 'none';
    }
}

function bulkDelete() {
    const ids = [...document.querySelectorAll('.product-checkbox:checked')].map(cb => parseInt(cb.value));
    if (ids.length === 0) return;
    
    if (confirm(`Delete ${ids.length} selected product(s)?`)) {
        adminProducts = adminProducts.filter(p => !ids.includes(p.id));
        saveProducts();
        renderProducts();
        refreshDashboard();
        showToast(`${ids.length} product(s) deleted!`, 'info');
    }
}

// Event delegation for checkbox changes
document.addEventListener('change', (e) => {
    if (e.target.classList.contains('product-checkbox')) {
        updateBulkActions();
    }
});

// ===== Dashboard =====
function refreshDashboard() {
    const total = adminProducts.length;
    const inStock = adminProducts.filter(p => p.stock > 10).length;
    const outStock = adminProducts.filter(p => p.stock === 0).length;
    const lowStock = adminProducts.filter(p => p.stock > 0 && p.stock <= 10).length;
    
    document.getElementById('statProducts').textContent = total;
    document.getElementById('inStockCount').textContent = inStock;
    document.getElementById('outStockCount').textContent = outStock;
    document.getElementById('lowStockCount').textContent = lowStock;
    
    // Recent products
    const recentContainer = document.getElementById('recentProducts');
    if (adminProducts.length === 0) {
        recentContainer.innerHTML = '<p class="empty-text">No products added yet. <a href="#" onclick="showSection(\'add-product\')" style="color:var(--primary);">Add your first product</a></p>';
    } else {
        const recent = adminProducts.slice(0, 5);
        recentContainer.innerHTML = recent.map(p => {
            const thumb = p.photo 
                ? `<img src="${p.photo}" alt="${p.name}">`
                : getCategoryEmoji(p.category);
            return `
                <div class="recent-item">
                    <div class="recent-item-thumb">${thumb}</div>
                    <div class="recent-item-info">
                        <strong>${p.name}</strong>
                        <small>${p.category} · ${p.weight}</small>
                    </div>
                    <span class="recent-item-price">₹${p.price}</span>
                </div>
            `;
        }).join('');
    }
}

// ===== Category Counts =====
function updateCategoryCounts() {
    const categories = ['Chanachur', 'Bhujia', 'Mixture', 'Namkeen', 'Peanut', 'Moong Dal', 'Chips', 'Papad'];
    categories.forEach(cat => {
        const count = adminProducts.filter(p => p.category === cat).length;
        const el = document.getElementById(`cat${cat}`);
        if (el) el.textContent = `${count} product${count !== 1 ? 's' : ''}`;
    });
}


// ===== Utilities =====
function saveProducts() {
    localStorage.setItem('payel_admin_products', JSON.stringify(adminProducts));
    // Also sync to main site's cart-compatible format
    syncToStorefront();
}

function getProductById(id) {
    return adminProducts.find(p => p.id === id);
}

function getCategoryEmoji(category) {
    const emojis = {
        'Chanachur': '🥨', 'Bhujia': '🍿', 'Mixture': '🥜',
        'Namkeen': '🍘', 'Peanut': '🥜', 'Moong Dal': '🫘',
        'Chips': '🍟', 'Papad': '🫓', 'Sweets': '🍬', 'Pickles': '🥒'
    };
    return emojis[category] || '📦';
}

function syncToStorefront() {
    // Convert admin products to storefront format
    const storefrontProducts = adminProducts.map(p => ({
        id: p.id,
        name: p.name,
        category: p.category,
        price: p.price,
        originalPrice: p.originalPrice || p.price,
        weight: p.weight,
        rating: 4,
        reviews: Math.floor(Math.random() * 100) + 10,
        image: getCategoryEmoji(p.category),
        photo: p.photo || '',
        badge: p.stock === 0 ? '' : (p.originalPrice && p.originalPrice > p.price) ? 'sale' : 'new',
        badgeText: p.stock === 0 ? '' : (p.originalPrice && p.originalPrice > p.price) ? `${Math.round((1 - p.price / p.originalPrice) * 100)}% OFF` : 'NEW',
        stock: p.stock > 0
    }));
    localStorage.setItem('payel_storefront_products', JSON.stringify(storefrontProducts));
}

// ===== Global Search =====
function handleGlobalSearch(query) {
    if (query.trim().length > 0) {
        showSection('products');
        document.getElementById('productSearch').value = query;
        renderProducts();
    }
}

// ===== Toast Notifications =====
function showToast(message, type = 'success') {
    const container = document.getElementById('toastContainer');
    const toast = document.createElement('div');
    toast.className = `toast ${type}`;
    
    const icons = { success: 'check-circle', error: 'exclamation-circle', info: 'info-circle' };
    toast.innerHTML = `<i class="fas fa-${icons[type] || 'check-circle'}"></i> ${message}`;
    
    container.appendChild(toast);
    
    setTimeout(() => {
        toast.style.opacity = '0';
        toast.style.transform = 'translateX(100%)';
        toast.style.transition = 'all 0.3s ease';
        setTimeout(() => toast.remove(), 300);
    }, 3500);
}

// ===== Initialize =====
document.addEventListener('DOMContentLoaded', () => {
    if (localStorage.getItem('payel_admin_logged') === 'true') {
        refreshDashboard();
        renderProducts();
    }
});
