import React, { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { Icon } from '@iconify/react';
import bookService from '../../services/bookService';
import categoryService from '../../services/categoryService';

const API_URL = process.env.REACT_APP_API_URL_BACKEND;

const Books = () => {
  const [books, setBooks] = useState([]);
  const [categories, setCategories] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [filteredBooks, setFilteredBooks] = useState([]);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [sortOption, setSortOption] = useState("default");
  const [toastMsg, setToastMsg] = useState("");
  const [toastType, setToastType] = useState("success"); // 'success' | 'error'
  const [deleteId, setDeleteId] = useState(null); // id sách cần xóa
  const [showDeleteModal, setShowDeleteModal] = useState(false); // trạng thái modal xác nhận

  const navigate = useNavigate();

  useEffect(() => {
    fetchBooks();
    fetchCategories();
  }, [page]);

  const fetchBooks = async () => {
    try {
      const result = await bookService.getAllBooks(page, 10);
      if (result && result.data) {
        setBooks(result.data.books);
        setFilteredBooks(result.data.books);
        setTotalPages(result.data.pagination.totalPages);
      }
    } catch (error) {
      console.error("Error fetching books:", error);
      setBooks([]);
      setFilteredBooks([]);
    }
  };

  const fetchCategories = async () => {
    try {
      const result = await categoryService.getAllCategories();
      setCategories(result.data?.categories || []);
    } catch (error) {
      console.error("Error fetching categories:", error);
      setCategories([]);
    }
  };

  const handleSearch = (e) => {
    const term = e.target.value;
    setSearchTerm(term);
    const filtered = books.filter((book) =>
      book.title.toLowerCase().includes(term.toLowerCase())
    );
    setFilteredBooks(filtered);
  };

  useEffect(() => {
    let filtered = books.filter((book) =>
      book.title.toLowerCase().includes(searchTerm.toLowerCase())
    );
    // Sắp xếp theo sortOption
    switch (sortOption) {
      case "az":
        filtered = filtered.sort((a, b) => a.title.localeCompare(b.title));
        break;
      case "za":
        filtered = filtered.sort((a, b) => b.title.localeCompare(a.title));
        break;
      case "priceAsc":
        filtered = filtered.sort((a, b) => a.sellingPrice - b.sellingPrice);
        break;
      case "priceDesc":
        filtered = filtered.sort((a, b) => b.sellingPrice - a.sellingPrice);
        break;
      case "newest":
        filtered = filtered.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
        break;
      case "oldest":
        filtered = filtered.sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt));
        break;
      default:
        break;
    }
    setFilteredBooks(filtered);
  }, [searchTerm, books, sortOption]);

  // Xử lý xác nhận xóa
  const confirmDelete = (id) => {
    setDeleteId(id);
    setShowDeleteModal(true);
  };

  const handleDelete = async () => {
    if (!deleteId) return;
    try {
      await bookService.deleteBook(deleteId);
      setToastMsg("Đã xóa sách thành công!");
      setToastType("success");
      setTimeout(() => setToastMsg(""), 1500);
      setShowDeleteModal(false);
      setDeleteId(null);
      fetchBooks();
    } catch (error) {
      console.error("Error deleting book:", error);
      setToastMsg("Không xóa được sách. Vui lòng thử lại.");
      setToastType("error");
      setTimeout(() => setToastMsg(""), 1500);
      setShowDeleteModal(false);
      setDeleteId(null);
    }
  };

  return (
    <div className="p-4">
      {toastMsg && (
        <div className={`fixed top-4 left-1/2 -translate-x-1/2 z-50 px-6 py-3 rounded-lg shadow-lg animate-fade-in text-center text-base font-medium ${toastType === "success" ? "bg-green-100 border border-green-400 text-green-700" : "bg-red-100 border border-red-400 text-red-700"}`}>
          {toastMsg}
        </div>
      )}
      {/* Modal xác nhận xóa */}
      {showDeleteModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center pointer-events-none">
          <div className="bg-white rounded-xl shadow-xl p-6 w-full max-w-xs text-center pointer-events-auto border border-gray-200">
            <div className="mb-4 text-lg font-semibold text-gray-800">Xác nhận xóa sách?</div>
            <div className="mb-6 text-gray-600">Bạn có chắc chắn muốn xóa sách này không?</div>
            <div className="flex justify-center gap-3">
              <button
                onClick={handleDelete}
                className="bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700 transition font-medium"
              >
                Xóa
              </button>
              <button
                onClick={() => { setShowDeleteModal(false); setDeleteId(null); }}
                className="bg-gray-200 text-gray-700 px-4 py-2 rounded hover:bg-gray-300 transition font-medium"
              >
                Hủy
              </button>
            </div>
          </div>
        </div>
      )}
      <h1 className="text-2xl font-bold mb-4">Quản lý sách</h1>
      <div className="flex flex-col md:flex-row md:justify-between md:items-center mb-4 gap-2">
        <input
          type="text"
          placeholder="Tìm kiếm sách..."
          value={searchTerm}
          onChange={handleSearch}
          className="border p-2 rounded w-full md:w-1/2"
        />
        <div className="flex items-center gap-2">
          <label htmlFor="sortSelect" className="text-sm font-medium">Sắp xếp:</label>
          <select
            id="sortSelect"
            value={sortOption}
            onChange={e => setSortOption(e.target.value)}
            className="border p-2 rounded"
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
        <button
          onClick={() => navigate("/addbook")}
          className="bg-blue-600 text-white px-4 py-2 rounded flex items-center gap-1 hover:bg-blue-700 transition"
        >
          <Icon icon="mdi:plus" width="20" height="20" />
          Thêm sách
        </button>
        <button
          onClick={() => navigate("/autoadd")}
          className="bg-green-600 text-white px-4 py-2 rounded flex items-center gap-1 hover:bg-green-700 transition"
        >
          <Icon icon="mdi:file-excel" width="20" height="20" />
          Thêm sách từ Excel
        </button>
      </div>

      <table className="min-w-full bg-white border border-gray-200 text-gray-700">
        <thead>
          <tr className="bg-gray-50 text-gray-500">
            <th className="border border-gray-200 px-4 py-2 font-semibold">Tiêu đề</th>
            <th className="border border-gray-200 px-4 py-2 font-semibold">Tác giả</th>
            <th className="border border-gray-200 px-4 py-2 font-semibold">Giá bán</th>
            <th className="border border-gray-200 px-4 py-2 font-semibold">Số lượng</th>
            <th className="border border-gray-200 px-4 py-2 font-semibold">Danh mục</th>
            <th className="border border-gray-200 px-4 py-2 font-semibold">Thao tác</th>
          </tr>
        </thead>
        <tbody>
          {Array.isArray(filteredBooks) && filteredBooks.map((book) => (
            <tr key={book._id} className="hover:bg-gray-50">
              <td className="border border-gray-200 px-4 py-2 text-gray-700">{book.title}</td>
              <td className="border border-gray-200 px-4 py-2 text-gray-700">{book.authors}</td>
              <td className="border border-gray-200 px-4 py-2 text-gray-700">{book.sellingPrice.toLocaleString()}đ</td>
              <td className="border border-gray-200 px-4 py-2 text-gray-700">{book.stockQuantity}</td>
              <td className="border border-gray-200 px-4 py-2 text-gray-700">{book.categories.map((cat) => cat.name).join(", ")}</td>
              <td className="border border-gray-200 px-4 py-2 text-center space-x-2">
                <button
                  onClick={() => navigate(`/editbook/${book._id}`)}
                  className="bg-transparent p-1 rounded hover:bg-blue-100 transition"
                  title="Sửa"
                >
                  <Icon icon="fluent:edit-20-filled" width="28" height="28" color="#2563eb" />
                </button>
                <button
                  onClick={() => confirmDelete(book._id)}
                  className="bg-transparent p-1 rounded hover:bg-red-100 transition"
                  title="Xóa"
                >
                  <Icon icon="fluent:delete-20-filled" width="28" height="28" color="#f44336" />
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      <div className="flex justify-center mt-4 space-x-2">
        <button
          onClick={() => setPage((p) => Math.max(1, p - 1))}
          disabled={page === 1}
          className="px-3 py-1 border rounded disabled:opacity-50 flex items-center gap-1"
        >
          <Icon icon="mdi:chevron-left" width="18" height="18" />
          Trước
        </button>
        <span className="px-3 py-1">Trang {page} / {totalPages}</span>
        <button
          onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
          disabled={page === totalPages}
          className="px-3 py-1 border rounded disabled:opacity-50 flex items-center gap-1"
        >
          Sau
          <Icon icon="mdi:chevron-right" width="18" height="18" />
        </button>
      </div>
    </div>
  );
};


export default Books;
