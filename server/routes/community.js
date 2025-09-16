const express = require("express");
const router = express.Router();
const CommunityPost = require("../models/CommunityPost");
const auth = require("../middleware/auth");
const jwt = require("jsonwebtoken");
const User = require("../models/User");

// Optional auth middleware: attaches user if token is present/valid, otherwise continues
const optionalAuth = async (req, res, next) => {
  try {
    const token = req.header("Authorization")?.replace("Bearer ", "");
    if (!token) return next();
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(decoded.userId).select("-password");
    if (user) req.user = user;
  } catch (_) {
    // ignore invalid token
  }
  next();
};

// List posts with pagination and optional tag filter
router.get("/posts", async (req, res, next) => {
  try {
    const page = parseInt(req.query.page || "1", 10);
    const limit = Math.min(parseInt(req.query.limit || "10", 10), 50);
    const tag = req.query.tag;
    const query = tag ? { tags: tag } : {};
    const total = await CommunityPost.countDocuments(query);
    const posts = await CommunityPost.find(query)
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(limit)
      .lean();
    res.json({ posts, page, limit, total });
  } catch (err) {
    next(err);
  }
});

// Search posts by text across title, content, tags, authorName
router.get("/posts/search", async (req, res, next) => {
  try {
    const q = (req.query.q || "").trim();
    const limit = Math.min(parseInt(req.query.limit || "10", 10), 50);
    const page = parseInt(req.query.page || "1", 10);

    if (!q) {
      return res.status(400).json({ message: "Query 'q' is required" });
    }

    // Use text search for relevance; fallback to regex if needed
    const searchStage = { $text: { $search: q } };
    const projection = { score: { $meta: "textScore" } };

    const totalMatches = await CommunityPost.countDocuments(searchStage);
    const results = await CommunityPost.find(searchStage, projection)
      .sort({ score: { $meta: "textScore" }, createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(limit)
      .lean();

    // Basic highlight helper
    const escape = (s) => s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
    const terms = q
      .split(/\s+/)
      .filter(Boolean)
      .map((t) => t.toLowerCase());
    const rx = new RegExp(`(${terms.map(escape).join("|")})`, "gi");
    const highlight = (text) => (text || "").slice(0, 4000).replace(rx, "<mark>$1</mark>");

    const highlighted = results.map((p) => ({
      ...p,
      highlight: {
        title: highlight(p.title),
        content: highlight(p.content),
        authorName: highlight(p.authorName || ""),
        tags: (p.tags || []).map((t) => highlight(t)),
      },
    }));

    // Similar results based on shared tags when available
    let similar = [];
    const tagSet = new Set();
    results.forEach((p) => (p.tags || []).forEach((t) => tagSet.add(t)));
    if (tagSet.size > 0) {
      similar = await CommunityPost.find({ tags: { $in: Array.from(tagSet) }, _id: { $nin: results.map((r) => r._id) } })
        .sort({ createdAt: -1 })
        .limit(10)
        .lean();
    }

    res.json({
      query: q,
      page,
      limit,
      total: totalMatches,
      totalPages: Math.max(1, Math.ceil(totalMatches / limit)),
      results: highlighted,
      similar,
    });
  } catch (err) {
    next(err);
  }
});

// Get single post
router.get("/posts/:id", async (req, res, next) => {
  try {
    const post = await CommunityPost.findById(req.params.id).lean();
    if (!post) return res.status(404).json({ message: "Post not found" });
    res.json({ post });
  } catch (err) {
    next(err);
  }
});

// Create post
router.post("/posts", optionalAuth, async (req, res, next) => {
  try {
    const { title, content, tags, authorName } = req.body;
    if (!title || !content) return res.status(400).json({ message: "Title and content are required" });
    const post = await CommunityPost.create({
      title,
      content,
      tags: Array.isArray(tags) ? tags : [],
      author: req.user ? req.user.id : undefined,
      authorName: req.user ? undefined : authorName,
    });
    res.status(201).json({ post });
  } catch (err) {
    next(err);
  }
});

// Update post
router.put("/posts/:id", auth, async (req, res, next) => {
  try {
    const { title, content, tags } = req.body;
    const post = await CommunityPost.findById(req.params.id);
    if (!post) return res.status(404).json({ message: "Post not found" });
    if (req.user && post.author && String(post.author) !== String(req.user.id)) {
      return res.status(403).json({ message: "Not allowed" });
    }
    if (title !== undefined) post.title = title;
    if (content !== undefined) post.content = content;
    if (tags !== undefined) post.tags = Array.isArray(tags) ? tags : [];
    await post.save();
    res.json({ post });
  } catch (err) {
    next(err);
  }
});

// Delete post
router.delete("/posts/:id", auth, async (req, res, next) => {
  try {
    const post = await CommunityPost.findById(req.params.id);
    if (!post) return res.status(404).json({ message: "Post not found" });
    if (req.user && post.author && String(post.author) !== String(req.user.id)) {
      return res.status(403).json({ message: "Not allowed" });
    }
    await post.deleteOne();
    res.json({ success: true });
  } catch (err) {
    next(err);
  }
});

// Add comment
router.post("/posts/:id/comments", optionalAuth, async (req, res, next) => {
  try {
    const { content, authorName } = req.body;
    if (!content) return res.status(400).json({ message: "Content is required" });
    const post = await CommunityPost.findById(req.params.id);
    if (!post) return res.status(404).json({ message: "Post not found" });
    post.comments.push({
      content,
      author: req.user ? req.user.id : undefined,
      authorName: req.user ? undefined : authorName,
    });
    await post.save();
    res.status(201).json({ post });
  } catch (err) {
    next(err);
  }
});

// Add reply to a comment
router.post("/posts/:postId/comments/:commentId/replies", optionalAuth, async (req, res, next) => {
  try {
    const { content, authorName } = req.body;
    if (!content) return res.status(400).json({ message: "Content is required" });
    const post = await CommunityPost.findById(req.params.postId);
    if (!post) return res.status(404).json({ message: "Post not found" });
    const comment = post.comments.id(req.params.commentId);
    if (!comment) return res.status(404).json({ message: "Comment not found" });
    comment.replies.push({
      content,
      author: req.user ? req.user.id : undefined,
      authorName: req.user ? undefined : authorName,
    });
    await post.save();
    res.status(201).json({ post });
  } catch (err) {
    next(err);
  }
});

module.exports = router;
