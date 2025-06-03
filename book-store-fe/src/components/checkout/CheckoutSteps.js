import React from "react";

const CheckoutSteps = ({ currentStep = 1, steps = [] }) => {
  return (
    <div className="flex gap-4 mb-4 justify-center flex-wrap">
      {steps.map((step, index) => {
        const stepNumber = index + 1;
        const isActive = stepNumber === currentStep;
        const isCompleted = stepNumber < currentStep;

        const stepClasses =
          "flex flex-col items-center cursor-default text-gray-500";
        const stepNumberBaseClasses =
          "w-8 h-8 rounded-full flex items-center justify-center font-bold mb-1";
        const stepNumberActiveClasses = "bg-blue-600 text-white";
        const stepNumberCompletedClasses = "bg-green-600 text-white";

        return (
          <div
            key={stepNumber}
            className={`${stepClasses} ${
              isActive
                ? "text-gray-900"
                : isCompleted
                ? "text-gray-700"
                : "text-gray-500"
            }`}
          >
            <div
              className={`${stepNumberBaseClasses} ${
                isActive
                  ? stepNumberActiveClasses
                  : isCompleted
                  ? stepNumberCompletedClasses
                  : "bg-gray-300 text-gray-600"
              }`}
            >
              {stepNumber}
            </div>
            <div className="text-sm text-center">{step}</div>
          </div>
        );
      })}
    </div>
  );
};

export default CheckoutSteps;
