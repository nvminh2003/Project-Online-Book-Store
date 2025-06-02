import React from "react";
import styles from "./CartItem.module.css";

const CartItem = ({ item, onQuantityChange, onRemoveItem }) => {
  const { id, coverImage, title, quantity, price } = item;

  const handleQuantityChange = (e) => {
    const val = parseInt(e.target.value, 10);
    if (val > 0) {
      onQuantityChange(id, val);
    }
  };

  return (
    <div className={styles.cartItem}>
      <img src={coverImage} alt={title} className={styles.coverImage} />
      <div className={styles.info}>
        <div className={styles.title}>{title}</div>
        <div className={styles.price}>{price.toLocaleString()}₫</div>
        <div className={styles.quantity}>
          <label htmlFor={`quantity-${id}`}>Số lượng:</label>
          <input
            id={`quantity-${id}`}
            type="number"
            min="1"
            value={quantity}
            onChange={handleQuantityChange}
          />
        </div>
        <button
          className={styles.removeButton}
          onClick={() => onRemoveItem(id)}
        >
          Xóa
        </button>
      </div>
      <div className={styles.totalPrice}>
        {(price * quantity).toLocaleString()}₫
      </div>
    </div>
  );
};

export default CartItem;
