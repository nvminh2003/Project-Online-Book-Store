import React, { useEffect } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { useSelector, useDispatch } from "react-redux";
import MainLayout from "../../components/layout/MainLayout";
import Spinner from "../../components/common/Spinner";
import Button from "../../components/common/Button";
import {
  fetchOrderDetailAPI,
  clearCurrentOrder,
  selectCurrentOrder,
  selectOrderStatus,
  selectOrderError,
} from "../../store/slices/orderSlice";
import { useAuth } from "../../contexts/AuthContext";

const OrderDetailPage = () => {
  const { orderId } = useParams();
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { isAuthenticated, loading: authLoading } = useAuth();

  const order = useSelector(selectCurrentOrder);
  const status = useSelector(selectOrderStatus);
  const error = useSelector(selectOrderError);

  useEffect(() => {
    if (!authLoading) {
      if (!isAuthenticated) {
        navigate("/auth/login", {
          state: { from: { pathname: `/orders/${orderId}` } },
        });
      } else if (orderId) {
        if (
          !order ||
          order._id !== orderId ||
          status === "idle" ||
          status === "failed_detail"
        ) {
          dispatch(fetchOrderDetailAPI(orderId));
        }
      } else {
        navigate("/orders");
      }
    }
    return () => {
      dispatch(clearCurrentOrder());
    };
  }, [
    dispatch,
    orderId,
    isAuthenticated,
    authLoading,
    navigate,
    order,
    status,
  ]);

  if (
    authLoading ||
    status === "loading_detail" ||
    (status === "idle" && !error)
  ) {
    return (
      <MainLayout>
        <div className="container mx-auto p-6 text-center">
          <Spinner />
          <p className="mt-4">Đang tải chi tiết đơn hàng...</p>
        </div>
      </MainLayout>
    );
  }

  if (status === "failed_detail" || !order) {
    return (
      <MainLayout>
        <div className="container mx-auto p-6 text-center text-red-500">
          <p>
            Lỗi khi tải chi tiết đơn hàng:{" "}
            {String(error || "Không tìm thấy đơn hàng.")}
          </p>
          <Button onClick={() => navigate("/orders")} className="mt-4">
            Quay lại lịch sử
          </Button>
        </div>
      </MainLayout>
    );
  }

  const {
    orderCode,
    fullName,
    phone,
    address,
    items,
    totalAmount,
    discountAmount,
    discountCode,
    shippingFee,
    paymentMethod,
    paymentStatus,
    orderStatus: currentOrderStatus,
    createdAt,
  } = order;

  const subtotal = items.reduce(
    (sum, item) => sum + item.price * item.quantity,
    0
  );

  return (
    <MainLayout>
      <div className="container mx-auto px-4 py-8 max-w-3xl">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-semibold text-gray-800">
            Chi tiết đơn hàng
          </h1>
          <Button
            onClick={() => navigate("/orders")}
            variant="outline"
            size="sm"
          >
            ← Quay lại lịch sử
          </Button>
        </div>

        <div className="bg-white shadow-xl rounded-lg p-6 md:p-8 space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pb-4 border-b">
            <div>
              <p className="text-sm text-gray-500">Mã đơn hàng:</p>
              <p className="text-lg font-semibold text-blue-600">{orderCode}</p>
            </div>
            <div className="text-left md:text-right">
              <p className="text-sm text-gray-500">Ngày đặt:</p>
              <p className="text-gray-700">
                {new Date(createdAt).toLocaleString("vi-VN")}
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pb-4 border-b">
            <div>
              <h2 className="text-lg font-medium text-gray-700 mb-1">
                Thông tin nhận hàng
              </h2>
              <p>
                <strong>Người nhận:</strong> {fullName}
              </p>
              <p>
                <strong>Điện thoại:</strong> {phone}
              </p>
              <p>
                <strong>Địa chỉ:</strong> {address}
              </p>
            </div>
            <div>
              <h2 className="text-lg font-medium text-gray-700 mb-1">
                Thông tin thanh toán
              </h2>
              <p>
                <strong>Phương thức:</strong>{" "}
                {paymentMethod === "COD"
                  ? "Thanh toán khi nhận hàng"
                  : paymentMethod}
              </p>
              <p>
                <strong>Trạng thái TT:</strong>
                <span
                  className={`ml-2 font-medium px-2 py-0.5 rounded-full text-xs ${
                    paymentStatus === "paid"
                      ? "bg-green-100 text-green-700"
                      : paymentStatus === "failed"
                      ? "bg-red-100 text-red-700"
                      : "bg-yellow-100 text-yellow-700"
                  }`}
                >
                  {paymentStatus === "pending"
                    ? "Chờ thanh toán"
                    : paymentStatus === "paid"
                    ? "Đã thanh toán"
                    : paymentStatus === "failed"
                    ? "Thất bại"
                    : paymentStatus}
                </span>
              </p>
              <p className="mt-1">
                <strong>Trạng thái ĐH:</strong>
                <span
                  className={`ml-2 font-medium px-2 py-0.5 rounded-full text-xs ${
                    currentOrderStatus === "completed"
                      ? "bg-green-100 text-green-700"
                      : currentOrderStatus === "cancelled"
                      ? "bg-red-100 text-red-700"
                      : currentOrderStatus === "shipping"
                      ? "bg-blue-100 text-blue-700"
                      : "bg-yellow-100 text-yellow-700"
                  }`}
                >
                  {currentOrderStatus === "pending"
                    ? "Chờ xử lý"
                    : currentOrderStatus === "shipping"
                    ? "Đang giao"
                    : currentOrderStatus === "completed"
                    ? "Hoàn thành"
                    : currentOrderStatus === "cancelled"
                    ? "Đã hủy"
                    : currentOrderStatus}
                </span>
              </p>
            </div>
          </div>

          <div>
            <h2 className="text-lg font-medium text-gray-700 mb-2">
              Sản phẩm trong đơn hàng:
            </h2>
            <ul className="divide-y divide-gray-200">
              {items.map((item) => (
                <li key={item.book?._id || item._id} className="py-4 flex">
                  <img
                    src={item.book?.images?.[0] || "/default-book.jpg"}
                    alt={item.book?.title}
                    className="h-24 w-16 object-cover rounded-md mr-4"
                  />
                  <div className="flex-1">
                    <h3 className="font-medium text-gray-800">
                      {item.book?.title || "Sản phẩm đã bị xóa"}
                    </h3>
                    <p className="text-sm text-gray-500">
                      Đơn giá: {item.price?.toLocaleString("vi-VN")}đ
                    </p>
                    <p className="text-sm text-gray-500">
                      Số lượng: {item.quantity}
                    </p>
                  </div>
                  <p className="text-md font-semibold text-gray-800">
                    {(item.price * item.quantity).toLocaleString("vi-VN")}đ
                  </p>
                </li>
              ))}
            </ul>
          </div>

          <div className="pt-4 border-t mt-4 space-y-1 text-gray-700">
            <div className="flex justify-between">
              <span>Tạm tính:</span>
              <span>{subtotal.toLocaleString("vi-VN")}đ</span>
            </div>
            {discountAmount > 0 && (
              <div className="flex justify-between">
                <span>Giảm giá{discountCode ? ` (${discountCode})` : ""}:</span>
                <span className="text-green-600">
                  -{discountAmount.toLocaleString("vi-VN")}đ
                </span>
              </div>
            )}
            <div className="flex justify-between">
              <span>Phí vận chuyển:</span>
              <span>{shippingFee.toLocaleString("vi-VN")}đ</span>
            </div>
            <div className="flex justify-between text-xl font-bold text-gray-900 pt-2 border-t mt-1">
              <span>Tổng cộng thanh toán:</span>
              <span>{totalAmount.toLocaleString("vi-VN")}đ</span>
            </div>
          </div>
        </div>
      </div>
    </MainLayout>
  );
};

export default OrderDetailPage;
