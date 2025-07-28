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

    // Create simplified course management container
    const courseManagementDiv = document.createElement("div");
    courseManagementDiv.id = "courseManagement";
    courseManagementDiv.className = "role-dashboard";

    courseManagementDiv.innerHTML = `
      <div class="course-management-header">
        <h2>Course Management</h2>
        <div class="course-actions">
          <button id="backToDashboard" class="btn-secondary">← Back</button>
          <button id="createCourseBtn" class="btn-primary">+ Add Course</button>
        </div>
      </div>

      <!-- Simple Course Form -->
      <div id="courseForm" class="course-form" style="display: none;">
        <h3 id="formTitle">Add Course</h3>
        <form id="courseFormElement">
          <div class="form-group">
            <label for="courseTitle">Title *</label>
            <input type="text" id="courseTitle" name="title" required>
          </div>
          <div class="form-group">
            <label for="courseDescription">Description *</label>
            <textarea id="courseDescription" name="description" required rows="3"></textarea>
          </div>
          <div class="form-group">
            <label for="coursePrice">Price ($) *</label>
            <input type="number" id="coursePrice" name="price" min="0" value="0" required>
          </div>
          <div class="form-actions">
            <button type="button" id="cancelForm" class="btn-secondary">Cancel</button>
            <button type="submit" id="saveForm" class="btn-primary">Save</button>
          </div>
        </form>
      </div>

      <!-- Simple Courses List -->
      <div id="coursesList">
        <div id="coursesLoading" style="display: none;">Loading...</div>
        <div id="coursesContainer"></div>
      </div>
    `;

    main.appendChild(courseManagementDiv);
    this.setupCourseManagementEventListeners();
    await this.loadInstructorCourses();
  }

  static setupCourseManagementEventListeners() {
    const { getUser, showRoleDashboard } = window.dashboardUtils || {};

    // Back button
    document.getElementById("backToDashboard").addEventListener("click", () => {
      document.getElementById("courseManagement").remove();
      if (getUser && showRoleDashboard) {
        showRoleDashboard(getUser());
      }
    });

    // Create course button
    document.getElementById("createCourseBtn").addEventListener("click", () => {
      this.showCourseForm();
    });

    // Cancel button
    document.getElementById("cancelForm").addEventListener("click", () => {
      this.hideCourseForm();
    });

    // Form submission
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
      document.getElementById("courseTitle").value = course.title || "";
      document.getElementById("courseDescription").value =
        course.description || "";
      document.getElementById("coursePrice").value = course.price || 0;
      formElement.dataset.courseId = course._id;
    } else {
      formTitle.textContent = "Add Course";
      formElement.reset();
      document.getElementById("coursePrice").value = "0";
      delete formElement.dataset.courseId;
    }

    form.style.display = "block";
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

      const { getToken } = window.dashboardUtils || {};
      if (!getToken) {
        throw new Error("Authentication not available");
      }

      const token = getToken();
      if (!token) {
        throw new Error("Please log in again");
      }

      const response = await fetch(
        "http://localhost:3761/api/courses/instructor/my-courses",
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );

      const data = await response.json();

      if (data.success) {
        this.displayCourses(data.data || []);
      } else {
        throw new Error(data.error || "Failed to load courses");
      }
    } catch (error) {
      console.error("Error loading courses:", error);
      container.innerHTML = `<div class="error-message">Error: ${error.message}</div>`;
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
          <p>Create your first course!</p>
        </div>
      `;
      return;
    }

    container.innerHTML = courses
      .map(
        (course) => `
        <div class="course-card" data-course-id="${course._id}">
          <h3>${course.title}</h3>
          <p>${course.description}</p>
          <div class="course-info">
            <span>$${course.price || 0}</span>
            <span class="status ${course.isActive ? "active" : "inactive"}">
              ${course.isActive ? "Active" : "Inactive"}
            </span>
          </div>
          <div class="course-actions">
            <button class="btn-edit" onclick="window.instructorHandler.editCourse('${
              course._id
            }')">Edit</button>
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

    const courseData = {
      title: formData.get("title").trim(),
      description: formData.get("description").trim(),
      price: parseFloat(formData.get("price")) || 0,
      category: "Other", // Default category
      level: "Beginner", // Default level
      isActive: true, // Default active
    };

    try {
      const saveBtn = document.getElementById("saveForm");
      saveBtn.disabled = true;
      saveBtn.textContent = "Saving...";

      const { getToken } = window.dashboardUtils || {};
      const token = getToken();

      const url = courseId
        ? `http://localhost:3761/api/courses/${courseId}`
        : "http://localhost:3761/api/courses";

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
        alert(courseId ? "Course updated!" : "Course created!");
      } else {
        throw new Error(data.error || "Failed to save course");
      }
    } catch (error) {
      console.error("Error saving course:", error);
      alert(`Error: ${error.message}`);
    } finally {
      const saveBtn = document.getElementById("saveForm");
      saveBtn.disabled = false;
      saveBtn.textContent = "Save";
    }
  }

  static async editCourse(courseId) {
    try {
      const { getToken } = window.dashboardUtils || {};
      const token = getToken();

      const response = await fetch(
        `http://localhost:3761/api/courses/${courseId}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );

      const data = await response.json();

      if (data.success) {
        this.showCourseForm(data.data);
      } else {
        throw new Error(data.error || "Failed to load course");
      }
    } catch (error) {
      console.error("Error loading course:", error);
      alert(`Error: ${error.message}`);
    }
  }

  static async deleteCourse(courseId, courseTitle) {
    if (!confirm(`Delete "${courseTitle}"? This cannot be undone.`)) {
      return;
    }

    try {
      const { getToken } = window.dashboardUtils || {};
      const token = getToken();

      const response = await fetch(
        `http://localhost:3761/api/courses/${courseId}`,
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
        await this.loadInstructorCourses();
        alert("Course deleted!");
      } else {
        throw new Error(data.error || "Failed to delete course");
      }
    } catch (error) {
      console.error("Error deleting course:", error);
      alert(`Error: ${error.message}`);
    }
  }

  // Lesson Management Functions
  static async showLessonManagement() {
    try {
      const { getToken, getUser, redirectToLogin } =
        window.dashboardUtils || {};

      if (!getToken || !getUser || !redirectToLogin) {
        console.error("Dashboard utilities not available");
        return;
      }

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

      const roleDashboards = document.querySelectorAll(".role-dashboard");
      roleDashboards.forEach((dashboard) => {
        dashboard.style.display = "none";
      });

      await this.createLessonManagementInterface();
    } catch (error) {
      console.error("Error showing lesson management:", error);
      alert("Error loading lesson management. Please try again.");
    }
  }

  static async createLessonManagementInterface() {
    const main = document.querySelector("main.dashboard-content");

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
          <button id="createLessonBtn" class="btn-primary" disabled>+ Add Lesson</button>
        </div>
      </div>

      <!-- Simple Lesson Form -->
      <div id="lessonForm" class="lesson-form" style="display: none;">
        <h3 id="lessonFormTitle">Add Lesson</h3>
        <form id="lessonFormElement">
          <div class="form-group">
            <label for="lessonTitle">Title *</label>
            <input type="text" id="lessonTitle" name="title" required>
          </div>
          <div class="form-group">
            <label for="lessonContent">Content *</label>
            <textarea id="lessonContent" name="content" required rows="5"></textarea>
          </div>
          <div class="form-group">
            <label for="lessonOrder">Order</label>
            <input type="number" id="lessonOrder" name="order" min="1" value="1">
          </div>
          <div class="form-actions">
            <button type="button" id="cancelLessonForm" class="btn-secondary">Cancel</button>
            <button type="submit" id="saveLessonForm" class="btn-primary">Save</button>
          </div>
        </form>
      </div>

      <!-- Simple Lessons List -->
      <div id="lessonsList">
        <div id="lessonsLoading" style="display: none;">Loading...</div>
        <div id="lessonsContainer">
          <div class="no-course-selected">
            <h3>Select a Course</h3>
            <p>Choose a course to manage its lessons.</p>
          </div>
        </div>
      </div>
    `;

    main.appendChild(lessonManagementDiv);
    this.setupLessonManagementEventListeners();
    await this.loadCoursesForLessonManagement();
  }

  static setupLessonManagementEventListeners() {
    const { getUser, showRoleDashboard } = window.dashboardUtils || {};

    // Back button
    document
      .getElementById("backToDashboardFromLessons")
      .addEventListener("click", () => {
        document.getElementById("lessonManagement").remove();
        if (getUser && showRoleDashboard) {
          showRoleDashboard(getUser());
        }
      });

    // Course selector
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

    // Cancel button
    document
      .getElementById("cancelLessonForm")
      .addEventListener("click", () => {
        this.hideLessonForm();
      });

    // Form submission
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
      const token = getToken();

      const response = await fetch(
        "http://localhost:3761/api/courses/instructor/my-courses",
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
          option.textContent = course.title;
          courseSelector.appendChild(option);
        });
      } else {
        throw new Error(data.error || "Failed to load courses");
      }
    } catch (error) {
      console.error("Error loading courses:", error);
      alert(`Error: ${error.message}`);
    }
  }

  static async loadLessonsForCourse(courseId) {
    const loading = document.getElementById("lessonsLoading");
    const container = document.getElementById("lessonsContainer");

    try {
      loading.style.display = "block";
      container.innerHTML = "";

      const { getToken } = window.dashboardUtils || {};
      const token = getToken();

      const response = await fetch(
        `http://localhost:3761/api/lessons?course=${courseId}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );

      const data = await response.json();

      if (data.success) {
        this.displayLessons(data.data || [], courseId);
      } else {
        this.displayLessons([], courseId);
      }
    } catch (error) {
      console.error("Error loading lessons:", error);
      container.innerHTML = `<div class="error-message">Error: ${error.message}</div>`;
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
          <p>Create your first lesson!</p>
        </div>
      `;
      return;
    }

    const sortedLessons = lessons.sort(
      (a, b) => (a.order || 0) - (b.order || 0)
    );

    container.innerHTML = sortedLessons
      .map(
        (lesson) => `
        <div class="lesson-card" data-lesson-id="${lesson._id}">
          <div class="lesson-header">
            <span class="lesson-number">${lesson.order || 1}</span>
            <h3>${lesson.title}</h3>
          </div>
          <div class="lesson-content">
            <p>${this.truncateText(lesson.content || "No content", 100)}</p>
          </div>
          <div class="lesson-actions">
            <button class="btn-edit" onclick="window.instructorHandler.editLesson('${
              lesson._id
            }', '${courseId}')">Edit</button>
            <button class="btn-delete" onclick="window.instructorHandler.deleteLesson('${
              lesson._id
            }', '${lesson.title}', '${courseId}')">Delete</button>
          </div>
        </div>
        `
      )
      .join("");
  }

  static truncateText(text, maxLength) {
    if (!text) return "";
    return text.length > maxLength
      ? text.substring(0, maxLength) + "..."
      : text;
  }

  static showNoCourseSelected() {
    const container = document.getElementById("lessonsContainer");
    container.innerHTML = `
      <div class="no-course-selected">
        <h3>Select a Course</h3>
        <p>Choose a course to manage its lessons.</p>
      </div>
    `;
  }

  static showLessonForm(lesson = null, courseId = null) {
    const form = document.getElementById("lessonForm");
    const formTitle = document.getElementById("lessonFormTitle");
    const formElement = document.getElementById("lessonFormElement");

    if (lesson) {
      formTitle.textContent = "Edit Lesson";
      document.getElementById("lessonTitle").value = lesson.title || "";
      document.getElementById("lessonContent").value = lesson.content || "";
      document.getElementById("lessonOrder").value = lesson.order || 1;
      formElement.dataset.lessonId = lesson._id;
      formElement.dataset.courseId = courseId || lesson.course;
    } else {
      formTitle.textContent = "Add Lesson";
      formElement.reset();
      document.getElementById("lessonOrder").value = "1";
      delete formElement.dataset.lessonId;
      formElement.dataset.courseId = courseId;
    }

    form.style.display = "block";
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

    const lessonData = {
      title: formData.get("title").trim(),
      content: formData.get("content").trim(),
      order: parseInt(formData.get("order")) || 1,
      course: courseId,
      type: "text", // Default type
      isPublished: true, // Default published
    };

    try {
      const saveBtn = document.getElementById("saveLessonForm");
      saveBtn.disabled = true;
      saveBtn.textContent = "Saving...";

      const { getToken } = window.dashboardUtils || {};
      const token = getToken();

      const url = lessonId
        ? `http://localhost:3761/api/lessons/${lessonId}`
        : "http://localhost:3761/api/lessons";

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
        alert(lessonId ? "Lesson updated!" : "Lesson created!");
      } else {
        throw new Error(data.error || "Failed to save lesson");
      }
    } catch (error) {
      console.error("Error saving lesson:", error);
      alert(`Error: ${error.message}`);
    } finally {
      const saveBtn = document.getElementById("saveLessonForm");
      saveBtn.disabled = false;
      saveBtn.textContent = "Save";
    }
  }

  static async editLesson(lessonId, courseId) {
    try {
      const { getToken } = window.dashboardUtils || {};
      const token = getToken();

      const response = await fetch(
        `http://localhost:3761/api/lessons/${lessonId}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );

      const data = await response.json();

      if (data.success) {
        this.showLessonForm(data.data, courseId);
      } else {
        throw new Error(data.error || "Failed to load lesson");
      }
    } catch (error) {
      console.error("Error loading lesson:", error);
      alert(`Error: ${error.message}`);
    }
  }

  static async deleteLesson(lessonId, lessonTitle, courseId) {
    if (!confirm(`Delete "${lessonTitle}"? This cannot be undone.`)) {
      return;
    }

    try {
      const { getToken } = window.dashboardUtils || {};
      const token = getToken();

      const response = await fetch(
        `http://localhost:3761/api/lessons/${lessonId}`,
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
        await this.loadLessonsForCourse(courseId);
        alert("Lesson deleted!");
      } else {
        throw new Error(data.error || "Failed to delete lesson");
      }
    } catch (error) {
      console.error("Error deleting lesson:", error);
      alert(`Error: ${error.message}`);
    }
  }

  // Exam Management Functions
  static async showExamManagement() {
    try {
      const { getToken, getUser, redirectToLogin } =
        window.dashboardUtils || {};

      if (!getToken || !getUser || !redirectToLogin) {
        console.error("Dashboard utilities not available");
        return;
      }

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

      const roleDashboards = document.querySelectorAll(".role-dashboard");
      roleDashboards.forEach((dashboard) => {
        dashboard.style.display = "none";
      });

      await this.createExamManagementInterface();
    } catch (error) {
      console.error("Error showing exam management:", error);
      alert("Error loading exam management. Please try again.");
    }
  }

  static async createExamManagementInterface() {
    const main = document.querySelector("main.dashboard-content");

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
          <button id="createExamBtn" class="btn-primary" disabled>+ Add Exam</button>
        </div>
      </div>

      <!-- Simple Exam Form -->
      <div id="examForm" class="exam-form" style="display: none;">
        <h3 id="examFormTitle">Add Exam</h3>
        <form id="examFormElement">
          <div class="form-group">
            <label for="examTitle">Title *</label>
            <input type="text" id="examTitle" name="title" required>
          </div>
          <div class="form-group">
            <label for="examDescription">Description *</label>
            <textarea id="examDescription" name="description" required rows="4"></textarea>
          </div>
          <div class="form-group">
            <label for="examType">Type</label>
            <select id="examType" name="type">
              <option value="quiz">Quiz</option>
              <option value="midterm">Midterm</option>
              <option value="final">Final Exam</option>
              <option value="assignment">Assignment</option>
            </select>
          </div>
          <div class="form-actions">
            <button type="button" id="cancelExamForm" class="btn-secondary">Cancel</button>
            <button type="submit" id="saveExamForm" class="btn-primary">Save</button>
          </div>
        </form>
      </div>

      <!-- Simple Exams List -->
      <div id="examsList">
        <div id="examsLoading" style="display: none;">Loading...</div>
        <div id="examsContainer">
          <div class="no-course-selected">
            <h3>Select a Course</h3>
            <p>Choose a course to manage its exams.</p>
          </div>
        </div>
      </div>
    `;

    main.appendChild(examManagementDiv);
    this.setupExamManagementEventListeners();
    await this.loadCoursesForExamManagement();
  }

  static setupExamManagementEventListeners() {
    const { getUser, showRoleDashboard } = window.dashboardUtils || {};

    // Back button
    document
      .getElementById("backToDashboardFromExams")
      .addEventListener("click", () => {
        document.getElementById("examManagement").remove();
        if (getUser && showRoleDashboard) {
          showRoleDashboard(getUser());
        }
      });

    // Course selector
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

    // Cancel button
    document.getElementById("cancelExamForm").addEventListener("click", () => {
      this.hideExamForm();
    });

    // Form submission
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
      const token = getToken();

      const response = await fetch(
        "http://localhost:3761/api/courses/instructor/my-courses",
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
          option.textContent = course.title;
          courseSelector.appendChild(option);
        });
      } else {
        throw new Error(data.error || "Failed to load courses");
      }
    } catch (error) {
      console.error("Error loading courses:", error);
      alert(`Error: ${error.message}`);
    }
  }

  static async loadExamsForCourse(courseId) {
    const loading = document.getElementById("examsLoading");
    const container = document.getElementById("examsContainer");

    try {
      loading.style.display = "block";
      container.innerHTML = "";

      const { getToken } = window.dashboardUtils || {};
      const token = getToken();

      const response = await fetch(
        `http://localhost:3761/api/exams?course=${courseId}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );

      const data = await response.json();

      if (data.success) {
        this.displayExams(data.data || [], courseId);
      } else {
        this.displayExams([], courseId);
      }
    } catch (error) {
      console.error("Error loading exams:", error);
      container.innerHTML = `<div class="error-message">Error: ${error.message}</div>`;
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
          <p>Create your first exam!</p>
        </div>
      `;
      return;
    }

    container.innerHTML = exams
      .map(
        (exam) => `
        <div class="exam-card" data-exam-id="${exam._id}">
          <h3>${exam.title}</h3>
          <p>${this.truncateText(exam.description || "No description", 150)}</p>
          <div class="exam-info">
            <span class="exam-type">${this.formatExamType(exam.type)}</span>
          </div>
          <div class="exam-actions">
            <button class="btn-edit" onclick="window.instructorHandler.editExam('${
              exam._id
            }', '${courseId}')">Edit</button>
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
    container.innerHTML = `
      <div class="no-course-selected">
        <h3>Select a Course</h3>
        <p>Choose a course to manage its exams.</p>
      </div>
    `;
  }

  static showExamForm(exam = null, courseId = null) {
    const form = document.getElementById("examForm");
    const formTitle = document.getElementById("examFormTitle");
    const formElement = document.getElementById("examFormElement");

    if (exam) {
      formTitle.textContent = "Edit Exam";
      document.getElementById("examTitle").value = exam.title || "";
      document.getElementById("examType").value = exam.type || "quiz";
      document.getElementById("examDescription").value = exam.description || "";
      formElement.dataset.examId = exam._id;
      formElement.dataset.courseId = courseId || exam.course;
    } else {
      formTitle.textContent = "Add Exam";
      formElement.reset();
      document.getElementById("examType").value = "quiz";
      delete formElement.dataset.examId;
      formElement.dataset.courseId = courseId;
    }

    form.style.display = "block";
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

    const examData = {
      title: formData.get("title").trim(),
      description: formData.get("description").trim(),
      type: formData.get("type") || "quiz",
      course: courseId,
      isActive: true, // Default active
    };

    try {
      const saveBtn = document.getElementById("saveExamForm");
      saveBtn.disabled = true;
      saveBtn.textContent = "Saving...";

      const { getToken } = window.dashboardUtils || {};
      const token = getToken();

      const url = examId
        ? `http://localhost:3761/api/exams/${examId}`
        : "http://localhost:3761/api/exams";

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
        alert(examId ? "Exam updated!" : "Exam created!");
      } else {
        throw new Error(data.error || "Failed to save exam");
      }
    } catch (error) {
      console.error("Error saving exam:", error);
      alert(`Error: ${error.message}`);
    } finally {
      const saveBtn = document.getElementById("saveExamForm");
      saveBtn.disabled = false;
      saveBtn.textContent = "Save";
    }
  }

  static async editExam(examId, courseId) {
    try {
      const { getToken } = window.dashboardUtils || {};
      const token = getToken();

      const response = await fetch(
        `http://localhost:3761/api/exams/${examId}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );

      const data = await response.json();

      if (data.success) {
        this.showExamForm(data.data, courseId);
      } else {
        throw new Error(data.error || "Failed to load exam");
      }
    } catch (error) {
      console.error("Error loading exam:", error);
      alert(`Error: ${error.message}`);
    }
  }

  static async deleteExam(examId, examTitle, courseId) {
    if (!confirm(`Delete "${examTitle}"? This cannot be undone.`)) {
      return;
    }

    try {
      const { getToken } = window.dashboardUtils || {};
      const token = getToken();

      const response = await fetch(
        `http://localhost:3761/api/exams/${examId}`,
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
        await this.loadExamsForCourse(courseId);
        alert("Exam deleted!");
      } else {
        throw new Error(data.error || "Failed to delete exam");
      }
    } catch (error) {
      console.error("Error deleting exam:", error);
      alert(`Error: ${error.message}`);
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

      // Load multiple analytics endpoints in parallel
      const [coursesData, enrollmentsData, overviewData] = await Promise.all([
        // Get instructor's courses
        fetch(`${API_BASE_URL}/courses/instructor/my-courses`, {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }).then((res) => res.json()),

        // Get instructor's enrollment data
        fetch(`${API_BASE_URL}/enrollments/instructor`, {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        })
          .then((res) => res.json())
          .catch(() => ({ success: false, data: [] })),

        // Get instructor's dashboard overview
        fetch(`${API_BASE_URL}/analytics/instructor/overview`, {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        })
          .then((res) => res.json())
          .catch(() => ({ success: false, data: {} })),
      ]);

      if (coursesData.success) {
        // Use enrollment data if available, otherwise work with course data alone
        const enrollmentDataToUse = enrollmentsData.success
          ? enrollmentsData.data || []
          : [];
        const overviewDataToUse = overviewData.success
          ? overviewData.data || {}
          : {};

        await this.populateAnalytics(
          coursesData.data,
          enrollmentDataToUse,
          overviewDataToUse
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

  static async populateAnalytics(courses, enrollmentData, overviewData) {
    // 1. Populate Overview Cards
    this.populateOverviewCards(courses, enrollmentData, overviewData);

    // 2. Create Course Performance Charts
    this.createCourseCharts(courses, enrollmentData);

    // 3. Populate Course Performance Table
    this.populateCourseTable(courses, enrollmentData);

    // 4. Create Student Performance Charts
    this.createStudentCharts(enrollmentData);

    // 5. Populate Student Insights
    this.populateStudentInsights(enrollmentData);
  }

  static populateOverviewCards(courses, enrollmentData, overviewData) {
    // Handle real enrollment data format
    const enrollments = Array.isArray(enrollmentData) ? enrollmentData : [];

    // Use overview data if available, otherwise fallback to calculated values
    if (overviewData && Object.keys(overviewData).length > 0) {
      document.getElementById("totalCourses").textContent =
        overviewData.courses?.total || courses.length;
      document.getElementById("totalStudents").textContent =
        overviewData.students?.total || 0;
      document.getElementById("activeStudents").textContent =
        overviewData.students?.active || 0;
      document.getElementById("avgCompletionRate").textContent = `${
        overviewData.performance?.avgCompletion || 0
      }%`;
      document.getElementById("totalRevenue").textContent = `$${(
        overviewData.revenue?.actual || 0
      ).toFixed(2)}`;
    } else if (enrollments.length > 0) {
      // Fallback to enrollment-based calculations
      const totalCourses = courses.length;
      const totalStudents = new Set(
        enrollments.map((e) => e.student || e.studentId)
      ).size;

      const activeStudents = enrollments.filter(
        (e) => (e.progress || 0) > 10
      ).length;

      const completionRates = enrollments.map((e) => e.progress || 0);
      const avgCompletionRate =
        completionRates.length > 0
          ? Math.round(
              completionRates.reduce((a, b) => a + b, 0) /
                completionRates.length
            )
          : 0;

      const totalRevenue = courses.reduce((sum, course) => {
        const courseEnrollments = enrollments.filter(
          (e) => (e.course || e.courseId) === course._id
        ).length;
        return sum + (course.price || 0) * courseEnrollments;
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
    } else {
      // Fallback when no data is available
      const totalCourses = courses.length;
      const totalRevenue = courses.reduce(
        (sum, course) => sum + (course.price || 0),
        0
      );

      document.getElementById("totalCourses").textContent = totalCourses;
      document.getElementById("totalStudents").textContent = "No data";
      document.getElementById("activeStudents").textContent = "No data";
      document.getElementById("avgCompletionRate").textContent = "No data";
      document.getElementById(
        "totalRevenue"
      ).textContent = `$${totalRevenue.toFixed(2)}*`;
    }
  }

  static createCourseCharts(courses, enrollmentData) {
    // Handle real enrollment data format
    const enrollments = Array.isArray(enrollmentData) ? enrollmentData : [];

    console.log("Creating course charts with:", {
      courses: courses.length,
      enrollments: enrollments.length,
    });

    // Course Enrollment Chart (Pie Chart)
    const enrollmentCtx = document
      .getElementById("courseEnrollmentChart")
      .getContext("2d");
    const courseEnrollments = courses.map((course) => {
      const count = enrollments.filter(
        (e) => (e.course || e.courseId) === course._id
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
      const courseEnrolls = enrollments.filter(
        (e) => (e.course || e.courseId) === course._id
      );
      const avgProgress =
        courseEnrolls.length > 0
          ? courseEnrolls.reduce((sum, e) => sum + (e.progress || 0), 0) /
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
    // Handle real enrollment data format
    const enrollments = Array.isArray(enrollmentData) ? enrollmentData : [];

    console.log("Populating course table with:", {
      courses: courses.length,
      enrollments: enrollments.length,
    });

    const tbody = document.querySelector("#coursePerformanceTable tbody");
    tbody.innerHTML = "";

    if (courses.length === 0) {
      tbody.innerHTML =
        '<tr><td colspan="6" style="text-align: center; color: #666;">No courses available</td></tr>';
      return;
    }

    courses.forEach((course) => {
      const courseEnrolls = enrollments.filter(
        (e) => (e.course || e.courseId) === course._id
      );
      const enrollmentCount = courseEnrolls.length;
      const avgProgress =
        courseEnrolls.length > 0
          ? Math.round(
              courseEnrolls.reduce((sum, e) => sum + (e.progress || 0), 0) /
                courseEnrolls.length
            )
          : 0;
      const avgGrade =
        courseEnrolls.length > 0
          ? Math.round(
              courseEnrolls.reduce((sum, e) => sum + (e.grade || 0), 0) /
                courseEnrolls.length
            )
          : 0;
      const revenue = (course.price || 0) * enrollmentCount;

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
    // Handle real enrollment data format
    const enrollments = Array.isArray(enrollmentData) ? enrollmentData : [];

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

    enrollments.forEach((e) => {
      const progress = e.progress || 0;
      if (progress <= 25) progressRanges["0-25%"]++;
      else if (progress <= 50) progressRanges["26-50%"]++;
      else if (progress <= 75) progressRanges["51-75%"]++;
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

    enrollments.forEach((e) => {
      const grade = e.grade || 0;
      if (grade < 60) gradeRanges["F (0-59)"]++;
      else if (grade < 70) gradeRanges["D (60-69)"]++;
      else if (grade < 80) gradeRanges["C (70-79)"]++;
      else if (grade < 90) gradeRanges["B (80-89)"]++;
      else gradeRanges["A (90-100)"]++;
    });

    this.createSimplePieChart(gradeCtx, {
      labels: Object.keys(gradeRanges),
      data: Object.values(gradeRanges),
      title: "Grade Distribution",
    });
  }

  static populateStudentInsights(enrollmentData) {
    // Handle real enrollment data format
    const enrollments = Array.isArray(enrollmentData) ? enrollmentData : [];

    // Students needing attention (low progress)
    const strugglingContainer = document.getElementById("strugglingStudents");
    const strugglingStudents = enrollments
      .filter((e) => (e.progress || 0) < 50)
      .map((e) => ({
        ...e,
        name:
          e.student?.name ||
          e.studentName ||
          `Student ${e.student || e.studentId}`,
        email: e.student?.email || e.studentEmail || "",
        progress: e.progress || 0,
      }))
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
    const topStudents = enrollments
      .filter((e) => (e.progress || 0) > 80)
      .map((e) => ({
        ...e,
        name:
          e.student?.name ||
          e.studentName ||
          `Student ${e.student || e.studentId}`,
        email: e.student?.email || e.studentEmail || "",
        progress: e.progress || 0,
      }))
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
