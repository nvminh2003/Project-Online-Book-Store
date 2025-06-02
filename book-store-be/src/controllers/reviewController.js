const Review = require("../models/reviewModel");
const Book = require("../models/bookModel");
const Order = require("../models/orderModel");

// Create review
const createReview = async (req, res) => {
    try {
        const { bookId, orderId, rating, comment } = req.body;

        // Validate required fields
        if (!bookId || !orderId || !rating) {
            return res.status(400).json({
                message: "Book ID, order ID and rating are required",
                status: "Error"
            });
        }

        // Validate rating
        if (rating < 1 || rating > 5) {
            return res.status(400).json({
                message: "Rating must be between 1 and 5",
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

        // Check if order exists and belongs to user
        const order = await Order.findOne({
            _id: orderId,
            user: req.account._id,
            orderStatus: "completed"
        });

        if (!order) {
            return res.status(404).json({
                message: "Order not found or not completed",
                status: "Error"
            });
        }

        // Check if book is in order
        const bookInOrder = order.items.find(
            item => item.book.toString() === bookId
        );

        if (!bookInOrder) {
            return res.status(400).json({
                message: "Book is not in this order",
                status: "Error"
            });
        }

        // Check if user has already reviewed this book in this order
        const existingReview = await Review.findOne({
            book: bookId,
            user: req.account._id,
            order: orderId
        });

        if (existingReview) {
            return res.status(400).json({
                message: "You have already reviewed this book for this order",
                status: "Error"
            });
        }

        // Create review
        const review = new Review({
            book: bookId,
            user: req.account._id,
            order: orderId,
            rating,
            comment,
            isApproved: req.account.role === "admin" // Auto approve for admin reviews
        });

        await review.save();

        // Update book's average rating
        const reviews = await Review.find({
            book: bookId,
            isApproved: true
        });

        const totalRatings = reviews.length;
        const averageRating = reviews.reduce((sum, review) => sum + review.rating, 0) / totalRatings;

        await Book.findByIdAndUpdate(bookId, {
            averageRating,
            totalRatings
        });

        // Populate review details
        const populatedReview = await Review.findById(review._id)
            .populate('book', 'title')
            .populate('user', 'email customerInfo.fullName');

        res.status(201).json({
            message: "Review created successfully",
            status: "Success",
            data: populatedReview
        });
    } catch (error) {
        res.status(500).json({
            message: error.message,
            status: "Error"
        });
    }
};

// Get reviews by book ID
const getReviewsByBook = async (req, res) => {
    try {
        const { bookId } = req.params;
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 10;
        const skip = (page - 1) * limit;

        // Check if book exists
        const book = await Book.findById(bookId);
        if (!book) {
            return res.status(404).json({
                message: "Book not found",
                status: "Error"
            });
        }

        // Build query
        const query = { book: bookId };
        if (req.account.role !== "admin") {
            query.isApproved = true;
        }

        const reviews = await Review.find(query)
            .populate('user', 'email customerInfo.fullName')
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(limit);

        const total = await Review.countDocuments(query);

        res.status(200).json({
            message: "Get reviews successfully",
            status: "Success",
            data: {
                reviews,
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

// Get user's reviews
const getUserReviews = async (req, res) => {
    try {
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 10;
        const skip = (page - 1) * limit;

        const query = { user: req.account._id };
        if (req.account.role !== "admin") {
            query.isApproved = true;
        }

        const reviews = await Review.find(query)
            .populate('book', 'title')
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(limit);

        const total = await Review.countDocuments(query);

        res.status(200).json({
            message: "Get user reviews successfully",
            status: "Success",
            data: {
                reviews,
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

// Update review
const updateReview = async (req, res) => {
    try {
        const { reviewId } = req.params;
        const { rating, comment } = req.body;

        // Validate rating if provided
        if (rating && (rating < 1 || rating > 5)) {
            return res.status(400).json({
                message: "Rating must be between 1 and 5",
                status: "Error"
            });
        }

        // Find review
        const review = await Review.findById(reviewId);

        if (!review) {
            return res.status(404).json({
                message: "Review not found",
                status: "Error"
            });
        }

        // Check ownership
        if (review.user.toString() !== req.account._id && req.account.role !== "admin") {
            return res.status(403).json({
                message: "You are not authorized to update this review",
                status: "Error"
            });
        }

        // Update review
        if (rating) review.rating = rating;
        if (comment) review.comment = comment;

        await review.save();

        // Update book's average rating
        const reviews = await Review.find({
            book: review.book,
            isApproved: true
        });

        const totalRatings = reviews.length;
        const averageRating = reviews.reduce((sum, review) => sum + review.rating, 0) / totalRatings;

        await Book.findByIdAndUpdate(review.book, {
            averageRating,
            totalRatings
        });

        // Populate review details
        const updatedReview = await Review.findById(review._id)
            .populate('book', 'title')
            .populate('user', 'email customerInfo.fullName');

        res.status(200).json({
            message: "Update review successfully",
            status: "Success",
            data: updatedReview
        });
    } catch (error) {
        res.status(500).json({
            message: error.message,
            status: "Error"
        });
    }
};

// Delete review
const deleteReview = async (req, res) => {
    try {
        const { reviewId } = req.params;

        const review = await Review.findById(reviewId);

        if (!review) {
            return res.status(404).json({
                message: "Review not found",
                status: "Error"
            });
        }

        // Check ownership
        if (review.user.toString() !== req.account._id && req.account.role !== "admin") {
            return res.status(403).json({
                message: "You are not authorized to delete this review",
                status: "Error"
            });
        }

        await review.deleteOne();

        // Update book's average rating
        const reviews = await Review.find({
            book: review.book,
            isApproved: true
        });

        const totalRatings = reviews.length;
        const averageRating = reviews.length > 0
            ? reviews.reduce((sum, review) => sum + review.rating, 0) / totalRatings
            : 0;

        await Book.findByIdAndUpdate(review.book, {
            averageRating,
            totalRatings
        });

        res.status(200).json({
            message: "Delete review successfully",
            status: "Success"
        });
    } catch (error) {
        res.status(500).json({
            message: error.message,
            status: "Error"
        });
    }
};

// Approve review (admin only)
const approveReview = async (req, res) => {
    try {
        const { reviewId } = req.params;

        const review = await Review.findById(reviewId);

        if (!review) {
            return res.status(404).json({
                message: "Review not found",
                status: "Error"
            });
        }

        review.isApproved = true;
        await review.save();

        // Update book's average rating
        const reviews = await Review.find({
            book: review.book,
            isApproved: true
        });

        const totalRatings = reviews.length;
        const averageRating = reviews.reduce((sum, review) => sum + review.rating, 0) / totalRatings;

        await Book.findByIdAndUpdate(review.book, {
            averageRating,
            totalRatings
        });

        // Populate review details
        const updatedReview = await Review.findById(review._id)
            .populate('book', 'title')
            .populate('user', 'email customerInfo.fullName');

        res.status(200).json({
            message: "Approve review successfully",
            status: "Success",
            data: updatedReview
        });
    } catch (error) {
        res.status(500).json({
            message: error.message,
            status: "Error"
        });
    }
};

module.exports = {
    createReview,
    getReviewsByBook,
    getUserReviews,
    updateReview,
    deleteReview,
    approveReview
};
