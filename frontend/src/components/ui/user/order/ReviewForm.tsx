// ReviewForm.tsx
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

  console.log("feedback>>", feedback);

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
      reset({
        rating: 1,
        content: "",
      });
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
    reset({
      rating: 1,
      content: "",
    });
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

  const starLabels = ["Tệ", "Khá", "Bình thường", "Tốt", "Tuyệt vời"];

  return (
    <div className="w-full max-w-md bg-white rounded-3xl shadow-2xl relative overflow-hidden animate-scaleIn flex flex-col">
      {/* HEADER */}
      <div className="relative bg-gradient-to-r from-sky-600 to-cyan-600 px-6 py-5 text-white">
        <button
          onClick={handleClose}
          className="absolute top-4 right-4 w-9 h-9 rounded-full bg-white/15 hover:bg-white/25 backdrop-blur-sm flex items-center justify-center transition-all border border-white/20"
        >
          <X size={18} className="text-white" />
        </button>

        <div className="flex items-center gap-4">
          <div className="w-14 h-14 rounded-2xl bg-white/15 flex items-center justify-center shadow-md backdrop-blur-sm border border-white/20">
            <Star size={26} className="fill-yellow-200 text-yellow-200" />
          </div>

          <div>
            <h3 className="text-xl font-semibold tracking-wide text-white/95">
              {update ? "Sửa đánh giá" : "Đánh giá sản phẩm"}
            </h3>

            <p className="text-sm text-white/80 mt-1 font-normal leading-snug">
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
        <form onSubmit={handleSubmit(onSubmit)} className="px-6 py-5 space-y-5">
          {/* STAR RATING */}
          <div className="bg-sky-50 rounded-2xl p-5 border border-sky-100">
            <div className="text-center">
              <label className="block text-base font-semibold text-gray-800 mb-4">
                Mức độ hài lòng
              </label>

              <div className="flex items-center justify-center gap-2 mb-3">
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
                          : "hover:scale-110 opacity-80 hover:opacity-100"
                      }`}
                    >
                      <Star
                        size={38}
                        className={`transition-all ${
                          isActive
                            ? "fill-yellow-400 stroke-yellow-400 drop-shadow-sm"
                            : "stroke-gray-300"
                        }`}
                      />
                    </button>
                  );
                })}
              </div>

              <div className="flex items-center justify-center">
                <span className="text-sm font-medium text-sky-700 bg-white px-4 py-1.5 rounded-full border border-sky-100 shadow-sm">
                  {hovered
                    ? starLabels[hovered - 1]
                    : selected
                      ? starLabels[selected - 1]
                      : "Chọn số sao"}
                </span>
              </div>

              <input type="hidden" {...register("rating")} value={selected} />

              {errors.rating && (
                <p className="text-red-500 text-sm mt-3">
                  {errors.rating.message}
                </p>
              )}
            </div>
          </div>

          {/* CONTENT */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="text-base font-semibold text-gray-800">
                Nội dung đánh giá
              </label>

              <span className="text-xs text-gray-400">
                {(watch("content") || "").length}/300
              </span>
            </div>

            <textarea
              rows={4}
              placeholder="Ví dụ: Chất liệu đẹp, giao hàng nhanh, đóng gói cẩn thận..."
              {...register("content")}
              className="w-full border border-gray-200 rounded-2xl p-4 resize-none outline-none bg-gray-50 focus:bg-white focus:ring-2 focus:ring-sky-400 focus:border-sky-400 transition text-sm leading-relaxed"
            />

            {errors.content && (
              <p className="text-red-500 text-sm mt-2">
                {errors.content.message}
              </p>
            )}
          </div>

          {/* UPDATED DATE */}
          {feedback?.updatedDate && (
            <div className="flex justify-center">
              <div className="flex items-center gap-2 text-xs text-gray-500 bg-gray-100 px-4 py-2 rounded-full border border-gray-200">
                <Clock size={14} />

                <span>
                  Cập nhật lần cuối:{" "}
                  <span className="font-semibold text-gray-700">
                    {formatDateTime(feedback.updatedDate)}
                  </span>
                </span>
              </div>
            </div>
          )}

          {/* ACTION */}
          <button
            type="submit"
            disabled={loading}
            className="w-full h-12 rounded-2xl bg-gradient-to-r from-sky-600 to-cyan-600 text-white font-semibold flex items-center justify-center gap-2 shadow-lg hover:shadow-xl hover:from-sky-700 hover:to-cyan-700 transition-all disabled:opacity-60"
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
