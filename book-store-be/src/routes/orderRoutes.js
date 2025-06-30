const express = require('express');
const router = express.Router();
const orderController = require('../controllers/orderController');
const { checkAuthMiddleware } = require('../middleware/authMiddleware');

// All order routes require authentication
router.use(checkAuthMiddleware);

// Public routes (authenticated users)
router.post('/', orderController.createOrder);
router.get('/', orderController.getAllOrders);
router.get('/:id', orderController.getOrderById);

// Admin only routes
router.put('/:id/status', orderController.updateOrderStatus);

module.exports = router;
