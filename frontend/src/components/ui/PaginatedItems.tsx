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
    <div className="flex justify-center mt-10">
      <ReactPaginate
        previousLabel="❮"
        nextLabel="❯"
        breakLabel="..."
        pageCount={pageCount}
        marginPagesDisplayed={2}
        pageRangeDisplayed={5}
        onPageChange={handlePageClick}
        forcePage={page - 1}
        renderOnZeroPageCount={null}
        // === SIÊU QUAN TRỌNG: ép các <li> hiển thị ngang ===
        containerClassName="flex items-center gap-3 flex-wrap justify-center select-none"
        pageClassName="list-none" /* bỏ bullet */
        previousClassName="list-none"
        nextClassName="list-none"
        breakClassName="list-none"
        disabledClassName="list-none"
        // Nút số trang + prev/next
        pageLinkClassName="flex items-center justify-center w-11 h-11 rounded-full border-2 border-sky-300 hover:border-sky-400 hover:bg-sky-50 text-gray-700 font-medium transition-all duration-200 cursor-pointer"
        previousLinkClassName="flex items-center justify-center w-11 h-11 rounded-full border-2 border-sky-300 hover:border-sky-400 hover:bg-sky-50 text-gray-700 font-bold text-xl transition-all duration-200 cursor-pointer"
        nextLinkClassName="flex items-center justify-center w-11 h-11 rounded-full border-2 border-sky-300 hover:border-sky-400 hover:bg-sky-50 text-gray-700 font-bold text-xl transition-all duration-200 cursor-pointer"
        // Active
        activeLinkClassName="!bg-sky-500 !border-sky-500 !text-white shadow-lg hover:!bg-sky-600"
        // Break (...)
        breakLinkClassName="px-4 py-2 text-gray-400"
        // Disabled
        disabledLinkClassName="!text-gray-300 !border-gray-200 !cursor-not-allowed hover:!bg-white hover:!border-gray-200"
      />
    </div>
  );
}

export default PaginatedItems;
