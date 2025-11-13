import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Clock, Star } from "lucide-react";
import {
  FormRatingSchema,
  type formRating,
} from "../../schemas/FormRatingSchema";
import { useAppDispatch, useAppSelector } from "../../store/hook";
import {
  clearProductFeedbackDetail,
  getProductFeedbackDetail,
} from "../../store/slices/productFeedbackSlice";
import type { ProductFeedbackDetailRequest } from "../../types/productFeedback";

type ReviewFormProps = {
  setOpenReviewForm: (open: boolean) => void;
  onSubmit: (data: formRating) => void;
  update: boolean;
  setUpdate: (update: boolean) => void;
  orderDetailId: number;
};

const ReviewForm = (props: ReviewFormProps) => {
  const {
    register,
    handleSubmit,
    setValue,
    reset,
    formState: { errors },
  } = useForm<formRating>({
    resolver: zodResolver(FormRatingSchema),
    defaultValues: { rating: 0, content: "" },
    mode: "onChange",
  });

  const { setOpenReviewForm, onSubmit, update, orderDetailId, setUpdate } =
    props;

  const [selected, setSelected] = useState<number>(0);
  const [hovered, setHovered] = useState<number>(0);

  const dispatch = useAppDispatch();
  const { productFeedbackDetail } = useAppSelector(
    (state) => state.productFeedback
  );

  const handleFormSubmit = (data: formRating) => {
    onSubmit(data);
    setOpenReviewForm(false);
  };
  const starLabels = ["Tệ", "Khá", "Bình thường", "Tốt", "Tuyệt vời"];

  useEffect(() => {
    if (update) {
      const data: ProductFeedbackDetailRequest = { orderDetailId };
      dispatch(getProductFeedbackDetail({ data }));
    } else {
      dispatch(clearProductFeedbackDetail());
    }
  }, [update, orderDetailId, dispatch]);

  useEffect(() => {
    if (productFeedbackDetail) {
      // Gán giá trị ban đầu vào form
      setValue("content", productFeedbackDetail.content);
      setValue("rating", productFeedbackDetail.rating);
      setSelected(productFeedbackDetail.rating);
    } else {
      reset({ rating: 0, content: "" }); // reset về mặc định
      setSelected(0); // reset rating hiển thị
    }
  }, [productFeedbackDetail, setValue]);

  const formatDateTime = (isoString: string) => {
    if (!isoString) return "";
    const date = new Date(isoString);
    return date.toLocaleString("vi-VN", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  return (
    <div className="bg-white rounded-3xl shadow-2xl max-w-md w-full p-8 sm:p-10 relative transform transition-all scale-95 animate-scaleIn">
      {/* Close button */}
      <button
        onClick={() => {
          setOpenReviewForm(false);
          setUpdate(false);
          reset({ rating: 0, content: "" });
          setSelected(0);
        }}
        className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 transition"
      >
        ✕
      </button>

      {/* Header */}
      <div className="text-center mb-6">
        <h3 className="text-2xl font-bold text-gray-800 mt-2">
          Đánh giá sản phẩm
        </h3>
        <p className="text-sm text-gray-500 mt-1">
          Chia sẻ trải nghiệm của bạn về sản phẩm này
        </p>
      </div>

      {/* Form */}
      <form
        onSubmit={handleSubmit(handleFormSubmit)}
        className="flex flex-col gap-6"
      >
        {/* Star Rating */}
        <div className="text-center">
          <label className="block text-lg font-semibold mb-3 text-gray-700">
            Chọn số sao
          </label>
          <div className="flex items-center justify-center gap-2 mb-2">
            {[1, 2, 3, 4, 5].map((star) => {
              const isActive = star <= (hovered || selected);
              return (
                <button
                  key={star}
                  type="button"
                  onMouseEnter={() => setHovered(star)}
                  onMouseLeave={() => setHovered(0)}
                  onClick={() => {
                    setSelected(star);
                    setValue("rating", star, { shouldValidate: true });
                  }}
                  className={`transition transform ${
                    isActive
                      ? "scale-125 text-yellow-400"
                      : "text-gray-300 hover:text-yellow-300"
                  }`}
                >
                  <Star
                    size={36}
                    className={`cursor-pointer transition-colors ${
                      isActive
                        ? "fill-yellow-400 stroke-yellow-400"
                        : "stroke-gray-300"
                    }`}
                  />
                </button>
              );
            })}
          </div>
          <p className="text-sm text-gray-500">
            {hovered
              ? starLabels[hovered - 1]
              : selected
              ? starLabels[selected - 1]
              : "Chọn số sao"}
          </p>
          <input
            type="hidden"
            {...register("rating", { valueAsNumber: true })}
            value={selected}
          />
          {errors.rating && (
            <p className="text-red-500 text-sm mt-1">{errors.rating.message}</p>
          )}
        </div>

        {/* Content */}
        <div>
          <label className="block text-lg font-semibold mb-2 text-gray-700">
            Nội dung đánh giá
          </label>
          <textarea
            rows={4}
            placeholder="Chia sẻ trải nghiệm của bạn..."
            {...register("content", {
              required: "Nội dung đánh giá là bắt buộc!",
            })}
            className="w-full border border-gray-300 rounded-2xl p-3 resize-none outline-none shadow-sm focus:ring-2 focus:ring-yellow-400 focus:border-yellow-400 transition"
          />
          {errors.content && (
            <p className="text-red-500 text-sm mt-1">
              {errors.content.message}
            </p>
          )}
        </div>

        {productFeedbackDetail?.updatedDate && (
          <div className="flex items-center justify-center mt-2 mb-[-10px]">
            <span className="flex items-center gap-2 text-xs text-gray-500 bg-gray-100 px-3 py-1 rounded-full shadow-sm">
              <Clock size={14} className="text-gray-500" />
              <span>
                Đã đánh giá vào:{" "}
                <span className="font-medium text-gray-700">
                  {formatDateTime(productFeedbackDetail.updatedDate)}
                </span>
              </span>
            </span>
          </div>
        )}

        {/* Submit */}
        <button
          type="submit"
          className="w-full flex items-center justify-center gap-2 bg-gradient-to-r from-orange-400 to-red-500 text-white font-semibold py-3 rounded-2xl shadow-lg hover:opacity-90 transition-all duration-200"
        >
          <Star size={20} /> {update ? "Lưu đánh giá" : "Gửi đánh giá"}
        </button>
      </form>
    </div>
  );
};

export default ReviewForm;
export type { formRating };
