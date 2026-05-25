import { ChevronLeft, ChevronRight } from "lucide-react";

type AdminPaginationProps = {
  page: number;
  totalPages: number;
  total: number;
  onPage: (p: number) => void;
  unit?: string;
};

const AdminPagination = ({ page, totalPages, total, onPage, unit }: AdminPaginationProps) => {
  if (totalPages <= 1) return null;
  return (
    <div className="flex items-center justify-between px-4 py-3 border-t border-gray-100 bg-gray-50/70">
      <p className="text-sm text-gray-500">
        Trang <b>{page}</b> / {totalPages} · Tổng <b className="text-sky-600">{total}</b>
        {unit ? ` ${unit}` : ""}
      </p>
      <div className="flex gap-1">
        <button
          onClick={() => onPage(Math.max(1, page - 1))}
          disabled={page === 1}
          className="w-8 h-8 rounded-lg border border-gray-300 flex items-center justify-center disabled:opacity-40 hover:bg-gray-100 transition"
        >
          <ChevronLeft className="w-4 h-4" />
        </button>
        <button
          onClick={() => onPage(Math.min(totalPages, page + 1))}
          disabled={page === totalPages}
          className="w-8 h-8 rounded-lg border border-gray-300 flex items-center justify-center disabled:opacity-40 hover:bg-gray-100 transition"
        >
          <ChevronRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};

export default AdminPagination;
