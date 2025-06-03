import React from "react";
import { Link } from 'react-router-dom';

const Footer = () => {
  return (
    <footer className="w-full bg-gray-900 text-gray-300">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {/* Company Info */}
          <div className="space-y-4">
            <h3 className="text-xl font-bold text-white mb-4">Công ty Cổ phần Sách Tao Đàn</h3>
            <p className="text-gray-400 leading-relaxed">
              Chúng tôi cung cấp sách chất lượng cao và dịch vụ tốt nhất cho độc giả Việt Nam.
            </p>
            <div className="flex space-x-4">
              <a href="#" className="text-gray-400 hover:text-white transition-colors">
                <i className="fab fa-facebook-f"></i>
              </a>
              <a href="#" className="text-gray-400 hover:text-white transition-colors">
                <i className="fab fa-twitter"></i>
              </a>
              <a href="#" className="text-gray-400 hover:text-white transition-colors">
                <i className="fab fa-instagram"></i>
              </a>
            </div>
          </div>

          {/* Contact Info */}
          <div className="space-y-4">
            <h3 className="text-xl font-bold text-white mb-4">Kênh thông tin liên hệ</h3>
            <div className="space-y-2">
              <p className="flex items-start">
                <i className="fas fa-map-marker-alt mt-1 mr-3 text-blue-500"></i>
                <span>Địa chỉ văn phòng Hà Nội: (Địa chỉ cụ thể)</span>
              </p>
              <p className="flex items-center">
                <i className="fas fa-phone-alt mr-3 text-blue-500"></i>
                <span>024.2214.9698</span>
              </p>
              <p className="flex items-center">
                <i className="fas fa-mobile-alt mr-3 text-blue-500"></i>
                <span>0974.148.047 / 0777720254</span>
              </p>
              <p className="flex items-center">
                <i className="fas fa-envelope mr-3 text-blue-500"></i>
                <span>info@sachtaodan.vn</span>
              </p>
              <p className="flex items-center">
                <i className="fas fa-clock mr-3 text-blue-500"></i>
                <span>8h00-17h30 từ thứ 2 đến thứ 6</span>
              </p>
              <p className="font-bold text-blue-400">CHỈ BÁN ONLINE</p>
            </div>
          </div>

          {/* Quick Links */}
          <div className="space-y-4">
            <h3 className="text-xl font-bold text-white mb-4">Liên kết nhanh</h3>
            <ul className="space-y-2">
              <li>
                <Link to="/" className="text-gray-400 hover:text-white transition-colors">
                  Trang chủ
                </Link>
              </li>
              <li>
                <Link to="/products" className="text-gray-400 hover:text-white transition-colors">
                  Sản phẩm
                </Link>
              </li>
              <li>
                <Link to="/products?filter=new-arrivals" className="text-gray-400 hover:text-white transition-colors">
                  Sách hay sách mới
                </Link>
              </li>
              <li>
                <Link to="/contact" className="text-gray-400 hover:text-white transition-colors">
                  Liên hệ mua sách
                </Link>
              </li>
            </ul>
          </div>

          {/* Policy Links */}
          <div className="space-y-4">
            <h3 className="text-xl font-bold text-white mb-4">Chính sách</h3>
            <ul className="space-y-2">
              <li>
                <Link to="/chinh-sach-thanh-toan" className="text-gray-400 hover:text-white transition-colors">
                  Chính sách thanh toán
                </Link>
              </li>
              <li>
                <Link to="/chinh-sach-van-chuyen" className="text-gray-400 hover:text-white transition-colors">
                  Chính sách vận chuyển
                </Link>
              </li>
              <li>
                <Link to="/chinh-sach-doi-tra" className="text-gray-400 hover:text-white transition-colors">
                  Chính sách đổi trả
                </Link>
              </li>
              <li>
                <Link to="/chinh-sach-bao-hanh" className="text-gray-400 hover:text-white transition-colors">
                  Chính sách bảo hành
                </Link>
              </li>
            </ul>
          </div>
        </div>

        {/* Newsletter Subscription */}
        <div className="mt-12 pt-8 border-t border-gray-800">
          <div className="max-w-xl mx-auto text-center">
            <h4 className="text-lg font-semibold text-white mb-4">Đăng ký nhận thông tin</h4>
            <form className="flex gap-2">
              <input
                type="email"
                placeholder="Nhập email của bạn"
                className="flex-1 px-4 py-2 rounded-lg bg-gray-800 border border-gray-700 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 text-white placeholder-gray-400"
              />
              <button
                type="submit"
                className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                Đăng ký
              </button>
            </form>
          </div>
        </div>

        {/* Copyright */}
        <div className="mt-12 pt-8 border-t border-gray-800 text-center text-gray-400">
          <p>© {new Date().getFullYear()} Bản quyền thuộc về Sachtaodan.vn | Cung cấp bởi Sapo</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
