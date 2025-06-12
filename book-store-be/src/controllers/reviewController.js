const Review = require("../models/reviewModel");
const Book = require("../models/bookModel");
const User = require("../models/accountModel");

// ========== USER ==========
exports.addReview = async (req, res) => {
    try {
        const userId = req.account._id;
        const { book, rating, comment } = req.body;

        const existing = await Review.findOne({ user: userId, book });
        if (existing) return res.status(400).json({ message: "You already reviewed this book." });

        const review = new Review({ book, user: userId, rating, comment });
        await review.save();

        res.status(201).json(review);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

exports.updateReview = async (req, res) => {
    try {
        const userId = req.account._id;
        const review = await Review.findById(req.params.id);
        if (!review || !review.user.equals(userId))
            return res.status(403).json({ message: "Not authorized to edit this review" });

        review.rating = req.body.rating ?? review.rating;
        review.comment = req.body.comment ?? review.comment;
        await review.save();

        res.json(review);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

exports.getReviewsByBook = async (req, res) => {
    try {
        const reviews = await Review.find({
            book: req.params.bookId,
            visibility: "visible"
        }).populate("user", "name");

        res.json(reviews);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

exports.reportReview = async (req, res) => {
    try {
        const review = await Review.findById(req.params.id);
        if (!review) return res.status(404).json({ message: "Review not found" });

        review.reported = true;
        await review.save();

        res.json({ message: "Review reported" });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

exports.deleteReview = async (req, res) => {
    try {
        const userId = req.account._id;
        const review = await Review.findById(req.params.id);
        if (!review || !review.user.equals(userId)) {
            return res.status(403).json({ message: "Not authorized to delete this review" });
        }

        await review.deleteOne();
        res.json({ message: "Review deleted successfully" });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

// ========== ADMIN ==========
exports.getAllReviews = async (req, res) => {
    try {
        const reviews = await Review.find()
          .populate("user", "name")
          .populate("book", "title");

        res.json(reviews);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

exports.setReviewVisibility = async (req, res) => {
    try {
        const { visibility } = req.body;
        if (!["visible", "hidden"].includes(visibility)) {
            return res.status(400).json({ message: "Invalid visibility value" });
        }

        const review = await Review.findByIdAndUpdate(
          req.params.id,
          { visibility },
          { new: true }
        );

        if (!review) return res.status(404).json({ message: "Review not found" });

        res.json(review);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};
