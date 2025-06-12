const mongoose = require('mongoose');

const ReviewSchema = new mongoose.Schema({
    book: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Book",
        required: true,
        index: true
    },
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Account",
        required: true
    },
    rating: {
        type: Number,
        required: true,
        min: 1,
        max: 5
    },
    comment: {
        type: String,
        trim: true,
        maxlength: 1000
    },
    reported: {
        type: Boolean,
        default: false
    },
    visibility: {
        type: String,
        enum: ["visible", "hidden"],
        default: "visible"
    }
}, {
    timestamps: true
});

module.exports = mongoose.model("Review", ReviewSchema);
