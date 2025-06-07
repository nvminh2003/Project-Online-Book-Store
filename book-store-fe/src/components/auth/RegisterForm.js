import React, { useState } from 'react';
import { Icon } from '@iconify/react';

const RegisterForm = () => {
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  return (
    <div className="max-w-4xl mx-auto my-10 p-6 px-4">
      <h2 className="text-2xl font-bold text-cyan-600 mb-6">THÔNG TIN ĐĂNG KÝ</h2>

      <form className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Email */}
        <div className="col-span-1 md:col-span-2">
          <label htmlFor="email" className="block text-gray-700 mb-1 text-sm">
            Email <span className="text-red-500">*</span>
          </label>
          <input
            type="email"
            id="email"
            placeholder="Email"
            className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-300 text-sm"
            required
          />
        </div>

        {/* Password */}
        <div className="relative">
          <label htmlFor="password" className="block text-gray-700 mb-1 text-sm">
            Mật khẩu <span className="text-red-500">*</span>
          </label>
          <input
            type={showPassword ? 'text' : 'password'}
            id="password"
            placeholder="Mật khẩu"
            className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-300 text-sm pr-10"
            required
          />
          <span
            className="absolute top-8 right-3 text-gray-500 cursor-pointer"
            onClick={() => setShowPassword(!showPassword)}
          >
            <Icon icon={showPassword ? 'mdi:eye-off' : 'mdi:eye'} width="20" />
          </span>
        </div>

        {/* Confirm Password */}
        <div className="relative">
          <label htmlFor="confirmPassword" className="block text-gray-700 mb-1 text-sm">
            Nhập lại mật khẩu <span className="text-red-500">*</span>
          </label>
          <input
            type={showConfirm ? 'text' : 'password'}
            id="confirmPassword"
            placeholder="Xác nhận mật khẩu"
            className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-300 text-sm pr-10"
            required
          />
          <span
            className="absolute top-8 right-3 text-gray-500 cursor-pointer"
            onClick={() => setShowConfirm(!showConfirm)}
          >
            <Icon icon={showConfirm ? 'mdi:eye-off' : 'mdi:eye'} width="20" />
          </span>
        </div>

        {/* Buttons */}
        <div className="col-span-1 md:col-span-2 flex items-center gap-4 mt-2">
          <button
            type="button"
            className="flex items-center gap-2 border border-gray-300 px-4 py-2 rounded hover:bg-gray-100 transition text-sm"
            onClick={() => console.log('Login with Google')}
          >
            <Icon icon="flat-color-icons:google" width="20" height="20" />
            Đăng ký bằng Google
          </button>

          <button
            type="submit"
            className="bg-blue-600 text-white px-6 py-2 rounded hover:bg-blue-700 transition text-sm"
          >
            ĐĂNG KÝ
          </button>
        </div>
      </form>
    </div>
  );
};

export default RegisterForm;
