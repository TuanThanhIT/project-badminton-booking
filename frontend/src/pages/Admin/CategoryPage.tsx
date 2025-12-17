import React, { useEffect, useState } from "react";
import { PlusCircle, Search } from "lucide-react";
import { toast } from "react-toastify";

import categoryService from "../../services/admin/categoryService";
import type { CategoryItem } from "../../types/category";
import type { ApiErrorType } from "../../types/error";

import AddCategoryModal from "../../components/ui/admin/CategoryModal";
import Pagination from "../../components/ui/admin/Pagination";

const LIMIT = 10;

const CategoryPage: React.FC = () => {
  const [categories, setCategories] = useState<CategoryItem[]>([]);
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [showModal, setShowModal] = useState(false);

  const [totalItems, setTotalItems] = useState(0);

  /* ================= FETCH DATA ================= */
  const fetchCategories = async () => {
    try {
      const res = await categoryService.getCategoriesService(
        page,
        LIMIT,
        search
      );

      setCategories(res.data.data);
      setTotalItems(res.data.pagination.totalItems);
    } catch (error) {
      const apiError = error as ApiErrorType;
      toast.error(apiError.userMessage || "Lỗi khi tải danh sách danh mục");
    }
  };

  useEffect(() => {
    fetchCategories();
  }, [page, search]);

  /* ================= HANDLERS ================= */
  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearch(e.target.value);
    setPage(1);
  };

  /* ================= RENDER ================= */
  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      <div className="bg-white rounded-2xl border border-gray-200 p-10 space-y-6">
        {/* ===== HEADER ===== */}
        <div className="flex items-center justify-between mb-6">
          <h1 className="inline-flex items-center gap-2 text-2xl font-bold text-sky-700 relative">
            Quản lý danh mục
            <span className="absolute left-0 -bottom-3 w-1/2 h-1 bg-sky-400 rounded-sm"></span>
          </h1>

          <button
            onClick={() => setShowModal(true)}
            className="flex items-center gap-2 px-2 py-2 bg-sky-600 hover:bg-sky-700 text-white font-semibold rounded-lg shadow-md transition-all"
          >
            <PlusCircle size={20} />
            Thêm danh mục
          </button>
        </div>

        {/* ===== SEARCH ===== */}
        <div className="flex items-center gap-2 bg-white px-3 py-2 rounded-lg border border-gray-300 w-full md:w-1/3 focus-within:border-sky-400 transition">
          <Search className="text-gray-400" size={16} />
          <input
            type="text"
            placeholder="Tìm kiếm danh mục..."
            value={search}
            onChange={handleSearchChange}
            className="w-full bg-transparent outline-none text-sm text-gray-700 placeholder-gray-400"
          />
        </div>

        {/* ===== TABLE ===== */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
          <table className="w-full text-left text-sm">
            <thead>
              <tr className="bg-gray-50 text-gray-600 uppercase text-xs tracking-wide">
                <th className="px-6 py-4 border-b w-14 text-center">#</th>
                <th className="px-6 py-4 border-b">Tên danh mục</th>
                <th className="px-6 py-4 border-b">Nhóm menu</th>
                <th className="px-6 py-4 border-b text-right">Ngày tạo</th>
              </tr>
            </thead>

            <tbody className="divide-y divide-gray-100">
              {categories.length > 0 ? (
                categories.map((cate, index) => (
                  <tr
                    key={cate.id}
                    className="group hover:bg-sky-50/60 transition-all duration-200"
                  >
                    {/* STT */}
                    <td className="px-6 py-4 text-center text-gray-500">
                      {(page - 1) * LIMIT + index + 1}
                    </td>

                    {/* Tên danh mục */}
                    <td className="px-6 py-4">
                      <p className="font-semibold text-gray-800">
                        {cate.cateName}
                      </p>
                    </td>

                    {/* Nhóm menu */}
                    <td className="px-6 py-4">
                      <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-sky-100 text-sky-700">
                        {cate.menuGroup}
                      </span>
                    </td>

                    {/* Ngày tạo */}
                    <td className="px-6 py-4 text-right text-gray-500">
                      {new Date(cate.createdDate).toLocaleDateString("vi-VN")}
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td
                    colSpan={4}
                    className="py-10 text-center text-gray-400 italic"
                  >
                    Không có danh mục nào
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* ===== PAGINATION ===== */}
        {totalItems > LIMIT && (
          <div className="flex justify-end">
            <Pagination
              page={page}
              total={totalItems}
              onPrev={() => setPage((prev) => Math.max(1, prev - 1))}
              onNext={() => setPage((prev) => prev + 1)}
            />
          </div>
        )}

        {/* ===== MODAL ===== */}
        <AddCategoryModal
          isOpen={showModal}
          onClose={() => setShowModal(false)}
          onSuccess={fetchCategories}
        />
      </div>
    </div>
  );
};

export default CategoryPage;
