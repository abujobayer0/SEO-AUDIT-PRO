/**
 * MongoDB Cast Error Fix
 *
 * This script fixes the MongoDB cast errors in the SEO Audit Tool
 * by ensuring proper data types for arrays in the Audit schema.
 *
 * The specific issues addressed are:
 * 1. content.topKeywords being stored as string instead of array of objects
 * 2. links.withoutText being stored as string instead of array of objects
 *
 * To apply this fix:
 * 1. Add this code to the beginning of the audit route handler in server/routes/audit.js
 * 2. Replace the existing data cleaning code with the improved version
 */

// Add these helper functions to your routes/audit.js file

/**
 * Safely parses a string that should be an array
 * @param {string|any} value - Value to parse
 * @returns {Array} - Parsed array or empty array
 */
function safeParseArray(value) {
  if (Array.isArray(value)) return value;
  if (value === null || value === undefined) return [];

  if (typeof value === "string") {
    try {
      const parsed = JSON.parse(value);
      return Array.isArray(parsed) ? parsed : [];
    } catch (error) {
      console.log("Failed to parse string as array:", error.message);
      return [];
    }
  }

  return [];
}

/**
 * Ensures content.topKeywords is properly formatted
 * @param {Object} content - Content object from audit data
 * @returns {Object} - Cleaned content object
 */
function cleanTopKeywords(content) {
  const cleanContent = { ...content };

  // Handle corrupted content.topKeywords
  if (typeof cleanContent.topKeywords === "string") {
    console.log("WARNING: content.topKeywords is a string, attempting to parse...");
    cleanContent.topKeywords = safeParseArray(cleanContent.topKeywords);
  }

  // Ensure it's an array
  if (!Array.isArray(cleanContent.topKeywords)) {
    console.log("content.topKeywords is not an array, setting to empty array");
    cleanContent.topKeywords = [];
  }

  // Process each item to ensure proper format
  if (Array.isArray(cleanContent.topKeywords)) {
    // Check if items are strings (indicating potential issues)
    if (cleanContent.topKeywords.length > 0 && typeof cleanContent.topKeywords[0] === "string") {
      console.log("WARNING: content.topKeywords contains strings; attempting to parse each item");

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
    }

    // Ensure each keyword has the proper structure
    cleanContent.topKeywords = cleanContent.topKeywords
      .filter((item) => item && typeof item === "object" && !Array.isArray(item))
      .map((kw) => ({
        keyword: String(kw.keyword || ""),
        count: Number(kw.count || 0),
        density: Number(kw.density || 0),
        type: String(kw.type || "word"),
      }));
  }

  return cleanContent;
}

/**
 * Ensures links.withoutText is properly formatted
 * @param {Object} links - Links object from audit data
 * @returns {Object} - Cleaned links object
 */
function cleanLinksWithoutText(links) {
  const cleanLinks = { ...links };

  // Handle corrupted links.withoutText
  if (typeof cleanLinks.withoutText === "string") {
    console.log("WARNING: links.withoutText is a string, attempting to parse...");
    cleanLinks.withoutText = safeParseArray(cleanLinks.withoutText);
  }

  // Ensure it's an array
  if (!Array.isArray(cleanLinks.withoutText)) {
    console.log("links.withoutText is not an array, setting to empty array");
    cleanLinks.withoutText = [];
  }

  // Process each item to ensure proper format
  if (Array.isArray(cleanLinks.withoutText)) {
    // Check if items are strings (indicating potential issues)
    if (cleanLinks.withoutText.length > 0 && typeof cleanLinks.withoutText[0] === "string") {
      console.log("WARNING: links.withoutText contains strings; attempting to parse each item");

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
    }

    // Ensure each link has the proper structure
    cleanLinks.withoutText = cleanLinks.withoutText
      .filter((item) => item && typeof item === "object" && !Array.isArray(item))
      .map((link) => ({
        href: String(link.href || ""),
        type: String(link.type || "unknown"),
        target: String(link.target || ""),
        rel: String(link.rel || ""),
        statusCode: Number(link.statusCode || 0),
        isWorking: Boolean(link.isWorking),
        text: String(link.text || ""),
      }));
  }

  return cleanLinks;
}

/**
 * Example usage in your audit route handler:
 *
 * // In your POST /audit route handler
 * router.post("/", auth, async (req, res) => {
 *   try {
 *     // ... existing code ...
 *
 *     // Clean the audit data
 *     const cleanContent = cleanTopKeywords(auditData.content || {});
 *     const cleanLinks = cleanLinksWithoutText(auditData.links || {});
 *
 *     // Ensure all arrays are properly formatted before saving
 *     const auditDataToSave = {
 *       userId: safeObjectId(req.user._id),
 *       websiteUrl: safeString(websiteUrl),
 *       // ... other fields ...
 *       content: {
 *         ...cleanContent,
 *         topKeywords: cleanContent.topKeywords || [],
 *       },
 *       links: {
 *         ...cleanLinks,
 *         withoutText: cleanLinks.withoutText || [],
 *         list: cleanLinks.list || [],
 *       },
 *       // ... other fields ...
 *     };
 *
 *     const audit = new Audit(auditDataToSave);
 *     await audit.save();
 *
 *     // ... rest of your code ...
 *   } catch (error) {
 *     // ... error handling ...
 *   }
 * });
 */

// Export the functions for use in audit.js
module.exports = {
  safeParseArray,
  cleanTopKeywords,
  cleanLinksWithoutText,
};
