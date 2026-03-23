import { Swiper, SwiperSlide } from "swiper/react";
import { Navigation } from "swiper/modules";
import type { Product } from "../../../types/product";
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
      <div className="text-center text-gray-600 py-10 text-lg italic">
        Không tìm thấy sản phẩm phù hợp.
      </div>
    );
  }

  return (
    <Swiper
      modules={[Navigation]}
      navigation
      spaceBetween={16}
      slidesPerView={4}
      breakpoints={{
        0: { slidesPerView: 2 },
        640: { slidesPerView: 3 },
        1024: { slidesPerView: 4 },
      }}
    >
      {safeProductsRelated.map((product) => (
        <SwiperSlide key={product.id}>
          <ProductCard product={product} groupName={groupName} />
        </SwiperSlide>
      ))}
    </Swiper>
  );
};

export default ProductsRelated;
