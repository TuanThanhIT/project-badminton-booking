import type { PostType } from "../../../../types/post";
import type { FilterField } from "../../../../utils/constants/postConstant";
import type { BranchListItem } from "../../../../types/branch";
import {
  POST_TYPE_FILTERS,
  POST_TYPE_LABEL,
  POST_TYPES,
} from "../../../../utils/constants/postConstant";
import { CheckCircle2, EyeOff, SlidersHorizontal } from "lucide-react";

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
  const filters: FilterField[] = selectedType ? POST_TYPE_FILTERS[selectedType] : [];

  const inputClass =
    "w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-700 outline-none transition-all hover:border-sky-200 hover:bg-white focus:border-sky-400 focus:bg-white focus:ring-4 focus:ring-sky-100";

  return (
    <aside className="w-[21rem] shrink-0 space-y-5">
      <div className="overflow-hidden rounded-[2rem] border border-slate-200 bg-white shadow-[0_10px_28px_rgba(15,23,42,0.05)]">
        <div className="border-b border-slate-100 bg-slate-50 px-5 py-4">
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-2xl border border-sky-100 bg-sky-50 text-sky-600">
              <SlidersHorizontal size={19} />
            </div>
            <div>
              <p className="text-base font-semibold text-slate-800">Bộ lọc</p>
              <p className="text-sm text-slate-500">Chọn loại bài phù hợp</p>
            </div>
          </div>
        </div>

        <div className="space-y-2 p-4">
          <button
            type="button"
            onClick={() => onTypeChange("")}
            className={`w-full rounded-2xl px-4 py-3 text-left text-sm font-medium transition-all ${
              selectedType === ""
                ? "bg-sky-600 text-white shadow-sm"
                : "text-slate-600 hover:bg-sky-50 hover:text-sky-700"
            }`}
          >
            Tất cả
          </button>

          {POST_TYPES.map((type) => (
            <button
              key={type}
              type="button"
              onClick={() => onTypeChange(type)}
              className={`w-full rounded-2xl px-4 py-3 text-left text-sm font-medium transition-all ${
                selectedType === type
                  ? "bg-sky-600 text-white shadow-sm"
                  : "text-slate-600 hover:bg-sky-50 hover:text-sky-700"
              }`}
            >
              {POST_TYPE_LABEL[type]}
            </button>
          ))}
        </div>
      </div>

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

      {filters.length > 0 && (
        <div className="rounded-[2rem] border border-slate-200 bg-white p-5 shadow-[0_10px_28px_rgba(15,23,42,0.05)]">
          <div className="mb-4 flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-2xl border border-sky-100 bg-sky-50 text-sky-600">
              <CheckCircle2 size={19} />
            </div>
            <div>
              <p className="text-base font-semibold text-slate-800">Lọc theo</p>
              <p className="text-sm text-slate-500">Tinh chỉnh kết quả</p>
            </div>
          </div>

          <div className="space-y-4">
            {filters.map((f) => (
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
            ))}

            <button
              type="button"
              onClick={onApply}
              className="w-full rounded-2xl bg-sky-600 py-3 text-sm font-medium text-white shadow-sm transition-all hover:bg-sky-500 active:scale-[0.98]"
            >
              Áp dụng bộ lọc
            </button>
          </div>
        </div>
      )}
    </aside>
  );
};

export default FilterSidebar;
