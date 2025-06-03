import React from "react";
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
    <div className="border rounded-md overflow-hidden shadow hover:shadow-lg transition-shadow duration-300">
      <Link to={`/products/${slug}`} className="block overflow-hidden">
        <img
          src={coverImage}
          alt={title}
          className="w-full h-48 object-cover"
        />
      </Link>
      <div className="p-4">
        <Link
          to={`/products/${slug}`}
          className="text-lg font-semibold text-gray-900 hover:text-blue-600"
        >
          {title}
        </Link>
        {author && <div className="text-sm text-gray-600 mt-1">{author}</div>}
        <div className="mt-2 flex items-center space-x-2">
          {originalPrice && (
            <span className="line-through text-gray-500 text-sm">
              {originalPrice.toLocaleString()}₫
            </span>
          )}
          <span className="text-red-600 font-bold text-lg">
            {salePrice.toLocaleString()}₫
          </span>
          {discountPercent > 0 && (
            <span className="bg-red-100 text-red-600 text-xs font-semibold px-2 py-0.5 rounded">
              -{discountPercent}%
            </span>
          )}
        </div>
        <button className="mt-4 w-full bg-blue-600 text-white py-2 rounded hover:bg-blue-700 transition-colors duration-300">
          Thêm vào giỏ
        </button>
      </div>
    </div>
  );
};

export default ProductCard;
