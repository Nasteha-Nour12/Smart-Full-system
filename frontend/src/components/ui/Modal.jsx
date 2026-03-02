// src/components/ui/Modal.jsx
import { useEffect, useRef } from "react";
import { X } from "lucide-react";
import Button from "./Button";

const Modal = ({ 
  open, 
  title, 
  children, 
  onClose,
  size = "md",
  footer,
  hideCloseButton = false,
  closeOnBackdrop = true,
  loading = false
}) => {
  const modalRef = useRef(null);

  // Handle escape key
  useEffect(() => {
    const handleEscape = (e) => {
      if (e.key === "Escape" && open) {
        onClose();
      }
    };

    document.addEventListener("keydown", handleEscape);
    return () => document.removeEventListener("keydown", handleEscape);
  }, [open, onClose]);

  // Handle backdrop click
  const handleBackdropClick = (e) => {
    if (closeOnBackdrop && e.target === e.currentTarget) {
      onClose();
    }
  };

  // Prevent body scroll when modal is open
  useEffect(() => {
    if (open) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
    }

    return () => {
      document.body.style.overflow = "unset";
    };
  }, [open]);

  if (!open) return null;

  // Size classes
  const sizeClasses = {
    sm: "max-w-md",
    md: "max-w-lg",
    lg: "max-w-2xl",
    xl: "max-w-4xl",
    full: "max-w-full mx-4",
  };

  // Animation classes
  const animationClasses = open 
    ? "animate-fadeIn scale-100 opacity-100" 
    : "animate-fadeOut scale-95 opacity-0";

  return (
    <div 
      ref={modalRef}
      className="fixed inset-0 z-50 overflow-y-auto"
      onClick={handleBackdropClick}
    >
      {/* Backdrop */}
      <div 
        className={`fixed inset-0 bg-black/50 transition-opacity duration-300 ${
          open ? "opacity-100" : "opacity-0"
        }`}
      />

      {/* Modal Container */}
      <div className="flex min-h-screen items-center justify-center p-4">
        {/* Modal Content */}
        <div 
          className={`
            relative w-full ${sizeClasses[size]} 
            bg-white rounded-lg shadow-xl 
            transform transition-all duration-300 ease-out
            ${animationClasses}
          `}
        >
          {/* Header */}
          {(title || !hideCloseButton) && (
            <div className="flex items-center justify-between border-b px-6 py-4">
              {title && (
                <h2 className="text-xl font-semibold text-gray-900">
                  {title}
                </h2>
              )}
              
              {!hideCloseButton && (
                <button
                  onClick={onClose}
                  disabled={loading}
                  className="
                    ml-auto rounded-full p-1 
                    text-gray-400 hover:text-gray-500 
                    hover:bg-gray-100 
                    transition-colors duration-200
                    disabled:opacity-50 disabled:cursor-not-allowed
                    focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2
                  "
                  aria-label="Close modal"
                >
                  <X className="h-5 w-5" />
                </button>
              )}
            </div>
          )}

          {/* Body */}
          <div className="max-h-[calc(100vh-200px)] overflow-y-auto px-6 py-4">
            {loading ? (
              <div className="flex items-center justify-center py-12">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600" />
              </div>
            ) : (
              children
            )}
          </div>

          {/* Footer */}
          {footer && (
            <div className="border-t px-6 py-4">
              {footer}
            </div>
          )}

          {/* Default Footer with Close Button */}
          {!footer && !hideCloseButton && (
            <div className="border-t px-6 py-4 flex justify-end">
              <Button variant="secondary" onClick={onClose}>
                Close
              </Button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Modal;