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
      enum: ["enrolled", "in-progress", "completed", "dropped"],
      default: "enrolled",
    },
    completionPercentage: {
      type: Number,
      default: 0,
      min: 0,
      max: 100,
    },
    finalGrade: {
      type: Number,
      min: 0,
      max: 100,
    },
    examsCompleted: [
      {
        exam: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "Exam",
        },
        score: Number,
      },
    ],
  },
  {
    timestamps: true,
  }
);

// Essential indexes
enrollmentSchema.index({ student: 1, course: 1 }, { unique: true });
enrollmentSchema.index({ student: 1 });
enrollmentSchema.index({ course: 1 });
enrollmentSchema.index({ status: 1 });

module.exports = mongoose.model("Enrollment", enrollmentSchema);
