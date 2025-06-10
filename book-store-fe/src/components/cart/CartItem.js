// src/components/cart/CartItem.js
import React from "react";

const CartItem = ({ item, onQuantityChange, onRemoveItem }) => {
  const handleIncreaseQuantity = () => {
    onQuantityChange(item.id, item.quantity + 1);
  };

  const handleDecreaseQuantity = () => {
    if (item.quantity > 1) {
      onQuantityChange(item.id, item.quantity - 1);
    }
  };

  const handleInputChange = (e) => {
    const newQuantity = parseInt(e.target.value, 10);
    if (!isNaN(newQuantity) && newQuantity >= 1) {
      onQuantityChange(item.id, newQuantity);
    } else if (e.target.value === "") {
      // Cho phép input rỗng tạm thời, có thể xử lý khi blur hoặc debounce
    }
  };

  return (
    <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between">
      <div className="flex items-start sm:items-center mb-4 sm:mb-0 w-full sm:w-auto">
        <img
          src={
            item.imageUrl || "https://via.placeholder.com/80x100.png?text=Book"
          }
          alt={item.name}
          className="w-20 h-25 object-cover rounded mr-4 flex-shrink-0" //Sửa lỗi gõ
        />
        <div className="flex-grow">
          <h3 className="text-lg font-semibold text-gray-800 hover:text-blue-600 cursor-pointer">
            {/* <Link to={`/products/${item.slug || item.id}`}>{item.name}</Link> */}
            {item.name}
          </h3>
          {item.author && (
            <p className="text-sm text-gray-500">Tác giả: {item.author}</p>
          )}
          {item.originalPrice && item.originalPrice > item.price && (
            <p className="text-sm text-red-500 line-through">
              {item.originalPrice.toLocaleString("vi-VN")}đ
            </p>
          )}
          <p className="text-md font-bold text-blue-600">
            {item.price.toLocaleString("vi-VN")}đ
          </p>
        </div>
      </div>
      <div className="flex items-center space-x-2 sm:space-x-3 mt-4 sm:mt-0 ml-0 sm:ml-4">
        <div className="flex items-center border border-gray-300 rounded">
          <button
            onClick={handleDecreaseQuantity}
            className="px-3 py-1 text-gray-600 hover:bg-gray-100 rounded-l focus:outline-none"
            aria-label="Giảm số lượng"
          >
            -
          </button>
          <input
            type="number"
            value={item.quantity}
            onChange={handleInputChange}
            className="w-12 text-center border-l border-r border-gray-300 focus:outline-none appearance-none [-moz-appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
            aria-label="Số lượng sản phẩm"
            min="1"
          />
          <button
            onClick={handleIncreaseQuantity}
            className="px-3 py-1 text-gray-600 hover:bg-gray-100 rounded-r focus:outline-none"
            aria-label="Tăng số lượng"
          >
            +
          </button>
        </div>
        <p className="text-md font-semibold text-gray-700 w-24 text-right">
          {(item.price * item.quantity).toLocaleString("vi-VN")}đ
        </p>
        <button
          onClick={() => onRemoveItem(item.id)}
          className="text-red-500 hover:text-red-700 focus:outline-none"
          aria-label="Xóa sản phẩm"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-5 w-5"
            viewBox="0 0 20 20"
            fill="currentColor"
          >
            <path
              fillRule="evenodd"
              d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z"
              clipRule="evenodd"
            />
          </svg>
        </button>
      </div>
    </div>
  );
};

export default CartItem;
