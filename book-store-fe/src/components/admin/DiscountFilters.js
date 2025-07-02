import React from "react";
import { Icon } from "@iconify/react";
import Input from "../common/Input";
import Select from "../common/Select";
import Button from "../common/Button";

const DiscountFilters = ({ filters, onFilterChange, loading }) => {
  const statusOptions = [
    { value: "", label: "All Status" },
    { value: "active", label: "Active" },
    { value: "expired", label: "Expired" },
    { value: "upcoming", label: "Upcoming" },
    { value: "inactive", label: "Inactive" },
  ];

  const typeOptions = [
    { value: "", label: "All Types" },
    { value: "percent", label: "Percentage" },
    { value: "fixed", label: "Fixed Amount" },
  ];

  const sortOptions = [
    { value: "createdAt", label: "Created Date" },
    { value: "code", label: "Code" },
    { value: "value", label: "Value" },
    { value: "startDate", label: "Start Date" },
    { value: "endDate", label: "End Date" },
    { value: "usesCount", label: "Usage Count" },
  ];

  const sortOrderOptions = [
    { value: "desc", label: "Descending" },
    { value: "asc", label: "Ascending" },
  ];

  const limitOptions = [
    { value: "5", label: "5 per page" },
    { value: "10", label: "10 per page" },
    { value: "25", label: "25 per page" },
    { value: "50", label: "50 per page" },
  ];

  const handleInputChange = (name, value) => {
    onFilterChange({ [name]: value });
  };

  const handleClearFilters = () => {
    onFilterChange({
      search: "",
      status: "",
      type: "",
      minValue: "",
      maxValue: "",
      dateFrom: "",
      dateTo: "",
      sortBy: "createdAt",
      sortOrder: "desc",
      limit: 10,
    });
  };

  const hasActiveFilters =
    filters.search ||
    filters.status ||
    filters.type ||
    filters.minValue ||
    filters.maxValue ||
    filters.dateFrom ||
    filters.dateTo;

  return (
    <div className="bg-white p-6 rounded-lg border border-gray-200">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-medium text-gray-900">Filters & Search</h3>
        {hasActiveFilters && (
          <Button
            variant="outline"
            size="sm"
            onClick={handleClearFilters}
            disabled={loading}
          >
            <Icon icon="mdi:filter-off" width="16" className="mr-1" />
            Clear Filters
          </Button>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {/* Search */}
        <div className="lg:col-span-2">
          <Input
            label="Search"
            name="search"
            value={filters.search}
            onChange={(e) => handleInputChange("search", e.target.value)}
            placeholder="Search by code or description..."
            icon="mdi:search"
          />
        </div>

        {/* Status Filter */}
        <Select
          label="Status"
          name="status"
          value={filters.status}
          onChange={(e) => handleInputChange("status", e.target.value)}
          options={statusOptions}
        />

        {/* Type Filter */}
        <Select
          label="Type"
          name="type"
          value={filters.type}
          onChange={(e) => handleInputChange("type", e.target.value)}
          options={typeOptions}
        />

        {/* Value Range */}
        <Input
          label="Min Value"
          name="minValue"
          type="number"
          value={filters.minValue}
          onChange={(e) => handleInputChange("minValue", e.target.value)}
          placeholder="0"
          min="0"
        />

        <Input
          label="Max Value"
          name="maxValue"
          type="number"
          value={filters.maxValue}
          onChange={(e) => handleInputChange("maxValue", e.target.value)}
          placeholder="No limit"
          min="0"
        />

        {/* Date Range */}
        <Input
          label="Created From"
          name="dateFrom"
          type="date"
          value={filters.dateFrom}
          onChange={(e) => handleInputChange("dateFrom", e.target.value)}
        />

        <Input
          label="Created To"
          name="dateTo"
          type="date"
          value={filters.dateTo}
          onChange={(e) => handleInputChange("dateTo", e.target.value)}
        />

        {/* Sort Options */}
        <Select
          label="Sort By"
          name="sortBy"
          value={filters.sortBy}
          onChange={(e) => handleInputChange("sortBy", e.target.value)}
          options={sortOptions}
        />

        <Select
          label="Sort Order"
          name="sortOrder"
          value={filters.sortOrder}
          onChange={(e) => handleInputChange("sortOrder", e.target.value)}
          options={sortOrderOptions}
        />

        {/* Items per page */}
        <Select
          label="Items per page"
          name="limit"
          value={filters.limit}
          onChange={(e) => handleInputChange("limit", e.target.value)}
          options={limitOptions}
        />
      </div>

      {/* Active Filters Summary */}
      {hasActiveFilters && (
        <div className="mt-4 pt-4 border-t border-gray-200">
          <div className="flex flex-wrap gap-2">
            <span className="text-sm font-medium text-gray-700">
              Active filters:
            </span>
            {filters.search && (
              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                Search: {filters.search}
                <button
                  onClick={() => handleInputChange("search", "")}
                  className="ml-1.5 text-blue-600 hover:text-blue-800"
                >
                  <Icon icon="mdi:close" width="12" />
                </button>
              </span>
            )}
            {filters.status && (
              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                Status:{" "}
                {
                  statusOptions.find((opt) => opt.value === filters.status)
                    ?.label
                }
                <button
                  onClick={() => handleInputChange("status", "")}
                  className="ml-1.5 text-green-600 hover:text-green-800"
                >
                  <Icon icon="mdi:close" width="12" />
                </button>
              </span>
            )}
            {filters.type && (
              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-purple-100 text-purple-800">
                Type:{" "}
                {typeOptions.find((opt) => opt.value === filters.type)?.label}
                <button
                  onClick={() => handleInputChange("type", "")}
                  className="ml-1.5 text-purple-600 hover:text-purple-800"
                >
                  <Icon icon="mdi:close" width="12" />
                </button>
              </span>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default DiscountFilters;
