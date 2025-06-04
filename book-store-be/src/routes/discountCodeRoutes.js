const express = require('express');
const router = express.Router();
const discountCodeController = require('../controllers/discountCodeController');
const { authorizeRole } = require('../middleware/authMiddleware');

// Public routes
router.get('/', discountCodeController.getAllDiscountCodes);
router.get('/:id', discountCodeController.getDiscountCodeById);
router.post('/validate', discountCodeController.validateDiscountCode);

// Admin only routes
router.post('/', authorizeRole(['superadmin', 'admin'], ['business']), discountCodeController.createDiscountCode);
router.put('/:id', authorizeRole(['superadmin', 'admin'], ['business']), discountCodeController.updateDiscountCode);
router.delete('/:id', authorizeRole(['superadmin', 'admin'], ['business']), discountCodeController.deleteDiscountCode);

module.exports = router;
