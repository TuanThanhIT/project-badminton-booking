import { Info, Star, Calendar, BadgeCheck } from "lucide-react";

import type { ProductFeedbackData } from "../../../../types/product";

type ReviewListProps = {
  productFeedbacks?: ProductFeedbackData;
};

const ReviewList = ({ productFeedbacks }: ReviewListProps) => {
  const data = productFeedbacks;

  const feedbacks = data?.feedbacks ?? [];

  const formatDate = (iso: string) => {
    if (!iso) return "";

    return new Date(iso).toLocaleDateString("vi-VN");
  };

  return (
    <div className="space-y-5">
      {/* EMPTY */}
      {feedbacks.length === 0 && (
        <div
          className="
            flex items-center gap-3
            rounded-2xl border border-slate-200
            bg-slate-50 p-5
            text-sm text-slate-500
          "
        >
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-white border border-slate-200">
            <Info size={18} className="text-slate-400" />
          </div>

          <div>
            <p className="font-medium text-slate-700">Chưa có đánh giá nào</p>

            <p className="mt-0.5 text-xs text-slate-500">
              Hãy trở thành người đầu tiên đánh giá sản phẩm này.
            </p>
          </div>
        </div>
      )}

      {/* LIST */}
      <div className="space-y-5">
        {feedbacks.map((review) => (
          <div
            key={review.id}
            className="
              rounded-3xl border border-slate-200
              bg-white p-5
              shadow-sm transition-all
              hover:shadow-md
            "
          >
            {/* HEADER */}
            <div className="flex items-start justify-between gap-4">
              {/* USER */}
              <div className="flex items-center gap-3">
                <div className="relative">
                  <img
                    src={review.user.avatar}
                    className="
                      h-12 w-12 rounded-full
                      border-2 border-white
                      object-cover shadow-sm
                    "
                  />

                  <div
                    className="
                      absolute -bottom-1 -right-1
                      flex h-5 w-5 items-center justify-center
                      rounded-full bg-sky-500
                      text-white shadow
                    "
                  >
                    <BadgeCheck size={11} />
                  </div>
                </div>

                <div>
                  <div className="flex items-center gap-2">
                    <p className="text-sm font-semibold text-slate-900">
                      {review.user.fullName}
                    </p>

                    <span
                      className="
                        rounded-full bg-sky-50
                        px-2 py-0.5
                        text-[10px] font-semibold
                        text-sky-700
                      "
                    >
                      Đã mua hàng
                    </span>
                  </div>

                  <p className="text-xs text-slate-400">
                    @{review.user.username}
                  </p>
                </div>
              </div>

              {/* DATE */}
              <div className="flex items-center gap-1.5 text-xs text-slate-400">
                <Calendar size={13} />
                {formatDate(review.updatedDate)}
              </div>
            </div>

            {/* STARS */}
            <div className="mt-4 flex items-center gap-1">
              {Array.from({ length: 5 }).map((_, i) => (
                <Star
                  key={i}
                  size={15}
                  className={
                    i < review.rating
                      ? "fill-yellow-400 stroke-yellow-400"
                      : "stroke-slate-300"
                  }
                />
              ))}

              <span className="ml-2 text-xs font-medium text-slate-500">
                {review.rating}/5
              </span>
            </div>

            {/* CONTENT */}
            <p className="mt-4 text-[15px] leading-7 text-slate-700">
              {review.content}
            </p>

            {/* VARIANT */}
            <div className="mt-5 flex flex-wrap gap-2">
              <span
                className="
                  rounded-full border border-slate-200
                  bg-slate-50 px-3 py-1
                  text-xs font-medium text-slate-600
                "
              >
                Màu: {review.variant.color}
              </span>

              <span
                className="
                  rounded-full border border-slate-200
                  bg-slate-50 px-3 py-1
                  text-xs font-medium text-slate-600
                "
              >
                Size: {review.variant.size}
              </span>

              <span
                className="
                  rounded-full border border-slate-200
                  bg-slate-50 px-3 py-1
                  text-xs font-medium text-slate-600
                "
              >
                {review.variant.material}
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ReviewList;
