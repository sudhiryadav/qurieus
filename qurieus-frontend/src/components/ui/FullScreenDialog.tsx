import React, { useEffect } from "react";

interface FullScreenModalProps {
  isOpen: boolean;
  onClose: () => void;
  header?: React.ReactNode;
  footer?: React.ReactNode;
  children: React.ReactNode;
  padding?: string;
}

export default function FullScreenModal({
  isOpen,
  onClose,
  header,
  footer,
  children,
  padding = "p-4",
}: FullScreenModalProps) {
  useEffect(() => {
    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") onClose();
    };
    if (isOpen) {
      document.addEventListener("keydown", handleEscape);
      document.body.style.overflow = "hidden";
    }
    return () => {
      document.removeEventListener("keydown", handleEscape);
      document.body.style.overflow = "unset";
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
      <div className="fixed inset-0 w-full h-full bg-white dark:bg-[#232a36] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-gray-200 dark:border-gray-700 p-4 bg-white dark:bg-[#232a36]">
          <div className="flex-1 text-lg font-semibold text-dark dark:text-white">{header}</div>
          <button
            onClick={onClose}
            className="absolute top-4 right-4 text-gray-500 hover:text-dark dark:text-gray-400 dark:hover:text-white focus:outline-none"
            aria-label="Close dialog"
          >
            <svg width="24" height="24" fill="none" viewBox="0 0 24 24">
              <path
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M18 6L6 18M6 6l12 12"
              />
            </svg>
          </button>
        </div>
        {/* Content */}
        <div className={`flex-1 overflow-y-auto min-h-0 bg-white dark:bg-[#232a36] text-dark dark:text-white ${padding}`}>{children}</div>
        {/* Footer */}
        {footer && (
          <div className="flex justify-end border-t border-gray-200 dark:border-gray-700 bg-white dark:bg-[#232a36] p-2">
            {footer}
          </div>
        )}
      </div>
    </div>
  );
}