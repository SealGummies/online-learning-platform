// Instructor Action Handler Module
export class InstructorHandler {
  static handleAction(action) {
    switch (action) {
      case "manage-courses":
        this.manageCourses();
        break;
      case "manage-lessons":
        this.manageLessons();
        break;
      case "manage-exams":
        this.manageExams();
        break;
      case "view-analytics":
        this.viewAnalytics();
        break;
      default:
        this.showFeatureComingSoon();
    }
  }

  static manageCourses() {
    this.showCourseManagement();
  }

  static manageLessons() {
    this.showLessonManagement();
  }

  static manageExams() {
    this.showExamManagement();
  }

  static showFeatureComingSoon() {
    alert("Feature coming soon");
  }

  // Course Management Functions
  static async showCourseManagement() {
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
      const user = getUser();

      console.log("Checking authentication for course management...");
      console.log("Token exists:", !!token);
      console.log("User exists:", !!user);
      console.log("User role:", user?.role);

      if (!token || !user) {
        alert("Please log in to access course management.");
        redirectToLogin();
        return;
      }

      if (user.role !== "instructor") {
        alert("Access denied. Only instructors can manage courses.");
        return;
      }

      // Hide all role dashboards
      const roleDashboards = document.querySelectorAll(".role-dashboard");
      roleDashboards.forEach((dashboard) => {
        dashboard.style.display = "none";
      });

      // Create and show course management interface
      await this.createCourseManagementInterface();
    } catch (error) {
      console.error("Error showing course management:", error);
      alert("Error loading course management. Please try again.");
    }
  }

  static async createCourseManagementInterface() {
    const main = document.querySelector("main.dashboard-content");

    // Create course management container
    const courseManagementDiv = document.createElement("div");
    courseManagementDiv.id = "courseManagement";
    courseManagementDiv.className = "role-dashboard";

    courseManagementDiv.innerHTML = `
      <div class="course-management-header">
        <h2>Course Management</h2>
        <div class="course-actions">
          <button id="backToDashboard" class="btn-secondary">← Back</button>
          <button id="createCourseBtn" class="btn-primary">+ Create New Course</button>
        </div>
      </div>

      <!-- Course Creation/Edit Form -->
      <div id="courseForm" class="course-form" style="display: none;">
        <div class="form-container">
          <h3 id="formTitle">Create New Course</h3>
          <form id="courseFormElement">
            <div class="form-row">
              <div class="form-group">
                <label for="courseTitle">Course Title *</label>
                <input type="text" id="courseTitle" name="title" required maxlength="100">
              </div>
              <div class="form-group">
                <label for="courseCategory">Category *</label>
                <select id="courseCategory" name="category" required>
                  <option value="">Select Category</option>
                  <option value="Programming">Programming</option>
                  <option value="Data Science">Data Science</option>
                  <option value="Web Development">Web Development</option>
                  <option value="AI/ML">AI/ML</option>
                  <option value="Database">Database</option>
                  <option value="Other">Other</option>
                </select>
              </div>
            </div>
            
            <div class="form-row">
              <div class="form-group">
                <label for="courseLevel">Level *</label>
                <select id="courseLevel" name="level" required>
                  <option value="">Select Level</option>
                  <option value="Beginner">Beginner</option>
                  <option value="Intermediate">Intermediate</option>
                  <option value="Advanced">Advanced</option>
                </select>
              </div>
              <div class="form-group">
                <label for="coursePrice">Price ($) *</label>
                <input type="number" id="coursePrice" name="price" min="0" step="0.01" required>
              </div>
            </div>

            <div class="form-group">
              <label for="courseDescription">Description *</label>
              <textarea id="courseDescription" name="description" required maxlength="1000" rows="4"></textarea>
            </div>

            <div class="form-group">
              <label class="checkbox-label">
                <input type="checkbox" id="courseActive" name="isActive" checked>
                Course is active and visible to students
              </label>
            </div>

            <div class="form-actions">
              <button type="button" id="cancelForm" class="btn-secondary">Cancel</button>
              <button type="submit" id="saveForm" class="btn-primary">Save Course</button>
            </div>
          </form>
        </div>
      </div>

      <!-- Courses List -->
      <div id="coursesList" class="courses-list">
        <div class="loading" id="coursesLoading">Loading courses...</div>
        <div id="coursesContainer"></div>
      </div>
    `;

    main.appendChild(courseManagementDiv);

    // Add event listeners
    this.setupCourseManagementEventListeners();

    // Load instructor's courses
    await this.loadInstructorCourses();
  }

  static setupCourseManagementEventListeners() {
    // Get helper functions from global scope
    const { getUser, showRoleDashboard } = window.dashboardUtils || {};

    // Back to dashboard button
    document.getElementById("backToDashboard").addEventListener("click", () => {
      document.getElementById("courseManagement").remove();
      if (getUser && showRoleDashboard) {
        const user = getUser();
        showRoleDashboard(user);
      }
    });

    // Create course button
    document.getElementById("createCourseBtn").addEventListener("click", () => {
      this.showCourseForm();
    });

    // Cancel form button
    document.getElementById("cancelForm").addEventListener("click", () => {
      this.hideCourseForm();
    });

    // Course form submission
    document
      .getElementById("courseFormElement")
      .addEventListener("submit", async (e) => {
        e.preventDefault();
        await this.saveCourse();
      });
  }

  static showCourseForm(course = null) {
    const form = document.getElementById("courseForm");
    const formTitle = document.getElementById("formTitle");
    const formElement = document.getElementById("courseFormElement");

    if (course) {
      formTitle.textContent = "Edit Course";
      // Populate form with course data
      document.getElementById("courseTitle").value = course.title;
      document.getElementById("courseCategory").value = course.category;
      document.getElementById("courseLevel").value = course.level;
      document.getElementById("coursePrice").value = course.price;
      document.getElementById("courseDescription").value = course.description;
      document.getElementById("courseActive").checked = course.isActive;
      formElement.dataset.courseId = course._id;
    } else {
      formTitle.textContent = "Create New Course";
      formElement.reset();
      document.getElementById("courseActive").checked = true;
      delete formElement.dataset.courseId;
    }

    form.style.display = "block";
    form.scrollIntoView({ behavior: "smooth" });
  }

  static hideCourseForm() {
    document.getElementById("courseForm").style.display = "none";
    document.getElementById("courseFormElement").reset();
  }

  static async loadInstructorCourses() {
    const loading = document.getElementById("coursesLoading");
    const container = document.getElementById("coursesContainer");

    try {
      loading.style.display = "block";
      container.innerHTML = "";

      const { getToken, getUser } = window.dashboardUtils || {};
      if (!getToken || !getUser) {
        throw new Error("Dashboard utilities not available");
      }

      const token = getToken();
      const user = getUser();

      // Debug: Log authentication info
      console.log("Loading instructor courses...");
      console.log("Token exists:", !!token);
      console.log("User exists:", !!user);
      console.log("User role:", user?.role);

      if (
        !token ||
        token === "undefined" ||
        token === "null" ||
        token.trim() === ""
      ) {
        throw new Error(
          "No valid authentication token found. Please log in again."
        );
      }

      if (!user) {
        throw new Error("No user data found. Please log in again.");
      }

      if (user.role !== "instructor") {
        throw new Error("Access denied. Only instructors can manage courses.");
      }

      const API_BASE_URL = "http://localhost:3761/api";
      console.log(
        "Making API request to:",
        `${API_BASE_URL}/courses/instructor/my-courses`
      );

      const response = await fetch(
        `${API_BASE_URL}/courses/instructor/my-courses`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );

      console.log("Response status:", response.status);
      console.log("Response ok:", response.ok);

      const data = await response.json();
      console.log("Response data:", data);

      if (data.success) {
        this.displayCourses(data.data || []);
      } else {
        throw new Error(data.error || data.message || "Failed to load courses");
      }
    } catch (error) {
      console.error("Error loading courses:", error);

      // Check if it's an authentication error
      if (
        error.message.includes("401") ||
        error.message.includes("Unauthorized") ||
        error.message.includes("token failed") ||
        error.message.includes("No valid authentication token")
      ) {
        // Clear invalid auth data
        localStorage.removeItem("authToken");
        localStorage.removeItem("user");

        container.innerHTML = `
          <div class="error-message">
            <strong>Authentication Error</strong><br>
            Your session has expired or is invalid. <br>
            <button onclick="window.location.href='index.html'" class="btn-secondary" style="margin-top: 10px;">
              Login Again
            </button>
          </div>
        `;
      } else {
        container.innerHTML = `<div class="error-message">Error loading courses: ${error.message}</div>`;
      }
    } finally {
      loading.style.display = "none";
    }
  }

  static displayCourses(courses) {
    const container = document.getElementById("coursesContainer");

    if (courses.length === 0) {
      container.innerHTML = `
        <div class="no-courses">
          <h3>No courses yet</h3>
          <p>Create your first course to get started!</p>
        </div>
      `;
      return;
    }

    container.innerHTML = courses
      .map(
        (course) => `
      <div class="course-card ${
        !course.isActive ? "inactive" : ""
      }" data-course-id="${course._id}">
        <div class="course-header">
          <h3>${course.title}</h3>
          <div class="course-status">
            <span class="status-badge ${
              course.isActive ? "active" : "inactive"
            }">
              ${course.isActive ? "Active" : "Inactive"}
            </span>
          </div>
        </div>
        
        <div class="course-info">
          <p class="course-description">${course.description}</p>
          <div class="course-meta">
            <span class="category">${course.category}</span>
            <span class="level">${course.level}</span>
            <span class="price">$${course.price}</span>
          </div>
          
          <div class="course-stats">
            <small>Created: ${new Date(
              course.createdAt
            ).toLocaleDateString()}</small>
            ${
              course.updatedAt !== course.createdAt
                ? `<small>Updated: ${new Date(
                    course.updatedAt
                  ).toLocaleDateString()}</small>`
                : ""
            }
          </div>
        </div>
        
        <div class="course-actions">
          <button class="btn-edit" onclick="window.instructorHandler.editCourse('${
            course._id
          }')">Edit</button>
          <button class="btn-toggle" onclick="window.instructorHandler.toggleCourseStatus('${
            course._id
          }', ${course.isActive})">
            ${course.isActive ? "Deactivate" : "Activate"}
          </button>
          <button class="btn-delete" onclick="window.instructorHandler.deleteCourse('${
            course._id
          }', '${course.title}')">Delete</button>
        </div>
      </div>
    `
      )
      .join("");
  }

  static async saveCourse() {
    const form = document.getElementById("courseFormElement");
    const formData = new FormData(form);
    const courseId = form.dataset.courseId;

    // Prepare course data
    const courseData = {
      title: formData.get("title").trim(),
      description: formData.get("description").trim(),
      category: formData.get("category"),
      level: formData.get("level"),
      price: parseFloat(formData.get("price")),
      isActive: formData.get("isActive") === "on",
    };

    try {
      const saveBtn = document.getElementById("saveForm");
      saveBtn.disabled = true;
      saveBtn.textContent = "Saving...";

      const { getToken } = window.dashboardUtils || {};
      if (!getToken) {
        throw new Error("Dashboard utilities not available");
      }

      const token = getToken();
      const API_BASE_URL = "http://localhost:3761/api";
      const url = courseId
        ? `${API_BASE_URL}/courses/${courseId}`
        : `${API_BASE_URL}/courses`;

      const method = courseId ? "PUT" : "POST";

      const response = await fetch(url, {
        method: method,
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(courseData),
      });

      const data = await response.json();

      if (data.success) {
        this.hideCourseForm();
        await this.loadInstructorCourses();
        alert(
          courseId
            ? "Course updated successfully!"
            : "Course created successfully!"
        );
      } else {
        throw new Error(
          data.error || data.errors?.[0]?.msg || "Failed to save course"
        );
      }
    } catch (error) {
      console.error("Error saving course:", error);
      alert(`Error saving course: ${error.message}`);
    } finally {
      const saveBtn = document.getElementById("saveForm");
      saveBtn.disabled = false;
      saveBtn.textContent = "Save Course";
    }
  }

  static async editCourse(courseId) {
    try {
      const { getToken } = window.dashboardUtils || {};
      if (!getToken) {
        throw new Error("Dashboard utilities not available");
      }

      const token = getToken();
      const API_BASE_URL = "http://localhost:3761/api";
      const response = await fetch(`${API_BASE_URL}/courses/${courseId}`, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });

      const data = await response.json();

      if (data.success) {
        this.showCourseForm(data.data);
      } else {
        throw new Error(data.error || "Failed to load course details");
      }
    } catch (error) {
      console.error("Error loading course for edit:", error);
      alert(`Error loading course: ${error.message}`);
    }
  }

  static async toggleCourseStatus(courseId, currentStatus) {
    try {
      const { getToken } = window.dashboardUtils || {};
      if (!getToken) {
        throw new Error("Dashboard utilities not available");
      }

      const token = getToken();
      const API_BASE_URL = "http://localhost:3761/api";

      // First, get the full course data
      const courseResponse = await fetch(
        `${API_BASE_URL}/courses/${courseId}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );

      const courseData = await courseResponse.json();
      if (!courseData.success) {
        throw new Error(courseData.error || "Failed to load course data");
      }

      const course = courseData.data;

      // Update the course with the new status and all required fields
      const updateData = {
        title: course.title,
        description: course.description,
        category: course.category,
        level: course.level,
        price: course.price,
        isActive: !currentStatus,
      };

      const response = await fetch(`${API_BASE_URL}/courses/${courseId}`, {
        method: "PUT",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(updateData),
      });

      const data = await response.json();

      if (data.success) {
        await this.loadInstructorCourses();
        console.log(
          `Course ${!currentStatus ? "activated" : "deactivated"} successfully!`
        );
      } else {
        throw new Error(
          data.error ||
            data.errors?.[0]?.msg ||
            "Failed to update course status"
        );
      }
    } catch (error) {
      console.error("Error toggling course status:", error);
      alert(`Error updating course: ${error.message}`);
    }
  }

  static async deleteCourse(courseId, courseTitle) {
    if (
      !confirm(
        `Are you sure you want to delete "${courseTitle}"? This action cannot be undone.`
      )
    ) {
      return;
    }

    try {
      const { getToken } = window.dashboardUtils || {};
      if (!getToken) {
        throw new Error("Dashboard utilities not available");
      }

      const token = getToken();
      const API_BASE_URL = "http://localhost:3761/api";
      const response = await fetch(`${API_BASE_URL}/courses/${courseId}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });

      const data = await response.json();

      if (data.success) {
        await this.loadInstructorCourses();
        alert("Course deleted successfully!");
      } else {
        throw new Error(data.error || "Failed to delete course");
      }
    } catch (error) {
      console.error("Error deleting course:", error);
      alert(`Error deleting course: ${error.message}`);
    }
  }

  // Lesson Management Functions
  static async showLessonManagement() {
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
      const user = getUser();

      if (!token || !user) {
        alert("Please log in to access lesson management.");
        redirectToLogin();
        return;
      }

      if (user.role !== "instructor") {
        alert("Access denied. Only instructors can manage lessons.");
        return;
      }

      // Hide all role dashboards
      const roleDashboards = document.querySelectorAll(".role-dashboard");
      roleDashboards.forEach((dashboard) => {
        dashboard.style.display = "none";
      });

      // Create and show lesson management interface
      await this.createLessonManagementInterface();
    } catch (error) {
      console.error("Error showing lesson management:", error);
      alert("Error loading lesson management. Please try again.");
    }
  }

  static async createLessonManagementInterface() {
    const main = document.querySelector("main.dashboard-content");

    // Create lesson management container
    const lessonManagementDiv = document.createElement("div");
    lessonManagementDiv.id = "lessonManagement";
    lessonManagementDiv.className = "role-dashboard";

    lessonManagementDiv.innerHTML = `
      <div class="lesson-management-header">
        <h2>Lesson Management</h2>
        <div class="lesson-actions">
          <button id="backToDashboardFromLessons" class="btn-secondary">← Back</button>
          <select id="courseSelector" class="course-selector">
            <option value="">Select a course...</option>
          </select>
          <button id="createLessonBtn" class="btn-primary" disabled>+ Create New Lesson</button>
        </div>
      </div>

      <!-- Lesson Creation/Edit Form -->
      <div id="lessonForm" class="lesson-form" style="display: none;">
        <div class="form-container">
          <h3 id="lessonFormTitle">Create New Lesson</h3>
          <form id="lessonFormElement">
            <div class="form-row">
              <div class="form-group">
                <label for="lessonTitle">Lesson Title *</label>
                <input type="text" id="lessonTitle" name="title" required maxlength="100">
              </div>
              <div class="form-group">
                <label for="lessonOrder">Order *</label>
                <input type="number" id="lessonOrder" name="order" min="1" required>
              </div>
            </div>

            <div class="form-group">
              <label for="lessonContent">Content *</label>
              <textarea id="lessonContent" name="content" required rows="10" placeholder="Enter lesson content in Markdown or plain text..."></textarea>
            </div>

            <div class="form-group">
              <label for="lessonType">Content Type *</label>
              <select id="lessonType" name="type" required>
                <option value="">Select Type</option>
                <option value="text">Text/Reading</option>
                <option value="video">Video</option>
                <option value="assignment">Assignment</option>
                <option value="quiz">Quiz</option>
              </select>
            </div>

            <div class="form-group">
              <label class="checkbox-label">
                <input type="checkbox" id="lessonActive" name="isActive" checked>
                Lesson is published and visible to students
              </label>
            </div>

            <div class="form-actions">
              <button type="button" id="cancelLessonForm" class="btn-secondary">Cancel</button>
              <button type="submit" id="saveLessonForm" class="btn-primary">Save Lesson</button>
            </div>
          </form>
        </div>
      </div>

      <!-- Lessons List -->
      <div id="lessonsList" class="lessons-list">
        <div class="course-info-display" id="courseInfoDisplay" style="display: none;">
          <h3 id="selectedCourseTitle"></h3>
          <p id="selectedCourseDescription"></p>
        </div>
        <div class="loading" id="lessonsLoading" style="display: none;">Loading lessons...</div>
        <div id="lessonsContainer">
          <div class="no-course-selected">
            <h3>Select a Course</h3>
            <p>Choose a course from the dropdown above to manage its lessons.</p>
          </div>
        </div>
      </div>
    `;

    main.appendChild(lessonManagementDiv);

    // Add event listeners
    this.setupLessonManagementEventListeners();

    // Load instructor's courses for selection
    await this.loadCoursesForLessonManagement();
  }

  static setupLessonManagementEventListeners() {
    // Get helper functions from global scope
    const { getUser, showRoleDashboard } = window.dashboardUtils || {};

    // Back to dashboard button
    document
      .getElementById("backToDashboardFromLessons")
      .addEventListener("click", () => {
        document.getElementById("lessonManagement").remove();
        if (getUser && showRoleDashboard) {
          const user = getUser();
          showRoleDashboard(user);
        }
      });

    // Course selector change
    document
      .getElementById("courseSelector")
      .addEventListener("change", async (e) => {
        const courseId = e.target.value;
        const createBtn = document.getElementById("createLessonBtn");

        if (courseId) {
          createBtn.disabled = false;
          await this.loadLessonsForCourse(courseId);
        } else {
          createBtn.disabled = true;
          this.showNoCourseSelected();
        }
      });

    // Create lesson button
    document.getElementById("createLessonBtn").addEventListener("click", () => {
      const courseId = document.getElementById("courseSelector").value;
      if (courseId) {
        this.showLessonForm(null, courseId);
      }
    });

    // Cancel form button
    document
      .getElementById("cancelLessonForm")
      .addEventListener("click", () => {
        this.hideLessonForm();
      });

    // Lesson form submission
    document
      .getElementById("lessonFormElement")
      .addEventListener("submit", async (e) => {
        e.preventDefault();
        await this.saveLesson();
      });
  }

  static async loadCoursesForLessonManagement() {
    try {
      const { getToken } = window.dashboardUtils || {};
      if (!getToken) {
        throw new Error("Dashboard utilities not available");
      }

      const token = getToken();
      const API_BASE_URL = "http://localhost:3761/api";

      const response = await fetch(
        `${API_BASE_URL}/courses/instructor/my-courses`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );
      const data = await response.json();

      if (data.success) {
        const courseSelector = document.getElementById("courseSelector");
        courseSelector.innerHTML =
          '<option value="">Select a course...</option>';

        data.data.forEach((course) => {
          const option = document.createElement("option");
          option.value = course._id;
          option.textContent = `${course.title} (${
            course.isActive ? "Active" : "Inactive"
          })`;
          courseSelector.appendChild(option);
        });
      } else {
        throw new Error(data.error || "Failed to load courses");
      }
    } catch (error) {
      console.error("Error loading courses:", error);
      alert(`Error loading courses: ${error.message}`);
    }
  }

  static async loadLessonsForCourse(courseId) {
    const loading = document.getElementById("lessonsLoading");
    const container = document.getElementById("lessonsContainer");
    const courseInfoDisplay = document.getElementById("courseInfoDisplay");

    try {
      loading.style.display = "block";
      container.innerHTML = "";
      courseInfoDisplay.style.display = "none";

      const { getToken } = window.dashboardUtils || {};
      if (!getToken) {
        throw new Error("Dashboard utilities not available");
      }

      const token = getToken();
      const API_BASE_URL = "http://localhost:3761/api";

      // Load course info and lessons
      const [courseResponse, lessonsResponse] = await Promise.all([
        fetch(`${API_BASE_URL}/courses/${courseId}`, {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }),
        fetch(`${API_BASE_URL}/lessons?course=${courseId}`, {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }),
      ]);

      const courseData = await courseResponse.json();
      const lessonsData = await lessonsResponse.json();

      if (courseData.success) {
        // Display course info
        document.getElementById("selectedCourseTitle").textContent =
          courseData.data.title;
        document.getElementById("selectedCourseDescription").textContent =
          courseData.data.description;
        courseInfoDisplay.style.display = "block";
      }

      if (lessonsData.success) {
        this.displayLessons(lessonsData.data || [], courseId);
      } else {
        // If lessons endpoint doesn't exist, show placeholder
        this.displayLessons([], courseId);
      }
    } catch (error) {
      console.error("Error loading lessons:", error);
      container.innerHTML = `<div class="error-message">Error loading lessons: ${error.message}</div>`;
    } finally {
      loading.style.display = "none";
    }
  }

  static displayLessons(lessons, courseId) {
    const container = document.getElementById("lessonsContainer");

    if (lessons.length === 0) {
      container.innerHTML = `
        <div class="no-lessons">
          <h3>No lessons yet</h3>
          <p>Create your first lesson for this course!</p>
        </div>
      `;
      return;
    }

    // Sort lessons by order
    const sortedLessons = lessons.sort(
      (a, b) => (a.order || 0) - (b.order || 0)
    );

    container.innerHTML = sortedLessons
      .map(
        (lesson, index) => `
        <div class="lesson-card ${
          !lesson.isPublished ? "inactive" : ""
        }" data-lesson-id="${lesson._id}">
          <div class="lesson-header">
            <div class="lesson-number">${lesson.order || index + 1}</div>
            <h3>${lesson.title}</h3>
            <div class="lesson-status">
              <span class="status-badge ${
                lesson.isPublished ? "active" : "inactive"
              }">
                ${lesson.isPublished ? "Published" : "Draft"}
              </span>
              <span class="type-badge type-${
                lesson.type || "text"
              }">${this.formatLessonType(lesson.type)}</span>
            </div>
          </div>
          
          <div class="lesson-info">
            <div class="lesson-meta">
              <span class="created">Created: ${new Date(
                lesson.createdAt || Date.now()
              ).toLocaleDateString()}</span>
            </div>
            
            <div class="lesson-content-preview">
              <strong>Content Preview:</strong>
              <p>${this.truncateText(
                lesson.content || "No content yet",
                150
              )}</p>
            </div>
          </div>
          
          <div class="lesson-actions">
            <button class="btn-edit" onclick="window.instructorHandler.editLesson('${
              lesson._id
            }', '${courseId}')">Edit</button>
            <button class="btn-toggle" onclick="window.instructorHandler.toggleLessonStatus('${
              lesson._id
            }', ${lesson.isPublished}, '${courseId}')">
              ${lesson.isPublished ? "Unpublish" : "Publish"}
            </button>
            <button class="btn-delete" onclick="window.instructorHandler.deleteLesson('${
              lesson._id
            }', '${lesson.title}', '${courseId}')">Delete</button>
          </div>
        </div>
      `
      )
      .join("");
  }

  static formatLessonType(type) {
    const types = {
      text: "Reading",
      video: "Video",
      assignment: "Assignment",
      quiz: "Quiz",
    };
    return types[type] || "Reading";
  }

  static truncateText(text, maxLength) {
    if (!text) return "";
    return text.length > maxLength
      ? text.substring(0, maxLength) + "..."
      : text;
  }

  static showNoCourseSelected() {
    const container = document.getElementById("lessonsContainer");
    const courseInfoDisplay = document.getElementById("courseInfoDisplay");

    courseInfoDisplay.style.display = "none";
    container.innerHTML = `
      <div class="no-course-selected">
        <h3>Select a Course</h3>
        <p>Choose a course from the dropdown above to manage its lessons.</p>
      </div>
    `;
  }

  static showLessonForm(lesson = null, courseId = null) {
    const form = document.getElementById("lessonForm");
    const formTitle = document.getElementById("lessonFormTitle");
    const formElement = document.getElementById("lessonFormElement");

    if (lesson) {
      formTitle.textContent = "Edit Lesson";
      // Populate form with lesson data
      document.getElementById("lessonTitle").value = lesson.title || "";
      document.getElementById("lessonOrder").value = lesson.order || "";
      document.getElementById("lessonContent").value = lesson.content || "";
      document.getElementById("lessonType").value = lesson.type || "text";
      document.getElementById("lessonActive").checked =
        lesson.isPublished !== false;
      formElement.dataset.lessonId = lesson._id;
      formElement.dataset.courseId = courseId || lesson.course;
    } else {
      formTitle.textContent = "Create New Lesson";
      formElement.reset();
      document.getElementById("lessonActive").checked = true;
      delete formElement.dataset.lessonId;
      formElement.dataset.courseId = courseId;

      // Set default order to next available
      this.setNextLessonOrder(courseId);
    }

    form.style.display = "block";
    form.scrollIntoView({ behavior: "smooth" });
  }

  static async setNextLessonOrder(courseId) {
    try {
      const { getToken } = window.dashboardUtils || {};
      if (!getToken) return;

      const token = getToken();
      const API_BASE_URL = "http://localhost:3761/api";

      const response = await fetch(
        `${API_BASE_URL}/lessons?course=${courseId}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );

      const data = await response.json();

      if (data.success && data.data) {
        const maxOrder = Math.max(
          0,
          ...data.data.map((lesson) => lesson.order || 0)
        );
        document.getElementById("lessonOrder").value = maxOrder + 1;
      } else {
        document.getElementById("lessonOrder").value = 1;
      }
    } catch (error) {
      document.getElementById("lessonOrder").value = 1;
    }
  }

  static hideLessonForm() {
    document.getElementById("lessonForm").style.display = "none";
    document.getElementById("lessonFormElement").reset();
  }

  static async saveLesson() {
    const form = document.getElementById("lessonFormElement");
    const formData = new FormData(form);
    const lessonId = form.dataset.lessonId;
    const courseId = form.dataset.courseId;

    // Prepare lesson data
    const lessonData = {
      title: formData.get("title").trim(),
      content: formData.get("content").trim(),
      type: formData.get("type"),
      order: parseInt(formData.get("order")) || 1,
      course: courseId,
      isPublished: formData.get("isActive") === "on",
    };

    try {
      const saveBtn = document.getElementById("saveLessonForm");
      saveBtn.disabled = true;
      saveBtn.textContent = "Saving...";

      const { getToken } = window.dashboardUtils || {};
      if (!getToken) {
        throw new Error("Dashboard utilities not available");
      }

      const token = getToken();
      const API_BASE_URL = "http://localhost:3761/api";
      const url = lessonId
        ? `${API_BASE_URL}/lessons/${lessonId}`
        : `${API_BASE_URL}/lessons`;

      const method = lessonId ? "PUT" : "POST";

      const response = await fetch(url, {
        method: method,
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(lessonData),
      });

      const data = await response.json();

      if (data.success) {
        this.hideLessonForm();
        await this.loadLessonsForCourse(courseId);
        alert(
          lessonId
            ? "Lesson updated successfully!"
            : "Lesson created successfully!"
        );
      } else {
        throw new Error(
          data.error || data.errors?.[0]?.msg || "Failed to save lesson"
        );
      }
    } catch (error) {
      console.error("Error saving lesson:", error);
      alert(`Error saving lesson: ${error.message}`);
    } finally {
      const saveBtn = document.getElementById("saveLessonForm");
      saveBtn.disabled = false;
      saveBtn.textContent = "Save Lesson";
    }
  }

  static async editLesson(lessonId, courseId) {
    try {
      const { getToken } = window.dashboardUtils || {};
      if (!getToken) {
        throw new Error("Dashboard utilities not available");
      }

      const token = getToken();
      const API_BASE_URL = "http://localhost:3761/api";
      const response = await fetch(`${API_BASE_URL}/lessons/${lessonId}`, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });

      const data = await response.json();

      if (data.success) {
        this.showLessonForm(data.data, courseId);
      } else {
        throw new Error(data.error || "Failed to load lesson details");
      }
    } catch (error) {
      console.error("Error loading lesson for edit:", error);
      alert(`Error loading lesson: ${error.message}`);
    }
  }

  static async toggleLessonStatus(lessonId, currentStatus, courseId) {
    try {
      const { getToken } = window.dashboardUtils || {};
      if (!getToken) {
        throw new Error("Dashboard utilities not available");
      }

      const token = getToken();
      const API_BASE_URL = "http://localhost:3761/api";

      // First, get the full lesson data
      const lessonResponse = await fetch(
        `${API_BASE_URL}/lessons/${lessonId}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );

      const lessonData = await lessonResponse.json();
      if (!lessonData.success) {
        throw new Error(lessonData.error || "Failed to load lesson data");
      }

      const lesson = lessonData.data;

      // Update the lesson with the new status
      const updateData = {
        title: lesson.title,
        content: lesson.content,
        type: lesson.type,
        order: lesson.order,
        course: lesson.course,
        isPublished: !currentStatus,
      };

      const response = await fetch(`${API_BASE_URL}/lessons/${lessonId}`, {
        method: "PUT",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(updateData),
      });

      const data = await response.json();

      if (data.success) {
        await this.loadLessonsForCourse(courseId);
        console.log(
          `Lesson ${!currentStatus ? "activated" : "deactivated"} successfully!`
        );
      } else {
        throw new Error(
          data.error ||
            data.errors?.[0]?.msg ||
            "Failed to update lesson status"
        );
      }
    } catch (error) {
      console.error("Error toggling lesson status:", error);
      alert(`Error updating lesson: ${error.message}`);
    }
  }

  static async deleteLesson(lessonId, lessonTitle, courseId) {
    if (
      !confirm(
        `Are you sure you want to delete "${lessonTitle}"? This action cannot be undone.`
      )
    ) {
      return;
    }

    try {
      const { getToken } = window.dashboardUtils || {};
      if (!getToken) {
        throw new Error("Dashboard utilities not available");
      }

      const token = getToken();
      const API_BASE_URL = "http://localhost:3761/api";
      const response = await fetch(`${API_BASE_URL}/lessons/${lessonId}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });

      const data = await response.json();

      if (data.success) {
        await this.loadLessonsForCourse(courseId);
        alert("Lesson deleted successfully!");
      } else {
        throw new Error(data.error || "Failed to delete lesson");
      }
    } catch (error) {
      console.error("Error deleting lesson:", error);
      alert(`Error deleting lesson: ${error.message}`);
    }
  }

  // Exam Management Functions
  static async showExamManagement() {
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
      const user = getUser();

      if (!token || !user) {
        alert("Please log in to access exam management.");
        redirectToLogin();
        return;
      }

      if (user.role !== "instructor") {
        alert("Access denied. Only instructors can manage exams.");
        return;
      }

      // Hide all role dashboards
      const roleDashboards = document.querySelectorAll(".role-dashboard");
      roleDashboards.forEach((dashboard) => {
        dashboard.style.display = "none";
      });

      // Create and show exam management interface
      await this.createExamManagementInterface();
    } catch (error) {
      console.error("Error showing exam management:", error);
      alert("Error loading exam management. Please try again.");
    }
  }

  static async createExamManagementInterface() {
    const main = document.querySelector("main.dashboard-content");

    // Create exam management container
    const examManagementDiv = document.createElement("div");
    examManagementDiv.id = "examManagement";
    examManagementDiv.className = "role-dashboard";

    examManagementDiv.innerHTML = `
      <div class="exam-management-header">
        <h2>Exam Management</h2>
        <div class="exam-actions">
          <button id="backToDashboardFromExams" class="btn-secondary">← Back</button>
          <select id="examCourseSelector" class="course-selector">
            <option value="">Select a course...</option>
          </select>
          <button id="createExamBtn" class="btn-primary" disabled>+ Create New Exam</button>
        </div>
      </div>

      <!-- Exam Creation/Edit Form -->
      <div id="examForm" class="exam-form" style="display: none;">
        <div class="form-container">
          <h3 id="examFormTitle">Create New Exam</h3>
          <form id="examFormElement">
            <div class="form-row">
              <div class="form-group">
                <label for="examTitle">Exam Title *</label>
                <input type="text" id="examTitle" name="title" required maxlength="200">
              </div>
              <div class="form-group">
                <label for="examType">Exam Type *</label>
                <select id="examType" name="type" required>
                  <option value="">Select Type</option>
                  <option value="quiz">Quiz</option>
                  <option value="midterm">Midterm</option>
                  <option value="final">Final Exam</option>
                  <option value="assignment">Assignment</option>
                </select>
              </div>
            </div>

            <div class="form-group">
              <label for="examDescription">Description *</label>
              <textarea id="examDescription" name="description" required maxlength="1000" rows="6" placeholder="Enter exam description, instructions, or notes..."></textarea>
            </div>

            <div class="form-group">
              <label class="checkbox-label">
                <input type="checkbox" id="examActive" name="isActive" checked>
                Exam is active and visible to students
              </label>
            </div>

            <div class="form-actions">
              <button type="button" id="cancelExamForm" class="btn-secondary">Cancel</button>
              <button type="submit" id="saveExamForm" class="btn-primary">Save Exam</button>
            </div>
          </form>
        </div>
      </div>

      <!-- Exams List -->
      <div id="examsList" class="exams-list">
        <div class="course-info-display" id="examCourseInfoDisplay" style="display: none;">
          <h3 id="selectedExamCourseTitle"></h3>
          <p id="selectedExamCourseDescription"></p>
        </div>
        <div class="loading" id="examsLoading" style="display: none;">Loading exams...</div>
        <div id="examsContainer">
          <div class="no-course-selected">
            <h3>Select a Course</h3>
            <p>Choose a course from the dropdown above to manage its exams.</p>
          </div>
        </div>
      </div>
    `;

    main.appendChild(examManagementDiv);

    // Add event listeners
    this.setupExamManagementEventListeners();

    // Load instructor's courses for selection
    await this.loadCoursesForExamManagement();
  }

  static setupExamManagementEventListeners() {
    // Get helper functions from global scope
    const { getUser, showRoleDashboard } = window.dashboardUtils || {};

    // Back to dashboard button
    document
      .getElementById("backToDashboardFromExams")
      .addEventListener("click", () => {
        document.getElementById("examManagement").remove();
        if (getUser && showRoleDashboard) {
          const user = getUser();
          showRoleDashboard(user);
        }
      });

    // Course selector change
    document
      .getElementById("examCourseSelector")
      .addEventListener("change", async (e) => {
        const courseId = e.target.value;
        const createBtn = document.getElementById("createExamBtn");

        if (courseId) {
          createBtn.disabled = false;
          await this.loadExamsForCourse(courseId);
        } else {
          createBtn.disabled = true;
          this.showNoCourseSelectedForExams();
        }
      });

    // Create exam button
    document.getElementById("createExamBtn").addEventListener("click", () => {
      const courseId = document.getElementById("examCourseSelector").value;
      if (courseId) {
        this.showExamForm(null, courseId);
      }
    });

    // Cancel form button
    document.getElementById("cancelExamForm").addEventListener("click", () => {
      this.hideExamForm();
    });

    // Exam form submission
    document
      .getElementById("examFormElement")
      .addEventListener("submit", async (e) => {
        e.preventDefault();
        await this.saveExam();
      });
  }

  static async loadCoursesForExamManagement() {
    try {
      const { getToken } = window.dashboardUtils || {};
      if (!getToken) {
        throw new Error("Dashboard utilities not available");
      }

      const token = getToken();
      const API_BASE_URL = "http://localhost:3761/api";

      const response = await fetch(
        `${API_BASE_URL}/courses/instructor/my-courses`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );
      const data = await response.json();

      if (data.success) {
        const courseSelector = document.getElementById("examCourseSelector");
        courseSelector.innerHTML =
          '<option value="">Select a course...</option>';

        data.data.forEach((course) => {
          const option = document.createElement("option");
          option.value = course._id;
          option.textContent = `${course.title} (${
            course.isActive ? "Active" : "Inactive"
          })`;
          courseSelector.appendChild(option);
        });
      } else {
        throw new Error(data.error || "Failed to load courses");
      }
    } catch (error) {
      console.error("Error loading courses for exam management:", error);
      alert(`Error loading courses: ${error.message}`);
    }
  }

  static async loadExamsForCourse(courseId) {
    const loading = document.getElementById("examsLoading");
    const container = document.getElementById("examsContainer");
    const courseInfoDisplay = document.getElementById("examCourseInfoDisplay");

    try {
      loading.style.display = "block";
      container.innerHTML = "";
      courseInfoDisplay.style.display = "none";

      const { getToken } = window.dashboardUtils || {};
      if (!getToken) {
        throw new Error("Dashboard utilities not available");
      }

      const token = getToken();
      const API_BASE_URL = "http://localhost:3761/api";

      // Load course info and exams
      const [courseResponse, examsResponse] = await Promise.all([
        fetch(`${API_BASE_URL}/courses/${courseId}`, {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }),
        fetch(`${API_BASE_URL}/exams?course=${courseId}`, {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }),
      ]);

      const courseData = await courseResponse.json();
      const examsData = await examsResponse.json();

      if (courseData.success) {
        // Display course info
        document.getElementById("selectedExamCourseTitle").textContent =
          courseData.data.title;
        document.getElementById("selectedExamCourseDescription").textContent =
          courseData.data.description;
        courseInfoDisplay.style.display = "block";
      }

      if (examsData.success) {
        this.displayExams(examsData.data || [], courseId);
      } else {
        this.displayExams([], courseId);
      }
    } catch (error) {
      console.error("Error loading exams:", error);
      container.innerHTML = `<div class="error-message">Error loading exams: ${error.message}</div>`;
    } finally {
      loading.style.display = "none";
    }
  }

  static displayExams(exams, courseId) {
    const container = document.getElementById("examsContainer");

    if (exams.length === 0) {
      container.innerHTML = `
        <div class="no-exams">
          <h3>No exams yet</h3>
          <p>Create your first exam for this course!</p>
        </div>
      `;
      return;
    }

    container.innerHTML = exams
      .map(
        (exam) => `
        <div class="exam-card ${
          !exam.isActive ? "inactive" : ""
        }" data-exam-id="${exam._id}">
          <div class="exam-header">
            <h3>${exam.title}</h3>
            <div class="exam-status">
              <span class="status-badge ${
                exam.isActive ? "active" : "inactive"
              }">
                ${exam.isActive ? "Active" : "Inactive"}
              </span>
              <span class="type-badge type-${
                exam.type || "quiz"
              }">${this.formatExamType(exam.type)}</span>
            </div>
          </div>
          
          <div class="exam-info">
            <div class="exam-description">
              <strong>Description:</strong>
              <p>${this.truncateText(
                exam.description || "No description provided",
                200
              )}</p>
            </div>
            
            <div class="exam-meta">
              <span class="created">Created: ${new Date(
                exam.createdAt || Date.now()
              ).toLocaleDateString()}</span>
              ${
                exam.updatedAt !== exam.createdAt
                  ? `<span class="updated">Updated: ${new Date(
                      exam.updatedAt
                    ).toLocaleDateString()}</span>`
                  : ""
              }
            </div>
          </div>
          
          <div class="exam-actions">
            <button class="btn-edit" onclick="window.instructorHandler.editExam('${
              exam._id
            }', '${courseId}')">Edit</button>
            <button class="btn-toggle" onclick="window.instructorHandler.toggleExamStatus('${
              exam._id
            }', ${exam.isActive}, '${courseId}')">
              ${exam.isActive ? "Deactivate" : "Activate"}
            </button>
            <button class="btn-delete" onclick="window.instructorHandler.deleteExam('${
              exam._id
            }', '${exam.title}', '${courseId}')">Delete</button>
          </div>
        </div>
      `
      )
      .join("");
  }

  static formatExamType(type) {
    const types = {
      quiz: "Quiz",
      midterm: "Midterm",
      final: "Final Exam",
      assignment: "Assignment",
    };
    return types[type] || "Quiz";
  }

  static showNoCourseSelectedForExams() {
    const container = document.getElementById("examsContainer");
    const courseInfoDisplay = document.getElementById("examCourseInfoDisplay");

    courseInfoDisplay.style.display = "none";
    container.innerHTML = `
      <div class="no-course-selected">
        <h3>Select a Course</h3>
        <p>Choose a course from the dropdown above to manage its exams.</p>
      </div>
    `;
  }

  static showExamForm(exam = null, courseId = null) {
    const form = document.getElementById("examForm");
    const formTitle = document.getElementById("examFormTitle");
    const formElement = document.getElementById("examFormElement");

    if (exam) {
      formTitle.textContent = "Edit Exam";
      // Populate form with exam data
      document.getElementById("examTitle").value = exam.title || "";
      document.getElementById("examType").value = exam.type || "quiz";
      document.getElementById("examDescription").value = exam.description || "";
      document.getElementById("examActive").checked = exam.isActive !== false;
      formElement.dataset.examId = exam._id;
      formElement.dataset.courseId = courseId || exam.course;
    } else {
      formTitle.textContent = "Create New Exam";
      formElement.reset();
      document.getElementById("examActive").checked = true;
      delete formElement.dataset.examId;
      formElement.dataset.courseId = courseId;
    }

    form.style.display = "block";
    form.scrollIntoView({ behavior: "smooth" });
  }

  static hideExamForm() {
    document.getElementById("examForm").style.display = "none";
    document.getElementById("examFormElement").reset();
  }

  static async saveExam() {
    const form = document.getElementById("examFormElement");
    const formData = new FormData(form);
    const examId = form.dataset.examId;
    const courseId = form.dataset.courseId;

    // Prepare exam data
    const examData = {
      title: formData.get("title").trim(),
      description: formData.get("description").trim(),
      type: formData.get("type"),
      course: courseId,
      isActive: formData.get("isActive") === "on",
    };

    try {
      const saveBtn = document.getElementById("saveExamForm");
      saveBtn.disabled = true;
      saveBtn.textContent = "Saving...";

      const { getToken } = window.dashboardUtils || {};
      if (!getToken) {
        throw new Error("Dashboard utilities not available");
      }

      const token = getToken();
      const API_BASE_URL = "http://localhost:3761/api";
      const url = examId
        ? `${API_BASE_URL}/exams/${examId}`
        : `${API_BASE_URL}/exams`;

      const method = examId ? "PUT" : "POST";

      const response = await fetch(url, {
        method: method,
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(examData),
      });

      const data = await response.json();

      if (data.success) {
        this.hideExamForm();
        await this.loadExamsForCourse(courseId);
        alert(
          examId ? "Exam updated successfully!" : "Exam created successfully!"
        );
      } else {
        throw new Error(
          data.error || data.errors?.[0]?.msg || "Failed to save exam"
        );
      }
    } catch (error) {
      console.error("Error saving exam:", error);
      alert(`Error saving exam: ${error.message}`);
    } finally {
      const saveBtn = document.getElementById("saveExamForm");
      saveBtn.disabled = false;
      saveBtn.textContent = "Save Exam";
    }
  }

  static async editExam(examId, courseId) {
    try {
      const { getToken } = window.dashboardUtils || {};
      if (!getToken) {
        throw new Error("Dashboard utilities not available");
      }

      const token = getToken();
      const API_BASE_URL = "http://localhost:3761/api";
      const response = await fetch(`${API_BASE_URL}/exams/${examId}`, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });

      const data = await response.json();

      if (data.success) {
        this.showExamForm(data.data, courseId);
      } else {
        throw new Error(data.error || "Failed to load exam details");
      }
    } catch (error) {
      console.error("Error loading exam for edit:", error);
      alert(`Error loading exam: ${error.message}`);
    }
  }

  static async toggleExamStatus(examId, currentStatus, courseId) {
    try {
      const { getToken } = window.dashboardUtils || {};
      if (!getToken) {
        throw new Error("Dashboard utilities not available");
      }

      const token = getToken();
      const API_BASE_URL = "http://localhost:3761/api";

      // First, get the full exam data
      const examResponse = await fetch(`${API_BASE_URL}/exams/${examId}`, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });

      const examData = await examResponse.json();
      if (!examData.success) {
        throw new Error(examData.error || "Failed to load exam data");
      }

      const exam = examData.data;

      // Update the exam with the new status
      const updateData = {
        title: exam.title,
        description: exam.description,
        type: exam.type,
        isActive: !currentStatus,
      };

      const response = await fetch(`${API_BASE_URL}/exams/${examId}`, {
        method: "PUT",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(updateData),
      });

      const data = await response.json();

      if (data.success) {
        await this.loadExamsForCourse(courseId);
        console.log(
          `Exam ${!currentStatus ? "activated" : "deactivated"} successfully!`
        );
      } else {
        throw new Error(
          data.error || data.errors?.[0]?.msg || "Failed to update exam status"
        );
      }
    } catch (error) {
      console.error("Error toggling exam status:", error);
      alert(`Error updating exam: ${error.message}`);
    }
  }

  static async deleteExam(examId, examTitle, courseId) {
    if (
      !confirm(
        `Are you sure you want to delete "${examTitle}"? This action cannot be undone.`
      )
    ) {
      return;
    }

    try {
      const { getToken } = window.dashboardUtils || {};
      if (!getToken) {
        throw new Error("Dashboard utilities not available");
      }

      const token = getToken();
      const API_BASE_URL = "http://localhost:3761/api";
      const response = await fetch(`${API_BASE_URL}/exams/${examId}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });

      const data = await response.json();

      if (data.success) {
        await this.loadExamsForCourse(courseId);
        alert("Exam deleted successfully!");
      } else {
        throw new Error(data.error || "Failed to delete exam");
      }
    } catch (error) {
      console.error("Error deleting exam:", error);
      alert(`Error deleting exam: ${error.message}`);
    }
  }

  // Analytics Functions
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
      const user = getUser();

      if (!token || !user) {
        alert("Please log in to access analytics.");
        redirectToLogin();
        return;
      }

      if (user.role !== "instructor") {
        alert("Access denied. Only instructors can view analytics.");
        return;
      }

      // Hide all role dashboards
      const roleDashboards = document.querySelectorAll(".role-dashboard");
      roleDashboards.forEach((dashboard) => {
        dashboard.style.display = "none";
      });

      // Create and show analytics interface
      await this.createAnalyticsInterface();
    } catch (error) {
      console.error("Error showing analytics:", error);
      alert("Error loading analytics. Please try again.");
    }
  }

  static async createAnalyticsInterface() {
    const main = document.querySelector("main.dashboard-content");

    // Create analytics container
    const analyticsDiv = document.createElement("div");
    analyticsDiv.id = "analyticsManagement";
    analyticsDiv.className = "role-dashboard";

    analyticsDiv.innerHTML = `
      <div class="analytics-header">
        <h2>📊 Instructor Analytics Dashboard</h2>
        <div class="analytics-actions">
          <button id="backToDashboardFromAnalytics" class="btn-secondary">← Back</button>
          <div class="date-filter">
            <select id="timeRangeSelector">
              <option value="7">Last 7 days</option>
              <option value="30" selected>Last 30 days</option>
              <option value="90">Last 3 months</option>
              <option value="365">Last year</option>
            </select>
            <button id="refreshAnalytics" class="btn-primary">🔄 Refresh</button>
          </div>
        </div>
      </div>

      <!-- Loading State -->
      <div id="analyticsLoading" class="loading-state" style="display: none;">
        <div class="loading-spinner">📈</div>
        <p>Loading analytics data...</p>
      </div>

      <!-- Analytics Content -->
      <div id="analyticsContent" class="analytics-content">
        
        <!-- 1. Overview Dashboard -->
        <section class="analytics-section">
          <h3>📈 Overview Dashboard</h3>
          <div class="overview-cards">
            <div class="analytics-card">
              <div class="card-icon">📚</div>
              <div class="card-content">
                <h4 id="totalCourses">-</h4>
                <p>Total Courses</p>
              </div>
            </div>
            <div class="analytics-card">
              <div class="card-icon">👥</div>
              <div class="card-content">
                <h4 id="totalStudents">-</h4>
                <p>Total Students</p>
              </div>
            </div>
            <div class="analytics-card">
              <div class="card-icon">⚡</div>
              <div class="card-content">
                <h4 id="activeStudents">-</h4>
                <p>Active Students</p>
              </div>
            </div>
            <div class="analytics-card">
              <div class="card-icon">🎯</div>
              <div class="card-content">
                <h4 id="avgCompletionRate">-</h4>
                <p>Avg Completion Rate</p>
              </div>
            </div>
            <div class="analytics-card">
              <div class="card-icon">💰</div>
              <div class="card-content">
                <h4 id="totalRevenue">-</h4>
                <p>Total Revenue</p>
              </div>
            </div>
          </div>
        </section>

        <!-- 2. Course Performance Analysis -->
        <section class="analytics-section">
          <h3>📊 Course Performance Analysis</h3>
          <div class="chart-grid">
            <div class="chart-container">
              <h4>Course Enrollment Distribution</h4>
              <canvas id="courseEnrollmentChart" width="400" height="200"></canvas>
            </div>
            <div class="chart-container">
              <h4>Course Completion Rates</h4>
              <canvas id="courseCompletionChart" width="400" height="200"></canvas>
            </div>
          </div>
          
          <!-- Course Performance Table -->
          <div class="table-container">
            <h4>Course Performance Details</h4>
            <table id="coursePerformanceTable" class="analytics-table">
              <thead>
                <tr>
                  <th>Course</th>
                  <th>Enrollments</th>
                  <th>Completion Rate</th>
                  <th>Avg Grade</th>
                  <th>Revenue</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                <!-- Data will be populated here -->
              </tbody>
            </table>
          </div>
        </section>

        <!-- 3. Student Performance Analysis -->
        <section class="analytics-section">
          <h3>👨‍🎓 Student Performance Analysis</h3>
          <div class="chart-grid">
            <div class="chart-container">
              <h4>Student Progress Distribution</h4>
              <canvas id="studentProgressChart" width="400" height="200"></canvas>
            </div>
            <div class="chart-container">
              <h4>Grade Distribution</h4>
              <canvas id="gradeDistributionChart" width="400" height="200"></canvas>
            </div>
          </div>

          <!-- Student Performance Insights -->
          <div class="insights-container">
            <div class="insight-card">
              <h4>🚨 Students Needing Attention</h4>
              <div id="strugglingStudents" class="student-list">
                <!-- Students with low progress will be listed here -->
              </div>
            </div>
            <div class="insight-card">
              <h4>⭐ Top Performers</h4>
              <div id="topStudents" class="student-list">
                <!-- Top performing students will be listed here -->
              </div>
            </div>
          </div>
        </section>

      </div>
    `;

    main.appendChild(analyticsDiv);

    // Add event listeners
    this.setupAnalyticsEventListeners();

    // Load analytics data
    await this.loadAnalyticsData();
  }

  static setupAnalyticsEventListeners() {
    // Get helper functions from global scope
    const { getUser, showRoleDashboard } = window.dashboardUtils || {};

    // Back to dashboard button
    document
      .getElementById("backToDashboardFromAnalytics")
      .addEventListener("click", () => {
        document.getElementById("analyticsManagement").remove();
        if (getUser && showRoleDashboard) {
          const user = getUser();
          showRoleDashboard(user);
        }
      });

    // Time range selector
    document
      .getElementById("timeRangeSelector")
      .addEventListener("change", async () => {
        await this.loadAnalyticsData();
      });

    // Refresh button
    document
      .getElementById("refreshAnalytics")
      .addEventListener("click", async () => {
        await this.loadAnalyticsData();
      });
  }

  static async loadAnalyticsData() {
    const loading = document.getElementById("analyticsLoading");
    const content = document.getElementById("analyticsContent");

    try {
      loading.style.display = "block";
      content.style.opacity = "0.5";

      const { getToken } = window.dashboardUtils || {};
      if (!getToken) {
        throw new Error("Dashboard utilities not available");
      }

      const token = getToken();
      const API_BASE_URL = "http://localhost:3761/api";
      const timeRange = document.getElementById("timeRangeSelector").value;

      // Load multiple analytics endpoints in parallel
      const [coursesData, analyticsData] = await Promise.all([
        // Get instructor's courses
        fetch(`${API_BASE_URL}/courses/instructor/my-courses`, {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }).then((res) => res.json()),

        // Get analytics data from backend
        fetch(`${API_BASE_URL}/analytics/top-courses`, {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        })
          .then((res) => res.json())
          .catch(() => ({ success: false, data: [] })),
      ]);

      if (coursesData.success) {
        // Generate enrollment data based on actual courses
        const enrollmentData = await this.getMockEnrollmentData(
          coursesData.data
        );

        await this.populateAnalytics(
          coursesData.data,
          enrollmentData,
          analyticsData.data || []
        );
      } else {
        throw new Error("Failed to load course data");
      }
    } catch (error) {
      console.error("Error loading analytics:", error);
      content.innerHTML = `<div class="error-message">Error loading analytics: ${error.message}</div>`;
    } finally {
      loading.style.display = "none";
      content.style.opacity = "1";
    }
  }

  static async getMockEnrollmentData(courses = []) {
    // Mock enrollment data for demonstration
    // In a real app, this would come from an enrollments API

    // If no courses provided, return empty data
    if (courses.length === 0) {
      return {
        enrollments: [],
        students: [],
      };
    }

    // Generate realistic mock data based on actual course IDs
    const students = [
      { id: "s1", name: "Alice Johnson", email: "alice@example.com" },
      { id: "s2", name: "Bob Smith", email: "bob@example.com" },
      { id: "s3", name: "Charlie Brown", email: "charlie@example.com" },
      { id: "s4", name: "Diana Wilson", email: "diana@example.com" },
      { id: "s5", name: "Eve Davis", email: "eve@example.com" },
      { id: "s6", name: "Frank Miller", email: "frank@example.com" },
      { id: "s7", name: "Grace Chen", email: "grace@example.com" },
      { id: "s8", name: "Henry Adams", email: "henry@example.com" },
      { id: "s9", name: "Ivy Rodriguez", email: "ivy@example.com" },
      { id: "s10", name: "Jack Thompson", email: "jack@example.com" },
    ];

    const enrollments = [];

    // Generate enrollments for each course
    courses.forEach((course, courseIndex) => {
      // Each course gets 3-8 students
      const numStudents = Math.floor(Math.random() * 6) + 3;
      const selectedStudents = students.slice(0, numStudents);

      selectedStudents.forEach((student, studentIndex) => {
        // Generate realistic progress and grades
        const baseProgress = Math.floor(Math.random() * 100);
        const progressVariation = Math.floor(Math.random() * 20) - 10;
        const progress = Math.max(
          0,
          Math.min(100, baseProgress + progressVariation)
        );

        // Grade generally correlates with progress but has some variation
        const baseGrade = Math.max(
          0,
          Math.min(100, progress + Math.floor(Math.random() * 20) - 10)
        );

        enrollments.push({
          courseId: course._id, // Use actual course ID
          studentId: student.id,
          progress: progress,
          grade: baseGrade,
          enrolledAt: new Date(
            Date.now() - Math.random() * 90 * 24 * 60 * 60 * 1000
          ), // Random date within last 90 days
        });
      });
    });

    return {
      enrollments,
      students,
    };
  }

  static async populateAnalytics(courses, enrollmentData, analyticsData) {
    // 1. Populate Overview Cards
    this.populateOverviewCards(courses, enrollmentData);

    // 2. Create Course Performance Charts
    this.createCourseCharts(courses, enrollmentData);

    // 3. Populate Course Performance Table
    this.populateCourseTable(courses, enrollmentData);

    // 4. Create Student Performance Charts
    this.createStudentCharts(enrollmentData);

    // 5. Populate Student Insights
    this.populateStudentInsights(enrollmentData);
  }

  static populateOverviewCards(courses, enrollmentData) {
    const totalCourses = courses.length;
    const totalStudents = new Set(
      enrollmentData.enrollments.map((e) => e.studentId)
    ).size;
    const activeStudents = enrollmentData.enrollments.filter(
      (e) => e.progress > 10
    ).length;

    const completionRates = enrollmentData.enrollments.map((e) => e.progress);
    const avgCompletionRate =
      completionRates.length > 0
        ? Math.round(
            completionRates.reduce((a, b) => a + b, 0) / completionRates.length
          )
        : 0;

    const totalRevenue = courses.reduce((sum, course) => {
      const courseEnrollments = enrollmentData.enrollments.filter(
        (e) => e.courseId === course._id
      ).length;
      return sum + course.price * courseEnrollments;
    }, 0);

    document.getElementById("totalCourses").textContent = totalCourses;
    document.getElementById("totalStudents").textContent = totalStudents;
    document.getElementById("activeStudents").textContent = activeStudents;
    document.getElementById(
      "avgCompletionRate"
    ).textContent = `${avgCompletionRate}%`;
    document.getElementById(
      "totalRevenue"
    ).textContent = `$${totalRevenue.toFixed(2)}`;
  }

  static createCourseCharts(courses, enrollmentData) {
    console.log("Creating course charts with:", {
      courses: courses.length,
      enrollments: enrollmentData.enrollments.length,
    });

    // Course Enrollment Chart (Pie Chart)
    const enrollmentCtx = document
      .getElementById("courseEnrollmentChart")
      .getContext("2d");
    const courseEnrollments = courses.map((course) => {
      const count = enrollmentData.enrollments.filter(
        (e) => e.courseId === course._id
      ).length;
      console.log(
        `Course ${course.title} (${course._id}): ${count} enrollments`
      );
      return {
        label: course.title,
        count: count,
      };
    });

    this.createSimplePieChart(enrollmentCtx, {
      labels: courseEnrollments.map((c) => c.label),
      data: courseEnrollments.map((c) => c.count),
      title: "Course Enrollments",
    });

    // Course Completion Chart (Bar Chart)
    const completionCtx = document
      .getElementById("courseCompletionChart")
      .getContext("2d");
    const courseCompletions = courses.map((course) => {
      const courseEnrolls = enrollmentData.enrollments.filter(
        (e) => e.courseId === course._id
      );
      const avgProgress =
        courseEnrolls.length > 0
          ? courseEnrolls.reduce((sum, e) => sum + e.progress, 0) /
            courseEnrolls.length
          : 0;
      console.log(
        `Course ${course.title}: ${courseEnrolls.length} enrollments, ${avgProgress}% avg progress`
      );
      return {
        label: course.title,
        completion: Math.round(avgProgress),
      };
    });

    this.createSimpleBarChart(completionCtx, {
      labels: courseCompletions.map((c) => c.label),
      data: courseCompletions.map((c) => c.completion),
      title: "Average Completion Rate (%)",
    });
  }

  static populateCourseTable(courses, enrollmentData) {
    console.log("Populating course table with:", {
      courses: courses.length,
      enrollments: enrollmentData.enrollments.length,
    });

    const tbody = document.querySelector("#coursePerformanceTable tbody");
    tbody.innerHTML = "";

    if (courses.length === 0) {
      tbody.innerHTML =
        '<tr><td colspan="6" style="text-align: center; color: #666;">No courses available</td></tr>';
      return;
    }

    courses.forEach((course) => {
      const courseEnrolls = enrollmentData.enrollments.filter(
        (e) => e.courseId === course._id
      );
      const enrollmentCount = courseEnrolls.length;
      const avgProgress =
        courseEnrolls.length > 0
          ? Math.round(
              courseEnrolls.reduce((sum, e) => sum + e.progress, 0) /
                courseEnrolls.length
            )
          : 0;
      const avgGrade =
        courseEnrolls.length > 0
          ? Math.round(
              courseEnrolls.reduce((sum, e) => sum + e.grade, 0) /
                courseEnrolls.length
            )
          : 0;
      const revenue = course.price * enrollmentCount;

      console.log(
        `Course ${course.title}: ${enrollmentCount} enrollments, ${avgProgress}% progress, ${avgGrade}% grade, $${revenue} revenue`
      );

      const row = `
        <tr>
          <td>${course.title}</td>
          <td>${enrollmentCount}</td>
          <td>${avgProgress}%</td>
          <td>${avgGrade}%</td>
          <td>$${revenue.toFixed(2)}</td>
          <td><span class="status-badge ${
            course.isActive ? "active" : "inactive"
          }">${course.isActive ? "Active" : "Inactive"}</span></td>
        </tr>
      `;
      tbody.innerHTML += row;
    });
  }

  static createStudentCharts(enrollmentData) {
    // Student Progress Distribution (Histogram-style bar chart)
    const progressCtx = document
      .getElementById("studentProgressChart")
      .getContext("2d");
    const progressRanges = {
      "0-25%": 0,
      "26-50%": 0,
      "51-75%": 0,
      "76-100%": 0,
    };

    enrollmentData.enrollments.forEach((e) => {
      if (e.progress <= 25) progressRanges["0-25%"]++;
      else if (e.progress <= 50) progressRanges["26-50%"]++;
      else if (e.progress <= 75) progressRanges["51-75%"]++;
      else progressRanges["76-100%"]++;
    });

    this.createSimpleBarChart(progressCtx, {
      labels: Object.keys(progressRanges),
      data: Object.values(progressRanges),
      title: "Student Progress Distribution",
    });

    // Grade Distribution Chart
    const gradeCtx = document
      .getElementById("gradeDistributionChart")
      .getContext("2d");
    const gradeRanges = {
      "F (0-59)": 0,
      "D (60-69)": 0,
      "C (70-79)": 0,
      "B (80-89)": 0,
      "A (90-100)": 0,
    };

    enrollmentData.enrollments.forEach((e) => {
      if (e.grade < 60) gradeRanges["F (0-59)"]++;
      else if (e.grade < 70) gradeRanges["D (60-69)"]++;
      else if (e.grade < 80) gradeRanges["C (70-79)"]++;
      else if (e.grade < 90) gradeRanges["B (80-89)"]++;
      else gradeRanges["A (90-100)"]++;
    });

    this.createSimplePieChart(gradeCtx, {
      labels: Object.keys(gradeRanges),
      data: Object.values(gradeRanges),
      title: "Grade Distribution",
    });
  }

  static populateStudentInsights(enrollmentData) {
    // Students needing attention (low progress)
    const strugglingContainer = document.getElementById("strugglingStudents");
    const strugglingStudents = enrollmentData.enrollments
      .filter((e) => e.progress < 50)
      .map((e) => {
        const student = enrollmentData.students.find(
          (s) => s.id === e.studentId
        );
        return { ...e, name: student?.name, email: student?.email };
      })
      .sort((a, b) => a.progress - b.progress);

    if (strugglingStudents.length === 0) {
      strugglingContainer.innerHTML = "<p>🎉 All students are doing well!</p>";
    } else {
      strugglingContainer.innerHTML = strugglingStudents
        .slice(0, 5) // Show top 5
        .map(
          (s) => `
          <div class="student-item">
            <strong>${s.name}</strong>
            <span class="progress-badge low">${s.progress}% progress</span>
            <small>${s.email}</small>
          </div>
        `
        )
        .join("");
    }

    // Top performers
    const topContainer = document.getElementById("topStudents");
    const topStudents = enrollmentData.enrollments
      .filter((e) => e.progress > 80)
      .map((e) => {
        const student = enrollmentData.students.find(
          (s) => s.id === e.studentId
        );
        return { ...e, name: student?.name, email: student?.email };
      })
      .sort((a, b) => b.progress - a.progress);

    if (topStudents.length === 0) {
      topContainer.innerHTML = "<p>No top performers yet.</p>";
    } else {
      topContainer.innerHTML = topStudents
        .slice(0, 5) // Show top 5
        .map(
          (s) => `
          <div class="student-item">
            <strong>${s.name}</strong>
            <span class="progress-badge high">${s.progress}% progress</span>
            <small>${s.email}</small>
          </div>
        `
        )
        .join("");
    }
  }

  // Simple Chart Creation Functions (Canvas-based)
  static createSimpleBarChart(ctx, { labels, data, title }) {
    const canvas = ctx.canvas;
    const width = canvas.width;
    const height = canvas.height;

    ctx.clearRect(0, 0, width, height);

    // Colors
    const barColor = "#4CAF50";
    const textColor = "#333";
    const axisColor = "#666";

    // Margins
    const margin = { top: 40, right: 20, bottom: 60, left: 60 };
    const chartWidth = width - margin.left - margin.right;
    const chartHeight = height - margin.top - margin.bottom;

    // Draw title
    ctx.fillStyle = textColor;
    ctx.font = "16px Arial";
    ctx.textAlign = "center";
    ctx.fillText(title, width / 2, 25);

    // Check if we have data
    if (data.length === 0 || data.every((d) => d === 0)) {
      ctx.fillStyle = "#ccc";
      ctx.font = "14px Arial";
      ctx.fillText("No data available", width / 2, height / 2);
      return;
    }

    // Max value for scaling
    const maxValue = Math.max(...data, 1);

    // Draw bars
    const barWidth = (chartWidth / labels.length) * 0.8;
    const barSpacing = (chartWidth / labels.length) * 0.2;

    data.forEach((value, index) => {
      const barHeight = (value / maxValue) * chartHeight;
      const x = margin.left + index * (barWidth + barSpacing) + barSpacing / 2;
      const y = margin.top + chartHeight - barHeight;

      // Draw bar
      ctx.fillStyle = barColor;
      ctx.fillRect(x, y, barWidth, barHeight);

      // Draw value on top of bar
      ctx.fillStyle = textColor;
      ctx.font = "12px Arial";
      ctx.textAlign = "center";
      ctx.fillText(value, x + barWidth / 2, y - 5);

      // Draw label
      ctx.save();
      ctx.translate(x + barWidth / 2, height - 10);
      ctx.rotate(-Math.PI / 4);
      ctx.textAlign = "right";
      const truncatedLabel =
        labels[index].length > 10
          ? labels[index].substring(0, 10) + "..."
          : labels[index];
      ctx.fillText(truncatedLabel, 0, 0);
      ctx.restore();
    });

    // Draw axes
    ctx.strokeStyle = axisColor;
    ctx.lineWidth = 1;
    ctx.beginPath();
    // Y-axis
    ctx.moveTo(margin.left, margin.top);
    ctx.lineTo(margin.left, margin.top + chartHeight);
    // X-axis
    ctx.lineTo(margin.left + chartWidth, margin.top + chartHeight);
    ctx.stroke();
  }

  static createSimplePieChart(ctx, { labels, data, title }) {
    const canvas = ctx.canvas;
    const width = canvas.width;
    const height = canvas.height;

    ctx.clearRect(0, 0, width, height);

    // Colors
    const colors = [
      "#FF6384",
      "#36A2EB",
      "#FFCE56",
      "#4BC0C0",
      "#9966FF",
      "#FF9F40",
    ];
    const textColor = "#333";

    // Chart area
    const centerX = width / 2;
    const centerY = height / 2 + 10;
    const radius = Math.min(width, height) / 3;

    // Draw title
    ctx.fillStyle = textColor;
    ctx.font = "16px Arial";
    ctx.textAlign = "center";
    ctx.fillText(title, width / 2, 25);

    // Calculate total
    const total = data.reduce((sum, value) => sum + value, 0);

    if (total === 0) {
      ctx.fillStyle = "#ccc";
      ctx.font = "14px Arial";
      ctx.fillText("No data available", centerX, centerY);
      return;
    }

    // Draw pie slices
    let startAngle = 0;
    data.forEach((value, index) => {
      if (value > 0) {
        // Only draw slices with data
        const sliceAngle = (value / total) * 2 * Math.PI;

        ctx.fillStyle = colors[index % colors.length];
        ctx.beginPath();
        ctx.moveTo(centerX, centerY);
        ctx.arc(centerX, centerY, radius, startAngle, startAngle + sliceAngle);
        ctx.closePath();
        ctx.fill();

        // Draw percentage label
        const labelAngle = startAngle + sliceAngle / 2;
        const labelX = centerX + Math.cos(labelAngle) * (radius * 0.7);
        const labelY = centerY + Math.sin(labelAngle) * (radius * 0.7);

        ctx.fillStyle = "white";
        ctx.font = "12px Arial";
        ctx.textAlign = "center";
        const percentage = Math.round((value / total) * 100);
        if (percentage > 5) {
          // Only show label if slice is big enough
          ctx.fillText(`${percentage}%`, labelX, labelY);
        }

        startAngle += sliceAngle;
      }
    });

    // Draw legend
    const legendX = 20;
    let legendY = height - labels.length * 20 - 10;

    labels.forEach((label, index) => {
      if (data[index] > 0) {
        // Color box
        ctx.fillStyle = colors[index % colors.length];
        ctx.fillRect(legendX, legendY, 15, 15);

        // Label text
        ctx.fillStyle = textColor;
        ctx.font = "12px Arial";
        ctx.textAlign = "left";
        const truncatedLabel =
          label.length > 15 ? label.substring(0, 15) + "..." : label;
        ctx.fillText(
          `${truncatedLabel} (${data[index]})`,
          legendX + 20,
          legendY + 12
        );

        legendY += 20;
      }
    });
  }
}
