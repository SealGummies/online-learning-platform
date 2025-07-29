// Configuration
const API_BASE_URL = "http://localhost:3761/api";

// Debug: Log when dashboard.js loads
console.log("Dashboard.js loaded - Course Management Feature Available!");
console.log("Version: 1.2 - Modularized Action Handlers");

// Handler modules will be loaded dynamically
let StudentHandler, InstructorHandler, AdminHandler;

// Expose utility functions for handlers (will be set after function definitions)
let dashboardUtils = null;

// Load handler modules
async function loadHandlers() {
  try {
    const [studentModule, instructorModule, adminModule] = await Promise.all([
      import("./handlers/studentHandler.js"),
      import("./handlers/instructorHandler.js"),
      import("./handlers/adminHandler.js"),
    ]);

    StudentHandler = studentModule.StudentHandler;
    InstructorHandler = instructorModule.InstructorHandler;
    AdminHandler = adminModule.AdminHandler;

    // Make instructor handler available globally for onclick handlers
    window.instructorHandler = InstructorHandler;

    console.log("Action handlers loaded successfully");
  } catch (error) {
    console.error("Failed to load action handlers:", error);
    // Fallback to built-in handlers if modules fail to load
    loadFallbackHandlers();
  }
}

// Fallback handlers if module loading fails
function loadFallbackHandlers() {
  StudentHandler = {
    handleAction: (action) => {
      console.log("Using fallback student handler for:", action);
      alert("Feature coming soon");
    },
  };

  InstructorHandler = {
    handleAction: (action) => {
      console.log("Using fallback instructor handler for:", action);
      alert("Feature coming soon");
    },
  };

  AdminHandler = {
    handleAction: (action) => {
      console.log("Using fallback admin handler for:", action);
      alert("Feature coming soon");
    },
  };
}

// Test API connection
async function testAPIConnection() {
  try {
    console.log("Testing API connection to:", API_BASE_URL);
    const response = await fetch(`${API_BASE_URL}/courses`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
    });
    console.log("API test response status:", response.status);
    console.log("API test response ok:", response.ok);
    const data = await response.json();
    console.log("API test response data:", data);
    return response.ok;
  } catch (error) {
    console.error("API connection test failed:", error);
    return false;
  }
}

// Test API on load
testAPIConnection();

// Clean up invalid localStorage values
function cleanupInvalidAuth() {
  const token = localStorage.getItem("authToken");
  const user = localStorage.getItem("user");

  if (
    token === "undefined" ||
    token === "null" ||
    user === "undefined" ||
    user === "null"
  ) {
    console.log("Cleaning up invalid localStorage values...");
    localStorage.removeItem("authToken");
    localStorage.removeItem("user");
  }
}

// Run cleanup on load
cleanupInvalidAuth();

// Helper functions
function getToken() {
  const token = localStorage.getItem("authToken");
  // Check for invalid token values
  if (
    !token ||
    token === "undefined" ||
    token === "null" ||
    token.trim() === ""
  ) {
    return null;
  }
  return token;
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
  // Check current path to determine correct redirect path
  const currentPath = window.location.pathname;

  if (currentPath.includes("/pages/")) {
    // Already in pages directory
    window.location.href = "index.html";
  } else {
    // From root directory
    window.location.href = "pages/index.html";
  }
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

// Show dashboard based on user role
function showRoleDashboard(user) {
  // Hide all role dashboards first
  const roleDashboards = document.querySelectorAll(".role-dashboard");
  roleDashboards.forEach((dashboard) => {
    dashboard.style.display = "none";
  });

  // Show appropriate dashboard based on role
  const role = user.role ? user.role.toLowerCase() : "unknown";

  switch (role) {
    case "student":
      document.getElementById("studentDashboard").style.display = "block";
      break;
    case "instructor":
      document.getElementById("instructorDashboard").style.display = "block";
      break;
    case "admin":
      document.getElementById("adminDashboard").style.display = "block";
      break;
    default:
      document.getElementById("defaultDashboard").style.display = "block";
      break;
  }
}

// Update user role display
function updateUserRoleDisplay(user) {
  const userRoleElement = document.getElementById("userRole");
  if (userRoleElement && user.role) {
    const role = user.role.toLowerCase();
    let roleDisplay = "";

    switch (role) {
      case "student":
        roleDisplay = "Student";
        break;
      case "instructor":
        roleDisplay = "Instructor";
        break;
      case "admin":
        roleDisplay = "Admin";
        break;
      default:
        roleDisplay = "User";
        break;
    }

    userRoleElement.textContent = roleDisplay;
  }
}

// Initialize dashboard
async function initializeDashboard() {
  // Set up dashboardUtils after all functions are defined
  window.dashboardUtils = {
    getToken,
    getUser,
    removeToken,
    removeUser,
    redirectToLogin,
    isLoggedIn,
    showRoleDashboard,
  };

  // Debug: Log initialization
  console.log("Initializing dashboard...");
  console.log("isLoggedIn():", isLoggedIn());
  console.log("getToken():", !!getToken());
  console.log("getUser():", !!getUser());

  // Load action handlers
  await loadHandlers();

  // Check if user is logged in
  if (!isLoggedIn()) {
    console.log("User not logged in, redirecting to login page");
    redirectToLogin();
    return;
  }

  const user = getUser();
  console.log(
    "User logged in:",
    user?.firstName,
    user?.lastName,
    "Role:",
    user?.role
  );

  // Update user info in header
  const userNameElement = document.getElementById("userName");
  if (userNameElement && user) {
    userNameElement.textContent = `Welcome, ${user.firstName} ${user.lastName}!`;
  }

  // Update user role display
  updateUserRoleDisplay(user);

  // Show appropriate dashboard based on role
  showRoleDashboard(user);

  // Add logout event listener
  const logoutBtn = document.getElementById("logoutBtn");
  if (logoutBtn) {
    logoutBtn.addEventListener("click", function () {
      logout();
    });
  } else {
    console.error("Logout button not found");
  }

  // Add event listeners for dashboard buttons (for future functionality)
  addDashboardEventListeners();
}

// Add event listeners for dashboard buttons
function addDashboardEventListeners() {
  // Student dashboard buttons
  const studentButtons = document.querySelectorAll(
    "#studentDashboard .btn-primary"
  );
  studentButtons.forEach((button) => {
    button.addEventListener("click", function () {
      const action = this.getAttribute("data-action");
      console.log(`Student action: ${action}`);
      handleStudentAction(action);
    });
  });

  // Instructor dashboard buttons
  const instructorButtons = document.querySelectorAll(
    "#instructorDashboard .btn-primary"
  );
  instructorButtons.forEach((button) => {
    button.addEventListener("click", function () {
      const action = this.getAttribute("data-action");
      console.log(`Instructor action: ${action}`);
      handleInstructorAction(action);
    });
  });

  // Admin dashboard buttons
  const adminButtons = document.querySelectorAll(
    "#adminDashboard .btn-primary"
  );
  adminButtons.forEach((button) => {
    button.addEventListener("click", function () {
      const action = this.getAttribute("data-action");
      console.log(`Admin action: ${action}`);
      handleAdminAction(action);
    });
  });
}

// Expose the function globally for use by handlers
window.addDashboardEventListeners = addDashboardEventListeners;

// Handle student actions
function handleStudentAction(action) {
  if (StudentHandler) {
    StudentHandler.handleAction(action);
  } else {
    console.warn("Student handler not loaded, using fallback");
    alert("Feature coming soon");
  }
}

// Handle instructor actions
function handleInstructorAction(action) {
  if (InstructorHandler) {
    InstructorHandler.handleAction(action);
  } else {
    console.warn("Instructor handler not loaded, using fallback");
    if (action === "manage-courses") {
      showCourseManagement();
    } else {
      alert("Feature coming soon");
    }
  }
}

// Handle admin actions
function handleAdminAction(action) {
  if (AdminHandler) {
    AdminHandler.handleAction(action);
  } else {
    console.warn("Admin handler not loaded, using fallback");
    alert("Feature coming soon");
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

// Initialize when DOM is loaded and components are ready
document.addEventListener("DOMContentLoaded", function () {
  // Wait for components to load before initializing dashboard
  if (window.componentLoader) {
    window.componentLoader.onComponentsLoaded(async function () {
      console.log("Components loaded, initializing dashboard...");
      await initializeDashboard();
    });
  } else {
    // Fallback if component loader is not available
    console.log(
      "Component loader not available, initializing dashboard directly..."
    );
    initializeDashboard();
  }
});
