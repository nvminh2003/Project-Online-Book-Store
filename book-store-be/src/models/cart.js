const mongoose = require("mongoose");

const cartSchema = new mongoose.Schema({
    userId: { type: mongoose.Schema.Types.ObjectId, ref: "Account" }
}, { timestamps: true });

module.exports = mongoose.model("Cart", cartSchema);
