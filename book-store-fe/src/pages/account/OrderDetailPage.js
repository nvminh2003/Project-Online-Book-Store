import React, { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import { fetchOrderDetailAPI } from "../../services/orderService";
import { formatPrice } from "../../utils/formatPrice";

const OrderDetailPage = () => {
  const { orderId } = useParams();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchOrderDetails = async () => {
      try {
        const response = await fetchOrderDetailAPI(orderId);
        setOrder(response.data);
      } catch (err) {
        setError("Không thể tải chi tiết đơn hàng. Vui lòng thử lại sau.");
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchOrderDetails();
  }, [orderId]);

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

  if (!order) {
    return (
      <div className="container mx-auto px-4 py-8 text-center">
        Không tìm thấy đơn hàng.
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="bg-white p-8 rounded-lg shadow-lg">
        <div className="flex justify-between items-start mb-6">
          <div>
            <h1 className="text-3xl font-bold text-gray-800">
              Chi tiết đơn hàng
            </h1>
            <p className="text-gray-600">Mã đơn hàng: #{order.orderCode}</p>
            <p className="text-sm text-gray-500">
              Ngày đặt: {new Date(order.createdAt).toLocaleDateString("vi-VN")}
            </p>
          </div>
          <Link
            to="/account/orders"
            className="text-indigo-600 hover:text-indigo-800 font-semibold"
          >
            Quay lại lịch sử
          </Link>
        </div>

        <div className="grid md:grid-cols-2 gap-8">
          <div>
            <h2 className="text-xl font-bold mb-4 text-gray-700">
              Địa chỉ giao hàng
            </h2>
            <div className="space-y-2 text-gray-600">
              <p>
                <strong>Họ và tên:</strong> {order.shippingAddress.fullName}
              </p>
              <p>
                <strong>Số điện thoại:</strong> {order.shippingAddress.phone}
              </p>
              <p>
                <strong>Địa chỉ:</strong>{" "}
                {`${order.shippingAddress.address}, ${order.shippingAddress.ward}, ${order.shippingAddress.district}, ${order.shippingAddress.city}`}
              </p>
            </div>
          </div>
          <div>
            <h2 className="text-xl font-bold mb-4 text-gray-700">
              Thông tin thanh toán
            </h2>
            <div className="space-y-2 text-gray-600">
              <p>
                <strong>Phương thức:</strong> {order.paymentMethod}
              </p>
              <p>
                <strong>Trạng thái:</strong>{" "}
                <span
                  className={`font-semibold ${
                    order.orderStatus === "completed"
                      ? "text-green-500"
                      : "text-blue-500"
                  }`}
                >
                  {order.orderStatus}
                </span>
              </p>
            </div>
          </div>
        </div>

        <div className="mt-8">
          <h2 className="text-xl font-bold mb-4 text-gray-700">
            Sản phẩm đã đặt
          </h2>
          <div className="flow-root">
            <ul className="-my-6 divide-y divide-gray-200">
              {order.items.map((item) => (
                <li key={item.book?._id || item._id} className="flex py-6">
                  <div className="h-24 w-24 flex-shrink-0 overflow-hidden rounded-md border border-gray-200">
                    <img
                      src={item.book?.coverImage || "/default-book.jpg"}
                      alt={item.book?.title || "Sách không có sẵn"}
                      className="h-full w-full object-cover object-center"
                    />
                  </div>
                  <div className="ml-4 flex flex-1 flex-col">
                    <div>
                      <div className="flex justify-between text-base font-medium text-gray-900">
                        <h3>
                          {item.book ? (
                            <Link to={`/products/${item.book.slug}`}>
                              {item.book.title}
                            </Link>
                          ) : (
                            <span>
                              {item.book?.title || "Sản phẩm đã bị xóa"}
                            </span>
                          )}
                        </h3>
                        <p className="ml-4">{formatPrice(item.price)}</p>
                      </div>
                    </div>
                    <div className="flex flex-1 items-end justify-between text-sm">
                      <p className="text-gray-500">Số lượng: {item.quantity}</p>
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div className="mt-8 border-t pt-6">
          <div className="space-y-2 text-right text-gray-700">
            <p>
              <strong>Tạm tính:</strong> {formatPrice(order.subtotal)}
            </p>
            <p>
              <strong>Phí vận chuyển:</strong> {formatPrice(order.shippingFee)}
            </p>
            {order.discountAmount > 0 && (
              <p>
                <strong>Giảm giá:</strong> -{formatPrice(order.discountAmount)}
              </p>
            )}
            <p className="text-xl font-bold">
              <strong>Tổng cộng:</strong>{" "}
              <span className="text-red-600">
                {formatPrice(order.totalAmount)}
              </span>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default OrderDetailPage;
