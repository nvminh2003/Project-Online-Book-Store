import React from "react";

const Button = React.forwardRef(
  (
    {
      children,
      onClick,
      variant = "primary",
      size = "md",
      isLoading = false,
      disabled = false,
      type = "button",
      ...rest
    },
    ref
  ) => {
    const baseClasses =
      "inline-flex items-center justify-center font-semibold rounded select-none transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2";
    const variantClasses = {
      primary: "bg-blue-600 text-white hover:bg-blue-800 focus:ring-blue-500",
      secondary: "bg-gray-600 text-white hover:bg-gray-700 focus:ring-gray-500",
      outline:
        "bg-transparent border-2 border-blue-600 text-blue-600 hover:bg-blue-600 hover:text-white focus:ring-blue-500",
      danger: "bg-red-600 text-white hover:bg-red-700 focus:ring-red-500",
    };
    const sizeClasses = {
      sm: "text-sm px-2 py-1",
      md: "text-base px-4 py-2",
      lg: "text-lg px-6 py-3",
    };
    const disabledClasses = disabled
      ? "opacity-60 cursor-not-allowed"
      : "cursor-pointer";
    const loadingClasses = isLoading ? "cursor-wait" : "";

    const classNames = [
      baseClasses,
      variantClasses[variant] || variantClasses.primary,
      sizeClasses[size] || sizeClasses.md,
      disabledClasses,
      loadingClasses,
    ].join(" ");

    return (
      <button
        ref={ref}
        className={classNames}
        onClick={disabled || isLoading ? undefined : onClick}
        disabled={disabled || isLoading}
        type={type}
        {...rest}
      >
        {isLoading ? (
          <span
            className="border-2 border-white border-t-transparent rounded-full w-4 h-4 animate-spin"
            aria-label="loading"
          />
        ) : (
          children
        )}
      </button>
    );
  }
);

export default Button;
