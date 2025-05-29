const mongoose = require("mongoose");

const cartItemSchema = new mongoose.Schema({
    cartId: { type: mongoose.Schema.Types.ObjectId, ref: "Cart" },
    bookId: { type: mongoose.Schema.Types.ObjectId, ref: "Book" },
    quantity: Number
});

module.exports = mongoose.model("CartItem", cartItemSchema);
