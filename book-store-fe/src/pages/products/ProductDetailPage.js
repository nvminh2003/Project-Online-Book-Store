// src/pages/products/ProductDetailPage.js
import React, { useEffect, useState, useCallback } from "react"; // Thêm useCallback
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
// --- NẾU SAU NÀY DÙNG REDUX CHO ADD TO CART ---
// import { useDispatch } from "react-redux";
// import { addItemToCartAPI } from "../../store/slices/cartSlice"; // Đường dẫn đúng
// --- KẾT THÚC IMPORT REDUX ---

const API_URL =
  process.env.REACT_APP_API_URL_BACKEND || "http://localhost:9999/api"; // Đảm bảo có /api nếu backend có prefix

const ProductDetailPage = () => {
  const {bookId} = useParams();
  const [book, setBook] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null)
  const [reviews, setReviews] = useState([]);
  const [newReview, setNewReview] = useState({rating: 0, comment: ""});
  const [quantity, setQuantity] = useState(1);
  const [showImageModal, setShowImageModal] = useState(false);
  const [currentImageIdx, setCurrentImageIdx] = useState(0);

  const [currentUserId, setCurrentUserId] = useState(null);
  const navigate = useNavigate();
  // const dispatch = useDispatch(); // Bỏ comment nếu dùng Redux

  const fetchBookDetail = useCallback(async () => {
    setLoading(true);
    setError(null);
    const token = localStorage.getItem("accessToken");
    // Nếu API xem chi tiết sách không cần token, có thể bỏ config này
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
        alert(
          "Phiên đăng nhập không hợp lệ hoặc đã hết hạn. Vui lòng đăng nhập lại."
        );
        navigate("/auth/login"); // Hoặc dispatch action logout
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
   const fetchReviews = async () => {
    try {
      const res = await axios.get(`${API_URL}/reviews/book/${bookId}`);
      setReviews(res.data);
    } catch (err) {
      console.error("Lỗi khi lấy đánh giá:", err);
    }
  }
   const handleAddReview = async () => {
    try {
      const token = localStorage.getItem("accessToken");
      if (!token) throw new Error("Bạn chưa đăng nhập");

      if (newReview.rating < 1 || newReview.rating > 5) {
        alert("Vui lòng chọn số sao từ 1 đến 5.");
        return;
      }

      await axios.post(
        `${API_URL}/reviews`,
        {
          book: bookId,
          rating: newReview.rating,
          comment: newReview.comment,
        },
            {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
    
      );
          alert("Gửi đánh giá thành công!");
      setNewReview({rating: 0, comment: ""});
      fetchReviews();
     
    }
     catch (err) {
      console.error("Lỗi khi gửi đánh giá:", err.response?.data || err.message);
      alert(`Không thể gửi đánh giá: ${err.response?.data?.message || err.message}`);
    }
  };


 const handleEditReview = async (review) => {
    const newRating = parseInt(prompt("Nhập số sao mới (1-5):", review.rating));
    const newComment = prompt("Nhập bình luận mới:", review.comment);

    if (!newRating || isNaN(newRating) || newRating < 1 || newRating > 5) {
      alert("Số sao không hợp lệ.");
       return;
    }

    try {
      const token = localStorage.getItem("accessToken");
      await axios.put(
        `${API_URL}/reviews/${review._id}`,
        { rating: newRating, comment: newComment },
           alert("Đã cập nhật đánh giá.").
      fetchReviews())
    } catch (err) {
      console.error("Lỗi cập nhật đánh giá:", err);
      alert("Không thể cập nhật.");
    }
  };

  const handleDeleteReview = async (reviewId) => {
    if (!window.confirm("Bạn chắc chắn muốn xoá đánh giá này?")) return;

    try {
      const token = localStorage.getItem("accessToken");
      await axios.delete(`${API_URL}/reviews/${reviewId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      alert("Đã xoá đánh giá.");
      fetchReviews();
    } catch (err) {
      console.error("Lỗi xoá đánh giá:", err);
      alert("Không thể xoá.");
    }
  };

  const handleReportReview = async (reviewId) => {
    if (!window.confirm("Bạn muốn báo cáo đánh giá này?")) return;

    try {
      const token = localStorage.getItem("accessToken");
      await axios.patch(`${API_URL}/reviews/report/${reviewId}`, {}, {
        headers: { Authorization: `Bearer ${token}` },
      });

      alert("Đã báo cáo đánh giá.");
       } catch (err) {
      console.error("Lỗi khi báo cáo đánh giá:", err);
      alert("Không thể báo cáo.");
          }
  };


  const handleAddToCart = async () => {
    const token = localStorage.getItem("accessToken");
    if (!token) {
      alert("Bạn cần đăng nhập để thêm sản phẩm vào giỏ hàng.");
      navigate("/auth/login");
      return;
    }

    if (!book || !book._id) {
      alert(
        "Thông tin sách chưa được tải xong hoặc không hợp lệ, vui lòng thử lại."
      );
      return;
    }

    const currentQuantity = Number(quantity);
    if (isNaN(currentQuantity) || currentQuantity < 1) {
      alert("Số lượng không hợp lệ. Vui lòng chọn ít nhất 1 sản phẩm.");
      setQuantity(1); // Reset về 1
      return;
    }

    const payload = {
      bookId: book._id,
      quantity: currentQuantity,
    };

    console.log("ProductDetailPage - Add to cart payload:", payload); // Để debug

    try {
      // --- NẾU DÙNG REDUX ---
      // const resultAction = await dispatch(addItemToCartAPI(payload));
      // if (addItemToCartAPI.fulfilled.match(resultAction)) {
      //   alert("Đã thêm vào giỏ hàng thành công!");
      // } else if (addItemToCartAPI.rejected.match(resultAction)) {
      //   const errorMessage = resultAction.payload || "Không thể thêm vào giỏ hàng.";
      //   alert(errorMessage);
      //   if (String(errorMessage).toLowerCase().includes('invalid token') || String(errorMessage).toLowerCase().includes('unauthorized')) {
      //     // Xử lý khi token không hợp lệ
      //   }
      // }
      // --- KẾT THÚC REDUX ---

      // --- HOẶC DÙNG AXIOS TRỰC TIẾP (NHƯ HIỆN TẠI) ---
      const response = await axios.post(`${API_URL}/cart/add`, payload, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (response.data && response.data.status === "Success") {
        alert("Đã thêm vào giỏ hàng thành công!");
      } else {
        alert(response.data.message || "Có lỗi xảy ra khi thêm vào giỏ hàng.");
      }
      // --- KẾT THÚC AXIOS TRỰC TIẾP ---
    } catch (err) {
      console.error(
        "Lỗi khi thêm vào giỏ hàng:",
        err.response?.data || err.message
      );
      const errorMessage =
        err.response?.data?.message ||
        err.message ||
        "Không thể thêm sản phẩm vào giỏ hàng.";
      alert(errorMessage);
      if (err.response?.status === 401) {
        // localStorage.removeItem("accessToken");
        // navigate("/auth/login");
      }
    }
  };

  const handleAddToWishlist = async () => {
    const token = localStorage.getItem("accessToken");
    if (!token) {
      alert("Bạn cần đăng nhập để thêm vào yêu thích.");
      navigate("/auth/login");
      return;
    }
    if (!book || !book._id) {
      alert("Thông tin sách chưa được tải xong.");
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
      alert("Đã thêm vào mục yêu thích!");
    } catch (err) {
      console.error(
        "Lỗi khi thêm vào yêu thích:",
        err.response?.data || err.message
      );
      alert(err.response?.data?.message || "Không thể thêm vào yêu thích.");
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
                  (prev) => (prev - 1 + book.images.length) % book.images.length
                )
              }
              disabled={book.images.length <= 1}
            >
              ←
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
              →
            </button>
          </div>
        </div>
      </div>
    )}
    <div className="flex flex-col md:flex-row gap-6">
      <div className="w-full md:w-1/3">
        <div
          className="relative cursor-pointer"
          onClick={() => {
            setShowImageModal(true);
            setCurrentImageIdx(0);
          }}
        >
          <img
            src={book.images?.[0] || "/default-book.jpg"}
            alt={book.title}
            className="w-full h-auto object-cover rounded-2xl shadow"
          />
          {book.images?.length > 1 && (
            <span className="absolute bottom-2 right-2 bg-black bg-opacity-60 text-white text-xs px-2 py-0.5 rounded">
              Xem tất cả ảnh
            </span>
          )}
        </div>
        {book.images?.length > 1 && (
          <div className="mt-4 grid grid-cols-4 gap-2">
            {book.images.slice(1).map((img, idx) => (
              <img
                key={idx}
                src={img}
                alt={`Ảnh ${idx + 2}`}
                className="w-full h-20 object-cover rounded-md border cursor-pointer"
                onClick={() => {
                  setShowImageModal(true);
                  setCurrentImageIdx(idx + 1);
                }}
              />
            ))}
          </div>
<<<<<<< HEAD

          <div className="mb-5">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Số lượng
            </label>
            <input
              type="number"
              value={quantity}
              min={1}
              onChange={(e) => setQuantity(e.target.value)}
              className="w-24 px-3 py-2 border rounded-md shadow-sm focus:ring focus:ring-blue-300 text-sm"
            />
          </div>

          <div className="flex flex-wrap gap-3 mt-3">
            <button
              onClick={handleAddToCart}
              className="bg-green-600 hover:bg-green-700 text-white px-5 py-2 rounded-xl transition text-sm"
            >
              Thêm vào giỏ hàng
            </button>
            <button
              onClick={handleAddToWishlist}
              className="bg-pink-500 text-white px-4 py-2 rounded hover:bg-pink-600 ml-2"
            >
              Thêm vào yêu thích
            </button>
            <button
              onClick={() => navigate(-1)}
              className="bg-gray-500 hover:bg-gray-600 text-white px-5 py-2 rounded-xl transition text-sm"
            >
              Quay lại
            </button>
          </div>
        </div>
=======
        )}
>>>>>>> main
      </div>

      <div className="flex-1 md:w-3/5">
        <h1 className="text-3xl lg:text-4xl font-bold text-gray-800 mb-3">
          {book.title}
        </h1>
        <p className="text-gray-600 mb-2 text-base">
          Tác giả:{" "}
          <span className="font-medium text-blue-600">
            {Array.isArray(book.authors)
              ? book.authors.join(", ")
              : book.authors}
          </span>
        </p>
        {book.publisher && (
          <p className="text-sm text-gray-500 mb-4">
            Nhà xuất bản: {book.publisher}
          </p>
        )}

        <div className="mb-6 p-4 bg-gray-50 rounded-lg">
          {hasDiscount ? (
            <>
              <div className="text-md text-gray-500">
                Giá gốc:{" "}
                <span className="line-through mr-2">
                  {(book.originalPrice || 0).toLocaleString("vi-VN")} đ
                </span>
              </div>
              <p className="text-red-600 text-3xl font-bold mb-1">
                {(book.sellingPrice || 0).toLocaleString("vi-VN")} đ
              </p>
              <span className="text-sm bg-red-100 text-red-600 font-semibold px-2 py-1 rounded">
                Tiết kiệm {discountPercent}%
              </span>
            </>
          ) : (
            <p className="text-red-600 text-3xl font-bold">
              {(book.sellingPrice || book.originalPrice || 0).toLocaleString(
                "vi-VN"
              )}{" "}
              đ
            </p>
          )}
        </div>

        <div className="mb-6">
          <label
            htmlFor="quantityInput"
            className="block text-sm font-semibold text-gray-700 mb-1"
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
            className="w-24 px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
          />
        </div>

        <div className="flex flex-col sm:flex-row flex-wrap gap-3">
          <button
            onClick={handleAddToCart}
            className="flex-1 bg-green-600 hover:bg-green-700 text-white font-semibold px-6 py-3 rounded-lg shadow-md transition duration-150 ease-in-out transform hover:scale-105"
          >
            Thêm vào giỏ hàng
          </button>
          <button
            onClick={handleAddToWishlist}
            className="flex-1 bg-pink-500 hover:bg-pink-600 text-white font-semibold px-6 py-3 rounded-lg shadow-md transition duration-150 ease-in-out"
          >
            Yêu thích
          </button>
          <button
            onClick={() => navigate(-1)} // Quay lại trang trước
            className="flex-1 bg-gray-200 hover:bg-gray-300 text-gray-700 font-semibold px-6 py-3 rounded-lg shadow-md transition duration-150 ease-in-out"
          >
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

        <label className="block mt-3 text-sm font-medium mb-1">Bình luận:</label>
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
              <p className="font-semibold">{review.user?.email || "Ẩn danh"}</p>
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
        <p className="text-gray-500">Chưa có đánh giá nào cho sản phẩm này.</p>
      )}
    </div>
  </div>
);
}
export default ProductDetailPage
