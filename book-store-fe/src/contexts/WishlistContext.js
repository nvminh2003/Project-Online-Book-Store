import React, {
  createContext,
  useContext,
  useState,
  useCallback,
  useEffect,
} from "react";
import wishlistService from "../services/wishlistService";
import { useAuth } from "./AuthContext";
import { useCart } from "./CartContext";

const WishlistContext = createContext();

export const useWishlist = () => {
  const context = useContext(WishlistContext);
  if (!context) {
    throw new Error("useWishlist must be used within a WishlistProvider");
  }
  return context;
};

export const WishlistProvider = ({ children }) => {
  const [wishlistItems, setWishlistItems] = useState([]);
  const [wishlistCount, setWishlistCount] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const { isAuthenticated } = useAuth();
  const { fetchCart } = useCart();

  // Auto-fetch wishlist when user is authenticated
  useEffect(() => {
    if (isAuthenticated) {
      fetchWishlist();
    } else {
      // Clear wishlist data when user logs out
      setWishlistItems([]);
      setWishlistCount(0);
    }
  }, [isAuthenticated]); // Remove fetchWishlist from dependencies to avoid circular reference

  // Fetch wishlist
  const fetchWishlist = useCallback(
    async (params = {}) => {
      if (!isAuthenticated) return;

      try {
        setLoading(true);
        setError(null);
        const response = await wishlistService.getWishlist(params);

        // console.log("Wishlist response:", response); // Debug log

        // The backend now returns books as an array of {_id, book: bookData, dateAdded}
        const books = response.data?.books || [];

        // Handle both old and new data formats
        const wishlistItems = books.map((item, index) => {
          // Check if item is already in new format (has book and dateAdded properties)
          if (item.book && item.dateAdded) {
            return item; // Already correct format
          } else {
            // Old format - item is the book object directly
            return {
              _id: `${item._id}-${Date.now()}-${index}`, // Generate unique ID for wishlist item
              book: item,
              dateAdded: new Date().toISOString(), // Use current date if not available
            };
          }
        });

        setWishlistItems(wishlistItems);
        setWishlistCount(response.data?.statistics?.totalBooks || books.length);
        return response;
      } catch (err) {
        setError(err.response?.data?.message || "Failed to fetch wishlist");
        console.error("Fetch wishlist error:", err);
      } finally {
        setLoading(false);
      }
    },
    [isAuthenticated]
  );

  // Add to wishlist
  const addToWishlist = useCallback(
    async (bookId) => {
      if (!isAuthenticated) {
        return;
      }
      try {
        setLoading(true);
        const response = await wishlistService.addToWishlist(bookId);
        setWishlistCount(response.data.totalWishlistItems || wishlistCount + 1);
        setTimeout(() => {
          fetchWishlist();
        }, 100);
        return response;
      } catch (err) {
        const errorMessage =
          err.response?.data?.message || "Failed to add to wishlist";
        throw new Error(errorMessage);
      } finally {
        setLoading(false);
      }
    },
    [isAuthenticated, wishlistCount, fetchWishlist]
  );

  // Remove from wishlist
  const removeFromWishlist = useCallback(
    async (bookId) => {
      if (!isAuthenticated) return;
      try {
        setLoading(true);
        const response = await wishlistService.removeFromWishlist(bookId);
        setWishlistItems((prevItems) =>
          prevItems.filter((item) => item.book?._id !== bookId)
        );
        setWishlistCount((prevCount) => Math.max(0, prevCount - 1));
        return response;
      } catch (err) {
        console.error("Remove from wishlist error:", err);
        throw new Error(err.response?.data?.message || "Failed to remove from wishlist");
      } finally {
        setLoading(false);
      }
    },
    [isAuthenticated]
  );

  // Move to cart
  const moveToCart = useCallback(
    async (bookId, quantity = 1) => {
      if (!isAuthenticated) return;
      try {
        setLoading(true);
        const response = await wishlistService.moveToCart(bookId, quantity);
        setWishlistItems((prevItems) =>
          prevItems.filter((item) => item.book?._id !== bookId)
        );
        setWishlistCount((prevCount) => Math.max(0, prevCount - 1));
        if (fetchCart) {
          await fetchCart();
        }
        return response;
      } catch (err) {
        const errorMessage =
          err.response?.data?.message || "Failed to move to cart";
        throw new Error(errorMessage);
      } finally {
        setLoading(false);
      }
    },
    [isAuthenticated, fetchCart]
  );

  // Check if book is in wishlist
  const isInWishlist = useCallback(
    async (bookId) => {
      if (!isAuthenticated) return false;

      try {
        const response = await wishlistService.checkBookInWishlist(bookId);
        return response.data.isInWishlist;
      } catch (err) {
        console.error("Check wishlist error:", err);
        return false;
      }
    },
    [isAuthenticated]
  );

  // Clear wishlist
  const clearWishlist = useCallback(async () => {
    if (!isAuthenticated) return;

    try {
      setLoading(true);
      await wishlistService.clearWishlist();
      setWishlistItems([]);
      setWishlistCount(0);
    } catch (err) {
      setError(err.response?.data?.message || "Failed to clear wishlist");
    } finally {
      setLoading(false);
    }
  }, [isAuthenticated]);

  // Remove multiple from wishlist
  const removeMultipleFromWishlist = useCallback(
    async (bookIds) => {
      if (!isAuthenticated) return;
      try {
        setLoading(true);
        const response = await wishlistService.removeMultipleFromWishlist(bookIds);
        setWishlistItems((prevItems) =>
          prevItems.filter((item) => !bookIds.includes(item.book?._id))
        );
        setWishlistCount((prevCount) => Math.max(0, prevCount - bookIds.length));
        return response;
      } catch (err) {
        console.error("Remove multiple from wishlist error:", err);
        throw new Error(err.response?.data?.message || "Failed to remove selected from wishlist");
      } finally {
        setLoading(false);
      }
    },
    [isAuthenticated]
  );

  const value = {
    wishlistItems,
    wishlistCount,
    loading,
    error,
    fetchWishlist,
    addToWishlist,
    removeFromWishlist,
    moveToCart,
    isInWishlist,
    clearWishlist,
    setError,
    removeMultipleFromWishlist,
  };

  return (
    <WishlistContext.Provider value={value}>
      {children}
    </WishlistContext.Provider>
  );
};
