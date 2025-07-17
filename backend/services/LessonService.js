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
    if (
      course.status !== "published" &&
      userRole !== "instructor" &&
      userRole !== "admin"
    ) {
      // For unpublished courses, only instructors and admins can view
      if (
        userRole === "instructor" &&
        course.instructor.toString() !== userId
      ) {
        throw new Error("Access denied");
      }
      if (!userRole) {
        throw new Error("Course is not yet published");
      }
    }

    // Students need to be enrolled to view lessons
    if (userRole === "student") {
      const enrollment = await Enrollment.findOne({
        student: userId,
        course: courseId,
        status: "active",
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
    const lesson = await Lesson.findById(lessonId).populate(
      "course",
      "title instructor status"
    );

    if (!lesson) {
      throw new Error("Lesson not found");
    }

    // Check course access
    const course = lesson.course;

    if (
      course.status !== "published" &&
      userRole !== "instructor" &&
      userRole !== "admin"
    ) {
      if (
        userRole === "instructor" &&
        course.instructor.toString() !== userId
      ) {
        throw new Error("Access denied");
      }
      if (!userRole) {
        throw new Error("Course is not yet published");
      }
    }

    // Check lesson publication status
    if (
      !lesson.isPublished &&
      userRole !== "instructor" &&
      userRole !== "admin"
    ) {
      if (
        userRole === "instructor" &&
        course.instructor.toString() !== userId
      ) {
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
        course: course._id,
        status: "active",
      });

      if (!enrollment) {
        throw new Error(
          "You must be enrolled in this course to view this lesson"
        );
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
        createdBy: instructorId,
      });

      await lesson.save({ session });

      // Update course lesson count
      await Course.findByIdAndUpdate(
        course._id,
        { $inc: { lessonCount: 1 } },
        { session }
      );

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
      const lesson = await Lesson.findById(lessonId)
        .populate("course")
        .session(session);

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
        status: "active",
      }).session(session);

      if (!enrollment) {
        throw new Error(
          "You must be enrolled in this course to complete lessons"
        );
      }

      // Check if lesson is already completed
      const existingProgress = enrollment.progress.lessons.find(
        (p) => p.lesson.toString() === lessonId
      );

      if (existingProgress && existingProgress.completed) {
        throw new Error("Lesson already completed");
      }

      // Update or create lesson progress
      if (existingProgress) {
        existingProgress.completed = true;
        existingProgress.completedAt = new Date();
        if (completionData.timeSpent) {
          existingProgress.timeSpent = completionData.timeSpent;
        }
        if (completionData.notes) {
          existingProgress.notes = completionData.notes;
        }
      } else {
        enrollment.progress.lessons.push({
          lesson: lessonId,
          completed: true,
          completedAt: new Date(),
          timeSpent: completionData.timeSpent || 0,
          notes: completionData.notes || "",
        });
      }

      // Update overall progress
      const totalLessons = await Lesson.countDocuments({
        course: lesson.course._id,
        isPublished: true,
      }).session(session);

      const completedLessons = enrollment.progress.lessons.filter(
        (p) => p.completed
      ).length;
      enrollment.progress.percentage = Math.round(
        (completedLessons / totalLessons) * 100
      );

      // Check if course is completed
      if (enrollment.progress.percentage >= 100) {
        enrollment.status = "completed";
        enrollment.completedAt = new Date();
      }

      await enrollment.save({ session });

      return {
        lessonCompleted: true,
        courseProgress: enrollment.progress.percentage,
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
      // Students can only see their own progress
      const enrollment = await Enrollment.findOne({
        student: userId,
        course: lesson.course._id,
      });

      if (!enrollment) {
        return { completed: false, timeSpent: 0 };
      }

      const lessonProgress = enrollment.progress.lessons.find(
        (p) => p.lesson.toString() === lessonId
      );

      return lessonProgress || { completed: false, timeSpent: 0 };
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

    // Get enrollment statistics
    const enrollments = await Enrollment.find({
      course: lesson.course._id,
      status: { $in: ["active", "completed"] },
    });

    const totalStudents = enrollments.length;
    const completedCount = enrollments.filter((enrollment) =>
      enrollment.progress.lessons.some(
        (p) => p.lesson.toString() === lessonId && p.completed
      )
    ).length;

    const completionRate =
      totalStudents > 0
        ? Math.round((completedCount / totalStudents) * 100)
        : 0;

    // Calculate average time spent
    const timeSpentData = enrollments
      .map((enrollment) => {
        const lessonProgress = enrollment.progress.lessons.find(
          (p) => p.lesson.toString() === lessonId
        );
        return lessonProgress ? lessonProgress.timeSpent : 0;
      })
      .filter((time) => time > 0);

    const averageTimeSpent =
      timeSpentData.length > 0
        ? Math.round(
            timeSpentData.reduce((sum, time) => sum + time, 0) /
              timeSpentData.length
          )
        : 0;

    return {
      totalStudents,
      completedCount,
      completionRate,
      averageTimeSpent,
      engagementLevel:
        completionRate >= 80 ? "High" : completionRate >= 50 ? "Medium" : "Low",
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
