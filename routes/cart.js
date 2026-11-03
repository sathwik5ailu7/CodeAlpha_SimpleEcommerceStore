const express = require('express');
const { getDB } = require('../db/setup');
const { authenticateToken } = require('../middleware/auth');

const router = express.Router();

// All cart routes require authentication
router.use(authenticateToken);

// GET /api/cart - Get user's cart
router.get('/', (req, res) => {
  try {
    const db = getDB();
    const items = db.prepare(`
      SELECT ci.id, ci.quantity, p.id as product_id, p.name, p.price, p.image, p.stock
      FROM cart_items ci
      JOIN products p ON ci.product_id = p.id
      WHERE ci.user_id = ?
      ORDER BY ci.created_at DESC
    `).all(req.user.id);

    const total = items.reduce((sum, item) => sum + (item.price * item.quantity), 0);

    res.json({ items, total: Math.round(total * 100) / 100, count: items.length });
  } catch (err) {
    console.error('Cart fetch error:', err);
    res.status(500).json({ error: 'Failed to fetch cart' });
  }
});

// POST /api/cart - Add item to cart
router.post('/', (req, res) => {
  try {
    const { product_id, quantity = 1 } = req.body;

    if (!product_id) {
      return res.status(400).json({ error: 'Product ID is required' });
    }

    const db = getDB();

    // Check if product exists and has stock
    const product = db.prepare('SELECT * FROM products WHERE id = ?').get(product_id);
    if (!product) {
      return res.status(404).json({ error: 'Product not found' });
    }
    if (product.stock < quantity) {
      return res.status(400).json({ error: 'Not enough stock available' });
    }

    // Check if item already in cart
    const existing = db.prepare(
      'SELECT * FROM cart_items WHERE user_id = ? AND product_id = ?'
    ).get(req.user.id, product_id);

    if (existing) {
      const newQty = existing.quantity + quantity;
      if (newQty > product.stock) {
        return res.status(400).json({ error: 'Cannot add more than available stock' });
      }
      db.prepare('UPDATE cart_items SET quantity = ? WHERE id = ?').run(newQty, existing.id);
    } else {
      db.prepare(
        'INSERT INTO cart_items (user_id, product_id, quantity) VALUES (?, ?, ?)'
      ).run(req.user.id, product_id, quantity);
    }

    // Return updated cart count
    const { count } = db.prepare(
      'SELECT SUM(quantity) as count FROM cart_items WHERE user_id = ?'
    ).get(req.user.id);

    res.status(201).json({ message: 'Item added to cart', cartCount: count || 0 });
  } catch (err) {
    console.error('Cart add error:', err);
    res.status(500).json({ error: 'Failed to add item to cart' });
  }
});

// PUT /api/cart/:id - Update cart item quantity
router.put('/:id', (req, res) => {
  try {
    const { quantity } = req.body;
    const db = getDB();

    const item = db.prepare(
      'SELECT ci.*, p.stock FROM cart_items ci JOIN products p ON ci.product_id = p.id WHERE ci.id = ? AND ci.user_id = ?'
    ).get(req.params.id, req.user.id);

    if (!item) {
      return res.status(404).json({ error: 'Cart item not found' });
    }

    if (quantity > item.stock) {
      return res.status(400).json({ error: 'Not enough stock available' });
    }

    if (quantity <= 0) {
      db.prepare('DELETE FROM cart_items WHERE id = ?').run(req.params.id);
    } else {
      db.prepare('UPDATE cart_items SET quantity = ? WHERE id = ?').run(quantity, req.params.id);
    }

    res.json({ message: 'Cart updated' });
  } catch (err) {
    console.error('Cart update error:', err);
    res.status(500).json({ error: 'Failed to update cart' });
  }
});

// DELETE /api/cart/:id - Remove item from cart
router.delete('/:id', (req, res) => {
  try {
    const db = getDB();
    const result = db.prepare(
      'DELETE FROM cart_items WHERE id = ? AND user_id = ?'
    ).run(req.params.id, req.user.id);

    if (result.changes === 0) {
      return res.status(404).json({ error: 'Cart item not found' });
    }

    res.json({ message: 'Item removed from cart' });
  } catch (err) {
    console.error('Cart delete error:', err);
    res.status(500).json({ error: 'Failed to remove item from cart' });
  }
});

// DELETE /api/cart - Clear entire cart
router.delete('/', (req, res) => {
  try {
    const db = getDB();
    db.prepare('DELETE FROM cart_items WHERE user_id = ?').run(req.user.id);
    res.json({ message: 'Cart cleared' });
  } catch (err) {
    console.error('Cart clear error:', err);
    res.status(500).json({ error: 'Failed to clear cart' });
  }
});

module.exports = router;
