// User Service - Handles all user-related API operations
export class UserService {
  /**
   * Get authentication token from global utilities
   * @returns {string|null} Authentication token
   */
  static getToken() {
    const { getToken } = window.dashboardUtils || {};
    return getToken ? getToken() : null;
  }

  /**
   * Load all users with pagination
   * @param {number} limit - Maximum number of users to fetch
   * @returns {Promise<Object>} API response with users data
   */
  static async loadUsers(limit = 1000) {
    const token = this.getToken();
    if (!token) {
      throw new Error("Authentication token not available");
    }

    const response = await fetch(`http://localhost:3761/api/users?limit=${limit}`, {
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
    });

    return await response.json();
  }

  /**
   * Get a specific user by ID
   * @param {string} userId - User ID
   * @returns {Promise<Object>} API response with user data
   */
  static async getUserById(userId) {
    const token = this.getToken();
    if (!token) {
      throw new Error("Authentication token not available");
    }

    const response = await fetch(`http://localhost:3761/api/users/${userId}`, {
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
    });

    return await response.json();
  }

  /**
   * Create a new user
   * @param {Object} userData - User data
   * @returns {Promise<Object>} API response
   */
  static async createUser(userData) {
    const token = this.getToken();
    if (!token) {
      throw new Error("Authentication token not available");
    }

    const response = await fetch("http://localhost:3761/api/users", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(userData),
    });

    return await response.json();
  }

  /**
   * Update an existing user
   * @param {string} userId - User ID
   * @param {Object} userData - Updated user data
   * @returns {Promise<Object>} API response
   */
  static async updateUser(userId, userData) {
    const token = this.getToken();
    if (!token) {
      throw new Error("Authentication token not available");
    }

    const response = await fetch(`http://localhost:3761/api/users/${userId}`, {
      method: "PUT",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(userData),
    });

    return await response.json();
  }

  /**
   * Delete a user
   * @param {string} userId - User ID
   * @returns {Promise<Object>} API response
   */
  static async deleteUser(userId) {
    const token = this.getToken();
    if (!token) {
      throw new Error("Authentication token not available");
    }

    const response = await fetch(`http://localhost:3761/api/users/${userId}`, {
      method: "DELETE",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
    });

    return await response.json();
  }
}
