import React, { useState } from "react";
import ProductImageGallery from "./ProductImageGallery";
import styles from "./ProductDetailView.module.css";

const ProductDetailView = ({ product, onAddToCart }) => {
  const [quantity, setQuantity] = useState(1);

  if (!product) {
    return <div>Không có thông tin sản phẩm.</div>;
  }

  const {
    images = [],
    title,
    author,
    authorSlug,
    publisher,
    publisherSlug,
    originalPrice,
    salePrice,
    discountPercent,
    coverType,
    pageCount,
    size,
    isbn,
    description,
  } = product;

  const handleQuantityChange = (e) => {
    const val = parseInt(e.target.value, 10);
    if (val > 0) {
      setQuantity(val);
    }
  };

  const handleAddToCart = () => {
    onAddToCart && onAddToCart(product, quantity);
  };

  return (
    <div className={styles.container}>
      <div className={styles.gallerySection}>
        <ProductImageGallery images={images} />
      </div>
      <div className={styles.infoSection}>
        <h1 className={styles.title}>{title}</h1>
        {author && (
          <div className={styles.author}>
            Tác giả:{" "}
            <a href={`/authors/${authorSlug}`} className={styles.link}>
              {author}
            </a>
          </div>
        )}
        {publisher && (
          <div className={styles.publisher}>
            Nhà xuất bản:{" "}
            <a href={`/publishers/${publisherSlug}`} className={styles.link}>
              {publisher}
            </a>
          </div>
        )}
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
        <div className={styles.details}>
          <div>Loại bìa: {coverType}</div>
          <div>Số trang: {pageCount}</div>
          <div>Kích thước: {size}</div>
          <div>ISBN: {isbn}</div>
        </div>
        <div className={styles.quantitySelector}>
          <label htmlFor="quantity">Số lượng:</label>
          <input
            id="quantity"
            type="number"
            min="1"
            value={quantity}
            onChange={handleQuantityChange}
          />
        </div>
        <div className={styles.buttons}>
          <button className={styles.addToCartButton} onClick={handleAddToCart}>
            Thêm vào giỏ hàng
          </button>
          <button className={styles.buyNowButton}>Mua ngay</button>
        </div>
      </div>
      <div
        className={styles.description}
        dangerouslySetInnerHTML={{ __html: description }}
      />
      {/* Optional author info and reviews can be added here */}
    </div>
  );
};

export default ProductDetailView;
