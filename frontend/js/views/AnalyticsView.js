// Analytics View - Handles analytics dashboard UI generation and manipulation
import { ChartUtils } from "../utils/ChartUtils.js";
import { DOMUtils } from "../utils/DOMUtils.js";

export class AnalyticsView {
  /**
   * Create the complete analytics interface
   * @returns {HTMLElement} Analytics container
   */
  static createInterface() {
    const analyticsDiv = DOMUtils.createElement("div", {
      id: "adminAnalytics",
      class: "role-dashboard",
    });

    analyticsDiv.innerHTML = this.getInterfaceHTML();
    return analyticsDiv;
  }

  /**
   * Get the HTML template for analytics interface
   * @returns {string} HTML string
   */
  static getInterfaceHTML() {
    return `
      <div class="analytics-header">
        <h2>🏢 Platform Analytics Dashboard</h2>
        <div class="analytics-actions">
          <button id="backToDashboardFromAnalytics" class="btn-secondary">← Back</button>
          <button id="refreshAnalytics" class="btn-primary">Refresh Data</button>
        </div>
      </div>

      <!-- Loading State -->
      <div id="analyticsLoading" class="loading-state" style="display: none;">
        <div class="loading-spinner">📊</div>
        <p>Loading platform analytics...</p>
      </div>

      <!-- Analytics Content -->
      <div id="analyticsContent" class="analytics-content">
        ${this.getSystemOverviewHTML()}
        ${this.getUserAnalyticsHTML()}
        ${this.getCourseAnalyticsHTML()}
        ${this.getFinancialAnalyticsHTML()}
      </div>
    `;
  }

  /**
   * Get system overview section HTML
   * @returns {string} HTML string
   */
  static getSystemOverviewHTML() {
    return `
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
    `;
  }

  /**
   * Get user analytics section HTML
   * @returns {string} HTML string
   */
  static getUserAnalyticsHTML() {
    return `
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
    `;
  }

  /**
   * Get course analytics section HTML
   * @returns {string} HTML string
   */
  static getCourseAnalyticsHTML() {
    return `
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
    `;
  }

  /**
   * Get financial analytics section HTML
   * @returns {string} HTML string
   */
  static getFinancialAnalyticsHTML() {
    return `
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
    `;
  }

  /**
   * Show loading state
   * @param {boolean} show - Whether to show loading
   */
  static showLoading(show) {
    DOMUtils.toggleElementDisplay("analyticsLoading", show);
    DOMUtils.toggleElementDisplay("analyticsContent", !show);
  }

  /**
   * Show error message
   * @param {string} message - Error message
   */
  static showError(message) {
    const content = DOMUtils.getElementById("analyticsContent");
    if (content) {
      content.innerHTML = `
        <div class="error-state">
          <h3>⚠️ Error Loading Analytics</h3>
          <p>${message}</p>
          <button onclick="window.adminHandler.loadAdminAnalyticsData()" class="btn-primary">Retry</button>
        </div>
      `;
    }
  }

  /**
   * Show no data message for a specific section
   * @param {string} sectionId - The section ID to show no data message for
   */
  static showNoDataMessage(sectionId) {
    const section = DOMUtils.getElementById(sectionId);
    if (section) {
      section.innerHTML = `
        <div class="no-data-state">
          <h3>📊 No Data Available</h3>
          <p>No analytics data available for this section at the moment.</p>
        </div>
      `;
    } else {
      console.warn(`Section with ID '${sectionId}' not found for showing no data message`);
    }
  }

  /**
   * Show no data message in user analytics charts
   */
  static showNoDataInUserCharts() {
    // Show no data in user role chart
    const roleCtx = DOMUtils.getElementById("userRoleChart");
    if (roleCtx) {
      const ctx = roleCtx.getContext("2d");
      ChartUtils.drawNoDataMessage(ctx, "No user data available");
    }

    // Show no data in user registration chart
    const registrationCtx = DOMUtils.getElementById("userRegistrationChart");
    if (registrationCtx) {
      const ctx = registrationCtx.getContext("2d");
      ChartUtils.drawNoDataMessage(ctx, "No registration data available");
    }
  }

  /**
   * Populate system overview data
   * @param {Object} overviewData - Overview data
   * @param {Array} topCourses - Top courses data
   */
  static populateSystemOverview(overviewData, topCourses) {
    // Update overview cards with actual platform overview data
    DOMUtils.setTextContent("totalUsers", overviewData.users.total);
    DOMUtils.setTextContent("totalStudents", overviewData.users.students);
    DOMUtils.setTextContent("totalInstructors", overviewData.users.instructors);
    DOMUtils.setTextContent("activeUsers", overviewData.enrollments.active);
    DOMUtils.setTextContent("totalCourses", overviewData.courses.total);

    // Calculate total revenue from top courses and their enrollments
    const totalRevenue = topCourses.reduce((sum, course) => {
      return sum + (course.price || 0) * (course.enrollmentCount || 0);
    }, 0);

    DOMUtils.setTextContent("totalRevenue", `$${totalRevenue.toFixed(2)}`);

    // Growth indicators (using completion rate as proxy for growth)
    const completionRate = overviewData.enrollments.completionRate;
    DOMUtils.setTextContent("userGrowth", `📈 ${completionRate}% completed`);
    DOMUtils.setTextContent("courseGrowth", `📈 ${overviewData.courses.total} total courses`);
    DOMUtils.setTextContent("revenueGrowth", `📈 ${overviewData.enrollments.completed} completed`);
  }

  /**
   * Create user analytics charts
   * @param {Object} userData - User data
   * @param {Array} instructorAnalytics - Instructor analytics data
   */
  static createUserAnalyticsCharts(userData, instructorAnalytics) {
    console.log("Creating user analytics charts with data:", {
      userData,
      instructorAnalytics,
    });

    // User Role Distribution (Pie Chart)
    const roleCtx = DOMUtils.getElementById("userRoleChart").getContext("2d");

    // Create role distribution from actual user data
    const roleData = [
      { _id: "students", count: userData.students || 0 },
      { _id: "instructors", count: userData.instructors || 0 },
      { _id: "admins", count: userData.admins || 0 },
    ];

    // Only create chart if we have data
    if (roleData.some((item) => item.count > 0)) {
      ChartUtils.createSimplePieChart(roleCtx, {
        labels: roleData.map((item) => item._id.charAt(0).toUpperCase() + item._id.slice(1)),
        data: roleData.map((item) => item.count),
        colors: ["#36A2EB", "#FF6384", "#FFCE56"],
        title: "User Roles",
      });
    } else {
      ChartUtils.drawNoDataMessage(roleCtx, "No user data available");
    }

    // Instructor Enrollment Trend (Line Chart)
    const registrationCtx = DOMUtils.getElementById("userRegistrationChart").getContext("2d");

    // Create trend data from instructor analytics
    const trendData = instructorAnalytics.slice(0, 10).map((inst, index) => ({
      _id: { year: 2024, month: index + 1 },
      count: inst.totalEnrollments || 0,
    }));

    ChartUtils.createSimpleLineChart(registrationCtx, {
      labels: trendData.map((item) => `${item._id.year}-${String(item._id.month).padStart(2, "0")}`),
      data: trendData.map((item) => item.count),
      title: "Instructor Enrollments",
    });
  }

  /**
   * Create course analytics charts
   * @param {Array} topCourses - Top courses data
   */
  static createCourseAnalyticsCharts(topCourses) {
    console.log("Creating course analytics charts with data:", topCourses);

    // Course Category Distribution
    const categoryCtx = DOMUtils.getElementById("courseCategoryChart").getContext("2d");

    // Create category distribution from top courses based on enrollment count
    const categoryEnrollments = {};
    topCourses.forEach((course) => {
      const category = course.category && course.category.trim() ? course.category : "Other";
      categoryEnrollments[category] = (categoryEnrollments[category] || 0) + (course.enrollmentCount || 0);
    });

    let categoryData = Object.entries(categoryEnrollments).map(([category, enrollments]) => ({
      _id: category,
      count: enrollments,
    }));

    // filter out items with count 0
    categoryData = categoryData.filter((item) => item.count > 0);

    if (categoryData.length > 0) {
      ChartUtils.createSimplePieChart(categoryCtx, {
        labels: categoryData.map((item) => item._id),
        data: categoryData.map((item) => item.count),
        colors: ["#FF6384", "#36A2EB", "#FFCE56", "#4BC0C0", "#9966FF", "#FF9F40"],
        title: "Course Categories by Enrollment",
      });
    } else {
      ChartUtils.drawNoDataMessage(categoryCtx, "No course data available");
    }

    // Course Completion Rates
    const completionCtx = DOMUtils.getElementById("courseCompletionChart").getContext("2d");

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

    ChartUtils.createSimpleBarChart(completionCtx, {
      labels: completionData.map((item) => item._id || "Other"),
      data: completionData.map((item) => item.rate),
      title: "Course Completion Rates (%)",
    });
  }

  /**
   * Create financial analytics charts
   * @param {Array} topCourses - Top courses data
   * @param {Object} overviewData - Overview data
   */
  static createFinancialAnalytics(topCourses = [], overviewData) {
    // Course Revenue Distribution
    const courseRevenueCtx = DOMUtils.getElementById("courseRevenueChart").getContext("2d");

    // Calculate revenue and sort by revenue from high to low
    const courseRevenues = topCourses
      .map((course) => ({
        title: course.title,
        revenue: (course.price || 0) * (course.enrollmentCount || 0),
      }))
      .sort((a, b) => b.revenue - a.revenue)
      .slice(0, 10);

    ChartUtils.createSimpleBarChart(courseRevenueCtx, {
      labels: courseRevenues.map((course) =>
        course.title.length > 20 ? course.title.substring(0, 20) + "..." : course.title
      ),
      data: courseRevenues.map((course) => course.revenue),
      title: "Top Course Revenue ($)",
    });

    // Instructor Revenue Distribution
    const instructorRevenueCtx = DOMUtils.getElementById("instructorRevenueChart").getContext("2d");

    // Group revenue by instructor
    const instructorRevenues = {};
    topCourses.forEach((course) => {
      const instructor = course.instructorName || "Unknown";
      const revenue = (course.price || 0) * (course.enrollmentCount || 0);
      instructorRevenues[instructor] = (instructorRevenues[instructor] || 0) + revenue;
    });

    const topInstructors = Object.entries(instructorRevenues)
      .sort(([, a], [, b]) => b - a)
      .slice(0, 10)
      .map(([instructor, revenue]) => ({
        instructor: instructor,
        revenue: revenue,
      }));

    ChartUtils.createSimpleBarChart(instructorRevenueCtx, {
      labels: topInstructors.map((inst) =>
        inst.instructor.length > 15 ? inst.instructor.substring(0, 15) + "..." : inst.instructor
      ),
      data: topInstructors.map((inst) => inst.revenue),
      title: "Revenue by Instructor ($)",
    });

    // Financial Summary
    const totalRevenue = topCourses.reduce(
      (sum, course) => sum + (course.price || 0) * (course.enrollmentCount || 0),
      0
    );
    const avgPrice = topCourses.reduce((sum, course) => sum + (course.price || 0), 0) / topCourses.length || 0;
    const totalEnrollments = topCourses.reduce((sum, course) => sum + (course.enrollmentCount || 0), 0);
    const revenuePerUser = overviewData.users.students > 0 ? totalRevenue / overviewData.users.students : 0;

    this.populateFinancialSummary({
      monthly: totalRevenue / 12, // Assuming annual revenue divided by 12
      averageCoursePrice: avgPrice,
      revenuePerUser: revenuePerUser,
      transactions: totalEnrollments,
      monthlyGrowthRate: 15, // Placeholder
    });
  }

  /**
   * Populate popular courses table
   * @param {Array} topCourses - Top courses data
   */
  static populatePopularCoursesTable(topCourses) {
    const tbody = document.querySelector("#popularCoursesTable tbody");
    tbody.innerHTML = "";

    topCourses.forEach((course) => {
      const row = tbody.insertRow();
      row.innerHTML = `
        <td>${course.title}</td>
        <td>${course.instructorName || "Unknown"}</td>
        <td>${course.enrollmentCount || 0}</td>
        <td>${course.completionRate ? course.completionRate.toFixed(1) + "%" : "N/A"}</td>
        <td>$${((course.price || 0) * (course.enrollmentCount || 0)).toFixed(2)}</td>
      `;
    });
  }

  /**
   * Populate instructor performance table
   * @param {Array} instructorAnalytics - Instructor analytics data
   */
  static populateInstructorPerformanceTable(instructorAnalytics) {
    const tbody = document.querySelector("#instructorPerformanceTable tbody");
    tbody.innerHTML = "";

    instructorAnalytics.forEach((instructor) => {
      const row = tbody.insertRow();
      const estimatedRevenue = (instructor.totalEnrollments || 0) * 50; // Assuming avg price of $50
      row.innerHTML = `
        <td>${instructor.instructorName}</td>
        <td>${instructor.totalCourses || 0}</td>
        <td>${instructor.totalEnrollments || 0}</td>
        <td>${instructor.avgCompletionRate ? instructor.avgCompletionRate.toFixed(1) + "%" : "N/A"}</td>
        <td>$${estimatedRevenue.toFixed(2)}</td>
      `;
    });
  }

  /**
   * Populate financial summary
   * @param {Object} financialSummary - Financial summary data
   */
  static populateFinancialSummary(financialSummary) {
    DOMUtils.setTextContent("monthlyRevenue", `$${financialSummary.monthly.toFixed(2)}`);
    DOMUtils.setTextContent("avgCoursePrice", `$${financialSummary.averageCoursePrice.toFixed(2)}`);
    DOMUtils.setTextContent("revenuePerUser", `$${financialSummary.revenuePerUser.toFixed(2)}`);
    DOMUtils.setTextContent("totalTransactions", financialSummary.transactions);

    // Add positive/negative class to growth indicators
    const monthlyGrowthEl = DOMUtils.getElementById("monthlyGrowth");
    monthlyGrowthEl.textContent = `📈 +${financialSummary.monthlyGrowthRate}% vs last month`;
    monthlyGrowthEl.className = "positive";

    const priceGrowthEl = DOMUtils.getElementById("priceGrowth");
    priceGrowthEl.textContent = "📈 +5% vs last month";
    priceGrowthEl.className = "positive";
  }
}
