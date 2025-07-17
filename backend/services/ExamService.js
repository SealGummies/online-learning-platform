const mongoose = require("mongoose");
const Exam = require("../models/Exam");
const Course = require("../models/Course");
const Enrollment = require("../models/Enrollment");
const TransactionService = require("./TransactionService");

class ExamService {
  /**
   * Get exams for a course
   */
  static async getExams(courseId, userId, userRole) {
    if (!courseId) {
      throw new Error("Course ID is required");
    }

    // Check if course exists and user has access
    const course = await Course.findById(courseId);
    if (!course) {
      throw new Error("Course not found");
    }

    // Check access permissions
    if (userRole === "student") {
      // Students can only see exams if enrolled in the course
      const enrollment = await Enrollment.findOne({
        student: userId,
        course: courseId,
        status: "active",
      });

      if (!enrollment) {
        throw new Error("You must be enrolled in this course to view exams");
      }

      // Students only see published exams
      return await Exam.find({
        course: courseId,
        isPublished: true,
      }).select("-questions.correctAnswer -questions.explanation");
    } else if (userRole === "instructor") {
      // Instructors can only see their own course exams
      if (course.instructor.toString() !== userId) {
        throw new Error(
          "Access denied. You can only view exams for your own courses."
        );
      }

      return await Exam.find({ course: courseId });
    } else if (userRole === "admin") {
      // Admins can see all exams
      return await Exam.find({ course: courseId });
    }

    throw new Error("Access denied");
  }

  /**
   * Get exam by ID
   */
  static async getExamById(examId, userId, userRole) {
    const exam = await Exam.findById(examId).populate(
      "course",
      "title instructor"
    );

    if (!exam) {
      throw new Error("Exam not found");
    }

    // Check access permissions
    if (userRole === "student") {
      // Check if student is enrolled in the course
      const enrollment = await Enrollment.findOne({
        student: userId,
        course: exam.course._id,
        status: "active",
      });

      if (!enrollment) {
        throw new Error(
          "You must be enrolled in this course to view this exam"
        );
      }

      if (!exam.isPublished) {
        throw new Error("This exam is not yet available");
      }

      // Don't show correct answers and explanations to students
      const examResponse = exam.toObject();
      examResponse.questions = examResponse.questions.map((q) => ({
        ...q,
        correctAnswer: undefined,
        explanation: undefined,
      }));

      return examResponse;
    } else if (userRole === "instructor") {
      // Instructors can only view their own course exams
      if (exam.course.instructor.toString() !== userId) {
        throw new Error(
          "Access denied. You can only view exams for your own courses."
        );
      }

      return exam;
    } else if (userRole === "admin") {
      // Admins can view all exams
      return exam;
    }

    throw new Error("Access denied");
  }

  /**
   * Create a new exam
   */
  static async createExam(examData, instructorId) {
    return await TransactionService.executeWithTransaction(async (session) => {
      // Verify that the instructor owns the course
      const course = await Course.findById(examData.course).session(session);
      if (!course) {
        throw new Error("Course not found");
      }

      if (course.instructor.toString() !== instructorId) {
        throw new Error("You can only create exams for your own courses");
      }

      // Validate exam data
      if (!examData.title || examData.title.length < 5) {
        throw new Error("Exam title must be at least 5 characters long");
      }

      if (!examData.questions || examData.questions.length === 0) {
        throw new Error("Exam must have at least one question");
      }

      // Validate questions
      for (let i = 0; i < examData.questions.length; i++) {
        const question = examData.questions[i];

        if (!question.question || question.question.length < 10) {
          throw new Error(
            `Question ${
              i + 1
            }: Question text must be at least 10 characters long`
          );
        }

        if (question.type === "multiple-choice") {
          if (!question.options || question.options.length < 2) {
            throw new Error(
              `Question ${
                i + 1
              }: Multiple choice questions must have at least 2 options`
            );
          }

          if (
            question.correctAnswer === undefined ||
            question.correctAnswer >= question.options.length
          ) {
            throw new Error(`Question ${i + 1}: Invalid correct answer index`);
          }
        }

        if (!question.points || question.points <= 0) {
          throw new Error(`Question ${i + 1}: Points must be greater than 0`);
        }
      }

      // Create exam
      const exam = new Exam({
        ...examData,
        course: course._id,
        createdBy: instructorId,
      });

      await exam.save({ session });
      return exam;
    });
  }

  /**
   * Update an exam
   */
  static async updateExam(examId, updateData, instructorId) {
    return await TransactionService.executeWithTransaction(async (session) => {
      const exam = await Exam.findById(examId)
        .populate("course")
        .session(session);

      if (!exam) {
        throw new Error("Exam not found");
      }

      // Check ownership
      if (exam.course.instructor.toString() !== instructorId) {
        throw new Error("You can only update your own exams");
      }

      // Prevent updates to published exams with attempts
      if (exam.isPublished && exam.attempts && exam.attempts.length > 0) {
        throw new Error("Cannot update exam with existing attempts");
      }

      // Validate update data (similar to create validation)
      if (updateData.title && updateData.title.length < 5) {
        throw new Error("Exam title must be at least 5 characters long");
      }

      if (updateData.questions) {
        for (let i = 0; i < updateData.questions.length; i++) {
          const question = updateData.questions[i];

          if (question.text && question.text.length < 10) {
            throw new Error(
              `Question ${
                i + 1
              }: Question text must be at least 10 characters long`
            );
          }

          if (question.type === "multiple-choice" && question.options) {
            if (question.options.length < 2) {
              throw new Error(
                `Question ${
                  i + 1
                }: Multiple choice questions must have at least 2 options`
              );
            }

            if (
              question.correctAnswer !== undefined &&
              question.correctAnswer >= question.options.length
            ) {
              throw new Error(
                `Question ${i + 1}: Invalid correct answer index`
              );
            }
          }

          if (question.points !== undefined && question.points <= 0) {
            throw new Error(`Question ${i + 1}: Points must be greater than 0`);
          }
        }
      }

      // Update exam
      Object.assign(exam, updateData);
      await exam.save({ session });

      return exam;
    });
  }

  /**
   * Delete an exam
   */
  static async deleteExam(examId, instructorId) {
    return await TransactionService.executeWithTransaction(async (session) => {
      const exam = await Exam.findById(examId)
        .populate("course")
        .session(session);

      if (!exam) {
        throw new Error("Exam not found");
      }

      // Check ownership
      if (exam.course.instructor.toString() !== instructorId) {
        throw new Error("You can only delete your own exams");
      }

      // Prevent deletion of exams with attempts
      if (exam.attempts && exam.attempts.length > 0) {
        throw new Error("Cannot delete exam with existing attempts");
      }

      await Exam.findByIdAndDelete(examId).session(session);
      return { message: "Exam deleted successfully" };
    });
  }

  /**
   * Submit exam attempt
   */
  static async submitExam(examId, studentId, answers) {
    return await TransactionService.executeWithTransaction(async (session) => {
      const exam = await Exam.findById(examId)
        .populate("course")
        .session(session);

      if (!exam) {
        throw new Error("Exam not found");
      }

      if (!exam.isPublished) {
        throw new Error("This exam is not yet available");
      }

      // Check if student is enrolled
      const enrollment = await Enrollment.findOne({
        student: studentId,
        course: exam.course._id,
        status: { $in: ["enrolled", "in-progress"] },
      }).session(session);

      if (!enrollment) {
        throw new Error(
          "You must be enrolled in this course to take this exam"
        );
      }

      // Check attempt limits based on exam settings and current stats
      if (
        exam.settings?.attempts &&
        exam.stats.attempts >= exam.settings.attempts
      ) {
        throw new Error(
          `Maximum attempts (${exam.settings.attempts}) exceeded`
        );
      }

      // Calculate score
      let totalScore = 0;
      let maxScore = 0;
      const gradedAnswers = [];

      exam.questions.forEach((question, index) => {
        maxScore += question.points;
        const studentAnswer = answers[index];
        let isCorrect = false;
        let score = 0;

        if (question.type === "multiple-choice") {
          // Check if using correctAnswer index or isCorrect flags in options
          if (typeof question.correctAnswer === "number") {
            // Using index-based correct answer
            isCorrect = studentAnswer === question.correctAnswer;
          } else if (question.options && question.options.length > 0) {
            // Using isCorrect flags in options - find the correct option text
            const correctOption = question.options.find((opt) => opt.isCorrect);
            isCorrect =
              correctOption && studentAnswer?.answer === correctOption.text;
          }
          score = isCorrect ? question.points : 0;
        } else if (question.type === "true-false") {
          isCorrect = studentAnswer === question.correctAnswer;
          score = isCorrect ? question.points : 0;
        } else if (question.type === "short-answer") {
          // For short answer, manual grading required
          isCorrect = null;
          score = 0; // Will be updated during manual grading
        }

        totalScore += score;
        gradedAnswers.push({
          questionIndex: index,
          answer: studentAnswer,
          isCorrect,
          score,
          maxScore: question.points,
        });
      });

      // Create attempt result
      const attempt = {
        student: studentId,
        submittedAt: new Date(),
        answers: gradedAnswers,
        score: totalScore,
        maxScore,
        percentage:
          maxScore > 0 ? Math.round((totalScore / maxScore) * 100) : 0,
        isGraded: !exam.questions.some((q) => q.type === "short-answer"),
        timeSpent: 0, // This should be calculated based on start time if tracking
      };

      // Update exam statistics instead of storing individual attempts
      exam.stats.attempts += 1;
      if (attempt.percentage >= (exam.settings.passingScore || 70)) {
        exam.stats.completions += 1;
      }

      // Update average score
      const currentAvg = exam.stats.averageScore || 0;
      const newAvg =
        (currentAvg * (exam.stats.attempts - 1) + attempt.percentage) /
        exam.stats.attempts;
      exam.stats.averageScore = Math.round(newAvg * 100) / 100;

      await exam.save({ session });

      // Update enrollment progress if exam is passed
      if (
        exam.settings.passingScore &&
        attempt.percentage >= exam.settings.passingScore
      ) {
        // Could update course progress here
      }

      return {
        attemptId: new mongoose.Types.ObjectId(), // Generate a mock ID since we're not storing attempts
        score: totalScore,
        maxScore,
        percentage: attempt.percentage,
        isGraded: attempt.isGraded,
        exam: exam._id,
        attempt: attempt,
      };
    });
  }

  /**
   * Get exam attempts
   */
  static async getExamAttempts(examId, userId, userRole) {
    const exam = await Exam.findById(examId).populate("course");

    if (!exam) {
      throw new Error("Exam not found");
    }

    if (userRole === "student") {
      // Students can only see their own attempts
      const studentAttempts = exam.attempts.filter(
        (a) => a.student.toString() === userId
      );
      return studentAttempts;
    } else if (userRole === "instructor") {
      // Instructors can see all attempts for their course exams
      if (exam.course.instructor.toString() !== userId) {
        throw new Error("Access denied");
      }

      return exam.attempts;
    } else if (userRole === "admin") {
      // Admins can see all attempts
      return exam.attempts;
    }

    throw new Error("Access denied");
  }

  /**
   * Get exam statistics
   */
  static async getExamStats(examId, instructorId) {
    const exam = await Exam.findById(examId).populate("course");

    if (!exam) {
      throw new Error("Exam not found");
    }

    if (exam.course.instructor.toString() !== instructorId) {
      throw new Error("Access denied");
    }

    // Use existing stats instead of non-existent attempts array
    const totalAttempts = exam.stats.attempts || 0;
    const averageScore = exam.stats.averageScore || 0;
    const highestScore = exam.stats.highestScore || 0;
    const lowestScore = exam.stats.lowestScore || 0;

    if (totalAttempts === 0) {
      return {
        totalAttempts: 0,
        uniqueStudents: 0,
        averageScore: 0,
        highestScore: 0,
        lowestScore: 0,
        passRate: 0,
      };
    }

    return {
      totalAttempts,
      uniqueStudents: totalAttempts, // Assume each attempt is by different student for now
      averageScore: Math.round(averageScore),
      highestScore,
      lowestScore,
      passRate: Math.round(exam.stats.passRate || 0),
    };
  }

  /**
   * Grade exam manually (for subjective questions)
   */
  static async gradeExam(examId, attemptId, grades, feedback, instructorId) {
    return await TransactionService.executeWithTransaction(async (session) => {
      const exam = await Exam.findById(examId)
        .populate("course")
        .session(session);

      if (!exam) {
        throw new Error("Exam not found");
      }

      if (exam.course.instructor.toString() !== instructorId) {
        throw new Error("Access denied");
      }

      const attempt = exam.attempts.id(attemptId);
      if (!attempt) {
        throw new Error("Attempt not found");
      }

      // Update grades for subjective questions
      let totalScore = 0;
      attempt.answers.forEach((answer, index) => {
        if (grades[index] !== undefined) {
          answer.score = grades[index];
          answer.isCorrect = grades[index] > 0;
        }
        totalScore += answer.score;
      });

      attempt.score = totalScore;
      attempt.percentage = Math.round((totalScore / attempt.maxScore) * 100);
      attempt.isGraded = true;
      attempt.feedback = feedback;
      attempt.gradedAt = new Date();
      attempt.gradedBy = instructorId;

      await exam.save({ session });

      return {
        score: totalScore,
        maxScore: attempt.maxScore,
        percentage: attempt.percentage,
      };
    });
  }
}

module.exports = ExamService;
