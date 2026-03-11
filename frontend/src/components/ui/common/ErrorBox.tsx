import { AlertCircle } from "lucide-react";

interface ErrorBoxProps {
  message?: string;
}

const ErrorBox = ({
  message = "Có lỗi xảy ra. Vui lòng thử lại.",
}: ErrorBoxProps) => {
  return (
    <div className="flex flex-col items-center justify-center py-10 text-center bg-red-50 border border-red-200 rounded-xl">
      <AlertCircle className="w-10 h-10 text-red-500 mb-2" />
      <p className="text-red-600 font-medium">{message}</p>
    </div>
  );
};

export default ErrorBox;
