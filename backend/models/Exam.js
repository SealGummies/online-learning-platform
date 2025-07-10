const mongoose = require("mongoose");

const examSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
      trim: true,
    },
    description: {
      type: String,
      required: true,
    },
    course: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Course",
      required: true,
    },
    instructor: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    type: {
      type: String,
      enum: ["quiz", "midterm", "final", "assignment", "project"],
      required: true,
    },
    questions: [
      {
        question: {
          type: String,
          required: true,
        },
        type: {
          type: String,
          enum: [
            "multiple-choice",
            "true-false",
            "short-answer",
            "essay",
            "code",
          ],
          required: true,
        },
        options: [
          {
            text: String,
            isCorrect: Boolean,
          },
        ],
        correctAnswer: String, // For non-multiple choice questions
        explanation: String,
        points: {
          type: Number,
          default: 1,
        },
        difficulty: {
          type: String,
          enum: ["Easy", "Medium", "Hard"],
          default: "Medium",
        },
        tags: [String],
        hints: [String],
        codeSnippet: String, // For code-based questions
        expectedOutput: String,
      },
    ],
    settings: {
      timeLimit: {
        type: Number, // in minutes
        default: 60,
      },
      attempts: {
        type: Number,
        default: 1,
      },
      passingScore: {
        type: Number,
        default: 70,
      },
      showCorrectAnswers: {
        type: Boolean,
        default: true,
      },
      showScoreImmediately: {
        type: Boolean,
        default: true,
      },
      randomizeQuestions: {
        type: Boolean,
        default: false,
      },
      randomizeOptions: {
        type: Boolean,
        default: false,
      },
      allowReview: {
        type: Boolean,
        default: true,
      },
      proctored: {
        type: Boolean,
        default: false,
      },
      lockdownBrowser: {
        type: Boolean,
        default: false,
      },
    },
    availability: {
      startDate: Date,
      endDate: Date,
      timezone: {
        type: String,
        default: "UTC",
      },
    },
    prerequisites: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Lesson",
      },
    ],
    weight: {
      type: Number, // Percentage of total course grade
      default: 10,
    },
    instructions: String,
    resources: [
      {
        title: String,
        type: String,
        url: String,
        description: String,
      },
    ],
    stats: {
      attempts: {
        type: Number,
        default: 0,
      },
      completions: {
        type: Number,
        default: 0,
      },
      averageScore: {
        type: Number,
        default: 0,
      },
      highestScore: {
        type: Number,
        default: 0,
      },
      lowestScore: {
        type: Number,
        default: 0,
      },
      averageTimeSpent: {
        type: Number,
        default: 0,
      },
      passRate: {
        type: Number,
        default: 0,
      },
    },
    isPublished: {
      type: Boolean,
      default: false,
    },
    publishedAt: Date,
  },
  {
    timestamps: true,
  }
);

examSchema.index({ course: 1 });
examSchema.index({ instructor: 1 });
examSchema.index({ type: 1 });
examSchema.index({ "availability.startDate": 1 });
examSchema.index({ "availability.endDate": 1 });

module.exports = mongoose.model("Exam", examSchema);
