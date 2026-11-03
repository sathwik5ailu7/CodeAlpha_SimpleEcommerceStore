// ===== Orders Page =====

document.addEventListener('DOMContentLoaded', () => {
  const ordersList = document.getElementById('ordersList');
  const loadingSpinner = document.getElementById('loadingSpinner');

  if (!ordersList) return;

  // Check if logged in
  if (!getToken()) {
    ordersList.innerHTML = `
      <div class="empty-state">
        <i class="fas fa-sign-in-alt"></i>
        <h2>Please log in to view orders</h2>
        <p>You need to be logged in to see your order history</p>
        <a href="/login.html" class="btn btn-primary">Log In</a>
      </div>
    `;
    return;
  }

  async function loadOrders() {
    try {
      const res = await api('/api/orders');

      if (res.orders.length === 0) {
        ordersList.innerHTML = `
          <div class="empty-state">
            <i class="fas fa-box-open"></i>
            <h2>No orders yet</h2>
            <p>You haven't placed any orders. Start shopping!</p>
            <a href="/" class="btn btn-primary"><i class="fas fa-arrow-left"></i> Start Shopping</a>
          </div>
        `;
        return;
      }

      ordersList.innerHTML = res.orders.map(order => `
        <div class="order-card">
          <div class="order-header">
            <div class="order-header-left">
              <h3><i class="fas fa-box"></i> ${order.order_number}</h3>
              <p>Placed on ${new Date(order.created_at).toLocaleDateString('en-US', {
                year: 'numeric', month: 'long', day: 'numeric',
                hour: '2-digit', minute: '2-digit'
              })}</p>
            </div>
            <span class="order-status status-${order.status}">${order.status}</span>
          </div>
          <div class="order-items">
            ${order.items.map(item => `
              <div class="order-item">
                <div class="order-item-image">
                  <img src="${item.image}" alt="${item.name}"
                       onerror="this.src='https://via.placeholder.com/60x60?text=Product'">
                </div>
                <div class="order-item-details">
                  <h4>${item.name}</h4>
                  <p>${formatPrice(item.price)} × ${item.quantity}</p>
                </div>
                <div style="font-weight:700; color:var(--primary)">
                  ${formatPrice(item.price * item.quantity)}
                </div>
              </div>
            `).join('')}
          </div>
          <div class="order-total">
            Total: ${formatPrice(order.total_amount)}
          </div>
        </div>
      `).join('');

    } catch (err) {
      ordersList.innerHTML = `
        <div class="empty-state">
          <i class="fas fa-exclamation-triangle"></i>
          <h2>Failed to load orders</h2>
          <p>${err.message}</p>
        </div>
      `;
    } finally {
      if (loadingSpinner) loadingSpinner.classList.add('hidden');
    }
  }

  loadOrders();
});
