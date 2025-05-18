import { X } from "lucide-react";

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  children: React.ReactNode;
  confirmText?: string;
  cancelText?: string;
}

export function Modal({
  isOpen,
  onClose,
  onConfirm,
  title,
  children,
  confirmText = "Confirm",
  cancelText = "Cancel",
}: ModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/50"
        onClick={onClose}
      />
      
      {/* Modal */}
      <div className="relative z-50 w-full max-w-md rounded-lg bg-white p-6 shadow-lg dark:bg-dark-2">
        {/* Header */}
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
            {title}
          </h2>
          <button
            onClick={onClose}
            className="rounded-full p-1 text-gray-500 hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-dark-3"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Content */}
        <div className="mb-6 text-gray-600 dark:text-gray-300">
          {children}
        </div>

        {/* Footer */}
        <div className="flex justify-end space-x-3">
          <button
            onClick={onClose}
            className="rounded-md border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 dark:border-dark-3 dark:text-gray-300 dark:hover:bg-dark-3"
          >
            {cancelText}
          </button>
          <button
            onClick={onConfirm}
            className="rounded-md bg-red-500 px-4 py-2 text-sm font-medium text-white hover:bg-red-600"
          >
            {confirmText}
          </button>
        </div>
      </div>
    </div>
  );
} 