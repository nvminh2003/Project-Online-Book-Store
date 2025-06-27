const express = require('express');
const router = express.Router();
const discountCodeController = require('../controllers/discountCodeController');
const { authorizeRole } = require('../middleware/authMiddleware');

router.post('/', discountCodeController.createDiscountCode);  // Tạo discount code
router.get('/', authorizeRole(['adminbusiness']), discountCodeController.getAllDiscountCodes);    // Lấy danh sách discount codes
router.put('/:id', authorizeRole(['adminbusiness']), discountCodeController.updateDiscountCode); // Cập nhật discount code
router.delete('/:id', authorizeRole(['adminbusiness']), discountCodeController.deleteDiscountCode);


module.exports = router;
