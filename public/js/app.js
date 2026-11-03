// ===== Home Page — Products & Categories =====

document.addEventListener('DOMContentLoaded', () => {
  const productsGrid = document.getElementById('productsGrid');
  const categoriesGrid = document.getElementById('categoriesGrid');
  const categoryFilter = document.getElementById('categoryFilter');
  const sortFilter = document.getElementById('sortFilter');
  const pagination = document.getElementById('pagination');
  const loadingSpinner = document.getElementById('loadingSpinner');

  if (!productsGrid) return; // Not on home page

  let currentPage = 1;
  let currentCategory = 'all';
  let currentSort = '';
  let currentSearch = '';

  // Check for search query in URL
  const urlParams = new URLSearchParams(window.location.search);
  if (urlParams.has('search')) {
    currentSearch = urlParams.get('search');
    const searchInput = document.getElementById('searchInput');
    if (searchInput) searchInput.value = currentSearch;
  }

  // Load categories
  async function loadCategories() {
    try {
      const res = await api('/api/products/categories');
      if (categoriesGrid) {
        categoriesGrid.innerHTML = `
          <div class="category-card active" onclick="filterCategory('all', this)">
            <i class="fas fa-th-large"></i>
            All
          </div>
          ${res.categories.map(cat => `
            <div class="category-card" onclick="filterCategory('${cat}', this)">
              <i class="${getCategoryIcon(cat)}"></i>
              ${cat}
            </div>
          `).join('')}
        `;
      }

      if (categoryFilter) {
        res.categories.forEach(cat => {
          const opt = document.createElement('option');
          opt.value = cat;
          opt.textContent = cat;
          categoryFilter.appendChild(opt);
        });
      }
    } catch (err) {
      console.error('Failed to load categories:', err);
    }
  }

  // Load products
  async function loadProducts() {
    loadingSpinner.classList.remove('hidden');
    productsGrid.innerHTML = '';

    try {
      const params = new URLSearchParams({
        page: currentPage,
        limit: 12,
        ...(currentCategory !== 'all' && { category: currentCategory }),
        ...(currentSort && { sort: currentSort }),
        ...(currentSearch && { search: currentSearch }),
      });

      const res = await api(`/api/products?${params}`);

      if (res.products.length === 0) {
        productsGrid.innerHTML = `
          <div class="empty-state" style="grid-column: 1 / -1">
            <i class="fas fa-search"></i>
            <h2>No products found</h2>
            <p>Try adjusting your search or filters</p>
          </div>
        `;
      } else {
        productsGrid.innerHTML = res.products.map(renderProductCard).join('');
      }

      renderPagination(res.pagination);
    } catch (err) {
      productsGrid.innerHTML = `
        <div class="empty-state" style="grid-column: 1 / -1">
          <i class="fas fa-exclamation-triangle"></i>
          <h2>Failed to load products</h2>
          <p>${err.message}</p>
        </div>
      `;
    } finally {
      loadingSpinner.classList.add('hidden');
    }
  }

  // Render pagination
  function renderPagination(pag) {
    if (!pagination || pag.pages <= 1) {
      if (pagination) pagination.innerHTML = '';
      return;
    }

    let html = `
      <button class="page-btn" onclick="goToPage(${pag.page - 1})" ${pag.page === 1 ? 'disabled' : ''}>
        <i class="fas fa-chevron-left"></i>
      </button>
    `;

    for (let i = 1; i <= pag.pages; i++) {
      if (i === 1 || i === pag.pages || (i >= pag.page - 1 && i <= pag.page + 1)) {
        html += `<button class="page-btn ${i === pag.page ? 'active' : ''}" onclick="goToPage(${i})">${i}</button>`;
      } else if (i === pag.page - 2 || i === pag.page + 2) {
        html += '<span style="padding: 8px;">...</span>';
      }
    }

    html += `
      <button class="page-btn" onclick="goToPage(${pag.page + 1})" ${pag.page === pag.pages ? 'disabled' : ''}>
        <i class="fas fa-chevron-right"></i>
      </button>
    `;

    pagination.innerHTML = html;
  }

  // Global functions
  window.filterCategory = function(category, element) {
    currentCategory = category;
    currentPage = 1;

    document.querySelectorAll('.category-card').forEach(c => c.classList.remove('active'));
    if (element) element.classList.add('active');

    if (categoryFilter) categoryFilter.value = category === 'all' ? 'all' : category;

    loadProducts();
  };

  window.goToPage = function(page) {
    currentPage = page;
    loadProducts();
    document.getElementById('products').scrollIntoView({ behavior: 'smooth' });
  };

  // Filter listeners
  if (categoryFilter) {
    categoryFilter.addEventListener('change', () => {
      currentCategory = categoryFilter.value;
      currentPage = 1;

      document.querySelectorAll('.category-card').forEach(c => {
        c.classList.toggle('active',
          (currentCategory === 'all' && c.textContent.trim() === 'All') ||
          c.textContent.trim() === currentCategory
        );
      });

      loadProducts();
    });
  }

  if (sortFilter) {
    sortFilter.addEventListener('change', () => {
      currentSort = sortFilter.value;
      currentPage = 1;
      loadProducts();
    });
  }

  // Initial load
  loadCategories();
  loadProducts();
});
