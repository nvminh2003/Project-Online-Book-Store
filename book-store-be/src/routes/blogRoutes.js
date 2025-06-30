const express = require('express');
const router = express.Router();
const blogController = require('../controllers/blogController');
const { checkAuthMiddleware, authorizeRole } = require('../middleware/authMiddleware');
const checkPermission = require('../middleware/checkPermission');
const A = require('../utils/actionTypes');

// Public routes
router.get('/date-range',
    checkAuthMiddleware,
    authorizeRole(['admindev']),
    blogController.getBlogsByDateRange
);

router.get('/search', blogController.searchBlogs);
router.get('/', blogController.getAllBlogs);
router.get('/:id', blogController.getBlogById);

// Admin only routes
router.post('/',
    checkAuthMiddleware,
    authorizeRole(['admindev']),
    checkPermission(A.CREATE_BLOG),
    blogController.createBlog
);

router.put('/:id',
    checkAuthMiddleware,
    authorizeRole(['admindev']),
    checkPermission(A.UPDATE_BLOG),
    blogController.updateBlog
);

router.delete('/:id',
    checkAuthMiddleware,
    authorizeRole(['admindev']),
    checkPermission(A.DELETE_BLOG),
    blogController.deleteBlog
);

module.exports = router;