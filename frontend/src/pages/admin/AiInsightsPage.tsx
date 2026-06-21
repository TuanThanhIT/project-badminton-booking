import { useCallback, useEffect, useMemo, useState, type ReactNode } from "react";
import {
  AlertTriangle,
  BadgePercent,
  BrainCircuit,
  Clock,
  Download,
  Gauge,
  Loader2,
  RefreshCw,
  Sparkles,
  TrendingUp,
  UserCheck,
  Users,
} from "lucide-react";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { toast } from "react-toastify";
import AdminPageHeader from "../../components/ui/admin/AdminPageHeader";
import { adminPrimaryButtonClass } from "../../components/ui/admin/AdminModal";
import aiRecommendationService, {
  type AiServiceStatus,
  type AiTrainResult,
} from "../../services/aiRecommendationService";
import type {
  AdminAiInsights,
  AdminCustomerInsight,
  AdminPromotionByBranch,
} from "../../types/aiRecommendation";

const cronToText = (cron?: string) => {
  if (!cron) return "—";
  const parts = cron.trim().split(/\s+/);
  if (parts.length === 5) {
    const [minute, hour, dom, , dow] = parts;
    const hh = hour.padStart(2, "0");
    const mm = minute.padStart(2, "0");
    if (dom === "*" && dow === "*") return `${hh}:${mm} mỗi ngày`;
    if (dom === "*" && dow !== "*") return `${hh}:${mm} hàng tuần`;
  }
  return cron;
};

const fmtDateTime = (value?: string) =>
  value
    ? new Date(value).toLocaleString("vi-VN", {
        day: "2-digit",
        month: "2-digit",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      })
    : "Chưa train";

const fillColor = (rate: number) => {
  if (rate >= 70) return "#10b981";
  if (rate >= 40) return "#f59e0b";
  if (rate >= 15) return "#fb923c";
  return "#ef4444";
};

const heatCellColor = (rate: number) => {
  if (rate >= 70) return "bg-emerald-500";
  if (rate >= 40) return "bg-amber-400";
  if (rate >= 15) return "bg-orange-400";
  if (rate > 0) return "bg-rose-400";
  return "bg-slate-200";
};

const OPERATING_HOURS = Array.from({ length: 16 }, (_, i) => i + 6);

type HourCell = {
  hour: number;
  hourLabel: string;
  fillRate: number;
  bookedCount: number;
  capacity: number;
};

const OccupancyHeatmap = ({
  rows,
}: {
  rows: AdminAiInsights["fillRateByBranchHour"];
}) => {
  const byBranch = new Map<
    number,
    { branchName: string; cells: Map<number, HourCell> }
  >();

  rows.forEach((row) => {
    if (!byBranch.has(row.branchId)) {
      byBranch.set(row.branchId, {
        branchName: row.branchName,
        cells: new Map(),
      });
    }
    byBranch.get(row.branchId)!.cells.set(row.hour, {
      hour: row.hour,
      hourLabel: row.hourLabel || `${String(row.hour).padStart(2, "0")}:00`,
      fillRate: row.fillRate,
      bookedCount: row.bookedCount,
      capacity: row.capacity,
    });
  });

  const branches = [...byBranch.entries()].sort((a, b) => a[0] - b[0]);

  if (!branches.length) {
    return (
      <p className="py-12 text-center text-sm text-slate-400">
        Chưa có dữ liệu đặt sân.
      </p>
    );
  }

  return (
    <div className="overflow-x-auto">
      <div className="min-w-[720px]">
        <div
          className="grid gap-1 text-center text-[10px] font-semibold text-slate-400"
          style={{
            gridTemplateColumns: `140px repeat(${OPERATING_HOURS.length}, minmax(28px, 1fr))`,
          }}
        >
          <div className="text-left">Chi nhánh</div>
          {OPERATING_HOURS.map((h) => (
            <div key={h}>{h}h</div>
          ))}
        </div>
        {branches.map(([branchId, branch]) => (
          <div
            key={branchId}
            className="mt-1 grid items-center gap-1"
            style={{
              gridTemplateColumns: `140px repeat(${OPERATING_HOURS.length}, minmax(28px, 1fr))`,
            }}
          >
            <div
              className="truncate pr-2 text-left text-xs font-semibold text-slate-700"
              title={branch.branchName}
            >
              {branch.branchName}
            </div>
            {OPERATING_HOURS.map((h) => {
              const cell = branch.cells.get(h);
              const rate = cell?.fillRate ?? 0;
              const label =
                cell?.hourLabel ||
                `${String(h).padStart(2, "0")}:00–${String(h + 1).padStart(2, "0")}:00`;
              return (
                <div
                  key={h}
                  title={`${label}: ${cell?.bookedCount ?? 0}/${cell?.capacity ?? 0} lượt (${rate}%)`}
                  className={`h-7 rounded ${heatCellColor(rate)} transition hover:ring-2 hover:ring-sky-400`}
                />
              );
            })}
          </div>
        ))}
        <div className="mt-4 flex flex-wrap items-center gap-3 text-xs text-slate-500">
          <span className="font-semibold text-slate-600">Chú thích:</span>
          <span className="inline-flex items-center gap-1">
            <span className="h-3 w-3 rounded bg-slate-200" /> 0%
          </span>
          <span className="inline-flex items-center gap-1">
            <span className="h-3 w-3 rounded bg-rose-400" /> &lt;15%
          </span>
          <span className="inline-flex items-center gap-1">
            <span className="h-3 w-3 rounded bg-orange-400" /> 15–40%
          </span>
          <span className="inline-flex items-center gap-1">
            <span className="h-3 w-3 rounded bg-amber-400" /> 40–70%
          </span>
          <span className="inline-flex items-center gap-1">
            <span className="h-3 w-3 rounded bg-emerald-500" /> ≥70%
          </span>
        </div>
      </div>
    </div>
  );
};

const LOW_FILL_THRESHOLD = 40;
const SLOTS_PER_BRANCH = 5;

/** Fallback khi ai-service chưa trả promotionByBranch (cần restart ai-service). */
const buildPromotionByBranchFromHours = (
  rows: AdminAiInsights["fillRateByBranchHour"],
): AdminPromotionByBranch[] => {
  const byBranch = new Map<
    number,
    {
      branchName: string;
      hours: AdminAiInsights["fillRateByBranchHour"];
    }
  >();

  rows.forEach((row) => {
    if (!byBranch.has(row.branchId)) {
      byBranch.set(row.branchId, { branchName: row.branchName, hours: [] });
    }
    byBranch.get(row.branchId)!.hours.push(row);
  });

  return [...byBranch.entries()]
    .sort((a, b) => a[0] - b[0])
    .map(([branchId, branch]) => {
      const totalBooked = branch.hours.reduce((s, h) => s + h.bookedCount, 0);
      const totalCapacity = branch.hours.reduce((s, h) => s + h.capacity, 0);
      const branchFillRate =
        totalCapacity > 0
          ? Math.round((totalBooked / totalCapacity) * 1000) / 10
          : 0;

      const slots = [...branch.hours]
        .sort((a, b) => a.fillRate - b.fillRate || a.hour - b.hour)
        .slice(0, SLOTS_PER_BRANCH)
        .map((row) => ({
          branchId: row.branchId,
          branchName: row.branchName,
          hour: row.hour,
          hourEnd: row.hourEnd,
          hourLabel:
            row.hourLabel ||
            `${String(row.hour).padStart(2, "0")}:00–${String(row.hour + 1).padStart(2, "0")}:00`,
          fillRate: row.fillRate,
          bookedCount: row.bookedCount,
          capacity: row.capacity,
          needsPromotion: row.fillRate < LOW_FILL_THRESHOLD,
          suggestion:
            row.fillRate < LOW_FILL_THRESHOLD
              ? "Tạo khuyến mãi cho khung giờ thấp điểm"
              : "Theo dõi thêm",
        }));

      return {
        branchId,
        branchName: branch.branchName,
        branchFillRate,
        totalBooked,
        totalCapacity,
        slots,
      };
    });
};

const BranchPromotionPanel = ({
  groups,
  hourRowCount,
}: {
  groups: AdminPromotionByBranch[];
  hourRowCount: number;
}) => {
  if (!groups.length) {
    return (
      <div className="space-y-3 py-8 text-center text-sm text-slate-500">
        <p>Không có dữ liệu khung giờ để gợi ý khuyến mãi.</p>
        {hourRowCount === 0 ? (
          <p className="text-xs text-slate-400">
            Chưa có booking trong 30 ngày gần nhất (trạng thái CONFIRMED /
            COMPLETED). Chạy seeder bulk rồi bấm <strong>Làm mới</strong>.
          </p>
        ) : (
          <p className="text-xs text-slate-400">
            Có {hourRowCount} ô giờ nhưng chưa nhóm được — thử restart{" "}
            <strong>ai-service</strong> và <strong>backend</strong>, sau đó Làm
            mới.
          </p>
        )}
      </div>
    );
  }

  return (
    <div className="max-h-[520px] space-y-4 overflow-y-auto pr-1">
      {groups.map((branch) => (
        <div
          key={branch.branchId}
          className="rounded-xl border border-slate-200 bg-slate-50/80 p-4"
        >
          <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
            <div>
              <p className="text-sm font-bold text-slate-900">
                {branch.branchName}
              </p>
              <p className="text-xs text-slate-500">
                Lấp đầy TB 30 ngày:{" "}
                <strong className="text-slate-700">
                  {branch.branchFillRate}%
                </strong>
                {" · "}
                {branch.totalBooked}/{branch.totalCapacity} lượt
              </p>
            </div>
            <span
              className={`rounded-full px-3 py-1 text-xs font-bold ${
                branch.branchFillRate < 15
                  ? "bg-rose-100 text-rose-600"
                  : branch.branchFillRate < 40
                    ? "bg-amber-100 text-amber-700"
                    : "bg-emerald-100 text-emerald-700"
              }`}
            >
              {branch.branchFillRate < 15
                ? "Ưu tiên KM"
                : branch.branchFillRate < 40
                  ? "Cân nhắc KM"
                  : "Ổn định"}
            </span>
          </div>
          <div className="space-y-2">
            {branch.slots.map((slot) => (
              <div
                key={`${branch.branchId}-${slot.hour}`}
                className="flex items-center justify-between rounded-lg border border-white bg-white px-3 py-2.5 shadow-sm"
              >
                <div>
                  <p className="text-sm font-semibold text-slate-800">
                    {slot.hourLabel}
                  </p>
                  <p className="text-xs text-slate-400">
                    Đã đặt {slot.bookedCount}/{slot.capacity} lượt ·{" "}
                    {slot.needsPromotion !== false
                      ? "Nên tạo khuyến mãi"
                      : "Theo dõi thêm"}
                  </p>
                </div>
                <span
                  className={`rounded-full px-2.5 py-1 text-xs font-bold ${
                    slot.fillRate < 15
                      ? "bg-rose-100 text-rose-600"
                      : slot.fillRate < 40
                        ? "bg-amber-100 text-amber-700"
                        : "bg-slate-100 text-slate-600"
                  }`}
                >
                  {slot.fillRate}%
                </span>
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
};

const Skeleton = ({ className }: { className: string }) => (
  <div className={`animate-pulse rounded-lg bg-slate-200 ${className}`} />
);

const renderInline = (text: string) =>
  text.split(/(\*\*[^*]+\*\*)/g).map((part, index) =>
    /^\*\*[^*]+\*\*$/.test(part) ? (
      <strong key={index} className="font-semibold text-slate-900">
        {part.slice(2, -2)}
      </strong>
    ) : (
      <span key={index}>{part}</span>
    ),
  );

const AiSummaryContent = ({ text }: { text: string }) => {
  const lines = text.split(/\r?\n/);
  const blocks: ReactNode[] = [];
  let bullets: string[] = [];

  const flushBullets = (key: string) => {
    if (bullets.length === 0) return;
    const items = [...bullets];
    bullets = [];
    blocks.push(
      <ul key={key} className="space-y-1.5">
        {items.map((item, index) => (
          <li key={index} className="flex gap-2 text-sm leading-6 text-slate-600">
            <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-sky-400" />
            <span>{renderInline(item)}</span>
          </li>
        ))}
      </ul>,
    );
  };

  lines.forEach((rawLine, index) => {
    const line = rawLine.trim();
    if (!line) {
      flushBullets(`fb-${index}`);
      return;
    }

    const heading = line.match(/^#{1,6}\s+(.*)$/);
    if (heading) {
      flushBullets(`fb-${index}`);
      blocks.push(
        <h4
          key={`h-${index}`}
          className="mt-4 flex items-center gap-2 text-sm font-bold uppercase tracking-wide text-sky-700 first:mt-0"
        >
          <span className="h-4 w-1 rounded-full bg-sky-500" />
          {renderInline(heading[1])}
        </h4>,
      );
      return;
    }

    const bullet = line.match(/^[-*•]\s+(.*)$/);
    if (bullet) {
      bullets.push(bullet[1]);
      return;
    }

    flushBullets(`fb-${index}`);
    blocks.push(
      <p key={`p-${index}`} className="text-sm leading-6 text-slate-600">
        {renderInline(line)}
      </p>,
    );
  });

  flushBullets("fb-end");

  return <div className="space-y-2">{blocks}</div>;
};

const StatCard = ({
  title,
  value,
  note,
  icon: Icon,
  tone,
}: {
  title: string;
  value: string;
  note: string;
  icon: typeof Gauge;
  tone: string;
}) => (
  <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
    <div className="flex items-center justify-between">
      <p className="text-sm font-semibold text-slate-500">{title}</p>
      <span className={`flex h-10 w-10 items-center justify-center rounded-xl ${tone}`}>
        <Icon className="h-5 w-5" />
      </span>
    </div>
    <p className="mt-3 text-3xl font-bold text-slate-900">{value}</p>
    <p className="mt-1 text-xs text-slate-400">{note}</p>
  </div>
);

const CustomerTable = ({
  title,
  description,
  icon: Icon,
  tone,
  rows,
  emptyText,
}: {
  title: string;
  description: string;
  icon: typeof Users;
  tone: string;
  rows: AdminCustomerInsight[];
  emptyText: string;
}) => (
  <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
    <div className="mb-4 flex items-center gap-3">
      <span className={`flex h-10 w-10 items-center justify-center rounded-xl ${tone}`}>
        <Icon className="h-5 w-5" />
      </span>
      <div>
        <h3 className="text-base font-bold text-slate-900">{title}</h3>
        <p className="text-xs text-slate-400">{description}</p>
      </div>
    </div>
    {rows.length === 0 ? (
      <p className="py-8 text-center text-sm text-slate-400">{emptyText}</p>
    ) : (
      <div className="max-h-[360px] overflow-y-auto">
        <table className="w-full text-left text-sm">
          <thead className="sticky top-0 bg-slate-50 text-xs uppercase tracking-wide text-slate-400">
            <tr>
              <th className="px-3 py-2">Khách hàng</th>
              <th className="px-3 py-2 text-center">Lượt đặt</th>
              <th className="px-3 py-2 text-center">Lần cuối</th>
              <th className="px-3 py-2">Gợi ý</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {rows.map((row) => (
              <tr key={row.userId} className="hover:bg-slate-50">
                <td className="px-3 py-2">
                  <p className="font-semibold text-slate-800">
                    {row.fullName || `User #${row.userId}`}
                  </p>
                  <p className="text-xs text-slate-400">{row.email || "—"}</p>
                </td>
                <td className="px-3 py-2 text-center font-semibold text-slate-700">
                  {row.totalBookings}
                </td>
                <td className="px-3 py-2 text-center text-slate-500">
                  {row.daysSinceLastBooking != null
                    ? `${row.daysSinceLastBooking} ngày`
                    : "—"}
                </td>
                <td className="px-3 py-2 text-xs text-slate-500">
                  {row.suggestedAction || "Khả năng quay lại cao"}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    )}
  </div>
);

const fmtMetric = (value?: number | null) =>
  value != null ? `${(value * 100).toFixed(1)}%` : "—";

const downloadInsightsCsv = (data: AdminAiInsights) => {
  const rows: string[][] = [
    ["Loại", "Chi nhánh", "Giờ", "Fill rate %", "Ghi chú"],
  ];
  (data.lowFillPromotionSuggestions || []).forEach((slot) => {
    rows.push([
      "Khung giờ thấp điểm",
      slot.branchName,
      slot.hourLabel,
      String(slot.fillRate),
      slot.suggestion,
    ]);
  });
  (data.voucherActivationCandidates || []).forEach((user) => {
    rows.push([
      "Cần voucher",
      user.fullName || `User #${user.userId}`,
      user.lastBranchName || "",
      String(user.daysSinceLastBooking ?? ""),
      user.suggestedAction || user.reason,
    ]);
  });
  const csv = rows
    .map((row) =>
      row.map((cell) => `"${String(cell).replace(/"/g, '""')}"`).join(","),
    )
    .join("\n");
  const blob = new Blob([`\uFEFF${csv}`], {
    type: "text/csv;charset=utf-8;",
  });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = `bhub-ai-insights-${new Date().toISOString().slice(0, 10)}.csv`;
  link.click();
  URL.revokeObjectURL(url);
};

const AiInsightsPage = () => {
  const [insights, setInsights] = useState<AdminAiInsights | null>(null);
  const [naturalAnswer, setNaturalAnswer] = useState<string>("");
  const [status, setStatus] = useState<AiServiceStatus | null>(null);
  const [loading, setLoading] = useState(true);
  const [training, setTraining] = useState(false);
  const [explaining, setExplaining] = useState(false);

  const loadStatus = useCallback(async () => {
    try {
      const result = await aiRecommendationService.getAiServiceStatus();
      setStatus(result);
    } catch {
      setStatus(null);
    }
  }, []);

  const loadInsights = useCallback(
    async (withNaturalLanguage = false) => {
      try {
        if (withNaturalLanguage) {
          setExplaining(true);
        } else {
          setLoading(true);
        }
        const result = await aiRecommendationService.getAdminAiInsights({
          naturalLanguage: withNaturalLanguage,
        });
        setInsights(result.insights);
        if (result.naturalLanguageAnswer) {
          setNaturalAnswer(result.naturalLanguageAnswer);
        }
      } catch (error) {
        const message =
          error instanceof Error ? error.message : "Không tải được phân tích AI";
        toast.error(message);
      } finally {
        setLoading(false);
        setExplaining(false);
      }
    },
    [],
  );

  useEffect(() => {
    loadInsights(false);
    loadStatus();
  }, [loadInsights, loadStatus]);

  const handleTrain = async () => {
    try {
      setTraining(true);
      const result = (await aiRecommendationService.trainAiModel()) as AiTrainResult;
      const booking = result?.trainResult;
      const product = result?.productResult;

      if (booking?.trained) {
        const acc = fmtMetric(booking.metrics?.accuracy);
        toast.success(
          `Đặt sân: train OK (${result.recordCount ?? 0} mẫu, accuracy ${acc}).`,
        );
      } else {
        toast.info(
          `Đặt sân: chưa train (${result?.recordCount ?? 0} mẫu).`,
        );
      }

      if (product?.trained) {
        const acc = fmtMetric(product.metrics?.accuracy);
        toast.success(
          `Sản phẩm: train OK (${product.recordCount ?? 0} mẫu, ${product.basketCount ?? 0} giỏ, accuracy ${acc}).`,
        );
      } else if (product) {
        toast.info(`Sản phẩm: ${product.reason || "chưa đủ dữ liệu"}.`);
      }

      await loadStatus();
      await loadInsights(false);
      toast.info(
        "Số liệu lấp đầy sân cập nhật từ DB (bấm Làm mới). Huấn luyện chỉ cập nhật model gợi ý.",
      );
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "Huấn luyện thất bại";
      toast.error(message);
    } finally {
      setTraining(false);
    }
  };

  const summary = insights?.summary;
  const fillRateChart = (insights?.fillRateByBranch || []).map((row) => ({
    name: row.branchName,
    fillRate: row.fillRate,
  }));

  const promotionGroups = useMemo(() => {
    if (insights?.promotionByBranch?.length) {
      return insights.promotionByBranch;
    }
    return buildPromotionByBranchFromHours(insights?.fillRateByBranchHour || []);
  }, [insights?.promotionByBranch, insights?.fillRateByBranchHour]);

  const hourRowCount = insights?.fillRateByBranchHour?.length ?? 0;

  return (
    <div>
      <AdminPageHeader
        title="Phân tích AI & Gợi ý vận hành"
        subtitle="Bản đồ lấp đầy theo chi nhánh & khung giờ (SQL 30 ngày). Bấm Làm mới sau khi thêm đơn/đặt sân — không phụ thuộc Huấn luyện mô hình."
        action={
          <div className="flex flex-wrap items-center gap-3">
            <button
              type="button"
              onClick={() => insights && downloadInsightsCsv(insights)}
              disabled={!insights}
              className="inline-flex items-center gap-2 rounded-xl border border-white/30 bg-white/10 px-4 py-2 text-sm font-semibold text-white transition hover:bg-white/20 disabled:opacity-50"
            >
              <Download className="h-4 w-4" /> Xuất CSV
            </button>
            <button
              type="button"
              onClick={() => loadInsights(false)}
              className="inline-flex items-center gap-2 rounded-xl border border-white/30 bg-white/10 px-4 py-2 text-sm font-semibold text-white transition hover:bg-white/20"
            >
              <RefreshCw className="h-4 w-4" /> Làm mới
            </button>
            <button
              type="button"
              onClick={handleTrain}
              disabled={training}
              className="inline-flex items-center gap-2 rounded-xl bg-white px-4 py-2 text-sm font-semibold text-[#0b3f56] transition hover:bg-sky-50 disabled:opacity-60"
            >
              {training ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <BrainCircuit className="h-4 w-4" />
              )}
              Huấn luyện mô hình
            </button>
          </div>
        }
      />

      <div className="mb-6 flex flex-wrap items-center gap-4 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
        <span
          className={`inline-flex items-center gap-2 rounded-full px-3 py-1.5 text-sm font-semibold ${
            status?.model?.ready
              ? "bg-emerald-50 text-emerald-600"
              : "bg-slate-100 text-slate-500"
          }`}
        >
          <BrainCircuit className="h-4 w-4" />
          {status?.model?.ready
            ? `Đặt sân: ${status.model.modelType || "LightGBM"}`
            : "Model đặt sân chưa train"}
        </span>
        <span
          className={`inline-flex items-center gap-2 rounded-full px-3 py-1.5 text-sm font-semibold ${
            status?.productModel?.ready
              ? "bg-cyan-50 text-cyan-700"
              : "bg-slate-100 text-slate-500"
          }`}
        >
          <Sparkles className="h-4 w-4" />
          {status?.productModel?.ready
            ? `Sản phẩm: ${status.productModel.modelType || "sẵn sàng"}`
            : "Model SP chưa train"}
        </span>
        {status?.model?.metrics?.accuracy != null ? (
          <span className="text-sm text-slate-500">
            Accuracy đặt sân:{" "}
            <strong className="text-slate-700">
              {fmtMetric(status.model.metrics.accuracy)}
            </strong>
          </span>
        ) : null}
        {status?.productModel?.metrics?.accuracy != null ? (
          <span className="text-sm text-slate-500">
            Accuracy SP:{" "}
            <strong className="text-slate-700">
              {fmtMetric(status.productModel.metrics.accuracy)}
            </strong>
          </span>
        ) : null}
        <span className="flex items-center gap-1.5 text-sm text-slate-500">
          <RefreshCw className="h-4 w-4 text-slate-400" />
          Lần train gần nhất:{" "}
          <strong className="text-slate-700">
            {fmtDateTime(status?.model?.trainedAt)}
          </strong>
        </span>
        <span className="flex items-center gap-1.5 text-sm text-slate-500">
          <Clock className="h-4 w-4 text-slate-400" />
          Tự động train:{" "}
          <strong className="text-slate-700">
            {cronToText(status?.trainingSchedule?.cron)}
          </strong>
        </span>
      </div>

      {loading ? (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} className="h-32" />
          ))}
        </div>
      ) : (
        <>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <StatCard
              title="Tỷ lệ lấp đầy TB"
              value={`${summary?.avgFillRate ?? 0}%`}
              note={`${summary?.branchCount ?? 0} cơ sở`}
              icon={Gauge}
              tone="bg-sky-50 text-sky-600"
            />
            <StatCard
              title="Khung giờ thấp điểm"
              value={String(summary?.lowFillSlotCount ?? 0)}
              note="Nên tạo khuyến mãi"
              icon={Clock}
              tone="bg-amber-50 text-amber-600"
            />
            <StatCard
              title="Khách có thể quay lại"
              value={String(summary?.likelyReturnCount ?? 0)}
              note="Hoạt động gần đây"
              icon={UserCheck}
              tone="bg-emerald-50 text-emerald-600"
            />
            <StatCard
              title="Cần voucher kích hoạt"
              value={String(summary?.voucherCandidateCount ?? 0)}
              note="Nguy cơ rời bỏ"
              icon={BadgePercent}
              tone="bg-rose-50 text-rose-600"
            />
          </div>

          {naturalAnswer ? (
            <div className="mt-6 overflow-hidden rounded-2xl border border-sky-100 bg-white shadow-sm">
              <div className="flex items-center justify-between gap-3 bg-gradient-to-r from-sky-600 to-cyan-500 px-5 py-4">
                <div className="flex items-center gap-3 text-white">
                  <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-white/20 backdrop-blur-sm">
                    <Sparkles className="h-5 w-5" />
                  </span>
                  <div>
                    <h3 className="text-base font-bold">Nhận định từ trợ lý AI</h3>
                    <p className="text-xs text-sky-50/90">
                      Tổng hợp & gợi ý hành động dựa trên dữ liệu vận hành
                    </p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => loadInsights(true)}
                  disabled={explaining}
                  title="Tạo lại tóm tắt"
                  className="inline-flex items-center gap-2 rounded-lg bg-white/15 px-3 py-1.5 text-xs font-semibold text-white transition hover:bg-white/25 disabled:opacity-60"
                >
                  {explaining ? (
                    <Loader2 className="h-3.5 w-3.5 animate-spin" />
                  ) : (
                    <RefreshCw className="h-3.5 w-3.5" />
                  )}
                  Tạo lại
                </button>
              </div>
              <div className="px-5 py-5">
                <AiSummaryContent text={naturalAnswer} />
              </div>
            </div>
          ) : (
            <div className="mt-6 flex flex-col items-start gap-3 rounded-2xl border border-dashed border-sky-200 bg-sky-50/50 p-5 sm:flex-row sm:items-center sm:justify-between">
              <div className="flex items-center gap-3">
                <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-sky-100 text-sky-600">
                  <Sparkles className="h-5 w-5" />
                </span>
                <div>
                  <p className="text-sm font-bold text-slate-800">
                    Nhận định bằng ngôn ngữ tự nhiên
                  </p>
                  <p className="text-xs text-slate-500">
                    Để AI đọc số liệu và viết tóm tắt + gợi ý hành động cho bạn.
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => loadInsights(true)}
                disabled={explaining}
                className={`${adminPrimaryButtonClass} inline-flex shrink-0 items-center gap-2`}
              >
                {explaining ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Sparkles className="h-4 w-4" />
                )}
                Tạo tóm tắt AI
              </button>
            </div>
          )}

          <div className="mt-6 grid gap-6 xl:grid-cols-5">
            <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm xl:col-span-3">
              <div className="mb-4 flex items-center gap-3">
                <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-sky-50 text-sky-600">
                  <TrendingUp className="h-5 w-5" />
                </span>
                <div>
                  <h3 className="text-base font-bold text-slate-900">
                    Bản đồ lấp đầy theo chi nhánh & giờ
                  </h3>
                  <p className="text-xs text-slate-400">
                    30 ngày gần nhất · mỗi ô = 1 khung 1 giờ (vd. 14h = 14:00–15:00)
                  </p>
                </div>
              </div>
              <OccupancyHeatmap rows={insights?.fillRateByBranchHour || []} />
              {fillRateChart.length > 0 ? (
                <div className="mt-6 border-t border-slate-100 pt-5">
                  <p className="mb-3 text-xs font-semibold uppercase tracking-wide text-slate-400">
                    Tỷ lệ TB cả chi nhánh
                  </p>
                  <ResponsiveContainer width="100%" height={220}>
                    <BarChart data={fillRateChart} margin={{ left: -10 }}>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} />
                      <XAxis
                        dataKey="name"
                        tick={{ fontSize: 11 }}
                        interval={0}
                        angle={-15}
                        textAnchor="end"
                        height={60}
                      />
                      <YAxis tick={{ fontSize: 11 }} unit="%" domain={[0, 100]} />
                      <Tooltip
                        formatter={(value: number) => [`${value}%`, "Lấp đầy TB"]}
                      />
                      <Bar dataKey="fillRate" radius={[6, 6, 0, 0]}>
                        {fillRateChart.map((entry, index) => (
                          <Cell key={index} fill={fillColor(entry.fillRate)} />
                        ))}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              ) : null}
            </div>

            <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm xl:col-span-2">
              <div className="mb-4 flex items-center gap-3">
                <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-amber-50 text-amber-600">
                  <AlertTriangle className="h-5 w-5" />
                </span>
                <div>
                  <h3 className="text-base font-bold text-slate-900">
                    Gợi ý khuyến mãi theo chi nhánh
                  </h3>
                  <p className="text-xs text-slate-400">
                    Top {SLOTS_PER_BRANCH} khung thấp nhất / chi nhánh · %
                    = đã đặt ÷ (số sân × 30 ngày)
                  </p>
                </div>
              </div>
              <div className="mb-4 rounded-lg border border-amber-100 bg-amber-50/60 px-3 py-2 text-xs leading-5 text-amber-900">
                <strong>Cách đọc %:</strong> Khung{" "}
                <strong>14:00–15:00</strong> tại một chi nhánh = trong 30 ngày,
                có bao nhiêu lượt đặt (1h) so với tối đa{" "}
                <strong>số sân × 30</strong>. Ví dụ 28/450 lượt → 6.2% — tức
                khung đó còn trống nhiều, phù hợp khuyến mãi.
              </div>
              <BranchPromotionPanel
                groups={promotionGroups}
                hourRowCount={hourRowCount}
              />
            </div>
          </div>

          {insights?.peakTimeSlots?.length ? (
            <div className="mt-6 rounded-2xl border border-emerald-100 bg-emerald-50/40 p-5">
              <p className="mb-3 text-sm font-bold text-emerald-800">
                Khung giờ cao điểm (tham khảo)
              </p>
              <div className="flex flex-wrap gap-2">
                {insights.peakTimeSlots.slice(0, 8).map((slot, index) => (
                  <span
                    key={`${slot.branchId}-${slot.hour}-${index}`}
                    className="rounded-full border border-emerald-200 bg-white px-3 py-1.5 text-xs font-medium text-emerald-800"
                  >
                    {slot.branchName} · {slot.hourLabel} · {slot.fillRate}%
                  </span>
                ))}
              </div>
            </div>
          ) : null}

          <div className="mt-6 grid gap-6 lg:grid-cols-2">
            <CustomerTable
              title="Khách hàng có khả năng quay lại"
              description="Đặt sân gần đây, nên ưu tiên chăm sóc"
              icon={Users}
              tone="bg-emerald-50 text-emerald-600"
              rows={insights?.likelyReturnCustomers || []}
              emptyText="Chưa có khách hàng phù hợp."
            />
            <CustomerTable
              title="Khách cần voucher kích hoạt"
              description="Lâu chưa quay lại, nguy cơ rời bỏ"
              icon={BadgePercent}
              tone="bg-rose-50 text-rose-600"
              rows={insights?.voucherActivationCandidates || []}
              emptyText="Chưa có khách hàng cần kích hoạt."
            />
          </div>
        </>
      )}
    </div>
  );
};

export default AiInsightsPage;
