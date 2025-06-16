const express = require('express');
const router = express.Router();
const categoryController = require('../controllers/categoryController');
const { authorizeRole } = require('../middleware/authMiddleware');

// Public routes
router.get('/', categoryController.getAllCategories);
router.get('/:id', categoryController.getCategoryById);

// Admin only routes
router.post('/', authorizeRole(['superadmin', 'admindev'], ['dev']), categoryController.createCategory);
router.put('/:id', authorizeRole(['superadmin', 'admindev'], ['dev']), categoryController.updateCategory);
router.delete('/:id', authorizeRole(['superadmin', 'admindev'], ['dev']), categoryController.deleteCategory);

module.exports = router; 