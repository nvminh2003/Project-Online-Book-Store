const express = require('express');
const router = express.Router();
const cartController = require('../controllers/cartController');
const { checkAuthMiddleware } = require('../middleware/authMiddleware');

// All cart routes require authentication
router.use(checkAuthMiddleware);

// Cart routes
router.get('/', cartController.getCart);
router.post('/add', cartController.addToCart);
router.put('/items/:bookId', cartController.updateCartItem);
router.delete('/items/:bookId', cartController.removeFromCart);
router.delete('/clear', cartController.clearCart);

module.exports = router;
