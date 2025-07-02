import React, { useState, useEffect } from "react";

const CartItem = ({ item, onQuantityChange, onRemoveItem }) => {
  const [inputValue, setInputValue] = useState(item?.quantity || 1);
  const [warning, setWarning] = useState("");

  useEffect(() => {
    // Đồng bộ giá trị input cục bộ với trạng thái từ component cha khi nó thay đổi
    if (item?.quantity !== Number(inputValue)) {
      setInputValue(item.quantity);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [item.quantity]);

  if (!item || !item.book) return null;

  const { book, quantity } = item;
  const { title, sellingPrice, images, stockQuantity } = book;
  const thumbnail = images?.[0] || "/default-book.png";

  // Xử lý khi người dùng nhập vào ô input
  const handleInputChange = (e) => {
    const value = e.target.value;
    // Chỉ cho phép nhập số
    if (/^[0-9]*$/.test(value)) {
      setInputValue(value);
      setWarning("");
    }
  };

  // Xử lý khi người dùng rời khỏi ô input
  const handleInputBlur = () => {
    let num = Number(inputValue);

    // Nếu giá trị không phải là số hoặc không thay đổi, hoàn nguyên về số lượng ban đầu từ props
    if (isNaN(num) || num === quantity) {
      setInputValue(quantity);
      setWarning("");
      return;
    }

    if (num > stockQuantity) {
      num = stockQuantity;
      setWarning(`Chỉ còn ${stockQuantity} sản phẩm trong kho.`);
    } else if (num < 1) {
      num = 1;
      setWarning("Số lượng tối thiểu là 1.");
    } else {
      setWarning("");
    }

    // Cập nhật lại giá trị hiển thị trên input
    setInputValue(num);
    // Gọi API để cập nhật trong DB
    onQuantityChange(num);
  };

  // Xử lý khi nhấn nút giảm số lượng
  const handleDecrement = () => {
    const currentVal = Number(quantity);
    if (currentVal > 1) {
      const newVal = currentVal - 1;
      onQuantityChange(newVal); // Cập nhật ngay lập tức
    }
  };

  // Xử lý khi nhấn nút tăng số lượng
  const handleIncrement = () => {
    const currentVal = Number(quantity);
    if (currentVal < stockQuantity) {
      const newVal = currentVal + 1;
      onQuantityChange(newVal); // Cập nhật ngay lập tức
    }
  };

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
        <div className="flex items-center mt-2 gap-2">
          <label
            htmlFor={`quantity-${book._id}`}
            className="text-sm text-gray-700"
          >
            Số lượng:
          </label>
          <div className="flex items-center border border-gray-300 rounded-md overflow-hidden">
            <button
              onClick={handleDecrement}
              disabled={quantity <= 1}
              className="px-3 py-1 text-gray-700 bg-gray-100 hover:bg-gray-200 focus:outline-none disabled:opacity-50 disabled:cursor-not-allowed"
            >
              -
            </button>
            <input
              id={`quantity-${book._id}`}
              type="text"
              inputMode="numeric"
              value={inputValue}
              onChange={handleInputChange}
              onBlur={handleInputBlur}
              className="w-12 p-1 text-center border-l border-r border-gray-300 focus:outline-none"
            />
            <button
              onClick={handleIncrement}
              disabled={quantity >= stockQuantity}
              className="px-3 py-1 text-gray-700 bg-gray-100 hover:bg-gray-200 focus:outline-none disabled:opacity-50 disabled:cursor-not-allowed"
            >
              +
            </button>
          </div>
          <span className="text-xs text-gray-500">
            / Kho: {stockQuantity ?? "?"}
          </span>
        </div>
        {warning && <div className="text-xs text-red-500 mt-1">{warning}</div>}
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