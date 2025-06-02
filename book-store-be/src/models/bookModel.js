// models/Book.js
const mongoose = require('mongoose');

const BookSchema = new mongoose.Schema({
    title: String,
    slug: String,
    authors: [String],
    publisher: String,
    publicationYear: Number,
    pageCount: Number,
    coverType: String,
    description: String,
    images: [String],
    isbn: String,
    originalPrice: Number,
    sellingPrice: Number,
    stockQuantity: Number,
    averageRating: { type: Number, default: 0 },
    totalRatings: { type: Number, default: 0 },
    isFeatured: { type: Boolean, default: false },
    isNewArrival: { type: Boolean, default: false },
    categories: [{ type: mongoose.Schema.Types.ObjectId, ref: "Category" }],
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: "Account" },
    updatedBy: { type: mongoose.Schema.Types.ObjectId, ref: "Account" }
}, { timestamps: true });

module.exports = mongoose.model("Book", BookSchema);