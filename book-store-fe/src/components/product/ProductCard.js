import React from "react";
import styles from "./ProductCard.module.css";
import { Link } from "react-router-dom";

const ProductCard = ({ product }) => {
  const {
    id,
    slug,
    coverImage,
    title,
    author,
    originalPrice,
    salePrice,
    discountPercent,
  } = product;

  return (
    <div className={styles.card}>
      <Link to={`/products/${slug}`} className={styles.imageWrapper}>
        <img src={coverImage} alt={title} className={styles.coverImage} />
      </Link>
      <div className={styles.info}>
        <Link to={`/products/${slug}`} className={styles.title}>
          {title}
        </Link>
        {author && <div className={styles.author}>{author}</div>}
        <div className={styles.priceSection}>
          {originalPrice && (
            <span className={styles.originalPrice}>
              {originalPrice.toLocaleString()}₫
            </span>
          )}
          <span className={styles.salePrice}>
            {salePrice.toLocaleString()}₫
          </span>
          {discountPercent > 0 && (
            <span className={styles.discountPercent}>-{discountPercent}%</span>
          )}
        </div>
        <button className={styles.addToCartButton}>Thêm vào giỏ</button>
      </div>
    </div>
  );
};

export default ProductCard;
