const express = require('express');
const router = express.Router();
const bookController = require('../controllers/bookController');

// Create a new book
router.post('/', bookController.createBook);

// Get all books with pagination
router.get('/', bookController.getAllBooks);

// Search books
router.get('/search', bookController.searchBooks);

// Get book by ID
router.get('/:id', bookController.getBookById);

// Update book
router.put('/:id', bookController.updateBook);

// Delete book
router.delete('/:id', bookController.deleteBook);

module.exports = router; 