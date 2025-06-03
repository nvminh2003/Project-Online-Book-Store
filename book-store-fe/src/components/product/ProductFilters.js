import React from "react";

const ProductFilters = ({
  availableFilters = {},
  selectedFilters = {},
  onFilterChange,
}) => {
  const {
    categories = [],
    priceRanges = [],
    authors = [],
    publishers = [],
    coverTypes = [],
    stockStatuses = [],
  } = availableFilters;

  const handleCheckboxChange = (filterName, value) => {
    const currentValues = selectedFilters[filterName] || [];
    let newValues;
    if (currentValues.includes(value)) {
      newValues = currentValues.filter((v) => v !== value);
    } else {
      newValues = [...currentValues, value];
    }
    onFilterChange({ ...selectedFilters, [filterName]: newValues });
  };

  const handleSingleSelectChange = (filterName, value) => {
    onFilterChange({ ...selectedFilters, [filterName]: value });
  };

  return (
    <div className="space-y-6">
      {/* Categories */}
      <div>
        <h4 className="font-semibold mb-2">Danh mục</h4>
        {categories.map((cat) => (
          <label
            key={cat.id}
            className="flex items-center space-x-2 mb-1 cursor-pointer"
          >
            <input
              type="checkbox"
              checked={(selectedFilters.categories || []).includes(cat.id)}
              onChange={() => handleCheckboxChange("categories", cat.id)}
              className="form-checkbox h-4 w-4 text-blue-600"
            />
            <span>{cat.name}</span>
          </label>
        ))}
      </div>

      {/* Price Range */}
      <div>
        <h4 className="font-semibold mb-2">Khoảng giá</h4>
        {priceRanges.map((range) => (
          <label
            key={range.value}
            className="flex items-center space-x-2 mb-1 cursor-pointer"
          >
            <input
              type="radio"
              name="priceRange"
              checked={selectedFilters.priceRange === range.value}
              onChange={() =>
                handleSingleSelectChange("priceRange", range.value)
              }
              className="form-radio h-4 w-4 text-blue-600"
            />
            <span>{range.label}</span>
          </label>
        ))}
      </div>

      {/* Authors */}
      <div>
        <h4 className="font-semibold mb-2">Tác giả</h4>
        {authors.map((author) => (
          <label
            key={author.id}
            className="flex items-center space-x-2 mb-1 cursor-pointer"
          >
            <input
              type="checkbox"
              checked={(selectedFilters.authors || []).includes(author.id)}
              onChange={() => handleCheckboxChange("authors", author.id)}
              className="form-checkbox h-4 w-4 text-blue-600"
            />
            <span>{author.name}</span>
          </label>
        ))}
      </div>

      {/* Publishers */}
      <div>
        <h4 className="font-semibold mb-2">Nhà xuất bản</h4>
        {publishers.map((publisher) => (
          <label
            key={publisher.id}
            className="flex items-center space-x-2 mb-1 cursor-pointer"
          >
            <input
              type="checkbox"
              checked={(selectedFilters.publishers || []).includes(
                publisher.id
              )}
              onChange={() => handleCheckboxChange("publishers", publisher.id)}
              className="form-checkbox h-4 w-4 text-blue-600"
            />
            <span>{publisher.name}</span>
          </label>
        ))}
      </div>

      {/* Cover Types */}
      <div>
        <h4 className="font-semibold mb-2">Loại bìa</h4>
        {coverTypes.map((cover) => (
          <label
            key={cover}
            className="flex items-center space-x-2 mb-1 cursor-pointer"
          >
            <input
              type="checkbox"
              checked={(selectedFilters.coverTypes || []).includes(cover)}
              onChange={() => handleCheckboxChange("coverTypes", cover)}
              className="form-checkbox h-4 w-4 text-blue-600"
            />
            <span>{cover}</span>
          </label>
        ))}
      </div>

      {/* Stock Status */}
      <div>
        <h4 className="font-semibold mb-2">Trạng thái</h4>
        {stockStatuses.map((status) => (
          <label
            key={status}
            className="flex items-center space-x-2 mb-1 cursor-pointer"
          >
            <input
              type="checkbox"
              checked={(selectedFilters.stockStatuses || []).includes(status)}
              onChange={() => handleCheckboxChange("stockStatuses", status)}
              className="form-checkbox h-4 w-4 text-blue-600"
            />
            <span>{status}</span>
          </label>
        ))}
      </div>
    </div>
  );
};

export default ProductFilters;
