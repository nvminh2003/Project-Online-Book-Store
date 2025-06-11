import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { jwtDecode } from 'jwt-decode';
import { useNavigate } from 'react-router-dom';

const AddBook = () => {
  const [bookData, setBookData] = useState({
    title: '',
    authors: '',
    publisher: '',
    publicationYear: '',
    pageCount: '',
    coverType: '',
    description: '',
    isbn: '',
    originalPrice: '',
    sellingPrice: '',
    stockQuantity: '',
    categories: [],
    isFeatured: false,
    isNewArrival: false,
  });

  const [images, setImages] = useState([]);
  const [previewUrls, setPreviewUrls] = useState([]);
  const [uploading, setUploading] = useState(false);
  const [categoryOptions, setCategoryOptions] = useState([]);
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
      if (role !== "admin" && role !== "superadmin") {
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
      [name]: type === 'checkbox' ? checked : value,
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
    setPreviewUrls(files.map(file => URL.createObjectURL(file)));
  };

  const uploadImagesToCloudinary = async () => {
    const uploadPromises = images.map((image) => {
      const formData = new FormData();
      formData.append('file', image);
      formData.append('upload_preset', 'book_upload');
      return axios.post('https://api.cloudinary.com/v1_1/dhwegqmxl/image/upload', formData);
    });

    const responses = await Promise.all(uploadPromises);
    return responses.map((res) => res.data.secure_url);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      setUploading(true);
      const imageUrls = await uploadImagesToCloudinary();

      const payload = {
        ...bookData,
        authors: bookData.authors.split(',').map((a) => a.trim()),
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

      alert('Thêm sách thành công!');
      setBookData({
        title: '',
        authors: '',
        publisher: '',
        publicationYear: '',
        pageCount: '',
        coverType: '',
        description: '',
        isbn: '',
        originalPrice: '',
        sellingPrice: '',
        stockQuantity: '',
        categories: [],
        isFeatured: false,
        isNewArrival: false,
      });
      setImages([]);
      setPreviewUrls([]);
    } catch (error) {
      console.error("Upload lỗi:", error);
      alert('Có lỗi xảy ra khi thêm sách.');
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="p-6 max-w-3xl mx-auto bg-white rounded-xl shadow-md">
      <h2 className="text-2xl font-semibold mb-6 text-center text-blue-700">Thêm sách mới</h2>
      <form onSubmit={handleSubmit} className="space-y-4">
        <input name="title" placeholder="Tiêu đề" value={bookData.title} onChange={handleChange} required className="input-field" />
        <input name="authors" placeholder="Tác giả (cách nhau bằng dấu phẩy)" value={bookData.authors} onChange={handleChange} required className="input-field" />
        <input name="publisher" placeholder="NXB" value={bookData.publisher} onChange={handleChange} required className="input-field" />
        <input name="publicationYear" type="number" placeholder="Năm XB" value={bookData.publicationYear} onChange={handleChange} required className="input-field" />
        <input name="pageCount" type="number" placeholder="Số trang" value={bookData.pageCount} onChange={handleChange} className="input-field" />
        <input name="coverType" placeholder="Loại bìa" value={bookData.coverType} onChange={handleChange} className="input-field" />
        <textarea name="description" placeholder="Mô tả" value={bookData.description} onChange={handleChange} className="input-field h-28" />
        <input name="isbn" placeholder="ISBN" value={bookData.isbn} onChange={handleChange} className="input-field" />
        <input name="originalPrice" type="number" placeholder="Giá gốc" value={bookData.originalPrice} onChange={handleChange} className="input-field" />
        <input name="sellingPrice" type="number" placeholder="Giá bán" value={bookData.sellingPrice} onChange={handleChange} className="input-field" />
        <input name="stockQuantity" type="number" placeholder="Số lượng" value={bookData.stockQuantity} onChange={handleChange} className="input-field" />

        <div>
          <label className="font-medium">Danh mục:</label>
          <select multiple value={bookData.categories} onChange={handleCategorySelect} className="input-field h-32">
            {categoryOptions.map((cat) => (
              <option key={cat._id} value={cat._id}>{cat.name}</option>
            ))}
          </select>
        </div>

        <div className="flex gap-6">
          <label className="flex items-center gap-2">
            <input type="checkbox" name="isFeatured" checked={bookData.isFeatured} onChange={handleChange} />
            Nổi bật
          </label>
          <label className="flex items-center gap-2">
            <input type="checkbox" name="isNewArrival" checked={bookData.isNewArrival} onChange={handleChange} />
            Mới về
          </label>
        </div>

        <input type="file" multiple accept="image/*" onChange={handleImageChange} className="input-field" />

        {previewUrls.length > 0 && (
          <div className="flex flex-wrap gap-3">
            {previewUrls.map((url, idx) => (
              <img key={idx} src={url} alt="preview" className="w-24 h-24 object-cover rounded border" />
            ))}
          </div>
        )}

        <button type="submit" disabled={uploading} className="w-full bg-blue-600 hover:bg-blue-700 text-white py-2 px-4 rounded transition">
          {uploading ? 'Đang upload...' : 'Thêm sách'}
        </button>
      </form>
    </div>
  );
};

export default AddBook;
