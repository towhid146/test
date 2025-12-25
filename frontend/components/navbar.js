// Dynamic Navbar Loader - Modern Glassmorphism Design
document.addEventListener("DOMContentLoaded", function () {
  // Determine the correct path to navbar.html based on current location
  const currentPath = window.location.pathname;
  let navbarPath = "components/navbar.html";

  // Adjust path if we're in a subdirectory
  if (currentPath.includes("/pages/")) {
    navbarPath = "../../components/navbar.html";
  } else if (currentPath.includes("/components/")) {
    navbarPath = "navbar.html";
  }

  // Load navbar HTML
  fetch(navbarPath)
    .then((response) => response.text())
    .then((data) => {
      // Insert navbar at the beginning of body
      const navContainer = document.createElement("div");
      navContainer.innerHTML = data;

      // Insert all elements (navbar and mobile menu overlay)
      const elements = navContainer.querySelectorAll(":scope > *");
      elements.forEach((el) => {
        document.body.insertBefore(el, document.body.firstChild);
      });

      // Update navbar based on user role
      updateNavbarForUser();

      // Add navbar styles if not already present
      if (!document.getElementById("navbar-styles")) {
        const style = document.createElement("style");
        style.id = "navbar-styles";
        style.textContent = `
          /* Modern Glassmorphism Navbar */
          .navbar {
            background: rgba(15, 12, 41, 0.95);
            backdrop-filter: blur(20px);
            -webkit-backdrop-filter: blur(20px);
            border-bottom: 1px solid rgba(255, 255, 255, 0.05);
            padding: 1rem 0;
            position: fixed;
            width: 100%;
            top: 0;
            z-index: 1000;
            transition: all 0.3s ease;
          }

          .navbar.scrolled {
            background: rgba(15, 12, 41, 0.98);
            padding: 0.75rem 0;
            box-shadow: 0 10px 30px rgba(0, 0, 0, 0.3);
          }

          .nav-container {
            max-width: 1400px;
            margin: 0 auto;
            padding: 0 24px;
            display: flex;
            justify-content: space-between;
            align-items: center;
          }

          .nav-logo {
            display: flex;
            align-items: center;
            text-decoration: none;
            font-family: 'Space Grotesk', 'Inter', sans-serif;
            font-size: 1.75rem;
            font-weight: 700;
            color: white;
            gap: 10px;
            transition: opacity 0.3s ease;
          }

          .nav-logo:hover {
            opacity: 0.9;
          }

          .nav-logo i {
            font-size: 1.5rem;
            background: linear-gradient(135deg, #a855f7, #ec4899);
            -webkit-background-clip: text;
            -webkit-text-fill-color: transparent;
          }

          .nav-links {
            display: flex;
            gap: 2.5rem;
            align-items: center;
          }

          .nav-link {
            text-decoration: none;
            color: rgba(255, 255, 255, 0.7);
            font-weight: 500;
            font-size: 0.95rem;
            transition: all 0.3s ease;
            position: relative;
          }

          .nav-link:hover, .nav-link.active {
            color: white;
          }

          .nav-link::after {
            content: '';
            position: absolute;
            width: 0;
            height: 2px;
            bottom: -6px;
            left: 50%;
            transform: translateX(-50%);
            background: linear-gradient(90deg, #a855f7, #ec4899);
            transition: width 0.3s ease;
            border-radius: 2px;
          }

          .nav-link:hover::after, .nav-link.active::after {
            width: 100%;
          }

          .nav-buttons {
            display: flex;
            gap: 1rem;
            align-items: center;
          }

          .nav-button {
            padding: 10px 24px;
            border-radius: 50px;
            font-weight: 600;
            font-size: 0.9rem;
            text-decoration: none;
            transition: all 0.3s ease;
            display: inline-block;
          }

          .nav-button.login {
            color: white;
            border: 1px solid rgba(255, 255, 255, 0.2);
            background: transparent;
          }

          .nav-button.login:hover {
            background: rgba(255, 255, 255, 0.1);
            border-color: rgba(255, 255, 255, 0.4);
          }

          .nav-button.signup {
            background: linear-gradient(135deg, #7c3aed 0%, #a855f7 100%);
            color: white;
            border: none;
          }

          .nav-button.signup:hover {
            transform: translateY(-2px);
            box-shadow: 0 10px 30px rgba(168, 85, 247, 0.3);
          }

          .mobile-menu {
            display: none;
            font-size: 1.5rem;
            color: white;
            cursor: pointer;
            background: none;
            border: none;
            padding: 8px;
            transition: color 0.3s ease;
          }

          .mobile-menu:hover {
            color: #a855f7;
          }

          /* Mobile Menu Overlay */
          .mobile-menu-overlay {
            position: fixed;
            inset: 0;
            background: rgba(0, 0, 0, 0.5);
            backdrop-filter: blur(4px);
            z-index: 1050;
            opacity: 0;
            visibility: hidden;
            transition: all 0.3s ease;
          }

          .mobile-menu-overlay.active {
            opacity: 1;
            visibility: visible;
          }

          .mobile-menu-panel {
            position: absolute;
            right: 0;
            top: 0;
            height: 100%;
            width: 280px;
            background: linear-gradient(180deg, #1a1a2e 0%, #0f0c29 100%);
            transform: translateX(100%);
            transition: transform 0.3s ease;
            box-shadow: -10px 0 30px rgba(0, 0, 0, 0.3);
            padding: 24px;
          }

          .mobile-menu-overlay.active .mobile-menu-panel {
            transform: translateX(0);
          }

          .mobile-menu-header {
            display: flex;
            justify-content: space-between;
            align-items: center;
            margin-bottom: 32px;
          }

          .mobile-menu-title {
            color: white;
            font-weight: 700;
            font-size: 1.25rem;
          }

          .mobile-menu-close {
            color: rgba(255, 255, 255, 0.7);
            background: none;
            border: none;
            font-size: 1.5rem;
            cursor: pointer;
            padding: 8px;
            transition: color 0.3s ease;
          }

          .mobile-menu-close:hover {
            color: white;
          }

          .mobile-nav-links {
            display: flex;
            flex-direction: column;
            gap: 8px;
          }

          .mobile-nav-link {
            display: block;
            padding: 12px 16px;
            color: rgba(255, 255, 255, 0.8);
            text-decoration: none;
            font-weight: 500;
            border-radius: 8px;
            transition: all 0.3s ease;
          }

          .mobile-nav-link:hover, .mobile-nav-link.active {
            background: rgba(255, 255, 255, 0.05);
            color: white;
          }

          .mobile-nav-buttons {
            margin-top: 32px;
            display: flex;
            flex-direction: column;
            gap: 12px;
          }

          .mobile-nav-button {
            display: block;
            width: 100%;
            padding: 14px;
            text-align: center;
            text-decoration: none;
            font-weight: 600;
            border-radius: 8px;
            transition: all 0.3s ease;
          }

          .mobile-nav-button.login {
            color: white;
            border: 1px solid rgba(255, 255, 255, 0.2);
            background: transparent;
          }

          .mobile-nav-button.login:hover {
            background: rgba(255, 255, 255, 0.05);
          }

          .mobile-nav-button.signup {
            background: linear-gradient(135deg, #7c3aed 0%, #a855f7 100%);
            color: white;
          }

          .mobile-nav-button.signup:hover {
            opacity: 0.9;
          }

          /* Responsive Design */
          @media (max-width: 1024px) {
            .nav-links {
              display: none;
            }

            .nav-buttons {
              display: none;
            }

            .mobile-menu {
              display: block;
            }
          }

          @media (max-width: 768px) {
            .nav-container {
              padding: 0 16px;
            }

            .nav-logo {
              font-size: 1.5rem;
            }

            .nav-logo i {
              font-size: 1.3rem;
            }
          }

          /* Add padding to body to account for fixed navbar */
          body {
            padding-top: 80px;
          }
        `;
        document.head.appendChild(style);
      }

      // Set active nav link based on current page
      setActiveNavLink();

      // Navbar scroll effect
      window.addEventListener("scroll", function () {
        const navbar = document.getElementById("navbar");
        if (navbar) {
          if (window.scrollY > 50) {
            navbar.classList.add("scrolled");
          } else {
            navbar.classList.remove("scrolled");
          }
        }
      });

      // Mobile menu toggle functionality
      const mobileMenu = document.getElementById("mobileMenu");
      const mobileMenuOverlay = document.getElementById("mobile-menu-overlay");
      const mobileMenuClose = document.getElementById("mobileMenuClose");

      function openMobileMenu() {
        if (mobileMenuOverlay) {
          mobileMenuOverlay.classList.add("active");
          document.body.style.overflow = "hidden";
        }
      }

      function closeMobileMenu() {
        if (mobileMenuOverlay) {
          mobileMenuOverlay.classList.remove("active");
          document.body.style.overflow = "";
        }
      }

      if (mobileMenu) {
        mobileMenu.addEventListener("click", openMobileMenu);
      }

      if (mobileMenuClose) {
        mobileMenuClose.addEventListener("click", closeMobileMenu);
      }

      if (mobileMenuOverlay) {
        mobileMenuOverlay.addEventListener("click", function (e) {
          if (e.target === mobileMenuOverlay) {
            closeMobileMenu();
          }
        });
      }

      // Close mobile menu when a link is clicked
      document
        .querySelectorAll(".mobile-nav-link, .mobile-nav-button")
        .forEach((link) => {
          link.addEventListener("click", closeMobileMenu);
        });
    })
    .catch((error) => console.error("Error loading navbar:", error));
});

// Function to update navbar based on user role
function updateNavbarForUser() {
  const userRole = localStorage.getItem("userRole"); // 'sponsor', 'sponsee', or null
  const navLinksContainer = document.getElementById("navLinks");
  const navButtonsContainer = document.querySelector(".nav-buttons");
  const mobileNavLinks = document.querySelector(".mobile-nav-links");
  const mobileNavButtons = document.querySelector(".mobile-nav-buttons");

  if (!navLinksContainer || !navButtonsContainer) return;

  // Define navigation links and buttons based on role
  let navLinksHTML = "";
  let navButtonsHTML = "";
  let mobileLinksHTML = "";
  let mobileButtonsHTML = "";

  if (!userRole) {
    // Not logged in - show basic links
    navLinksHTML = `
      <a href="/index.html" class="nav-link">Home</a>
      <a href="/pages/events/sponsors.html" class="nav-link">Sponsors</a>
      <a href="/pages/events/sponsee.html" class="nav-link">Sponsees</a>
      <a href="/about.html" class="nav-link">About</a>
      <a href="#contact" class="nav-link">Contact</a>
    `;
    navButtonsHTML = `
      <a href="/pages/auth/login.html" class="nav-button login">Login</a>
      <a href="/pages/auth/signup-choice.html" class="nav-button signup">Get Started</a>
    `;
    mobileLinksHTML = `
      <a href="/index.html" class="mobile-nav-link">Home</a>
      <a href="/pages/events/sponsors.html" class="mobile-nav-link">Sponsors</a>
      <a href="/pages/events/sponsee.html" class="mobile-nav-link">Sponsees</a>
      <a href="/about.html" class="mobile-nav-link">About</a>
      <a href="#contact" class="mobile-nav-link">Contact</a>
    `;
    mobileButtonsHTML = `
      <a href="/pages/auth/login.html" class="mobile-nav-button login">Login</a>
      <a href="/pages/auth/signup-choice.html" class="mobile-nav-button signup">Get Started</a>
    `;
  } else if (userRole === "sponsor") {
    // Sponsor logged in
    navLinksHTML = `
      <a href="/index.html" class="nav-link">Home</a>
      <a href="/pages/dashboards/sponsor-dashboard.html" class="nav-link">Dashboard</a>
      <a href="/pages/events/sponsee.html" class="nav-link">Find Sponsees</a>
      <a href="/pages/messages.html" class="nav-link">Messages</a>
      <a href="/pages/documents.html" class="nav-link">Documents</a>
    `;
    navButtonsHTML = `
      <a href="/pages/profiles/sponsor-profile.html" class="nav-button login"><i class="fas fa-user mr-2"></i>Profile</a>
      <a href="#" class="nav-button signup" onclick="logout()"><i class="fas fa-sign-out-alt mr-2"></i>Logout</a>
    `;
    mobileLinksHTML = `
      <a href="/index.html" class="mobile-nav-link">Home</a>
      <a href="/pages/dashboards/sponsor-dashboard.html" class="mobile-nav-link">Dashboard</a>
      <a href="/pages/events/sponsee.html" class="mobile-nav-link">Find Sponsees</a>
      <a href="/pages/messages.html" class="mobile-nav-link">Messages</a>
      <a href="/pages/documents.html" class="mobile-nav-link">Documents</a>
    `;
    mobileButtonsHTML = `
      <a href="/pages/profiles/sponsor-profile.html" class="mobile-nav-button login"><i class="fas fa-user mr-2"></i>Profile</a>
      <a href="#" class="mobile-nav-button signup" onclick="logout()"><i class="fas fa-sign-out-alt mr-2"></i>Logout</a>
    `;
  } else if (userRole === "sponsee") {
    // Sponsee logged in
    navLinksHTML = `
      <a href="/index.html" class="nav-link">Home</a>
      <a href="/pages/dashboards/sponsee-dashboard.html" class="nav-link">Dashboard</a>
      <a href="/pages/events/sponsors.html" class="nav-link">Find Sponsors</a>
      <a href="/pages/messages.html" class="nav-link">Messages</a>
      <a href="/pages/documents.html" class="nav-link">Documents</a>
    `;
    navButtonsHTML = `
      <a href="/pages/profiles/sponsee-profile.html" class="nav-button login"><i class="fas fa-user mr-2"></i>Profile</a>
      <a href="#" class="nav-button signup" onclick="logout()"><i class="fas fa-sign-out-alt mr-2"></i>Logout</a>
    `;
    mobileLinksHTML = `
      <a href="/index.html" class="mobile-nav-link">Home</a>
      <a href="/pages/dashboards/sponsee-dashboard.html" class="mobile-nav-link">Dashboard</a>
      <a href="/pages/events/sponsors.html" class="mobile-nav-link">Find Sponsors</a>
      <a href="/pages/messages.html" class="mobile-nav-link">Messages</a>
      <a href="/pages/documents.html" class="mobile-nav-link">Documents</a>
    `;
    mobileButtonsHTML = `
      <a href="/pages/profiles/sponsee-profile.html" class="mobile-nav-button login"><i class="fas fa-user mr-2"></i>Profile</a>
      <a href="#" class="mobile-nav-button signup" onclick="logout()"><i class="fas fa-sign-out-alt mr-2"></i>Logout</a>
    `;
  }

  navLinksContainer.innerHTML = navLinksHTML;
  navButtonsContainer.innerHTML = navButtonsHTML;

  if (mobileNavLinks) mobileNavLinks.innerHTML = mobileLinksHTML;
  if (mobileNavButtons) mobileNavButtons.innerHTML = mobileButtonsHTML;
}

// Logout function
function logout() {
  localStorage.removeItem("userRole");
  localStorage.removeItem("userName");
  window.location.href = "/index.html";
}

// Function to set active nav link based on current page
function setActiveNavLink() {
  const currentPage = window.location.pathname.split("/").pop() || "index.html";
  const navLinks = document.querySelectorAll(".nav-link");

  navLinks.forEach((link) => {
    const href = link.getAttribute("href");
    if (href === currentPage || (currentPage === "" && href === "index.html")) {
      link.classList.add("active");
    } else {
      link.classList.remove("active");
    }
  });
}
