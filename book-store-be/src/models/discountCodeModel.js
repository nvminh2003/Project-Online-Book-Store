// models/DiscountCode.js
const DiscountCodeSchema = new Schema({
    code: String,
    description: String,
    type: { type: String, enum: ["percent", "fixed"] },
    value: Number,
    startDate: Date,
    endDate: Date,
    isActive: { type: Boolean, default: true },
    maxUses: Number,
    usesCount: { type: Number, default: 0 },
    books: [{ type: Schema.Types.ObjectId, ref: "Book" }]
}, { timestamps: true });

module.exports = mongoose.model("DiscountCode", DiscountCodeSchema);