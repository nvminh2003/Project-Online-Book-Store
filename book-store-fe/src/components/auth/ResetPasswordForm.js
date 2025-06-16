import React, { useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import accountService from '../../services/accountService';
import Icon from '../../components/common/Icon';

const ResetPasswordForm = () => {
    const [searchParams] = useSearchParams();
    const token = searchParams.get('token');
    const navigate = useNavigate();

    const [formData, setFormData] = useState({
        newPassword: '',
        confirmPassword: ''
    });
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState(false);

    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);

    const handleChange = (e) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value
        });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');
        setSuccess(false);

        // Validate passwords match
        if (formData.newPassword !== formData.confirmPassword) {
            setError('Mật khẩu xác nhận không khớp');
            setLoading(false);
            return;
        }

        // Validate password strength
        if (formData.newPassword.length < 6) {
            setError('Mật khẩu phải có ít nhất 6 ký tự');
            setLoading(false);
            return;
        }

        try {
            await accountService.resetPassword(token, formData.newPassword);
            setSuccess(true);
            // Redirect to login after 3 seconds
            setTimeout(() => {
                navigate('/auth/login');
            }, 3000);
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    if (!token) {
        return (
            <div className="max-w-md mx-auto my-12 p-6">
                <div className="p-3 bg-red-100 text-red-700 rounded">
                    Link đặt lại mật khẩu không hợp lệ
                </div>
            </div>
        );
    }

    return (
        <div className="max-w-md mx-auto my-12 p-6">
            <h2 className="text-3xl font-bold mb-2">Đặt lại mật khẩu</h2>
            <p className="text-gray-500 mb-8">
                Vui lòng nhập mật khẩu mới của bạn
            </p>
            {error && (
                <div className="mb-4 p-3 bg-red-100 text-red-700 rounded">
                    {error}
                </div>
            )}
            {success && (
                <div className="mb-4 p-3 bg-green-100 text-green-700 rounded">
                    Mật khẩu đã được đặt lại thành công. Bạn sẽ được chuyển hướng đến trang đăng nhập...
                </div>
            )}
            {/* <form onSubmit={handleSubmit}>
                <div className="mb-4">
                    <label htmlFor="newPassword" className="block text-gray-700 mb-2 font-medium">
                        Mật khẩu mới<span className="text-red-500">*</span>
                    </label>
                    <input
                        type="password"
                        id="newPassword"
                        name="newPassword"
                        value={formData.newPassword}
                        onChange={handleChange}
                        required
                        disabled={loading}
                        className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-300 text-base"
                    />
                </div>
                <div className="mb-6">
                    <label htmlFor="confirmPassword" className="block text-gray-700 mb-2 font-medium">
                        Xác nhận mật khẩu<span className="text-red-500">*</span>
                    </label>
                    <input
                        type="password"
                        id="confirmPassword"
                        name="confirmPassword"
                        value={formData.confirmPassword}
                        onChange={handleChange}
                        required
                        disabled={loading}
                        className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-300 text-base"
                    />
                </div>
                <button
                    type="submit"
                    disabled={loading}
                    className="w-full px-6 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition disabled:opacity-50"
                >
                    {loading ? 'Đang xử lý...' : 'Đặt lại mật khẩu'}
                </button>
            </form> */}
            <form onSubmit={handleSubmit}>
                <div className="mb-4">
                    <label htmlFor="newPassword" className="block text-gray-700 mb-2 font-medium">
                        Mật khẩu mới<span className="text-red-500">*</span>
                    </label>
                    <div className="relative">
                        <input
                            type={showPassword ? 'text' : 'password'}
                            id="newPassword"
                            name="newPassword"
                            value={formData.newPassword}
                            onChange={handleChange}
                            required
                            disabled={loading}
                            className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-300 text-base"
                        />
                        <button
                            type="button"
                            onClick={() => setShowPassword(!showPassword)}
                            className="absolute right-3 top-2 text-gray-500"
                        >
                            <Icon icon={showPassword ? 'mdi:eye-off' : 'mdi:eye'} width="20" />
                        </button>
                    </div>
                </div>
                <div className="mb-6">
                    <label htmlFor="confirmPassword" className="block text-gray-700 mb-2 font-medium">
                        Xác nhận mật khẩu<span className="text-red-500">*</span>
                    </label>
                    <div className="relative">
                        <input
                            type={showConfirmPassword ? 'text' : 'password'}
                            id="confirmPassword"
                            name="confirmPassword"
                            value={formData.confirmPassword}
                            onChange={handleChange}
                            required
                            disabled={loading}
                            className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-300 text-base"
                        />
                        <button
                            type="button"
                            onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                            className="absolute right-3 top-2 text-gray-500"
                        >
                            <Icon icon={showConfirmPassword ? 'mdi:eye-off' : 'mdi:eye'} width="20" />
                        </button>
                    </div>
                </div>
                <button
                    type="submit"
                    disabled={loading}
                    className="w-full px-6 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition disabled:opacity-50"
                >
                    {loading ? 'Đang xử lý...' : 'Đặt lại mật khẩu'}
                </button>
            </form>
        </div>
    );
};

export default ResetPasswordForm;