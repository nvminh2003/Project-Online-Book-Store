// models/BlogPost.js
const BlogPostSchema = new Schema({
    title: String,
    content: String,
    author: { type: Schema.Types.ObjectId, ref: "Account" },
    status: { type: String, enum: ["draft", "published"], default: "draft" },
    viewCount: { type: Number, default: 0 }
}, { timestamps: true });

module.exports = mongoose.model("BlogPost", BlogPostSchema);