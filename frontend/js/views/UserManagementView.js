// User Management View - Handles user management UI generation and manipulation
import { DOMUtils } from "../utils/DOMUtils.js";
import { ValidationUtils } from "../utils/ValidationUtils.js";

export class UserManagementView {
  /**
   * Create the complete user management interface
   * @returns {HTMLElement} User management container
   */
  static createInterface() {
    const userManagementDiv = DOMUtils.createElement("div", {
      id: "userManagement",
      class: "role-dashboard",
    });

    userManagementDiv.innerHTML = this.getInterfaceHTML();
    return userManagementDiv;
  }

  /**
   * Get the HTML template for user management interface
   * @returns {string} HTML string
   */
  static getInterfaceHTML() {
    return `
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

      <!-- User Form -->
      ${this.getUserFormHTML()}

      <!-- Users List -->
      <div id="usersList">
        <div id="usersLoading" style="display: none;">Loading...</div>
        <div id="usersContainer"></div>
      </div>
    `;
  }

  /**
   * Get the HTML template for user form
   * @returns {string} HTML string
   */
  static getUserFormHTML() {
    return `
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
    `;
  }

  /**
   * Show user form (for add or edit)
   * @param {Object|null} user - User data for editing, null for adding
   */
  static showUserForm(user = null) {
    const form = DOMUtils.getElementById("userForm");
    const formTitle = DOMUtils.getElementById("formTitle");
    const formElement = DOMUtils.getElementById("userFormElement");

    if (user) {
      formTitle.textContent = "Edit User";
      formElement.dataset.userId = user._id;

      DOMUtils.getElementById("userFirstName").value = user.firstName || "";
      DOMUtils.getElementById("userLastName").value = user.lastName || "";
      DOMUtils.getElementById("userEmail").value = user.email || "";
      DOMUtils.getElementById("userRole").value = user.role || "";

      const passwordField = DOMUtils.getElementById("userPassword");
      passwordField.required = false;
      passwordField.placeholder = "Leave blank to keep current password";
    } else {
      formTitle.textContent = "Add User";
      formElement.removeAttribute("data-user-id");
      formElement.reset();

      const passwordField = DOMUtils.getElementById("userPassword");
      passwordField.required = true;
      passwordField.placeholder = "";
    }

    form.style.display = "block";
  }

  /**
   * Hide user form
   */
  static hideUserForm() {
    DOMUtils.toggleElementDisplay("userForm", false);
    const formElement = DOMUtils.getElementById("userFormElement");
    if (formElement) {
      formElement.reset();
    }
  }

  /**
   * Display users list
   * @param {Array} users - Array of user objects
   * @param {number} totalUsers - Total number of users
   */
  static displayUsers(users, totalUsers) {
    const container = DOMUtils.getElementById("usersContainer");

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
    const resultsInfo =
      users.length !== totalUsers
        ? `<div class="results-info">Showing ${users.length} of ${totalUsers} users</div>`
        : `<div class="results-info">Showing all ${users.length} users</div>`;

    const usersHTML = users
      .map((user) => {
        const formattedUser = ValidationUtils.formatUserForDisplay(user);
        return `
        <div class="user-card" data-user-id="${formattedUser.id}">
          <div class="user-main-info">
            <div class="user-info">
              <span class="role ${formattedUser.roleClass}">${formattedUser.role}</span>
              <span class="status ${formattedUser.statusClass}">${formattedUser.status}</span>
            </div>
            <div class="user-name-email">
              <h3>${formattedUser.fullName}</h3>
              <p class="user-email">${formattedUser.email}</p>
            </div>
          </div>
          <div class="user-actions">
            <button class="btn-edit" onclick="window.adminHandler.editUser('${formattedUser.id}')">Edit</button>
            <button class="btn-delete" onclick="window.adminHandler.deleteUser('${formattedUser.id}', '${formattedUser.fullName}')">Delete</button>
          </div>
        </div>
      `;
      })
      .join("");

    container.innerHTML = resultsInfo + usersHTML;
  }

  /**
   * Show loading state
   * @param {boolean} show - Whether to show loading
   */
  static showLoading(show) {
    DOMUtils.toggleElementDisplay("usersLoading", show);
  }

  /**
   * Show error message
   * @param {string} message - Error message
   */
  static showError(message) {
    const container = DOMUtils.getElementById("usersContainer");
    if (container) {
      container.innerHTML = `<p class="error-message">${message}</p>`;
    }
  }

  /**
   * Clear filters
   */
  static clearFilters() {
    const roleFilter = DOMUtils.getElementById("roleFilter");
    const sortBy = DOMUtils.getElementById("sortBy");
    const sortOrder = DOMUtils.getElementById("sortOrder");

    if (roleFilter) roleFilter.value = "";
    if (sortBy) sortBy.value = "name";
    if (sortOrder) sortOrder.value = "asc";
  }

  /**
   * Get current filter values
   * @returns {Object} Filter values
   */
  static getFilterValues() {
    return {
      role: DOMUtils.getElementById("roleFilter")?.value || "",
      sortBy: DOMUtils.getElementById("sortBy")?.value || "name",
      sortOrder: DOMUtils.getElementById("sortOrder")?.value || "asc",
    };
  }
}
