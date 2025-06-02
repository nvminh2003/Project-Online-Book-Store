const express = require('express');
const router = express.Router();
const adminController = require('../controllers/adminController');

// Create a new admin
router.post('/', adminController.createAdmin);

// Get all admins with pagination
router.get('/', adminController.getAllAdmins);

// Search admins
router.get('/search', adminController.searchAdmins);

// Get admin by ID
router.get('/:id', adminController.getAdminById);

// Get admin by account ID
router.get('/account/:accountId', adminController.getAdminByAccountId);

// Update admin
router.put('/:id', adminController.updateAdmin);

// Delete admin
router.delete('/:id', adminController.deleteAdmin);

module.exports = router; 