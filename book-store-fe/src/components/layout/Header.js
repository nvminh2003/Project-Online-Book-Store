import React, { useState } from "react";
import Input from "../common/Input";
import { Link, useNavigate, useLocation } from 'react-router-dom';
import Icon from "../common/Icon";
import logo from "../../assets/image.png";
import { useAuth } from "../../contexts/AuthContext";
import { useSelector } from "react-redux";
import { fetchCart } from "../../store/slices/cartSlice";
const Header = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  // --- SỬA SELECTOR CHO ĐÚNG ---
  const cartItemsFromStore = useSelector((state) => state.cart.items || []); // Lấy trực tiếp mảng items
  const cartItemCount = cartItemsFromStore.reduce(
    (total, item) => total + (item.quantity || 0),
    0
  );

  const { user, isAuthenticated, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const isActivePath = (path) => location.pathname === path;

  const handleLogout = async () => {
    await logout();
    navigate("/");
  };

  const handleAdminClick = () => {
    if (user?.role === "superadmin") {
      navigate("/admin/users");
    } else if (user?.role === "admindev") {
      navigate("/admin/books");
    } else if (user?.role === "adminbusiness") {
      navigate("/admin/orders");
    }
  };

  const renderMobileMenu = () => {
    if (!isMenuOpen) return null;

    const menuItems = [
      { label: "Trang chủ", to: "/" },
      { label: "Sản phẩm", to: "/products" },
      { label: "Sách hay sách mới", to: "/products?filter=new-arrivals" },
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
              {(user?.role === "superadmin" ||
                user?.role === "admindev" ||
                user?.role === "adminbusiness") && (
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
                alt="SÁCH MKMN"
                className="h-12 w-auto cursor-pointer hover:opacity-80 transition-opacity"
              />
            </Link>
          </div>

          {/* Navigation Links */}
          <div className="hidden md:flex items-center space-x-6 text-sm font-medium">
            <Link
              to="/"
              className={`no-underline transition-colors ${location.search === "?filter=mkmn" ? 'text-blue-600' : 'text-black hover:text-blue-600'
                }`}
            >
              Trang chủ
            </Link>
            <Link
              to="/products?filter=new-arrivals"
              className={`no-underline transition-colors ${location.search === "?filter=new-arrivals" ? 'text-blue-600' : 'text-black hover:text-blue-600'
                }`}
            >
              Sách mới sách hay
            </Link>
            <Link
              to="/blogs"
              className={`no-underline transition-colors ${isActivePath('/blogs') ? 'text-blue-600' : 'text-black hover:text-blue-600'
                }`}
            >
              Blogs
            </Link>
            <Link
              to="/payment-info"
              className={`no-underline transition-colors ${isActivePath('/payment-info') ? 'text-blue-600' : 'text-black hover:text-blue-600'
                }`}
            >
              Thông tin thanh toán
            </Link>
            <Link
              to="/sales-policy"
              className={`no-underline transition-colors ${isActivePath('/sales-policy') ? 'text-blue-600' : 'text-black hover:text-blue-600'
                }`}
            >
              Chính sách bán hàng
            </Link>
            <Link
              to="/about"
              className={`no-underline transition-colors ${isActivePath('/about') ? 'text-blue-600' : 'text-black hover:text-blue-600'
                }`}
            >
              About Us
            </Link>
          </div>

          {/* User & Cart Area */}
          <div className="flex items-center space-x-6">
            {!isAuthenticated ? (
              <div className="hidden md:flex items-center space-x-4">
                <Link
                  to="/auth/login"
                  className={`font-medium no-underline transition-colors ${isActivePath('/auth/login') ? 'text-blue-600' : 'text-black hover:text-blue-600'
                    }`}
                >
                  Đăng nhập
                </Link>
                <Link
                  to="/auth/register"
                  className={`px-4 py-2 rounded-full font-medium no-underline transition-colors ${isActivePath('/auth/register')
                    ? 'bg-blue-700 text-white'
                    : 'bg-blue-600 text-white hover:bg-blue-700'
                    }`}
                >
                  Đăng ký
                </Link>
              </div>
            ) : (
              <div className="hidden md:flex items-center space-x-4">
                <Link
                  to="/auth/profile"
                  className={`font-medium no-underline transition-colors ${isActivePath('/auth/profile') ? 'text-blue-600' : 'text-black hover:text-blue-600'
                    }`}
                >
                  Tài khoản
                </Link>
                {(user?.role === "superadmin" ||
                  user?.role === "admindev" ||
                  user?.role === "adminbusiness") && (
                  <button
                    onClick={handleAdminClick}
                    className="text-black hover:text-blue-600 font-medium transition-colors"
                  >
                    Quản trị
                  </button>
                )}
                <button
                  onClick={handleLogout}
                  className="text-black hover:text-red-600 font-medium transition-colors"
                >
                  Đăng xuất
                </button>
              </div>
            )}

            {/* Wishlist */}
            <Link
              to="/wishlist"
              className={`relative transition-colors ${isActivePath('/wishlist') ? 'text-blue-600' : 'text-black hover:text-red-500'
                }`}
            >
              <Icon icon="mdi:heart-outline" className="w-6 h-6" />
              <span className="absolute -top-2 -right-2 bg-red-600 text-white rounded-full text-xs w-5 h-5 flex items-center justify-center">
                0
              </span>
            </Link>

            {/* Cart */}
            {isAuthenticated && (
              <Link
                to="/auth/cart" // SỬA LẠI ĐƯỜNG DẪN NẾU CẦN (ví dụ: /cart)
                className="relative text-gray-700 hover:text-blue-600 transition-colors"
              >
                <Icon icon="mdi:cart-outline" className="w-6 h-6" />
                {cartItemCount > 0 && ( // Chỉ hiển thị badge nếu có sản phẩm
                  <span className="absolute -top-2 -right-2 bg-red-600 text-white rounded-full text-xs w-5 h-5 flex items-center justify-center">
                    {cartItemCount} {/* HIỂN THỊ SỐ LƯỢNG ĐÃ TÍNH */}
                  </span>
                )}
              </Link>
            )}

            {/* Mobile Menu Button (chỉ hiển thị khi đã đăng nhập và không phải admin/superadmin) */}
            {isAuthenticated &&
              !(
                user?.role === "superadmin" ||
                user?.role === "admindev" ||
                user?.role === "adminbusiness"
              ) && (
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
                        <Link
                          to="/"
                          className="block px-4 py-2 text-gray-700 hover:bg-gray-100 no-underline"
                        >
                          Trang chủ
                        </Link>
                        <Link
                          to="/products"
                          className="block px-4 py-2 text-gray-700 hover:bg-gray-100 no-underline"
                        >
                          Sản phẩm
                        </Link>
                        <Link
                          to="/products?filter=new-arrivals"
                          className="block px-4 py-2 text-gray-700 hover:bg-gray-100 no-underline"
                        >
                          Sách hay sách mới
                        </Link>
                        <div className="border-t my-2" />
                        <Link
                          to="/auth/profile"
                          className="block px-4 py-2 text-gray-700 hover:bg-gray-100 no-underline"
                        >
                          Tài khoản của tôi
                        </Link>
                        <Link
                          to="/orders"
                          className="block px-4 py-2 text-gray-700 hover:bg-gray-100 no-underline"
                        >
                          Lịch sử đơn hàng
                        </Link>
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
