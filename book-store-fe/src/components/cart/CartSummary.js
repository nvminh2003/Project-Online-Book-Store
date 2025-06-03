import React, { useState } from "react";

const CartSummary = ({
  subtotal = 0,
  shippingFee = 0,
  discount = 0,
  total = 0,
  onApplyCoupon,
}) => {
  const [couponCode, setCouponCode] = useState("");

  const handleApplyCoupon = () => {
    onApplyCoupon && onApplyCoupon(couponCode);
  };

  return (
    <div className="border border-gray-300 rounded p-4 bg-white max-w-xs">
      <h3 className="mb-4 font-bold text-lg">Tóm tắt giỏ hàng</h3>
      <div className="flex justify-between mb-2 text-base">
        <span>Tạm tính:</span>
        <span>{subtotal.toLocaleString()}₫</span>
      </div>
      <div className="flex justify-between mb-2 text-base">
        <span>Phí vận chuyển:</span>
        <span>{shippingFee.toLocaleString()}₫</span>
      </div>
      <div className="flex justify-between mb-2 text-base">
        <span>Giảm giá:</span>
        <span>-{discount.toLocaleString()}₫</span>
      </div>
      <div className="flex justify-between font-bold text-lg mt-4 pt-2 border-t border-gray-300">
        <span>Tổng cộng:</span>
        <span>{total.toLocaleString()}₫</span>
      </div>
      <div className="flex gap-2 my-4">
        <input
          type="text"
          placeholder="Nhập mã giảm giá"
          value={couponCode}
          onChange={(e) => setCouponCode(e.target.value)}
          className="flex-grow p-2 text-base border border-gray-300 rounded"
        />
        <button
          onClick={handleApplyCoupon}
          className="bg-blue-600 text-white px-4 rounded font-semibold hover:bg-blue-700 transition-colors"
        >
          Áp dụng
        </button>
      </div>
      <button className="w-full bg-green-600 text-white py-3 rounded font-bold hover:bg-green-700 transition-colors">
        Tiến hành đặt hàng
      </button>
    </div>
  );
};

export default CartSummary;
