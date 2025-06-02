import React from "react";
import ProductCard from "./ProductCard";
import Spinner from "../common/Spinner";
import styles from "./ProductList.module.css";

const ProductList = ({ products = [], loading = false }) => {
  if (loading) {
    return (
      <div className={styles.spinnerWrapper}>
        <Spinner size={50} />
      </div>
    );
  }

  if (!products.length) {
    return <p>Không có sản phẩm nào.</p>;
  }

  return (
    <div className={styles.grid}>
      {products.map((product) => (
        <ProductCard key={product.id} product={product} />
      ))}
    </div>
  );
};

export default ProductList;
