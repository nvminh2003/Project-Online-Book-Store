// src/pages/HomePage.js
import React, { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
// import { jwtDecode } from "jwt-decode"; // Có vẻ không được sử dụng

// --- NẾU SAU NÀY DÙNG REDUX CHO ADD TO CART ---
// import { useDispatch } from "react-redux";
// import { addItemToCartAPI } from "../store/slices/cartSlice"; // Đường dẫn tới slice của bạn
// --- KẾT THÚC IMPORT REDUX ---

const API_URL =
  process.env.REACT_APP_API_URL_BACKEND || "http://localhost:9999/api";

const HomePage = () => {
  const [categories, setCategories] = useState([]);
  const [books, setBooks] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [searchKeyword, setSearchKeyword] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const booksPerPage = 5;
  const [showCategory, setShowCategory] = useState(false);

  const navigate = useNavigate();
  // const dispatch = useDispatch(); // Bỏ comment nếu dùng Redux

  useEffect(() => {
    fetchCategories();
    fetchBooks(); // Fetch tất cả sách ban đầu
  }, []);

  const fetchCategories = async () => {
    try {
      const res = await axios.get(`${API_URL}/categories`);
      setCategories(res.data.data || []);
    } catch (err) {
      console.error("Error fetching categories:", err);
      setCategories([]); // Đặt là mảng rỗng nếu lỗi
    }
  };

  const fetchBooks = async (categoryId = null) => {
    try {
      // Lấy tất cả sách trước, sau đó lọc ở client nếu cần
      // Hoặc tốt hơn là backend hỗ trợ filter theo categoryId: params: { category: categoryId }
      const res = await axios.get(`${API_URL}/books`, {
        // params: { page: 1, limit: 100 }, // Lấy một lượng lớn sách để demo client-side filtering
      });

      let fetchedBooks = res.data.data?.books || []; // Đảm bảo books là mảng

      if (categoryId) {
        fetchedBooks = fetchedBooks.filter((book) =>
          (book.categories || []).some((cat) => (cat._id || cat) === categoryId)
        );
      }

      // Sắp xếp theo năm xuất bản mới nhất (có thể bỏ nếu backend đã sắp xếp)
      fetchedBooks.sort(
        (a, b) => (b.publicationYear || 0) - (a.publicationYear || 0)
      );
      setBooks(fetchedBooks);
      setCurrentPage(1); // Reset về trang đầu sau khi lọc
    } catch (err) {
      console.error("Error fetching books:", err);
      setBooks([]); // Đặt là mảng rỗng nếu lỗi
    }
  };

  const handleCategoryClick = (categoryId) => {
    setSelectedCategory(categoryId);
    fetchBooks(categoryId); // Fetch sách theo category mới
  };

  // Lọc theo từ khóa tìm kiếm ở client-side
  const filteredBooksByKeyword = books.filter((book) =>
    (book.title || "").toLowerCase().includes(searchKeyword.toLowerCase())
  );

  // Logic phân trang
  const totalPages = Math.ceil(filteredBooksByKeyword.length / booksPerPage);
  const startIndex = (currentPage - 1) * booksPerPage;
  const paginatedBooks = filteredBooksByKeyword.slice(
    startIndex,
    startIndex + booksPerPage
  );

  const handleNextPage = () => {
    if (currentPage < totalPages) setCurrentPage((prev) => prev + 1);
  };

  const handlePrevPage = () => {
    if (currentPage > 1) setCurrentPage((prev) => prev - 1);
  };

  const handleAddToCart = async (bookId) => {
    const token = localStorage.getItem("accessToken");
    console.log("HomePage - Add to cart clicked for bookId:", bookId);
    console.log("HomePage - Token:", token);

    if (!token) {
      alert("Bạn cần đăng nhập để thêm sản phẩm vào giỏ hàng.");
      navigate("/auth/login");
      return;
    }

    // --- SỬA LẠI PAYLOAD CHO ĐÚNG ---
    const payload = {
      bookId: bookId,
      quantity: 1, // Mặc định thêm 1 sản phẩm
    };
    // --- KẾT THÚC SỬA PAYLOAD ---

    try {
      const response = await axios.post(
        `${API_URL}/cart/add`,
        payload, // Sử dụng payload đã sửa
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      console.log("HomePage - Add to cart response:", response.data);
      if (response.data && response.data.status === "Success") {
        alert("Đã thêm vào giỏ hàng thành công!");
        // Khi dùng Redux:
        // dispatch(addItemToCartAPI(payload)); // Hoặc
        // dispatch(fetchCart()); // để cập nhật trạng thái giỏ hàng trên header chẳng hạn
      } else {
        alert(response.data.message || "Có lỗi xảy ra khi thêm vào giỏ hàng.");
      }
    } catch (err) {
      console.error(
        "HomePage - Lỗi khi thêm vào giỏ hàng:",
        err.response?.data || err.message
      );
      const errorMessage =
        err.response?.data?.message ||
        err.message ||
        "Không thể thêm sản phẩm vào giỏ hàng.";
      alert(errorMessage);
      if (err.response?.status === 401) {
        // Xử lý khi token không hợp lệ (ví dụ: điều hướng login)
        // localStorage.removeItem("accessToken");
        // navigate("/auth/login");
      }
    }
  };

  const handleAddToWishlist = async (bookId) => {
    const token = localStorage.getItem("accessToken");
    if (!token) {
      alert("Bạn cần đăng nhập để thêm vào yêu thích.");
      navigate("/auth/login");
      return;
    }
    try {
      await axios.post(
        `${API_URL}/wishlist/add`, // Đảm bảo endpoint này đúng
        { bookId },
        { headers: { Authorization: `Bearer ${token}` } }
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

  const handleViewDetail = (bookId) => {
    // Việc kiểm tra token ở đây là tùy chọn, trang chi tiết có thể public hoặc private
    // Nếu private, ProductDetailPage sẽ tự xử lý redirect
    navigate(`/detailbook/${bookId}`);
  };

  return (
    <div className="p-4">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-gray-800">Sách Mới Nhất</h1>
        <div className="w-1/3">
          <input
            type="text"
            placeholder="Tìm kiếm sách theo tên..."
            className="border rounded-lg px-4 py-2 w-full focus:ring-2 focus:ring-blue-500 outline-none transition-shadow"
            value={searchKeyword}
            onChange={(e) => {
              setSearchKeyword(e.target.value);
              setCurrentPage(1); // Reset trang khi tìm kiếm
            }}
          />
        </div>
      </div>

      {/* Danh mục dạng dropdown/collapsible */}
      <div className="mb-4 relative">
        <button
          className="bg-blue-600 text-white px-4 py-2 rounded-lg font-semibold shadow hover:bg-blue-700 transition"
          onClick={() => setShowCategory((prev) => !prev)}
        >
          Danh mục {showCategory ? "▲" : "▼"}
        </button>
        {showCategory && (
          <ul className="absolute z-10 bg-white border border-gray-200 rounded-lg mt-2 w-60 shadow-lg">
            <li
              className={`cursor-pointer px-4 py-2 hover:bg-blue-50 rounded-t-lg ${
                selectedCategory === null ? "font-semibold text-blue-600" : ""
              }`}
              onClick={() => {
                setShowCategory(false);
                handleCategoryClick(null);
              }}
            >
              Tất cả
            </li>
            {categories.map((cat, idx) => (
              <li
                key={cat._id}
                className={`cursor-pointer px-4 py-2 hover:bg-blue-50 ${
                  selectedCategory === cat._id
                    ? "font-semibold text-blue-600"
                    : ""
                } ${idx === categories.length - 1 ? "rounded-b-lg" : ""}`}
                onClick={() => {
                  setShowCategory(false);
                  handleCategoryClick(cat._id);
                }}
              >
                {cat.name}
              </li>
            ))}
          </ul>
        )}
      </div>

      <div className="flex">
        {/* Bỏ sidebar danh mục cũ, chỉ còn phần sản phẩm */}
        <div className="w-full">
          {paginatedBooks.length === 0 ? (
            <p className="text-center text-gray-500 py-10">
              Không tìm thấy sách nào phù hợp.
            </p>
          ) : (
            <>
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-6 justify-items-center">
                {paginatedBooks.map((book) => {
                  const hasDiscount =
                    typeof book.sellingPrice === "number" &&
                    typeof book.originalPrice === "number" &&
                    book.originalPrice > book.sellingPrice;

                  const discountPercent = hasDiscount
                    ? Math.round(
                        ((book.originalPrice - book.sellingPrice) /
                          book.originalPrice) *
                          100
                      )
                    : 0;

                  return (
                    <div
                      key={book._id}
                      className="relative bg-white rounded-lg shadow-md border border-gray-200 p-3 flex flex-col items-center w-[180px] min-h-[320px]"
                    >
                      {hasDiscount && (
                        <span className="absolute top-2 left-2 bg-red-500 text-white text-xs px-2 py-0.5 rounded">
                          -{discountPercent}%
                        </span>
                      )}
                      <img
                        src={book.images?.[0] || "/default-book.jpg"}
                        alt={book.title}
                        className="w-[120px] h-[170px] object-cover mx-auto mb-2 rounded"
                      />
                      <h3 className="font-bold text-center text-base mb-1 line-clamp-2">
                        {book.title}
                      </h3>
                      <p className="text-xs text-gray-500 text-center mb-1">
                        {book.authors}
                      </p>
                      <div className="mb-2 text-center">
                        {hasDiscount && (
                          <span className="text-xs text-gray-400 line-through mr-1">
                            {book.originalPrice.toLocaleString()} đ
                          </span>
                        )}
                        <span className="text-lg text-red-600 font-bold">
                          {(
                            book.sellingPrice || book.originalPrice
                          ).toLocaleString()}{" "}
                          đ
                        </span>
                      </div>
                      <button
                        onClick={() => handleAddToCart(book._id)}
                        className="w-full bg-green-600 text-white py-1 text-xs rounded mb-1 hover:bg-green-700"
                      >
                        Thêm vào giỏ
                      </button>
                      <button
                        onClick={() => handleAddToWishlist(book._id)}
                        className="w-full bg-pink-500 text-white py-1 text-xs rounded mb-1 hover:bg-pink-600"
                      >
                        Yêu thích
                      </button>
                      <button
                        onClick={() => handleViewDetail(book._id)}
                        className="w-full bg-blue-600 text-white py-1 text-xs rounded hover:bg-blue-700"
                      >
                        Xem chi tiết
                      </button>
                    </div>
                  );
                })}
              </div>

              {totalPages > 1 && (
                <div className="flex justify-center items-center mt-8 gap-3">
                  <button
                    disabled={currentPage === 1}
                    onClick={handlePrevPage}
                    className="px-4 py-2 bg-gray-200 text-gray-700 rounded hover:bg-gray-300 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Trang trước
                  </button>
                  <span className="text-gray-700">
                    Trang {currentPage} / {totalPages}
                  </span>
                  <button
                    disabled={currentPage === totalPages}
                    onClick={handleNextPage}
                    className="px-4 py-2 bg-gray-200 text-gray-700 rounded hover:bg-gray-300 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Trang sau
                  </button>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default HomePage;
