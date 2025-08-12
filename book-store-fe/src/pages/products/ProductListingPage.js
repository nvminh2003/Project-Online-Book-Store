// src/pages/HomePage.js
import React, { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate, useParams } from "react-router-dom";
import { Icon } from "@iconify/react";
import { useCart } from "../../contexts/CartContext"; // Import useCart hook
import { useAuth } from "../../contexts/AuthContext"; // Import useAuth hook
import WishlistButton from "../../components/wishlist/WishlistButton";
import { notifyError, notifySuccess } from "../../components/common/ToastManager";
import bookService from '../../services/bookService';
import categoryService from '../../services/categoryService';
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
  // const { bookId } = useParams();
  const navigate = useNavigate();
  const { addToCart } = useCart(); // Use the cart context
  const { user } = useAuth(); // Use the auth context

  // Hide cart and wishlist buttons for admin users
  const isAdmin = user?.role === 'superadmin' || user?.role === 'admindev' || user?.role === 'adminbusiness';

  useEffect(() => {
    fetchCategories();
    fetchBooks();
  }, []);

  const fetchCategories = async () => {
    try {
      const res = await categoryService.getAllCategories();
      setCategories(res.data || []);
    } catch (err) {
      console.error("Error fetching categories:", err);
      setCategories([]);
    }
  };

  const fetchBooks = async (categoryId = null) => {
    try {
      const res = await bookService.getAllBooks();
      let fetchedBooks = res.data?.books || [];
      if (categoryId) {
        fetchedBooks = fetchedBooks.filter((book) =>
          (book.categories || []).some((cat) => (cat._id || cat) === categoryId)
        );
      }
      fetchedBooks.sort((a, b) => (b.publicationYear || 0) - (a.publicationYear || 0));
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
        return [...books].sort((a, b) => (a.title || "").localeCompare(b.title || ""));
      case "za":
        return [...books].sort((a, b) => (b.title || "").localeCompare(a.title || ""));
      case "priceAsc":
        return [...books].sort((a, b) => (a.sellingPrice || a.originalPrice || 0) - (b.sellingPrice || b.originalPrice || 0));
      case "priceDesc":
        return [...books].sort((a, b) => (b.sellingPrice || b.originalPrice || 0) - (a.sellingPrice || a.originalPrice || 0));
      case "newest":
        // return [...books].sort((a, b) => (b.publicationYear || 0) - (a.publicationYear || 0));
        return [...books].sort((a, b) => new Date(b.createdAt || 0) - new Date(a.createdAt || 0));
      case "oldest":
        // return [...books].sort((a, b) => (a.publicationYear || 0) - (b.publicationYear || 0));
        return [...books].sort((a, b) => new Date(a.createdAt || 0) - new Date(b.createdAt || 0));
      default:
        // Mặc định: sắp xếp theo ngày tạo mới nhất
        return [...books].sort((a, b) => new Date(b.createdAt || 0) - new Date(a.createdAt || 0));
    }
  };

  const sortedBooks = getSortedBooks(filteredBooksByKeyword);
  const totalPages = Math.ceil(sortedBooks.length / booksPerPage);
  const startIndex = (currentPage - 1) * booksPerPage;
  const paginatedBooks = sortedBooks.slice(startIndex, startIndex + booksPerPage);

  const handleNextPage = () => {
    if (currentPage < totalPages) setCurrentPage((prev) => prev + 1);
  };

  const handlePrevPage = () => {
    if (currentPage > 1) setCurrentPage((prev) => prev - 1);
  };

  const handleAddToCart = async (bookId) => {
    const token = localStorage.getItem("accessToken");
    if (!token) {
      notifyError("Bạn cần đăng nhập để thêm sản phẩm vào giỏ hàng.");
      setTimeout(() => navigate("/auth/login"), 1500);
      return;
    }

    try {
      const result = await addToCart(bookId, 1);

      if (result.success) {
        notifySuccess("Đã thêm vào giỏ hàng thành công!");
      } else {
        notifyError(result.message || "Có lỗi xảy ra khi thêm vào giỏ hàng.");
      }
    } catch (err) {
      console.error("Add to cart error:", err.response?.data || err.message);
      notifyError(err.response?.data?.message || "Không thể thêm vào giỏ hàng.");
    }
  };

  const handleAddToWishlist = async (bookId) => {
    const token = localStorage.getItem("accessToken");
    if (!token) {
      notifyError("Bạn cần đăng nhập để thêm vào yêu thích.");
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
      notifySuccess("Đã thêm vào mục yêu thích!");
    } catch (err) {
      console.error("Wishlist error:", err.response?.data || err.message);
      notifyError(err.response?.data?.message || "Không thể thêm vào yêu thích.");
    }
  };

  const handleViewDetail = (bookId) => {
    navigate(`/detailbook/${bookId}`);
  };

  return (
    <div className="flex p-4">
      <div className="w-64 mr-6 hidden md:block">
        <div className="bg-blue-600 text-white font-bold text-lg px-4 py-3 rounded-t">DANH MỤC SÁCH</div>
        <ul className="bg-blue-50 border border-blue-200 rounded-b shadow divide-y divide-blue-100">
          <li
            className={`px-4 py-2 cursor-pointer hover:bg-blue-100 flex items-center gap-2 ${selectedCategory === null ? "text-blue-700 font-semibold bg-white" : ""}`}
            onClick={() => handleCategoryClick(null)}
          >
            <Icon icon="mdi:book-open-page-variant" width="22" height="22" color="#2563eb" /> Tất cả
          </li>
          {categories.map((cat) => (
            <li
              key={cat._id}
              className={`px-4 py-2 cursor-pointer hover:bg-blue-100 flex items-center gap-2 ${selectedCategory === cat._id ? "text-blue-700 font-semibold bg-white" : ""}`}
              onClick={() => handleCategoryClick(cat._id)}
            >
              <Icon icon="mdi:book-open-page-variant" width="22" height="22" color="#2563eb" /> {cat.name}
            </li>
          ))}
        </ul>
      </div>

      <div className="flex-1">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-6 gap-3">
          <h1 className="text-3xl font-bold text-gray-800">Sách hay sách mới</h1>
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
            <p className="col-span-full text-center text-gray-500 py-10">Không tìm thấy sách nào phù hợp.</p>
          ) : (
            paginatedBooks.map((book) => {
              const hasDiscount = typeof book.sellingPrice === "number" && typeof book.originalPrice === "number" && book.originalPrice > book.sellingPrice;
              const discountPercent = hasDiscount ? Math.round(((book.originalPrice - book.sellingPrice) / book.originalPrice) * 100) : 0;
              const isOutOfStock = typeof book.stockQuantity === 'number' && book.stockQuantity <= 0;
              return (
                <div
                  key={book._id}
                  className={`relative bg-white rounded-lg shadow-md border border-gray-200 p-3 flex flex-col items-center w-[220px] min-h-[410px] group cursor-pointer transition-all duration-200 hover:shadow-2xl hover:scale-105 hover:border-blue-400 hover:bg-blue-50 ${isOutOfStock ? 'opacity-60 pointer-events-none' : ''}`}
                  style={{ margin: '0 0.5rem', minHeight: 410, display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}
                  onClick={() => handleViewDetail(book._id)}
                >
                  {hasDiscount && (
                    <span className="absolute top-2 left-2 bg-red-500 text-white text-xs px-2 py-0.5 rounded">-{discountPercent}%</span>
                  )}
                  {isOutOfStock && (
                    <span className="absolute top-2 right-2 bg-gray-700 text-white text-xs px-2 py-0.5 rounded animate-pulse">Hết hàng</span>
                  )}
                  <img
                    src={book.images?.[0] || "/default-book.jpg"}
                    alt={book.title}
                    className="w-[120px] h-[170px] object-cover mx-auto mb-2 rounded"
                  />
                  <h3 className="font-semibold text-[17px] leading-snug text-gray-900 text-center mb-1 line-clamp-2 min-h-[48px]">
                    {book.title}
                  </h3>
                  <p className="text-xs text-gray-500 text-center mb-1">{Array.isArray(book.authors) ? book.authors.join(", ") : book.authors}</p>
                  <div className="mb-1 text-center text-xs text-gray-400">{book.publisher} {book.publicationYear ? `- ${book.publicationYear}` : ""}</div>
                  <div className="mb-2 text-center">
                    {hasDiscount && (
                      <span className="text-xs text-gray-400 line-through mr-1">{book.originalPrice.toLocaleString()} đ</span>
                    )}
                    <span className="text-lg text-red-600 font-bold">{(book.sellingPrice || book.originalPrice).toLocaleString()} đ</span>
                  </div>

                  {/* 3 icon buttons luôn hiển thị dưới giá, thẳng hàng, đều nhau, luôn ở cuối card */}
                  <div className="flex flex-row gap-3 mt-auto w-full justify-center items-end pb-2">
                    {/* Thêm vào giỏ - ẩn cho admin */}
                    {!isAdmin && (
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleAddToCart(book._id);
                        }}
                        className={`bg-white border border-blue-500 p-3 rounded-full flex items-center justify-center transition-all duration-200 ${isOutOfStock ? 'opacity-60 cursor-not-allowed pointer-events-none' : 'hover:bg-blue-100 hover:scale-110 hover:shadow-lg'}`}
                        title="Thêm vào giỏ hàng"
                        disabled={isOutOfStock}
                      >
                        <Icon icon="mdi:cart" width="20" height="20" color="#2563eb" />
                      </button>
                    )}

                    {/* Yêu thích - ẩn cho admin */}
                    {!isAdmin && (
                      <WishlistButton
                        bookId={book._id}
                        variant="icon-only"
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

                    {/* Xem chi tiết */}
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleViewDetail(book._id);
                      }}
                      className="bg-white border border-purple-500 p-3 rounded-full hover:bg-purple-100 hover:scale-110 hover:shadow-lg flex items-center justify-center transition-all duration-200"
                      title="Xem chi tiết"
                    >
                      <Icon icon="mdi:eye" width="20" height="20" color="#7c3aed" />
                    </button>
                  </div>
                </div>
              );
            })
          )}
        </div>

        {totalPages > 1 && (
          <div className="flex justify-center items-center mt-8 gap-3">
            <button disabled={currentPage === 1} onClick={handlePrevPage} className="px-4 py-2 bg-gray-200 text-gray-700 rounded hover:bg-gray-300 disabled:opacity-50">
              Trang trước
            </button>
            <span className="text-gray-700">Trang {currentPage} / {totalPages}</span>
            <button disabled={currentPage === totalPages} onClick={handleNextPage} className="px-4 py-2 bg-gray-200 text-gray-700 rounded hover:bg-gray-300 disabled:opacity-50">
              Trang sau
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default ProductDetailPage;