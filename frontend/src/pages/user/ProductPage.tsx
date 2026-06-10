import { useEffect, useMemo, useState } from "react";
import debounce from "lodash.debounce";
import { useNavigate, useSearchParams } from "react-router-dom";
import { Folder, Filter, Search, MapPinned, X } from "lucide-react";

import Breadcrumb from "../../components/ui/user/category/Breadcrumb";
import ProductFilter from "../../components/ui/user/product/ProductFilter";
import ProductCard from "../../components/ui/user/product/ProductCard";
import PaginatedItems from "../../components/ui/user/pagination/PaginatedItems";

import { useAppDispatch, useAppSelector } from "../../redux/hook";

import {
  getCategoriesGrouped,
  getCategoriesByGroup,
  getOtherCategoriesInSameGroup,
} from "../../redux/slices/user/cateSlice";
import { getProductsByFilter } from "../../redux/slices/user/productSlice";
import { getBranchOptions } from "../../redux/slices/user/branchSlice";

import type { OtherCatesParamsRequest } from "../../types/cate";
import type { ProductQueriesRequest } from "../../types/product";

const ProductPage = () => {
  const navigate = useNavigate();

  const dispatch = useAppDispatch();

  const products = useAppSelector((state) => state.product.products);

  const categoriesGroup = useAppSelector((state) => state.cate.categoriesGroup);

  const otherCategories = useAppSelector((state) => state.cate.otherCategories);

  const branches = useAppSelector((state) => state.branch.branchOptions);

  const [searchParams, setSearchParams] = useSearchParams();

  const query = useMemo(() => {
    return {
      cateName: searchParams.get("cateName") ?? "",
      cateId: Number(searchParams.get("cateId") ?? 0),
      branchId: searchParams.get("branchId") ?? undefined,
      groupName:
        searchParams.get("groupName") ?? searchParams.get("group") ?? "",
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

  const [isFilterOpen, setIsFilterOpen] = useState(false);

  const [page, setPage] = useState(1);

  const limit = 9;

  const [keywordSearch, setKeywordSearch] = useState("");

  const [searchBranch, setSearchBranch] = useState("");

  const [debouncedKeyword, setDebouncedKeyword] = useState("");

  const [selectedBranch, setSelectedBranch] = useState<number[]>(() => {
    const savedBranch = localStorage.getItem("branchIds");

    return savedBranch ? JSON.parse(savedBranch) : [];
  });

  useEffect(() => {
    setPage(1);
  }, [cateId, groupName]);

  const debouncedSearch = useMemo(
    () =>
      debounce((val: string) => {
        setDebouncedKeyword(val);
      }, 500),
    [],
  );

  const productQuery: ProductQueriesRequest = useMemo(() => {
    return {
      cateId: cateId || undefined,
      groupName: groupName || undefined,
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
    groupName,
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
    if (!groupName && !cateId) {
      dispatch(getCategoriesGrouped());
    }
  }, [dispatch, groupName, cateId]);

  useEffect(() => {
    if (groupName || cateId || categoriesGroup.length === 0) return;

    const firstGroup = categoriesGroup[0]?.menuGroup;
    if (!firstGroup) return;

    const params = new URLSearchParams(searchParams);
    params.set("groupName", firstGroup);
    params.delete("group");
    setSearchParams(params, { replace: true });
  }, [categoriesGroup, cateId, groupName, searchParams, setSearchParams]);

  useEffect(() => {
    debouncedSearch(keywordSearch);

    return () => {
      debouncedSearch.cancel();
    };
  }, [keywordSearch, debouncedSearch]);

  useEffect(() => {
    if (groupName) {
      dispatch(
        getCategoriesByGroup({
          data: { groupName },
        }),
      );
      return;
    }

    if (cateId) {
      const data: OtherCatesParamsRequest = {
        cateId,
      };

      dispatch(
        getOtherCategoriesInSameGroup({
          data,
        }),
      );
    }
  }, [dispatch, cateId, groupName]);

  useEffect(() => {
    if (!groupName && !cateId) return;

    dispatch(
      getProductsByFilter({
        data: productQuery,
      }),
    );
  }, [dispatch, productQuery, groupName, cateId]);

  useEffect(() => {
    dispatch(getBranchOptions());
  }, [dispatch]);

  const handleChange = (value: number) => {
    if (selectedBranch.includes(value)) {
      setSelectedBranch(selectedBranch.filter((item) => item !== value));
    } else {
      setSelectedBranch([...selectedBranch, value]);
    }

    setPage(1);
  };

  useEffect(() => {
    setSearchParams((currentParams) => {
      const params = new URLSearchParams(currentParams);

      if (selectedBranch.length > 0) {
        params.set("branchId", selectedBranch.join(","));
      } else {
        params.delete("branchId");
      }

      return params;
    });
  }, [selectedBranch, setSearchParams]);

  useEffect(() => {
    localStorage.setItem("branchIds", JSON.stringify(selectedBranch));
  }, [selectedBranch]);

  return (
    <div className="min-h-screen bg-slate-50">
      {/* BREADCRUMB */}
      <div className="border-b border-slate-200 bg-white">
        <div className="mx-auto max-w-[1450px] px-4 py-4 sm:px-6">
          <Breadcrumb
            cateId={cateId}
            cateName={cateName}
            groupName={groupName}
          />
        </div>
      </div>

      {/* CONTENT */}
      <div className="mx-auto flex w-full max-w-[1450px] flex-col gap-6 px-4 py-6 sm:px-6 xl:flex-row">
        {/* SIDEBAR */}
        <aside className="w-full shrink-0 xl:w-[340px]">
          <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
            <div className="flex flex-col gap-9">
              {/* BRANCH */}
              <div>
                <h3 className="mb-5 flex items-center gap-2.5 border-b border-slate-200 pb-4 text-sm font-semibold uppercase tracking-wide text-slate-900">
                  <MapPinned size={19} className="text-sky-600" />
                  Chi nhánh
                </h3>

                <div className="relative mb-5">
                  <Search
                    size={18}
                    className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"
                  />

                  <input
                    type="text"
                    placeholder="Tìm chi nhánh..."
                    value={searchBranch}
                    onChange={(e) => setSearchBranch(e.target.value)}
                    className="
                      w-full rounded-2xl border border-slate-300
                      bg-white py-3 pl-11 pr-4
                      text-[15px] text-slate-800
                      outline-none transition-all
                      placeholder:text-slate-400
                      focus:border-sky-500
                      focus:ring-1 focus:ring-sky-100
                    "
                  />
                </div>

                <ul className="flex max-h-[400px] flex-col gap-2 overflow-y-auto pr-1.5">
                  {branches
                    .filter((branch) =>
                      branch.branchName
                        .toLowerCase()
                        .includes(searchBranch.toLowerCase()),
                    )
                    .map((branch) => {
                      const checked = selectedBranch.includes(branch.id);

                      return (
                        <li
                          key={branch.id}
                          className={`
                            rounded-2xl transition-all
                            ${checked ? "bg-sky-100" : "hover:bg-slate-50"}
                          `}
                        >
                          <label className="flex cursor-pointer items-center gap-3.5 px-4 py-3 text-[15px]">
                            <input
                              type="checkbox"
                              checked={checked}
                              onChange={() => handleChange(branch.id)}
                              className="h-4.5 w-4.5 cursor-pointer accent-sky-600"
                            />

                            <span className="line-clamp-2 leading-snug text-slate-700">
                              {branch.branchName}
                            </span>
                          </label>
                        </li>
                      );
                    })}
                </ul>
              </div>

              {/* CATEGORY */}
              <div>
                <h3 className="mb-5 flex items-center gap-2.5 border-b border-slate-200 pb-4 text-sm font-semibold uppercase tracking-wide text-slate-900">
                  <Folder size={19} className="text-sky-600" />
                  Danh mục
                </h3>

                <ul className="flex flex-col gap-2">
                  {otherCategories.map((cate) => {
                    const active = Number(cate.id) === Number(cateId);

                    return (
                      <li
                        key={cate.id}
                        onClick={() =>
                          navigate(
                            `/products?cateId=${
                              cate.id
                            }&cateName=${encodeURIComponent(
                              cate.cateName,
                            )}&groupName=${encodeURIComponent(groupName)}`,
                          )
                        }
                        className={`
                          cursor-pointer rounded-2xl px-4 py-3
                          text-[15px] transition-all
                          ${
                            active
                              ? "border border-sky-200 bg-gradient-to-r from-sky-50 to-cyan-50 font-semibold text-sky-700"
                              : "text-slate-700 hover:bg-slate-50 hover:text-sky-700"
                          }
                        `}
                      >
                        {cate.cateName}
                      </li>
                    );
                  })}
                </ul>
              </div>
            </div>
          </div>
        </aside>

        {/* PRODUCTS */}
        <section className="min-w-0 flex-1">
          {/* TOP TOOLBAR */}
          <div className="mb-5 rounded-xl border border-slate-200 bg-white shadow-sm">
            <div className="flex flex-col gap-5 p-5 lg:flex-row lg:items-center lg:justify-between">
              <div>
                <div className="flex items-center gap-2">
                  <div className="h-8 w-1.5 rounded-full bg-sky-500" />

                  <p className="text-sm font-semibold uppercase tracking-wide text-sky-700">
                    B-Hub Sport
                  </p>
                </div>

                <h2 className="mt-2 text-3xl font-bold text-slate-900">
                  {cateName || groupName || "Sản phẩm cầu lông"}
                </h2>

                <p className="mt-1 text-sm text-slate-500">
                  Hiển thị {products?.total ?? 0} sản phẩm
                </p>
              </div>

              <div className="flex w-full flex-col gap-3 sm:flex-row lg:max-w-xl">
                <div className="relative flex-1">
                  <Search
                    size={18}
                    className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"
                  />

                  <input
                    type="text"
                    placeholder="Tìm vợt, giày, áo cầu lông..."
                    value={keywordSearch}
                    onChange={(e) => {
                      setKeywordSearch(e.target.value);
                      setPage(1);
                    }}
                    className="
                      w-full rounded-2xl border border-slate-300
                      bg-slate-50 py-3 pl-11 pr-4
                      text-sm text-slate-800
                      outline-none transition-all
                      placeholder:text-slate-400
                      hover:border-slate-400
                      focus:border-sky-500
                      focus:bg-white
                      focus:ring-1 focus:ring-sky-100
                    "
                  />
                </div>

                <button
                  onClick={() => setIsFilterOpen(true)}
                  className="
                    flex items-center justify-center gap-2
                    rounded-2xl bg-sky-600
                    px-5 py-3
                    text-sm font-semibold text-white
                    shadow-sm transition-all
                    hover:bg-sky-700
                    active:scale-[0.98]
                  "
                >
                  <Filter size={18} />
                  Bộ lọc
                </button>
              </div>
            </div>
          </div>

          {/* PRODUCT GRID */}
          <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
            {products?.products && products.products.length > 0 ? (
              <div
                className="
    grid grid-cols-1 gap-5
    sm:grid-cols-2
    xl:grid-cols-3
    min-[1440px]:grid-cols-4
  "
              >
                {products.products.map((product) => (
                  <ProductCard
                    key={product.id}
                    product={product}
                    groupName={groupName}
                  />
                ))}
              </div>
            ) : (
              <div className="flex min-h-[500px] items-center justify-center rounded-2xl border border-dashed border-slate-300 bg-slate-50">
                <p className="py-10 text-center text-base font-medium text-slate-600">
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
        </section>

        {/* FILTER DRAWER */}
        {isFilterOpen && (
          <>
            <div
              className="fixed inset-0 z-40 bg-black/40"
              onClick={() => setIsFilterOpen(false)}
            />

            <div className="fixed inset-y-0 right-0 z-50 flex h-screen w-full max-w-md flex-col bg-white shadow-xl">
              <div className="flex items-center justify-between border-b border-slate-200 p-5">
                <div>
                  <h3 className="text-lg font-bold text-slate-900">
                    Bộ lọc sản phẩm
                  </h3>

                  <p className="mt-1 text-sm text-slate-500">
                    Tuỳ chỉnh tìm kiếm
                  </p>
                </div>

                <button
                  onClick={() => setIsFilterOpen(false)}
                  className="flex h-10 w-10 items-center justify-center rounded-xl border border-slate-200 text-slate-500 transition hover:bg-slate-50"
                >
                  <X size={18} />
                </button>
              </div>

              <div className="min-h-0 flex-1 overflow-y-auto p-5">
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
          </>
        )}
      </div>
    </div>
  );
};

export default ProductPage;
