// Configuration
const API_BASE_URL = "http://localhost:3761/api";

// Helper functions
function showMessage(elementId, message, isError = false) {
  const element = document.getElementById(elementId);
  element.textContent = message;
  element.style.display = "block";

  // Hide other message types
  if (isError) {
    hideElement("successMessage");
    hideElement("loadingMessage");
  } else {
    hideElement("errorMessage");
    hideElement("loadingMessage");
  }
}

function hideElement(elementId) {
  const element = document.getElementById(elementId);
  if (element) {
    element.style.display = "none";
  }
}

function showLoading(show = true) {
  const loadingElement = document.getElementById("loadingMessage");
  const submitBtn = document.querySelector('button[type="submit"]');

  if (show) {
    loadingElement.style.display = "block";
    submitBtn.disabled = true;
    hideElement("errorMessage");
    hideElement("successMessage");
  } else {
    loadingElement.style.display = "none";
    submitBtn.disabled = false;
  }
}

// API functions
async function makeRequest(url, options = {}) {
  try {
    const response = await fetch(url, {
      headers: {
        "Content-Type": "application/json",
        ...options.headers,
      },
      ...options,
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || "Request failed");
    }

    return data;
  } catch (error) {
    throw error;
  }
}

// Authentication functions
async function login(email, password) {
  return await makeRequest(`${API_BASE_URL}/auth/login`, {
    method: "POST",
    body: JSON.stringify({ email, password }),
  });
}

async function register(userData) {
  return await makeRequest(`${API_BASE_URL}/auth/register`, {
    method: "POST",
    body: JSON.stringify(userData),
  });
}

// Local storage functions
function saveToken(token) {
  localStorage.setItem("authToken", token);
}

function getToken() {
  return localStorage.getItem("authToken");
}

function removeToken() {
  localStorage.removeItem("authToken");
}

function saveUser(user) {
  localStorage.setItem("user", JSON.stringify(user));
}

function getUser() {
  const user = localStorage.getItem("user");
  return user ? JSON.parse(user) : null;
}

function removeUser() {
  localStorage.removeItem("user");
}

// Check if user is logged in
function isLoggedIn() {
  return getToken() && getUser();
}

// Redirect functions
function redirectToDashboard() {
  window.location.href = "pages/dashboard.html";
}

function redirectToLogin() {
  window.location.href = "pages/index.html";
}

// Event listeners
document.addEventListener("DOMContentLoaded", function () {
  // Check if already logged in and redirect appropriately
  if (window.location.pathname.includes("dashboard.html")) {
    if (!isLoggedIn()) {
      redirectToLogin();
      return;
    }
  } else if (
    window.location.pathname.includes("index.html") ||
    window.location.pathname.endsWith("/")
  ) {
    if (isLoggedIn()) {
      redirectToDashboard();
      return;
    }
  }

  // Login form handler
  const loginForm = document.getElementById("loginForm");
  if (loginForm) {
    loginForm.addEventListener("submit", async function (e) {
      e.preventDefault();

      const email = document.getElementById("email").value.trim();
      const password = document.getElementById("password").value;

      if (!email || !password) {
        showMessage("errorMessage", "Please fill in all fields", true);
        return;
      }

      showLoading(true);

      try {
        const response = await login(email, password);

        if (response.success) {
          // Save token and user info
          saveToken(response.token);
          saveUser(response.data.user);

          // Redirect to dashboard
          redirectToDashboard();
        } else {
          showMessage("errorMessage", response.message || "Login failed", true);
        }
      } catch (error) {
        showMessage(
          "errorMessage",
          error.message || "Login failed. Please try again.",
          true
        );
      } finally {
        showLoading(false);
      }
    });
  }

  // Register form handler
  const registerForm = document.getElementById("registerForm");
  if (registerForm) {
    registerForm.addEventListener("submit", async function (e) {
      e.preventDefault();

      const firstName = document.getElementById("firstName").value.trim();
      const lastName = document.getElementById("lastName").value.trim();
      const email = document.getElementById("email").value.trim();
      const password = document.getElementById("password").value;
      const role = document.getElementById("role").value;

      if (!firstName || !lastName || !email || !password) {
        showMessage("errorMessage", "Please fill in all fields", true);
        return;
      }

      if (password.length < 6) {
        showMessage(
          "errorMessage",
          "Password must be at least 6 characters long",
          true
        );
        return;
      }

      showLoading(true);

      try {
        const response = await register({
          firstName,
          lastName,
          email,
          password,
          role,
        });

        if (response.success) {
          showMessage(
            "successMessage",
            "Registration successful! Please login.",
            false
          );
          registerForm.reset();

          // Redirect to login after 2 seconds
          setTimeout(() => {
            redirectToLogin();
          }, 2000);
        } else {
          showMessage(
            "errorMessage",
            response.message || "Registration failed",
            true
          );
        }
      } catch (error) {
        showMessage(
          "errorMessage",
          error.message || "Registration failed. Please try again.",
          true
        );
      } finally {
        showLoading(false);
      }
    });
  }
});
