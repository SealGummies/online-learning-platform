// Student Action Handler Module
export class StudentHandler {
  static handleAction(action) {
    switch (action) {
      case "view-courses":
        this.showEnrolledCourses();
        break;
      case "view-quizzes":
        this.showQuizzesAndExams();
        break;
      default:
        this.showFeatureComingSoon();
    }
  }

  static async showEnrolledCourses() {
    try {
      // Save original dashboard content before replacing
      this.saveOriginalDashboard();
      
      // Hide all role dashboards
      const roleDashboards = document.querySelectorAll(".role-dashboard");
      roleDashboards.forEach((dashboard) => {
        dashboard.style.display = "none";
      });

      // Create and show enrolled courses interface
      await this.createEnrolledCoursesInterface();
    } catch (error) {
      console.error("Error showing enrolled courses:", error);
      alert("Error loading enrolled courses. Please try again.");
    }
  }

  static saveOriginalDashboard() {
    // Save the original dashboard content
    const dashboardContent = document.querySelector('.dashboard-content');
    if (dashboardContent) {
      this.originalDashboardContent = dashboardContent.innerHTML;
    }
  }

  static restoreOriginalDashboard() {
    // Restore the original dashboard content
    const dashboardContent = document.querySelector('.dashboard-content');
    if (dashboardContent && this.originalDashboardContent) {
      dashboardContent.innerHTML = this.originalDashboardContent;
    }
  }

  static async createEnrolledCoursesInterface() {
    const mainContent = document.querySelector(".dashboard-content");
    
    // Create the interface HTML
    const interfaceHTML = `
      <div id="enrolledCoursesInterface" class="student-interface">
        <div class="interface-header">
          <h2>My Enrolled Courses</h2>
          <button id="backToStudentDashboard" class="btn-secondary">← Back to Dashboard</button>
        </div>
        
        <div class="courses-container">
          <div id="coursesLoading" class="loading" style="display: none;">
            <p>Loading your courses...</p>
          </div>
          <div id="enrolledCoursesContainer"></div>
        </div>
      </div>
    `;

    mainContent.innerHTML = interfaceHTML;

    // Setup event listeners
    this.setupEnrolledCoursesEventListeners();
    
    // Load enrolled courses
    await this.loadEnrolledCourses();
  }

  static setupEnrolledCoursesEventListeners() {
    // Back to dashboard button
    document.getElementById("backToStudentDashboard").addEventListener("click", () => {
      // Remove the current interface
      document.getElementById("enrolledCoursesInterface").remove();
      
      // Restore original dashboard content
      this.restoreOriginalDashboard();
      
      // Re-bind dashboard event listeners
      this.rebindDashboardEventListeners();
      
      // Get user and show the role dashboard
      const user = window.dashboardUtils?.getUser();
      if (user && window.dashboardUtils?.showRoleDashboard) {
        window.dashboardUtils.showRoleDashboard(user);
      } else {
        // Fallback: redirect to dashboard page
        window.location.href = 'dashboard.html';
      }
    });
  }

  static rebindDashboardEventListeners() {
    // Use the existing dashboard event binding function
    if (window.addDashboardEventListeners) {
      window.addDashboardEventListeners();
    } else {
      console.warn("Dashboard event listeners function not available");
    }
  }

  static ensureDashboardContent() {
    // Check if dashboard content exists, if not, reload the page
    const dashboardContent = document.querySelector('.dashboard-content');
    if (!dashboardContent || !document.getElementById('studentDashboard')) {
      window.location.reload();
      return;
    }
  }

  static async loadEnrolledCourses() {
    const loading = document.getElementById("coursesLoading");
    const container = document.getElementById("enrolledCoursesContainer");

    try {
      loading.style.display = "block";
      container.innerHTML = "";

      const { getToken, getUser } = window.dashboardUtils || {};
      if (!getToken || !getUser) {
        throw new Error("Dashboard utilities not available");
      }

      const token = getToken();
      const user = getUser();

      if (!token || !user) {
        throw new Error("Authentication required");
      }

      const API_BASE_URL = "http://localhost:3761/api";
      const response = await fetch(`${API_BASE_URL}/enrollments`, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });

      const data = await response.json();

      if (data.success) {
        this.displayEnrolledCourses(data.data || []);
      } else {
        throw new Error(data.error || "Failed to load enrollments");
      }
    } catch (error) {
      console.error("Error loading enrolled courses:", error);
      container.innerHTML = `<div class="error-message">Error loading courses: ${error.message}</div>`;
    } finally {
      loading.style.display = "none";
    }
  }

  static displayEnrolledCourses(enrollments) {
    const container = document.getElementById("enrolledCoursesContainer");

    if (enrollments.length === 0) {
      container.innerHTML = `
        <div class="no-courses">
          <h3>No enrolled courses</h3>
          <p>You haven't enrolled in any courses yet.</p>
          <button class="btn-primary" onclick="window.location.href='/'">Browse Courses</button>
        </div>
      `;
      return;
    }

    container.innerHTML = enrollments
      .map((enrollment) => {
        const course = enrollment.course;
        const progress = enrollment.completionPercentage || 0;
        const grade = enrollment.finalGrade || "N/A";
        
        return `
          <div class="enrolled-course-card" data-course-id="${course._id}" data-enrollment-id="${enrollment._id}">
            <div class="course-header">
              <h3>${course.title}</h3>
              <div class="course-status">
                <span class="status-badge ${enrollment.status}">
                  ${this.formatStatus(enrollment.status)}
                </span>
              </div>
            </div>
            
            <div class="course-info">
              <p class="course-description">${course.description}</p>
              <div class="course-meta">
                <span class="category">${course.category}</span>
                <span class="level">${course.level}</span>
                <span class="instructor">Instructor: ${course.instructor?.firstName} ${course.instructor?.lastName}</span>
              </div>
              
              <div class="progress-section">
                <div class="progress-bar">
                  <div class="progress-fill" style="width: ${progress}%"></div>
                </div>
                <div class="progress-info">
                  <span class="completion">${progress}% Complete</span>
                  <span class="grade">Grade: ${grade}</span>
                </div>
              </div>
            </div>
            
            <div class="course-actions">
              <button class="btn-primary view-quizzes" data-course-id="${course._id}">View Quizzes</button>
              <button class="btn-secondary view-syllabus" data-course-id="${course._id}">Syllabus</button>
            </div>
          </div>
        `;
      })
      .join("");

    // Add event listeners for course actions
    this.setupCourseActionEventListeners();
  }

  static setupCourseActionEventListeners() {
    // View quizzes button
    document.querySelectorAll('.view-quizzes').forEach(button => {
      button.addEventListener('click', (e) => {
        const courseId = e.target.dataset.courseId;
        this.showCourseQuizzes(courseId);
      });
    });

    // View syllabus button
    document.querySelectorAll('.view-syllabus').forEach(button => {
      button.addEventListener('click', (e) => {
        const courseId = e.target.dataset.courseId;
        this.showCourseSyllabus(courseId);
      });
    });
  }

  static async showCourseQuizzes(courseId) {
    try {
      // Hide current interface
      const currentInterface = document.getElementById("enrolledCoursesInterface");
      if (currentInterface) {
        currentInterface.style.display = "none";
      }

      // Create quizzes interface
      await this.createCourseQuizzesInterface(courseId);
    } catch (error) {
      console.error("Error showing course quizzes:", error);
      alert("Error loading course quizzes. Please try again.");
    }
  }

  static async createCourseQuizzesInterface(courseId) {
    const mainContent = document.querySelector(".dashboard-content");
    
    const interfaceHTML = `
      <div id="courseQuizzesInterface" class="student-interface">
        <div class="interface-header">
          <h2>Course Quizzes & Exams</h2>
          <button id="backToEnrolledCourses" class="btn-secondary">← Back to Courses</button>
        </div>
        
        <div class="course-info-display">
          <div id="courseInfoLoading" class="loading" style="display: none;">
            <p>Loading course information...</p>
          </div>
          <div id="courseInfoContainer"></div>
        </div>
        
        <div class="quizzes-container">
          <div id="quizzesLoading" class="loading" style="display: none;">
            <p>Loading quizzes...</p>
          </div>
          <div id="quizzesContainer"></div>
        </div>
      </div>
    `;

    mainContent.innerHTML = interfaceHTML;

    // Setup event listeners
    this.setupQuizzesEventListeners();
    
    // Load course info and quizzes
    await this.loadCourseInfo(courseId);
    await this.loadCourseQuizzes(courseId);
  }

  static setupQuizzesEventListeners() {
    // Back to courses button
    document.getElementById("backToEnrolledCourses").addEventListener("click", () => {
      // Remove the current quizzes interface
      document.getElementById("courseQuizzesInterface").remove();
      // Show enrolled courses again
      this.showEnrolledCourses();
    });
  }

  static async loadCourseInfo(courseId) {
    const loading = document.getElementById("courseInfoLoading");
    const container = document.getElementById("courseInfoContainer");

    try {
      loading.style.display = "block";
      container.innerHTML = "";

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
        this.displayCourseInfo(data.data);
      } else {
        throw new Error(data.error || "Failed to load course information");
      }
    } catch (error) {
      console.error("Error loading course info:", error);
      container.innerHTML = `<div class="error-message">Error loading course information: ${error.message}</div>`;
    } finally {
      loading.style.display = "none";
    }
  }

  static displayCourseInfo(course) {
    const container = document.getElementById("courseInfoContainer");
    
    container.innerHTML = `
      <div class="course-info-card">
        <h3>${course.title}</h3>
        <p class="course-description">${course.description}</p>
        <div class="course-meta">
          <span class="category">${course.category}</span>
          <span class="level">${course.level}</span>
          <span class="instructor">Instructor: ${course.instructor?.firstName} ${course.instructor?.lastName}</span>
        </div>
      </div>
    `;
  }

  static async loadCourseQuizzes(courseId) {
    const loading = document.getElementById("quizzesLoading");
    const container = document.getElementById("quizzesContainer");

    try {
      loading.style.display = "block";
      container.innerHTML = "";

      const { getToken } = window.dashboardUtils || {};
      if (!getToken) {
        throw new Error("Dashboard utilities not available");
      }

      const token = getToken();
      const API_BASE_URL = "http://localhost:3761/api";

      const response = await fetch(`${API_BASE_URL}/exams?course=${courseId}`, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });

      const data = await response.json();

      if (data.success) {
        this.displayCourseQuizzes(data.data || []);
      } else {
        throw new Error(data.error || "Failed to load quizzes");
      }
    } catch (error) {
      console.error("Error loading quizzes:", error);
      container.innerHTML = `<div class="error-message">Error loading quizzes: ${error.message}</div>`;
    } finally {
      loading.style.display = "none";
    }
  }

  static displayCourseQuizzes(quizzes) {
    const container = document.getElementById("quizzesContainer");

    if (quizzes.length === 0) {
      container.innerHTML = `
        <div class="no-quizzes">
          <h3>No quizzes available</h3>
          <p>This course doesn't have any quizzes yet.</p>
        </div>
      `;
      return;
    }

    // Sort quizzes by type and date
    const sortedQuizzes = quizzes.sort((a, b) => {
      // Sort by type: quiz, midterm, final, assignment
      const typeOrder = { 'quiz': 1, 'midterm': 2, 'final': 3, 'assignment': 4 };
      const aOrder = typeOrder[a.type] || 5;
      const bOrder = typeOrder[b.type] || 5;
      if (aOrder !== bOrder) return aOrder - bOrder;
      // Then by creation date
      return new Date(b.createdAt) - new Date(a.createdAt);
    });

    container.innerHTML = sortedQuizzes
      .map((quiz) => {
        const isAvailable = quiz.isPublished && (!quiz.startDate || new Date() >= new Date(quiz.startDate));
        const isExpired = quiz.endDate && new Date() > new Date(quiz.endDate);
        const timeRemaining = quiz.duration ? this.formatTime(quiz.duration) : "No time limit";
        
        return `
          <div class="quiz-card ${!quiz.isPublished ? "unpublished" : ""} ${isExpired ? "expired" : ""}" data-quiz-id="${quiz._id}">
            <div class="quiz-header">
              <div class="quiz-type">
                <span class="type-badge type-${quiz.type}">${this.formatQuizType(quiz.type)}</span>
                ${!quiz.isPublished ? '<span class="status-badge draft">Draft</span>' : ''}
                ${isExpired ? '<span class="status-badge expired">Expired</span>' : ''}
              </div>
              <h4>${quiz.title}</h4>
            </div>
            
            <div class="quiz-info">
              <p class="quiz-description">${quiz.description || "No description available"}</p>
              <div class="quiz-meta">
                <span class="duration">Duration: ${timeRemaining}</span>
                <span class="questions">Questions: ${quiz.questions?.length || 0}</span>
                <span class="points">Points: ${quiz.totalPoints || 0}</span>
              </div>
              
              ${quiz.startDate || quiz.endDate ? `
                <div class="quiz-schedule">
                  ${quiz.startDate ? `<span class="start-date">Start: ${new Date(quiz.startDate).toLocaleString()}</span>` : ''}
                  ${quiz.endDate ? `<span class="end-date">End: ${new Date(quiz.endDate).toLocaleString()}</span>` : ''}
                </div>
              ` : ''}
            </div>
            
            <div class="quiz-actions">
              ${isAvailable && !isExpired ? 
                `<button class="btn-primary take-quiz" data-quiz-id="${quiz._id}">Take Quiz</button>` : 
                isExpired ? 
                  '<span class="unavailable">Quiz expired</span>' :
                  '<span class="unavailable">Not available yet</span>'
              }

            </div>
          </div>
        `;
      })
      .join("");

    // Add event listeners for quiz actions
    this.setupQuizActionEventListeners();
  }

  static setupQuizActionEventListeners() {
    // Take quiz button
    document.querySelectorAll('.take-quiz').forEach(button => {
      button.addEventListener('click', (e) => {
        const quizId = e.target.dataset.quizId;
        this.startQuiz(quizId);
      });
    });


  }

  static async startQuiz(quizId) {
    try {
      const { getToken } = window.dashboardUtils || {};
      if (!getToken) {
        throw new Error("Dashboard utilities not available");
      }

      const token = getToken();
      const API_BASE_URL = "http://localhost:3761/api";

      // Get quiz details
      const response = await fetch(`${API_BASE_URL}/exams/${quizId}`, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });

      const data = await response.json();

      if (data.success) {
        this.displayQuizInterface(data.data);
      } else {
        throw new Error(data.error || "Failed to load quiz");
      }
    } catch (error) {
      console.error("Error starting quiz:", error);
      alert(`Error starting quiz: ${error.message}`);
    }
  }

  static displayQuizInterface(quiz) {
    const quizHTML = `
      <div id="quizModal" class="modal">
        <div class="modal-content quiz-modal">
          <div class="modal-header">
            <h3>${quiz.title}</h3>
            <div class="quiz-timer" id="quizTimer">
              <span id="timeRemaining">Loading...</span>
            </div>
            <button class="close-modal">&times;</button>
          </div>
          <div class="modal-body">
            <div class="quiz-instructions">
              <p><strong>Instructions:</strong></p>
              <ul>
                <li>Read each question carefully</li>
                <li>You have ${this.formatTime(quiz.duration)} to complete this quiz</li>
                <li>You can review your answers before submitting</li>
                <li>Once submitted, you cannot change your answers</li>
              </ul>
            </div>
            <div class="quiz-content" id="quizContent">
              <div class="loading">Loading quiz questions...</div>
            </div>
            <div class="quiz-actions">
              <button id="submitQuiz" class="btn-primary" style="display: none;">Submit Quiz</button>
              <button id="saveProgress" class="btn-secondary" style="display: none;">Save Progress</button>
            </div>
          </div>
        </div>
      </div>
    `;

    // Remove existing modal if any
    const existingModal = document.getElementById("quizModal");
    if (existingModal) {
      existingModal.remove();
    }

    // Add modal to body
    document.body.insertAdjacentHTML('beforeend', quizHTML);

    // Setup quiz interface
    this.setupQuizInterface(quiz);
  }

  static setupQuizInterface(quiz) {
    const modal = document.getElementById("quizModal");
    const closeBtn = modal.querySelector(".close-modal");
    const submitBtn = document.getElementById("submitQuiz");
    const saveBtn = document.getElementById("saveProgress");

    // Close button with multiple fallback methods
    closeBtn.onclick = () => {
      if (confirm("Are you sure you want to exit? Your progress will be lost.")) {
        modal.remove();
      }
    };
    
    closeBtn.addEventListener('click', () => {
      if (confirm("Are you sure you want to exit? Your progress will be lost.")) {
        modal.remove();
      }
    });

    // Submit button
    submitBtn.addEventListener('click', () => {
      this.submitQuiz(quiz._id);
    });

    // Save progress button
    saveBtn.addEventListener('click', () => {
      this.saveQuizProgress(quiz._id);
    });

    // Load quiz questions
    this.loadQuizQuestions(quiz);

    // Start timer if quiz has time limit
    if (quiz.duration) {
      this.startQuizTimer(quiz.duration);
    }
  }

  static async loadQuizQuestions(quiz) {
    const quizContent = document.getElementById("quizContent");
    
    if (!quiz.questions || quiz.questions.length === 0) {
      quizContent.innerHTML = '<div class="error-message">No questions available for this quiz.</div>';
      return;
    }

    const questionsHTML = quiz.questions.map((question, index) => `
      <div class="question-container" data-question-id="${question._id}">
        <h4>Question ${index + 1}</h4>
        <p class="question-text">${question.text}</p>
        <div class="question-options">
          ${question.options.map((option, optIndex) => `
            <label class="option-label">
              <input type="radio" name="q${question._id}" value="${optIndex}" />
              <span class="option-text">${option}</span>
            </label>
          `).join("")}
        </div>
      </div>
    `).join("");

    quizContent.innerHTML = questionsHTML;

    // Show submit button
    document.getElementById("submitQuiz").style.display = "block";
    document.getElementById("saveProgress").style.display = "block";
  }

  static startQuizTimer(durationMinutes) {
    let timeRemaining = durationMinutes * 60; // Convert to seconds
    const timerElement = document.getElementById("timeRemaining");

    const timer = setInterval(() => {
      const minutes = Math.floor(timeRemaining / 60);
      const seconds = timeRemaining % 60;
      
      timerElement.textContent = `${minutes}:${seconds.toString().padStart(2, '0')}`;
      
      if (timeRemaining <= 0) {
        clearInterval(timer);
        alert("Time's up! Submitting quiz automatically.");
        this.submitQuiz();
      }
      
      timeRemaining--;
    }, 1000);
  }

  static async submitQuiz(quizId) {
    try {
      // Collect answers
      const answers = this.collectQuizAnswers();
      
      const { getToken } = window.dashboardUtils || {};
      if (!getToken) {
        throw new Error("Dashboard utilities not available");
      }

      const token = getToken();
      const API_BASE_URL = "http://localhost:3761/api";

      const response = await fetch(`${API_BASE_URL}/exams/${quizId}/submit`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ answers }),
      });

      const data = await response.json();

      if (data.success) {
        this.showQuizResults(quizId, data.data);
      } else {
        throw new Error(data.error || "Failed to submit quiz");
      }
    } catch (error) {
      console.error("Error submitting quiz:", error);
      alert(`Error submitting quiz: ${error.message}`);
    }
  }

  static collectQuizAnswers() {
    const answers = {};
    const questionContainers = document.querySelectorAll('.question-container');
    
    questionContainers.forEach(container => {
      const questionId = container.dataset.questionId;
      const selectedOption = container.querySelector('input[type="radio"]:checked');
      
      if (selectedOption) {
        answers[questionId] = parseInt(selectedOption.value);
      }
    });
    
    return answers;
  }

  static async showQuizResults(quizId, results = null) {
    try {
      const { getToken } = window.dashboardUtils || {};
      if (!getToken) {
        throw new Error("Dashboard utilities not available");
      }

      const token = getToken();
      const API_BASE_URL = "http://localhost:3761/api";

      // If results not provided, fetch them
      if (!results) {
        const response = await fetch(`${API_BASE_URL}/exams/${quizId}/results`, {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        });

        const data = await response.json();
        if (data.success) {
          results = data.data;
        } else {
          throw new Error(data.error || "Failed to load results");
        }
      }

      this.displayQuizResults(quizId, results);
    } catch (error) {
      console.error("Error loading quiz results:", error);
      alert(`Error loading results: ${error.message}`);
    }
  }

  static displayQuizResults(quizId, results) {
    const resultsHTML = `
      <div id="resultsModal" class="modal">
        <div class="modal-content results-modal">
          <div class="modal-header">
            <h3>Quiz Results</h3>
            <button class="close-modal" onclick="closeResultsAndQuiz()">&times;</button>
          </div>
          <div class="modal-body">
            <div class="results-summary">
              <h4>Summary</h4>
              <div class="result-stats">
                <div class="stat-item">
                  <label>Score:</label>
                  <span class="score">${results.score || 0}/${results.totalPoints || 0}</span>
                </div>
                <div class="stat-item">
                  <label>Percentage:</label>
                  <span class="percentage">${results.percentage || 0}%</span>
                </div>
                <div class="stat-item">
                  <label>Time Taken:</label>
                  <span class="time-taken">${results.timeTaken || 'N/A'}</span>
                </div>
                <div class="stat-item">
                  <label>Submitted:</label>
                  <span class="submitted-date">${new Date(results.submittedAt).toLocaleString()}</span>
                </div>
              </div>
            </div>
            
            <div class="results-details">
              <h4>Question Details</h4>
              <div class="question-results">
                ${results.questions ? results.questions.map((q, index) => `
                  <div class="question-result ${q.correct ? 'correct' : 'incorrect'}">
                    <h5>Question ${index + 1}</h5>
                    <p>${q.text}</p>
                    <div class="answer-details">
                      <span class="your-answer">Your answer: ${q.yourAnswer}</span>
                      <span class="correct-answer">Correct answer: ${q.correctAnswer}</span>
                    </div>
                  </div>
                `).join("") : '<p>No detailed results available.</p>'}
              </div>
            </div>
          </div>
        </div>
      </div>
    `;

    // Remove existing modal if any
    const existingModal = document.getElementById("resultsModal");
    if (existingModal) {
      existingModal.remove();
    }

    // Add modal to body
    document.body.insertAdjacentHTML('beforeend', resultsHTML);

    // Add global function for onclick
    window.closeResultsAndQuiz = function() {
      const resultsModal = document.getElementById("resultsModal");
      const quizModal = document.getElementById("quizModal");
      
      if (resultsModal) {
        resultsModal.remove();
      }
      if (quizModal) {
        quizModal.remove();
      }
    };

    // Setup modal event listeners with multiple fallback methods
    const modal = document.getElementById("resultsModal");
    const closeBtn = modal.querySelector(".close-modal");

    // Function to close both results modal and quiz modal
    const closeAllModals = () => {
      // Close results modal
      modal.remove();
      
      // Also close the quiz modal if it exists
      const quizModal = document.getElementById("quizModal");
      if (quizModal) {
        quizModal.remove();
      }
      
      // Remove any escape key listeners
      document.removeEventListener('keydown', handleEscape);
    };

    // Method 1: Direct onclick (already added in HTML)
    // Method 2: Event listener
    closeBtn.addEventListener('click', closeAllModals);

    // Method 3: Click outside modal to close
    modal.addEventListener('click', (e) => {
      if (e.target === modal) {
        closeAllModals();
      }
    });

    // Method 4: Escape key to close
    const handleEscape = (e) => {
      if (e.key === 'Escape') {
        closeAllModals();
      }
    };
    document.addEventListener('keydown', handleEscape);

    // Method 5: Ensure modal is properly positioned and clickable
    setTimeout(() => {
      closeBtn.style.pointerEvents = 'auto';
      closeBtn.style.cursor = 'pointer';
    }, 100);
  }

  static async showQuizzesAndExams() {
    try {
      // Save original dashboard content
      this.saveOriginalDashboard();
      
      // Hide all role dashboards
      const roleDashboards = document.querySelectorAll(".role-dashboard");
      roleDashboards.forEach((dashboard) => {
        dashboard.style.display = "none";
      });

      // Create and show quizzes interface
      await this.createQuizzesInterface();
    } catch (error) {
      console.error("Error showing quizzes:", error);
      alert("Error loading quizzes. Please try again.");
    }
  }

  static async createQuizzesInterface() {
    const mainContent = document.querySelector(".dashboard-content");
    
    const interfaceHTML = `
      <div id="quizzesInterface" class="student-interface">
        <div class="interface-header">
          <h2>All Quizzes & Exams</h2>
          <button id="backToStudentDashboard" class="btn-secondary">← Back to Dashboard</button>
        </div>
        
        <div class="quizzes-overview">
          <div id="quizzesLoading" class="loading" style="display: none;">
            <p>Loading all quizzes...</p>
          </div>
          <div id="quizzesOverviewContainer"></div>
        </div>
      </div>
    `;

    mainContent.innerHTML = interfaceHTML;

    // Setup event listeners
    this.setupQuizzesOverviewEventListeners();
    
    // Load all quizzes
    await this.loadAllQuizzes();
  }

  static setupQuizzesOverviewEventListeners() {
    // Back to dashboard button
    document.getElementById("backToStudentDashboard").addEventListener("click", () => {
      document.getElementById("quizzesInterface").remove();
      this.restoreOriginalDashboard();
      this.rebindDashboardEventListeners();
      const user = window.dashboardUtils?.getUser();
      if (user && window.dashboardUtils?.showRoleDashboard) {
        window.dashboardUtils.showRoleDashboard(user);
      }
    });
  }

  static async loadAllQuizzes() {
    const loading = document.getElementById("quizzesLoading");
    const container = document.getElementById("quizzesOverviewContainer");

    try {
      loading.style.display = "block";
      container.innerHTML = "";

      const { getToken } = window.dashboardUtils || {};
      if (!getToken) {
        throw new Error("Dashboard utilities not available");
      }

      const token = getToken();
      const API_BASE_URL = "http://localhost:3761/api";

      // For testing, if no token available, try to login with test credentials
      let finalToken = token;
      if (!finalToken) {
        try {
          const loginResponse = await fetch(`${API_BASE_URL}/auth/login`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              email: 'student1@test.com',
              password: 'password123'
            })
          });
          
          const loginData = await loginResponse.json();
          if (loginData.success) {
            finalToken = loginData.data.token;
          }
        } catch (loginError) {
          console.warn("Auto-login failed:", loginError);
        }
      }

      if (!finalToken) {
        throw new Error("Authentication required");
      }

      const response = await fetch(`${API_BASE_URL}/exams`, {
        headers: {
          Authorization: `Bearer ${finalToken}`,
          "Content-Type": "application/json",
        },
      });

      const data = await response.json();

      if (data.success) {
        this.displayAllQuizzes(data.data || []);
      } else {
        throw new Error(data.error || "Failed to load quizzes");
      }
    } catch (error) {
      console.error("Error loading all quizzes:", error);
      container.innerHTML = `<div class="error-message">Error loading quizzes: ${error.message}</div>`;
    } finally {
      loading.style.display = "none";
    }
  }

  static displayAllQuizzes(quizzes) {
    const container = document.getElementById("quizzesOverviewContainer");

    if (quizzes.length === 0) {
      container.innerHTML = `
        <div class="no-quizzes">
          <h3>No quizzes available</h3>
          <p>You don't have any quizzes assigned yet.</p>
        </div>
      `;
      return;
    }

    // Group quizzes by course
    const quizzesByCourse = {};
    quizzes.forEach(quiz => {
      const courseName = quiz.course?.title || 'Unknown Course';
      if (!quizzesByCourse[courseName]) {
        quizzesByCourse[courseName] = [];
      }
      quizzesByCourse[courseName].push(quiz);
    });

    container.innerHTML = Object.entries(quizzesByCourse).map(([courseName, courseQuizzes]) => `
      <div class="course-quizzes-section">
        <h3>${courseName}</h3>
        <div class="course-quizzes">
          ${courseQuizzes.map(quiz => {
            const isAvailable = quiz.isPublished && (!quiz.startDate || new Date() >= new Date(quiz.startDate));
            const isExpired = quiz.endDate && new Date() > new Date(quiz.endDate);
            
            return `
              <div class="quiz-item ${!quiz.isPublished ? "unpublished" : ""} ${isExpired ? "expired" : ""}" data-quiz-id="${quiz._id}">
                <div class="quiz-info">
                  <span class="quiz-type type-${quiz.type}">${this.formatQuizType(quiz.type)}</span>
                  <h4>${quiz.title}</h4>
                  <p>${quiz.description || "No description"}</p>
                  <div class="quiz-meta">
                    <span>Duration: ${this.formatTime(quiz.duration)}</span>
                    <span>Questions: ${quiz.questions?.length || 0}</span>
                    <span>Points: ${quiz.totalPoints || 0}</span>
                  </div>
                </div>
                <div class="quiz-actions">
                  ${isAvailable && !isExpired ? 
                    `<button class="btn-primary take-quiz" data-quiz-id="${quiz._id}">Take Quiz</button>` : 
                    isExpired ? 
                      '<span class="unavailable">Expired</span>' :
                      '<span class="unavailable">Not available</span>'
                  }

                </div>
              </div>
            `;
          }).join("")}
        </div>
      </div>
    `).join("");

    // Add event listeners
    this.setupAllQuizzesEventListeners();
  }

  static setupAllQuizzesEventListeners() {
    // Take quiz buttons
    document.querySelectorAll('.take-quiz').forEach(button => {
      button.addEventListener('click', (e) => {
        const quizId = e.target.dataset.quizId;
        this.startQuiz(quizId);
      });
    });


  }



  static async showCourseSyllabus(courseId) {
    try {
      const { getToken } = window.dashboardUtils || {};
      if (!getToken) {
        throw new Error("Dashboard utilities not available");
      }

      const token = getToken();
      const API_BASE_URL = "http://localhost:3761/api";

      // Get course details and lessons for syllabus
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

      if (courseData.success && lessonsData.success) {
        this.displayCourseSyllabus(courseData.data, lessonsData.data || []);
      } else {
        throw new Error("Failed to load course syllabus");
      }
    } catch (error) {
      console.error("Error loading course syllabus:", error);
      alert(`Error loading syllabus: ${error.message}`);
    }
  }

  static displayCourseSyllabus(course, lessons) {
    const sortedLessons = lessons.sort((a, b) => (a.order || 0) - (b.order || 0));
    
    const syllabusHTML = `
      <div id="syllabusModal" class="modal">
        <div class="modal-content syllabus-modal">
          <div class="modal-header">
            <h3>Course Syllabus - ${course.title}</h3>
            <button class="close-modal">&times;</button>
          </div>
          <div class="modal-body">
            <div class="course-overview">
              <h4>Course Overview</h4>
              <p>${course.description}</p>
              <div class="course-meta">
                <span class="category">${course.category}</span>
                <span class="level">${course.level}</span>
                <span class="instructor">Instructor: ${course.instructor?.firstName} ${course.instructor?.lastName}</span>
              </div>
            </div>
            
            <div class="syllabus-content">
              <h4>Course Structure</h4>
              ${sortedLessons.length > 0 ? `
                <div class="lessons-list">
                  ${sortedLessons.map((lesson, index) => `
                    <div class="syllabus-lesson">
                      <div class="lesson-number">${lesson.order || index + 1}</div>
                      <div class="lesson-info">
                        <h5>${lesson.title}</h5>
                        <p>${this.truncateText(lesson.content || "No description", 100)}</p>
                        <span class="lesson-type">${this.formatLessonType(lesson.type)}</span>
                      </div>
                    </div>
                  `).join("")}
                </div>
              ` : `
                <p>No lessons have been published for this course yet.</p>
              `}
            </div>
          </div>
        </div>
      </div>
    `;

    // Remove existing modal if any
    const existingModal = document.getElementById("syllabusModal");
    if (existingModal) {
      existingModal.remove();
    }

    // Add modal to body
    document.body.insertAdjacentHTML('beforeend', syllabusHTML);

    // Setup modal event listeners with multiple fallback methods
    const modal = document.getElementById("syllabusModal");
    const closeBtn = modal.querySelector(".close-modal");

    // Method 1: Direct onclick
    closeBtn.onclick = () => modal.remove();
    
    // Method 2: Event listener
    closeBtn.addEventListener('click', () => {
      modal.remove();
    });

    // Method 3: Click outside modal to close
    modal.addEventListener('click', (e) => {
      if (e.target === modal) {
        modal.remove();
      }
    });

    // Method 4: Escape key to close
    const handleEscape = (e) => {
      if (e.key === 'Escape') {
        modal.remove();
        document.removeEventListener('keydown', handleEscape);
      }
    };
    document.addEventListener('keydown', handleEscape);
  }

  // Utility methods
  static formatStatus(status) {
    const statusMap = {
      'enrolled': 'Enrolled',
      'in-progress': 'In Progress',
      'completed': 'Completed',
      'dropped': 'Dropped'
    };
    return statusMap[status] || status;
  }

  static formatQuizType(type) {
    const types = {
      'quiz': 'Quiz',
      'midterm': 'Midterm',
      'final': 'Final Exam',
      'assignment': 'Assignment'
    };
    return types[type] || 'Quiz';
  }

  static formatLessonType(type) {
    const types = {
      'text': 'Text',
      'video': 'Video',
      'quiz': 'Quiz',
      'assignment': 'Assignment'
    };
    return types[type] || 'Text';
  }

  static formatTime(minutes) {
    if (!minutes) return "No time limit";
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    if (hours > 0) {
      return `${hours}h ${mins}m`;
    }
    return `${mins} minutes`;
  }

  static truncateText(text, maxLength) {
    if (text.length <= maxLength) return text;
    return text.substring(0, maxLength) + '...';
  }

  // Legacy methods for backward compatibility
  static viewLessons() {
    this.showFeatureComingSoon();
  }

  static viewProgress() {
    this.showFeatureComingSoon();
  }

  static viewExams() {
    this.showQuizzesAndExams();
  }

  static showProgress() {
    this.showFeatureComingSoon();
  }

  static showExams() {
    this.showQuizzesAndExams();
  }

  static showFeatureComingSoon() {
    alert("Feature coming soon");
  }
}