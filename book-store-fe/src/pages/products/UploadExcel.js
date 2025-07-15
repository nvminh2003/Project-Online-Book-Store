import React, { useState } from "react";
import axios from "axios";
import * as XLSX from "xlsx";
import { Icon } from '@iconify/react';

const UploadExcel = () => {
  const [file, setFile] = useState(null);
  const [successMsg, setSuccessMsg] = useState("");
  const [errorPopup, setErrorPopup] = useState(null);

  const handleReadExcel = async () => {
    if (!file) {
      alert("Vui lòng chọn file Excel");
      return;
    }

    const token = localStorage.getItem("accessToken");

    if (!token) {
      alert("Chưa đăng nhập hoặc token hết hạn. Vui lòng đăng nhập lại.");
      window.location.href = "/auth/login";
      return;
    }

    // ✅ Thêm đoạn này để kiểm tra vai trò người dùng
    try {
      const decoded = JSON.parse(atob(token.split('.')[1]));
      const userRole = decoded?.role;

      if (userRole !== "admindev" && userRole !== "superadmin") {
        alert("Bạn phải là admin.");
        return;
      }
    } catch (err) {
      console.error("Lỗi khi decode token:", err);
      alert("Token không hợp lệ. Vui lòng đăng nhập lại.");
      window.location.href = "/auth/login";
      return;
    }
    const reader = new FileReader();
    reader.onload = async (e) => {
      const data = new Uint8Array(e.target.result);
      const workbook = XLSX.read(data, { type: "array" });
      const sheet = workbook.Sheets[workbook.SheetNames[0]];
      const jsonData = XLSX.utils.sheet_to_json(sheet, { defval: "" });

      console.log("✅ Dữ liệu Excel:", jsonData);
      jsonData.forEach((book, i) => {
        console.log(`📷 Book ${i + 1} - images:`, book.images);
      });

      try {
        const res = await axios.post(
          "http://localhost:9999/api/books/upload-excel",
          { books: jsonData },
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );
        const { message, status, data, errors } = res.data;
        if (status === "Success") {
          setSuccessMsg(message);
          setTimeout(() => {
            window.location.href = "/admin/books";
          }, 1500);
        } else if (status === "PartialSuccess") {
          setSuccessMsg(message);
          setTimeout(() => {
            setSuccessMsg("");
          }, 3000);
          // Không chuyển trang ở đây, sẽ chuyển khi bấm OK ở popup
        } else {
          setSuccessMsg("Có lỗi xảy ra khi thêm sách.");
        }
        // Hiển thị chi tiết lỗi nếu có
        if (errors && errors.length > 0) {
          setTimeout(() => {
            setErrorPopup({
              count: errors.length,
              details: errors.map(e => `- [${e.row}] ${e.title}: ${e.error}`).join("\n")
            });
          }, 500);
        }
        console.log("✅ Server response:", res.data);
      } catch (err) {
        console.error("❌ Lỗi khi gửi Excel:", err.response?.data || err.message);
        if (err.response?.status === 401) {
          alert("Token không hợp lệ hoặc đã hết hạn. Vui lòng đăng nhập lại.");
        } else {
          alert("Lỗi khi thêm sách. Xem console để biết thêm chi tiết.");
        }
      }
    };
    reader.readAsArrayBuffer(file);
  };

  return (
    <div className="max-w-xl mx-auto mt-10 p-6 bg-white shadow-xl rounded-2xl border border-gray-200">
      {successMsg && (
        <div className="fixed top-4 left-1/2 -translate-x-1/2 z-50 bg-green-100 border border-green-400 text-green-700 px-6 py-3 rounded-lg shadow-lg animate-fade-in flex items-center gap-2">
          {successMsg}
        </div>
      )}
      {errorPopup && (
        <div className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-50 bg-white border border-red-400 text-red-700 px-8 py-6 rounded-xl shadow-2xl animate-fade-in flex flex-col items-center gap-4 max-w-md w-full">
          <div className="font-bold text-lg mb-2">Có {errorPopup.count} sách chưa được thêm:</div>
          <pre className="text-sm text-left whitespace-pre-wrap w-full mb-2">{errorPopup.details}</pre>
          <button
            className="bg-red-500 hover:bg-red-600 text-white px-6 py-2 rounded-lg font-semibold mt-2"
            onClick={() => {
              setErrorPopup(null);
              window.location.href = "/admin/books";
            }}
          >
            OK
          </button>
        </div>
      )}
      <h2 className="text-2xl font-bold mb-6 text-center text-gray-800 flex items-center justify-center gap-2">
        <Icon icon="mdi:file-excel" width="28" className="text-green-600" />
        Tải lên file Excel danh sách sách
      </h2>
      <label className="block text-gray-600 font-medium mb-2 flex items-center gap-1">
        <Icon icon="mdi:file-upload" width="20" className="text-blue-500" /> Chọn file Excel:
      </label>
      <input
        type="file"
        accept=".xlsx, .xls"
        className="w-full px-4 py-3 mb-5 border border-gray-300 rounded-lg text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-400"
        onChange={(e) => setFile(e.target.files[0])}
      />
      <button
        onClick={handleReadExcel}
        className="w-full bg-blue-600 text-white py-3 rounded-lg hover:bg-blue-700 transition duration-300 font-medium flex items-center justify-center gap-2"
      >
        <Icon icon="mdi:upload" width="22" /> Tải file Excel
      </button>
    </div>
  );
};

export default UploadExcel;
