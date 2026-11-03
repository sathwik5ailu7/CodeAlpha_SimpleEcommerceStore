// ===== Auth UI Management =====

document.addEventListener('DOMContentLoaded', () => {
  const token = getToken();
  const user = getUser();

  // Show/hide elements based on auth status
  document.querySelectorAll('.auth-only').forEach(el => {
    el.classList.toggle('hidden', !token);
  });
  document.querySelectorAll('.guest-only').forEach(el => {
    el.classList.toggle('hidden', !!token);
  });

  // Set username
  const userNameEl = document.getElementById('userName');
  if (userNameEl && user) {
    userNameEl.textContent = user.name.split(' ')[0];
  }

  // User dropdown toggle
  const userMenuBtn = document.getElementById('userMenuBtn');
  const userDropdown = document.getElementById('userDropdown');
  if (userMenuBtn && userDropdown) {
    userMenuBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      userDropdown.classList.toggle('show');
    });

    document.addEventListener('click', () => {
      userDropdown.classList.remove('show');
    });
  }

  // Logout button
  const logoutBtn = document.getElementById('logoutBtn');
  if (logoutBtn) {
    logoutBtn.addEventListener('click', (e) => {
      e.preventDefault();
      logout();
    });
  }

  // Mobile menu toggle
  const mobileMenuBtn = document.getElementById('mobileMenuBtn');
  const navLinks = document.querySelector('.nav-links');
  if (mobileMenuBtn && navLinks) {
    mobileMenuBtn.addEventListener('click', () => {
      navLinks.classList.toggle('show');
    });
  }

  // Search functionality
  const searchInput = document.getElementById('searchInput');
  const searchBtn = document.getElementById('searchBtn');
  if (searchBtn && searchInput) {
    searchBtn.addEventListener('click', () => {
      const query = searchInput.value.trim();
      if (query) {
        window.location.href = `/?search=${encodeURIComponent(query)}`;
      }
    });

    searchInput.addEventListener('keydown', (e) => {
      if (e.key === 'Enter') {
        const query = searchInput.value.trim();
        if (query) {
          window.location.href = `/?search=${encodeURIComponent(query)}`;
        }
      }
    });
  }

  // Load cart count
  loadCartCount();
});
