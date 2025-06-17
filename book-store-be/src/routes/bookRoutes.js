const express = require('express');
const router = express.Router();
const bookController = require('../controllers/bookController');
const { authorizeRole } = require('../middleware/authMiddleware');

// Public routes
router.get('/', bookController.getAllBooks);
router.get('/search', bookController.searchBooks);
router.get('/:id', bookController.getBookById);

// Admin only routes
router.post('/', authorizeRole(['superadmin', 'admindev'], ['dev']), bookController.createBook);
router.put('/:id', authorizeRole(['superadmin', 'admindev'], ['dev']), bookController.updateBook);
router.delete('/:id', authorizeRole(['superadmin', 'admindev'], ['dev']), bookController.deleteBook);
router.post('/upload-excel', authorizeRole(['superadmin', 'admindev'], ['dev']), bookController.uploadBooksFromExcel);


module.exports = router; 