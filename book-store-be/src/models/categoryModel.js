// models/Category.js
const mongoose = require('mongoose');

const CategorySchema = new mongoose.Schema({
    name: String,
    slug: String,
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: "Account" }
}, { timestamps: true });

module.exports = mongoose.model("Category", CategorySchema);