// models/Wishlist.js
// models/Wishlist.js
const mongoose = require("mongoose");

const WishlistItemSchema = new mongoose.Schema({
    book: { type: mongoose.Schema.Types.ObjectId, ref: "Book", required: true },
    dateAdded: { type: Date, default: Date.now },
});

const WishlistSchema = new mongoose.Schema(
    {
        user: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Account",
            required: true,
        },
        books: [WishlistItemSchema],
    },
    { timestamps: true }
);

module.exports = mongoose.model("Wishlist", WishlistSchema);