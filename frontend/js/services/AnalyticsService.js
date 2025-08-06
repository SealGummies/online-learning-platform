// Analytics Service - Handles all analytics-related API operations
export class AnalyticsService {
  /**
   * Get authentication token from global utilities
   * @returns {string|null} Authentication token
   */
  static getToken() {
    const { getToken } = window.dashboardUtils || {};
    return getToken ? getToken() : null;
  }

  /**
   * Load platform overview analytics
   * @returns {Promise<Object>} Platform overview data
   */
  static async loadPlatformOverview() {
    const token = this.getToken();
    if (!token) {
      throw new Error("Authentication token not available");
    }

    const response = await fetch("http://localhost:3761/api/analytics/platform-overview", {
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
    });

    return await response.json();
  }

  /**
   * Load instructor analytics
   * @returns {Promise<Object>} Instructor analytics data
   */
  static async loadInstructorAnalytics() {
    const token = this.getToken();
    if (!token) {
      throw new Error("Authentication token not available");
    }

    const response = await fetch("http://localhost:3761/api/analytics/instructor-analytics", {
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
    });

    return await response.json();
  }

  /**
   * Load top courses data
   * @returns {Promise<Object>} Top courses data
   */
  static async loadTopCourses() {
    const token = this.getToken();
    if (!token) {
      throw new Error("Authentication token not available");
    }

    const response = await fetch("http://localhost:3761/api/analytics/top-courses", {
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
    });

    return await response.json();
  }

  /**
   * Load completion trends data
   * @returns {Promise<Object>} Completion trends data
   */
  static async loadCompletionTrends() {
    const token = this.getToken();
    if (!token) {
      throw new Error("Authentication token not available");
    }

    const response = await fetch("http://localhost:3761/api/analytics/completion-trends", {
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
    });

    return await response.json();
  }

  /**
   * Load all analytics data in parallel
   * @returns {Promise<Object>} Combined analytics data
   */
  static async loadAllAnalyticsData() {
    const [overviewResponse, instructorAnalyticsResponse, topCoursesResponse, completionTrendsResponse] =
      await Promise.all([
        this.loadPlatformOverview(),
        this.loadInstructorAnalytics(),
        this.loadTopCourses(),
        this.loadCompletionTrends(),
      ]);

    return {
      overview: overviewResponse,
      instructorAnalytics: instructorAnalyticsResponse,
      topCourses: topCoursesResponse,
      completionTrends: completionTrendsResponse,
    };
  }
}
