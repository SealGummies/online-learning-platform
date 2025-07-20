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
  // Get current path to determine correct redirect path
  const currentPath = window.location.pathname;

  if (currentPath.includes('/pages/')) {
    // If we're in pages directory, go to index.html in same directory
    window.location.href = "index.html";
  } else {
    // If we're in root, go to pages/index.html
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
  const roleDashboards = document.querySelectorAll('.role-dashboard');
  roleDashboards.forEach(dashboard => {
    dashboard.style.display = 'none';
  });

  // Show appropriate dashboard based on role
  const role = user.role ? user.role.toLowerCase() : 'unknown';

  switch (role) {
    case 'student':
      document.getElementById('studentDashboard').style.display = 'block';
      break;
    case 'instructor':
      document.getElementById('instructorDashboard').style.display = 'block';
      break;
    case 'admin':
      document.getElementById('adminDashboard').style.display = 'block';
      break;
    default:
      document.getElementById('defaultDashboard').style.display = 'block';
      break;
  }
}

// Update user role display
function updateUserRoleDisplay(user) {
  const userRoleElement = document.getElementById('userRole');
  if (userRoleElement && user.role) {
    const role = user.role.toLowerCase();
    let roleDisplay = '';

    switch (role) {
      case 'student':
        roleDisplay = '🎓 Student';
        break;
      case 'instructor':
        roleDisplay = '👨‍🏫 Instructor';
        break;
      case 'admin':
        roleDisplay = '⚙️ Admin';
        break;
      default:
        roleDisplay = '👤 User';
        break;
    }

    userRoleElement.textContent = roleDisplay;
  }
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
  const studentButtons = document.querySelectorAll('#studentDashboard .btn-primary');
  studentButtons.forEach(button => {
    button.addEventListener('click', function () {
      const action = this.getAttribute('data-action');
      console.log(`Student action: ${action}`);
      handleStudentAction(action);
    });
  });

  // Instructor dashboard buttons
  const instructorButtons = document.querySelectorAll('#instructorDashboard .btn-primary');
  instructorButtons.forEach(button => {
    button.addEventListener('click', function () {
      const action = this.getAttribute('data-action');
      console.log(`Instructor action: ${action}`);
      handleInstructorAction(action);
    });
  });

  // Admin dashboard buttons
  const adminButtons = document.querySelectorAll('#adminDashboard .btn-primary');
  adminButtons.forEach(button => {
    button.addEventListener('click', function () {
      const action = this.getAttribute('data-action');
      console.log(`Admin action: ${action}`);
      handleAdminAction(action);
    });
  });
}

// Handle student actions
function handleStudentAction(action) {
  switch (action) {
    case 'view-enrollments':
      alert('Feature coming soon: View your course enrollments and progress');
      break;
    case 'view-lessons':
      alert('Feature coming soon: Access course lessons and content');
      break;
    case 'view-progress':
      alert('Feature coming soon: View your completion percentage and grades');
      break;
    case 'view-exams':
      alert('Feature coming soon: Take exams and view results');
      break;
    default:
      alert('Feature coming soon');
  }
}

// Handle instructor actions
function handleInstructorAction(action) {
  switch (action) {
    case 'manage-courses':
      alert('Feature coming soon: Create and manage your courses');
      break;
    case 'manage-lessons':
      alert('Feature coming soon: Create and manage course lessons');
      break;
    case 'manage-exams':
      alert('Feature coming soon: Create and manage exams/assessments');
      break;
    case 'view-students':
      alert('Feature coming soon: View enrolled students and their progress');
      break;
    default:
      alert('Feature coming soon');
  }
}

// Handle admin actions
function handleAdminAction(action) {
  switch (action) {
    case 'manage-users':
      alert('Feature coming soon: Manage all users (students, instructors, admins)');
      break;
    case 'manage-all-courses':
      alert('Feature coming soon: Oversee all courses in the platform');
      break;
    case 'view-analytics':
      alert('Feature coming soon: View enrollment statistics and platform analytics');
      break;
    case 'system-settings':
      alert('Feature coming soon: Configure platform settings');
      break;
    default:
      alert('Feature coming soon');
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
    window.componentLoader.onComponentsLoaded(function () {
      console.log("Components loaded, initializing dashboard...");
      initializeDashboard();
    });
  } else {
    // Fallback if component loader is not available
    console.log("Component loader not available, initializing dashboard directly...");
    initializeDashboard();
  }
});
