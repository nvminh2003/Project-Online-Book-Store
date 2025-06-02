const express = require('express');
const router = express.Router();
const bookController = require('../controllers/bookController');
const { checkAdminMiddleware } = require('../middleware/authMiddleware');

// Public routes
router.get('/', bookController.getAllBooks);
router.get('/search', bookController.searchBooks);
router.get('/:id', bookController.getBookById);

// Admin only routes
router.post('/', checkAdminMiddleware, bookController.createBook);
router.put('/:id', checkAdminMiddleware, bookController.updateBook);
router.delete('/:id', checkAdminMiddleware, bookController.deleteBook);

module.exports = router; 