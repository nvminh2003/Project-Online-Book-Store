// LoginForm.js
import React, { useState } from 'react';
import { Icon } from '@iconify/react';
import { Link } from 'react-router-dom';

const LoginForm = () => {
  const [showPassword, setShowPassword] = useState(false);

  return (
    <div className="max-w-4xl mx-auto my-10 p-6 px-4">
      <h2 className="text-2xl font-bold text-cyan-600 mb-6">ĐĂNG NHẬP</h2>

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
        <div className="relative col-span-1 md:col-span-2">
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

        {/* Forgot Password Link */}
        <div className="col-span-1 md:col-span-2 text-left -mt-2 mb-2">
          <Link
            to="/auth/forgot-password"
            className="text-sm text-blue-600 hover:text-blue-700 font-medium"
          >
            Quên mật khẩu?
          </Link>
        </div>

        {/* Buttons */}
        <div className="col-span-1 md:col-span-2 flex items-center gap-4 mt-2">
          <button
            type="button"
            className="flex items-center gap-2 border border-gray-300 px-4 py-2 rounded hover:bg-gray-100 transition text-sm"
            onClick={() => console.log('Login with Google')}
          >
            <Icon icon="flat-color-icons:google" width="20" height="20" />
            Đăng nhập bằng Google
          </button>

          <button
            type="submit"
            className="bg-blue-600 text-white px-6 py-2 rounded hover:bg-blue-700 transition text-sm"
          >
            ĐĂNG NHẬP
          </button>
        </div>

        {/* Register Link */}
        <div className="col-span-1 md:col-span-2 text-center mt-4">
          <p className="text-sm text-gray-600">
            Bạn chưa có tài khoản?{' '}
            <Link to="/auth/register" className="text-blue-600 hover:text-blue-700 font-medium">
              Đăng ký ngay
            </Link>
          </p>
        </div>
      </form>
    </div>
  );
};

export default LoginForm;