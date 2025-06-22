import React, { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { jwtDecode } from "jwt-decode";

const API_URL = process.env.REACT_APP_API_URL_BACKEND;

const HomePage = () => {
  const [categories, setCategories] = useState([]);
  const [books, setBooks] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [searchKeyword, setSearchKeyword] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const booksPerPage = 5;
  const [showCategory, setShowCategory] = useState(false);

  const navigate = useNavigate();

  useEffect(() => {
    fetchCategories();
    fetchBooks();
  }, []);

  const fetchCategories = async () => {
    try {
      const res = await axios.get(`${API_URL}/categories`);
      setCategories(res.data.data);
    } catch (err) {
      console.error("Error fetching categories:", err);
    }
  };

  const fetchBooks = async (categoryId = null) => {
    try {
      const res = await axios.get(`${API_URL}/books`, {
        params: { page: 1, limit: 100 },
      });

      let fetchedBooks = res.data.data.books;

      if (categoryId) {
        fetchedBooks = fetchedBooks.filter((book) =>
          book.categories.some((cat) => cat._id === categoryId)
        );
      }

      fetchedBooks.sort((a, b) => (b.publicationYear || 0) - (a.publicationYear || 0));
      setBooks(fetchedBooks);
      setCurrentPage(1); // Reset về trang đầu sau khi lọc
    } catch (err) {
      console.error("Error fetching books:", err);
    }
  };

  const handleCategoryClick = (categoryId) => {
    setSelectedCategory(categoryId);
    fetchBooks(categoryId);
  };

  const filteredBooks = books.filter((book) =>
    book.title.toLowerCase().includes(searchKeyword.toLowerCase())
  );

  // Pagination logic
  const totalPages = Math.ceil(filteredBooks.length / booksPerPage);
  const startIndex = (currentPage - 1) * booksPerPage;
  const paginatedBooks = filteredBooks.slice(startIndex, startIndex + booksPerPage);

  const handleNextPage = () => {
    if (currentPage < totalPages) setCurrentPage((prev) => prev + 1);
  };

  const handlePrevPage = () => {
    if (currentPage > 1) setCurrentPage((prev) => prev - 1);
  };

  const handleAddToCart = async (bookId) => {
    const token = localStorage.getItem("accessToken");
    if (!token) {
      navigate("/auth/login");
      return;
    }

    try {
      await axios.post(
        `${API_URL}/cart/add`,
        {
          items: [{ bookId, quantity: 1 }],
        },
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

  const handleAddToWishlist = async (bookId) => {
    const token = localStorage.getItem("accessToken");
    if (!token) {
      navigate("/auth/login");
      return;
    }

    try {
      await axios.post(
        `${API_URL}/wishlist/add`,
        { bookId },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      alert("Đã thêm vào mục yêu thích!");
    } catch (err) {
      console.error("Lỗi khi thêm vào yêu thích:", err);
      alert("Không thể thêm vào yêu thích.");
    }
  };

  const handleViewDetail = (bookId) => {
    const token = localStorage.getItem("accessToken");
    if (!token) {
      navigate("/auth/login");
      return;
    }

    navigate(`/detailbook/${bookId}`);
  };

  return (
    <div className="p-4">
      <div className="flex justify-between items-center mb-4">
        <h1 className="text-2xl font-bold">Sách mới</h1>
        <div className="flex items-center gap-4">
          <input
            type="text"
            placeholder="Tìm kiếm sách..."
            className="border rounded px-3 py-1"
            value={searchKeyword}
            onChange={(e) => setSearchKeyword(e.target.value)}
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
              className={`cursor-pointer px-4 py-2 hover:bg-blue-50 rounded-t-lg ${selectedCategory === null ? "font-semibold text-blue-600" : ""}`}
              onClick={() => { setShowCategory(false); handleCategoryClick(null); }}
            >
              Tất cả
            </li>
            {categories.map((cat, idx) => (
              <li
                key={cat._id}
                className={`cursor-pointer px-4 py-2 hover:bg-blue-50 ${selectedCategory === cat._id ? "font-semibold text-blue-600" : ""} ${idx === categories.length - 1 ? "rounded-b-lg" : ""}`}
                onClick={() => { setShowCategory(false); handleCategoryClick(cat._id); }}
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
            <p>Không có sách nào.</p>
          ) : (
            <>
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-6 justify-items-center">
                {paginatedBooks.map((book) => {
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
                    <div
                      key={book._id}
                      className="relative bg-white rounded-lg shadow-md border border-gray-200 p-3 flex flex-col items-center w-[180px] min-h-[320px]"
                    >
                      {hasDiscount && (
                        <span className="absolute top-2 left-2 bg-red-500 text-white text-xs px-2 py-0.5 rounded">-{discountPercent}%</span>
                      )}
                      <img
                        src={book.images?.[0] || '/default-book.jpg'}
                        alt={book.title}
                        className="w-[120px] h-[170px] object-cover mx-auto mb-2 rounded"
                      />
                      <h3 className="font-bold text-center text-base mb-1 line-clamp-2">{book.title}</h3>
                      <p className="text-xs text-gray-500 text-center mb-1">{book.authors}</p>
                      <div className="mb-2 text-center">
                        {hasDiscount && (
                          <span className="text-xs text-gray-400 line-through mr-1">
                            {book.originalPrice.toLocaleString()} đ
                          </span>
                        )}
                        <span className="text-lg text-red-600 font-bold">
                          {(book.sellingPrice || book.originalPrice).toLocaleString()} đ
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

              <div className="flex justify-center mt-4 gap-4">
                <button
                  disabled={currentPage === 1}
                  onClick={handlePrevPage}
                  className="px-4 py-2 bg-gray-200 rounded hover:bg-gray-300 disabled:opacity-50"
                >
                  Trang trước
                </button>
                <span className="px-4 py-2">
                  Trang {currentPage} / {totalPages}
                </span>
                <button
                  disabled={currentPage === totalPages}
                  onClick={handleNextPage}
                  className="px-4 py-2 bg-gray-200 rounded hover:bg-gray-300 disabled:opacity-50"
                >
                  Trang sau
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default HomePage;
