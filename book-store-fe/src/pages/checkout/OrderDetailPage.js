import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import Spinner from '../../components/common/Spinner';
import Button from '../../components/common/Button';
import orderService from '../../services/orderService';
import { useAuth } from '../../contexts/AuthContext';
import Icon from '../../components/common/Icon';

const OrderDetailPage = () => {
  const { id } = useParams();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { isAuthenticated } = useAuth();

  useEffect(() => {
    if (isAuthenticated && id) {
      fetchOrderDetail();
    }
  }, [isAuthenticated, id]);

  const fetchOrderDetail = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await orderService.getOrderDetail(id);
      console.log("📦 Response từ API:", response); // giữ lại để debug tiếp
      setOrder(response.data || null);
    } catch (err) {
      setError(err.message || 'Có lỗi xảy ra khi tải chi tiết đơn hàng');
    } finally {
      setLoading(false);
    }
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
      <span className={`px-3 py-1 rounded-full text-sm font-medium ${config.className}`}>
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
      <span className={`px-3 py-1 rounded-full text-sm font-medium ${config.className}`}>
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
          <p className="text-gray-600 mb-4">Bạn cần đăng nhập để xem chi tiết đơn hàng</p>
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
          <Button onClick={fetchOrderDetail}>Thử lại</Button>
        </div>
      </div>
    );
  }

  if (!order) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center">
          <h1 className="text-2xl font-semibold mb-4">Không tìm thấy đơn hàng</h1>
          <p className="text-gray-600 mb-4">Đơn hàng bạn tìm kiếm không tồn tại hoặc đã bị xóa</p>
          <Link to="/orders">
            <Icon icon="tabler:arrow-left" width={18} height={18} />
            <Button>Quay lại lịch sử đơn hàng</Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Breadcrumb */}
      <div className="flex items-center mb-2">
        <Link to="/orders" className="no-underline">
          <Button variant="outline" className="mr-4 flex items-center gap-2">
            <Icon icon="tabler:arrow-left" width={18} height={18} />
            Quay lại lịch sử đơn hàng
          </Button>
        </Link>
      </div>

      {/* Order Header */}
      <div className="bg-white rounded-lg shadow-md border border-gray-200 p-6 mb-6">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between">
          <div className="mb-4 lg:mb-0">
            <h1 className="text-2xl font-bold text-gray-900 mb-2">
              Đơn hàng #{order.orderCode}
            </h1>
            <p className="text-gray-600">
              Đặt hàng lúc: {formatDate(order.createdAt)}
            </p>
          </div>
          <div className="flex flex-col sm:flex-row sm:items-center space-y-2 sm:space-y-0 sm:space-x-4">
            <div>
              <span className="text-sm text-gray-500">Trạng thái đơn hàng: </span>
              {getStatusBadge(order.orderStatus)}
            </div>
            <div>
              <span className="text-sm text-gray-500">Thanh toán: </span>
              {getPaymentStatusBadge(order.paymentStatus)}
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Order Items */}
        <div className="lg:col-span-2">
          <div className="bg-white rounded-lg shadow-md border border-gray-200 p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Sản phẩm đã đặt</h2>
            <div className="space-y-4">
              {order.items?.map((item, index) => (
                <div key={index} className="flex items-center space-x-4 p-4 border border-gray-200 rounded-lg">
                  <img
                    src={item.book?.images?.[0] || '/default-book.jpg'}
                    alt={item.book?.title}
                    className="w-16 h-20 object-cover rounded"
                  />
                  <div className="flex-1 min-w-0">
                    <h3 className="text-lg font-medium text-gray-900 truncate">
                      {item.book?.title || 'Sản phẩm đã bị xóa'}
                    </h3>
                    <p className="text-sm text-gray-500">
                      Tác giả: {item.book?.author || 'Không xác định'}
                    </p>
                    <p className="text-sm text-gray-500">
                      Số lượng: {item.quantity}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-lg font-semibold text-gray-900">
                      {formatPrice(item.price)}
                    </p>
                    <p className="text-sm text-gray-500">
                      {formatPrice(item.price * item.quantity)}
                    </p>

                    {/* Đánh giá sản phẩm */}
                    {order.orderStatus === 'completed' && (
                      (item.reviewId && (typeof item.reviewId === 'object' ? item.reviewId._id : item.reviewId)) ? (
                        <Link to={`/review/${order._id}/${item.book?._id}/${typeof item.reviewId === 'object' ? item.reviewId._id : item.reviewId}`}
                          state={{
                            book: {
                              _id: item.book?._id,
                              title: item.book?.title,
                              image: item.book?.images?.[0],
                              price: item.price,
                              quantity: item.quantity
                            }
                          }}
                        >
                          <button className="mt-2 px-3 py-1 text-sm text-white bg-green-600 rounded-md hover:bg-green-700 transition">
                            Xem đánh giá
                          </button>
                        </Link>
                      ) : (
                        <Link
                          to={`/review/${order._id}/${item.book?._id}`}
                          state={{
                            book: {
                              _id: item.book?._id,
                              title: item.book?.title,
                              image: item.book?.images?.[0],
                              price: item.price,
                              quantity: item.quantity
                            }
                          }}
                        >
                          <button className="mt-2 px-3 py-1 text-sm text-white bg-orange-500 rounded-md hover:bg-orange-600 transition">
                            Đánh giá
                          </button>
                        </Link>
                      )
                    )}
                  </div>
                </div>
              ))}

            </div>
          </div>
        </div>

        {/* Order Summary */}
        <div className="lg:col-span-1">
          <div className="bg-white rounded-lg shadow-md border border-gray-200 p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Thông tin đơn hàng</h2>

            {/* Shipping Address */}
            {order.shippingAddress && (
              <div className="mb-6">
                <h3 className="text-lg font-medium text-gray-900 mb-2">Địa chỉ giao hàng</h3>
                <div className="text-sm text-gray-600 space-y-1">
                  <p>{order.shippingAddress.fullName}</p>
                  <p>{order.shippingAddress.phone}</p>
                  <p>{order.shippingAddress.address}</p>
                  <p>{order.shippingAddress.city}, {order.shippingAddress.state}</p>
                </div>
              </div>
            )}

            {/* Payment Method */}
            {order.paymentMethod && (
              <div className="mb-6">
                <h3 className="text-lg font-medium text-gray-900 mb-2">Phương thức thanh toán</h3>
                <p className="text-sm text-gray-600">
                  {order.paymentMethod === 'cod' ? 'Thanh toán khi nhận hàng' :
                    order.paymentMethod === 'online' ? 'Thanh toán trực tuyến' :
                      order.paymentMethod}
                </p>
              </div>
            )}

            {/* Order Summary */}
            <div className="border-t pt-4">
              <h3 className="text-lg font-medium text-gray-900 mb-3">Tổng cộng</h3>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-600">Tạm tính:</span>
                  <span className="text-gray-900">{formatPrice(order.subtotal || order.totalAmount)}</span>
                </div>
                {order.shippingFee > 0 && (
                  <div className="flex justify-between">
                    <span className="text-gray-600">Phí vận chuyển:</span>
                    <span className="text-gray-900">{formatPrice(order.shippingFee)}</span>
                  </div>
                )}
                {order.discountAmount > 0 && (
                  <div className="flex justify-between">
                    <span className="text-gray-600">Giảm giá:</span>
                    <span className="text-green-600">-{formatPrice(order.discountAmount)}</span>
                  </div>
                )}
                <div className="border-t pt-2 flex justify-between font-semibold text-lg">
                  <span className="text-gray-900">Tổng cộng:</span>
                  <span className="text-gray-900">{formatPrice(order.totalAmount)}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="mt-6 flex justify-center">

        <Link to="/getbook">
          <Button>
            Tiếp tục mua sắm
          </Button>
        </Link>
      </div>
    </div>
  );
};

export default OrderDetailPage;
