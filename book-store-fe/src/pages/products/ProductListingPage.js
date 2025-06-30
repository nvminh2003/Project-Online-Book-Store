// src/pages/HomePage.js
import React, { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { Icon } from "@iconify/react";
import { useCart } from "../../contexts/CartContext"; // Import useCart hook
const API_URL =
  process.env.REACT_APP_API_URL_BACKEND || "http://localhost:9999/api";

const ProductDetailPage = () => {
  const [categories, setCategories] = useState([]);
  const [books, setBooks] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [searchKeyword, setSearchKeyword] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const booksPerPage = 8;
  const [sortOption, setSortOption] = useState("default");
  const [toastMsg, setToastMsg] = useState("");
  const [toastType, setToastType] = useState("success"); // 'success' | 'error'

  const navigate = useNavigate();
  const { addToCart } = useCart(); // Use the cart context

  useEffect(() => {
    fetchCategories();
    fetchBooks();
  }, []);

  const fetchCategories = async () => {
    try {
      const res = await axios.get(`${API_URL}/categories`);
      setCategories(res.data.data || []);
    } catch (err) {
      console.error("Error fetching categories:", err);
      setCategories([]);
    }
  };

  const fetchBooks = async (categoryId = null) => {
    try {
      const res = await axios.get(`${API_URL}/books`);
      let fetchedBooks = res.data.data?.books || [];
      if (categoryId) {
        fetchedBooks = fetchedBooks.filter((book) =>
          (book.categories || []).some((cat) => (cat._id || cat) === categoryId)
        );
      }
      fetchedBooks.sort(
        (a, b) => (b.publicationYear || 0) - (a.publicationYear || 0)
      );
      setBooks(fetchedBooks);
      setCurrentPage(1);
    } catch (err) {
      console.error("Error fetching books:", err);
      setBooks([]);
    }
  };

  const handleCategoryClick = (categoryId) => {
    setSelectedCategory(categoryId);
    fetchBooks(categoryId);
  };

  const filteredBooksByKeyword = books.filter((book) =>
    (book.title || "").toLowerCase().includes(searchKeyword.toLowerCase())
  );

  const getSortedBooks = (books) => {
    switch (sortOption) {
      case "az":
        return [...books].sort((a, b) =>
          (a.title || "").localeCompare(b.title || "")
        );
      case "za":
        return [...books].sort((a, b) =>
          (b.title || "").localeCompare(a.title || "")
        );
      case "priceAsc":
        return [...books].sort(
          (a, b) =>
            (a.sellingPrice || a.originalPrice || 0) -
            (b.sellingPrice || b.originalPrice || 0)
        );
      case "priceDesc":
        return [...books].sort(
          (a, b) =>
            (b.sellingPrice || b.originalPrice || 0) -
            (a.sellingPrice || a.originalPrice || 0)
        );
      case "newest":
        return [...books].sort(
          (a, b) => (b.publicationYear || 0) - (a.publicationYear || 0)
        );
        return [...books].sort(
          (a, b) => new Date(b.createdAt || 0) - new Date(a.createdAt || 0)
        );
      case "oldest":
        return [...books].sort(
          (a, b) => (a.publicationYear || 0) - (b.publicationYear || 0)
        );
        return [...books].sort(
          (a, b) => new Date(a.createdAt || 0) - new Date(b.createdAt || 0)
        );
      default:
        // Mặc định: sắp xếp theo ngày tạo mới nhất
        return [...books].sort(
          (a, b) => new Date(b.createdAt || 0) - new Date(a.createdAt || 0)
        );
    }
  };

  const sortedBooks = getSortedBooks(filteredBooksByKeyword);
  const totalPages = Math.ceil(sortedBooks.length / booksPerPage);
  const startIndex = (currentPage - 1) * booksPerPage;
  const paginatedBooks = sortedBooks.slice(
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
    if (!token) {
      setToastMsg("Bạn cần đăng nhập để thêm sản phẩm vào giỏ hàng.");
      setToastType("error");
      setTimeout(() => navigate("/auth/login"), 1500);
      return;
    }

    try {
      // Use the addToCart function from CartContext
      const result = await addToCart(bookId, 1);

      if (result.success) {
        setToastMsg("Đã thêm vào giỏ hàng thành công!");
        setToastType("success");
        setTimeout(() => setToastMsg(""), 1500);
      } else {
        setToastMsg(result.message || "Có lỗi xảy ra khi thêm vào giỏ hàng.");
        setToastType("error");
        setTimeout(() => setToastMsg(""), 1500);
      }
    } catch (err) {
      console.error("Add to cart error:", err.response?.data || err.message);
      setToastMsg(
        err.response?.data?.message || "Không thể thêm vào giỏ hàng."
      );
      setToastType("error");
      setTimeout(() => setToastMsg(""), 1500);
    }
  };

  const handleAddToWishlist = async (bookId) => {
    const token = localStorage.getItem("accessToken");
    if (!token) {
      setToastMsg("Bạn cần đăng nhập để thêm vào yêu thích.");
      setToastType("error");
      setTimeout(() => navigate("/auth/login"), 1500);
      return;
    }
    try {
      await axios.post(
        `${API_URL}/wishlist/add`,
        { bookId },
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      setToastMsg("Đã thêm vào mục yêu thích!");
      setToastType("success");
      setTimeout(() => setToastMsg(""), 1500);
    } catch (err) {
      console.error("Wishlist error:", err.response?.data || err.message);
      setToastMsg(
        err.response?.data?.message || "Không thể thêm vào yêu thích."
      );
      setToastType("error");
      setTimeout(() => setToastMsg(""), 1500);
    }
  };

  const handleViewDetail = (bookId) => {
    navigate(`/detailbook/${bookId}`);
  };

  return (
    <div className="flex p-4">
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
      <div className="w-64 mr-6 hidden md:block">
        <div className="bg-blue-600 text-white font-bold text-lg px-4 py-3 rounded-t">
          DANH MỤC SÁCH
        </div>
        <ul className="bg-blue-50 border border-blue-200 rounded-b shadow divide-y divide-blue-100">
          <li
            className={`px-4 py-2 cursor-pointer hover:bg-blue-100 flex items-center gap-2 ${
              selectedCategory === null
                ? "text-blue-700 font-semibold bg-white"
                : ""
            }`}
            onClick={() => handleCategoryClick(null)}
          >
            <Icon
              icon="mdi:book-open-page-variant"
              width="22"
              height="22"
              color="#2563eb"
            />{" "}
            Tất cả
          </li>
          {categories.map((cat) => (
            <li
              key={cat._id}
              className={`px-4 py-2 cursor-pointer hover:bg-blue-100 flex items-center gap-2 ${
                selectedCategory === cat._id
                  ? "text-blue-700 font-semibold bg-white"
                  : ""
              }`}
              onClick={() => handleCategoryClick(cat._id)}
            >
              <Icon
                icon="mdi:book-open-page-variant"
                width="22"
                height="22"
                color="#2563eb"
              />{" "}
              {cat.name}
            </li>
          ))}
        </ul>
      </div>

      <div className="flex-1">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-6 gap-3">
          <h1 className="text-3xl font-bold text-gray-800">
            Sách hay sách mới
          </h1>
          <div className="flex gap-3 w-full sm:w-auto">
            <input
              type="text"
              placeholder="Tìm kiếm sách theo tên..."
              className="border rounded-lg px-4 py-2 w-full sm:w-64 focus:ring-2 focus:ring-blue-500 outline-none transition-shadow"
              value={searchKeyword}
              onChange={(e) => {
                setSearchKeyword(e.target.value);
                setCurrentPage(1);
              }}
            />
            <div className="flex items-center gap-2">
              <span className="text-gray-700">Sắp xếp :</span>
              <select
                className="border rounded px-2 py-1"
                value={sortOption}
                onChange={(e) => setSortOption(e.target.value)}
              >
                <option value="default">Mặc định</option>
                <option value="az">A → Z</option>
                <option value="za">Z → A</option>
                <option value="priceAsc">Giá tăng dần</option>
                <option value="priceDesc">Giá giảm dần</option>
                <option value="newest">Hàng mới nhất</option>
                <option value="oldest">Hàng cũ nhất</option>
              </select>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-x-12 gap-y-14 justify-items-center">
          {paginatedBooks.length === 0 ? (
            <p className="col-span-full text-center text-gray-500 py-10">
              Không tìm thấy sách nào phù hợp.
            </p>
          ) : (
            paginatedBooks.map((book) => {
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
                  className="relative bg-white rounded-lg shadow-md border border-gray-200 p-3 flex flex-col items-center w-[220px] min-h-[410px] group cursor-pointer transition-all duration-200 hover:shadow-2xl hover:scale-105 hover:border-blue-400 hover:bg-blue-50"
                  style={{
                    margin: "0 0.5rem",
                    minHeight: 410,
                    display: "flex",
                    flexDirection: "column",
                    justifyContent: "space-between",
                  }}
                  onClick={() => handleViewDetail(book._id)}
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
                    {Array.isArray(book.authors)
                      ? book.authors.join(", ")
                      : book.authors}
                  </p>
                  <div className="mb-1 text-center text-xs text-gray-400">
                    {book.publisher}{" "}
                    {book.publicationYear ? `- ${book.publicationYear}` : ""}
                  </div>
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

                  {/* 3 icon buttons luôn hiển thị dưới giá, thẳng hàng, đều nhau, luôn ở cuối card */}
                  <div className="flex flex-row gap-3 mt-auto w-full justify-center items-end pb-2">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleAddToCart(book._id);
                      }}
                      className="bg-white border border-blue-500 text-blue-600 p-3 rounded-full hover:bg-blue-100 hover:scale-110 hover:shadow-xl shadow-lg flex items-center justify-center transition-all duration-200"
                      title="Thêm vào giỏ hàng"
                    >
                      <Icon
                        icon="mdi:cart"
                        width="24"
                        height="24"
                        color="#2563eb"
                      />
                    </button>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleAddToWishlist(book._id);
                      }}
                      className="bg-white border border-blue-500 text-blue-600 p-3 rounded-full hover:bg-blue-100 hover:scale-110 hover:shadow-xl shadow-lg flex items-center justify-center transition-all duration-200"
                      title="Yêu thích"
                    >
                      <Icon
                        icon="mdi:heart"
                        width="24"
                        height="24"
                        color="#2563eb"
                      />
                    </button>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleViewDetail(book._id);
                      }}
                      className="bg-white border border-blue-500 text-blue-600 p-3 rounded-full hover:bg-blue-100 hover:scale-110 hover:shadow-xl shadow-lg flex items-center justify-center transition-all duration-200"
                      title="Xem chi tiết"
                    >
                      <Icon
                        icon="mdi:eye"
                        width="24"
                        height="24"
                        color="#2563eb"
                      />
                    </button>
                  </div>
                </div>
              );
            })
          )}
        </div>

        {totalPages > 1 && (
          <div className="flex justify-center items-center mt-8 gap-3">
            <button
              disabled={currentPage === 1}
              onClick={handlePrevPage}
              className="px-4 py-2 bg-gray-200 text-gray-700 rounded hover:bg-gray-300 disabled:opacity-50"
            >
              Trang trước
            </button>
            <span className="text-gray-700">
              Trang {currentPage} / {totalPages}
            </span>
            <button
              disabled={currentPage === totalPages}
              onClick={handleNextPage}
              className="px-4 py-2 bg-gray-200 text-gray-700 rounded hover:bg-gray-300 disabled:opacity-50"
            >
              Trang sau
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default ProductDetailPage;
