const jwt = require("jsonwebtoken");
const dotenv = require("dotenv");
const Account = require("../models/accountModel");
dotenv.config();

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

const authorizeRole = (allowedRoles = [], allowedDepartments = []) => {
    return async (req, res, next) => {
        try {
            let token = req.headers.token?.split(" ")[1] || req.headers.authorization?.split(" ")[1];

            if (!token) {
                return res.status(401).json({ message: "Access denied. No token provided." });
            }

            const decoded = jwt.verify(token, process.env.ACCESS_TOKEN);
            const user = await Account.findById(decoded.id).select('-password');

            if (!user || !user.isActive) {
                return res.status(401).json({ message: "Invalid or inactive account." });
            }

            // Check role
            if (!allowedRoles.includes(user.role)) {
                return res.status(403).json({ message: "Access denied. Role not allowed." });
            }

            // If admin, check department
            if (user.role === "admin" && allowedDepartments.length > 0) {
                const department = user.adminInfo?.department;
                if (!allowedDepartments.includes(department)) {
                    return res.status(403).json({ message: "Access denied. Department not allowed." });
                }
            }

            req.account = user;
            next();
        } catch (err) {
            return res.status(401).json({ message: "Invalid token." });
        }
    };
};

module.exports = {
    checkAuthMiddleware,      // for any authenticated user
    authorizeRole
};