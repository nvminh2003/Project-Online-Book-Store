import React from "react";
import styles from "./Button.module.css";

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
    const classNames = [
      styles.button,
      styles[variant],
      styles[size],
      disabled ? styles.disabled : "",
      isLoading ? styles.loading : "",
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
          <span className={styles.spinner} aria-label="loading" />
        ) : (
          children
        )}
      </button>
    );
  }
);

export default Button;
