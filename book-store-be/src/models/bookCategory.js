const mongoose = require("mongoose");

const bookCategorySchema = new mongoose.Schema({
    bookId: { type: mongoose.Schema.Types.ObjectId, ref: "Book" },
    categoryId: { type: mongoose.Schema.Types.ObjectId, ref: "Category" },
});

module.exports = mongoose.model("BookCategory", bookCategorySchema);
