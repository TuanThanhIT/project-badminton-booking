import { Inbox } from "lucide-react";

interface EmptyStateProps {
  title?: string;
  description?: string;
}

const EmptyState = ({
  title = "Không có dữ liệu",
  description = "Hiện chưa có dữ liệu để hiển thị.",
}: EmptyStateProps) => {
  return (
    <div className="flex flex-col items-center justify-center py-12 text-center bg-gray-50 border border-gray-200 rounded-xl">
      <Inbox className="w-12 h-12 text-gray-400 mb-3" />
      <h3 className="text-lg font-semibold text-gray-700">{title}</h3>
      <p className="text-gray-500 text-sm mt-1">{description}</p>
    </div>
  );
};

export default EmptyState;
