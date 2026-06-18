import { Eye, Zap } from "lucide-react";
import { useNavigate } from "react-router-dom";
import type { Product } from "../../../../types/product";

type ProductCardProps = {
  product: Product;
  groupName: string;
  variant?: "default" | "related";
};

const ProductCard = ({
  product,
  groupName,
  variant = "default",
}: ProductCardProps) => {
  const navigate = useNavigate();

  const isRelated = variant === "related";

  const goDetail = () =>
    navigate(
      `/product/${product.id}?cateId=${
        product.category.id
      }&cateName=${encodeURIComponent(
        product.category.cateName,
      )}&groupName=${encodeURIComponent(groupName)}`,
    );

  if (isRelated) {
    return (
      <article
        onClick={goDetail}
        className="
          group h-full cursor-pointer overflow-hidden
          rounded-2xl border border-slate-200
          bg-white shadow-sm
          transition-all duration-300
          hover:-translate-y-1 hover:border-sky-300 hover:shadow-lg
        "
      >
        {/* IMAGE */}
        <div className="relative aspect-[4/3.8] overflow-hidden bg-slate-100">
          <img
            src={product.thumbnailUrl}
            alt={product.productName}
            className="
              h-full w-full object-cover
              transition-transform duration-500
              group-hover:scale-110
            "
          />

          <div className="absolute inset-x-0 bottom-0 h-16 bg-gradient-to-t from-slate-950/45 to-transparent" />

          <div className="absolute left-2.5 top-2.5 flex flex-col gap-1.5">
            {product.discount > 0 && (
              <span
                className="
                  w-fit rounded-full bg-red-500
                  px-2 py-0.5
                  text-[10px] font-medium text-white shadow
                "
              >
                -{product.discount}%
              </span>
            )}

            {product.isNew && (
              <span
                className="
                  inline-flex w-fit items-center gap-1
                  rounded-full bg-emerald-500
                  px-2 py-0.5
                  text-[10px] font-medium text-white shadow
                "
              >
                <Zap size={10} />
                Mới
              </span>
            )}
          </div>
        </div>

        {/* CONTENT */}
        <div className="p-3">
          <p className="text-[10px] font-medium uppercase tracking-wide text-sky-600">
            {product.brand}
          </p>

          <h3
            className="
              mt-1 line-clamp-2 min-h-[38px]
              text-[13px] font-semibold leading-snug
              text-slate-900 transition
              group-hover:text-sky-700
            "
            title={product.productName}
          >
            {product.productName}
          </h3>

          <div className="mt-2 flex flex-col gap-0.5">
            <span className="text-base font-semibold text-sky-700">
              {product.minDiscountedPrice.toLocaleString("vi-VN")}₫
            </span>

            {product.discount > 0 && (
              <span className="text-xs text-slate-400 line-through">
                {product.minPrice.toLocaleString("vi-VN")}₫
              </span>
            )}
          </div>

          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              goDetail();
            }}
            className="
              mt-2 flex w-full items-center justify-center gap-1.5
              rounded-xl border border-sky-100
              bg-sky-50 px-3 py-2
              text-xs font-medium text-sky-700
              transition-all
              hover:border-sky-600 hover:bg-sky-600 hover:text-white
              active:scale-[0.98]
            "
          >
            <Eye size={13} />
            Xem ngay
          </button>
        </div>
      </article>
    );
  }

  return (
    <article
      onClick={goDetail}
      className="
      group h-full cursor-pointer overflow-hidden
      rounded-2xl border border-slate-200 bg-white
      shadow-sm transition-all duration-300
      hover:-translate-y-1 hover:border-sky-300 hover:shadow-lg
    "
    >
      {/* IMAGE */}
      <div className="relative aspect-[4/3.45] overflow-hidden bg-slate-100">
        <img
          src={product.thumbnailUrl}
          alt={product.productName}
          className="
          h-full w-full object-cover
          transition-transform duration-500
          group-hover:scale-105
        "
        />

        <div className="absolute inset-x-0 bottom-0 h-20 bg-gradient-to-t from-slate-950/40 to-transparent" />

        <div className="absolute left-3 top-3 flex flex-col gap-2">
          {product.discount > 0 && (
            <span className="rounded-full bg-red-500 px-2.5 py-1 text-xs font-medium text-white shadow">
              -{product.discount}%
            </span>
          )}

          {product.isNew && (
            <span className="inline-flex items-center gap-1 rounded-full bg-emerald-500 px-2.5 py-1 text-xs font-medium text-white shadow">
              <Zap size={12} />
              Mới
            </span>
          )}
        </div>
      </div>

      {/* CONTENT */}
      <div className="p-4">
        <p className="text-[11px] font-medium uppercase tracking-wide text-sky-600">
          {product.brand}
        </p>

        <h3
          className="
    mt-1.5 line-clamp-2 min-h-[48px]
    text-base font-semibold leading-snug
    text-slate-700 transition
    group-hover:text-sky-700
  "
          title={product.productName}
        >
          {product.productName}
        </h3>

        <div className="mt-2 flex flex-wrap items-baseline gap-2">
          <span className="text-lg font-semibold tracking-tight text-sky-700">
            {product.minDiscountedPrice.toLocaleString("vi-VN")}₫
          </span>

          {product.discount > 0 && (
            <span className="text-[13px] text-slate-400 line-through">
              {product.minPrice.toLocaleString("vi-VN")}₫
            </span>
          )}
        </div>

        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            goDetail();
          }}
          className="
      mt-3 flex w-full items-center justify-center gap-2
      rounded-xl border border-sky-100
      bg-sky-50 px-4 py-2
      text-sm font-semibold text-sky-700
      transition-all
      hover:border-sky-600 hover:bg-sky-600 hover:text-white
      hover:shadow-md
      active:scale-[0.98]
    "
        >
          <Eye size={16} />
          Xem chi tiết
        </button>
      </div>
    </article>
  );
};

export default ProductCard;
