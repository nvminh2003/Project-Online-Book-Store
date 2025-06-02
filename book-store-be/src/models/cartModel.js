// models/Cart.js
const mongoose = require('mongoose');

const CartSchema = new mongoose.Schema({
    user: { type: mongoose.Schema.Types.ObjectId, ref: "Account" },
    items: [{
        book: { type: mongoose.Schema.Types.ObjectId, ref: "Book" },
        quantity: Number
    }]
}, { timestamps: true });

module.exports = mongoose.model("Cart", CartSchema);