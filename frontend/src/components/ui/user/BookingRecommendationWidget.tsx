import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Clock,
  Loader2,
  MapPin,
  Sparkles,
  TicketPercent,
} from "lucide-react";
import aiRecommendationService from "../../../services/aiRecommendationService";
import type { UserAiRecommendation } from "../../../types/aiRecommendation";
import { useAppSelector } from "../../../redux/hook";

const STRATEGY_LABEL: Record<string, string> = {
  ml_personalized: "Cá nhân hóa từ lịch sử đặt của bạn",
  history_heuristic: "Dựa trên lịch sử đặt của bạn",
  cold_start: "Gợi ý sân phổ biến & đang khuyến mãi",
};

const REASON_LABEL: Record<string, string> = {
  ml_prediction: "AI dự đoán",
  history_frequency: "Bạn hay đặt",
  popular: "Phổ biến",
  active_promotion: "Đang khuyến mãi",
};

type BookingRecommendationWidgetProps = {
  layout?: "vertical" | "horizontal";
  onSelectBranch?: (branchId: number, branchName?: string) => void;
  onSelectTimeSlot?: (hour: number) => void;
};

const BookingRecommendationWidget = ({
  layout = "vertical",
  onSelectBranch,
  onSelectTimeSlot,
}: BookingRecommendationWidgetProps) => {
  const navigate = useNavigate();
  const { accessToken } = useAppSelector((state) => state.auth);
  const [data, setData] = useState<UserAiRecommendation | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string>("");

  useEffect(() => {
    let active = true;
    (async () => {
      try {
        setLoading(true);
        let result;
        if (accessToken) {
          try {
            result = await aiRecommendationService.getUserRecommendations({
              topK: 4,
            });
          } catch {
            result = await aiRecommendationService.getPublicRecommendations({
              topK: 4,
            });
          }
        } else {
          result = await aiRecommendationService.getPublicRecommendations({
            topK: 4,
          });
        }
        if (active) {
          setData(result.recommendations);
          setError("");
        }
      } catch (err) {
        if (active) {
          setError(
            err instanceof Error ? err.message : "Không tải được gợi ý đặt sân",
          );
        }
      } finally {
        if (active) setLoading(false);
      }
    })();
    return () => {
      active = false;
    };
  }, [accessToken]);

  if (error) return null;

  const isHorizontal = layout === "horizontal";

  const handleBranchClick = (branchId: number, branchName?: string) => {
    if (onSelectBranch) {
      onSelectBranch(branchId, branchName);
    } else {
      navigate(`/branches/${branchId}`);
    }
  };

  return (
    <div className="rounded-2xl border border-sky-100 bg-gradient-to-br from-sky-50 to-white p-6 shadow-sm">
      <div className="mb-4 flex items-center gap-2">
        <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-sky-600 text-white">
          <Sparkles className="h-5 w-5" />
        </span>
        <div>
          <h3 className="text-base font-bold text-sky-900">Gợi ý cho bạn</h3>
          <p className="text-xs text-sky-600">
            {loading
              ? "Đang phân tích..."
              : STRATEGY_LABEL[data?.strategy || "cold_start"] ||
                "Gợi ý đặt sân"}
          </p>
        </div>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-10 text-sky-500">
          <Loader2 className="h-6 w-6 animate-spin" />
        </div>
      ) : (
        <div
          className={
            isHorizontal
              ? "grid gap-5 md:grid-cols-3"
              : "space-y-5"
          }
        >
          {data?.branchRecommendations?.length ? (
            <div>
              <p className="mb-2 flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wide text-slate-500">
                <MapPin className="h-3.5 w-3.5" /> Cơ sở gợi ý
              </p>
              <div className="space-y-2">
                {data.branchRecommendations.map((branch) => (
                  <button
                    key={branch.branchId}
                    type="button"
                    onClick={() =>
                      handleBranchClick(branch.branchId, branch.branchName)
                    }
                    className="flex w-full items-center justify-between rounded-xl border border-slate-100 bg-white px-4 py-3 text-left transition hover:border-sky-300 hover:bg-sky-50"
                  >
                    <div className="min-w-0">
                      <span className="block text-sm font-semibold text-slate-800">
                        {branch.branchName || `Chi nhánh #${branch.branchId}`}
                      </span>
                      {branch.reason ? (
                        <span className="mt-0.5 inline-flex rounded-full bg-sky-50 px-2 py-0.5 text-[10px] font-semibold text-sky-700">
                          {REASON_LABEL[branch.reason] || branch.reason}
                        </span>
                      ) : null}
                    </div>
                    <span className="text-xs font-medium text-sky-600">
                      {onSelectBranch ? "Chọn →" : "Đặt sân →"}
                    </span>
                  </button>
                ))}
              </div>
            </div>
          ) : null}

          {data?.timeSlotRecommendations?.length ? (
            <div>
              <p className="mb-2 flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wide text-slate-500">
                <Clock className="h-3.5 w-3.5" /> Khung giờ phù hợp
              </p>
              <div className="flex flex-wrap gap-2">
                {data.timeSlotRecommendations.map((slot) =>
                  onSelectTimeSlot ? (
                    <button
                      key={`${slot.hour}-${slot.label}`}
                      type="button"
                      onClick={() => onSelectTimeSlot(slot.hour)}
                      className="rounded-full border border-sky-200 bg-white px-3 py-1.5 text-sm font-semibold text-sky-700 transition hover:border-sky-400 hover:bg-sky-50"
                    >
                      {slot.label}
                      {slot.reason ? (
                        <span className="ml-1 text-[10px] font-normal text-sky-500">
                          · {REASON_LABEL[slot.reason] || slot.reason}
                        </span>
                      ) : null}
                    </button>
                  ) : (
                    <span
                      key={`${slot.hour}-${slot.label}`}
                      className="rounded-full border border-sky-200 bg-white px-3 py-1.5 text-sm font-semibold text-sky-700"
                    >
                      {slot.label}
                    </span>
                  ),
                )}
              </div>
            </div>
          ) : null}

          {data?.promotionSuggestions?.length ? (
            <div>
              <p className="mb-2 flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wide text-slate-500">
                <TicketPercent className="h-3.5 w-3.5" /> Ưu đãi đang có
              </p>
              <div className="space-y-2">
                {data.promotionSuggestions.map((promo, index) => (
                  <div
                    key={`${promo.branchId}-${index}`}
                    className="flex items-center justify-between rounded-xl border border-amber-100 bg-amber-50 px-4 py-2.5"
                  >
                    <span className="text-sm font-medium text-amber-800">
                      {promo.branchName || `Chi nhánh #${promo.branchId}`}
                    </span>
                    {promo.discountCode ? (
                      <span className="rounded-md bg-amber-500 px-2 py-1 text-xs font-bold text-white">
                        {promo.discountCode}
                      </span>
                    ) : null}
                  </div>
                ))}
              </div>
            </div>
          ) : null}

          {!data?.branchRecommendations?.length &&
          !data?.timeSlotRecommendations?.length ? (
            <p
              className={`py-6 text-center text-sm text-slate-400 ${
                isHorizontal ? "md:col-span-3" : ""
              }`}
            >
              Chưa có gợi ý. Hãy đặt sân để nhận gợi ý cá nhân hóa!
            </p>
          ) : null}
        </div>
      )}
    </div>
  );
};

export default BookingRecommendationWidget;
