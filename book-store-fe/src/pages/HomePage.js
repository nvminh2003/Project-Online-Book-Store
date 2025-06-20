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
  const booksPerPage = 6;

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

      <div className="flex flex-col md:flex-row gap-6">
        <div className="w-full md:w-1/5 pr-4">
          <h2 className="text-xl font-semibold mb-4 text-gray-700 border-b pb-2">
            Danh mục
          </h2>
          <ul className="space-y-1">
            <li>
              <button
                className={`w-full text-left px-3 py-2 rounded hover:bg-blue-100 transition-colors ${
                  selectedCategory === null
                    ? "font-bold text-blue-600 bg-blue-50"
                    : "text-gray-600"
                }`}
                onClick={() => handleCategoryClick(null)}
              >
                Tất cả sách
              </button>
            </li>
            {categories.map((cat) => (
              <li key={cat._id}>
                <button
                  className={`w-full text-left px-3 py-2 rounded hover:bg-blue-100 transition-colors ${
                    selectedCategory === cat._id
                      ? "font-bold text-blue-600 bg-blue-50"
                      : "text-gray-600"
                  }`}
                  onClick={() => handleCategoryClick(cat._id)}
                >
                  {cat.name}
                </button>
              </li>
            ))}
          </ul>
        </div>

        <div className="w-full md:w-4/5">
          {paginatedBooks.length === 0 ? (
            <p className="text-center text-gray-500 py-10">
              Không tìm thấy sách nào phù hợp.
            </p>
          ) : (
            <>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
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
                      className="bg-white rounded-lg shadow-md p-4 flex flex-col hover:shadow-xl transition-shadow duration-300"
                    >
                      <div className="w-full h-56 mb-3 overflow-hidden rounded-md">
                        <img
                          src={book.images?.[0] || "/default-book.jpg"} // Lấy ảnh đầu tiên
                          alt={book.title}
                          className="w-full h-full object-cover transition-transform duration-300 hover:scale-105"
                        />
                      </div>

                      <h3
                        className="text-lg font-semibold text-gray-800 truncate mb-1"
                        title={book.title}
                      >
                        {book.title}
                      </h3>
                      <p
                        className="text-sm text-gray-600 truncate mb-2"
                        title={
                          Array.isArray(book.authors)
                            ? book.authors.join(", ")
                            : book.authors
                        }
                      >
                        Tác giả:{" "}
                        {Array.isArray(book.authors)
                          ? book.authors.join(", ")
                          : book.authors}
                      </p>

                      <div className="mb-3">
                        {hasDiscount ? (
                          <>
                            <p className="text-red-500 text-xl font-bold">
                              {book.sellingPrice.toLocaleString("vi-VN")} đ
                            </p>
                            <div className="text-sm text-gray-500">
                              <span className="line-through mr-2">
                                {book.originalPrice.toLocaleString("vi-VN")} đ
                              </span>
                              <span className="text-green-600 font-medium">
                                (-{discountPercent}%)
                              </span>
                            </div>
                          </>
                        ) : (
                          <p className="text-red-500 text-xl font-bold">
                            {(
                              book.sellingPrice ||
                              book.originalPrice ||
                              0
                            ).toLocaleString("vi-VN")}{" "}
                            đ
                          </p>
                        )}
                      </div>

                      <div className="mt-auto flex flex-col sm:flex-row gap-2">
                        <button
                          onClick={() => handleAddToCart(book._id)}
                          className="flex-1 bg-green-600 text-white px-3 py-2 rounded hover:bg-green-700 transition text-sm"
                        >
                          Thêm vào giỏ
                        </button>
                        <button
                          onClick={() => handleAddToWishlist(book._id)}
                          className="flex-1 bg-pink-500 text-white px-3 py-2 rounded hover:bg-pink-600 transition text-sm"
                        >
                          Yêu thích
                        </button>
                      </div>
                      <button
                        onClick={() => handleViewDetail(book._id)}
                        className="mt-2 w-full bg-blue-600 text-white px-3 py-2 rounded hover:bg-blue-700 transition text-sm"
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
