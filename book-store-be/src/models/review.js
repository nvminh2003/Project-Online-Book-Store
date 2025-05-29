const mongoose = require("mongoose");

const reviewSchema = new mongoose.Schema({
    bookId: { type: mongoose.Schema.Types.ObjectId, ref: "Book" },
    userId: { type: mongoose.Schema.Types.ObjectId, ref: "Account" },
    orderId: { type: mongoose.Schema.Types.ObjectId, ref: "Order" },
    rating: Number,
    comment: String,
    isApproved: Boolean
}, { timestamps: true });

module.exports = mongoose.model("Review", reviewSchema);
