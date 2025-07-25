import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import AdminModal from '../../components/admin/AdminModal';
import Spinner from '../../components/common/Spinner';
import Button from '../../components/common/Button';
import AdminPagination from '../../components/admin/AdminPagination';
import orderService from '../../services/orderService';
import { notifySuccess, notifyError, notifyLoading, notifyUpdateSuccess, notifyUpdateError, notifyDismiss } from '../../components/common/ToastManager';
import { useAuth } from '../../contexts/AuthContext';

const OrderHistoryPage = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 10,
    totalPages: 1,
    totalOrders: 0
  });
  // Modal xác nhận hủy đơn
  const [isCancelModalOpen, setIsCancelModalOpen] = useState(false);
  const [orderToCancel, setOrderToCancel] = useState(null);
  const { isAuthenticated } = useAuth();

  useEffect(() => {
    if (isAuthenticated) {
      fetchOrders();
    }
  }, [isAuthenticated, pagination.page]);

  const fetchOrders = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await orderService.getUserOrders({
        page: pagination.page,
        limit: pagination.limit
      });

      // Đảm bảo sắp xếp theo createdAt mới nhất trước
      const sortedOrders = (response.data.orders || []).sort((a, b) =>
        new Date(b.createdAt) - new Date(a.createdAt)
      );

      setOrders(sortedOrders);

      // Nếu response.data.pagination tồn tại
      if (response.data.pagination) {
        setPagination(prev => ({
          ...prev,
          ...response.data.pagination
        }));
      }

    } catch (err) {
      setError(err.message || 'Có lỗi xảy ra khi tải lịch sử đơn hàng');
    } finally {
      setLoading(false);
    }
  };

  const handlePageChange = (newPage) => {
    setPagination(prev => ({ ...prev, page: newPage }));
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const getStatusBadge = (status) => {
    const statusConfig = {
      pending: { text: 'Chờ xử lý', className: 'bg-yellow-100 text-yellow-800' },
      confirmed: { text: 'Đang xử lý', className: 'bg-blue-100 text-blue-800' },
      // shipping: { text: 'Đang giao', className: 'bg-purple-100 text-purple-800' },
      completed: { text: 'Hoàn thành', className: 'bg-green-100 text-green-800' },
      cancelled: { text: 'Đã hủy', className: 'bg-red-100 text-red-800' }
    };

    const config = statusConfig[status] || { text: status, className: 'bg-gray-100 text-gray-800' };

    return (
      <span className={`px-2 py-1 rounded-full text-xs font-medium ${config.className}`}>
        {config.text}
      </span>
    );
  };

  const getPaymentStatusBadge = (status) => {
    const statusConfig = {
      pending: { text: 'Chờ thanh toán', className: 'bg-yellow-100 text-yellow-800' },
      paid: { text: 'Đã thanh toán', className: 'bg-green-100 text-green-800' },
      failed: { text: 'Thanh toán thất bại', className: 'bg-red-100 text-red-800' },
      // refunded: { text: 'Đã hoàn tiền', className: 'bg-gray-100 text-gray-800' }
    };

    const config = statusConfig[status] || { text: status, className: 'bg-gray-100 text-gray-800' };

    return (
      <span className={`px-2 py-1 rounded-full text-xs font-medium ${config.className}`}>
        {config.text}
      </span>
    );
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('vi-VN', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const formatPrice = (price) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND'
    }).format(price);
  };

  if (!isAuthenticated) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center">
          <h1 className="text-2xl font-semibold mb-4">Vui lòng đăng nhập</h1>
          <p className="text-gray-600 mb-4">Bạn cần đăng nhập để xem lịch sử đơn hàng</p>
          <Link to="/auth/login">
            <Button>Đăng nhập</Button>
          </Link>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="flex justify-center items-center min-h-64">
          <Spinner />
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center">
          <h1 className="text-2xl font-semibold mb-4 text-red-600">Lỗi</h1>
          <p className="text-gray-600 mb-4">{error}</p>
          <Button onClick={fetchOrders}>Thử lại</Button>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8 flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Lịch sử đơn hàng</h1>
          <p className="text-gray-600">Xem lại tất cả đơn hàng của bạn</p>
        </div>
      </div>

      {orders.length === 0 ? (
        <div className="text-center py-12">
          <div className="text-gray-400 mb-4">
            <svg className="mx-auto h-12 w-12" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
          </div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">Chưa có đơn hàng nào</h3>
          <p className="text-gray-500 mb-6">Bạn chưa có đơn hàng nào. Hãy bắt đầu mua sắm!</p>
          <Link to="/getbook">
            <Button>Mua sắm ngay</Button>
          </Link>
        </div>
      ) : (
        <div className="space-y-6">
          {orders.map((order) => (
            <div key={order._id} className="bg-white rounded-lg shadow-md border border-gray-200 overflow-hidden">
              <div className="p-6">
                {/* Header */}
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
                  <div className="mb-4 sm:mb-0">
                    <h3 className="text-lg font-semibold text-gray-900">
                      Đơn hàng #{order.orderCode}
                    </h3>
                    <p className="text-sm text-gray-500">
                      Đặt hàng lúc: {formatDate(order.createdAt)}
                    </p>
                  </div>
                  <div className="flex flex-col sm:items-end space-y-2">
                    <div className="text-right">
                      <p className="text-sm text-gray-500">Tổng tiền</p>
                      <p className="text-xl font-bold text-gray-900">
                        {formatPrice(order.totalAmount)}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Order Items */}
                <div className="mb-4 border-t border-gray-200">
                  <h4 className="text-sm font-medium text-gray-900 mb-2">Sản phẩm:</h4>
                  <div className="space-y-2">
                    {order.items?.slice(0, 3).map((item, index) => (
                      <div key={index} className="flex items-center space-x-3">
                        <img
                          src={item.book?.images?.[0] || '/default-book.jpg'}
                          alt={item.book?.title}
                          className="w-12 h-16 object-cover rounded"
                        />
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-gray-900 truncate">
                            {item.book?.title || 'Sản phẩm đã bị xóa'}
                          </p>
                          <p className="text-sm text-gray-500">
                            Số lượng: {item.quantity}
                          </p>
                        </div>
                        <div className="text-right">
                          <p className="text-sm font-medium text-gray-900">
                            {formatPrice(item.price)}
                          </p>
                        </div>
                      </div>
                    ))}
                    {order.items?.length > 3 && (
                      <p className="text-sm text-gray-500 text-center">
                        Và {order.items.length - 3} sản phẩm khác...
                      </p>
                    )}
                  </div>
                </div>

                {/* Status */}
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-3 sm:space-y-0">
                  <div className="flex flex-col sm:flex-row sm:items-center space-y-2 sm:space-y-0 sm:space-x-4">
                    <div>
                      <span className="text-sm text-gray-500">Trạng thái đơn hàng: </span>
                      {getStatusBadge(order.orderStatus)}
                    </div>
                    <div>
                      <span className="text-sm text-gray-500">Thanh toán: </span>
                      {getPaymentStatusBadge(order.paymentStatus)}
                    </div>
                    {/* ✅ Thêm trạng thái đánh giá tại đây */}
                    {order.orderStatus === 'completed' && (
                      <div>
                        <span className="text-sm text-gray-500">Đánh giá: </span>
                        {order.items.every(item => item.reviewId && (typeof item.reviewId === 'object' ? item.reviewId._id : item.reviewId)) ? (
                          <span className="text-green-600 font-medium">Đã đánh giá</span>
                        ) : order.items.some(item => item.reviewId && (typeof item.reviewId === 'object' ? item.reviewId._id : item.reviewId)) ? (
                          <span className="text-yellow-600 font-medium">Đã đánh giá một phần</span>
                        ) : (
                          <span className="text-orange-500 font-medium">Chờ đánh giá</span>
                        )}
                      </div>
                    )}
                  </div>
                  {/* Actions */}
                  <div className="flex flex-wrap gap-2 justify-end">
                    <Link to={`/orders/${order._id}`}>
                      <button className="px-4 py-2 text-sm font-medium text-blue-600 border border-blue-600 rounded-md bg-white hover:bg-blue-50 transition">
                        Xem chi tiết
                      </button>
                    </Link>
                    {/* Nút Hủy đơn cho trạng thái pending */}
                    {order.orderStatus === 'pending' ? (
                      <Button
                        variant="danger"
                        size="sm"
                        onClick={() => {
                          setOrderToCancel(order);
                          setIsCancelModalOpen(true);
                        }}
                      >
                        Hủy đơn
                      </Button>
                    ) : (
                      <Button
                        variant="danger"
                        size="sm"
                        disabled
                        title={order.orderStatus === 'confirmed' ? 'Đơn đã được xác nhận, không thể hủy.' : 'Không thể hủy đơn ở trạng thái này.'}
                      >
                        Hủy đơn
                      </Button>
                    )}
                  </div>
                </div>
              </div>
            </div>
          ))}

          {/* Pagination */}
          {pagination.totalPages > 1 && (
            <div className="mt-8">
              <AdminPagination
                currentPage={pagination.page}
                totalPages={pagination.totalPages}
                totalItems={pagination.totalOrders}
                itemsPerPage={pagination.limit}
                onPageChange={handlePageChange}
              />
            </div>
          )}
        </div>
      )}
      {/* Modal xác nhận hủy đơn hàng */}
      <AdminModal
        isOpen={isCancelModalOpen}
        onClose={() => {
          setIsCancelModalOpen(false);
          setOrderToCancel(null);
        }}
        title="Xác nhận hủy đơn hàng"
      >
        <p className="text-gray-700 mb-4">
          Bạn có chắc chắn muốn hủy đơn hàng{' '}
          <span className="font-semibold">#{orderToCancel?.orderCode}</span> không?
        </p>
        <div className="flex justify-end gap-2">
          <button
            type="button"
            onClick={() => {
              setIsCancelModalOpen(false);
              setOrderToCancel(null);
            }}
            className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
          >
            Hủy
          </button>
          <button
            type="button"
            onClick={async () => {
              if (!orderToCancel) return;
              let toastId;
              try {
                toastId = notifyLoading('Đang xử lý hủy đơn...');
                await orderService.cancelOrderByCustomer(orderToCancel._id);
                notifyDismiss(toastId);
                notifySuccess('Đã hủy đơn hàng thành công!');
                setIsCancelModalOpen(false);
                setOrderToCancel(null);
                fetchOrders();
              } catch (err) {
                notifyDismiss(toastId);
                notifyError(err.message || 'Hủy đơn thất bại!');
              }
            }}
            className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700"
          >
            Xác nhận hủy
          </button>
        </div>
      </AdminModal>
    </div>
  );
};

export default OrderHistoryPage;
