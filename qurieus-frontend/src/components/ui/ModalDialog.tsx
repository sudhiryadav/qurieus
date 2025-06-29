import React from "react";

interface ModalDialogProps {
  isOpen: boolean;
  onClose: () => void;
  header?: React.ReactNode;
  footer?: React.ReactNode;
  children: React.ReactNode;
  maxHeight?: string | number;
  width?: string;
  padding?: string;
}

export default function ModalDialog({
  isOpen,
  onClose,
  header,
  footer,
  children,
  maxHeight = "80vh",
  width = "50%",
}: ModalDialogProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
      <div
        className="flex flex-col rounded-lg bg-[#232a36]"
        style={{
          maxHeight,
          minHeight: 0,
          width,
        }}
      >
        {/* Header */}
        <div className="flex items-center justify-between border-b border-gray-700 p-4">
          <div className="flex-1 text-lg font-semibold text-white">
            {header}
          </div>
          <button
            onClick={onClose}
            className="ml-4 text-gray-400 hover:text-white focus:outline-none"
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
        {/* Content (scrollable) */}
        <div className={`min-h-0 flex-1 overflow-y-auto p-5`}>{children}</div>
        {/* Footer (sticky) */}
        {footer && (
          <div className="flex justify-end border-t border-gray-700 bg-[#232a36] p-2">
            {footer}
          </div>
        )}
      </div>
    </div>
  );
}
