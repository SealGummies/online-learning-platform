const mongoose = require("mongoose");
const Course = require("../models/Course");
const User = require("../models/User");
const Enrollment = require("../models/Enrollment");
const Exam = require("../models/Exam");

class AnalyticsService {
  /**
   * Get top performing courses by enrollment count and average grades
   * Purpose: Identify most popular and successful courses for platform optimization
   * Business Value: Help administrators prioritize course promotion and instructor support
   */
  static async getTopPerformingCourses() {
    try {
      return await Course.aggregate([
        {
          $lookup: {
            from: "enrollments",
            localField: "_id",
            foreignField: "course",
            as: "enrollments",
          },
        },
        {
          $lookup: {
            from: "users",
            localField: "instructor",
            foreignField: "_id",
            as: "instructorInfo",
          },
        },
        {
          $addFields: {
            enrollmentCount: { $size: "$enrollments" },
            instructorName: {
              $concat: [
                { $arrayElemAt: ["$instructorInfo.firstName", 0] },
                " ",
                { $arrayElemAt: ["$instructorInfo.lastName", 0] },
              ],
            },
          },
        },
        {
          $project: {
            title: 1,
            description: 1,
            category: 1,
            level: 1,
            price: 1,
            enrollmentCount: 1,
            instructorName: 1,
            createdAt: 1,
          },
        },
        { $sort: { enrollmentCount: -1 } },
        { $limit: 10 },
      ]);
    } catch (error) {
      throw new Error(`Error fetching top performing courses: ${error.message}`);
    }
  }

  /**
   * Get student progress analytics across all enrolled courses
   * Purpose: Track individual student progress across all enrolled courses
   * Business Value: Enable personalized learning recommendations and early intervention
   */
  static async getStudentProgressAnalytics() {
    try {
      return await User.aggregate([
        { $match: { role: "student" } },
        {
          $lookup: {
            from: "enrollments",
            localField: "_id",
            foreignField: "student",
            as: "enrollments",
          },
        },
        { $unwind: "$enrollments" },
        {
          $lookup: {
            from: "courses",
            localField: "enrollments.course",
            foreignField: "_id",
            as: "courseDetails",
          },
        },
        { $unwind: "$courseDetails" },
        {
          $addFields: {
            completionPercentage: "$enrollments.completionPercentage",
            finalGrade: "$enrollments.finalGrade",
          },
        },
        {
          $project: {
            studentName: { $concat: ["$firstName", " ", "$lastName"] },
            studentEmail: "$email",
            courseName: "$courseDetails.title",
            courseCategory: "$courseDetails.category",
            courseLevel: "$courseDetails.level",
            completionPercentage: 1,
            finalGrade: 1,
            enrolledAt: "$enrollments.enrollmentDate",
            status: "$enrollments.status",
          },
        },
        { $sort: { completionPercentage: -1 } },
      ]);
    } catch (error) {
      throw new Error(`Error fetching student progress analytics: ${error.message}`);
    }
  }

  /**
   * Get instructor teaching analytics
   * Purpose: Analyze instructor performance and course management efficiency
   * Business Value: Support instructor development and course quality improvement
   */
  static async getInstructorAnalytics() {
    try {
      return await User.aggregate([
        { $match: { role: "instructor" } },
        {
          $lookup: {
            from: "courses",
            localField: "_id",
            foreignField: "instructor",
            as: "courses",
          },
        },
        {
          $lookup: {
            from: "enrollments",
            localField: "courses._id",
            foreignField: "course",
            as: "enrollments",
          },
        },
        {
          $addFields: {
            totalCourses: { $size: "$courses" },
            totalEnrollments: { $size: "$enrollments" },
            averageEnrollmentsPerCourse: {
              $cond: {
                if: { $gt: [{ $size: "$courses" }, 0] },
                then: { $divide: [{ $size: "$enrollments" }, { $size: "$courses" }] },
                else: 0,
              },
            },
          },
        },
        {
          $project: {
            instructorName: { $concat: ["$firstName", " ", "$lastName"] },
            email: 1,
            totalCourses: 1,
            totalEnrollments: 1,
            averageEnrollmentsPerCourse: 1,
            createdAt: 1,
          },
        },
        { $sort: { totalEnrollments: -1 } },
      ]);
    } catch (error) {
      throw new Error(`Error fetching instructor analytics: ${error.message}`);
    }
  }

  /**
   * Get course completion trends over time
   * Purpose: Track course completion patterns and identify seasonal trends
   * Business Value: Optimize course scheduling and marketing campaigns
   */
  static async getCourseCompletionTrends() {
    try {
      return await Enrollment.aggregate([
        { $match: { status: "completed" } },
        {
          $lookup: {
            from: "courses",
            localField: "course",
            foreignField: "_id",
            as: "courseInfo",
          },
        },
        { $unwind: "$courseInfo" },
        {
          $group: {
            _id: {
              year: { $year: "$updatedAt" },
              month: { $month: "$updatedAt" },
              course: "$courseInfo.title",
              courseId: "$courseInfo._id",
            },
            completions: { $sum: 1 },
            category: { $first: "$courseInfo.category" },
            level: { $first: "$courseInfo.level" },
          },
        },
        {
          $sort: {
            "_id.year": -1,
            "_id.month": -1,
            completions: -1,
          },
        },
      ]);
    } catch (error) {
      throw new Error(`Error fetching course completion trends: ${error.message}`);
    }
  }

  /**
   * Get exam performance analysis with grade distribution
   * Purpose: Analyze exam difficulty and student performance patterns
   * Business Value: Identify courses needing curriculum adjustments
   */
  static async getExamPerformanceAnalysis() {
    try {
      return await Enrollment.aggregate([
        { $unwind: "$examsCompleted" },
        {
          $lookup: {
            from: "exams",
            localField: "examsCompleted.exam",
            foreignField: "_id",
            as: "examInfo",
          },
        },
        { $unwind: "$examInfo" },
        {
          $lookup: {
            from: "courses",
            localField: "course",
            foreignField: "_id",
            as: "courseInfo",
          },
        },
        { $unwind: "$courseInfo" },
        {
          $addFields: {
            gradePercentage: "$examsCompleted.score",
          },
        },
        {
          $group: {
            _id: {
              courseId: "$course",
              examId: "$examInfo._id",
              examTitle: "$examInfo.title",
            },
            courseName: { $first: "$courseInfo.title" },
            courseCategory: { $first: "$courseInfo.category" },
            courseLevel: { $first: "$courseInfo.level" },
            totalSubmissions: { $sum: 1 },
            averageGrade: { $avg: "$gradePercentage" },
            maxGrade: { $max: "$gradePercentage" },
            minGrade: { $min: "$gradePercentage" },
            grades: { $push: "$gradePercentage" },
          },
        },
        {
          $addFields: {
            gradeDistribution: {
              A: { $size: { $filter: { input: "$grades", cond: { $gte: ["$$this", 90] } } } },
              B: { $size: { $filter: { input: "$grades", cond: { $and: [{ $gte: ["$$this", 80] }, { $lt: ["$$this", 90] }] } } } },
              C: { $size: { $filter: { input: "$grades", cond: { $and: [{ $gte: ["$$this", 70] }, { $lt: ["$$this", 80] }] } } } },
              D: { $size: { $filter: { input: "$grades", cond: { $and: [{ $gte: ["$$this", 60] }, { $lt: ["$$this", 70] }] } } } },
              F: { $size: { $filter: { input: "$grades", cond: { $lt: ["$$this", 60] } } } },
            },
          },
        },
        {
          $project: {
            courseName: 1,
            courseCategory: 1,
            courseLevel: 1,
            examTitle: "$_id.examTitle",
            totalSubmissions: 1,
            averageGrade: { $round: ["$averageGrade", 2] },
            maxGrade: { $round: ["$maxGrade", 2] },
            minGrade: { $round: ["$minGrade", 2] },
            gradeDistribution: 1,
          },
        },
        { $sort: { averageGrade: -1 } },
      ]);
    } catch (error) {
      throw new Error(`Error fetching exam performance analysis: ${error.message}`);
    }
  }

  /**
   * Get overall platform statistics
   * Purpose: Provide high-level overview of platform performance
   * Business Value: Support executive decision making and reporting
   */
  static async getPlatformOverview() {
    try {
      const totalUsers = await User.countDocuments();
      const totalStudents = await User.countDocuments({ role: "student" });
      const totalInstructors = await User.countDocuments({ role: "instructor" });
      const totalCourses = await Course.countDocuments();
      const totalEnrollments = await Enrollment.countDocuments();
      const activeEnrollments = await Enrollment.countDocuments({ status: { $in: ["enrolled", "in-progress"] } });
      const completedEnrollments = await Enrollment.countDocuments({ status: "completed" });
      const totalExams = await Exam.countDocuments();
      return {
        users: {
          total: totalUsers,
          students: totalStudents,
          instructors: totalInstructors,
          admins: totalUsers - totalStudents - totalInstructors,
        },
        courses: { total: totalCourses },
        enrollments: {
          total: totalEnrollments,
          active: activeEnrollments,
          completed: completedEnrollments,
          completionRate: totalEnrollments > 0 ? ((completedEnrollments / totalEnrollments) * 100).toFixed(2) : 0,
        },
        exams: { total: totalExams },
      };
    } catch (error) {
      throw new Error(`Error fetching platform overview: ${error.message}`);
    }
  }

  /**
   * Get filtered analytics based on date range and criteria
   * @param {Object} filters - { startDate, endDate, category, level, type }
   * @returns {Promise<Array>} Filtered analytics data
   */
  static async getFilteredAnalytics({ startDate, endDate, category, level, type }) {
    // Build match conditions
    const match = {};
    if (startDate || endDate) {
      match.enrollmentDate = {};
      if (startDate) match.enrollmentDate.$gte = new Date(startDate);
      if (endDate) match.enrollmentDate.$lte = new Date(endDate);
    }
    if (category) match["courseInfo.category"] = category;
    if (level) match["courseInfo.level"] = level;
    // type: filter exam type if needed (e.g., quiz, midterm, final, assignment)

    // Aggregate enrollments with course info
    const pipeline = [
      {
        $lookup: {
          from: "courses",
          localField: "course",
          foreignField: "_id",
          as: "courseInfo",
        },
      },
      { $unwind: "$courseInfo" },
    ];
    if (Object.keys(match).length > 0) {
      pipeline.push({ $match: match });
    }
    // Optionally join exams if type is specified
    if (type) {
      pipeline.push(
        {
          $lookup: {
            from: "exams",
            localField: "course",
            foreignField: "course",
            as: "exams",
          },
        },
        { $unwind: "$exams" },
        { $match: { "exams.type": type } }
      );
    }
    // Group and summarize
    pipeline.push({
      $group: {
        _id: {
          course: "$courseInfo.title",
          category: "$courseInfo.category",
          level: "$courseInfo.level",
        },
        totalEnrollments: { $sum: 1 },
        completed: {
          $sum: {
            $cond: [{ $eq: ["$status", "completed"] }, 1, 0],
          },
        },
        averageCompletion: { $avg: "$completionPercentage" },
        averageGrade: { $avg: "$finalGrade" },
      },
    });
    pipeline.push({ $sort: { totalEnrollments: -1 } });
    return await (this.Enrollment || require("../models/Enrollment")).aggregate(pipeline);
  }
}

module.exports = AnalyticsService;
