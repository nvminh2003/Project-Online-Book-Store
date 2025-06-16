// src/pages/products/EditBook.js
import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import Spinner from "../../components/common/Spinner";
// --- NẾU SAU NÀY DÙNG REDUX CHO ADD TO CART ---
// import { useDispatch } from "react-redux";
// import { addItemToCartAPI } from "../../store/slices/cartSlice"; // Đường dẫn tới slice của bạn
// --- KẾT THÚC IMPORT REDUX ---

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

  useEffect(() => {
    const fetchBook = async () => {
      setLoading(true);
      setError("");
      try {
        const res = await axios.get(`${API_URL}/books/${bookIdParam}`);
        const book = res.data.data;
        if (book) {
          setBookData({
            _id: book._id, // QUAN TRỌNG: Lưu lại _id
            title: book.title || "",
            authors: Array.isArray(book.authors)
              ? book.authors
              : book.authors
              ? String(book.authors)
                  .split(",")
                  .map((s) => s.trim())
              : [],
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
            categories: (book.categories || []).map((cat) => cat._id || cat), // Lấy ID của category
            images: book.images || [], // Mảng các URL ảnh hiện tại
          });
        } else {
          setError("Không tìm thấy sách.");
        }
      } catch (err) {
        console.error("Lỗi khi tải sách:", err);
        setError(
          "Không thể tải dữ liệu sách. " +
            (err.response?.data?.message || err.message)
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
    const authorsArray = e.target.value
      .split(",")
      .map((a) => a.trim())
      .filter((a) => a); // Lọc bỏ chuỗi rỗng
    setBookData((prev) => ({ ...prev, authors: authorsArray }));
  };

  const handleCategoryChange = (e) => {
    const selectedOptions = Array.from(
      e.target.selectedOptions,
      (opt) => opt.value
    );
    setBookData((prev) => ({ ...prev, categories: selectedOptions }));
  };

  const handleImageChange = (e) => {
    setNewImages(Array.from(e.target.files));
  };

  // --- HÀM GỬI FORM CẬP NHẬT SÁCH ---
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!bookData) return;

    const token = localStorage.getItem("accessToken");
    if (!token) {
      alert("Vui lòng đăng nhập để thực hiện hành động này.");
      navigate("/auth/login");
      return;
    }

    let finalImageUrls = [...bookData.images]; // Giữ lại ảnh cũ

    try {
      if (newImages.length > 0) {
        const uploadedNewImageUrls = await Promise.all(
          newImages.map(async (imageFile) => {
            const formData = new FormData();
            formData.append("file", imageFile);
            formData.append("upload_preset", "book_upload"); // THAY BẰNG UPLOAD PRESET CỦA BẠN
            const res = await axios.post(
              "https://api.cloudinary.com/v1_1/dhwegqmxl/image/upload", // THAY BẰNG CLOUDINARY URL CỦA BẠN
              formData
            );
            return res.data.secure_url;
          })
        );
        finalImageUrls = [...finalImageUrls, ...uploadedNewImageUrls]; // Kết hợp ảnh cũ và mới
      }

      // Loại bỏ các trường không cần thiết hoặc backend không mong muốn khi update
      const { _id, images, ...dataToUpdate } = bookData;

      const updatePayload = {
        ...dataToUpdate,
        images: finalImageUrls, // Sử dụng mảng ảnh đã cập nhật
        // Đảm bảo các trường số được gửi đi là số
        publicationYear: bookData.publicationYear
          ? Number(bookData.publicationYear)
          : undefined,
        pageCount: bookData.pageCount ? Number(bookData.pageCount) : undefined,
        originalPrice: bookData.originalPrice
          ? Number(bookData.originalPrice)
          : undefined,
        sellingPrice: bookData.sellingPrice
          ? Number(bookData.sellingPrice)
          : undefined,
        stockQuantity: bookData.stockQuantity
          ? Number(bookData.stockQuantity)
          : undefined,
      };

      await axios.put(
        `${API_URL}/books/${bookIdParam}`, // Sử dụng bookIdParam từ URL
        updatePayload,
        { headers: { Authorization: `Bearer ${token}` } }
      );

      alert("✅ Cập nhật sách thành công!");
      navigate("/admin/books");
    } catch (err) {
      console.error(
        "Lỗi khi cập nhật sách:",
        err.response?.data || err.message
      );
      alert(
        "❌ Đã xảy ra lỗi khi cập nhật sách: " +
          (err.response?.data?.message || err.message)
      );
    }
  };
  // --- KẾT THÚC HÀM GỬI FORM ---

  // --- VÍ DỤ HÀM THÊM VÀO GIỎ HÀNG TỪ TRANG EDIT (NẾU CẦN) ---
  const handleAddToCartFromEditPage = async () => {
    if (!bookData || !bookData._id) {
      alert("Không có thông tin sách để thêm vào giỏ.");
      return;
    }

    const token = localStorage.getItem("accessToken");
    if (!token) {
      alert("Bạn cần đăng nhập để thêm sản phẩm vào giỏ hàng.");
      navigate("/auth/login");
      return;
    }

    const payload = {
      bookId: bookData._id, // ID của sách đang được edit
      quantity: 1, // Mặc định thêm 1, hoặc bạn có thể thêm input số lượng
    };

    console.log("EditBook - Add to cart payload:", payload);
    console.log("EditBook - Token:", token);

    try {
      const response = await axios.post(
        `${API_URL}/cart/add`,
        payload, // Payload đã đúng
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      console.log("EditBook - Add to cart response:", response.data);
      if (response.data && response.data.status === "Success") {
        alert("Đã thêm vào giỏ hàng thành công!");
        // Khi dùng Redux:
        // dispatch(addItemToCartAPI(payload));
      } else {
        alert(response.data.message || "Có lỗi xảy ra khi thêm vào giỏ hàng.");
      }
    } catch (err) {
      console.error(
        "EditBook - Lỗi khi thêm vào giỏ hàng:",
        err.response?.data || err.message
      );
      const errorMessage =
        err.response?.data?.message ||
        err.message ||
        "Không thể thêm sản phẩm vào giỏ hàng.";
      alert(errorMessage);
      if (err.response?.status === 401) {
        // Xử lý token không hợp lệ
      }
    }
  };
  // --- KẾT THÚC VÍ DỤ HÀM THÊM VÀO GIỎ HÀNG ---

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
    <form
      onSubmit={handleSubmit}
      className="p-6 max-w-3xl mx-auto bg-white shadow-xl rounded-xl space-y-6 my-8"
    >
      <h2 className="text-3xl font-bold text-center text-blue-700 mb-6">
        📘 Chỉnh sửa thông tin sách
      </h2>

      {/* Tiêu đề */}
      <div>
        <label
          htmlFor="title"
          className="block text-sm font-medium text-gray-700 mb-1"
        >
          Tiêu đề sách:
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
        <label
          htmlFor="authors"
          className="block text-sm font-medium text-gray-700 mb-1"
        >
          Tác giả (phân cách bằng dấu phẩy "," ):
        </label>
        <input
          id="authors"
          type="text"
          value={(bookData.authors || []).join(", ")}
          onChange={handleAuthorsChange}
          className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
        />
      </div>

      {/* ... (Các input fields khác tương tự, đảm bảo value lấy từ bookData.fieldName) ... */}
      <div>
        <label
          htmlFor="publisher"
          className="block text-sm font-medium text-gray-700 mb-1"
        >
          Nhà xuất bản:
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
          <label
            htmlFor="publicationYear"
            className="block text-sm font-medium text-gray-700 mb-1"
          >
            Năm xuất bản:
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
          <label
            htmlFor="pageCount"
            className="block text-sm font-medium text-gray-700 mb-1"
          >
            Số trang:
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

      {/* ... (Thêm các trường còn lại tương tự) ... */}
      <div>
        <label
          htmlFor="coverType"
          className="block text-sm font-medium text-gray-700 mb-1"
        >
          Loại bìa:
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
        <label
          htmlFor="isbn"
          className="block text-sm font-medium text-gray-700 mb-1"
        >
          ISBN:
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
          <label
            htmlFor="originalPrice"
            className="block text-sm font-medium text-gray-700 mb-1"
          >
            Giá gốc:
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
          <label
            htmlFor="sellingPrice"
            className="block text-sm font-medium text-gray-700 mb-1"
          >
            Giá bán:
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
          <label
            htmlFor="stockQuantity"
            className="block text-sm font-medium text-gray-700 mb-1"
          >
            Số lượng kho:
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
        <label
          htmlFor="description"
          className="block text-sm font-medium text-gray-700 mb-1"
        >
          Mô tả:
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
        <label
          htmlFor="categories"
          className="block text-sm font-medium text-gray-700 mb-1"
        >
          Danh mục:
        </label>
        <select
          id="categories"
          multiple
          value={bookData.categories} // value là một mảng các ID
          onChange={handleCategoryChange}
          className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm h-32"
        >
          {categories.map((cat) => (
            <option key={cat._id} value={cat._id}>
              {cat.name}
            </option>
          ))}
        </select>
        <p className="text-xs text-gray-500 mt-1">
          Giữ Ctrl (hoặc Cmd trên Mac) để chọn nhiều danh mục.
        </p>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Ảnh hiện tại:
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
        <label
          htmlFor="newImages"
          className="block text-sm font-medium text-gray-700 mb-1"
        >
          Tải lên ảnh mới (sẽ được thêm vào danh sách ảnh hiện tại):
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
        <label className="flex items-center">
          <input
            type="checkbox"
            name="isFeatured"
            checked={!!bookData.isFeatured}
            onChange={handleChange}
            className="h-4 w-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
          />
          <span className="ml-2 text-sm text-gray-700">Nổi bật</span>
        </label>
        <label className="flex items-center">
          <input
            type="checkbox"
            name="isNewArrival"
            checked={!!bookData.isNewArrival}
            onChange={handleChange}
            className="h-4 w-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
          />
          <span className="ml-2 text-sm text-gray-700">Sách mới</span>
        </label>
      </div>

      <div className="flex justify-end gap-4 pt-4">
        {/* VÍ DỤ NÚT THÊM VÀO GIỎ HÀNG */}
        <button
          type="button"
          onClick={handleAddToCartFromEditPage}
          className="bg-green-500 hover:bg-green-600 text-white px-5 py-2 rounded-lg shadow-md transition-colors"
        >
          Thêm vào giỏ
        </button>
        <button
          type="button"
          onClick={() => navigate("/admin/books")}
          className="bg-gray-200 hover:bg-gray-300 text-gray-700 px-5 py-2 rounded-lg shadow-md transition-colors"
        >
          Hủy
        </button>
        <button
          type="submit"
          className="bg-blue-600 hover:bg-blue-700 text-white font-semibold px-5 py-2 rounded-lg shadow-md transition-colors"
        >
          💾 Lưu thay đổi
        </button>
      </div>
    </form>
  );
};

export default EditBook;
