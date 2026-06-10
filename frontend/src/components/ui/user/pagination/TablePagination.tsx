import { ChevronLeft, ChevronRight } from "lucide-react";

type TablePaginationProps = {
  page: number;
  totalPages: number;
  total: number;
  onPage: (page: number) => void;
  unit?: string;
  alwaysShow?: boolean;
  compact?: boolean;
};

const TablePagination = ({
  page,
  totalPages,
  total,
  onPage,
  unit,
  alwaysShow,
  compact = false,
}: TablePaginationProps) => {
  const displayTotalPages = Math.max(totalPages, 1);
  const currentPage = Math.min(Math.max(page, 1), displayTotalPages);
  if (!alwaysShow && displayTotalPages <= 1) return null;

  const pages = Array.from(
    { length: Math.min(5, displayTotalPages) },
    (_, index) => {
      if (displayTotalPages <= 5) return index + 1;
      if (currentPage <= 3) return index + 1;
      if (currentPage >= displayTotalPages - 2) {
        return displayTotalPages - 4 + index;
      }
      return currentPage - 2 + index;
    },
  );

  const wrapperClass = compact
    ? "table-pagination flex flex-col gap-2 rounded-b-2xl border-t border-slate-200 bg-slate-50 px-3 py-2.5 sm:flex-row sm:items-center sm:justify-between"
    : "table-pagination flex flex-col gap-2 rounded-b-2xl border-t border-slate-200 bg-slate-50 px-4 py-3 sm:flex-row sm:items-center sm:justify-between";

  const controlClass = compact
    ? "flex h-8 w-8 items-center justify-center rounded-xl border border-slate-200 bg-white text-slate-500 transition hover:border-sky-200 hover:bg-sky-50 hover:text-sky-700 disabled:cursor-not-allowed disabled:bg-slate-100 disabled:text-slate-300"
    : "flex h-9 w-9 items-center justify-center rounded-xl border border-slate-200 bg-white text-slate-500 transition hover:border-sky-200 hover:bg-sky-50 hover:text-sky-700 disabled:cursor-not-allowed disabled:bg-slate-100 disabled:text-slate-300";

  const pageClass = (item: number) =>
    `${compact ? "h-8 min-w-8 px-2" : "h-9 min-w-9 px-2.5"} rounded-xl border text-sm font-semibold transition ${
      item === currentPage
        ? "border-sky-600 bg-sky-600 text-white shadow-sm shadow-sky-200"
        : "border-slate-200 bg-white text-slate-700 hover:border-sky-200 hover:bg-sky-50 hover:text-sky-700"
    }`;

  return (
    <div className={wrapperClass}>
      <p
        className={`${compact ? "text-xs" : "text-sm"} font-medium text-slate-600 sm:whitespace-nowrap`}
      >
        Trang <b className="font-semibold text-slate-800">{currentPage}</b> /{" "}
        {displayTotalPages}
        <span className="px-1 text-slate-400">·</span>
        Tổng <b className="font-semibold text-sky-600">{total}</b>
        {unit ? ` ${unit}` : ""}
      </p>
      <div
        className={`flex items-center ${compact ? "flex-nowrap gap-1" : "flex-wrap gap-1.5"}`}
      >
        <button
          type="button"
          onClick={() => onPage(Math.max(1, currentPage - 1))}
          disabled={currentPage === 1}
          className={controlClass}
          aria-label="Trang trước"
        >
          <ChevronLeft className="h-4 w-4" />
        </button>
        {pages.map((item) => (
          <button
            type="button"
            key={item}
            onClick={() => onPage(item)}
            className={pageClass(item)}
          >
            {item}
          </button>
        ))}
        <button
          type="button"
          onClick={() => onPage(Math.min(displayTotalPages, currentPage + 1))}
          disabled={currentPage === displayTotalPages}
          className={controlClass}
          aria-label="Trang sau"
        >
          <ChevronRight className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
};

export default TablePagination;
