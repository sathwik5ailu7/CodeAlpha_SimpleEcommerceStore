const express = require('express');
const { getDB } = require('../db/setup');

const router = express.Router();

// GET /api/products - Get all products with optional filtering
router.get('/', (req, res) => {
  try {
    const db = getDB();
    const { category, search, sort, page = 1, limit = 12 } = req.query;
    const offset = (page - 1) * limit;

    let query = 'SELECT * FROM products WHERE 1=1';
    let countQuery = 'SELECT COUNT(*) as total FROM products WHERE 1=1';
    const params = [];
    const countParams = [];

    if (category && category !== 'all') {
      query += ' AND category = ?';
      countQuery += ' AND category = ?';
      params.push(category);
      countParams.push(category);
    }

    if (search) {
      query += ' AND (name LIKE ? OR description LIKE ?)';
      countQuery += ' AND (name LIKE ? OR description LIKE ?)';
      params.push(`%${search}%`, `%${search}%`);
      countParams.push(`%${search}%`, `%${search}%`);
    }

    // Sorting
    switch (sort) {
      case 'price_asc':
        query += ' ORDER BY price ASC';
        break;
      case 'price_desc':
        query += ' ORDER BY price DESC';
        break;
      case 'rating':
        query += ' ORDER BY rating DESC';
        break;
      case 'newest':
        query += ' ORDER BY created_at DESC';
        break;
      default:
        query += ' ORDER BY id ASC';
    }

    query += ' LIMIT ? OFFSET ?';
    params.push(Number(limit), Number(offset));

    const products = db.prepare(query).all(...params);
    const { total } = db.prepare(countQuery).get(...countParams);

    res.json({
      products,
      pagination: {
        page: Number(page),
        limit: Number(limit),
        total,
        pages: Math.ceil(total / limit)
      }
    });
  } catch (err) {
    console.error('Products fetch error:', err);
    res.status(500).json({ error: 'Failed to fetch products' });
  }
});

// GET /api/products/categories
router.get('/categories', (req, res) => {
  try {
    const db = getDB();
    const categories = db.prepare('SELECT DISTINCT category FROM products ORDER BY category').all();
    res.json({ categories: categories.map(c => c.category) });
  } catch (err) {
    console.error('Categories fetch error:', err);
    res.status(500).json({ error: 'Failed to fetch categories' });
  }
});

// GET /api/products/:id - Get single product
router.get('/:id', (req, res) => {
  try {
    const db = getDB();
    const product = db.prepare('SELECT * FROM products WHERE id = ?').get(req.params.id);

    if (!product) {
      return res.status(404).json({ error: 'Product not found' });
    }

    // Get related products from the same category
    const related = db.prepare(
      'SELECT * FROM products WHERE category = ? AND id != ? LIMIT 4'
    ).all(product.category, product.id);

    res.json({ product, related });
  } catch (err) {
    console.error('Product fetch error:', err);
    res.status(500).json({ error: 'Failed to fetch product' });
  }
});

module.exports = router;
