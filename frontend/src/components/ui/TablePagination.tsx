import { ChevronLeft, ChevronRight } from "lucide-react";

type TablePaginationProps = {
  page: number;
  totalPages: number;
  total: number;
  onPage: (page: number) => void;
  unit?: string;
  alwaysShow?: boolean;
};

const TablePagination = ({
  page,
  totalPages,
  total,
  onPage,
  unit,
  alwaysShow,
}: TablePaginationProps) => {
  const displayTotalPages = Math.max(totalPages, 1);
  const currentPage = Math.min(Math.max(page, 1), displayTotalPages);
  if (!alwaysShow && displayTotalPages <= 1) return null;

  const pages = Array.from({ length: Math.min(5, displayTotalPages) }, (_, index) => {
    if (displayTotalPages <= 5) return index + 1;
    if (currentPage <= 3) return index + 1;
    if (currentPage >= displayTotalPages - 2) return displayTotalPages - 4 + index;
    return currentPage - 2 + index;
  });

  return (
    <div className="table-pagination flex items-center justify-between border-t border-slate-100 bg-slate-50/80 px-4 py-3">
      <p className="text-sm text-slate-500">
        Trang <b className="text-slate-800">{currentPage}</b> / {displayTotalPages} · Tổng{" "}
        <b className="text-sky-600">{total}</b>
        {unit ? ` ${unit}` : ""}
      </p>
      <div className="flex items-center gap-1">
        <button
          type="button"
          onClick={() => onPage(Math.max(1, currentPage - 1))}
          disabled={currentPage === 1}
          className="flex h-8 w-8 items-center justify-center rounded-lg border border-slate-200 bg-white text-slate-600 transition hover:bg-slate-100 disabled:cursor-not-allowed disabled:opacity-40"
        >
          <ChevronLeft className="h-4 w-4" />
        </button>
        {pages.map((item) => (
          <button
            type="button"
            key={item}
            onClick={() => onPage(item)}
            className={`h-8 min-w-8 rounded-lg border px-2 text-xs font-semibold transition ${
              item === currentPage
                ? "border-sky-600 bg-sky-600 text-white"
                : "border-slate-200 bg-white text-slate-600 hover:bg-slate-100"
            }`}
          >
            {item}
          </button>
        ))}
        <button
          type="button"
          onClick={() => onPage(Math.min(displayTotalPages, currentPage + 1))}
          disabled={currentPage === displayTotalPages}
          className="flex h-8 w-8 items-center justify-center rounded-lg border border-slate-200 bg-white text-slate-600 transition hover:bg-slate-100 disabled:cursor-not-allowed disabled:opacity-40"
        >
          <ChevronRight className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
};

export default TablePagination;
