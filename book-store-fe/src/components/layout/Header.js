import React, { useState } from "react";
import styles from "./Header.module.css";
import { Link } from "react-router-dom";
import Icon from "../../common/Icon";

const Header = () => {
  const [menuOpen, setMenuOpen] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [cartOpen, setCartOpen] = useState(false);
  const cartItemCount = 0; // Placeholder, replace with actual cart count

  const toggleMenu = () => {
    setMenuOpen(!menuOpen);
  };

  const toggleMobileMenu = () => {
    setMobileMenuOpen(!mobileMenuOpen);
  };

  const toggleCart = () => {
    setCartOpen(!cartOpen);
  };

  return (
    <header className={styles.header}>
      {/* Top Bar */}
      <div className={styles.headerTopBar}>
        <div className={styles.topBarLeft}>
          <span>Mon - Fri: 8:00 - 17:30</span>
          <span>Email: sachtaodan@gmail.com</span>
          <span>Hotline: 0777720254</span>
        </div>
        <div className={styles.topBarRight}>
          <button className={styles.iconButton} aria-label="Sản phẩm yêu thích">
            <Icon name="heart" size={20} />
          </button>
          <a
            href="https://facebook.com"
            target="_blank"
            rel="noopener noreferrer"
            className={styles.socialIcon}
          >
            <Icon name="facebook" size={20} />
          </a>
          <a
            href="https://instagram.com"
            target="_blank"
            rel="noopener noreferrer"
            className={styles.socialIcon}
          >
            <Icon name="instagram" size={20} />
          </a>
          <a
            href="https://twitter.com"
            target="_blank"
            rel="noopener noreferrer"
            className={styles.socialIcon}
          >
            <Icon name="twitter" size={20} />
          </a>
          <Link to="/auth/login" className={styles.topBarLink}>
            Đăng nhập
          </Link>
          <Link to="/auth/register" className={styles.topBarLink}>
            Đăng ký
          </Link>
        </div>
      </div>

      {/* Main Header */}
      <div className={styles.container}>
        <div className={styles.logo}>
          <Link to="/">
            <img src="/logo192.png" alt="SÁCH TAO ĐÀN" />
          </Link>
        </div>
        <div className={styles.searchCartList}>
          <div className={styles.search}>
            <input type="text" placeholder="Tìm kiếm..." />
            <button aria-label="Search">
              <Icon name="search" size={20} />
            </button>
          </div>
          <div className={styles.cartTotal}>
            <button
              className={styles.cartButton}
              onClick={toggleCart}
              aria-label="Giỏ hàng"
            >
              Giỏ hàng: {cartItemCount} sản phẩm
              <Icon name="cart" size={24} />
            </button>
            {cartOpen && (
              <div className={styles.miniCartContent + " shopping_cart"}>
                {/* Placeholder for mini cart details */}
                <p>Giỏ hàng của bạn đang trống.</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Main Menu */}
      <nav id="nav" className={styles.mainMenu}>
        <ul>
          <li>
            <Link to="/">SÁCH TAO ĐÀN</Link>
          </li>
          <li className={styles.hasDropdown}>
            <span>DANH SÁCH SẢN PHẨM</span>
            <ul className={styles.dropdown}>
              <li>Văn học tiền chiến</li>
              <li>Nobel văn chương</li>
              {/* Add more categories as needed */}
            </ul>
          </li>
          <li>
            <Link to="/blog">SÁCH HAY SÁCH MỚI</Link>
          </li>
          <li>
            <Link to="/limited-edition">BÌA CỨNG GIỚI HẠN</Link>
          </li>
          <li className={styles.hasDropdown}>
            <span>TIN TỨC</span>
            <ul className={styles.dropdown}>
              <li>Tác Giả</li>
              <li>Tác Phẩm</li>
            </ul>
          </li>
          <li>
            <Link to="/payment-info">THÔNG TIN THANH TOÁN</Link>
          </li>
          <li>
            <Link to="/sales-policy">CHÍNH SÁCH BÁN HÀNG</Link>
          </li>
          <li>
            <Link to="/about-us">ABOUT US</Link>
          </li>
        </ul>
      </nav>

      {/* Mobile Menu */}
      <div className={styles.mobileMenuArea}>
        <button
          className={styles.mobileMenuToggle}
          aria-label="Toggle mobile menu"
          onClick={toggleMobileMenu}
        >
          <span className={styles.hamburger} />
        </button>
        {mobileMenuOpen && (
          <nav className={styles.mobileMenu}>
            <ul>
              <li>
                <Link to="/">SÁCH TAO ĐÀN</Link>
              </li>
              <li className={styles.hasDropdown}>
                <span>DANH SÁCH SẢN PHẨM</span>
                <ul className={styles.dropdown}>
                  <li>Văn học tiền chiến</li>
                  <li>Nobel văn chương</li>
                </ul>
              </li>
              <li>
                <Link to="/blog">SÁCH HAY SÁCH MỚI</Link>
              </li>
              <li>
                <Link to="/limited-edition">BÌA CỨNG GIỚI HẠN</Link>
              </li>
              <li className={styles.hasDropdown}>
                <span>TIN TỨC</span>
                <ul className={styles.dropdown}>
                  <li>Tác Giả</li>
                  <li>Tác Phẩm</li>
                </ul>
              </li>
              <li>
                <Link to="/payment-info">THÔNG TIN THANH TOÁN</Link>
              </li>
              <li>
                <Link to="/sales-policy">CHÍNH SÁCH BÁN HÀNG</Link>
              </li>
              <li>
                <Link to="/about-us">ABOUT US</Link>
              </li>
            </ul>
          </nav>
        )}
      </div>
    </header>
  );
};

export default Header;
