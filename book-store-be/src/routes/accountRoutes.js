const express = require('express');
const router = express.Router();
const accountController = require('../controllers/accountController');
const { checkAuthMiddleware, authorizeRole } = require('../middleware/authMiddleware');
const passport = require('passport');
const Account = require('../models/accountModel');

// Public routes
router.post('/register', accountController.register);
router.post('/login', accountController.login);
router.post('/refresh-token', accountController.refreshToken);
router.post('/forgot-password', accountController.forgotPassword);
router.post('/reset-password', accountController.resetPassword);

// Protected routes
router.post('/logout', checkAuthMiddleware, accountController.logout);

//Update profile
router.put('/profile', checkAuthMiddleware, accountController.updateProfile);

//Change password
router.put('/change-password', checkAuthMiddleware, accountController.changePassword);

//Get all accounts
router.get('/', authorizeRole(['superadmin']), accountController.getAllAccounts);


// Thêm vào accountRoutes.js
router.get('/google', passport.authenticate('google', { scope: ['profile', 'email'] }));
// Google OAuth routes
router.get('/google/callback',
    passport.authenticate('google', { session: false, failureRedirect: 'http://localhost:3000/auth/login' }),
    async (req, res) => {
        const user = req.user;
        // Tạo accessToken, refreshToken như login thường
        const jwt = require('jsonwebtoken');
        const accessToken = jwt.sign({ id: user._id, role: user.role }, process.env.ACCESS_TOKEN, { expiresIn: '1h' });
        const refreshToken = jwt.sign({ id: user._id }, process.env.REFRESH_TOKEN, { expiresIn: '7d' });
        user.refreshToken = refreshToken;
        await user.save();
        // Redirect về FE kèm token trên URL
        res.redirect(`http://localhost:3000/auth/google/success?accessToken=${accessToken}&refreshToken=${refreshToken}`);
    }
);

router.get('/me', checkAuthMiddleware, async (req, res) => {
    const user = await Account.findById(req.account._id);
    if (!user) return res.status(404).json({ status: 'Error', message: 'User not found' });
    res.json({
        status: 'Success',
        data: {
            id: user._id,
            email: user.email,
            role: user.role,
            customerInfo: user.customerInfo,
            adminInfo: user.adminInfo
        }
    });
});

// Lấy profile tài khoản hiện tại
router.get('/profile', checkAuthMiddleware, accountController.profile);

module.exports = router; 