// models/BlogPost.js
const mongoose = require('mongoose');

const BlogSchema = new mongoose.Schema({
    title: String,
    content: String,
    author: { type: mongoose.Schema.Types.ObjectId, ref: "Account" },
    viewCount: { type: Number, default: 0 }
}, { timestamps: true });

module.exports = mongoose.model("Blog", BlogSchema);