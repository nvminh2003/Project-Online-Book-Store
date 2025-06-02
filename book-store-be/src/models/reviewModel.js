// models/Review.js
const mongoose = require('mongoose');

const ReviewSchema = new mongoose.Schema({
    book: { type: mongoose.Schema.Types.ObjectId, ref: "Book" },
    user: { type: mongoose.Schema.Types.ObjectId, ref: "Account" },
    order: { type: mongoose.Schema.Types.ObjectId, ref: "Order" },
    rating: { type: Number, min: 1, max: 5 },
    comment: String,
    isApproved: { type: Boolean, default: false }
}, { timestamps: true });

module.exports = mongoose.model("Review", ReviewSchema);