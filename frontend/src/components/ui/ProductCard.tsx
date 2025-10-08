import { Eye, ShoppingCart } from "lucide-react";
import type { ProductResponse } from "../../types/product";
import { useNavigate } from "react-router-dom";

type ProductCardProps = {
  product: ProductResponse;
};

const ProductCard = ({ product }: ProductCardProps) => {
  const navigate = useNavigate();

  return (
    <div
      key={product.id}
      className="bg-white rounded-2xl shadow-md hover:shadow-xl transition-all duration-300 overflow-hidden group cursor-pointer border border-gray-100 flex flex-col transform hover:-translate-y-1"
    >
      {/* Ảnh sản phẩm */}
      <div className="relative w-full h-56 bg-gray-50 overflow-hidden">
        <img
          src={product.thumbnailUrl}
          alt={product.productName}
          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
        />

        {/* Dấu giảm giá */}
        {product.discount > 0 && (
          <span className="absolute top-3 left-3 bg-gradient-to-br from-pink-500 to-orange-400 text-white text-xs font-bold px-3 py-1 rounded-full shadow-md">
            -{product.discount}%
          </span>
        )}

        {/* Dấu "Mới" nếu trong 10 ngày */}
        {product.isNew && (
          <span className="absolute top-3 right-3 bg-green-500 text-white text-xs font-bold px-3 py-1 rounded-full shadow-md">
            Mới
          </span>
        )}
      </div>

      {/* Nội dung sản phẩm */}
      <div className="p-4 flex flex-col flex-grow">
        <h3
          className="text-lg font-semibold text-gray-900 line-clamp-2 group-hover:text-sky-600 transition-colors duration-200"
          title={product.productName}
        >
          {product.productName}
        </h3>
        <p className="text-sm text-gray-500 mt-1">{product.brand}</p>

        <div className="mt-2 flex items-center gap-2">
          <span className="text-lg font-bold text-sky-600">
            {product.minDiscountedPrice.toLocaleString("vi-VN")}₫
          </span>
          {product.discount > 0 && (
            <span className="text-sm line-through text-gray-400">
              {product.minPrice.toLocaleString("vi-VN")}₫
            </span>
          )}
        </div>

        <div className="mt-3 flex gap-2">
          <button
            onClick={() =>
              navigate(
                `/product/${product.id}?category_id=${product.categoryId}`
              )
            }
            className="w-full bg-sky-100 text-sky-700 hover:bg-sky-200 hover:text-sky-800 text-sm font-semibold py-2 rounded-lg flex items-center justify-center gap-1 transition-all"
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
