import React from "react";
import ProductCard from "./ProductCard";

const RelatedProducts = ({ products = [] }) => {
  if (!products.length) {
    return null;
  }

  return (
    <section className="space-y-4">
      <h2 className="text-xl font-semibold">Sản phẩm liên quan</h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
        {products.map((product) => (
          <ProductCard key={product.id} product={product} />
        ))}
      </div>
    </section>
  );
};

export default RelatedProducts;
