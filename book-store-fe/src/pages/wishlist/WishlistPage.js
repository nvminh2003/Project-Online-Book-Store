import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useWishlist } from "../../contexts/WishlistContext";
import { useCart } from "../../contexts/CartContext";
import Button from "../../components/common/Button";
import Spinner from "../../components/common/Spinner";
import Pagination from "../../components/common/Pagination";
// import WishlistFilters from "../../components/wishlist/WishlistFilters";
import { formatPrice } from "../../utils/formatPrice";
import { Icon } from "@iconify/react";
import wishlistService from "../../services/wishlistService";
import { notifySuccess, notifyError } from "../../components/common/ToastManager";

const WishlistPage = () => {
  const navigate = useNavigate();
  const {
    wishlistItems,
    loading,
    error,
    fetchWishlist,
    removeFromWishlist,
    moveToCart,
    removeMultipleFromWishlist,
  } = useWishlist();
  const { addToCart, fetchCart } = useCart();

  const [pagination, setPagination] = useState({
    page: 1,
    limit: 10,
    totalPages: 1,
    totalItems: 0,
  });

  const [filters, setFilters] = useState({
    filterAvailable: false,
    sortBy: "dateAdded",
  });

  const [selectedItems, setSelectedItems] = useState([]);
  const [actionLoading, setActionLoading] = useState({});

  useEffect(() => {
    loadWishlist();
  }, [pagination.page, filters]);

  const loadWishlist = async () => {
    try {
      const response = await fetchWishlist({
        page: pagination.page,
        limit: pagination.limit,
        ...filters,
      });

      if (response?.data?.pagination) {
        setPagination((prev) => ({
          ...prev,
          totalPages: response.data.pagination.totalPages,
          totalItems: response.data.pagination.totalItems,
        }));
      }
    } catch (error) {
      console.error("Failed to load wishlist:", error);
    }
  };

  const handlePageChange = (page) => {
    setPagination((prev) => ({ ...prev, page }));
  };

  const handleSelectItem = (bookId) => {
    if (!bookId) return;
    setSelectedItems((prev) =>
      prev.includes(bookId)
        ? prev.filter((id) => id !== bookId)
        : [...prev, bookId]
    );
  };

  const handleSelectAll = () => {
    if (selectedItems.length === wishlistItems.length) {
      setSelectedItems([]);
    } else {
      setSelectedItems(
        wishlistItems
          .filter((item) => item.book && item.book._id)
          .map((item) => item.book._id)
      );
    }
  };

  const handleRemoveSelected = async () => {
    if (selectedItems.length === 0) return;

    setActionLoading((prev) => ({ ...prev, removeSelected: true }));
    try {
      await removeMultipleFromWishlist(selectedItems);
      setSelectedItems([]);
      await loadWishlist();
    } catch (error) {
      console.error("Failed to remove selected items:", error);
    } finally {
      setActionLoading((prev) => ({ ...prev, removeSelected: false }));
    }
  };

  const handleMoveToCart = async (bookId) => {
    if (!bookId) return;
    setActionLoading((prev) => ({ ...prev, [bookId]: true }));
    try {
      await moveToCart(bookId);
      await loadWishlist();
      await fetchCart();
    } catch (error) {
      // Hiển thị lỗi cụ thể từ BE cho người dùng
      notifyError(error.message || "Không thể chuyển vào giỏ hàng");
    } finally {
      setActionLoading((prev) => ({ ...prev, [bookId]: false }));
    }
  };

  const handleMoveSelectedToCart = async () => {
    if (selectedItems.length === 0) return;
    // Lọc sản phẩm hết hàng
    const selectedBooks = wishlistItems.filter(item => selectedItems.includes(item.book?._id));
    const outOfStock = selectedBooks.filter(item => !item.book || item.book.stockQuantity <= 0);
    const inStock = selectedBooks.filter(item => item.book && item.book.stockQuantity > 0);

    if (outOfStock.length === selectedBooks.length) {
      notifyError("Tất cả sản phẩm đã hết hàng và không thể thêm vào giỏ!");
      return;
    }
    if (outOfStock.length > 0) {
      notifyError(`Không thể thêm vào giỏ các sản phẩm đã hết hàng: ${outOfStock.map(i => i.book?.title).join(", ")}`);
    }
    if (inStock.length === 0) return;
    setActionLoading((prev) => ({ ...prev, moveSelectedToCart: true }));
    try {
      const res = await wishlistService.moveMultipleToCart(inStock.map(i => i.book._id));
      if (res.status === "Success" || res.status === "Warning") {
        notifySuccess(res.message || "Đã chuyển vào giỏ hàng");
        setSelectedItems([]);
        await loadWishlist();
        await fetchCart();
        if (typeof window !== 'undefined' && window.location) {
          window.dispatchEvent(new Event('cart-updated'));
        }
      } else {
        notifyError(res.message || "Chuyển vào giỏ hàng thất bại");
      }
    } catch (err) {
      notifyError(err.message || "Chuyển vào giỏ hàng thất bại");
    } finally {
      setActionLoading((prev) => ({ ...prev, moveSelectedToCart: false }));
    }
  };

  const handleProductClick = (bookId) => {
    if (!bookId) return;
    navigate(`/detailbook/${bookId}`); // Fixed: using correct route
  };

  if (loading) {
    return (
      <div className="max-w-[1400px] mx-auto px-4 py-8">
        <div className="flex justify-center items-center min-h-[400px]">
          <Spinner size="lg" />
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-[1400px] mx-auto px-4 py-8">
        <div className="text-center text-red-600">
          <p className="text-lg mb-4">Failed to load wishlist</p>
          <Button onClick={loadWishlist}>Try Again</Button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-[1400px] mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Danh sách sản phẩm yêu thích</h1>
        <Button
          variant="outline"
          onClick={() => navigate("/getbook")} // Fixed: using correct route
          className="flex items-center gap-2 hover:bg-gray-50 transition-colors"
        >
          <Icon icon="mdi:arrow-left" className="w-4 h-4" />
          Tiếp tục mua sắm
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* <div className="lg:col-span-1">
          <WishlistFilters
            filters={filters}
            onFiltersChange={handleFilterChange}
          />
        </div> */}

        <div className="lg:col-span-3">
          {wishlistItems.filter((item) => item.book && item.book._id).length ===
            0 ? (
            <div className="text-center py-16 bg-white rounded-xl shadow-lg border border-gray-100">
              <div className="max-w-md mx-auto">
                <Icon
                  icon="mdi:heart-outline"
                  className="w-20 h-20 mx-auto text-gray-300 mb-6"
                />
                <h3 className="text-2xl font-semibold text-gray-700 mb-3">
                  {wishlistItems.length === 0
                    ? "Your wishlist is empty"
                    : "No valid items in wishlist"}
                </h3>
                <p className="text-gray-500 mb-8 text-lg">
                  {wishlistItems.length === 0
                    ? "Start adding books you love to your wishlist"
                    : "All items in your wishlist are no longer available"}
                </p>
                <Button
                  onClick={() => navigate("/getbook")}
                  className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-3 rounded-lg text-lg font-medium transition-colors shadow-md hover:shadow-lg"
                >
                  Browse Books
                </Button>
              </div>
            </div>
          ) : (
            <>
              <div className="bg-white rounded-xl shadow-lg border border-gray-100 overflow-hidden">
                <div className="p-6 border-b border-gray-100 bg-gray-50">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <label className="flex items-center cursor-pointer">
                        <input
                          type="checkbox"
                          checked={
                            selectedItems.length ===
                            wishlistItems.filter(
                              (item) => item.book && item.book._id
                            ).length &&
                            wishlistItems.filter(
                              (item) => item.book && item.book._id
                            ).length > 0
                          }
                          onChange={handleSelectAll}
                          className="rounded border-gray-300 text-blue-600 focus:ring-blue-500 w-4 h-4"
                        />
                        <span className="ml-3 text-sm font-medium text-gray-700">
                          Chọn tất cả (
                          {
                            wishlistItems.filter(
                              (item) => item.book && item.book._id
                            ).length
                          }
                          )
                        </span>
                      </label>
                      {selectedItems.length > 0 && (
                        <>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={handleRemoveSelected}
                            disabled={actionLoading.removeSelected}
                            className="text-red-600 border-red-300 hover:bg-red-50 hover:border-red-400 transition-colors"
                          >
                            {actionLoading.removeSelected ? (
                              <div className="flex items-center gap-2">
                                <Spinner size="sm" />
                                <span>Removing...</span>
                              </div>
                            ) : (
                              <div className="flex items-center gap-2">
                                <Icon icon="mdi:delete" className="w-4 h-4" />
                                <span>
                                  Xóa tất cả ({selectedItems.length})
                                </span>
                              </div>
                            )}
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={handleMoveSelectedToCart}
                            disabled={actionLoading.moveSelectedToCart}
                            className="text-blue-600 border-blue-300 hover:bg-blue-50 hover:border-blue-400 transition-colors"
                          >
                            {actionLoading.moveSelectedToCart ? (
                              <div className="flex items-center gap-2">
                                <Spinner size="sm" />
                                <span>Moving...</span>
                              </div>
                            ) : (
                              <div className="flex items-center gap-2">
                                <Icon icon="mdi:cart-arrow-down" className="w-4 h-4" />
                                <span>
                                  Chuyển tất cả vào giỏ hàng ({selectedItems.length})
                                </span>
                              </div>
                            )}
                          </Button>
                        </>
                      )}
                    </div>
                    <div className="text-sm font-medium text-gray-600 bg-blue-50 px-3 py-1 rounded-full">
                      {pagination.totalItems} items
                    </div>
                  </div>
                </div>

                <div className="divide-y divide-gray-200">
                  {wishlistItems
                    .filter((item) => item.book && item.book._id)
                    .map((item) => (
                      <div
                        key={item._id}
                        className="p-6 hover:bg-gray-50 transition-colors duration-200 border-b border-gray-100 last:border-b-0"
                      >
                        <div className="flex items-center gap-6">
                          <input
                            type="checkbox"
                            checked={selectedItems.includes(item.book._id)}
                            onChange={() => handleSelectItem(item.book._id)}
                            className="rounded border-gray-300 text-blue-600 focus:ring-blue-500 w-4 h-4"
                          />

                          <div
                            className="w-20 h-28 bg-gray-200 rounded-lg overflow-hidden cursor-pointer shadow-sm hover:shadow-md transition-shadow duration-200 flex-shrink-0"
                            onClick={() => handleProductClick(item.book._id)}
                          >
                            {item.book.images && item.book.images.length > 0 ? (
                              <img
                                src={item.book.images[0]}
                                alt={item.book.title || "Book"}
                                className="w-full h-full object-cover"
                              />
                            ) : (
                              <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-gray-100 to-gray-200">
                                <Icon
                                  icon="mdi:book-open-page-variant"
                                  className="w-8 h-8 text-gray-400"
                                />
                              </div>
                            )}
                          </div>

                          <div className="flex-1 min-w-0">
                            <h3
                              className="font-semibold text-gray-900 cursor-pointer hover:text-blue-600 transition-colors duration-200 text-lg mb-2 truncate"
                              onClick={() => handleProductClick(item.book._id)}
                            >
                              {item.book.title || "Unknown Title"}
                            </h3>
                            <p className="text-sm text-gray-600 mb-1 truncate">
                              Tác giả:{" "}
                              {item.book.authors && item.book.authors.length > 0
                                ? item.book.authors.join(", ")
                                : "Unknown Author"}
                            </p>
                            {item.book.categories &&
                              item.book.categories.length > 0 && (
                                <div className="flex flex-wrap gap-1 mb-2">
                                  {item.book.categories
                                    .slice(0, 2)
                                    .map((cat, index) => (
                                      <span
                                        key={index}
                                        className="inline-block px-2 py-1 text-xs bg-blue-100 text-blue-700 rounded-full"
                                      >
                                        {cat.name}
                                      </span>
                                    ))}
                                  {item.book.categories.length > 2 && (
                                    <span className="inline-block px-2 py-1 text-xs bg-gray-100 text-gray-600 rounded-full">
                                      +{item.book.categories.length - 2} more
                                    </span>
                                  )}
                                </div>
                              )}
                            <p className="text-sm text-gray-500">
                              Đã thêm:{" "}
                              {item.dateAdded
                                ? new Date(item.dateAdded).toLocaleDateString(
                                  "vi-VN"
                                )
                                : "N/A"}
                            </p>
                          </div>

                          <div className="text-right flex-shrink-0">
                            <p className="font-bold text-xl text-gray-900 mb-2">
                              {item.book.sellingPrice
                                ? formatPrice(item.book.sellingPrice)
                                : "N/A"}
                            </p>
                            <div className="flex items-center gap-2 text-sm justify-end">
                              <Icon
                                icon={
                                  (item.book.stockQuantity || 0) > 0
                                    ? "mdi:check-circle"
                                    : "mdi:alert-circle"
                                }
                                className={`w-4 h-4 ${(item.book.stockQuantity || 0) > 0
                                  ? "text-green-500"
                                  : "text-red-500"
                                  }`}
                              />
                              <span
                                className={`font-medium ${(item.book.stockQuantity || 0) > 0
                                  ? "text-green-600"
                                  : "text-red-600"
                                  }`}
                              >
                                {(item.book.stockQuantity || 0) > 0
                                  ? "Còn hàng"
                                  : "Hết hàng"}
                              </span>
                            </div>
                          </div>

                          <div className="flex flex-col gap-3">
                            <Button
                              size="sm"
                              onClick={() => handleMoveToCart(item.book._id)}
                              disabled={
                                (item.book.stockQuantity || 0) === 0 ||
                                actionLoading[item.book._id]
                              }
                              className="min-w-[140px] bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white border-0 shadow-sm hover:shadow-md transition-all duration-200 transform hover:scale-105 disabled:from-gray-400 disabled:to-gray-500 disabled:transform-none disabled:shadow-none"
                            >
                              {actionLoading[item.book._id] ? (
                                <div className="flex items-center gap-2">
                                  <Spinner size="sm" />
                                  <span>Moving...</span>
                                </div>
                              ) : (
                                <div className="flex items-center gap-2">
                                  <Icon
                                    icon="mdi:cart-plus"
                                    className="w-4 h-4"
                                  />
                                  <span>Chuyển vào giỏ hàng</span>
                                </div>
                              )}
                            </Button>

                            <button
                              onClick={() => removeFromWishlist(item.book._id)}
                              className="text-sm text-red-500 hover:text-red-700 flex items-center justify-center gap-2 py-2 px-3 rounded-md hover:bg-red-50 transition-all duration-200 border border-transparent hover:border-red-200"
                            >
                              <Icon
                                icon="mdi:heart-remove"
                                className="w-4 h-4"
                              />
                              <span>Xóa</span>
                            </button>
                          </div>
                        </div>
                      </div>
                    ))}
                  {/* Show message for items with missing book data */}
                  {wishlistItems.some(
                    (item) => !item.book || !item.book._id
                  ) && (
                      <div className="mx-6 mb-6 p-4 bg-gradient-to-r from-yellow-50 to-orange-50 border-l-4 border-yellow-400 rounded-r-lg">
                        <div className="flex items-center">
                          <Icon
                            icon="mdi:alert-circle"
                            className="w-6 h-6 text-yellow-500 mr-3 flex-shrink-0"
                          />
                          <div>
                            <p className="text-sm font-medium text-yellow-800">
                              Some items are no longer available
                            </p>
                            <p className="text-xs text-yellow-700 mt-1">
                              These items have been hidden from your wishlist as
                              they may have been removed from our catalog.
                            </p>
                          </div>
                        </div>
                      </div>
                    )}
                </div>
              </div>

              {pagination.totalPages > 1 && (
                <div className="mt-8 flex justify-center">
                  <div className="bg-white rounded-lg shadow-md border border-gray-200 p-2">
                    <Pagination
                      currentPage={pagination.page}
                      totalPages={pagination.totalPages}
                      onPageChange={handlePageChange}
                    />
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default WishlistPage;
