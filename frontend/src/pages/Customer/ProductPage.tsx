import React, { useEffect, useState } from "react";
import { useLocation, useNavigate, useSearchParams } from "react-router-dom";
import { Folder, Filter } from "lucide-react";
import { toast } from "react-toastify";
import Breadcrumb from "../../components/ui/Breadcrumb";
import ProductFilter from "../../components/ui/ProductFilter";
import type { CategoryOtherResponse } from "../../types/category";
import type { ApiErrorType } from "../../types/error";
import categoryService from "../../services/categoryService";

const ProductPage: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const cateName = searchParams.get("category_name") ?? "";
  const cateId = Number(searchParams.get("category_id") ?? 0);
  const menuGroup = searchParams.get("group") ?? "";
  const [categories, setCategories] = useState<CategoryOtherResponse[]>([]);
  const [isFilterOpen, setIsFilterOpen] = useState<boolean>(false);

  // Lấy danh sách danh mục khác trong cùng nhóm
  useEffect(() => {
    const fetchOtherCategories = async () => {
      try {
        const res = await categoryService.getOtherCategoriesService(cateId);
        setCategories(res.data);
      } catch (error) {
        const apiError = error as ApiErrorType;
        toast.error(apiError.userMessage);
      }
    };
    if (cateId) {
      fetchOtherCategories();
    }
  }, [cateId]);

  return (
    <div className="grid grid-rows-[auto_1fr] h-screen gap-4">
      {/* Breadcrumb */}
      <div className="bg-gray-100 px-20 py-4">
        <Breadcrumb cateId={cateId} cateName={cateName} />
      </div>

      <div className="grid grid-cols-[20%_80%] gap-4 px-20 relative">
        {/* Sidebar danh mục */}
        <div className="bg-white shadow-md rounded-2xl p-4 border border-gray-200">
          <h3 className="text-lg font-semibold mb-3 flex items-center gap-2">
            <Folder size={20} className="text-gray-600" />
            Danh mục sản phẩm
          </h3>
          <ul className="flex flex-col gap-2">
            {categories.map((cate) => (
              <li
                key={cate.id}
                className="px-4 py-2 rounded-lg cursor-pointer bg-gray-50 hover:bg-gray-200 hover:text-gray-800 transition-colors duration-200"
                onClick={() =>
                  navigate(
                    `/products?category_id=${
                      cate.id
                    }&category_name=${encodeURIComponent(
                      cate.cateName
                    )}&group=${menuGroup}`
                  )
                }
              >
                {cate.cateName}
              </li>
            ))}
          </ul>
        </div>

        {/* Cột nội dung chính */}
        <div className="bg-gray-50 rounded-2xl p-6 shadow-md border border-gray-200">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-2xl font-semibold">{cateName || "Sản phẩm"}</h2>
            <button
              onClick={() => setIsFilterOpen(true)}
              className="flex items-center gap-2 px-4 py-2 cursor-pointer bg-blue-500 text-white rounded hover:bg-blue-600"
            >
              <Filter size={20} />
              Bộ lọc
            </button>
          </div>
          <p className="text-center">
            Danh sách sản phẩm sẽ được hiển thị ở đây
          </p>
        </div>

        {/* Side panel cho ProductFilter */}
        {isFilterOpen && (
          <div className="fixed inset-y-0 right-0 w-full md:w-1/3 bg-white shadow-xl p-6 z-50 overflow-y-auto transition-transform duration-300 transform translate-x-0">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold">Bộ lọc sản phẩm</h3>
              <button
                onClick={() => setIsFilterOpen(false)}
                className="text-gray-600 hover:text-gray-800 cursor-pointer"
              >
                ✕
              </button>
            </div>
            {menuGroup && (
              <ProductFilter
                cate_id={cateId}
                cate_name={cateName}
                group_cate={menuGroup}
                setIsFilterOpen={setIsFilterOpen}
              />
            )}
          </div>
        )}
        {isFilterOpen && (
          <div
            className="fixed inset-0 bg-black/50 z-40"
            onClick={() => setIsFilterOpen(false)}
          ></div>
        )}
      </div>
    </div>
  );
};

export default ProductPage;
