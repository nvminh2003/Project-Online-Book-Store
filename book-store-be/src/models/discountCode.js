const mongoose = require("mongoose");

const discountCodeSchema = new mongoose.Schema({
    code: String,
    description: String,
    type: String, // e.g., "percent" or "amount"
    value: Number,
    startDate: Date,
    endDate: Date,
    isActive: Boolean,
    maxUses: Number,
    usesCount: { type: Number, default: 0 }
}, { timestamps: true });

module.exports = mongoose.model("DiscountCode", discountCodeSchema);
