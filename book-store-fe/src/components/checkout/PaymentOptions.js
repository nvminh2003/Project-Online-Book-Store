import React from "react";
import styles from "./PaymentOptions.module.css";

const PaymentOptions = ({
  availableMethods = [],
  selectedMethod,
  onSelectMethod,
}) => {
  return (
    <div className={styles.paymentOptions}>
      {availableMethods.map((method) => (
        <div key={method.id} className={styles.method}>
          <label>
            <input
              type="radio"
              name="paymentMethod"
              value={method.id}
              checked={selectedMethod === method.id}
              onChange={() => onSelectMethod(method.id)}
            />
            {method.name}
          </label>
          {selectedMethod === method.id && method.details && (
            <div className={styles.details}>{method.details}</div>
          )}
        </div>
      ))}
    </div>
  );
};

export default PaymentOptions;
