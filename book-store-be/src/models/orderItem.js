const mongoose = require("mongoose");

const orderItemSchema = new mongoose.Schema({
    orderId: { type: mongoose.Schema.Types.ObjectId, ref: "Order" },
    bookId: { type: mongoose.Schema.Types.ObjectId, ref: "Book" },
    quantity: Number,
    price: Number
});

module.exports = mongoose.model("OrderItem", orderItemSchema);
