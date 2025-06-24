// src/components/cart/EmptyCart.js
import React from "react";
import { Link } from "react-router-dom";

const EmptyCart = () => {
  return (
    <div className="text-center py-10 lg:py-20 bg-white shadow-md rounded-lg">
      <svg
        xmlns="http://www.w3.org/2000/svg"
        className="mx-auto h-16 w-16 text-gray-400 mb-6"
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
        strokeWidth="1"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z"
        />
      </svg>
      <h2 className="text-2xl font-semibold text-gray-700 mb-2">
        Giỏ hàng của bạn đang trống
      </h2>
      <p className="text-gray-500 mb-6">
        Có vẻ như bạn chưa thêm sản phẩm nào vào giỏ hàng.
      </p>
      <Link
        to="/" // Hoặc trang sản phẩm '/products'
        className="inline-block bg-blue-500 text-white px-8 py-3 rounded-md font-semibold hover:bg-blue-600 transition duration-150"
      >
        Khám phá sách ngay
      </Link>
    </div>
  );
};

export default EmptyCart;
