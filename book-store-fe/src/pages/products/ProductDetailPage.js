// src/pages/products/ProductDetailPage.js
import React, { useEffect, useState, useCallback, useRef } from "react"; // Thêm useCallback
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import { Icon } from "@iconify/react";

// --- NẾU SAU NÀY DÙNG REDUX CHO ADD TO CART ---
// import { useDispatch } from "react-redux";
// import { addItemToCartAPI } from "../../store/slices/cartSlice"; // Đường dẫn đúng
// --- KẾT THÚC IMPORT REDUX ---

const API_URL =
  process.env.REACT_APP_API_URL_BACKEND || "http://localhost:9999/api"; // Đảm bảo có /api nếu backend có prefix

const ProductDetailPage = () => {
  const { bookId } = useParams();
  const [error, setError] = useState(false);
  const [loading, setLoading] = useState(false);
  const [book, setBook] = useState(null);
  const [reviews, setReviews] = useState([]);
  const [newReview, setNewReview] = useState({ rating: 0, comment: "" });
  const [quantity, setQuantity] = useState(1);
  const [showImageModal, setShowImageModal] = useState(false);
  const [currentImageIdx, setCurrentImageIdx] = useState(0);
  const imageIntervalRef = useRef();
  const navigate = useNavigate();
  // const dispatch = useDispatch(); // Bỏ comment nếu dùng Redux
  const [toastMsg, setToastMsg] = useState("");
  const [toastType, setToastType] = useState("success"); // 'success' | 'error'

  const fetchBookDetail = useCallback(async () => {
    setLoading(true);
    setError(null);
    const token = localStorage.getItem("accessToken");
    const config = token
      ? { headers: { Authorization: `Bearer ${token}` } }
      : {};
    try {
      const res = await axios.get(`${API_URL}/books/${bookId}`, config);
      if (res.data && res.data.status === "Success" && res.data.data) {
        setBook(res.data.data);
      } else {
        setError(res.data?.message || "Không tìm thấy thông tin sách.");
      }
    } catch (err) {
      console.error(
        "Lỗi khi lấy chi tiết sách:",
        err.response?.data || err.message
      );
      if (err.response?.status === 401) {
        setToastMsg(
          "Phiên đăng nhập không hợp lệ hoặc đã hết hạn. Vui lòng đăng nhập lại."
        );
        setToastType("error");
        setTimeout(() => navigate("/auth/login"), 1500);
      } else {
        setError(
          err.response?.data?.message ||
            "Không thể tải thông tin chi tiết sách."
        );
      }
    } finally {
      setLoading(false);
    }
  }, [bookId, navigate]); // Thêm navigate vào dependencies của useCallback

  useEffect(() => {
    // const token = localStorage.getItem("accessToken"); // Token đã được kiểm tra trong fetchBookDetail nếu API cần
    // if (!token) {
    //   alert("Bạn cần đăng nhập để truy cập trang này.");
    //   navigate("/auth/login");
    //   return;
    // }
    fetchBookDetail();
  }, [fetchBookDetail]); // Gọi fetchBookDetail khi nó thay đổi (chỉ 1 lần khi bookId thay đổi)

  // Tự động chuyển ảnh chính sau vài giây
  useEffect(() => {
    if (book?.images?.length > 1) {
      imageIntervalRef.current = setInterval(() => {
        setCurrentImageIdx((prev) => (prev + 1) % book.images.length);
      }, 4000); // 4 giây đổi ảnh
      return () => clearInterval(imageIntervalRef.current);
    }
    return () => {};
  }, [book]);

  const handleAddToCart = async () => {
    const token = localStorage.getItem("accessToken");
    if (!token) {
      setToastMsg("Bạn cần đăng nhập để thêm sản phẩm vào giỏ hàng.");
      setToastType("error");
      setTimeout(() => navigate("/auth/login"), 1500);
      return;
    }
    if (!book || !book._id) {
      setToastMsg(
        "Thông tin sách chưa được tải xong hoặc không hợp lệ, vui lòng thử lại."
      );
      setToastType("error");
      setTimeout(() => setToastMsg(""), 1500);
      return;
    }
    const currentQuantity = Number(quantity);
    if (isNaN(currentQuantity) || currentQuantity < 1) {
      setToastMsg("Số lượng không hợp lệ. Vui lòng chọn ít nhất 1 sản phẩm.");
      setToastType("error");
      setQuantity(1);
      setTimeout(() => setToastMsg(""), 1500);
      return;
    }
    const payload = {
      bookId: book._id,
      quantity: currentQuantity,
    };
    try {
      const response = await axios.post(`${API_URL}/cart/add`, payload, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      if (response.data && response.data.status === "Success") {
        setToastMsg("Đã thêm vào giỏ hàng thành công!");
        setToastType("success");
        setTimeout(() => setToastMsg(""), 1500);
      } else {
        setToastMsg(
          response.data.message || "Có lỗi xảy ra khi thêm vào giỏ hàng."
        );
        setToastType("error");
        setTimeout(() => setToastMsg(""), 1500);
      }
    } catch (err) {
      console.error(
        "Lỗi khi thêm vào giỏ hàng:",
        err.response?.data || err.message
      );
      const errorMessage =
        err.response?.data?.message ||
        err.message ||
        "Không thể thêm sản phẩm vào giỏ hàng.";
      setToastMsg(errorMessage);
      setToastType("error");
      setTimeout(() => setToastMsg(""), 1500);
      // if (err.response?.status === 401) {
      //   localStorage.removeItem("accessToken");
      //   navigate("/auth/login");
      // }
    }
  };

  const handleAddToWishlist = async () => {
    const token = localStorage.getItem("accessToken");
    if (!token) {
      setToastMsg("Bạn cần đăng nhập để thêm vào yêu thích.");
      setToastType("error");
      setTimeout(() => navigate("/auth/login"), 1500);
      return;
    }
    if (!book || !book._id) {
      setToastMsg("Thông tin sách chưa được tải xong.");
      setToastType("error");
      setTimeout(() => setToastMsg(""), 1500);
      return;
    }
    try {
      await axios.post(
        `${API_URL}/wishlist/add`,
        { bookId: book._id },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      setToastMsg("Đã thêm vào mục yêu thích!");
      setToastType("success");
      setTimeout(() => setToastMsg(""), 1500);
    } catch (err) {
      console.error(
        "Lỗi khi thêm vào yêu thích:",
        err.response?.data || err.message
      );
      setToastMsg(
        err.response?.data?.message || "Không thể thêm vào yêu thích."
      );
      setToastType("error");
      setTimeout(() => setToastMsg(""), 1500);
    }
  };

  if (loading)
    return (
      <p className="p-4 text-center text-gray-500">Đang tải dữ liệu sách...</p>
    );
  if (error)
    return <p className="p-4 text-center text-red-500">Lỗi: {error}</p>;
  if (!book)
    return (
      <p className="p-4 text-center text-gray-500">
        Không tìm thấy thông tin sách.
      </p>
    );

  const hasDiscount =
    typeof book.sellingPrice === "number" &&
    typeof book.originalPrice === "number" &&
    book.originalPrice > book.sellingPrice;

  const discountPercent = hasDiscount
    ? Math.round(
        ((book.originalPrice - book.sellingPrice) / book.originalPrice) * 100
      )
    : 0;

  // Define empty functions to fix undefined errors
  const handleAddReview = () => {
    setToastMsg('Tính năng đang được phát triển');
    setToastType('error');
    setTimeout(() => setToastMsg(''), 1500);
  };

  const handleEditReview = () => {
    setToastMsg('Tính năng đang được phát triển');
    setToastType('error');
    setTimeout(() => setToastMsg(''), 1500);
  };

  const handleDeleteReview = () => {
    setToastMsg('Tính năng đang được phát triển');
    setToastType('error');
    setTimeout(() => setToastMsg(''), 1500);
  };

  const handleReportReview = () => {
    setToastMsg('Tính năng đang được phát triển');
    setToastType('error');
    setTimeout(() => setToastMsg(''), 1500);
  };

  const currentUserId = null; // Placeholder for user ID

  return (
    <div className="p-6 max-w-5xl mx-auto">
      {toastMsg && (
        <div
          className={`fixed top-4 left-1/2 -translate-x-1/2 z-50 px-6 py-3 rounded-lg shadow-lg animate-fade-in text-center text-base font-medium ${
            toastType === "success"
              ? "bg-green-100 border border-green-400 text-green-700"
              : "bg-red-100 border border-red-400 text-red-700"
          }`}
        >
          {toastMsg}
        </div>
      )}
      {/* Modal xem ảnh to */}
      {showImageModal && book.images?.length > 0 && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-60">
          <div className="relative bg-white rounded-2xl shadow-lg p-4 flex flex-col items-center">
            <button
              className="absolute top-2 right-2 text-gray-500 hover:text-red-500 text-2xl font-bold"
              onClick={() => setShowImageModal(false)}
            >
              ×
            </button>
            <img
              src={book.images[currentImageIdx]}
              alt={`Ảnh ${currentImageIdx + 1}`}
              className="max-w-[80vw] max-h-[70vh] object-contain rounded mb-4"
            />
            <div className="flex gap-4 items-center">
              <button
                className="px-3 py-1 bg-gray-200 rounded hover:bg-gray-300 text-lg"
                onClick={() =>
                  setCurrentImageIdx(
                    (prev) =>
                      (prev - 1 + book.images.length) % book.images.length
                  )
                }
                disabled={book.images.length <= 1}
              >
                &#8592;
              </button>
              <span className="text-sm text-gray-600">
                {currentImageIdx + 1} / {book.images.length}
              </span>
              <button
                className="px-3 py-1 bg-gray-200 rounded hover:bg-gray-300 text-lg"
                onClick={() =>
                  setCurrentImageIdx((prev) => (prev + 1) % book.images.length)
                }
                disabled={book.images.length <= 1}
              >
                &#8594;
              </button>
            </div>
          </div>
        </div>
      )}
      <div className="flex flex-col md:flex-row gap-4">
        <div className="w-full md:w-1/4 flex flex-col items-center">
          <div
            className="relative cursor-pointer flex flex-col items-center justify-center bg-transparent"
            onClick={() => {
              setShowImageModal(true);
              setCurrentImageIdx(currentImageIdx);
            }}
          >
            <img
              src={book.images?.[currentImageIdx] || "/default-book.jpg"}
              alt={book.title}
              className="w-full h-auto object-cover rounded-2xl shadow mx-auto bg-transparent"
              style={{ maxHeight: 220, background: "transparent" }}
            />
            {book.images?.length > 1 && (
              <span className="absolute bottom-2 right-2 bg-black bg-opacity-60 text-white text-xs px-2 py-0.5 rounded">
                Xem tất cả ảnh
              </span>
            )}
          </div>
          {book.images?.length > 1 && (
            <div className="mt-3 grid grid-cols-4 gap-1 w-full min-h-14">
              {book.images.map(
                (img, idx) =>
                  idx !== currentImageIdx && (
                    <img
                      key={idx}
                      src={img}
                      alt={`Ảnh ${idx + 1}`}
                      className="w-full h-14 object-cover rounded-md border cursor-pointer transition-all duration-150 hover:scale-105 hover:shadow-lg"
                      onClick={() => setCurrentImageIdx(idx)}
                      style={{ visibility: "visible" }}
                    />
                  )
              )}
            </div>
          )}
        </div>

        <div className="flex-1 md:w-3/4">
          <h1 className="text-2xl lg:text-3xl font-bold text-gray-800 mb-2">
            {book.title}
          </h1>
          <p className="text-gray-600 mb-1 text-sm">
            Tác giả:{" "}
            <span className="font-medium text-blue-600">
              {Array.isArray(book.authors)
                ? book.authors.join(", ")
                : book.authors}
            </span>
          </p>
          {book.publisher && (
            <p className="text-xs text-gray-500 mb-2">
              Nhà xuất bản: {book.publisher}
            </p>
          )}

          <div className="mb-4 p-3 bg-gray-50 rounded-lg">
            {hasDiscount ? (
              <>
                <div className="text-sm text-gray-500">
                  Giá gốc:{" "}
                  <span className="line-through mr-2">
                    {(book.originalPrice || 0).toLocaleString("vi-VN")} đ
                  </span>
                </div>
                <p className="text-red-600 text-2xl font-bold mb-1">
                  {(book.sellingPrice || 0).toLocaleString("vi-VN")} đ
                </p>
                <span className="text-xs bg-red-100 text-red-600 font-semibold px-2 py-1 rounded">
                  Tiết kiệm {discountPercent}%
                </span>
              </>
            ) : (
              <p className="text-red-600 text-2xl font-bold">
                {(book.sellingPrice || book.originalPrice || 0).toLocaleString(
                  "vi-VN"
                )}{" "}
                đ
              </p>
            )}
          </div>

          <div className="mb-4">
            <label
              htmlFor="quantityInput"
              className="block text-xs font-semibold text-gray-700 mb-1"
            >
              Số lượng:
            </label>
            <input
              id="quantityInput"
              type="number"
              value={quantity}
              min="1"
              onChange={(e) => {
                const val = parseInt(e.target.value, 10);
                setQuantity(isNaN(val) || val < 1 ? 1 : val);
              }}
              className="w-16 px-2 py-1 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-xs"
            />
          </div>

          <div className="flex flex-col sm:flex-row flex-wrap gap-2">
            <button
              onClick={handleAddToCart}
              className="flex-1 bg-white border border-blue-500 text-blue-600 font-semibold px-3 py-2 rounded-lg shadow-md transition-all duration-200 flex items-center justify-center gap-1 hover:bg-blue-100 hover:scale-105 hover:shadow-xl text-sm"
            >
              <Icon icon="mdi:cart" width="18" height="18" color="#2563eb" />
              Thêm vào giỏ hàng
            </button>
            <button
              onClick={handleAddToWishlist}
              className="flex-1 bg-white border border-blue-500 text-blue-600 font-semibold px-3 py-2 rounded-lg shadow-md transition-all duration-200 flex items-center justify-center gap-1 hover:bg-blue-100 hover:scale-105 hover:shadow-xl text-sm"
            >
              <Icon icon="mdi:heart" width="18" height="18" color="#2563eb" />
              Yêu thích
            </button>
            <button
              onClick={() => navigate(-1)}
              className="flex-1 bg-white border border-blue-500 text-blue-600 font-semibold px-3 py-2 rounded-lg shadow-md transition-all duration-200 flex items-center justify-center gap-1 hover:bg-blue-100 hover:scale-105 hover:shadow-xl text-sm"
            >
              <Icon
                icon="mdi:arrow-left"
                width="18"
                height="18"
                color="#2563eb"
              />
              Quay lại
            </button>
          </div>
        </div>
      </div>

      <div className="mt-10 pt-6 border-t border-gray-200">
        {book.description && (
          <div className="mb-6">
            <h2 className="text-xl font-semibold text-gray-800 mb-3">
              Mô tả sản phẩm
            </h2>
            <p className="text-gray-700 leading-relaxed whitespace-pre-wrap">
              {book.description}
            </p>
          </div>
        )}

        <div>
          <h2 className="text-xl font-semibold text-gray-800 mb-3">
            Thông tin chi tiết
          </h2>
          <ul className="text-gray-700 text-sm space-y-2 bg-gray-50 p-4 rounded-lg">
            {book.title && (
              <li>
                <strong>Tiêu đề:</strong> {book.title}
              </li>
            )}
            {book.authors && book.authors.length > 0 && (
              <li>
                <strong>Tác giả:</strong>{" "}
                {Array.isArray(book.authors)
                  ? book.authors.join(", ")
                  : book.authors}
              </li>
            )}
            {book.publisher && (
              <li>
                <strong>Nhà xuất bản:</strong> {book.publisher}
              </li>
            )}
            {book.publicationYear && (
              <li>
                <strong>Năm phát hành:</strong> {book.publicationYear}
              </li>
            )}
            {book.pageCount && (
              <li>
                <strong>Số trang:</strong> {book.pageCount}
              </li>
            )}
            {book.coverType && (
              <li>
                <strong>Loại bìa:</strong> {book.coverType}
              </li>
            )}
            {book.isbn && (
              <li>
                <strong>Mã ISBN:</strong> {book.isbn}
              </li>
            )}
            {typeof book.stockQuantity === "number" && (
              <li>
                <strong>Tồn kho:</strong> {book.stockQuantity}
              </li>
            )}
          </ul>
        </div>

        {/* Form gửi đánh giá */}
        <div className="mb-4">
          <label className="block text-sm font-medium mb-1">Chọn số sao:</label>
          <select
            value={newReview.rating}
            onChange={(e) =>
              setNewReview({ ...newReview, rating: parseInt(e.target.value) })
            }
            className="border p-2 rounded text-sm"
          >
            <option value={0}>-- Chọn --</option>
            {[1, 2, 3, 4, 5].map((star) => (
              <option key={star} value={star}>
                {star} sao
              </option>
            ))}
          </select>

          <label className="block mt-3 text-sm font-medium mb-1">
            Bình luận:
          </label>
          <textarea
            value={newReview.comment}
            onChange={(e) =>
              setNewReview({ ...newReview, comment: e.target.value })
            }
            className="w-full border p-2 rounded text-sm"
            rows={3}
          />

          <button
            onClick={handleAddReview}
            className="mt-3 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded"
          >
            Gửi đánh giá
          </button>
        </div>

        {/* Danh sách đánh giá */}
        {reviews.length > 0 ? (
          <ul className="space-y-4">
            {reviews.map((review) => (
              <li key={review._id} className="border p-4 rounded-md bg-gray-50">
                <p className="font-semibold">
                  {review.user?.email || "Ẩn danh"}
                </p>
                <p className="text-yellow-500">{"⭐".repeat(review.rating)}</p>
                <p className="text-gray-700">{review.comment}</p>

                {review.user?._id === currentUserId ? (
                  <div className="mt-2 space-x-2">
                    <button
                      onClick={() => handleEditReview(review)}
                      className="text-blue-600 text-sm"
                    >
                      Sửa
                    </button>
                    <button
                      onClick={() => handleDeleteReview(review._id)}
                      className="text-red-600 text-sm"
                    >
                      Xoá
                    </button>
                  </div>
                ) : (
                  <div className="mt-2">
                    <button
                      onClick={() => handleReportReview(review._id)}
                      className="text-orange-600 text-sm"
                    >
                      Báo cáo
                    </button>
                  </div>
                )}
              </li>
            ))}
          </ul>
        ) : (
          <p className="text-gray-500">
            Chưa có đánh giá nào cho sản phẩm này.
          </p>
        )}
      </div>
    </div>
  );
};
export default ProductDetailPage;
