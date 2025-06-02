const Account = require("../models/accountModel");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");

// Register new account
// const register = async (req, res) => {
//     try {
//         const { email, password, role, customerInfo, adminInfo } = req.body;

//         if (!email || !password) {
//             return res.status(400).json({
//                 message: "Email và mật khẩu là bắt buộc",
//                 status: "Error"
//             });
//         }
//         console.log("Request body:", req.body);


//         // Check if email already exists
//         const existingAccount = await Account.findOne({ email });
//         if (existingAccount) {
//             return res.status(400).json({
//                 message: "Email already exists",
//                 status: "Error"
//             });
//         }

//         // Generate tokens
//         const accessToken = jwt.sign(
//             { id: newAccount._id, role: newAccount.role },
//             process.env.ACCESS_TOKEN,
//             { expiresIn: "1h" }
//         );

//         const refreshToken = jwt.sign(
//             { id: newAccount._id },
//             process.env.REFRESH_TOKEN,
//             { expiresIn: "7d" }
//         );

//         // Create new account
//         const newAccount = new Account({
//             email,
//             password,
//             role,
//             customerInfo: role === "customer" ? customerInfo : undefined,
//             adminInfo: (role === "admin" || role === "superadmin") ? adminInfo : undefined
//         });

//         console.log("Saving account:", newAccount);

//         await newAccount.save();

//         // Save refresh token to account
//         newAccount.refreshToken = refreshToken;
//         await newAccount.save();

//         res.status(201).json({
//             message: "Registration successful",
//             status: "Success",
//             data: {
//                 accessToken,
//                 refreshToken,
//                 account: {
//                     id: newAccount._id,
//                     email: newAccount.email,
//                     role: newAccount.role,
//                     customerInfo: newAccount.customerInfo,
//                     adminInfo: newAccount.adminInfo
//                 }
//             }
//         });
//     } catch (error) {
//         res.status(500).json({
//             message: error.message,
//             status: "Error"
//         });
//     }
// };
const register = async (req, res) => {
    try {
        const { email, password, role, customerInfo, adminInfo } = req.body;

        if (!email || !password) {
            return res.status(400).json({
                message: "Email và mật khẩu là bắt buộc",
                status: "Error"
            });
        }

        const existingAccount = await Account.findOne({ email });
        if (existingAccount) {
            return res.status(400).json({
                message: "Email already exists",
                status: "Error"
            });
        }

        // Khởi tạo tài khoản (chưa có token)
        const newAccount = new Account({
            email,
            password,
            role,
            customerInfo: role === "customer" ? customerInfo : undefined,
            adminInfo: (role === "admin" || role === "superadmin") ? adminInfo : undefined
        });

        // Tạo token sau khi đã có _id
        const accessToken = jwt.sign(
            { id: newAccount._id, role: newAccount.role },
            process.env.ACCESS_TOKEN,
            { expiresIn: "24h" } //234567890
        );

        const refreshToken = jwt.sign(
            { id: newAccount._id },
            process.env.REFRESH_TOKEN,
            { expiresIn: "7d" }
        );

        // Gán refreshToken trước khi save
        newAccount.refreshToken = refreshToken;

        // Lưu tài khoản vào DB
        await newAccount.save();

        res.status(201).json({
            message: "Registration successful",
            status: "Success",
            data: {
                accessToken,
                refreshToken,
                account: {
                    id: newAccount._id,
                    email: newAccount.email,
                    role: newAccount.role,
                    customerInfo: newAccount.customerInfo,
                    adminInfo: newAccount.adminInfo
                }
            }
        });
    } catch (error) {
        console.error("Registration error:", error);
        res.status(500).json({
            message: error.message,
            status: "Error"
        });
    }
};

// Login
const login = async (req, res) => {
    try {
        const { email, password } = req.body;

        // Find account by email
        const account = await Account.findOne({ email });
        if (!account) {
            return res.status(401).json({
                message: "Invalid email or password",
                status: "Error"
            });
        }

        // Check if account is active
        if (!account.isActive) {
            return res.status(401).json({
                message: "Account is deactivated",
                status: "Error"
            });
        }

        // Verify password
        const isValidPassword = await account.comparePassword(password);
        if (!isValidPassword) {
            return res.status(401).json({
                message: "Invalid email or password",
                status: "Error"
            });
        }

        // Generate tokens
        const accessToken = jwt.sign(
            { id: account._id, role: account.role },
            process.env.ACCESS_TOKEN,
            { expiresIn: "1h" }
        );

        const refreshToken = jwt.sign(
            { id: account._id },
            process.env.REFRESH_TOKEN,
            { expiresIn: "7d" }
        );

        // Save refresh token to account
        account.refreshToken = refreshToken;
        await account.save();

        res.status(200).json({
            message: "Login successful",
            status: "Success",
            data: {
                accessToken,
                refreshToken,
                account: {
                    id: account._id,
                    email: account.email,
                    role: account.role,
                    customerInfo: account.customerInfo,
                    adminInfo: account.adminInfo
                }
            }
        });
    } catch (error) {
        res.status(500).json({
            message: error.message,
            status: "Error"
        });
    }
};

// Refresh token
const refreshToken = async (req, res) => {
    try {
        const { refreshToken } = req.body;

        if (!refreshToken) {
            return res.status(401).json({
                message: "Refresh token is required",
                status: "Error"
            });
        }

        // Verify refresh token
        const decoded = jwt.verify(refreshToken, process.env.REFRESH_TOKEN);
        const account = await Account.findById(decoded.id);

        if (!account || account.refreshToken !== refreshToken) {
            return res.status(401).json({
                message: "Invalid refresh token",
                status: "Error"
            });
        }

        // Generate new access token
        const accessToken = jwt.sign(
            { id: account._id, role: account.role },
            process.env.ACCESS_TOKEN,
            { expiresIn: "1h" }
        );

        res.status(200).json({
            message: "Token refreshed successfully",
            status: "Success",
            data: {
                accessToken
            }
        });
    } catch (error) {
        res.status(401).json({
            message: "Invalid refresh token",
            status: "Error"
        });
    }
};

// Logout
const logout = async (req, res) => {
    try {
        const account = await Account.findById(req.account._id);
        if (account) {
            account.refreshToken = null;
            await account.save();
        }

        res.status(200).json({
            message: "Logout successful",
            status: "Success"
        });
    } catch (error) {
        res.status(500).json({
            message: error.message,
            status: "Error"
        });
    }
};

module.exports = {
    register,
    login,
    refreshToken,
    logout
};
