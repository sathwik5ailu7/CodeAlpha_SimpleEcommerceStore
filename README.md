# ShopZone - E-Commerce Store

A full-stack e-commerce application built as part of the **CodeAlpha Full Stack Development Internship** (Task 1).

## 🚀 Features

- **Product Listings** — Browse 16+ products with category filtering, search, and sorting
- **Product Details** — Detailed product pages with related products
- **Shopping Cart** — Add/remove items, update quantities, persistent cart
- **User Authentication** — Register, login, profile management (JWT-based)
- **Order Processing** — Checkout with shipping address and payment method selection
- **Order History** — View all past orders with status tracking
- **Responsive Design** — Fully responsive UI for mobile, tablet, and desktop

## 🛠 Tech Stack

- **Frontend:** HTML5, CSS3, Vanilla JavaScript
- **Backend:** Node.js, Express.js
- **Database:** SQLite (better-sqlite3)
- **Authentication:** JWT (JSON Web Tokens)
- **Password Hashing:** bcryptjs

## 📦 Setup & Installation

```bash
# Clone the repository
git clone https://github.com/YOUR_USERNAME/CodeAlpha_SimpleEcommerceStore.git
cd CodeAlpha_SimpleEcommerceStore

# Install dependencies
npm install

# Seed the database with sample products
npm run seed

# Start the server
npm start
```

The app will be available at `http://localhost:3000`

## 🔐 Demo Credentials

- **Email:** demo@example.com
- **Password:** demo123

## 📁 Project Structure

```
CodeAlpha_SimpleEcommerceStore/
├── server.js              # Express server entry point
├── package.json           # Dependencies and scripts
├── db/
│   ├── setup.js           # Database schema initialization
│   └── seed.js            # Sample data seeding
├── middleware/
│   └── auth.js            # JWT authentication middleware
├── routes/
│   ├── auth.js            # Authentication routes (register/login/profile)
│   ├── products.js        # Product listing and details routes
│   ├── cart.js            # Shopping cart CRUD routes
│   └── orders.js          # Order placement and history routes
└── public/
    ├── index.html         # Home page
    ├── login.html         # Login page
    ├── register.html      # Registration page
    ├── product.html       # Product detail page
    ├── cart.html           # Shopping cart page
    ├── orders.html        # Order history page
    ├── profile.html       # User profile page
    ├── css/
    │   └── style.css      # Complete stylesheet
    └── js/
        ├── utils.js       # API helpers, utilities
        ├── auth.js        # Auth UI management
        ├── app.js         # Home page product grid
        ├── product.js     # Product detail page
        ├── cart.js        # Cart page logic
        └── orders.js      # Orders page logic
```

## 🔗 API Endpoints

| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| POST | /api/auth/register | User registration | No |
| POST | /api/auth/login | User login | No |
| GET | /api/auth/profile | Get user profile | Yes |
| PUT | /api/auth/profile | Update profile | Yes |
| GET | /api/products | List products (filter/sort/search) | No |
| GET | /api/products/categories | List categories | No |
| GET | /api/products/:id | Product details | No |
| GET | /api/cart | Get cart items | Yes |
| POST | /api/cart | Add to cart | Yes |
| PUT | /api/cart/:id | Update cart item | Yes |
| DELETE | /api/cart/:id | Remove from cart | Yes |
| DELETE | /api/cart | Clear cart | Yes |
| GET | /api/orders | Get order history | Yes |
| GET | /api/orders/:id | Get order details | Yes |
| POST | /api/orders | Place new order | Yes |

## 🌐 Deployment

This app is deployed on **Railway**: [Live Demo Link]

## 📝 License

MIT

---

Built with ❤️ for **CodeAlpha** Full Stack Development Internship
