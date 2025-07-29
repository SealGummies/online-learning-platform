const mongoose = require("mongoose");

const enrollmentSchema = new mongoose.Schema(
  {
    student: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    course: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Course",
      required: true,
    },
    enrollmentDate: {
      type: Date,
      default: Date.now,
    },
    status: {
      type: String,
      enum: ["enrolled", "in-progress", "completed", "dropped", "suspended"],
      default: "enrolled",
    },
    paymentDetails: {
      amount: {
        type: Number,
        required: true,
      },
      currency: {
        type: String,
        default: "USD",
      },
      paymentMethod: {
        type: String,
        enum: ["credit_card", "paypal", "bank_transfer", "free"],
      },
      transactionId: String,
      paymentDate: Date,
      refundDetails: {
        amount: Number,
        reason: String,
        date: Date,
        status: {
          type: String,
          enum: ["pending", "processed", "denied"],
        },
      },
    },
    progress: {
      lessonsCompleted: [
        {
          lesson: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Lesson",
          },
          completedAt: Date,
          timeSpent: Number, // in minutes
        },
      ],
      examsCompleted: [
        {
          exam: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Exam",
          },
          score: Number,
          totalQuestions: Number,
          correctAnswers: Number,
          completedAt: Date,
          timeSpent: Number, // in minutes
        },
      ],
      assignmentsSubmitted: [
        {
          assignment: String,
          submittedAt: Date,
          grade: Number,
          feedback: String,
        },
      ],
      totalTimeSpent: {
        type: Number,
        default: 0,
      }, // in minutes
      completionPercentage: {
        type: Number,
        default: 0,
        min: 0,
        max: 100,
      },
      lastActivityDate: Date,
    },
    certificate: {
      issued: {
        type: Boolean,
        default: false,
      },
      issuedAt: Date,
      certificateId: String,
      certificateUrl: String,
    },
    notes: String,
    rating: {
      type: Number,
      min: 1,
      max: 5,
    },
    review: {
      comment: String,
      reviewDate: Date,
      helpful: {
        type: Number,
        default: 0,
      },
    },
  },
  {
    timestamps: true,
  }
);

// Compound index to prevent duplicate enrollments
enrollmentSchema.index({ student: 1, course: 1 }, { unique: true });
enrollmentSchema.index({ student: 1 });
enrollmentSchema.index({ course: 1 });
enrollmentSchema.index({ status: 1 });
enrollmentSchema.index({ enrollmentDate: -1 });

module.exports = mongoose.model("Enrollment", enrollmentSchema);
