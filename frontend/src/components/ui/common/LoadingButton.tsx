import React from "react";

interface LoadingButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  loading?: boolean;
}

const LoadingButton: React.FC<LoadingButtonProps> = ({
  loading = false,
  children,
  className = "",
  ...props
}) => {
  return (
    <button
      disabled={loading}
      className={`flex items-center justify-center gap-2 px-4 py-2 rounded-md bg-blue-600 text-white hover:bg-blue-700 disabled:opacity-70 disabled:cursor-not-allowed ${className}`}
      {...props}
    >
      {loading && (
        <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
      )}
      {loading ? "Đang gửi..." : children}
    </button>
  );
};

export default LoadingButton;
