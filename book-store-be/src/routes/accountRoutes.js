const express = require('express');
const router = express.Router();
const accountController = require('../controllers/tem');
const { checkAuthMiddleware } = require('../middleware/authMiddleware');


// Public routes
router.post('/register', accountController.register);
router.post('/login', accountController.login);
router.post('/refresh-token', accountController.refreshToken);

// Protected routes
router.post('/logout', checkAuthMiddleware, accountController.logout);

module.exports = router; 