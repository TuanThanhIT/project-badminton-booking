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
        marginPagesDisplayed={1}
        pageRangeDisplayed={3}
        onPageChange={handlePageClick}
        forcePage={page - 1}
        renderOnZeroPageCount={null}
        containerClassName="flex flex-wrap gap-2 justify-center items-center select-none"
        pageClassName="list-none"
        previousClassName="list-none"
        nextClassName="list-none"
        breakClassName="list-none"
        // Nút số trang
        pageLinkClassName="
      flex items-center justify-center w-8 h-8 rounded-lg border border-gray-300
      text-gray-700 font-medium transition-all duration-200
      hover:bg-sky-50 hover:border-sky-400 cursor-pointer
    "
        previousLinkClassName="
      flex items-center justify-center w-8 h-8 rounded-lg border border-gray-300
      text-gray-700 font-bold text-base transition-all duration-200
      hover:bg-sky-50 hover:border-sky-400 cursor-pointer
    "
        nextLinkClassName="
      flex items-center justify-center w-8 h-8 rounded-lg border border-gray-300
      text-gray-700 font-bold text-base transition-all duration-200
      hover:bg-sky-50 hover:border-sky-400 cursor-pointer
    "
        // Active page
        activeLinkClassName="
      !bg-sky-500 !border-sky-500 !text-white shadow-md
      hover:!bg-sky-600
    "
        // Break (...)
        breakLinkClassName="
      px-3 py-2 text-gray-400 font-semibold
    "
        // Disabled
        disabledLinkClassName="
      !text-gray-300 !border-gray-200 !cursor-not-allowed
      hover:!bg-white hover:!border-gray-200
    "
      />
    </div>
  );
}

export default PaginatedItems;
