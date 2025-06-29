import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import MainLayout from "../../components/layout/MainLayout";
import Button from "../../components/common/Button";
import Spinner from "../../components/common/Spinner";
import { payosCheckoutCancel } from "../../services/orderService";

const OrderCancelPage = () => {
  const { orderId } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [orderUpdated, setOrderUpdated] = useState(false);

  useEffect(() => {
    const updateOrderStatus = async () => {
      if (!orderId) {
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        await payosCheckoutCancel(orderId);
        setOrderUpdated(true);
        console.log("Order cancelled successfully");
      } catch (err) {
        console.error("Failed to update order status:", err);
        // Don't show error if it's just a status update issue
        // The cancellation might have already been processed
      } finally {
        setLoading(false);
      }
    };

    updateOrderStatus();
  }, [orderId]);

  return (
    <MainLayout>
      <div className="container mx-auto px-4 py-12 text-center max-w-2xl">
        <div className="bg-red-50 border border-red-200 rounded-lg p-8 mb-6">
          <div className="text-red-600 text-6xl mb-4">❌</div>
          <h1 className="text-3xl font-bold text-red-600 mb-4">
            Thanh toán đã bị hủy
          </h1>

          {loading ? (
            <div className="flex items-center justify-center gap-2 mb-4">
              <Spinner size="sm" />
              <span>Đang cập nhật trạng thái đơn hàng...</span>
            </div>
          ) : (
            <div className="mb-4">
              <p className="text-gray-700 mb-2">
                Đơn hàng <strong>#{orderId}</strong> đã bị hủy thanh toán.
              </p>
              <p className="text-gray-600 text-sm mb-4">
                Bạn đã hủy quá trình thanh toán hoặc đóng cửa sổ PayOS.
                {orderUpdated &&
                  " Trạng thái đơn hàng đã được cập nhật và số lượng sách đã được hoàn lại kho."}
              </p>
            </div>
          )}

          {error && (
            <div className="bg-red-100 border border-red-300 text-red-700 px-4 py-2 rounded mb-4">
              {error}
            </div>
          )}
        </div>

        <div className="space-y-4">
          <div className="text-lg font-semibold text-gray-800 mb-4">
            Bạn muốn làm gì tiếp theo?
          </div>

          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button
              onClick={() => navigate("/cart")}
              className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3"
            >
              🛒 Quay lại giỏ hàng
            </Button>

            <Button
              onClick={() => navigate("/products")}
              variant="outline"
              className="border-gray-300 text-gray-700 hover:bg-gray-50 px-6 py-3"
            >
              📚 Tiếp tục mua sắm
            </Button>

            <Button
              onClick={() => navigate("/")}
              variant="link"
              className="text-gray-500 hover:text-gray-700"
            >
              🏠 Về trang chủ
            </Button>
          </div>
        </div>

        <div className="mt-8 text-sm text-gray-500">
          <p>Cần hỗ trợ? Liên hệ với chúng tôi qua email hoặc hotline.</p>
        </div>
      </div>
    </MainLayout>
  );
};

export default OrderCancelPage;
