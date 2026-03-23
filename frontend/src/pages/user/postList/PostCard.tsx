import { MessageCircle, Share2, ThumbsUp, MoreHorizontal, X } from "lucide-react";
import type { PostWithAuthor } from "../../../types/post";
import { POST_TYPE_LABEL } from "../../../constants/postConstant";
import FormDataSummary from "./FormDataSummary";

/** Format thời gian tương đối (giống Facebook: "46 phút trước") */
const formatDate = (dateStr: string) => {
  const d = new Date(dateStr);
  const now = new Date();
  const diff = now.getTime() - d.getTime();

  const minutes = Math.floor(diff / 60000);
  const hours = Math.floor(diff / 3600000);
  const days = Math.floor(diff / 86400000);

  if (minutes < 1) return "Vừa xong";
  if (minutes < 60) return `${minutes} phút trước`;
  if (hours < 24) return `${hours} giờ trước`;
  if (days < 7) return `${days} ngày trước`;
  return d.toLocaleDateString("vi-VN");
};

const PostCard = ({ post }: { post: PostWithAuthor }) => {
  const authorName =
    post.author?.profile?.fullName || post.author?.username || "Ẩn danh";
  const avatar = post.author?.profile?.avatar;

  return (
    <article className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
      <div className="p-4 flex items-start gap-3">
        <div className="shrink-0 w-10 h-10 rounded-full bg-sky-100 overflow-hidden">
          {avatar ? (
            <img
              src={avatar}
              alt={authorName}
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-sky-600 font-semibold text-sm">
              {authorName.charAt(0).toUpperCase()}
            </div>
          )}
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="font-semibold text-gray-900">{authorName}</span>
            <span className="px-2 py-0.5 rounded-full text-xs font-medium bg-sky-100 text-sky-700">
              {POST_TYPE_LABEL[post.type]}
            </span>
          </div>
          <p className="text-sm text-gray-500 flex items-center gap-1">
            {formatDate(post.createdDate)}
            <span className="inline-flex items-center text-gray-400">
              • Công khai
            </span>
          </p>
        </div>

        <div className="flex items-center gap-1">
          <button
            type="button"
            className="p-1.5 rounded-full hover:bg-gray-100 text-gray-500"
            title="Menu"
          >
            <MoreHorizontal className="w-5 h-5" />
          </button>
          <button
            type="button"
            className="p-1.5 rounded-full hover:bg-gray-100 text-gray-500"
            title="Ẩn"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
      </div>

      <div className="px-4 pb-3">
        <h3 className="font-medium text-gray-900 mb-1">{post.title}</h3>
        {post.content && (
          <p className="text-gray-700 text-sm whitespace-pre-wrap">
            {post.content}
          </p>
        )}
        <FormDataSummary post={post} />
      </div>

      <div className="px-4 py-2 flex items-center justify-between text-sm text-gray-500 border-b border-gray-100">
        <span className="flex items-center gap-1">
          <span className="flex -space-x-1">
            <span className="w-4 h-4 rounded-full bg-blue-500 flex items-center justify-center text-white text-xs">
              👍
            </span>
            <span className="w-4 h-4 rounded-full bg-yellow-400 flex items-center justify-center text-white text-xs">
              😂
            </span>
          </span>
          <span>0</span>
        </span>
        <span>0 bình luận</span>
      </div>

      <div className="flex border-t border-gray-100">
        <button
          type="button"
          className="flex-1 flex items-center justify-center gap-2 py-3 text-gray-600 hover:bg-gray-50 transition text-sm font-medium"
        >
          <ThumbsUp className="w-4 h-4" />
          Thích
        </button>
        <button
          type="button"
          className="flex-1 flex items-center justify-center gap-2 py-3 text-gray-600 hover:bg-gray-50 transition text-sm font-medium"
        >
          <MessageCircle className="w-4 h-4" />
          Bình luận
        </button>
        <button
          type="button"
          className="flex-1 flex items-center justify-center gap-2 py-3 text-gray-600 hover:bg-gray-50 transition text-sm font-medium"
        >
          <Share2 className="w-4 h-4" />
          Chia sẻ
        </button>
      </div>
    </article>
  );
};

export default PostCard;

