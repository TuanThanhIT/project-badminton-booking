import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import {
  AlertTriangle,
  BarChart3,
  CalendarCheck,
  ClipboardCheck,
  Coffee,
  DollarSign,
  MessageCircle,
  Newspaper,
  PackageCheck,
  ShoppingBag,
  Star,
  Store,
  ThumbsDown,
  Trophy,
  Wallet,
} from "lucide-react";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import AdminPageHeader from "../../components/ui/admin/AdminPageHeader";
import { adminPrimaryButtonClass } from "../../components/ui/admin/AdminModal";
import DashboardRecentRow from "../../components/ui/admin/dashboard/DashboardRecentRow";
import adminRevenueService from "../../services/admin/revenueService";
import type { AdminDashboardData } from "../../types/admin";
import {
  BOOKING_STATUS_CONFIG,
  fmtCurrency,
  ORDER_STATUS_CONFIG,
} from "../../utils/constants/adminConstant";

const fmtShort = (value: number) =>
  new Intl.NumberFormat("vi-VN", {
    notation: "compact",
    maximumFractionDigits: 1,
  }).format(value || 0);

const fmtNumber = (value: number) =>
  Number(value || 0).toLocaleString("vi-VN");

const fmtRating = (value: number) =>
  Number(value || 0).toLocaleString("vi-VN", {
    minimumFractionDigits: 1,
    maximumFractionDigits: 1,
  });

const fmtDate = (value?: string) =>
  value ? new Date(value).toLocaleDateString("vi-VN") : "-";

const REVENUE_STRUCTURE_COLORS = ["#6366f1", "#10b981", "#f59e0b"];
const POST_TYPE_COLORS = [
  "bg-sky-500",
  "bg-emerald-500",
  "bg-amber-500",
  "bg-indigo-500",
  "bg-rose-500",
];

const percentOf = (value: number, total: number) =>
  total > 0 ? Math.round((value / total) * 100) : 0;

const Skeleton = ({ className }: { className: string }) => (
  <div className={`animate-pulse rounded-lg bg-slate-200 ${className}`} />
);

const StatCard = ({
  title,
  value,
  note,
  icon: Icon,
  tone,
}: {
  title: string;
  value: string;
  note: string;
  icon: typeof DollarSign;
  tone: string;
}) => (
  <div className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
    <div className="flex items-start justify-between gap-3">
      <div>
        <p className="text-sm font-medium text-slate-500">{title}</p>
        <p className="mt-2 text-2xl font-bold text-slate-900">{value}</p>
        <p className="mt-1 text-xs text-slate-400">{note}</p>
      </div>
      <div className={`flex h-11 w-11 items-center justify-center rounded-lg ${tone}`}>
        <Icon className="h-5 w-5" />
      </div>
    </div>
  </div>
);

const ChartTooltip = ({ active, payload, label }: any) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="space-y-1 rounded-lg border border-slate-200 bg-white p-3 text-xs shadow-lg">
      <p className="font-semibold text-slate-700">{label}</p>
      {payload.map((item: any) => (
        <p key={item.name} style={{ color: item.color }}>
          {item.name}: {fmtCurrency(Number(item.value))}
        </p>
      ))}
    </div>
  );
};

type AdminTopRankingType = "branch" | "product" | "beverage";

type AdminTopRankingProps = {
  title: string;
  badge: string;
  icon: typeof Trophy;
  iconClassName: string;
  items: any[];
  type: AdminTopRankingType;
};

const adminRankBadgeClass = (index: number) => {
  if (index === 0) return "bg-amber-100 text-amber-700";
  if (index === 1) return "bg-slate-200 text-slate-700";
  if (index === 2) return "bg-orange-100 text-orange-700";
  return "bg-slate-50 text-slate-500";
};

const AdminTopRanking = ({
  title,
  badge,
  icon: Icon,
  iconClassName,
  items,
  type,
}: AdminTopRankingProps) => {
  const normalizedItems = (items || []).slice(0, 10).map((item) => {
    const revenue = Number(
      type === "branch" ? item.totalRevenue : item.totalRevenue || item.revenue,
    );
    const quantity = Number(
      type === "branch" ? item.bookingCount || item.orderCount : item.totalQuantity,
    );

    return {
      ...item,
      name:
        type === "branch"
          ? item.branchName || "Chi nhánh"
          : type === "product"
            ? item.productName || "Sản phẩm"
            : item.beverageName || "Đồ uống",
      quantity: Number.isFinite(quantity) ? quantity : 0,
      revenue: Number.isFinite(revenue) ? revenue : 0,
    };
  });
  const maxRevenue = Math.max(
    ...normalizedItems.map((item) => item.revenue),
    0,
  );

  return (
    <section className="flex flex-col rounded-lg border border-slate-200 bg-white p-6 shadow-sm">
      <div className="flex items-start justify-between gap-3">
        <div className="flex min-w-0 items-start gap-3">
          <Icon className={`mt-0.5 h-5 w-5 shrink-0 ${iconClassName}`} />
          <div className="min-w-0">
            <h2 className="text-lg font-bold text-slate-900">{title}</h2>
            <p className="mt-1 text-sm text-slate-500">
              Xếp hạng theo doanh thu
            </p>
          </div>
        </div>
        <span className="shrink-0 rounded-full bg-sky-50 px-3 py-1 text-xs font-bold text-sky-600">
          {badge}
        </span>
      </div>

      <div className="dashboard-half-scrollbar mt-5 max-h-[568px] space-y-3 overflow-y-auto pr-1">
        {normalizedItems.length ? (
          normalizedItems.map((item, index) => {
            const percentage = maxRevenue
              ? (Number(item.revenue || 0) / maxRevenue) * 100
              : 0;
            const subtitle =
              type === "branch"
                ? "Tổng doanh thu chi nhánh"
                : type === "product"
                  ? `${item.quantity} sản phẩm`
                  : `${item.quantity} món`;

            return (
              <div
                key={`${type}-${index}-${item.name}`}
                className="min-h-[104px] rounded-xl border border-slate-200 bg-white p-4"
              >
                <div className="flex items-start gap-3">
                  <div
                    className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-lg text-sm font-bold ${adminRankBadgeClass(
                      index,
                    )}`}
                  >
                    {index + 1}
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-col gap-1 sm:flex-row sm:items-start sm:justify-between sm:gap-4">
                      <p
                        className="min-w-0 overflow-hidden text-sm font-semibold text-slate-900 [display:-webkit-box] [-webkit-box-orient:vertical] [-webkit-line-clamp:2]"
                        title={item.name}
                      >
                        {item.name}
                      </p>
                      <p className="shrink-0 text-sm font-bold text-sky-700">
                        {fmtCurrency(item.revenue)}
                      </p>
                    </div>
                    <p className="mt-1 truncate text-xs text-slate-500">
                      {subtitle}
                    </p>
                    <div className="mt-3 h-2 rounded-full bg-slate-200">
                      <div
                        className="h-2 rounded-full bg-sky-500"
                        style={{
                          width: `${Math.max(percentage, percentage > 0 ? 4 : 0)}%`,
                        }}
                      />
                    </div>
                  </div>
                </div>
              </div>
            );
          })
        ) : (
          <div className="flex h-full min-h-80 items-center justify-center rounded-xl border border-dashed border-slate-200 text-center text-sm font-semibold text-slate-400">
            Chưa có dữ liệu
          </div>
        )}
      </div>
    </section>
  );
};

const SectionHeading = ({
  title,
  subtitle,
}: {
  title: string;
  subtitle: string;
}) => (
  <div>
    <h2 className="text-lg font-bold text-slate-900">{title}</h2>
    <p className="mt-1 text-sm text-slate-500">{subtitle}</p>
  </div>
);

const Avatar = ({
  src,
  name,
}: {
  src?: string;
  name?: string;
}) => (
  <div className="flex h-10 w-10 shrink-0 items-center justify-center overflow-hidden rounded-full bg-sky-50 text-sm font-bold text-sky-700">
    {src ? (
      <img src={src} alt={name || "avatar"} className="h-full w-full object-cover" />
    ) : (
      (name || "?").trim().charAt(0).toUpperCase()
    )}
  </div>
);

const PostTypeOverview = ({
  items,
}: {
  items: NonNullable<AdminDashboardData["postOverview"]>["postsByType"];
}) => (
  <div>
    <h3 className="text-base font-bold text-slate-900">Thống kê bài đăng theo loại</h3>
    <div className="mt-5 space-y-4">
      {items.length ? (
        items.map((item, index) => (
          <div key={item.type}>
            <div className="mb-2 flex items-center justify-between gap-3 text-sm">
              <span className="min-w-0 truncate font-semibold text-slate-700" title={item.label}>
                {item.label}
              </span>
              <span className="shrink-0 text-xs font-bold text-slate-500">
                {fmtNumber(item.count)} bài · {item.percentage}%
              </span>
            </div>
            <div className="h-2 overflow-hidden rounded-full bg-slate-100">
              <div
                className={`h-full rounded-full ${POST_TYPE_COLORS[index % POST_TYPE_COLORS.length]}`}
                style={{ width: `${Math.max(item.percentage, item.count > 0 ? 4 : 0)}%` }}
              />
            </div>
          </div>
        ))
      ) : (
        <div className="rounded-lg border border-dashed border-slate-200 py-12 text-center text-sm font-semibold text-slate-400">
          Chưa có dữ liệu bài đăng
        </div>
      )}
    </div>
  </div>
);

const RecentPosts = ({
  items,
}: {
  items: NonNullable<AdminDashboardData["postOverview"]>["recentPosts"];
}) => (
  <div>
    <div className="mb-5 flex items-center justify-between gap-3">
      <div>
        <h3 className="text-base font-bold text-slate-900">Bài đăng gần đây</h3>
      </div>
      <Link to="/admin/posts" className="shrink-0 text-sm font-bold text-sky-700 hover:text-sky-800">
        Xem tất cả bài đăng →
      </Link>
    </div>
    <div className="space-y-3">
      {items.length ? (
        items.map((post) => {
          const authorName = post.author?.fullName || post.author?.username || "Người dùng";
          return (
            <div key={post.id} className="rounded-lg border border-slate-100 p-4">
              <div className="flex min-w-0 gap-3">
                <Avatar src={post.author?.avatar} name={authorName} />
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <p className="truncate text-sm font-bold text-slate-900" title={authorName}>
                      {authorName}
                    </p>
                    {post.author?.username ? (
                      <span className="text-xs text-slate-400">@{post.author.username}</span>
                    ) : null}
                    <span className={`rounded-full px-2 py-0.5 text-[11px] font-bold ${
                      post.status === "ACTIVE"
                        ? "bg-emerald-50 text-emerald-700"
                        : "bg-amber-50 text-amber-700"
                    }`}>
                      {post.status === "ACTIVE" ? "Hoạt động" : "Đã khóa"}
                    </span>
                  </div>
                  <p className="mt-2 truncate text-sm font-semibold text-slate-800" title={post.title}>
                    {post.title}
                  </p>
                  <div className="mt-2 flex flex-wrap items-center gap-2 text-xs text-slate-500">
                    <span className="rounded-full bg-sky-50 px-2 py-0.5 font-bold text-sky-700">
                      {post.label || post.type}
                    </span>
                    <span>{fmtNumber(post.commentCount)} bình luận</span>
                    <span>{fmtDate(post.createdDate)}</span>
                  </div>
                </div>
              </div>
            </div>
          );
        })
      ) : (
        <div className="rounded-lg border border-dashed border-slate-200 py-12 text-center text-sm font-semibold text-slate-400">
          Chưa có bài đăng gần đây
        </div>
      )}
    </div>
  </div>
);

const RatingDistribution = ({
  items,
}: {
  items: NonNullable<AdminDashboardData["feedbackOverview"]>["ratingsByStar"];
}) => (
  <div>
    <h3 className="text-base font-bold text-slate-900">Phân bố đánh giá theo sao</h3>
    <div className="mt-5 space-y-4">
      {items.length ? (
        items.map((item) => (
          <div key={item.star}>
            <div className="mb-2 flex items-center justify-between gap-3 text-sm">
              <span className="flex items-center gap-1 font-semibold text-slate-700">
                {item.star} <Star className="h-4 w-4 fill-amber-400 text-amber-400" />
              </span>
              <span className="shrink-0 text-xs font-bold text-slate-500">
                {fmtNumber(item.count)} đánh giá · {fmtRating(item.percentage)}%
              </span>
            </div>
            <div className="h-2 overflow-hidden rounded-full bg-slate-100">
              <div
                className={`h-full rounded-full ${item.star <= 2 ? "bg-rose-400" : "bg-amber-400"}`}
                style={{ width: `${Math.max(item.percentage, item.count > 0 ? 4 : 0)}%` }}
              />
            </div>
          </div>
        ))
      ) : (
        <div className="rounded-lg border border-dashed border-slate-200 py-12 text-center text-sm font-semibold text-slate-400">
          Chưa có dữ liệu đánh giá
        </div>
      )}
    </div>
  </div>
);

const RecentFeedbacks = ({
  items,
}: {
  items: NonNullable<AdminDashboardData["feedbackOverview"]>["recentFeedbacks"];
}) => (
  <div>
    <div className="mb-5 flex items-center justify-between gap-3">
      <div>
        <h3 className="text-base font-bold text-slate-900">Đánh giá gần đây</h3>
      </div>
      <Link to="/admin/feedbacks" className="shrink-0 text-sm font-bold text-sky-700 hover:text-sky-800">
        Xem tất cả đánh giá →
      </Link>
    </div>
    <div className="space-y-3">
      {items.length ? (
        items.map((feedback) => {
          const userName = feedback.user?.fullName || feedback.user?.username || "Khách hàng";
          const targetName = feedback.target?.name || "Đối tượng đánh giá";
          return (
            <div key={feedback.id} className="rounded-lg border border-slate-100 p-4">
              <div className="flex min-w-0 gap-3">
                <Avatar src={feedback.user?.avatar} name={userName} />
                <div className="min-w-0 flex-1">
                  <div className="flex items-start justify-between gap-3">
                    <p className="truncate text-sm font-bold text-slate-900" title={userName}>
                      {userName}
                    </p>
                    <div className="flex shrink-0">
                      {Array.from({ length: 5 }).map((_, index) => (
                        <Star
                          key={index}
                          className={`h-4 w-4 ${
                            index < feedback.rating
                              ? "fill-amber-400 text-amber-400"
                              : "text-slate-200"
                          }`}
                        />
                      ))}
                    </div>
                  </div>
                  <p className="mt-2 truncate text-sm text-slate-700" title={feedback.content}>
                    {feedback.content}
                  </p>
                  <p className="mt-2 truncate text-xs text-slate-500" title={targetName}>
                    {targetName}
                    {feedback.target?.variantInfo ? ` · ${feedback.target.variantInfo}` : ""}
                    {feedback.type ? ` · ${feedback.type === "BRANCH" ? "Chi nhánh" : "Sản phẩm"}` : ""}
                    {feedback.branch?.branchName ? ` · ${feedback.branch.branchName}` : ""}
                    {" · "}
                    {fmtDate(feedback.createdDate)}
                  </p>
                </div>
              </div>
            </div>
          );
        })
      ) : (
        <div className="rounded-lg border border-dashed border-slate-200 py-12 text-center text-sm font-semibold text-slate-400">
          Chưa có đánh giá gần đây
        </div>
      )}
    </div>
  </div>
);

const AdminDashboardPage = () => {
  const [data, setData] = useState<AdminDashboardData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    adminRevenueService
      .getDashboardService({ range: "today" })
      .then((res) => setData((res.data as any).data))
      .catch(() => setData(null))
      .finally(() => setLoading(false));
  }, []);

  const summary = data?.summary;
  const operation = data?.operationSummary;
  const chart = data?.quickRevenueChart || data?.chart || [];
  const postOverview = data?.postOverview;
  const feedbackOverview = data?.feedbackOverview;

  const revenueStructure = useMemo(() => {
    const source = data?.revenueStructure || {
      bookingRevenue: data?.overview?.bookingRevenue || 0,
      productRevenue: data?.overview?.productRevenue || 0,
      beverageRevenue: data?.overview?.beverageRevenue || 0,
    };
    const total =
      source.bookingRevenue + source.productRevenue + source.beverageRevenue;
    return [
      { label: "Đặt sân", value: source.bookingRevenue, color: "bg-indigo-500" },
      { label: "Sản phẩm", value: source.productRevenue, color: "bg-emerald-500" },
      { label: "Đồ uống", value: source.beverageRevenue, color: "bg-amber-500" },
    ].map((item) => ({ ...item, pct: percentOf(item.value, total), total }));
  }, [data]);

  const revenueStructurePieData = revenueStructure
    .map((item, index) => ({
      ...item,
      fill: REVENUE_STRUCTURE_COLORS[index % REVENUE_STRUCTURE_COLORS.length],
    }))
    .filter((item) => item.value > 0);

  if (loading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-36" />
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5">
          {Array.from({ length: 10 }).map((_, index) => (
            <Skeleton key={index} className="h-32" />
          ))}
        </div>
        <div className="grid grid-cols-1 gap-6 xl:grid-cols-3">
          <Skeleton className="h-80 xl:col-span-2" />
          <Skeleton className="h-80" />
        </div>
      </div>
    );
  }

  if (!data || !summary) {
    return (
      <div className="flex h-64 items-center justify-center rounded-lg border border-slate-200 bg-white text-slate-400">
        Không thể tải dữ liệu dashboard
      </div>
    );
  }

  const cards = [
    {
      title: "Doanh thu hôm nay",
      value: fmtCurrency(summary.todayRevenue),
      note: "Tổng đặt sân và bán hàng",
      icon: DollarSign,
      tone: "bg-sky-50 text-sky-600",
    },
    {
      title: "Doanh thu đặt sân",
      value: fmtCurrency(summary.todayBookingRevenue),
      note: `${summary.todayBookingCount} lượt đặt sân`,
      icon: CalendarCheck,
      tone: "bg-indigo-50 text-indigo-600",
    },
    {
      title: "Doanh thu bán hàng",
      value: fmtCurrency(summary.todaySalesRevenue),
      note: `${summary.todayOrderCount} đơn hàng hôm nay`,
      icon: ShoppingBag,
      tone: "bg-emerald-50 text-emerald-600",
    },
    {
      title: "Đang chờ xử lý",
      value: String(summary.pendingBookingCount + summary.pendingOrderCount),
      note: `${summary.pendingBookingCount} booking, ${summary.pendingOrderCount} đơn`,
      icon: ClipboardCheck,
      tone: "bg-amber-50 text-amber-600",
    },
    {
      title: "Cảnh báo tồn kho",
      value: String(summary.lowStockCount),
      note: `${summary.outOfStockCount} mặt hàng hết hàng`,
      icon: AlertTriangle,
      tone: "bg-rose-50 text-rose-600",
    },
    {
      title: "Tổng bài đăng",
      value: fmtNumber(postOverview?.totalPosts || 0),
      note: `${fmtNumber(postOverview?.newPostsThisMonth || 0)} bài mới trong tháng`,
      icon: Newspaper,
      tone: "bg-cyan-50 text-cyan-600",
    },
    {
      title: "Tổng bình luận",
      value: fmtNumber(postOverview?.totalComments || 0),
      note: `${fmtNumber(postOverview?.commentsThisMonth || 0)} bình luận trong tháng`,
      icon: MessageCircle,
      tone: "bg-violet-50 text-violet-600",
    },
    {
      title: "Điểm đánh giá",
      value: `${fmtRating(feedbackOverview?.averageRating || 0)} / 5`,
      note: `${fmtNumber(feedbackOverview?.totalFeedbacks || 0)} lượt đánh giá`,
      icon: Star,
      tone: "bg-amber-50 text-amber-600",
    },
    {
      title: "Đánh giá thấp",
      value: fmtNumber(feedbackOverview?.lowRatingCount || 0),
      note: "Cần theo dõi và xử lý",
      icon: ThumbsDown,
      tone: "bg-orange-50 text-orange-600",
    },
  ];

  return (
    <div className="space-y-6">
      <AdminPageHeader
        title="Dashboard Admin"
        subtitle="Tổng quan nhanh tình hình vận hành hôm nay: doanh thu, booking, đơn hàng, phiếu nhập và cảnh báo tồn kho."
        action={
          <Link
            to="/admin/revenue"
            className={adminPrimaryButtonClass}
          >
            <BarChart3 className="h-4 w-4" />
            Xem báo cáo doanh thu
          </Link>
        }
      />

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5">
        {cards.map((card) => (
          <StatCard key={card.title} {...card} />
        ))}
      </div>

      <div className="grid grid-cols-1 gap-6 xl:grid-cols-3">
        <section className="rounded-lg border border-slate-200 bg-white p-6 shadow-sm xl:col-span-2">
          <div className="mb-5 flex items-center justify-between gap-3">
            <div>
              <h2 className="text-lg font-bold text-slate-900">
                Doanh thu 7 ngày gần nhất
              </h2>
              <p className="mt-1 text-sm text-slate-500">
                Tách nhanh theo đặt sân, sản phẩm và đồ uống
              </p>
            </div>
            <Wallet className="h-5 w-5 text-slate-300" />
          </div>
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chart} barSize={12} barGap={2}>
                <CartesianGrid stroke="#f1f5f9" vertical={false} />
                <XAxis dataKey="label" axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: "#94a3b8" }} />
                <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: "#94a3b8" }} tickFormatter={(v) => fmtShort(Number(v))} width={54} />
                <Tooltip content={<ChartTooltip />} />
                <Bar dataKey="bookingRevenue" name="Đặt sân" fill="#6366f1" radius={[4, 4, 0, 0]} />
                <Bar dataKey="productRevenue" name="Sản phẩm" fill="#10b981" radius={[4, 4, 0, 0]} />
                <Bar dataKey="beverageRevenue" name="Đồ uống" fill="#f59e0b" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </section>

        <section className="rounded-lg border border-slate-200 bg-white p-6 shadow-sm">
          <h2 className="text-lg font-bold text-slate-900">Cơ cấu doanh thu hôm nay</h2>
          <p className="mt-1 text-sm text-slate-500">Dashboard chỉ hiển thị tỷ trọng nhanh</p>
          <div className="mt-6">
            {revenueStructurePieData.length ? (
              <>
                <div className="h-56">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={revenueStructurePieData}
                        dataKey="value"
                        nameKey="label"
                        innerRadius={54}
                        outerRadius={86}
                        paddingAngle={2}
                      >
                        {revenueStructurePieData.map((item) => (
                          <Cell key={item.label} fill={item.fill} />
                        ))}
                      </Pie>
                      <Tooltip
                        formatter={(value: number) =>
                          fmtCurrency(Number(value))
                        }
                      />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
                <div className="mt-4 space-y-3">
                  {revenueStructure.map((item, index) => (
                    <div
                      key={item.label}
                      className="flex items-center justify-between gap-3 text-sm"
                    >
                      <div className="flex min-w-0 items-center gap-2">
                        <span
                          className="h-2.5 w-2.5 shrink-0 rounded-full"
                          style={{
                            backgroundColor:
                              REVENUE_STRUCTURE_COLORS[
                                index % REVENUE_STRUCTURE_COLORS.length
                              ],
                          }}
                        />
                        <span className="truncate font-medium text-slate-600">
                          {item.label}
                        </span>
                      </div>
                      <span className="shrink-0 font-semibold text-slate-900">
                        {fmtCurrency(item.value)} ({item.pct}%)
                      </span>
                    </div>
                  ))}
                </div>
              </>
            ) : (
              <div className="flex h-56 items-center justify-center rounded-lg border border-dashed border-slate-200 text-center text-sm font-semibold text-slate-400">
                ChÆ°a cÃ³ doanh thu hÃ´m nay
              </div>
            )}
          </div>
        </section>
      </div>

      <div className="grid grid-cols-1 gap-6 xl:grid-cols-3">
        <div className="hidden">
        <AdminTopRanking
          title="Top 3 chi nhánh"
          badge="Top 3"
          icon={Trophy}
          iconClassName="text-amber-500"
          items={data.topBranches || []}
          type="branch"
        />
        <AdminTopRanking
          title="Top sản phẩm"
          badge="Top 10"
          icon={Store}
          iconClassName="text-emerald-500"
          items={data.topProducts || []}
          type="product"
        />
        <AdminTopRanking
          title="Top đồ uống"
          badge="Top 10"
          icon={Coffee}
          iconClassName="text-amber-500"
          items={data.topBeverages || []}
          type="beverage"
        />
        </div>
        <div className="contents">
        <section className="rounded-lg border border-slate-200 bg-white p-6 shadow-sm">
          <h2 className="text-lg font-bold text-slate-900">Vận hành sân hôm nay</h2>
          <p className="mt-1 text-sm text-slate-500">Theo dõi nhanh trạng thái booking và mức sử dụng sân</p>
          <div className="mt-5 grid grid-cols-2 gap-3 text-sm">
            {[
              ["Tổng booking", operation?.totalBookingCount || 0],
              ["Chờ xác nhận", operation?.pendingBookingCount || 0],
              ["Đã xác nhận", operation?.confirmedBookingCount || 0],
              ["Đang chơi", operation?.checkedInBookingCount || 0],
              ["Hoàn thành", operation?.completedBookingCount || 0],
              ["Đã hủy", operation?.cancelledBookingCount || 0],
            ].map(([label, value]) => (
              <div key={label} className="rounded-lg bg-slate-50 p-3">
                <p className="text-xs text-slate-500">{label}</p>
                <p className="mt-1 text-lg font-bold text-slate-900">{value}</p>
              </div>
            ))}
          </div>
          <div className="mt-4 rounded-lg border border-slate-100 p-4">
            <div className="flex items-center justify-between text-sm">
              <span className="text-slate-500">Sân đang sử dụng</span>
              <span className="font-bold text-sky-700">
                {operation?.playingCourtCount || 0}/{operation?.totalCourtCount || 0}
              </span>
            </div>
            <div className="mt-3 h-2 rounded-full bg-slate-100">
              <div
                className="h-2 rounded-full bg-sky-500"
                style={{ width: `${operation?.occupancyRate || 0}%` }}
              />
            </div>
          </div>
        </section>

        <section className="rounded-lg border border-slate-200 bg-white p-6 shadow-sm">
          <div className="mb-5 flex items-center justify-between">
            <div>
              <h2 className="text-lg font-bold text-slate-900">Phiếu nhập chờ duyệt</h2>
              <p className="mt-1 text-sm text-slate-500">Các phiếu nhập cần admin kiểm tra và phê duyệt</p>
            </div>
            <PackageCheck className="h-5 w-5 text-slate-300" />
          </div>
          {(data.pendingPurchaseReceipts || []).length === 0 ? (
            <p className="py-10 text-center text-sm text-slate-400">
              Không có phiếu nhập chờ duyệt
            </p>
          ) : (
            <div className="max-h-[408px] space-y-3 overflow-y-auto pr-1">
              {(data.pendingPurchaseReceipts || []).map((receipt) => (
                <Link
                  key={receipt.id}
                  to="/admin/purchase-receipts"
                  className="block min-h-[72px] rounded-lg border border-slate-100 p-4 transition hover:border-sky-200 hover:bg-sky-50"
                >
                  <div className="flex items-center justify-between gap-3">
                    <p className="font-semibold text-slate-800">{receipt.receiptCode}</p>
                    <p className="font-bold text-sky-700">{fmtCurrency(receipt.totalAmount)}</p>
                  </div>
                  <p className="mt-1 text-xs text-slate-500">
                    {receipt.branchName || "Chi nhánh"} · {receipt.supplierName || "Nhà cung cấp"}
                  </p>
                </Link>
              ))}
            </div>
          )}
        </section>

        <section className="rounded-lg border border-slate-200 bg-white p-6 shadow-sm">
          <div className="mb-5 flex items-center justify-between">
            <div>
              <h2 className="text-lg font-bold text-slate-900">Cảnh báo tồn kho</h2>
              <p className="mt-1 text-sm text-slate-500">Mặt hàng sắp hết hoặc đã hết tại các chi nhánh</p>
            </div>
            <AlertTriangle className="h-5 w-5 text-rose-400" />
          </div>
          {(data.lowStockItems || []).length === 0 ? (
            <p className="py-10 text-center text-sm text-slate-400">
              Không có mặt hàng sắp hết
            </p>
          ) : (
            <div className="max-h-[408px] space-y-3 overflow-y-auto pr-1">
              {(data.lowStockItems || []).map((item) => (
                <Link
                  key={`${item.itemType}-${item.branchId}-${item.itemId}`}
                  to="/admin/inventory"
                  className="flex min-h-[72px] items-center justify-between gap-3 rounded-lg border border-slate-100 p-3 transition hover:border-rose-200 hover:bg-rose-50"
                >
                  <div className="min-w-0">
                    <p className="truncate text-sm font-semibold text-slate-800">{item.itemName}</p>
                    <p className="mt-0.5 truncate text-xs text-slate-500">
                      {item.branchName} · {item.itemType === "BEVERAGE" ? "Đồ uống" : "Sản phẩm"}
                    </p>
                  </div>
                  <span className={`rounded-full px-2 py-1 text-xs font-bold ${
                    item.status === "OUT_OF_STOCK"
                      ? "bg-rose-100 text-rose-700"
                      : "bg-amber-100 text-amber-700"
                  }`}>
                    {item.currentStock}
                  </span>
                </Link>
              ))}
            </div>
          )}
        </section>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6 xl:grid-cols-3">
        <AdminTopRanking
          title="Top 3 chi nhánh"
          badge="Top 3"
          icon={Trophy}
          iconClassName="text-amber-500"
          items={data.topBranches || []}
          type="branch"
        />
        <AdminTopRanking
          title="Top sản phẩm"
          badge="Top 10"
          icon={Store}
          iconClassName="text-emerald-500"
          items={data.topProducts || []}
          type="product"
        />
        <AdminTopRanking
          title="Top đồ uống"
          badge="Top 10"
          icon={Coffee}
          iconClassName="text-amber-500"
          items={data.topBeverages || []}
          type="beverage"
        />
        <div className="hidden">
        <section className="rounded-lg border border-slate-200 bg-white p-6 shadow-sm">
          <div className="mb-5 flex items-center gap-3">
            <Trophy className="h-5 w-5 text-amber-500" />
            <h2 className="text-lg font-bold text-slate-900">Top 3 chi nhánh</h2>
          </div>
          <div className="space-y-3">
            {data.topBranches.length === 0 ? (
              <p className="py-8 text-center text-sm text-slate-400">Chưa có dữ liệu</p>
            ) : (
              data.topBranches.map((branch, index) => (
                <div key={branch.branchId} className="rounded-lg bg-slate-50 p-4">
                  <div className="flex items-center justify-between gap-3">
                    <p className="font-semibold text-slate-800">#{index + 1} {branch.branchName}</p>
                    <p className="font-bold text-sky-700">{fmtCurrency(branch.totalRevenue)}</p>
                  </div>
                </div>
              ))
            )}
          </div>
        </section>

        <section className="rounded-lg border border-slate-200 bg-white p-6 shadow-sm">
          <div className="mb-5 flex items-center gap-3">
            <Store className="h-5 w-5 text-emerald-500" />
            <h2 className="text-lg font-bold text-slate-900">Top sản phẩm</h2>
          </div>
          <div className="space-y-3">
            {data.topProducts.length === 0 ? (
              <p className="py-8 text-center text-sm text-slate-400">Chưa có dữ liệu</p>
            ) : (
              data.topProducts.map((product, index) => (
                <div key={product.productVariantId} className="rounded-lg bg-slate-50 p-4">
                  <p className="truncate font-semibold text-slate-800">#{index + 1} {product.productName}</p>
                  <p className="mt-1 text-xs text-slate-500">
                    {product.totalQuantity} sản phẩm · {fmtCurrency(product.totalRevenue)}
                  </p>
                </div>
              ))
            )}
          </div>
        </section>

        <section className="rounded-lg border border-slate-200 bg-white p-6 shadow-sm">
          <div className="mb-5 flex items-center gap-3">
            <Coffee className="h-5 w-5 text-amber-500" />
            <h2 className="text-lg font-bold text-slate-900">Top đồ uống</h2>
          </div>
          <div className="space-y-3">
            {(data.topBeverages || []).length === 0 ? (
              <p className="py-8 text-center text-sm text-slate-400">Chưa có dữ liệu</p>
            ) : (
              (data.topBeverages || []).map((beverage, index) => (
                <div key={beverage.beverageId} className="rounded-lg bg-slate-50 p-4">
                  <p className="truncate font-semibold text-slate-800">#{index + 1} {beverage.beverageName}</p>
                  <p className="mt-1 text-xs text-slate-500">
                    {beverage.totalQuantity} món · {fmtCurrency(beverage.totalRevenue)}
                  </p>
                </div>
              ))
            )}
          </div>
        </section>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6 xl:grid-cols-2">
        <section className="rounded-lg border border-slate-200 bg-white p-6 shadow-sm">
          <div className="mb-5 flex items-start justify-between gap-3">
            <div>
              <h2 className="text-lg font-bold text-slate-900">Đơn hàng gần đây</h2>
              <p className="mt-1 text-sm text-slate-500">Theo dõi các đơn hàng mới phát sinh trên hệ thống</p>
            </div>
            <Link to="/admin/revenue" className="shrink-0 text-sm font-bold text-sky-700 hover:text-sky-800">
              Xem tất cả đơn hàng →
            </Link>
          </div>
          {data.recentOrders.length === 0 ? (
            <p className="py-8 text-center text-sm text-slate-400">Chưa có đơn hàng nào</p>
          ) : (
            <div className="space-y-3">
              {data.recentOrders.map((item) => (
                <DashboardRecentRow key={item.id} item={item} statusConfig={ORDER_STATUS_CONFIG} />
              ))}
            </div>
          )}
        </section>

        <section className="rounded-lg border border-slate-200 bg-white p-6 shadow-sm">
          <div className="mb-5 flex items-start justify-between gap-3">
            <div>
              <h2 className="text-lg font-bold text-slate-900">Đặt sân gần đây</h2>
              <p className="mt-1 text-sm text-slate-500">Cập nhật nhanh các lịch sân được tạo gần đây</p>
            </div>
            <Link to="/admin/revenue" className="shrink-0 text-sm font-bold text-sky-700 hover:text-sky-800">
              Xem tất cả lịch sân →
            </Link>
          </div>
          {data.recentBookings.length === 0 ? (
            <p className="py-8 text-center text-sm text-slate-400">Chưa có lượt đặt sân nào</p>
          ) : (
            <div className="space-y-3">
              {data.recentBookings.map((item) => (
                <DashboardRecentRow key={item.id} item={item} statusConfig={BOOKING_STATUS_CONFIG} />
              ))}
            </div>
          )}
        </section>
      </div>

      <section className="rounded-lg border border-slate-200 bg-white p-6 shadow-sm">
        <SectionHeading
          title="Tổng quan bài đăng"
          subtitle="Theo dõi hoạt động cộng đồng và các bài viết mới nhất"
        />
        <div className="mt-6 grid grid-cols-1 gap-8 xl:grid-cols-5">
          <div className="border-b border-slate-200 pb-6 xl:col-span-2 xl:border-b-0 xl:border-r xl:pb-0 xl:pr-8">
            <PostTypeOverview items={postOverview?.postsByType || []} />
          </div>
          <div className="xl:col-span-3 xl:pl-2">
            <RecentPosts items={postOverview?.recentPosts || []} />
          </div>
        </div>
      </section>

      <section className="rounded-lg border border-slate-200 bg-white p-6 shadow-sm">
        <SectionHeading
          title="Tổng quan đánh giá"
          subtitle="Theo dõi mức độ hài lòng và các phản hồi mới nhất"
        />
        <div className="mt-6 grid grid-cols-1 gap-8 xl:grid-cols-5">
          <div className="border-b border-slate-200 pb-6 xl:col-span-2 xl:border-b-0 xl:border-r xl:pb-0 xl:pr-8">
            <RatingDistribution items={feedbackOverview?.ratingsByStar || []} />
          </div>
          <div className="xl:col-span-3 xl:pl-2">
            <RecentFeedbacks items={feedbackOverview?.recentFeedbacks || []} />
          </div>
        </div>
      </section>
    </div>
  );
};

export default AdminDashboardPage;
