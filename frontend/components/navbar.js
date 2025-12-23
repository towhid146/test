// Dynamic Navbar Loader
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
      document.body.insertBefore(
        navContainer.firstElementChild,
        document.body.firstChild
      );

      // Update navbar based on user role
      updateNavbarForUser();

      // Add navbar styles if not already present
      if (!document.getElementById("navbar-styles")) {
        const style = document.createElement("style");
        style.id = "navbar-styles";
        style.textContent = `
          /* Navbar styles */
          .navbar {
            display: flex;
            justify-content: space-between;
            align-items: center;
            padding: 1rem 5%;
            background-color: #ffffff;
            box-shadow: 0 2px 5px rgba(0,0,0,0.1);
            position: fixed;
            width: 100%;
            top: 0;
            z-index: 1000;
          }

          .nav-container {
            width: 100%;
            max-width: 1200px;
            margin: 0 auto;
            padding: 0 20px;
            display: flex;
            justify-content: space-between;
            align-items: center;
          }

          .nav-logo {
            display: flex;
            align-items: center;
            text-decoration: none;
            background: linear-gradient(135deg, #8b5cf6 0%, #ec4899 100%);
            -webkit-background-clip: text;
            -webkit-text-fill-color: transparent;
            background-clip: text;
            font-size: 1.5rem;
            font-weight: 700;
            cursor: pointer;
            transition: opacity 0.3s ease;
          }

          .nav-logo:hover {
            opacity: 0.8;
          }

          .nav-logo i {
            margin-right: 10px;
            font-size: 1.8rem;
          }

          .nav-links {
            display: flex;
            list-style: none;
            gap: 2rem;
            align-items: center;
          }

          .nav-link {
            text-decoration: none;
            color: #4a5568;
            font-weight: 500;
            transition: color 0.3s ease;
            position: relative;
          }

          .nav-link:hover, .nav-link.active {
            background: linear-gradient(135deg, #8b5cf6 0%, #ec4899 100%);
            -webkit-background-clip: text;
            -webkit-text-fill-color: transparent;
            background-clip: text;
          }

          .nav-link::after {
            content: '';
            position: absolute;
            width: 0;
            height: 2px;
            bottom: -5px;
            left: 0;
            background: linear-gradient(135deg, #8b5cf6 0%, #ec4899 100%);
            transition: width 0.3s ease;
          }

          .nav-link:hover::after {
            width: 100%;
          }

          .nav-buttons {
            display: flex;
            gap: 1rem;
            align-items: center;
          }

          .nav-button {
            padding: 0.5rem 1.5rem;
            border-radius: 5px;
            font-weight: 500;
            cursor: pointer;
            transition: all 0.3s ease;
            text-decoration: none;
            display: inline-block;
          }

          .nav-button.login {
            background: none;
            border: 2px solid #8b5cf6;
            color: #8b5cf6;
          }

          .nav-button.login:hover {
            background: linear-gradient(135deg, #8b5cf6 0%, #ec4899 100%);
            color: white;
            border-color: #8b5cf6;
          }

          .nav-button.signup {
            background: linear-gradient(135deg, #8b5cf6 0%, #ec4899 100%);
            border: none;
            color: white;
          }

          .nav-button.signup:hover {
            background: linear-gradient(135deg, #7c3aed 0%, #db2777 100%);
            transform: translateY(-2px);
            box-shadow: 0 4px 12px rgba(139, 92, 246, 0.3);
          }

          .mobile-menu {
            display: none;
            font-size: 1.5rem;
            color: #2d3748;
            cursor: pointer;
            transition: color 0.3s ease;
          }

          .mobile-menu:hover {
            color: #8b5cf6;
          }

          .mobile-menu.active {
            display: block;
          }

          /* Responsive Design */
          @media (max-width: 768px) {
            .navbar {
              padding: 1rem 3%;
            }

            .nav-container {
              padding: 0 10px;
            }

            .nav-links {
              display: none;
              position: absolute;
              top: 60px;
              left: 0;
              right: 0;
              flex-direction: column;
              background-color: white;
              box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
              padding: 1rem;
              gap: 0.5rem;
            }

            .nav-links.active {
              display: flex;
            }

            .nav-link {
              padding: 0.75rem 1rem;
              border-radius: 5px;
            }

            .nav-buttons {
              display: none;
              position: absolute;
              top: 200px;
              right: 1rem;
              flex-direction: column;
              gap: 0.5rem;
            }

            .nav-buttons.active {
              display: flex;
            }

            .mobile-menu {
              display: block;
            }

            .nav-logo {
              font-size: 1.2rem;
            }

            .nav-logo i {
              font-size: 1.5rem;
            }
          }
        `;
        document.head.appendChild(style);
      }

      // Set active nav link based on current page
      setActiveNavLink();

      // Mobile menu toggle functionality
      const mobileMenu = document.getElementById("mobileMenu");
      const navLinks = document.getElementById("navLinks");
      const navButtons = document.querySelector(".nav-buttons");

      if (mobileMenu) {
        mobileMenu.addEventListener("click", function () {
          navLinks.classList.toggle("active");
          navButtons.classList.toggle("active");
          mobileMenu.classList.toggle("active");
        });

        // Close menu when a link is clicked
        document.querySelectorAll(".nav-link").forEach((link) => {
          link.addEventListener("click", function () {
            navLinks.classList.remove("active");
            navButtons.classList.remove("active");
            mobileMenu.classList.remove("active");
          });
        });
      }
    })
    .catch((error) => console.error("Error loading navbar:", error));
});

// Function to update navbar based on user role
function updateNavbarForUser() {
  const userRole = localStorage.getItem("userRole"); // 'sponsor', 'sponsee', or null
  const navLinksContainer = document.getElementById("navLinks");
  const navButtonsContainer = document.querySelector(".nav-buttons");

  if (!navLinksContainer || !navButtonsContainer) return;

  // Determine base path based on current location
  const currentPath = window.location.pathname;
  let basePath = "";
  if (currentPath.includes("/pages/")) {
    basePath = "../../";
  }

  // Define navigation links based on role
  let navLinks = "";

  if (!userRole) {
    // Not logged in - show basic links
    navLinks = `
      <a href="${basePath}index.html" class="nav-link">Home</a>
      <a href="${basePath}about.html" class="nav-link">About</a>
      <a href="#" class="nav-link">Contact</a>
    `;

    // Show login and signup buttons
    navButtonsContainer.innerHTML = `
      <a href="${basePath}pages/auth/login.html" class="nav-button login">Login</a>
      <a href="${basePath}pages/auth/signup-choice.html" class="nav-button signup sponsor-btn">Sign Up</a>
    `;
  } else if (userRole === "sponsor") {
    // Sponsor logged in - show sponsors page
    navLinks = `
      <a href="${basePath}index.html" class="nav-link">Home</a>
      <a href="${basePath}pages/events/sponsee.html" class="nav-link">Sponsors</a>
      <a href="${basePath}about.html" class="nav-link">About</a>
      <a href="#" class="nav-link">Contact</a>
    `;

    // Show profile and logout buttons
    navButtonsContainer.innerHTML = `
      <a href="${basePath}pages/profiles/sponsor-profile.html" class="nav-button login">Profile</a>
      <a href="#" class="nav-button signup sponsor-btn" onclick="logout()">Logout</a>
    `;
  } else if (userRole === "sponsee") {
    // Sponsee logged in - show events page
    navLinks = `
      <a href="${basePath}index.html" class="nav-link">Home</a>
      <a href="${basePath}pages/events/sponsors.html" class="nav-link">Events</a>
      <a href="${basePath}about.html" class="nav-link">About</a>
      <a href="#" class="nav-link">Contact</a>
    `;

    // Show profile and logout buttons
    navButtonsContainer.innerHTML = `
      <a href="${basePath}pages/profiles/sponsee-profile.html" class="nav-button login">Profile</a>
      <a href="#" class="nav-button signup sponsor-btn" onclick="logout()">Logout</a>
    `;
  }

  navLinksContainer.innerHTML = navLinks;
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
