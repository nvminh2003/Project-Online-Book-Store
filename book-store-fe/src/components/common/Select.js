import React from "react";

const Select = ({ options, value, onChange, ...props }) => (
  <select value={value} onChange={onChange} {...props}>
    {options.map((option) => (
      <option key={option.value} value={option.value}>
        {option.label}
      </option>
    ))}
  </select>
);

export default Select;
