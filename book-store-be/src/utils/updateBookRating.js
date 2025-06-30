// helpers/updateBookRating.js

const Review = require('../models/reviewModel');
const Book = require('../models/bookModel');

const updateBookRating = async (bookId) => {
    const reviews = await Review.find({ book: bookId, isHidden: false });
    const totalRatings = reviews.length;
    const averageRating = totalRatings > 0
        ? reviews.reduce((sum, r) => sum + r.rating, 0) / totalRatings
        : 0;

    await Book.findByIdAndUpdate(bookId, {
        averageRating,
        totalRatings
    });
};

module.exports = updateBookRating;
