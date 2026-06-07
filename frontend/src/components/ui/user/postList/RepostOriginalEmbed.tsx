import { useEffect, useMemo, useState } from "react";
import type { PostWithAuthor } from "../../../../types/post";
import postService from "../../../../services/user/postService";
import { POST_TYPE_LABEL } from "../../../../utils/constants/postConstant";
import FormDataSummary from "./FormDataSummary";
import PostDetailModal from "./PostDetailModal";

type Props = {
  originalPostId: number;
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
    return (
      original.author?.profile?.fullName ||
      original.author?.username ||
      "Ẩn danh"
    );
  }, [original]);

  if (loading) {
    return (
      <div className="mt-3 rounded-xl border border-gray-200 bg-gray-50 p-4">
        <div className="h-4 w-1/2 animate-pulse rounded bg-gray-200" />
        <div className="mt-2 h-3 w-2/3 animate-pulse rounded bg-gray-200" />
        <div className="mt-2 h-3 w-1/3 animate-pulse rounded bg-gray-200" />
      </div>
    );
  }

  if (failed || !original) {
    return (
      <div className="mt-3 rounded-xl border border-gray-200 bg-gray-50 p-4 text-sm text-gray-500">
        Không thể tải bài viết gốc.
      </div>
    );
  }

  const hasStructuredSummary = Boolean(original.formData);

  return (
    <>
      <div
        role="button"
        tabIndex={0}
        onClick={() => setDetailOpen(true)}
        onKeyDown={(event) => {
          if (event.key === "Enter" || event.key === " ") {
            event.preventDefault();
            setDetailOpen(true);
          }
        }}
        className="mt-3 w-full cursor-pointer overflow-hidden rounded-xl border border-gray-200 bg-gray-50 text-left transition hover:bg-gray-100"
        title="Xem chi tiết bài gốc"
      >
        <div className="p-3">
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-sm font-semibold text-gray-900">
              {authorName}
            </span>
            <span className="rounded-full bg-sky-100 px-2 py-0.5 text-xs font-medium text-sky-700">
              {POST_TYPE_LABEL[original.type]}
            </span>
          </div>

          {!hasStructuredSummary && (
            <div className="mt-2">
              <h4 className="font-medium text-gray-900">{original.title}</h4>
              {original.content && (
                <p className="mt-1 whitespace-pre-wrap text-sm text-gray-700">
                  {original.content}
                </p>
              )}
            </div>
          )}

          <div className="mt-3">
            <FormDataSummary
              post={original}
              branchInfoById={branchInfoById}
              courtNameById={courtNameById}
            />
          </div>
        </div>
      </div>

      <PostDetailModal
        post={detailOpen ? original : null}
        onClose={() => setDetailOpen(false)}
        branchInfoById={branchInfoById}
        courtNameById={courtNameById}
      />
    </>
  );
};

export default RepostOriginalEmbed;
