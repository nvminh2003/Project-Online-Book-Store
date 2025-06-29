import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import MainLayout from "../../components/layout/MainLayout";
import Spinner from "../../components/common/Spinner";
import Button from "../../components/common/Button";
import {
  fetchOrderDetailAPI,
  payosCheckoutSuccess,
} from "../../services/orderService";
import { useCart } from "../../contexts/CartContext";
import Modal from "../../components/common/Modal";

const OrderSuccessPage = () => {
  const { orderId } = useParams();
  const navigate = useNavigate();
  const { clearCart } = useCart();

  const [loading, setLoading] = useState(true);
  const [order, setOrder] = useState(null);
  const [error, setError] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalContent, setModalContent] = useState({ title: "", body: "" });

  const openModal = (title, body) => {
    setModalContent({ title, body });
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
  };

  useEffect(() => {
    const fetchOrderDetails = async () => {
      setLoading(true);
      try {
        // If coming from PayOS, update order status
        const isPendingPayOS =
          localStorage.getItem("pendingOrderId") === orderId;
        if (isPendingPayOS) {
          localStorage.removeItem("pendingOrderId");
          await payosCheckoutSuccess(orderId);
        }

        // Fetch order details
        const response = await fetchOrderDetailAPI(orderId);
        setOrder(response.data.data);

        // Clear cart after successful order
        await clearCart();

        // Show payment success message if coming from PayOS
        if (isPendingPayOS) {
          openModal(
            "Thanh toán thành công",
            "Thanh toán của bạn đã được xác nhận. Đơn hàng đang được xử lý."
          );
        }
      } catch (err) {
        console.error("Failed to fetch order details:", err);
        setError(err.response?.data?.message || "Failed to load order details");
      } finally {
        setLoading(false);
      }
    };

    fetchOrderDetails();
  }, [orderId, clearCart]);

  if (loading) {
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

  if (error) {
    return (
      <MainLayout>
        <div className="container mx-auto px-4 py-12 text-center text-red-500">
          <h1 className="text-2xl font-semibold mb-4">Lỗi khi tải đơn hàng</h1>
          <p className="mb-6">{error}</p>
          <Button onClick={() => navigate("/")} variant="primary">
            Về trang chủ
          </Button>
        </div>
      </MainLayout>
    );
  }

  if (!order) {
    return (
      <MainLayout>
        <div className="container mx-auto px-4 py-12 text-center">
          <p className="text-xl text-gray-700">
            Không tìm thấy thông tin đơn hàng.
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
    orderStatus,
    createdAt,
  } = order;

  const subtotal =
    items?.reduce((sum, item) => sum + item.price * item.quantity, 0) || 0;

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
          <h2 className="text-2xl font-bold mb-2">Đặt hàng thành công!</h2>
          <p>
            Cảm ơn bạn đã đặt hàng. Mã đơn hàng của bạn là:{" "}
            <strong>{orderCode}</strong>
          </p>
        </div>

        <div className="bg-white rounded-lg shadow-md p-6 mb-8">
          <h3 className="text-xl font-semibold mb-4">Thông tin đơn hàng</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
            <div>
              <p className="text-gray-600 text-sm">Người nhận:</p>
              <p className="font-medium">{fullName}</p>
            </div>
            <div>
              <p className="text-gray-600 text-sm">Số điện thoại:</p>
              <p className="font-medium">{phone}</p>
            </div>
            <div className="md:col-span-2">
              <p className="text-gray-600 text-sm">Địa chỉ giao hàng:</p>
              <p className="font-medium">{address}</p>
            </div>
            <div>
              <p className="text-gray-600 text-sm">Trạng thái đơn hàng:</p>
              <p
                className={`font-medium ${
                  orderStatus === "completed"
                    ? "text-green-600"
                    : orderStatus === "cancelled"
                    ? "text-red-600"
                    : "text-yellow-600"
                }`}
              >
                {orderStatus === "pending"
                  ? "Đang xử lý"
                  : orderStatus === "processing"
                  ? "Đang giao hàng"
                  : orderStatus === "completed"
                  ? "Đã giao hàng"
                  : orderStatus === "cancelled"
                  ? "Đã hủy"
                  : orderStatus}
              </p>
            </div>
            <div>
              <p className="text-gray-600 text-sm">Trạng thái thanh toán:</p>
              <p
                className={`font-medium ${
                  paymentStatus === "paid"
                    ? "text-green-600"
                    : paymentStatus === "failed"
                    ? "text-red-600"
                    : "text-yellow-600"
                }`}
              >
                {paymentStatus === "pending"
                  ? "Chờ thanh toán"
                  : paymentStatus === "paid"
                  ? "Đã thanh toán"
                  : paymentStatus === "failed"
                  ? "Thanh toán thất bại"
                  : paymentStatus}
              </p>
            </div>
            <div>
              <p className="text-gray-600 text-sm">Phương thức thanh toán:</p>
              <p className="font-medium">
                {paymentMethod === "COD"
                  ? "Thanh toán khi nhận hàng (COD)"
                  : paymentMethod === "PAYOS"
                  ? "PayOS (VNPAY/Thẻ ATM/Ví điện tử)"
                  : paymentMethod}
              </p>
            </div>
          </div>

          <h4 className="font-semibold mb-3">Sản phẩm đã đặt:</h4>
          <div className="space-y-4 mb-6">
            {items?.map((item) => (
              <div
                key={item.book}
                className="flex justify-between border-b pb-3"
              >
                <div className="flex items-start">
                  <div className="ml-3">
                    <p className="font-medium">{item.book.title || "Sách"}</p>
                    <p className="text-sm text-gray-500">
                      Số lượng: {item.quantity}
                    </p>
                    <p className="text-sm">
                      {item.price.toLocaleString("vi-VN")}đ
                    </p>
                  </div>
                </div>
                <p className="font-medium">
                  {(item.price * item.quantity).toLocaleString("vi-VN")}đ
                </p>
              </div>
            ))}
          </div>

          <div className="space-y-2 border-t pt-4">
            <div className="flex justify-between">
              <span>Tạm tính:</span>
              <span>{subtotal.toLocaleString("vi-VN")}đ</span>
            </div>
            {discountAmount > 0 && (
              <div className="flex justify-between text-green-600">
                <span>Giảm giá {discountCode ? `(${discountCode})` : ""}:</span>
                <span>-{discountAmount.toLocaleString("vi-VN")}đ</span>
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
            variant="outlined"
            className="w-full sm:w-auto"
          >
            Tiếp tục mua sắm
          </Button>
          <Button
            onClick={() => navigate("/auth/account/orders")}
            className="w-full sm:w-auto"
          >
            Xem lịch sử đơn hàng
          </Button>
        </div>
      </div>

      <Modal
        isOpen={isModalOpen}
        onClose={closeModal}
        title={modalContent.title}
        footerContent={<Button onClick={closeModal}>Đóng</Button>}
      >
        <p>{modalContent.body}</p>
      </Modal>
    </MainLayout>
  );
};

export default OrderSuccessPage;
