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
    xl: "max-w-6xl",
    full: "max-w-[95vw]",
  };

  // Animation classes
  const animationClasses = open 
    ? "animate-fadeIn scale-100 opacity-100" 
    : "animate-fadeOut scale-95 opacity-0";

  return (
    <div 
      ref={modalRef}
      className="fixed inset-0 z-50"
      onClick={handleBackdropClick}
    >
      {/* Backdrop */}
      <div 
        className={`fixed inset-0 bg-black/50 transition-opacity duration-300 ${
          open ? "opacity-100" : "opacity-0"
        }`}
      />

      {/* Modal Container */}
      <div className="flex min-h-screen items-center justify-center p-3 md:p-6">
        {/* Modal Content */}
        <div 
          className={`
            relative w-full ${sizeClasses[size]} 
            max-h-[calc(100vh-24px)] overflow-hidden
            ses-card rounded-2xl shadow-xl 
            transform transition-all duration-300 ease-out
            ${animationClasses}
          `}
        >
          {/* Header */}
          {(title || !hideCloseButton) && (
            <div className="flex items-center justify-between border-b border-slate-200 px-6 py-4">
              {title && (
                <h2 className="text-xl font-bold text-slate-900">
                  {title}
                </h2>
              )}
              
              {!hideCloseButton && (
                <button
                  onClick={onClose}
                  disabled={loading}
                  className="
                    ml-auto rounded-full p-1 
                    text-slate-400 hover:text-slate-600 
                    hover:bg-slate-100 
                    transition-colors duration-200
                    disabled:opacity-50 disabled:cursor-not-allowed
                    focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:ring-offset-2
                  "
                  aria-label="Close modal"
                >
                  <X className="h-5 w-5" />
                </button>
              )}
            </div>
          )}

          {/* Body */}
          <div className="max-h-[calc(100vh-180px)] overflow-y-auto px-6 py-4 overscroll-contain">
            {loading ? (
              <div className="flex items-center justify-center py-12">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600" />
              </div>
            ) : (
              children
            )}
          </div>

          {/* Footer */}
          {footer !== undefined && footer && (
            <div className="border-t border-slate-200 px-6 py-4">
              {footer}
            </div>
          )}

          {/* Default Footer with Close Button */}
          {footer === undefined && !hideCloseButton && (
            <div className="flex justify-end border-t border-slate-200 px-6 py-4">
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
