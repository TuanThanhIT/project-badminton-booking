import { useEffect, useMemo, useState } from "react";
import { toast } from "react-toastify";
import postService from "../../../../services/user/postService";
import type { PostWithAuthor } from "../../../../types/post";
import { POST_TYPE_LABEL } from "../../../../constants/postConstant";
import FormDataSummary from "./FormDataSummary";
import PostActions from "./PostActions";

type Props = {
  open: boolean;
  postId: number;
  onClose: () => void;
  branchInfoById: Record<
    number,
    {
      branchName: string;
      address?: string;
      ward?: string;
      district?: string;
      province?: string;
    }
  >;
  courtNameById: Record<number, string>;
};

const PostDetailModal = ({
  open,
  postId,
  onClose,
  branchInfoById,
  courtNameById,
}: Props) => {
  const [loading, setLoading] = useState(false);
  const [post, setPost] = useState<PostWithAuthor | null>(null);

  useEffect(() => {
    if (!open) return;

    let ignore = false;
    setLoading(true);
    postService
      .getPostByIdService(postId)
      .then((res) => {
        if (ignore) return;
        setPost((res.data as any).data ?? null);
      })
      .catch(() => toast.error("Không tải được bài viết."))
      .finally(() => {
        if (!ignore) setLoading(false);
      });

    return () => {
      ignore = true;
    };
  }, [open, postId]);

  const authorName = useMemo(() => {
    return (
      post?.author?.profile?.fullName || post?.author?.username || "Ẩn danh"
    );
  }, [post]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/40 flex items-center justify-center p-4">
      <div className="bg-white w-full max-w-2xl rounded-2xl shadow-lg overflow-hidden">
        <div className="p-4 border-b flex items-center justify-between">
          <h2 className="font-semibold text-gray-900">Bài viết</h2>
          <button
            type="button"
            onClick={onClose}
            className="px-3 py-1 rounded-lg hover:bg-gray-100 text-sm"
          >
            Đóng
          </button>
        </div>

        <div className="p-4">
          {loading || !post ? (
            <div className="py-10 flex justify-center">
              <div className="animate-spin w-10 h-10 border-2 border-sky-600 border-t-transparent rounded-full" />
            </div>
          ) : (
            <article className="bg-white rounded-xl border border-gray-100 overflow-hidden">
              <div className="p-4">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="font-semibold text-gray-900">
                    {authorName}
                  </span>
                  <span className="px-2 py-0.5 rounded-full text-xs font-medium bg-sky-100 text-sky-700">
                    {POST_TYPE_LABEL[post.type]}
                  </span>
                </div>

                <h3 className="font-medium text-gray-900 mt-3">{post.title}</h3>
                {post.content && (
                  <p className="text-gray-700 text-sm whitespace-pre-wrap mt-1">
                    {post.content}
                  </p>
                )}

                <FormDataSummary
                  post={post}
                  branchInfoById={branchInfoById}
                  courtNameById={courtNameById}
                />
              </div>

              <div className="px-4 py-2 flex items-center justify-between text-sm text-gray-500 border-t border-b border-gray-100">
                <span>👍 {post.likesCount ?? 0}</span>
                <span>
                  {post.commentsCount ?? 0} bình luận • {post.sharesCount ?? 0}{" "}
                  chia sẻ
                </span>
              </div>

              <PostActions post={post} />
            </article>
          )}
        </div>
      </div>
    </div>
  );
};

export default PostDetailModal;
