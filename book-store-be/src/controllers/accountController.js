const Account = require("../models/accountModel");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");
const getPermissions = require("../utils/getPermissions");

// Register new account
const register = async (req, res) => {
    try {
        const { email, password, role, customerInfo, adminInfo } = req.body;

        const existingAccount = await Account.findOne({ email });
        if (existingAccount) {
            return res.status(400).json({
                message: "Email already exists",
                status: "Error"
            });
        }

        // Xử lý thông tin tài khoản theo vai trò
        let finalAdminInfo = undefined;

        if (role === "superadmin") {
            const permissions = getPermissions(role); // không cần department
            finalAdminInfo = {
                fullName: adminInfo?.fullName,
                permissions
            };
        } else if (role === "admin") {
            const department = adminInfo?.department;
            const permissions = getPermissions(role, department);
            finalAdminInfo = {
                ...adminInfo,
                permissions
            };
        }

        // Khởi tạo tài khoản (chưa có token)
        const newAccount = new Account({
            email,
            password,
            role,
            customerInfo: role === "customer" ? customerInfo : undefined,
            adminInfo: finalAdminInfo
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
                    adminInfo: {
                        ...newAccount.adminInfo,
                        permissions: newAccount.adminInfo?.permissions || getPermissions(role, adminInfo?.department)
                    }
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

// Lấy profile tài khoản hiện tại
const profile = async (req, res) => {
    try {
        // console.log('🔍 req.account:', req.account);
        const user = await Account.findById(req.account._id);
        if (!user) return res.status(404).json({ status: 'Error', message: 'User not found' });
        res.json({
            status: 'Success',
            data: {
                id: user._id,
                email: user.email,
                role: user.role,
                customerInfo: user.customerInfo,
                adminInfo: user.adminInfo,
                isActive: user.isActive,
                createdAt: user.createdAt,
                updatedAt: user.updatedAt
            }
        });
    } catch (error) {
        res.status(500).json({ status: 'Error', message: error.message });
    }
};

// Update profile
// Cập nhật profile tài khoản hiện tại
const updateProfile = async (req, res) => {
    try {
        const user = await Account.findById(req.account._id);
        if (!user) return res.status(404).json({ status: 'Error', message: 'User not found' });

        // Cập nhật thông tin cơ bản
        // if (user.role === 'customer' && req.body.customerInfo) {
        //     user.customerInfo = { ...user.customerInfo, ...req.body.customerInfo };
        // }
        // 📌 Validate dành cho customer
        if (user.role === 'customer' && req.body.customerInfo) {
            const { phone, birthday } = req.body.customerInfo;

            // ✅ Kiểm tra số điện thoại: đúng 10 chữ số
            if (phone && !/^\d{10}$/.test(phone)) {
                return res.status(400).json({
                    status: 'Error',
                    message: 'Số điện thoại phải có đúng 10 chữ số.'
                });
            }

            // ✅ Kiểm tra tuổi ≥ 16
            if (birthday) {
                const birthDate = new Date(birthday);
                const today = new Date();
                const age = today.getFullYear() - birthDate.getFullYear();
                const m = today.getMonth() - birthDate.getMonth();
                const isUnder16 = age < 16 || (age === 16 && m < 0);

                if (isUnder16) {
                    return res.status(400).json({
                        status: 'Error',
                        message: 'Bạn phải đủ 16 tuổi để sử dụng dịch vụ.'
                    });
                }
            }

            // Cập nhật thông tin customer
            user.customerInfo = { ...user.customerInfo, ...req.body.customerInfo };
        }

        if ((user.role === 'admin' || user.role === 'superadmin') && req.body.adminInfo) {
            user.adminInfo = { ...user.adminInfo, ...req.body.adminInfo };
        }

        // Cập nhật các trường khác nếu cần
        await user.save();

        res.json({
            status: 'Success',
            message: 'Cập nhật profile thành công',
            data: {
                id: user._id,
                email: user.email,
                role: user.role,
                customerInfo: user.customerInfo,
                adminInfo: user.adminInfo,
                isActive: user.isActive,
                createdAt: user.createdAt,
                updatedAt: user.updatedAt
            }
        });
    } catch (error) {
        res.status(500).json({ status: 'Error', message: error.message });
    }
};

//Change password
const changePassword = async (req, res) => {
    try {
        const { oldPassword, newPassword } = req.body;
        const user = await Account.findById(req.account._id);
        if (!user) return res.status(404).json({ status: 'Error', message: 'User not found' });

        // Nếu tài khoản Google thì không cho đổi mật khẩu
        if (!user.password) {
            return res.status(400).json({ status: 'Error', message: 'Tài khoản Google không thể đổi mật khẩu' });
        }

        const isMatch = await user.comparePassword(oldPassword);
        if (!isMatch) {
            return res.status(400).json({ status: 'Error', message: 'Mật khẩu cũ không đúng' });
        }

        user.password = newPassword;
        await user.save();

        res.json({ status: 'Success', message: 'Đổi mật khẩu thành công' });
    } catch (error) {
        res.status(500).json({ status: 'Error', message: error.message });
    }
};

//getAllAccounts
const getAllAccounts = async (req, res) => {
    try {
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 10;
        const skip = (page - 1) * limit;

        const [accounts, total] = await Promise.all([
            Account.find({})
                .skip(skip)
                .limit(limit)
                .select('-password -refreshToken'),
            Account.countDocuments()
        ]);

        res.json({
            status: 'Success',
            data: accounts,
            pagination: {
                page,
                limit,
                total,
                totalPages: Math.ceil(total / limit)
            }
        });
    } catch (error) {
        res.status(500).json({ status: 'Error', message: error.message });
    }
};

module.exports = {
    register,
    login,
    refreshToken,
    logout,
    profile,
    updateProfile,
    changePassword,
    getAllAccounts
};
