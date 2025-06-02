const mongoose = require("mongoose");

const bookSchema = new mongoose.Schema({
    title: String,
    slug: String,
    authors: String,
    publisher: String,
    publicationYear: Number,
    pageCount: Number,
    coverType: String,
    description: String,
    images: [String], // array of image URLs
    isbn: String,
    originalPrice: Number,
    sellingPrice: Number,
    stockQuantity: Number,
    averageRating: Number,
    totalRatings: Number,
    isFeatured: Boolean,
    isNewArrival: Boolean
}, { timestamps: true });

module.exports = mongoose.model("Book", bookSchema);
