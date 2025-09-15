/**
 * MongoDB Utility Functions
 * Helps prevent cast errors and provides safe query methods
 */

/**
 * Safely converts a value to ObjectId
 * @param {any} value - Value to convert
 * @returns {mongoose.Types.ObjectId|null} - ObjectId or null if invalid
 */
function safeObjectId(value) {
  const mongoose = require("mongoose");

  if (!value) return null;

  // If already an ObjectId, return it
  if (value instanceof mongoose.Types.ObjectId) {
    return value;
  }

  // If it's a string, try to convert
  if (typeof value === "string") {
    try {
      return new mongoose.Types.ObjectId(value);
    } catch (error) {
      console.warn("Invalid ObjectId string:", value);
      return null;
    }
  }

  return null;
}

/**
 * Safely converts a value to string
 * @param {any} value - Value to convert
 * @returns {string} - String representation
 */
function safeString(value) {
  if (value === null || value === undefined) return "";
  return String(value);
}

/**
 * Safely converts a value to number
 * @param {any} value - Value to convert
 * @param {number} defaultValue - Default value if conversion fails
 * @returns {number} - Number or default value
 */
function safeNumber(value, defaultValue = 0) {
  if (value === null || value === undefined) return defaultValue;

  const num = Number(value);
  if (isNaN(num)) return defaultValue;

  return num;
}

/**
 * Safely converts a value to boolean
 * @param {any} value - Value to convert
 * @returns {boolean} - Boolean value
 */
function safeBoolean(value) {
  if (value === null || value === undefined) return false;
  if (typeof value === "boolean") return value;
  if (typeof value === "string") {
    return value.toLowerCase() === "true" || value === "1";
  }
  return Boolean(value);
}

/**
 * Safely converts a value to array
 * @param {any} value - Value to convert
 * @returns {Array} - Array or empty array
 */
function safeArray(value) {
  if (Array.isArray(value)) return value;
  if (value === null || value === undefined) return [];
  if (typeof value === "string") {
    try {
      const parsed = JSON.parse(value);
      return Array.isArray(parsed) ? parsed : [];
    } catch (error) {
      return [];
    }
  }
  return [];
}

/**
 * Safely converts a value to object
 * @param {any} value - Value to convert
 * @returns {Object} - Object or empty object
 */
function safeObject(value) {
  if (value === null || value === undefined) return {};
  if (typeof value === "object" && !Array.isArray(value)) return value;
  if (typeof value === "string") {
    try {
      const parsed = JSON.parse(value);
      return typeof parsed === "object" && !Array.isArray(parsed) ? parsed : {};
    } catch (error) {
      return {};
    }
  }
  return {};
}

/**
 * Creates a safe MongoDB query with proper type conversion
 * @param {Object} query - Query object
 * @returns {Object} - Safe query object
 */
function createSafeQuery(query) {
  const safeQuery = {};

  for (const [key, value] of Object.entries(query)) {
    if (value === null || value === undefined) {
      continue;
    }

    // Handle special MongoDB operators
    if (key.startsWith("$")) {
      safeQuery[key] = value;
      continue;
    }

    // Handle ObjectId fields (common patterns)
    if (key.endsWith("Id") || key === "_id" || key === "userId") {
      safeQuery[key] = safeObjectId(value);
      if (safeQuery[key] === null) {
        delete safeQuery[key];
      }
      continue;
    }

    // Handle string fields
    if (typeof value === "string") {
      safeQuery[key] = safeString(value);
      continue;
    }

    // Handle number fields
    if (typeof value === "number") {
      safeQuery[key] = safeNumber(value);
      continue;
    }

    // Handle boolean fields
    if (typeof value === "boolean") {
      safeQuery[key] = safeBoolean(value);
      continue;
    }

    // Handle array fields
    if (Array.isArray(value)) {
      safeQuery[key] = safeArray(value);
      continue;
    }

    // Handle object fields
    if (typeof value === "object") {
      safeQuery[key] = safeObject(value);
      continue;
    }

    // Default: convert to string
    safeQuery[key] = safeString(value);
  }

  return safeQuery;
}

/**
 * Validates MongoDB query before execution
 * @param {Object} query - Query to validate
 * @returns {boolean} - True if valid, false otherwise
 */
function validateQuery(query) {
  if (!query || typeof query !== "object") {
    console.error("Invalid query: not an object");
    return false;
  }

  // Check for common cast error patterns
  for (const [key, value] of Object.entries(query)) {
    // Check for incorrect $in usage
    if (key === "in" && Array.isArray(value)) {
      console.error("Invalid query: use $in instead of in");
      return false;
    }

    // Check for nested objects that might cause issues
    if (typeof value === "object" && value !== null && !Array.isArray(value)) {
      for (const [nestedKey, nestedValue] of Object.entries(value)) {
        if (nestedKey === "in" && Array.isArray(nestedValue)) {
          console.error("Invalid nested query: use $in instead of in");
          return false;
        }
      }
    }
  }

  return true;
}

module.exports = {
  safeObjectId,
  safeString,
  safeNumber,
  safeBoolean,
  safeArray,
  safeObject,
  createSafeQuery,
  validateQuery,
};
