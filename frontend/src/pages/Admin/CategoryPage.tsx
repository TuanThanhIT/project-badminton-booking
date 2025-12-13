import React, { useEffect, useState } from "react";
import { PlusCircle, Search } from "lucide-react";
import { toast } from "react-toastify";
import categoryService from "../../services/Admin/categoryService";
import type { CategoryItem } from "../../types/category";
import type { ApiErrorType } from "../../types/error";
import AddCategoryModal from "../../components/commons/admin/CategoryModal";

const CategoryPage: React.FC = () => {
  const [categories, setCategories] = useState<CategoryItem[]>([]);
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [limit] = useState(10);
  const [showModal, setShowModal] = useState(false);

  const [totalPages, setTotalPages] = useState(1);
  const [totalItems, setTotalItems] = useState(0);

  // Fetch categories
  const fetchCategories = async () => {
    try {
      const res = await categoryService.getCategoriesService(
        page,
        limit,
        search
      );
      setCategories(res.data.data);
      setTotalPages(res.data.pagination.totalPages);
      setTotalItems(res.data.pagination.totalItems);
    } catch (error) {
      const apiError = error as ApiErrorType;
      toast.error(apiError.userMessage || "Lỗi khi tải danh sách danh mục");
    }
  };

  useEffect(() => {
    fetchCategories();
  }, [page, search]);

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearch(e.target.value);
    setPage(1); // reset về trang 1 khi tìm kiếm
  };

  return (
    <div className="flex flex-col min-h-screen bg-gray-50 p-6">
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-800">Quản lý danh mục</h1>

        <button
          onClick={() => setShowModal(true)}
          className="flex items-center gap-2 px-4 py-2 bg-sky-600 hover:bg-sky-700 text-white font-semibold rounded-lg shadow-md transition-all"
        >
          <PlusCircle size={20} />
          Thêm danh mục
        </button>
        <AddCategoryModal
          isOpen={showModal}
          onClose={() => setShowModal(false)}
          onSuccess={fetchCategories}
        />
      </div>

      {/* Thanh tìm kiếm */}
      <div className="flex items-center gap-2 mb-6 bg-white p-3 rounded-xl shadow-sm border border-gray-200 w-full md:w-1/2">
        <Search className="text-gray-500" size={20} />
        <input
          type="text"
          placeholder="Tìm kiếm danh mục..."
          value={search}
          onChange={handleSearchChange}
          className="w-full outline-none bg-transparent text-gray-700 placeholder-gray-400"
        />
      </div>

      {/* Bảng danh mục */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200">
        <table className="w-full text-left">
          <thead>
            <tr className="bg-gray-100 text-gray-700 font-semibold">
              <th className="px-6 py-3 border-b">#</th>
              <th className="px-6 py-3 border-b">Tên danh mục</th>
              <th className="px-6 py-3 border-b">Nhóm menu</th>
              <th className="px-6 py-3 border-b">Ngày tạo</th>
            </tr>
          </thead>
          <tbody>
            {categories.length > 0 ? (
              categories.map((cate, index) => (
                <tr
                  key={cate.id}
                  className="hover:bg-sky-50 transition-colors duration-200"
                >
                  <td className="px-6 py-3 border-b">
                    {(page - 1) * limit + index + 1}
                  </td>
                  <td className="px-6 py-3 border-b font-medium text-gray-900">
                    {cate.cateName}
                  </td>
                  <td className="px-6 py-3 border-b text-gray-700">
                    {cate.menuGroup}
                  </td>
                  <td className="px-6 py-3 border-b text-gray-500 text-sm">
                    {new Date(cate.createdDate).toLocaleDateString("vi-VN")}
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td
                  colSpan={4}
                  className="text-center text-gray-500 italic py-6"
                >
                  Không có danh mục nào
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Phân trang */}
      {totalPages > 1 && (
        <div className="flex justify-center items-center gap-3 mt-6">
          <button
            disabled={page <= 1}
            onClick={() => setPage((prev) => prev - 1)}
            className={`px-4 py-2 rounded-lg border ${
              page <= 1
                ? "bg-gray-100 text-gray-400 cursor-not-allowed"
                : "bg-white hover:bg-gray-100 text-gray-700"
            }`}
          >
            Trang trước
          </button>

          <span className="text-gray-700 font-medium">
            Trang {page} / {totalPages}
          </span>

          <button
            disabled={page >= totalPages}
            onClick={() => setPage((prev) => prev + 1)}
            className={`px-4 py-2 rounded-lg border ${
              page >= totalPages
                ? "bg-gray-100 text-gray-400 cursor-not-allowed"
                : "bg-white hover:bg-gray-100 text-gray-700"
            }`}
          >
            Trang sau
          </button>
        </div>
      )}
    </div>
  );
};

export default CategoryPage;
