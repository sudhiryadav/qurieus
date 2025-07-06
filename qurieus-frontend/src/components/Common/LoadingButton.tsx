import React from "react";
import Loader from "./Loader";

interface LoadingButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  loading?: boolean;
  loadingText?: string;
  children: React.ReactNode;
}

const LoadingButton: React.FC<LoadingButtonProps> = ({
  loading = false,
  loadingText,
  children,
  disabled,
  className = "",
  ...props
}) => {
  return (
    <button
      disabled={disabled || loading}
      className={`flex items-center space-x-2 disabled:opacity-50 disabled:cursor-not-allowed ${className}`}
      {...props}
    >
      {loading && <Loader />}
      <span>
        {loading && loadingText ? loadingText : children}
      </span>
    </button>
  );
};

export default LoadingButton; 