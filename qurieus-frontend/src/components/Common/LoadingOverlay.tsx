import React from "react";
import { Loader2 } from "lucide-react";

interface LoadingOverlayProps {
  loading: boolean;
  icon?: React.ReactNode;
  htmlText?: string;
  position?: "fixed" | "absolute"; // New prop
}

const LoadingOverlay: React.FC<LoadingOverlayProps> = ({
  loading,
  icon = <Loader2 className="h-8 w-8 animate-spin text-primary" />,
  htmlText = "Loading...",
  position = "fixed", // Default to fixed
}) => {
  if (!loading) return null;

  return (
    <div
      className={`${position} inset-0 z-[9999] flex items-center justify-center bg-white/80 dark:bg-gray-900/80 backdrop-blur-sm`}
      style={position === "absolute" ? { position: "absolute" } : {}}
    >
      <div className="flex flex-col items-center gap-3 p-6 rounded-lg bg-white dark:bg-gray-800 shadow-lg border border-gray-200 dark:border-gray-700">
        {icon}
        <p className="text-sm font-medium text-gray-700 dark:text-gray-300">
          {htmlText}
        </p>
      </div>
    </div>
  );
};

export default LoadingOverlay; 