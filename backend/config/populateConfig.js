/**
 * Standardized Populate Field Configurations
 * Defines consistent field sets for populating references across all services
 */

const PopulateConfig = {
  /**
   * User populate configurations
   */
  user: {
    // Basic user info (for public display)
    basic: "firstName lastName",
    
    // Detailed user info (includes contact)
    detailed: "firstName lastName email",
    
    // Profile info (excludes sensitive data)
    profile: "firstName lastName email role isActive createdAt",
    
    // Admin view (includes all non-sensitive fields)
    admin: "firstName lastName email role isActive createdAt lastLogin"
  },

  /**
   * Course populate configurations
   */
  course: {
    // Basic course info
    basic: "title category level",
    
    // Detailed course info
    detailed: "title description category level duration instructor isActive",
    
    // Full course info (includes all fields except sensitive ones)
    full: "title description category level duration instructor isActive createdAt updatedAt rating"
  },

  /**
   * Enrollment populate configurations
   */
  enrollment: {
    // Basic enrollment info
    basic: "status enrollmentDate completionPercentage",
    
    // Detailed enrollment info
    detailed: "status enrollmentDate completionPercentage finalGrade review",
    
    // Full enrollment info
    full: "status enrollmentDate completionPercentage finalGrade review createdAt updatedAt"
  },

  /**
   * Exam populate configurations
   */
  exam: {
    // Basic exam info
    basic: "title type duration",
    
    // Student view (excludes answers)
    student: "title description type duration startDate endDate isPublished instructions",
    
    // Instructor view (includes all fields)
    instructor: "title description type duration startDate endDate isPublished isActive questions totalPoints instructions"
  },

  /**
   * Nested populate configurations for complex queries
   */
  nested: {
    // Course with instructor details
    courseWithInstructor: {
      path: "course",
      select: "title description category level duration instructor isActive",
      populate: {
        path: "instructor",
        select: "firstName lastName email"
      }
    },

    // Enrollment with course and instructor
    enrollmentWithCourse: {
      path: "course",
      select: "title category level instructor",
      populate: {
        path: "instructor",
        select: "firstName lastName email"
      }
    },

    // Student with basic info
    enrollmentWithStudent: {
      path: "student",
      select: "firstName lastName email"
    },

    // Exam with course details
    examWithCourse: {
      path: "course",
      select: "title instructor",
      populate: {
        path: "instructor",
        select: "firstName lastName email"
      }
    }
  },

  /**
   * Role-based populate configurations
   */
  byRole: {
    student: {
      instructor: "firstName lastName email",
      course: "title description category level duration isActive rating",
      enrollment: "status enrollmentDate completionPercentage finalGrade"
    },
    
    instructor: {
      student: "firstName lastName email",
      course: "title description category level duration isActive createdAt rating",
      enrollment: "status enrollmentDate completionPercentage finalGrade review"
    },
    
    admin: {
      user: "firstName lastName email role isActive createdAt lastLogin",
      course: "title description category level duration instructor isActive createdAt updatedAt rating",
      enrollment: "status enrollmentDate completionPercentage finalGrade review createdAt updatedAt"
    }
  },

  /**
   * Context-specific populate configurations
   */
  context: {
    // For public course listings
    publicCourseList: {
      instructor: "firstName lastName"
    },
    
    // For enrolled student's course view
    studentCourseView: {
      instructor: "firstName lastName email"
    },
    
    // For instructor's student management
    instructorStudentView: {
      student: "firstName lastName email"
    },
    
    // For admin user management
    adminUserView: {
      user: "firstName lastName email role isActive createdAt lastLogin"
    },
    
    // For dashboard displays
    dashboardView: {
      instructor: "firstName lastName",
      course: "title category level",
      enrollment: "status completionPercentage"
    }
  }
};

/**
 * Helper functions for common populate operations
 */
PopulateConfig.helpers = {
  /**
   * Get populate config based on user role and context
   * @param {string} role - User role (student, instructor, admin)
   * @param {string} field - Field to populate (instructor, course, etc.)
   * @param {string} context - Context (basic, detailed, etc.)
   * @returns {string} Field selection string
   */
  getFieldsByRole(role, field, context = 'basic') {
    if (PopulateConfig.byRole[role] && PopulateConfig.byRole[role][field]) {
      return PopulateConfig.byRole[role][field];
    }
    
    // Fallback to basic config
    return PopulateConfig[field] ? PopulateConfig[field][context] : '';
  },

  /**
   * Get context-specific populate config
   * @param {string} context - Context name
   * @param {string} field - Field to populate
   * @returns {string} Field selection string
   */
  getFieldsByContext(context, field) {
    if (PopulateConfig.context[context] && PopulateConfig.context[context][field]) {
      return PopulateConfig.context[context][field];
    }
    
    // Fallback to basic config
    return PopulateConfig[field] ? PopulateConfig[field].basic : '';
  },

  /**
   * Create populate object for nested population
   * @param {string} path - Path to populate
   * @param {string} select - Fields to select
   * @param {Object} nestedPopulate - Nested populate configuration
   * @returns {Object} Populate configuration object
   */
  createNestedPopulate(path, select, nestedPopulate = null) {
    const config = { path, select };
    if (nestedPopulate) {
      config.populate = nestedPopulate;
    }
    return config;
  },

  /**
   * Get standard instructor populate based on context
   * @param {string} context - Context (public, student, admin)
   * @returns {string} Instructor fields
   */
  getInstructorFields(context = 'public') {
    switch (context) {
      case 'public':
        return PopulateConfig.user.basic;
      case 'student':
      case 'enrolled':
        return PopulateConfig.user.detailed;
      case 'admin':
        return PopulateConfig.user.admin;
      default:
        return PopulateConfig.user.basic;
    }
  },

  /**
   * Get standard course populate based on context
   * @param {string} context - Context (basic, detailed, full)
   * @returns {string} Course fields
   */
  getCourseFields(context = 'basic') {
    return PopulateConfig.course[context] || PopulateConfig.course.basic;
  },

  /**
   * Get standard user populate based on role and context
   * @param {string} role - Requesting user's role
   * @param {string} context - Context (basic, detailed, admin)
   * @returns {string} User fields
   */
  getUserFields(role = 'student', context = 'basic') {
    if (role === 'admin') {
      return PopulateConfig.user.admin;
    }
    return PopulateConfig.user[context] || PopulateConfig.user.basic;
  }
};

module.exports = PopulateConfig;
