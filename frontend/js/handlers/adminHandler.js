// Admin Action Handler Module - Fixed Version
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
            <div class="user-info">
              <span class="role ${user.role}">${user.role.toUpperCase()}</span>
              <span class="status ${user.isActive ? "active" : "inactive"}">
                ${user.isActive ? "Active" : "Inactive"}
              </span>
            </div>
            <div class="user-name-email">
              <h3>${user.firstName} ${user.lastName}</h3>
              <p class="user-email">${user.email}</p>
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
              <canvas id="userRoleChart" width="700" height="250"></canvas>
            </div>
          </div>
          <div class="chart-grid">
            <div class="chart-container">
              <h4>User Registration Trend (Last 12 Months)</h4>
              <canvas id="userRegistrationChart" width="700" height="350"></canvas>
            </div>
          </div>
        </section>

        <!-- 3. Course & Content Analytics -->
        <section class="analytics-section">
          <h3>📚 Course & Content Analytics</h3>
          <div class="chart-grid">
            <div class="chart-container">
              <h4>Course Category Distribution</h4>
              <canvas id="courseCategoryChart" width="700" height="250"></canvas>
            </div>
            <div class="chart-container">
              <h4>Course Completion Rates</h4>
              <canvas id="courseCompletionChart" width="700" height="250"></canvas>
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
              <h4>Revenue by Course</h4>
              <canvas id="courseRevenueChart" width="700" height="250"></canvas>
            </div>
            <div class="chart-container">
              <h4>Revenue by Instructor</h4>
              <canvas id="instructorRevenueChart" width="700" height="250"></canvas>
            </div>
          </div>
          
          <!-- Financial Summary -->
          <div class="financial-summary">
            <h4>💰 Financial Summary</h4>
            <div class="summary-cards">
              <div class="summary-card revenue">
                <h4>Monthly Revenue</h4>
                <p id="monthlyRevenue">$0</p>
                <small id="monthlyGrowth">-</small>
              </div>
              <div class="summary-card price">
                <h4>Average Course Price</h4>
                <p id="avgCoursePrice">$0</p>
                <small id="priceGrowth">-</small>
              </div>
              <div class="summary-card users">
                <h4>Revenue per User</h4>
                <p id="revenuePerUser">$0</p>
              </div>
              <div class="summary-card transactions">
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
        instructorAnalyticsResponse,
        topCoursesResponse,
        studentProgressResponse,
        completionTrendsResponse,
        examPerformanceResponse,
      ] = await Promise.all([
        fetch("http://localhost:3761/api/analytics/platform-overview", {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }),
        fetch("http://localhost:3761/api/analytics/instructor-analytics", {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }),
        fetch("http://localhost:3761/api/analytics/top-courses", {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }),
        fetch("http://localhost:3761/api/analytics/student-progress", {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }),
        fetch("http://localhost:3761/api/analytics/completion-trends", {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }),
        fetch("http://localhost:3761/api/analytics/exam-performance", {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }),
      ]);

      const overviewData = await overviewResponse.json();
      const instructorAnalyticsData = await instructorAnalyticsResponse.json();
      const topCoursesData = await topCoursesResponse.json();
      const studentProgressData = await studentProgressResponse.json();
      const completionTrendsData = await completionTrendsResponse.json();
      const examPerformanceData = await examPerformanceResponse.json();

      if (
        overviewData.success &&
        instructorAnalyticsData.success &&
        topCoursesData.success &&
        studentProgressData.success &&
        completionTrendsData.success &&
        examPerformanceData.success
      ) {
        await this.populateAdminAnalytics(
          overviewData.data,
          instructorAnalyticsData.data,
          topCoursesData.data,
          studentProgressData.data,
          completionTrendsData.data,
          examPerformanceData.data
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
    instructorAnalytics,
    topCourses,
    studentProgress,
    completionTrends,
    examPerformance
  ) {
    // 1. Populate System Overview
    this.populateSystemOverview(overviewData, topCourses);

    // 2. Create User Management Charts (using actual user data)
    this.createUserAnalyticsCharts(overviewData.users, instructorAnalytics);

    // 3. Create Course Analytics Charts and Tables
    this.createCourseAnalyticsCharts(topCourses);

    // 4. Create Financial Analytics (using actual enrollment data)
    this.createFinancialAnalytics(completionTrends, topCourses, overviewData);

    // 5. Populate instructor performance table
    this.populateInstructorPerformanceTable(instructorAnalytics);
  }

  static populateSystemOverview(overviewData, topCourses) {
    // Update overview cards with actual platform overview data
    document.getElementById("totalUsers").textContent =
      overviewData.users.total;
    document.getElementById("totalStudents").textContent =
      overviewData.users.students;
    document.getElementById("totalInstructors").textContent =
      overviewData.users.instructors;
    document.getElementById("activeUsers").textContent =
      overviewData.enrollments.active;
    document.getElementById("totalCourses").textContent =
      overviewData.courses.total;

    // Calculate total revenue from top courses and their enrollments
    const totalRevenue = topCourses.reduce((sum, course) => {
      return sum + (course.price || 0) * (course.enrollmentCount || 0);
    }, 0);

    document.getElementById(
      "totalRevenue"
    ).textContent = `$${totalRevenue.toFixed(2)}`;

    // Growth indicators (using completion rate as proxy for growth)
    const completionRate = overviewData.enrollments.completionRate;
    document.getElementById(
      "userGrowth"
    ).textContent = `📈 ${completionRate}% completed`;
    document.getElementById(
      "courseGrowth"
    ).textContent = `📈 ${overviewData.courses.total} total courses`;
    document.getElementById(
      "revenueGrowth"
    ).textContent = `📈 ${overviewData.enrollments.completed} completed`;
  }

  static createUserAnalyticsCharts(userData, instructorAnalytics) {
    console.log("Creating user analytics charts with data:", {
      userData,
      instructorAnalytics,
    });

    // User Role Distribution (Pie Chart)
    const roleCtx = document.getElementById("userRoleChart").getContext("2d");

    // Create role distribution from actual user data - FIX: Format the data correctly
    const roleData = [
      { _id: "students", count: userData.students || 0 },
      { _id: "instructors", count: userData.instructors || 0 },
      { _id: "admins", count: userData.admins || 0 },
    ];

    console.log("Role data for pie chart:", roleData);

    // Only create chart if we have data
    if (roleData.some((item) => item.count > 0)) {
      this.createSimplePieChart(roleCtx, {
        labels: roleData.map(
          (item) => item._id.charAt(0).toUpperCase() + item._id.slice(1)
        ),
        data: roleData.map((item) => item.count),
        colors: ["#36A2EB", "#FF6384", "#FFCE56"],
        title: "User Roles",
      });
    } else {
      // Draw "No Data" message
      this.drawNoDataMessage(roleCtx, "No user data available");
    }

    // Instructor Enrollment Trend (Line Chart)
    const registrationCtx = document
      .getElementById("userRegistrationChart")
      .getContext("2d");

    // Create trend data from instructor analytics
    const trendData = instructorAnalytics.slice(0, 10).map((inst, index) => ({
      _id: { year: 2024, month: index + 1 },
      count: inst.totalEnrollments || 0,
    }));

    this.createSimpleLineChart(registrationCtx, {
      labels: trendData.map(
        (item) => `${item._id.year}-${String(item._id.month).padStart(2, "0")}`
      ),
      data: trendData.map((item) => item.count),
      title: "Instructor Enrollments",
    });
  }

  static createCourseAnalyticsCharts(topCourses) {
    console.log("Creating course analytics charts with data:", topCourses);

    // Course Category Distribution
    const categoryCtx = document
      .getElementById("courseCategoryChart")
      .getContext("2d");

    // Create category distribution from top courses based on enrollment count
    const categoryEnrollments = {};
    topCourses.forEach((course) => {
      // FIX: Handle empty or undefined categories
      const category =
        course.category && course.category.trim() ? course.category : "Other";
      categoryEnrollments[category] =
        (categoryEnrollments[category] || 0) + (course.enrollmentCount || 0);
    });

    let categoryData = Object.entries(categoryEnrollments).map(
      ([category, enrollments]) => ({
        _id: category,
        count: enrollments,
      })
    );

    // filter out items with count 0
    categoryData = categoryData.filter((item) => item.count > 0);

    console.log("Category data for pie chart:", categoryData);

    if (categoryData.length > 0) {
      this.createSimplePieChart(categoryCtx, {
        labels: categoryData.map((item) => item._id),
        data: categoryData.map((item) => item.count),
        colors: [
          "#FF6384",
          "#36A2EB",
          "#FFCE56",
          "#4BC0C0",
          "#9966FF",
          "#FF9F40",
        ],
        title: "Course Categories by Enrollment",
      });
    } else {
      this.drawNoDataMessage(categoryCtx, "No course data available");
    }

    // Course Completion Rates
    const completionCtx = document
      .getElementById("courseCompletionChart")
      .getContext("2d");

    // Create completion rate data from top courses and sort by rate from high to low
    const completionData = topCourses
      .map((course) => ({
        title: course.title,
        rate: course.completionRate || 0,
      }))
      .sort((a, b) => b.rate - a.rate)
      .slice(0, 10)
      .map((course) => ({
        _id: course.title.substring(0, 15) + "...",
        rate: course.rate,
      }));

    this.createSimpleBarChart(completionCtx, {
      labels: completionData.map((item) => item._id || "Other"),
      data: completionData.map((item) => item.rate),
      title: "Course Completion Rates (%)",
    });

    // Popular Courses Table
    this.populatePopularCoursesTable(topCourses);
  }

  static createFinancialAnalytics(
    completionTrends,
    topCourses = [],
    overviewData
  ) {
    // Course Revenue Distribution
    const courseRevenueCtx = document
      .getElementById("courseRevenueChart")
      .getContext("2d");

    // Calculate revenue and sort by revenue from high to low
    const courseRevenues = topCourses
      .map((course) => ({
        title: course.title,
        revenue: (course.price || 0) * (course.enrollmentCount || 0),
      }))
      .sort((a, b) => b.revenue - a.revenue)
      .slice(0, 10);

    this.createSimpleBarChart(courseRevenueCtx, {
      labels: courseRevenues.map((course) =>
        course.title.length > 20
          ? course.title.substring(0, 20) + "..."
          : course.title
      ),
      data: courseRevenues.map((course) => course.revenue),
      title: "Top Course Revenue ($)",
    });

    // Instructor Revenue Distribution
    const instructorRevenueCtx = document
      .getElementById("instructorRevenueChart")
      .getContext("2d");

    // Group revenue by instructor
    const instructorRevenues = {};
    topCourses.forEach((course) => {
      const instructor = course.instructorName || "Unknown";
      const revenue = (course.price || 0) * (course.enrollmentCount || 0);
      instructorRevenues[instructor] =
        (instructorRevenues[instructor] || 0) + revenue;
    });

    const topInstructors = Object.entries(instructorRevenues)
      .sort(([, a], [, b]) => b - a)
      .slice(0, 10)
      .map(([instructor, revenue]) => ({
        instructor: instructor,
        revenue: revenue,
      }));

    this.createSimpleBarChart(instructorRevenueCtx, {
      labels: topInstructors.map((inst) =>
        inst.instructor.length > 15
          ? inst.instructor.substring(0, 15) + "..."
          : inst.instructor
      ),
      data: topInstructors.map((inst) => inst.revenue),
      title: "Revenue by Instructor ($)",
    });

    // Financial Summary
    const totalRevenue = topCourses.reduce(
      (sum, course) =>
        sum + (course.price || 0) * (course.enrollmentCount || 0),
      0
    );
    const avgPrice =
      topCourses.reduce((sum, course) => sum + (course.price || 0), 0) /
        topCourses.length || 0;
    const totalEnrollments = topCourses.reduce(
      (sum, course) => sum + (course.enrollmentCount || 0),
      0
    );
    const revenuePerUser =
      overviewData.users.students > 0
        ? totalRevenue / overviewData.users.students
        : 0;

    this.populateFinancialSummary({
      monthly: totalRevenue / 12, // Assuming annual revenue divided by 12
      averageCoursePrice: avgPrice,
      revenuePerUser: revenuePerUser,
      transactions: totalEnrollments,
      monthlyGrowthRate: 15, // Placeholder
    });
  }

  // Chart Creation Functions (remain the same)

  static populatePopularCoursesTable(topCourses) {
    const tbody = document.querySelector("#popularCoursesTable tbody");
    tbody.innerHTML = "";

    topCourses.forEach((course) => {
      const row = tbody.insertRow();
      row.innerHTML = `
        <td>${course.title}</td>
        <td>${course.instructorName || "Unknown"}</td>
        <td>${course.enrollmentCount || 0}</td>
        <td>${
          course.completionRate ? course.completionRate.toFixed(1) + "%" : "N/A"
        }</td>
        <td>$${((course.price || 0) * (course.enrollmentCount || 0)).toFixed(
          2
        )}</td>
      `;
    });
  }

  static populateInstructorPerformanceTable(instructorAnalytics) {
    const tbody = document.querySelector("#instructorPerformanceTable tbody");
    tbody.innerHTML = "";

    instructorAnalytics.forEach((instructor) => {
      const row = tbody.insertRow();
      // FIX: Calculate revenue based on average enrollment and course price
      const estimatedRevenue = (instructor.totalEnrollments || 0) * 50; // Assuming avg price of $50
      row.innerHTML = `
        <td>${instructor.instructorName}</td>
        <td>${instructor.totalCourses || 0}</td>
        <td>${instructor.totalEnrollments || 0}</td>
        <td>${
          instructor.avgCompletionRate
            ? instructor.avgCompletionRate.toFixed(1) + "%"
            : "N/A"
        }</td>
        <td>$${estimatedRevenue.toFixed(2)}</td>
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

    // Add positive/negative class to growth indicators
    const monthlyGrowthEl = document.getElementById("monthlyGrowth");
    monthlyGrowthEl.textContent = `📈 +${financialSummary.monthlyGrowthRate}% vs last month`;
    monthlyGrowthEl.className = "positive";

    const priceGrowthEl = document.getElementById("priceGrowth");
    priceGrowthEl.textContent = "📈 +5% vs last month";
    priceGrowthEl.className = "positive";
  }

  // Improved Chart Creation Functions
  static createSimplePieChart(ctx, { labels, data, colors, title }) {
    const canvas = ctx.canvas;
    const width = canvas.width;
    const height = canvas.height;
    const centerX = width / 2;
    const centerY = height / 2 - 30;
    const radius = Math.min(width, height) / 3;

    ctx.clearRect(0, 0, width, height);

    // create indexed data array for sorting
    const indexedData = data.map((value, index) => ({
      value,
      label: labels[index],
      index,
    }));

    // sort by value from high to low
    indexedData.sort((a, b) => b.value - a.value);

    const total = data.reduce((sum, val) => sum + val, 0);
    let currentAngle = -Math.PI / 2;

    // expand default color array, ensure enough unique colors
    const defaultColors = [
      "#FF6384", // pink
      "#36A2EB", // blue
      "#FFCE56", // yellow
      "#4BC0C0", // cyan
      "#9966FF", // purple
      "#FF9F40", // orange
      "#43A047", // green
      "#D32F2F", // red
      "#8D6E63", // brown
      "#FBC02D", // gold
      "#0288D1", // dark blue
      "#7B1FA2", // dark purple
      "#00BCD4", // light cyan
      "#E91E63", // pink
      "#795548", // dark brown
      "#607D8B", // blue gray
      "#4CAF50", // light green
      "#FF5722", // dark orange
      "#3F51B5", // indigo
      "#009688", // blue green
    ];

    // if more colors are needed, generate additional colors
    const chartColors = colors || defaultColors;
    if (data.length > chartColors.length) {
      // generate additional colors by adjusting hue
      const additionalColors = [];
      const hueStep = 360 / (data.length - chartColors.length);
      for (let i = 0; i < data.length - chartColors.length; i++) {
        const hue = (i * hueStep) % 360;
        additionalColors.push(`hsl(${hue}, 70%, 50%)`);
      }
      chartColors.push(...additionalColors);
    }

    // draw pie chart sectors (in sorted order)
    indexedData.forEach((item, sortedIndex) => {
      const sliceAngle = (item.value / total) * 2 * Math.PI;

      ctx.beginPath();
      ctx.arc(
        centerX,
        centerY,
        radius,
        currentAngle,
        currentAngle + sliceAngle
      );
      ctx.lineTo(centerX, centerY);
      ctx.fillStyle = chartColors[sortedIndex]; // use sorted index
      ctx.fill();
      ctx.strokeStyle = "#fff";
      ctx.lineWidth = 2;
      ctx.stroke();

      currentAngle += sliceAngle;
    });

    // calculate legend layout
    ctx.font = "12px Arial";

    // first measure the actual width of each legend item
    const legendItems = indexedData.map((item) => {
      const percentage =
        total > 0 ? ((item.value / total) * 100).toFixed(1) : 0;
      const text = `${item.label} (${percentage}%)`;
      const textWidth = ctx.measureText(text).width;
      return {
        text,
        width: textWidth + 30, // 15px color block + 7px spacing + text width + 8px right margin
        item,
      };
    });

    // dynamically calculate the number of items that can be placed per row
    const maxWidth = width - 40; // left and right margin of 20px
    const legendItemHeight = 25;
    const legendLayout = [];
    let currentRow = [];
    let currentRowWidth = 0;

    legendItems.forEach((legendItem, index) => {
      if (
        currentRowWidth + legendItem.width > maxWidth &&
        currentRow.length > 0
      ) {
        // current row is full, start new row
        legendLayout.push(currentRow);
        currentRow = [legendItem];
        currentRowWidth = legendItem.width;
      } else {
        // add to current row
        currentRow.push(legendItem);
        currentRowWidth += legendItem.width;
      }
    });

    if (currentRow.length > 0) {
      legendLayout.push(currentRow);
    }

    // calculate legend start Y position
    const totalLegendHeight = legendLayout.length * legendItemHeight;
    const legendStartY = height - totalLegendHeight - 15;

    // draw legend
    legendLayout.forEach((row, rowIndex) => {
      // calculate total width of current row
      const rowWidth = row.reduce((sum, item) => sum + item.width, 0);
      // center align
      let currentX = (width - rowWidth) / 2;
      const currentY = legendStartY + rowIndex * legendItemHeight;

      row.forEach((legendItem, colIndex) => {
        const item = legendItem.item;
        const sortedIndex = indexedData.indexOf(item);

        // draw color block
        ctx.fillStyle = chartColors[sortedIndex];
        ctx.fillRect(currentX, currentY, 15, 15);

        // draw text
        ctx.fillStyle = "#333";
        ctx.font = "12px Arial";
        ctx.textAlign = "left";
        ctx.fillText(legendItem.text, currentX + 22, currentY + 12);

        // move to next position
        currentX += legendItem.width;
      });
    });
  }

  static createSimpleBarChart(ctx, { labels, data, title }) {
    const canvas = ctx.canvas;
    const width = canvas.width;
    const height = canvas.height;
    const padding = 80; // Increased padding for 700px width
    const chartWidth = width - 2 * padding;
    const chartHeight = height - 2 * padding;

    ctx.clearRect(0, 0, width, height);

    if (data.length === 0) return;

    const maxValue = Math.max(...data);
    const barWidth = Math.max(30, (chartWidth / data.length) * 0.8);
    const barSpacing = Math.max(15, (chartWidth / data.length) * 0.2);

    ctx.fillStyle = "#4CAF50";
    data.forEach((value, index) => {
      const barHeight = (value / maxValue) * chartHeight;
      const x = padding + index * (barWidth + barSpacing);
      const y = height - padding - barHeight;

      ctx.fillRect(x, y, barWidth, barHeight);

      // Draw value on top of bar
      ctx.fillStyle = "#333";
      ctx.font = "12px Arial";
      ctx.textAlign = "center";

      // Format value based on chart title
      let displayValue;
      if (title && title.includes("(%)")) {
        // For percentage charts, show 1 decimal place with % symbol
        displayValue = value.toFixed(1) + "%";
      } else if (title && title.includes("($)")) {
        // For revenue charts, show with $ symbol
        displayValue = "$" + value.toFixed(0);
      } else {
        // Default formatting
        displayValue = value < 100 ? value.toFixed(1) : value.toFixed(0);
      }

      ctx.fillText(displayValue.toString(), x + barWidth / 2, y - 5);

      // Draw label horizontally
      ctx.save();
      ctx.translate(x + barWidth / 2, height - padding + 20);
      ctx.font = "10px Arial";
      ctx.fillStyle = "#333";
      ctx.textAlign = "center";

      // Truncate long labels
      const maxLabelLength = 12;
      const displayLabel =
        labels[index].length > maxLabelLength
          ? labels[index].substring(0, maxLabelLength) + "..."
          : labels[index];

      ctx.fillText(displayLabel, 0, 0);
      ctx.restore();

      ctx.fillStyle = "#4CAF50";
    });
  }

  static createSimpleLineChart(ctx, { labels, data, title }) {
    const canvas = ctx.canvas;
    const width = canvas.width;
    const height = canvas.height;
    const padding = 80; // Increased padding for 700px width
    const chartWidth = width - 2 * padding;
    const chartHeight = height - 2 * padding;

    ctx.clearRect(0, 0, width, height);

    if (data.length === 0) return;

    const maxValue = Math.max(...data);
    const minValue = Math.min(...data);
    const valueRange = maxValue - minValue || 1;

    // Draw grid lines
    ctx.strokeStyle = "#e0e0e0";
    ctx.lineWidth = 1;
    for (let i = 0; i <= 5; i++) {
      const y = padding + (i / 5) * chartHeight;
      ctx.beginPath();
      ctx.moveTo(padding, y);
      ctx.lineTo(width - padding, y);
      ctx.stroke();
    }

    // Draw Y-axis labels
    ctx.fillStyle = "#666";
    ctx.font = "10px Arial";
    ctx.textAlign = "right";
    for (let i = 0; i <= 5; i++) {
      const y = padding + (i / 5) * chartHeight;
      const value = maxValue - (i / 5) * valueRange;
      ctx.fillText(Math.round(value).toString(), padding - 10, y + 3);
    }

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

    // Draw X-axis labels horizontally
    ctx.fillStyle = "#333";
    ctx.font = "10px Arial";
    ctx.textAlign = "center";
    labels.forEach((label, index) => {
      const x = padding + (index / (labels.length - 1)) * chartWidth;

      // Truncate long labels
      const maxLabelLength = 10;
      const displayLabel =
        label.length > maxLabelLength
          ? label.substring(0, maxLabelLength) + "..."
          : label;

      ctx.fillText(displayLabel, x, height - padding + 20);
    });
  }

  static drawNoDataMessage(ctx, message) {
    const canvas = ctx.canvas;
    const width = canvas.width;
    const height = canvas.height;

    ctx.clearRect(0, 0, width, height);

    ctx.fillStyle = "#999";
    ctx.font = "14px Arial";
    ctx.textAlign = "center";
    ctx.fillText(message, width / 2, height / 2);
  }

  static showFeatureComingSoon() {
    alert("Feature coming soon");
  }
}
