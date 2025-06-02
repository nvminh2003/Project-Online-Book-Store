import React from "react";
import styles from "./OrderReviewItem.module.css";

const OrderReviewItem = ({ item }) => {
  const { coverImage, title, quantity, price } = item;

  return (
    <div className={styles.orderReviewItem}>
      <img src={coverImage} alt={title} className={styles.coverImage} />
      <div className={styles.info}>
        <div className={styles.title}>{title}</div>
        <div className={styles.quantity}>Số lượng: {quantity}</div>
        <div className={styles.price}>{price.toLocaleString()}₫</div>
      </div>
    </div>
  );
};

export default OrderReviewItem;
