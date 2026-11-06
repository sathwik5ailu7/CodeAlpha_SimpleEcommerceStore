// ===== Utility Functions =====

const API_BASE = '';

// API helper
async function api(endpoint, options = {}) {
  const token = getToken();
  const headers = {
    'Content-Type': 'application/json',
    ...(token && { Authorization: `Bearer ${token}` }),
    ...options.headers,
  };

  const res = await fetch(`${API_BASE}${endpoint}`, { ...options, headers });
  const data = await res.json();

  if (!res.ok) {
    throw new Error(data.error || 'Request failed');
  }

  return data;
}

// Token management
function getToken() {
  return localStorage.getItem('token');
}

function getUser() {
  const user = localStorage.getItem('user');
  return user ? JSON.parse(user) : null;
}

function logout() {
  localStorage.removeItem('token');
  localStorage.removeItem('user');
  window.location.href = '/';
}

// Toast notification
function showToast(message, type = 'info') {
  const toast = document.getElementById('toast');
  if (!toast) return;
  toast.textContent = message;
  toast.className = `toast ${type}`;
  toast.classList.remove('hidden');

  setTimeout(() => {
    toast.classList.add('hidden');
  }, 3000);
}

// Format price
function formatPrice(price) {
  return `₹${Number(price).toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}

// Generate star rating HTML
function getStarsHTML(rating) {
  let html = '';
  const full = Math.floor(rating);
  const half = rating % 1 >= 0.5;

  for (let i = 0; i < full; i++) html += '<i class="fas fa-star"></i>';
  if (half) html += '<i class="fas fa-star-half-alt"></i>';
  const empty = 5 - full - (half ? 1 : 0);
  for (let i = 0; i < empty; i++) html += '<i class="far fa-star"></i>';

  return html;
}

// Render product card
function renderProductCard(product) {
  return `
    <div class="product-card">
      <a href="/product.html?id=${product.id}" class="product-card-image">
        <img src="${product.image}" alt="${product.name}" loading="lazy"
             onerror="this.src='https://via.placeholder.com/400x300?text=Product+Image'">
        ${product.stock < 10 && product.stock > 0 ? '<span class="product-card-badge">Few Left!</span>' : ''}
        ${product.stock === 0 ? '<span class="product-card-badge" style="background:var(--danger)">Out of Stock</span>' : ''}
      </a>
      <div class="product-card-body">
        <span class="product-card-category">${product.category}</span>
        <a href="/product.html?id=${product.id}" class="product-card-title">${product.name}</a>
        <div class="product-card-rating">
          <span class="stars">${getStarsHTML(product.rating)}</span>
          <span class="count">(${product.reviews_count})</span>
        </div>
        <div class="product-card-footer">
          <span class="product-card-price">${formatPrice(product.price)}</span>
          <button class="add-to-cart-btn" onclick="addToCart(${product.id})" ${product.stock === 0 ? 'disabled' : ''}>
            <i class="fas fa-cart-plus"></i> Add
          </button>
        </div>
      </div>
    </div>
  `;
}

// Add to cart
async function addToCart(productId) {
  if (!getToken()) {
    showToast('Please log in to add items to cart', 'error');
    setTimeout(() => window.location.href = '/login.html', 1500);
    return;
  }

  try {
    const res = await api('/api/cart', {
      method: 'POST',
      body: JSON.stringify({ product_id: productId, quantity: 1 }),
    });
    showToast('Added to cart!', 'success');
    updateCartBadge(res.cartCount);
  } catch (err) {
    showToast(err.message || 'Failed to add to cart', 'error');
  }
}

// Update cart badge
function updateCartBadge(count) {
  const badge = document.getElementById('cartBadge');
  if (badge) {
    if (count > 0) {
      badge.textContent = count;
      badge.classList.remove('hidden');
    } else {
      badge.classList.add('hidden');
    }
  }
}

// Load cart count
async function loadCartCount() {
  if (!getToken()) return;
  try {
    const res = await api('/api/cart');
    const totalItems = res.items.reduce((sum, item) => sum + item.quantity, 0);
    updateCartBadge(totalItems);
  } catch {
    // Silently fail
  }
}

// Category icons
function getCategoryIcon(category) {
  const icons = {
    'Electronics': 'fas fa-laptop',
    'Accessories': 'fas fa-glasses',
    'Footwear': 'fas fa-shoe-prints',
    'Clothing': 'fas fa-tshirt',
    'Food & Beverages': 'fas fa-coffee',
    'Sports & Fitness': 'fas fa-dumbbell',
    'Home & Office': 'fas fa-home',
  };
  return icons[category] || 'fas fa-tag';
}
