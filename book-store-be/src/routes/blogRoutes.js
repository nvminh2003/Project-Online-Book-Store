const express = require('express');
const router = express.Router();
const blogController = require('../controllers/blogController');
const { checkAdminMiddleware } = require('../middleware/authMiddleware');

// Public routes
router.get('/', blogController.getAllBlogs);
router.get('/:id', blogController.getBlogById);

// Admin only routes
router.post('/', checkAdminMiddleware, blogController.createBlog);
router.put('/:id', checkAdminMiddleware, blogController.updateBlog);
router.delete('/:id', checkAdminMiddleware, blogController.deleteBlog);

module.exports = router;
