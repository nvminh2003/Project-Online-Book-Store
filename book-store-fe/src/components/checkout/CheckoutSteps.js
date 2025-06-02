import React from "react";
import styles from "./CheckoutSteps.module.css";

const CheckoutSteps = ({ currentStep = 1, steps = [] }) => {
  return (
    <div className={styles.checkoutSteps}>
      {steps.map((step, index) => {
        const stepNumber = index + 1;
        const isActive = stepNumber === currentStep;
        const isCompleted = stepNumber < currentStep;

        return (
          <div
            key={stepNumber}
            className={`${styles.step} ${
              isActive ? styles.active : isCompleted ? styles.completed : ""
            }`}
          >
            <div className={styles.stepNumber}>{stepNumber}</div>
            <div className={styles.stepLabel}>{step}</div>
          </div>
        );
      })}
    </div>
  );
};

export default CheckoutSteps;
