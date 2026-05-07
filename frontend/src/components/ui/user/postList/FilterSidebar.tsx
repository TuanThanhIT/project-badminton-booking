import type { PostType } from "../../../../types/post";
import type { FilterField } from "../../../../utils/constants/postConstant";
import type { BranchListItem } from "../../../../types/branch";

import {
  POST_TYPES,
  POST_TYPE_LABEL,
  POST_TYPE_FILTERS,
} from "../../../../utils/constants/postConstant";

type Props = {
  selectedType: PostType | "";
  onTypeChange: (t: PostType | "") => void;
  hideReposts: boolean;
  onHideRepostsChange: (value: boolean) => void;
  filterValues: Record<string, string | number>;
  onFilterChange: (key: string, value: string | number) => void;
  onApply: () => void;
  branches: BranchListItem[];
};

const FilterSidebar = ({
  selectedType,
  onTypeChange,
  hideReposts,
  onHideRepostsChange,
  filterValues,
  onFilterChange,
  onApply,
  branches,
}: Props) => {
  const filters: FilterField[] = selectedType
    ? POST_TYPE_FILTERS[selectedType]
    : [];

  return (
    <aside className="w-64 shrink-0 space-y-4">
      {/* Tab loại bài */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-2">
        <p className="text-xs font-medium text-gray-500 uppercase tracking-wider mb-2 px-2">
          Loại bài đăng
        </p>
        <div className="space-y-0.5">
          <button
            type="button"
            onClick={() => onTypeChange("")}
            className={`w-full text-left px-3 py-2 rounded-lg text-sm font-medium transition ${
              selectedType === ""
                ? "bg-sky-100 text-sky-700"
                : "hover:bg-gray-100 text-gray-700"
            }`}
          >
            Tất cả
          </button>
          {POST_TYPES.map((type) => (
            <button
              key={type}
              type="button"
              onClick={() => onTypeChange(type)}
              className={`w-full text-left px-3 py-2 rounded-lg text-sm font-medium transition ${
                selectedType === type
                  ? "bg-sky-100 text-sky-700"
                  : "hover:bg-gray-100 text-gray-700"
              }`}
            >
              {POST_TYPE_LABEL[type]}
            </button>
          ))}
        </div>
      </div>

      {/* Repost filter */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4">
        <p className="text-xs font-medium text-gray-500 uppercase tracking-wider mb-3">
          Tuỳ chọn
        </p>
        <label className="flex items-center gap-2 text-sm text-gray-700 select-none">
          <input
            type="checkbox"
            checked={hideReposts}
            onChange={(e) => onHideRepostsChange(e.target.checked)}
            className="h-4 w-4"
          />
          Ẩn bài đăng lại
        </label>
      </div>

      {/* Filter con theo loại */}
      {filters.length > 0 && (
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4">
          <p className="text-xs font-medium text-gray-500 uppercase tracking-wider mb-3">
            Lọc theo
          </p>
          <div className="space-y-3">
            {filters.map((f) => (
              <div key={f.key}>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  {f.label}
                </label>
                {f.key === "location.branchId" ? (
                  <select
                    value={String(filterValues[f.key] ?? "")}
                    onChange={(e) => {
                      const v = e.target.value;
                      onFilterChange(f.key, v === "" ? "" : Number(v));
                    }}
                    className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm"
                  >
                    <option value="">-- Tất cả chi nhánh --</option>
                    {branches.map((branch) => (
                      <option key={branch.id} value={branch.id}>
                        {branch.branchName}
                      </option>
                    ))}
                  </select>
                ) : f.type === "select" && f.options ? (
                  <select
                    value={String(filterValues[f.key] ?? "")}
                    onChange={(e) => onFilterChange(f.key, e.target.value)}
                    className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm"
                  >
                    <option value="">-- Tất cả --</option>
                    {f.options.map((o) => (
                      <option key={o.value} value={o.value}>
                        {o.label}
                      </option>
                    ))}
                  </select>
                ) : f.type === "number" ? (
                  <input
                    type="number"
                    value={filterValues[f.key] ?? ""}
                    onChange={(e) => {
                      const v = e.target.value;
                      onFilterChange(f.key, v === "" ? "" : Number(v));
                    }}
                    placeholder="Nhập..."
                    className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm"
                  />
                ) : f.type === "date" ? (
                  <input
                    type="date"
                    value={String(filterValues[f.key] ?? "")}
                    onChange={(e) => onFilterChange(f.key, e.target.value)}
                    className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm"
                  />
                ) : (
                  <input
                    type="text"
                    value={String(filterValues[f.key] ?? "")}
                    onChange={(e) => onFilterChange(f.key, e.target.value)}
                    placeholder="Nhập..."
                    className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm"
                  />
                )}
              </div>
            ))}
            <button
              type="button"
              onClick={onApply}
              className="w-full py-2 rounded-lg bg-sky-600 text-white text-sm font-medium hover:bg-sky-700"
            >
              Áp dụng
            </button>
          </div>
        </div>
      )}
    </aside>
  );
};

export default FilterSidebar;
