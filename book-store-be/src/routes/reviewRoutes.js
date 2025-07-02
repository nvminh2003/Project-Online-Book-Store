const express = require('express');
const router = express.Router();
const reviewController = require('../controllers/reviewController');
const { checkAuthMiddleware, authorizeRole } = require('../middleware/authMiddleware');

// Public routes (no authentication required)
router.get('/book/:bookId', reviewController.getReviewsByBook);

// All review routes below require authentication
router.use(checkAuthMiddleware);

// Customer routes
router.post('/',
    authorizeRole(['customer']),
    reviewController.createReview
);
router.get('/my-reviews',
    authorizeRole(['customer']),
    reviewController.getUserReviews
);
router.put('/:reviewId',
    authorizeRole(['customer']),
    reviewController.updateReview
);
router.delete('/:reviewId',
    authorizeRole(['adminbusiness', 'customer']),
    reviewController.deleteReview
);
router.get('/my-review-by-order-book',
    authorizeRole(['customer']),
    reviewController.getReviewByOrderAndBook
);
router.get('/:reviewId',
    authorizeRole(['customer']),
    reviewController.getReviewById
);

// Admin/Business routes
router.get('/admin/all',
    authorizeRole(['adminbusiness']),
    reviewController.getAllReviews
);
router.put('/:reviewId/visibility',
    authorizeRole(['adminbusiness']),
    reviewController.toggleReviewVisibility
);

module.exports = router;
