import React from "react";
import styles from "./Breadcrumbs.module.css";
import { Link } from "react-router-dom";

const Breadcrumbs = ({ items }) => {
  if (!items || items.length === 0) return null;

  return (
    <nav aria-label="breadcrumb" className={styles.breadcrumbs}>
      <ol>
        {items.map((item, index) => {
          const isLast = index === items.length - 1;
          return (
            <li key={index} className={isLast ? styles.active : ""}>
              {isLast ? (
                <span>{item.label}</span>
              ) : (
                <Link to={item.link}>{item.label}</Link>
              )}
              {!isLast && <span className={styles.separator}>›</span>}
            </li>
          );
        })}
      </ol>
    </nav>
  );
};

export default Breadcrumbs;
