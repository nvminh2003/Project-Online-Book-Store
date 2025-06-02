const Wishlist = require("../models/wishlistModel");
const Book = require("../models/bookModel");

// Get wishlist
const getWishlist = async (req, res) => {
    try {
        let wishlist = await Wishlist.findOne({ user: req.account._id })
            .populate('books', 'title sellingPrice images authors publisher');

        if (!wishlist) {
            wishlist = new Wishlist({ user: req.account._id, books: [] });
            await wishlist.save();
        }

        res.status(200).json({
            message: "Get wishlist successfully",
            status: "Success",
            data: wishlist
        });
    } catch (error) {
        res.status(500).json({
            message: error.message,
            status: "Error"
        });
    }
};

// Add book to wishlist
const addToWishlist = async (req, res) => {
    try {
        const { bookId } = req.body;

        if (!bookId) {
            return res.status(400).json({
                message: "Book ID is required",
                status: "Error"
            });
        }

        // Check if book exists
        const book = await Book.findById(bookId);
        if (!book) {
            return res.status(404).json({
                message: "Book not found",
                status: "Error"
            });
        }

        let wishlist = await Wishlist.findOne({ user: req.account._id });

        if (!wishlist) {
            wishlist = new Wishlist({
                user: req.account._id,
                books: [bookId]
            });
        } else {
            // Check if book already in wishlist
            if (wishlist.books.includes(bookId)) {
                return res.status(400).json({
                    message: "Book is already in wishlist",
                    status: "Error"
                });
            }
            wishlist.books.push(bookId);
        }

        await wishlist.save();

        // Populate book details
        const populatedWishlist = await Wishlist.findById(wishlist._id)
            .populate('books', 'title sellingPrice images authors publisher');

        res.status(200).json({
            message: "Add to wishlist successfully",
            status: "Success",
            data: populatedWishlist
        });
    } catch (error) {
        res.status(500).json({
            message: error.message,
            status: "Error"
        });
    }
};

// Remove book from wishlist
const removeFromWishlist = async (req, res) => {
    try {
        const { bookId } = req.params;

        const wishlist = await Wishlist.findOne({ user: req.account._id });

        if (!wishlist) {
            return res.status(404).json({
                message: "Wishlist not found",
                status: "Error"
            });
        }

        // Check if book is in wishlist
        if (!wishlist.books.includes(bookId)) {
            return res.status(400).json({
                message: "Book is not in wishlist",
                status: "Error"
            });
        }

        wishlist.books = wishlist.books.filter(
            book => book.toString() !== bookId
        );

        await wishlist.save();

        // Populate book details
        const populatedWishlist = await Wishlist.findById(wishlist._id)
            .populate('books', 'title sellingPrice images authors publisher');

        res.status(200).json({
            message: "Remove from wishlist successfully",
            status: "Success",
            data: populatedWishlist
        });
    } catch (error) {
        res.status(500).json({
            message: error.message,
            status: "Error"
        });
    }
};

// Clear wishlist
const clearWishlist = async (req, res) => {
    try {
        const wishlist = await Wishlist.findOne({ user: req.account._id });

        if (!wishlist) {
            return res.status(404).json({
                message: "Wishlist not found",
                status: "Error"
            });
        }

        wishlist.books = [];
        await wishlist.save();

        res.status(200).json({
            message: "Clear wishlist successfully",
            status: "Success",
            data: wishlist
        });
    } catch (error) {
        res.status(500).json({
            message: error.message,
            status: "Error"
        });
    }
};

// Check if book is in wishlist
const checkBookInWishlist = async (req, res) => {
    try {
        const { bookId } = req.params;

        const wishlist = await Wishlist.findOne({ user: req.account._id });

        if (!wishlist) {
            return res.status(200).json({
                message: "Check wishlist successfully",
                status: "Success",
                data: { isInWishlist: false }
            });
        }

        const isInWishlist = wishlist.books.includes(bookId);

        res.status(200).json({
            message: "Check wishlist successfully",
            status: "Success",
            data: { isInWishlist }
        });
    } catch (error) {
        res.status(500).json({
            message: error.message,
            status: "Error"
        });
    }
};

module.exports = {
    getWishlist,
    addToWishlist,
    removeFromWishlist,
    clearWishlist,
    checkBookInWishlist
};
