import { useCallback, useEffect, useMemo, useState, type ReactNode } from "react";
import {
  AlertTriangle,
  Clock,
  Download,
  Flame,
  Gauge,
  Gift,
  Loader2,
  Megaphone,
  RefreshCw,
  Sparkles,
  TicketPercent,
  TrendingUp,
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
import CustomerPoliciesSection from "../../components/ui/admin/ai/CustomerPoliciesSection";
import DiscountFormModal from "../../components/ui/admin/discounts/DiscountFormModal";
import { adminPrimaryButtonClass } from "../../components/ui/admin/AdminModal";
import { type DiscountSegmentDraft } from "../../constants/marketingSegment";
import aiRecommendationService, {
  type AiServiceStatus,
  type AiTrainResult,
} from "../../services/aiRecommendationService";
import type {
  AdminAiInsights,
  AdminPromotionByBranch,
} from "../../types/aiRecommendation";
import { exportExcel } from "../../utils/exportExcel";

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
    : "Chưa cập nhật";

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

const capacityBreakdown = (capacity: number, courtCount?: number) => {
  if (!courtCount || courtCount <= 0) return "";
  const days = Math.round(capacity / courtCount);
  return ` (${courtCount} sân trong ${days} ngày)`;
};

type HourCell = {
  hour: number;
  hourLabel: string;
  fillRate: number;
  bookedCount: number;
  capacity: number;
  courtCount?: number;
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
      courtCount: row.courtCount,
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
                  title={`${label}: đã đặt ${cell?.bookedCount ?? 0}/${
                    cell?.capacity ?? 0
                  } lượt có thể phục vụ${capacityBreakdown(
                    cell?.capacity ?? 0,
                    cell?.courtCount,
                  )} = ${rate}%`}
                  className={`h-7 rounded ${heatCellColor(rate)} transition hover:ring-2 hover:ring-sky-400`}
                />
              );
            })}
          </div>
        ))}
        <div className="mt-4 flex flex-wrap items-center gap-3 text-xs text-slate-500">
          <span className="font-semibold text-slate-600">Màu sắc:</span>
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
const PEAK_SLOTS_PER_BRANCH = 3;

const todayIso = () => new Date().toISOString().slice(0, 10);
const datePlusDays = (days: number) => {
  const d = new Date();
  d.setDate(d.getDate() + days);
  return d.toISOString().slice(0, 10);
};

/** Điền sẵn mã kích cầu cho 1 khung giờ trống của 1 chi nhánh. */
const buildLowFillSlotDraft = (
  branchId: number,
  branchName: string,
  startHour: number,
  endHour: number,
): DiscountSegmentDraft => ({
  code: `OFF${String(startHour).padStart(2, "0")}B${branchId}`,
  type: "PERCENT",
  applyType: "BOOKING",
  value: 15,
  maxDiscount: 50000,
  minAmount: 0,
  startDate: todayIso(),
  endDate: datePlusDays(30),
  segmentLabel: `Khung trống ${branchName} ${startHour}h-${endHour}h`,
  branchId,
  branchName,
  startHour,
  endHour,
});

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

      const slots = branch.hours
        .filter((row) => row.fillRate < LOW_FILL_THRESHOLD)
        .sort((a, b) => a.fillRate - b.fillRate || a.hour - b.hour)
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
          courtCount: row.courtCount,
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
  onCreatePromo,
}: {
  groups: AdminPromotionByBranch[];
  hourRowCount: number;
  onCreatePromo: (draft: DiscountSegmentDraft) => void;
}) => {
  const [activeBranchId, setActiveBranchId] = useState<number | null>(null);

  if (!groups.length) {
    return (
      <div className="space-y-3 py-8 text-center text-sm text-slate-500">
        <p>Không có dữ liệu khung giờ để gợi ý khuyến mãi.</p>
        {hourRowCount === 0 ? (
          <p className="text-xs text-slate-400">
            Chưa có lịch đặt sân đủ điều kiện trong 30 ngày gần nhất. Hãy kiểm
            tra dữ liệu đặt sân hoặc bấm <strong>Làm mới</strong> sau khi có
            lịch mới.
          </p>
        ) : (
          <p className="text-xs text-slate-400">
            Có {hourRowCount} ô giờ nhưng chưa có nhóm khuyến mãi phù hợp. Hãy
            bấm <strong>Làm mới</strong> hoặc kiểm tra lại bộ lọc ngày.
          </p>
        )}
      </div>
    );
  }

  const branch =
    groups.find((g) => g.branchId === activeBranchId) ?? groups[0];

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap gap-2">
        {groups.map((g) => {
          const isActive = g.branchId === branch.branchId;
          return (
            <button
              key={g.branchId}
              type="button"
              onClick={() => setActiveBranchId(g.branchId)}
              className={`inline-flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-xs font-semibold transition ${
                isActive
                  ? "border-sky-600 bg-sky-600 text-white"
                  : "border-slate-200 bg-white text-slate-600 hover:bg-slate-50"
              }`}
            >
              {g.branchName}
              <span
                className={`rounded-full px-1.5 py-0.5 text-[10px] font-bold ${
                  isActive
                    ? "bg-white/20 text-white"
                    : "bg-slate-100 text-slate-500"
                }`}
              >
                {g.slots.length}
              </span>
            </button>
          );
        })}
      </div>

      <div className="rounded-xl border border-slate-200 bg-slate-50/80 p-4">
        <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
          <div>
            <p className="text-sm font-bold text-slate-900">
              {branch.branchName}
            </p>
            <p className="text-xs text-slate-500">
              Mức lấp đầy 30 ngày:{" "}
              <strong className="text-slate-700">
                {branch.branchFillRate}%
              </strong>
              {" · "}
              {branch.totalBooked}/{branch.totalCapacity} lượt có thể phục vụ ·{" "}
              {branch.slots.length} khung nên xem xét khuyến mãi
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
              ? "Nên ưu tiên"
              : branch.branchFillRate < 40
                ? "Cần theo dõi"
                : "Đang ổn"}
          </span>
        </div>
        {branch.slots.length === 0 ? (
          <p className="py-6 text-center text-xs text-slate-400">
            Chi nhánh này chưa có khung giờ trống đáng kể, chưa cần tạo thêm
            khuyến mãi.
          </p>
        ) : (
          <div className="max-h-[440px] space-y-2 overflow-y-auto pr-1">
            {branch.slots.map((slot) => (
              <div
                key={`${branch.branchId}-${slot.hour}`}
                className="flex items-center justify-between gap-3 rounded-lg border border-white bg-white px-3 py-2.5 shadow-sm"
              >
                <div className="min-w-0">
                  <p className="text-sm font-semibold text-slate-800">
                    {slot.hourLabel}
                  </p>
                  <p className="text-xs text-slate-400">
                    Đã đặt {slot.bookedCount}/{slot.capacity} lượt có thể phục vụ
                    {capacityBreakdown(slot.capacity, slot.courtCount)} ·{" "}
                    {slot.needsPromotion !== false
                      ? "Nên tạo khuyến mãi"
                      : "Theo dõi thêm"}
                  </p>
                </div>
                <div className="flex shrink-0 items-center gap-2">
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
                  <button
                    type="button"
                    onClick={() =>
                      onCreatePromo(
                        buildLowFillSlotDraft(
                          branch.branchId,
                          branch.branchName,
                          slot.hour,
                          slot.hourEnd ?? slot.hour + 1,
                        ),
                      )
                    }
                    title={`Tạo mã giảm cho ${branch.branchName} khung ${slot.hourLabel}`}
                    className="inline-flex items-center gap-1 rounded-lg bg-sky-600 px-2.5 py-1.5 text-xs font-semibold text-white transition hover:bg-sky-700"
                  >
                    <TicketPercent className="h-3.5 w-3.5" />
                    Tạo KM
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
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

const AdminUsageGuide = () => (
  <section className="mb-6 grid gap-3 md:grid-cols-2 xl:grid-cols-4">
    {[
      {
        icon: RefreshCw,
        title: "1. Làm mới số liệu",
        desc: "Bấm sau khi có lịch đặt sân hoặc đơn hàng mới để trang lấy lại tình hình hiện tại.",
        tone: "bg-sky-50 text-sky-700",
      },
      {
        icon: TrendingUp,
        title: "2. Xem khung giờ",
        desc: "Ô màu nhạt là khung còn trống nhiều; ô xanh là khung đang được đặt tốt.",
        tone: "bg-emerald-50 text-emerald-700",
      },
      {
        icon: TicketPercent,
        title: "3. Tạo khuyến mãi",
        desc: "Ở khung giờ trống, bấm Tạo KM để mở sẵn form mã giảm giá đúng chi nhánh và giờ.",
        tone: "bg-amber-50 text-amber-700",
      },
      {
        icon: Megaphone,
        title: "4. Chăm sóc khách",
        desc: "Dùng nhóm khách tích cực và khách lâu chưa quay lại để gửi mã riêng hoặc xuất danh sách.",
        tone: "bg-rose-50 text-rose-700",
      },
    ].map((item) => (
      <article
        key={item.title}
        className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm"
      >
        <span
          className={`mb-3 flex h-10 w-10 items-center justify-center rounded-xl ${item.tone}`}
        >
          <item.icon className="h-5 w-5" />
        </span>
        <h3 className="text-sm font-bold text-slate-900">{item.title}</h3>
        <p className="mt-1 text-xs leading-5 text-slate-500">{item.desc}</p>
      </article>
    ))}
  </section>
);

const PeakTimeBoard = ({
  slots,
}: {
  slots: AdminAiInsights["peakTimeSlots"];
}) => {
  const byBranch = useMemo(() => {
    const map = new Map<
      number,
      { branchName: string; slots: AdminAiInsights["peakTimeSlots"] }
    >();
    slots.forEach((slot) => {
      if (!map.has(slot.branchId)) {
        map.set(slot.branchId, { branchName: slot.branchName, slots: [] });
      }
      map.get(slot.branchId)!.slots.push(slot);
    });
    return [...map.entries()].sort((a, b) => a[0] - b[0]);
  }, [slots]);

  if (!byBranch.length) {
    return (
      <p className="py-10 text-center text-sm text-slate-400">
        Chưa đủ dữ liệu để xác định cao điểm.
      </p>
    );
  }

  return (
    <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
      {byBranch.map(([branchId, branch]) => (
        <div
          key={branchId}
          className="rounded-xl border border-emerald-100 bg-white p-4 shadow-sm"
        >
          <div className="mb-3 flex items-start justify-between gap-2">
            <div>
              <p className="text-sm font-bold text-slate-900">{branch.branchName}</p>
              <p className="text-xs text-slate-400">
                Top {PEAK_SLOTS_PER_BRANCH} khung % cao nhất
              </p>
            </div>
            <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-emerald-50 text-emerald-600">
              <Flame className="h-4 w-4" />
            </span>
          </div>
          <div className="space-y-3">
            {branch.slots
              .sort((a, b) => b.fillRate - a.fillRate || a.hour - b.hour)
              .map((slot, index) => (
                <div key={`${slot.hour}-${index}`}>
                  <div className="mb-1 flex items-center justify-between text-xs">
                    <span className="font-semibold text-slate-700">
                      #{index + 1} {slot.hourLabel}
                    </span>
                    <span className="font-bold text-emerald-700">{slot.fillRate}%</span>
                  </div>
                  <div className="h-2 overflow-hidden rounded-full bg-slate-100">
                    <div
                      className="h-full rounded-full bg-gradient-to-r from-emerald-400 to-emerald-600 transition-all"
                      style={{ width: `${Math.min(100, slot.fillRate)}%` }}
                    />
                  </div>
                  <p className="mt-0.5 text-[10px] text-slate-400">
                    {slot.bookedCount ?? 0}/{slot.capacity ?? 0} lượt có thể phục vụ
                    {capacityBreakdown(slot.capacity ?? 0, slot.courtCount)}
                  </p>
                </div>
              ))}
          </div>
        </div>
      ))}
    </div>
  );
};


const formatDaysSinceLabel = (days?: number | null) => {
  if (days == null) return "—";
  if (days === 0) return "Hôm nay";
  if (days === 1) return "Hôm qua";
  return `${days} ngày trước`;
};

const downloadInsightsExcel = (data: AdminAiInsights) => {
  exportExcel(`bhub-ai-insights-${new Date().toISOString().slice(0, 10)}.xls`, [
    {
      title: "Khung giờ thấp điểm",
      headers: ["Chi nhánh", "Giờ", "Fill rate %", "Ghi chú"],
      rows: (data.lowFillPromotionSuggestions || []).map((slot) => [
        slot.branchName,
        slot.hourLabel,
        slot.fillRate,
        slot.suggestion,
      ]),
    },
    {
      title: "Khách hàng cần tái kích hoạt",
      headers: [
        "Khách hàng",
        "Chi nhánh gần nhất",
        "Số lượt 30 ngày",
        "Lần đặt gần nhất",
        "Gợi ý",
      ],
      rows: (data.voucherActivationCandidates || []).map((user) => [
        user.fullName || `User #${user.userId}`,
        user.lastBranchName || "",
        user.sessionsLast30Days ?? 0,
        formatDaysSinceLabel(user.daysSinceLastBooking),
        user.suggestedAction || user.reason,
      ]),
    },
  ]);
};

const AiInsightsPage = () => {
  const [insights, setInsights] = useState<AdminAiInsights | null>(null);
  const [naturalAnswer, setNaturalAnswer] = useState<string>("");
  const [status, setStatus] = useState<AiServiceStatus | null>(null);
  const [loading, setLoading] = useState(true);
  const [training, setTraining] = useState(false);
  const [explaining, setExplaining] = useState(false);
  const [promoDraft, setPromoDraft] = useState<DiscountSegmentDraft | null>(null);

  const handleCreatePromo = useCallback((draft: DiscountSegmentDraft) => {
    setPromoDraft(draft);
  }, []);

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
      const product = result?.productResult;

      if (product?.trained) {
        toast.success(
          `Đã cập nhật gợi ý sản phẩm từ ${product.recordCount ?? 0} lượt tương tác và ${product.basketCount ?? 0} giỏ hàng.`,
        );
      } else if (product) {
        toast.info(
          product.reason ||
            "Chưa đủ dữ liệu mua hàng để cập nhật gợi ý sản phẩm.",
        );
      }

      await loadStatus();
      await loadInsights(false);
      toast.info(
        "Số liệu sân đã được làm mới. Phần gợi ý sản phẩm được cập nhật riêng từ lịch sử mua hàng.",
      );
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "Không cập nhật được gợi ý";
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
        title="Phân tích vận hành & Gợi ý hành động"
        subtitle="Theo dõi mức lấp đầy sân, khung giờ nên khuyến mãi và nhóm khách cần chăm sóc. Admin có thể làm mới số liệu, xuất báo cáo hoặc tạo mã giảm giá ngay từ trang này."
        action={
          <div className="flex flex-wrap items-center justify-end gap-3">
            <button
              type="button"
              onClick={handleTrain}
              disabled={training}
              className="inline-flex items-center justify-center gap-2 rounded-xl bg-white px-4 py-2 text-sm font-semibold text-[#0b3f56] transition hover:bg-sky-50 disabled:opacity-60"
            >
              {training ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Sparkles className="h-4 w-4" />
              )}
              Cập nhật gợi ý
            </button>
            <button
              type="button"
              onClick={() => insights && downloadInsightsExcel(insights)}
              disabled={!insights}
              className="inline-flex items-center justify-center gap-2 rounded-xl bg-emerald-500 px-4 py-2 text-sm font-semibold text-white transition hover:bg-emerald-600 disabled:opacity-50"
            >
              <Download className="h-4 w-4" /> Xuất Excel
            </button>
            <button
              type="button"
              onClick={() => loadInsights(false)}
              className="inline-flex items-center justify-center gap-2 rounded-xl border border-white/30 bg-white/10 px-4 py-2 text-sm font-semibold text-white transition hover:bg-white/20"
            >
              <RefreshCw className="h-4 w-4" /> Làm mới
            </button>
          </div>
        }
      />

      <div className="mb-6 flex flex-wrap items-center gap-4 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
        <span
          className={`inline-flex items-center gap-2 rounded-full px-3 py-1.5 text-sm font-semibold ${
            status?.productModel?.ready
              ? "bg-cyan-50 text-cyan-700"
              : "bg-slate-100 text-slate-500"
          }`}
        >
          <Sparkles className="h-4 w-4" />
          {status?.productModel?.ready
            ? "Gợi ý sản phẩm đã sẵn sàng"
            : "Chưa có gợi ý sản phẩm"}
        </span>
        <span className="flex items-center gap-1.5 text-sm text-slate-500">
          <RefreshCw className="h-4 w-4 text-slate-400" />
          Lần cập nhật gần nhất:{" "}
          <strong className="text-slate-700">
            {fmtDateTime(status?.productModel?.trainedAt)}
          </strong>
        </span>
        <span className="flex items-center gap-1.5 text-sm text-slate-500">
          <Clock className="h-4 w-4 text-slate-400" />
          Lịch tự cập nhật:{" "}
          <strong className="text-slate-700">
            {cronToText(status?.trainingSchedule?.cron)}
          </strong>
        </span>
      </div>

      <AdminUsageGuide />

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
              title="Mức lấp đầy TB"
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
              title="Tri ân (top suất)"
              value={String(summary?.likelyReturnCount ?? 0)}
              note={`Kỳ ${summary?.customerLookbackDays ?? 30} ngày`}
              icon={Gift}
              tone="bg-emerald-50 text-emerald-600"
            />
            <StatCard
              title="Cần tái kích hoạt"
              value={String(summary?.voucherCandidateCount ?? 0)}
              note="Nên gửi ưu đãi quay lại"
              icon={Megaphone}
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
                    <h3 className="text-base font-bold">Tóm tắt dành cho quản trị</h3>
                    <p className="text-xs text-sky-50/90">
                      Diễn giải nhanh số liệu và đề xuất việc nên làm tiếp theo
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
                    Tạo bản tóm tắt dễ đọc
                  </p>
                  <p className="text-xs text-slate-500">
                    Hệ thống sẽ viết lại các số liệu chính thành đoạn gợi ý dễ dùng cho admin.
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
                Tạo tóm tắt
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
                    30 ngày gần nhất · di chuột vào ô để xem số lượt đặt và
                    sức chứa của khung giờ.
                  </p>
                </div>
              </div>
              <OccupancyHeatmap rows={insights?.fillRateByBranchHour || []} />
              {fillRateChart.length > 0 ? (
                <div className="mt-6 border-t border-slate-100 pt-5">
                  <p className="mb-3 text-xs font-semibold uppercase tracking-wide text-slate-400">
                    Mức lấp đầy trung bình theo chi nhánh
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
                    Ưu tiên các khung có nhiều sân trống trong 30 ngày gần nhất.
                  </p>
                </div>
              </div>
              <div className="mb-4 rounded-lg border border-amber-100 bg-amber-50/60 px-3 py-2 text-xs leading-5 text-amber-900">
                <strong>Cách dùng:</strong> chọn chi nhánh, xem các khung có tỷ
                lệ thấp, rồi bấm <strong>Tạo KM</strong>. Form mã giảm giá sẽ
                được điền sẵn chi nhánh và giờ áp dụng để admin chỉ cần kiểm tra
                lại mức giảm trước khi lưu.
              </div>
              <BranchPromotionPanel
                groups={promotionGroups}
                hourRowCount={hourRowCount}
                onCreatePromo={handleCreatePromo}
              />
            </div>
          </div>

          <div className="mt-6 rounded-2xl border border-emerald-100 bg-gradient-to-b from-emerald-50/60 to-white p-5 shadow-sm">
            <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
              <div className="flex items-center gap-3">
                <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-100 text-emerald-700">
                  <Flame className="h-5 w-5" />
                </span>
                <div>
                  <h3 className="text-base font-bold text-slate-900">
                    Khung giờ cao điểm
                  </h3>
                  <p className="text-xs text-slate-500">
                    Các khung được đặt nhiều nhất trong 30 ngày gần nhất, nên
                    hạn chế giảm giá sâu và chuẩn bị nhân sự/sân tốt hơn.
                  </p>
                </div>
              </div>
              <span className="rounded-full bg-white px-3 py-1 text-xs font-semibold text-emerald-700 shadow-sm ring-1 ring-emerald-100">
                {insights?.peakTimeSlots?.length ?? 0} khung
              </span>
            </div>
            <PeakTimeBoard slots={insights?.peakTimeSlots || []} />
          </div>

          <CustomerPoliciesSection
            activeRows={insights?.likelyReturnCustomers || []}
            comebackRows={insights?.voucherActivationCandidates || []}
            lowFillCount={summary?.lowFillSlotCount ?? 0}
            periodStart={summary?.periodStart}
            periodEnd={summary?.periodEnd}
            lookbackDays={summary?.customerLookbackDays ?? summary?.lookbackDays}
            vipMinSessions={summary?.vipMinSessions}
          />
        </>
      )}

      {promoDraft ? (
        <DiscountFormModal
          discount={null}
          draft={promoDraft}
          onClose={() => setPromoDraft(null)}
          onSaved={() => setPromoDraft(null)}
        />
      ) : null}
    </div>
  );
};

export default AiInsightsPage;
