import React from "react";

const Spinner = ({ size = "md", color = "blue" }) => {
  const sizeMap = {
    sm: "w-4 h-4",
    md: "w-8 h-8",
    lg: "w-12 h-12",
  };

  const colorMap = {
    blue: "border-blue-600",
    gray: "border-gray-600",
    white: "border-white",
  };

  const spinnerSize = sizeMap[size] || sizeMap.md;
  const spinnerColor = colorMap[color] || colorMap.blue;

  return (
    <div
      className={`${spinnerSize} ${spinnerColor} border-2 border-t-transparent rounded-full animate-spin`}
      aria-label="loading"
    />
  );
};

export default Spinner;
