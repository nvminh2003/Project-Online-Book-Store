const AdminActivityLog = require("../models/AdminActivityLog");
const Book = require("../models/bookModel");

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
        // Validate required fields
        if (!title || !authors || !publisher || !originalPrice || !sellingPrice || !stockQuantity) {
            return res.status(400).json({
                message: "Missing required fields",
                status: "Error"
            });
        }

        function removeVietnameseTones(str) {
            return str.normalize("NFD")
                .replace(/[\u0300-\u036f]/g, "") // remove diacritics
                .replace(/đ/g, "d").replace(/Đ/g, "D");
        }

        // Generate slug from name
        const slug = removeVietnameseTones(title)
            .toLowerCase()
            .replace(/[^a-z0-9]+/g, "-")
            .replace(/(^-|-$)/g, "");

        // Create new book
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
            categories,
            createdBy: req.account._id
        });

        await newBook.save();

        // Log admin activity
        await AdminActivityLog.create({
            adminId: req.account._id,
            action: 'CREATE_BOOK',
            details: `Admin ${req.account.email} created new book post: ${title}`
        });

        res.status(201).json({
            message: "Book created successfully",
            status: "Success",
            data: newBook
        });
    } catch (error) {
        res.status(500).json({
            message: error.message,
            status: "Error"
        });
    }
};

// Get all books with pagination, filtering, and sorting
const getAllBooks = async (req, res) => {
    try {
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 10;
        const skip = (page - 1) * limit;

        const {
            sort,
            category,
            isFeatured,
            isNewArrival,
            minPrice,
            maxPrice
        } = req.query;

        const query = {};

        // Filtering
        if (category) {
            query.categories = category;
        }
        if (isFeatured) {
            query.isFeatured = isFeatured === 'true';
        }
        if (isNewArrival) {
            query.isNewArrival = isNewArrival === 'true';
        }

        // Price range filter
        if (minPrice || maxPrice) {
            query.sellingPrice = {};
            if (minPrice) query.sellingPrice.$gte = parseInt(minPrice);
            if (maxPrice) query.sellingPrice.$lte = parseInt(maxPrice);
        }

        // Sorting
        let sortOption = { createdAt: -1 }; // default sort
        if (sort) {
            const parts = sort.split(':'); // e.g., 'sellingPrice:asc'
            if (parts.length === 2) {
                sortOption = { [parts[0]]: parts[1] === 'desc' ? -1 : 1 };
            }
        }

        const books = await Book.find(query)
            .populate('categories')
            .sort(sortOption)
            .skip(skip)
            .limit(limit);

        const total = await Book.countDocuments(query);

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

// Get a single book by ID
const getBookById = async (req, res) => {
    try {
        const book = await Book.findById(req.params.id)
            .populate('categories', 'name slug')
            .populate('createdBy', 'info.fullName email');

        if (!book) {
            return res.status(404).json({ message: "Book not found", status: "Error" });
        }
        res.status(200).json({
            message: "Get book successfully",
            status: "Success",
            data: book
        });
    } catch (error) {
        res.status(500).json({ message: error.message, status: "Error" });
    }
};

// Update a book (Admin only)
const updateBook = async (req, res) => {
    try {
        const { id } = req.params;
        const bookData = req.body;

        const book = await Book.findById(id);
        if (!book) {
            return res.status(404).json({ message: "Book not found", status: "Error" });
        }

        // if title is updated, regenerate slug
        if (bookData.title && bookData.title !== book.title) {
            function removeVietnameseTones(str) {
                return str.normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/đ/g, "d").replace(/Đ/g, "D");
            }
            bookData.slug = removeVietnameseTones(bookData.title).toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");
        }

        const updatedBook = await Book.findByIdAndUpdate(
            id,
            { ...bookData, updatedBy: req.account._id },
            { new: true, runValidators: true }
        ).populate('categories');

        // Log admin activity
        await AdminActivityLog.create({
            adminId: req.account._id,
            action: 'UPDATE_BOOK',
            details: `Admin ${req.account.email} updated book: ${updatedBook.title}`
        });

        res.status(200).json({
            message: "Book updated successfully",
            status: "Success",
            data: updatedBook
        });
    } catch (error) {
        res.status(500).json({ message: error.message, status: "Error" });
    }
};

// Delete a book (Admin only)
const deleteBook = async (req, res) => {
    try {
        const book = await Book.findById(req.params.id);
        if (!book) {
            return res.status(404).json({ message: "Book not found", status: "Error" });
        }

        await Book.findByIdAndDelete(req.params.id);

        // Log admin activity
        await AdminActivityLog.create({
            adminId: req.account._id,
            action: 'DELETE_BOOK',
            details: `Admin ${req.account.email} deleted book: ${book.title}`
        });

        res.status(200).json({ message: "Book deleted successfully", status: "Success" });
    } catch (error) {
        res.status(500).json({ message: error.message, status: "Error" });
    }
};

// Search books by a search term
const searchBooks = async (req, res) => {
    try {
        const { searchTerm } = req.query;
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 10;
        const skip = (page - 1) * limit;

        if (!searchTerm) {
            return res.status(400).json({
                message: "Search term is required",
                status: "Error"
            });
        }

        const query = {
            $or: [
                { title: { $regex: searchTerm, $options: 'i' } },
                { authors: { $in: [new RegExp(searchTerm, 'i')] } },
                { description: { $regex: searchTerm, $options: 'i' } },
                { isbn: { $regex: searchTerm, $options: 'i' } }
            ]
        };

        const [books, total] = await Promise.all([
            Book.find(query)
                .populate('categories')
                .sort({ createdAt: -1 })
                .skip(skip)
                .limit(limit),
            Book.countDocuments(query)
        ]);

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

module.exports = {
    createBook,
    getAllBooks,
    getBookById,
    updateBook,
    deleteBook,
    searchBooks
};
