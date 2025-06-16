// src/pages/CartPage.js
import React, { useEffect, useState, useCallback } from "react";
import CartSummary from "../../components/cart/CartSummary";
import CartItem from "../../components/cart/CartItem";
import EmptyItem from "../../components/cart/EmptyItem";
import { useSelector, useDispatch } from "react-redux";
import {
  fetchCart,
  updateCartItemQuantityAPI,
  removeCartItemAPI,
  applyCouponToCartAPI,
  resetCouponStatus,
  resetCart, // Import resetCart
} from "../../store/slices/cartSlice";
import { useNavigate } from "react-router-dom";
import MainLayout from "../../components/layout/MainLayout";
import Spinner from "../../components/common/Spinner";

// --- Selectors ---
const selectCartItems = (state) => state.cart.items || [];
const selectCartUser = (state) => state.cart.user;
const selectCartApiTotal = (state) => state.cart.total || 0;
const selectCartStatus = (state) => state.cart.status;
const selectCartError = (state) => state.cart.error;
const selectCouponStatus = (state) => state.cart.couponStatus;
const selectCouponError = (state) => state.cart.couponError;
const selectCouponAppliedDetails = (state) => state.cart.couponAppliedDetails;

const selectCartSubtotal = (state) => {
  return (state.cart.items || []).reduce((total, item) => {
    const price = item?.book?.sellingPrice || 0;
    const quantity = item?.quantity || 0;
    return total + price * quantity;
  }, 0);
};

const selectCartDiscountAmount = (state) => {
  const couponDetails = selectCouponAppliedDetails(state);
  if (
    couponDetails?.discountAmountCalculated &&
    selectCouponStatus(state) === "succeeded"
  ) {
    return couponDetails.discountAmountCalculated;
  }
  // Nếu không có coupon hoặc apply không thành công, thử suy luận từ total và subtotal
  // CẢNH BÁO: Logic này sẽ sai nếu `total` từ backend đã bao gồm phí ship.
  // Tốt nhất là backend trả về `discountAmount` rõ ràng hoặc `couponDetails` đầy đủ.
  const subtotal = selectCartSubtotal(state);
  const totalFromApi = selectCartApiTotal(state);
  // Giả sử totalFromApi chưa tính shipping, hoặc shipping = 0
  if (selectShippingFee(state) === 0 && totalFromApi < subtotal) {
    return subtotal - totalFromApi;
  }
  return 0;
};

const selectShippingFee = (state) => state.cart.shippingFee || 0; // Hiện tại đang là 0

const selectDisplayTotal = (state) => {
  const subtotal = selectCartSubtotal(state);
  const discount = selectCartDiscountAmount(state);
  const shipping = selectShippingFee(state);
  return Math.max(0, subtotal - discount + shipping);
};
// --- Kết thúc Selectors ---

const CartPage = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const cartItems = useSelector(selectCartItems);
  const subtotal = useSelector(selectCartSubtotal);
  const discountAmount = useSelector(selectCartDiscountAmount);
  const shippingFee = useSelector(selectShippingFee);
  const displayTotal = useSelector(selectDisplayTotal);

  const cartStatus = useSelector(selectCartStatus);
  const cartError = useSelector(selectCartError);

  const couponStatus = useSelector(selectCouponStatus);
  const couponErrorMessageFromStore = useSelector(selectCouponError);

  const [couponCode, setCouponCode] = useState("");

  // Callback để fetch cart, dùng trong useEffect và nút thử lại
  const loadCart = useCallback(() => {
    const token = localStorage.getItem("accessToken");
    if (token) {
      dispatch(fetchCart());
    } else {
      // Nếu không có token, có thể dispatch action để clear local cart state
      // hoặc để UI hiển thị thông báo yêu cầu đăng nhập.
      dispatch(resetCart()); // Xóa dữ liệu giỏ hàng ở client nếu không có token
      console.log("CartPage: User not logged in. Cart state reset.");
    }
  }, [dispatch]);

  useEffect(() => {
    loadCart(); // Gọi khi component mount
  }, [loadCart]); // loadCart chỉ thay đổi nếu dispatch thay đổi (hiếm)

  const handleQuantityChange = (bookId, newQuantity) => {
    const quantityNum = Number(newQuantity);
    if (!isNaN(quantityNum) && quantityNum >= 0) {
      dispatch(updateCartItemQuantityAPI({ bookId, quantity: quantityNum }))
        .unwrap()
        .then(() => {
          dispatch(fetchCart()); // Fetch lại giỏ hàng sau khi update thành công
        });
    }
  };

  const handleRemoveItem = (bookId) => {
    dispatch(removeCartItemAPI(bookId))
      .unwrap()
      .then(() => {
        dispatch(fetchCart());
      });
  };
  const handleApplyCoupon = async () => {
    if (!couponCode.trim()) {
      dispatch(resetCouponStatus());
      alert("Vui lòng nhập mã giảm giá.");
      return;
    }
    dispatch(applyCouponToCartAPI(couponCode))
      .unwrap() // unwrap để vào .then/.catch
      .then(() => {
        setCouponCode(""); // Xóa mã coupon khỏi input nếu thành công
        alert("Áp dụng mã giảm giá thành công!");
      })
      .catch((errorPayload) => {
        // Lỗi đã được set vào couponErrorMessageFromStore bởi extraReducer trong slice
        // alert(errorPayload || "Mã giảm giá không hợp lệ hoặc có lỗi xảy ra.");
        // Không cần alert ở đây nữa vì UI sẽ hiển thị couponErrorMessageFromStore
      });
  };

  const handleProceedToCheckout = () => {
    if (cartItems.length > 0) {
      navigate("/checkout/shipping");
    } else {
      alert("Giỏ hàng của bạn đang trống!");
    }
  };

  // --- Render Logic ---
  const token = localStorage.getItem("accessToken");
  if (!token) {
    return (
      <MainLayout>
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
      </MainLayout>
    );
  }

  if (cartStatus === "loading_fetch" && cartItems.length === 0) {
    return (
      <MainLayout>
        <div className="container mx-auto px-4 py-8 flex justify-center items-center h-64">
          <Spinner />
        </div>
      </MainLayout>
    );
  }

  if (cartStatus === "failed" && cartError && cartItems.length === 0) {
    return (
      <MainLayout>
        <div className="container mx-auto px-4 py-8 text-center text-red-500">
          <p>Lỗi khi tải giỏ hàng: {String(cartError)}</p>
          <button
            onClick={loadCart}
            className="mt-4 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
          >
            Thử lại
          </button>
        </div>
      </MainLayout>
    );
  }

  if (
    cartItems.length === 0 &&
    (cartStatus === "succeeded" || cartStatus === "idle")
  ) {
    return (
      <MainLayout>
        <div className="container mx-auto px-4 py-8">
          <EmptyItem />
        </div>
      </MainLayout>
    );
  }

  return (
    <MainLayout>
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-semibold text-center text-gray-800 mb-8">
          Giỏ hàng của bạn
        </h1>
        {cartStatus.startsWith("loading_") &&
          cartStatus !== "loading_fetch" &&
          cartStatus !== "idle" &&
          cartStatus !== "succeeded" && (
            <div className="text-center py-2 my-2 bg-blue-100 text-blue-700 rounded flex items-center justify-center">
              <Spinner size="sm" className="mr-2" /> Đang cập nhật giỏ hàng...
            </div>
          )}
        {cartStatus === "failed" && cartError && cartItems.length > 0 && (
          <div className="text-center py-2 my-2 bg-red-100 text-red-700 rounded">
            Lỗi cập nhật: {String(cartError)}
          </div>
        )}

        <div className="lg:grid lg:grid-cols-12 lg:gap-8 items-start">
          <section
            aria-labelledby="cart-heading"
            className="lg:col-span-8 bg-white shadow-md rounded-lg p-6"
          >
            <h2 id="cart-heading" className="sr-only">
              Sản phẩm trong giỏ hàng
            </h2>
            {cartItems.length > 0 ? (
              <ul className="divide-y divide-gray-200">
                {cartItems.map((item) => {
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
            ) : (
              cartStatus !== "loading_fetch" &&
              !cartError && (
                <EmptyItem message="Giỏ hàng của bạn hiện đang trống." />
              )
            )}
          </section>

          {cartItems.length > 0 && (
            <section
              aria-labelledby="summary-heading"
              className="lg:col-span-4 mt-8 lg:mt-0 sticky top-20"
            >
              <CartSummary
                subtotal={subtotal}
                discountAmount={discountAmount}
                shippingFee={shippingFee}
                total={displayTotal}
                couponCode={couponCode}
                onCouponCodeChange={(e) => {
                  setCouponCode(e.target.value);
                  if (couponErrorMessageFromStore) {
                    dispatch(resetCouponStatus());
                  }
                }}
                onApplyCoupon={handleApplyCoupon}
                onProceedToCheckout={handleProceedToCheckout}
                couponError={couponErrorMessageFromStore}
                applyingCoupon={couponStatus === "loading"}
              />
            </section>
          )}
        </div>
      </div>
    </MainLayout>
  );
};

export default CartPage;
