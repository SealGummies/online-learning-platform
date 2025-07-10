// Configuration
const API_BASE_URL = "http://localhost:3761/api";

// Helper functions
function getToken() {
  return localStorage.getItem("authToken");
}

function getUser() {
  const user = localStorage.getItem("user");
  return user ? JSON.parse(user) : null;
}

function removeToken() {
  localStorage.removeItem("authToken");
}

function removeUser() {
  localStorage.removeItem("user");
}

function redirectToLogin() {
  window.location.href = "index.html";
}

function isLoggedIn() {
  return getToken() && getUser();
}

// Logout function
function logout() {
  removeToken();
  removeUser();
  redirectToLogin();
}

// Initialize dashboard
function initializeDashboard() {
  // Check if user is logged in
  if (!isLoggedIn()) {
    redirectToLogin();
    return;
  }

  const user = getUser();

  // Update user info in header
  const userNameElement = document.getElementById("userName");
  if (userNameElement && user) {
    userNameElement.textContent = `Welcome, ${user.firstName} ${user.lastName}!`;
  }

  // Add logout event listener
  const logoutBtn = document.getElementById("logoutBtn");
  if (logoutBtn) {
    logoutBtn.addEventListener("click", function () {
      logout();
    });
  }
}

// API function to verify token (optional - for future use)
async function verifyToken() {
  const token = getToken();
  if (!token) return false;

  try {
    const response = await fetch(`${API_BASE_URL}/auth/me`, {
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
    });

    if (response.ok) {
      const data = await response.json();
      return data.success;
    }
    return false;
  } catch (error) {
    console.error("Token verification failed:", error);
    return false;
  }
}

// Initialize when DOM is loaded
document.addEventListener("DOMContentLoaded", function () {
  initializeDashboard();
});
