import React from "react";

const CartItem = ({ item, onQuantityChange, onRemoveItem }) => {
  if (!item || !item.book) return null;

  const { book, quantity } = item;
  const { title, sellingPrice, images } = book;
  const thumbnail = images?.[0] || "/default-book.png";

  return (
    <div className="flex items-center gap-6">
      {/* Hình ảnh sách */}
      <div className="w-24 h-32 bg-gray-100 flex-shrink-0 rounded overflow-hidden">
        <img
          src={thumbnail || "/default-book.png"}
          alt={title}
          className="w-full h-full object-cover"
        />
      </div>

      {/* Thông tin và hành động */}
      <div className="flex-grow">
        <h2 className="text-lg font-medium">{title}</h2>
        <p className="text-gray-500">Giá: {sellingPrice.toLocaleString()}đ</p>

        {/* Bộ điều khiển số lượng */}
        <div className="flex items-center mt-2">
          <button
            onClick={() => onQuantityChange(quantity - 1)}
            disabled={quantity <= 1}
            className="px-2 py-1 bg-gray-200 text-gray-700 rounded hover:bg-gray-300 disabled:opacity-50"
          >
            -
          </button>
          <span className="mx-3">{quantity}</span>
          <button
            onClick={() => onQuantityChange(quantity + 1)}
            className="px-2 py-1 bg-gray-200 text-gray-700 rounded hover:bg-gray-300"
          >
            +
          </button>
        </div>

        {/* Nút xoá */}
        <div className="mt-2">
          <button
            onClick={onRemoveItem}
            className="text-red-500 hover:underline text-sm"
          >
            Xoá
          </button>
        </div>
      </div>
    </div>
  );
};

export default CartItem;
