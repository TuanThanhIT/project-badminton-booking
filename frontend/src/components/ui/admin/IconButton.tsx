import React from "react";
import type { LucideProps } from "lucide-react";

type Props = {
  text?: string;
  textColor?: string;
  color?: string;
  hoverColor?: string;
  border?: string;
  onClick?: (e?: React.MouseEvent<HTMLButtonElement, MouseEvent>) => void;
  type?: "button" | "submit" | "reset";
  icon: React.ComponentType<LucideProps>;
  loading?: boolean;
  loadingText?: string;
};

const IconButton: React.FC<Props> = ({
  icon: Icon,
  text,
  textColor = "text-white",
  color = "bg-blue-500",
  hoverColor = "hover:opacity-90",
  border = "",
  onClick,
  type = "button",
  loading = false,
  loadingText = "Lưu...",
}) => {
  return (
    <button
      type={type}
      onClick={onClick}
      disabled={loading}
      className={`px-4 py-2 rounded-xl flex items-center gap-2 transition ${color} ${textColor} ${hoverColor} ${border} ${
        loading ? "opacity-50 cursor-not-allowed" : "cursor-pointer"
      }`}
    >
      <Icon size={16} />
      {loading ? loadingText : text}
    </button>
  );
};

export default IconButton;
