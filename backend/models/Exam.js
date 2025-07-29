const mongoose = require("mongoose");

const questionSchema = new mongoose.Schema({
  text: {
    type: String,
    required: true,
    trim: true,
  },
  options: {
    type: [String],
    required: true,
    validate: {
      validator: function(options) {
        return options.length >= 2;
      },
      message: 'Question must have at least 2 options'
    }
  },
  correctAnswer: {
    type: Number,
    required: true,
    validate: {
      validator: function(value) {
        return value >= 0 && value < this.options.length;
      },
      message: 'Correct answer must be a valid option index'
    }
  },
  points: {
    type: Number,
    default: 1,
    min: 1
  }
});

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
    type: {
      type: String,
      enum: ["quiz", "midterm", "final", "assignment"],
      required: true,
    },
    questions: {
      type: [questionSchema],
      default: [],
      validate: {
        validator: function(questions) {
          return questions.length > 0;
        },
        message: 'Exam must have at least one question'
      }
    },
    duration: {
      type: Number, // in minutes
      min: 1,
      default: 60
    },
    totalPoints: {
      type: Number,
      default: 0
    },
    startDate: {
      type: Date,
      default: null
    },
    endDate: {
      type: Date,
      default: null
    },
    isPublished: {
      type: Boolean,
      default: false
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    allowRetake: {
      type: Boolean,
      default: false
    },
    maxAttempts: {
      type: Number,
      default: 1,
      min: 1
    },
    instructions: {
      type: String,
      default: ""
    }
  },
  {
    timestamps: true,
  }
);

// Calculate total points before saving
examSchema.pre('save', function(next) {
  if (this.questions && this.questions.length > 0) {
    this.totalPoints = this.questions.reduce((total, question) => total + question.points, 0);
  }
  next();
});

// Essential indexes
examSchema.index({ course: 1 });
examSchema.index({ isPublished: 1 });
examSchema.index({ startDate: 1, endDate: 1 });

module.exports = mongoose.model("Exam", examSchema);
