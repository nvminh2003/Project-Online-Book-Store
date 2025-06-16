import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Icon } from '@iconify/react';
import accountService from '../../services/accountService';

const ChangePasswordForm = () => {
    const [oldPassword, setOldPassword] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [showOld, setShowOld] = useState(false);
    const [showNew, setShowNew] = useState(false);
    const [showConfirm, setShowConfirm] = useState(false);
    const [error, setError] = useState(null);
    const [success, setSuccess] = useState(null);
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError(null);
        setSuccess(null);

        if (!oldPassword || !newPassword || !confirmPassword) {
            setError('Vui lòng nhập đầy đủ thông tin.');
            return;
        }

        if (newPassword !== confirmPassword) {
            setError('Mật khẩu mới và xác nhận không khớp.');
            return;
        }

        setLoading(true);
        try {
            await accountService.changePassword({ oldPassword, newPassword });
            setSuccess('Đổi mật khẩu thành công!');
            setOldPassword('');
            setNewPassword('');
            setConfirmPassword('');
            setTimeout(() => navigate('/auth/profile'), 1500);
        } catch (err) {
            setError(err.response?.data?.message || 'Đổi mật khẩu thất bại.');
        }
        setLoading(false);
    };

    const renderPasswordField = (label, value, onChange, show, setShow) => (
        <div className="mb-4 relative">
            <label className="block font-medium mb-1">{label}</label>
            <input
                type={show ? 'text' : 'password'}
                value={value}
                onChange={onChange}
                disabled={loading}
                className="w-full border rounded px-3 py-2 pr-10"
            />
            <button
                type="button"
                onClick={() => setShow(!show)}
                className="absolute right-3 top-9 text-gray-500 hover:text-gray-700"
                tabIndex={-1}
            >
                <Icon icon={show ? 'mdi:eye-off' : 'mdi:eye'} width="20" />
            </button>
        </div>
    );

    return (
        <form className="max-w-md mx-auto bg-white p-6 rounded shadow" onSubmit={handleSubmit}>
            <h2 className="text-xl font-bold mb-4">Đổi mật khẩu</h2>
            {error && <div className="text-red-500 mb-2">{error}</div>}
            {success && <div className="text-green-600 mb-2">{success}</div>}

            {renderPasswordField('Mật khẩu cũ', oldPassword, e => setOldPassword(e.target.value), showOld, setShowOld)}
            {renderPasswordField('Mật khẩu mới', newPassword, e => setNewPassword(e.target.value), showNew, setShowNew)}
            {renderPasswordField('Xác nhận mật khẩu mới', confirmPassword, e => setConfirmPassword(e.target.value), showConfirm, setShowConfirm)}

            <button
                type="submit"
                className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 w-full"
                disabled={loading}
            >
                {loading ? 'Đang xử lý...' : 'Đổi mật khẩu'}
            </button>
        </form>
    );
};

export default ChangePasswordForm;
