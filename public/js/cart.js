// ===== Cart Page =====

document.addEventListener('DOMContentLoaded', () => {
  const cartContent = document.getElementById('cartContent');
  const cartLoginPrompt = document.getElementById('cartLoginPrompt');
  const cartItems = document.getElementById('cartItems');
  const cartSummary = document.getElementById('cartSummary');
  const loadingSpinner = document.getElementById('loadingSpinner');

  if (!cartContent) return;

  // Check if logged in
  if (!getToken()) {
    cartLoginPrompt.style.display = 'block';
    return;
  }

  cartContent.style.display = 'grid';

  async function loadCart() {
    try {
      const res = await api('/api/cart');

      if (res.items.length === 0) {
        cartItems.innerHTML = `
          <div class="empty-state">
            <i class="fas fa-shopping-cart"></i>
            <h2>Your cart is empty</h2>
            <p>Start shopping to add items to your cart</p>
            <a href="/" class="btn btn-primary"><i class="fas fa-arrow-left"></i> Continue Shopping</a>
          </div>
        `;
        cartSummary.style.display = 'none';
        return;
      }

      cartItems.innerHTML = res.items.map(item => `
        <div class="cart-item" id="cartItem-${item.id}">
          <a href="/product.html?id=${item.product_id}" class="cart-item-image">
            <img src="${item.image}" alt="${item.name}"
                 onerror="this.src='https://via.placeholder.com/120x120?text=Product'">
          </a>
          <div class="cart-item-info">
            <a href="/product.html?id=${item.product_id}"><h3>${item.name}</h3></a>
            <div class="cart-item-price">${formatPrice(item.price)}</div>
            <div class="cart-item-actions">
              <div class="qty-controls">
                <button onclick="updateCartItem(${item.id}, ${item.quantity - 1})">−</button>
                <input type="number" value="${item.quantity}" readonly>
                <button onclick="updateCartItem(${item.id}, ${item.quantity + 1})">+</button>
              </div>
              <span style="font-weight:600; color:var(--gray-600)">
                = ${formatPrice(item.price * item.quantity)}
              </span>
              <button class="cart-item-remove" onclick="removeCartItem(${item.id})">
                <i class="fas fa-trash"></i> Remove
              </button>
            </div>
          </div>
        </div>
      `).join('');

      // Update summary
      const subtotal = res.total;
      const tax = subtotal * 0.08;
      const total = subtotal + tax;

      document.getElementById('subtotal').textContent = formatPrice(subtotal);
      document.getElementById('tax').textContent = formatPrice(tax);
      document.getElementById('totalAmount').textContent = formatPrice(total);
      document.getElementById('checkoutTotal').textContent = formatPrice(total);
      cartSummary.style.display = 'block';

      // Update badge
      const totalItems = res.items.reduce((sum, item) => sum + item.quantity, 0);
      updateCartBadge(totalItems);

    } catch (err) {
      cartItems.innerHTML = `
        <div class="empty-state">
          <i class="fas fa-exclamation-triangle"></i>
          <h2>Failed to load cart</h2>
          <p>${err.message}</p>
        </div>
      `;
    } finally {
      if (loadingSpinner) loadingSpinner.classList.add('hidden');
    }
  }

  window.updateCartItem = async function(itemId, newQuantity) {
    try {
      if (newQuantity <= 0) {
        await removeCartItem(itemId);
        return;
      }
      await api(`/api/cart/${itemId}`, {
        method: 'PUT',
        body: JSON.stringify({ quantity: newQuantity }),
      });
      loadCart();
    } catch (err) {
      showToast(err.message || 'Failed to update cart', 'error');
    }
  };

  window.removeCartItem = async function(itemId) {
    try {
      await api(`/api/cart/${itemId}`, { method: 'DELETE' });
      showToast('Item removed from cart', 'info');
      loadCart();
    } catch (err) {
      showToast(err.message || 'Failed to remove item', 'error');
    }
  };

  // Checkout Modal
  const checkoutBtn = document.getElementById('checkoutBtn');
  const checkoutModal = document.getElementById('checkoutModal');
  const closeModal = document.getElementById('closeModal');
  const checkoutForm = document.getElementById('checkoutForm');

  if (checkoutBtn) {
    checkoutBtn.addEventListener('click', () => {
      checkoutModal.style.display = 'flex';
    });
  }

  if (closeModal) {
    closeModal.addEventListener('click', () => {
      checkoutModal.style.display = 'none';
    });
  }

  if (checkoutModal) {
    checkoutModal.addEventListener('click', (e) => {
      if (e.target === checkoutModal) checkoutModal.style.display = 'none';
    });
  }

  if (checkoutForm) {
    checkoutForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      const btn = document.getElementById('placeOrderBtn');
      btn.disabled = true;
      btn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Placing Order...';

      try {
        const payment = document.querySelector('input[name="payment"]:checked').value;
        const res = await api('/api/orders', {
          method: 'POST',
          body: JSON.stringify({
            shipping_address: document.getElementById('shippingAddress').value,
            payment_method: payment,
          }),
        });

        checkoutModal.style.display = 'none';
        showToast(`Order ${res.order.order_number} placed successfully!`, 'success');

        // Show success state
        cartItems.innerHTML = `
          <div class="empty-state">
            <i class="fas fa-check-circle" style="color:var(--success)"></i>
            <h2>Order Placed Successfully!</h2>
            <p>Order Number: <strong>${res.order.order_number}</strong></p>
            <p>Total: <strong>${formatPrice(res.order.total_amount)}</strong></p>
            <a href="/orders.html" class="btn btn-primary"><i class="fas fa-box"></i> View My Orders</a>
          </div>
        `;
        cartSummary.style.display = 'none';
        updateCartBadge(0);

      } catch (err) {
        showToast(err.message || 'Failed to place order', 'error');
        btn.disabled = false;
        btn.innerHTML = '<i class="fas fa-check-circle"></i> Place Order';
      }
    });
  }

  loadCart();
});
