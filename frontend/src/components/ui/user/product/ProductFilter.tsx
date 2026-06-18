import React, { useState, useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import filterConfig from "../../../../configs/filterConfig";
import { Check } from "lucide-react";

interface Filters {
  pricesRange: [number, number];
  [key: string]: any;
}

interface FilterOption {
  key: string;
  label: string;
  type: "range" | "checkbox";
  min?: number;
  max?: number;
  options?: string[];
}

interface ProductFilterProps {
  cateId?: number;
  cateName: string;
  groupName: string;
  setIsFilterOpen: React.Dispatch<React.SetStateAction<boolean>>;
}

const ProductFilter: React.FC<ProductFilterProps> = ({
  cateId,
  cateName,
  groupName,
  setIsFilterOpen,
}) => {
  const [searchParams, setSearchParams] = useSearchParams();

  const minPrice = filterConfig[groupName]?.[0]?.min || 0;
  const maxPrice = filterConfig[groupName]?.[0]?.max || 10000000;

  const [filters, setFilters] = useState<Filters>({
    pricesRange: [minPrice, maxPrice],
    colors: [],
    materials: [],
    sizes: [],
  });

  const [sort, setSort] = useState<string>("none");

  useEffect(() => {
    const pricesRange = searchParams
      .get("pricesRange")
      ?.split("-")
      .map(Number) || [minPrice, maxPrice];

    const colors = searchParams.get("colors")?.split(",") || [];
    const materials = searchParams.get("materials")?.split(",") || [];
    const sizes = searchParams.get("sizes")?.split(",") || [];

    setFilters({
      pricesRange: [pricesRange[0], pricesRange[1]],
      colors,
      materials,
      sizes,
    });

    setSort(searchParams.get("sort") || "none");
  }, [groupName]);

  useEffect(() => {
    updateUrl();
  }, [filters, sort]);

  const updateUrl = () => {
    const params = new URLSearchParams();

    if (cateId) params.set("cateId", String(cateId));
    if (cateName) params.set("cateName", cateName);
    params.set("groupName", groupName);

    params.set(
      "pricesRange",
      `${filters.pricesRange[0]}-${filters.pricesRange[1]}`,
    );

    Object.keys(filters).forEach((key) => {
      if (key !== "pricesRange" && filters[key]?.length) {
        params.set(key, filters[key].join(","));
      }
    });

    if (sort !== "none") params.set("sort", sort);
    setSearchParams(params);
  };

  const handleFilterChange = (key: string, value: any) => {
    setFilters((prev) => ({
      ...prev,
      [key]: value,
    }));
  };

  const viewResults = () => {
    setIsFilterOpen(false);
  };

  const resetFilters = () => {
    setFilters({
      pricesRange: [minPrice, maxPrice],
      colors: [],
      materials: [],
      sizes: [],
    });

    setSort("none");
  };

  const renderFilters = () => {
    const config: FilterOption[] = filterConfig[groupName] || [];

    return config.map((filter) => (
      <div
        key={filter.key}
        className="rounded-lg border border-gray-200 bg-white p-3.5 shadow-sm"
      >
        <h3 className="text-sm font-semibold text-gray-900 mb-3 uppercase tracking-wide">
          {filter.label}
        </h3>

        {filter.type === "range" ? (
          <div className="space-y-3">
            <input
              type="range"
              min={filter.min}
              max={filter.max}
              value={filters.pricesRange[0]}
              onChange={(e) => {
                const value = Number(e.target.value);
                if (value <= filters.pricesRange[1]) {
                  handleFilterChange("pricesRange", [
                    value,
                    filters.pricesRange[1],
                  ]);
                }
              }}
              className="w-full h-2 bg-gray-200 rounded-lg cursor-pointer accent-blue-600"
            />

            <input
              type="range"
              min={filter.min}
              max={filter.max}
              value={filters.pricesRange[1]}
              onChange={(e) => {
                const value = Number(e.target.value);
                if (value >= filters.pricesRange[0]) {
                  handleFilterChange("pricesRange", [
                    filters.pricesRange[0],
                    value,
                  ]);
                }
              }}
              className="w-full h-2 bg-gray-200 rounded-lg cursor-pointer accent-blue-600"
            />

            <div className="flex justify-between text-xs font-medium text-gray-600">
              <span className="bg-gray-100 px-3 py-1 rounded-full">
                {filters.pricesRange[0].toLocaleString()}₫
              </span>

              <span className="bg-gray-100 px-3 py-1 rounded-full">
                {filters.pricesRange[1].toLocaleString()}₫
              </span>
            </div>
          </div>
        ) : (
          <div className="flex flex-wrap gap-2">
            {filter.options?.map((option) => {
              const selected = (filters[filter.key] || []).includes(option);

              return (
                <button
                  key={option}
                  onClick={() => {
                    const current = filters[filter.key] || [];

                    const newValues = selected
                      ? current.filter((v: string) => v !== option)
                      : [...current, option];

                    handleFilterChange(filter.key, newValues);
                  }}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium border transition-all duration-200 active:scale-95
  ${
    selected
      ? "bg-blue-600 text-white border-blue-600 shadow-sm"
      : "bg-white text-gray-700 border-gray-300 hover:border-blue-400 hover:bg-blue-50"
  }`}
                >
                  {selected && <Check size={14} strokeWidth={3} />}

                  {option}
                </button>
              );
            })}
          </div>
        )}
      </div>
    ));
  };

  return (
    <div className="flex h-full flex-col gap-3 overflow-hidden">
      {/* Filters */}
      <div className="flex-1 space-y-3 overflow-y-auto pr-1">
        {renderFilters()}
      </div>

      {/* Sort */}
      <div className="shrink-0 border-t pt-3">
        <h3 className="text-sm font-semibold text-gray-900 mb-3 uppercase tracking-wide">
          Sắp xếp
        </h3>

        <select
          value={sort}
          onChange={(e) => setSort(e.target.value)}
          className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none"
        >
          <option value="none">Không sắp xếp</option>
          <option value="price_asc">Giá tăng dần</option>
          <option value="price_desc">Giá giảm dần</option>
          <option value="newest">Mới nhất</option>
          <option value="oldest">Cũ hơn</option>
        </select>
      </div>

      {/* Buttons */}
      <div className="flex shrink-0 flex-col gap-2.5 border-t pt-3">
        <button
          onClick={viewResults}
          className="w-full bg-blue-600 hover:bg-blue-700 text-white py-2.5 rounded-lg font-semibold shadow-sm transition"
        >
          Xem kết quả
        </button>

        <button
          onClick={resetFilters}
          className="w-full border bg-red-600 text-white hover:bg-red-700 py-2.5 rounded-lg font-medium transition"
        >
          Xóa bộ lọc
        </button>
      </div>
    </div>
  );
};

export default ProductFilter;
