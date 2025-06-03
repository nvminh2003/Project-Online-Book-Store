import React from "react";
import Link from "next/link";

const Footer = () => {
  return (
    <footer className="w-full bg-gray-100 text-gray-700">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 grid grid-cols-1 md:grid-cols-3 lg:grid-cols-6 gap-8">
        {/* Column 1: Company Info */}
        <div>
          <h3 className="font-bold mb-4">Công ty Cổ phần Sách Tao Đàn</h3>
          <p>Chúng tôi cung cấp sách chất lượng cao và dịch vụ tốt nhất.</p>
        </div>

        {/* Column 2: Contact Info */}
        <div>
          <h3 className="font-bold mb-4">Kênh thông tin liên hệ</h3>
          <p>Địa chỉ văn phòng Hà Nội: (Địa chỉ cụ thể)</p>
          <p>Số điện thoại: 024.2214.9698</p>
          <p>Hotline: 0974.148.047 / 0777720254</p>
          <p>Email: info@sachtaodan.vn / sachtaodan@gmail.com</p>
          <p>Giờ làm việc: 8h00-17h30 từ thứ 2 đến thứ 6.</p>
          <p>Hỗ trợ ngoài giờ hành chính: 0974 148 047.</p>
          <p className="font-bold">CHỈ BÁN ONLINE</p>
        </div>

        {/* Column 3: Customer Info Links */}
        <div>
          <h3 className="font-bold mb-4">Thông tin khách hàng</h3>
          <ul>
            <li>
              <Link href="/">
                <a className="hover:underline">Trang chủ</a>
              </Link>
            </li>
            <li>
              <Link href="/products">
                <a className="hover:underline">Sản phẩm</a>
              </Link>
            </li>
            <li>
              <Link href="/products?filter=new-arrivals">
                <a className="hover:underline">Sách hay sách mới</a>
              </Link>
            </li>
            <li>
              <Link href="/contact">
                <a className="hover:underline">Liên hệ mua sách</a>
              </Link>
            </li>
          </ul>
        </div>

        {/* Column 4: Service Support Links */}
        <div>
          <h3 className="font-bold mb-4">Hỗ trợ dịch vụ</h3>
          <ul>
            <li>
              <Link href="/dieu-khoan-su-dung">
                <a className="hover:underline">Điều khoản sử dụng</a>
              </Link>
            </li>
            <li>
              <Link href="/dieu-khoan-giao-dich">
                <a className="hover:underline">Điều khoản giao dịch</a>
              </Link>
            </li>
            <li>
              <Link href="/quyen-so-huu-tri-tue">
                <a className="hover:underline">Quyền sở hữu trí tuệ</a>
              </Link>
            </li>
            <li>
              <Link href="/dich-vu-tien-ich">
                <a className="hover:underline">Dịch vụ tiện ích</a>
              </Link>
            </li>
          </ul>
        </div>

        {/* Column 5: Policy Links */}
        <div>
          <h3 className="font-bold mb-4">Chính sách ưu đãi</h3>
          <ul>
            <li>
              <Link href="/chinh-sach-thanh-toan">
                <a className="hover:underline">Chính sách thanh toán</a>
              </Link>
            </li>
            <li>
              <Link href="/chinh-sach-van-chuyen">
                <a className="hover:underline">Chính sách vận chuyển</a>
              </Link>
            </li>
            <li>
              <Link href="/chinh-sach-doi-tra">
                <a className="hover:underline">Chính sách đổi trả</a>
              </Link>
            </li>
            <li>
              <Link href="/chinh-sach-bao-hanh">
                <a className="hover:underline">Chính sách bảo hành</a>
              </Link>
            </li>
          </ul>
        </div>

        {/* Column 6: Service Guide Links */}
        <div>
          <h3 className="font-bold mb-4">Hướng dẫn dịch vụ</h3>
          <ul>
            <li>
              <Link href="/doi-tra-bao-hanh">
                <a className="hover:underline">Đổi trả và bảo hành</a>
              </Link>
            </li>
            <li>
              <Link href="/huong-dan-mua-hang">
                <a className="hover:underline">Hướng dẫn mua hàng</a>
              </Link>
            </li>
            <li>
              <Link href="/giao-nhan-thanh-toan">
                <a className="hover:underline">Giao nhận và thanh toán</a>
              </Link>
            </li>
            <li>
              <Link href="/auth/register">
                <a className="hover:underline">Đăng ký thành viên</a>
              </Link>
            </li>
          </ul>
        </div>
      </div>

      {/* Copyright Row */}
      <div className="bg-gray-200 text-center py-4 text-sm">
        © Bản quyền thuộc về Sachtaodan.vn | Cung cấp bởi Sapo
      </div>
    </footer>
  );
};

export default Footer;
