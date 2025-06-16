import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";

const API_URL = process.env.REACT_APP_API_URL_BACKEND;

const EditBook = () => {
  const { id: bookId } = useParams();
  const navigate = useNavigate();
  const [bookData, setBookData] = useState(null);
  const [categories, setCategories] = useState([]);
  const [newImages, setNewImages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchBook = async () => {
      try {
        const res = await axios.get(`${API_URL}/books/${bookId}`);
        const book = res.data.data;
        setBookData({
          title: book.title || "",
          authors: book.authors || [],
          publisher: book.publisher || "",
          publicationYear: book.publicationYear || "",
          pageCount: book.pageCount || "",
          coverType: book.coverType || "",
          description: book.description || "",
          isbn: book.isbn || "",
          originalPrice: book.originalPrice || "",
          sellingPrice: book.sellingPrice || "",
          stockQuantity: book.stockQuantity || "",
          isFeatured: book.isFeatured || false,
          isNewArrival: book.isNewArrival || false,
          categories: (book.categories || []).map((cat) => cat._id || cat),
          images: book.images || [],
        });
        setLoading(false);
      } catch (err) {
        console.error("Lỗi khi tải sách:", err);
        setError("Không thể tải dữ liệu sách.");
        setLoading(false);
      }
    };

    fetchBook();
  }, [bookId]);

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const res = await axios.get(`${API_URL}/categories`);
        setCategories(res.data?.data || []);
      } catch (err) {
        console.error("Lỗi khi tải danh mục:", err);
        setCategories([]);
      }
    };

    fetchCategories();
  }, []);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setBookData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const handleAuthorsChange = (e) => {
    const authorsArray = e.target.value.split(",").map((a) => a.trim());
    setBookData((prev) => ({ ...prev, authors: authorsArray }));
  };

  const handleCategoryChange = (e) => {
    const selected = Array.from(e.target.selectedOptions, (opt) => opt.value);
    setBookData((prev) => ({ ...prev, categories: selected }));
  };

  const handleImageChange = (e) => {
    setNewImages(Array.from(e.target.files));
  };

  const handleSubmit = async (e) => {
  e.preventDefault();

  try {
    const token = localStorage.getItem("accessToken"); // đảm bảo bạn lưu token sau khi login

    let uploadedImageUrls = [];

    if (newImages.length > 0) {
      const uploads = await Promise.all(
        newImages.map(async (image) => {
          const formData = new FormData();
          formData.append("file", image);
          formData.append("upload_preset", "book_upload");
          const res = await axios.post(
            "https://api.cloudinary.com/v1_1/dhwegqmxl/image/upload",
            formData
          );
          return res.data.secure_url;
        })
      );

      uploadedImageUrls = [...uploadedImageUrls, ...uploads];
    }

    const updatePayload = {
  ...bookData,
  images: uploadedImageUrls.length > 0 ? uploadedImageUrls : bookData.images, // ✅ merge
  publicationYear: Number(bookData.publicationYear),
  pageCount: Number(bookData.pageCount),
  originalPrice: Number(bookData.originalPrice),
  sellingPrice: Number(bookData.sellingPrice),
  stockQuantity: Number(bookData.stockQuantity),
};


    await axios.put(
      `${API_URL}/books/${bookId}`,
      updatePayload,
      {
        headers: {
          Authorization: `Bearer ${token}`
        }
      }
    );

    alert("✅ Cập nhật sách thành công!");
    navigate("/admin/books");
  } catch (err) {
    console.error("Lỗi khi cập nhật sách:", err);
    alert("❌ Đã xảy ra lỗi khi cập nhật sách.");
  }
};


  if (loading) return <p>Đang tải dữ liệu sách...</p>;
  if (error) return <p className="text-red-500">{error}</p>;
  if (!bookData) return null;

  return (
     <form onSubmit={handleSubmit} className="p-6 max-w-3xl mx-auto bg-white shadow-md rounded-xl space-y-6">
    <h2 className="text-2xl font-bold text-blue-700">📘 Chỉnh sửa sách</h2>

    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      <div>
        <label className="block font-semibold mb-1">Tiêu đề:</label>
        <input type="text" name="title" value={bookData.title} onChange={handleChange}
               className="w-full p-2 border rounded" required />
      </div>

      <div>
        <label className="block font-semibold mb-1">Tác giả (phân cách bằng dấu phẩy):</label>
        <input type="text" value={bookData.authors.join(", ")} onChange={handleAuthorsChange}
               className="w-full p-2 border rounded" />
      </div>

      <div>
        <label className="block font-semibold mb-1">Nhà xuất bản:</label>
        <input type="text" name="publisher" value={bookData.publisher} onChange={handleChange}
               className="w-full p-2 border rounded" />
      </div>

      <div>
        <label className="block font-semibold mb-1">Năm xuất bản:</label>
        <input type="number" name="publicationYear" value={bookData.publicationYear} onChange={handleChange}
               className="w-full p-2 border rounded" />
      </div>

      <div>
        <label className="block font-semibold mb-1">Số trang:</label>
        <input type="number" name="pageCount" value={bookData.pageCount} onChange={handleChange}
               className="w-full p-2 border rounded" />
      </div>

      <div>
        <label className="block font-semibold mb-1">Loại bìa:</label>
        <input type="text" name="coverType" value={bookData.coverType} onChange={handleChange}
               className="w-full p-2 border rounded" />
      </div>

      <div>
        <label className="block font-semibold mb-1">ISBN:</label>
        <input type="text" name="isbn" value={bookData.isbn} onChange={handleChange}
               className="w-full p-2 border rounded" />
      </div>

      <div>
        <label className="block font-semibold mb-1">Giá gốc:</label>
        <input type="number" name="originalPrice" value={bookData.originalPrice} onChange={handleChange}
               className="w-full p-2 border rounded" />
      </div>

      <div>
        <label className="block font-semibold mb-1">Giá bán:</label>
        <input type="number" name="sellingPrice" value={bookData.sellingPrice} onChange={handleChange}
               className="w-full p-2 border rounded" />
      </div>

      <div>
        <label className="block font-semibold mb-1">Số lượng trong kho:</label>
        <input type="number" name="stockQuantity" value={bookData.stockQuantity} onChange={handleChange}
               className="w-full p-2 border rounded" />
      </div>
    </div>

    <div>
      <label className="block font-semibold mb-1">Mô tả:</label>
      <textarea name="description" rows="4" value={bookData.description} onChange={handleChange}
                className="w-full p-2 border rounded resize-none" />
    </div>

    <div>
      <label className="block font-semibold mb-1">Danh mục:</label>
      <select
        multiple
        value={bookData.categories}
        onChange={handleCategoryChange}
        className="w-full p-2 border rounded h-40 overflow-y-auto"
      >
        {categories.length === 0 ? (
          <option disabled>Không có danh mục</option>
        ) : (
          categories.map((cat) => (
            <option key={cat._id} value={cat._id}>
              {cat.name}
            </option>
          ))
        )}
      </select>
      <p className="text-sm text-gray-500 mt-1">Giữ Ctrl (Windows) hoặc Command (Mac) để chọn nhiều mục</p>
    </div>

    <div>
      <label className="block font-semibold mb-1">Ảnh hiện tại:</label>
      <div className="flex gap-3 flex-wrap">
        {bookData.images.map((img, idx) => (
          <img key={idx} src={img} alt={`img-${idx}`} className="w-20 h-28 object-cover rounded shadow" />
        ))}
      </div>
    </div>

    <div>
      <label className="block font-semibold mb-1">Thêm ảnh mới:</label>
      <input type="file" multiple onChange={handleImageChange} className="w-full" />
      {newImages.length > 0 && (
        <div className="flex gap-2 mt-2 flex-wrap text-sm text-gray-600">
          {newImages.map((file, idx) => (
            <p key={idx}>{file.name}</p>
          ))}
        </div>
      )}
    </div>

    <div className="flex gap-6">
      <label className="inline-flex items-center">
        <input type="checkbox" name="isFeatured" checked={bookData.isFeatured} onChange={handleChange}
               className="mr-2" />
        Nổi bật
      </label>
      <label className="inline-flex items-center">
        <input type="checkbox" name="isNewArrival" checked={bookData.isNewArrival} onChange={handleChange}
               className="mr-2" />
        Sách mới
      </label>
    </div>

    <div className="text-center">
      <button type="submit" className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-xl shadow">
        💾 Cập nhật sách
      </button>
    </div>
  </form>
  );
};

export default EditBook;
