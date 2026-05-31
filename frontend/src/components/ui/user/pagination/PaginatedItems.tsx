import ReactPaginate from "react-paginate";

interface PaginatedItemsProps {
  total: number;
  limit: number;
  page: number;
  onPageChange: (selectedPage: number) => void;
}

function PaginatedItems({
  total,
  limit,
  page,
  onPageChange,
}: PaginatedItemsProps) {
  const pageCount = Math.ceil(total / limit);

  const handlePageClick = (event: { selected: number }) => {
    onPageChange(event.selected + 1);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  if (pageCount <= 1) return null;

  return (
    <div className="mt-8 flex justify-center px-2">
      <div className="inline-flex rounded-2xl border border-slate-200 bg-white p-2 shadow-[0_8px_26px_rgba(15,23,42,0.05)]">
        <ReactPaginate
          previousLabel="‹"
          nextLabel="›"
          breakLabel="..."
          pageCount={pageCount}
          marginPagesDisplayed={1}
          pageRangeDisplayed={3}
          onPageChange={handlePageClick}
          forcePage={page - 1}
          renderOnZeroPageCount={null}
          containerClassName="flex flex-wrap gap-1.5 justify-center items-center select-none"
          pageClassName="list-none"
          previousClassName="list-none"
          nextClassName="list-none"
          breakClassName="list-none"
          pageLinkClassName="
            flex h-9 min-w-9 items-center justify-center
            rounded-xl border border-transparent
            px-3 text-sm font-medium text-slate-600
            transition-all duration-200
            hover:border-sky-200 hover:bg-sky-50 hover:text-sky-700
            cursor-pointer
          "
          previousLinkClassName="
            flex h-9 min-w-9 items-center justify-center
            rounded-xl border border-slate-200 bg-slate-50
            px-3 text-lg font-medium text-slate-600
            transition-all duration-200
            hover:border-sky-200 hover:bg-sky-50 hover:text-sky-700
            cursor-pointer
          "
          nextLinkClassName="
            flex h-9 min-w-9 items-center justify-center
            rounded-xl border border-slate-200 bg-slate-50
            px-3 text-lg font-medium text-slate-600
            transition-all duration-200
            hover:border-sky-200 hover:bg-sky-50 hover:text-sky-700
            cursor-pointer
          "
          activeLinkClassName="
  !border-sky-200 !bg-sky-500 !text-white
  shadow-md shadow-sky-100
  hover:!bg-sky-600 hover:!text-white
"
          breakLinkClassName="
            flex h-9 min-w-9 items-center justify-center
            rounded-xl px-3 text-sm font-medium text-slate-400
          "
          disabledLinkClassName="
            !cursor-not-allowed !border-slate-100 !bg-slate-50
            !text-slate-300
            hover:!border-slate-100 hover:!bg-slate-50 hover:!text-slate-300
          "
        />
      </div>
    </div>
  );
}

export default PaginatedItems;
