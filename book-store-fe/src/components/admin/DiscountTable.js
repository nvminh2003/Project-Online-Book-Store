import React from "react";
import { Icon } from "@iconify/react";
import Button from "../common/Button";
import Spinner from "../common/Spinner";
import AdminPagination from "./AdminPagination";
import { formatPrice } from "../../utils/formatPrice";

const DiscountTable = ({
  discounts,
  loading,
  selectedDiscounts,
  onSelectDiscount,
  onSelectAll,
  onEdit,
  onDelete,
  getStatusBadge,
  currentPage,
  totalPages,
  totalCount,
  onPageChange,
}) => {
  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString("vi-VN", {
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const formatValue = (discount) => {
    if (discount.type === "percent") {
      return `${discount.value}%`;
    } else {
      return formatPrice(discount.value);
    }
  };

  const getUsageProgress = (discount) => {
    if (!discount.maxUses) return null;
    const percentage = (discount.usesCount / discount.maxUses) * 100;
    return Math.min(100, Math.max(0, percentage));
  };

  if (loading && discounts.length === 0) {
    return (
      <div className="bg-white rounded-lg border border-gray-200 p-8">
        <div className="flex justify-center items-center">
          <Spinner size="lg" />
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
      {/* Table Header */}
      <div className="px-6 py-4 border-b border-gray-200 bg-gray-50">
        <div className="flex items-center justify-between">
          <div className="flex items-center">
            <input
              type="checkbox"
              checked={
                selectedDiscounts.length === discounts.length &&
                discounts.length > 0
              }
              onChange={onSelectAll}
              className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
            />
            <span className="ml-3 text-sm text-gray-700">
              {selectedDiscounts.length > 0
                ? `${selectedDiscounts.length} selected`
                : `${totalCount} total codes`}
            </span>
          </div>
          {loading && discounts.length > 0 && <Spinner size="sm" />}
        </div>
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                <span className="sr-only">Select</span>
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Code & Description
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Type & Value
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Period
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Usage
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Status
              </th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {discounts.length === 0 ? (
              <tr>
                <td colSpan="7" className="px-6 py-8 text-center text-gray-500">
                  <Icon
                    icon="mdi:ticket-percent"
                    width="48"
                    className="mx-auto mb-3 text-gray-300"
                  />
                  <p className="text-lg font-medium">No discount codes found</p>
                  <p className="text-sm">
                    Create your first discount code to get started
                  </p>
                </td>
              </tr>
            ) : (
              discounts.map((discount) => {
                const status = getStatusBadge(discount);
                const usageProgress = getUsageProgress(discount);

                return (
                  <tr
                    key={discount._id}
                    className={`hover:bg-gray-50 ${
                      selectedDiscounts.includes(discount._id)
                        ? "bg-blue-50"
                        : ""
                    }`}
                  >
                    {/* Checkbox */}
                    <td className="px-6 py-4 whitespace-nowrap">
                      <input
                        type="checkbox"
                        checked={selectedDiscounts.includes(discount._id)}
                        onChange={() => onSelectDiscount(discount._id)}
                        className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                      />
                    </td>

                    {/* Code & Description */}
                    <td className="px-6 py-4">
                      <div className="flex flex-col">
                        <div className="text-sm font-medium text-gray-900 font-mono">
                          {discount.code}
                          {discount.autoGenerated && (
                            <span className="ml-2 inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-gray-100 text-gray-800">
                              Auto
                            </span>
                          )}
                        </div>
                        <div className="text-sm text-gray-500 truncate max-w-xs">
                          {discount.description}
                        </div>
                      </div>
                    </td>

                    {/* Type & Value */}
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex flex-col">
                        <div className="text-sm font-medium text-gray-900">
                          {formatValue(discount)}
                        </div>
                        <div className="text-sm text-gray-500">
                          {discount.type === "percent"
                            ? "Percentage"
                            : "Fixed Amount"}
                        </div>
                        {discount.minOrderValue > 0 && (
                          <div className="text-xs text-gray-400">
                            Min: {formatPrice(discount.minOrderValue)}
                          </div>
                        )}
                      </div>
                    </td>

                    {/* Period */}
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">
                        <div>{formatDate(discount.startDate)}</div>
                        <div className="text-gray-500">to</div>
                        <div>{formatDate(discount.endDate)}</div>
                      </div>
                    </td>

                    {/* Usage */}
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex flex-col">
                        <div className="text-sm text-gray-900">
                          {discount.usesCount} / {discount.maxUses || "∞"}
                        </div>
                        {usageProgress !== null && (
                          <div className="w-full bg-gray-200 rounded-full h-2 mt-1">
                            <div
                              className={`h-2 rounded-full ${
                                usageProgress >= 90
                                  ? "bg-red-500"
                                  : usageProgress >= 70
                                  ? "bg-yellow-500"
                                  : "bg-green-500"
                              }`}
                              style={{ width: `${usageProgress}%` }}
                            ></div>
                          </div>
                        )}
                        {discount.maxUsesPerUser && (
                          <div className="text-xs text-gray-400 mt-1">
                            Max {discount.maxUsesPerUser}/user
                          </div>
                        )}
                      </div>
                    </td>

                    {/* Status */}
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span
                        className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${status.color}`}
                      >
                        {status.label}
                      </span>
                    </td>

                    {/* Actions */}
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <div className="flex justify-end space-x-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => onEdit(discount)}
                          title="Edit discount"
                        >
                          <Icon icon="mdi:pencil" width="16" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => onDelete(discount._id)}
                          className="text-red-600 hover:text-red-700"
                          title="Delete discount"
                        >
                          <Icon icon="mdi:delete" width="16" />
                        </Button>
                      </div>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="px-6 py-4 border-t border-gray-200 bg-gray-50">
          <AdminPagination
            currentPage={currentPage}
            totalPages={totalPages}
            totalCount={totalCount}
            onPageChange={onPageChange}
            showingFrom={(currentPage - 1) * 10 + 1}
            showingTo={Math.min(currentPage * 10, totalCount)}
          />
        </div>
      )}
    </div>
  );
};

export default DiscountTable;
