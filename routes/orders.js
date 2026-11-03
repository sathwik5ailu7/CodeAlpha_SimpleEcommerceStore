const express = require('express');
const { v4: uuidv4 } = require('uuid');
const { getDB } = require('../db/setup');
const { authenticateToken } = require('../middleware/auth');

const router = express.Router();

router.use(authenticateToken);

// GET /api/orders - Get user's orders
router.get('/', (req, res) => {
  try {
    const db = getDB();
    const orders = db.prepare(`
      SELECT * FROM orders WHERE user_id = ? ORDER BY created_at DESC
    `).all(req.user.id);

    // Get items for each order
    const ordersWithItems = orders.map(order => {
      const items = db.prepare(`
        SELECT oi.*, p.name, p.image
        FROM order_items oi
        JOIN products p ON oi.product_id = p.id
        WHERE oi.order_id = ?
      `).all(order.id);
      return { ...order, items };
    });

    res.json({ orders: ordersWithItems });
  } catch (err) {
    console.error('Orders fetch error:', err);
    res.status(500).json({ error: 'Failed to fetch orders' });
  }
});

// GET /api/orders/:id - Get single order
router.get('/:id', (req, res) => {
  try {
    const db = getDB();
    const order = db.prepare(
      'SELECT * FROM orders WHERE id = ? AND user_id = ?'
    ).get(req.params.id, req.user.id);

    if (!order) {
      return res.status(404).json({ error: 'Order not found' });
    }

    const items = db.prepare(`
      SELECT oi.*, p.name, p.image
      FROM order_items oi
      JOIN products p ON oi.product_id = p.id
      WHERE oi.order_id = ?
    `).all(order.id);

    res.json({ order: { ...order, items } });
  } catch (err) {
    console.error('Order fetch error:', err);
    res.status(500).json({ error: 'Failed to fetch order' });
  }
});

// POST /api/orders - Place a new order
router.post('/', (req, res) => {
  try {
    const { shipping_address, payment_method = 'cod' } = req.body;

    if (!shipping_address) {
      return res.status(400).json({ error: 'Shipping address is required' });
    }

    const db = getDB();

    // Get cart items
    const cartItems = db.prepare(`
      SELECT ci.*, p.price, p.stock, p.name
      FROM cart_items ci
      JOIN products p ON ci.product_id = p.id
      WHERE ci.user_id = ?
    `).all(req.user.id);

    if (cartItems.length === 0) {
      return res.status(400).json({ error: 'Cart is empty' });
    }

    // Validate stock
    for (const item of cartItems) {
      if (item.quantity > item.stock) {
        return res.status(400).json({
          error: `Not enough stock for "${item.name}". Available: ${item.stock}`
        });
      }
    }

    // Calculate total
    const totalAmount = cartItems.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    const orderNumber = 'ORD-' + uuidv4().split('-')[0].toUpperCase();

    // Create order in a transaction
    const placeOrder = db.transaction(() => {
      // Insert order
      const orderResult = db.prepare(`
        INSERT INTO orders (user_id, order_number, total_amount, shipping_address, payment_method)
        VALUES (?, ?, ?, ?, ?)
      `).run(req.user.id, orderNumber, Math.round(totalAmount * 100) / 100, shipping_address, payment_method);

      const orderId = orderResult.lastInsertRowid;

      // Insert order items and update stock
      const insertItem = db.prepare(
        'INSERT INTO order_items (order_id, product_id, quantity, price) VALUES (?, ?, ?, ?)'
      );
      const updateStock = db.prepare(
        'UPDATE products SET stock = stock - ? WHERE id = ?'
      );

      for (const item of cartItems) {
        insertItem.run(orderId, item.product_id, item.quantity, item.price);
        updateStock.run(item.quantity, item.product_id);
      }

      // Clear cart
      db.prepare('DELETE FROM cart_items WHERE user_id = ?').run(req.user.id);

      return orderId;
    });

    const orderId = placeOrder();

    res.status(201).json({
      message: 'Order placed successfully!',
      order: {
        id: orderId,
        order_number: orderNumber,
        total_amount: Math.round(totalAmount * 100) / 100,
        status: 'pending'
      }
    });
  } catch (err) {
    console.error('Order placement error:', err);
    res.status(500).json({ error: 'Failed to place order' });
  }
});

module.exports = router;
