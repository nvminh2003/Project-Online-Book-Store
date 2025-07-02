import React, { useEffect, useState } from "react";
import wishlistService from "../../services/wishlistService";
import { formatPrice } from "../../utils/formatPrice";

const WishlistStats = () => {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadStats();
  }, []);

  const loadStats = async () => {
    try {
      const response = await wishlistService.getWishlistSummary();
      setStats(response.data);
    } catch (err) {
      console.error("Failed to load wishlist stats:", err);
    } finally {
      setLoading(false);
    }
  };

  if (loading || !stats) return null;

  return (
    <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg p-6 mb-6">
      <h2 className="text-lg font-semibold text-gray-900 mb-4">
        Wishlist Overview
      </h2>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-white rounded-lg p-4 shadow-sm">
          <div className="text-2xl font-bold text-blue-600">
            {stats.totalBooks}
          </div>
          <div className="text-sm text-gray-600">Total Books</div>
        </div>

        <div className="bg-white rounded-lg p-4 shadow-sm">
          <div className="text-2xl font-bold text-green-600">
            {formatPrice(stats.totalValue)}
          </div>
          <div className="text-sm text-gray-600">Total Value</div>
        </div>

        <div className="bg-white rounded-lg p-4 shadow-sm">
          <div className="text-2xl font-bold text-purple-600">
            {stats.availableCount}
          </div>
          <div className="text-sm text-gray-600">Available</div>
        </div>

        <div className="bg-white rounded-lg p-4 shadow-sm">
          <div className="text-2xl font-bold text-red-600">
            {stats.outOfStockCount}
          </div>
          <div className="text-sm text-gray-600">Out of Stock</div>
        </div>
      </div>

      {stats.potentialSavings > 0 && (
        <div className="mt-4 bg-green-100 border border-green-200 rounded-lg p-3">
          <div className="text-sm text-green-800">
            💰 You could save{" "}
            <strong>{formatPrice(stats.potentialSavings)}</strong> with current
            discounts!
          </div>
        </div>
      )}

      {stats.categories.length > 0 && (
        <div className="mt-4">
          <div className="text-sm text-gray-600 mb-2">Categories:</div>
          <div className="flex flex-wrap gap-2">
            {stats.categories.slice(0, 5).map((category, index) => (
              <span
                key={index}
                className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-800"
              >
                {category.name} ({category.count})
              </span>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default WishlistStats;
