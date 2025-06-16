import React, { useEffect, useState } from "react";
import axios from "axios";
import { useParams, useNavigate } from "react-router-dom";

const API_URL = process.env.REACT_APP_API_URL_BACKEND;

const ProductDetailPage = () => {
  const { bookId } = useParams();
  const [book, setBook] = useState(null);
  const [quantity, setQuantity] = useState(1);
  const navigate = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem("accessToken");
    if (!token) {
      alert("Bạn cần đăng nhập để truy cập trang này.");
      navigate("/auth/login");
      return;
    }
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
      const token = localStorage.getItem("accessToken");
      if (!token) throw new Error("Bạn chưa đăng nhập");

      if (quantity < 1 || isNaN(quantity)) {
        alert("Số lượng không hợp lệ.");
        return;
      }

      await axios.post(
        `${API_URL}/cart/add`,
        { items: [{ bookId: book._id, quantity: Number(quantity) }] },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      alert("Đã thêm vào giỏ hàng!");
    } catch (err) {
      console.error("Lỗi khi thêm vào giỏ hàng:", err.response?.data || err.message);
      alert("Không thể thêm vào giỏ hàng.");
    }
  };

  const handleAddToWishlist = async () => {
    try {
      const token = localStorage.getItem("accessToken");
      if (!token) throw new Error("Bạn chưa đăng nhập");

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
      console.error("Lỗi khi thêm vào yêu thích:", err.response?.data || err.message);
      alert("Không thể thêm vào yêu thích.");
    }
  };

  if (!book) return <p className="p-4 text-gray-500">Đang tải dữ liệu sách...</p>;

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
    <div className="p-6 max-w-5xl mx-auto">
      <div className="flex flex-col md:flex-row gap-6">
        <div className="w-full md:w-1/3">
          <img
            src={book.images?.[0] || "/default-book.jpg"}
            alt={book.title}
            className="w-full h-auto object-cover rounded-2xl shadow"
          />

          {book.images?.length > 1 && (
            <div className="mt-4 grid grid-cols-4 gap-2">
              {book.images.slice(1).map((img, idx) => (
                <img
                  key={idx}
                  src={img}
                  alt={`Ảnh ${idx + 2}`}
                  className="w-full h-20 object-cover rounded-md border"
                />
              ))}
            </div>
          )}
        </div>

        <div className="flex-1">
          <h1 className="text-3xl font-bold mb-3">{book.title}</h1>
          <p className="text-gray-700 mb-1 text-base">Tác giả: {book.authors}</p>

          <div className="mb-4">
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
                <p className="text-red-600 text-xl font-bold">
                  {book.sellingPrice.toLocaleString()} đ
                </p>
              </>
            ) : (
              <p className="text-red-600 text-xl font-bold">
                {(book.originalPrice || book.sellingPrice).toLocaleString()} đ
              </p>
            )}
          </div>

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
              className="bg-pink-500 hover:bg-pink-600 text-white px-5 py-2 rounded-xl transition text-sm"
            >
              Yêu thích
            </button>
            <button
              onClick={() => navigate(-1)}
              className="bg-gray-500 hover:bg-gray-600 text-white px-5 py-2 rounded-xl transition text-sm"
            >
              Quay lại
            </button>
          </div>
        </div>
      </div>

      <div className="mt-8">
        {book.description && (
          <>
            <h2 className="text-lg font-semibold mb-2">Mô tả</h2>
            <p className="text-gray-700 leading-relaxed mb-4">{book.description}</p>
          </>
        )}

        <h2 className="text-lg font-semibold mb-2">Thông tin chi tiết</h2>
<ul className="text-gray-700 text-sm space-y-1">
  {book.title && <li><strong>Tiêu đề:</strong> {book.title}</li>}
  {book.authors?.length > 0 && (
    <li><strong>Tác giả:</strong> {book.authors.join(", ")}</li>
  )}
  {book.publisher && <li><strong>Nhà xuất bản:</strong> {book.publisher}</li>}
  {book.publicationYear && <li><strong>Năm phát hành:</strong> {book.publicationYear}</li>}
  {book.pageCount && <li><strong>Số trang:</strong> {book.pageCount}</li>}
  {book.coverType && <li><strong>Loại bìa:</strong> {book.coverType}</li>}
  {book.isbn && <li><strong>Mã ISBN:</strong> {book.isbn}</li>}
  {book.originalPrice && (
    <li><strong>Giá gốc:</strong> {book.originalPrice.toLocaleString()} đ</li>
  )}
  {book.sellingPrice && (
    <li><strong>Giá bán:</strong> {book.sellingPrice.toLocaleString()} đ</li>
  )}
  {typeof book.stockQuantity === "number" && (
    <li><strong>Tồn kho:</strong> {book.stockQuantity}</li>
  )}
  {typeof book.averageRating === "number" && (
    <li><strong>Đánh giá trung bình:</strong> {book.averageRating}/5</li>
  )}
  {typeof book.totalRatings === "number" && (
    <li><strong>Số lượt đánh giá:</strong> {book.totalRatings}</li>
  )}
  {book.isFeatured && <li><strong>Phân loại:</strong> Sách nổi bật</li>}
  {book.isNewArrival && <li><strong>Phân loại:</strong> Sách mới</li>}
</ul>


      </div>
    </div>
  );
};

export default ProductDetailPage;
