// src/pages/CartPage.js
import React, { useEffect, useState } from "react";
import CartSummary from "../../components/cart/CartSummary";
import CartItem from "../../components/cart/CartItem";
import EmptyItem from "../../components/cart/EmptyItem";
import Spinner from "../../components/common/Spinner";
import Modal from "../../components/common/Modal";
import Button from "../../components/common/Button";
import { useNavigate } from "react-router-dom";
import {
  fetchCartAPI,
  updateCartItemQuantityAPI,
  removeCartItemAPI,
  applyCouponToCartAPI,
  clearCartAPI,
} from "../../services/cartService";

const CartPage = () => {
  const navigate = useNavigate();
  const [cart, setCart] = useState({
    items: [],
    total: 0,
    couponDetails: null,
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [couponCode, setCouponCode] = useState("");
  const [applyingCoupon, setApplyingCoupon] = useState(false);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalContent, setModalContent] = useState({ title: "", body: "" });

  const openModal = (title, body) => {
    setModalContent({ title, body });
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
  };

  const fetchCart = async () => {
    setLoading(true);
    setError("");
    try {
      const res = await fetchCartAPI();
      setCart(res.data.data);
    } catch (err) {
      setError(
        err?.response?.data?.message || err.message || "Lỗi tải giỏ hàng"
      );
      setCart({ items: [], total: 0, couponDetails: null });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const token = localStorage.getItem("accessToken");
    if (token) fetchCart();
    else setCart({ items: [], total: 0, couponDetails: null });
  }, []);

  const handleQuantityChange = async (bookId, newQuantity) => {
    const quantityNum = Number(newQuantity);
    if (!isNaN(quantityNum) && quantityNum >= 0) {
      setLoading(true);
      try {
        const res = await updateCartItemQuantityAPI(bookId, quantityNum);
        setCart(res.data.data);
      } catch (err) {
        setError(
          err?.response?.data?.message || err.message || "Lỗi cập nhật số lượng"
        );
      } finally {
        setLoading(false);
      }
    }
  };

  const handleRemoveItem = async (bookId) => {
    setLoading(true);
    try {
      const res = await removeCartItemAPI(bookId);
      setCart(res.data.data);
    } catch (err) {
      setError(
        err?.response?.data?.message || err.message || "Lỗi xoá sản phẩm"
      );
    } finally {
      setLoading(false);
    }
  };

  const handleApplyCoupon = async () => {
    if (!couponCode.trim()) {
      openModal("Thông báo", "Vui lòng nhập mã giảm giá.");
      return;
    }
    setApplyingCoupon(true);
    try {
      const res = await applyCouponToCartAPI(couponCode);
      setCart(res.data.data);
      setCouponCode("");
      openModal("Thành công", "Áp dụng mã giảm giá thành công!");
    } catch (err) {
      openModal(
        "Lỗi",
        err?.response?.data?.message ||
          err.message ||
          "Mã giảm giá không hợp lệ"
      );
    } finally {
      setApplyingCoupon(false);
    }
  };

  const handleProceedToCheckout = () => {
    if (cart.items.length > 0) {
      navigate("/auth/checkout");
    } else {
      openModal("Thông báo", "Giỏ hàng của bạn đang trống!");
    }
  };

  // Tính toán subtotal, discount, shippingFee, total
  const subtotal = cart.items.reduce((total, item) => {
    const price = item?.book?.sellingPrice || 0;
    const quantity = item?.quantity || 0;
    return total + price * quantity;
  }, 0);
  const discountAmount = cart.couponDetails?.discountAmountCalculated || 0;
  const shippingFee = 0; // tuỳ logic của bạn
  const displayTotal = Math.max(0, subtotal - discountAmount + shippingFee);

  const token = localStorage.getItem("accessToken");
  if (!token) {
    return (
      <div className="container mx-auto px-4 py-8">
        <EmptyItem message="Vui lòng đăng nhập để xem giỏ hàng của bạn." />
        <div className="text-center mt-4">
          <button
            onClick={() => navigate("/auth/login")}
            className="px-6 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
          >
            Đăng nhập
          </button>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8 flex justify-center items-center h-64">
        <Spinner />
      </div>
    );
  }

  if (error && cart.items.length === 0) {
    return (
      <div className="container mx-auto px-4 py-8 text-center text-red-500">
        <p>Lỗi khi tải giỏ hàng: {String(error)}</p>
        <button
          onClick={fetchCart}
          className="mt-4 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
        >
          Thử lại
        </button>
      </div>
    );
  }

  if (cart.items.length === 0) {
    return (
      <div className="container mx-auto px-4 py-8">
        <EmptyItem />
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-semibold text-center text-gray-800 mb-8">
        Giỏ hàng của bạn
      </h1>
      <div className="lg:grid lg:grid-cols-12 lg:gap-8 items-start">
        <section
          aria-labelledby="cart-heading"
          className="lg:col-span-8 bg-white shadow-md rounded-lg p-6"
        >
          <h2 id="cart-heading" className="sr-only">
            Sản phẩm trong giỏ hàng
          </h2>
          <ul className="divide-y divide-gray-200">
            {cart.items.map((item) => {
              if (!item.book || !item.book._id) {
                console.warn(
                  "Cart item is missing book data or book._id:",
                  item
                );
                return null;
              }
              return (
                <li key={item.book._id} className="py-6">
                  <CartItem
                    item={item}
                    onQuantityChange={(newQuantity) =>
                      handleQuantityChange(item.book._id, newQuantity)
                    }
                    onRemoveItem={() => handleRemoveItem(item.book._id)}
                  />
                </li>
              );
            })}
          </ul>
        </section>
        <section
          aria-labelledby="summary-heading"
          className="lg:col-span-4 bg-gray-50 shadow-md rounded-lg p-6"
        >
          <CartSummary
            subtotal={subtotal}
            discountAmount={discountAmount}
            shippingFee={shippingFee}
            total={displayTotal}
            couponDetails={cart.couponDetails}
            couponCode={couponCode}
            setCouponCode={setCouponCode}
            handleApplyCoupon={handleApplyCoupon}
            applyingCoupon={applyingCoupon}
            onCheckout={handleProceedToCheckout}
          />
        </section>
      </div>
      <Modal
        isOpen={isModalOpen}
        onClose={closeModal}
        title={modalContent.title}
        footerContent={<Button onClick={closeModal}>Đóng</Button>}
      >
        <p>{modalContent.body}</p>
      </Modal>
    </div>
  );
};

export default CartPage;
