import React, { useEffect, useState } from "react";
import axios from "axios";
import { jwtDecode } from "jwt-decode";
import { useNavigate } from "react-router-dom";
import { Icon } from '@iconify/react';
import { notifySuccess, notifyError } from '../../components/common/ToastManager';
import bookService from '../../services/bookService';
import categoryService from '../../services/categoryService';

const AddBook = () => {
  const [bookData, setBookData] = useState({
    title: "",
    authors: "",
    publisher: "",
    publicationYear: "",
    pageCount: "",
    coverType: "",
    description: "",
    isbn: "",
    originalPrice: "",
    sellingPrice: "",
    stockQuantity: "",
    categories: [],
    isFeatured: false,
    isNewArrival: false,
  });

  const [images, setImages] = useState([]);
  const [previewUrls, setPreviewUrls] = useState([]);
  const [uploading, setUploading] = useState(false);
  const [categoryOptions, setCategoryOptions] = useState([]);
  const navigate = useNavigate();
  const [showCategoryModal, setShowCategoryModal] = useState(false);
  const [categorySearch, setCategorySearch] = useState("");

  const apiUrl = process.env.REACT_APP_API_URL_BACKEND;

  useEffect(() => {
    const token = localStorage.getItem("accessToken");
    if (!token) {
      notifyError("Bạn cần đăng nhập.");
      return navigate("/login");
    }

    try {
      const decoded = jwtDecode(token);
      const role = decoded.role;

      if (role !== "admindev" && role !== "superadmin") {
        notifyError("Bạn không có quyền truy cập.");
        return navigate("/");
      }
    } catch (err) {
      console.error("Lỗi khi decode token:", err);
      return navigate("/login");
    }

    const fetchCategories = async () => {
      try {
        const res = await categoryService.getAllCategories();
        setCategoryOptions(res.data || []);
      } catch (error) {
        console.error("Lỗi khi lấy danh mục:", error);
        notifyError(error.message || "Lỗi khi lấy danh mục");
      }
    };

    fetchCategories();
  }, [apiUrl, navigate]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    // Kiểm tra realtime cho các trường số dương
    const positiveNumberFields = ["publicationYear", "pageCount", "originalPrice", "sellingPrice", "stockQuantity"];
    if (positiveNumberFields.includes(name)) {
      const num = Number(value);
      if (positiveNumberFields.includes(name)) {
        const num = Number(value);
        if (value !== "" && (isNaN(num) || num <= 0)) {
          notifyError("Giá trị phải là số dương.");
        }
      }
    }
    setBookData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const handleCategorySelect = (e) => {
    const selectedOptions = Array.from(e.target.selectedOptions);
    const selectedValues = selectedOptions.map((opt) => opt.value);
    setBookData((prev) => ({
      ...prev,
      categories: selectedValues,
    }));
  };

  const handleImageChange = (e) => {
    const files = Array.from(e.target.files);
    setImages(files);
    setPreviewUrls(files.map((file) => URL.createObjectURL(file)));
  };

  const uploadImagesToCloudinary = async () => {
    const uploadPromises = images.map((image) => {
      const formData = new FormData();
      formData.append("file", image);
      formData.append("upload_preset", "book_upload");
      return axios.post(
        "https://api.cloudinary.com/v1_1/dhwegqmxl/image/upload",
        formData
      );
    });

    const responses = await Promise.all(uploadPromises);
    return responses.map((res) => res.data.secure_url);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // ✅ VALIDATE TRƯỚC
    const requiredFields = [
      { field: "title", label: "Tiêu đề" },
      { field: "authors", label: "Tác giả" },
      { field: "publisher", label: "NXB" },
      { field: "publicationYear", label: "Năm xuất bản" },
      { field: "pageCount", label: "Số trang" },
      { field: "coverType", label: "Loại bìa" },
      { field: "description", label: "Mô tả" },
      { field: "isbn", label: "ISBN" },
      { field: "originalPrice", label: "Giá gốc" },
      { field: "sellingPrice", label: "Giá bán" },
      { field: "stockQuantity", label: "Số lượng" },
    ];

    for (const item of requiredFields) {
      if (!bookData[item.field] || String(bookData[item.field]).trim() === "") {
        notifyError(`Vui lòng nhập ${item.label}`);
        return;
      }
    }

    if (bookData.categories.length === 0) {
      notifyError("Vui lòng chọn ít nhất một danh mục.");
      return;
    }

    if (images.length === 0) {
      notifyError("Vui lòng chọn ít nhất một ảnh sách.");
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
    if (String(bookData.isbn).trim() === "") {
      notifyError("ISBN không được để trống.");
      return;
    }
    if (bookData.categories.length === 0) {
      notifyError("Vui lòng chọn danh mục.");
      return;
    }
    if (images.length === 0) {
      notifyError("Vui lòng chọn ít nhất một ảnh sách.");
      return;
    }

    try {
      setUploading(true);
      const imageUrls = await uploadImagesToCloudinary();

      const payload = {
        ...bookData,
        authors: bookData.authors.split(",").map((a) => a.trim()),
        publicationYear: Number(bookData.publicationYear),
        pageCount: Number(bookData.pageCount),
        originalPrice: Number(bookData.originalPrice),
        sellingPrice: Number(bookData.sellingPrice),
        stockQuantity: Number(bookData.stockQuantity),
        images: imageUrls,
      };

      const token = localStorage.getItem("accessToken");

      await bookService.createBook(payload);

      notifySuccess("Thêm sách thành công!");
      setBookData({
        title: "",
        authors: "",
        publisher: "",
        publicationYear: "",
        pageCount: "",
        coverType: "",
        description: "",
        isbn: "",
        originalPrice: "",
        sellingPrice: "",
        stockQuantity: "",
        categories: [],
        isFeatured: false,
        isNewArrival: false,
      });
      setImages([]);
      setPreviewUrls([]);
      setTimeout(() => {
        navigate("/admin/books");
      }, 1500);
    } catch (error) {
      console.error("Upload lỗi:", error);
      if (error.response?.data?.errors && Array.isArray(error.response.data.errors)) {
        error.response.data.errors.forEach(err => {
          notifyError(err);
        });
      } else if (error.response?.data?.message) {
        notifyError(error.response.data.message);
      } else {
        notifyError("Có lỗi xảy ra khi thêm sách.");
      }
    } finally {
      setUploading(false);
    }
  };

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

  const filteredCategories = categoryOptions.filter(cat =>
    cat.name.toLowerCase().includes(categorySearch.toLowerCase())
  );

  return (
    <div className="p-6 max-w-3xl mx-auto bg-white rounded-xl shadow-md">
      <h2 className="text-2xl font-semibold mb-6 text-center text-blue-700">
        Thêm sách mới
      </h2>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-gray-600 font-medium mb-1 flex items-center gap-1">
            <Icon icon="mdi:book-open-page-variant" width="20" className="text-blue-500" /> Tiêu đề:
          </label>
          <input
            name="title"
            placeholder="Tiêu đề"
            value={bookData.title}
            onChange={handleChange}
            required
            className="input-field"
          />
        </div>
        <div>
          <label className="block text-gray-600 font-medium mb-1 flex items-center gap-1">
            <Icon icon="mdi:account-multiple" width="20" className="text-blue-500" /> Tác giả:
          </label>
          <input
            name="authors"
            placeholder="Tác giả (cách nhau bằng dấu phẩy)"
            value={bookData.authors}
            onChange={handleChange}
            required
            className="input-field"
          />
        </div>
        <div>
          <label className="block text-gray-600 font-medium mb-1 flex items-center gap-1">
            <Icon icon="mdi:domain" width="20" className="text-blue-500" /> Nhà xuất bản:
          </label>
          <input
            name="publisher"
            placeholder="NXB"
            value={bookData.publisher}
            onChange={handleChange}
            required
            className="input-field"
          />
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-gray-600 font-medium mb-1 flex items-center gap-1">
              <Icon icon="mdi:calendar" width="20" className="text-blue-500" /> Năm xuất bản:
            </label>
            <input
              name="publicationYear"
              type="number"
              placeholder="Năm XB"
              value={bookData.publicationYear}
              onChange={handleChange}
              required
              className="input-field"
            />
          </div>
          <div>
            <label className="block text-gray-600 font-medium mb-1 flex items-center gap-1">
              <Icon icon="mdi:file-document-outline" width="20" className="text-blue-500" /> Số trang:
            </label>
            <input
              name="pageCount"
              type="number"
              placeholder="Số trang"
              value={bookData.pageCount}
              onChange={handleChange}
              className="input-field"
            />
          </div>
        </div>
        <div>
          <label className="block text-gray-600 font-medium mb-1 flex items-center gap-1">
            <Icon icon="mdi:book-variant" width="20" className="text-blue-500" /> Loại bìa:
          </label>
          <input
            name="coverType"
            placeholder="Loại bìa"
            value={bookData.coverType}
            onChange={handleChange}
            className="input-field"
          />
        </div>
        <div>
          <label className="block text-gray-600 font-medium mb-1 flex items-center gap-1">
            <Icon icon="mdi:text" width="20" className="text-blue-500" /> Mô tả:
          </label>
          <textarea
            name="description"
            placeholder="Mô tả"
            value={bookData.description}
            onChange={handleChange}
            className="input-field h-28"
          />
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-gray-600 font-medium mb-1 flex items-center gap-1">
              <Icon icon="mdi:barcode" width="20" className="text-blue-500" /> ISBN:
            </label>
            <input
              name="isbn"
              placeholder="ISBN"
              value={bookData.isbn}
              onChange={handleChange}
              className="input-field"
            />
          </div>
          <div>
            <label className="block text-gray-600 font-medium mb-1 flex items-center gap-1">
              <Icon icon="mdi:cash" width="20" className="text-blue-500" /> Giá gốc:
            </label>
            <input
              name="originalPrice"
              type="number"
              placeholder="Giá gốc"
              value={bookData.originalPrice}
              onChange={handleChange}
              className="input-field"
            />
          </div>
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-gray-600 font-medium mb-1 flex items-center gap-1">
              <Icon icon="mdi:cash-multiple" width="20" className="text-blue-500" /> Giá bán:
            </label>
            <input
              name="sellingPrice"
              type="number"
              placeholder="Giá bán"
              value={bookData.sellingPrice}
              onChange={handleChange}
              className="input-field"
            />
          </div>
          <div>
            <label className="block text-gray-600 font-medium mb-1 flex items-center gap-1">
              <Icon icon="mdi:warehouse" width="20" className="text-blue-500" /> Số lượng:
            </label>
            <input
              name="stockQuantity"
              type="number"
              placeholder="Số lượng"
              value={bookData.stockQuantity}
              onChange={handleChange}
              className="input-field"
            />
          </div>
        </div>
        <div>
          <label className="block text-gray-600 font-medium mb-1 flex items-center gap-1">
            <Icon icon="mdi:shape" width="20" className="text-blue-500" /> Danh mục:
          </label>
          {/* <select
            value={bookData.categories[0] || ""}
            onChange={e => setBookData(prev => ({ ...prev, categories: e.target.value ? [e.target.value] : [] }))}
            className="input-field"
          >
            <option value="">-- Chọn danh mục --</option>
            {categoryOptions.map((cat) => (
              <option key={cat._id} value={cat._id}>
                {cat.name}
              </option>
            ))}
          </select> */}
          <div className="flex flex-wrap gap-2 mb-2">Add commentMore actions
            {bookData.categories.length === 0 ? (
              <span className="text-gray-400 text-sm">Chưa chọn danh mục</span>
            ) : (
              bookData.categories.map((catId) => {
                const cat = categoryOptions.find((c) => c._id === catId);
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
          ><Icon icon="mdi:plus" width="18" /> Chọn danh mục
          </button>
          {/* Modal chọn danh mục */}Add commentMore actions
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
        <div className="flex gap-6">
          <label className="flex items-center gap-2">
            <input
              type="checkbox"
              name="isFeatured"
              checked={bookData.isFeatured}
              onChange={handleChange}
            />
            <Icon icon="mdi:star" width="18" className="text-yellow-400" /> Nổi bật
          </label>
          <label className="flex items-center gap-2">
            <input
              type="checkbox"
              name="isNewArrival"
              checked={bookData.isNewArrival}
              onChange={handleChange}
            />
            <Icon icon="mdi:new-box" width="18" className="text-green-500" /> Mới về
          </label>
        </div>
        <div>
          <label className="block text-gray-600 font-medium mb-1 flex items-center gap-1">
            <Icon icon="mdi:image-multiple" width="20" className="text-blue-500" /> Ảnh sách:
          </label>
          <input
            type="file"
            multiple
            accept="image/*"
            onChange={handleImageChange}
            className="input-field"
          />
        </div>
        {previewUrls.length > 0 && (
          <div className="flex flex-wrap gap-3">
            {previewUrls.map((url, idx) => (
              <img
                key={idx}
                src={url}
                alt="preview"
                className="w-24 h-24 object-cover rounded border"
              />
            ))}
          </div>
        )}
        <button
          type="submit"
          disabled={uploading}
          className="w-full bg-blue-600 hover:bg-blue-700 text-white py-2 px-4 rounded transition flex items-center justify-center gap-2"
        >
          <Icon icon="mdi:plus-box" width="22" />
          {uploading ? "Đang upload..." : "Thêm sách"}
        </button>
      </form>
    </div>
  );
};

export default AddBook;
