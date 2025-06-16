import React from "react";
// import "./Spinner.css";

const Spinner = ({ size = "md", color = "#007bff" }) => {
  const sizeMap = {
    sm: "16px",
    md: "32px",
    lg: "48px",
  };

  const spinnerSize = sizeMap[size] || sizeMap.md;

  return (
    <div
      className="spinner"
      style={{ width: spinnerSize, height: spinnerSize, borderTopColor: color }}
      aria-label="loading"
    />
  );
};

export default Spinner;
