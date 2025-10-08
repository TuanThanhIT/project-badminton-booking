import React from "react";
import { Star } from "lucide-react";

type Review = {
  id: number;
  name: string;
  avatar: string;
  rating: number;
  content: string;
  date: string;
};

const mockReviews: Review[] = [
  {
    id: 1,
    name: "Nguyễn Văn A",
    avatar: "https://i.pravatar.cc/50?img=1",
    rating: 5,
    content: "Sản phẩm rất tốt, đóng gói cẩn thận và giao hàng nhanh!",
    date: "20/09/2025",
  },
  {
    id: 2,
    name: "Trần Thị B",
    avatar: "https://i.pravatar.cc/50?img=2",
    rating: 4,
    content: "Chất lượng ổn, giá hợp lý. Sẽ tiếp tục ủng hộ shop.",
    date: "18/09/2025",
  },
  {
    id: 3,
    name: "Lê Văn C",
    avatar: "https://i.pravatar.cc/50?img=3",
    rating: 3,
    content: "Sản phẩm dùng được nhưng giao hơi chậm một chút.",
    date: "15/09/2025",
  },
];

const ReviewList: React.FC = () => {
  return (
    <div className="mt-10">
      <h3 className="text-2xl font-bold mb-6 text-gray-700">
        Đánh giá từ khách hàng
      </h3>
      <div className="space-y-6">
        {mockReviews.map((review) => (
          <div
            key={review.id}
            className="flex gap-4 bg-gray-50 p-4 rounded-xl border border-gray-200"
          >
            <img
              src={review.avatar}
              alt={review.name}
              className="w-12 h-12 rounded-full object-cover"
            />
            <div className="flex-1">
              <div className="flex items-center justify-between mb-1">
                <h6 className="font-semibold text-lg text-gray-700">
                  {review.name}
                </h6>
                <span className="text-sm text-gray-500">{review.date}</span>
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
