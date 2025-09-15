/**
 * Audit Route Patch
 *
 * This file contains a complete replacement for the problematic section
 * in the POST /audit route handler that's causing MongoDB cast errors.
 *
 * To apply this patch:
 * 1. Locate the POST /audit route handler in server/routes/audit.js
 * 2. Replace the data cleaning and saving section with this code
 */

// Inside your POST /audit route handler, replace the data cleaning and saving section with this:

// Clean the audit data using our helper functions
const cleanContent = cleanTopKeywords(auditData.content || {});
const cleanLinks = cleanLinksWithoutText(auditData.links || {});
const cleanImages = { ...(auditData.images || {}) };

// Ensure images.list is an array
if (typeof cleanImages.list === "string") {
  try {
    cleanImages.list = JSON.parse(cleanImages.list);
  } catch (e) {
    console.log("Failed to parse images.list:", e.message);
    cleanImages.list = [];
  }
}

if (!Array.isArray(cleanImages.list)) {
  cleanImages.list = [];
}

// Final validation to ensure all arrays are properly formatted
if (!Array.isArray(cleanContent.topKeywords)) cleanContent.topKeywords = [];
if (!Array.isArray(cleanLinks.withoutText)) cleanLinks.withoutText = [];
if (!Array.isArray(cleanLinks.list)) cleanLinks.list = [];
if (!Array.isArray(cleanImages.list)) cleanImages.list = [];

// Compute counts
const computedLinksCount = cleanLinks.list.length;
const computedImagesCount = cleanImages.list.length;

cleanLinks.total = Number.isFinite(cleanLinks.total) ? cleanLinks.total : computedLinksCount;
cleanImages.total = Number.isFinite(cleanImages.total) ? cleanImages.total : computedImagesCount;

// Persist withoutText count
if (!Number.isFinite(cleanLinks.withoutTextCount)) cleanLinks.withoutTextCount = cleanLinks.withoutText.length || 0;

// We're not storing the full list in MongoDB to avoid size issues
cleanLinks.list = [];

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
  content: {
    ...cleanContent,
    topKeywords: safeArray(cleanContent.topKeywords),
  },
  images: {
    ...cleanImages,
    list: safeArray(cleanImages.list),
  },
  links: {
    ...cleanLinks,
    withoutText: safeArray(cleanLinks.withoutText),
    list: safeArray(cleanLinks.list),
  },
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

// Log the structure of the problematic fields to verify they're arrays
console.log("=== VALIDATION BEFORE SAVE ===");
console.log("content.topKeywords is array:", Array.isArray(auditDataToSave.content.topKeywords));
console.log("links.withoutText is array:", Array.isArray(auditDataToSave.links.withoutText));
console.log("=== END VALIDATION ===");

const audit = new Audit(auditDataToSave);

try {
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
      cleanedContentKeywordsIsArray: Array.isArray(auditDataToSave.content.topKeywords),
      cleanedLinksWithoutTextIsArray: Array.isArray(auditDataToSave.links.withoutText),
    },
  });
} catch (saveError) {
  console.error("Audit save error:", saveError);

  // If we encounter a cast error, try one more time with empty arrays
  if (saveError.name === "CastError" || saveError.name === "ValidationError") {
    console.log("Attempting to fix cast error by ensuring arrays...");

    // Force arrays for problematic fields
    auditDataToSave.content.topKeywords = [];
    auditDataToSave.links.withoutText = [];

    try {
      const fixedAudit = new Audit(auditDataToSave);
      await fixedAudit.save();

      // Update user's monthly scan count
      req.user.monthlyScans += 1;
      await req.user.save();

      res.json({
        message: "Audit completed successfully (with data fixes)",
        audit: {
          id: fixedAudit._id,
          websiteUrl: fixedAudit.websiteUrl,
          overallScore: fixedAudit.overallScore,
          createdAt: fixedAudit.createdAt,
        },
      });
    } catch (retryError) {
      console.error("Failed retry save:", retryError);
      res.status(500).json({
        message: "Failed to save audit after fix attempt: " + retryError.message,
      });
    }
  } else {
    res.status(500).json({
      message: "Failed to save audit: " + saveError.message,
    });
  }
}
