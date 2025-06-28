import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { fetchOrderHistoryAPI } from "../../services/orderService";
import { formatPrice } from "../../utils/formatPrice";
import Pagination from "../../components/common/Pagination";

const OrderHistoryPage = () => {
  const [orders, setOrders] = useState([]);
  const [pagination, setPagination] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const limitPerPage = 10;

  useEffect(() => {
    const fetchOrders = async () => {
      setLoading(true);
      try {
        const response = await fetchOrderHistoryAPI({
          page: currentPage,
          limit: limitPerPage,
        });
        setOrders(response.data.orders || []);
        setPagination(response.data.pagination || null);
      } catch (err) {
        setError("Không thể tải lịch sử đơn hàng. Vui lòng thử lại sau.");
        console.error(err);
        setOrders([]);
        setPagination(null);
      } finally {
        setLoading(false);
      }
    };

    fetchOrders();
  }, [currentPage]);

  const handlePageChange = (newPage) => {
    if (newPage >= 1 && newPage <= (pagination?.totalPages || 1)) {
      setCurrentPage(newPage);
    }
  };

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8 text-center">Đang tải...</div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto px-4 py-8 text-center text-red-500">
        {error}
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-6 text-center text-gray-800">
        Lịch sử đơn hàng
      </h1>
      {orders.length === 0 ? (
        <p className="text-center text-gray-500">Bạn chưa có đơn hàng nào.</p>
      ) : (
        <>
          <div className="space-y-6">
            {orders.map((order) => (
              <div
                key={order._id}
                className="bg-white p-6 rounded-lg shadow-md hover:shadow-lg transition-shadow duration-300"
              >
                <div className="flex flex-wrap justify-between items-center mb-4">
                  <div>
                    <p className="text-lg font-semibold text-gray-700">
                      Mã đơn hàng: #{order.orderCode}
                    </p>
                    <p className="text-sm text-gray-500">
                      Ngày đặt:{" "}
                      {new Date(order.createdAt).toLocaleDateString("vi-VN")}
                    </p>
                  </div>
                  <div className="text-right">
                    <p
                      className={`text-lg font-bold ${
                        order.orderStatus === "completed"
                          ? "text-green-500"
                          : "text-blue-500"
                      }`}
                    >
                      {order.orderStatus}
                    </p>
                    <p className="text-xl font-bold text-red-600">
                      {formatPrice(order.totalAmount)}
                    </p>
                  </div>
                </div>

                <div className="mt-4 flex justify-end">
                  <Link
                    to={`/account/orders/${order._id}`}
                    className="text-indigo-600 hover:text-indigo-800 font-semibold"
                  >
                    Xem chi tiết
                  </Link>
                </div>
              </div>
            ))}
          </div>
          {pagination && pagination.totalPages > 1 && (
            <div className="mt-8">
              <Pagination
                currentPage={pagination.page}
                totalPages={pagination.totalPages}
                onPageChange={handlePageChange}
              />
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default OrderHistoryPage;
