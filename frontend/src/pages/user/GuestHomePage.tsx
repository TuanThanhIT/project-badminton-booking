import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  ArrowRight,
  CalendarCheck2,
  MapPin,
  PackageSearch,
  Search,
  ShieldCheck,
  ShoppingBag,
  Sparkles,
  TicketPercent,
} from "lucide-react";
import homeService from "../../services/user/homeService";
import type { HomeData } from "../../types/home";

const fallbackHomeData: HomeData = {
  banners: [
    {
      id: 1,
      title: "Đặt sân và mua sắm cầu lông tại B-Hub",
      subtitle:
        "Tìm chỉ nhanh gần bạn, đặt lịch sân nhanh và khám phá dụng cụ cầu lông chính hãng.",
      imageUrl: "/img/banner.webp",
      primaryAction: { label: "Đặt sân ngay", href: "/login" },
      secondaryAction: { label: "Xem sản phẩm", href: "/login" },
    },
    {
      id: 2,
      title: "Sẵn sàng cho trận cầu tiếp theo",
      subtitle:
        "Lịch sân rõ ràng, sản phẩm dễ tìm, trải nghiệm gọn từ lần đầu truy cập.",
      imageUrl: "/img/banner2.webp",
      primaryAction: { label: "Đăng nhập", href: "/login" },
      secondaryAction: { label: "Đăng ký", href: "/register" },
    },
  ],
  badmintonCategories: [],
  categoryGroups: [],
  bestSellingCategories: [],
  branches: [],
  hotBranches: [],
  mostBookedBranches: [],
  topSellingBranches: [],
  products: [],
  hotProducts: [],
  topRatedProducts: [],
  lowStockProducts: [],
  newProducts: [],
  newProductsByGroup: [],
  discounts: [],
  discountsByApplyType: {
    ORDER: [],
    BOOKING: [],
    ALL: [],
  },
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

const GuestHomePage = () => {
  const navigate = useNavigate();
  const [homeData, setHomeData] = useState<HomeData>(fallbackHomeData);
  const [activeBanner, setActiveBanner] = useState(0);

  useEffect(() => {
    homeService
      .getHomeDataService()
      .then((res) => setHomeData(res.data.data))
      .catch(() => setHomeData(fallbackHomeData));
  }, []);

  const banners = homeData.banners.length
    ? homeData.banners
    : fallbackHomeData.banners;
  const currentBanner = banners[activeBanner] || banners[0];

  useEffect(() => {
    const timer = window.setInterval(() => {
      setActiveBanner((current) => (current + 1) % banners.length);
    }, 5200);

    return () => window.clearInterval(timer);
  }, [banners.length]);

  const featuredCategories = useMemo(
    () => homeData.categoryGroups.slice(0, 5),
    [homeData.categoryGroups],
  );

  return (
    <div className="font-sans bg-slate-50 text-slate-900">
      <section className="relative overflow-hidden bg-slate-950">
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
          <div className="absolute inset-0 bg-gradient-to-r from-slate-950 via-slate-950/80 to-slate-900/20" />
        </div>

        <div className="relative mx-auto grid min-h-[620px] max-w-[1280px] items-center gap-10 px-4 py-16 sm:px-6 lg:grid-cols-[minmax(0,1fr)_380px]">
          <div className="max-w-3xl">
            <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-sky-300/30 bg-sky-400/10 px-4 py-2 text-sm font-semibold text-sky-100 backdrop-blur">
              <Sparkles size={16} />
              Sân cầu lông, shop và cộng đồng trong một nơi
            </div>

            <h1 className="text-4xl font-bold leading-tight text-white sm:text-6xl">
              {currentBanner.title}
            </h1>
            <p className="mt-5 max-w-2xl text-base leading-relaxed text-slate-200 sm:text-lg">
              {currentBanner.subtitle}
            </p>

            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <button
                type="button"
                onClick={() => navigate("/login")}
                className="inline-flex items-center justify-center gap-2 rounded-2xl bg-sky-500 px-6 py-3.5 text-sm font-semibold text-white shadow-lg shadow-sky-950/30 transition hover:bg-sky-400"
              >
                Bắt đầu khám phá
                <ArrowRight size={18} />
              </button>
              <button
                type="button"
                onClick={() => navigate("/register")}
                className="inline-flex items-center justify-center gap-2 rounded-2xl border border-white/25 bg-white/10 px-6 py-3.5 text-sm font-semibold text-white backdrop-blur transition hover:bg-white/15"
              >
                Tạo tài khoản miễn phí
              </button>
            </div>

            <div className="mt-8 flex flex-wrap gap-3">
              {["Đặt sân online", "Sản phẩm chính hãng", "Thanh toán gọn"].map(
                (item) => (
                  <span
                    key={item}
                    className="rounded-full border border-white/15 bg-white/10 px-4 py-2 text-sm font-medium text-slate-100 backdrop-blur"
                  >
                    {item}
                  </span>
                ),
              )}
            </div>
          </div>

          <div className="rounded-[2rem] border border-white/10 bg-white/95 p-5 shadow-2xl shadow-slate-950/30">
            <p className="text-sm font-semibold uppercase tracking-wide text-sky-700">
              Tìm nhanh
            </p>
            <h2 className="mt-2 text-2xl font-semibold text-slate-950">
              Bạn muốn làm gì hôm nay?
            </h2>

            <div className="mt-5 space-y-3">
              {[
                {
                  icon: CalendarCheck2,
                  title: "Đặt sân cầu lông",
                  desc: "Xem chỉ nhanh và chọn khung giờ phù hợp.",
                  href: "/login",
                },
                {
                  icon: ShoppingBag,
                  title: "Mua dụng cụ",
                  desc: "Khám phá vợt, giày, áo quần và phụ kiện.",
                  href: "/login",
                },
                {
                  icon: Search,
                  title: "Tìm danh mục",
                  desc: "Lọc sản phẩm theo nhóm bạn quan tâm.",
                  href: "/login",
                },
              ].map((item) => (
                <button
                  key={item.title}
                  type="button"
                  onClick={() => navigate(item.href)}
                  className="flex w-full items-center gap-4 rounded-2xl border border-slate-200 bg-slate-50 p-4 text-left transition hover:border-sky-200 hover:bg-sky-50"
                >
                  <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-sky-100 text-sky-700">
                    <item.icon size={21} />
                  </span>
                  <span>
                    <span className="block font-semibold text-slate-950">
                      {item.title}
                    </span>
                    <span className="mt-1 block text-sm leading-relaxed text-slate-600">
                      {item.desc}
                    </span>
                  </span>
                </button>
              ))}
            </div>
          </div>

          <div className="absolute bottom-5 left-1/2 flex -translate-x-1/2 gap-2">
            {banners.map((banner, index) => (
              <button
                key={banner.id}
                type="button"
                onClick={() => setActiveBanner(index)}
                className={`h-2 rounded-full transition-all ${
                  activeBanner === index ? "w-8 bg-sky-400" : "w-2 bg-white/50"
                }`}
                aria-label={`Banner ${index + 1}`}
              />
            ))}
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-[1280px] px-4 py-12 sm:px-6">
        <div className="grid gap-4 sm:grid-cols-3">
          {[
            {
              label: "Chi nhánh đang hoạt động",
              value: homeData.stats.branchCount,
              icon: MapPin,
            },
            {
              label: "Sản phẩm trong shop",
              value: homeData.stats.productCount,
              icon: PackageSearch,
            },
            {
              label: "Nhóm danh mục",
              value: homeData.stats.categoryGroupCount,
              icon: ShieldCheck,
            },
          ].map((stat) => (
            <div
              key={stat.label}
              className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm"
            >
              <div className="flex items-center justify-between gap-4">
                <div>
                  <p className="text-3xl font-semibold text-slate-950">
                    {stat.value}+
                  </p>
                  <p className="mt-1 text-sm font-medium text-slate-500">
                    {stat.label}
                  </p>
                </div>
                <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-sky-50 text-sky-600">
                  <stat.icon size={22} />
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      <section className="mx-auto max-w-[1280px] px-4 py-14 sm:px-6">
        <div className="mb-8 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.3em] text-sky-700">
              Ưu đãi nổi bật
            </p>
            <h2 className="mt-2 text-3xl font-semibold text-slate-950">
              Mã giảm giá đang hoạt động
            </h2>
          </div>
          <button
            type="button"
            onClick={() => navigate("/login")}
            className="inline-flex items-center gap-2 text-sm font-semibold text-sky-700 transition hover:text-sky-800"
          >
            Đăng nhập để nhận ưu đãi
            <ArrowRight size={18} />
          </button>
        </div>

        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          {(homeData.discounts.length === 0
            ? Array.from({ length: 4 })
            : homeData.discounts
          ).map((discount: any, index) => (
            <div
              key={discount?.code || index}
              className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm"
            >
              {homeData.discounts.length === 0 ? (
                <div className="space-y-4">
                  <div className="h-10 w-32 animate-pulse rounded-xl bg-slate-200" />
                  <div className="h-6 w-24 animate-pulse rounded-lg bg-slate-200" />
                  <div className="h-5 w-full animate-pulse rounded-lg bg-slate-200" />
                </div>
              ) : (
                <>
                  <div className="mb-4 inline-flex h-12 w-12 items-center justify-center rounded-3xl bg-sky-100 text-sky-700">
                    <TicketPercent size={22} />
                  </div>
                  <p className="text-xs uppercase tracking-[0.3em] text-slate-500">
                    Mã giảm giá
                  </p>
                  <h3 className="mt-3 text-2xl font-semibold text-slate-950">
                    {discount.code}
                  </h3>
                  <p className="mt-3 text-sm leading-relaxed text-slate-600">
                    Giảm{" "}
                    {discount.type === "PERCENT"
                      ? `${discount.value}%`
                      : `${discount.value.toLocaleString("vi-VN")}đ`}{" "}
                    cho đơn hàng từ {discount.minAmount.toLocaleString("vi-VN")}
                    đ.
                  </p>
                  <p className="mt-4 text-xs uppercase tracking-[0.2em] text-sky-700">
                    Đến {new Date(discount.endDate).toLocaleDateString("vi-VN")}
                  </p>
                </>
              )}
            </div>
          ))}
        </div>
      </section>

      <section className="mx-auto max-w-[1280px] px-4 pb-14 sm:px-6">
        <div className="mb-6 flex items-end justify-between gap-4">
          <div>
            <p className="text-sm font-semibold uppercase tracking-wide text-sky-700">
              Danh mục nổi bật
            </p>
            <h2 className="mt-2 text-2xl font-semibold text-slate-950 sm:text-3xl">
              Chọn nhóm sản phẩm bạn cần
            </h2>
          </div>
          <button
            type="button"
            onClick={() => navigate("/login")}
            className="hidden text-sm font-semibold text-sky-700 hover:text-sky-800 sm:inline-flex"
          >
            Đăng nhập để xem tất cả
          </button>
        </div>

        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-5">
          {featuredCategories.map((group, index) => (
            <button
              key={group.menuGroup}
              type="button"
              onClick={() =>
                navigate(`/login?redirect=${encodeURIComponent("/products")}`)
              }
              className="overflow-hidden rounded-2xl border border-slate-200 bg-white text-left shadow-sm transition hover:-translate-y-1 hover:border-sky-200 hover:shadow-lg"
            >
              <img
                src={
                  [
                    "/img/votcaulong.webp",
                    "/img/giaycaulong.webp",
                    "/img/aocaulong.webp",
                    "/img/phukiencaulong.webp",
                    "/img/balocaulong.webp",
                  ][index % 5]
                }
                alt={group.menuGroup}
                loading="lazy"
                className="h-36 w-full object-cover"
              />
              <div className="p-4">
                <h3 className="line-clamp-2 font-semibold text-slate-950">
                  {group.menuGroup}
                </h3>
                <p className="mt-1 text-sm text-slate-500">
                  {group.items.length} danh muc con
                </p>
              </div>
            </button>
          ))}
        </div>
      </section>

      <section className="bg-white py-14">
        <div className="mx-auto max-w-[1280px] px-4 sm:px-6">
          <div className="mb-6 flex items-end justify-between gap-4">
            <div>
              <p className="text-sm font-semibold uppercase tracking-wide text-sky-700">
                Sản phẩm gợi ý
              </p>
              <h2 className="mt-2 text-2xl font-semibold text-slate-950 sm:text-3xl">
                Bắt đầu với những món để mua
              </h2>
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {homeData.products.slice(0, 4).map((product) => (
              <article
                key={product.id}
                className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm"
              >
                <img
                  src={product.thumbnailUrl}
                  alt={product.productName}
                  loading="lazy"
                  className="h-44 w-full rounded-xl bg-slate-50 object-contain"
                />
                <p className="mt-4 text-xs font-medium uppercase tracking-wide text-sky-700">
                  {product.category?.cateName}
                </p>
                <h3 className="mt-1 line-clamp-2 min-h-12 font-semibold text-slate-950">
                  {product.productName}
                </h3>
                <p className="mt-2 font-semibold text-sky-700">
                  {formatPrice(product.minPrice)}
                </p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-[1280px] px-4 py-14 sm:px-6">
        <div className="rounded-[2rem] bg-slate-950 p-6 text-white sm:p-10">
          <div className="grid items-center gap-8 lg:grid-cols-[1fr_360px]">
            <div>
              <p className="text-sm font-semibold uppercase tracking-wide text-sky-300">
                Sẵn sàng trải nghiệm?
              </p>
              <h2 className="mt-3 text-3xl font-bold sm:text-4xl">
                Đăng nhập để đặt sân, lưu giỏ hàng và theo dõi lịch của bạn.
              </h2>
            </div>
            <div className="flex flex-col gap-3 sm:flex-row lg:flex-col">
              <button
                type="button"
                onClick={() => navigate("/login")}
                className="rounded-2xl bg-sky-500 px-6 py-3.5 text-sm font-semibold text-white transition hover:bg-sky-400"
              >
                Đăng nhập
              </button>
              <button
                type="button"
                onClick={() => navigate("/register")}
                className="rounded-2xl border border-white/20 bg-white/10 px-6 py-3.5 text-sm font-semibold text-white transition hover:bg-white/15"
              >
                Tao tai khoan
              </button>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default GuestHomePage;
