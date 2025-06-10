const Book = require("../models/bookModel");

const mongoose = require("mongoose"); // Thêm nếu chưa import ở đầu file

// Create a new book (Admin only)
const createBook = async (req, res) => {
    try {
        const {
            title,
            authors,
            publisher,
            publicationYear,
            pageCount,
            coverType,
            description,
            images,
            isbn,
            originalPrice,
            sellingPrice,
            stockQuantity,
            isFeatured,
            isNewArrival,
            categories
        } = req.body;

        console.log("body: ", req.body);

        if (!title || !authors || !publisher || !originalPrice || !sellingPrice || !stockQuantity) {
            return res.status(400).json({
                message: "Missing required fields",
                status: "Error"
            });
        }

        function removeVietnameseTones(str) {
            return str.normalize("NFD")
                .replace(/[\u0300-\u036f]/g, "")
                .replace(/đ/g, "d").replace(/Đ/g, "D");
        }

        const slug = removeVietnameseTones(title)
            .toLowerCase()
            .replace(/[^a-z0-9]+/g, "-")
            .replace(/(^-|-$)/g, "");

        const newBook = new Book({
            title,
            slug,
            authors,
            publisher,
            publicationYear,
            pageCount,
            coverType,
            description,
            images,
            isbn,
            originalPrice,
            sellingPrice,
            stockQuantity,
            isFeatured: isFeatured || false,
            isNewArrival: isNewArrival || false,
            categories: categories.map(id => new mongoose.Types.ObjectId(id)),
            createdBy: req.account?._id // sẽ undefined nếu bạn chưa có login, có thể bỏ nếu chưa cần
        });

        await newBook.save();

        res.status(201).json({
            message: "Book created successfully",
            status: "Success",
            data: newBook
        });
    } catch (error) {
        console.error("Error creating book:", error.stack);
        res.status(500).json({
            message: error.message,
            status: "Error"
        });
    }
};


// Get all books with pagination
const getAllBooks = async (req, res) => {
    try {
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 10;
        const skip = (page - 1) * limit;

        const books = await Book.find()
            .populate('categories')
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(limit);

        const total = await Book.countDocuments();

        res.status(200).json({
            message: "Get books successfully",
            status: "Success",
            data: {
                books,
                pagination: {
                    page,
                    limit,
                    total,
                    totalPages: Math.ceil(total / limit)
                }
            }
        });
    } catch (error) {
        res.status(500).json({
            message: error.message,
            status: "Error"
        });
    }
};

// Search books
const searchBooks = async (req, res) => {
    try {
        const { query } = req.query;
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 10;
        const skip = (page - 1) * limit;

        const searchQuery = {
            $or: [
                { title: { $regex: query, $options: 'i' } },
                { authors: { $regex: query, $options: 'i' } },
                { description: { $regex: query, $options: 'i' } },
                { publisher: { $regex: query, $options: 'i' } }
            ]
        };

        const books = await Book.find(searchQuery)
            .populate('categories')
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(limit);

        const total = await Book.countDocuments(searchQuery);

        res.status(200).json({
            message: "Search books successfully",
            status: "Success",
            data: {
                books,
                pagination: {
                    page,
                    limit,
                    total,
                    totalPages: Math.ceil(total / limit)
                }
            }
        });
    } catch (error) {
        res.status(500).json({
            message: error.message,
            status: "Error"
        });
    }
};

// Get book by ID
const getBookById = async (req, res) => {
    try {
        const book = await Book.findById(req.params.id)
            .populate('categories');

        if (!book) {
            return res.status(404).json({
                message: "Book not found",
                status: "Error"
            });
        }

        res.status(200).json({
            message: "Get book successfully",
            status: "Success",
            data: book
        });
    } catch (error) {
        res.status(500).json({
            message: error.message,
            status: "Error"
        });
    }
};

// Update book (Admin only)
const updateBook = async (req, res) => {
    try {
        const {
            title,
            authors,
            publisher,
            publicationYear,
            pageCount,
            coverType,
            description,
            images,
            isbn,
            originalPrice,
            sellingPrice,
            stockQuantity,
            isFeatured,
            isNewArrival,
            categories
        } = req.body;

        const book = await Book.findById(req.params.id);

        if (!book) {
            return res.status(404).json({
                message: "Book not found",
                status: "Error"
            });
        }

        // Generate new slug if title is changed
        const slug = title !== book.title
            ? title.toLowerCase()
                .replace(/[^a-z0-9]+/g, '-')
                .replace(/(^-|-$)/g, '')
            : book.slug;

        // Update book fields
        const updatedFields = {
            title: title || book.title,
            slug,
            authors: authors || book.authors,
            publisher: publisher || book.publisher,
            publicationYear: publicationYear || book.publicationYear,
            pageCount: pageCount || book.pageCount,
            coverType: coverType || book.coverType,
            description: description || book.description,
            images: images || book.images,
            isbn: isbn || book.isbn,
            originalPrice: originalPrice || book.originalPrice,
            sellingPrice: sellingPrice || book.sellingPrice,
            stockQuantity: stockQuantity || book.stockQuantity,
            isFeatured: isFeatured !== undefined ? isFeatured : book.isFeatured,
            isNewArrival: isNewArrival !== undefined ? isNewArrival : book.isNewArrival,
            categories: categories || book.categories,
            updatedBy: req.account._id
        };

        const updatedBook = await Book.findByIdAndUpdate(
            req.params.id,
            updatedFields,
            { new: true }
        ).populate('categories');

        res.status(200).json({
            message: "Book updated successfully",
            status: "Success",
            data: updatedBook
        });
    } catch (error) {
        res.status(500).json({
            message: error.message,
            status: "Error"
        });
    }
};

// Delete book (Admin only)
const deleteBook = async (req, res) => {
    try {
        const book = await Book.findById(req.params.id);

        if (!book) {
            return res.status(404).json({
                message: "Book not found",
                status: "Error"
            });
        }

        await Book.findByIdAndDelete(req.params.id);

        res.status(200).json({
            message: "Book deleted successfully",
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
    createBook,
    getAllBooks,
    searchBooks,
    getBookById,
    updateBook,
    deleteBook
};
