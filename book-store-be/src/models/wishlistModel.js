const mongoose = require("mongoose");

const discountBookSchema = new mongoose.Schema({
    discountId: { type: mongoose.Schema.Types.ObjectId, ref: "DiscountCode" },
    bookId: { type: mongoose.Schema.Types.ObjectId, ref: "Book" }
});

module.exports = mongoose.model("DiscountBook", discountBookSchema); 