import type { ProductResponse } from "../../types/product";
import { useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import ProductCard from "./ProductCard";

type ProductRelatedProps = {
  productsRelated: ProductResponse[];
};

const ProductsRelated = ({ productsRelated }: ProductRelatedProps) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const visibleCount = 4; // số sản phẩm hiển thị cùng lúc

  const maxIndex = Math.max(0, productsRelated.length - visibleCount);

  const handlePrev = () => {
    setCurrentIndex((prev) => Math.max(prev - 1, 0));
  };

  const handleNext = () => {
    setCurrentIndex((prev) => Math.min(prev + 1, maxIndex));
  };

  return (
    <div className="border-t mt-6 border-gray-400">
      <h3 className="text-2xl font-bold mb-6 text-gray-700 mt-10">
        Sản phẩm liên quan
      </h3>
      <div className="w-[90vw] mx-auto relative">
        <div className="relative">
          {/* Nút điều hướng trái */}
          <button
            onClick={handlePrev}
            disabled={currentIndex === 0}
            className={`absolute top-1/2 -translate-y-1/2 -left-8 z-10 p-2 bg-white shadow rounded-full border transition ${
              currentIndex === 0
                ? "opacity-30 cursor-not-allowed"
                : "hover:bg-gray-100"
            }`}
          >
            <ChevronLeft size={24} />
          </button>

          {/* Phần slider - overflow-hidden chỉ ở vùng sản phẩm */}
          <div className="overflow-hidden">
            <div
              className="flex transition-transform duration-500 ease-in-out justify-center"
              style={{
                transform: `translateX(-${
                  (currentIndex * 100) / visibleCount
                }%)`,
                width: `${(productsRelated.length * 100) / visibleCount}%`,
              }}
            >
              {productsRelated.map((product) => (
                <div key={product.id} className="w-1/4 px-2 py-4 flex-shrink-0">
                  <ProductCard product={product} />
                </div>
              ))}
            </div>
          </div>

          {/* Nút điều hướng phải */}
          <button
            onClick={handleNext}
            disabled={currentIndex === maxIndex}
            className={`absolute top-1/2 -translate-y-1/2 -right-8 z-10 p-2 bg-white shadow rounded-full border transition ${
              currentIndex === maxIndex
                ? "opacity-30 cursor-not-allowed"
                : "hover:bg-gray-100"
            }`}
          >
            <ChevronRight size={24} />
          </button>
        </div>

        {productsRelated.length === 0 && (
          <p className="text-center text-gray-600 text-lg italic font-medium py-10">
            Không tìm thấy sản phẩm phù hợp.
          </p>
        )}
      </div>
    </div>
  );
};

export default ProductsRelated;
