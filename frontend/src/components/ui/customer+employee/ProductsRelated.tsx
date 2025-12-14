import { useState, useEffect } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import type { ProductInfo } from "../../../types/product";
import ProductCard from "./ProductCard";

type ProductsRelatedProps = {
  productsRelated?: ProductInfo[]; // có thể undefined
  group_name: string;
};

const ProductsRelated = ({
  productsRelated,
  group_name,
}: ProductsRelatedProps) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [visibleCount, setVisibleCount] = useState(4);

  // --- Responsive: thay đổi visibleCount theo width ---
  useEffect(() => {
    const handleResize = () => {
      const width = window.innerWidth;
      if (width < 640) setVisibleCount(2);
      else if (width < 1024) setVisibleCount(3);
      else setVisibleCount(4);
      setCurrentIndex(0); // reset slider khi resize
    };

    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  // Nếu productsRelated undefined hoặc rỗng
  const safeProducts = productsRelated ?? [];
  const maxIndex = Math.max(0, safeProducts.length - visibleCount);

  if (safeProducts.length === 0) {
    return (
      <div className="text-center text-gray-600 py-10 text-lg italic">
        Không tìm thấy sản phẩm phù hợp.
      </div>
    );
  }

  const handlePrev = () => setCurrentIndex((prev) => Math.max(prev - 1, 0));
  const handleNext = () =>
    setCurrentIndex((prev) => Math.min(prev + 1, maxIndex));

  return (
    <div className="relative w-full overflow-hidden px-10">
      <div
        className="flex transition-transform duration-500 ease-in-out"
        style={{
          transform: `translateX(-${(currentIndex * 100) / visibleCount}%)`,
        }}
      >
        {safeProducts.map((product) => (
          <div
            key={product.id}
            className="flex-shrink-0 px-2 py-4"
            style={{ flex: `0 0 ${100 / visibleCount}%` }}
          >
            <ProductCard product={product} group_name={group_name} />
          </div>
        ))}
      </div>

      {/* Prev Button */}
      <button
        onClick={handlePrev}
        disabled={currentIndex === 0}
        className={`absolute top-1/2 -translate-y-1/2 left-4 z-10 p-2 bg-white shadow rounded-full border transition ${
          currentIndex === 0
            ? "opacity-30 cursor-not-allowed"
            : "hover:bg-gray-100"
        }`}
      >
        <ChevronLeft size={24} />
      </button>

      {/* Next Button */}
      <button
        onClick={handleNext}
        disabled={currentIndex === maxIndex}
        className={`absolute top-1/2 -translate-y-1/2 right-4 z-10 p-2 bg-white shadow rounded-full border transition ${
          currentIndex === maxIndex
            ? "opacity-30 cursor-not-allowed"
            : "hover:bg-gray-100"
        }`}
      >
        <ChevronRight size={24} />
      </button>
    </div>
  );
};

export default ProductsRelated;
