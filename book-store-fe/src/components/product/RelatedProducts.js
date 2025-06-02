import React from "react";
import ProductCard from "./ProductCard";
import styles from "./RelatedProducts.module.css";

const RelatedProducts = ({ products = [] }) => {
  if (!products.length) {
    return null;
  }

  return (
    <section className={styles.relatedProducts}>
      <h2>Sản phẩm liên quan</h2>
      <div className={styles.grid}>
        {products.map((product) => (
          <ProductCard key={product.id} product={product} />
        ))}
      </div>
    </section>
  );
};

export default RelatedProducts;
