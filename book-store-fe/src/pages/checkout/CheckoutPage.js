import React, { useState, useEffect, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import MainLayout from "../../components/layout/MainLayout";
import Button from "../../components/common/Button";
import Spinner from "../../components/common/Spinner";
import Modal from "../../components/common/Modal";
import { useAuth } from "../../contexts/AuthContext";
import { fetchCartAPI, applyCouponToCartAPI } from "../../services/cartService";
import { createOrderAPI } from "../../services/orderService";
import accountService from "../../services/accountService";

const CheckoutPage = () => {
  const navigate = useNavigate();
  const { isAuthenticated, loading: authLoading } = useAuth();

  const [cartItems, setCartItems] = useState([]);
  const [cartSubtotal, setCartSubtotal] = useState(0);
  const [cartCoupon, setCartCoupon] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [shippingInfo, setShippingInfo] = useState({
    fullName: "",
    phone: "",
    address: "",
    city: "",
    district: "",
    ward: "",
    note: "",
  });

  const [paymentMethod, setPaymentMethod] = useState("COD");
  const [couponCode, setCouponCode] = useState("");
  const [isPlacingOrder, setIsPlacingOrder] = useState(false);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalContent, setModalContent] = useState({ title: "", body: "" });

  const openModal = (title, body) => {
    setModalContent({ title, body });
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
  };

  const shippingFee = 30000;

  const discountAmount = useMemo(() => {
    if (cartCoupon) {
      if (cartCoupon.type === "percent") {
        return (cartSubtotal * cartCoupon.value) / 100;
      } else {
        return cartCoupon.value;
      }
    }
    return 0;
  }, [cartCoupon, cartSubtotal]);

  const finalTotal = useMemo(() => {
    return Math.max(0, cartSubtotal - discountAmount + shippingFee);
  }, [cartSubtotal, discountAmount, shippingFee]);

  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      navigate("/auth/login");
    }
  }, [authLoading, isAuthenticated, navigate]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const [cartData, accountData] = await Promise.all([
          fetchCartAPI(),
          accountService.getProfile(),
        ]);

        setCartItems(cartData.data.items || []);
        setCartSubtotal(cartData.data.subtotal || 0);
        setCartCoupon(cartData.data.couponAppliedDetails || null);

        if (accountData.data.customerInfo) {
          const { fullName, phone, address } = accountData.data.customerInfo;
          setShippingInfo((prev) => ({
            ...prev,
            fullName: fullName || "",
            phone: phone || "",
            address: address?.address || "",
            city: address?.city || "",
            district: address?.district || "",
            ward: address?.ward || "",
          }));
        }
      } catch (err) {
        setError("Failed to load data. Please try again.");
      } finally {
        setLoading(false);
      }
    };

    if (isAuthenticated) {
      fetchData();
    }
  }, [isAuthenticated]);

  const handleShippingChange = (e) => {
    setShippingInfo({ ...shippingInfo, [e.target.name]: e.target.value });
  };

  const handleApplyCoupon = async () => {
    if (!couponCode) {
      openModal("Info", "Please enter a coupon code.");
      return;
    }
    try {
      const res = await applyCouponToCartAPI(couponCode);
      setCartCoupon(res.data.couponAppliedDetails);
      openModal("Success", "Coupon applied successfully!");
    } catch (err) {
      openModal(
        "Error Applying Coupon",
        err.response?.data?.message || "Invalid coupon code"
      );
    }
  };

  const handlePlaceOrder = async () => {
    setIsPlacingOrder(true);
    try {
      const orderData = {
        fullName: shippingInfo.fullName,
        phone: shippingInfo.phone,
        address: `${shippingInfo.address}, ${shippingInfo.ward}, ${shippingInfo.district}, ${shippingInfo.city}`,
        paymentMethod,
        discountCode: cartCoupon?.code,
      };
      const res = await createOrderAPI(orderData);
      if (paymentMethod === "PAYOS" && res.data.checkoutUrl) {
        window.location.href = res.data.checkoutUrl;
      } else {
        navigate(`/auth/checkout/success/${res.data.orderId}`);
      }
    } catch (err) {
      openModal(
        "Order Failed",
        err.response?.data?.message || "Failed to create order"
      );
      setIsPlacingOrder(false);
    }
  };

  if (loading || authLoading) {
    return (
      <MainLayout>
        <div className="flex justify-center items-center h-64">
          <Spinner />
        </div>
      </MainLayout>
    );
  }

  if (error) {
    return (
      <MainLayout>
        <div className="text-center text-red-500">{error}</div>
      </MainLayout>
    );
  }

  return (
    <MainLayout>
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mb-6">Thanh toán</h1>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2">
            <h2 className="text-xl font-semibold mb-4">Thông tin mua hàng</h2>
            <div className="bg-white p-6 rounded-lg shadow-md">
              {/* Shipping Info Form */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <input
                  type="text"
                  name="fullName"
                  value={shippingInfo.fullName}
                  onChange={handleShippingChange}
                  placeholder="Họ và tên"
                  className="p-2 border rounded"
                />
                <input
                  type="text"
                  name="phone"
                  value={shippingInfo.phone}
                  onChange={handleShippingChange}
                  placeholder="Số điện thoại"
                  className="p-2 border rounded"
                />
                <input
                  type="text"
                  name="address"
                  value={shippingInfo.address}
                  onChange={handleShippingChange}
                  placeholder="Địa chỉ"
                  className="p-2 border rounded md:col-span-2"
                />
                <input
                  type="text"
                  name="city"
                  value={shippingInfo.city}
                  onChange={handleShippingChange}
                  placeholder="Tỉnh/Thành phố"
                  className="p-2 border rounded"
                />
                <input
                  type="text"
                  name="district"
                  value={shippingInfo.district}
                  onChange={handleShippingChange}
                  placeholder="Quận/Huyện"
                  className="p-2 border rounded"
                />
                <input
                  type="text"
                  name="ward"
                  value={shippingInfo.ward}
                  onChange={handleShippingChange}
                  placeholder="Phường/Xã"
                  className="p-2 border rounded"
                />
                <textarea
                  name="note"
                  value={shippingInfo.note}
                  onChange={handleShippingChange}
                  placeholder="Ghi chú (tùy chọn)"
                  className="p-2 border rounded md:col-span-2"
                ></textarea>
              </div>
            </div>

            <h2 className="text-xl font-semibold mb-4 mt-8">
              Phương thức thanh toán
            </h2>
            <div className="bg-white p-6 rounded-lg shadow-md">
              <div className="space-y-4">
                <label className="flex items-center">
                  <input
                    type="radio"
                    name="paymentMethod"
                    value="COD"
                    checked={paymentMethod === "COD"}
                    onChange={(e) => setPaymentMethod(e.target.value)}
                    className="mr-2"
                  />
                  Thanh toán khi giao hàng (COD)
                </label>
                <label className="flex items-center">
                  <input
                    type="radio"
                    name="paymentMethod"
                    value="PAYOS"
                    checked={paymentMethod === "PAYOS"}
                    onChange={(e) => setPaymentMethod(e.target.value)}
                    className="mr-2"
                  />
                  Thanh toán qua PayOS
                </label>
              </div>
            </div>
          </div>

          <div className="lg:col-span-1">
            <div className="bg-white p-6 rounded-lg shadow-md">
              <h2 className="text-xl font-semibold mb-4">
                Đơn hàng ({cartItems.length} sản phẩm)
              </h2>
              <div className="space-y-4">
                {cartItems.map((item) => (
                  <div
                    key={item.book._id}
                    className="flex items-center justify-between"
                  >
                    <div className="flex items-center">
                      <img
                        src={item.book.images[0]}
                        alt={item.book.title}
                        className="w-16 h-16 object-cover rounded mr-4"
                      />
                      <div>
                        <p className="font-semibold">{item.book.title}</p>
                        <p className="text-sm text-gray-600">
                          Số lượng: {item.quantity}
                        </p>
                      </div>
                    </div>
                    <p>{(item.price * item.quantity).toLocaleString()}đ</p>
                  </div>
                ))}
              </div>
              <hr className="my-4" />
              <div className="flex justify-between">
                <input
                  type="text"
                  value={couponCode}
                  onChange={(e) => setCouponCode(e.target.value)}
                  placeholder="Nhập mã giảm giá"
                  className="p-2 border rounded w-full mr-2"
                />
                <Button onClick={handleApplyCoupon}>Áp dụng</Button>
              </div>
              <hr className="my-4" />
              <div className="space-y-2">
                <div className="flex justify-between">
                  <p>Tạm tính</p>
                  <p>{cartSubtotal.toLocaleString()}đ</p>
                </div>
                <div className="flex justify-between">
                  <p>Phí vận chuyển</p>
                  <p>{shippingFee.toLocaleString()}đ</p>
                </div>
                {cartCoupon && (
                  <div className="flex justify-between text-green-600">
                    <p>Giảm giá ({cartCoupon.code})</p>
                    <p>-{discountAmount.toLocaleString()}đ</p>
                  </div>
                )}
                <div className="flex justify-between font-bold text-xl">
                  <p>Tổng cộng</p>
                  <p>{finalTotal.toLocaleString()}đ</p>
                </div>
              </div>
              <Button
                onClick={handlePlaceOrder}
                disabled={isPlacingOrder}
                className="w-full mt-6"
              >
                {isPlacingOrder ? <Spinner /> : "ĐẶT HÀNG"}
              </Button>
            </div>
          </div>
        </div>
      </div>
      <Modal
        isOpen={isModalOpen}
        onClose={closeModal}
        title={modalContent.title}
        footerContent={<Button onClick={closeModal}>Close</Button>}
      >
        <p>{modalContent.body}</p>
      </Modal>
    </MainLayout>
  );
};

export default CheckoutPage;
