const express = require('express');
const router = express.Router();
const bookController = require('../controllers/bookController');
const { authorizeRole } = require('../middleware/authMiddleware');

// Public routes
router.get('/', bookController.getAllBooks);
router.get('/search', bookController.searchBooks);
router.get('/:id', bookController.getBookById);

// Admin only routes
router.post('/', bookController.createBook);
router.put('/:id', authorizeRole(['superadmin', 'admin'], ['dev']), bookController.updateBook);
router.delete('/:id', authorizeRole(['superadmin', 'admin'], ['dev']), bookController.deleteBook);

module.exports = router; 