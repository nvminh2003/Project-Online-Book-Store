// ... các import giữ nguyên
import React, { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
 import { jwtDecode } from 'jwt-decode';


const API_URL = process.env.REACT_APP_API_URL_BACKEND;

const ProductListingPage = () => {
  const [categories, setCategories] = useState([]);
  const [books, setBooks] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [searchKeyword, setSearchKeyword] = useState("");
  const [accountId, setAccountId] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    // ✅ Check quyền role là customer (bỏ comment nếu muốn bật lại bảo vệ route)
    
    // const token = localStorage.getItem("accessToken");
    // if (token) {
    //   try {
    //     const decoded = jwtDecode(token);
    //     if (decoded.role !== "customer") {
    //       alert("Bạn không có quyền truy cập!");
    //       window.location.href = "/login";
    //     } else {
    //       setAccountId(decoded._id);
    //     }
    //   } catch (err) {
    //     console.error("Token không hợp lệ:", err);
    //     window.location.href = "/login";
    //   }
    // } else {
    //   window.location.href = "/login";
    // }
    

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

      // ✅ Lọc theo danh mục nếu có
      if (categoryId) {
        fetchedBooks = fetchedBooks.filter((book) =>
          book.categories.some((cat) => cat._id === categoryId)
        );
      }

      // ✅ Sắp xếp theo publicationYear giảm dần (mới nhất lên trước)
      fetchedBooks.sort((a, b) => (b.publicationYear || 0) - (a.publicationYear || 0));

      setBooks(fetchedBooks);
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

  const handleAddToCart = async (bookId) => {
    try {
      if (!accountId) throw new Error("Không tìm thấy tài khoản");
      await axios.post(`${API_URL}/cart`, { bookId, accountId });
      alert("Đã thêm vào giỏ hàng!");
    } catch (err) {
      console.error("Lỗi khi thêm vào giỏ hàng:", err);
      alert("Không thể thêm vào giỏ hàng.");
    }
  };

  const handleAddToWishlist = async (bookId) => {
    try {
      if (!accountId) throw new Error("Không tìm thấy tài khoản");
      await axios.post(`${API_URL}/wishlist`, { bookId, accountId });
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
      {/* ✅ Đổi tiêu đề thành "Sách mới" */}
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

      {/* Danh mục và danh sách sách giữ nguyên */}
      <div className="flex">
        {/* Sidebar - Danh mục */}
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

        {/* Book list */}
        <div className="w-3/4 pl-4">
          {filteredBooks.length === 0 ? (
            <p>Không có sách nào.</p>
          ) : (
            <div className="grid grid-cols-3 gap-4">
              {filteredBooks.map((book) => {
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
                    className="border p-4 rounded shadow flex flex-col"
                  >
                    <img
                      src={book.images?.[0] || "/default-book.jpg"}
                      alt={book.title}
                      className="h-40 w-full object-cover mb-2 rounded"
                    />
                    <h3 className="text-lg font-semibold">{book.title}</h3>
                    <p className="text-sm text-gray-600">{book.authors}</p>

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
                          {(book.originalPrice || book.sellingPrice).toLocaleString()} đ
                        </p>
                      )}
                    </div>

                    <div className="mt-auto flex gap-2">
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
          )}
        </div>
      </div>
    </div>
  );
};

export default ProductListingPage;
