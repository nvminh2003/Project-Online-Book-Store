import React from "react";

const PaymentOptions = ({
  availableMethods = [],
  selectedMethod,
  onSelectMethod,
}) => {
  return (
    <div className="flex flex-col gap-4 p-4 border border-gray-300 rounded bg-gray-50">
      {availableMethods.map((method) => (
        <div key={method.id} className="flex flex-col">
          <label className="font-semibold cursor-pointer">
            <input
              type="radio"
              name="paymentMethod"
              value={method.id}
              checked={selectedMethod === method.id}
              onChange={() => onSelectMethod(method.id)}
              className="mr-2"
            />
            {method.name}
          </label>
          {selectedMethod === method.id && method.details && (
            <div className="ml-6 mt-2 text-sm text-gray-600">
              {method.details}
            </div>
          )}
        </div>
      ))}
    </div>
  );
};

export default PaymentOptions;
