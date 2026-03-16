import { useState, useEffect } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import ProductCard from "./ProductCard";
import type { Product } from "../../../types/product";

type ProductsRelatedProps = {
  productsRelated?: Product[];
  groupName: string;
};

const ProductsRelated = ({
  productsRelated,
  groupName,
}: ProductsRelatedProps) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [visibleCount, setVisibleCount] = useState(4);

  useEffect(() => {
    const handleResize = () => {
      const width = window.innerWidth;
      if (width < 640) setVisibleCount(2);
      else if (width < 1024) setVisibleCount(3);
      else setVisibleCount(4);
      setCurrentIndex(0);
    };

    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

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
        className="flex gap-4 transition-transform duration-500 ease-in-out mx-20"
        style={{
          transform: `translateX(-${(currentIndex * 100) / visibleCount}%)`,
        }}
      >
        {safeProducts.map((product) => (
          <div
            key={product.id}
            className="flex-shrink-0 py-4"
            style={{ flex: `0 0 ${100 / visibleCount}%` }}
          >
            <ProductCard product={product} groupName={groupName} />
          </div>
        ))}
      </div>

      <button
        onClick={handlePrev}
        disabled={currentIndex === 0}
        className={`absolute top-1/2 -translate-y-1/2 left-6 z-10 p-2 bg-white shadow rounded-full border transition ${
          currentIndex === 0
            ? "opacity-30 cursor-not-allowed"
            : "hover:bg-gray-100"
        }`}
      >
        <ChevronLeft size={24} />
      </button>

      <button
        onClick={handleNext}
        disabled={currentIndex === maxIndex}
        className={`absolute top-1/2 -translate-y-1/2 right-6 z-10 p-2 bg-white shadow rounded-full border transition ${
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
