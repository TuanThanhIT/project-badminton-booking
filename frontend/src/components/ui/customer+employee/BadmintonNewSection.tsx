import { useEffect, useState } from "react";
import type { ApiErrorType } from "../../../types/error";
import { toast } from "react-toastify";
import categoryService from "../../../services/customer/categoryService";
import productService from "../../../services/customer/productService";
import type {
  ProductInfo,
  ProductResponse,
  ProPrams,
} from "../../../types/product";
import ProductsRelated from "./ProductsRelated";
import { useNavigate } from "react-router-dom";
import { Box } from "lucide-react";

const BadmintonNewSection = () => {
  const [groupName, setGroupName] = useState<string[]>([]);
  const [activeTab, setActiveTab] = useState<string>("");
  const [productsRelated, setProductsRelated] = useState<ProductInfo[]>([]);

  const navigate = useNavigate();

  // --- Lấy danh sách group ---
  useEffect(() => {
    const fetchGroupName = async () => {
      try {
        const res = await categoryService.getAllGroupName();
        setGroupName(res.data);
        if (res.data.length > 0) setActiveTab(res.data[0]); // tab mặc định
      } catch (error) {
        const apiError = error as ApiErrorType;
        toast.error(apiError.userMessage);
      }
    };
    fetchGroupName();
  }, []);

  // --- Lấy sản phẩm theo group ---
  useEffect(() => {
    if (!activeTab) return;
    const fetchProductByGroupName = async () => {
      try {
        const proParams: ProPrams = { group_name: activeTab };
        const res = await productService.getProductByGroupName(proParams);
        const productsGroup: ProductResponse = res.data;
        const newProductsGroup = productsGroup.products.filter(
          (pg) => pg.isNew === true
        );
        setProductsRelated(newProductsGroup);
      } catch (error) {
        const apiError = error as ApiErrorType;
        toast.error(apiError.userMessage);
      }
    };
    fetchProductByGroupName();
  }, [activeTab]);

  return (
    <section className="flex flex-col items-center w-full gap-5">
      <h3 className="text-3xl font-bold text-sky-800">Sản phẩm mới</h3>
      <div className="w-24 h-1 rounded-full bg-gradient-to-r from-sky-500 to-sky-700 shadow-md transition-all duration-300 hover:scale-x-125 hover:shadow-lg"></div>

      {/* Khung tổng tab + sản phẩm */}
      <div className="w-full bg-white rounded-2xl border border-gray-200 p-5 space-y-5">
        {/* Tab ngang */}
        <div className="overflow-x-auto overflow-y-hidden scrollbar-none">
          <ul className="flex gap-3 min-w-max">
            {groupName.map((g) => (
              <li
                key={g}
                onClick={() => setActiveTab(g)}
                className={`px-5 py-2 rounded-2xl font-medium cursor-pointer text-sm transition-all duration-200
                  ${
                    activeTab === g
                      ? "bg-sky-600 text-white shadow-lg scale-105"
                      : "bg-sky-100 text-sky-700 hover:bg-sky-200 hover:scale-105"
                  }`}
              >
                {g}
              </li>
            ))}
          </ul>
        </div>

        {/* Nội dung sản phẩm */}
        <div>
          {productsRelated.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 text-gray-400 italic text-lg gap-4">
              <Box className="w-12 h-12 text-gray-300" />
              <span>Không có sản phẩm mới trong nhóm này!</span>
            </div>
          ) : (
            <>
              {activeTab && (
                <ProductsRelated
                  productsRelated={productsRelated}
                  group_name={activeTab}
                />
              )}

              {/* Nút xem thêm */}
              <div className="flex justify-center mt-6">
                <button
                  onClick={() =>
                    navigate(`/products?group=${encodeURIComponent(activeTab)}`)
                  }
                  className="px-6 py-2 bg-sky-600 text-white font-medium rounded-lg hover:bg-sky-700 transition-colors duration-200"
                >
                  Xem tất cả
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </section>
  );
};

export default BadmintonNewSection;
