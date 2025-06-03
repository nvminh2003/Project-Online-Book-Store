import React from "react";

const CartItem = ({ item, onQuantityChange, onRemoveItem }) => {
  const { id, coverImage, title, quantity, price } = item;

  const handleQuantityChange = (e) => {
    const val = parseInt(e.target.value, 10);
    if (val > 0) {
      onQuantityChange(id, val);
    }
  };

  return (
    <div className="flex items-center gap-4 p-3 border-b border-gray-300">
      <img
        src={coverImage}
        alt={title}
        className="w-20 h-24 object-cover rounded"
      />
      <div className="flex-grow flex flex-col gap-2">
        <div className="font-bold text-base text-gray-800">{title}</div>
        <div className="text-red-700 font-semibold">
          {price.toLocaleString()}₫
        </div>
        <div className="flex items-center gap-2">
          <label htmlFor={`quantity-${id}`}>Số lượng:</label>
          <input
            id={`quantity-${id}`}
            type="number"
            min="1"
            value={quantity}
            onChange={handleQuantityChange}
            className="w-16 p-1 text-base border border-gray-300 rounded"
          />
        </div>
        <button
          className="bg-transparent border-none text-red-600 cursor-pointer font-semibold p-0 self-start"
          onClick={() => onRemoveItem(id)}
        >
          Xóa
        </button>
      </div>
      <div className="font-bold text-base text-gray-800 min-w-[100px] text-right">
        {(price * quantity).toLocaleString()}₫
      </div>
    </div>
  );
};

export default CartItem;
