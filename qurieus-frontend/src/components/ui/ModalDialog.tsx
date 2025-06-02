import React from "react";

interface ModalDialogProps {
  isOpen: boolean;
  onClose: () => void;
  header?: React.ReactNode;
  footer?: React.ReactNode;
  children: React.ReactNode;
  maxHeight?: string | number;
}

export default function ModalDialog({
  isOpen,
  onClose,
  header,
  footer,
  children,
  maxHeight = "80vh",
}: ModalDialogProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
      <div
        className="w-full max-w-2xl rounded-lg bg-[#232a36] flex flex-col"
        style={{ maxHeight, minHeight: 0 }}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-gray-700">
          <div className="flex-1 font-semibold text-lg text-white">{header}</div>
          <button
            onClick={onClose}
            className="ml-4 text-gray-400 hover:text-white focus:outline-none"
            aria-label="Close dialog"
          >
            <svg width="24" height="24" fill="none" viewBox="0 0 24 24">
              <path stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" d="M18 6L6 18M6 6l12 12" />
            </svg>
          </button>
        </div>
        {/* Content (scrollable) */}
        <div className="flex-1 overflow-y-auto p-6 min-h-0">{children}</div>
        {/* Footer (sticky) */}
        {footer && (
          <div className="p-4 border-t border-gray-700 bg-[#232a36] flex justify-end">{footer}</div>
        )}
      </div>
    </div>
  );
} 