import React from "react";
import ProductCard from "./ProductCard";
import Spinner from "../common/Spinner";

const ProductList = ({ products = [], loading = false }) => {
  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-[200px]">
        <Spinner size={50} />
      </div>
    );
  }

  if (!products.length) {
    return <p>Không có sản phẩm nào.</p>;
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
      {products.map((product) => (
        <ProductCard key={product.id} product={product} />
      ))}
    </div>
  );
};

export default ProductList;
