import { useEffect, useMemo, useState } from "react";
import debounce from "lodash.debounce";
import { useNavigate, useSearchParams } from "react-router-dom";
import { Folder, Filter, Search, MapPinned } from "lucide-react";
import Breadcrumb from "../../components/ui/user/Breadcrumb";
import ProductFilter from "../../components/ui/user/ProductFilter";
import ProductCard from "../../components/ui/user/ProductCard";
import PaginatedItems from "../../components/ui/user/PaginatedItems";
import { useAppDispatch, useAppSelector } from "../../redux/hook";
import { getOtherCategoriesInSameGroup } from "../../redux/slices/user/cateSlice";
import type { OtherCatesParamsRequest } from "../../types/cate";
import { getProductsByFilter } from "../../redux/slices/user/productSlice";
import { getAllBranchesFull } from "../../redux/slices/user/branchSlice";
import type { ProductQueriesRequest } from "../../types/product";

const ProductPage = () => {
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const products = useAppSelector((state) => state.product.products);
  const otherCategories = useAppSelector((state) => state.cate.otherCategories);
  const branches = useAppSelector((state) => state.branch.branches);
  const [searchParams, setSearchParams] = useSearchParams();

  const query = useMemo(() => {
    return {
      cateName: searchParams.get("cateName") ?? "",
      cateId: Number(searchParams.get("cateId") ?? 0),
      branchId: searchParams.get("branchId") ?? undefined,
      groupName: searchParams.get("groupName") ?? "",
      pricesRange: searchParams.get("pricesRange") ?? undefined,
      sizes: searchParams.get("sizes") ?? undefined,
      materials: searchParams.get("materials") ?? undefined,
      colors: searchParams.get("colors") ?? undefined,
      sort: searchParams.get("sort") ?? undefined,
    };
  }, [searchParams]);

  const {
    cateId,
    cateName,
    groupName,
    branchId,
    pricesRange,
    sizes,
    materials,
    colors,
    sort,
  } = query;

  const [isFilterOpen, setIsFilterOpen] = useState<boolean>(false);

  const [page, setPage] = useState(1);
  const limit = 8;
  const [keywordSearch, setKeywordSearch] = useState("");
  const [searchBranch, setSearchBranch] = useState("");

  const [debouncedKeyword, setDebouncedKeyword] = useState("");

  const [selectedBranch, setSelectedBranch] = useState<number[]>(() => {
    const savedBranch = localStorage.getItem("branchIds");
    return savedBranch ? JSON.parse(savedBranch) : [];
  });

  // Debounce 500ms
  const debouncedSearch = useMemo(
    () =>
      debounce((val: string) => {
        setDebouncedKeyword(val);
      }, 500),
    [],
  );

  const productQuery: ProductQueriesRequest = useMemo(() => {
    return {
      cateId,
      branchId,
      pricesRange,
      sizes,
      materials,
      colors,
      sort,
      page,
      limit,
      keyword: debouncedKeyword,
    };
  }, [
    cateId,
    branchId,
    pricesRange,
    sizes,
    materials,
    colors,
    sort,
    page,
    limit,
    debouncedKeyword,
  ]);

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
    dispatch(getProductsByFilter({ data: productQuery }));
  }, [productQuery, dispatch]);

  useEffect(() => {
    dispatch(getAllBranchesFull());
  }, [dispatch]);

  const handleChange = (value: number) => {
    if (selectedBranch.includes(value)) {
      setSelectedBranch(selectedBranch.filter((item) => item !== value));
    } else {
      setSelectedBranch([...selectedBranch, value]);
    }
  };

  useEffect(() => {
    const params = new URLSearchParams(searchParams);
    if (selectedBranch.length > 0) {
      params.set("branchId", selectedBranch.join(","));
    } else {
      params.delete("branchId");
    }
    setSearchParams(params);
  }, [selectedBranch]);

  useEffect(() => {
    localStorage.setItem("branchIds", JSON.stringify(selectedBranch));
  }, [selectedBranch]);

  return (
    <div className="flex flex-col min-h-screen overflow-y-auto bg-white">
      {/* Breadcrumb */}
      <div className="bg-white px-6 py-4 border-b border-gray-400">
        <Breadcrumb cateId={cateId} cateName={cateName} groupName={groupName} />
      </div>

      {/* Nội dung chính */}
      <div className="flex flex-col md:flex-row gap-6 px-6 py-6 items-start">
        {/* Sidebar danh mục */}

        <div className="w-full md:w-1/5 bg-white rounded-2xl shadow-sm border border-gray-300 p-5 h-fit flex flex-col gap-6">
          {/* CHI NHÁNH */}
          <div>
            <h3 className="font-semibold mb-4 flex items-center gap-2 border-b pb-2 border-gray-500">
              <MapPinned size={20} className="text-sky-500" />
              CHI NHÁNH CỬA HÀNG
            </h3>

            {/* SEARCH */}
            <div className="relative flex-1">
              <span className="absolute left-3 top-1/3 -translate-y-1/3 text-gray-500">
                <Search size={18} className="text-sky-700" />
              </span>
              <input
                type="text"
                placeholder="Tìm chi nhánh..."
                className="w-full mb-3 pl-10 pr-3 py-1 border border-gray-400 rounded-lg outline-none "
                value={searchBranch}
                onChange={(e) => setSearchBranch(e.target.value)}
              />
            </div>

            {/* LIST */}
            <ul className="flex flex-col gap-2 max-h-100 overflow-y-auto pr-1">
              {branches
                .filter((branch) =>
                  branch.branchName
                    .toLowerCase()
                    .includes(searchBranch.toLowerCase()),
                )
                .map((branch) => (
                  <li
                    key={branch.id}
                    className="flex items-center gap-3 px-3 py-2 rounded-md hover:bg-sky-50 hover:text-sky-600 hover:-translate-0.5 transition"
                  >
                    <input
                      type="checkbox"
                      checked={selectedBranch.includes(branch.id)}
                      onChange={() => handleChange(branch.id)}
                      className="cursor-pointer w-4 h-4 accent-sky-500"
                    />
                    <span className="text-gray-700">{branch.branchName}</span>
                  </li>
                ))}
            </ul>
          </div>
          {/* DANH MỤC */}
          <div>
            <h3 className="font-semibold mb-4 flex items-center gap-2 border-b pb-2 border-gray-500">
              <Folder size={20} className="text-sky-500" />
              DANH MỤC SẢN PHẨM
            </h3>

            <ul className="flex flex-col gap-2">
              {otherCategories.map((cate) => (
                <li
                  key={cate.id}
                  className="px-3 py-2 rounded-lg cursor-pointer hover:bg-sky-50 hover:text-sky-600 hover:-translate-0.5 transition text-gray-700 "
                  onClick={() =>
                    navigate(
                      `/products?cateId=${cate.id}&cateName=${encodeURIComponent(
                        cate.cateName,
                      )}&groupName=${groupName}`,
                    )
                  }
                >
                  {cate.cateName}
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Cột sản phẩm */}
        <div className="w-full md:w-4/5 p-6 shadow-sm border border-gray-300 rounded-xl">
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
                  placeholder="Tìm sản phẩm..."
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
                  groupName={groupName}
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
            <div className="fixed inset-y-0 right-0 w-full md:w-3/10 bg-white shadow-xl z-50 flex flex-col h-screen rounded-l-xl">
              {/* Header */}
              <div className="flex justify-between items-center p-6 border-b shrink-0">
                <h3 className="text-xl font-semibold">Bộ lọc sản phẩm</h3>

                <button
                  onClick={() => setIsFilterOpen(false)}
                  className="text-gray-600 hover:text-gray-800 text-lg font-bold"
                >
                  ✕
                </button>
              </div>

              {/* Content */}
              <div className="flex-1 min-h-0 p-6">
                {groupName && (
                  <ProductFilter
                    cateId={cateId}
                    cateName={cateName}
                    groupName={groupName}
                    setIsFilterOpen={setIsFilterOpen}
                  />
                )}
              </div>
            </div>

            {/* Overlay */}
            <div
              className="fixed inset-0 bg-black/40 z-40"
              onClick={() => setIsFilterOpen(false)}
            />
          </>
        )}
      </div>
    </div>
  );
};

export default ProductPage;
