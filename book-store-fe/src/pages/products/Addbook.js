import React, { useEffect, useState } from 'react';
import axios from 'axios';
import {jwtDecode} from 'jwt-decode';
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
    // Kiểm tra quyền truy cập
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

    // Lấy danh mục
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
    <div className="p-4 max-w-2xl mx-auto">
      <h2 className="text-xl font-bold mb-4">Thêm sách mới</h2>
      <form onSubmit={handleSubmit} className="space-y-3">
        <input name="title" placeholder="Tiêu đề" value={bookData.title} onChange={handleChange} required className="border p-2 w-full" />
        <input name="authors" placeholder="Tác giả (cách nhau bằng dấu phẩy)" value={bookData.authors} onChange={handleChange} required className="border p-2 w-full" />
        <input name="publisher" placeholder="NXB" value={bookData.publisher} onChange={handleChange} required className="border p-2 w-full" />
        <input name="publicationYear" type="number" placeholder="Năm XB" value={bookData.publicationYear} onChange={handleChange} required className="border p-2 w-full" />
        <input name="pageCount" type="number" placeholder="Số trang" value={bookData.pageCount} onChange={handleChange} className="border p-2 w-full" />
        <input name="coverType" placeholder="Loại bìa" value={bookData.coverType} onChange={handleChange} className="border p-2 w-full" />
        <textarea name="description" placeholder="Mô tả" value={bookData.description} onChange={handleChange} className="border p-2 w-full" />
        <input name="isbn" placeholder="ISBN" value={bookData.isbn} onChange={handleChange} className="border p-2 w-full" />
        <input name="originalPrice" type="number" placeholder="Giá gốc" value={bookData.originalPrice} onChange={handleChange} className="border p-2 w-full" />
        <input name="sellingPrice" type="number" placeholder="Giá bán" value={bookData.sellingPrice} onChange={handleChange} className="border p-2 w-full" />
        <input name="stockQuantity" type="number" placeholder="Số lượng" value={bookData.stockQuantity} onChange={handleChange} className="border p-2 w-full" />

        <label className="block">
          Danh mục:
          <select multiple value={bookData.categories} onChange={handleCategorySelect} className="border p-2 w-full mt-1">
            {categoryOptions.map((cat) => (
              <option key={cat._id} value={cat._id}>{cat.name}</option>
            ))}
          </select>
        </label>

        <div className="flex gap-4">
          <label>
            <input type="checkbox" name="isFeatured" checked={bookData.isFeatured} onChange={handleChange} />
            <span className="ml-1">Nổi bật</span>
          </label>
          <label>
            <input type="checkbox" name="isNewArrival" checked={bookData.isNewArrival} onChange={handleChange} />
            <span className="ml-1">Mới về</span>
          </label>
        </div>

        <input type="file" multiple accept="image/*" onChange={handleImageChange} className="border p-2 w-full" />

        {previewUrls.length > 0 && (
          <div className="flex flex-wrap gap-2">
            {previewUrls.map((url, idx) => (
              <img key={idx} src={url} alt="preview" className="w-24 h-24 object-cover border" />
            ))}
          </div>
        )}

        <button type="submit" disabled={uploading} className="bg-blue-600 text-white p-2 rounded">
          {uploading ? 'Đang upload...' : 'Thêm sách'}
        </button>
      </form>
    </div>
  );
};

export default AddBook;
