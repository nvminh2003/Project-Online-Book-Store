import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import MainLayout from "../../components/layout/MainLayout";
import Button from "../../components/common/Button";
import payosCheckoutCancel from "../../services/orderService";

const OrderCancelPage = () => {
  const { orderId } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    if (orderId) {
      payosCheckoutCancel(orderId)
        .then(() => setLoading(false))
        .catch((err) => {
          setError("Không thể cập nhật trạng thái đơn hàng. Vui lòng thử lại.");
          setLoading(false);
        });
    } else {
      setLoading(false);
    }
  }, [orderId]);

  return (
    <MainLayout>
      <div className="container mx-auto px-4 py-12 text-center">
        <h1 className="text-3xl font-bold text-red-600 mb-6">
          Thanh toán thất bại hoặc bị hủy
        </h1>
        <p className="mb-4">
          Đơn hàng của bạn (ID: {orderId}) chưa được thanh toán thành công.
        </p>
        {loading && <p>Đang cập nhật trạng thái đơn hàng...</p>}
        {error && <p className="text-red-500">{error}</p>}
        <Button onClick={() => navigate("/auth/checkout/payment")}>
          Thử lại thanh toán
        </Button>
        <Button variant="link" onClick={() => navigate("/")}>
          Về trang chủ
        </Button>
      </div>
    </MainLayout>
  );
};

export default OrderCancelPage;
