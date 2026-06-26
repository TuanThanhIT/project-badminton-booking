import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Swiper, SwiperSlide } from "swiper/react";
import { Navigation } from "swiper/modules";
import { ArrowRight, Eye, Loader2, Sparkles } from "lucide-react";
import productRecommendationService from "../../../../services/productRecommendationService";
import type { RecommendedProduct } from "../../../../types/productRecommendation";

import "swiper/css";
import "swiper/css/navigation";

type ProductRecommendationWidgetProps = {
  mode: "user" | "related";
  productId?: number;
  title?: string;
  subtitle?: string;
  topK?: number;
};

const formatPrice = (value?: number | null) =>
  value != null
    ? `${value.toLocaleString("vi-VN", { maximumFractionDigits: 0 })}₫`
    : "";

const STRATEGY_SUBTITLE: Record<string, string> = {
  item_cooccurrence: "Khách hay mua chung với sản phẩm này",
  same_category: "Cùng nhóm sản phẩm",
  ml_personalized: "Cá nhân hóa từ lịch sử mua của bạn",
  history_heuristic: "Dựa trên danh mục bạn hay mua",
  cold_start: "Sản phẩm bán chạy nhất",
};

/** Nhãn trên từng card — chỉ dùng cho khối Thường được mua kèm */
const REASON_LABEL: Record<string, string> = {
  bought_together: "Hay mua kèm",
  same_category: "Cùng loại",
};

const RecommendationCard = ({
  item,
  showReason,
  onNavigate,
}: {
  item: RecommendedProduct;
  showReason?: boolean;
  onNavigate: (productId: number) => void;
}) => (
  <article
    onClick={() => onNavigate(item.productId)}
    className="group h-full cursor-pointer overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm transition-all duration-300 hover:-translate-y-1 hover:border-sky-300 hover:shadow-lg"
  >
    <div className="relative aspect-[4/3.8] overflow-hidden bg-slate-100">
      <img
        src={item.thumbnailUrl || "/img/logo_badminton.jpg"}
        alt={item.productName || "Sản phẩm"}
        className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-110"
      />
      <div className="absolute inset-x-0 bottom-0 h-16 bg-gradient-to-t from-slate-950/45 to-transparent" />
    </div>
    <div className="p-3">
      {showReason && item.reason ? (
        <span className="mb-1.5 inline-flex w-fit rounded-full bg-sky-50 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-sky-700">
          {REASON_LABEL[item.reason] || item.reason}
        </span>
      ) : null}
      <h3
        className="line-clamp-2 min-h-[38px] text-[13px] font-semibold leading-snug text-slate-900 transition group-hover:text-sky-700"
        title={item.productName}
      >
        {item.productName || `Sản phẩm #${item.productId}`}
      </h3>
      <p className="mt-2 text-base font-semibold text-sky-700">
        {formatPrice(item.minPrice)}
      </p>
      <button
        type="button"
        onClick={(e) => {
          e.stopPropagation();
          onNavigate(item.productId);
        }}
        className="mt-2 flex w-full items-center justify-center gap-1.5 rounded-xl border border-sky-100 bg-sky-50 px-3 py-2 text-xs font-medium text-sky-700 transition-all hover:border-sky-600 hover:bg-sky-600 hover:text-white active:scale-[0.98]"
      >
        <Eye size={13} />
        Xem ngay
      </button>
    </div>
  </article>
);

const ProductRecommendationWidget = ({
  mode,
  productId,
  title,
  subtitle,
  topK = 12,
}: ProductRecommendationWidgetProps) => {
  const navigate = useNavigate();
  const [items, setItems] = useState<RecommendedProduct[]>([]);
  const [strategy, setStrategy] = useState<string>("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  const swiperClass =
    mode === "related" ? "rec-related-swiper" : "rec-user-swiper";

  useEffect(() => {
    let active = true;
    (async () => {
      try {
        setLoading(true);
        const result =
          mode === "related" && productId
            ? await productRecommendationService.getRelatedProducts(
                productId,
                topK,
              )
            : await productRecommendationService.getProductRecommendations(topK);
        if (active) {
          setItems(result.recommendations.items || []);
          setStrategy(result.recommendations.strategy || "");
          setError(false);
        }
      } catch {
        if (active) setError(true);
      } finally {
        if (active) setLoading(false);
      }
    })();
    return () => {
      active = false;
    };
  }, [mode, productId, topK]);

  const goDetail = (id: number) => navigate(`/product/${id}`);

  if (error) return null;
  if (!loading && items.length === 0) return null;

  const sectionTitle =
    title || (mode === "related" ? "Thường được mua kèm" : "Gợi ý cho bạn");
  const sectionSubtitle =
    subtitle ||
    STRATEGY_SUBTITLE[strategy] ||
    (mode === "related"
      ? "Sản phẩm khách hàng hay mua cùng"
      : "Dựa trên lịch sử mua sắm của bạn");

  return (
    <section className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm">
      <div className="flex flex-col gap-4 border-b border-slate-100 bg-gradient-to-r from-sky-50/70 via-white to-white px-5 py-5 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-start gap-3">
          <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-sky-500 to-cyan-500 text-white">
            <Sparkles className="h-5 w-5" />
          </span>
          <div>
            <div className="mb-1 flex items-center gap-2 text-xs font-medium uppercase tracking-wide text-sky-600">
              <Sparkles size={14} />
              Gợi ý sản phẩm
            </div>
            <h2 className="text-xl font-semibold text-slate-900">
              {sectionTitle}
            </h2>
            <p className="mt-1 text-sm text-slate-500">{sectionSubtitle}</p>
          </div>
        </div>
        {!loading && items.length > 0 ? (
          <div className="flex w-fit items-center gap-2 rounded-full bg-sky-600 px-4 py-2 text-xs font-medium text-white shadow-sm">
            {items.length} sản phẩm
            <ArrowRight size={14} />
          </div>
        ) : null}
      </div>

      <div className="relative px-5 py-5">
        {loading ? (
          <div className="flex items-center justify-center py-12 text-sky-500">
            <Loader2 className="h-6 w-6 animate-spin" />
          </div>
        ) : (
          <Swiper
            modules={[Navigation]}
            navigation
            spaceBetween={16}
            slidesPerView={5}
            breakpoints={{
              0: { slidesPerView: 1.4, spaceBetween: 12 },
              480: { slidesPerView: 1.8, spaceBetween: 12 },
              640: { slidesPerView: 2.4, spaceBetween: 14 },
              768: { slidesPerView: 3, spaceBetween: 14 },
              1024: { slidesPerView: 4, spaceBetween: 16 },
              1400: { slidesPerView: 5, spaceBetween: 16 },
            }}
            className={`${swiperClass} !overflow-visible`}
          >
            {items.map((item) => (
              <SwiperSlide key={item.productId} className="!h-auto">
                <RecommendationCard
                  item={item}
                  showReason={mode === "related"}
                  onNavigate={goDetail}
                />
              </SwiperSlide>
            ))}
          </Swiper>
        )}
      </div>

      <style>{`
        .rec-related-swiper .swiper-slide,
        .rec-user-swiper .swiper-slide {
          height: auto;
        }

        .rec-related-swiper .swiper-button-next,
        .rec-related-swiper .swiper-button-prev,
        .rec-user-swiper .swiper-button-next,
        .rec-user-swiper .swiper-button-prev {
          width: 38px;
          height: 38px;
          border-radius: 9999px;
          background: white;
          border: 1px solid rgb(226 232 240);
          color: rgb(2 132 199);
          box-shadow: 0 8px 20px rgba(15, 23, 42, 0.12);
          transition: all 0.2s ease;
        }

        .rec-related-swiper .swiper-button-next,
        .rec-user-swiper .swiper-button-next {
          right: -6px;
        }

        .rec-related-swiper .swiper-button-prev,
        .rec-user-swiper .swiper-button-prev {
          left: -6px;
        }

        .rec-related-swiper .swiper-button-next:hover,
        .rec-related-swiper .swiper-button-prev:hover,
        .rec-user-swiper .swiper-button-next:hover,
        .rec-user-swiper .swiper-button-prev:hover {
          background: rgb(14 165 233);
          border-color: rgb(14 165 233);
          color: white;
          transform: scale(1.06);
        }

        .rec-related-swiper .swiper-button-next::after,
        .rec-related-swiper .swiper-button-prev::after,
        .rec-user-swiper .swiper-button-next::after,
        .rec-user-swiper .swiper-button-prev::after {
          font-size: 13px;
          font-weight: 900;
        }

        .rec-related-swiper .swiper-button-disabled,
        .rec-user-swiper .swiper-button-disabled {
          opacity: 0;
          pointer-events: none;
        }

        @media (max-width: 768px) {
          .rec-related-swiper .swiper-button-next,
          .rec-related-swiper .swiper-button-prev,
          .rec-user-swiper .swiper-button-next,
          .rec-user-swiper .swiper-button-prev {
            display: none;
          }
        }
      `}</style>
    </section>
  );
};

export default ProductRecommendationWidget;
