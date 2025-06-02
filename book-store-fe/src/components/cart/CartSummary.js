import React, { useState } from "react";
import styles from "./CartSummary.module.css";

const CartSummary = ({
  subtotal = 0,
  shippingFee = 0,
  discount = 0,
  total = 0,
  onApplyCoupon,
}) => {
  const [couponCode, setCouponCode] = useState("");

  const handleApplyCoupon = () => {
    onApplyCoupon && onApplyCoupon(couponCode);
  };

  return (
    <div className={styles.cartSummary}>
      <h3>Tóm tắt giỏ hàng</h3>
      <div className={styles.row}>
        <span>Tạm tính:</span>
        <span>{subtotal.toLocaleString()}₫</span>
      </div>
      <div className={styles.row}>
        <span>Phí vận chuyển:</span>
        <span>{shippingFee.toLocaleString()}₫</span>
      </div>
      <div className={styles.row}>
        <span>Giảm giá:</span>
        <span>-{discount.toLocaleString()}₫</span>
      </div>
      <div className={styles.totalRow}>
        <span>Tổng cộng:</span>
        <span>{total.toLocaleString()}₫</span>
      </div>
      <div className={styles.coupon}>
        <input
          type="text"
          placeholder="Nhập mã giảm giá"
          value={couponCode}
          onChange={(e) => setCouponCode(e.target.value)}
        />
        <button onClick={handleApplyCoupon}>Áp dụng</button>
      </div>
      <button className={styles.checkoutButton}>Tiến hành đặt hàng</button>
    </div>
  );
};

export default CartSummary;
