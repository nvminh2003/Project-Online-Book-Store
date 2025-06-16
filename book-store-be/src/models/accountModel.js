// models/Account.js
const mongoose = require('mongoose');
const bcrypt = require('bcrypt');

const AccountSchema = new mongoose.Schema({
    email: {
        type: String, required: true, unique: true,
        validate: {
            validator: function (v) {
                return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v);
            },
            message: props => `${props.value} is not a valid email address!`
        }
    },
    password: { type: String },
    googleId: { type: String },
    role: {
        type: String,
        enum: ["customer", "admindev", "adminbusiness", "superadmin"],
        default: "customer"
    },
    isActive: { type: Boolean, default: true },
    refreshToken: { type: String },
    resetToken: { type: String },
    resetTokenExpires: { type: Date },

    info: {
        fullName: String,
        phone: {
            type: String,
            validate: {
                validator: function (v) {
                    return /^\d{10}$/.test(v);
                },
                message: props => `${props.value} is not a valid 10-digit phone number!`
            }
        },
        address: String,
        gender: { type: String, enum: ["male", "female", "other"], default: null },
        birthday: {
            type: Date,
            validate: {
                validator: function (value) {
                    if (!value) return true;
                    const today = new Date();
                    const age = today.getFullYear() - value.getFullYear();
                    return age > 16 || (age === 16 && today >= new Date(value.setFullYear(value.getFullYear() + 16)));
                },
                message: () => `User must be at least 16 years old`
            }
        }
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