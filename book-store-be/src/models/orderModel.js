// models/Order.js
const OrderSchema = new Schema({
    user: { type: Schema.Types.ObjectId, ref: "Account" },
    orderCode: String,
    fullName: String,
    phone: String,
    address: String,
    discountCode: String,
    discountAmount: Number,
    shippingFee: Number,
    totalAmount: Number,
    paymentMethod: String, // "COD", "VNPAY", "MOMO"
    paymentStatus: String, // "pending", "paid", "failed"
    orderStatus: String, // "pending", "shipping", "completed", "cancelled"
    items: [{
        book: { type: Schema.Types.ObjectId, ref: "Book" },
        quantity: Number,
        price: Number
    }]
}, { timestamps: true });

module.exports = mongoose.model("Order", OrderSchema);