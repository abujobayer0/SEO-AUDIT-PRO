const express = require("express");
const crypto = require("crypto");
const User = require("../models/User");
const auth = require("../middleware/auth");
const router = express.Router();

// Send verification email
router.post("/send", auth, async (req, res) => {
  try {
    const user = await User.findById(req.user._id);

    if (user.emailVerified) {
      return res.status(400).json({ message: "Email already verified" });
    }

    // Generate verification token
    const verificationToken = user.generateVerificationToken();
    await user.save();

    // Create verification URL
    const verificationUrl = `${process.env.CLIENT_URL}/verify-email/${verificationToken}`;

    // In a production environment, send email with verification link
    // sendEmail(user.email, "Email Verification", verificationUrl);

    res.json({
      message: "Verification email sent",
      // Only for development/testing:
      verificationToken,
      verificationUrl,
    });
  } catch (error) {
    console.error("Send verification email error:", error);
    res.status(500).json({ message: "Server error sending verification email" });
  }
});

// Verify email with token
router.post("/verify", async (req, res) => {
  try {
    const { token } = req.body;

    // Hash token for comparison
    const hashedToken = crypto.createHash("sha256").update(token).digest("hex");

    // Find user with this token
    const user = await User.findOne({ verificationToken: hashedToken });

    if (!user) {
      return res.status(400).json({ message: "Invalid verification token" });
    }

    // Mark email as verified
    user.emailVerified = true;
    user.verificationToken = undefined;
    await user.save();

    res.json({ message: "Email verified successfully" });
  } catch (error) {
    console.error("Email verification error:", error);
    res.status(500).json({ message: "Server error during email verification" });
  }
});

// Check verification status
router.get("/status", auth, async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    res.json({ verified: user.emailVerified });
  } catch (error) {
    console.error("Check verification status error:", error);
    res.status(500).json({ message: "Server error checking verification status" });
  }
});

module.exports = router;
