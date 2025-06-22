import React, { useState, useEffect, useMemo } from "react";
import { useSelector, useDispatch } from "react-redux";
import { useLocation, useNavigate } from "react-router-dom";
import MainLayout from "../../components/layout/MainLayout";
import Button from "../../components/common/Button";
import Spinner from "../../components/common/Spinner";
import { useAuth } from "../../contexts/AuthContext";
import {
  selectCartItems,
  selectCartSubtotal,
  fetchCart,
  applyCouponToCartAPI,
  resetCouponStatus,
  resetCart as resetCartAction,
} from "../../store/slices/cartSlice";
import {
  createOrderAPI,
  clearCurrentOrder,
  resetOrderStatus,
} from "../../store/slices/orderSlice";

const API_URL =
  process.env.REACT_APP_API_URL_BACKEND || "http://localhost:9999/api";

const OrderReviewPage = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const location = useLocation();
  const { isAuthenticated, loading: authLoading } = useAuth();
  const [isPlacingOrder, setIsPlacingOrder] = useState(false);
  const shippingInfoFromState = location.state?.shippingInfo;
  const paymentMethodFromState =
    location.state?.paymentMethodInfo?.paymentMethod;

  const [couponCodeInput, setCouponCodeInput] = useState("");
  const [pageLoading, setPageLoading] = useState(true);
  const [appliedCouponDetails, setAppliedCouponDetails] = useState(null);

  const cartItems = useSelector(selectCartItems);
  const cartSubtotal = useSelector(selectCartSubtotal);
  const cartCouponApplied = useSelector(
    (state) => state.cart.couponAppliedDetails
  );
  const cartApiStatus = useSelector((state) => state.cart.status);
  const couponApiStatus = useSelector((state) => state.cart.couponStatus);
  const couponApiError = useSelector((state) => state.cart.couponError);

  const orderCreationStatus = useSelector((state) => state.order.status);
  const orderCreationError = useSelector((state) => state.order.error);
  const currentCreatedOrder = useSelector((state) => state.order.currentOrder);

  const shippingFee = 30000;
  const discountAmount = useMemo(() => {
    const couponToUse = appliedCouponDetails || cartCouponApplied;
    if (couponToUse && (couponApiStatus === "succeeded" || !couponCodeInput)) {
      if (typeof couponToUse.discountAmountCalculated === "number") {
        return couponToUse.discountAmountCalculated;
      }
      if (couponToUse.type === "percentage") {
        return (cartSubtotal * couponToUse.value) / 100;
      } else if (couponToUse.type === "fixedAmount") {
        return couponToUse.value;
      }
    }
    return 0;
  }, [
    appliedCouponDetails,
    cartCouponApplied,
    couponApiStatus,
    cartSubtotal,
    couponCodeInput,
  ]);

  const finalTotal = useMemo(() => {
    return Math.max(0, cartSubtotal - discountAmount + shippingFee);
  }, [cartSubtotal, discountAmount, shippingFee]);

  useEffect(() => {
    dispatch(resetOrderStatus());
    dispatch(resetCouponStatus());
    return () => {
      dispatch(clearCurrentOrder());
    };
  }, [dispatch]);

  useEffect(() => {
    if (!authLoading) {
      if (!isAuthenticated) {
        alert("Vui lòng đăng nhập để tiếp tục.");
        navigate("/auth/login", { state: { from: location }, replace: true });
      } else if (!shippingInfoFromState || !paymentMethodFromState) {
        alert("Vui lòng hoàn tất các bước thông tin giao hàng và thanh toán.");
        navigate("/auth/checkout/shipping", { replace: true });
      } else if (cartItems.length === 0 && cartApiStatus !== "loading_fetch") {
        alert("Giỏ hàng của bạn đang trống. Vui lòng thêm sản phẩm.");
        navigate("/");
      } else {
        setPageLoading(false);
      }
    }
  }, [
    isAuthenticated,
    authLoading,
    shippingInfoFromState,
    paymentMethodFromState,
    cartItems.length,
    cartApiStatus,
    navigate,
    location,
  ]);

  useEffect(() => {
    if (
      orderCreationStatus === "succeeded_create" &&
      currentCreatedOrder?.orderId
    ) {
      if (
        currentCreatedOrder.paymentMethod === "PAYOS" &&
        currentCreatedOrder.checkoutUrl
      ) {
        // 👉 Redirect to PayOS
        window.location.href = currentCreatedOrder.checkoutUrl;
      } else {
        // ✅ Redirect to success page (for COD/VNPAY/etc.)
        dispatch(resetCartAction());
        navigate(`/auth/checkout/success/${currentCreatedOrder._id}`, {
          replace: true,
        });
      }
    }
  }, [orderCreationStatus, currentCreatedOrder, navigate, dispatch]);
  const handleApplyCouponOnReview = async () => {
    if (!couponCodeInput.trim()) {
      alert("Vui lòng nhập mã giảm giá.");
      return;
    }
    dispatch(applyCouponToCartAPI(couponCodeInput))
      .unwrap()
      .then((updatedCartWithCoupon) => {
        alert("Áp dụng mã giảm giá thành công!");
        setAppliedCouponDetails(updatedCartWithCoupon.couponDetails || null);
        setCouponCodeInput("");
      })
      .catch(() => {
        setAppliedCouponDetails(null);
      });
  };
  const handlePlaceOrder = () => {
    if (isPlacingOrder) return; // 🛑 Chặn double click
    setIsPlacingOrder(true); // ✅ Đánh dấu đang đặt hàng

    // Validate dữ liệu cơ bản
    if (
      !shippingInfoFromState ||
      !paymentMethodFromState ||
      cartItems.length === 0
    ) {
      alert("Thông tin đơn hàng chưa đầy đủ hoặc giỏ hàng trống.");
      setIsPlacingOrder(false); // ❗ RESET nếu lỗi
      return;
    }

    if (!shippingInfoFromState.address) {
      alert("Địa chỉ giao hàng không hợp lệ. Vui lòng kiểm tra lại.");
      setIsPlacingOrder(false); // ❗ RESET nếu lỗi
      return;
    }

    const validPaymentMethods = ["COD", "VNPAY", "MOMO", "PAYOS"];
    if (!validPaymentMethods.includes(paymentMethodFromState)) {
      alert(`Phương thức thanh toán "${paymentMethodFromState}" không hợp lệ.`);
      setIsPlacingOrder(false); // ❗RESET nếu lỗi
      navigate("/auth/checkout/payment", {
        state: {
          shippingInfo: shippingInfoFromState,
          paymentMethodInfo: { paymentMethod: "" },
        },
      });
      return;
    }

    const orderDetailsToCreate = {
      fullName: shippingInfoFromState.fullName,
      phone: shippingInfoFromState.phone,
      address: shippingInfoFromState.address,
      paymentMethod: paymentMethodFromState.toUpperCase(),
      discountCode:
        (appliedCouponDetails || cartCouponApplied)?.code || undefined,
    };

    console.log("Placing order with details:", orderDetailsToCreate);

    dispatch(createOrderAPI(orderDetailsToCreate));
  };

  // Define valid payment methods
  const validPaymentMethods = ["COD", "VNPAY", "MOMO", "PAYOS"];

  //   // Validate payment method
  //   if (!validPaymentMethods.includes(paymentMethodFromState)) {
  //     console.error(`Invalid payment method: ${paymentMethodFromState}`);
  //     alert(
  //       `Phương thức thanh toán "${paymentMethodFromState}" không hợp lệ. Vui lòng chọn lại.`
  //     );

  //     // Redirect to payment selection
  //     navigate("/auth/checkout/payment", {
  //       state: {
  //         shippingInfo: shippingInfoFromState,
  //         paymentMethodInfo: {
  //           paymentMethod: "", // Reset payment method
  //         },
  //       },
  //     });
  //     return;
  //   }

  //   // Prepare order data
  //   const orderDetailsToCreate = {
  //     fullName: shippingInfoFromState.fullName,
  //     phone: shippingInfoFromState.phone,
  //     address: shippingInfoFromState.address,
  //     paymentMethod: paymentMethodFromState.toUpperCase(),
  //     discountCode:
  //       (appliedCouponDetails || cartCouponApplied)?.code || undefined,
  //   };

  //   console.log("Placing order with details:", orderDetailsToCreate);

  //   // Log for debugging
  //   console.log(
  //     "Payment method being sent:",
  //     orderDetailsToCreate.paymentMethod
  //   );
  //   console.log("Is PAYOS?", orderDetailsToCreate.paymentMethod === "PAYOS");

  //   dispatch(createOrderAPI(orderDetailsToCreate));
  // };
  // if (
  //   authLoading ||
  //   pageLoading ||
  //   (cartApiStatus === "loading_fetch" && cartItems.length === 0)
  // ) {
  //   return (
  //     <div className="container mx-auto px-4 py-8 text-center">
  //       <Spinner /> Đang tải...
  //     </div>
  //   );
  // }

  return (
    <div className="container mx-auto px-4 py-12 max-w-3xl">
      <h1 className="text-3xl font-bold text-center text-gray-800 mb-8">
        Xác nhận đơn hàng
      </h1>

      <div className="bg-white shadow-xl rounded-lg p-6 md:p-8 space-y-6">
        <section>
          <h2 className="text-xl font-semibold text-gray-700 mb-3 border-b pb-2">
            Thông tin giao hàng
          </h2>
          <p>
            <strong>Người nhận:</strong> {shippingInfoFromState?.fullName}
          </p>
          <p>
            <strong>Điện thoại:</strong> {shippingInfoFromState?.phone}
          </p>
          <p>
            <strong>Địa chỉ:</strong> {shippingInfoFromState?.address}
          </p>
          <Button
            variant="link"
            size="sm"
            onClick={() =>
              navigate("/auth/checkout/shipping", {
                state: { shippingInfo: shippingInfoFromState },
              })
            }
            className="text-blue-600 hover:underline mt-2"
          >
            Thay đổi
          </Button>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-gray-700 mb-3 border-b pb-2">
            Phương thức thanh toán
          </h2>
          <p>
            {paymentMethodFromState === "COD"
              ? "Thanh toán khi nhận hàng (COD)"
              : paymentMethodFromState}
          </p>
          <Button
            variant="link"
            size="sm"
            onClick={() =>
              navigate("/auth/checkout/payment", {
                state: {
                  shippingInfo: shippingInfoFromState,
                  paymentMethodInfo: {
                    paymentMethod: paymentMethodFromState,
                  },
                },
              })
            }
            className="text-blue-600 hover:underline mt-2"
          >
            Thay đổi
          </Button>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-gray-700 mb-3 border-b pb-2">
            Sản phẩm
          </h2>
          {cartItems.map((item) => (
            <div
              key={item.book?._id}
              className="flex justify-between items-center py-3 border-b last:border-b-0"
            >
              <div>
                <p className="font-medium">{item.book?.title}</p>
                <p className="text-sm text-gray-500">
                  Số lượng: {item.quantity}
                </p>
              </div>
              <p className="text-gray-700">
                {(item.book?.sellingPrice * item.quantity).toLocaleString(
                  "vi-VN"
                )}
                đ
              </p>
            </div>
          ))}
        </section>

        <section>
          <h2 className="text-xl font-semibold text-gray-700 mb-3 border-b pb-2">
            Mã giảm giá
          </h2>
          {(appliedCouponDetails || cartCouponApplied) &&
          couponApiStatus !== "loading" &&
          couponApiStatus !== "failed" ? (
            <div className="mb-2">
              <p className="text-green-600">
                Đã áp dụng mã:{" "}
                <strong>
                  {(appliedCouponDetails || cartCouponApplied).code}
                </strong>
              </p>
              <p className="text-sm text-gray-600">
                Giảm: {discountAmount.toLocaleString("vi-VN")}đ
              </p>
              <Button
                variant="link"
                size="sm"
                onClick={() => {
                  setAppliedCouponDetails(null);
                  dispatch(resetCouponStatus());
                }}
                className="text-red-500 hover:underline text-xs"
              >
                Xóa mã
              </Button>
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <input
                type="text"
                placeholder="Nhập mã giảm giá"
                value={couponCodeInput}
                onChange={(e) => {
                  setCouponCodeInput(e.target.value);
                  if (couponApiError) dispatch(resetCouponStatus());
                }}
                className="flex-grow p-2 border rounded"
                disabled={
                  couponApiStatus === "succeeded" &&
                  (appliedCouponDetails || cartCouponApplied)
                }
              />
              <Button
                onClick={handleApplyCouponOnReview}
                disabled={
                  couponApiStatus === "loading" || !couponCodeInput.trim()
                }
                isLoading={couponApiStatus === "loading"}
              >
                Áp dụng
              </Button>
            </div>
          )}
          {couponApiStatus === "failed" && couponApiError && (
            <p className="text-red-500 text-sm mt-1">
              {String(couponApiError)}
            </p>
          )}
        </section>

        <section>
          <h2 className="text-xl font-semibold text-gray-700 mb-3 border-b pb-2">
            Tóm tắt chi phí
          </h2>
          <div className="space-y-1 text-gray-700">
            <div className="flex justify-between">
              <span>Tạm tính:</span>
              <span>{cartSubtotal.toLocaleString("vi-VN")}đ</span>
            </div>
            {discountAmount > 0 && (
              <div className="flex justify-between text-green-600">
                <span>Giảm giá:</span>
                <span>-{discountAmount.toLocaleString("vi-VN")}đ</span>
              </div>
            )}
            <div className="flex justify-between">
              <span>Phí vận chuyển:</span>
              <span>{shippingFee.toLocaleString("vi-VN")}đ</span>
            </div>
            <div className="flex justify-between text-xl font-bold text-gray-800 pt-2 border-t mt-2">
              <span>Tổng cộng:</span>
              <span>{finalTotal.toLocaleString("vi-VN")}đ</span>
            </div>
          </div>
        </section>

        {orderCreationStatus === "failed_create" && orderCreationError && (
          <p className="text-red-600 text-center mt-4 p-3 bg-red-50 rounded-md">
            Lỗi tạo đơn hàng: {orderCreationError}
          </p>
        )}

        <Button
          onClick={handlePlaceOrder}
          disabled={
            orderCreationStatus === "loading_create" || cartItems.length === 0
          }
          className="w-full !mt-8 py-3 text-lg"
          variant="primary"
        >
          {orderCreationStatus === "loading_create" ? (
            <Spinner />
          ) : (
            "Hoàn tất đặt hàng"
          )}
        </Button>
      </div>
    </div>
  );
};

export default OrderReviewPage;
