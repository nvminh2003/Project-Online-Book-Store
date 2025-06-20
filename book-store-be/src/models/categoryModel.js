// models/Category.js
const mongoose = require('mongoose');

const CategorySchema = new mongoose.Schema({
    name: String,
    slug: String,
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: "Account" }
}, { timestamps: true });

module.exports = mongoose.models.Category || mongoose.model("Category", CategorySchema);