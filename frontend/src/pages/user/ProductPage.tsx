import React, { useEffect, useMemo, useState } from "react";
import debounce from "lodash.debounce";
import { useNavigate, useSearchParams } from "react-router-dom";
import { Folder, Filter, Search } from "lucide-react";
import Breadcrumb from "../../components/ui/customer+employee/Breadcrumb";
import ProductFilter from "../../components/ui/user/ProductFilter";
import ProductCard from "../../components/ui/customer+employee/ProductCard";
import PaginatedItems from "../../components/ui/customer+employee/PaginatedItems";
import { useAppDispatch, useAppSelector } from "../../redux/hook";
import { getOtherCategoriesInSameGroup } from "../../redux/slices/user/cateSlice";
import type { OtherCatesParamsRequest } from "../../types/cate";
import type { ProductQueriesRequest } from "../../types/product";
import { getProductsByFilter } from "../../redux/slices/user/productSlice";

const ProductPage = () => {
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const products = useAppSelector((state) => state.product.products);
  const otherCategories = useAppSelector((state) => state.cate.otherCategories);
  const [searchParams] = useSearchParams();

  const cateName = searchParams.get("cateName") ?? "";
  const cateId = Number(searchParams.get("cateId") ?? 0);
  const groupName = searchParams.get("group") ?? "";
  const pricesRange = searchParams.get("pricesRange") ?? undefined;
  const sizes = searchParams.get("sizes") ?? undefined;
  const materials = searchParams.get("materials") ?? undefined;
  const colors = searchParams.get("colors") ?? undefined;
  const sort = searchParams.get("sort") ?? undefined;

  const [isFilterOpen, setIsFilterOpen] = useState<boolean>(false);

  const [page, setPage] = useState(1);
  const limit = 8;
  const [keywordSearch, setKeywordSearch] = useState("");

  const [debouncedKeyword, setDebouncedKeyword] = useState("");

  // Debounce 500ms
  const debouncedSearch = useMemo(
    () =>
      debounce((val: string) => {
        setDebouncedKeyword(val);
      }, 500),
    [],
  );

  useEffect(() => {
    debouncedSearch(keywordSearch);
  }, [keywordSearch, debouncedSearch]);

  // Lấy danh sách danh mục khác trong cùng nhóm
  useEffect(() => {
    const data: OtherCatesParamsRequest = {
      cateId,
    };
    dispatch(getOtherCategoriesInSameGroup({ data }));
  }, [dispatch, cateId, cateName]);

  useEffect(() => {
    const data: ProductQueriesRequest = {
      cateId,
      groupName,
      pricesRange,
      sizes,
      materials,
      colors,
      sort,
      page,
      limit,
      keyword: debouncedKeyword,
    };
    dispatch(getProductsByFilter({ data }));
  }, [
    cateId,
    groupName,
    pricesRange,
    sizes,
    materials,
    colors,
    sort,
    page,
    limit,
    debouncedKeyword,
    dispatch,
  ]);

  return (
    <div className="flex flex-col min-h-screen overflow-y-auto bg-white">
      {/* Breadcrumb */}
      <div className="bg-white px-6 py-4 border-b border-gray-400">
        <Breadcrumb
          cate_id={cateId}
          cate_name={cateName}
          group_name={groupName}
        />
      </div>

      {/* Nội dung chính */}
      <div className="flex flex-col md:flex-row gap-6 px-6 py-6 items-start">
        {/* Sidebar danh mục */}
        <div className="w-full md:w-1/5 bg-white rounded-xl p-4 h-fit">
          <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
            <Folder size={24} className="text-gray-600" />
            Danh mục sản phẩm
          </h3>
          <ul className="flex flex-col gap-3">
            {otherCategories.map((cate) => (
              <li
                key={cate.id}
                className="px-3 py-2 rounded-lg cursor-pointer bg-white hover:bg-sky-100 hover:text-sky-700 transition-all duration-200 text-gray-700 font-medium"
                onClick={() =>
                  navigate(
                    `/products?cateId=${cate.id}&cateName=${encodeURIComponent(
                      cate.cateName,
                    )}&group=${groupName}`,
                  )
                }
              >
                {cate.cateName}
              </li>
            ))}
          </ul>
        </div>

        {/* Cột sản phẩm */}
        <div className="w-full md:w-4/5 p-6 shadow-sm rounded-xl">
          <div className="flex justify-between items-center mb-10">
            <h2 className="text-2xl font-bold text-gray-900 relative inline-block after:content-[''] after:block after:w-20 after:h-1 after:bg-gray-400 after:mt-1 rounded-full">
              {cateName || groupName}
            </h2>

            <div className="flex flex-row gap-3 items-center w-full max-w-md">
              {/* Input với icon */}
              <div className="relative flex-1">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
                  <Search size={18} className="text-sky-700" />
                </span>
                <input
                  type="text"
                  placeholder="Tìm sản phẩm"
                  value={keywordSearch}
                  onChange={(e) => setKeywordSearch(e.target.value)}
                  className="w-full pl-10 pr-3 py-2 border border-gray-400 rounded-lg focus:outline-none transition-all"
                />
              </div>
              <button
                onClick={() => setIsFilterOpen(true)}
                className="flex items-center gap-2 px-5 py-2 bg-sky-600 hover:bg-sky-700 text-white text-sm font-semibold rounded-lg transition-all shadow-md hover:shadow-lg"
              >
                <Filter size={18} />
                Bộ lọc
              </button>
            </div>
          </div>
          {/* Danh sách sản phẩm */}
          {products?.products && products.products.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
              {products.products.map((product) => (
                <ProductCard
                  key={product.id}
                  product={product}
                  group_name={groupName}
                />
              ))}
            </div>
          ) : (
            <div className="flex items-center justify-center min-h-[500px]">
              <p className="text-center text-gray-600 text-lg italic font-medium py-10">
                Không tìm thấy sản phẩm phù hợp.
              </p>
            </div>
          )}

          {products && products.total > limit && (
            <PaginatedItems
              total={products.total ?? 0}
              limit={products.limit ?? limit}
              page={products.page ?? 1}
              onPageChange={(newPage) => setPage(newPage)}
            />
          )}
        </div>

        {/* Side panel cho ProductFilter */}
        {isFilterOpen && (
          <>
            <div className="fixed inset-y-0 right-0 w-full md:w-1/3 bg-white shadow-xl p-6 z-50 overflow-y-auto transition-transform duration-300 transform translate-x-0 rounded-l-xl">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-xl font-semibold">Bộ lọc sản phẩm</h3>
                <button
                  onClick={() => setIsFilterOpen(false)}
                  className="text-gray-600 hover:text-gray-800 text-lg font-bold"
                >
                  ✕
                </button>
              </div>
              {groupName && (
                <ProductFilter
                  cate_id={cateId}
                  cate_name={cateName}
                  group_cate={groupName}
                  setIsFilterOpen={setIsFilterOpen}
                />
              )}
            </div>
            <div
              className="fixed inset-0 bg-black/40 z-40"
              onClick={() => setIsFilterOpen(false)}
            ></div>
          </>
        )}
      </div>
    </div>
  );
};

export default ProductPage;
