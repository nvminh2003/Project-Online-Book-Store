// src/pages/products/ProductDetailPage.js
import React, { useEffect, useState, useCallback, useRef } from "react"; // Thêm useCallback
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import { Icon } from '@iconify/react';
import ReviewList from "../account/ReviewList";
import reviewService from "../../services/reviewService";
import { notifySuccess, notifyError } from "../../components/common/ToastManager";
import { useCart } from "../../contexts/CartContext"; // Import useCart hook
import { useAuth } from "../../contexts/AuthContext"; // Import useAuth hook
import WishlistButton from "../../components/wishlist/WishlistButton";
import bookService from '../../services/bookService';
import categoryService from '../../services/categoryService';
import wishlistService from '../../services/wishlistService';

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
  const [quantity, setQuantity] = useState(1);
  const [showImageModal, setShowImageModal] = useState(false);
  const [currentImageIdx, setCurrentImageIdx] = useState(0);
  const imageIntervalRef = useRef();
  const navigate = useNavigate();
  const { addToCart } = useCart(); // Use the cart context
  const { user } = useAuth(); // Use the auth context
  // const dispatch = useDispatch(); // Bỏ comment nếu dùng Redux

  // Hide cart and wishlist buttons for admin users
  const isAdmin = user?.role === 'superadmin' || user?.role === 'admindev' || user?.role === 'adminbusiness';

  // Reviews state
  const [reviews, setReviews] = useState([]);
  const [reviewsLoading, setReviewsLoading] = useState(false);
  const [reviewsError, setReviewsError] = useState(null);
  const [reviewsPagination, setReviewsPagination] = useState({
    page: 1,
    totalPages: 1,
    total: 0
  });

  const fetchBookDetail = useCallback(async () => {
    setLoading(true);
    setError(null);
    const token = localStorage.getItem("accessToken");
    const config = token
      ? { headers: { Authorization: `Bearer ${token}` } }
      : {};
    try {
      const res = await bookService.getProductById(bookId);
      if (res.data && res.status === "Success" && res.data) {
        setBook(res.data);
      } else {
        setError(res.data?.message || "Không tìm thấy thông tin sách.");
      }
    } catch (err) {
      console.error(
        "Lỗi khi lấy chi tiết sách:",
        err.response?.data || err.message
      );
      if (err.response?.status === 401) {
        notifyError("Phiên đăng nhập không hợp lệ hoặc đã hết hạn. Vui lòng đăng nhập lại.");
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

  // Fetch reviews for the book
  const fetchReviews = useCallback(async (page = 1) => {
    if (!bookId) return;

    setReviewsLoading(true);
    setReviewsError(null);
    try {
      const response = await reviewService.getReviewsByBook(bookId, page, 5);
      if (response.status === "Success") {
        setReviews(response.data.reviews);
        setReviewsPagination({
          page: response.data.pagination.page,
          totalPages: response.data.pagination.totalPages,
          total: response.data.pagination.total
        });
      } else {
        setReviewsError(response.message || "Không thể tải đánh giá");
      }
    } catch (error) {
      console.error("Lỗi khi lấy đánh giá:", error);
      setReviewsError("Không thể tải đánh giá sản phẩm");
    } finally {
      setReviewsLoading(false);
    }
  }, [bookId]);

  useEffect(() => {
    // const token = localStorage.getItem("accessToken"); // Token đã được kiểm tra trong fetchBookDetail nếu API cần
    // if (!token) {
    //   alert("Bạn cần đăng nhập để truy cập trang này.");
    //   navigate("/auth/login");
    //   return;
    // }
    fetchBookDetail();
  }, [fetchBookDetail]); // Gọi fetchBookDetail khi nó thay đổi (chỉ 1 lần khi bookId thay đổi)

  // Fetch reviews when bookId changes
  useEffect(() => {
    fetchReviews(1);
  }, [fetchReviews]);

  // Tự động chuyển ảnh chính sau vài giây
  useEffect(() => {
    if (book?.images?.length > 1) {
      imageIntervalRef.current = setInterval(() => {
        setCurrentImageIdx((prev) => (prev + 1) % book.images.length);
      }, 4000); // 4 giây đổi ảnh
      return () => clearInterval(imageIntervalRef.current);
    }
    return () => { };
  }, [book]);

  const handleAddToCart = async () => {
    const token = localStorage.getItem("accessToken");
    if (!token) {
      notifyError("Bạn cần đăng nhập để thêm sản phẩm vào giỏ hàng.");
      setTimeout(() => navigate("/auth/login"), 1500);
      return;
    }
    if (!book || !book._id) {
      notifyError("Thông tin sách chưa được tải xong hoặc không hợp lệ, vui lòng thử lại.");
      return;
    }
    const currentQuantity = Number(quantity);
    if (isNaN(currentQuantity) || currentQuantity < 1) {
      notifyError("Số lượng không hợp lệ. Vui lòng chọn ít nhất 1 sản phẩm.");
      setQuantity(1);
      return;
    }
    try {
      // Use the addToCart function from CartContext instead of direct API call
      const result = await addToCart(book._id, currentQuantity);

      if (result.success) {
        notifySuccess("Đã thêm vào giỏ hàng thành công!");
      } else {
        notifyError(result.message || "Có lỗi xảy ra khi thêm vào giỏ hàng.");
      }
    } catch (err) {
      console.error("Lỗi khi thêm vào giỏ hàng:", err.response?.data || err.message);
      const errorMessage =
        err.response?.data?.message ||
        err.message ||
        "Không thể thêm sản phẩm vào giỏ hàng.";
      notifyError(errorMessage);
    }
  };

  const handleAddToWishlist = async () => {
    const token = localStorage.getItem("accessToken");
    if (!token) {
      notifyError("Bạn cần đăng nhập để thêm vào yêu thích.");
      setTimeout(() => navigate("/auth/login"), 1500);
      return;
    }
    if (!book || !book._id) {
      notifyError("Thông tin sách chưa được tải xong.");
      return;
    }
    try {
      await wishlistService.addToWishlist(book._id);
      notifySuccess("Đã thêm vào mục yêu thích!");
    } catch (err) {
      console.error(
        "Lỗi khi thêm vào yêu thích:",
        err.response?.data || err.message
      );
      notifyError(err.response?.data?.message || "Không thể thêm vào yêu thích.");
    }
  };

  // Handle review pagination
  const handleReviewPageChange = (page) => {
    fetchReviews(page);
  };

  // Kiểm tra hết hàng
  const isOutOfStock = book && typeof book.stockQuantity === 'number' && book.stockQuantity <= 0;

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

  return (
    <div className="p-6 max-w-5xl mx-auto">
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
              style={{ maxHeight: 220, background: 'transparent' }}
            />
            {book.images?.length > 1 && (
              <span className="absolute bottom-2 right-2 bg-black bg-opacity-60 text-white text-xs px-2 py-0.5 rounded">
                Xem tất cả ảnh
              </span>
            )}
          </div>
          {book.images?.length > 1 && (
            <div className="mt-3 grid grid-cols-4 gap-1 w-full min-h-14">
              {book.images.map((img, idx) => (
                idx !== currentImageIdx && (
                  <img
                    key={idx}
                    src={img}
                    alt={`Ảnh ${idx + 1}`}
                    className="w-full h-14 object-cover rounded-md border cursor-pointer transition-all duration-150 hover:scale-105 hover:shadow-lg"
                    onClick={() => setCurrentImageIdx(idx)}
                    style={{ visibility: 'visible' }}
                  />
                )
              ))}
            </div>
          )}
        </div>

        <div className="flex-1 md:w-3/4">
          <h1 className="text-2xl lg:text-3xl font-bold text-gray-800 mb-2">
            {book.title}
          </h1>
          {book.averageRating > 0 && (
            <div className="flex items-center text-sm text-yellow-600 gap-1 mb-1">
              <Icon icon="mdi:star" className="text-yellow-500" width={18} />
              <span className="font-semibold">{book.averageRating.toFixed(1)}</span>
              <span className="text-gray-500">({book.totalRatings} đánh giá)</span>
            </div>
          )}
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
              disabled={isOutOfStock}
            />
          </div>

          <div className="flex flex-col sm:flex-row flex-wrap gap-2">
            {/* Thêm vào giỏ hàng - ẩn cho admin */}
            {!isAdmin && (
              <button
                onClick={handleAddToCart}
                className={`flex-1 bg-white border border-blue-500 text-blue-600 font-semibold px-3 py-2 rounded-lg shadow-md transition-all duration-200 flex items-center justify-center gap-1 hover:bg-blue-100 hover:scale-105 hover:shadow-xl text-sm ${isOutOfStock ? 'opacity-60 cursor-not-allowed pointer-events-none' : ''}`}
                disabled={isOutOfStock}
              >
                <Icon icon="mdi:cart" width="18" height="18" color="#2563eb" />
                {isOutOfStock ? 'Hết hàng' : 'Thêm vào giỏ hàng'}
              </button>
            )}
            {/* Wishlist button - ẩn cho admin */}
            {!isAdmin && (
              <WishlistButton
                bookId={bookId}
                className={`flex-1 font-semibold px-6 py-3 shadow-md hover:shadow-lg ${isOutOfStock ? 'opacity-60 cursor-not-allowed pointer-events-none' : ''}`}
                onRequireLogin={() => {
                  notifyError("Bạn cần đăng nhập để thêm vào yêu thích.");
                  setTimeout(() => navigate("/auth/login"), 1500);
                }}
                onSuccessAdd={() => {
                  notifySuccess("Thêm sản phẩm yêu thích thành công");
                }}
                onSuccessRemove={() => {
                  notifyError("Đã xóa khỏi danh sách yêu thích");
                }}
                disabled={isOutOfStock}
              />
            )}
            <button
              onClick={() => navigate(-1)}
              className="flex-1 bg-white border border-blue-500 text-blue-600 font-semibold px-3 py-2 rounded-lg shadow-md transition-all duration-200 flex items-center justify-center gap-1 hover:bg-blue-100 hover:scale-105 hover:shadow-xl text-sm"
            >
              <Icon icon="mdi:arrow-left" width="18" height="18" color="#2563eb" />
              Quay lại
            </button>
          </div>

          {/* Nếu hết hàng, hiển thị banner giống Shopee */}
          {isOutOfStock && (
            <div className="mt-4 p-4 bg-gray-100 border border-dashed border-red-400 rounded-lg flex items-center gap-3 animate-pulse">
              <Icon icon="mdi:alert-circle-outline" width="32" height="32" className="text-red-500" />
              <div>
                <div className="text-lg font-bold text-red-600 mb-1">Sản phẩm tạm hết hàng</div>
                <div className="text-gray-600 text-sm">Vui lòng chọn sản phẩm khác hoặc quay lại sau.</div>
              </div>
            </div>
          )}
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
            {/* ... (Các li hiển thị thông tin chi tiết giữ nguyên, đảm bảo kiểm tra null/undefined nếu cần) ... */}
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
            {/* Thêm các thông tin khác nếu có */}
          </ul>
        </div>
      </div>

      {/* Đánh giá sản phẩm */}
      <div className="mt-10 pt-6 border-t border-gray-200">
        <h2 className="text-xl font-semibold text-gray-800 mb-4">
          Đánh giá sản phẩm ({reviewsPagination.total} đánh giá)
        </h2>

        {reviewsLoading ? (
          <p className="text-center text-gray-500 py-4">Đang tải đánh giá...</p>
        ) : reviewsError ? (
          <p className="text-center text-red-500 py-4">{reviewsError}</p>
        ) : (
          <>
            <ReviewList
              reviews={reviews.map(review => ({
                reviewerName: review.user?.info?.fullName || review.user?.email || 'Khách hàng',
                rating: review.rating,
                comment: review.comment,
                images: review.images || [],
                createdAt: review.createdAt
              }))}
            />

            {/* Pagination cho reviews */}
            {reviewsPagination.totalPages > 1 && (
              <div className="mt-6 flex justify-center">
                <div className="flex gap-2">
                  <button
                    onClick={() => handleReviewPageChange(reviewsPagination.page - 1)}
                    disabled={reviewsPagination.page <= 1}
                    className="px-3 py-1 border border-gray-300 rounded disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
                  >
                    Trước
                  </button>
                  <span className="px-3 py-1 text-gray-600">
                    Trang {reviewsPagination.page} / {reviewsPagination.totalPages}
                  </span>
                  <button
                    onClick={() => handleReviewPageChange(reviewsPagination.page + 1)}
                    disabled={reviewsPagination.page >= reviewsPagination.totalPages}
                    className="px-3 py-1 border border-gray-300 rounded disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
                  >
                    Sau
                  </button>
                </div>
              </div>
            )}
          </>
        )}
      </div>

    </div>
  );
};

export default ProductDetailPage;
