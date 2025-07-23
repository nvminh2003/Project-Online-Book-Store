// src/pages/products/EditBook.js
import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import Spinner from "../../components/common/Spinner";
import { Icon } from '@iconify/react';
import { notifySuccess, notifyError } from '../../components/common/ToastManager';
import bookService from '../../services/bookService';
import categoryService from '../../services/categoryService';

const API_URL =
  process.env.REACT_APP_API_URL_BACKEND || "http://localhost:9999/api";

const EditBook = () => {
  const { id: bookIdParam } = useParams(); // Đổi tên để không trùng với bookId trong state nếu có
  const navigate = useNavigate();
  // const dispatch = useDispatch(); // Bỏ comment nếu dùng Redux

  const [bookData, setBookData] = useState(null); // Sẽ chứa toàn bộ object sách, bao gồm _id
  const [categories, setCategories] = useState([]);
  const [newImages, setNewImages] = useState([]); // File objects cho ảnh mới
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [showCategoryModal, setShowCategoryModal] = useState(false);
  const [categorySearch, setCategorySearch] = useState("");

  useEffect(() => {
    const fetchBook = async () => {
      setLoading(true);
      setError("");
      try {
        const book = await bookService.getProductById(bookIdParam);
        if (book && book.data) {
          setBookData({
            _id: book.data._id, // QUAN TRỌNG: Lưu lại _id
            title: book.data.title || "",
            authors: Array.isArray(book.data.authors)
              ? book.data.authors
              : book.data.authors
                ? String(book.data.authors)
                  .split(",")
                  .map((s) => s.trim())
                : [],
            publisher: book.data.publisher || "",
            publicationYear: book.data.publicationYear || "",
            pageCount: book.data.pageCount || "",
            coverType: book.data.coverType || "",
            description: book.data.description || "",
            isbn: book.data.isbn || "",
            originalPrice: book.data.originalPrice || "",
            sellingPrice: book.data.sellingPrice || "",
            stockQuantity: book.data.stockQuantity || "",
            isFeatured: book.data.isFeatured || false,
            isNewArrival: book.data.isNewArrival || false,
            categories: (book.data.categories || []).map((cat) => cat._id || cat), // Lấy ID của category
            images: book.data.images || [], // Mảng các URL ảnh hiện tại
          });
        } else {
          setError("Không tìm thấy sách.");
        }
      } catch (err) {
        console.error("Lỗi khi tải sách:", err);
        setError(
          "Không thể tải dữ liệu sách. " +
          (err.message || "Lỗi không xác định")
        );
      } finally {
        setLoading(false);
      }
    };
    fetchBook();
  }, [bookIdParam]);

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const categories = await categoryService.getAllCategories();
        setCategories(categories.data || []);
      } catch (err) {
        console.error("Lỗi khi tải danh mục:", err);
        setCategories([]);
      }
    };
    fetchCategories();
  }, []);
  //  HÀM MỚI: xử lý khi chọn ảnh mới
  const handleImageChange = (e) => {
    setNewImages(Array.from(e.target.files));
  };


  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    // Kiểm tra realtime cho các trường số dương
    const positiveNumberFields = ["publicationYear", "pageCount", "originalPrice", "sellingPrice", "stockQuantity"];
    if (positiveNumberFields.includes(name)) {
      const num = Number(value);
      if (value !== "" && (isNaN(num) || num <= 0)) {
        notifyError("Giá trị phải là số dương.");
      }
    }
    setBookData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const handleAuthorsChange = (e) => {
    const authorsArray = e.target.value
      .split(",")
      .map((a) => a.trim())
      .filter((a) => a); // Lọc bỏ chuỗi rỗng
    setBookData((prev) => ({ ...prev, authors: authorsArray }));
  };

  const filteredCategories = categories.filter(cat =>
    cat.name.toLowerCase().includes(categorySearch.toLowerCase())
  );
  const handleCategoryCheckbox = (catId) => {
    setBookData((prev) => {
      const exists = prev.categories.includes(catId);
      return {
        ...prev,
        categories: exists
          ? prev.categories.filter((id) => id !== catId)
          : [...prev.categories, catId],
      };
    });
  };

  const handleCategoryChange = (e) => {
    const selectedOptions = Array.from(
      e.target.selectedOptions,
      (opt) => opt.value
    );
    setBookData((prev) => ({ ...prev, categories: selectedOptions }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!bookData) return;

    const token = localStorage.getItem("accessToken");
    if (!token) {
      notifyError("Vui lòng đăng nhập để thực hiện hành động này.");
      navigate("/auth/login");
      return;
    }

    // Validate số dương
    if (Number(bookData.publicationYear) <= 0) {
      notifyError("Năm xuất bản phải là số dương.");
      return;
    }
    if (Number(bookData.pageCount) <= 0) {
      notifyError("Số trang phải là số dương.");
      return;
    }
    if (Number(bookData.originalPrice) <= 0) {
      notifyError("Giá gốc phải là số dương.");
      return;
    }
    if (Number(bookData.sellingPrice) <= 0) {
      notifyError("Giá bán phải là số dương.");
      return;
    }
    if (Number(bookData.stockQuantity) <= 0) {
      notifyError("Số lượng phải là số dương.");
      return;
    }

    let finalImageUrls = bookData.images;

    try {
      // Nếu có ảnh mới, upload và thay toàn bộ
      if (newImages.length > 0) {
        const uploadedNewImageUrls = await Promise.all(
          newImages.map(async (imageFile) => {
            const formData = new FormData();
            formData.append("file", imageFile);
            formData.append("upload_preset", "book_upload");
            const res = await axios.post(
              "https://api.cloudinary.com/v1_1/dhwegqmxl/image/upload",
              formData
            );
            return res.data.secure_url;
          })
        );
        finalImageUrls = uploadedNewImageUrls; //  Ghi đè toàn bộ ảnh cũ bằng ảnh mới
      }

      const { _id, ...dataToUpdate } = bookData;

      const updatePayload = {
        ...dataToUpdate,
        images: finalImageUrls,
        publicationYear: Number(bookData.publicationYear),
        pageCount: Number(bookData.pageCount),
        originalPrice: Number(bookData.originalPrice),
        sellingPrice: Number(bookData.sellingPrice),
        stockQuantity: Number(bookData.stockQuantity),
      };

      await bookService.updateBook(bookIdParam, updatePayload);

      notifySuccess(" Cập nhật sách thành công!");
      setTimeout(() => {
        navigate("/admin/books");
      }, 1500);
    } catch (err) {
      console.error("Lỗi khi cập nhật sách:", err.response?.data || err.message);
      // Hiển thị message lỗi chi tiết từ BE
      if (err.response?.data?.errors && Array.isArray(err.response.data.errors)) {
        err.response.data.errors.forEach(error => {
          notifyError(error);
        });
      } else if (err.response?.data?.message) {
        notifyError(err.response.data.message);
      } else {
        notifyError("❌ Đã xảy ra lỗi khi cập nhật sách: " + err.message);
      }
    }
  };

  if (loading)
    return (
      <div className="p-6 text-center">
        Đang tải dữ liệu sách... <Spinner />
      </div>
    );
  if (error) return <p className="p-6 text-red-500 text-center">{error}</p>;
  if (!bookData)
    return <div className="p-6 text-center">Không có dữ liệu sách.</div>; // Tránh lỗi nếu bookData null

  return (
    <>
      <form
        onSubmit={handleSubmit}
        className="p-6 max-w-3xl mx-auto bg-white shadow-xl rounded-xl space-y-6 my-8"
      >
        <h2 className="text-3xl font-bold text-center text-blue-700 mb-6 flex items-center justify-center gap-2">
          <Icon icon="mdi:book-edit" width="32" className="text-blue-700" />
          Chỉnh sửa thông tin sách
        </h2>
        {/* Tiêu đề */}
        <div>
          <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-1 flex items-center gap-1">
            <Icon icon="mdi:book-open-page-variant" width="20" className="text-blue-500" /> Tiêu đề sách:
          </label>
          <input
            id="title"
            type="text"
            name="title"
            value={bookData.title}
            onChange={handleChange}
            className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
            required
          />
        </div>
        {/* Tác giả */}
        <div>
          <label htmlFor="authors" className="block text-sm font-medium text-gray-700 mb-1 flex items-center gap-1">
            <Icon icon="mdi:account-multiple" width="20" className="text-blue-500" /> Tác giả (phân cách bằng dấu phẩy "," ):
          </label>
          <input
            id="authors"
            type="text"
            value={(bookData.authors || []).join(", ")}
            onChange={handleAuthorsChange}
            className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
          />
        </div>
        <div>
          <label htmlFor="publisher" className="block text-sm font-medium text-gray-700 mb-1 flex items-center gap-1">
            <Icon icon="mdi:domain" width="20" className="text-blue-500" /> Nhà xuất bản:
          </label>
          <input
            id="publisher"
            type="text"
            name="publisher"
            value={bookData.publisher}
            onChange={handleChange}
            className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
          />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label htmlFor="publicationYear" className="block text-sm font-medium text-gray-700 mb-1 flex items-center gap-1">
              <Icon icon="mdi:calendar" width="20" className="text-blue-500" /> Năm xuất bản:
            </label>
            <input
              id="publicationYear"
              type="number"
              name="publicationYear"
              value={bookData.publicationYear}
              onChange={handleChange}
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
            />
          </div>
          <div>
            <label htmlFor="pageCount" className="block text-sm font-medium text-gray-700 mb-1 flex items-center gap-1">
              <Icon icon="mdi:file-document-outline" width="20" className="text-blue-500" /> Số trang:
            </label>
            <input
              id="pageCount"
              type="number"
              name="pageCount"
              value={bookData.pageCount}
              onChange={handleChange}
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
            />
          </div>
        </div>
        <div>
          <label htmlFor="coverType" className="block text-sm font-medium text-gray-700 mb-1 flex items-center gap-1">
            <Icon icon="mdi:book-variant" width="20" className="text-blue-500" /> Loại bìa:
          </label>
          <input
            id="coverType"
            type="text"
            name="coverType"
            value={bookData.coverType}
            onChange={handleChange}
            className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
          />
        </div>
        <div>
          <label htmlFor="isbn" className="block text-sm font-medium text-gray-700 mb-1 flex items-center gap-1">
            <Icon icon="mdi:barcode" width="20" className="text-blue-500" /> ISBN:
          </label>
          <input
            id="isbn"
            type="text"
            name="isbn"
            value={bookData.isbn}
            onChange={handleChange}
            className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
          />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div>
            <label htmlFor="originalPrice" className="block text-sm font-medium text-gray-700 mb-1 flex items-center gap-1">
              <Icon icon="mdi:cash" width="20" className="text-blue-500" /> Giá gốc:
            </label>
            <input
              id="originalPrice"
              type="number"
              name="originalPrice"
              value={bookData.originalPrice}
              onChange={handleChange}
              step="any"
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
            />
          </div>
          <div>
            <label htmlFor="sellingPrice" className="block text-sm font-medium text-gray-700 mb-1 flex items-center gap-1">
              <Icon icon="mdi:cash-multiple" width="20" className="text-blue-500" /> Giá bán:
            </label>
            <input
              id="sellingPrice"
              type="number"
              name="sellingPrice"
              value={bookData.sellingPrice}
              onChange={handleChange}
              step="any"
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
            />
          </div>
          <div>
            <label htmlFor="stockQuantity" className="block text-sm font-medium text-gray-700 mb-1 flex items-center gap-1">
              <Icon icon="mdi:warehouse" width="20" className="text-blue-500" /> Số lượng kho:
            </label>
            <input
              id="stockQuantity"
              type="number"
              name="stockQuantity"
              value={bookData.stockQuantity}
              onChange={handleChange}
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
            />
          </div>
        </div>
        <div>
          <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-1 flex items-center gap-1">
            <Icon icon="mdi:text" width="20" className="text-blue-500" /> Mô tả:
          </label>
          <textarea
            id="description"
            name="description"
            rows="5"
            value={bookData.description}
            onChange={handleChange}
            className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm resize-y"
          />
        </div>
        <div>
          <label htmlFor="categories" className="block text-sm font-medium text-gray-700 mb-1 flex items-center gap-1">
            <Icon icon="mdi:shape" width="20" className="text-blue-500" /> Danh mục:
          </label>
          <div className="flex flex-wrap gap-2 mb-2">Add commentMore actions
            {(!bookData.categories || bookData.categories.length === 0) ? (
              <span className="text-gray-400 text-sm">Chưa chọn danh mục</span>
            ) : (
              bookData.categories.map((catId) => {
                const cat = categories.find((c) => c._id === catId);
                return (
                  <span key={catId} className="bg-blue-100 text-blue-700 px-2 py-1 rounded text-xs flex items-center gap-1">
                    <Icon icon="mdi:tag" width="14" /> {cat ? cat.name : catId}
                  </span>
                );
              })
            )}
          </div>
          <button
            type="button"
            onClick={() => setShowCategoryModal(true)}
            className="bg-blue-50 border border-blue-300 text-blue-700 px-3 py-1 rounded hover:bg-blue-100 transition flex items-center gap-1"
          >
            <Icon icon="mdi:plus" width="18" /> Chọn danh mục
          </button>
          {showCategoryModal && (
            <div className="fixed inset-0 z-50 flex items-end md:items-center justify-center bg-white/40 backdrop-blur-sm">
              <div className="w-full md:w-96 bg-white rounded-t-2xl md:rounded-xl shadow-lg p-6 animate-fade-in-up border border-gray-200">
                <div className="flex justify-between items-center mb-4">
                  <span className="font-semibold text-blue-700 flex items-center gap-1">
                    <Icon icon="mdi:shape" width="20" /> Chọn danh mục
                  </span>
                  <button onClick={() => setShowCategoryModal(false)} className="text-gray-500 hover:text-blue-600">
                    <Icon icon="mdi:close" width="22" />
                  </button>
                </div>
                <input
                  type="text"
                  placeholder="Tìm kiếm danh mục..."
                  value={categorySearch}
                  onChange={e => setCategorySearch(e.target.value)}
                  className="w-full mb-3 px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-200 text-sm"
                />
                <div className="max-h-60 overflow-y-auto space-y-2">
                  {filteredCategories.length === 0 ? (
                    <div className="text-gray-400 text-sm">Không tìm thấy danh mục phù hợp</div>
                  ) : (
                    filteredCategories.map((cat) => (
                      <label key={cat._id} className="flex items-center gap-2 cursor-pointer py-1">
                        <input
                          type="checkbox"
                          checked={bookData.categories.includes(cat._id)}
                          onChange={() => handleCategoryCheckbox(cat._id)}
                          className="accent-blue-600"
                        />
                        <span>{cat.name}</span>
                      </label>
                    ))
                  )}
                </div>
                <button
                  type="button"
                  onClick={() => setShowCategoryModal(false)}
                  className="mt-5 w-full bg-blue-600 hover:bg-blue-700 text-white py-2 rounded transition flex items-center justify-center gap-2"
                >
                  <Icon icon="mdi:check" width="20" /> Xong
                </button>
              </div>
            </div>
          )}
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1 flex items-center gap-1">
            <Icon icon="mdi:image-multiple" width="20" className="text-blue-500" /> Ảnh hiện tại:
          </label>
          {bookData.images && bookData.images.length > 0 ? (
            <div className="flex flex-wrap gap-3 mt-1">
              {bookData.images.map((img, idx) => (
                <img
                  key={idx}
                  src={img}
                  alt={`Ảnh ${idx + 1}`}
                  className="w-24 h-32 object-cover rounded-md border shadow-sm"
                />
              ))}
            </div>
          ) : (
            <p className="text-sm text-gray-500">Chưa có ảnh nào.</p>
          )}
        </div>
        <div>
          <label htmlFor="newImages" className="block text-sm font-medium text-gray-700 mb-1 flex items-center gap-1">
            <Icon icon="mdi:upload" width="20" className="text-blue-500" /> Nếu bạn chọn ảnh mới, ảnh cũ sẽ bị xóa và thay bằng ảnh mới.
          </label>
          <input
            id="newImages"
            type="file"
            multiple
            onChange={handleImageChange}
            className="mt-1 block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
          />
          {newImages.length > 0 && (
            <div className="mt-2 text-xs text-gray-600">
              <p>Đã chọn {newImages.length} ảnh mới:</p>
              <ul className="list-disc list-inside">
                {newImages.map((file, idx) => (
                  <li key={idx}>{file.name}</li>
                ))}
              </ul>
            </div>
          )}
        </div>
        <div className="flex items-center space-x-6 pt-2">
          <label className="flex items-center gap-2">
            <input
              type="checkbox"
              name="isFeatured"
              checked={!!bookData.isFeatured}
              onChange={handleChange}
              className="h-4 w-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
            />
            <Icon icon="mdi:star" width="18" className="text-yellow-400" /> Nổi bật
          </label>
          <label className="flex items-center gap-2">
            <input
              type="checkbox"
              name="isNewArrival"
              checked={!!bookData.isNewArrival}
              onChange={handleChange}
              className="h-4 w-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
            />
            <Icon icon="mdi:new-box" width="18" className="text-green-500" /> Sách mới
          </label>
        </div>
        <div className="flex justify-end gap-4 pt-4">
          {/* Nút thêm vào giỏ đã bị loại bỏ */}
          <button
            type="button"
            onClick={() => navigate("/admin/books")}
            className="bg-gray-200 hover:bg-gray-300 text-gray-700 px-5 py-2 rounded-lg shadow-md transition-colors flex items-center gap-2"
          >
            <Icon icon="mdi:arrow-left" width="22" /> Hủy
          </button>
          <button
            type="submit"
            className="bg-blue-600 hover:bg-blue-700 text-white font-semibold px-5 py-2 rounded-lg shadow-md transition-colors flex items-center gap-2"
          >
            <Icon icon="mdi:content-save" width="22" /> Lưu thay đổi
          </button>
        </div>
      </form>
    </>
  );
};

export default EditBook;
