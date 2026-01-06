import { ChevronLeft, ChevronRight } from "lucide-react";

const LIMIT = 10;

interface PaginationProps {
  page: number;
  total: number;
  onPrev: () => void;
  onNext: () => void;
}

const Pagination = ({ page, total, onPrev, onNext }: PaginationProps) => {
  return (
    <div className="flex justify-end items-center gap-3 text-sm mt-2">
      <button
        disabled={page === 1}
        onClick={onPrev}
        className="p-1.5 border rounded-md disabled:opacity-40"
      >
        <ChevronLeft size={16} />
      </button>

      <span className="text-gray-600">Trang {page}</span>

      <button
        disabled={page * LIMIT >= total}
        onClick={onNext}
        className="p-1.5 border rounded-md disabled:opacity-40"
      >
        <ChevronRight size={16} />
      </button>
    </div>
  );
};
export default Pagination;
