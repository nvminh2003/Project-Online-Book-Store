import React, { useState } from "react";
import ProductImageGallery from "./ProductImageGallery";

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
    <div className="flex flex-col md:flex-row gap-8">
      <div className="md:w-1/2">
        <ProductImageGallery images={images} />
      </div>
      <div className="md:w-1/2 space-y-4">
        <h1 className="text-2xl font-bold">{title}</h1>
        {author && (
          <div>
            Tác giả:{" "}
            <a
              href={`/authors/${authorSlug}`}
              className="text-blue-600 hover:underline"
            >
              {author}
            </a>
          </div>
        )}
        {publisher && (
          <div>
            Nhà xuất bản:{" "}
            <a
              href={`/publishers/${publisherSlug}`}
              className="text-blue-600 hover:underline"
            >
              {publisher}
            </a>
          </div>
        )}
        <div className="flex items-center space-x-4 text-lg">
          {originalPrice && (
            <span className="line-through text-gray-500">
              {originalPrice.toLocaleString()}₫
            </span>
          )}
          <span className="text-red-600 font-bold">
            {salePrice.toLocaleString()}₫
          </span>
          {discountPercent > 0 && (
            <span className="bg-red-100 text-red-600 text-xs font-semibold px-2 py-0.5 rounded">
              -{discountPercent}%
            </span>
          )}
        </div>
        <div className="space-y-1 text-sm text-gray-700">
          <div>Loại bìa: {coverType}</div>
          <div>Số trang: {pageCount}</div>
          <div>Kích thước: {size}</div>
          <div>ISBN: {isbn}</div>
        </div>
        <div className="flex items-center space-x-2">
          <label htmlFor="quantity" className="font-semibold">
            Số lượng:
          </label>
          <input
            id="quantity"
            type="number"
            min="1"
            value={quantity}
            onChange={handleQuantityChange}
            className="w-16 border border-gray-300 rounded px-2 py-1"
          />
        </div>
        <div className="flex space-x-4">
          <button
            className="flex-1 bg-blue-600 text-white py-2 rounded hover:bg-blue-700 transition-colors duration-300"
            onClick={handleAddToCart}
          >
            Thêm vào giỏ hàng
          </button>
          <button className="flex-1 border border-blue-600 text-blue-600 py-2 rounded hover:bg-blue-100 transition-colors duration-300">
            Mua ngay
          </button>
        </div>
      </div>
      <div
        className="prose max-w-none"
        dangerouslySetInnerHTML={{ __html: description }}
      />
      {/* Optional author info and reviews can be added here */}
    </div>
  );
};

export default ProductDetailView;
