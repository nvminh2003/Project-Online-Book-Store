const Account = require("../models/accountModel");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");
const getPermissions = require("../utils/getPermissions");
const { sendResetPasswordEmail } = require("../utils/emailService");
const crypto = require('crypto');
const AdminActivityLog = require('../models/AdminActivityLog');

// Register new account
const register = async (req, res) => {
    try {
        const { email, password } = req.body;

        // Validate required fields
        if (!email || !password) {
            return res.status(400).json({
                message: "Email và mật khẩu là bắt buộc",
                status: "Error"
            });
        }

        const existingAccount = await Account.findOne({ email });
        if (existingAccount) {
            return res.status(400).json({
                message: "Email đã tồn tại",
                status: "Error"
            });
        }

        // Khởi tạo tài khoản với role mặc định là customer
        const newAccount = new Account({
            email,
            password,
            role: 'customer', // Mặc định là customer
            isActive: true
        });

        // Tạo token sau khi đã có _id
        const accessToken = jwt.sign(
            { id: newAccount._id, role: newAccount.role },
            process.env.ACCESS_TOKEN,
            { expiresIn: "24h" }
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
            message: "Đăng ký thành công",
            status: "Success",
            data: {
                accessToken,
                refreshToken,
                account: {
                    id: newAccount._id,
                    email: newAccount.email,
                    role: newAccount.role,
                    isActive: newAccount.isActive,
                    info: newAccount.info
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
                message: "Email hoặc mật khẩu không hợp lệ",
                status: "Error"
            });
        }

        // Check if account is active
        if (!account.isActive) {
            return res.status(401).json({
                message: "Tài khoản của bạn đã bị vô hiệu hóa",
                status: "Error"
            });
        }

        // Verify password
        const isValidPassword = await account.comparePassword(password);
        if (!isValidPassword) {
            return res.status(401).json({
                message: "Email hoặc mật khẩu không hợp lệ",
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
                    isActive: account.isActive,
                    info: account.info
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
        const user = await Account.findById(req.account._id);
        if (!user) return res.status(404).json({ status: 'Error', message: 'User not found' });
        res.json({
            status: 'Success',
            data: {
                id: user._id,
                email: user.email,
                role: user.role,
                isActive: user.isActive,
                createdAt: user.createdAt,
                updatedAt: user.updatedAt,
                info: user.info
            }
        });
    } catch (error) {
        res.status(500).json({ status: 'Error', message: error.message });
    }
};

// Cập nhật profile tài khoản hiện tại
const updateProfile = async (req, res) => {
    try {
        const { info } = req.body; // Lấy info trực tiếp từ req.body
        const user = await Account.findById(req.account._id);
        if (!user) return res.status(404).json({ status: 'Error', message: 'User not found' });

        // Cập nhật thông tin cơ bản trong đối tượng 'info'
        if (info) {
            user.info = { ...user.info, ...info };
        }

        // Cập nhật các trường khác nếu cần (ví dụ: email nếu được phép)
        // Lưu ý: email có thể được cập nhật ở đây nếu nó không phải là unique key,
        // hoặc cần kiểm tra uniqueness trước khi lưu.

        await user.save();

        res.json({
            status: 'Success',
            message: 'Cập nhật profile thành công',
            data: {
                id: user._id,
                email: user.email,
                role: user.role,
                isActive: user.isActive,
                createdAt: user.createdAt,
                updatedAt: user.updatedAt,
                info: user.info
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

// Get all accounts with filters and search
const getAllAccounts = async (req, res) => {
    try {
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 10;
        const skip = (page - 1) * limit;

        const { searchTerm, role, isActive } = req.query; // Lấy các tham số filter từ query

        const query = {};

        // Thêm search term nếu có
        if (searchTerm) {
            const regex = new RegExp(searchTerm, 'i'); // 'i' for case-insensitive
            query.$or = [
                { email: regex },
                { 'info.fullName': regex },
                { 'info.phone': regex },
                { 'info.address': regex }
            ];
        }

        // Thêm filter theo vai trò nếu có
        if (role) {
            query.role = role;
        }

        // Thêm filter theo trạng thái nếu có
        if (isActive !== undefined) {
            query.isActive = isActive === 'true'; // Chuyển đổi chuỗi 'true'/'false' thành boolean
        }

        const [accounts, total] = await Promise.all([
            Account.find(query)
                .skip(skip)
                .limit(limit)
                .select('-password -refreshToken'),
            Account.countDocuments(query)
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
        console.error("Error in getAllAccounts:", error);
        res.status(500).json({ status: 'Error', message: error.message || 'Internal server error' });
    }
};

// Forgot password
const forgotPassword = async (req, res) => {
    try {
        const { email } = req.body;
        const account = await Account.findOne({ email });

        if (!account) {
            return res.status(404).json({
                status: 'Error',
                message: 'Không tìm thấy tài khoản với email này'
            });
        }

        // Generate reset token
        const resetToken = crypto.randomBytes(32).toString('hex');
        const resetTokenExpires = new Date(Date.now() + 3600000); // 1 hour

        // Save reset token to account
        account.resetToken = resetToken;
        account.resetTokenExpires = resetTokenExpires;
        await account.save();

        // Send reset password email
        const emailSent = await sendResetPasswordEmail(email, resetToken);

        if (!emailSent) {
            return res.status(500).json({
                status: 'Error',
                message: 'Không thể gửi email đặt lại mật khẩu'
            });
        }

        res.json({
            status: 'Success',
            message: 'Hướng dẫn đặt lại mật khẩu đã được gửi đến email của bạn'
        });
    } catch (error) {
        res.status(500).json({
            status: 'Error',
            message: error.message
        });
    }
};

// Reset password
const resetPassword = async (req, res) => {
    try {
        const { token, newPassword } = req.body;

        const account = await Account.findOne({
            resetToken: token,
            resetTokenExpires: { $gt: Date.now() }
        });

        if (!account) {
            return res.status(400).json({
                status: 'Error',
                message: 'Token không hợp lệ hoặc đã hết hạn'
            });
        }

        // Update password
        account.password = newPassword;
        account.resetToken = undefined;
        account.resetTokenExpires = undefined;
        await account.save();

        res.json({
            status: 'Success',
            message: 'Mật khẩu đã được đặt lại thành công'
        });
    } catch (error) {
        res.status(500).json({
            status: 'Error',
            message: error.message
        });
    }
};


// Create new account by Admin (with role selection and full validation)
const createAccountByAdmin = async (req, res) => {
    try {
        const { email, password, role, info } = req.body;

        // Only SuperAdmin can create new accounts with specific roles
        if (req.account.role !== 'superadmin') {
            return res.status(403).json({
                message: "Không có quyền tạo tài khoản người dùng với vai trò này",
                status: "Error"
            });
        }

        // Validate role (handled by schema)
        const validRoles = ['customer', 'admindev', 'adminbusiness', 'superadmin'];
        if (!validRoles.includes(role)) {
            return res.status(400).json({
                message: "Vai trò không hợp lệ",
                status: "Error"
            });
        }

        const existingAccount = await Account.findOne({ email });
        if (existingAccount) {
            return res.status(400).json({
                message: "Email đã tồn tại",
                status: "Error"
            });
        }

        // Validate info based on role
        if (!info || !info.fullName || !info.phone) {
            return res.status(400).json({
                message: "Họ tên và số điện thoại là bắt buộc cho tất cả các vai trò",
                status: "Error"
            });
        }

        const newAccount = new Account({
            email,
            password,
            role,
            info: {
                fullName: info.fullName,
                phone: info.phone,
                address: info.address,
                gender: info.gender,
                birthday: info.birthday
            },
            isActive: true
        });

        // Generate permissions based on new role structure
        newAccount.info.permissions = getPermissions(newAccount.role);

        // Save new account
        await newAccount.save();

        // Log admin activity
        await AdminActivityLog.create({
            adminId: req.account._id,
            action: 'CREATE_ACCOUNT',
            details: `Admin ${req.account.email} created new account ${newAccount.email} with role ${newAccount.role}`
        });

        res.status(201).json({
            message: `Tài khoản ${role} đã được tạo thành công`,
            status: "Success",
            data: {
                id: newAccount._id,
                email: newAccount.email,
                role: newAccount.role,
                isActive: newAccount.isActive,
                info: newAccount.info
            }
        });

    } catch (error) {
        console.error("Create account by admin error:", error);
        res.status(500).json({
            message: error.message,
            status: "Error"
        });
    }
};


// Update user
const updateUser = async (req, res) => {
    try {
        const { id } = req.params;
        const updateData = req.body; // updateData sẽ chứa email, role, và info

        // Kiểm tra quyền truy cập
        // Superadmin có thể cập nhật tất cả. Admin có thể cập nhật chính mình.
        if (req.account.role !== 'superadmin' && req.account._id.toString() !== id) {
            return res.status(403).json({
                status: 'Error',
                message: 'Không có quyền cập nhật thông tin người dùng này'
            });
        }

        const user = await Account.findById(id);
        if (!user) {
            return res.status(404).json({
                status: 'Error',
                message: 'Không tìm thấy người dùng'
            });
        }

        // Nếu đang cố gắng thay đổi trạng thái tài khoản superadmin, chặn lại.
        if (updateData.isActive !== undefined && user.role === 'superadmin') {
            return res.status(403).json({
                status: 'Error',
                message: 'Không thể thay đổi trạng thái tài khoản superadmin'
            });
        }

        // Cập nhật email nếu có và khác với email hiện tại
        if (updateData.email && updateData.email !== user.email) {
            // Kiểm tra trùng lặp email mới (nếu có)
            const existingAccount = await Account.findOne({ email: updateData.email });
            if (existingAccount && existingAccount._id.toString() !== id) {
                return res.status(400).json({
                    status: 'Error',
                    message: 'Email mới đã tồn tại'
                });
            }
            user.email = updateData.email;
        }

        // Cập nhật thông tin cá nhân (info)
        if (updateData.info) {
            user.info = { ...user.info, ...updateData.info };
        }

        // Cập nhật vai trò (chỉ superadmin mới được cập nhật vai trò)
        if (req.account.role === 'superadmin' && updateData.role && updateData.role !== user.role) {
            const validRoles = ['customer', 'admindev', 'adminbusiness', 'superadmin'];
            if (!validRoles.includes(updateData.role)) {
                return res.status(400).json({
                    status: 'Error',
                    message: 'Vai trò không hợp lệ'
                });
            }
            // Không cho phép thay đổi vai trò của superadmin thành vai trò khác
            if (user.role === 'superadmin' && updateData.role !== 'superadmin') {
                return res.status(403).json({
                    status: 'Error',
                    message: 'Không thể thay đổi vai trò của Super Admin'
                });
            }
            user.role = updateData.role;
            // Update permissions based on new role (and department if applicable)
            user.info.permissions = getPermissions(user.role);
        }

        // Cập nhật trạng thái tài khoản nếu có
        if (updateData.isActive !== undefined) {
            user.isActive = updateData.isActive;
        }

        await user.save();

        // Log admin activity
        await AdminActivityLog.create({
            adminId: req.account._id,
            action: 'UPDATE_ACCOUNT',
            details: `Admin ${req.account.email} updated account ${user.email} (ID: ${user._id})`
        });

        res.json({
            status: 'Success',
            message: 'Cập nhật thông tin thành công',
            data: {
                id: user._id,
                email: user.email,
                role: user.role,
                isActive: user.isActive,
                info: user.info
            }
        });
    } catch (error) {
        console.error("Update user error:", error);
        res.status(500).json({
            status: 'Error',
            message: error.message
        });
    }
};

// Delete user
const deleteUser = async (req, res) => {
    try {
        const { id } = req.params;

        // Chỉ cho phép superadmin xóa user
        if (req.account.role !== 'superadmin') {
            return res.status(403).json({
                status: 'Error',
                message: 'Không có quyền xóa người dùng'
            });
        }

        const user = await Account.findById(id);
        if (!user) {
            return res.status(404).json({
                status: 'Error',
                message: 'Không tìm thấy người dùng'
            });
        }

        // Không cho phép xóa superadmin
        if (user.role === 'superadmin') {
            return res.status(403).json({
                status: 'Error',
                message: 'Không thể xóa tài khoản superadmin'
            });
        }

        await Account.findByIdAndDelete(id);

        // Log admin activity
        await AdminActivityLog.create({
            adminId: req.account._id,
            action: 'DELETE_ACCOUNT',
            details: `Admin ${req.account.email} deleted account ${user.email} (ID: ${user._id})`
        });

        res.json({
            status: 'Success',
            message: 'Xóa người dùng thành công'
        });
    } catch (error) {
        res.status(500).json({
            status: 'Error',
            message: error.message
        });
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
    getAllAccounts,
    forgotPassword,
    resetPassword,
    updateUser,
    deleteUser,
    createAccountByAdmin
};
