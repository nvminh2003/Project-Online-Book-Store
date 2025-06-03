import React from "react";
import Link from "next/link";

const Sidebar = () => {
  return (
    <aside className="w-64 bg-white border-r border-gray-200 min-h-screen p-4">
      <nav className="space-y-2">
        <Link href="/">
          <a className="block px-3 py-2 rounded hover:bg-gray-100">Trang chủ</a>
        </Link>
        <Link href="/products">
          <a className="block px-3 py-2 rounded hover:bg-gray-100">Sản phẩm</a>
        </Link>
        <Link href="/cart">
          <a className="block px-3 py-2 rounded hover:bg-gray-100">Giỏ hàng</a>
        </Link>
        <Link href="/account">
          <a className="block px-3 py-2 rounded hover:bg-gray-100">Tài khoản</a>
        </Link>
        <Link href="/orders">
          <a className="block px-3 py-2 rounded hover:bg-gray-100">
            Lịch sử đơn hàng
          </a>
        </Link>
        <Link href="/contact">
          <a className="block px-3 py-2 rounded hover:bg-gray-100">Liên hệ</a>
        </Link>
      </nav>
    </aside>
  );
};

export default Sidebar;
