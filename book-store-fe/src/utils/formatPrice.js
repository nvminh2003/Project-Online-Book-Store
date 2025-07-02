// Utility function to format price to Vietnamese currency format
export const formatPrice = (price) => {
    if (price === null || price === undefined || isNaN(price)) {
        return "N/A";
    }

    // Convert to number if it's a string
    const numPrice = typeof price === "string" ? parseFloat(price) : price;

    // Format with Vietnamese currency (VND)
    return new Intl.NumberFormat("vi-VN", {
        style: "currency",
        currency: "VND",
        minimumFractionDigits: 0,
        maximumFractionDigits: 0,
    }).format(numPrice);
};

// Alternative simple format without currency symbol
export const formatPriceSimple = (price) => {
    if (price === null || price === undefined || isNaN(price)) {
        return "N/A";
    }

    const numPrice = typeof price === "string" ? parseFloat(price) : price;

    return new Intl.NumberFormat("vi-VN").format(numPrice) + " đ";
};

// Export default
export default formatPrice;