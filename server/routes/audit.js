const express = require("express");
const mongoose = require("mongoose");
const Audit = require("../models/Audit");
const User = require("../models/User");
const seoAuditService = require("../services/seoAuditService");
const auth = require("../middleware/auth");
const { safeObjectId, safeString, safeNumber, safeArray, validateQuery } = require("../utils/mongoUtils");

// Import helper functions for fixing MongoDB cast errors
const { safeParseArray, cleanTopKeywords, cleanLinksWithoutText } = require("../../fix-mongodb-cast-error");

const router = express.Router();

// Perform SEO audit
router.post("/", auth, async (req, res) => {
  try {
    const { websiteUrl } = req.body;

    if (!websiteUrl) {
      return res.status(400).json({ message: "Website URL is required" });
    }

    // Check if user can perform scan
    if (!req.user.canPerformScan()) {
      return res.status(403).json({
        message: "Monthly scan limit reached. Upgrade your plan for more scans.",
      });
    }

    // Perform the audit
    const auditData = await seoAuditService.auditWebsite(websiteUrl);

    // DEBUG: Check data types without logging content that might interfere
    console.log("=== AUDIT DATA TYPE CHECK ===");
    console.log("links exists:", !!auditData.links);
    console.log("links.list type:", typeof auditData.links?.list);
    console.log("links.list is array:", Array.isArray(auditData.links?.list));
    console.log("links.list length:", auditData.links?.list?.length);
    console.log("links.withoutText type:", typeof auditData.links?.withoutText);
    console.log("links.withoutText is array:", Array.isArray(auditData.links?.withoutText));
    console.log("images exists:", !!auditData.images);
    console.log("images.list type:", typeof auditData.images?.list);
    console.log("images.list is array:", Array.isArray(auditData.images?.list));
    console.log("images.list length:", auditData.images?.list?.length);
    console.log("content exists:", !!auditData.content);
    console.log("content.topKeywords type:", typeof auditData.content?.topKeywords);
    console.log("content.topKeywords is array:", Array.isArray(auditData.content?.topKeywords));
    console.log("content.topKeywords length:", auditData.content?.topKeywords?.length);
    if (typeof auditData.content?.topKeywords === "string") {
      console.log("WARNING: content.topKeywords is STRING, first 100 chars:", auditData.content.topKeywords.substring(0, 100));
    }
    if (typeof auditData.links?.withoutText === "string") {
      console.log("WARNING: links.withoutText is STRING, first 100 chars:", auditData.links.withoutText.substring(0, 100));
    }
    console.log("=== END TYPE CHECK ===");

    // Deep clean the audit data to ensure proper types
    let cleanLinks = {};
    let cleanImages = {};
    let cleanContent = {};

    // If entire links/images/content objects are strings, try to parse them first
    if (typeof auditData.links === "string") {
      console.log("WARNING: links is a string, attempting to parse...");
      try {
        cleanLinks = JSON.parse(auditData.links) || {};
        console.log("Successfully parsed links from string");
      } catch (e) {
        console.log("Failed to parse links, defaulting to empty object");
        cleanLinks = {};
      }
    } else if (auditData.links && typeof auditData.links === "object") {
      cleanLinks = { ...auditData.links };
    } else {
      cleanLinks = {};
    }

    if (typeof auditData.images === "string") {
      console.log("WARNING: images is a string, attempting to parse...");
      try {
        cleanImages = JSON.parse(auditData.images) || {};
        console.log("Successfully parsed images from string");
      } catch (e) {
        console.log("Failed to parse images, defaulting to empty object");
        cleanImages = {};
      }
    } else if (auditData.images && typeof auditData.images === "object") {
      cleanImages = { ...auditData.images };
    } else {
      cleanImages = {};
    }

    if (typeof auditData.content === "string") {
      console.log("WARNING: content is a string, attempting to parse...");
      try {
        cleanContent = JSON.parse(auditData.content) || {};
        console.log("Successfully parsed content from string");
      } catch (e) {
        console.log("Failed to parse content, defaulting to empty object");
        cleanContent = {};
      }
    } else if (auditData.content && typeof auditData.content === "object") {
      cleanContent = { ...auditData.content };
    } else {
      cleanContent = {};
    }

    // Handle corrupted links.list
    if (typeof cleanLinks.list === "string") {
      console.log("WARNING: links.list is a string, attempting to parse...");
      try {
        cleanLinks.list = JSON.parse(cleanLinks.list);
        console.log("Successfully parsed links.list from string");
      } catch (e) {
        console.log("Failed to parse links.list, setting to empty array");
        cleanLinks.list = [];
      }
    } else if (Array.isArray(cleanLinks.list)) {
      // If it's an array of strings or mixed types, coerce to only valid objects
      const originalLength = cleanLinks.list.length || 0;
      if (originalLength > 0 && typeof cleanLinks.list[0] === "string") {
        console.log("WARNING: links.list contains strings; dropping invalid entries");
        cleanLinks.list = [];
      } else {
        cleanLinks.list = cleanLinks.list.filter((item) => item && typeof item === "object" && !Array.isArray(item));
      }
    } else {
      cleanLinks.list = [];
    }

    // Handle corrupted links.withoutText
    if (typeof cleanLinks.withoutText === "string") {
      console.log("WARNING: links.withoutText is a string, attempting to parse...");
      try {
        // Log the first 100 characters to see what we're dealing with
        console.log("links.withoutText string (first 100 chars):", cleanLinks.withoutText.substring(0, 100));

        // Try to parse the string as JSON
        cleanLinks.withoutText = JSON.parse(cleanLinks.withoutText);
        console.log("Successfully parsed links.withoutText from string");
      } catch (e) {
        console.log("Failed to parse links.withoutText, error:", e.message);
        console.log("Setting links.withoutText to empty array");
        cleanLinks.withoutText = [];
      }
    }

    // Ensure it's an array even after parsing
    if (!Array.isArray(cleanLinks.withoutText)) {
      console.log("links.withoutText is not an array after parsing, setting to empty array");
      cleanLinks.withoutText = [];
    }

    // If it's an array, ensure each item is properly formatted
    if (Array.isArray(cleanLinks.withoutText)) {
      // Check if the first item is a string (indicating potential issues)
      if (cleanLinks.withoutText.length > 0 && typeof cleanLinks.withoutText[0] === "string") {
        console.log("WARNING: links.withoutText contains strings; attempting to parse each item");
        try {
          // Try to parse each item if they're strings
          cleanLinks.withoutText = cleanLinks.withoutText
            .map((item) => {
              if (typeof item === "string") {
                try {
                  return JSON.parse(item);
                } catch {
                  return null;
                }
              }
              return item;
            })
            .filter(Boolean);
        } catch (e) {
          console.log("Failed to parse individual items in links.withoutText:", e.message);
          cleanLinks.withoutText = [];
        }
      }

      // Now coerce elements to objects with expected fields/types
      cleanLinks.withoutText = cleanLinks.withoutText
        .filter((item) => item && typeof item === "object" && !Array.isArray(item))
        .map((l) => ({
          href: typeof l.href === "string" ? l.href : "",
          type: typeof l.type === "string" ? l.type : "",
          target: typeof l.target === "string" ? l.target : "",
          rel: typeof l.rel === "string" ? l.rel : "",
          statusCode: Number.isFinite(l.statusCode) ? l.statusCode : 0,
          isWorking: typeof l.isWorking === "boolean" ? l.isWorking : true,
          text: typeof l.text === "string" ? l.text : "",
        }));
    } else {
      cleanLinks.withoutText = [];
    }

    // Handle corrupted images.list
    if (typeof cleanImages.list === "string") {
      console.log("WARNING: images.list is a string, attempting to parse...");
      try {
        cleanImages.list = JSON.parse(cleanImages.list);
        console.log("Successfully parsed images.list from string");
      } catch (e) {
        console.log("Failed to parse images.list, setting to empty array");
        cleanImages.list = [];
      }
    } else if (Array.isArray(cleanImages.list)) {
      const originalLength = cleanImages.list.length || 0;
      if (originalLength > 0 && typeof cleanImages.list[0] === "string") {
        console.log("WARNING: images.list contains strings; dropping invalid entries");
        cleanImages.list = [];
      } else {
        cleanImages.list = cleanImages.list.filter((item) => item && typeof item === "object" && !Array.isArray(item));
      }
    } else {
      cleanImages.list = [];
    }

    // Handle corrupted content.topKeywords
    if (typeof cleanContent.topKeywords === "string") {
      console.log("WARNING: content.topKeywords is a string, attempting to parse...");
      try {
        // Log the first 100 characters to see what we're dealing with
        console.log("content.topKeywords string (first 100 chars):", cleanContent.topKeywords.substring(0, 100));

        // Try to parse the string as JSON
        try {
          cleanContent.topKeywords = JSON.parse(cleanContent.topKeywords);
        } catch (_) {
          // Attempt to convert single-quoted pseudo-JSON to valid JSON
          const normalized = cleanContent.topKeywords.replace(/'/g, '"').replace(/\b(undefined|null)\b/g, "null");
          cleanContent.topKeywords = JSON.parse(normalized);
        }
        console.log("Successfully parsed content.topKeywords from string");
      } catch (e) {
        console.log("Failed to parse content.topKeywords, error:", e.message);
        console.log("Setting content.topKeywords to empty array");
        cleanContent.topKeywords = [];
      }
    }

    // Ensure it's an array even after parsing
    if (!Array.isArray(cleanContent.topKeywords)) {
      console.log("content.topKeywords is not an array after parsing, setting to empty array");
      cleanContent.topKeywords = [];
    }

    // If it's an array, ensure each item is properly formatted
    if (Array.isArray(cleanContent.topKeywords)) {
      // Check if the first item is a string (indicating potential issues)
      if (cleanContent.topKeywords.length > 0 && typeof cleanContent.topKeywords[0] === "string") {
        console.log("WARNING: content.topKeywords contains strings; attempting to parse each item");
        try {
          // Try to parse each item if they're strings
          cleanContent.topKeywords = cleanContent.topKeywords
            .map((item) => {
              if (typeof item === "string") {
                try {
                  return JSON.parse(item);
                } catch {
                  return null;
                }
              }
              return item;
            })
            .filter(Boolean);
        } catch (e) {
          console.log("Failed to parse individual items in content.topKeywords:", e.message);
          cleanContent.topKeywords = [];
        }
      }

      // Now ensure each keyword is properly formatted
      cleanContent.topKeywords = cleanContent.topKeywords
        .filter((item) => item && typeof item === "object" && !Array.isArray(item))
        .map((kw) => ({
          keyword: String(kw.keyword || ""),
          count: Number(kw.count || 0),
          density: Number(kw.density || 0),
          type: String(kw.type || "word"),
        }));
    } else {
      cleanContent.topKeywords = [];
    }

    // Ensure data structure integrity before saving to Mongoose
    // Persist counts based on list lengths
    const computedLinksCount = Array.isArray(cleanLinks.list)
      ? cleanLinks.list.length
      : typeof cleanLinks.list === "string"
      ? (() => {
          try {
            const parsed = JSON.parse(cleanLinks.list);
            return Array.isArray(parsed) ? parsed.length : 0;
          } catch {
            return 0;
          }
        })()
      : 0;
    const computedImagesCount = Array.isArray(cleanImages.list)
      ? cleanImages.list.length
      : typeof cleanImages.list === "string"
      ? (() => {
          try {
            const parsed = JSON.parse(cleanImages.list);
            return Array.isArray(parsed) ? parsed.length : 0;
          } catch {
            return 0;
          }
        })()
      : 0;

    cleanLinks.total = Number.isFinite(cleanLinks.total) ? cleanLinks.total : computedLinksCount;
    cleanImages.total = Number.isFinite(cleanImages.total) ? cleanImages.total : computedImagesCount;

    // Persist full lists; also persist counts
    if (!Number.isFinite(cleanLinks.withoutTextCount)) cleanLinks.withoutTextCount = cleanLinks.withoutText.length || 0;
    if (!Number.isFinite(cleanLinks.total)) cleanLinks.total = computedLinksCount;

    const cleanAuditData = {
      ...auditData,
      links: cleanLinks,
      images: cleanImages,
      content: cleanContent,
    };

    // Save audit to database with proper data validation
    const auditDataToSave = {
      userId: safeObjectId(req.user._id),
      websiteUrl: safeString(websiteUrl),
      overallScore: safeNumber(cleanAuditData.overallScore, 0),
      performance: cleanAuditData.performance || {},
      seo: cleanAuditData.seo || {},
      content: cleanContent,
      images: cleanImages,
      links: cleanLinks,
      accessibility: cleanAuditData.accessibility || {},
      mobileFriendly: cleanAuditData.mobileFriendly || {},
      technical: cleanAuditData.technical || {},
      metaTags: cleanAuditData.metaTags || {},
      lighthouse: cleanAuditData.lighthouse || {},
      createdAt: new Date(),
    };

    // Validate critical fields before saving
    if (!auditDataToSave.userId || !auditDataToSave.websiteUrl) {
      return res.status(400).json({ message: "Invalid audit data: missing required fields" });
    }

    const audit = new Audit(auditDataToSave);

    await audit.save();

    // Update user's monthly scan count
    req.user.monthlyScans += 1;
    await req.user.save();

    res.json({
      message: "Audit completed successfully",
      audit: {
        id: audit._id,
        websiteUrl: audit.websiteUrl,
        overallScore: audit.overallScore,
        createdAt: audit.createdAt,
        performance: audit.performance,
        accessibility: audit.accessibility,
        seo: audit.seo,
        mobileFriendly: audit.mobileFriendly,
        technical: audit.technical,
        content: audit.content,
        metaTags: audit.metaTags,
        images: audit.images,
        links: audit.links,
      },
      // DEBUG: Send basic debug info only
      debug: {
        linksDataType: typeof auditData.links?.list,
        imagesDataType: typeof auditData.images?.list,
        linksIsArray: Array.isArray(auditData.links?.list),
        imagesIsArray: Array.isArray(auditData.images?.list),
        linksCount: Array.isArray(auditData.links?.list) ? auditData.links.list.length : 0,
        imagesCount: Array.isArray(auditData.images?.list) ? auditData.images.list.length : 0,
      },
    });
  } catch (error) {
    console.error("Audit error:", error);
    res.status(500).json({
      message: "Failed to perform audit: " + error.message,
    });
  }
});

// Get user's audit history
router.get("/history", auth, async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    const query = { userId: safeObjectId(req.user._id) };
    if (!validateQuery(query)) {
      return res.status(400).json({ message: "Invalid query parameters" });
    }
    const audits = await Audit.find(query)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .select("websiteUrl overallScore createdAt performance accessibility seo mobileFriendly technical content");

    const total = await Audit.countDocuments({ userId: req.user._id });

    res.json({
      audits,
      pagination: {
        currentPage: page,
        totalPages: Math.ceil(total / limit),
        totalAudits: total,
        hasNext: page < Math.ceil(total / limit),
        hasPrev: page > 1,
      },
    });
  } catch (error) {
    console.error("Get audit history error:", error);
    res.status(500).json({ message: "Failed to fetch audit history" });
  }
});

// Get specific audit details
router.get("/:auditId", auth, async (req, res) => {
  try {
    const query = {
      _id: safeObjectId(req.params.auditId),
      userId: safeObjectId(req.user._id),
    };
    if (!validateQuery(query)) {
      return res.status(400).json({ message: "Invalid query parameters" });
    }
    const audit = await Audit.findOne(query);

    if (!audit) {
      return res.status(404).json({ message: "Audit not found" });
    }

    res.json({ audit });
  } catch (error) {
    console.error("Get audit error:", error);
    res.status(500).json({ message: "Failed to fetch audit details" });
  }
});

// Get audit statistics
router.get("/stats/overview", auth, async (req, res) => {
  try {
    const totalAudits = await Audit.countDocuments({ userId: req.user._id });

    const avgScore = await Audit.aggregate([
      { $match: { userId: req.user._id } },
      { $group: { _id: null, avgScore: { $avg: "$overallScore" } } },
    ]);

    // Get unique websites count directly in aggregation
    const uniqueWebsites = await Audit.aggregate([
      { $match: { userId: req.user._id } },
      { $group: { _id: "$websiteUrl" } },
      { $count: "uniqueWebsites" },
    ]);
    const websitesTracked = uniqueWebsites.length > 0 ? uniqueWebsites[0].uniqueWebsites : 0;

    const recentAudits = await Audit.find({ userId: req.user._id })
      .sort({ createdAt: -1 })
      .limit(5)
      .select("websiteUrl overallScore createdAt");

    const scoreDistribution = await Audit.aggregate([
      { $match: { userId: req.user._id } },
      {
        $bucket: {
          groupBy: "$overallScore",
          boundaries: [0, 25, 50, 75, 100],
          default: "Other",
          output: {
            count: { $sum: 1 },
          },
        },
      },
    ]);

    res.json({
      totalAudits,
      averageScore: avgScore.length > 0 ? Math.round(avgScore[0].avgScore) : 0,
      websitesTracked,
      reportsGenerated: totalAudits, // Same as total audits since each audit generates a report
      recentAudits,
      scoreDistribution,
    });
  } catch (error) {
    console.error("Get audit stats error:", error);
    res.status(500).json({ message: "Failed to fetch audit statistics" });
  }
});

// Add competitor for analysis
router.post("/:auditId/competitors", auth, async (req, res) => {
  try {
    const { auditId } = req.params;
    const { competitorUrl } = req.body;

    if (!competitorUrl) {
      return res.status(400).json({ message: "Competitor URL is required" });
    }

    // Verify audit belongs to user
    const audit = await Audit.findOne({ _id: auditId, userId: req.user._id });
    if (!audit) {
      return res.status(404).json({ message: "Audit not found" });
    }

    // Check if competitor already exists
    const existingCompetitor = await Audit.findOne({
      userId: req.user._id,
      websiteUrl: competitorUrl,
      parentAuditId: auditId,
    });

    if (existingCompetitor) {
      return res.status(400).json({ message: "Competitor already added" });
    }

    // Start competitor analysis in background
    seoAuditService
      .auditWebsite(competitorUrl)
      .then(async (competitorData) => {
        // Sanitize competitor links/images/content similarly
        let compLinks = {};
        let compImages = {};
        let compContent = {};

        if (typeof competitorData.links === "string") {
          try {
            compLinks = JSON.parse(competitorData.links) || {};
          } catch {
            compLinks = {};
          }
        } else if (competitorData.links && typeof competitorData.links === "object") {
          compLinks = { ...competitorData.links };
        } else {
          compLinks = {};
        }

        if (typeof competitorData.images === "string") {
          try {
            compImages = JSON.parse(competitorData.images) || {};
          } catch {
            compImages = {};
          }
        } else if (competitorData.images && typeof competitorData.images === "object") {
          compImages = { ...competitorData.images };
        } else {
          compImages = {};
        }

        if (typeof competitorData.content === "string") {
          try {
            compContent = JSON.parse(competitorData.content) || {};
          } catch {
            compContent = {};
          }
        } else if (competitorData.content && typeof competitorData.content === "object") {
          compContent = { ...competitorData.content };
        } else {
          compContent = {};
        }
        if (typeof compLinks.list === "string") {
          try {
            compLinks.list = JSON.parse(compLinks.list);
          } catch {
            compLinks.list = [];
          }
        }
        if (!Array.isArray(compLinks.list)) compLinks.list = [];
        // Handle corrupted compLinks.withoutText
        if (typeof compLinks.withoutText === "string") {
          console.log("WARNING: competitor links.withoutText is a string, attempting to parse...");
          try {
            // Log the first 100 characters to see what we're dealing with
            console.log("competitor links.withoutText string (first 100 chars):", compLinks.withoutText.substring(0, 100));

            // Try to parse the string as JSON
            compLinks.withoutText = JSON.parse(compLinks.withoutText);
            console.log("Successfully parsed competitor links.withoutText from string");
          } catch (e) {
            console.log("Failed to parse competitor links.withoutText, error:", e.message);
            console.log("Setting competitor links.withoutText to empty array");
            compLinks.withoutText = [];
          }
        }

        // Ensure it's an array even after parsing
        if (!Array.isArray(compLinks.withoutText)) {
          console.log("competitor links.withoutText is not an array after parsing, setting to empty array");
          compLinks.withoutText = [];
        }

        // If it's an array, ensure each item is properly formatted
        if (Array.isArray(compLinks.withoutText)) {
          // Check if the first item is a string (indicating potential issues)
          if (compLinks.withoutText.length > 0 && typeof compLinks.withoutText[0] === "string") {
            console.log("WARNING: competitor links.withoutText contains strings; attempting to parse each item");
            try {
              // Try to parse each item if they're strings
              compLinks.withoutText = compLinks.withoutText
                .map((item) => {
                  if (typeof item === "string") {
                    try {
                      return JSON.parse(item);
                    } catch {
                      return null;
                    }
                  }
                  return item;
                })
                .filter(Boolean);
            } catch (e) {
              console.log("Failed to parse individual items in competitor links.withoutText:", e.message);
              compLinks.withoutText = [];
            }
          }

          // Now coerce elements to objects with expected fields/types
          compLinks.withoutText = compLinks.withoutText
            .filter((item) => item && typeof item === "object" && !Array.isArray(item))
            .map((l) => ({
              href: typeof l.href === "string" ? l.href : "",
              type: typeof l.type === "string" ? l.type : "",
              target: typeof l.target === "string" ? l.target : "",
              rel: typeof l.rel === "string" ? l.rel : "",
              statusCode: Number.isFinite(l.statusCode) ? l.statusCode : 0,
              isWorking: typeof l.isWorking === "boolean" ? l.isWorking : true,
              text: typeof l.text === "string" ? l.text : "",
            }));
        } else {
          compLinks.withoutText = [];
        }
        if (typeof compImages.list === "string") {
          try {
            compImages.list = JSON.parse(compImages.list);
          } catch {
            compImages.list = [];
          }
        }
        if (!Array.isArray(compImages.list)) compImages.list = [];

        compLinks.total = Array.isArray(compLinks.list) ? compLinks.list.length : 0;
        compImages.total = Array.isArray(compImages.list) ? compImages.list.length : 0;

        // Handle corrupted content.topKeywords for competitor
        if (typeof compContent.topKeywords === "string") {
          console.log("WARNING: competitor content.topKeywords is a string, attempting to parse...");
          try {
            // Log the first 100 characters to see what we're dealing with
            console.log("competitor content.topKeywords string (first 100 chars):", compContent.topKeywords.substring(0, 100));

            // Try to parse the string as JSON
            compContent.topKeywords = JSON.parse(compContent.topKeywords);
            console.log("Successfully parsed competitor content.topKeywords from string");
          } catch (e) {
            console.log("Failed to parse competitor content.topKeywords, error:", e.message);
            console.log("Setting competitor content.topKeywords to empty array");
            compContent.topKeywords = [];
          }
        }

        // Ensure it's an array even after parsing
        if (!Array.isArray(compContent.topKeywords)) {
          console.log("competitor content.topKeywords is not an array after parsing, setting to empty array");
          compContent.topKeywords = [];
        }

        // If it's an array, ensure each item is properly formatted
        if (Array.isArray(compContent.topKeywords)) {
          // Check if the first item is a string (indicating potential issues)
          if (compContent.topKeywords.length > 0 && typeof compContent.topKeywords[0] === "string") {
            console.log("WARNING: competitor content.topKeywords contains strings; attempting to parse each item");
            try {
              // Try to parse each item if they're strings
              compContent.topKeywords = compContent.topKeywords
                .map((item) => {
                  if (typeof item === "string") {
                    try {
                      return JSON.parse(item);
                    } catch {
                      return null;
                    }
                  }
                  return item;
                })
                .filter(Boolean);
            } catch (e) {
              console.log("Failed to parse individual items in competitor content.topKeywords:", e.message);
              compContent.topKeywords = [];
            }
          }

          // Now ensure each keyword is properly formatted
          compContent.topKeywords = compContent.topKeywords
            .filter((item) => item && typeof item === "object" && !Array.isArray(item))
            .map((kw) => ({
              keyword: String(kw.keyword || ""),
              count: Number(kw.count || 0),
              density: Number(kw.density || 0),
              type: String(kw.type || "word"),
            }));
        } else {
          compContent.topKeywords = [];
        }

        // Keep full lists for competitors as well
        if (!Number.isFinite(compLinks.total)) compLinks.total = Array.isArray(compLinks.list) ? compLinks.list.length : 0;

        // Save competitor audit with proper data validation
        const competitorDataToSave = {
          userId: safeObjectId(req.user._id),
          parentAuditId: safeObjectId(auditId),
          websiteUrl: safeString(competitorUrl),
          overallScore: safeNumber(competitorData.overallScore, 0),
          performance: competitorData.performance || {},
          seo: competitorData.seo || {},
          content: compContent,
          images: compImages,
          links: compLinks,
          accessibility: competitorData.accessibility || {},
          mobileFriendly: competitorData.mobileFriendly || {},
          technical: competitorData.technical || {},
          metaTags: competitorData.metaTags || {},
          lighthouse: competitorData.lighthouse || {},
          createdAt: new Date(),
        };

        // Validate critical fields
        if (!competitorDataToSave.userId || !competitorDataToSave.websiteUrl) {
          console.error("Invalid competitor audit data: missing required fields");
          return;
        }

        const competitorAudit = new Audit(competitorDataToSave);
        await competitorAudit.save();
        console.log(`Competitor analysis completed for ${competitorUrl}`);
      })
      .catch((error) => {
        console.error(`Competitor analysis failed for ${competitorUrl}:`, error);
      });

    // Return immediate response
    res.json({
      message: "Competitor added for analysis",
      competitor: {
        id: new mongoose.Types.ObjectId(),
        websiteUrl: competitorUrl,
        status: "analyzing",
        createdAt: new Date(),
      },
    });
  } catch (error) {
    console.error("Add competitor error:", error);
    res.status(500).json({ message: "Failed to add competitor" });
  }
});

// Get competitors for an audit
router.get("/:auditId/competitors", auth, async (req, res) => {
  try {
    const { auditId } = req.params;

    // Verify audit belongs to user
    const audit = await Audit.findOne({ _id: auditId, userId: req.user._id });
    if (!audit) {
      return res.status(404).json({ message: "Audit not found" });
    }

    // Get all competitor audits
    const competitors = await Audit.find({
      userId: req.user._id,
      parentAuditId: auditId,
    })
      .select("websiteUrl overallScore performance seo mobileFriendly technical content createdAt")
      .sort({ createdAt: -1 });

    res.json({ competitors });
  } catch (error) {
    console.error("Get competitors error:", error);
    res.status(500).json({ message: "Failed to fetch competitors" });
  }
});

// Remove competitor
router.delete("/:auditId/competitors/:competitorId", auth, async (req, res) => {
  try {
    const { auditId, competitorId } = req.params;

    // Verify audit belongs to user
    const audit = await Audit.findOne({ _id: auditId, userId: req.user._id });
    if (!audit) {
      return res.status(404).json({ message: "Audit not found" });
    }

    // Delete competitor audit
    const result = await Audit.findOneAndDelete({
      _id: competitorId,
      userId: req.user._id,
      parentAuditId: auditId,
    });

    if (!result) {
      return res.status(404).json({ message: "Competitor not found" });
    }

    res.json({ message: "Competitor removed successfully" });
  } catch (error) {
    console.error("Remove competitor error:", error);
    res.status(500).json({ message: "Failed to remove competitor" });
  }
});

module.exports = router;
