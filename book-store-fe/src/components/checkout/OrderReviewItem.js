import React from "react";

const OrderReviewItem = ({ item }) => {
  const { coverImage, title, quantity, price } = item;

  return (
    <div className="flex items-center gap-4 p-3 border-b border-gray-300">
      <img
        src={coverImage}
        alt={title}
        className="w-20 h-24 object-cover rounded"
      />
      <div className="flex-grow flex flex-col gap-1">
        <div className="font-bold text-base text-gray-800">{title}</div>
        <div className="text-sm text-gray-600">Số lượng: {quantity}</div>
        <div className="font-bold text-red-700 text-base">
          {price.toLocaleString()}₫
        </div>
      </div>
    </div>
  );
};

export default OrderReviewItem;
