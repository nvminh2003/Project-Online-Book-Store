// models/Review.js
const ReviewSchema = new Schema({
    book: { type: Schema.Types.ObjectId, ref: "Book" },
    user: { type: Schema.Types.ObjectId, ref: "Account" },
    order: { type: Schema.Types.ObjectId, ref: "Order" },
    rating: { type: Number, min: 1, max: 5 },
    comment: String,
    isApproved: { type: Boolean, default: false }
}, { timestamps: true });

module.exports = mongoose.model("Review", ReviewSchema);