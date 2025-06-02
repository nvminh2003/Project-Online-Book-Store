import React from "react";
import styles from "./ProductFilters.module.css";

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
    <div className={styles.filters}>
      {/* Categories */}
      <div className={styles.filterGroup}>
        <h4>Danh mục</h4>
        {categories.map((cat) => (
          <label key={cat.id} className={styles.checkboxLabel}>
            <input
              type="checkbox"
              checked={(selectedFilters.categories || []).includes(cat.id)}
              onChange={() => handleCheckboxChange("categories", cat.id)}
            />
            {cat.name}
          </label>
        ))}
      </div>

      {/* Price Range */}
      <div className={styles.filterGroup}>
        <h4>Khoảng giá</h4>
        {priceRanges.map((range) => (
          <label key={range.value} className={styles.radioLabel}>
            <input
              type="radio"
              name="priceRange"
              checked={selectedFilters.priceRange === range.value}
              onChange={() =>
                handleSingleSelectChange("priceRange", range.value)
              }
            />
            {range.label}
          </label>
        ))}
      </div>

      {/* Authors */}
      <div className={styles.filterGroup}>
        <h4>Tác giả</h4>
        {authors.map((author) => (
          <label key={author.id} className={styles.checkboxLabel}>
            <input
              type="checkbox"
              checked={(selectedFilters.authors || []).includes(author.id)}
              onChange={() => handleCheckboxChange("authors", author.id)}
            />
            {author.name}
          </label>
        ))}
      </div>

      {/* Publishers */}
      <div className={styles.filterGroup}>
        <h4>Nhà xuất bản</h4>
        {publishers.map((publisher) => (
          <label key={publisher.id} className={styles.checkboxLabel}>
            <input
              type="checkbox"
              checked={(selectedFilters.publishers || []).includes(
                publisher.id
              )}
              onChange={() => handleCheckboxChange("publishers", publisher.id)}
            />
            {publisher.name}
          </label>
        ))}
      </div>

      {/* Cover Types */}
      <div className={styles.filterGroup}>
        <h4>Loại bìa</h4>
        {coverTypes.map((cover) => (
          <label key={cover} className={styles.checkboxLabel}>
            <input
              type="checkbox"
              checked={(selectedFilters.coverTypes || []).includes(cover)}
              onChange={() => handleCheckboxChange("coverTypes", cover)}
            />
            {cover}
          </label>
        ))}
      </div>

      {/* Stock Status */}
      <div className={styles.filterGroup}>
        <h4>Trạng thái</h4>
        {stockStatuses.map((status) => (
          <label key={status} className={styles.checkboxLabel}>
            <input
              type="checkbox"
              checked={(selectedFilters.stockStatuses || []).includes(status)}
              onChange={() => handleCheckboxChange("stockStatuses", status)}
            />
            {status}
          </label>
        ))}
      </div>
    </div>
  );
};

export default ProductFilters;
