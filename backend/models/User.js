const mongoose = require("mongoose");

const userSchema = new mongoose.Schema(
  {
    firstName: {
      type: String,
      required: true,
      trim: true,
    },
    lastName: {
      type: String,
      required: true,
      trim: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },
    password: {
      type: String,
      required: true,
      minlength: 6,
    },
    role: {
      type: String,
      enum: ["student", "instructor", "admin"],
      default: "student",
    },
    profile: {
      avatar: String,
      bio: String,
      dateOfBirth: Date,
      phone: String,
      address: {
        street: String,
        city: String,
        state: String,
        zipCode: String,
        country: String,
      },
      socialLinks: {
        linkedin: String,
        github: String,
        website: String,
      },
    },
    preferences: {
      notifications: {
        email: { type: Boolean, default: true },
        push: { type: Boolean, default: true },
        sms: { type: Boolean, default: false },
      },
      language: { type: String, default: "en" },
      timezone: { type: String, default: "UTC" },
    },
    stats: {
      coursesEnrolled: { type: Number, default: 0 },
      coursesCompleted: { type: Number, default: 0 },
      coursesCreated: { type: Number, default: 0 },
      totalPoints: { type: Number, default: 0 },
      averageRating: { type: Number, default: 0 },
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    lastLogin: Date,
    emailVerified: {
      type: Boolean,
      default: false,
    },
    emailVerificationToken: String,
    passwordResetToken: String,
    passwordResetExpires: Date,
  },
  {
    timestamps: true,
  }
);

userSchema.index({ role: 1 });
userSchema.index({ "stats.totalPoints": -1 });

module.exports = mongoose.model("User", userSchema);
