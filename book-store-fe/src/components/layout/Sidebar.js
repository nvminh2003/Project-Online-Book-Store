import React from "react";
import { Link } from 'react-router-dom';
import Icon from "../common/Icon";

const Sidebar = () => {
  const menuItems = [
    { path: "/", label: "Trang chủ", icon: "home" },
    { path: "/products", label: "Sản phẩm", icon: "book" },
    { path: "/cart", label: "Giỏ hàng", icon: "cart" },
    { path: "/account", label: "Tài khoản", icon: "user" },
    { path: "/orders", label: "Lịch sử đơn hàng", icon: "history" },
    { path: "/contact", label: "Liên hệ", icon: "envelope" },
  ];

  return (
    <aside className="w-64 bg-white shadow-lg min-h-screen">
      <div className="p-4 border-b border-gray-200">
        <h2 className="text-xl font-bold text-gray-800">Menu</h2>
      </div>
      <nav className="p-4">
        <ul className="space-y-2">
          {menuItems.map((item) => (
            <li key={item.path}>
              <Link
                to={item.path}
                className="flex items-center px-4 py-3 text-gray-700 rounded-lg hover:bg-blue-50 hover:text-blue-600 transition-colors group"
              >
                <Icon
                  name={item.icon}
                  className="w-5 h-5 mr-3 text-gray-500 group-hover:text-blue-500"
                />
                <span className="font-medium">{item.label}</span>
              </Link>
            </li>
          ))}
        </ul>
      </nav>

      {/* Quick Stats */}
      <div className="p-4 border-t border-gray-200">
        <h3 className="text-sm font-semibold text-gray-500 uppercase mb-3">
          Thống kê nhanh
        </h3>
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-gray-600">Đơn hàng</span>
            <span className="font-medium text-gray-800">0</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-gray-600">Sản phẩm yêu thích</span>
            <span className="font-medium text-gray-800">0</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-gray-600">Điểm tích lũy</span>
            <span className="font-medium text-gray-800">0</span>
          </div>
        </div>
      </div>

      {/* Help Section */}
      <div className="p-4 border-t border-gray-200">
        <h3 className="text-sm font-semibold text-gray-500 uppercase mb-3">
          Cần hỗ trợ?
        </h3>
        <div className="bg-blue-50 rounded-lg p-4">
          <p className="text-sm text-gray-600 mb-3">
            Liên hệ với chúng tôi để được hỗ trợ nhanh chóng
          </p>
          <a
            href="tel:0974148047"
            className="flex items-center text-blue-600 hover:text-blue-700 font-medium"
          >
            <Icon name="phone" className="w-4 h-4 mr-2" />
            0974.148.047
          </a>
        </div>
      </div>
    </aside>
  );
};

export default Sidebar;
