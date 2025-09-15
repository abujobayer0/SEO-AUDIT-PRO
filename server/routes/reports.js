const express = require("express");
const Audit = require("../models/Audit");
const pdfReportService = require("../services/pdfReportService");
const auth = require("../middleware/auth");

const router = express.Router();

// Generate PDF report
router.get("/pdf/:auditId", auth, async (req, res) => {
  try {
    const audit = await Audit.findOne({
      _id: req.params.auditId,
      userId: req.user._id,
    });

    if (!audit) {
      return res.status(404).json({ message: "Audit not found" });
    }

    // Get competitor data
    const competitors = await Audit.find({
      userId: req.user._id,
      parentAuditId: req.params.auditId,
    }).select("websiteUrl overallScore performance seo mobileFriendly technical content");

    // Prepare user data for branding
    const userData = {
      companyName: req.user.companyName,
      brandColor: req.user.brandColor,
      logoUrl: req.user.logoUrl,
    };

    // Generate PDF buffer with competitor data
    const pdfBuffer = await pdfReportService.generatePDFBuffer(audit, userData, competitors);

    // Set response headers
    res.setHeader("Content-Type", "application/pdf");
    res.setHeader("Content-Disposition", `attachment; filename="seo-audit-${audit.websiteUrl.replace(/[^a-zA-Z0-9]/g, "-")}.pdf"`);
    res.setHeader("Content-Length", pdfBuffer.length);

    // Send PDF
    res.send(pdfBuffer);
  } catch (error) {
    console.error("PDF generation error:", error);
    res.status(500).json({ message: "Failed to generate PDF report" });
  }
});

// Get report summary for dashboard
router.get("/summary/:auditId", auth, async (req, res) => {
  try {
    const audit = await Audit.findOne({
      _id: req.params.auditId,
      userId: req.user._id,
    });

    if (!audit) {
      return res.status(404).json({ message: "Audit not found" });
    }

    // Calculate priority issues
    const priorityIssues = [];

    // Collect all issues from different categories
    const allIssues = [
      ...(audit.performance?.issues || []).map((issue) => ({ category: "Performance", issue, priority: "high" })),
      ...(audit.seo?.issues || []).map((issue) => ({ category: "SEO", issue, priority: "high" })),
      ...(audit.mobileFriendly?.issues || []).map((issue) => ({ category: "Mobile", issue, priority: "medium" })),
      ...(audit.technical?.issues || []).map((issue) => ({ category: "Technical", issue, priority: "medium" })),
      ...(audit.content?.issues || []).map((issue) => ({ category: "Content", issue, priority: "low" })),
    ];

    // Sort by priority and take top 10
    const priorityOrder = { high: 3, medium: 2, low: 1 };
    allIssues.sort((a, b) => priorityOrder[b.priority] - priorityOrder[a.priority]);

    const topIssues = allIssues.slice(0, 10);

    // Calculate improvement suggestions
    const suggestions = [];

    if (audit.overallScore < 60) {
      suggestions.push("Focus on fixing critical SEO issues first");
    }

    if ((audit.performance?.score || 0) < 70) {
      suggestions.push("Optimize page loading speed");
    }

    if ((audit.mobileFriendly?.score || 0) < 80) {
      suggestions.push("Improve mobile user experience");
    }

    if ((audit.seo?.score || 0) < 70) {
      suggestions.push("Enhance on-page SEO elements");
    }

    res.json({
      audit: {
        id: audit._id,
        websiteUrl: audit.websiteUrl,
        overallScore: audit.overallScore,
        createdAt: audit.createdAt,
        performance: audit.performance || { score: 0, issues: [], suggestions: [] },
        seo: audit.seo || { score: 0, issues: [], suggestions: [] },
        mobileFriendly: audit.mobileFriendly || { score: 0, issues: [], suggestions: [] },
        technical: audit.technical || { score: 0, issues: [], suggestions: [] },
        content: audit.content || { score: 0, issues: [], suggestions: [], topKeywords: [] },
        accessibility: audit.accessibility || { score: 0, issues: [], suggestions: [] },
        metaTags: audit.metaTags || {},
        images: audit.images || { total: 0, withoutAlt: 0, oversized: 0, issues: [] },
        links: audit.links || { total: 0, external: 0, broken: 0, issues: [] },
        pageSpeed: audit.pageSpeed || {},
        lighthouse: audit.lighthouse || {},
      },
      meta: {
        title: audit.metaTags?.title || "",
        description: audit.metaTags?.description || "",
        titleLength: audit.metaTags?.titleLength || 0,
        descriptionLength: audit.metaTags?.descriptionLength || 0,
        length: audit.metaTags?.titleLength || 0,
      },
      keywords: audit.content?.topKeywords || [],
      priorityIssues: topIssues,
      suggestions,
      nextSteps: [
        "Review and fix high-priority issues",
        "Implement suggested improvements",
        "Monitor progress with regular audits",
        "Consider upgrading to track improvements over time",
      ],
    });
  } catch (error) {
    console.error("Get report summary error:", error);
    res.status(500).json({ message: "Failed to fetch report summary" });
  }
});

module.exports = router;
