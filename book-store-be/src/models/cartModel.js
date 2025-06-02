// models/Cart.js
const CartSchema = new Schema({
    user: { type: Schema.Types.ObjectId, ref: "Account" },
    items: [{
        book: { type: Schema.Types.ObjectId, ref: "Book" },
        quantity: Number
    }]
}, { timestamps: true });

module.exports = mongoose.model("Cart", CartSchema);