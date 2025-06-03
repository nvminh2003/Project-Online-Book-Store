import React from "react";

const Input = React.forwardRef(
  (
    {
      label,
      id,
      name,
      type = "text",
      value,
      onChange,
      placeholder,
      error,
      disabled = false,
      iconLeft,
      iconRight,
      ...rest
    },
    ref
  ) => {
    return (
      <div className="flex flex-col mb-4">
        {label && (
          <label
            htmlFor={id || name}
            className="font-semibold mb-1 text-gray-800"
          >
            {label}
          </label>
        )}
        <div className="relative flex items-center">
          {iconLeft && (
            <span className="absolute left-2 flex items-center justify-center text-gray-600 pointer-events-none">
              {iconLeft}
            </span>
          )}
          <input
            id={id || name}
            name={name}
            type={type}
            value={value}
            onChange={onChange}
            placeholder={placeholder}
            disabled={disabled}
            className={`w-full px-3 py-2 text-base border rounded outline-none transition-colors focus:border-blue-600 ${
              error ? "border-red-600" : "border-gray-300"
            } ${iconLeft ? "pl-8" : ""} ${iconRight ? "pr-8" : ""}`}
            ref={ref}
            {...rest}
          />
          {iconRight && (
            <span className="absolute right-2 flex items-center justify-center text-gray-600 pointer-events-none">
              {iconRight}
            </span>
          )}
        </div>
        {error && typeof error === "string" && (
          <p className="text-red-600 text-sm mt-1">{error}</p>
        )}
      </div>
    );
  }
);

export default Input;
