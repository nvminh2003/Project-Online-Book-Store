// models/Account.js
const mongoose = require('mongoose');
const bcrypt = require('bcrypt');

const AccountSchema = new mongoose.Schema({
    email: { type: String, required: true, unique: true },
    password: { type: String }, // chỉ có nếu không đăng nhập Google
    googleId: { type: String }, // nếu đăng nhập bằng Google
    role: { type: String, enum: ["customer", "admin", "superadmin"], default: "customer" },
    isActive: { type: Boolean, default: true },
    refreshToken: { type: String },

    customerInfo: {
        fullName: String,
        phone: String,
        address: String,
        gender: { type: String, enum: ["male", "female", "other"] },
        birthday: Date
    },

    adminInfo: {
        fullName: String,
        department: { type: String, enum: ["dev", "business"] }
        // permissions: [String]
    }
}, { timestamps: true });

// ✅ Hash password trước khi lưu (chỉ nếu được thay đổi)
AccountSchema.pre("save", async function (next) {
    if (this.isModified("password") && this.password) {
        const salt = await bcrypt.genSalt(10);
        this.password = await bcrypt.hash(this.password, salt);
    }
    next();
});

// ✅ So sánh password khi đăng nhập
AccountSchema.methods.comparePassword = async function (rawPassword) {
    return await bcrypt.compare(rawPassword, this.password);
};

module.exports = mongoose.model("Account", AccountSchema);