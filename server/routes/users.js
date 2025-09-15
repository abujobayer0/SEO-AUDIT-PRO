const express = require("express");
const multer = require("multer");
const path = require("path");
const fs = require("fs");
const User = require("../models/User");
const Audit = require("../models/Audit");
const auth = require("../middleware/auth");

const router = express.Router();

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadDir = path.join(__dirname, "../uploads/logos");
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    cb(null, `logo-${req.user._id}-${uniqueSuffix}${path.extname(file.originalname)}`);
  },
});

const upload = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB limit
  fileFilter: (req, file, cb) => {
    const allowedTypes = /jpeg|jpg|png|gif/;
    const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = allowedTypes.test(file.mimetype);

    if (mimetype && extname) {
      return cb(null, true);
    } else {
      cb(new Error("Only image files are allowed"));
    }
  },
});

// Get user profile
router.get("/profile", auth, async (req, res) => {
  try {
    const user = await User.findById(req.user._id).select("-password");

    res.json({
      user: {
        id: user._id,
        email: user.email,
        companyName: user.companyName,
        subscription: user.subscription,
        brandColor: user.brandColor,
        logoUrl: user.logoUrl,
        createdAt: user.createdAt,
        updatedAt: user.updatedAt,
      },
    });
  } catch (error) {
    console.error("Get profile error:", error);
    res.status(500).json({ message: "Failed to fetch profile" });
  }
});

// Update user profile
router.put("/profile", auth, async (req, res) => {
  try {
    const { companyName, brandColor, logoUrl } = req.body;

    const updateData = {};
    if (companyName !== undefined) updateData.companyName = companyName;
    if (brandColor !== undefined) updateData.brandColor = brandColor;
    if (logoUrl !== undefined) updateData.logoUrl = logoUrl;

    updateData.updatedAt = new Date();

    const user = await User.findByIdAndUpdate(req.user._id, updateData, { new: true, select: "-password" });

    res.json({
      message: "Profile updated successfully",
      user: {
        id: user._id,
        email: user.email,
        companyName: user.companyName,
        subscription: user.subscription,
        brandColor: user.brandColor,
        logoUrl: user.logoUrl,
      },
    });
  } catch (error) {
    console.error("Update profile error:", error);
    res.status(500).json({ message: "Failed to update profile" });
  }
});

// Upload logo
router.post("/logo", auth, upload.single("logo"), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: "No file uploaded" });
    }

    // Update user with logo URL
    const logoUrl = `/uploads/logos/${req.file.filename}`;
    await User.findByIdAndUpdate(req.user._id, {
      logoUrl,
      updatedAt: new Date(),
    });

    res.json({
      message: "Logo uploaded successfully",
      logoUrl,
    });
  } catch (error) {
    console.error("Logo upload error:", error);
    res.status(500).json({ message: "Failed to upload logo" });
  }
});

// Get subscription plans
router.get("/subscription/plans", auth, async (req, res) => {
  try {
    const plans = [
      {
        id: "free",
        name: "Free",
        price: 0,
        maxScans: 5,
        features: ["5 monthly scans", "Basic SEO audit", "PDF reports", "Email support"],
        limitations: ["Limited scans per month", "No white-label branding", "Basic report templates"],
      },
      {
        id: "basic",
        name: "Basic",
        price: 19,
        maxScans: 50,
        features: [
          "50 monthly scans",
          "Advanced SEO audit",
          "White-label PDF reports",
          "Custom branding",
          "Priority support",
          "Audit history tracking",
        ],
        limitations: ["Limited to 50 scans per month"],
      },
      {
        id: "pro",
        name: "Pro",
        price: 49,
        maxScans: 500,
        features: [
          "500 monthly scans",
          "Complete SEO audit suite",
          "Full white-label branding",
          "Custom report templates",
          "API access",
          "Priority support",
          "Advanced analytics",
          "Team collaboration",
        ],
        limitations: [],
      },
    ];

    res.json({ plans });
  } catch (error) {
    console.error("Get subscription plans error:", error);
    res.status(500).json({ message: "Failed to fetch subscription plans" });
  }
});

// Update subscription (simplified - in production, integrate with payment processor)
router.post("/subscription/update", auth, async (req, res) => {
  try {
    const { planId } = req.body;

    const validPlans = ["free", "basic", "pro"];
    if (!validPlans.includes(planId)) {
      return res.status(400).json({ message: "Invalid subscription plan" });
    }

    // Update user subscription
    const user = await User.findById(req.user._id);
    user.subscription = planId;
    user.updateSubscriptionLimits();

    // Set subscription expiry (30 days from now for paid plans)
    if (planId !== "free") {
      user.subscriptionExpires = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000);
    } else {
      user.subscriptionExpires = null;
    }

    await user.save();

    res.json({
      message: "Subscription updated successfully",
      subscription: {
        plan: user.subscription,
        maxScans: user.maxMonthlyScans,
        expires: user.subscriptionExpires,
      },
    });
  } catch (error) {
    console.error("Update subscription error:", error);
    res.status(500).json({ message: "Failed to update subscription" });
  }
});

// Get user statistics
router.get("/stats", auth, async (req, res) => {
  try {
    const userId = req.user._id;

    // Get unique websites tracked
    const uniqueWebsites = await Audit.distinct("websiteUrl", { userId });
    const websitesTracked = uniqueWebsites.length;

    // Get total reports generated
    const reportsGenerated = await Audit.countDocuments({ userId });

    // Get last activity (latest audit)
    const lastAudit = await Audit.findOne({ userId }).sort({ createdAt: -1 });
    const lastActivity = lastAudit ? lastAudit.createdAt : null;

    res.json({
      websitesTracked,
      reportsGenerated,
      lastActivity,
    });
  } catch (error) {
    console.error("Get stats error:", error);
    res.status(500).json({ message: "Failed to fetch statistics" });
  }
});

// Get usage statistics
router.get("/usage", auth, async (req, res) => {
  try {
    const user = await User.findById(req.user._id);

    // Calculate usage for current month
    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

    const usage = {
      currentMonth: user.monthlyScans,
      maxMonthly: user.maxMonthlyScans,
      remaining: user.maxMonthlyScans - user.monthlyScans,
      subscription: user.subscription,
      subscriptionExpires: user.subscriptionExpires,
    };

    res.json({ usage });
  } catch (error) {
    console.error("Get usage error:", error);
    res.status(500).json({ message: "Failed to fetch usage statistics" });
  }
});

// Serve uploaded logos
router.get("/logo/:filename", (req, res) => {
  try {
    const filename = req.params.filename;
    const filePath = path.join(__dirname, "../uploads/logos", filename);

    if (fs.existsSync(filePath)) {
      res.sendFile(filePath);
    } else {
      res.status(404).json({ message: "Logo not found" });
    }
  } catch (error) {
    console.error("Serve logo error:", error);
    res.status(500).json({ message: "Failed to serve logo" });
  }
});

module.exports = router;
