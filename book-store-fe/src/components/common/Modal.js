import React, { useEffect, useRef } from "react";

const Modal = ({ isOpen, onClose, title, children, footerContent }) => {
  const modalRef = useRef(null);
  const firstFocusableRef = useRef(null);

  useEffect(() => {
    if (!isOpen) return;

    const focusableElements = modalRef.current.querySelectorAll(
      'a[href], button:not([disabled]), textarea, input, select, [tabindex]:not([tabindex="-1"])'
    );
    if (focusableElements.length > 0) {
      firstFocusableRef.current = focusableElements[0];
      firstFocusableRef.current.focus();
    }

    const handleKeyDown = (e) => {
      if (e.key === "Escape") {
        onClose();
      }
      if (e.key === "Tab") {
        // Trap focus inside modal
        const focusable = Array.from(focusableElements);
        const index = focusable.indexOf(document.activeElement);
        if (e.shiftKey) {
          if (index === 0) {
            e.preventDefault();
            focusable[focusable.length - 1].focus();
          }
        } else {
          if (index === focusable.length - 1) {
            e.preventDefault();
            focusable[0].focus();
          }
        }
      }
    };

    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const handleOutsideClick = (e) => {
    if (modalRef.current && !modalRef.current.contains(e.target)) {
      onClose();
    }
  };

  return (
    <div
      className="fixed inset-0 w-screen h-screen bg-black bg-opacity-50 flex items-center justify-center z-50"
      onClick={handleOutsideClick}
      role="dialog"
      aria-modal="true"
      aria-labelledby="modal-title"
    >
      <div
        className="bg-white rounded-lg max-w-2xl w-[90%] max-h-[90vh] overflow-y-auto shadow-lg p-6 flex flex-col"
        ref={modalRef}
      >
        {title && (
          <h2 id="modal-title" className="m-0 mb-4 text-2xl font-bold">
            {title}
          </h2>
        )}
        <div className="flex-grow mb-4">{children}</div>
        {footerContent && (
          <div className="flex justify-end gap-2">{footerContent}</div>
        )}
      </div>
    </div>
  );
};

export default Modal;
