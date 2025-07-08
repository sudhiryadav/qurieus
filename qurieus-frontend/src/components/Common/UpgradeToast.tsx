import React from 'react';
import { toast } from 'react-toastify';
import { useRouter } from 'next/navigation';
import { AlertTriangle, X } from 'lucide-react';

interface UpgradeToastProps {
  message: string;
  daysLeft?: number;
}

const UpgradeToastContent: React.FC<UpgradeToastProps> = ({ message, daysLeft }) => {
  const router = useRouter();

  const handleUpgrade = () => {
    router.push('/pricing');
  };

  const handleClose = () => {
    toast.dismiss();
  };

  const getToastStyles = () => {
    if (daysLeft && daysLeft <= 1) {
      return 'bg-red-50 border-red-200 text-red-800 dark:bg-red-900/20 dark:border-red-800 dark:text-red-200';
    }
    if (daysLeft && daysLeft <= 3) {
      return 'bg-yellow-50 border-yellow-200 text-yellow-800 dark:bg-yellow-900/20 dark:border-yellow-800 dark:text-yellow-200';
    }
    return 'bg-blue-50 border-blue-200 text-blue-800 dark:bg-blue-900/20 dark:border-blue-800 dark:text-blue-200';
  };

  const getButtonStyles = () => {
    if (daysLeft && daysLeft <= 1) {
      return 'bg-red-600 text-white hover:bg-red-700';
    }
    if (daysLeft && daysLeft <= 3) {
      return 'bg-yellow-600 text-white hover:bg-yellow-700';
    }
    return 'bg-blue-600 text-white hover:bg-blue-700';
  };

  return (
    <div className={`p-4 rounded-lg border ${getToastStyles()}`}>
      <div className="flex items-start justify-between">
        <div className="flex items-start space-x-3 flex-1">
          <AlertTriangle className="h-5 w-5 text-red-500 mt-0.5 flex-shrink-0" />
          <div className="flex-1">
            <p className="font-medium text-sm">{message}</p>
            {daysLeft && (
              <p className="text-xs opacity-90 mt-1">
                {daysLeft === 1 ? 'Expires tomorrow!' : `Expires in ${daysLeft} days`}
              </p>
            )}
          </div>
        </div>
        <button
          onClick={handleClose}
          className="ml-2 p-1 rounded-md hover:bg-black/10 dark:hover:bg-white/10 transition-colors flex-shrink-0"
        >
          <X className="h-4 w-4" />
        </button>
      </div>
      <div className="mt-3 flex justify-end">
        <button
          onClick={handleUpgrade}
          className={`px-4 py-2 rounded-md font-medium text-sm transition-colors ${getButtonStyles()}`}
        >
          Upgrade Now
        </button>
      </div>
    </div>
  );
};

export const showUpgradeToast = (message: string, daysLeft?: number) => {
  toast(
    <UpgradeToastContent message={message} daysLeft={daysLeft} />,
    {
      position: "top-right",
      autoClose: false, // Don't auto-close
      hideProgressBar: true,
      closeOnClick: false,
      pauseOnHover: true,
      draggable: true,
      progress: undefined,
      closeButton: false, // Hide default close button
      toastId: "trial-expiration-toast", // Unique ID to deduplicate
    }
  );
};

export default UpgradeToastContent; 