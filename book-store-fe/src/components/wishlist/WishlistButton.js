import React, { useState, useEffect } from "react";
import { useWishlist } from "../../contexts/WishlistContext";
import Button from "../common/Button";
import { Icon } from "@iconify/react";

const WishlistButton = ({ bookId, className = "", variant = "default" }) => {
  const {
    addToWishlist,
    removeFromWishlist,
    isInWishlist,
    loading,
    wishlistItems,
    fetchWishlist,
  } = useWishlist();
  const [inWishlist, setInWishlist] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);

  useEffect(() => {
    checkWishlistStatus();
  }, [bookId, wishlistItems]);

  const checkWishlistStatus = async () => {
    try {
      // First check from local state
      const localCheck = wishlistItems.some(
        (item) => item.book && item.book._id === bookId
      );

      if (localCheck) {
        setInWishlist(true);
      } else {
        // Fallback to API check
        const result = await isInWishlist(bookId);
        setInWishlist(result);
      }
    } catch (err) {
      console.error("Failed to check wishlist status:", err);
    }
  };

  const handleToggleWishlist = async () => {
    try {
      setActionLoading(true);

      if (inWishlist) {
        await removeFromWishlist(bookId);
        setInWishlist(false);
      } else {
        await addToWishlist(bookId);
        setInWishlist(true);
        // Refresh wishlist to update header count
        await fetchWishlist();
      }
    } catch (err) {
      console.error("Failed to toggle wishlist:", err);
      // Revert state on error
      setInWishlist(!inWishlist);
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
        className={`bg-white border border-blue-500 text-blue-600 p-3 rounded-full hover:bg-blue-100 hover:scale-110 hover:shadow-xl shadow-lg flex items-center justify-center transition-all duration-200 ${
          inWishlist ? "!border-red-500 !text-red-500 hover:!bg-red-50" : ""
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
            width="24"
            height="24"
            className="animate-spin"
          />
        ) : (
          <Icon
            icon={inWishlist ? "mdi:heart" : "mdi:heart-outline"}
            width="24"
            height="24"
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
      className={`flex items-center space-x-2 transition-all duration-200 ${
        inWishlist
          ? "bg-red-500 hover:bg-red-600 text-white border-red-500"
          : "border-gray-300 hover:border-red-300 hover:text-red-500"
      } ${className}`}
    >
      {actionLoading ? (
        <Icon icon="mdi:loading" className="h-5 w-5 animate-spin" />
      ) : (
        <Icon
          icon={inWishlist ? "mdi:heart" : "mdi:heart-outline"}
          className="h-5 w-5"
        />
      )}
      <span>
        {actionLoading
          ? "Processing..."
          : inWishlist
          ? "In Wishlist"
          : "Add to Wishlist"}
      </span>
    </Button>
  );
};

export default WishlistButton;
