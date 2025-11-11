import React, { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Star } from "lucide-react";
import { toast } from "react-toastify";
import {
  FormRatingSchema,
  type formRating,
} from "../../schemas/FormRatingSchema";

const ReviewForm: React.FC = () => {
  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors },
  } = useForm<formRating>({
    resolver: zodResolver(FormRatingSchema),
    defaultValues: { rating: 0, content: "" },
    mode: "onChange",
  });

  const [selected, setSelected] = useState<number>(0);
  const [hovered, setHovered] = useState<number>(0);

  const onSubmit = async (data: formRating) => {
    try {
      console.log("Gửi đánh giá", data);
      toast.success("Đánh giá đã được gửi!");
    } catch (err) {
      toast.error("Gửi đánh giá thất bại!");
    }
  };

  return (
    <div className="pt-10 border-t border-gray-400 mt-8">
      <h3 className="text-2xl font-bold mb-6 text-gray-700">
        Đánh giá sản phẩm
      </h3>
      <form
        onSubmit={handleSubmit(onSubmit)}
        className="max-w-lg bg-white p-6 rounded-2xl border border-gray-400 text-gray-700"
      >
        {/* Chọn sao */}
        <div className="mb-6">
          <label className="block text-lg font-semibold mb-3">
            Sao đánh giá
          </label>
          <div className="flex items-center gap-3">
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
                      ? "scale-110 text-yellow-400"
                      : "text-gray-300 hover:text-yellow-300"
                  }`}
                >
                  <Star
                    size={30}
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
          <input
            type="hidden"
            {...register("rating", { valueAsNumber: true })}
            value={selected}
          />
          {errors.rating && (
            <p className="text-red-500 text-sm mt-1">{errors.rating.message}</p>
          )}
        </div>

        {/* Nội dung */}
        <div className="mb-6">
          <label className="block text-lg font-semibold mb-2">
            Nội dung đánh giá
          </label>
          <textarea
            rows={4}
            placeholder="Chia sẻ trải nghiệm của bạn..."
            {...register("content", {
              required: "Nội dung đánh giá là bắt buộc!",
            })}
            className="w-full border border-gray-300 rounded-lg p-3 resize-none outline-none"
          />
          {errors.content && (
            <p className="text-red-500 text-sm mt-1">
              {errors.content.message}
            </p>
          )}
        </div>

        <button
          type="submit"
          className="w-full bg-sky-600 hover:bg-sky-700 text-white font-semibold py-3 rounded-lg transition"
        >
          Gửi đánh giá
        </button>
      </form>
    </div>
  );
};

export default ReviewForm;
export type { formRating };
