import React, { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { jwtDecode } from "jwt-decode";

const API_URL = process.env.REACT_APP_API_URL_BACKEND;

const ProductListingPage = () => {
  const [categories, setCategories] = useState([]);
  const [books, setBooks] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [searchKeyword, setSearchKeyword] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const booksPerPage = 3;

  const navigate = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem("accessToken");
    if (token) {
      try {
        const decoded = jwtDecode(token);
        if (decoded.role !== "customer") {
          alert("Bạn không có quyền truy cập!");
          window.location.href = "/login";
        }
      } catch (err) {
        console.error("Token không hợp lệ:", err);
        window.location.href = "/login";
      }
    } else {
      window.location.href = "/login";
    }

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

      fetchedBooks.sort(
        (a, b) => (b.publicationYear || 0) - (a.publicationYear || 0)
      );
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
  const paginatedBooks = filteredBooks.slice(
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
    try {
      const token = localStorage.getItem("accessToken");
      if (!token) throw new Error("Bạn chưa đăng nhập");

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
      console.error(
        "Lỗi khi thêm vào giỏ hàng:",
        err.response?.data || err.message
      );
      alert("Không thể thêm vào giỏ hàng.");
    }
  };

  const handleAddToWishlist = async (bookId) => {
    try {
      const token = localStorage.getItem("accessToken");
      if (!token) throw new Error("Bạn chưa đăng nhập");

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
          <button
            onClick={() => navigate("/cart")}
            className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
          >
            Giỏ hàng
          </button>
        </div>
      </div>

      <div className="flex">
        <div className="w-1/4 pr-4 border-r">
          <h2 className="text-xl font-bold mb-4">Danh mục</h2>
          <ul>
            <li
              className={`cursor-pointer mb-2 ${
                selectedCategory === null ? "font-semibold text-blue-600" : ""
              }`}
              onClick={() => handleCategoryClick(null)}
            >
              Tất cả
            </li>
            {categories.map((cat) => (
              <li
                key={cat._id}
                className={`cursor-pointer mb-2 ${
                  selectedCategory === cat._id
                    ? "font-semibold text-blue-600"
                    : ""
                }`}
                onClick={() => handleCategoryClick(cat._id)}
              >
                {cat.name}
              </li>
            ))}
          </ul>
        </div>

        <div className="w-3/4 pl-4">
          {paginatedBooks.length === 0 ? (
            <p>Không có sách nào.</p>
          ) : (
            <>
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                {paginatedBooks.map((book) => {
                  const hasDiscount =
                    book.sellingPrice > 0 &&
                    book.originalPrice &&
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
                      className="bg-white rounded-2xl shadow-md p-4 flex flex-col hover:shadow-lg transition-shadow"
                    >
                      <div className="mb-2 relative">
                        <div className="flex gap-2 overflow-x-auto scrollbar-hide">
                          {book.images?.length > 0 ? (
                            book.images.map((imgUrl, idx) => (
                              <img
                                key={idx}
                                src={imgUrl}
                                alt={`Ảnh ${idx + 1}`}
                                className="h-40 w-32 object-cover rounded-lg shadow-sm flex-shrink-0"
                              />
                            ))
                          ) : (
                            <img
                              src="/default-book.jpg"
                              alt="default"
                              className="h-40 w-32 object-cover rounded-lg shadow-sm flex-shrink-0"
                            />
                          )}
                        </div>
                      </div>

                      <h3 className="text-lg font-semibold truncate">
                        {book.title}
                      </h3>
                      <p className="text-sm text-gray-600 truncate">
                        {book.authors}
                      </p>

                      <div className="mb-2">
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
                            <p className="text-red-500 font-bold">
                              {book.sellingPrice.toLocaleString()} đ
                            </p>
                          </>
                        ) : (
                          <p className="text-red-500 font-bold">
                            {(
                              book.originalPrice || book.sellingPrice
                            ).toLocaleString()}{" "}
                            đ
                          </p>
                        )}
                      </div>

                      <div className="mt-auto flex gap-2 flex-wrap">
                        <button
                          onClick={() => handleAddToCart(book._id)}
                          className="bg-green-600 text-white px-2 py-1 rounded hover:bg-green-700 text-sm"
                        >
                          Thêm vào giỏ
                        </button>
                        <button
                          onClick={() => handleAddToWishlist(book._id)}
                          className="bg-pink-500 text-white px-2 py-1 rounded hover:bg-pink-600 text-sm"
                        >
                          Yêu thích
                        </button>
                        <button
                          onClick={() => handleViewDetail(book._id)}
                          className="bg-blue-600 text-white px-2 py-1 rounded hover:bg-blue-700 text-sm"
                        >
                          Xem chi tiết
                        </button>
                      </div>
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

export default ProductListingPage;
