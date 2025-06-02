import React, { useState } from "react";
import styles from "./ProductImageGallery.module.css";

const ProductImageGallery = ({ images = [] }) => {
  const [mainImageIndex, setMainImageIndex] = useState(0);

  if (!images.length) {
    return <div className={styles.noImage}>No images available</div>;
  }

  const handleThumbnailClick = (index) => {
    setMainImageIndex(index);
  };

  return (
    <div className={styles.gallery}>
      <div className={styles.mainImageWrapper}>
        <img
          src={images[mainImageIndex]}
          alt={`Product image ${mainImageIndex + 1}`}
          className={styles.mainImage}
        />
      </div>
      <div className={styles.thumbnails}>
        {images.map((img, idx) => (
          <button
            key={idx}
            className={`${styles.thumbnail} ${
              idx === mainImageIndex ? styles.active : ""
            }`}
            onClick={() => handleThumbnailClick(idx)}
            aria-label={`Thumbnail ${idx + 1}`}
          >
            <img src={img} alt={`Thumbnail ${idx + 1}`} />
          </button>
        ))}
      </div>
    </div>
  );
};

export default ProductImageGallery;
