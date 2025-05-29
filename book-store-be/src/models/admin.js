const mongoose = require("mongoose");

const adminSchema = new mongoose.Schema({
    accountId: { type: mongoose.Schema.Types.ObjectId, ref: "Account", required: true },
    fullName: String,
    department: String,
}, { timestamps: true });

module.exports = mongoose.model("Admin", adminSchema);
