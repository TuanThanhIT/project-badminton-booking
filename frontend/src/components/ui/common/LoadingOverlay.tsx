import { Loader2 } from "lucide-react";

const LoadingOverlay = ({ text = "Đang tải..." }) => {
  return (
    <div className="fixed inset-0 bg-white/70 backdrop-blur-sm flex flex-col items-center justify-center z-50">
      <Loader2 className="w-12 h-12 text-sky-600 animate-spin" />
      <p className="mt-3 text-gray-700 font-medium">{text}</p>
    </div>
  );
};

export default LoadingOverlay;
