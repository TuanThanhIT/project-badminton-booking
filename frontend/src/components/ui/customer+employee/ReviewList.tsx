import type { ProductFeedbackResponse } from "../../../types/productFeedback";
import type { BookingFeedbackResponse } from "../../../types/bookingFeedback";
import { Info, Star } from "lucide-react";

type ReviewListProps = {
  productFeedbacks?: ProductFeedbackResponse;
  bookingFeedbacks?: BookingFeedbackResponse;
  type: "product" | "booking";
};

const ReviewList = (props: ReviewListProps) => {
  const { productFeedbacks, bookingFeedbacks, type } = props;
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
    <div className="mt-10">
      <h3 className="text-2xl font-bold mb-6 text-gray-700">
        Đánh giá từ khách hàng
      </h3>
      <div className="space-y-6">
        {type === "product"
          ? productFeedbacks !== undefined &&
            productFeedbacks.length === 0 && (
              <p className="flex items-center gap-2 text-gray-600">
                <Info className="w-5 h-5 text-gray-500" />
                Sản phẩm chưa có đánh giá nào
              </p>
            )
          : bookingFeedbacks !== undefined &&
            bookingFeedbacks.length === 0 && (
              <p className="flex items-center gap-2 text-gray-600">
                <Info className="w-5 h-5 text-gray-500" />
                Sân chưa có đánh giá nào
              </p>
            )}
        {type === "product"
          ? productFeedbacks !== undefined &&
            productFeedbacks.map((review) => (
              <div
                key={review.userId}
                className="flex gap-4 bg-gray-50 p-4 rounded-xl border border-gray-200"
              >
                <img
                  src={review.avatar}
                  alt={review.username}
                  className="w-12 h-12 rounded-full object-cover"
                />
                <div className="flex-1">
                  <div className="flex items-center justify-between mb-1">
                    <h6 className="font-semibold text-lg text-gray-700">
                      {review.username}
                    </h6>
                    <span className="text-sm text-gray-500">
                      {formatDateTime(review.updatedDate)}
                    </span>
                  </div>
                  <div className="flex items-center mb-2">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <Star
                        key={star}
                        size={20}
                        className={
                          star <= review.rating
                            ? "fill-yellow-400 stroke-yellow-400"
                            : "stroke-gray-300"
                        }
                      />
                    ))}
                  </div>
                  <p className="text-gray-700">{review.content}</p>
                </div>
              </div>
            ))
          : bookingFeedbacks !== undefined &&
            bookingFeedbacks.map((review) => (
              <div
                key={review.userId}
                className="flex gap-4 bg-gray-50 p-4 rounded-xl border border-gray-200"
              >
                <img
                  src={review.avatar}
                  alt={review.username}
                  className="w-12 h-12 rounded-full object-cover"
                />
                <div className="flex-1">
                  <div className="flex items-center justify-between mb-1">
                    <h6 className="font-semibold text-lg text-gray-700">
                      {review.username}
                    </h6>
                    <span className="text-sm text-gray-500">
                      {formatDateTime(review.updatedDate)}
                    </span>
                  </div>
                  <div className="flex items-center mb-2">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <Star
                        key={star}
                        size={20}
                        className={
                          star <= review.rating
                            ? "fill-yellow-400 stroke-yellow-400"
                            : "stroke-gray-300"
                        }
                      />
                    ))}
                  </div>
                  <p className="text-gray-700">{review.content}</p>
                </div>
              </div>
            ))}
      </div>
    </div>
  );
};

export default ReviewList;
