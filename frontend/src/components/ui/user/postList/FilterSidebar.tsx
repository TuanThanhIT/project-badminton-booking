import type { PostType } from "../../../../types/post";
import type { FilterField } from "../../../../utils/constants/postConstant";
import type { BranchListItem } from "../../../../types/branch";
import {
  POST_TYPE_FILTERS,
  POST_TYPE_LABEL,
  POST_TYPES,
} from "../../../../utils/constants/postConstant";
import { ArrowLeft, EyeOff, SlidersHorizontal } from "lucide-react";

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

  const inputClass =
    "w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-2.5 text-sm text-slate-700 outline-none transition-all hover:border-sky-200 hover:bg-white focus:border-sky-400 focus:bg-white focus:ring-1 focus:ring-sky-100";

  const renderFilterField = (f: FilterField) => (
    <div key={f.key}>
      <label className="mb-1.5 block text-sm font-medium text-slate-600">
        {f.label}
      </label>

      {f.key === "location.branchId" ? (
        <select
          value={String(filterValues[f.key] ?? "")}
          onChange={(e) => {
            const v = e.target.value;
            onFilterChange(f.key, v === "" ? "" : Number(v));
          }}
          className={inputClass}
        >
          <option value="">Tất cả chi nhánh</option>
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
          className={inputClass}
        >
          <option value="">Tất cả</option>
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
          className={inputClass}
        />
      ) : f.type === "date" ? (
        <input
          type="date"
          value={String(filterValues[f.key] ?? "")}
          onChange={(e) => onFilterChange(f.key, e.target.value)}
          className={inputClass}
        />
      ) : (
        <input
          type="text"
          value={String(filterValues[f.key] ?? "")}
          onChange={(e) => onFilterChange(f.key, e.target.value)}
          placeholder="Nhập..."
          className={inputClass}
        />
      )}
    </div>
  );

  return (
    <aside className={`w-[21rem] shrink-0 ${selectedType ? "" : "space-y-5"}`}>
      <div className="overflow-hidden rounded-[2rem] border border-slate-200 bg-white shadow-[0_10px_28px_rgba(15,23,42,0.05)]">
        <div className="border-b border-slate-100 bg-slate-50 px-5 py-3.5">
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-2xl border border-sky-100 bg-sky-50 text-sky-600">
              <SlidersHorizontal size={19} />
            </div>
            <div>
              <p className="text-base font-semibold text-slate-800">Bộ lọc</p>
              <p className="text-sm text-slate-500">
                {selectedType ? "Tinh chỉnh kết quả" : "Chọn loại bài phù hợp"}
              </p>
            </div>
          </div>
        </div>

        {selectedType === "" ? (
          <div className="space-y-2 p-4">
            <button
              type="button"
              onClick={() => onTypeChange("")}
              className="w-full rounded-2xl bg-sky-600 px-4 py-3 text-left text-sm font-medium text-white shadow-sm transition-all"
            >
              Tất cả
            </button>

            {POST_TYPES.map((type) => (
              <button
                key={type}
                type="button"
                onClick={() => onTypeChange(type)}
                className="w-full rounded-2xl px-4 py-3 text-left text-sm font-medium text-slate-600 transition-all hover:bg-sky-50 hover:text-sky-700"
              >
                {POST_TYPE_LABEL[type]}
              </button>
            ))}
          </div>
        ) : (
          <div className="space-y-3 px-4 py-4">
            <button
              type="button"
              onClick={() => onTypeChange("")}
              className="flex w-full items-center gap-3 rounded-2xl bg-sky-50 px-4 py-2.5 text-left text-sky-700 transition-all hover:bg-sky-100"
            >
              <ArrowLeft size={17} />
              <div>
                <p className="text-sm font-semibold">
                  {POST_TYPE_LABEL[selectedType]}
                </p>
                <p className="text-xs text-sky-600">Lọc chi tiết</p>
              </div>
            </button>

            {filters.map(renderFilterField)}

            <button
              type="button"
              onClick={onApply}
              className="w-full rounded-2xl bg-sky-600 py-2.5 text-sm font-medium text-white shadow-sm transition-all hover:bg-sky-500 active:scale-[0.98]"
            >
              Áp dụng bộ lọc
            </button>
          </div>
        )}
      </div>

      {selectedType === "" && (
        <div className="rounded-[2rem] border border-slate-200 bg-white p-5 shadow-[0_10px_28px_rgba(15,23,42,0.05)]">
          <div className="mb-4 flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-2xl border border-slate-200 bg-slate-50 text-slate-600">
              <EyeOff size={19} />
            </div>
            <div>
              <p className="text-base font-semibold text-slate-800">Tùy chọn</p>
              <p className="text-sm text-slate-500">Cá nhân hóa bảng tin</p>
            </div>
          </div>

          <label className="flex cursor-pointer select-none items-center justify-between gap-3 rounded-2xl border border-slate-100 bg-slate-50 px-4 py-3 text-sm text-slate-700">
            <span className="font-medium">Ẩn bài đăng lại</span>
            <input
              type="checkbox"
              checked={hideReposts}
              onChange={(e) => onHideRepostsChange(e.target.checked)}
              className="h-4 w-4 accent-sky-600"
            />
          </label>
        </div>
      )}
    </aside>
  );
};

export default FilterSidebar;
