import React, { useEffect, useState } from "react";
import axios from "axios";
import { Icon } from '@iconify/react';
import categoryService from '../../services/categoryService';

const API = process.env.REACT_APP_API_URL_BACKEND;

const Categories = () => {
  const [categories, setCategories] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [editingCategory, setEditingCategory] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [nameInput, setNameInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [toastMsg, setToastMsg] = useState("");
  const [toastType, setToastType] = useState("success"); // 'success' | 'error'
  const [deleteId, setDeleteId] = useState(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);

  const token = localStorage.getItem("accessToken");
  const headers = {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  };

  const fetchCategories = async () => {
    try {
      setLoading(true);
      const res = await categoryService.getAllCategories();
      const filtered = res.data.filter((c) =>
        c.name.toLowerCase().includes(searchTerm.toLowerCase())
      );
      setCategories(filtered);
    } catch (error) {
      setToastMsg("Lỗi khi lấy danh mục");
      setToastType("error");
      setTimeout(() => setToastMsg(""), 1500);
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

  const confirmDelete = (id) => {
    setDeleteId(id);
    setShowDeleteModal(true);
  };

  const handleDelete = async () => {
    if (!deleteId) return;
    try {
      await categoryService.deleteCategory(deleteId);
      setToastMsg("Đã xoá danh mục thành công!");
      setToastType("success");
      setTimeout(() => setToastMsg(""), 1500);
      setShowDeleteModal(false);
      setDeleteId(null);
      fetchCategories();
    } catch (error) {
      setToastMsg("Xoá thất bại");
      setToastType("error");
      setTimeout(() => setToastMsg(""), 1500);
      setShowDeleteModal(false);
      setDeleteId(null);
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
    if (!nameInput.trim()) {
      setToastMsg("Tên không được trống");
      setToastType("error");
      setTimeout(() => setToastMsg(""), 1500);
      return;
    }
    try {
      if (editingCategory) {
        await categoryService.updateCategory(editingCategory._id, { name: nameInput });
      } else {
        await categoryService.createCategory({ name: nameInput });
      }
      setShowForm(false);
      setNameInput("");
      setToastMsg("Lưu danh mục thành công!");
      setToastType("success");
      setTimeout(() => setToastMsg(""), 1500);
      fetchCategories();
    } catch (error) {
      setToastMsg(error?.response?.data?.message || "Thao tác thất bại");
      setToastType("error");
      setTimeout(() => setToastMsg(""), 1500);
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
          <table className="w-full table-auto border border-gray-200 text-gray-700">
            <thead>
              <tr className="bg-gray-50 text-gray-500">
                <th className="border border-gray-200 px-4 py-2 text-left font-semibold">Tên</th>
                <th className="border border-gray-200 px-4 py-2 text-left font-semibold">Slug</th>
                <th className="border border-gray-200 px-4 py-2 font-semibold">Thao tác</th>
              </tr>
            </thead>
            <tbody>
              {displayedCategories.map((cat) => (
                <tr key={cat._id} className="hover:bg-gray-50">
                  <td className="border border-gray-200 px-4 py-2 text-gray-700">{cat.name}</td>
                  <td className="border border-gray-200 px-4 py-2 text-gray-700">{cat.slug}</td>
                  <td className="border border-gray-200 px-4 py-2 text-center space-x-2">
                    <button
                      onClick={() => handleEdit(cat)}
                      className="bg-transparent p-1 rounded hover:bg-blue-100 transition"
                      title="Sửa"
                    >
                      <Icon icon="fluent:edit-20-filled" width="28" height="28" color="#2563eb" />
                    </button>
                    <button
                      onClick={() => confirmDelete(cat._id)}
                      className="bg-transparent p-1 rounded hover:bg-red-100 transition"
                      title="Xoá"
                    >
                      <Icon icon="fluent:delete-20-filled" width="28" height="28" color="#f44336" />
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
                  className={`px-3 py-1 border rounded ${currentPage === i + 1
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

      {toastMsg && (
        <div className={`fixed top-4 left-1/2 -translate-x-1/2 z-50 px-6 py-3 rounded-lg shadow-lg animate-fade-in text-center text-base font-medium ${toastType === "success" ? "bg-green-100 border border-green-400 text-green-700" : "bg-red-100 border border-red-400 text-red-700"}`}>
          {toastMsg}
        </div>
      )}
      {/* Modal xác nhận xóa */}
      {showDeleteModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center pointer-events-none">
          <div className="bg-white rounded-xl shadow-xl p-6 w-full max-w-xs text-center pointer-events-auto border border-gray-200">
            <div className="mb-4 text-lg font-semibold text-gray-800">Xác nhận xoá danh mục?</div>
            <div className="mb-6 text-gray-600">Bạn có chắc chắn muốn xoá danh mục này không?</div>
            <div className="flex justify-center gap-3">
              <button
                onClick={handleDelete}
                className="bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700 transition font-medium"
              >
                Xoá
              </button>
              <button
                onClick={() => { setShowDeleteModal(false); setDeleteId(null); }}
                className="bg-gray-200 text-gray-700 px-4 py-2 rounded hover:bg-gray-300 transition font-medium"
              >
                Huỷ
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};

export default Categories;
