const express = require('express');
const router = express.Router();
const categoryController = require('../controllers/categoryController');
const { authorizeRole, checkAuthMiddleware } = require('../middleware/authMiddleware');
const A = require('../utils/actionTypes');
const checkPermission = require('../middleware/checkPermission');

// Public routes
router.get('/', categoryController.getAllCategories);
router.get('/:id', categoryController.getCategoryById);

// Admin only routes
router.post(
    "/", checkAuthMiddleware,
    authorizeRole(["admindev"]), checkPermission(A.CREATE_CATEGORY),
    categoryController.createCategory
);
router.put(
    "/:id", checkAuthMiddleware,
    authorizeRole(["admindev"]), checkPermission(A.UPDATE_CATEGORY),
    categoryController.updateCategory
);
router.delete(
    "/:id", checkAuthMiddleware,
    authorizeRole(["admindev"]), checkPermission(A.DELETE_CATEGORY),
    categoryController.deleteCategory
);

module.exports = router; 