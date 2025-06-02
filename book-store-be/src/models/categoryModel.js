// models/Category.js
const CategorySchema = new Schema({
    name: String,
    slug: String
}, { timestamps: true });

module.exports = mongoose.model("Category", CategorySchema);