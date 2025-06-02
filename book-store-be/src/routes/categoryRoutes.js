const express = require('express');
const router = express.Router();
const categoryController = require('../controllers/categoryController');
const { checkAdminMiddleware } = require('../middleware/authMiddleware');

// Public routes
router.get('/', categoryController.getAllCategories);
router.get('/:id', categoryController.getCategoryById);

// Admin only routes
router.post('/', checkAdminMiddleware, categoryController.createCategory);
router.put('/:id', checkAdminMiddleware, categoryController.updateCategory);
router.delete('/:id', checkAdminMiddleware, categoryController.deleteCategory);

module.exports = router; 