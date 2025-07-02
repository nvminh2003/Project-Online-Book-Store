import React, { useState, useEffect, useCallback } from "react";
import AdminPageLayout from "../../components/admin/AdminPageLayout";
import { Icon } from "@iconify/react";
import {
  getDiscountCodesAPI,
  deleteDiscountCodeAPI,
  bulkUpdateDiscountCodesAPI,
} from "../../services/discountService";
import DiscountForm from "../../components/admin/DiscountForm";
import DiscountFilters from "../../components/admin/DiscountFilters";
import DiscountTable from "../../components/admin/DiscountTable";
import DiscountStats from "../../components/admin/DiscountStats";
import Button from "../../components/common/Button";
import Modal from "../../components/common/Modal";
import ConfirmDialog from "../../components/common/ConfirmDialog";
import Toast from "../../components/common/Toast";
import { formatPrice } from "../../utils/formatPrice";

const Discounts = () => {
  const [discounts, setDiscounts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [editingDiscount, setEditingDiscount] = useState(null);
  const [selectedDiscounts, setSelectedDiscounts] = useState([]);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [deletingId, setDeletingId] = useState(null);
  const [showBulkConfirm, setShowBulkConfirm] = useState(false);
  const [bulkAction, setBulkAction] = useState("");
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [bulkLoading, setBulkLoading] = useState(false);
  const [toast, setToast] = useState({ message: "", type: "" });

  // Pagination and filtering
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalCount, setTotalCount] = useState(0);
  const [filters, setFilters] = useState({
    search: "",
    status: "",
    type: "",
    sortBy: "createdAt",
    sortOrder: "desc",
    limit: 10,
  });

  // Statistics
  const [statistics, setStatistics] = useState(null);

  // Fetch discount codes
  const fetchDiscounts = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const params = {
        page: currentPage,
        ...filters,
      };

      const response = await getDiscountCodesAPI(params);

      if (response.status === "Success") {
        setDiscounts(response.data.discountCodes);
        setTotalPages(response.data.pagination.totalPages);
        setTotalCount(response.data.pagination.total);
        setStatistics(response.data.statistics);
      }
    } catch (err) {
      setError(
        err?.response?.data?.message || "Failed to fetch discount codes"
      );
    } finally {
      setLoading(false);
    }
  }, [currentPage, filters]);

  useEffect(() => {
    fetchDiscounts();
  }, [fetchDiscounts]);

  // Clear error after 5 seconds
  useEffect(() => {
    if (error) {
      const timer = setTimeout(() => {
        setError(null);
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [error]);

  const handleFilterChange = (newFilters) => {
    setFilters((prev) => ({ ...prev, ...newFilters }));
    setCurrentPage(1); // Reset to first page when filters change
  };

  const handlePageChange = (page) => {
    setCurrentPage(page);
  };

  const handleAddDiscount = () => {
    setEditingDiscount(null);
    setShowForm(true);
  };

  const handleEditDiscount = (discount) => {
    setEditingDiscount(discount);
    setShowForm(true);
  };

  const handleFormSuccess = (updatedDiscount) => {
    setShowForm(false);
    setEditingDiscount(null);

    // Optimistic update for better UX
    if (updatedDiscount) {
      if (editingDiscount) {
        // Update existing discount in the list
        setDiscounts((prev) =>
          prev.map((discount) =>
            discount._id === updatedDiscount._id ? updatedDiscount : discount
          )
        );
      } else {
        // Add new discount to the beginning of the list
        setDiscounts((prev) => [updatedDiscount, ...prev.slice(0, -1)]);
        setTotalCount((prev) => prev + 1);
      }
    }

    // Fetch fresh data in background
    fetchDiscounts();

    // Show success toast
    setToast({
      message: editingDiscount
        ? "Discount code updated successfully!"
        : "Discount code created successfully!",
      type: "success",
    });
  };

  const handleDeleteDiscount = (discountId) => {
    setDeletingId(discountId);
    setShowDeleteConfirm(true);
  };

  const confirmDelete = async () => {
    if (deleteLoading) return;

    setDeleteLoading(true);
    try {
      await deleteDiscountCodeAPI(deletingId);

      // Optimistic update - remove from list immediately
      setDiscounts((prev) =>
        prev.filter((discount) => discount._id !== deletingId)
      );
      setTotalCount((prev) => prev - 1);

      setShowDeleteConfirm(false);
      setDeletingId(null);

      // Fetch fresh data in background
      fetchDiscounts();

      // Show success toast
      setToast({
        message: "Discount code deleted successfully!",
        type: "success",
      });
    } catch (err) {
      setError(
        err?.response?.data?.message || "Failed to delete discount code"
      );
    } finally {
      setDeleteLoading(false);
    }
  };

  const handleBulkAction = (action) => {
    if (selectedDiscounts.length === 0) {
      alert("Please select at least one discount code");
      return;
    }
    setBulkAction(action);
    setShowBulkConfirm(true);
  };

  const confirmBulkAction = async () => {
    if (bulkLoading) return;

    setBulkLoading(true);
    try {
      await bulkUpdateDiscountCodesAPI(selectedDiscounts, bulkAction);

      // Optimistic update based on action
      if (bulkAction === "delete") {
        setDiscounts((prev) =>
          prev.filter((discount) => !selectedDiscounts.includes(discount._id))
        );
        setTotalCount((prev) => prev - selectedDiscounts.length);
      } else if (bulkAction === "activate" || bulkAction === "deactivate") {
        const isActive = bulkAction === "activate";
        setDiscounts((prev) =>
          prev.map((discount) =>
            selectedDiscounts.includes(discount._id)
              ? { ...discount, isActive }
              : discount
          )
        );
      }

      setShowBulkConfirm(false);
      setBulkAction("");
      setSelectedDiscounts([]);

      // Fetch fresh data in background
      fetchDiscounts();

      // Show success toast
      setToast({
        message: `Bulk ${bulkAction} completed successfully!`,
        type: "success",
      });
    } catch (err) {
      setError(err?.response?.data?.message || "Failed to perform bulk action");
    } finally {
      setBulkLoading(false);
    }
  };

  const handleSelectDiscount = (discountId) => {
    setSelectedDiscounts((prev) => {
      if (prev.includes(discountId)) {
        return prev.filter((id) => id !== discountId);
      } else {
        return [...prev, discountId];
      }
    });
  };

  const handleSelectAll = () => {
    if (selectedDiscounts.length === discounts.length) {
      setSelectedDiscounts([]);
    } else {
      setSelectedDiscounts(discounts.map((d) => d._id));
    }
  };

  const getStatusBadge = (discount) => {
    const now = new Date();
    const startDate = new Date(discount.startDate);
    const endDate = new Date(discount.endDate);

    if (!discount.isActive) {
      return { label: "Inactive", color: "bg-gray-100 text-gray-800" };
    } else if (now > endDate) {
      return { label: "Expired", color: "bg-red-100 text-red-800" };
    } else if (now < startDate) {
      return { label: "Upcoming", color: "bg-yellow-100 text-yellow-800" };
    } else {
      return { label: "Active", color: "bg-green-100 text-green-800" };
    }
  };

  return (
    <AdminPageLayout
      title="Discount Code Management"
      actions={
        <div className="flex gap-3">
          {selectedDiscounts.length > 0 && (
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => handleBulkAction("activate")}
              >
                <Icon icon="mdi:check" width="16" className="mr-1" />
                Activate
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => handleBulkAction("deactivate")}
              >
                <Icon icon="mdi:pause" width="16" className="mr-1" />
                Deactivate
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => handleBulkAction("delete")}
                className="text-red-600 hover:text-red-700"
              >
                <Icon icon="mdi:delete" width="16" className="mr-1" />
                Delete
              </Button>
            </div>
          )}
          <Button
            onClick={handleAddDiscount}
            className="flex items-center gap-2"
          >
            <Icon icon="mdi:plus" width="20" />
            Add Discount Code
          </Button>
        </div>
      }
    >
      <div className="space-y-6">
        {/* Statistics */}
        {statistics && <DiscountStats statistics={statistics} />}

        {/* Filters */}
        <DiscountFilters
          filters={filters}
          onFilterChange={handleFilterChange}
          loading={loading}
        />

        {/* Error Message */}
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
            {error}
          </div>
        )}

        {/* Discount Table */}
        <DiscountTable
          discounts={discounts}
          loading={loading}
          selectedDiscounts={selectedDiscounts}
          onSelectDiscount={handleSelectDiscount}
          onSelectAll={handleSelectAll}
          onEdit={handleEditDiscount}
          onDelete={handleDeleteDiscount}
          getStatusBadge={getStatusBadge}
          currentPage={currentPage}
          totalPages={totalPages}
          totalCount={totalCount}
          onPageChange={handlePageChange}
        />
      </div>

      {/* Discount Form Modal */}
      <Modal
        isOpen={showForm}
        onClose={() => setShowForm(false)}
        title={editingDiscount ? "Edit Discount Code" : "Create Discount Code"}
        size="lg"
      >
        <DiscountForm
          discount={editingDiscount}
          onSuccess={handleFormSuccess}
          onCancel={() => setShowForm(false)}
        />
      </Modal>

      {/* Delete Confirmation */}
      <ConfirmDialog
        isOpen={showDeleteConfirm}
        onClose={() => setShowDeleteConfirm(false)}
        onConfirm={confirmDelete}
        title="Delete Discount Code"
        message="Are you sure you want to delete this discount code? This action cannot be undone."
        confirmText={deleteLoading ? "Deleting..." : "Delete"}
        cancelText="Cancel"
        type="danger"
        loading={deleteLoading}
      />

      {/* Bulk Action Confirmation */}
      <ConfirmDialog
        isOpen={showBulkConfirm}
        onClose={() => setShowBulkConfirm(false)}
        onConfirm={confirmBulkAction}
        title={`Bulk ${bulkAction}`}
        message={`Are you sure you want to ${bulkAction} ${selectedDiscounts.length} discount code(s)?`}
        confirmText={
          bulkLoading
            ? "Processing..."
            : bulkAction === "delete"
            ? "Delete"
            : "Confirm"
        }
        cancelText="Cancel"
        type={bulkAction === "delete" ? "danger" : "primary"}
        loading={bulkLoading}
      />

      {/* Toast Notification */}
      <Toast
        message={toast.message}
        type={toast.type}
        onClose={() => setToast({ message: "", type: "" })}
      />
    </AdminPageLayout>
  );
};

export default Discounts;
