const Category = require("../models/categoryModel");

// Create a new category (Admin only)
const createCategory = async (req, res) => {
    try {
        const { name } = req.body;

        // Validate required fields
        if (!name) {
            return res.status(400).json({
                message: "Category name is required",
                status: "Error"
            });
        }

        // Check if category already exists
        const existingCategory = await Category.findOne({
            name: { $regex: new RegExp(`^${name}$`, 'i') }
        });

        if (existingCategory) {
            return res.status(400).json({
                message: "Category already exists",
                status: "Error"
            });
        }

        function removeVietnameseTones(str) {
            return str.normalize("NFD")
                .replace(/[\u0300-\u036f]/g, "") // remove diacritics
                .replace(/đ/g, "d").replace(/Đ/g, "D");
        }

        // Generate slug from name
        const slug = removeVietnameseTones(name)
            .toLowerCase()
            .replace(/[^a-z0-9]+/g, "-")
            .replace(/(^-|-$)/g, "");

        // Create new category
        const newCategory = new Category({
            name,
            slug,
            createdBy: req.account._id
        });

        await newCategory.save();

        res.status(201).json({
            message: "Category created successfully",
            status: "Success",
            data: newCategory
        });
    } catch (error) {
        res.status(500).json({
            message: error.message,
            status: "Error"
        });
    }
};

// Get all categories
const getAllCategories = async (req, res) => {
    try {
        const categories = await Category.find()
            .sort({ name: 1 });

        res.status(200).json({
            message: "Get categories successfully",
            status: "Success",
            data: categories
        });
    } catch (error) {
        res.status(500).json({
            message: error.message,
            status: "Error"
        });
    }
};

// Get category by ID
const getCategoryById = async (req, res) => {
    try {
        const category = await Category.findById(req.params.id);

        if (!category) {
            return res.status(404).json({
                message: "Category not found",
                status: "Error"
            });
        }

        res.status(200).json({
            message: "Get category successfully",
            status: "Success",
            data: category
        });
    } catch (error) {
        res.status(500).json({
            message: error.message,
            status: "Error"
        });
    }
};

// Update category (Admin only)
const updateCategory = async (req, res) => {
    try {
        const { name } = req.body;

        const category = await Category.findById(req.params.id);

        if (!category) {
            return res.status(404).json({
                message: "Category not found",
                status: "Error"
            });
        }

        // Check if new name already exists (excluding current category)
        if (name && name !== category.name) {
            const existingCategory = await Category.findOne({
                name: { $regex: new RegExp(`^${name}$`, 'i') },
                _id: { $ne: category._id }
            });

            if (existingCategory) {
                return res.status(400).json({
                    message: "Category name already exists",
                    status: "Error"
                });
            }
        }

        // Generate new slug if name is changed
        const slug = name !== category.name
            ? name.toLowerCase()
                .replace(/[^a-z0-9]+/g, '-')
                .replace(/(^-|-$)/g, '')
            : category.slug;

        // Update category
        const updatedCategory = await Category.findByIdAndUpdate(
            req.params.id,
            {
                name: name || category.name,
                slug,
                updatedBy: req.account._id
            },
            { new: true }
        );

        res.status(200).json({
            message: "Category updated successfully",
            status: "Success",
            data: updatedCategory
        });
    } catch (error) {
        res.status(500).json({
            message: error.message,
            status: "Error"
        });
    }
};

// Delete category (Admin only)
const deleteCategory = async (req, res) => {
    try {
        const category = await Category.findById(req.params.id);

        if (!category) {
            return res.status(404).json({
                message: "Category not found",
                status: "Error"
            });
        }

        // TODO: Check if category is being used by any books
        // const booksWithCategory = await Book.find({ categories: category._id });
        // if (booksWithCategory.length > 0) {
        //     return res.status(400).json({
        //         message: "Cannot delete category that is being used by books",
        //         status: "Error"
        //     });
        // }

        await Category.findByIdAndDelete(req.params.id);

        res.status(200).json({
            message: "Category deleted successfully",
            status: "Success"
        });
    } catch (error) {
        res.status(500).json({
            message: error.message,
            status: "Error"
        });
    }
};

module.exports = {
    createCategory,
    getAllCategories,
    getCategoryById,
    updateCategory,
    deleteCategory
}; 