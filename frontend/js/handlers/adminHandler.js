// Admin Action Handler Module
export class AdminHandler {
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
      const { getToken, getUser, redirectToLogin } =
        window.dashboardUtils || {};

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
    const main = document.querySelector("main.dashboard-content");

    // Hide the admin dashboard when entering user management
    const adminDashboard = document.getElementById("adminDashboard");
    if (adminDashboard) {
      adminDashboard.style.display = "none";
    }

    // Create user management container
    const userManagementDiv = document.createElement("div");
    userManagementDiv.id = "userManagement";
    userManagementDiv.className = "role-dashboard";

    userManagementDiv.innerHTML = `
      <div class="user-management-header">
        <h2>User Management</h2>
        <div class="user-actions">
          <button id="backToDashboard" class="btn-secondary">← Back</button>
          <button id="createUserBtn" class="btn-primary">+ Add User</button>
        </div>
      </div>

      <!-- Filters and Sorting -->
      <div class="user-filters">
        <div class="filter-group">
          <label for="roleFilter">Filter by Role:</label>
          <select id="roleFilter" class="filter-select">
            <option value="">All Roles</option>
            <option value="student">Student</option>
            <option value="instructor">Instructor</option>
            <option value="admin">Admin</option>
          </select>
        </div>
        <div class="filter-group">
          <label for="statusFilter">Filter by Status:</label>
          <select id="statusFilter" class="filter-select">
            <option value="">All Status</option>
            <option value="active">Active</option>
            <option value="inactive">Inactive</option>
          </select>
        </div>
        <div class="filter-group">
          <label for="sortBy">Sort by:</label>
          <select id="sortBy" class="filter-select">
            <option value="name">Name</option>
            <option value="email">Email</option>
            <option value="role">Role</option>
            <option value="created">Created Date</option>
          </select>
        </div>
        <div class="filter-group">
          <label for="sortOrder">Order:</label>
          <select id="sortOrder" class="filter-select">
            <option value="asc">Ascending</option>
            <option value="desc">Descending</option>
          </select>
        </div>
        <div class="filter-group">
          <button id="clearFilters" class="btn-secondary">Clear Filters</button>
        </div>
      </div>

      <!-- Simple User Form -->
      <div id="userForm" class="user-form" style="display: none;">
        <h3 id="formTitle">Add User</h3>
        <form id="userFormElement">
          <div class="form-group">
            <label for="userFirstName">First Name *</label>
            <input type="text" id="userFirstName" name="firstName" required>
          </div>
          <div class="form-group">
            <label for="userLastName">Last Name *</label>
            <input type="text" id="userLastName" name="lastName" required>
          </div>
          <div class="form-group">
            <label for="userEmail">Email *</label>
            <input type="email" id="userEmail" name="email" required>
          </div>
          <div class="form-group">
            <label for="userRole">Role *</label>
            <select id="userRole" name="role" required>
              <option value="">Select Role</option>
              <option value="student">Student</option>
              <option value="instructor">Instructor</option>
              <option value="admin">Admin</option>
            </select>
          </div>
          <div class="form-group">
            <label for="userPassword">Password *</label>
            <input type="password" id="userPassword" name="password" required minlength="6">
          </div>
          <div class="form-actions">
            <button type="button" id="cancelForm" class="btn-secondary">Cancel</button>
            <button type="submit" id="saveForm" class="btn-primary">Save</button>
          </div>
        </form>
      </div>

      <!-- Simple Users List -->
      <div id="usersList">
        <div id="usersLoading" style="display: none;">Loading...</div>
        <div id="usersContainer"></div>
      </div>
    `;

    main.appendChild(userManagementDiv);
    this.setupUserManagementEventListeners();
    await this.loadUsers();
  }

  static setupUserManagementEventListeners() {
    const { getUser, showRoleDashboard } = window.dashboardUtils || {};

    // Back button
    document.getElementById("backToDashboard").addEventListener("click", () => {
      document.getElementById("userManagement").remove();

      // Show the admin dashboard again when going back
      const adminDashboard = document.getElementById("adminDashboard");
      if (adminDashboard) {
        adminDashboard.style.display = "block";
      }

      if (getUser && showRoleDashboard) {
        const user = getUser();
        showRoleDashboard(user);
      }
    });

    // Create user button
    document.getElementById("createUserBtn").addEventListener("click", () => {
      this.showUserForm();
    });

    // Cancel button
    document.getElementById("cancelForm").addEventListener("click", () => {
      this.hideUserForm();
    });

    // Form submission
    document
      .getElementById("userFormElement")
      .addEventListener("submit", async (e) => {
        e.preventDefault();
        await this.saveUser();
      });

    // Filter and sort event listeners
    document.getElementById("roleFilter").addEventListener("change", () => {
      this.filterAndSortUsers();
    });

    document.getElementById("statusFilter").addEventListener("change", () => {
      this.filterAndSortUsers();
    });

    document.getElementById("sortBy").addEventListener("change", () => {
      this.filterAndSortUsers();
    });

    document.getElementById("sortOrder").addEventListener("change", () => {
      this.filterAndSortUsers();
    });

    document.getElementById("clearFilters").addEventListener("click", () => {
      this.clearFilters();
    });
  }

  static showUserForm(user = null) {
    const form = document.getElementById("userForm");
    const formTitle = document.getElementById("formTitle");
    const formElement = document.getElementById("userFormElement");

    if (user) {
      formTitle.textContent = "Edit User";
      formElement.dataset.userId = user._id;
      document.getElementById("userFirstName").value = user.firstName || "";
      document.getElementById("userLastName").value = user.lastName || "";
      document.getElementById("userEmail").value = user.email || "";
      document.getElementById("userRole").value = user.role || "";
      document.getElementById("userPassword").required = false;
      document.getElementById("userPassword").placeholder =
        "Leave blank to keep current password";
    } else {
      formTitle.textContent = "Add User";
      formElement.removeAttribute("data-user-id");
      formElement.reset();
      document.getElementById("userPassword").required = true;
      document.getElementById("userPassword").placeholder = "";
    }

    form.style.display = "block";
  }

  static hideUserForm() {
    document.getElementById("userForm").style.display = "none";
    document.getElementById("userFormElement").reset();
  }

  static async loadUsers() {
    const loading = document.getElementById("usersLoading");
    const container = document.getElementById("usersContainer");

    try {
      loading.style.display = "block";

      const { getToken } = window.dashboardUtils || {};
      const token = getToken();

      // Get all users by setting a high limit
      const response = await fetch(
        "http://localhost:3761/api/users?limit=1000",
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );

      const data = await response.json();

      if (data.success && data.data) {
        // Store original users data for filtering
        this.originalUsers = data.data;
        this.totalUsers = data.pagination
          ? data.pagination.total
          : data.data.length;
        this.filterAndSortUsers();
      } else {
        container.innerHTML = "<p>Failed to load users.</p>";
      }
    } catch (error) {
      console.error("Error loading users:", error);
      container.innerHTML = "<p>Error loading users. Please try again.</p>";
    } finally {
      loading.style.display = "none";
    }
  }

  static filterAndSortUsers() {
    if (!this.originalUsers) return;

    let filteredUsers = [...this.originalUsers];

    // Apply role filter
    const roleFilter = document.getElementById("roleFilter").value;
    if (roleFilter) {
      filteredUsers = filteredUsers.filter((user) => user.role === roleFilter);
    }

    // Apply status filter
    const statusFilter = document.getElementById("statusFilter").value;
    if (statusFilter) {
      const isActive = statusFilter === "active";
      filteredUsers = filteredUsers.filter(
        (user) => user.isActive === isActive
      );
    }

    // Apply sorting
    const sortBy = document.getElementById("sortBy").value;
    const sortOrder = document.getElementById("sortOrder").value;

    filteredUsers.sort((a, b) => {
      let valueA, valueB;

      switch (sortBy) {
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
        return sortOrder === "asc" ? -1 : 1;
      }
      if (valueA > valueB) {
        return sortOrder === "asc" ? 1 : -1;
      }
      return 0;
    });

    this.displayUsers(filteredUsers);
  }

  static clearFilters() {
    document.getElementById("roleFilter").value = "";
    document.getElementById("statusFilter").value = "";
    document.getElementById("sortBy").value = "name";
    document.getElementById("sortOrder").value = "asc";
    this.filterAndSortUsers();
  }

  static displayUsers(users) {
    const container = document.getElementById("usersContainer");

    if (users.length === 0) {
      container.innerHTML = `
        <div class="empty-state">
          <h3>No Users Found</h3>
          <p>No users match the current filters. Try adjusting your search criteria.</p>
        </div>
      `;
      return;
    }

    // Add results count
    const totalUsers =
      this.totalUsers ||
      (this.originalUsers ? this.originalUsers.length : users.length);
    const resultsInfo =
      users.length !== totalUsers
        ? `<div class="results-info">Showing ${users.length} of ${totalUsers} users</div>`
        : `<div class="results-info">Showing all ${users.length} users</div>`;

    container.innerHTML =
      resultsInfo +
      users
        .map(
          (user) => `
        <div class="user-card" data-user-id="${user._id}">
          <div class="user-main-info">
            <div class="user-name-email">
              <h3>${user.firstName} ${user.lastName}</h3>
              <p class="user-email">${user.email}</p>
            </div>
            <div class="user-info">
              <span class="role ${user.role}">${user.role.toUpperCase()}</span>
              <span class="status ${user.isActive ? "active" : "inactive"}">
                ${user.isActive ? "Active" : "Inactive"}
              </span>
            </div>
          </div>
          <div class="user-actions">
            <button class="btn-edit" onclick="window.adminHandler.editUser('${
              user._id
            }')">Edit</button>
            <button class="btn-delete" onclick="window.adminHandler.deleteUser('${
              user._id
            }', '${user.firstName} ${user.lastName}')">Delete</button>
          </div>
        </div>
        `
        )
        .join("");
  }

  static async saveUser() {
    const form = document.getElementById("userFormElement");
    const formData = new FormData(form);
    const userId = form.dataset.userId;

    const userData = {
      firstName: formData.get("firstName").trim(),
      lastName: formData.get("lastName").trim(),
      email: formData.get("email").trim(),
      role: formData.get("role"),
    };

    // Only include password if it's provided
    const password = formData.get("password");
    if (password) {
      userData.password = password;
    }

    try {
      const { getToken } = window.dashboardUtils || {};
      const token = getToken();

      const url = userId
        ? `http://localhost:3761/api/users/${userId}`
        : "http://localhost:3761/api/users";
      const method = userId ? "PUT" : "POST";

      const response = await fetch(url, {
        method,
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(userData),
      });

      const data = await response.json();

      if (data.success) {
        alert(
          userId ? "User updated successfully!" : "User created successfully!"
        );
        this.hideUserForm();
        await this.loadUsers(); // This will reload and apply current filters
      } else {
        alert(`Error: ${data.message || "Failed to save user"}`);
      }
    } catch (error) {
      console.error("Error saving user:", error);
      alert("Error saving user. Please try again.");
    }
  }

  static async editUser(userId) {
    try {
      const { getToken } = window.dashboardUtils || {};
      const token = getToken();

      const response = await fetch(
        `http://localhost:3761/api/users/${userId}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );

      const data = await response.json();

      if (data.success && data.data) {
        this.showUserForm(data.data);
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
      const { getToken } = window.dashboardUtils || {};
      const token = getToken();

      const response = await fetch(
        `http://localhost:3761/api/users/${userId}`,
        {
          method: "DELETE",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );

      const data = await response.json();

      if (data.success) {
        alert("User deleted successfully!");
        await this.loadUsers(); // This will reload and apply current filters
      } else {
        alert(`Error: ${data.message || "Failed to delete user"}`);
      }
    } catch (error) {
      console.error("Error deleting user:", error);
      alert("Error deleting user. Please try again.");
    }
  }

  static async viewAnalytics() {
    try {
      // Get helper functions from global scope
      const { getToken, getUser, redirectToLogin } =
        window.dashboardUtils || {};

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

      // Clear current content and create analytics interface
      await this.createAdminAnalyticsInterface();
    } catch (error) {
      console.error("Error in viewAnalytics:", error);
      alert("Error loading analytics. Please try again.");
    }
  }

  static async createAdminAnalyticsInterface() {
    const main = document.querySelector("main.dashboard-content");

    // Hide the admin dashboard when entering analytics
    const adminDashboard = document.getElementById("adminDashboard");
    if (adminDashboard) {
      adminDashboard.style.display = "none";
    }

    // Create analytics container
    const analyticsDiv = document.createElement("div");
    analyticsDiv.id = "adminAnalytics";
    analyticsDiv.className = "role-dashboard";

    analyticsDiv.innerHTML = `
      <div class="analytics-header">
        <h2>🏢 Platform Analytics Dashboard</h2>
        <div class="analytics-actions">
          <button id="backToDashboardFromAnalytics" class="btn-secondary">← Back</button>
          <button id="refreshAnalytics" class="btn-primary">🔄 Refresh Data</button>
        </div>
      </div>

      <!-- Loading State -->
      <div id="analyticsLoading" class="loading-state" style="display: none;">
        <div class="loading-spinner">📊</div>
        <p>Loading platform analytics...</p>
      </div>

      <!-- Analytics Content -->
      <div id="analyticsContent" class="analytics-content">
        
        <!-- 1. System Overview -->
        <section class="analytics-section">
          <h3>📈 System Overview</h3>
          <div class="overview-cards">
            <div class="analytics-card">
              <div class="card-icon">👥</div>
              <div class="card-content">
                <h4 id="totalUsers">-</h4>
                <p>Total Users</p>
                <small id="userGrowth">-</small>
              </div>
            </div>
            <div class="analytics-card">
              <div class="card-icon">👨‍🎓</div>
              <div class="card-content">
                <h4 id="totalStudents">-</h4>
                <p>Students</p>
              </div>
            </div>
            <div class="analytics-card">
              <div class="card-icon">👨‍🏫</div>
              <div class="card-content">
                <h4 id="totalInstructors">-</h4>
                <p>Instructors</p>
              </div>
            </div>
            <div class="analytics-card">
              <div class="card-icon">⚡</div>
              <div class="card-content">
                <h4 id="activeUsers">-</h4>
                <p>Active Users (30d)</p>
              </div>
            </div>
            <div class="analytics-card">
              <div class="card-icon">📚</div>
              <div class="card-content">
                <h4 id="totalCourses">-</h4>
                <p>Total Courses</p>
                <small id="courseGrowth">-</small>
              </div>
            </div>
            <div class="analytics-card">
              <div class="card-icon">💰</div>
              <div class="card-content">
                <h4 id="totalRevenue">-</h4>
                <p>Total Revenue</p>
                <small id="revenueGrowth">-</small>
              </div>
            </div>
          </div>
        </section>

        <!-- 2. User Management Analytics -->
        <section class="analytics-section">
          <h3>👥 User Management Analytics</h3>
          <div class="chart-grid">
            <div class="chart-container">
              <h4>User Role Distribution</h4>
              <canvas id="userRoleChart" width="400" height="200"></canvas>
            </div>
            <div class="chart-container">
              <h4>Account Status Distribution</h4>
              <canvas id="userStatusChart" width="400" height="200"></canvas>
            </div>
          </div>
          <div class="chart-grid">
            <div class="chart-container">
              <h4>User Registration Trend (Last 12 Months)</h4>
              <canvas id="userRegistrationChart" width="800" height="300"></canvas>
            </div>
          </div>
        </section>

        <!-- 3. Course & Content Analytics -->
        <section class="analytics-section">
          <h3>📚 Course & Content Analytics</h3>
          <div class="chart-grid">
            <div class="chart-container">
              <h4>Course Category Distribution</h4>
              <canvas id="courseCategoryChart" width="400" height="200"></canvas>
            </div>
            <div class="chart-container">
              <h4>Course Completion Rates</h4>
              <canvas id="courseCompletionChart" width="400" height="200"></canvas>
            </div>
          </div>
          
          <!-- Popular Courses Table -->
          <div class="table-container">
            <h4>Most Popular Courses</h4>
            <table id="popularCoursesTable" class="analytics-table">
              <thead>
                <tr>
                  <th>Course</th>
                  <th>Instructor</th>
                  <th>Enrollments</th>
                  <th>Completion Rate</th>
                  <th>Revenue</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                <!-- Data will be populated here -->
              </tbody>
            </table>
          </div>

          <!-- Instructor Performance -->
          <div class="table-container">
            <h4>Top Performing Instructors</h4>
            <table id="instructorPerformanceTable" class="analytics-table">
              <thead>
                <tr>
                  <th>Instructor</th>
                  <th>Courses</th>
                  <th>Total Students</th>
                  <th>Avg Completion Rate</th>
                  <th>Total Revenue</th>
                  <th>Rating</th>
                </tr>
              </thead>
              <tbody>
                <!-- Data will be populated here -->
              </tbody>
            </table>
          </div>
        </section>

        <!-- 4. Financial Analytics -->
        <section class="analytics-section">
          <h3>💰 Financial Analytics</h3>
          <div class="chart-grid">
            <div class="chart-container">
              <h4>Revenue Trend (Last 12 Months)</h4>
              <canvas id="revenueTrendChart" width="800" height="300"></canvas>
            </div>
          </div>
          <div class="chart-grid">
            <div class="chart-container">
              <h4>Revenue by Course</h4>
              <canvas id="courseRevenueChart" width="400" height="200"></canvas>
            </div>
            <div class="chart-container">
              <h4>Revenue by Instructor</h4>
              <canvas id="instructorRevenueChart" width="400" height="200"></canvas>
            </div>
          </div>
          
          <!-- Financial Summary -->
          <div class="financial-summary">
            <div class="summary-cards">
              <div class="summary-card">
                <h4>Monthly Revenue</h4>
                <p id="monthlyRevenue">$0</p>
                <small id="monthlyGrowth">-</small>
              </div>
              <div class="summary-card">
                <h4>Average Course Price</h4>
                <p id="avgCoursePrice">$0</p>
                <small id="priceGrowth">-</small>
              </div>
              <div class="summary-card">
                <h4>Revenue per User</h4>
                <p id="revenuePerUser">$0</p>
              </div>
              <div class="summary-card">
                <h4>Total Transactions</h4>
                <p id="totalTransactions">0</p>
              </div>
            </div>
          </div>
        </section>

      </div>
    `;

    main.appendChild(analyticsDiv);
    this.setupAdminAnalyticsEventListeners();
    await this.loadAdminAnalyticsData();
  }

  static setupAdminAnalyticsEventListeners() {
    const { getUser, showRoleDashboard } = window.dashboardUtils || {};

    // Back button
    document
      .getElementById("backToDashboardFromAnalytics")
      .addEventListener("click", () => {
        document.getElementById("adminAnalytics").remove();

        // Show the admin dashboard again when going back
        const adminDashboard = document.getElementById("adminDashboard");
        if (adminDashboard) {
          adminDashboard.style.display = "block";
        }

        if (getUser && showRoleDashboard) {
          const user = getUser();
          showRoleDashboard(user);
        }
      });

    // Refresh button
    document
      .getElementById("refreshAnalytics")
      .addEventListener("click", async () => {
        await this.loadAdminAnalyticsData();
      });
  }

  static async loadAdminAnalyticsData() {
    const loading = document.getElementById("analyticsLoading");
    const content = document.getElementById("analyticsContent");

    try {
      loading.style.display = "block";
      content.style.display = "none";

      const { getToken } = window.dashboardUtils || {};
      const token = getToken();

      // Load all analytics data in parallel
      const [
        overviewResponse,
        userAnalyticsResponse,
        courseAnalyticsResponse,
        financialAnalyticsResponse,
        instructorPerformanceResponse,
      ] = await Promise.all([
        fetch("http://localhost:3761/api/analytics/admin/overview", {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }),
        fetch("http://localhost:3761/api/analytics/admin/users", {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }),
        fetch("http://localhost:3761/api/analytics/admin/courses", {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }),
        fetch("http://localhost:3761/api/analytics/admin/financial", {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }),
        fetch(
          "http://localhost:3761/api/analytics/admin/instructor-performance",
          {
            headers: {
              Authorization: `Bearer ${token}`,
              "Content-Type": "application/json",
            },
          }
        ),
      ]);

      const overviewData = await overviewResponse.json();
      const userAnalyticsData = await userAnalyticsResponse.json();
      const courseAnalyticsData = await courseAnalyticsResponse.json();
      const financialAnalyticsData = await financialAnalyticsResponse.json();
      const instructorPerformanceData =
        await instructorPerformanceResponse.json();

      if (
        overviewData.success &&
        userAnalyticsData.success &&
        courseAnalyticsData.success &&
        financialAnalyticsData.success &&
        instructorPerformanceData.success
      ) {
        await this.populateAdminAnalytics(
          overviewData.data,
          userAnalyticsData.data,
          courseAnalyticsData.data,
          financialAnalyticsData.data,
          instructorPerformanceData.data
        );
      } else {
        throw new Error("Failed to load analytics data");
      }
    } catch (error) {
      console.error("Error loading admin analytics:", error);
      content.innerHTML = `
        <div class="error-state">
          <h3>⚠️ Error Loading Analytics</h3>
          <p>Unable to load analytics data. Please try again later.</p>
          <button onclick="window.adminHandler.loadAdminAnalyticsData()" class="btn-primary">Retry</button>
        </div>
      `;
    } finally {
      loading.style.display = "none";
      content.style.display = "block";
    }
  }

  static async populateAdminAnalytics(
    overviewData,
    userAnalytics,
    courseAnalytics,
    financialAnalytics,
    instructorPerformance
  ) {
    // 1. Populate System Overview
    this.populateSystemOverview(overviewData);

    // 2. Create User Management Charts
    this.createUserAnalyticsCharts(userAnalytics);

    // 3. Create Course Analytics Charts and Tables
    this.createCourseAnalyticsCharts(courseAnalytics);

    // 4. Create Financial Analytics
    this.createFinancialAnalytics(financialAnalytics);

    // 5. Populate instructor performance table
    this.populateInstructorPerformanceTable(instructorPerformance);
  }

  static populateSystemOverview(overviewData) {
    // Update overview cards with structured data
    document.getElementById("totalUsers").textContent =
      overviewData.users.total;
    document.getElementById("totalStudents").textContent =
      overviewData.users.total - overviewData.users.total; // Will be corrected with proper user breakdown
    document.getElementById("totalInstructors").textContent = "N/A"; // Will be populated from user analytics
    document.getElementById("activeUsers").textContent =
      overviewData.users.active;
    document.getElementById("totalCourses").textContent =
      overviewData.courses.total;
    document.getElementById(
      "totalRevenue"
    ).textContent = `$${overviewData.revenue.total.toFixed(2)}`;

    // Growth indicators
    document.getElementById(
      "userGrowth"
    ).textContent = `📈 +${overviewData.users.growthRate}% this month`;
    document.getElementById(
      "courseGrowth"
    ).textContent = `📈 +${overviewData.courses.growthRate}% this month`;
    document.getElementById(
      "revenueGrowth"
    ).textContent = `📈 +${overviewData.revenue.monthlyGrowthRate}% this month`;
  }

  static createUserAnalyticsCharts(userAnalytics) {
    // User Role Distribution (Pie Chart)
    const roleCtx = document.getElementById("userRoleChart").getContext("2d");
    const roleData = userAnalytics.roleDistribution;

    this.createSimplePieChart(roleCtx, {
      labels: roleData.map(
        (item) => item._id.charAt(0).toUpperCase() + item._id.slice(1) + "s"
      ),
      data: roleData.map((item) => item.count),
      colors: ["#4CAF50", "#2196F3", "#FF9800"],
      title: "User Roles",
    });

    // User Status Distribution (Pie Chart)
    const statusCtx = document
      .getElementById("userStatusChart")
      .getContext("2d");
    const statusData = userAnalytics.statusDistribution;

    this.createSimplePieChart(statusCtx, {
      labels: statusData.map(
        (item) => item._id.charAt(0).toUpperCase() + item._id.slice(1)
      ),
      data: statusData.map((item) => item.count),
      colors: ["#4CAF50", "#F44336"],
      title: "Account Status",
    });

    // User Registration Trend (Line Chart)
    const registrationCtx = document
      .getElementById("userRegistrationChart")
      .getContext("2d");
    const monthlyData = userAnalytics.monthlyRegistrations;

    this.createSimpleLineChart(registrationCtx, {
      labels: monthlyData.map(
        (item) => `${item._id.year}-${String(item._id.month).padStart(2, "0")}`
      ),
      data: monthlyData.map((item) => item.count),
      title: "User Registrations",
    });

    // Update user counts in overview
    const students =
      roleData.find((item) => item._id === "student")?.count || 0;
    const instructors =
      roleData.find((item) => item._id === "instructor")?.count || 0;
    document.getElementById("totalStudents").textContent = students;
    document.getElementById("totalInstructors").textContent = instructors;
  }

  static createCourseAnalyticsCharts(courseAnalytics) {
    // Course Category Distribution
    const categoryCtx = document
      .getElementById("courseCategoryChart")
      .getContext("2d");
    const categoryData = courseAnalytics.categoryDistribution;

    this.createSimplePieChart(categoryCtx, {
      labels: categoryData.map((item) => item._id || "Other"),
      data: categoryData.map((item) => item.count),
      colors: ["#FF6384", "#36A2EB", "#FFCE56", "#4BC0C0", "#9966FF"],
      title: "Course Categories",
    });

    // Course Completion Rates - using level distribution as a proxy
    const completionCtx = document
      .getElementById("courseCompletionChart")
      .getContext("2d");
    const levelData = courseAnalytics.levelDistribution;

    this.createSimpleBarChart(completionCtx, {
      labels: levelData.map((item) => item._id || "Other"),
      data: levelData.map((item) => item.count),
      title: "Course Level Distribution",
    });

    // Popular Courses Table
    this.populatePopularCoursesTable(courseAnalytics.popularCourses);
  }

  static createFinancialAnalytics(financialAnalytics) {
    // Revenue Trend
    const revenueTrendCtx = document
      .getElementById("revenueTrendChart")
      .getContext("2d");
    const monthlyData = financialAnalytics.monthlyRevenue;

    this.createSimpleLineChart(revenueTrendCtx, {
      labels: monthlyData.map(
        (item) => `${item._id.year}-${String(item._id.month).padStart(2, "0")}`
      ),
      data: monthlyData.map((item) => item.revenue),
      title: "Monthly Revenue ($)",
    });

    // Revenue by Course (Top 10)
    const courseRevenueCtx = document
      .getElementById("courseRevenueChart")
      .getContext("2d");
    const courseRevenues = financialAnalytics.courseRevenue.slice(0, 10);

    this.createSimpleBarChart(courseRevenueCtx, {
      labels: courseRevenues.map((course) =>
        course.title.length > 20
          ? course.title.substring(0, 20) + "..."
          : course.title
      ),
      data: courseRevenues.map((course) => course.revenue),
      title: "Top Course Revenues ($)",
    });

    // Revenue by Instructor
    const instructorRevenueCtx = document
      .getElementById("instructorRevenueChart")
      .getContext("2d");
    const instructorRevenues = financialAnalytics.instructorRevenue.slice(
      0,
      10
    );

    this.createSimpleBarChart(instructorRevenueCtx, {
      labels: instructorRevenues.map((instructor) =>
        instructor.instructorName && instructor.instructorName.length > 15
          ? instructor.instructorName.substring(0, 15) + "..."
          : instructor.instructorName || "Unknown"
      ),
      data: instructorRevenues.map((instructor) => instructor.totalRevenue),
      title: "Top Instructor Revenues ($)",
    });

    // Financial Summary
    this.populateFinancialSummary(financialAnalytics.summary);
  }

  // Chart Creation Functions

  static populatePopularCoursesTable(popularCourses) {
    const tbody = document.querySelector("#popularCoursesTable tbody");
    tbody.innerHTML = "";

    popularCourses.forEach((course) => {
      const row = tbody.insertRow();
      row.innerHTML = `
        <td>${course.title}</td>
        <td>${course.instructorName || "Unknown"}</td>
        <td>${course.enrollmentCount}</td>
        <td>${course.completionRate.toFixed(1)}%</td>
        <td>$${course.revenue.toFixed(2)}</td>
        <td><span class="status ${course.isActive ? "active" : "inactive"}">${
        course.isActive ? "Active" : "Inactive"
      }</span></td>
      `;
    });
  }

  static populateInstructorPerformanceTable(instructorPerformance) {
    const tbody = document.querySelector("#instructorPerformanceTable tbody");
    tbody.innerHTML = "";

    instructorPerformance.forEach((instructor) => {
      const row = tbody.insertRow();
      row.innerHTML = `
        <td>${instructor.instructorName}</td>
        <td>${instructor.totalCourses}</td>
        <td>${instructor.totalStudents}</td>
        <td>${instructor.avgCompletionRate.toFixed(1)}%</td>
        <td>$${instructor.totalRevenue.toFixed(2)}</td>
        <td>⭐ ${instructor.rating.toFixed(1)}</td>
      `;
    });
  }

  static populateFinancialSummary(financialSummary) {
    document.getElementById(
      "monthlyRevenue"
    ).textContent = `$${financialSummary.monthly.toFixed(2)}`;
    document.getElementById(
      "avgCoursePrice"
    ).textContent = `$${financialSummary.averageCoursePrice.toFixed(2)}`;
    document.getElementById(
      "revenuePerUser"
    ).textContent = `$${financialSummary.revenuePerUser.toFixed(2)}`;
    document.getElementById("totalTransactions").textContent =
      financialSummary.transactions;

    document.getElementById(
      "monthlyGrowth"
    ).textContent = `📈 +${financialSummary.monthlyGrowthRate}% vs last month`;
    document.getElementById("priceGrowth").textContent = "📈 +5% vs last month";
  }

  // Simple Chart Creation Functions
  static createSimplePieChart(ctx, { labels, data, colors, title }) {
    const canvas = ctx.canvas;
    const width = canvas.width;
    const height = canvas.height;
    const centerX = width / 2;
    const centerY = height / 2;
    const radius = Math.min(width, height) / 3;

    ctx.clearRect(0, 0, width, height);

    const total = data.reduce((sum, val) => sum + val, 0);
    let currentAngle = -Math.PI / 2;

    const defaultColors = [
      "#FF6384",
      "#36A2EB",
      "#FFCE56",
      "#4BC0C0",
      "#9966FF",
      "#FF9F40",
    ];
    const chartColors = colors || defaultColors;

    data.forEach((value, index) => {
      const sliceAngle = (value / total) * 2 * Math.PI;

      ctx.beginPath();
      ctx.arc(
        centerX,
        centerY,
        radius,
        currentAngle,
        currentAngle + sliceAngle
      );
      ctx.lineTo(centerX, centerY);
      ctx.fillStyle = chartColors[index % chartColors.length];
      ctx.fill();
      ctx.strokeStyle = "#fff";
      ctx.lineWidth = 2;
      ctx.stroke();

      currentAngle += sliceAngle;
    });

    // Draw legend
    const legendY = height - 60;
    labels.forEach((label, index) => {
      const legendX = 10 + index * 120;
      if (legendX < width - 100) {
        ctx.fillStyle = chartColors[index % chartColors.length];
        ctx.fillRect(legendX, legendY, 15, 15);
        ctx.fillStyle = "#333";
        ctx.font = "12px Arial";
        ctx.fillText(label, legendX + 20, legendY + 12);
      }
    });
  }

  static createSimpleBarChart(ctx, { labels, data, title }) {
    const canvas = ctx.canvas;
    const width = canvas.width;
    const height = canvas.height;
    const padding = 60;
    const chartWidth = width - 2 * padding;
    const chartHeight = height - 2 * padding;

    ctx.clearRect(0, 0, width, height);

    if (data.length === 0) return;

    const maxValue = Math.max(...data);
    const barWidth = (chartWidth / data.length) * 0.8;
    const barSpacing = (chartWidth / data.length) * 0.2;

    ctx.fillStyle = "#4CAF50";
    data.forEach((value, index) => {
      const barHeight = (value / maxValue) * chartHeight;
      const x = padding + index * (barWidth + barSpacing);
      const y = height - padding - barHeight;

      ctx.fillRect(x, y, barWidth, barHeight);

      // Draw value on top of bar
      ctx.fillStyle = "#333";
      ctx.font = "10px Arial";
      ctx.textAlign = "center";
      ctx.fillText(value.toString(), x + barWidth / 2, y - 5);

      // Draw label
      ctx.save();
      ctx.translate(x + barWidth / 2, height - padding + 15);
      ctx.rotate(-Math.PI / 6);
      ctx.fillText(labels[index], 0, 0);
      ctx.restore();

      ctx.fillStyle = "#4CAF50";
    });
  }

  static createSimpleLineChart(ctx, { labels, data, title }) {
    const canvas = ctx.canvas;
    const width = canvas.width;
    const height = canvas.height;
    const padding = 60;
    const chartWidth = width - 2 * padding;
    const chartHeight = height - 2 * padding;

    ctx.clearRect(0, 0, width, height);

    if (data.length === 0) return;

    const maxValue = Math.max(...data);
    const minValue = Math.min(...data);
    const valueRange = maxValue - minValue || 1;

    // Draw line
    ctx.beginPath();
    ctx.strokeStyle = "#2196F3";
    ctx.lineWidth = 3;

    data.forEach((value, index) => {
      const x = padding + (index / (data.length - 1)) * chartWidth;
      const y =
        height - padding - ((value - minValue) / valueRange) * chartHeight;

      if (index === 0) {
        ctx.moveTo(x, y);
      } else {
        ctx.lineTo(x, y);
      }
    });
    ctx.stroke();

    // Draw points
    ctx.fillStyle = "#2196F3";
    data.forEach((value, index) => {
      const x = padding + (index / (data.length - 1)) * chartWidth;
      const y =
        height - padding - ((value - minValue) / valueRange) * chartHeight;

      ctx.beginPath();
      ctx.arc(x, y, 4, 0, 2 * Math.PI);
      ctx.fill();
    });

    // Draw labels
    ctx.fillStyle = "#333";
    ctx.font = "10px Arial";
    ctx.textAlign = "center";
    labels.forEach((label, index) => {
      const x = padding + (index / (labels.length - 1)) * chartWidth;
      ctx.save();
      ctx.translate(x, height - padding + 15);
      ctx.rotate(-Math.PI / 6);
      ctx.fillText(label, 0, 0);
      ctx.restore();
    });
  }

  static showFeatureComingSoon() {
    alert("Feature coming soon");
  }
}
