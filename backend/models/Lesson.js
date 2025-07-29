const mongoose = require("mongoose");

const lessonSchema = new mongoose.Schema(
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
    order: {
      type: Number,
      required: true,
    },
    type: {
      type: String,
      enum: ["video", "text", "quiz", "assignment", "interactive", "live"],
      required: true,
    },
    content: {
      // For video lessons
      videoUrl: String,
      videoDuration: Number, // in seconds
      videoQuality: [
        {
          resolution: String,
          url: String,
          fileSize: Number,
        },
      ],
      subtitles: [
        {
          language: String,
          url: String,
        },
      ],

      // For text lessons
      textContent: String,

      // For interactive lessons
      interactiveElements: [
        {
          type: String, // 'code-editor', 'drag-drop', 'simulation'
          config: mongoose.Schema.Types.Mixed,
        },
      ],

      // For assignments
      assignmentInstructions: String,
      assignmentDeadline: Date,
      assignmentResources: [
        {
          title: String,
          url: String,
          type: String,
        },
      ],

      // For live lessons
      liveSession: {
        scheduledAt: Date,
        duration: Number, // in minutes
        meetingUrl: String,
        recordingUrl: String,
        maxParticipants: Number,
      },
    },
    resources: [
      {
        title: String,
        type: {
          type: String,
          enum: ["pdf", "video", "link", "document", "image", "code"],
        },
        url: String,
        description: String,
        downloadable: {
          type: Boolean,
          default: true,
        },
      },
    ],
    prerequisites: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Lesson",
      },
    ],
    learningObjectives: [String],
    keyPoints: [String],
    difficulty: {
      type: String,
      enum: ["Easy", "Medium", "Hard"],
      default: "Medium",
    },
    estimatedTime: {
      type: Number, // in minutes
      required: true,
    },
    settings: {
      isPublished: {
        type: Boolean,
        default: false,
      },
      allowComments: {
        type: Boolean,
        default: true,
      },
      allowDownloads: {
        type: Boolean,
        default: true,
      },
      trackProgress: {
        type: Boolean,
        default: true,
      },
    },
    stats: {
      views: {
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
      totalComments: {
        type: Number,
        default: 0,
      },
      averageTimeSpent: {
        type: Number,
        default: 0,
      },
    },
    publishedAt: Date,
  },
  {
    timestamps: true,
  }
);

lessonSchema.index({ course: 1, order: 1 });
lessonSchema.index({ course: 1 });
lessonSchema.index({ instructor: 1 });
lessonSchema.index({ type: 1 });
lessonSchema.index({ "stats.views": -1 });

module.exports = mongoose.model("Lesson", lessonSchema);
