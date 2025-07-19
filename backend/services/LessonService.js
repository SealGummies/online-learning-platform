const Lesson = require("../models/Lesson");
const Course = require("../models/Course");
const Enrollment = require("../models/Enrollment");
const TransactionService = require("./TransactionService");

class LessonService {
  /**
   * Get lessons for a course
   */
  static async getLessons(courseId, userId, userRole) {
    if (!courseId) {
      throw new Error("Course ID is required");
    }

    // Check if course exists
    const course = await Course.findById(courseId);
    if (!course) {
      throw new Error("Course not found");
    }

    // Check access permissions
    if (!course.isActive && userRole !== "instructor" && userRole !== "admin") {
      if (userRole === "instructor" && course.instructor.toString() !== userId) {
        throw new Error("Access denied");
      }
      if (!userRole) {
        throw new Error("Course is not active");
      }
    }

    // Students need to be enrolled to view lessons
    if (userRole === "student") {
      const enrollment = await Enrollment.findOne({
        student: userId,
        course: courseId,
        status: { $in: ["enrolled", "in-progress"] },
      });
      if (!enrollment) {
        throw new Error("You must be enrolled in this course to view lessons");
      }
    }

    // Get lessons based on user role
    let query = { course: courseId };

    if (userRole === "student" || !userRole) {
      // Students and public users only see published lessons
      query.isPublished = true;
    } else if (userRole === "instructor") {
      // Instructors can see all lessons for their courses
      if (course.instructor.toString() !== userId) {
        query.isPublished = true; // Other instructors only see published
      }
    }
    // Admins can see all lessons (no additional filters)

    const lessons = await Lesson.find(query).sort({ order: 1, createdAt: 1 });

    return lessons;
  }

  /**
   * Get lesson by ID
   */
  static async getLessonById(lessonId, userId, userRole) {
    const lesson = await Lesson.findById(lessonId).populate("course", "title instructor isActive");

    if (!lesson) {
      throw new Error("Lesson not found");
    }

    // Check course access
    const course = lesson.course;

    if (!lesson.course.isActive && userRole !== "instructor" && userRole !== "admin") {
      if (userRole === "instructor" && lesson.course.instructor.toString() !== userId) {
        throw new Error("Access denied");
      }
      if (!userRole) {
        throw new Error("Course is not active");
      }
    }

    // Check lesson publication status
    if (!lesson.isPublished && userRole !== "instructor" && userRole !== "admin") {
      if (userRole === "instructor" && lesson.course.instructor.toString() !== userId) {
        throw new Error("Lesson not found");
      }
      if (!userRole || userRole === "student") {
        throw new Error("Lesson not found");
      }
    }

    // Students need to be enrolled
    if (userRole === "student") {
      const enrollment = await Enrollment.findOne({
        student: userId,
        course: lesson.course._id,
        status: { $in: ["enrolled", "in-progress"] },
      });
      if (!enrollment) {
        throw new Error("You must be enrolled in this course to view this lesson");
      }
    }

    return lesson;
  }

  /**
   * Create a new lesson
   */
  static async createLesson(lessonData, instructorId) {
    return await TransactionService.executeWithTransaction(async (session) => {
      // Verify that the instructor owns the course
      const course = await Course.findById(lessonData.course).session(session);
      if (!course) {
        throw new Error("Course not found");
      }

      if (course.instructor.toString() !== instructorId) {
        throw new Error("You can only create lessons for your own courses");
      }

      // Validate lesson data
      if (!lessonData.title || lessonData.title.length < 5) {
        throw new Error("Lesson title must be at least 5 characters long");
      }

      if (!lessonData.content || lessonData.content.length < 50) {
        throw new Error("Lesson content must be at least 50 characters long");
      }

      if (
        lessonData.type &&
        !["video", "text", "interactive", "quiz"].includes(lessonData.type)
      ) {
        throw new Error("Invalid lesson type");
      }

      // Set order if not provided
      if (!lessonData.order) {
        const lastLesson = await Lesson.findOne({ course: lessonData.course })
          .sort({ order: -1 })
          .session(session);
        lessonData.order = lastLesson ? lastLesson.order + 1 : 1;
      }

      // Create lesson
      const lesson = new Lesson({
        ...lessonData,
        course: course._id,
      });

      await lesson.save({ session });

      // 删除lessonCount相关逻辑

      return lesson;
    });
  }

  /**
   * Update a lesson
   */
  static async updateLesson(lessonId, updateData, instructorId) {
    return await TransactionService.executeWithTransaction(async (session) => {
      const lesson = await Lesson.findById(lessonId)
        .populate("course")
        .session(session);

      if (!lesson) {
        throw new Error("Lesson not found");
      }

      // Check ownership
      if (lesson.course.instructor.toString() !== instructorId) {
        throw new Error("You can only update your own lessons");
      }

      // Validate update data
      if (updateData.title && updateData.title.length < 5) {
        throw new Error("Lesson title must be at least 5 characters long");
      }

      if (updateData.content && updateData.content.length < 50) {
        throw new Error("Lesson content must be at least 50 characters long");
      }

      if (
        updateData.type &&
        !["video", "text", "interactive", "quiz"].includes(updateData.type)
      ) {
        throw new Error("Invalid lesson type");
      }

      // Update lesson
      Object.assign(lesson, updateData);
      await lesson.save({ session });

      return lesson;
    });
  }

  /**
   * Delete a lesson
   */
  static async deleteLesson(lessonId, instructorId) {
    return await TransactionService.executeWithTransaction(async (session) => {
      const lesson = await Lesson.findById(lessonId)
        .populate("course")
        .session(session);

      if (!lesson) {
        throw new Error("Lesson not found");
      }

      // Check ownership
      if (lesson.course.instructor.toString() !== instructorId) {
        throw new Error("You can only delete your own lessons");
      }

      // Check if lesson has progress records
      const hasProgress = await Enrollment.exists({
        course: lesson.course._id,
        "progress.lessons": { $elemMatch: { lesson: lessonId } },
      }).session(session);

      if (hasProgress) {
        throw new Error("Cannot delete lesson with existing progress records");
      }

      await Lesson.findByIdAndDelete(lessonId).session(session);

      // Update course lesson count
      await Course.findByIdAndUpdate(
        lesson.course._id,
        { $inc: { lessonCount: -1 } },
        { session }
      );

      return { message: "Lesson deleted successfully" };
    });
  }

  /**
   * Mark lesson as completed
   */
  static async completeLesson(lessonId, studentId, completionData) {
    return await TransactionService.executeWithTransaction(async (session) => {
      const lesson = await Lesson.findById(lessonId).populate("course").session(session);
      if (!lesson) {
        throw new Error("Lesson not found");
      }
      if (!lesson.isPublished) {
        throw new Error("Cannot complete unpublished lesson");
      }
      // Check enrollment
      const enrollment = await Enrollment.findOne({
        student: studentId,
        course: lesson.course._id,
        status: { $in: ["enrolled", "in-progress"] },
      }).session(session);
      if (!enrollment) {
        throw new Error("You must be enrolled in this course to complete lessons");
      }
      // 直接提升completionPercentage
      const { completionPercentage } = completionData;
      if (typeof completionPercentage === "number") {
        enrollment.completionPercentage = Math.max(0, Math.min(100, completionPercentage));
      } else {
        enrollment.completionPercentage = Math.min(100, enrollment.completionPercentage + 100 / (await Lesson.countDocuments({ course: lesson.course._id, isPublished: true }).session(session)));
      }
      if (enrollment.completionPercentage >= 100) {
        enrollment.status = "completed";
      }
      await enrollment.save({ session });
      return {
        lessonCompleted: true,
        courseProgress: enrollment.completionPercentage,
        courseCompleted: enrollment.status === "completed",
      };
    });
  }

  /**
   * Get lesson progress for a student
   */
  static async getLessonProgress(lessonId, userId, userRole) {
    const lesson = await Lesson.findById(lessonId).populate("course");

    if (!lesson) {
      throw new Error("Lesson not found");
    }

    if (userRole === "student") {
      const enrollment = await Enrollment.findOne({
        student: userId,
        course: lesson.course._id,
      });

      if (!enrollment) {
        return { completed: false, completionPercentage: 0 };
      }

      return { completionPercentage: enrollment.completionPercentage };
    } else if (userRole === "instructor") {
      // Instructors can see progress for their course lessons
      if (lesson.course.instructor.toString() !== userId) {
        throw new Error("Access denied");
      }

      // Get all student progress for this lesson
      const enrollments = await Enrollment.find({
        course: lesson.course._id,
        status: { $in: ["active", "completed"] },
      }).populate("student", "firstName lastName email");

      const progressData = enrollments.map((enrollment) => {
        const lessonProgress = enrollment.progress.lessons.find(
          (p) => p.lesson.toString() === lessonId
        );

        return {
          student: enrollment.student,
          progress: lessonProgress || { completed: false, timeSpent: 0 },
        };
      });

      return progressData;
    } else if (userRole === "admin") {
      // Admins can see all progress
      const enrollments = await Enrollment.find({
        course: lesson.course._id,
      }).populate("student", "firstName lastName email");

      const progressData = enrollments.map((enrollment) => {
        const lessonProgress = enrollment.progress.lessons.find(
          (p) => p.lesson.toString() === lessonId
        );

        return {
          student: enrollment.student,
          progress: lessonProgress || { completed: false, timeSpent: 0 },
        };
      });

      return progressData;
    }

    throw new Error("Access denied");
  }

  /**
   * Get lesson statistics
   */
  static async getLessonStats(lessonId, instructorId) {
    const lesson = await Lesson.findById(lessonId).populate("course");

    if (!lesson) {
      throw new Error("Lesson not found");
    }

    if (lesson.course.instructor.toString() !== instructorId) {
      throw new Error("Access denied");
    }

    // 统计报名数和完成数
    const enrollments = await Enrollment.find({
      course: lesson.course._id,
    });
    const totalStudents = enrollments.length;
    const completedCount = enrollments.filter((enrollment) => enrollment.completionPercentage >= 100).length;
    const completionRate = totalStudents > 0 ? Math.round((completedCount / totalStudents) * 100) : 0;

    return {
      totalStudents,
      completedCount,
      completionRate,
    };
  }

  /**
   * Reorder lessons in a course
   */
  static async reorderLessons(courseId, lessonOrder, instructorId) {
    return await TransactionService.executeWithTransaction(async (session) => {
      // Verify course ownership
      const course = await Course.findById(courseId).session(session);
      if (!course) {
        throw new Error("Course not found");
      }

      if (course.instructor.toString() !== instructorId) {
        throw new Error("You can only reorder lessons for your own courses");
      }

      // Validate lesson order array
      if (!Array.isArray(lessonOrder) || lessonOrder.length === 0) {
        throw new Error("Invalid lesson order data");
      }

      // Update lesson orders
      for (let i = 0; i < lessonOrder.length; i++) {
        const lessonId = lessonOrder[i];

        // Verify lesson belongs to the course
        const lesson = await Lesson.findOne({
          _id: lessonId,
          course: courseId,
        }).session(session);

        if (!lesson) {
          throw new Error(`Lesson ${lessonId} not found in this course`);
        }

        // Update order
        lesson.order = i + 1;
        await lesson.save({ session });
      }

      return { message: "Lessons reordered successfully" };
    });
  }
}

module.exports = LessonService;
