const mongoose = require("mongoose");

const customerSchema = new mongoose.Schema({
    accountId: { type: mongoose.Schema.Types.ObjectId, ref: "Account", required: true },
    fullName: String,
    phone: String,
    address: String,
    gender: String,
    birthday: Date,
}, { timestamps: true });

module.exports = mongoose.model("Customer", customerSchema);
