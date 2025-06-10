import React, { useEffect, useState } from "react";
import axios from "axios";
import { useParams, useNavigate } from "react-router-dom";
// import jwtDecode from "jwt-decode";

const API_URL = process.env.REACT_APP_API_URL_BACKEND;

const ProductDetailPage = () => {
  const { bookId } = useParams();
  const [book, setBook] = useState(null);
  const [accountId, setAccountId] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    // ✅ Check quyền role là customer (bỏ comment để kích hoạt)
    /*
    const token = localStorage.getItem("accessToken");
    if (token) {
      try {
        const decoded = jwtDecode(token);
        if (decoded.role !== "customer") {
          alert("Bạn không có quyền truy cập!");
          window.location.href = "/login";
        } else {
          setAccountId(decoded._id);
        }
      } catch (err) {
        console.error("Token không hợp lệ:", err);
        window.location.href = "/login";
      }
    } else {
      window.location.href = "/login";
    }
    */

    fetchBookDetail();
  }, []);

  const fetchBookDetail = async () => {
    try {
      const res = await axios.get(`${API_URL}/books/${bookId}`);
      setBook(res.data.data);
    } catch (err) {
      console.error("Lỗi khi lấy chi tiết sách:", err);
    }
  };

  const handleAddToCart = async () => {
    try {
      if (!accountId) throw new Error("Không tìm thấy tài khoản");
      await axios.post(`${API_URL}/cart`, { bookId: book._id, accountId });
      alert("Đã thêm vào giỏ hàng!");
    } catch (err) {
      console.error("Lỗi khi thêm vào giỏ hàng:", err);
      alert("Không thể thêm vào giỏ hàng.");
    }
  };

  const handleAddToWishlist = async () => {
    try {
      if (!accountId) throw new Error("Không tìm thấy tài khoản");
      await axios.post(`${API_URL}/wishlist`, { bookId: book._id, accountId });
      alert("Đã thêm vào mục yêu thích!");
    } catch (err) {
      console.error("Lỗi khi thêm vào yêu thích:", err);
      alert("Không thể thêm vào yêu thích.");
    }
  };

  if (!book) return <p>Đang tải dữ liệu sách...</p>;

  const hasDiscount =
    book.sellingPrice > 0 &&
    book.originalPrice &&
    book.originalPrice > book.sellingPrice;

  const discountPercent = hasDiscount
    ? Math.round(
        ((book.originalPrice - book.sellingPrice) / book.originalPrice) * 100
      )
    : 0;

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <div className="flex gap-6">
        <img
          src={book.images?.[0] || "/default-book.jpg"}
          alt={book.title}
          className="w-1/3 h-auto object-cover rounded"
        />
        <div className="flex-1">
          <h1 className="text-2xl font-bold mb-2">{book.title}</h1>
          <p className="text-gray-600 mb-1">Tác giả: {book.authors}</p>
          <div className="mb-3">
            {hasDiscount ? (
              <>
                <div className="text-sm text-gray-500">
                  <span className="line-through mr-2">
                    {book.originalPrice.toLocaleString()} đ
                  </span>
                  <span className="text-red-500 font-medium">
                    -{discountPercent}%
                  </span>
                </div>
                <p className="text-red-500 text-lg font-bold">
                  {book.sellingPrice.toLocaleString()} đ
                </p>
              </>
            ) : (
              <p className="text-red-500 text-lg font-bold">
                {(book.originalPrice || book.sellingPrice).toLocaleString()} đ
              </p>
            )}
          </div>
          <div className="flex gap-3 mt-4">
            <button
              onClick={handleAddToCart}
              className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700"
            >
              Thêm vào giỏ hàng
            </button>
            <button
              onClick={handleAddToWishlist}
              className="bg-pink-500 text-white px-4 py-2 rounded hover:bg-pink-600"
            >
              Yêu thích
            </button>
            <button
              onClick={() => navigate(-1)}
              className="bg-gray-400 text-white px-4 py-2 rounded hover:bg-gray-500"
            >
              Quay lại
            </button>
          </div>
        </div>
      </div>

      {/* Mô tả sách nếu có */}
      {book.description && (
        <div className="mt-6">
          <h2 className="text-lg font-semibold mb-2">Mô tả</h2>
          <p className="text-gray-700">{book.description}</p>
        </div>
      )}
    </div>
  );
};

export default ProductDetailPage;
