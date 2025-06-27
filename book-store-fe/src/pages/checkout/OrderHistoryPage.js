import React, { useEffect, useState } from "react";
// Removed Redux
import { Link, useNavigate } from "react-router-dom";
import MainLayout from "../../components/layout/MainLayout";
import Spinner from "../../components/common/Spinner";
import Button from "../../components/common/Button";
import Pagination from "../../components/common/Pagination";
import { fetchOrderHistoryAPI as fetchOrderHistoryServiceAPI } from "../../services/orderService";
import { useAuth } from "../../contexts/AuthContext";

const OrderHistoryPage = () => {
  // Removed Redux dispatch
  const navigate = useNavigate();
  const { isAuthenticated, loading: authLoading } = useAuth();

  const [orders, setOrders] = useState([]);
  const [pagination, setPagination] = useState(null);
  const [orderStatus, setOrderStatus] = useState("idle");
  const [orderError, setOrderError] = useState(null);

  const [currentPage, setCurrentPage] = useState(1);
  const limitPerPage = 10;

  useEffect(() => {
    if (!authLoading) {
      if (!isAuthenticated) {
        navigate("/auth/login", { state: { from: { pathname: "/orders" } } });
      } else {
        setOrderStatus("loading_history");
        setOrderError(null);
        fetchOrderHistoryServiceAPI({ page: currentPage, limit: limitPerPage })
          .then((res) => {
            setOrders(res.data.orders || []);
            setPagination(res.data.pagination || null);
            setOrderStatus("succeeded_history");
          })
          .catch((err) => {
            setOrders([]);
            setPagination(null);
            setOrderStatus("failed_history");
            setOrderError(
              err?.response?.data?.message || "Lỗi khi tải lịch sử đơn hàng"
            );
          });
      }
    }
  }, [isAuthenticated, authLoading, navigate, currentPage]);

  const handlePageChange = (newPage) => {
    if (newPage >= 1 && newPage <= (pagination?.totalPages || 1)) {
      setCurrentPage(newPage);
    }
  };

  if (
    authLoading ||
    (orderStatus === "loading_history" && orders.length === 0)
  ) {
    return (
      <MainLayout>
        <div className="container mx-auto p-6 text-center">
          <Spinner />
          <p className="mt-4">Đang tải lịch sử đơn hàng...</p>
        </div>
      </MainLayout>
    );
  }

  if (orderStatus === "failed_history" && orders.length === 0) {
    return (
      <MainLayout>
        <div className="container mx-auto p-6 text-center text-red-500">
          <p>Lỗi khi tải lịch sử đơn hàng: {String(orderError)}</p>
          <Button onClick={() => setCurrentPage(currentPage)} className="mt-4">
            Thử lại
          </Button>
        </div>
      </MainLayout>
    );
  }

  return (
    <MainLayout>
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-semibold mb-8 text-center text-gray-800">
          Lịch sử đơn hàng
        </h1>
        {orders.length === 0 && orderStatus === "succeeded_history" ? (
          <div className="text-center text-gray-600 py-10">
            <p className="text-xl mb-4">Bạn chưa có đơn hàng nào.</p>
            <Link
              to="/products"
              className="text-blue-600 hover:text-blue-800 font-semibold"
            >
              Bắt đầu mua sắm ngay!
            </Link>
          </div>
        ) : (
          <div className="space-y-6">
            {orders.map((order) => (
              <div
                key={order._id}
                className="bg-white shadow-lg rounded-lg p-6 hover:shadow-xl transition-shadow"
              >
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-3 pb-3 border-b">
                  <div>
                    <p className="text-sm text-gray-500">Mã đơn hàng:</p>
                    <p className="text-lg font-semibold text-blue-600">
                      {order.orderCode}
                    </p>
                  </div>
                  <p className="text-sm text-gray-500 mt-2 sm:mt-0">
                    Ngày đặt:{" "}
                    {new Date(order.createdAt).toLocaleDateString("vi-VN")}
                  </p>
                </div>

                <div className="mb-3">
                  {order.items.slice(0, 2).map((item) => (
                    <div
                      key={item._id || item.book?._id}
                      className="flex items-center text-sm py-1"
                    >
                      <img
                        src={item.book?.images?.[0] || "/default-book.jpg"}
                        alt={item.book?.title}
                        className="w-10 h-12 object-cover rounded mr-3"
                      />
                      <span>
                        {item.book?.title || "Sản phẩm đã bị xóa"} (x
                        {item.quantity})
                      </span>
                    </div>
                  ))}
                  {order.items.length > 2 && (
                    <p className="text-xs text-gray-500 mt-1">
                      và {order.items.length - 2} sản phẩm khác...
                    </p>
                  )}
                </div>

                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center text-sm">
                  <div>
                    <p className="text-gray-600">
                      Trạng thái ĐH:{" "}
                      <span
                        className={`font-medium px-2 py-0.5 rounded-full text-xs ${
                          order.orderStatus === "completed"
                            ? "bg-green-100 text-green-700"
                            : order.orderStatus === "cancelled"
                            ? "bg-red-100 text-red-700"
                            : order.orderStatus === "shipping"
                            ? "bg-blue-100 text-blue-700"
                            : "bg-yellow-100 text-yellow-700" // pending
                        }`}
                      >
                        {order.orderStatus === "pending"
                          ? "Chờ xử lý"
                          : order.orderStatus === "shipping"
                          ? "Đang giao"
                          : order.orderStatus === "completed"
                          ? "Hoàn thành"
                          : order.orderStatus === "cancelled"
                          ? "Đã hủy"
                          : order.orderStatus}
                      </span>
                    </p>
                    <p className="text-gray-600 mt-1">
                      Thanh toán:{" "}
                      <span
                        className={`font-medium px-2 py-0.5 rounded-full text-xs ${
                          order.paymentStatus === "paid"
                            ? "bg-green-100 text-green-700"
                            : order.paymentStatus === "failed"
                            ? "bg-red-100 text-red-700"
                            : "bg-yellow-100 text-yellow-700" // pending
                        }`}
                      >
                        {order.paymentStatus === "pending"
                          ? "Chờ thanh toán"
                          : order.paymentStatus === "paid"
                          ? "Đã thanh toán"
                          : order.paymentStatus === "failed"
                          ? "Thất bại"
                          : order.paymentStatus}
                      </span>
                    </p>
                  </div>
                  <div className="mt-3 sm:mt-0 text-right">
                    <p className="text-gray-500">Tổng tiền:</p>
                    <p className="text-lg font-bold text-gray-800">
                      {(order.totalAmount || 0).toLocaleString("vi-VN")}đ
                    </p>
                    <Link
                      to={`/orders/${order._id}`}
                      className="text-blue-600 hover:text-blue-800 font-medium text-sm mt-1 inline-block"
                    >
                      Xem chi tiết
                    </Link>
                  </div>
                </div>
              </div>
            ))}

            {pagination && pagination.totalPages > 1 && (
              <div className="mt-8">
                <Pagination
                  currentPage={pagination.page}
                  totalPages={pagination.totalPages}
                  onPageChange={handlePageChange}
                />
              </div>
            )}
          </div>
        )}
      </div>
    </MainLayout>
  );
};

export default OrderHistoryPage;
