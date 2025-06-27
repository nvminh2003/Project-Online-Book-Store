import React, { useEffect, useState } from "react";
import axios from "axios";
import { jwtDecode } from "jwt-decode";
import { useNavigate } from "react-router-dom";
import { Icon } from '@iconify/react';

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
  const [successMsg, setSuccessMsg] = useState("");
  const navigate = useNavigate();

  const apiUrl = process.env.REACT_APP_API_URL_BACKEND;

  useEffect(() => {
    const token = localStorage.getItem("accessToken");
    if (!token) {
      alert("Bạn cần đăng nhập.");
      return navigate("/login");
    }

    try {
      const decoded = jwtDecode(token);
      const role = decoded.role;

      if (role !== "admindev" && role !== "superadmin") {

        alert("Bạn không có quyền truy cập.");
        return navigate("/");
      }
    } catch (err) {
      console.error("Lỗi khi decode token:", err);
      return navigate("/login");
    }

    const fetchCategories = async () => {
      try {
        const res = await axios.get(`${apiUrl}/categories`);
        setCategoryOptions(res.data.data);
      } catch (error) {
        console.error("Lỗi khi lấy danh mục:", error);
      }
    };

    fetchCategories();
  }, [apiUrl, navigate]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
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
        alert(`Vui lòng nhập ${item.label}`);
        return;
      }
    }

    if (bookData.categories.length === 0) {
      alert("Vui lòng chọn ít nhất một danh mục.");
      return;
    }

    if (images.length === 0) {
      alert("Vui lòng chọn ít nhất một ảnh sách.");
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

      await axios.post(`${apiUrl}/books`, payload, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      setSuccessMsg("✅ Thêm sách thành công!");
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
      alert("Có lỗi xảy ra khi thêm sách.");
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="p-6 max-w-3xl mx-auto bg-white rounded-xl shadow-md">
      {successMsg && (
        <div className="fixed top-4 left-1/2 -translate-x-1/2 z-50 bg-green-100 border border-green-400 text-green-700 px-6 py-3 rounded-lg shadow-lg animate-fade-in">
          {successMsg}
        </div>
      )}
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
          <select
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
          </select>
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
