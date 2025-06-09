const express = require('express');
const router = express.Router();
const blogController = require('../controllers/blogController');
const { authorizeRole } = require('../middleware/authMiddleware');

// Public routes
router.get('/', blogController.getAllBlogs);
router.get('/:id', blogController.getBlogById);

// Admin only routes
router.post('/', authorizeRole(['superadmin', 'admin'], ['dev']), blogController.createBlog);
router.put('/:id', authorizeRole(['superadmin', 'admin'], ['dev']), blogController.updateBlog);
router.delete('/:id', authorizeRole(['superadmin', 'admin'], ['dev']), blogController.deleteBlog);

module.exports = router;
