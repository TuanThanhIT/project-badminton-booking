import { ChevronLeft, ChevronRight } from "lucide-react";

type PaginationProps = {
  page: number;
  totalPages: number;
  onPageChange: (page: number) => void;
};

const Pagination = ({ page, totalPages, onPageChange }: PaginationProps) => {
  if (totalPages <= 1) return null;

  return (
    <div className="flex items-center justify-end gap-2 mt-4">
      <button
        disabled={page === 1}
        onClick={() => onPageChange(page - 1)}
        className="p-2 border rounded-lg disabled:opacity-40 hover:bg-gray-100"
      >
        <ChevronLeft size={18} />
      </button>

      {Array.from({ length: totalPages }).map((_, i) => {
        const p = i + 1;
        return (
          <button
            key={p}
            onClick={() => onPageChange(p)}
            className={`px-3 py-1.5 rounded-lg border text-sm
              ${
                p === page
                  ? "bg-sky-600 text-white border-sky-600"
                  : "hover:bg-gray-100"
              }`}
          >
            {p}
          </button>
        );
      })}

      <button
        disabled={page === totalPages}
        onClick={() => onPageChange(page + 1)}
        className="p-2 border rounded-lg disabled:opacity-40 hover:bg-gray-100"
      >
        <ChevronRight size={18} />
      </button>
    </div>
  );
};

export default Pagination;
