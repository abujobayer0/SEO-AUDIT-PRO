const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
const crypto = require("crypto");

const userSchema = new mongoose.Schema({
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
  companyName: {
    type: String,
    required: true,
    trim: true,
  },
  subscription: {
    type: String,
    enum: ["free", "basic", "pro"],
    default: "free",
  },
  subscriptionExpires: {
    type: Date,
    default: null,
  },
  monthlyScans: {
    type: Number,
    default: 0,
  },
  maxMonthlyScans: {
    type: Number,
    default: 5, // Free tier limit
  },
  logoUrl: {
    type: String,
    default: null,
  },
  brandColor: {
    type: String,
    default: "#3B82F6",
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
  updatedAt: {
    type: Date,
    default: Date.now,
  },
  refreshToken: {
    type: String,
    default: null,
  },
  refreshTokenExpiry: {
    type: Date,
    default: null,
  },
  emailVerified: {
    type: Boolean,
    default: false,
  },
  verificationToken: {
    type: String,
    default: null,
  },
  passwordResetToken: {
    type: String,
    default: null,
  },
  passwordResetExpires: {
    type: Date,
    default: null,
  },
  loginAttempts: {
    type: Number,
    default: 0,
  },
  lockUntil: {
    type: Date,
    default: null,
  },
});

// Hash password before saving
userSchema.pre("save", async function (next) {
  if (!this.isModified("password")) return next();

  try {
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (error) {
    next(error);
  }
});

// Compare password method
userSchema.methods.comparePassword = async function (candidatePassword) {
  return bcrypt.compare(candidatePassword, this.password);
};

// Generate password reset token
userSchema.methods.generatePasswordResetToken = function () {
  const resetToken = crypto.randomBytes(32).toString("hex");

  this.passwordResetToken = crypto.createHash("sha256").update(resetToken).digest("hex");

  this.passwordResetExpires = Date.now() + 3600000; // 1 hour

  return resetToken;
};

// Generate email verification token
userSchema.methods.generateVerificationToken = function () {
  const verificationToken = crypto.randomBytes(32).toString("hex");

  this.verificationToken = crypto.createHash("sha256").update(verificationToken).digest("hex");

  return verificationToken;
};

// Update max scans based on subscription
userSchema.methods.updateSubscriptionLimits = function () {
  switch (this.subscription) {
    case "free":
      this.maxMonthlyScans = 5;
      break;
    case "basic":
      this.maxMonthlyScans = 50;
      break;
    case "pro":
      this.maxMonthlyScans = 500;
      break;
  }
};

// Check if user can perform scan
userSchema.methods.canPerformScan = function () {
  const now = new Date();
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

  // Reset monthly scans if it's a new month
  if (this.updatedAt < startOfMonth) {
    this.monthlyScans = 0;
    this.updatedAt = now;
  }

  return this.monthlyScans < this.maxMonthlyScans;
};

module.exports = mongoose.model("User", userSchema);
