import React from "react";
import styles from "./Footer.module.css";
import { Link } from "react-router-dom";

const Footer = () => {
  return (
    <footer className={styles.footer}>
      <div className={styles.contact}>
        <h3>Thông tin liên hệ</h3>
        <p>Địa chỉ: 123 Đường Sách, Quận 1, TP. HCM</p>
        <p>Điện thoại: 0123 456 789</p>
        <p>Email: contact@sachtaodan.vn</p>
        <p>Giờ làm việc: 8:00 - 18:00</p>
      </div>
      <div className={styles.links}>
        <div>
          <h4>Chính sách</h4>
          <ul>
            <li>
              <Link to="/terms">Điều khoản</Link>
            </li>
            <li>
              <Link to="/shipping">Vận chuyển</Link>
            </li>
            <li>
              <Link to="/returns">Đổi trả</Link>
            </li>
          </ul>
        </div>
        <div>
          <h4>Hướng dẫn</h4>
          <ul>
            <li>
              <Link to="/guide">Hướng dẫn mua hàng</Link>
            </li>
            <li>
              <Link to="/faq">Câu hỏi thường gặp</Link>
            </li>
          </ul>
        </div>
      </div>
      <div className={styles.copyright}>
        © Bản quyền thuộc về Sachtaodan.vn | Cung cấp bởi Sapo
      </div>
    </footer>
  );
};

export default Footer;
