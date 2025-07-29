const mongoose = require("mongoose");

const courseSchema = new mongoose.Schema(
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
    instructor: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    category: {
      type: String,
      required: true,
      enum: [
        "Programming",
        "Data Science",
        "Web Development",
        "Mobile Development",
        "AI/ML",
        "Cybersecurity",
        "Cloud Computing",
        "Database",
        "Other",
      ],
    },
    level: {
      type: String,
      required: true,
      enum: ["Beginner", "Intermediate", "Advanced"],
    },
    price: {
      type: Number,
      required: true,
      min: 0,
    },
    currency: {
      type: String,
      default: "USD",
    },
    thumbnail: String,
    preview: {
      videoUrl: String,
      description: String,
    },
    duration: {
      hours: Number,
      minutes: Number,
    },
    tags: [String],
    requirements: [String],
    learningObjectives: [String],
    syllabus: [
      {
        week: Number,
        title: String,
        topics: [String],
        assignments: [String],
      },
    ],
    resources: [
      {
        title: String,
        type: {
          type: String,
          enum: ["pdf", "video", "link", "document", "image"],
        },
        url: String,
        description: String,
      },
    ],
    settings: {
      isPublished: {
        type: Boolean,
        default: false,
      },
      allowDiscussions: {
        type: Boolean,
        default: true,
      },
      allowReviews: {
        type: Boolean,
        default: true,
      },
      certificate: {
        type: Boolean,
        default: false,
      },
      maxEnrollments: Number,
    },
    stats: {
      enrollments: {
        type: Number,
        default: 0,
      },
      completions: {
        type: Number,
        default: 0,
      },
      averageRating: {
        type: Number,
        default: 0,
      },
      totalReviews: {
        type: Number,
        default: 0,
      },
      totalRevenue: {
        type: Number,
        default: 0,
      },
    },
    publishedAt: Date,
    lastUpdated: Date,
  },
  {
    timestamps: true,
  }
);

courseSchema.index({ instructor: 1 });
courseSchema.index({ category: 1 });
courseSchema.index({ level: 1 });
courseSchema.index({ "stats.averageRating": -1 });
courseSchema.index({ "stats.enrollments": -1 });
courseSchema.index({ price: 1 });

module.exports = mongoose.model("Course", courseSchema);
