const mongoose = require("mongoose");

const blogPostSchema = new mongoose.Schema({
    title: String,
    content: String,
    authorId: { type: mongoose.Schema.Types.ObjectId, ref: "Admin" },
    status: String,
    viewCount: { type: Number, default: 0 }
}, { timestamps: true });

module.exports = mongoose.model("BlogPost", blogPostSchema);
