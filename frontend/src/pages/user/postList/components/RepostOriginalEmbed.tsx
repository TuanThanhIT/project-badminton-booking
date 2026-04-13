import { useEffect, useMemo, useState } from "react";
import type { PostWithAuthor } from "../../../../types/post";
import postService from "../../../../services/user/postService";
import { POST_TYPE_LABEL } from "../../../../constants/postConstant";
import FormDataSummary from "../FormDataSummary";
import PostDetailModal from "./PostDetailModal";

type Props = {
  originalPostId: number;
  branchInfoById: Record<
    number,
    { branchName: string; address?: string; district?: string; city?: string }
  >;
  courtNameById: Record<number, string>;
};

const RepostOriginalEmbed = ({
  originalPostId,
  branchInfoById,
  courtNameById,
}: Props) => {
  const [loading, setLoading] = useState(false);
  const [original, setOriginal] = useState<PostWithAuthor | null>(null);
  const [failed, setFailed] = useState(false);
  const [detailOpen, setDetailOpen] = useState(false);

  useEffect(() => {
    let ignore = false;
    setLoading(true);
    setFailed(false);
    postService
      .getPostByIdService(originalPostId)
      .then((res) => {
        if (ignore) return;
        setOriginal((res.data as any).data ?? null);
      })
      .catch(() => {
        if (ignore) return;
        setFailed(true);
      })
      .finally(() => {
        if (!ignore) setLoading(false);
      });

    return () => {
      ignore = true;
    };
  }, [originalPostId]);

  const authorName = useMemo(() => {
    if (!original) return "";
    return original.author?.profile?.fullName || original.author?.username || "Ẩn danh";
  }, [original]);

  if (loading) {
    return (
      <div className="mt-3 p-4 rounded-xl border border-gray-200 bg-gray-50">
        <div className="h-4 w-1/2 bg-gray-200 rounded animate-pulse" />
        <div className="h-3 w-2/3 bg-gray-200 rounded mt-2 animate-pulse" />
        <div className="h-3 w-1/3 bg-gray-200 rounded mt-2 animate-pulse" />
      </div>
    );
  }

  if (failed || !original) {
    return (
      <div className="mt-3 p-4 rounded-xl border border-gray-200 bg-gray-50 text-sm text-gray-500">
        Không thể tải bài viết gốc.
      </div>
    );
  }

  return (
    <>
      <button
        type="button"
        onClick={() => setDetailOpen(true)}
        className="mt-3 w-full text-left rounded-xl border border-gray-200 bg-gray-50 overflow-hidden hover:bg-gray-100 transition"
        title="Xem chi tiết bài gốc"
      >
        <div className="p-3">
        <div className="flex items-center gap-2 flex-wrap">
          <span className="font-semibold text-gray-900 text-sm">{authorName}</span>
          <span className="px-2 py-0.5 rounded-full text-xs font-medium bg-sky-100 text-sky-700">
            {POST_TYPE_LABEL[original.type]}
          </span>
        </div>

        <h4 className="font-medium text-gray-900 mt-2">{original.title}</h4>
        {original.content && (
          <p className="text-gray-700 text-sm whitespace-pre-wrap mt-1">
            {original.content}
          </p>
        )}

        <FormDataSummary
          post={original}
          branchInfoById={branchInfoById}
          courtNameById={courtNameById}
        />
        </div>
      </button>

      <PostDetailModal
        open={detailOpen}
        postId={originalPostId}
        onClose={() => setDetailOpen(false)}
        branchInfoById={branchInfoById}
        courtNameById={courtNameById}
      />
    </>
  );
};

export default RepostOriginalEmbed;

