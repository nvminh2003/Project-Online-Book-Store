const express = require('express');
const router = express.Router();
const discountCodeController = require('../controllers/discountCodeController');
const { checkAdminMiddleware } = require('../middleware/authMiddleware');

// Public routes
router.get('/', discountCodeController.getAllDiscountCodes);
router.get('/:id', discountCodeController.getDiscountCodeById);
router.post('/validate', discountCodeController.validateDiscountCode);

// Admin only routes
router.post('/', checkAdminMiddleware, discountCodeController.createDiscountCode);
router.put('/:id', checkAdminMiddleware, discountCodeController.updateDiscountCode);
router.delete('/:id', checkAdminMiddleware, discountCodeController.deleteDiscountCode);

module.exports = router;
