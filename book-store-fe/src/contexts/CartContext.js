import React, {
    createContext,
    useState,
    useContext,
    useEffect,
    useMemo,
    useCallback,
} from "react";
import {
    fetchCartAPI,
    addItemToCartAPI,
    removeCartItemAPI,
    updateCartItemQuantityAPI,
    clearCartAPI,
    applyCouponToCartAPI,
} from "../services/cartService";
import { useAuth } from "./AuthContext";

// 1. Tạo Context
const CartContext = createContext();

// 2. Tạo Provider
export const CartProvider = ({ children }) => {
    const [cart, setCart] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [applyingCoupon, setApplyingCoupon] = useState(false);
    const { isAuthenticated } = useAuth();

    // Hàm fetch giỏ hàng
    const fetchCart = useCallback(async () => {
        if (!isAuthenticated) {
            setCart(null); // Xóa giỏ hàng nếu không đăng nhập
            return;
        }
        setLoading(true);
        setError(null);
        try {
            const res = await fetchCartAPI();
            setCart(res.data.data);
        } catch (err) {
            setError(
                err?.response?.data?.message || err.message || "Failed to fetch cart"
            );
            setCart(null); // Đặt lại giỏ hàng khi có lỗi
        } finally {
            setLoading(false);
        }
    }, [isAuthenticated]);

    // Tự động fetch giỏ hàng khi trạng thái đăng nhập thay đổi
    useEffect(() => {
        fetchCart();
    }, [fetchCart]);

    // Hàm thêm sản phẩm vào giỏ hàng
    const addToCart = useCallback(async (bookId, quantity) => {
        setLoading(true);
        setError(null);
        try {
            const res = await addItemToCartAPI(bookId, quantity);
            setCart(res.data.data);
            return { success: true, data: res.data.data }; // Trả về kết quả thành công
        } catch (err) {
            const message =
                err?.response?.data?.message || err.message || "Failed to add to cart";
            setError(message);
            return { success: false, message }; // Trả về kết quả thất bại
        } finally {
            setLoading(false);
        }
    }, []);

    // Hàm cập nhật số lượng
    const updateQuantity = useCallback(async (bookId, quantity) => {
        setError(null);
        try {
            const res = await updateCartItemQuantityAPI(bookId, quantity);
            setCart(res.data.data);
            return { success: true }; // Trả về kết quả thành công
        } catch (err) {
            const message =
                err?.response?.data?.message ||
                err.message ||
                "Failed to update quantity";
            setError(message);
            return { success: false, message }; // Trả về kết quả thất bại
        }
    }, []);

    // Hàm xóa sản phẩm
    const removeFromCart = useCallback(async (bookId) => {
        setError(null);
        try {
            const res = await removeCartItemAPI(bookId);
            setCart(res.data.data);
            return { success: true }; // Trả về kết quả thành công
        } catch (err) {
            const message =
                err?.response?.data?.message || err.message || "Failed to remove item";
            setError(message);
            return { success: false, message }; // Trả về kết quả thất bại
        }
    }, []);

    // Hàm xóa toàn bộ giỏ hàng
    const clearCart = useCallback(async () => {
        setLoading(true);
        setError(null);
        try {
            await clearCartAPI();
            setCart({ items: [], total: 0, couponDetails: null }); // Cập nhật state ngay lập tức
            return { success: true }; // Trả về kết quả thành công
        } catch (err) {
            const message =
                err?.response?.data?.message || err.message || "Failed to clear cart";
            setError(message);
            return { success: false, message }; // Trả về kết quả thất bại
        } finally {
            setLoading(false);
        }
    }, []);

    // Hàm áp dụng coupon
    const applyCoupon = useCallback(async (couponCode) => {
        setApplyingCoupon(true);
        setError(null);
        try {
            const res = await applyCouponToCartAPI(couponCode);
            setCart(res.data.data);
            return { success: true }; // Trả về kết quả thành công
        } catch (err) {
            const message =
                err?.response?.data?.message || err.message || "Failed to apply coupon";
            setError(message);
            return { success: false, message }; // Trả về kết quả thất bại
        } finally {
            setApplyingCoupon(false);
        }
    }, []);

    const processedCart = useMemo(() => {
        if (!cart || !cart.items) {
            return cart;
        }
        const subtotal = cart.items.reduce((total, item) => {
            const price = item.book?.sellingPrice || 0;
            const quantity = item.quantity || 0;
            return total + price * quantity;
        }, 0);
        return {
            ...cart,
            subtotal: subtotal,
        };
    }, [cart]);

    // Tính toán tổng số lượng sản phẩm trong giỏ hàng
    const cartItemCount = useMemo(() => {
        if (!cart || !cart.items) return 0;
        return cart.items.reduce((total, item) => total + (item.quantity || 0), 0);
    }, [cart]);

    // Giá trị cung cấp bởi Context
    const value = {
        cart: processedCart,
        loading,
        error,
        applyingCoupon,
        fetchCart,
        addToCart,
        updateQuantity,
        removeFromCart,
        clearCart,
        applyCoupon,
        cartItemCount,
        setCart, // Cung cấp setCart để cập nhật trực tiếp nếu cần
    };

    return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
};

// 3. Tạo custom hook để sử dụng Context
export const useCart = () => {
    const context = useContext(CartContext);
    if (context === undefined) {
        throw new Error("useCart must be used within a CartProvider");
    }
    return context;
};