const express = require('express');
const router = express.Router();
const reviewController = require('../controllers/reviewController');
const {checkAuthMiddleware, authorizeRole} = require('../middleware/authMiddleware');

// All review routes require authentication
router.use(checkAuthMiddleware);

router.post("/", reviewController.addReview);
router.put("/:id", reviewController.updateReview);
router.get("/book/:bookId", reviewController.getReviewsByBook);
router.put("/:id/report", reviewController.reportReview);
router.delete("/:id", reviewController.deleteReview);


// Admin only routes
router.get("/all", authorizeRole(['superadmin', 'admin'], ['business']), reviewController.getAllReviews);
router.put("/:id/visibility", authorizeRole(['superadmin', 'admin'], ['business']), reviewController.setReviewVisibility);
module.exports = router;
