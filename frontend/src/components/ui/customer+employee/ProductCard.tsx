import { Eye } from "lucide-react";
import type { ProductInfo } from "../../../types/product";
import { useNavigate } from "react-router-dom";

type ProductCardProps = {
  product: ProductInfo;
  group_name: string;
};

const ProductCard = ({ product, group_name }: ProductCardProps) => {
  const navigate = useNavigate();

  return (
    <div
      key={product.id}
      className="bg-white rounded-2xl transition-all duration-300 overflow-hidden group cursor-pointer border flex flex-col transform hover:scale-105 border-none"
    >
      {/* Ảnh sản phẩm */}
      <div className="relative w-full h-50s bg-white overflow-hidden">
        <img
          src={product.thumbnailUrl}
          alt={product.productName}
          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
        />

        {/* Dấu giảm giá */}
        {product.discount > 0 && (
          <span className="absolute top-3 left-3 bg-gradient-to-br from-pink-500 to-orange-400 text-white text-xs font-bold px-2 py-0.5 rounded-full shadow-md">
            -{product.discount}%
          </span>
        )}

        {/* Dấu "Mới" */}
        {product.isNew && (
          <span className="absolute top-3 right-3 bg-green-500 text-white text-xs font-bold px-2 py-0.5 rounded-full shadow-md">
            Mới
          </span>
        )}
      </div>

      {/* Nội dung sản phẩm */}
      <div className="p-3 flex flex-col flex-grow">
        <h3
          className="text-base font-semibold text-gray-900 line-clamp-2 group-hover:text-sky-600 transition-colors duration-200 leading-tight"
          title={product.productName}
        >
          {product.productName}
        </h3>
        <p className="text-xs text-gray-500 mt-0.5">{product.brand}</p>

        <div className="mt-1 flex items-center gap-1.5">
          <span className="text-base font-bold text-sky-600">
            {product.minDiscountedPrice.toLocaleString("vi-VN")}₫
          </span>
          {product.discount > 0 && (
            <span className="text-xs line-through text-gray-400">
              {product.minPrice.toLocaleString("vi-VN")}₫
            </span>
          )}
        </div>

        <div className="mt-3 flex">
          <button
            onClick={() =>
              navigate(
                `/product/${product.id}?category_id=${
                  product.category.id
                }&category_name=${encodeURIComponent(
                  product.category.cateName
                )}&group=${encodeURIComponent(group_name)}`
              )
            }
            className="w-full bg-sky-100 text-sky-700 hover:bg-sky-200 hover:text-sky-800 text-sm font-semibold py-2.5 rounded-lg flex items-center justify-center gap-1.5 transition-all"
          >
            <Eye size={16} />
            Xem chi tiết
          </button>
        </div>
      </div>
    </div>
  );
};

export default ProductCard;
