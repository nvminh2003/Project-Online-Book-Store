import React, { useState, useEffect } from "react";
import { Icon } from "@iconify/react";
import {
  createDiscountCodeAPI,
  updateDiscountCodeAPI,
} from "../../services/discountService";
import Button from "../common/Button";
import Input from "../common/Input";
import Select from "../common/Select";
import { formatPrice } from "../../utils/formatPrice";

const DiscountForm = ({ discount, onSuccess, onCancel }) => {
  const [formData, setFormData] = useState({
    code: "",
    description: "",
    type: "percent",
    value: "",
    startDate: "",
    endDate: "",
    maxUses: "",
    maxUsesPerUser: "",
    minOrderValue: "",
    maxDiscountAmount: "",
    isActive: true,
    autoGenerate: false,
    prefix: "SALE",
    quantity: 1,
  });

  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [showAdvanced, setShowAdvanced] = useState(false);

  useEffect(() => {
    if (discount) {
      setFormData({
        ...discount,
        startDate: discount.startDate
          ? new Date(discount.startDate).toISOString().slice(0, 16)
          : "",
        endDate: discount.endDate
          ? new Date(discount.endDate).toISOString().slice(0, 16)
          : "",
        autoGenerate: false,
        prefix: discount.prefix || "SALE",
        quantity: 1,
      });
      setShowAdvanced(true); // Show advanced options when editing
    }
  }, [discount]);

  const validateForm = () => {
    const newErrors = {};

    if (!formData.autoGenerate && !formData.code.trim()) {
      newErrors.code = "Discount code is required";
    }

    if (!formData.description.trim()) {
      newErrors.description = "Description is required";
    }

    if (!formData.value || formData.value <= 0) {
      newErrors.value = "Value must be greater than 0";
    }

    if (formData.type === "percent" && formData.value > 100) {
      newErrors.value = "Percentage value cannot exceed 100%";
    }

    if (!formData.startDate) {
      newErrors.startDate = "Start date is required";
    }

    if (!formData.endDate) {
      newErrors.endDate = "End date is required";
    }

    if (formData.startDate && formData.endDate) {
      const start = new Date(formData.startDate);
      const end = new Date(formData.endDate);
      if (start >= end) {
        newErrors.endDate = "End date must be after start date";
      }
    }

    if (formData.maxUses && formData.maxUses <= 0) {
      newErrors.maxUses = "Max uses must be greater than 0";
    }

    if (formData.maxUsesPerUser && formData.maxUsesPerUser <= 0) {
      newErrors.maxUsesPerUser = "Max uses per user must be greater than 0";
    }

    if (formData.minOrderValue && formData.minOrderValue < 0) {
      newErrors.minOrderValue = "Minimum order value cannot be negative";
    }

    if (formData.maxDiscountAmount && formData.maxDiscountAmount <= 0) {
      newErrors.maxDiscountAmount =
        "Max discount amount must be greater than 0";
    }

    if (formData.autoGenerate) {
      if (!formData.prefix.trim()) {
        newErrors.prefix = "Prefix is required for auto-generation";
      }
      if (!formData.quantity || formData.quantity <= 0) {
        newErrors.quantity = "Quantity must be greater than 0";
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    setLoading(true);
    try {
      const submitData = {
        ...formData,
        value: parseFloat(formData.value),
        maxUses: formData.maxUses ? parseInt(formData.maxUses) : null,
        maxUsesPerUser: formData.maxUsesPerUser
          ? parseInt(formData.maxUsesPerUser)
          : null,
        minOrderValue: formData.minOrderValue
          ? parseFloat(formData.minOrderValue)
          : 0,
        maxDiscountAmount: formData.maxDiscountAmount
          ? parseFloat(formData.maxDiscountAmount)
          : null,
        quantity: formData.autoGenerate ? parseInt(formData.quantity) : 1,
      };

      let result;
      if (discount) {
        result = await updateDiscountCodeAPI(discount._id, submitData);
      } else {
        result = await createDiscountCodeAPI(submitData);
      }

      // Pass the updated/created discount back to parent
      onSuccess(result.data || result);
    } catch (err) {
      setErrors({
        submit: err?.response?.data?.message || "Failed to save discount code",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (name, value) => {
    setFormData((prev) => ({ ...prev, [name]: value }));

    // Clear error when user starts typing
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: null }));
    }
  };

  const typeOptions = [
    { value: "percent", label: "Percentage (%)" },
    { value: "fixed", label: "Fixed Amount (đ)" },
  ];

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {errors.submit && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
          {errors.submit}
        </div>
      )}

      {/* Auto-generation option (only for new discounts) */}
      {!discount && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <div className="flex items-center">
            <input
              type="checkbox"
              id="autoGenerate"
              checked={formData.autoGenerate}
              onChange={(e) =>
                handleInputChange("autoGenerate", e.target.checked)
              }
              className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
            />
            <label
              htmlFor="autoGenerate"
              className="ml-2 text-sm text-blue-700 font-medium"
            >
              Auto-generate discount codes
            </label>
          </div>
          {formData.autoGenerate && (
            <div className="mt-3 grid grid-cols-2 gap-4">
              <Input
                label="Prefix"
                name="prefix"
                value={formData.prefix}
                onChange={(e) => handleInputChange("prefix", e.target.value)}
                error={errors.prefix}
                placeholder="e.g., SALE, SUMMER"
              />
              <Input
                label="Quantity"
                name="quantity"
                type="number"
                value={formData.quantity}
                onChange={(e) => handleInputChange("quantity", e.target.value)}
                error={errors.quantity}
                min="1"
                max="100"
              />
            </div>
          )}
        </div>
      )}

      {/* Basic Information */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {!formData.autoGenerate && (
          <Input
            label="Discount Code"
            name="code"
            value={formData.code}
            onChange={(e) =>
              handleInputChange("code", e.target.value.toUpperCase())
            }
            error={errors.code}
            placeholder="e.g., SAVE20"
            required
          />
        )}

        <div className={formData.autoGenerate ? "md:col-span-2" : ""}>
          <Input
            label="Description"
            name="description"
            value={formData.description}
            onChange={(e) => handleInputChange("description", e.target.value)}
            error={errors.description}
            placeholder="Brief description of the discount"
            required
          />
        </div>
      </div>

      {/* Discount Value */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Select
          label="Discount Type"
          name="type"
          value={formData.type}
          onChange={(e) => handleInputChange("type", e.target.value)}
          options={typeOptions}
          required
        />

        <Input
          label={`Value ${formData.type === "percent" ? "(%)" : "(đ)"}`}
          name="value"
          type="number"
          value={formData.value}
          onChange={(e) => handleInputChange("value", e.target.value)}
          error={errors.value}
          min="0"
          max={formData.type === "percent" ? "100" : undefined}
          step={formData.type === "percent" ? "0.1" : "1000"}
          required
        />
      </div>

      {/* Date Range */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Input
          label="Start Date"
          name="startDate"
          type="datetime-local"
          value={formData.startDate}
          onChange={(e) => handleInputChange("startDate", e.target.value)}
          error={errors.startDate}
          required
        />

        <Input
          label="End Date"
          name="endDate"
          type="datetime-local"
          value={formData.endDate}
          onChange={(e) => handleInputChange("endDate", e.target.value)}
          error={errors.endDate}
          required
        />
      </div>

      {/* Advanced Options Toggle */}
      <div>
        <button
          type="button"
          onClick={() => setShowAdvanced(!showAdvanced)}
          className="flex items-center text-blue-600 hover:text-blue-700 font-medium"
        >
          <Icon
            icon={showAdvanced ? "mdi:chevron-up" : "mdi:chevron-down"}
            width="20"
            className="mr-1"
          />
          Advanced Options
        </button>
      </div>

      {/* Advanced Options */}
      {showAdvanced && (
        <div className="space-y-4 bg-gray-50 p-4 rounded-lg">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Input
              label="Max Uses"
              name="maxUses"
              type="number"
              value={formData.maxUses}
              onChange={(e) => handleInputChange("maxUses", e.target.value)}
              error={errors.maxUses}
              placeholder="Unlimited if empty"
              min="1"
            />

            <Input
              label="Max Uses Per User"
              name="maxUsesPerUser"
              type="number"
              value={formData.maxUsesPerUser}
              onChange={(e) =>
                handleInputChange("maxUsesPerUser", e.target.value)
              }
              error={errors.maxUsesPerUser}
              placeholder="Unlimited if empty"
              min="1"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Input
              label="Minimum Order Value (đ)"
              name="minOrderValue"
              type="number"
              value={formData.minOrderValue}
              onChange={(e) =>
                handleInputChange("minOrderValue", e.target.value)
              }
              error={errors.minOrderValue}
              placeholder="0"
              min="0"
              step="1000"
            />

            {formData.type === "percent" && (
              <Input
                label="Max Discount Amount (đ)"
                name="maxDiscountAmount"
                type="number"
                value={formData.maxDiscountAmount}
                onChange={(e) =>
                  handleInputChange("maxDiscountAmount", e.target.value)
                }
                error={errors.maxDiscountAmount}
                placeholder="No limit if empty"
                min="1000"
                step="1000"
              />
            )}
          </div>

          <div className="flex items-center">
            <input
              type="checkbox"
              id="isActive"
              checked={formData.isActive}
              onChange={(e) => handleInputChange("isActive", e.target.checked)}
              className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
            />
            <label htmlFor="isActive" className="ml-2 text-sm text-gray-700">
              Active (discount code can be used)
            </label>
          </div>
        </div>
      )}

      {/* Action Buttons */}
      <div className="flex justify-end space-x-3 pt-4 border-t">
        <Button
          type="button"
          variant="outline"
          onClick={onCancel}
          disabled={loading}
        >
          Cancel
        </Button>
        <Button type="submit" isLoading={loading} disabled={loading}>
          {discount ? "Update Discount" : "Create Discount"}
        </Button>
      </div>
    </form>
  );
};

export default DiscountForm;
