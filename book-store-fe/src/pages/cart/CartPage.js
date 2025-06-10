import { useState } from "react";
import CartSummary from "../../components/cart/CartSummary";
import CartItem from "../../components/cart/CartItem";
import EmptyItem from "../../components/cart/EmptyItem";
import { useSelector, useDispatch } from "react-redux"; // Đảm bảo đã cài đặt react-redux
import {
  updateCartItemQuantity,
  removeCartItem,
  applyCouponToCart,
} from "../../store/slices/cartSlice";
import { useNavigate, Link } from "react-router-dom"; // Sử dụng từ react-router-dom
import MainLayout from "../../components/layout/MainLayout";

// Giả sử bạn có các selectors này từ Redux store
const selectCartItems = (state) => state.cart.items || [];
const selectCartSubtotal = (state) => {
  return (state.cart.items || []).reduce(
    (total, item) => total + item.price * item.quantity,
    0
  );
};
const selectCartDiscount = (state) => state.cart.discountAmount || 0;
const selectShippingFee = (state) => state.cart.shippingFee || 0;
const selectCartTotal = (state) => {
  const subtotal = selectCartSubtotal(state);
  const discount = selectCartDiscount(state);
  const shipping = selectShippingFee(state);
  return subtotal - discount + shipping;
};

const CartPage = () => {
  const dispatch = useDispatch(); // Sẽ dùng khi bỏ comment actions
  const navigate = useNavigate(); // Thay thế cho useRouter

  const cartItems = useSelector(selectCartItems);
  const subtotal = useSelector(selectCartSubtotal);
  const discountAmount = useSelector(selectCartDiscount);
  const shippingFee = useSelector(selectShippingFee);
  const total = useSelector(selectCartTotal);

  const [couponCode, setCouponCode] = useState("");
  const [couponError, setCouponError] = useState("");
  const [applyingCoupon, setApplyingCoupon] = useState(false);

  const handleQuantityChange = (itemId, newQuantity) => {
    if (newQuantity >= 1) {
      // dispatch(updateCartItemQuantity({ itemId, quantity: newQuantity }));
      console.log("Dispatch update quantity:", itemId, newQuantity);
    }
  };

  const handleRemoveItem = (itemId) => {
    // dispatch(removeCartItem(itemId));
    console.log("Dispatch remove item:", itemId);
  };

  const handleApplyCoupon = async () => {
    if (!couponCode.trim()) {
      setCouponError("Vui lòng nhập mã giảm giá.");
      return;
    }
    setCouponError("");
    setApplyingCoupon(true);
    // try {
    //   await dispatch(applyCouponToCart(couponCode)).unwrap();
    // } catch (error) {
    //   setCouponError(error.message || 'Mã giảm giá không hợp lệ.');
    // } finally {
    //   setApplyingCoupon(false);
    // }
    console.log("Dispatch apply coupon:", couponCode); // Placeholder
    setTimeout(() => {
      setApplyingCoupon(false);
    }, 1000);
  };

  const handleProceedToCheckout = () => {
    navigate("/checkout/shipping"); // Sử dụng navigate
    console.log("Proceed to checkout");
  };

  if (!cartItems || cartItems.length === 0) {
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
          {/* Bỏ role="list" ở đây */}
          <ul className="divide-y divide-gray-200">
            {cartItems.map((item) => (
              <li key={item.id} className="py-6">
                <CartItem
                  item={item}
                  onQuantityChange={handleQuantityChange}
                  onRemoveItem={handleRemoveItem}
                />
              </li>
            ))}
          </ul>
        </section>

        <section
          aria-labelledby="summary-heading"
          className="lg:col-span-4 mt-8 lg:mt-0 sticky top-20"
        >
          <h2 id="summary-heading" className="sr-only">
            Tóm tắt đơn hàng
          </h2>
          <CartSummary
            subtotal={subtotal}
            discountAmount={discountAmount}
            shippingFee={shippingFee}
            total={total}
            couponCode={couponCode}
            onCouponCodeChange={setCouponCode}
            onApplyCoupon={handleApplyCoupon}
            onProceedToCheckout={handleProceedToCheckout}
            couponError={couponError}
            applyingCoupon={applyingCoupon}
          />
        </section>
      </div>
    </div>
  );
};

export default CartPage;
