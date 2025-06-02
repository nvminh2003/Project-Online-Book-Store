import React from "react";
import styles from "./Input.module.css";

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
      <div className={styles.inputWrapper}>
        {label && (
          <label htmlFor={id || name} className={styles.label}>
            {label}
          </label>
        )}
        <div className={styles.inputContainer}>
          {iconLeft && <span className={styles.iconLeft}>{iconLeft}</span>}
          <input
            id={id || name}
            name={name}
            type={type}
            value={value}
            onChange={onChange}
            placeholder={placeholder}
            disabled={disabled}
            className={`${styles.input} ${error ? styles.errorInput : ""}`}
            ref={ref}
            {...rest}
          />
          {iconRight && <span className={styles.iconRight}>{iconRight}</span>}
        </div>
        {error && typeof error === "string" && (
          <p className={styles.errorMessage}>{error}</p>
        )}
      </div>
    );
  }
);

export default Input;
