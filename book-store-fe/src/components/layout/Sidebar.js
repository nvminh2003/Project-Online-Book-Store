import React, { useState } from "react";
import styles from "./Sidebar.module.css";

const Sidebar = ({ categories = [], filters = {}, onFilterChange }) => {
  const [selectedFilters, setSelectedFilters] = useState(filters);

  const handleCategoryChange = (categoryId) => {
    const newFilters = {
      ...selectedFilters,
      category: categoryId,
    };
    setSelectedFilters(newFilters);
    onFilterChange && onFilterChange(newFilters);
  };

  const handleFilterChange = (filterName, value) => {
    const newFilters = {
      ...selectedFilters,
      [filterName]: value,
    };
    setSelectedFilters(newFilters);
    onFilterChange && onFilterChange(newFilters);
  };

  const renderCategories = (cats, level = 0) => {
    return (
      <ul className={styles.categoryList}>
        {cats.map((cat) => (
          <li key={cat.id} className={styles[`level${level}`]}>
            <label>
              <input
                type="radio"
                name="category"
                value={cat.id}
                checked={selectedFilters.category === cat.id}
                onChange={() => handleCategoryChange(cat.id)}
              />
              {cat.name}
            </label>
            {cat.children &&
              cat.children.length > 0 &&
              renderCategories(cat.children, level + 1)}
          </li>
        ))}
      </ul>
    );
  };

  return (
    <aside className={styles.sidebar}>
      <section className={styles.filterSection}>
        <h3>DANH MỤC SÁCH</h3>
        {renderCategories(categories)}
      </section>
      <section className={styles.filterSection}>
        <h3>Bộ lọc</h3>
        <div className={styles.filterItem}>
          <label>Khoảng giá</label>
          <select
            value={selectedFilters.priceRange || ""}
            onChange={(e) => handleFilterChange("priceRange", e.target.value)}
          >
            <option value="">Tất cả</option>
            <option value="0-100000">Dưới 100,000đ</option>
            <option value="100000-300000">100,000đ - 300,000đ</option>
            <option value="300000-500000">300,000đ - 500,000đ</option>
            <option value="500000+">Trên 500,000đ</option>
          </select>
        </div>
        <div className={styles.filterItem}>
          <label>Tác giả</label>
          <input
            type="text"
            placeholder="Tìm tác giả"
            value={selectedFilters.author || ""}
            onChange={(e) => handleFilterChange("author", e.target.value)}
          />
        </div>
        <div className={styles.filterItem}>
          <label>Nhà xuất bản</label>
          <input
            type="text"
            placeholder="Tìm NXB"
            value={selectedFilters.publisher || ""}
            onChange={(e) => handleFilterChange("publisher", e.target.value)}
          />
        </div>
      </section>
    </aside>
  );
};

export default Sidebar;
