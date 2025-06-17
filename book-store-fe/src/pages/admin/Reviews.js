import React, { useEffect, useState } from "react";
import axios from "axios";

const API_URL = process.env.REACT_APP_API_URL_BACKEND;

const Reviews = () => {
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(false);

  const fetchReviews = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem("accessToken");

      const res = await axios.get(`${API_URL}/reviews/all`, {
        headers: {Authorization: `Bearer ${token}`},
      });

      setReviews(res.data);
    } catch (err) {
      console.error("Lỗi khi tải đánh giá:", err);
      alert("Không thể tải danh sách đánh giá.");
    } finally {
      setLoading(false);
    }
  };

  const toggleVisibility = async (reviewId, currentStatus) => {
    try {
      const token = localStorage.getItem("accessToken");
      const newVisibility = currentStatus === "visible" ? "hidden" : "visible";

      await axios.put(
        `${API_URL}/reviews/${reviewId}/visibility`,
        {visibility: newVisibility},
        {
          headers: {Authorization: `Bearer ${token}`},
        }
      );

      fetchReviews(); // refresh list
    } catch (err) {
      if (err.response?.status === 403) {
        alert("Bạn không có quyền thực hiện hành động này.");
      } else {
        console.error("Lỗi khi cập nhật trạng thái hiển thị:", err);
        alert("Không thể thay đổi trạng thái hiển thị.");
      }
    }
  };

  useEffect(() => {
    fetchReviews();
  }, []);

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <h1 className="text-2xl font-bold mb-4">Quản lý đánh giá</h1>

      {loading ? (
        <p className="text-gray-500">Đang tải...</p>
      ) : (
        <div className="overflow-auto rounded-md border border-gray-200">
          <table className="min-w-full divide-y divide-gray-200 text-sm">
            <thead className="bg-gray-100 text-left">
            <tr>
              <th className="px-4 py-2">STT</th>
              <th className="px-4 py-2">Người dùng</th>
              <th className="px-4 py-2">Sách</th>
              <th className="px-4 py-2">Số sao</th>
              <th className="px-4 py-2">Bình luận</th>
              <th className="px-4 py-2">Trạng thái</th>
              <th className="px-4 py-2">Hành động</th>
            </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
            {reviews.map((r, index) => (
              <tr key={r._id} className="hover:bg-gray-50">
                <td className="px-4 py-2">{index + 1}</td>
                <td className="px-4 py-2">
                  {r.user?.info?.fullName || r.user?.name || "Ẩn danh"}
                </td>
                <td className="px-4 py-2">{r.book?.title || "Không rõ"}</td>
                <td className="px-4 py-2 text-yellow-500">{"⭐".repeat(r.rating)}</td>
                <td className="px-4 py-2 max-w-md whitespace-pre-wrap break-words">
                  {r.comment}
                </td>
                <td className="px-4 py-2 capitalize">{r.visibility}</td>
                <td className="px-4 py-2">
                  <button
                    onClick={() => toggleVisibility(r._id, r.visibility)}
                    className={`px-3 py-1 rounded text-white text-xs ${
                      r.visibility === "visible"
                        ? "bg-yellow-600 hover:bg-yellow-700"
                        : "bg-green-600 hover:bg-green-700"
                    }`}
                  >
                    {r.visibility === "visible" ? "Ẩn" : "Hiện"}
                  </button>
                </td>
              </tr>
            ))}
            {reviews.length === 0 && (
              <tr>
                <td colSpan={7} className="text-center p-4 text-gray-500">
                  Không có đánh giá nào.
                </td>
              </tr>
            )}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};



export default Reviews