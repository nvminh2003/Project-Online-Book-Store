import React, { useState } from "react";
import Link from "next/link";
import Input from "../common/Input";
import Button from "../common/Button";
import Icon from "../common/Icon";

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
      // Navigate to search results page with query
      window.location.href = `/search?query=${encodeURIComponent(searchQuery)}`;
    }
  };

  return (
    <header className="w-full bg-white border-b border-gray-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between h-16">
        {/* Logo */}
        <div className="flex-shrink-0">
          <Link href="/">
            <a>
              <img
                src="/src/assets/logo192.png"
                alt="SÁCH TAO ĐÀN"
                className="h-10 w-auto cursor-pointer"
              />
            </a>
          </Link>
        </div>

        {/* Search Bar */}
        <form
          onSubmit={handleSearchSubmit}
          className="hidden md:flex flex-1 mx-4 max-w-lg"
        >
          <Input
            type="text"
            placeholder="Tìm kiếm sách, tác giả..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="rounded-r-none"
          />
          <Button type="submit" className="rounded-l-none">
            <Icon name="search" />
          </Button>
        </form>

        {/* User & Cart Area */}
        <div className="flex items-center space-x-4">
          {!isAuthenticated ? (
            <>
              <Link href="/auth/login">
                <a className="text-gray-700 hover:text-blue-600">Đăng nhập</a>
              </Link>
              <Link href="/auth/register">
                <a className="text-gray-700 hover:text-blue-600">Đăng ký</a>
              </Link>
            </>
          ) : (
            <div className="relative">
              <button
                onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
                className="text-gray-700 hover:text-blue-600 focus:outline-none"
              >
                Chào, {user.name}!
              </button>
              {isUserMenuOpen && (
                <div className="absolute right-0 mt-2 w-48 bg-white border border-gray-200 rounded shadow-lg z-10">
                  <Link href="/account">
                    <a className="block px-4 py-2 hover:bg-gray-100">
                      Tài khoản của tôi
                    </a>
                  </Link>
                  <Link href="/orders">
                    <a className="block px-4 py-2 hover:bg-gray-100">
                      Lịch sử đơn hàng
                    </a>
                  </Link>
                  <button className="w-full text-left px-4 py-2 hover:bg-gray-100">
                    Đăng xuất
                  </button>
                </div>
              )}
            </div>
          )}
          <Link href="/cart">
            <a className="relative text-gray-700 hover:text-blue-600">
              <Icon name="cart" />
              {cartItemCount > 0 && (
                <span className="absolute -top-1 -right-2 bg-red-600 text-white rounded-full text-xs w-5 h-5 flex items-center justify-center">
                  {cartItemCount}
                </span>
              )}
            </a>
          </Link>
        </div>

        {/* Hamburger Menu for Mobile */}
        <div className="md:hidden">
          <button
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            className="text-gray-700 hover:text-blue-600 focus:outline-none"
          >
            <Icon name="menu" />
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      {isMenuOpen && (
        <nav className="md:hidden bg-white border-t border-gray-200">
          <div className="px-2 pt-2 pb-3 space-y-1">
            <Link href="/">
              <a className="block px-3 py-2 rounded-md text-base font-medium text-gray-700 hover:text-blue-600 hover:bg-gray-50">
                Trang chủ
              </a>
            </Link>
            <Link href="/products">
              <a className="block px-3 py-2 rounded-md text-base font-medium text-gray-700 hover:text-blue-600 hover:bg-gray-50">
                Sản phẩm
              </a>
            </Link>
            <Link href="/products?filter=new-arrivals">
              <a className="block px-3 py-2 rounded-md text-base font-medium text-gray-700 hover:text-blue-600 hover:bg-gray-50">
                Sách hay sách mới
              </a>
            </Link>
            <Link href="/contact">
              <a className="block px-3 py-2 rounded-md text-base font-medium text-gray-700 hover:text-blue-600 hover:bg-gray-50">
                Liên hệ mua sách
              </a>
            </Link>
            {!isAuthenticated ? (
              <>
                <Link href="/auth/login">
                  <a className="block px-3 py-2 rounded-md text-base font-medium text-gray-700 hover:text-blue-600 hover:bg-gray-50">
                    Đăng nhập
                  </a>
                </Link>
                <Link href="/auth/register">
                  <a className="block px-3 py-2 rounded-md text-base font-medium text-gray-700 hover:text-blue-600 hover:bg-gray-50">
                    Đăng ký
                  </a>
                </Link>
              </>
            ) : (
              <>
                <Link href="/account">
                  <a className="block px-3 py-2 rounded-md text-base font-medium text-gray-700 hover:text-blue-600 hover:bg-gray-50">
                    Tài khoản của tôi
                  </a>
                </Link>
                <Link href="/orders">
                  <a className="block px-3 py-2 rounded-md text-base font-medium text-gray-700 hover:text-blue-600 hover:bg-gray-50">
                    Lịch sử đơn hàng
                  </a>
                </Link>
                <button className="w-full text-left px-3 py-2 rounded-md text-base font-medium text-gray-700 hover:text-blue-600 hover:bg-gray-50">
                  Đăng xuất
                </button>
              </>
            )}
          </div>
        </nav>
      )}
    </header>
  );
};

export default Header;
