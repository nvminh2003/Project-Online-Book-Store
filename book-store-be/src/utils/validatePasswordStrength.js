// utils/validatePasswordStrength.js

/**
 * Kiểm tra độ mạnh mật khẩu
 * - Tối thiểu 8 ký tự
 * - Có ít nhất 1 chữ hoa, 1 chữ thường, 1 số, 1 ký tự đặc biệt
 */
function isStrongPassword(password) {
    return /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*()_+\-=[\]{};':"\\|,.<>/?]).{8,}$/.test(password);
}

module.exports = isStrongPassword;
