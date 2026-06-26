import { useState } from "react";
import {
  BellRing,
  CalendarRange,
  ChevronDown,
  ChevronUp,
  Download,
  Gift,
  Megaphone,
} from "lucide-react";
import { toast } from "react-toastify";
import type { AdminCustomerInsight } from "../../../../types/aiRecommendation";
import { type DiscountSegmentDraft } from "../../../../constants/marketingSegment";
import TargetedDiscountModal from "./TargetedDiscountModal";

const formatDaysSince = (days?: number | null) => {
  if (days == null) return "—";
  if (days < 0) return "Vừa đặt";
  if (days === 0) return "Hôm nay";
  if (days === 1) return "Hôm qua";
  return `${days} ngày trước`;
};

const formatPeriodVi = (iso?: string) => {
  if (!iso) return "—";
  const [y, m, d] = iso.split("-");
  return `${d}/${m}/${y}`;
};

const reasonLabel = (reason?: string) => {
  switch (reason) {
    case "top_active_last_period":
      return "Khách chơi thường xuyên";
    case "churn_risk":
      return "Lâu chưa quay lại";
    case "second_booking_nudge":
      return "Mới đặt 1 lần";
    default:
      return reason || "—";
  }
};

const monthCodeSuffix = () => {
  const d = new Date();
  return `${String(d.getFullYear()).slice(2)}${String(d.getMonth() + 1).padStart(2, "0")}`;
};

const datePlusDays = (days: number) => {
  const d = new Date();
  d.setDate(d.getDate() + days);
  return d.toISOString().slice(0, 10);
};

const todayIso = () => new Date().toISOString().slice(0, 10);

const buildVipDiscountDraft = (count: number): DiscountSegmentDraft => ({
  code: `BHUBVIP${monthCodeSuffix()}`,
  type: "PERCENT",
  applyType: "BOOKING",
  value: 10,
  maxDiscount: 80000,
  minAmount: 100000,
  usageLimit: Math.max(count, 1),
  startDate: todayIso(),
  endDate: datePlusDays(30),
  segmentLabel: "Khách tích cực",
});

const buildComebackDiscountDraft = (count: number): DiscountSegmentDraft => ({
  code: `BHUBBACK${monthCodeSuffix()}`,
  type: "PERCENT",
  applyType: "BOOKING",
  value: 15,
  maxDiscount: 100000,
  minAmount: 0,
  usageLimit: Math.max(count, 50),
  startDate: todayIso(),
  endDate: datePlusDays(21),
  segmentLabel: "Tái kích hoạt",
});

const downloadSegmentCsv = (
  segmentName: string,
  rows: AdminCustomerInsight[],
  periodStart?: string,
  periodEnd?: string,
) => {
  const periodNote =
    periodStart && periodEnd ? `${periodStart} → ${periodEnd}` : "";
  const lines = [
    ["Nhóm khách", "Khoảng dữ liệu", "Ưu tiên", "Họ tên", "Email", "Lượt đặt sân", "Đơn trong 30 ngày", "Lần gần nhất", "Chi nhánh gần nhất", "Lý do chọn"],
    ...rows.map((row) => [
      segmentName,
      periodNote,
      row.rank != null ? String(row.rank) : "",
      row.fullName || `User #${row.userId}`,
      row.email || "",
      String(row.sessionsLast30Days ?? 0),
      String(row.ordersLast30Days ?? 0),
      formatDaysSince(row.daysSinceLastBooking),
      row.lastBranchName || "",
      reasonLabel(row.reason),
    ]),
  ];
  const csv = lines
    .map((row) => row.map((cell) => `"${String(cell).replace(/"/g, '""')}"`).join(","))
    .join("\n");
  const blob = new Blob([`\uFEFF${csv}`], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = `bhub-segment-${segmentName}-${new Date().toISOString().slice(0, 10)}.csv`;
  link.click();
  URL.revokeObjectURL(url);
};

const CustomerTable = ({
  variant,
  rows,
}: {
  variant: "vip" | "comeback";
  rows: AdminCustomerInsight[];
}) => {
  const isVip = variant === "vip";

  return (
    <div className="overflow-hidden rounded-lg border border-slate-200">
      <div className="grid grid-cols-[minmax(0,1fr)_auto_auto] gap-2 border-b border-slate-200 bg-slate-100 px-3 py-2 text-[10px] font-bold uppercase tracking-wide text-slate-500">
        <span>Khách hàng</span>
        <span className="w-16 text-center">
          {isVip ? "Lượt đặt" : "Lượt gần đây"}
        </span>
        <span className="w-20 text-right">{isVip ? "Ưu tiên" : "Lần gần nhất"}</span>
      </div>
      <div className="max-h-56 divide-y divide-slate-100 overflow-y-auto">
        {rows.map((row) => (
          <div
            key={row.userId}
            className="grid grid-cols-[minmax(0,1fr)_auto_auto] items-center gap-2 px-3 py-2.5 text-xs hover:bg-slate-50/80"
          >
            <div className="min-w-0">
              <p className="truncate font-semibold text-slate-800">
                {row.fullName || `User #${row.userId}`}
              </p>
              <p className="truncate text-[11px] text-slate-400">{row.email}</p>
              <div className="mt-0.5 flex flex-wrap items-center gap-1.5">
                {!isVip ? (
                  <span
                    className={`rounded px-1.5 py-0.5 text-[10px] font-semibold ${
                      row.reason === "churn_risk"
                        ? "bg-rose-100 text-rose-700"
                        : "bg-amber-100 text-amber-700"
                    }`}
                  >
                    {reasonLabel(row.reason)}
                  </span>
                ) : null}
                {row.lastBranchName ? (
                  <span className="truncate text-[10px] text-slate-400">
                    {row.lastBranchName}
                  </span>
                ) : null}
                <span className="text-[10px] text-slate-400">
                  {row.ordersLast30Days ?? 0} đơn trong 30 ngày
                </span>
              </div>
            </div>
            <div className="w-16 text-center">
              <span
                className={`inline-flex min-w-[2rem] justify-center rounded-lg px-2 py-1 text-sm font-bold ${
                  isVip
                    ? "bg-emerald-100 text-emerald-700"
                    : "bg-slate-100 text-slate-600"
                }`}
              >
                {row.sessionsLast30Days ?? 0}
              </span>
            </div>
            <div className="w-20 text-right text-slate-600">
              {isVip ? (
                <span className="font-bold text-emerald-700">#{row.rank}</span>
              ) : (
                <span className="font-medium">
                  {formatDaysSince(row.daysSinceLastBooking)}
                </span>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

const CustomerSegmentPolicyCard = ({
  variant,
  rows,
  lowFillCount,
  periodStart,
  periodEnd,
  lookbackDays,
  vipMinSessions,
}: {
  variant: "vip" | "comeback";
  rows: AdminCustomerInsight[];
  lowFillCount?: number;
  periodStart?: string;
  periodEnd?: string;
  lookbackDays?: number;
  vipMinSessions?: number;
}) => {
  const [expanded, setExpanded] = useState(false);
  const [showTargetedModal, setShowTargetedModal] = useState(false);
  const count = rows.length;
  const isVip = variant === "vip";
  const days = lookbackDays ?? 30;
  const minSessions = vipMinSessions ?? 2;

  const draft = isVip
    ? buildVipDiscountDraft(count)
    : buildComebackDiscountDraft(count);

  const periodLabel =
    periodStart && periodEnd
      ? `${formatPeriodVi(periodStart)} → ${formatPeriodVi(periodEnd)}`
      : `${days} ngày gần nhất`;

  return (
    <div
      className={`rounded-2xl border bg-white p-5 shadow-sm ${
        isVip ? "border-emerald-100" : "border-rose-100"
      }`}
    >
      <div className="mb-3 flex items-center gap-2 rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-xs text-slate-700">
        <CalendarRange className="h-4 w-4 shrink-0 text-slate-400" />
        <span>
          <strong>Dữ liệu đang xem:</strong> {periodLabel}
          <span className="ml-1 text-slate-400">
            (bấm Làm mới để cập nhật danh sách mới nhất)
          </span>
        </span>
      </div>

      <div className="mb-4 flex flex-wrap items-start justify-between gap-3">
        <div className="flex items-start gap-3">
          <span
            className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-xl ${
              isVip ? "bg-emerald-50 text-emerald-600" : "bg-rose-50 text-rose-600"
            }`}
          >
            {isVip ? <Gift className="h-5 w-5" /> : <Megaphone className="h-5 w-5" />}
          </span>
          <div>
            <h3 className="text-base font-bold text-slate-900">
              {isVip ? "Khách thân thiết nên tri ân" : "Khách nên mời quay lại"}
            </h3>
            <p className="mt-0.5 text-xs text-slate-500">
              {isVip
                ? `Những khách đặt sân nhiều nhất, tối thiểu ${minSessions} lượt`
                : "Khách từng đặt sân nhưng gần đây chưa quay lại"}
            </p>
          </div>
        </div>
        <span
          className={`rounded-full px-3 py-1 text-xs font-bold ${
            count > 0
              ? isVip
                ? "bg-emerald-100 text-emerald-700"
                : "bg-rose-100 text-rose-700"
              : "bg-slate-100 text-slate-500"
          }`}
        >
          {count} khách phù hợp
        </span>
      </div>

      <div className="mb-4 grid gap-2 rounded-xl border border-slate-100 bg-slate-50/80 p-3 text-xs">
        <div className="flex justify-between gap-2">
          <span className="text-slate-500">Mã sẽ tạo</span>
          <span className="font-mono font-bold text-slate-800">
            {draft.code}
            <span className="ml-1 font-sans font-normal text-slate-400">
              + số chống trùng
            </span>
          </span>
        </div>
        <div className="flex justify-between gap-2">
          <span className="text-slate-500">Ưu đãi đề xuất</span>
          <span className="font-semibold text-slate-700">
            Giảm {draft.value}% khi đặt sân · tối đa{" "}
            {(draft.maxDiscount || 0).toLocaleString("vi-VN")}đ
          </span>
        </div>
        <div className="flex justify-between gap-2">
          <span className="text-slate-500">Điều kiện đơn</span>
          <span className="font-semibold text-slate-700">
            {draft.minAmount > 0
              ? `${draft.minAmount.toLocaleString("vi-VN")}đ`
              : "Không yêu cầu"}
          </span>
        </div>
        <div className="flex justify-between gap-2">
          <span className="text-slate-500">Thời gian dùng mã</span>
          <span className="font-semibold text-slate-700">
            {draft.startDate} → {draft.endDate}
          </span>
        </div>
        <div className="flex justify-between gap-2">
          <span className="text-slate-500">Số khách nhận mã</span>
          <span className="font-semibold text-slate-700">
            {count} khách · mỗi khách dùng 1 lần
          </span>
        </div>
      </div>

      <div className="flex flex-wrap gap-2">
        <button
          type="button"
          onClick={() => setShowTargetedModal(true)}
          disabled={count === 0}
          className={`inline-flex items-center gap-1.5 rounded-lg px-3 py-2 text-xs font-semibold text-white transition disabled:cursor-not-allowed disabled:opacity-40 ${
            isVip ? "bg-emerald-600 hover:bg-emerald-700" : "bg-rose-600 hover:bg-rose-700"
          }`}
        >
          <BellRing className="h-3.5 w-3.5" />
          Tạo mã riêng & gửi thông báo
        </button>
        <button
          type="button"
          onClick={() =>
            downloadSegmentCsv(
              isVip ? "vip" : "comeback",
              rows,
              periodStart,
              periodEnd,
            )
          }
          disabled={count === 0}
          className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs font-semibold text-slate-700 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-40"
        >
          <Download className="h-3.5 w-3.5" />
          Xuất danh sách khách
        </button>
      </div>

      <div className="mt-4 rounded-lg border border-dashed border-slate-200 bg-slate-50/60 p-3">
        <p className="text-[11px] font-semibold uppercase tracking-wide text-slate-400">
          Chính sách ưu đãi
        </p>
        <div className="mt-2 space-y-1.5 text-xs leading-5 text-slate-600">
          <p>
            <strong className="text-slate-700">Áp dụng cho:</strong>{" "}
            {isVip
              ? `có nhiều lượt đặt sân trong ${periodLabel}, đạt tối thiểu ${minSessions} lượt và nằm trong nhóm khách hoạt động nổi bật.`
              : `từng đặt sân tại B-Hub nhưng không phát sinh lượt đặt mới trong ${periodLabel}, hoặc mới đặt 1 lần rồi chưa quay lại.`}
          </p>
          <p>
            <strong className="text-slate-700">Mục đích:</strong>{" "}
            {isVip
              ? "tri ân khách thân thiết, tăng sự gắn bó và khuyến khích họ tiếp tục đặt sân."
              : "nhắc khách quay lại bằng ưu đãi có thời hạn, ưu tiên gắn với các khung giờ còn trống."}
          </p>
          {!isVip && lowFillCount ? (
            <p>
              <strong className="text-slate-700">Gợi ý gửi mã:</strong> nên gắn ưu đãi
              vào {lowFillCount} khung giờ còn trống để tăng khả năng khách quay lại.
            </p>
          ) : null}
        </div>
      </div>

      {count > 0 ? (
        <div className="mt-4">
          <button
            type="button"
            onClick={() => setExpanded((v) => !v)}
            className="flex w-full items-center justify-between rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50"
          >
            <span>Danh sách {count} khách phù hợp</span>
            {expanded ? (
              <ChevronUp className="h-4 w-4" />
            ) : (
              <ChevronDown className="h-4 w-4" />
            )}
          </button>
          {expanded ? (
            <div className="mt-2">
              <CustomerTable variant={variant} rows={rows} />
            </div>
          ) : null}
        </div>
      ) : (
        <div className="mt-4 rounded-xl border border-dashed border-slate-200 bg-slate-50/70 px-4 py-6 text-center">
          <div
            className={`mx-auto mb-3 flex h-10 w-10 items-center justify-center rounded-xl ${
              isVip ? "bg-emerald-50 text-emerald-600" : "bg-rose-50 text-rose-600"
            }`}
          >
            {isVip ? <Gift className="h-5 w-5" /> : <Megaphone className="h-5 w-5" />}
          </div>
          <p className="text-sm font-semibold text-slate-700">
            {isVip ? "Chưa đủ khách để tri ân" : "Chưa cần gửi ưu đãi quay lại"}
          </p>
          <p className="mx-auto mt-1 max-w-md text-xs leading-5 text-slate-500">
            {isVip
              ? `Chưa có khách đạt tối thiểu ${minSessions} lượt đặt sân trong khoảng này. Hãy làm mới sau khi có thêm dữ liệu đặt sân.`
              : "Không có khách vắng mặt trong khoảng đang xem. Có thể ưu tiên theo dõi nhóm khách thân thiết hoặc các khung giờ còn trống."}
          </p>
        </div>
      )}

      {showTargetedModal ? (
        <TargetedDiscountModal
          draft={draft}
          segment={isVip ? "LOYAL" : "WINBACK"}
          rows={rows}
          onClose={() => setShowTargetedModal(false)}
          onCreated={(code, assigned) => {
            setShowTargetedModal(false);
            toast.success(`Đã tạo mã ${code} và gửi cho ${assigned} khách`);
          }}
        />
      ) : null}
    </div>
  );
};

const CustomerPoliciesSection = ({
  activeRows,
  comebackRows,
  lowFillCount,
  periodStart,
  periodEnd,
  lookbackDays,
  vipMinSessions,
}: {
  activeRows: AdminCustomerInsight[];
  comebackRows: AdminCustomerInsight[];
  lowFillCount: number;
  periodStart?: string;
  periodEnd?: string;
  lookbackDays?: number;
  vipMinSessions?: number;
}) => {
  return (
    <div className="mt-6 space-y-4">
      <div>
        <h2 className="text-lg font-bold text-slate-900">
          Chính sách nhận khuyến mãi cho khách hàng
        </h2>
      </div>
      <div className="grid gap-6 lg:grid-cols-2">
        <CustomerSegmentPolicyCard
          variant="vip"
          rows={activeRows}
          periodStart={periodStart}
          periodEnd={periodEnd}
          lookbackDays={lookbackDays}
          vipMinSessions={vipMinSessions}
        />
        <CustomerSegmentPolicyCard
          variant="comeback"
          rows={comebackRows}
          lowFillCount={lowFillCount}
          periodStart={periodStart}
          periodEnd={periodEnd}
          lookbackDays={lookbackDays}
        />
      </div>
    </div>
  );
};

export default CustomerPoliciesSection;
