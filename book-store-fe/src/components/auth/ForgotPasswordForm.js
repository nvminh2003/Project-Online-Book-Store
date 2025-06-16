import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import accountService from '../../services/accountService';

const ForgotPasswordForm = () => {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess(false);

    try {
      await accountService.forgotPassword(email);
      setSuccess(true);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-md mx-auto my-12 p-6">
      <h2 className="text-3xl font-bold mb-2">Đặt lại mật khẩu</h2>
      <p className="text-gray-500 mb-8">
        Chúng tôi sẽ gửi cho bạn một email để kích hoạt việc đặt lại mật khẩu.
      </p>
      {error && (
        <div className="mb-4 p-3 bg-red-100 text-red-700 rounded">
          {error}
        </div>
      )}
      {success && (
        <div className="mb-4 p-3 bg-green-100 text-green-700 rounded">
          Mật khẩu mới đã được gửi đến email của bạn. Vui lòng kiểm tra hộp thư.
        </div>
      )}
      <form onSubmit={handleSubmit}>
        <label htmlFor="email" className="block text-gray-700 mb-2 font-medium">
          Email<span className="text-red-500">*</span>
        </label>
        <input
          type="email"
          id="email"
          value={email}
          onChange={e => setEmail(e.target.value)}
          required
          disabled={loading}
          className="w-full mb-6 px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-300 text-base"
        />
        <div className="flex items-center gap-2">
          <button
            type="submit"
            disabled={loading}
            className="px-6 py-2 border border-gray-300 rounded bg-white text-black hover:bg-gray-100 transition disabled:opacity-50"
          >
            {loading ? 'Đang xử lý...' : 'Gửi'}
          </button>
          <span className="text-gray-500">hoặc</span>
          <button
            type="button"
            disabled={loading}
            className="text-blue-600 hover:no-underline font-medium bg-transparent disabled:opacity-50"
            onClick={() => navigate(-1)}
          >
            Hủy
          </button>
        </div>
      </form>
    </div>
  );
};

export default ForgotPasswordForm;