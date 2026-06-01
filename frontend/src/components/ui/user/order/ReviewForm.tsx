import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Clock, Loader2, Star, X } from "lucide-react";
import {
  FormRatingSchema,
  type formRating,
} from "../../../../schemas/FormRatingSchema";
import { useAppDispatch, useAppSelector } from "../../../../redux/hook";
import {
  clearFeedback,
  getFeedbackDetail,
} from "../../../../redux/slices/user/feedbackSlice";

type ReviewFormProps = {
  setOpenReviewForm: (open: boolean) => void;
  onSubmit: (data: formRating) => void;
  update: boolean;
  orderId?: number;
  variantId?: number;
  loading?: boolean;
};

const starLabels = ["Tệ", "Khá", "Bình thường", "Tốt", "Tuyệt vời"];

const ReviewForm = ({
  setOpenReviewForm,
  onSubmit,
  update,
  orderId,
  variantId,
  loading,
}: ReviewFormProps) => {
  const dispatch = useAppDispatch();
  const { feedback } = useAppSelector((state) => state.feedback);
  const detailLoading = useAppSelector(
    (state) => state.ui.loadingMap["feedback/getFeedbackDetail"],
  );

  const {
    register,
    handleSubmit,
    setValue,
    reset,
    watch,
    formState: { errors },
  } = useForm<formRating>({
    resolver: zodResolver(FormRatingSchema),
    defaultValues: {
      rating: 1,
      content: "",
    },
  });

  const [selected, setSelected] = useState<formRating["rating"]>(1);
  const [hovered, setHovered] = useState<number>(0);

  useEffect(() => {
    if (!update || !orderId || !variantId) {
      dispatch(clearFeedback());
      return;
    }

    dispatch(
      getFeedbackDetail({
        orderId,
        variantId,
      }),
    );
  }, [dispatch, update, orderId, variantId]);

  useEffect(() => {
    if (!feedback) {
      reset({ rating: 1, content: "" });
      setSelected(1);
      return;
    }

    setValue("content", feedback.content);
    setValue("rating", feedback.rating as formRating["rating"]);
    setSelected(feedback.rating as formRating["rating"]);
  }, [feedback, reset, setValue]);

  const handleClose = () => {
    setOpenReviewForm(false);
    dispatch(clearFeedback());
    reset({ rating: 1, content: "" });
    setSelected(1);
  };

  const formatDateTime = (isoString?: string) => {
    if (!isoString) return "";

    return new Date(isoString).toLocaleString("vi-VN", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  return (
    <div className="relative flex w-full max-w-md flex-col overflow-hidden rounded-[2rem] border border-slate-200 bg-white shadow-2xl">
      <div className="relative border-b border-slate-200 bg-white px-6 py-5">
        <button
          type="button"
          onClick={handleClose}
          className="absolute right-4 top-4 flex h-10 w-10 items-center justify-center rounded-xl border border-slate-200 text-slate-500 transition hover:bg-slate-50 hover:text-slate-800"
        >
          <X size={18} />
        </button>

        <div className="flex items-center gap-4 pr-10">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-sky-50 text-sky-600">
            <Star size={24} className="fill-sky-600" />
          </div>

          <div>
            <h3 className="text-lg font-semibold text-slate-900">
              {update ? "Sửa đánh giá" : "Đánh giá sản phẩm"}
            </h3>
            <p className="mt-1 text-sm leading-snug text-slate-500">
              Chia sẻ trải nghiệm thực tế về sản phẩm
            </p>
          </div>
        </div>
      </div>

      {detailLoading ? (
        <div className="flex items-center justify-center py-16">
          <Loader2 size={32} className="animate-spin text-sky-500" />
        </div>
      ) : (
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-5 px-6 py-5">
          <div className="rounded-3xl border border-slate-200 bg-slate-50 p-5">
            <div className="text-center">
              <label className="mb-4 block text-base font-semibold text-slate-800">
                Mức độ hài lòng
              </label>

              <div className="mb-3 flex items-center justify-center gap-2">
                {[1, 2, 3, 4, 5].map((star) => {
                  const isActive = star <= (hovered || selected);

                  return (
                    <button
                      key={star}
                      type="button"
                      onMouseEnter={() => setHovered(star)}
                      onMouseLeave={() => setHovered(0)}
                      onClick={() => {
                        const ratingValue = star as formRating["rating"];
                        setSelected(ratingValue);
                        setValue("rating", ratingValue, {
                          shouldValidate: true,
                        });
                      }}
                      className={`transition-all duration-200 ${
                        isActive
                          ? "scale-125"
                          : "opacity-80 hover:scale-110 hover:opacity-100"
                      }`}
                    >
                      <Star
                        size={38}
                        className={`transition-all ${
                          isActive
                            ? "fill-amber-400 stroke-amber-400 drop-shadow-sm"
                            : "stroke-slate-300"
                        }`}
                      />
                    </button>
                  );
                })}
              </div>

              <span className="inline-flex rounded-full border border-sky-100 bg-white px-4 py-1.5 text-sm font-medium text-sky-700 shadow-sm">
                {hovered
                  ? starLabels[hovered - 1]
                  : selected
                    ? starLabels[selected - 1]
                    : "Chọn số sao"}
              </span>

              <input type="hidden" {...register("rating")} value={selected} />

              {errors.rating && (
                <p className="mt-3 text-sm text-rose-600">
                  {errors.rating.message}
                </p>
              )}
            </div>
          </div>

          <div>
            <div className="mb-2 flex items-center justify-between">
              <label className="text-base font-semibold text-slate-800">
                Nội dung đánh giá
              </label>
              <span className="text-xs text-slate-400">
                {(watch("content") || "").length}/300
              </span>
            </div>

            <textarea
              rows={4}
              placeholder="Ví dụ: Chất liệu đẹp, giao hàng nhanh, đóng gói cẩn thận..."
              {...register("content")}
              className="w-full resize-none rounded-2xl border border-slate-300 bg-white p-4 text-sm leading-relaxed text-slate-800 outline-none transition placeholder:text-slate-400 focus:border-sky-500 focus:ring-1 focus:ring-sky-100"
            />

            {errors.content && (
              <p className="mt-2 text-sm text-rose-600">
                {errors.content.message}
              </p>
            )}
          </div>

          {feedback?.updatedAt && (
            <div className="flex justify-center">
              <div className="flex items-center gap-2 rounded-full border border-slate-200 bg-slate-50 px-4 py-2 text-xs text-slate-500">
                <Clock size={14} />
                <span>
                  Cập nhật lần cuối:{" "}
                  <span className="font-semibold text-slate-700">
                    {formatDateTime(feedback.updatedAt)}
                  </span>
                </span>
              </div>
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="flex h-12 w-full items-center justify-center gap-2 rounded-2xl bg-sky-600 font-semibold text-white shadow-lg shadow-sky-100 transition hover:bg-sky-700 active:scale-[0.98] disabled:opacity-60"
          >
            {loading ? (
              <Loader2 size={18} className="animate-spin" />
            ) : (
              <Star size={18} />
            )}
            {update ? "Lưu đánh giá" : "Gửi đánh giá"}
          </button>
        </form>
      )}
    </div>
  );
};

export default ReviewForm;
export type { formRating };
