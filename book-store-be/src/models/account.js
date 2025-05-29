const mongoose = require("mongoose");

const accountSchema = new mongoose.Schema({
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    role: { type: mongoose.Schema.Types.ObjectId, ref: "Role" },
    isActive: { type: Boolean, default: true },
    refreshToken: { type: String },
}, { timestamps: true });

module.exports = mongoose.model("Account", accountSchema);
