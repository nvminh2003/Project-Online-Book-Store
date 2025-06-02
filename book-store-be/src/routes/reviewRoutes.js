const express = require('express');
const router = express.Router();
const reviewController = require('../controllers/reviewController');
const { checkAuthMiddleware, checkAdminMiddleware } = require('../middleware/authMiddleware');

// All review routes require authentication
router.use(checkAuthMiddleware);

// Public routes (authenticated users)
router.post('/', reviewController.createReview);
router.get('/book/:bookId', reviewController.getReviewsByBook);
router.get('/user', reviewController.getUserReviews);
router.put('/:reviewId', reviewController.updateReview);
router.delete('/:reviewId', reviewController.deleteReview);

// Admin only routes
router.put('/:reviewId/approve', checkAdminMiddleware, reviewController.approveReview);

module.exports = router;
