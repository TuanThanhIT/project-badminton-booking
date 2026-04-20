import { useEffect, useState, useCallback } from "react";
import { useAppDispatch, useAppSelector } from "../../redux/hook";
import { getPosts } from "../../redux/slices/user/postSlice";
import { getCourtsByIds } from "../../redux/slices/user/courtSlice";
import type { PostType } from "../../types/post";
import {
  POST_TYPE_LABEL,
  POST_TYPES,
} from "../../constants/postConstant";
import { Search } from "lucide-react";
import PostCard from "../../components/ui/user/postList/PostCard";
import CreatePostBar from "../../components/ui/user/postList/CreatePostBar";
import FilterSidebar from "../../components/ui/user/postList/FilterSidebar";
import { getAllBranches } from "../../redux/slices/user/branchSlice";

const PostListPage = () => {
  const dispatch = useAppDispatch();
  const { posts, total, limit } = useAppSelector((state) => state.post);
  const branches = useAppSelector((state) => state.branch.branches);
  const courts = useAppSelector((state) => state.court.courts);
  const loading = useAppSelector(
    (state) => state.ui.loadingMap["post/getPosts"],
  );

  const [selectedType, setSelectedType] = useState<PostType | "">("");
  const [filterValues, setFilterValues] = useState<
    Record<string, string | number>
  >({});
  const [appliedFilters, setAppliedFilters] = useState<
    Record<string, string | number>
  >({});
  const [search, setSearch] = useState("");
  const [searchDebounce, setSearchDebounce] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [hideReposts, setHideReposts] = useState(false);

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
  }, [
    dispatch,
    currentPage,
    selectedType,
    searchDebounce,
    appliedFilters,
    hideReposts,
  ]);

  useEffect(() => {
    dispatch(getAllBranches());
  }, [dispatch]);

  useEffect(() => {
    const ids = posts
      .map((post) => {
        const formData = post.formData as
          | { location?: { courtId?: number } }
          | null
          | undefined;
        return formData?.location?.courtId;
      })
      .filter((courtId): courtId is number => Boolean(courtId && courtId > 0));

    if (ids.length > 0) {
      dispatch(getCourtsByIds({ ids }));
    }
  }, [dispatch, posts]);

  useEffect(() => {
    fetchPosts();
  }, [fetchPosts]);

  // Debounce search
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

  const totalPages = Math.ceil(total / limit) || 1;

  const handleApplyFilter = useCallback(() => {
    // Copy to ensure state change triggers fetch even if same reference
    setAppliedFilters({ ...filterValues });
    setCurrentPage(1);
  }, [filterValues]);

  const branchInfoById = branches.reduce<
    Record<
      number,
      {
        branchName: string;
        address?: string;
        ward?: string;
        district?: string;
        province?: string;
      }
    >
  >((acc, branch) => {
    acc[branch.id] = {
      branchName: branch.branchName,
      address: branch.address,
      ward: branch.wardName,
      district: branch.districtName,
      province: branch.provinceName,
    };
    return acc;
  }, {});

  const courtNameById = courts.reduce<Record<number, string>>((acc, court) => {
    acc[court.id] = court.courtName;
    return acc;
  }, {});

  return (
    <div className="min-h-screen bg-gray-100">
      <div className="max-w-6xl mx-auto py-6 px-4 flex gap-6">
        {/* Cột trái: Filter */}
        <div className="hidden lg:block">
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

        {/* Cột giữa: Feed */}
        <div className="flex-1 min-w-0 max-w-2xl">
          <h1 className="text-xl font-bold text-gray-900 mb-4">Bài đăng</h1>

          {/* Thanh tạo bài */}
          <CreatePostBar />

          {/* Thanh tìm kiếm */}
          <div className="mt-4 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Tìm kiếm bài đăng..."
              className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-gray-200 bg-white text-sm focus:outline-none focus:ring-2 focus:ring-sky-500"
            />
          </div>

          {/* Tab loại (mobile) */}
          <div className="mt-4 flex gap-2 overflow-x-auto pb-2 lg:hidden">
            <button
              type="button"
              onClick={() => handleTypeChange("")}
              className={`shrink-0 px-4 py-2 rounded-full text-sm font-medium ${
                selectedType === ""
                  ? "bg-sky-600 text-white"
                  : "bg-white text-gray-700"
              }`}
            >
              Tất cả
            </button>
            {POST_TYPES.map((type) => (
              <button
                key={type}
                type="button"
                onClick={() => handleTypeChange(type)}
                className={`shrink-0 px-4 py-2 rounded-full text-sm font-medium ${
                  selectedType === type
                    ? "bg-sky-600 text-white"
                    : "bg-white text-gray-700"
                }`}
              >
                {POST_TYPE_LABEL[type]}
              </button>
            ))}
          </div>

          {/* Danh sách bài đăng */}
          <div className="mt-4 space-y-4">
            {loading && posts.length === 0 ? (
              <div className="flex justify-center py-12">
                <div className="animate-spin w-10 h-10 border-2 border-sky-600 border-t-transparent rounded-full" />
              </div>
            ) : posts.length === 0 ? (
              <div className="bg-white rounded-xl p-12 text-center text-gray-500">
                Chưa có bài đăng nào. Hãy đăng bài đầu tiên!
              </div>
            ) : (
              posts.map((post) => (
                <PostCard
                  key={post.id}
                  post={post}
                  branchInfoById={branchInfoById}
                  courtNameById={courtNameById}
                />
              ))
            )}
          </div>

          {/* Phân trang */}
          {totalPages > 1 && (
            <div className="flex justify-center gap-2 mt-6">
              <button
                type="button"
                disabled={currentPage <= 1 || Boolean(loading)}
                onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                className="px-4 py-2 rounded-lg bg-white border border-gray-200 text-sm font-medium disabled:opacity-50 hover:bg-gray-50"
              >
                Trước
              </button>
              <span className="px-4 py-2 text-sm text-gray-600">
                {currentPage} / {totalPages}
              </span>
              <button
                type="button"
                disabled={currentPage >= totalPages || Boolean(loading)}
                onClick={() =>
                  setCurrentPage((p) => Math.min(totalPages, p + 1))
                }
                className="px-4 py-2 rounded-lg bg-white border border-gray-200 text-sm font-medium disabled:opacity-50 hover:bg-gray-50"
              >
                Sau
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default PostListPage;
