import { useEffect, useState, type ReactNode } from "react";
import { useNavigate } from "react-router-dom";
import {
  ArrowRight,
  CalendarDays,
  Clock,
  MapPin,
  MessageCircle,
  PackageSearch,
  ShoppingBag,
  Sparkles,
  Star,
  TicketPercent,
  Trophy,
  Flame,
  Boxes,
  ThumbsUp,
  HeartHandshake,
} from "lucide-react";
import { useAppDispatch, useAppSelector } from "../../redux/hook";
import { getHomeData } from "../../redux/slices/user/homeSlice";
import type {
  HomeBranch,
  HomeData,
  HomeDiscount,
  HomeProduct,
} from "../../types/home";

const emptyHomeData: HomeData = {
  banners: [],
  badmintonCategories: [],
  categoryGroups: [],
  bestSellingCategories: [],

  newProducts: [],
  newProductsByGroup: [],

  products: [],
  hotProducts: [],
  topRatedProducts: [],
  lowStockProducts: [],

  discounts: [],
  discountsByApplyType: {
    ORDER: [],
    BOOKING: [],
    ALL: [],
  },

  branches: [],
  hotBranches: [],
  mostBookedBranches: [],
  topSellingBranches: [],

  customerReviews: [],

  stats: {
    branchCount: 0,
    productCount: 0,
    categoryGroupCount: 0,
    categoryCount: 0,
    bookingCount: 0,
    orderCount: 0,
    reviewCount: 0,
    soldCount: 0,
  },
};

const formatPrice = (value: number) =>
  new Intl.NumberFormat("vi-VN", {
    style: "currency",
    currency: "VND",
    maximumFractionDigits: 0,
  }).format(value || 0);

const formatNumber = (value: number) =>
  new Intl.NumberFormat("vi-VN").format(value || 0);

const formatDate = (date?: string) => {
  if (!date) return "";
  return new Date(date).toLocaleDateString("vi-VN");
};

const getDiscountValue = (discount: HomeDiscount) => {
  if (discount.type === "PERCENT") return `${discount.value}%`;
  return `${discount.value.toLocaleString("vi-VN")}đ`;
};

const getDiscountApplyLabel = (applyType: string) => {
  if (applyType === "BOOKING") return "Đặt sân";
  if (applyType === "ORDER") return "Mua hàng";
  return "Tất cả";
};

type ProductCardProps = {
  product?: HomeProduct;
  loading?: boolean;
  badge?: ReactNode;
  badgeClassName?: string;
  onClick?: () => void;
};

const ProductCard = ({
  product,
  loading = false,
  badge,
  badgeClassName = "bg-sky-600",
  onClick,
}: ProductCardProps) => {
  const cardClass =
    "group relative h-full cursor-pointer overflow-hidden rounded-[1.75rem] border border-slate-200 bg-white shadow-sm transition-all duration-300 hover:-translate-y-1.5 hover:border-sky-300 hover:shadow-xl hover:shadow-sky-100";
  const imageClass =
    "h-full w-full object-cover transition-transform duration-700 ease-out group-hover:scale-110";
  const actionBtnClass =
    "mt-4 flex w-full items-center justify-center gap-2 rounded-2xl border border-sky-100 bg-sky-50 px-4 py-3 text-sm font-semibold text-sky-700 transition-all duration-300 hover:border-sky-600 hover:bg-sky-600 hover:text-white hover:shadow-lg hover:shadow-sky-100 active:scale-[0.98]";

  return (
    <article onClick={onClick} className={cardClass}>
      <div className="relative aspect-[4/3.85] overflow-hidden bg-slate-100">
        {loading ? (
          <div className="h-full w-full animate-pulse bg-slate-200" />
        ) : (
          <>
            <img
              src={product?.thumbnailUrl}
              alt={product?.productName}
              loading="lazy"
              className={imageClass}
            />

            <div className="absolute inset-x-0 bottom-0 h-24 bg-gradient-to-t from-slate-950/45 to-transparent" />

            <div className="absolute left-3 top-3 flex flex-col gap-2">
              {(product?.discount ?? 0) > 0 && (
                <span className="w-fit rounded-full bg-red-500 px-2.5 py-1 text-xs font-medium text-white shadow">
                  -{product?.discount}%
                </span>
              )}

              {product?.isNew && !badge && (
                <span className="inline-flex w-fit items-center gap-1 rounded-full bg-emerald-500 px-2.5 py-1 text-xs font-medium text-white shadow">
                  <Sparkles size={12} />
                  Mới
                </span>
              )}

              {badge && (
                <span
                  className={`inline-flex w-fit items-center gap-1 rounded-full px-2.5 py-1 text-xs font-medium text-white shadow ${badgeClassName}`}
                >
                  {badge}
                </span>
              )}
            </div>
          </>
        )}
      </div>

      <div className="p-[18px]">
        <div className="mb-2 flex items-center justify-between gap-2">
          <p className="line-clamp-1 text-[11px] font-medium uppercase tracking-wide text-sky-600">
            {loading ? "..." : product?.brand}
          </p>

          {!loading && product?.category?.cateName && (
            <span className="shrink-0 rounded-full bg-slate-100 px-2.5 py-1 text-[11px] font-medium text-slate-600">
              {product.category.cateName}
            </span>
          )}
        </div>

        <h3
          className="
    mt-1.5 line-clamp-2 min-h-[56px]
    text-[17px] font-semibold leading-snug
    text-slate-700 transition
    group-hover:text-sky-700
  "
          title={loading ? "Đang tải sản phẩm..." : product?.productName}
        >
          {loading ? "Đang tải sản phẩm..." : product?.productName}
        </h3>

        <div className="mt-2 flex flex-wrap items-baseline gap-2">
          <span className="text-[19px] font-semibold tracking-tight text-sky-700">
            {loading
              ? "--"
              : formatPrice(
                  product?.minDiscountedPrice || product?.minPrice || 0,
                )}
          </span>

          {!loading && product && product.discount > 0 && (
            <span className="text-[13px] text-slate-400 line-through">
              {formatPrice(product.minPrice)}
            </span>
          )}
        </div>

        {!loading && (
          <div className="mt-2 flex flex-wrap gap-2 text-xs font-medium text-slate-500">
            {product?.soldCount ? (
              <span className="rounded-full bg-orange-50 px-2.5 py-1 text-orange-600">
                Đã bán {formatNumber(product.soldCount)}
              </span>
            ) : null}

            {product?.reviewCount ? (
              <span className="rounded-full bg-amber-50 px-2.5 py-1 text-amber-600">
                ★ {product.avgRating} ({product.reviewCount})
              </span>
            ) : null}
          </div>
        )}

        {!loading && (
          <button
            type="button"
            onClick={(event) => {
              event.stopPropagation();
              onClick?.();
            }}
            className={actionBtnClass}
          >
            Xem chi tiết
            <ArrowRight
              size={16}
              className="transition-transform group-hover:translate-x-1"
            />
          </button>
        )}
      </div>
    </article>
  );
};

type BranchCardProps = {
  branch?: HomeBranch;
  loading?: boolean;
  onClick?: () => void;
  badge?: string;
};

const BranchCard = ({
  branch,
  loading = false,
  onClick,
  badge = "Chi nhánh B-Hub",
}: BranchCardProps) => {
  const cardClass =
    "group relative h-full cursor-pointer overflow-hidden rounded-[1.75rem] border border-slate-200 bg-white shadow-sm transition-all duration-300 hover:-translate-y-1.5 hover:border-sky-300 hover:shadow-xl hover:shadow-sky-100";

  const imageClass =
    "h-full w-full object-cover transition-transform duration-700 ease-out group-hover:scale-110";

  const actionBtnClass =
    "mt-5 flex w-full items-center justify-center gap-2 rounded-2xl border border-sky-100 bg-sky-50 px-4 py-3 text-sm font-semibold text-sky-700 transition-all duration-300 hover:border-sky-600 hover:bg-sky-600 hover:text-white hover:shadow-lg hover:shadow-sky-100 active:scale-[0.98]";

  return (
    <article onClick={onClick} className={cardClass}>
      {/* IMAGE */}
      <div className="relative h-64 overflow-hidden bg-slate-200">
        {loading ? (
          <div className="h-full w-full animate-pulse bg-slate-200" />
        ) : (
          <>
            <img
              src={branch?.imageUrl}
              alt={branch?.branchName}
              loading="lazy"
              className={imageClass}
            />

            <div className="absolute inset-x-0 bottom-0 h-32 bg-gradient-to-t from-slate-950/70 via-slate-950/25 to-transparent" />

            <div className="absolute left-4 top-4 rounded-full bg-white/95 px-3 py-1.5 text-xs font-medium text-sky-700 shadow-sm">
              {badge}
            </div>

            {branch?.avgRating ? (
              <div className="absolute bottom-4 left-4 inline-flex items-center gap-1.5 rounded-full bg-white/95 px-3 py-1.5 text-xs font-medium text-amber-600 shadow-sm">
                <Star size={14} className="fill-amber-500 text-amber-500" />
                {branch.avgRating}
                <span className="text-slate-500">({branch.reviewCount})</span>
              </div>
            ) : null}
          </>
        )}
      </div>

      {/* CONTENT */}
      <div className="p-5">
        <h3 className="line-clamp-1 text-xl font-semibold text-slate-950 transition group-hover:text-sky-700">
          {loading ? "Đang tải..." : branch?.branchName}
        </h3>

        <div className="mt-4 flex items-start gap-2 text-sm leading-relaxed text-slate-500">
          <MapPin size={17} className="mt-0.5 shrink-0 text-sky-600" />
          <p className="line-clamp-2">
            {loading ? "..." : branch?.fullAddress}
          </p>
        </div>

        {!loading && (
          <div className="mt-4 flex flex-wrap gap-2 text-xs font-medium">
            <div className="inline-flex items-center gap-1.5 rounded-full bg-sky-50 px-3 py-1.5 text-sky-700">
              <CalendarDays size={14} />
              <span>{formatNumber(branch?.bookingCount || 0)}</span>
              <span className="text-slate-500">lượt đặt</span>
            </div>

            <div className="inline-flex items-center gap-1.5 rounded-full bg-emerald-50 px-3 py-1.5 text-emerald-700">
              <ShoppingBag size={14} />
              <span>{formatNumber(branch?.orderCount || 0)}</span>
              <span className="text-slate-500">đơn hàng</span>
            </div>
          </div>
        )}

        {!loading && (
          <button
            type="button"
            onClick={(event) => {
              event.stopPropagation();
              onClick?.();
            }}
            className={actionBtnClass}
          >
            Xem chi tiết
            <ArrowRight
              size={16}
              className="transition-transform group-hover:translate-x-1"
            />
          </button>
        )}
      </div>
    </article>
  );
};

const HomePage = () => {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();

  const homeData =
    useAppSelector((state) => state.home.homeData) ?? emptyHomeData;

  const isHomeLoading = useAppSelector(
    (state) => state.ui.loadingMap["home/getHomeData"],
  );

  const loading = Boolean(isHomeLoading);

  const [activeBanner, setActiveBanner] = useState(0);
  const [activeNewGroup, setActiveNewGroup] = useState("");
  const [activeDiscountType, setActiveDiscountType] = useState<
    "ORDER" | "BOOKING" | "ALL"
  >("ORDER");

  useEffect(() => {
    dispatch(getHomeData());
  }, [dispatch]);

  const banners = homeData.banners.length
    ? homeData.banners
    : [
        {
          id: 1,
          title: "Chào mừng bạn đến với B-Hub",
          subtitle:
            "Đặt sân, mua sắm và lên lịch luyện tập cầu lông trong một trải nghiệm liền mạch.",
          imageUrl: "/img/banner4.webp",
          primaryAction: { label: "Đặt sân ngay", href: "/branches" },
          secondaryAction: { label: "Xem shop", href: "/products" },
        },
      ];

  const currentBanner = banners[activeBanner] || banners[0];

  useEffect(() => {
    const timer = window.setInterval(() => {
      setActiveBanner((current) => (current + 1) % banners.length);
    }, 5200);

    return () => window.clearInterval(timer);
  }, [banners.length]);

  useEffect(() => {
    if (!activeNewGroup && homeData.newProductsByGroup.length > 0) {
      const firstGroupHasProducts =
        homeData.newProductsByGroup.find(
          (group) => group.products.length > 0,
        ) || homeData.newProductsByGroup[0];

      setActiveNewGroup(firstGroupHasProducts.menuGroup);
    }
  }, [activeNewGroup, homeData.newProductsByGroup]);

  const activeNewProducts =
    homeData.newProductsByGroup.find(
      (group) => group.menuGroup === activeNewGroup,
    )?.products || [];

  const activeDiscounts =
    homeData.discountsByApplyType?.[activeDiscountType] || [];

  const sectionClass =
    "home-reveal mx-auto max-w-[1280px] px-4 py-7 sm:px-6 lg:py-9";
  const softSectionClass =
    "home-reveal bg-gradient-to-b from-slate-50 to-sky-50/70 py-7 lg:py-9";
  const titleBadgeClass =
    "inline-flex items-center gap-2 rounded-full border border-sky-100 bg-white px-4 py-2 text-sm font-semibold text-sky-700 shadow-sm";
  const viewMoreBtnClass =
    "group inline-flex w-fit items-center gap-2 rounded-full border border-slate-200 bg-white px-5 py-2.5 text-sm font-semibold text-slate-700 shadow-sm transition-all duration-300 hover:-translate-y-0.5 hover:border-sky-300 hover:bg-sky-50 hover:text-sky-700 hover:shadow-md";

  const goToProductDetail = (product: HomeProduct) => {
    navigate(
      `/product/${product.id}?cateId=${
        product.category?.id || ""
      }&cateName=${encodeURIComponent(
        product.category?.cateName || "",
      )}&groupName=${encodeURIComponent(product.category?.menuGroup || "")}`,
    );
  };

  const goToProductGroup = (groupName: string) => {
    navigate(`/products?groupName=${encodeURIComponent(groupName)}`);
  };

  const renderSectionHeader = ({
    icon,
    badge,
    title,
    desc,
    buttonText,
    onClick,
  }: {
    icon: ReactNode;
    badge: string;
    title: string;
    desc: string;
    buttonText?: string;
    onClick?: () => void;
  }) => (
    <div className="mb-5 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
      <div>
        <div className={titleBadgeClass}>
          {icon}
          {badge}
        </div>

        <h2 className="mt-3 text-2xl font-bold leading-tight text-slate-950 sm:text-3xl">
          {title}
        </h2>

        <p className="mt-1.5 max-w-xl text-sm leading-relaxed text-slate-500">
          {desc}
        </p>
      </div>

      {buttonText && onClick && (
        <button type="button" onClick={onClick} className={viewMoreBtnClass}>
          {buttonText}
          <ArrowRight
            size={17}
            className="transition-transform group-hover:translate-x-1"
          />
        </button>
      )}
    </div>
  );

  return (
    <div className="bg-slate-50 font-sans text-slate-900">
      {/* BANNER */}
      <section className="relative overflow-hidden bg-slate-950 text-white">
        <div className="absolute inset-0">
          {banners.map((banner, index) => (
            <img
              key={banner.id}
              src={banner.imageUrl}
              alt={banner.title}
              loading={index === 0 ? "eager" : "lazy"}
              className={`absolute inset-0 h-full w-full object-cover transition-opacity duration-700 ${
                index === activeBanner ? "opacity-70" : "opacity-0"
              }`}
            />
          ))}

          <div className="absolute inset-0 bg-gradient-to-r from-slate-950 via-slate-950/85 to-slate-900/10" />
        </div>

        <div className="relative mx-auto grid min-h-[540px] max-w-[1280px] items-center gap-8 px-4 py-10 sm:px-6 lg:grid-cols-[1.35fr_0.85fr] lg:py-12">
          <div className="home-hero-copy max-w-3xl">
            <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/10 px-4 py-2 text-sm font-medium text-sky-100 backdrop-blur-sm">
              <Sparkles size={16} />
              Trang chủ B-Hub - Đam mê cầu lông bắt đầu ở đây
            </div>

            <h1 className="text-3xl font-bold leading-tight tracking-tight text-white sm:text-4xl md:text-5xl">
              {currentBanner.title}
            </h1>

            <p className="mt-5 max-w-2xl text-base leading-relaxed text-slate-200 sm:text-lg">
              {currentBanner.subtitle}
            </p>

            <div className="mt-8 flex flex-col gap-4 sm:flex-row">
              <button
                type="button"
                onClick={() => navigate(currentBanner.primaryAction.href)}
                className="group inline-flex items-center justify-center gap-2 rounded-full bg-sky-500 px-7 py-4 text-sm font-semibold text-white shadow-2xl shadow-sky-950/30 transition hover:bg-sky-400 active:scale-[0.98]"
              >
                {currentBanner.primaryAction.label}
                <ArrowRight
                  size={18}
                  className="transition-transform group-hover:translate-x-1"
                />
              </button>

              <button
                type="button"
                onClick={() => navigate(currentBanner.secondaryAction.href)}
                className="group inline-flex items-center justify-center gap-2 rounded-full border border-white/20 bg-white/10 px-7 py-4 text-sm font-semibold text-white transition hover:bg-white/20 active:scale-[0.98]"
              >
                {currentBanner.secondaryAction.label}
                <ArrowRight
                  size={18}
                  className="transition-transform group-hover:translate-x-1"
                />
              </button>
            </div>

            <div className="mt-8 grid gap-4 sm:grid-cols-2">
              {[
                {
                  title: "Đặt sân nhanh",
                  desc: "Chọn sân và giờ chơi chỉ trong vài thao tác.",
                  icon: CalendarDays,
                },
                {
                  title: "Sản phẩm chính hãng",
                  desc: "Vợt, giày và phụ kiện cầu lông chất lượng.",
                  icon: PackageSearch,
                },
                {
                  title: "Giao dịch minh bạch",
                  desc: "Giá hiển thị rõ ràng, điều kiện ưu đãi dễ hiểu.",
                  icon: ShoppingBag,
                },
                {
                  title: "Hỗ trợ xuyên suốt",
                  desc: "Tư vấn và chăm sóc khách hàng 24/7.",
                  icon: Clock,
                },
              ].map((item) => (
                <div
                  key={item.title}
                  className="group rounded-3xl border border-white/10 bg-white/5 p-5 shadow-xl shadow-slate-950/10 backdrop-blur transition-all duration-300 hover:-translate-y-1 hover:bg-white/10"
                >
                  <div className="mb-4 inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-sky-500/15 text-sky-200 transition-all duration-300 group-hover:rotate-6 group-hover:scale-110 group-hover:bg-sky-500/25">
                    <item.icon size={22} />
                  </div>

                  <h3 className="text-lg font-semibold text-white">
                    {item.title}
                  </h3>

                  <p className="mt-2 text-sm leading-relaxed text-slate-300">
                    {item.desc}
                  </p>
                </div>
              ))}
            </div>
          </div>

          <div className="home-float rounded-[2rem] border border-white/10 bg-white/5 p-6 shadow-2xl shadow-slate-950/20 backdrop-blur">
            <p className="text-sm font-semibold uppercase text-sky-300">
              Dữ liệu nổi bật
            </p>

            <h2 className="mt-4 text-3xl font-semibold text-white">
              B-Hub trong hôm nay
            </h2>

            <div className="mt-8 grid gap-4">
              {[
                {
                  title: `${formatNumber(homeData.stats.bookingCount)} lượt đặt sân`,
                  detail: "Các lịch đặt sân đã thanh toán hoặc hoàn tất.",
                  tag: "Đặt sân",
                },
                {
                  title: `${formatNumber(homeData.stats.soldCount)} sản phẩm đã bán`,
                  detail: "Thống kê từ các đơn hàng đã hoàn thành.",
                  tag: "Mua sắm",
                },
                {
                  title: `${formatNumber(homeData.stats.reviewCount)} đánh giá`,
                  detail: "Phản hồi thực tế từ khách hàng.",
                  tag: "Đánh giá",
                },
              ].map((item) => (
                <div
                  key={item.title}
                  className="rounded-3xl border border-slate-800/80 bg-slate-900/80 p-5 transition-all duration-300 hover:-translate-y-1 hover:border-sky-400/40 hover:bg-slate-900"
                >
                  <span className="inline-flex rounded-full bg-sky-500/15 px-3 py-1 text-xs font-medium uppercase tracking-[0.2em] text-sky-200">
                    {item.tag}
                  </span>

                  <h3 className="mt-4 text-xl font-semibold text-white">
                    {item.title}
                  </h3>

                  <p className="mt-2 text-sm leading-relaxed text-slate-300">
                    {item.detail}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="absolute inset-x-0 bottom-6 flex justify-center gap-2">
          {banners.map((banner, index) => (
            <button
              key={banner.id}
              type="button"
              onClick={() => setActiveBanner(index)}
              className={`h-2 rounded-full transition-all ${
                activeBanner === index ? "w-10 bg-sky-400" : "w-2 bg-white/50"
              }`}
              aria-label={`Banner ${index + 1}`}
            />
          ))}
        </div>
      </section>

      {/* STATS */}
      <section className={sectionClass}>
        <div className="relative overflow-hidden rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm sm:p-8">
          <div className="absolute inset-0 bg-[linear-gradient(135deg,rgba(14,165,233,0.08)_0%,transparent_38%,rgba(226,232,240,0.45)_100%)]" />

          <div className="relative mb-5 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <div className={titleBadgeClass}>
                <Sparkles size={15} />
                Tổng quan B-Hub
              </div>

              <h2 className="mt-4 text-2xl font-bold leading-tight text-slate-950 sm:text-3xl">
                Đầy đủ sân chơi, sản phẩm và dịch vụ cầu lông
              </h2>
            </div>

            <p className="max-w-md text-sm leading-relaxed text-slate-500">
              Dữ liệu được tổng hợp từ chi nhánh, sản phẩm, đơn hàng, đặt sân và
              đánh giá khách hàng.
            </p>
          </div>

          <div className="relative grid gap-5 sm:grid-cols-2 xl:grid-cols-4">
            {[
              {
                label: "Chi nhánh",
                desc: "Sẵn sàng phục vụ",
                value: homeData.stats.branchCount,
                icon: MapPin,
              },
              {
                label: "Sản phẩm",
                desc: "Dụng cụ cầu lông",
                value: homeData.stats.productCount,
                icon: PackageSearch,
              },
              {
                label: "Lượt đặt sân",
                desc: "Đã thanh toán / hoàn tất",
                value: homeData.stats.bookingCount,
                icon: CalendarDays,
              },
              {
                label: "Đã bán",
                desc: "Sản phẩm hoàn thành",
                value: homeData.stats.soldCount,
                icon: Trophy,
              },
            ].map((stat) => (
              <div
                key={stat.label}
                className="group rounded-[1.5rem] border border-slate-200 bg-slate-50/80 p-5 transition-all duration-300 hover:-translate-y-1 hover:border-sky-300 hover:bg-white hover:shadow-lg hover:shadow-sky-100"
              >
                <div className="mb-5 flex h-12 w-12 items-center justify-center rounded-2xl bg-white text-sky-600 shadow-sm transition-all duration-300 group-hover:rotate-6 group-hover:scale-110 group-hover:bg-sky-600 group-hover:text-white">
                  <stat.icon size={22} />
                </div>

                <p className="text-3xl font-bold tracking-tight text-slate-950">
                  {formatNumber(stat.value)}
                </p>

                <p className="mt-2 text-sm font-semibold text-slate-800">
                  {stat.label}
                </p>

                <p className="mt-1 text-sm text-slate-500">{stat.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* BADMINTON CATEGORIES IMAGE */}
      <section className={softSectionClass}>
        <div className="mx-auto max-w-[1280px] px-4 sm:px-6">
          {renderSectionHeader({
            icon: <PackageSearch size={15} />,
            badge: "Danh mục cầu lông",
            title: "Chọn nhanh nhóm sản phẩm yêu thích",
            desc: "Các nhóm sản phẩm được trình bày bằng hình ảnh trực quan, dễ chọn và dễ mua.",
            buttonText: "Xem tất cả sản phẩm",
            onClick: () => navigate("/products"),
          })}

          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {(loading
              ? Array.from({ length: 8 })
              : homeData.badmintonCategories
            ).map((category: any, index) => (
              <button
                key={loading ? index : category.id}
                type="button"
                onClick={() => !loading && goToProductGroup(category.groupName)}
                className="group relative h-52 overflow-hidden rounded-[1.75rem] border border-white bg-slate-200 text-left shadow-sm transition-all duration-300 hover:-translate-y-1.5 hover:shadow-xl hover:shadow-sky-100"
              >
                {loading ? (
                  <div className="h-full w-full animate-pulse bg-slate-200" />
                ) : (
                  <>
                    <img
                      src={category.imageUrl}
                      alt={category.title}
                      className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-110"
                    />

                    <div className="absolute inset-0 bg-gradient-to-t from-slate-950/70 via-slate-950/20 to-white/10" />

                    <div className="absolute inset-x-4 bottom-4">
                      <div className="inline-flex items-center gap-2 rounded-2xl bg-white/95 px-4 py-2 text-sm font-semibold text-sky-700 shadow-sm transition group-hover:bg-sky-600 group-hover:text-white">
                        {category.title}
                        <ArrowRight
                          size={16}
                          className="transition-transform group-hover:translate-x-1"
                        />
                      </div>
                    </div>
                  </>
                )}
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* NEW PRODUCTS BY GROUP */}
      <section className={sectionClass}>
        {renderSectionHeader({
          icon: <Sparkles size={15} />,
          badge: "Sản phẩm mới",
          title: "Vừa về kho theo từng nhóm sản phẩm",
          desc: "Chọn nhóm để xem các sản phẩm mới được cập nhật gần đây tại B-Hub.",
          buttonText: activeNewGroup
            ? `Xem nhóm ${activeNewGroup}`
            : "Xem sản phẩm",
          onClick: () =>
            activeNewGroup
              ? goToProductGroup(activeNewGroup)
              : navigate("/products"),
        })}

        <div className="rounded-[2rem] border border-slate-200 bg-white p-5 shadow-sm">
          <div
            className="
    mb-6 overflow-x-auto pb-0.5
    [&::-webkit-scrollbar]:h-1
    [&::-webkit-scrollbar-track]:rounded-full
    [&::-webkit-scrollbar-track]:bg-transparent
    [&::-webkit-scrollbar-thumb]:rounded-full
    [&::-webkit-scrollbar-thumb]:bg-slate-300/70
    hover:[&::-webkit-scrollbar-thumb]:bg-sky-400
  "
          >
            <div className="flex min-w-max gap-3">
              {homeData.newProductsByGroup.map((group) => (
                <button
                  key={group.menuGroup}
                  type="button"
                  onClick={() => setActiveNewGroup(group.menuGroup)}
                  className={`rounded-full px-5 py-2.5 text-sm font-semibold transition-all duration-300 ${
                    activeNewGroup === group.menuGroup
                      ? "bg-sky-600 text-white shadow-lg shadow-sky-100"
                      : "bg-sky-50 text-sky-700 hover:bg-sky-100"
                  }`}
                >
                  {group.menuGroup}
                  <span
                    className={`ml-2 rounded-full px-2 py-0.5 text-xs ${
                      activeNewGroup === group.menuGroup
                        ? "bg-white/25 text-white"
                        : "bg-white/70 text-sky-700"
                    }`}
                  >
                    {group.products.length}
                  </span>
                </button>
              ))}
            </div>
          </div>

          {loading ? (
            <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-4">
              {Array.from({ length: 4 }).map((_, index) => (
                <ProductCard key={index} loading />
              ))}
            </div>
          ) : activeNewProducts.length > 0 ? (
            <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-4">
              {activeNewProducts.map((product) => (
                <ProductCard
                  key={product.id}
                  product={product}
                  badge={
                    <>
                      <Sparkles size={12} />
                      NEW
                    </>
                  }
                  badgeClassName="bg-emerald-500"
                  onClick={() => goToProductDetail(product)}
                />
              ))}
            </div>
          ) : (
            <div className="flex min-h-[220px] flex-col items-center justify-center rounded-[1.5rem] border border-dashed border-slate-200 bg-slate-50 text-center">
              <Boxes size={42} className="text-slate-300" />
              <p className="mt-3 text-sm font-medium text-slate-500">
                Nhóm này chưa có sản phẩm mới.
              </p>
            </div>
          )}
        </div>
      </section>

      {/* HOT PRODUCTS */}
      <section className={softSectionClass}>
        <div className="mx-auto max-w-[1280px] px-4 sm:px-6">
          {renderSectionHeader({
            icon: <Flame size={15} />,
            badge: "Bán chạy",
            title: "Sản phẩm được mua nhiều",
            desc: "Xếp hạng dựa trên số lượng sản phẩm trong các đơn hàng đã hoàn thành.",
            buttonText: "Xem tất cả sản phẩm",
            onClick: () => navigate("/products"),
          })}

          <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-4">
            {(loading ? Array.from({ length: 4 }) : homeData.hotProducts).map(
              (product: any, index) => (
                <ProductCard
                  key={loading ? index : product.id}
                  loading={loading}
                  product={product}
                  badge={
                    <>
                      <Flame size={12} />
                      HOT
                    </>
                  }
                  badgeClassName="bg-amber-500"
                  onClick={() => !loading && goToProductDetail(product)}
                />
              ),
            )}
          </div>
        </div>
      </section>

      {/* TOP RATED PRODUCTS */}
      {homeData.topRatedProducts.length > 0 && (
        <section className={sectionClass}>
          {renderSectionHeader({
            icon: <Star size={15} className="fill-sky-600" />,
            badge: "Đánh giá cao",
            title: "Sản phẩm được khách hàng yêu thích",
            desc: "Các sản phẩm có điểm đánh giá trung bình tốt và nhiều phản hồi tích cực.",
            buttonText: "Xem thêm",
            onClick: () => navigate("/products"),
          })}

          <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-4">
            {homeData.topRatedProducts.map((product) => (
              <ProductCard
                key={product.id}
                product={product}
                badge={
                  <>
                    <Star size={12} className="fill-white" />
                    {product.avgRating}
                  </>
                }
                badgeClassName="bg-amber-500"
                onClick={() => goToProductDetail(product)}
              />
            ))}
          </div>
        </section>
      )}

      {/* DISCOUNTS */}
      <section className={sectionClass}>
        {renderSectionHeader({
          icon: <TicketPercent size={15} />,
          badge: "Ưu đãi nổi bật",
          title: "Mã giảm giá dành cho bạn",
          desc: "Mã được chia theo mua hàng, đặt sân hoặc áp dụng cho tất cả dịch vụ.",
          buttonText: "Mua sắm ngay",
          onClick: () => navigate("/products"),
        })}

        <div className="mb-6 flex flex-wrap gap-3">
          {[
            { key: "ORDER", label: "Mua hàng" },
            { key: "BOOKING", label: "Đặt sân" },
            { key: "ALL", label: "Tất cả" },
          ].map((tab) => (
            <button
              key={tab.key}
              type="button"
              onClick={() => setActiveDiscountType(tab.key as any)}
              className={`rounded-full px-5 py-2.5 text-sm font-semibold transition-all duration-300 ${
                activeDiscountType === tab.key
                  ? "bg-sky-600 text-white shadow-lg shadow-sky-100"
                  : "bg-white text-sky-700 shadow-sm hover:bg-sky-50"
              }`}
            >
              {tab.label}
              <span className="ml-2 rounded-full bg-white/25 px-2 py-0.5 text-xs">
                {homeData.discountsByApplyType?.[tab.key]?.length || 0}
              </span>
            </button>
          ))}
        </div>

        {activeDiscounts.length > 0 ? (
          <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-4">
            {activeDiscounts.slice(0, 4).map((discount) => (
              <article
                key={discount.id}
                className="group relative overflow-hidden rounded-[1.75rem] border border-slate-200 bg-white p-5 shadow-sm transition-all duration-300 hover:-translate-y-1.5 hover:border-sky-300 hover:shadow-xl hover:shadow-sky-100"
              >
                <div className="absolute -right-8 -top-8 h-28 w-28 rounded-full bg-sky-50 transition-all duration-300 group-hover:scale-125 group-hover:bg-sky-100" />

                <div className="relative">
                  <div className="mb-5 flex items-start justify-between gap-3">
                    <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-sky-50 text-sky-700 transition-all duration-300 group-hover:rotate-6 group-hover:scale-110 group-hover:bg-sky-600 group-hover:text-white">
                      <TicketPercent size={22} />
                    </div>

                    <span className="rounded-full border border-sky-100 bg-sky-50 px-3 py-1 text-xs font-medium text-sky-700">
                      {getDiscountApplyLabel(discount.applyType)}
                    </span>
                  </div>

                  <p className="text-xs font-medium uppercase tracking-wide text-slate-400">
                    Mã giảm giá
                  </p>

                  <h3 className="mt-2 text-2xl font-bold tracking-tight text-slate-950">
                    {discount.code}
                  </h3>

                  <div className="mt-4 rounded-2xl border border-dashed border-sky-200 bg-sky-50/70 px-4 py-3 transition group-hover:bg-sky-50">
                    <p className="text-sm font-medium text-slate-600">Giảm</p>
                    <p className="mt-1 text-xl font-semibold text-sky-700">
                      {getDiscountValue(discount)}
                    </p>
                  </div>

                  <p className="mt-4 text-sm leading-relaxed text-slate-600">
                    Áp dụng cho đơn từ{" "}
                    <span className="font-semibold text-slate-900">
                      {discount.minAmount.toLocaleString("vi-VN")}d
                    </span>
                    .
                  </p>

                  <div className="mt-5 border-t border-slate-100 pt-4">
                    <p className="text-xs font-medium text-slate-500">
                      Hạn sử dụng:{" "}
                      <span className="font-semibold text-slate-700">
                        {formatDate(discount.endDate)}
                      </span>
                    </p>
                  </div>
                </div>
              </article>
            ))}
          </div>
        ) : (
          <div className="rounded-[1.5rem] border border-dashed border-slate-200 bg-white py-14 text-center text-sm font-medium text-slate-500">
            Chưa có mã giảm giá cho nhóm này.
          </div>
        )}
      </section>

      {/* BEST BOOKED BRANCHES */}
      <section className={softSectionClass}>
        <div className="mx-auto max-w-[1280px] px-4 sm:px-6">
          {renderSectionHeader({
            icon: <MapPin size={15} />,
            badge: "Đặt sân",
            title: "Chi nhánh được đặt sân nhiều",
            desc: "Gợi ý các chi nhánh có nhiều lượt đặt sân đã thanh toán hoặc hoàn tất.",
            buttonText: "Xem chi nhánh",
            onClick: () => navigate("/branches"),
          })}

          <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
            {(loading
              ? Array.from({ length: 3 })
              : homeData.mostBookedBranches.length
                ? homeData.mostBookedBranches.slice(0, 3)
                : homeData.hotBranches.slice(0, 3)
            ).map((branch: any, index) => (
              <BranchCard
                key={loading ? index : branch.id}
                loading={loading}
                branch={branch}
                badge="Đặt sân nhiều"
                onClick={() => !loading && navigate(`/branches/${branch.id}`)}
              />
            ))}
          </div>
        </div>
      </section>

      {/* HOT BRANCHES */}
      <section className={sectionClass}>
        {renderSectionHeader({
          icon: <ThumbsUp size={15} />,
          badge: "Chi nhánh nổi bật",
          title: "Chi nhánh được đánh giá tốt",
          desc: "Tổng hợp theo điểm đánh giá trung bình và số lượng phản hồi của khách hàng.",
          buttonText: "Xem chi nhánh",
          onClick: () => navigate("/branches"),
        })}

        <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
          {(loading
            ? Array.from({ length: 3 })
            : homeData.hotBranches.length
              ? homeData.hotBranches.slice(0, 3)
              : homeData.branches.slice(0, 3)
          ).map((branch: any, index) => (
            <BranchCard
              key={loading ? index : branch.id}
              loading={loading}
              branch={branch}
              badge="Đánh giá tốt"
              onClick={() => !loading && navigate(`/branches/${branch.id}`)}
            />
          ))}
        </div>
      </section>

      {/* CUSTOMER REVIEWS */}
      {homeData.customerReviews.length > 0 && (
        <section className={softSectionClass}>
          <div className="mx-auto max-w-[1280px] px-4 sm:px-6">
            {renderSectionHeader({
              icon: <MessageCircle size={15} />,
              badge: "Khách hàng nói gì",
              title: "Trải nghiệm thực tế tại B-Hub",
              desc: "Các phản hồi tích cực từ khách hàng về sản phẩm và chi nhánh.",
            })}

            <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
              {homeData.customerReviews.slice(0, 6).map((review) => (
                <article
                  key={review.id}
                  className="group rounded-[1.75rem] border border-slate-200 bg-white p-5 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:border-sky-300 hover:shadow-xl hover:shadow-sky-100"
                >
                  <div className="mb-4 flex items-center justify-between gap-3">
                    <div className="flex items-center gap-3">
                      <div className="flex h-11 w-11 items-center justify-center overflow-hidden rounded-full bg-sky-50 text-sm font-semibold text-sky-700">
                        {review.user.avatar ? (
                          <img
                            src={review.user.avatar}
                            alt={review.user.fullName}
                            className="h-full w-full object-cover"
                          />
                        ) : (
                          review.user.fullName.charAt(0).toUpperCase()
                        )}
                      </div>

                      <div>
                        <p className="line-clamp-1 text-sm font-semibold text-slate-900">
                          {review.user.fullName}
                        </p>
                        <p className="text-xs font-medium text-slate-400">
                          {formatDate(review.createdAt)}
                        </p>
                      </div>
                    </div>

                    <span className="rounded-full bg-amber-50 px-3 py-1 text-xs font-medium text-amber-600">
                      ★ {review.rating}
                    </span>
                  </div>

                  <p className="line-clamp-4 text-sm leading-relaxed text-slate-600">
                    &ldquo;{review.content}&rdquo;
                  </p>

                  <div className="mt-5 rounded-2xl bg-slate-50 px-4 py-3 text-xs font-medium text-slate-500">
                    {review.targetType === "BRANCH" && review.branch
                      ? `Chi nhánh: ${review.branch.branchName}`
                      : review.product
                        ? `Sản phẩm: ${review.product.productName}`
                        : "B-Hub"}
                  </div>
                </article>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* CTA */}
      <section className={sectionClass}>
        <div className="relative overflow-hidden rounded-[2rem] border border-slate-200 bg-white p-8 shadow-sm sm:p-10 lg:p-12">
          <div className="absolute inset-0 bg-[linear-gradient(135deg,rgba(14,165,233,0.08)_0%,transparent_42%,rgba(224,242,254,0.65)_100%)]" />

          <div className="relative mx-auto max-w-3xl text-center">
            <div className={titleBadgeClass}>
              <HeartHandshake size={15} />
              Bắt đầu ngay
            </div>

            <h2 className="mt-5 text-3xl font-bold leading-tight text-slate-950 sm:text-4xl">
              Sẵn sàng cho buổi chơi cầu lông tiếp theo?
            </h2>

            <p className="mx-auto mt-4 max-w-2xl text-sm leading-relaxed text-slate-600 sm:text-base">
              Đặt sân nhanh, mua sắm phụ kiện chính hãng và quản lý trải nghiệm
              cầu lông trong cùng một nền tảng B-Hub.
            </p>

            <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
              <button
                type="button"
                onClick={() => navigate("/courts")}
                className="group inline-flex w-full items-center justify-center gap-2 rounded-full bg-sky-600 px-7 py-3.5 text-sm font-semibold text-white shadow-lg shadow-sky-100 transition-all duration-300 hover:-translate-y-0.5 hover:bg-sky-700 hover:shadow-xl active:scale-[0.98] sm:w-auto"
              >
                Đặt sân ngay
                <ArrowRight
                  size={18}
                  className="transition-transform group-hover:translate-x-1"
                />
              </button>

              <button
                type="button"
                onClick={() => navigate("/products")}
                className="group inline-flex w-full items-center justify-center gap-2 rounded-full border border-slate-200 bg-white px-7 py-3.5 text-sm font-semibold text-slate-700 shadow-sm transition-all duration-300 hover:-translate-y-0.5 hover:border-sky-200 hover:bg-sky-50 hover:text-sky-700 hover:shadow-md active:scale-[0.98] sm:w-auto"
              >
                Mua sắm ngay
                <ArrowRight
                  size={18}
                  className="transition-transform group-hover:translate-x-1"
                />
              </button>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default HomePage;
