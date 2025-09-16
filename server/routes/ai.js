const express = require("express");
const axios = require("axios");
const auth = require("../middleware/auth");

const router = express.Router();

async function callGemini(endpoint, payload, { timeout = 25000, retries = 2, backoffMs = 800 } = {}) {
  let attempt = 0;
  let lastError;
  while (attempt <= retries) {
    try {
      return await axios.post(`${endpoint}?key=${process.env.GEMINI_API_KEY}`, payload, { timeout });
    } catch (err) {
      const status = err?.response?.status;
      const isRateLimited = status === 429 || status === 403;
      const isServerBusy = status === 503 || status === 500;
      lastError = err;
      if (attempt < retries && (isRateLimited || isServerBusy)) {
        const jitter = Math.floor(Math.random() * 250);
        await new Promise((r) => setTimeout(r, backoffMs * Math.pow(2, attempt) + jitter));
        attempt += 1;
        continue;
      }
      throw err;
    }
  }
  throw lastError;
}

// POST /api/ai/meta-suggestions
// Body: { url, title, description, keywords: string[], auditContext: string }
router.post("/meta-suggestions", auth, async (req, res) => {
  try {
    const { url, title, description, keywords = [], auditContext = "" } = req.body || {};

    if (!process.env.GEMINI_API_KEY) {
      return res.status(500).json({ message: "GEMINI_API_KEY not configured on server" });
    }

    const prompt = [
      "You are an expert SEO copywriter.",
      "Rewrite the page title and meta description to maximize CTR while staying truthful.",
      "Constraints:",
      "- Title: 50-60 chars ideal (max 60)",
      "- Description: 150-160 chars ideal (max 160)",
      "- Include the most important keyword(s) naturally",
      "- Avoid clickbait and avoid overpromising",
      "- Provide 3 distinct variants",
      "Return JSON with exact schema: { variants: [{ title, description, rationale }] }",
      "",
      `URL: ${url || "unknown"}`,
      `Current Title: ${title || ""}`,
      `Current Description: ${description || ""}`,
      `Target Keywords: ${(Array.isArray(keywords) ? keywords : []).join(", ")}`,
      "Relevant page/audit context:",
      auditContext || "",
    ].join("\n");

    const endpoint = "https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent";

    const gResponse = await callGemini(
      endpoint,
      {
        contents: [
          {
            parts: [{ text: prompt }],
          },
        ],
        generationConfig: {
          temperature: 0.7,
          maxOutputTokens: 400,
        },
      },
      { timeout: 20000, retries: 2 }
    );

    const text = gResponse?.data?.candidates?.[0]?.content?.parts?.[0]?.text || "";

    // Try to parse JSON from model response; if it fails, fall back to naive parsing
    let parsed;
    try {
      parsed = JSON.parse(text);
    } catch (_) {
      // Fallback: attempt to extract JSON block
      const match = text.match(/\{[\s\S]*\}/);
      if (match) {
        try {
          parsed = JSON.parse(match[0]);
        } catch (__) {
          parsed = null;
        }
      }
    }

    if (!parsed || !Array.isArray(parsed.variants)) {
      // Create a simple variant by splitting lines if needed
      const lines = text.split("\n").filter(Boolean).slice(0, 6);
      const fallback = [
        { title: lines[0] || "", description: lines[1] || "", rationale: "Model freeform output" },
        { title: lines[2] || "", description: lines[3] || "", rationale: "Model freeform output" },
        { title: lines[4] || "", description: lines[5] || "", rationale: "Model freeform output" },
      ].filter((v) => v.title || v.description);

      return res.json({ variants: fallback.length ? fallback : [] });
    }

    return res.json({ variants: parsed.variants });
  } catch (error) {
    const status = error?.response?.status;
    const rawMessage = error?.response?.data?.error?.message || error?.message || "Failed to get suggestions";
    const message = /quota|rate/i.test(rawMessage) ? "AI quota reached. Please wait or check billing." : rawMessage;
    return res.status(status === 429 || status === 403 ? 429 : 500).json({ message });
  }
});

module.exports = router;
// --- Additional AI routes below ---

// POST /api/ai/perf-explain
// Body: { websiteUrl, performance }
router.post("/perf-explain", auth, async (req, res) => {
  try {
    const { websiteUrl = "", performance = {} } = req.body || {};
    if (!process.env.GEMINI_API_KEY) {
      return res.status(500).json({ message: "GEMINI_API_KEY not configured on server" });
    }

    const prompt = [
      "You are a senior web performance engineer.",
      "Explain the bottlenecks and prescribe concrete, framework-agnostic fixes.",
      "Prioritize impact for Core Web Vitals (LCP, CLS, INP).",
      "Return JSON: { summary: string, actions: string[], cwv: { lcp?: string, cls?: string, inp?: string } }",
      websiteUrl ? `URL: ${websiteUrl}` : "",
      "Performance data (JSON):",
      JSON.stringify(performance, null, 2),
    ].join("\n");

    const endpoint = "https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-pro:generateContent";
    const gResponse = await callGemini(
      endpoint,
      { contents: [{ parts: [{ text: prompt }] }], generationConfig: { temperature: 0.4, maxOutputTokens: 900 } },
      { timeout: 25000, retries: 2 }
    );
    const text = gResponse?.data?.candidates?.[0]?.content?.parts?.[0]?.text || "";
    let parsed;
    try {
      parsed = JSON.parse(text);
    } catch (_) {
      const match = text.match(/\{[\s\S]*\}/);
      if (match) {
        try {
          parsed = JSON.parse(match[0]);
        } catch (__) {}
      }
    }
    if (!parsed) parsed = { summary: text.slice(0, 1000), actions: [] };
    return res.json(parsed);
  } catch (error) {
    const status = error?.response?.status;
    const rawMessage = error?.response?.data?.error?.message || error?.message || "Failed to analyze performance";
    const message = /quota|rate/i.test(rawMessage) ? "AI quota reached. Please wait or check billing." : rawMessage;
    return res.status(status === 429 || status === 403 ? 429 : 500).json({ message });
  }
});

// POST /api/ai/seo-analyze
// Body: { websiteUrl, seo, content, meta, keywords }
router.post("/seo-analyze", auth, async (req, res) => {
  try {
    const { websiteUrl = "", seo = {}, content = {}, meta = {}, keywords = [] } = req.body || {};
    if (!process.env.GEMINI_API_KEY) {
      return res.status(500).json({ message: "GEMINI_API_KEY not configured on server" });
    }

    const prompt = [
      "You are an expert technical SEO consultant.",
      "Analyze the site's SEO and content depth.",
      "Return JSON: { summary: string, quickWins: string[], deepIssues: string[], recommendations: string[] }",
      websiteUrl ? `URL: ${websiteUrl}` : "",
      "Keywords:",
      Array.isArray(keywords) ? keywords.join(", ") : "",
      "SEO data:",
      JSON.stringify(seo, null, 2),
      "Content data:",
      JSON.stringify(content, null, 2),
      "Meta data:",
      JSON.stringify(meta, null, 2),
    ].join("\n");

    const endpoint = "https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-pro:generateContent";
    const gResponse = await callGemini(
      endpoint,
      { contents: [{ parts: [{ text: prompt }] }], generationConfig: { temperature: 0.5, maxOutputTokens: 1200 } },
      { timeout: 30000, retries: 2 }
    );
    const text = gResponse?.data?.candidates?.[0]?.content?.parts?.[0]?.text || "";
    let parsed;
    try {
      parsed = JSON.parse(text);
    } catch (_) {
      const match = text.match(/\{[\s\S]*\}/);
      if (match) {
        try {
          parsed = JSON.parse(match[0]);
        } catch (__) {}
      }
    }
    if (!parsed) parsed = { summary: text.slice(0, 1200), quickWins: [], deepIssues: [], recommendations: [] };
    return res.json(parsed);
  } catch (error) {
    const status = error?.response?.status;
    const rawMessage = error?.response?.data?.error?.message || error?.message || "Failed to analyze SEO";
    const message = /quota|rate/i.test(rawMessage) ? "AI quota reached. Please wait or check billing." : rawMessage;
    return res.status(status === 429 || status === 403 ? 429 : 500).json({ message });
  }
});
