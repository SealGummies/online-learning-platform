// Admin Action Handler Module - Refactored Version
import { AnalyticsService } from "../services/AnalyticsService.js";
import { UserService } from "../services/UserService.js";
import { DOMUtils } from "../utils/DOMUtils.js";
import { ValidationUtils } from "../utils/ValidationUtils.js";
import { AnalyticsView } from "../views/AnalyticsView.js";
import { UserManagementView } from "../views/UserManagementView.js";

export class AdminHandler {
  // Store original users data for filtering
  static originalUsers = null;
  static totalUsers = 0;

  static handleAction(action) {
    switch (action) {
      case "manage-users":
        this.manageUsers();
        break;
      case "view-analytics":
        this.viewAnalytics();
        break;
      default:
        this.showFeatureComingSoon();
    }
  }

  static manageUsers() {
    this.showUserManagement();
  }

  static async showUserManagement() {
    try {
      // Get helper functions from global scope
      const { getToken, getUser, redirectToLogin } = window.dashboardUtils || {};

      if (!getToken || !getUser || !redirectToLogin) {
        console.error("Dashboard utilities not available");
        return;
      }

      // Check authentication first
      const token = getToken();
      if (!token) {
        redirectToLogin();
        return;
      }

      // Clear current content and create user management interface
      await this.createUserManagementInterface();
    } catch (error) {
      console.error("Error in showUserManagement:", error);
      alert("Error loading user management. Please try again.");
    }
  }

  static async createUserManagementInterface() {
    const main = DOMUtils.getMainContent();

    // Hide the admin dashboard when entering user management
    DOMUtils.toggleElementDisplay("adminDashboard", false);

    // Create user management interface
    const userManagementDiv = UserManagementView.createInterface();
    main.appendChild(userManagementDiv);

    this.setupUserManagementEventListeners();
    await this.loadUsers();
  }

  static setupUserManagementEventListeners() {
    const { getUser, showRoleDashboard } = window.dashboardUtils || {};

    // Back button
    DOMUtils.addEventListener("backToDashboard", "click", () => {
      DOMUtils.removeElement("userManagement");
      DOMUtils.toggleElementDisplay("adminDashboard", true);

      if (getUser && showRoleDashboard) {
        const user = getUser();
        showRoleDashboard(user);
      }
    });

    // Create user button
    DOMUtils.addEventListener("createUserBtn", "click", () => {
      UserManagementView.showUserForm();
    });

    // Cancel button
    DOMUtils.addEventListener("cancelForm", "click", () => {
      UserManagementView.hideUserForm();
    });

    // Form submission
    DOMUtils.addEventListener("userFormElement", "submit", async (e) => {
      e.preventDefault();
      await this.saveUser();
    });

    // Filter and sort event listeners
    DOMUtils.addEventListener("roleFilter", "change", () => {
      this.filterAndSortUsers();
    });

    DOMUtils.addEventListener("sortBy", "change", () => {
      this.filterAndSortUsers();
    });

    DOMUtils.addEventListener("sortOrder", "change", () => {
      this.filterAndSortUsers();
    });

    DOMUtils.addEventListener("clearFilters", "click", () => {
      this.clearFilters();
    });
  }

  static async loadUsers() {
    try {
      UserManagementView.showLoading(true);

      const data = await UserService.loadUsers(1000);

      if (data.success && data.data) {
        // Store original users data for filtering
        this.originalUsers = data.data;
        this.totalUsers = data.pagination ? data.pagination.total : data.data.length;
        this.filterAndSortUsers();
      } else {
        UserManagementView.showError("Failed to load users.");
      }
    } catch (error) {
      console.error("Error loading users:", error);
      UserManagementView.showError("Error loading users. Please try again.");
    } finally {
      UserManagementView.showLoading(false);
    }
  }

  static filterAndSortUsers() {
    if (!this.originalUsers) return;

    let filteredUsers = [...this.originalUsers];
    const filters = UserManagementView.getFilterValues();

    // Apply role filter
    if (filters.role) {
      filteredUsers = filteredUsers.filter((user) => user.role === filters.role);
    }

    // Apply sorting
    filteredUsers.sort((a, b) => {
      let valueA, valueB;

      switch (filters.sortBy) {
        case "name":
          valueA = `${a.firstName} ${a.lastName}`.toLowerCase();
          valueB = `${b.firstName} ${b.lastName}`.toLowerCase();
          break;
        case "email":
          valueA = a.email.toLowerCase();
          valueB = b.email.toLowerCase();
          break;
        case "role":
          valueA = a.role.toLowerCase();
          valueB = b.role.toLowerCase();
          break;
        case "created":
          valueA = new Date(a.createdAt || 0);
          valueB = new Date(b.createdAt || 0);
          break;
        default:
          valueA = `${a.firstName} ${a.lastName}`.toLowerCase();
          valueB = `${b.firstName} ${b.lastName}`.toLowerCase();
      }

      if (valueA < valueB) {
        return filters.sortOrder === "asc" ? -1 : 1;
      }
      if (valueA > valueB) {
        return filters.sortOrder === "asc" ? 1 : -1;
      }
      return 0;
    });

    UserManagementView.displayUsers(filteredUsers, this.totalUsers);
  }

  static clearFilters() {
    UserManagementView.clearFilters();
    this.filterAndSortUsers();
  }

  static async saveUser() {
    try {
      const userData = ValidationUtils.extractFormData("userFormElement");
      const formElement = DOMUtils.getElementById("userFormElement");
      const userId = formElement.dataset.userId;

      // Validate user data
      const validation = ValidationUtils.validateUserData(userData);
      if (!validation.isValid) {
        alert(`Validation Error:\n${validation.errors.join("\n")}`);
        return;
      }

      let response;
      if (userId) {
        response = await UserService.updateUser(userId, userData);
      } else {
        response = await UserService.createUser(userData);
      }

      if (response.success) {
        alert(userId ? "User updated successfully!" : "User created successfully!");
        UserManagementView.hideUserForm();
        await this.loadUsers();
      } else {
        alert(`Error: ${response.message || "Failed to save user"}`);
      }
    } catch (error) {
      console.error("Error saving user:", error);
      alert("Error saving user. Please try again.");
    }
  }

  static async editUser(userId) {
    try {
      const response = await UserService.getUserById(userId);

      if (response.success && response.data) {
        UserManagementView.showUserForm(response.data);
      } else {
        alert("Error loading user details");
      }
    } catch (error) {
      console.error("Error loading user:", error);
      alert("Error loading user details");
    }
  }

  static async deleteUser(userId, userName) {
    if (!confirm(`Delete "${userName}"? This cannot be undone.`)) {
      return;
    }

    try {
      const response = await UserService.deleteUser(userId);

      if (response.success) {
        alert("User deleted successfully!");
        await this.loadUsers();
      } else {
        alert(`Error: ${response.message || "Failed to delete user"}`);
      }
    } catch (error) {
      console.error("Error deleting user:", error);
      alert("Error deleting user. Please try again.");
    }
  }

  // Analytics Methods
  static async viewAnalytics() {
    try {
      // Get helper functions from global scope
      const { getToken, getUser, redirectToLogin } = window.dashboardUtils || {};

      if (!getToken || !getUser || !redirectToLogin) {
        console.error("Dashboard utilities not available");
        return;
      }

      // Check authentication first
      const token = getToken();
      if (!token) {
        redirectToLogin();
        return;
      }

      await this.createAnalyticsInterface();
    } catch (error) {
      console.error("Error in viewAnalytics:", error);
      alert("Error loading analytics. Please try again.");
    }
  }

  static async createAnalyticsInterface() {
    const main = DOMUtils.getMainContent();

    // Hide the admin dashboard when entering analytics
    DOMUtils.toggleElementDisplay("adminDashboard", false);

    // Create analytics interface
    const analyticsDiv = AnalyticsView.createInterface();
    main.appendChild(analyticsDiv);

    this.setupAnalyticsEventListeners();
    await this.loadAnalyticsData();
  }

  static setupAnalyticsEventListeners() {
    const { getUser, showRoleDashboard } = window.dashboardUtils || {};

    // Back button
    DOMUtils.addEventListener("backToDashboardFromAnalytics", "click", () => {
      DOMUtils.removeElement("adminAnalytics");
      DOMUtils.toggleElementDisplay("adminDashboard", true);

      if (getUser && showRoleDashboard) {
        const user = getUser();
        showRoleDashboard(user);
      }
    });

    // Refresh button
    DOMUtils.addEventListener("refreshAnalytics", "click", async () => {
      await this.loadAnalyticsData();
    });
  }

  static async loadAnalyticsData() {
    try {
      // Show loading state
      AnalyticsView.showLoading(true);

      // Load all analytics data in parallel
      const data = await AnalyticsService.loadAllAnalyticsData();

      if (data.overview && data.overview.success && data.overview.data) {
        AnalyticsView.populateSystemOverview(data.overview.data, data.topCourses?.data || []);
      }

      if (
        data.instructorAnalytics &&
        data.instructorAnalytics.success &&
        data.instructorAnalytics.data &&
        data.instructorAnalytics.data.length > 0
      ) {
        AnalyticsView.createUserAnalyticsCharts(data.overview?.data?.users || {}, data.instructorAnalytics.data);
      } else {
        // Show no data message in the user analytics charts
        AnalyticsView.showNoDataInUserCharts();
      }

      if (data.topCourses && data.topCourses.success && data.topCourses.data) {
        AnalyticsView.createCourseAnalyticsCharts(data.topCourses.data);
        AnalyticsView.populatePopularCoursesTable(data.topCourses.data);
      }

      if (data.instructorAnalytics && data.instructorAnalytics.success && data.instructorAnalytics.data) {
        AnalyticsView.populateInstructorPerformanceTable(data.instructorAnalytics.data);
      }

      if (
        data.topCourses &&
        data.topCourses.success &&
        data.topCourses.data &&
        data.overview &&
        data.overview.success &&
        data.overview.data
      ) {
        AnalyticsView.createFinancialAnalytics(data.topCourses.data, data.overview.data);
      }
    } catch (error) {
      console.error("Error loading analytics data:", error);
      AnalyticsView.showError("Failed to load analytics data. Please try again.");
    } finally {
      AnalyticsView.showLoading(false);
    }
  }

  // Feature coming soon placeholder
  static showFeatureComingSoon() {
    const main = DOMUtils.getMainContent();

    // Hide the admin dashboard
    DOMUtils.toggleElementDisplay("adminDashboard", false);

    const featureDiv = DOMUtils.createElement("div", {
      id: "featureComingSoon",
      className: "role-dashboard",
    });

    featureDiv.innerHTML = `
      <div class="feature-coming-soon">
        <h2>Feature Coming Soon</h2>
        <p>This feature is currently under development and will be available in a future update.</p>
        <button id="backFromFeature" class="btn-primary">← Back to Dashboard</button>
      </div>
    `;

    main.appendChild(featureDiv);

    // Setup back button
    DOMUtils.addEventListener("backFromFeature", "click", () => {
      const { getUser, showRoleDashboard } = window.dashboardUtils || {};

      DOMUtils.removeElement("featureComingSoon");
      DOMUtils.toggleElementDisplay("adminDashboard", true);

      if (getUser && showRoleDashboard) {
        const user = getUser();
        showRoleDashboard(user);
      }
    });
  }
}

// Make AdminHandler available globally for onclick handlers
window.adminHandler = AdminHandler;
