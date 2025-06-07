import React, { useState } from "react";
import { Link } from 'react-router-dom';
import Input from "../common/Input";
import Button from "../common/Button";
import Icon from "../common/Icon";
import logo from '../../assets/image.png';
import RegisterPage from "../auth/RegisterForm";

const Header = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);

  // TODO: Replace with actual auth and cart context or redux selectors
  const isAuthenticated = false;
  const user = { name: "User" };
  const cartItemCount = 3;

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      window.location.href = `/search?query=${encodeURIComponent(searchQuery)}`;
    }
  };

  return (
    <header className="w-full bg-white shadow-md sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Top Bar */}
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <div className="flex-shrink-0">
            <Link to="/" className="flex items-center">
              <img
                src={logo}
                alt="SÁCH TAO ĐÀN"
                className="h-12 w-auto cursor-pointer hover:opacity-80 transition-opacity"
              />
            </Link>
          </div>

          {/* Search Bar */}
          <form
            onSubmit={handleSearchSubmit}
            className="hidden md:flex flex-1 mx-8 max-w-2xl mt-4"
          >
            <div className="relative w-full">
              <Input
                type="text"
                placeholder="Tìm kiếm sách, tác giả..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-4 pr-12 py-2 rounded-full border border-gray-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all"
              />

            </div>
          </form>

          {/* User & Cart Area */}
          <div className="flex items-center space-x-6">
            {!isAuthenticated ? (
              <div className="hidden md:flex items-center space-x-4">
                <Link
                  to="/auth/login"
                  className="text-gray-700 hover:text-blue-600 font-medium transition-colors no-underline"
                >
                  Đăng nhập
                </Link>
                <Link
                  to="/auth/register"
                  className="bg-blue-600 text-white px-4 py-2 rounded-full hover:bg-blue-700 transition-colors no-underline"
                >
                  Đăng ký
                </Link>
              </div>
            ) : (
              <div className="relative">
                <button
                  onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
                  className="flex items-center space-x-2 text-gray-700 hover:text-blue-600 focus:outline-none"
                >
                  <span className="font-medium">Chào, {user.name}!</span>
                  <Icon name="chevron-down" className="w-4 h-4" />
                </button>
                {isUserMenuOpen && (
                  <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-gray-100 py-1 z-50">
                    <Link
                      to="/account"
                      className="block px-4 py-2 text-gray-700 hover:bg-gray-50 hover:text-blue-600 transition-colors"
                    >
                      Tài khoản của tôi
                    </Link>
                    <Link
                      to="/orders"
                      className="block px-4 py-2 text-gray-700 hover:bg-gray-50 hover:text-blue-600 transition-colors"
                    >
                      Lịch sử đơn hàng
                    </Link>
                    <button className="w-full text-left px-4 py-2 text-gray-700 hover:bg-gray-50 hover:text-red-600 transition-colors">
                      Đăng xuất
                    </button>
                  </div>
                )}
              </div>
            )}
            <Link
              to="/cart"
              className="relative text-gray-700 hover:text-blue-600 transition-colors"
            >
              <Icon name="cart" className="w-6 h-6" />
              {cartItemCount > 0 && (
                <span className="absolute -top-2 -right-2 bg-red-600 text-white rounded-full text-xs w-5 h-5 flex items-center justify-center">
                  {cartItemCount}
                </span>
              )}
            </Link>

            {/* Mobile Menu Button */}
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="md:hidden text-gray-700 hover:text-blue-600 focus:outline-none"
            >
              <Icon name="menu" className="w-6 h-6" />
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        {isMenuOpen && (
          <nav className="md:hidden bg-white border-t border-gray-200 py-2">
            <div className="px-2 space-y-1">
              <Link
                to="/"
                className="block px-3 py-2 rounded-md text-base font-medium text-gray-700 hover:text-blue-600 hover:bg-gray-50 transition-colors"
              >
                Trang chủ
              </Link>
              <Link
                to="/products"
                className="block px-3 py-2 rounded-md text-base font-medium text-gray-700 hover:text-blue-600 hover:bg-gray-50 transition-colors"
              >
                Sản phẩm
              </Link>
              <Link
                to="/products?filter=new-arrivals"
                className="block px-3 py-2 rounded-md text-base font-medium text-gray-700 hover:text-blue-600 hover:bg-gray-50 transition-colors"
              >
                Sách hay sách mới
              </Link>
              <Link
                to="/contact"
                className="block px-3 py-2 rounded-md text-base font-medium text-gray-700 hover:text-blue-600 hover:bg-gray-50 transition-colors"
              >
                Liên hệ mua sách
              </Link>
              {!isAuthenticated ? (
                <div className="pt-2 space-y-1">
                  <Link
                    to="/auth/login"
                    className="block px-3 py-2 rounded-md text-base font-medium text-gray-700 hover:text-blue-600 hover:bg-gray-50 transition-colors"
                  >
                    Đăng nhập
                  </Link>
                  <Link
                    to="/auth/register"
                    className="block px-3 py-2 rounded-md text-base font-medium bg-blue-600 text-white hover:bg-blue-700 transition-colors"
                  >
                    Đăng ký
                  </Link>
                </div>
              ) : (
                <div className="pt-2 space-y-1">
                  <Link
                    to="/account"
                    className="block px-3 py-2 rounded-md text-base font-medium text-gray-700 hover:text-blue-600 hover:bg-gray-50 transition-colors"
                  >
                    Tài khoản của tôi
                  </Link>
                  <Link
                    to="/orders"
                    className="block px-3 py-2 rounded-md text-base font-medium text-gray-700 hover:text-blue-600 hover:bg-gray-50 transition-colors"
                  >
                    Lịch sử đơn hàng
                  </Link>
                  <button className="w-full text-left px-3 py-2 rounded-md text-base font-medium text-gray-700 hover:text-red-600 hover:bg-gray-50 transition-colors">
                    Đăng xuất
                  </button>
                </div>
              )}
            </div>
          </nav>
        )}
      </div>
    </header>
  );
};

export default Header;