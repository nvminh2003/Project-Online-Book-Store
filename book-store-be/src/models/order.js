const mongoose = require("mongoose");

const orderSchema = new mongoose.Schema({
    orderCode: String,
    userId: { type: mongoose.Schema.Types.ObjectId, ref: "Account" },
    fullName: String,
    phone: String,
    address: String,
    discountCode: String,
    discountAmount: Number,
    shippingFee: Number,
    totalAmount: Number,
    paymentMethod: String,
    paymentStatus: String,
    orderStatus: String
}, { timestamps: true });

module.exports = mongoose.model("Order", orderSchema);
