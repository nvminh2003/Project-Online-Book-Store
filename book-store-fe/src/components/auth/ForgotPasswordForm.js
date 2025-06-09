import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

const ForgotPasswordForm = () => {
  const [email, setEmail] = useState('');
  const navigate = useNavigate();

  const handleSubmit = (e) => {
    e.preventDefault();
    // Xử lý gửi email ở đây
  };

  return (
    <div className="max-w-md mx-auto my-12 p-6">
      <h2 className="text-3xl font-bold mb-2">Đặt lại mật khẩu</h2>
      <p className="text-gray-500 mb-8">
        Chúng tôi sẽ gửi cho bạn một email để kích hoạt việc đặt lại mật khẩu.
      </p>
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
          className="w-full mb-6 px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-300 text-base"
        />
        <div className="flex items-center gap-2">
          <button
            type="submit"
            className="px-6 py-2 border border-gray-300 rounded bg-white text-black hover:bg-gray-100 transition"
          >
            Gửi
          </button>
          <span className="text-gray-500">hoặc</span>
          <button
            type="button"
            className="text-blue-600 hover:underline font-medium bg-transparent"
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