import React from "react";

interface LoadingButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement> {
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
      className={`inline-flex items-center justify-center gap-2 rounded-2xl bg-sky-600 px-5 py-3 text-sm font-semibold text-white shadow-lg shadow-sky-100 transition hover:bg-sky-700 active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-70 ${className}`}
      {...props}
    >
      {loading && (
        <span className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
      )}
      {loading ? "Đang gửi..." : children}
    </button>
  );
};

export default LoadingButton;
