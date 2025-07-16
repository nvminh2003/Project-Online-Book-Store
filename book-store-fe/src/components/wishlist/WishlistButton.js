import React, { useState } from "react";
import { useWishlist } from "../../contexts/WishlistContext";
import { useAuth } from "../../contexts/AuthContext";
import Button from "../common/Button";
import { Icon } from "@iconify/react";

const WishlistButton = ({ bookId, className = "", variant = "default", onRequireLogin, onSuccessAdd, onSuccessRemove }) => {
  const {
    addToWishlist,
    removeFromWishlist,
    wishlistItems,
    loading,
    fetchWishlist,
  } = useWishlist();
  const { user } = useAuth();
  const [actionLoading, setActionLoading] = useState(false);

  // Hide wishlist button for admin users
  const isAdmin = user?.role === 'superadmin' || user?.role === 'admindev' || user?.role === 'adminbusiness';
  if (isAdmin) {
    return null;
  }

  // Check wishlist status from local context only
  const inWishlist = wishlistItems.some(
    (item) => item.book && item.book._id === bookId
  );

  const handleToggleWishlist = async (e) => {
    e?.stopPropagation && e.stopPropagation();
    const token = localStorage.getItem("accessToken");
    if (!token) {
      if (onRequireLogin) {
        onRequireLogin();
      }
      return;
    }
    try {
      setActionLoading(true);
      if (inWishlist) {
        await removeFromWishlist(bookId);
        if (onSuccessRemove) onSuccessRemove();
      } else {
        await addToWishlist(bookId);
        await fetchWishlist();
        if (onSuccessAdd) onSuccessAdd();
      }
    } catch (err) {
      console.error("Failed to toggle wishlist:", err);
    } finally {
      setActionLoading(false);
    }
  };

  // Icon variant for different UI styles
  if (variant === "icon-only") {
    return (
      <button
        onClick={handleToggleWishlist}
        disabled={loading || actionLoading}
        className={`bg-white border border-blue-500 text-blue-600 p-3 rounded-full hover:bg-blue-100 hover:scale-110 hover:shadow-xl shadow-lg flex items-center justify-center transition-all duration-200 ${inWishlist ? "!border-red-500 !text-red-500 hover:!bg-red-50" : ""
          } ${className}`}
        title={
          inWishlist
            ? "Xóa khỏi danh sách yêu thích"
            : "Thêm vào danh sách yêu thích"
        }
      >
        {actionLoading ? (
          <Icon
            icon="mdi:loading"
            width="20"
            height="20"
            className="animate-spin"
          />
        ) : (
          <Icon
            icon={inWishlist ? "mdi:heart" : "mdi:heart-outline"}
            width="20"
            height="20"
            color={inWishlist ? "#ef4444" : "#2563eb"}
          />
        )}
      </button>
    );
  }

  return (
    <Button
      variant={inWishlist ? "primary" : "outline"}
      onClick={handleToggleWishlist}
      disabled={loading || actionLoading}
      className={`group flex items-center space-x-2 transition-all duration-200 ${inWishlist
        ? "bg-red-500 hover:bg-red-600 text-white border-red-500"
        : "border border-blue-500 text-blue-500 hover:border-blue-600 hover:text-blue-600"
        } ${className}`}
    >
      {actionLoading ? (
        <Icon icon="mdi:loading" className="h-5 w-5 animate-spin" />
      ) : (
        <Icon
          icon={inWishlist ? "mdi:heart" : "mdi:heart-outline"}
          className="h-5 w-5"
          color={inWishlist ? "white" : "#2563eb"} // #2563eb là blue-600
        />
      )}
      <span className="group-hover:text-yellow-300">
        {actionLoading
          ? "Đang xử lý..."
          : inWishlist
            ? "Đã yêu thích"
            : "Thêm vào yêu thích"}
      </span>
    </Button>
  );
};

export default WishlistButton;
