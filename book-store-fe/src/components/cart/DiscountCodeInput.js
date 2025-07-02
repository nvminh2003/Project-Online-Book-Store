import React, { useState } from "react";
import { Icon } from "@iconify/react";
import Button from "../common/Button";
import { useCart } from "../../contexts/CartContext";
import { useToast } from "../../contexts/ToastContext";

const DiscountCodeInput = ({ onSuccess }) => {
  const [couponCode, setCouponCode] = useState("");
  const [validationMessage, setValidationMessage] = useState("");
  const [isValidating, setIsValidating] = useState(false);
  const { showSuccess, showError } = useToast();

  const {
    applyCoupon,
    validateCoupon,
    removeCoupon,
    applyingCoupon,
    couponError,
    hasActiveCoupon,
    cart,
  } = useCart();

  const handleValidateCode = async () => {
    if (!couponCode.trim()) {
      setValidationMessage("Please enter a discount code");
      return;
    }

    setIsValidating(true);
    setValidationMessage("");

    const result = await validateCoupon(couponCode.trim());

    if (result.success) {
      const discountAmount = result.data.validation.discountAmount;
      setValidationMessage(
        `✓ Valid! You'll save ${discountAmount.toLocaleString("vi-VN")}đ`
      );
    } else {
      setValidationMessage(result.message);
    }

    setIsValidating(false);
  };

  const handleApplyCode = async () => {
    if (!couponCode.trim()) {
      setValidationMessage("Please enter a discount code");
      showError("Vui lòng nhập mã giảm giá");
      return;
    }

    const result = await applyCoupon(couponCode.trim());

    if (result.success) {
      setCouponCode("");
      setValidationMessage("");
      showSuccess(
        `Áp dụng mã giảm giá thành công! Tiết kiệm ${result.discountAmount?.toLocaleString(
          "vi-VN"
        )}đ`
      );
      if (onSuccess) onSuccess();
    } else {
      showError(result.message || "Mã giảm giá không hợp lệ");
    }
  };

  const handleRemoveCode = async () => {
    const result = await removeCoupon();
    if (result.success) {
      setCouponCode("");
      setValidationMessage("");
      showSuccess("Đã hủy mã giảm giá");
    } else {
      showError(result.message || "Không thể hủy mã giảm giá");
    }
  };

  const currentCoupon = cart?.couponDetails;

  return (
    <div className="space-y-4">
      {/* Current Applied Coupon */}
      {hasActiveCoupon && currentCoupon && (
        <div className="bg-green-50 border border-green-200 rounded-lg p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <Icon
                icon="mdi:ticket-percent"
                width="20"
                className="text-green-600 mr-2"
              />
              <div>
                <p className="text-green-800 font-medium">
                  {currentCoupon.code} applied
                </p>
                <p className="text-green-600 text-sm">
                  {currentCoupon.description}
                </p>
                <p className="text-green-600 text-sm">
                  Discount:{" "}
                  {currentCoupon.discountAmountCalculated?.toLocaleString(
                    "vi-VN"
                  )}
                  đ
                </p>
              </div>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={handleRemoveCode}
              disabled={applyingCoupon}
              className="text-green-600 hover:text-green-700"
            >
              <Icon icon="mdi:close" width="16" />
            </Button>
          </div>
        </div>
      )}

      {/* Discount Code Input */}
      {!hasActiveCoupon && (
        <div className="space-y-2">
          <label className="block text-sm font-medium text-gray-700">
            Discount Code
          </label>
          <div className="flex space-x-2">
            <div className="flex-1">
              <input
                type="text"
                value={couponCode}
                onChange={(e) => {
                  setCouponCode(e.target.value.toUpperCase());
                  setValidationMessage("");
                }}
                placeholder="Enter discount code"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                disabled={applyingCoupon}
                onKeyPress={(e) => {
                  if (e.key === "Enter") {
                    handleValidateCode();
                  }
                }}
              />
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={handleValidateCode}
              disabled={!couponCode.trim() || isValidating || applyingCoupon}
              isLoading={isValidating}
            >
              <Icon icon="mdi:check" width="16" />
            </Button>
            <Button
              onClick={handleApplyCode}
              disabled={!couponCode.trim() || applyingCoupon}
              isLoading={applyingCoupon}
              size="sm"
            >
              Apply
            </Button>
          </div>

          {/* Validation/Error Messages */}
          {validationMessage && (
            <p
              className={`text-sm ${
                validationMessage.startsWith("✓")
                  ? "text-green-600"
                  : "text-red-600"
              }`}
            >
              {validationMessage}
            </p>
          )}

          {couponError && <p className="text-sm text-red-600">{couponError}</p>}
        </div>
      )}
    </div>
  );
};

export default DiscountCodeInput;
