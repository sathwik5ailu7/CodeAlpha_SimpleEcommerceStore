// ===== Product Detail Page =====

document.addEventListener('DOMContentLoaded', () => {
  const productDetail = document.getElementById('productDetail');
  if (!productDetail) return;

  const urlParams = new URLSearchParams(window.location.search);
  const productId = urlParams.get('id');

  if (!productId) {
    window.location.href = '/';
    return;
  }

  let quantity = 1;

  async function loadProduct() {
    try {
      const res = await api(`/api/products/${productId}`);
      const product = res.product;
      const related = res.related;

      document.title = `${product.name} — ShopZone`;
      document.getElementById('breadcrumbCategory').textContent = product.category;
      document.getElementById('breadcrumbProduct').textContent = product.name;

      productDetail.innerHTML = `
        <div class="product-detail-image">
          <img src="${product.image}" alt="${product.name}"
               onerror="this.src='https://via.placeholder.com/600x400?text=Product+Image'">
        </div>
        <div class="product-detail-info">
          <h1>${product.name}</h1>
          <div class="product-detail-meta">
            <span class="stars">${getStarsHTML(product.rating)}</span>
            <span>${product.rating} (${product.reviews_count} reviews)</span>
            <span>|</span>
            <span>${product.category}</span>
          </div>
          <div class="product-detail-price">${formatPrice(product.price)}</div>
          <p class="product-detail-description">${product.description}</p>
          <p class="product-detail-stock">
            ${product.stock > 0
              ? `<span class="stock-in"><i class="fas fa-check-circle"></i> In Stock (${product.stock} available)</span>`
              : '<span class="stock-out"><i class="fas fa-times-circle"></i> Out of Stock</span>'
            }
          </p>
          ${product.stock > 0 ? `
            <div class="quantity-selector">
              <label>Quantity:</label>
              <div class="qty-controls">
                <button onclick="changeQty(-1)">−</button>
                <input type="number" id="qtyInput" value="1" min="1" max="${product.stock}" readonly>
                <button onclick="changeQty(1)">+</button>
              </div>
            </div>
            <div class="product-detail-actions">
              <button class="btn btn-primary btn-lg" onclick="addToCartDetail(${product.id})">
                <i class="fas fa-cart-plus"></i> Add to Cart
              </button>
              <a href="/cart.html" class="btn btn-outline btn-lg">
                <i class="fas fa-shopping-cart"></i> View Cart
              </a>
            </div>
          ` : `
            <div class="product-detail-actions">
              <button class="btn btn-primary btn-lg" disabled>
                <i class="fas fa-cart-plus"></i> Out of Stock
              </button>
            </div>
          `}
        </div>
      `;

      // Render related products
      if (related && related.length > 0) {
        const relatedSection = document.getElementById('relatedSection');
        const relatedGrid = document.getElementById('relatedGrid');
        relatedSection.style.display = 'block';
        relatedGrid.innerHTML = related.map(renderProductCard).join('');
      }

    } catch (err) {
      productDetail.innerHTML = `
        <div class="empty-state" style="grid-column: 1 / -1">
          <i class="fas fa-exclamation-triangle"></i>
          <h2>Product not found</h2>
          <p>${err.message}</p>
          <a href="/" class="btn btn-primary">Back to Shop</a>
        </div>
      `;
    }
  }

  window.changeQty = function(delta) {
    const input = document.getElementById('qtyInput');
    const newVal = parseInt(input.value) + delta;
    if (newVal >= 1 && newVal <= parseInt(input.max)) {
      input.value = newVal;
      quantity = newVal;
    }
  };

  window.addToCartDetail = async function(productId) {
    if (!getToken()) {
      showToast('Please log in to add items to cart', 'error');
      setTimeout(() => window.location.href = '/login.html', 1500);
      return;
    }

    try {
      const res = await api('/api/cart', {
        method: 'POST',
        body: JSON.stringify({ product_id: productId, quantity }),
      });
      showToast(`Added ${quantity} item(s) to cart!`, 'success');
      updateCartBadge(res.cartCount);
    } catch (err) {
      showToast(err.message || 'Failed to add to cart', 'error');
    }
  };

  loadProduct();
});
