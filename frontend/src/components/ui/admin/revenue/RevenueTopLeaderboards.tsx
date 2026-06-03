import { Building2, ChevronRight, Package, Trophy } from "lucide-react";
import type {
  AdminBranchRevenue,
  AdminProductRevenue,
} from "../../../../types/admin";

const fmtShort = (n: number) =>
  n >= 1_000_000
    ? `${(n / 1_000_000).toFixed(1)}Mđ`
    : n >= 1_000
      ? `${(n / 1_000).toFixed(0)}Kđ`
      : `${n.toLocaleString("vi-VN")}đ`;

const rankStyle = (index: number) => {
  if (index === 0) return "bg-amber-100 text-amber-800 ring-amber-200";
  if (index === 1) return "bg-slate-100 text-slate-700 ring-slate-200";
  if (index === 2) return "bg-orange-100 text-orange-800 ring-orange-200";
  return "bg-slate-50 text-slate-600 ring-slate-100";
};

type Props = {
  branches: AdminBranchRevenue[];
  products: AdminProductRevenue[];
  maxBranchRevenue: number;
  maxProductRevenue: number;
  onBranchClick?: (branch: AdminBranchRevenue) => void;
};

const RevenueTopLeaderboards = ({
  branches,
  products,
  maxBranchRevenue,
  maxProductRevenue,
  onBranchClick,
}: Props) => {
  const topBranches = [...branches]
    .filter((branch) => branch.totalRevenue > 0)
    .sort((a, b) => b.totalRevenue - a.totalRevenue)
    .slice(0, 8);

  const topProducts = [...products]
    .filter((product) => product.totalRevenue > 0)
    .sort((a, b) => b.totalRevenue - a.totalRevenue)
    .slice(0, 8);

  return (
    <div className="grid grid-cols-1 gap-5 xl:grid-cols-2">
      <section className="rounded-lg border border-slate-200 bg-white p-6 shadow-sm">
        <div className="mb-5 flex items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-amber-50 text-amber-600">
              <Trophy className="h-5 w-5" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-slate-900">Top chi nhánh</h3>
              <p className="text-xs text-slate-500">Xếp hạng theo doanh thu kỳ</p>
            </div>
          </div>
          <Building2 className="h-5 w-5 text-slate-300" />
        </div>

        {topBranches.length === 0 ? (
          <p className="py-10 text-center text-sm text-slate-400">
            Chưa có doanh thu chi nhánh
          </p>
        ) : (
          <div className="space-y-3">
            {topBranches.map((branch, index) => (
              <button
                key={branch.branchId}
                type="button"
                onClick={() => onBranchClick?.(branch)}
                className="group w-full rounded-lg border border-slate-100 p-4 text-left transition hover:border-sky-200 hover:bg-sky-50/50"
              >
                <div className="flex items-center gap-3">
                  <span
                    className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-lg text-sm font-bold ring-1 ${rankStyle(index)}`}
                  >
                    {index + 1}
                  </span>
                  <div className="min-w-0 flex-1">
                    <p className="truncate font-semibold text-slate-800 group-hover:text-sky-700">
                      {branch.branchName}
                    </p>
                    <p className="mt-0.5 text-xs text-slate-400">
                      {branch.bookingCount + branch.orderCount} giao dịch · Sân{" "}
                      {fmtShort(branch.bookingRevenue)}
                    </p>
                  </div>
                  <div className="shrink-0 text-right">
                    <p className="font-bold text-sky-700">
                      {fmtShort(branch.totalRevenue)}
                    </p>
                    <ChevronRight className="ml-auto mt-1 h-4 w-4 text-slate-300 opacity-0 transition group-hover:opacity-100" />
                  </div>
                </div>
                <div className="mt-3 h-1.5 overflow-hidden rounded-full bg-slate-100">
                  <div
                    className="h-full rounded-full bg-sky-500 transition-all"
                    style={{
                      width: `${Math.max(
                        (branch.totalRevenue / maxBranchRevenue) * 100,
                        4,
                      )}%`,
                    }}
                  />
                </div>
              </button>
            ))}
          </div>
        )}
      </section>

      <section className="rounded-lg border border-slate-200 bg-white p-6 shadow-sm">
        <div className="mb-5 flex items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-emerald-50 text-emerald-600">
              <Package className="h-5 w-5" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-slate-900">Top sản phẩm</h3>
              <p className="text-xs text-slate-500">Theo doanh thu bán ra</p>
            </div>
          </div>
        </div>

        {topProducts.length === 0 ? (
          <p className="py-10 text-center text-sm text-slate-400">
            Chưa có doanh thu sản phẩm
          </p>
        ) : (
          <div className="space-y-3">
            {topProducts.map((product, index) => (
              <div
                key={product.productVariantId}
                className="rounded-lg border border-slate-100 p-4"
              >
                <div className="flex items-center gap-3">
                  <span
                    className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-lg text-sm font-bold ring-1 ${rankStyle(index)}`}
                  >
                    {index + 1}
                  </span>
                  <div className="min-w-0 flex-1">
                    <p className="truncate font-semibold text-slate-800">
                      {product.productName}
                    </p>
                    <p className="mt-0.5 truncate text-xs text-slate-400">
                      {product.variantInfo || "Không phân loại"} ·{" "}
                      {product.totalQuantity} SP
                    </p>
                  </div>
                  <p className="shrink-0 font-bold text-emerald-700">
                    {fmtShort(product.totalRevenue)}
                  </p>
                </div>
                <div className="mt-3 flex justify-between text-[11px] text-slate-500">
                  <span>Online {fmtShort(product.onlineRevenue)}</span>
                  <span>Quầy {fmtShort(product.offlineRevenue)}</span>
                </div>
                <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-slate-100">
                  <div
                    className="h-full rounded-full bg-emerald-500 transition-all"
                    style={{
                      width: `${Math.max(
                        (product.totalRevenue / maxProductRevenue) * 100,
                        4,
                      )}%`,
                    }}
                  />
                </div>
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  );
};

export default RevenueTopLeaderboards;
