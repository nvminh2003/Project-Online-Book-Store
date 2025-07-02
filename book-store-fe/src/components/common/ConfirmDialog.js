import React from "react";
import { Icon } from "@iconify/react";
import Button from "./Button";

const ConfirmDialog = ({
  isOpen,
  onClose,
  onConfirm,
  title,
  message,
  confirmText = "Confirm",
  cancelText = "Cancel",
  type = "primary", // primary, danger, warning
}) => {
  if (!isOpen) return null;

  const getConfirmButtonProps = () => {
    switch (type) {
      case "danger":
        return { variant: "danger" };
      case "warning":
        return { variant: "warning" };
      default:
        return { variant: "primary" };
    }
  };

  const getIcon = () => {
    switch (type) {
      case "danger":
        return { icon: "mdi:alert-circle", color: "text-red-600" };
      case "warning":
        return { icon: "mdi:alert", color: "text-yellow-600" };
      default:
        return { icon: "mdi:help-circle", color: "text-blue-600" };
    }
  };

  const iconInfo = getIcon();

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex items-center justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
        {/* Background overlay */}
        <div
          className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity"
          onClick={onClose}
        ></div>

        {/* Dialog */}
        <div className="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full">
          <div className="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
            <div className="sm:flex sm:items-start">
              <div
                className={`mx-auto flex-shrink-0 flex items-center justify-center h-12 w-12 rounded-full ${
                  type === "danger"
                    ? "bg-red-100"
                    : type === "warning"
                    ? "bg-yellow-100"
                    : "bg-blue-100"
                } sm:mx-0 sm:h-10 sm:w-10`}
              >
                <Icon
                  icon={iconInfo.icon}
                  width="20"
                  className={iconInfo.color}
                />
              </div>
              <div className="mt-3 text-center sm:mt-0 sm:ml-4 sm:text-left">
                <h3 className="text-lg leading-6 font-medium text-gray-900">
                  {title}
                </h3>
                <div className="mt-2">
                  <p className="text-sm text-gray-500">{message}</p>
                </div>
              </div>
            </div>
          </div>
          <div className="bg-gray-50 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse">
            <Button
              onClick={onConfirm}
              {...getConfirmButtonProps()}
              className="w-full sm:w-auto sm:ml-3"
            >
              {confirmText}
            </Button>
            <Button
              onClick={onClose}
              variant="outline"
              className="mt-3 w-full sm:mt-0 sm:w-auto"
            >
              {cancelText}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ConfirmDialog;
