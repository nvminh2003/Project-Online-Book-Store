const jwt = require("jsonwebtoken");
const dotenv = require("dotenv");
const Account = require("../models/accountModel");
dotenv.config();

const checkAdminMiddleware = async (req, res, next) => {
    try {
        let token = req.headers.token?.split(" ")[1] || req.headers.authorization?.split(" ")[1];

        if (!token) {
            return res.status(401).json({
                message: "Access denied. No token provided.",
                status: "Error",
            });
        }

        const decoded = jwt.verify(token, process.env.ACCESS_TOKEN);
        const user = await Account.findById(decoded.id).select('-password');

        if (!user) {
            return res.status(401).json({
                message: "User not found",
                status: "Error",
            });
        }

        // Check if user is admin or superadmin
        if (user.role !== "admin" && user.role !== "superadmin") {
            return res.status(403).json({
                message: "Access denied. Admin privileges required.",
                status: "Error",
            });
        }

        req.account = user;
        next();
    } catch (error) {
        return res.status(401).json({
            message: "Invalid token",
            status: "Error",
        });
    }
};

const checkSuperAdminMiddleware = async (req, res, next) => {
    try {
        let token = req.headers.token?.split(" ")[1] || req.headers.authorization?.split(" ")[1];

        if (!token) {
            return res.status(401).json({
                message: "Access denied. No token provided.",
                status: "Error",
            });
        }

        const decoded = jwt.verify(token, process.env.ACCESS_TOKEN);
        const user = await Account.findById(decoded.id).select('-password');

        if (!user) {
            return res.status(401).json({
                message: "User not found",
                status: "Error",
            });
        }

        // Check if user is superadmin
        if (user.role !== "superadmin") {
            return res.status(403).json({
                message: "Access denied. Super Admin privileges required.",
                status: "Error",
            });
        }

        req.account = user;
        next();
    } catch (error) {
        return res.status(401).json({
            message: "Invalid token",
            status: "Error",
        });
    }
};

const checkAuthMiddleware = async (req, res, next) => {
    try {
        let token = req.headers.token?.split(" ")[1] || req.headers.authorization?.split(" ")[1];

        if (!token) {
            return res.status(401).json({
                message: "Access denied. No token provided.",
                status: "Error",
            });
        }

        const decoded = jwt.verify(token, process.env.ACCESS_TOKEN);
        const user = await Account.findById(decoded.id).select('-password');

        if (!user) {
            return res.status(401).json({
                message: "User not found",
                status: "Error",
            });
        }

        // Check if account is active
        if (!user.isActive) {
            return res.status(401).json({
                message: "Account is deactivated",
                status: "Error",
            });
        }

        req.account = user;
        next();
    } catch (error) {
        return res.status(401).json({
            message: "Invalid token",
            status: "Error",
        });
    }
};

module.exports = {
    checkAdminMiddleware,     // for admin and superadmin routes
    checkSuperAdminMiddleware, // for superadmin-only routes
    checkAuthMiddleware,      // for any authenticated user
};