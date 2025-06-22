import React, { useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
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
import { resetCart } from "../../store/slices/cartSlice";

const OrderSuccessPage = () => {
  const { orderId } = useParams();
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const currentOrder = useSelector(selectCurrentOrder);
  const orderApiStatus = useSelector(selectOrderStatus);
  const orderApiError = useSelector(selectOrderError);

  useEffect(() => {
    if (orderId) {
      if (
        !currentOrder ||
        currentOrder._id !== orderId ||
        orderApiStatus === "idle" ||
        orderApiStatus === "failed_detail"
      ) {
        console.log(
          `OrderSuccessPage: Fetching order detail for ID: ${orderId}`
        );
        dispatch(fetchOrderDetailAPI(orderId));
      }
    } else {
      console.warn(
        "OrderSuccessPage: No orderId found in URL, redirecting to home."
      );
      navigate("/");
    }

    dispatch(resetCart());

    return () => {
      console.log(
        "OrderSuccessPage: Unmounting, clearing current order from Redux state."
      );
      dispatch(clearCurrentOrder());
    };
  }, [dispatch, orderId, currentOrder, navigate, orderApiStatus]);

  if (
    orderApiStatus === "loading_detail" ||
    (!currentOrder &&
      orderApiStatus !== "failed_detail" &&
      orderApiStatus !== "succeeded_detail")
  ) {
    return (
      <MainLayout>
        <div className="container mx-auto px-4 py-12 text-center">
          <Spinner />
          <p className="mt-4 text-lg text-gray-600">
            Đang tải thông tin đơn hàng...
          </p>
        </div>
      </MainLayout>
    );
  }

  if (orderApiStatus === "failed_detail" && !currentOrder) {
    return (
      <MainLayout>
        <div className="container mx-auto px-4 py-12 text-center text-red-500">
          <h1 className="text-2xl font-semibold mb-4">Lỗi khi tải đơn hàng</h1>
          <p className="mb-6">
            {String(orderApiError || "Không thể tải thông tin đơn hàng.")}
          </p>
          <Button onClick={() => navigate("/")} variant="primary">
            Về trang chủ
          </Button>
        </div>
      </MainLayout>
    );
  }

  if (!currentOrder) {
    return (
      <MainLayout>
        <div className="container mx-auto px-4 py-12 text-center">
          <p className="text-xl text-gray-700">
            Không tìm thấy thông tin đơn hàng đã đặt.
          </p>
          <Button onClick={() => navigate("/")} className="mt-4">
            Về trang chủ
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
  } = currentOrder;

  const calculatedSubtotal = items.reduce(
    (sum, item) => sum + item.price * item.quantity,
    0
  );

  return (
    <MainLayout>
      <div className="container mx-auto px-4 py-12 max-w-3xl">
        <div className="bg-green-50 border-l-4 border-green-500 text-green-700 p-6 rounded-lg shadow-md mb-10 text-center">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-16 w-16 text-green-500 mx-auto mb-4"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={2}
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
            />
          </svg>
          <h1 className="text-3xl font-bold text-green-800 mb-2">
            Đặt hàng thành công!
          </h1>
          <p className="text-lg">
            Cảm ơn bạn đã mua hàng. Chúng tôi sẽ sớm liên hệ để xác nhận đơn
            hàng.
          </p>
          {orderCode && (
            <p className="mt-2 text-md">
              Mã đơn hàng của bạn:{" "}
              <strong className="text-green-900">{orderCode}</strong>
            </p>
          )}
        </div>

        <div className="bg-white shadow-xl rounded-lg p-6 md:p-8 space-y-6">
          <h2 className="text-2xl font-semibold text-gray-800 border-b pb-3 mb-4">
            Chi tiết đơn hàng
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-4">
            <div>
              <h3 className="text-lg font-medium text-gray-700 mb-1">
                Thông tin người nhận:
              </h3>
              <p>
                <strong>Họ tên:</strong> {fullName}
              </p>
              <p>
                <strong>Điện thoại:</strong> {phone}
              </p>
              <p>
                <strong>Địa chỉ:</strong> {address}
              </p>
            </div>
            <div>
              <h3 className="text-lg font-medium text-gray-700 mb-1">
                Thông tin thanh toán & vận chuyển:
              </h3>
              <p>
                <strong>Phương thức thanh toán:</strong>{" "}
                {paymentMethod === "COD"
                  ? "Thanh toán khi nhận hàng"
                  : paymentMethod}
              </p>
              <p>
                <strong>Trạng thái thanh toán:</strong>
                <span
                  className={`ml-1 font-medium px-2 py-0.5 rounded-full text-xs ${
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
                <strong>Trạng thái đơn hàng:</strong>
                <span
                  className={`ml-1 font-medium px-2 py-0.5 rounded-full text-xs ${
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
            <h3 className="text-lg font-medium text-gray-700 mt-4 mb-2">
              Sản phẩm đã đặt:
            </h3>
            <ul className="divide-y divide-gray-200 border rounded-md">
              {items.map((item) => (
                <li
                  key={item.book?._id || item._id}
                  className="p-3 flex space-x-4"
                >
                  <img
                    src={item.book?.images?.[0] || "/default-book.jpg"}
                    alt={item.book?.title}
                    className="h-20 w-16 object-cover rounded flex-shrink-0"
                  />
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-gray-800 truncate">
                      {item.book?.title || "Sản phẩm đã bị xóa"}
                    </p>
                    <p className="text-sm text-gray-500">
                      Đơn giá: {(item.price || 0).toLocaleString("vi-VN")}đ
                    </p>
                    <p className="text-sm text-gray-500">
                      Số lượng: {item.quantity}
                    </p>
                  </div>
                  <p className="text-md font-semibold text-gray-800 self-center">
                    {((item.price || 0) * item.quantity).toLocaleString(
                      "vi-VN"
                    )}
                    đ
                  </p>
                </li>
              ))}
            </ul>
          </div>

          <div className="pt-4 border-t mt-4 space-y-1 text-gray-700">
            <div className="flex justify-between">
              <span>Tạm tính sản phẩm:</span>
              <span>{calculatedSubtotal.toLocaleString("vi-VN")}đ</span>
            </div>
            {discountAmount > 0 && (
              <div className="flex justify-between">
                <span>
                  Giảm giá{discountCode ? ` (Mã: ${discountCode})` : ""}:
                </span>
                <span className="text-green-600 font-semibold">
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

          {createdAt && (
            <p className="text-xs text-gray-500 text-center mt-4">
              Ngày đặt hàng: {new Date(createdAt).toLocaleString("vi-VN")}
            </p>
          )}
        </div>

        <div className="mt-10 flex flex-col sm:flex-row justify-center gap-4">
          <Button
            onClick={() => navigate("/")}
            variant="outline"
            className="w-full sm:w-auto"
          >
            Tiếp tục mua sắm
          </Button>
          <Button
            onClick={() => navigate("/orders")}
            variant="primary"
            className="w-full sm:w-auto"
          >
            Xem lịch sử đơn hàng
          </Button>
        </div>
      </div>
    </MainLayout>
  );
};

export default OrderSuccessPage;
