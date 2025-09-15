# MongoDB Cast Error Fix for SEO Audit Tool

This document explains how to fix the MongoDB cast errors occurring in the SEO Audit Tool when saving audit data.

## The Problem

The error occurs when the server tries to save audit data to MongoDB, but the data structure doesn't match the schema:

```
Audit error: Error: Audit validation failed: content.topKeywords.0: Cast to [string] failed for value [...] (type string) at path "content.topKeywords.0" because of "CastError", links.withoutText.0: Cast to [string] failed for value [...] (type string) at path "links.withoutText.0" because of "CastError"
```

The issue is that `content.topKeywords` and `links.withoutText` are being stored as strings instead of arrays of objects.

## The Solution

We've created two files to fix this issue:

1. `fix-mongodb-cast-error.js` - Contains helper functions to clean and validate data
2. `audit-route-patch.js` - Contains a complete replacement for the problematic section in the audit route

### Step 1: Add the Helper Functions

First, make sure the `fix-mongodb-cast-error.js` file is in the project root. This file contains:

- `safeParseArray()` - Safely parses strings that should be arrays
- `cleanTopKeywords()` - Ensures content.topKeywords is properly formatted
- `cleanLinksWithoutText()` - Ensures links.withoutText is properly formatted

### Step 2: Import the Helper Functions

In `server/routes/audit.js`, add this import at the top:

```javascript
// Import helper functions for fixing MongoDB cast errors
const { safeParseArray, cleanTopKeywords, cleanLinksWithoutText } = require("../../fix-mongodb-cast-error");
```

### Step 3: Replace the Audit Route Handler Code

In the POST `/audit` route handler, locate the data cleaning and saving section, and replace it with the code from `audit-route-patch.js`.

The main changes are:

1. Using helper functions to clean the data:

   ```javascript
   const cleanContent = cleanTopKeywords(auditData.content || {});
   const cleanLinks = cleanLinksWithoutText(auditData.links || {});
   ```

2. Ensuring arrays are properly formatted:

   ```javascript
   if (!Array.isArray(cleanContent.topKeywords)) cleanContent.topKeywords = [];
   if (!Array.isArray(cleanLinks.withoutText)) cleanLinks.withoutText = [];
   ```

3. Using safeArray in the audit data:

   ```javascript
   content: {
     ...cleanContent,
     topKeywords: safeArray(cleanContent.topKeywords),
   },
   links: {
     ...cleanLinks,
     withoutText: safeArray(cleanLinks.withoutText),
   },
   ```

4. Adding error recovery for cast errors:

   ```javascript
   if (saveError.name === "CastError" || saveError.name === "ValidationError") {
     // Force arrays for problematic fields
     auditDataToSave.content.topKeywords = [];
     auditDataToSave.links.withoutText = [];

     // Try to save again...
   }
   ```

### Step 4: Test the Fix

Run a test audit to verify the fix:

1. Start the server
2. Perform an audit on a website
3. Check the logs for any cast errors
4. Verify the audit was saved successfully

## Technical Details

### MongoDB Schema

The Audit schema expects:

- `content.topKeywords` to be an array of objects with `keyword`, `count`, `density`, and `type` properties
- `links.withoutText` to be an array of objects with `href`, `type`, `target`, `rel`, `statusCode`, `isWorking`, and `text` properties

### Error Cause

The error happens because:

1. The data from the SEO service is sometimes returned as a stringified JSON array
2. The schema expects an actual array of objects
3. When Mongoose tries to cast the string to an array, it fails

### Fix Logic

The fix works by:

1. Detecting if the field is a string and attempting to parse it as JSON
2. Ensuring the result is an array
3. Processing each item to ensure it has the correct structure
4. Providing a fallback to empty arrays if parsing fails
5. Adding a recovery mechanism for cast errors

## Conclusion

This fix ensures that audit data is properly formatted before saving to MongoDB, preventing cast errors and improving the reliability of the SEO Audit Tool.

If you encounter any issues with the fix, please check the server logs for detailed error messages.
