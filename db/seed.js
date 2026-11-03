const { getDB, initDB } = require('./setup');
const bcrypt = require('bcryptjs');

function seedDB() {
  initDB();
  const db = getDB();

  // Check if products already exist
  const count = db.prepare('SELECT COUNT(*) as count FROM products').get();
  if (count.count > 0) {
    console.log('Database already seeded.');
    return;
  }

  // Seed products
  const insertProduct = db.prepare(`
    INSERT INTO products (name, description, price, image, category, stock, rating, reviews_count)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?)
  `);

  const products = [
    ['Wireless Bluetooth Headphones', 'Premium noise-cancelling wireless headphones with 30-hour battery life. Features deep bass, crystal clear sound, and a comfortable over-ear design perfect for music lovers and professionals.', 79.99, 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=500', 'Electronics', 50, 4.5, 128],
    ['Smart Watch Pro', 'Advanced smartwatch with heart rate monitoring, GPS tracking, sleep analysis, and 7-day battery life. Water-resistant up to 50 meters with a stunning AMOLED display.', 199.99, 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=500', 'Electronics', 35, 4.7, 95],
    ['Laptop Backpack', 'Durable water-resistant laptop backpack with USB charging port. Fits up to 15.6" laptops with multiple compartments for organized storage. Anti-theft design with hidden zippers.', 49.99, 'https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=500', 'Accessories', 100, 4.3, 210],
    ['Running Shoes Ultra', 'Lightweight performance running shoes with responsive cushioning and breathable mesh upper. Designed for both daily training and race day performance.', 129.99, 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=500', 'Footwear', 75, 4.6, 156],
    ['Organic Coffee Beans', 'Premium single-origin organic coffee beans from Colombia. Medium roast with notes of chocolate, caramel, and citrus. Ethically sourced and freshly roasted.', 24.99, 'https://images.unsplash.com/photo-1559056199-641a0ac8b55e?w=500', 'Food & Beverages', 200, 4.8, 342],
    ['Mechanical Keyboard RGB', 'Full-size mechanical keyboard with customizable RGB backlighting. Features Cherry MX Blue switches, aluminum frame, and programmable macro keys for gaming and productivity.', 89.99, 'https://images.unsplash.com/photo-1618384887929-16ec33fab9ef?w=500', 'Electronics', 60, 4.4, 187],
    ['Yoga Mat Premium', 'Extra thick 6mm eco-friendly yoga mat with alignment lines. Non-slip surface, moisture-resistant, and comes with a carrying strap. Perfect for yoga, pilates, and floor exercises.', 34.99, 'https://images.unsplash.com/photo-1601925260368-ae2f83cf8b7f?w=500', 'Sports & Fitness', 90, 4.5, 278],
    ['Stainless Steel Water Bottle', 'Double-walled vacuum insulated water bottle that keeps drinks cold for 24 hours or hot for 12 hours. BPA-free, leak-proof lid, and available in multiple colors.', 29.99, 'https://images.unsplash.com/photo-1602143407151-7111542de6e8?w=500', 'Accessories', 150, 4.6, 445],
    ['Wireless Mouse Ergonomic', 'Ergonomic vertical wireless mouse designed to reduce wrist strain. Features adjustable DPI, silent clicks, and USB-C rechargeable battery lasting up to 3 months.', 39.99, 'https://images.unsplash.com/photo-1527864550417-7fd91fc51a46?w=500', 'Electronics', 80, 4.2, 163],
    ['Portable Bluetooth Speaker', 'Waterproof portable Bluetooth speaker with 360-degree sound. Features 20-hour battery life, built-in microphone for calls, and can be paired with a second speaker for stereo sound.', 59.99, 'https://images.unsplash.com/photo-1608043152269-423dbba4e7e1?w=500', 'Electronics', 45, 4.5, 198],
    ['Denim Jacket Classic', 'Timeless classic denim jacket with a modern slim fit. Made from premium cotton denim with button closure, chest pockets, and adjustable waist tabs. A wardrobe essential.', 69.99, 'https://images.unsplash.com/photo-1576995853123-5a10305d93c0?w=500', 'Clothing', 40, 4.3, 89],
    ['Plant-Based Protein Powder', 'Organic plant-based protein powder with 25g protein per serving. Blend of pea, rice, and hemp protein. Available in chocolate and vanilla flavors. No artificial sweeteners.', 44.99, 'https://images.unsplash.com/photo-1593095948071-474c5cc2c828?w=500', 'Food & Beverages', 120, 4.4, 156],
    ['LED Desk Lamp', 'Modern LED desk lamp with adjustable brightness and color temperature. Features wireless charging pad, USB port, and flexible gooseneck design. Eye-care technology reduces strain.', 54.99, 'https://images.unsplash.com/photo-1507473885765-e6ed057ab6fe?w=500', 'Home & Office', 65, 4.6, 234],
    ['Canvas Sneakers', 'Classic canvas sneakers with vulcanized rubber sole. Lightweight, breathable, and versatile for any casual outfit. Available in multiple colors and sizes.', 44.99, 'https://images.unsplash.com/photo-1525966222134-fcfa99b8ae77?w=500', 'Footwear', 110, 4.4, 312],
    ['Aromatherapy Diffuser', 'Ultrasonic essential oil diffuser with 7 LED color options and auto shut-off. 300ml capacity runs up to 10 hours. Creates a relaxing atmosphere with cool mist technology.', 32.99, 'https://images.unsplash.com/photo-1602928321679-560bb453f190?w=500', 'Home & Office', 70, 4.7, 267],
    ['Sunglasses Polarized', 'Premium polarized sunglasses with UV400 protection. Lightweight titanium frame with anti-scratch lenses. Includes hard case and cleaning cloth. Stylish and functional.', 59.99, 'https://images.unsplash.com/photo-1572635196237-14b3f281503f?w=500', 'Accessories', 55, 4.5, 178]
  ];

  const insertMany = db.transaction((items) => {
    for (const item of items) {
      insertProduct.run(...item);
    }
  });

  insertMany(products);

  // Create a demo user
  const hashedPassword = bcrypt.hashSync('demo123', 10);
  db.prepare(`
    INSERT OR IGNORE INTO users (name, email, password, address, phone)
    VALUES (?, ?, ?, ?, ?)
  `).run('Demo User', 'demo@example.com', hashedPassword, '123 Main St, City, State 12345', '555-0123');

  console.log('✅ Database seeded with', products.length, 'products and 1 demo user');
  console.log('   Demo login: demo@example.com / demo123');
}

seedDB();
