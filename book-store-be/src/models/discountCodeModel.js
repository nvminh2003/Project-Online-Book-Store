// models/DiscountCode.js
const mongoose = require('mongoose');

const DiscountCodeSchema = new mongoose.Schema({
    code: String,
    description: String,
    type: { type: String, enum: ["percent", "fixed"] },
    value: Number,
    startDate: Date,
    endDate: Date,
    isActive: { type: Boolean, default: true },
    maxUses: Number,
    usesCount: { type: Number, default: 0 },
    books: [{ type: mongoose.Schema.Types.ObjectId, ref: "Book" }]
}, { timestamps: true });

module.exports = mongoose.model("DiscountCode", DiscountCodeSchema);