import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Loader2, Sparkles } from "lucide-react";
import productRecommendationService from "../../../../services/productRecommendationService";
import type { RecommendedProduct } from "../../../../types/productRecommendation";

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

const REASON_LABEL: Record<string, string> = {
  bought_together: "Hay mua kèm",
  ml_prediction: "AI gợi ý",
  same_category: "Cùng danh mục",
  popular: "Bán chạy",
  catalog: "Phù hợp",
};

const STRATEGY_SUBTITLE: Record<string, string> = {
  item_cooccurrence: "Dựa trên giỏ hàng khách mua cùng nhau",
  same_category: "Cùng nhóm sản phẩm",
  ml_personalized: "Cá nhân hóa từ lịch sử mua của bạn",
  cold_start: "Sản phẩm bán chạy nhất",
};

const ProductRecommendationWidget = ({
  mode,
  productId,
  title,
  subtitle,
  topK = 6,
}: ProductRecommendationWidgetProps) => {
  const navigate = useNavigate();
  const [items, setItems] = useState<RecommendedProduct[]>([]);
  const [strategy, setStrategy] = useState<string>("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

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

  if (error) return null;
  if (!loading && items.length === 0) return null;

  return (
    <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
      <div className="mb-5 flex items-center gap-3">
        <span className="flex h-11 w-11 items-center justify-center rounded-2xl bg-gradient-to-br from-sky-500 to-cyan-500 text-white">
          <Sparkles className="h-5 w-5" />
        </span>
        <div>
          <h2 className="text-xl font-semibold text-slate-900">
            {title || (mode === "related" ? "Thường được mua kèm" : "Gợi ý cho bạn")}
          </h2>
          <p className="text-sm text-slate-500">
            {subtitle ||
              STRATEGY_SUBTITLE[strategy] ||
              (mode === "related"
                ? "Sản phẩm khách hàng hay mua cùng"
                : "Dựa trên lịch sử mua sắm của bạn")}
          </p>
        </div>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-12 text-sky-500">
          <Loader2 className="h-6 w-6 animate-spin" />
        </div>
      ) : (
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-6">
          {items.map((item) => (
            <button
              key={item.productId}
              type="button"
              onClick={() => navigate(`/product/${item.productId}`)}
              className="group flex flex-col overflow-hidden rounded-2xl border border-slate-200 bg-white text-left transition-all hover:-translate-y-0.5 hover:border-sky-300 hover:shadow-md"
            >
              <div className="aspect-square overflow-hidden bg-slate-100">
                <img
                  src={item.thumbnailUrl || "/img/logo_badminton.jpg"}
                  alt={item.productName || "Sản phẩm"}
                  className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                />
              </div>
              <div className="flex flex-1 flex-col p-3">
                {item.reason ? (
                  <span className="mb-1 inline-flex w-fit rounded-full bg-sky-50 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-sky-700">
                    {REASON_LABEL[item.reason] || item.reason}
                  </span>
                ) : null}
                <p className="line-clamp-2 text-sm font-medium text-slate-800">
                  {item.productName || `Sản phẩm #${item.productId}`}
                </p>
                <p className="mt-auto pt-2 text-sm font-bold text-sky-700">
                  {formatPrice(item.minPrice)}
                </p>
              </div>
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

export default ProductRecommendationWidget;
