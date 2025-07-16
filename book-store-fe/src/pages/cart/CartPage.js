// src/pages/CartPage.js
import React, { useState } from "react";
import CartSummary from "../../components/cart/CartSummary";
import CartItem from "../../components/cart/CartItem";
import EmptyCart from "../../components/cart/EmptyItem";
import Spinner from "../../components/common/Spinner";
import Modal from "../../components/common/Modal";
import { useNavigate } from "react-router-dom";
import { useCart } from "../../contexts/CartContext"; // Import useCart
import { calculateShippingFee } from "../../constants/shipping";

const CartPage = () => {
    const navigate = useNavigate();
    const {
        cart,
        loading,
        error,
        updateQuantity,
        removeFromCart,
        applyCoupon,
        applyingCoupon,
    } = useCart(); // Use the cart context

    const [couponCode, setCouponCode] = useState("");
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [modalContent, setModalContent] = useState({ title: "", body: "" });

    const openModal = (title, body) => {
        setModalContent({ title, body });
        setIsModalOpen(true);
    };

    const closeModal = () => {
        setIsModalOpen(false);
    };

    const handleQuantityChange = async (bookId, newQuantity) => {
        const quantityNum = Number(newQuantity);
        if (!isNaN(quantityNum) && quantityNum >= 0) {
            await updateQuantity(bookId, quantityNum);
        }
    };

    const handleRemoveItem = async (bookId) => {
        await removeFromCart(bookId);
    };

    const handleApplyCoupon = async () => {
        if (!couponCode.trim()) {
            openModal("Thông báo", "Vui lòng nhập mã giảm giá.");
            return;
        }
        const result = await applyCoupon(couponCode);
        if (result.success) {
            openModal("Thành công", "Áp dụng mã giảm giá thành công!");
            setCouponCode("");
        } else {
            openModal("Lỗi", result.message || "Mã giảm giá không hợp lệ");
        }
    };

    const handleProceedToCheckout = () => {
        if (cart && cart.items.length > 0) {
            navigate("/auth/checkout");
        } else {
            openModal("Thông báo", "Giỏ hàng của bạn đang trống!");
        }
    };

    // Calculations are now derived directly from the cart context state
    const subtotal =
        cart?.items?.reduce((total, item) => {
            const price = item?.book?.sellingPrice || 0;
            const quantity = item?.quantity || 0;
            return total + price * quantity;
        }, 0) || 0;

    const discountAmount = cart?.couponDetails?.discountAmountCalculated || 0;
    const shippingFee = calculateShippingFee(subtotal);
    const displayTotal = Math.max(0, subtotal - discountAmount + shippingFee);

    const token = localStorage.getItem("accessToken");
    if (!token) {
        return (
            <div className="container mx-auto px-4 py-8">
                <EmptyCart
                    title="Bạn chưa đăng nhập"
                    message="Vui lòng đăng nhập để xem giỏ hàng của bạn."
                    showButton={false}
                />
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

    if (loading && !cart) {
        return (
            <div className="container mx-auto px-4 py-8 flex justify-center items-center h-64">
                <Spinner />
            </div>
        );
    }

    // if (error && (!cart || cart.items.length === 0)) {
    //     return (
    //         <div className="container mx-auto px-4 py-8 text-center text-red-500">
    //             <p>Lỗi khi tải giỏ hàng: {String(error)}</p>
    //         </div>
    //     );
    // }
    if (error && String(error).includes("Invalid token")) {
        // Optional: clear token
        localStorage.removeItem("accessToken");
        navigate("/auth/login");
        return null;
    }

    if (!cart || cart.items.length === 0) {
        return (
            <div className="container mx-auto px-4 py-8">
                <EmptyCart />
            </div>
        );
    }

    return (
        <div className="container mx-auto px-4 py-8">
            <Modal
                isOpen={isModalOpen}
                onClose={closeModal}
                title={modalContent.title}
            >
                <p>{modalContent.body}</p>
            </Modal>
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
                                <CartItem
                                    key={item.book._id}
                                    item={item}
                                    onQuantityChange={(newQuantity) =>
                                        handleQuantityChange(item.book._id, newQuantity)
                                    }
                                    onRemoveItem={() => handleRemoveItem(item.book._id)}
                                />
                            );
                        })}
                    </ul>
                </section>

                <section
                    aria-labelledby="summary-heading"
                    className="lg:col-span-4 sticky top-8"
                >
                    <CartSummary
                        subtotal={subtotal}
                        discountAmount={discountAmount}
                        shippingFee={shippingFee}
                        total={displayTotal}
                        couponCode={couponCode}
                        onCouponCodeChange={setCouponCode}
                        onApplyCoupon={handleApplyCoupon}
                        onProceedToCheckout={handleProceedToCheckout}
                        applyingCoupon={applyingCoupon}
                    />
                </section>
            </div>
        </div>
    );
};

export default CartPage;