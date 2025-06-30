// Shipping configuration constants
export const SHIPPING_CONFIG = {
    FREE_SHIPPING_THRESHOLD: 200000, // 200k VND
    STANDARD_SHIPPING_FEE: 30000, // 30k VND
};

// Helper functions for shipping calculations
export const calculateShippingFee = (subtotal) => {
    return subtotal >= SHIPPING_CONFIG.FREE_SHIPPING_THRESHOLD
        ? 0
        : SHIPPING_CONFIG.STANDARD_SHIPPING_FEE;
};

export const formatShippingMessage = (subtotal) => {
    if (subtotal >= SHIPPING_CONFIG.FREE_SHIPPING_THRESHOLD) {
        return "🎉 Bạn được miễn phí vận chuyển!";
    }

    const remaining = SHIPPING_CONFIG.FREE_SHIPPING_THRESHOLD - subtotal;
    return `Mua thêm ${remaining.toLocaleString("vi-VN")}đ để được freeship!`;
};

export default SHIPPING_CONFIG;