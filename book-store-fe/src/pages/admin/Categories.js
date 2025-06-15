import React, { useEffect, useState } from "react";
import axios from "axios";

const API = process.env.REACT_APP_API_URL_BACKEND;

const Categories = () => {
  const [categories, setCategories] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [editingCategory, setEditingCategory] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [nameInput, setNameInput] = useState("");
  const [loading, setLoading] = useState(false);

  const token = localStorage.getItem("accessToken");
  const headers = {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  };

  const fetchCategories = async () => {
    try {
      setLoading(true);
      const res = await axios.get(`${API}/categories`);
      const filtered = res.data.data.filter((c) =>
        c.name.toLowerCase().includes(searchTerm.toLowerCase())
      );
      setCategories(filtered);
    } catch (error) {
      alert("Lỗi khi lấy danh mục");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCategories();
  }, [searchTerm]);

  const totalPages = Math.ceil(categories.length / 10);
  const displayedCategories = categories.slice(
    (currentPage - 1) * 10,
    currentPage * 10
  );

  const handleDelete = async (id) => {
    if (!window.confirm("Bạn chắc chắn muốn xoá?")) return;
    try {
      await axios.delete(`${API}/categories/${id}`, headers);
      fetchCategories();
    } catch (error) {
      alert("Xoá thất bại");
    }
  };

  const handleEdit = (category) => {
    setEditingCategory(category);
    setNameInput(category.name);
    setShowForm(true);
  };

  const handleAddNew = () => {
    setEditingCategory(null);
    setNameInput("");
    setShowForm(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!nameInput.trim()) return alert("Tên không được trống");

    try {
      if (editingCategory) {
        await axios.put(
          `${API}/categories/${editingCategory._id}`,
          { name: nameInput },
          headers
        );
      } else {
        await axios.post(`${API}/categories`, { name: nameInput }, headers);
      }
      setShowForm(false);
      setNameInput("");
      fetchCategories();
    } catch (error) {
      alert(error?.response?.data?.message || "Thao tác thất bại");
    }
  };

  if (!token) {
    return <div className="p-4 text-red-500">Bạn cần đăng nhập để xem danh sách danh mục.</div>;
  }

  return (
    <div className="p-6 max-w-6xl mx-auto">
      <h2 className="text-2xl font-bold mb-4">Quản lý danh mục</h2>

      <div className="mb-4 flex items-center gap-3">
        <input
          type="text"
          placeholder="Tìm kiếm danh mục..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="px-3 py-2 border rounded w-64"
        />
        <button
          onClick={handleAddNew}
          className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
        >
          Thêm danh mục
        </button>
      </div>

      {loading ? (
        <p>Đang tải...</p>
      ) : (
        <>
          <table className="w-full table-auto border border-gray-300">
            <thead>
              <tr className="bg-gray-100">
                <th className="border px-4 py-2 text-left">Tên</th>
                <th className="border px-4 py-2 text-left">Slug</th>
                <th className="border px-4 py-2">Thao tác</th>
              </tr>
            </thead>
            <tbody>
              {displayedCategories.map((cat) => (
                <tr key={cat._id} className="hover:bg-gray-50">
                  <td className="border px-4 py-2">{cat.name}</td>
                  <td className="border px-4 py-2">{cat.slug}</td>
                  <td className="border px-4 py-2 text-center space-x-2">
                    <button
                      onClick={() => handleEdit(cat)}
                      className="bg-yellow-500 hover:bg-yellow-600 text-white px-3 py-1 rounded"
                    >
                      Sửa
                    </button>
                    <button
                      onClick={() => handleDelete(cat._id)}
                      className="bg-red-600 hover:bg-red-700 text-white px-3 py-1 rounded"
                    >
                      Xoá
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="mt-4 flex gap-2">
              {Array.from({ length: totalPages }).map((_, i) => (
                <button
                  key={i}
                  onClick={() => setCurrentPage(i + 1)}
                  className={`px-3 py-1 border rounded ${
                    currentPage === i + 1
                      ? "bg-blue-600 text-white"
                      : "bg-white text-black"
                  }`}
                >
                  {i + 1}
                </button>
              ))}
            </div>
          )}
        </>
      )}

      {/* Popup Form */}
      {showForm && (
  <>
    <div className="fixed inset-0 bg-white/60 backdrop-blur-sm flex items-center justify-center z-50 transition-all">
      <div className="bg-white p-6 rounded-xl shadow-2xl w-full max-w-md border border-gray-200">
        <h3 className="text-xl font-semibold mb-4 text-gray-800">
          {editingCategory ? "Sửa danh mục" : "Thêm danh mục"}
        </h3>
        <form onSubmit={handleSubmit} className="space-y-4">
          <input
            type="text"
            value={nameInput}
            onChange={(e) => setNameInput(e.target.value)}
            placeholder="Tên danh mục"
            className="w-full border px-4 py-2 rounded outline-none focus:ring-2 focus:ring-blue-500"
          />
          <div className="flex justify-end gap-2">
            <button
              type="button"
              onClick={() => setShowForm(false)}
              className="px-4 py-2 bg-gray-300 rounded hover:bg-gray-400 text-gray-800"
            >
              Huỷ
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
            >
              Lưu
            </button>
          </div>
        </form>
      </div>
    </div>
  </>
)}

    </div>
  );
};

export default Categories;
