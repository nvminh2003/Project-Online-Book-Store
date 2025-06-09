import React, { useState } from "react";
import { Link, useNavigate } from 'react-router-dom';
import Input from "../common/Input";
import Icon from "../common/Icon";
import logo from '../../assets/image.png';
import { useAuth } from '../../contexts/AuthContext';

const Header = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const { user, isAuthenticated, logout } = useAuth();
  const navigate = useNavigate();

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      window.location.href = `/search?query=${encodeURIComponent(searchQuery)}`;
    }
  };

  const handleLogout = async () => {
    await logout();
    navigate('/');
  };

  const handleAdminClick = () => {
    if (user?.role === 'admin' || user?.role === 'superadmin') {
      navigate('/admin');
    }
  };

  const renderMobileMenu = () => {
    if (!isMenuOpen) return null;

    const menuItems = [
      { label: 'Trang chủ', to: '/' },
      { label: 'Sản phẩm', to: '/products' },
      { label: 'Sách hay sách mới', to: '/products?filter=new-arrivals' },
    ];

    return (
      <nav className="md:hidden bg-white border-t border-gray-200 py-2">
        <div className="px-2 space-y-1">
          {menuItems.map((item, index) => (
            <Link
              key={index}
              to={item.to}
              className="block px-3 py-2 rounded-md text-base font-medium text-gray-700 hover:text-blue-600 hover:bg-gray-50 transition-colors"
            >
              {item.label}
            </Link>
          ))}

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
                to="/auth/profile"
                className="block px-3 py-2 rounded-md text-base font-medium text-gray-700 hover:text-blue-600 hover:bg-gray-50 transition-colors no-underline"
              >
                Tài khoản của tôi
              </Link>
              <Link
                to="/orders"
                className="block px-3 py-2 rounded-md text-base font-medium text-gray-700 hover:text-blue-600 hover:bg-gray-50 transition-colors"
              >
                Lịch sử đơn hàng
              </Link>
              {(user?.role === 'admin' || user?.role === 'superadmin') && (
                <button
                  onClick={handleAdminClick}
                  className="w-full text-left px-3 py-2 rounded-md text-base font-medium text-gray-700 hover:text-blue-600 hover:bg-gray-50 transition-colors"
                >
                  Quản trị
                </button>
              )}
              <button
                onClick={handleLogout}
                className="w-full text-left px-3 py-2 rounded-md text-base font-medium text-gray-700 hover:text-red-600 hover:bg-gray-50 transition-colors"
              >
                Đăng xuất
              </button>
            </div>
          )}
        </div>
      </nav>
    );
  };

  return (
    <header className="w-full bg-white shadow-md sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
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
              <div className="hidden md:flex items-center space-x-4">
                <Link
                  to="/auth/profile"
                  className="text-gray-700 hover:text-blue-600 font-medium transition-colors no-underline"
                >
                  {/* {user?.customerInfo?.fullName || user?.email} */}
                  Tài khoảns
                </Link>
                {(user?.role === 'admin' || user?.role === 'superadmin') && (
                  <button
                    onClick={handleAdminClick}
                    className="text-gray-700 hover:text-blue-600 font-medium transition-colors"
                  >
                    Quản trị
                  </button>
                )}
                <button
                  onClick={handleLogout}
                  className="text-gray-700 hover:text-red-600 font-medium transition-colors"
                >
                  Đăng xuất
                </button>
              </div>
            )}

            {/* Cart */}
            <Link
              to="/auth/cart"
              className="relative text-gray-700 hover:text-blue-600 transition-colors"
            >
              <Icon icon="mdi:cart-outline" className="w-6 h-6" />
              <span className="absolute -top-2 -right-2 bg-red-600 text-white rounded-full text-xs w-5 h-5 flex items-center justify-center">
                0
              </span>
            </Link>

            {/* Mobile Menu Button (chỉ hiển thị khi đã đăng nhập và không phải admin/superadmin) */}
            {isAuthenticated && !(user?.role === 'admin' || user?.role === 'superadmin') && (
              <div className="relative">
                <button
                  onClick={() => setIsMenuOpen(!isMenuOpen)}
                  className="text-gray-700 hover:text-blue-600 focus:outline-none"
                >
                  <Icon name="mdi:menu" className="w-6 h-6" />
                </button>
                {isMenuOpen && (
                  <div className="absolute right-0 mt-2 w-56 bg-white border border-gray-200 rounded shadow-lg z-50">
                    <div className="py-2">
                      <Link to="/" className="block px-4 py-2 text-gray-700 hover:bg-gray-100 no-underline">Trang chủ</Link>
                      <Link to="/products" className="block px-4 py-2 text-gray-700 hover:bg-gray-100 no-underline">Sản phẩm</Link>
                      <Link to="/products?filter=new-arrivals" className="block px-4 py-2 text-gray-700 hover:bg-gray-100 no-underline">Sách hay sách mới</Link>
                      <div className="border-t my-2" />
                      <Link to="/auth/profile" className="block px-4 py-2 text-gray-700 hover:bg-gray-100 no-underline">Tài khoản của tôi</Link>
                      <Link to="/orders" className="block px-4 py-2 text-gray-700 hover:bg-gray-100 no-underline">Lịch sử đơn hàng</Link>
                      <button
                        onClick={handleLogout}
                        className="w-full text-left px-4 py-2 text-gray-700 hover:bg-gray-100 hover:text-red-600"
                      >
                        Đăng xuất
                      </button>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Mobile Menu */}
        {renderMobileMenu()}
      </div>
    </header>
  );
};

export default Header;