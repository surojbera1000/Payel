/* Admin Panel JavaScript - MongoDB Connected */
const API_URL = '/api/products';
let products = [];

// Load products from MongoDB
async function loadProducts() {
    try {
        const res = await fetch(API_URL);
        const data = await res.json();
        if (data.success) products = data.products;
    } catch (err) {
        console.log('API offline, using localStorage');
        products = JSON.parse(localStorage.getItem('payel_admin_products')) || [];
    }
    return products;
}

// Login
function handleLogin(e) {
    e.preventDefault();
    const u = document.getElementById('loginUser').value;
    const p = document.getElementById('loginPass').value;
    if (u === 'admin' && p === 'admin123') {
        document.getElementById('loginScreen').style.display = 'none';
        document.getElementById('adminApp').style.display = 'grid';
        localStorage.setItem('payel_admin_auth', '1');
        loadProducts().then(() => { refreshDashboard(); renderTable(); });
        toast('Welcome back, Admin!');
    } else { toast('Invalid credentials!'); }
}
function handleLogout() {
    localStorage.removeItem('payel_admin_auth');
    document.getElementById('adminApp').style.display = 'none';
    document.getElementById('loginScreen').style.display = 'flex';
}
if (localStorage.getItem('payel_admin_auth') === '1') {
    document.getElementById('loginScreen').style.display = 'none';
    document.getElementById('adminApp').style.display = 'grid';
}

// Navigation
function showPanel(name) {
    document.querySelectorAll('.panel').forEach(p => p.classList.remove('active'));
    document.getElementById('panel-' + name).classList.add('active');
    document.querySelectorAll('.sidebar-nav .nav-btn').forEach(b => b.classList.remove('active'));
    const map = { dashboard:0, products:1, add:2, orders:3, settings:4 };
    document.querySelectorAll('.sidebar-nav .nav-btn')[map[name]]?.classList.add('active');
    const titles = { dashboard:'Dashboard', products:'Products', add:'Add Product', orders:'Orders', settings:'Settings' };
    document.getElementById('panelTitle').textContent = titles[name] || 'Dashboard';
    if (name === 'dashboard') refreshDashboard();
    if (name === 'products') renderTable();
    document.getElementById('sidebar').classList.remove('open');
}

// Dashboard
function refreshDashboard() {
    document.getElementById('statTotal').textContent = products.length;
    document.getElementById('statInStock').textContent = products.filter(p => p.stock > 10).length;
    document.getElementById('statLow').textContent = products.filter(p => p.stock > 0 && p.stock <= 10).length;
    document.getElementById('statOut').textContent = products.filter(p => p.stock === 0).length;
    const list = document.getElementById('recentList');
    if (products.length === 0) { list.innerHTML = '<p class="muted">No products yet. <a href="#" onclick="showPanel(\'add\')" style="color:var(--primary);">Add one</a></p>'; return; }
    list.innerHTML = products.slice(0, 5).map(p => `
        <div class="recent-row">
            <div class="thumb">${p.photo ? `<img src="${p.photo}">` : getEmoji(p.category)}</div>
            <div class="info"><strong>${p.name}</strong><small>${p.category} · ${p.weight}</small></div>
            <span class="price">₹${p.price}</span>
        </div>
    `).join('');
}

// Table
function renderTable() {
    const q = document.getElementById('prodSearch')?.value.toLowerCase() || '';
    let filtered = products;
    if (q) filtered = filtered.filter(p => p.name.toLowerCase().includes(q) || p.category.toLowerCase().includes(q));
    const tbody = document.getElementById('prodTableBody');
    const empty = document.getElementById('tableEmpty');
    if (filtered.length === 0) { tbody.innerHTML = ''; empty.style.display = 'block'; document.querySelector('.data-table').style.display = 'none'; return; }
    empty.style.display = 'none';
    document.querySelector('.data-table').style.display = 'table';
    tbody.innerHTML = filtered.map(p => {
        const status = p.stock === 0 ? 'out' : p.stock <= 10 ? 'low' : 'ok';
        const label = p.stock === 0 ? 'Out' : p.stock <= 10 ? 'Low' : 'In Stock';
        const id = p._id || p.id;
        return `<tr>
            <td><div class="thumb">${p.photo ? `<img src="${p.photo}">` : getEmoji(p.category)}</div></td>
            <td><strong>${p.name}</strong></td>
            <td>${p.category}</td>
            <td>₹${p.price}</td>
            <td><span class="stock-badge ${status}">${label} (${p.stock})</span></td>
            <td><button class="action-btn" onclick="editProduct('${id}')" title="Edit"><i class="fas fa-edit"></i></button><button class="action-btn del" onclick="deleteProduct('${id}')" title="Delete"><i class="fas fa-trash"></i></button></td>
        </tr>`;
    }).join('');
}

// Save Product to MongoDB
async function saveProduct(e) {
    e.preventDefault();
    const editId = document.getElementById('editId').value;
    const product = {
        name: document.getElementById('fName').value.trim(),
        category: document.getElementById('fCategory').value,
        price: parseFloat(document.getElementById('fPrice').value),
        mrp: parseFloat(document.getElementById('fMrp').value) || 0,
        weight: document.getElementById('fWeight').value.trim(),
        stock: parseInt(document.getElementById('fStock').value),
        desc: document.getElementById('fDesc').value.trim(),
        ingredients: document.getElementById('fIngredients').value.trim(),
        shelfLife: document.getElementById('fShelfLife').value.trim(),
        fssai: document.getElementById('fFssai').value.trim(),
        photo: document.getElementById('photoPreview').src || '',
    };

    try {
        let res;
        if (editId) {
            product.id = editId;
            res = await fetch(API_URL, { method: 'PUT', headers: {'Content-Type':'application/json'}, body: JSON.stringify(product) });
        } else {
            res = await fetch(API_URL, { method: 'POST', headers: {'Content-Type':'application/json'}, body: JSON.stringify(product) });
        }
        const data = await res.json();
        if (data.success) {
            toast(editId ? 'Product updated!' : 'Product added!');
            await loadProducts();
            resetForm();
            showPanel('products');
        } else {
            toast('Error: ' + data.message);
        }
    } catch (err) {
        // Fallback to localStorage
        if (editId) {
            const idx = products.findIndex(p => (p._id || p.id) === editId);
            if (idx > -1) products[idx] = {...products[idx], ...product};
        } else {
            product.id = Date.now();
            products.unshift(product);
        }
        localStorage.setItem('payel_admin_products', JSON.stringify(products));
        toast(editId ? 'Product updated (local)!' : 'Product added (local)!');
        resetForm();
        showPanel('products');
    }
}

// Edit
function editProduct(id) {
    const p = products.find(pr => (pr._id || pr.id) == id);
    if (!p) return;
    document.getElementById('editId').value = p._id || p.id;
    document.getElementById('fName').value = p.name;
    document.getElementById('fCategory').value = p.category;
    document.getElementById('fPrice').value = p.price;
    document.getElementById('fMrp').value = p.mrp || '';
    document.getElementById('fWeight').value = p.weight;
    document.getElementById('fStock').value = p.stock;
    document.getElementById('fDesc').value = p.desc;
    document.getElementById('fIngredients').value = p.ingredients || '';
    document.getElementById('fShelfLife').value = p.shelfLife || '';
    document.getElementById('fFssai').value = p.fssai || '';
    if (p.photo) { document.getElementById('photoPreview').src = p.photo; document.getElementById('photoPreview').style.display = 'block'; document.getElementById('photoPlaceholder').style.display = 'none'; }
    document.getElementById('formTitle').innerHTML = '<i class="fas fa-edit"></i> Edit Product';
    document.getElementById('saveBtn').innerHTML = '<i class="fas fa-save"></i> Update';
    showPanel('add');
}

// Delete from MongoDB
async function deleteProduct(id) {
    if (!confirm('Delete this product?')) return;
    try {
        const res = await fetch(`${API_URL}?id=${id}`, { method: 'DELETE' });
        const data = await res.json();
        if (data.success) {
            toast('Product deleted');
            await loadProducts();
            renderTable();
            refreshDashboard();
        }
    } catch (err) {
        products = products.filter(p => (p._id || p.id) != id);
        localStorage.setItem('payel_admin_products', JSON.stringify(products));
        renderTable();
        refreshDashboard();
        toast('Product deleted (local)');
    }
}

// Reset Form
function resetForm() {
    document.getElementById('productForm').reset();
    document.getElementById('editId').value = '';
    document.getElementById('photoPreview').style.display = 'none';
    document.getElementById('photoPreview').src = '';
    document.getElementById('photoPlaceholder').style.display = 'flex';
    document.getElementById('formTitle').innerHTML = '<i class="fas fa-plus-circle"></i> Add New Product';
    document.getElementById('saveBtn').innerHTML = '<i class="fas fa-save"></i> Save Product';
}

// Photo Upload
function previewPhoto(e) {
    const file = e.target.files[0];
    if (!file) return;
    if (file.size > 5 * 1024 * 1024) { toast('Max 5MB allowed'); return; }
    const reader = new FileReader();
    reader.onload = (ev) => {
        document.getElementById('photoPreview').src = ev.target.result;
        document.getElementById('photoPreview').style.display = 'block';
        document.getElementById('photoPlaceholder').style.display = 'none';
    };
    reader.readAsDataURL(file);
}

// Helpers
function getEmoji(cat) {
    const m = { Chanachur:'🥨', Bhujia:'🍿', Mixture:'🥜', Namkeen:'🍘', Peanut:'🥜', 'Moong Dal':'🫘', Chips:'🍟', Papad:'🫓', Sweets:'🍬', Pickles:'🥒' };
    return m[cat] || '📦';
}

function toast(msg) {
    const box = document.getElementById('toastBox');
    const t = document.createElement('div');
    t.className = 'admin-toast';
    t.innerHTML = `<i class="fas fa-check-circle"></i> ${msg}`;
    box.appendChild(t);
    setTimeout(() => { t.style.opacity = '0'; setTimeout(() => t.remove(), 200); }, 3000);
}

// Init
document.addEventListener('DOMContentLoaded', () => {
    if (localStorage.getItem('payel_admin_auth') === '1') {
        loadProducts().then(() => { refreshDashboard(); renderTable(); });
    }
});
