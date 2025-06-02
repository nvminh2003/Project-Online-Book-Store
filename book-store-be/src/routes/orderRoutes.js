const express = require('express');
const router = express.Router();
const orderController = require('../controllers/orderController');
const { checkAuthMiddleware, checkAdminMiddleware } = require('../middleware/authMiddleware');

// All order routes require authentication
router.use(checkAuthMiddleware);

// Public routes (authenticated users)
router.post('/', orderController.createOrder);
router.get('/', orderController.getAllOrders);
router.get('/:id', orderController.getOrderById);

// Admin only routes
router.put('/:id/status', checkAdminMiddleware, orderController.updateOrderStatus);

module.exports = router;
