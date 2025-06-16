const express = require('express');
const router = express.Router();
const accountController = require('../controllers/accountController');
const { checkAuthMiddleware, authorizeRole } = require('../middleware/authMiddleware');
const passport = require('passport');
const Account = require('../models/accountModel');
const A = require('../utils/actionTypes');
const checkPermission = require('../middleware/checkPermission');

// Public routes
router.post('/register', accountController.register);
router.post('/login', accountController.login);
router.post('/refresh-token', accountController.refreshToken);
router.post('/forgot-password', accountController.forgotPassword);
router.post('/reset-password', accountController.resetPassword);

// Protected routes
router.post('/logout', checkAuthMiddleware, accountController.logout);
router.put('/profile', checkAuthMiddleware, accountController.updateProfile);
router.put('/change-password', checkAuthMiddleware, accountController.changePassword);
router.get('/profile', checkAuthMiddleware, accountController.profile);

// SuperAdmin routes - Quản lý người dùng
router.get('/', authorizeRole(['superadmin']), accountController.getAllAccounts);
// Add checkPermission for account management routes
router.post('/admin/create', checkAuthMiddleware, authorizeRole(['superadmin']), checkPermission(A.CREATE_USER), accountController.createAccountByAdmin);
router.put('/:id', checkAuthMiddleware, authorizeRole(['superadmin']), checkPermission(A.UPDATE_USER), accountController.updateUser);
router.delete('/:id', checkAuthMiddleware, authorizeRole(['superadmin']), checkPermission(A.DELETE_USER), accountController.deleteUser);

// Google OAuth routes
router.get('/google', passport.authenticate('google', { scope: ['profile', 'email'] }));

// Handle Google authentication
router.get('/google/callback',
    (req, res, next) => {
        passport.authenticate('google', { session: false }, (err, user, info) => {
            if (err) {
                return res.redirect(`http://localhost:3000/auth/login?error=${encodeURIComponent(err.message)}`);
            }
            if (!user) {
                return res.redirect(`http://localhost:3000/auth/login?error=${encodeURIComponent(info?.message || 'Đăng nhập thất bại')}`);
            }
            if (!user.isActive) {
                return res.redirect(`http://localhost:3000/auth/login?error=${encodeURIComponent('Tài khoản của bạn đã bị khóa')}`);
            }
            req.user = user;
            next();
        })(req, res, next);
    },
    async (req, res) => {
        try {
            const user = req.user;
            const jwt = require('jsonwebtoken');
            const accessToken = jwt.sign({ id: user._id, role: user.role }, process.env.ACCESS_TOKEN, { expiresIn: '1h' });
            const refreshToken = jwt.sign({ id: user._id }, process.env.REFRESH_TOKEN, { expiresIn: '7d' });
            user.refreshToken = refreshToken;
            await user.save();
            res.redirect(`http://localhost:3000/auth/google/success?accessToken=${accessToken}&refreshToken=${refreshToken}`);
        } catch (error) {
            res.redirect(`http://localhost:3000/auth/login?error=${encodeURIComponent('Có lỗi xảy ra khi đăng nhập')}`);
        }
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
            info: user.info,
            isActive: user.isActive
        }
    });
});

module.exports = router;