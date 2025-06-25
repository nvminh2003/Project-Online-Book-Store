import React, { useState } from "react";

const CartItem = ({ item, onQuantityChange, onRemoveItem }) => {
  const [inputValue, setInputValue] = useState(item?.quantity || 1);
  const [warning, setWarning] = useState("");

  if (!item || !item.book) return null;

  const { book, quantity } = item;
  const { title, sellingPrice, images, stockQuantity } = book;
  const thumbnail = images?.[0] || "/default-book.png";

  const handleInputChange = (e) => {
    const value = e.target.value;
    if (!/^[0-9]*$/.test(value)) return;
    setInputValue(value);
    setWarning("");
  };

  const handleInputBlur = () => {
    let num = Number(inputValue);
    if (num > stockQuantity) {
      setInputValue(stockQuantity);
      setWarning(`Chỉ còn ${stockQuantity} sản phẩm trong kho.`);
      onQuantityChange(stockQuantity);
    } else if (num < 1 || !num) {
      setInputValue(1);
      setWarning("Số lượng tối thiểu là 1.");
      onQuantityChange(1);
    } else {
      setWarning("");
      if (num !== quantity) onQuantityChange(num);
    }
  };

  return (
    <div className="flex items-center gap-6">
      {console.log("CartItem book:", book)}
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
          <label className="text-sm text-gray-700">Số lượng:</label>
          <input
            type="number"
            min={1}
            max={stockQuantity}
            value={inputValue}
            onChange={handleInputChange}
            onBlur={handleInputBlur}
            className="w-16 p-1 border rounded text-center"
          />
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
