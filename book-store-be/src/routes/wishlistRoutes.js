const express = require('express');
const router = express.Router();
const wishlistController = require('../controllers/wishlistController');
const { checkAuthMiddleware } = require('../middleware/authMiddleware');

// All wishlist routes require authentication
router.use(checkAuthMiddleware);

// Wishlist routes
router.get('/', wishlistController.getWishlist);
router.post('/add', wishlistController.addToWishlist);
router.delete('/remove/:bookId', wishlistController.removeFromWishlist);
router.delete('/clear', wishlistController.clearWishlist);
router.get('/check/:bookId', wishlistController.checkBookInWishlist);
router.post('/move-to-cart', wishlistController.moveToCart);
router.post('/move-multiple-to-cart', wishlistController.moveMultipleToCart);
router.delete('/remove-multiple', wishlistController.removeMultipleFromWishlist);

module.exports = router;
