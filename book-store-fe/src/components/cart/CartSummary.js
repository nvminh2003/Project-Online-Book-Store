// src/components/cart/CartSummary.js
import React from "react";
import { Link } from "react-router-dom"; // Import Link
import {
  SHIPPING_CONFIG,
  calculateShippingFee,
} from "../../constants/shipping";
import DiscountCodeInput from "./DiscountCodeInput";

const CartSummary = ({
  subtotal,
  discountAmount,
  shippingFee,
  total,
  onProceedToCheckout,
}) => {
  // Calculate how much more needed for free shipping
  const amountNeededForFreeShipping = Math.max(
    0,
    SHIPPING_CONFIG.FREE_SHIPPING_THRESHOLD - subtotal
  );
  const isEligibleForFreeShipping =
    subtotal >= SHIPPING_CONFIG.FREE_SHIPPING_THRESHOLD;

  return (
    <div className="bg-white shadow-md rounded-lg p-6">
      <h3 className="text-xl font-semibold text-gray-800 border-b border-gray-200 pb-4 mb-4">
        Tóm tắt đơn hàng
      </h3>
      <div className="space-y-2 text-sm text-gray-700">
        <div className="flex justify-between">
          <span>Tạm tính</span>
          <span>{subtotal.toLocaleString("vi-VN")}đ</span>
        </div>
        {/* Free shipping notification */}
        <div
          className={`p-3 rounded-lg ${
            isEligibleForFreeShipping
              ? "bg-green-50 border border-green-200"
              : "bg-blue-50 border border-blue-200"
          }`}
        >
          {isEligibleForFreeShipping ? (
            <div className="flex items-center text-green-700">
              <svg
                className="w-4 h-4 mr-2"
                fill="currentColor"
                viewBox="0 0 20 20"
              >
                <path
                  fillRule="evenodd"
                  d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                  clipRule="evenodd"
                />
              </svg>
              <span className="text-sm font-medium">
                🎉 Bạn được miễn phí vận chuyển!
              </span>
            </div>
          ) : (
            <div className="text-blue-700">
              <div className="flex items-center mb-1">
                <svg
                  className="w-4 h-4 mr-2"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path
                    fillRule="evenodd"
                    d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z"
                    clipRule="evenodd"
                  />
                </svg>
                <span className="text-sm font-medium">
                  🚚 Miễn phí ship cho đơn từ{" "}
                  {SHIPPING_CONFIG.FREE_SHIPPING_THRESHOLD.toLocaleString(
                    "vi-VN"
                  )}
                  đ
                </span>
              </div>
              <span className="text-xs">
                Mua thêm {amountNeededForFreeShipping.toLocaleString("vi-VN")}đ
                để được miễn phí vận chuyển
              </span>
            </div>
          )}
        </div>
        {shippingFee > 0 && (
          <div className="flex justify-between">
            <span>Phí vận chuyển</span>
            <span>{shippingFee.toLocaleString("vi-VN")}đ</span>
          </div>
        )}
        {discountAmount > 0 && (
          <div className="flex justify-between text-green-600">
            <span>Giảm giá</span>
            <span>- {discountAmount.toLocaleString("vi-VN")}đ</span>
          </div>
        )}
        <div className="border-t border-gray-200 pt-3 mt-3">
          <div className="flex justify-between font-semibold text-gray-800 text-lg">
            <span>Tổng cộng</span>
            <span>{total.toLocaleString("vi-VN")}đ</span>
          </div>
        </div>
      </div>

      <div className="mt-6">
        <DiscountCodeInput />
      </div>

      <button
        onClick={onProceedToCheckout}
        className="mt-8 w-full bg-blue-600 text-white py-3 rounded-lg font-semibold hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50 transition duration-150"
      >
        Tiến hành đặt hàng
      </button>

      <div className="mt-6 text-center">
        <Link
          to="/"
          className="text-sm text-blue-500 hover:text-blue-700 no-underline"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-4 w-4 inline mr-1"
            viewBox="0 0 20 20"
            fill="currentColor"
          >
            <path
              fillRule="evenodd"
              d="M9.707 16.707a1 1 0 01-1.414 0l-6-6a1 1 0 010-1.414l6-6a1 1 0 011.414 1.414L5.414 9H17a1 1 0 110 2H5.414l4.293 4.293a1 1 0 010 1.414z"
              clipRule="evenodd"
            />
          </svg>
          Tiếp tục mua sắm
        </Link>
      </div>
    </div>
  );
};

export default CartSummary;
