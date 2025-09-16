const mongoose = require("mongoose");

const CommentSchema = new mongoose.Schema(
  {
    author: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: false },
    authorName: { type: String, required: false },
    content: { type: String, required: true },
    replies: [
      {
        author: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: false },
        authorName: { type: String, required: false },
        content: { type: String, required: true },
        createdAt: { type: Date, default: Date.now },
        updatedAt: { type: Date, default: Date.now },
      },
    ],
  },
  { timestamps: true }
);

const CommunityPostSchema = new mongoose.Schema(
  {
    title: { type: String, required: true },
    content: { type: String, required: true },
    tags: [{ type: String }],
    author: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: false },
    authorName: { type: String, required: false },
    comments: [CommentSchema],
    upvotes: { type: Number, default: 0 },
  },
  { timestamps: true }
);

// Text index to allow efficient search across multiple fields
// Note: ensure indexes are built in your environment (e.g., on server start)
CommunityPostSchema.index({ title: "text", content: "text", tags: "text", authorName: "text" });

module.exports = mongoose.models.CommunityPost || mongoose.model("CommunityPost", CommunityPostSchema);
