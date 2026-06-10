import { useCallback, useEffect, useMemo, useState } from "react";
import { MessageCircle, Search, SlidersHorizontal, Sparkles, Users } from "lucide-react";
import { useAppDispatch, useAppSelector } from "../../redux/hook";
import { getAllBranches } from "../../redux/slices/user/branchSlice";
import { getCourtsByIds } from "../../redux/slices/user/courtSlice";
import { getPosts } from "../../redux/slices/user/postSlice";
import type { PostType, PostWithAuthor } from "../../types/post";
import { POST_TYPE_LABEL, POST_TYPES } from "../../utils/constants/postConstant";
import CreatePostBar from "../../components/ui/user/postList/CreatePostBar";
import FilterSidebar from "../../components/ui/user/postList/FilterSidebar";
import PostCard from "../../components/ui/user/postList/PostCard";
import PostDetailModal from "../../components/ui/user/postList/PostDetailModal";

const PostListPage = () => {
  const dispatch = useAppDispatch();
  const { posts, total, limit } = useAppSelector((state) => state.post.posts);
  const branches = useAppSelector((state) => state.branch.branches);
  const courts = useAppSelector((state) => state.court.courts);
  const loading = useAppSelector((state) => state.ui.loadingMap["post/getPosts"]);

  const [selectedType, setSelectedType] = useState<PostType | "">("");
  const [filterValues, setFilterValues] = useState<Record<string, string | number>>({});
  const [appliedFilters, setAppliedFilters] = useState<Record<string, string | number>>({});
  const [search, setSearch] = useState("");
  const [searchDebounce, setSearchDebounce] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [hideReposts, setHideReposts] = useState(false);
  const [detailPost, setDetailPost] = useState<PostWithAuthor | null>(null);

  const fetchPosts = useCallback(() => {
    const params: Record<string, string | number> = {
      page: currentPage,
      limit: 10,
    };

    if (selectedType) params.type = selectedType;
    if (searchDebounce) params.search = searchDebounce;
    if (hideReposts) params.hideReposts = 1;

    Object.entries(appliedFilters).forEach(([k, v]) => {
      if (v !== "" && v !== undefined) params[`formData[${k}]`] = v;
    });

    dispatch(getPosts({ params }));
  }, [dispatch, currentPage, selectedType, searchDebounce, appliedFilters, hideReposts]);

  useEffect(() => {
    dispatch(getAllBranches());
  }, [dispatch]);

  useEffect(() => {
    const ids = posts
      .map((post) => {
        const formData = post.formData as { location?: { courtId?: number } } | null | undefined;
        return formData?.location?.courtId;
      })
      .filter((courtId): courtId is number => Boolean(courtId && courtId > 0));

    if (ids.length > 0) dispatch(getCourtsByIds({ ids }));
  }, [dispatch, posts]);

  useEffect(() => {
    fetchPosts();
  }, [fetchPosts]);

  useEffect(() => {
    const t = setTimeout(() => setSearchDebounce(search), 300);
    return () => clearTimeout(t);
  }, [search]);

  const handleTypeChange = (t: PostType | "") => {
    setSelectedType(t);
    setFilterValues({});
    setAppliedFilters({});
    setCurrentPage(1);
  };

  const handleFilterChange = (key: string, value: string | number) => {
    setFilterValues((prev) => {
      const next = { ...prev };
      if (value === "" || value === undefined) delete next[key];
      else next[key] = value;
      return next;
    });
    setCurrentPage(1);
  };

  const handleApplyFilter = useCallback(() => {
    setAppliedFilters({ ...filterValues });
    setCurrentPage(1);
  }, [filterValues]);

  const totalPages = Math.ceil(total / limit) || 1;

  const branchInfoById = useMemo(
    () =>
      branches.reduce<Record<number, { branchName: string; address?: string; ward?: string; district?: string; province?: string }>>(
        (acc, branch) => {
          acc[branch.id] = {
            branchName: branch.branchName,
            address: branch.address,
            ward: branch.wardName,
            district: branch.districtName,
            province: branch.provinceName,
          };
          return acc;
        },
        {},
      ),
    [branches],
  );

  const courtNameById = useMemo(
    () =>
      courts.reduce<Record<number, string>>((acc, court) => {
        acc[court.id] = court.courtName;
        return acc;
      }, {}),
    [courts],
  );

  return (
    <div className="min-h-screen bg-slate-50 text-slate-700">
      <section className="relative overflow-hidden bg-sky-950 py-14 sm:py-16 lg:py-20">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(56,189,248,0.22),transparent_35%),radial-gradient(circle_at_bottom_right,rgba(14,165,233,0.14),transparent_35%)]" />

        <div className="relative z-10 mx-auto max-w-7xl px-4 sm:px-6">
          <div className="flex flex-col gap-10 lg:flex-row lg:items-center lg:justify-between">
            <div className="max-w-2xl">
              <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/10 px-4 py-2 text-sm font-medium text-sky-100">
                <Sparkles size={16} className="text-sky-300" />
                B-Hub Community
              </div>

              <h1 className="text-3xl font-bold leading-tight tracking-tight text-white sm:text-4xl md:text-5xl">
                Cộng đồng bài đăng
              </h1>

              <p className="mt-4 text-sm leading-relaxed text-sky-100 sm:text-base">
                Khám phá bài viết, chia sẻ kinh nghiệm, tìm bạn chơi và cập nhật hoạt động từ cộng đồng cầu lông.
              </p>

              <div className="mt-6 flex flex-wrap gap-3 text-sm text-sky-100">
                <div className="flex items-center gap-2 rounded-full border border-white/10 bg-white/10 px-4 py-2">
                  <MessageCircle size={16} />
                  Bài viết mỗi ngày
                </div>
                <div className="flex items-center gap-2 rounded-full border border-white/10 bg-white/10 px-4 py-2">
                  <Users size={16} />
                  Kết nối người chơi
                </div>
              </div>
            </div>

            <div className="hidden lg:flex items-center justify-center">
              <div className="relative w-80">
                <img
                  src="./img/thao-luan.webp"
                  alt="B-Hub Community"
                  className="h-52 w-full rounded-[2rem] border border-white/20 object-cover shadow-2xl"
                />
                <div className="absolute -bottom-5 left-6 right-6 rounded-2xl border border-sky-50 bg-white p-4 shadow-xl">
                  <p className="text-sm font-semibold text-slate-800">Cộng đồng năng động</p>
                  <p className="mt-0.5 text-xs text-slate-500">Chia sẻ, tìm bạn chơi và cập nhật hoạt động</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <div className="relative mx-auto -mt-8 max-w-7xl px-4 pb-12 sm:px-6">
        <div className="flex justify-center gap-6">
          <div className="hidden h-fit lg:sticky lg:top-6 lg:block">
            <FilterSidebar
              selectedType={selectedType}
              onTypeChange={handleTypeChange}
              hideReposts={hideReposts}
              onHideRepostsChange={(v) => {
                setHideReposts(v);
                setCurrentPage(1);
              }}
              filterValues={filterValues}
              onFilterChange={handleFilterChange}
              onApply={handleApplyFilter}
              branches={branches}
            />
          </div>

          <div className="min-w-0 flex-1 w-full max-w-[760px]">
            <div className="overflow-hidden rounded-[2rem] border border-slate-200 bg-white shadow-[0_14px_36px_rgba(15,23,42,0.08)]">
              <div className="border-b border-slate-100 bg-white px-5 py-5 sm:px-6">
                <div className="flex items-center justify-between gap-4">
                  <div>
                    <h2 className="text-xl font-semibold text-slate-800">Bài đăng</h2>
                    <p className="mt-0.5 text-sm text-slate-500">Cập nhật mới nhất từ cộng đồng</p>
                  </div>
                  <div className="shrink-0 rounded-full bg-sky-50 px-4 py-2 text-sm font-medium text-sky-700">
                    {total} bài
                  </div>
                </div>
              </div>

              <div className="space-y-5 p-4 sm:p-5">
                <CreatePostBar />

                <div className="relative rounded-2xl border border-slate-200 bg-slate-50 px-4 py-2">
                  <Search className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-400" />
                  <input
                    type="text"
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    placeholder="Tìm kiếm bài đăng..."
                    className="w-full bg-transparent py-2.5 pl-10 pr-4 text-sm text-slate-700 placeholder:text-slate-400 focus:outline-none"
                  />
                </div>

                <div className="space-y-3 lg:hidden">
                  <div className="flex items-center gap-2 px-1 text-xs font-medium uppercase tracking-wide text-slate-500">
                    <SlidersHorizontal size={15} />
                    Lọc nhanh
                  </div>

                  <div className="flex gap-2 overflow-x-auto pb-2">
                    <button
                      onClick={() => handleTypeChange("")}
                      className={`shrink-0 rounded-full px-4 py-2 text-sm font-medium transition-all ${
                        selectedType === ""
                          ? "bg-sky-600 text-white shadow-sm"
                          : "border border-slate-200 bg-white text-slate-600"
                      }`}
                    >
                      Tất cả
                    </button>

                    {POST_TYPES.map((type) => (
                      <button
                        key={type}
                        onClick={() => handleTypeChange(type)}
                        className={`shrink-0 rounded-full px-4 py-2 text-sm font-medium transition-all ${
                          selectedType === type
                            ? "bg-sky-600 text-white shadow-sm"
                            : "border border-slate-200 bg-white text-slate-600"
                        }`}
                      >
                        {POST_TYPE_LABEL[type]}
                      </button>
                    ))}
                  </div>

                  <label className="flex items-center justify-between gap-3 rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-600">
                    <span className="font-medium">Ẩn bài đăng lại</span>
                    <input
                      type="checkbox"
                      checked={hideReposts}
                      onChange={(e) => {
                        setHideReposts(e.target.checked);
                        setCurrentPage(1);
                      }}
                      className="h-4 w-4 accent-sky-600"
                    />
                  </label>
                </div>

                <div className="space-y-5">
                  {loading && posts.length === 0 ? (
                    <div className="flex justify-center py-14">
                      <div className="h-10 w-10 animate-spin rounded-full border-2 border-sky-500 border-t-transparent" />
                    </div>
                  ) : posts.length === 0 ? (
                    <div className="rounded-2xl border border-slate-200 bg-white p-10 text-center text-sm text-slate-500 shadow-sm">
                      Chưa có bài đăng nào. Hãy đăng bài đầu tiên!
                    </div>
                  ) : (
                    posts.map((post) => (
                      <PostCard
                        key={post.id}
                        post={post}
                        branchInfoById={branchInfoById}
                        courtNameById={courtNameById}
                        onOpenDetail={() => setDetailPost(post)}
                      />
                    ))
                  )}
                </div>
              </div>

              {totalPages > 1 && (
                <div className="flex items-center justify-center gap-3 border-t border-slate-100 bg-white px-5 py-4">
                  <button
                    disabled={currentPage <= 1 || loading}
                    onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                    className="rounded-xl bg-slate-100 px-4 py-2 text-sm font-medium text-slate-600 transition-all hover:bg-slate-200 disabled:opacity-50"
                  >
                    Trước
                  </button>
                  <span className="px-3 py-2 text-sm font-medium text-slate-500">
                    {currentPage} / {totalPages}
                  </span>
                  <button
                    disabled={currentPage >= totalPages || loading}
                    onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                    className="rounded-xl bg-slate-100 px-4 py-2 text-sm font-medium text-slate-600 transition-all hover:bg-slate-200 disabled:opacity-50"
                  >
                    Sau
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      <PostDetailModal
        post={detailPost}
        onClose={() => setDetailPost(null)}
        branchInfoById={branchInfoById}
        courtNameById={courtNameById}
      />
    </div>
  );
};

export default PostListPage;
