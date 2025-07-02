// models/Cart.js
const mongoose = require("mongoose");

const CartSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: "Account" },
    items: [
      {
        book: { type: mongoose.Schema.Types.ObjectId, ref: "Book" },
        quantity: Number,
      },
    ],
    coupon: { type: String, default: null },
    couponDetails: {
      code: String,
      type: { type: String, enum: ["percent", "fixed"] },
      value: Number,
      discountAmountCalculated: Number,
    },
    subtotal: { type: Number, default: 0 },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Cart", CartSchema);
