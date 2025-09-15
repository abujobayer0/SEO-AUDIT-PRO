const express = require("express");
const crypto = require("crypto");
const jwt = require("jsonwebtoken");
const User = require("../models/User");
const auth = require("../middleware/auth");
const router = express.Router();

// Request password reset
router.post("/request-reset", async (req, res) => {
  try {
    const { email } = req.body;

    // Find user by email
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // Generate reset token
    const resetToken = user.generatePasswordResetToken();
    await user.save();

    // In a production environment, send email with reset link
    // For now, just return the token for testing purposes
    const resetUrl = `${process.env.CLIENT_URL}/reset-password/${resetToken}`;

    // Here you would send an email with the reset URL
    // sendEmail(user.email, "Password Reset", resetUrl);

    res.json({
      message: "Password reset link sent to your email",
      // Only for development/testing:
      resetToken,
      resetUrl,
    });
  } catch (error) {
    console.error("Password reset request error:", error);
    res.status(500).json({ message: "Server error during password reset request" });
  }
});

// Reset password with token
router.post("/reset", async (req, res) => {
  try {
    const { token, password } = req.body;

    // Hash token for comparison
    const hashedToken = crypto.createHash("sha256").update(token).digest("hex");

    // Find user with this token and valid expiry
    const user = await User.findOne({
      passwordResetToken: hashedToken,
      passwordResetExpires: { $gt: Date.now() },
    });

    if (!user) {
      return res.status(400).json({ message: "Token is invalid or has expired" });
    }

    // Update password
    user.password = password;
    user.passwordResetToken = undefined;
    user.passwordResetExpires = undefined;
    await user.save();

    // Generate new JWT token
    const accessToken = jwt.sign({ userId: user._id }, process.env.JWT_SECRET, { expiresIn: "1d" });
    const refreshToken = crypto.randomBytes(40).toString("hex");

    // Store refresh token with user
    user.refreshToken = refreshToken;
    user.refreshTokenExpiry = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000); // 7 days
    await user.save();

    res.json({
      message: "Password reset successful",
      token: accessToken,
      refreshToken,
    });
  } catch (error) {
    console.error("Password reset error:", error);
    res.status(500).json({ message: "Server error during password reset" });
  }
});

// Change password (when logged in)
router.post("/change-password", auth, async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;

    // Find user
    const user = await User.findById(req.user._id);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // Check current password
    const isMatch = await user.comparePassword(currentPassword);
    if (!isMatch) {
      return res.status(400).json({ message: "Current password is incorrect" });
    }

    // Update password
    user.password = newPassword;
    await user.save();

    res.json({ message: "Password changed successfully" });
  } catch (error) {
    console.error("Change password error:", error);
    res.status(500).json({ message: "Server error during password change" });
  }
});

module.exports = router;
