const Book = require('../models/bookModel'); // Đảm bảo đường dẫn đúng

// Create a new book
exports.createBook = async (req, res) => {
    try {
        const book = new Book(req.body);
        await book.save();
        res.status(201).json(book);
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
};

// Get all books with pagination
exports.getAllBooks = async (req, res) => {
    try {
        const { page = 1, limit = 10 } = req.query;
        const books = await Book.find()
            .skip((page - 1) * limit)
            .limit(Number(limit));
        const total = await Book.countDocuments();
        res.json({ total, page: Number(page), limit: Number(limit), books });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// Search books by title, author, or ISBN
exports.searchBooks = async (req, res) => {
    try {
        const { q } = req.query;
        if (!q) {
            return res.status(400).json({ error: 'Missing search query (q).' });
        }

        const books = await Book.find({
            $or: [
                { title: { $regex: q, $options: 'i' } },
                { authors: { $regex: q, $options: 'i' } },
                { isbn: { $regex: q, $options: 'i' } },
            ]
        });

        res.json(books);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// Get a book by ID
exports.getBookById = async (req, res) => {
    try {
        const book = await Book.findById(req.params.id);
        if (!book) {
            return res.status(404).json({ error: 'Book not found.' });
        }
        res.json(book);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// Update a book
exports.updateBook = async (req, res) => {
    try {
        const updatedBook = await Book.findByIdAndUpdate(
            req.params.id,
            req.body,
            { new: true, runValidators: true }
        );
        if (!updatedBook) {
            return res.status(404).json({ error: 'Book not found.' });
        }
        res.json(updatedBook);
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
};

// Delete a book
exports.deleteBook = async (req, res) => {
    try {
        const deletedBook = await Book.findByIdAndDelete(req.params.id);
        if (!deletedBook) {
            return res.status(404).json({ error: 'Book not found.' });
        }
        res.json({ message: 'Book deleted successfully.' });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};
