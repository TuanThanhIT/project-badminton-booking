import React, { useState, useEffect } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import filterConfig from "../../configs/filterConfig";

// Định nghĩa type cho filters
interface Filters {
  priceRange: [number, number];
  [key: string]: any; // Hỗ trợ các key động như color, material, size: string[]
}

// Định nghĩa type cho filterConfig
interface FilterOption {
  key: string;
  label: string;
  type: "range" | "checkbox";
  min?: number;
  max?: number;
  options?: string[];
}

interface ProductFilterProps {
  cate_id: number;
  cate_name: string;
  group_cate: string;
  setIsFilterOpen: React.Dispatch<React.SetStateAction<boolean>>;
}

const ProductFilter: React.FC<ProductFilterProps> = ({
  cate_id,
  cate_name,
  group_cate,
  setIsFilterOpen,
}) => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [filters, setFilters] = useState<Filters>({
    priceRange: [
      filterConfig[group_cate]?.[0]?.min || 0,
      filterConfig[group_cate]?.[0]?.max || 0,
    ],
    color: [],
    material: [],
    size: [],
  });
  const [sort, setSort] = useState<string>("none");

  // Load từ query string khi component mount hoặc group_cate thay đổi
  useEffect(() => {
    const priceRange = searchParams
      .get("price_range")
      ?.split("-")
      .map(Number) || [
      filterConfig[group_cate]?.[0]?.min || 0,
      filterConfig[group_cate]?.[0]?.max || 0,
    ];
    const color = searchParams.get("color")?.split(",") || [];
    const material = searchParams.get("material")?.split(",") || [];
    const size = searchParams.get("size")?.split(",") || [];
    const initialFilters: Filters = {
      priceRange: [priceRange[0], priceRange[1]],
      color,
      material,
      size,
    };
    const initialSort = searchParams.get("sort") || "none";

    setFilters(initialFilters);
    setSort(initialSort);
  }, [group_cate, searchParams]);

  // Cập nhật URL khi filters hoặc sort thay đổi
  useEffect(() => {
    updateUrl();
  }, [filters, sort]);

  // Xây dựng query string
  const buildQueryString = () => {
    const params = new URLSearchParams();
    params.set("category_id", String(cate_id));
    params.set("category_name", cate_name);
    params.set("group", group_cate);
    if (filters.priceRange) {
      params.set(
        "price_range",
        `${filters.priceRange[0]}-${filters.priceRange[1]}`
      );
    } else {
      params.delete("price_range");
    }
    Object.keys(filters).forEach((key) => {
      if (
        key !== "priceRange" &&
        Array.isArray(filters[key]) &&
        filters[key].length > 0
      ) {
        params.set(key, filters[key].join(","));
      } else if (key !== "priceRange") {
        params.delete(key);
      }
    });
    if (sort !== "none") {
      params.set("sort", sort);
    }
    return params.toString();
  };

  // Cập nhật URL
  const updateUrl = () => {
    const queryString = buildQueryString();
    navigate(`/products?${queryString}`, { replace: true });
  };

  // Thay đổi filters
  const handleFilterChange = (key: string, value: any) => {
    setFilters((prev) => ({
      ...prev,
      [key]: value,
    }));
  };

  // Kết quả lọc (đóng side panel)
  const viewResults = () => {
    setIsFilterOpen(false);
  };

  // Reset filters và đóng side panel
  const resetFilters = () => {
    setFilters({
      priceRange: [
        filterConfig[group_cate]?.[0]?.min || 0,
        filterConfig[group_cate]?.[0]?.max || 0,
      ],
      color: [],
      material: [],
      size: [],
    });
    setSort("none");
  };

  // Render các bộ lọc
  const renderFilters = () => {
    const config: FilterOption[] = filterConfig[group_cate] || [];
    if (config.length === 0) {
      return (
        <p className="text-center text-gray-500">
          Không có bộ lọc cho danh mục này
        </p>
      );
    }
    return config.map((filter) => (
      <div key={filter.key} className="mb-4">
        <h3 className="font-bold mb-2">{filter.label}</h3>
        {filter.type === "range" ? (
          <div>
            <input
              type="range"
              min={filter.min}
              max={filter.max}
              value={filters.priceRange[0]}
              onChange={(e) =>
                handleFilterChange("priceRange", [
                  Number(e.target.value),
                  filters.priceRange[1],
                ])
              }
              className="w-full cursor-pointer"
            />
            <input
              type="range"
              min={filter.min}
              max={filter.max}
              value={filters.priceRange[1]}
              onChange={(e) =>
                handleFilterChange("priceRange", [
                  filters.priceRange[0],
                  Number(e.target.value),
                ])
              }
              className="w-full cursor-pointer"
            />
            <p className="text-sm">
              Giá: {filters.priceRange[0].toLocaleString()} -{" "}
              {filters.priceRange[1].toLocaleString()} VND
            </p>
          </div>
        ) : (
          <div className="flex flex-wrap gap-2">
            {filter.options?.map((option) => (
              <label key={option} className="flex items-center">
                <input
                  type="checkbox"
                  checked={(filters[filter.key] || []).includes(option)}
                  onChange={() => {
                    const currentValues: string[] = filters[filter.key] || [];
                    const newValues = currentValues.includes(option)
                      ? currentValues.filter((v) => v !== option)
                      : [...currentValues, option];
                    handleFilterChange(filter.key, newValues);
                  }}
                  className="mr-1 cursor-pointer"
                />
                {option}
              </label>
            ))}
          </div>
        )}
      </div>
    ));
  };

  return (
    <div className="flex flex-col gap-4">
      {renderFilters()}
      <div className="mb-4">
        <h3 className="font-bold mb-2">Sắp xếp</h3>
        <select
          value={sort}
          onChange={(e) => setSort(e.target.value)}
          className="w-full p-2 border rounded cursor-pointer"
        >
          <option value="none">Không sắp xếp</option>
          <option value="price_asc">Giá tăng dần</option>
          <option value="price_desc">Giá giảm dần</option>
        </select>
      </div>
      <div className="flex gap-2">
        <button
          onClick={viewResults}
          className="flex-1 bg-blue-500 text-white py-2 rounded"
        >
          Kết quả lọc
        </button>
      </div>
      <button
        onClick={resetFilters}
        className="w-full bg-red-500 text-white py-2 rounded"
      >
        Xóa bộ lọc
      </button>
    </div>
  );
};

export default ProductFilter;
