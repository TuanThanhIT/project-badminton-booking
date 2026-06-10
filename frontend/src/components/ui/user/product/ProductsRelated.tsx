import { Swiper, SwiperSlide } from "swiper/react";
import { Navigation } from "swiper/modules";
import { ArrowRight, PackageSearch, Sparkles } from "lucide-react";

import type { Product } from "../../../../types/product";
import ProductCard from "./ProductCard";

import "swiper/css";
import "swiper/css/navigation";

type ProductsRelatedProps = {
  productsRelated?: Product[];
  groupName: string;
};

const ProductsRelated = ({
  productsRelated,
  groupName,
}: ProductsRelatedProps) => {
  const safeProductsRelated = productsRelated ?? [];

  if (safeProductsRelated.length === 0) {
    return (
      <div
        className="
          flex min-h-[220px] items-center justify-center
          rounded-3xl border border-dashed border-slate-300
          bg-slate-50
        "
      >
        <div className="text-center">
          <div
            className="
              mx-auto mb-4 flex h-14 w-14 items-center justify-center
              rounded-2xl bg-white text-sky-600 shadow-sm
            "
          >
            <PackageSearch size={28} />
          </div>

          <p className="text-base font-semibold text-slate-800">
            Không tìm thấy sản phẩm liên quan
          </p>

          <p className="mt-1 text-sm text-slate-500">
            Hiện chưa có sản phẩm phù hợp để gợi ý.
          </p>
        </div>
      </div>
    );
  }

  return (
    <section
      className="
        overflow-hidden rounded-3xl
        border border-slate-200
        bg-white shadow-sm
      "
    >
      {/* HEADER */}
      <div
        className="
          flex flex-col gap-4 border-b border-slate-100
          bg-gradient-to-r from-sky-50/70 via-white to-white
          px-5 py-5
          sm:flex-row sm:items-center sm:justify-between
        "
      >
        <div>
          <div className="mb-2 flex items-center gap-2 text-xs font-medium uppercase tracking-wide text-sky-600">
            <Sparkles size={14} />
            Gợi ý sản phẩm
          </div>

          <h3 className="text-xl font-semibold text-slate-900">
            Sản phẩm liên quan
          </h3>

          <p className="mt-1 text-sm text-slate-500">
            Một vài lựa chọn khác có thể phù hợp với nhu cầu của bạn
          </p>
        </div>

        <div
          className="
            flex w-fit items-center gap-2 rounded-full
            bg-sky-600 px-4 py-2
            text-xs font-medium text-white shadow-sm
          "
        >
          {safeProductsRelated.length} sản phẩm
          <ArrowRight size={14} />
        </div>
      </div>

      {/* SLIDER */}
      <div className="relative px-5 py-5">
        <Swiper
          modules={[Navigation]}
          navigation
          spaceBetween={16}
          slidesPerView={5}
          breakpoints={{
            0: {
              slidesPerView: 1.4,
              spaceBetween: 12,
            },
            480: {
              slidesPerView: 1.8,
              spaceBetween: 12,
            },
            640: {
              slidesPerView: 2.4,
              spaceBetween: 14,
            },
            768: {
              slidesPerView: 3,
              spaceBetween: 14,
            },
            1024: {
              slidesPerView: 4,
              spaceBetween: 16,
            },
            1400: {
              slidesPerView: 5,
              spaceBetween: 16,
            },
          }}
          className="related-mini-swiper !overflow-visible"
        >
          {safeProductsRelated.map((product) => (
            <SwiperSlide key={product.id} className="!h-auto">
              <ProductCard
                product={product}
                groupName={groupName}
                variant="related"
              />
            </SwiperSlide>
          ))}
        </Swiper>
      </div>

      <style>{`
        .related-mini-swiper .swiper-slide {
          height: auto;
        }

        .related-mini-swiper .swiper-button-next,
        .related-mini-swiper .swiper-button-prev {
          width: 38px;
          height: 38px;
          border-radius: 9999px;
          background: white;
          border: 1px solid rgb(226 232 240);
          color: rgb(2 132 199);
          box-shadow: 0 8px 20px rgba(15, 23, 42, 0.12);
          transition: all 0.2s ease;
        }

        .related-mini-swiper .swiper-button-next {
          right: -6px;
        }

        .related-mini-swiper .swiper-button-prev {
          left: -6px;
        }

        .related-mini-swiper .swiper-button-next:hover,
        .related-mini-swiper .swiper-button-prev:hover {
          background: rgb(14 165 233);
          border-color: rgb(14 165 233);
          color: white;
          transform: scale(1.06);
        }

        .related-mini-swiper .swiper-button-next::after,
        .related-mini-swiper .swiper-button-prev::after {
          font-size: 13px;
          font-weight: 900;
        }

        .related-mini-swiper .swiper-button-disabled {
          opacity: 0;
          pointer-events: none;
        }

        @media (max-width: 768px) {
          .related-mini-swiper .swiper-button-next,
          .related-mini-swiper .swiper-button-prev {
            display: none;
          }
        }
      `}</style>
    </section>
  );
};

export default ProductsRelated;
