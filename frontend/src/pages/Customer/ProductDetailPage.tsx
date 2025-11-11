import React, { useEffect, useMemo, useState } from "react";
import { useParams, useSearchParams } from "react-router-dom";
import { toast } from "react-toastify";
import { ShoppingCart } from "lucide-react";
import { useAppDispatch, useAppSelector } from "../../store/hook";
import { addCart, clearCartError } from "../../store/slices/cartSlice";
import productService from "../../services/productService";
import type { ApiErrorType } from "../../types/error";
import type {
  ProductDetailResponse,
  ProductResponse,
  ProductVarient,
} from "../../types/product";
import ProductsRelated from "../../components/ui/ProductsRelated";
import ProductReviewForm from "../../components/ui/ReviewForm";
import ProductReviewList from "../../components/ui/ReviewList";

// --- format tiền ---
const formatPrice = (n: number) =>
  n.toLocaleString("vi-VN", { maximumFractionDigits: 0 }) + "₫";

const ProductDetailPage: React.FC = () => {
  const dispatch = useAppDispatch();
  const { error } = useAppSelector((state) => state.cart);

  // --- Params & Search ---
  const { id } = useParams();
  const product_id = Number(id);
  const [searchParams] = useSearchParams();
  const category_id = Number(searchParams.get("category_id") ?? 0);

  // --- State sản phẩm ---
  const [productDetail, setProductDetail] =
    useState<ProductDetailResponse | null>(null);
  const [mainImage, setMainImage] = useState<string | null>(null);
  const [selectedSize, setSelectedSize] = useState<string | null>(null);
  const [selectedColor, setSelectedColor] = useState<string | null>(null);
  const [selectedVariant, setSelectedVariant] = useState<ProductVarient | null>(
    null
  );
  const [quantity, setQuantity] = useState<number>(1);

  // --- State sản phẩm liên quan ---
  const [productsRelated, setProductsRelated] = useState<ProductResponse[]>([]);

  // --- Fetch chi tiết sản phẩm ---
  useEffect(() => {
    const fetchProduct = async () => {
      try {
        const res = await productService.getProductDetailService(product_id);
        const data: ProductDetailResponse = res.data;
        setProductDetail(data);
        if (data.images?.length > 0) setMainImage(data.images[0].imageUrl);
        if (data.varients?.length > 0) {
          const first = data.varients[0];
          setSelectedSize(first.size);
          setSelectedColor(first.color);
          setSelectedVariant(first);
        }
      } catch (err) {
        const apiError = err as ApiErrorType;
        toast.error(apiError?.userMessage ?? "Lỗi khi tải sản phẩm");
      }
    };
    if (product_id) fetchProduct();
  }, [product_id]);

  // --- Lọc size / color ---
  const sizes = useMemo(() => {
    if (!productDetail) return [];
    return Array.from(new Set(productDetail.varients.map((v) => v.size)));
  }, [productDetail]);

  const colors = useMemo(() => {
    if (!productDetail || !selectedSize) return [];
    const filtered = productDetail.varients.filter(
      (v) => v.size === selectedSize
    );
    return Array.from(new Set(filtered.map((v) => v.color)));
  }, [productDetail, selectedSize]);

  // --- Handlers chọn size / color ---
  const handleSelectSize = (size: string) => {
    setSelectedSize(size);

    // Lọc các variant theo size mới
    const variantsOfSize = productDetail?.varients.filter(
      (v) => v.size === size
    );

    if (variantsOfSize && variantsOfSize.length > 0) {
      const firstColor = variantsOfSize[0].color; // lấy màu đầu tiên
      setSelectedColor(firstColor);
      setSelectedVariant(variantsOfSize[0]);
    } else {
      setSelectedColor(null);
      setSelectedVariant(null);
    }

    setQuantity(1);
  };

  const handleSelectColor = (color: string) => {
    if (!selectedSize) return;
    setSelectedColor(color);
    const variant = productDetail?.varients.find(
      (v) => v.size === selectedSize && v.color === color
    );
    setSelectedVariant(variant || null);
    setQuantity(1);
  };

  const handleQuantityChange = (val: number) => {
    if (!selectedVariant) return;
    if (val < 1) setQuantity(1);
    else if (val > selectedVariant.stock) setQuantity(selectedVariant.stock);
    else setQuantity(val);
  };

  // --- Thêm vào giỏ hàng ---
  const handleAddToCart = async () => {
    if (!selectedVariant) {
      toast.error("Vui lòng chọn size và màu!");
      return;
    }
    const varientId = selectedVariant.id;
    try {
      await dispatch(addCart({ quantity, varientId }));
      toast.success("Đã thêm vào giỏ hàng!");
    } catch (err) {
      const apiError = err as ApiErrorType;
      toast.error(apiError?.userMessage ?? "Thêm giỏ hàng thất bại");
    }
  };

  // --- Xử lý lỗi chung ---
  useEffect(() => {
    if (error) {
      toast.error(error);
      dispatch(clearCartError());
    }
  }, [error, dispatch]);

  // --- Fetch sản phẩm liên quan ---
  useEffect(() => {
    const fetchProductsRelated = async () => {
      try {
        const params = { product_id, category_id };
        const res = await productService.getProductRelatedService(params);
        setProductsRelated(res.data);
      } catch (err) {
        const apiError = err as ApiErrorType;
        toast.error(apiError?.userMessage);
      }
    };
    fetchProductsRelated();
  }, [product_id, category_id]);

  return (
    <div className="container mx-auto px-6 py-12">
      <div className="grid grid-cols-1 md:grid-cols-12 gap-12">
        {/* Hình ảnh */}
        <div className="md:col-span-5 flex flex-col items-center space-y-4">
          <div className="w-full bg-white border border-gray-400 p-6 flex items-center justify-center transition-all">
            {mainImage ? (
              <img
                src={mainImage}
                alt={productDetail?.productName}
                className="w-full max-h-[500px] object-contain rounded-2xl"
              />
            ) : (
              <div className="w-full h-[500px] bg-gray-100 rounded-2xl" />
            )}
          </div>

          <div className="w-full flex gap-4 overflow-x-auto py-2 justify-center">
            {productDetail?.images.map((img) => (
              <button
                key={img.id}
                onClick={() => setMainImage(img.imageUrl)}
                className={`shrink-0 w-24 h-24 rounded-2xl border-2 overflow-hidden transition-all duration-300 ${
                  mainImage === img.imageUrl
                    ? "border-sky-600 ring-2 ring-sky-300 scale-105"
                    : "border-gray-300 hover:border-sky-400 hover:scale-105"
                }`}
              >
                <img
                  src={img.imageUrl}
                  alt="thumbnail"
                  className="w-full h-full object-cover"
                />
              </button>
            ))}
          </div>
        </div>

        {/* Thông tin sản phẩm */}
        <div className="md:col-span-7 space-y-5">
          <h1 className="text-4xl font-extrabold text-gray-700">
            {productDetail?.productName}
          </h1>
          <p className="text-lg text-gray-500 mt-2">
            Thương hiệu:{" "}
            <span className="font-semibold">{productDetail?.brand}</span>
          </p>

          {/* Giá & stock */}
          {selectedVariant && (
            <div className="bg-sky-50 p-5 rounded-2xl shadow-inner">
              <div className="flex items-end gap-4">
                <div className="text-4xl font-extrabold text-sky-700">
                  {formatPrice(selectedVariant.discountPrice)}
                </div>
                {selectedVariant.discount > 0 && (
                  <>
                    <div className="text-lg line-through text-gray-400">
                      {formatPrice(selectedVariant.price)}
                    </div>
                    <span className="bg-red-500 text-white text-sm font-bold px-3 py-1 rounded-full">
                      -{selectedVariant.discount}%
                    </span>
                  </>
                )}
              </div>
              <p className="text-md text-gray-600 mt-2">
                Còn lại: <strong>{selectedVariant.stock}</strong> sản phẩm
              </p>
            </div>
          )}

          {/* Size & Color */}
          <div className="flex flex-row gap-5 items-center">
            <h4 className="text-base font-semibold">Chọn size:</h4>
            <div className="flex flex-wrap gap-3">
              {sizes.map((sz) => (
                <button
                  key={sz}
                  onClick={() => handleSelectSize(sz)}
                  className={`px-6 py-1 rounded-full border text-sm font-medium transition-all duration-200 ${
                    selectedSize === sz
                      ? "bg-sky-600 text-white border-sky-600 shadow-lg scale-105"
                      : "bg-white text-gray-700 border-gray-300 hover:border-sky-500 hover:shadow"
                  }`}
                >
                  {sz}
                </button>
              ))}
            </div>
          </div>

          <div className="flex flex-row gap-5 items-center">
            <h4 className="text-base font-semibold">Chọn màu sắc:</h4>
            <div className="flex flex-wrap gap-3">
              {colors.map((color) => (
                <button
                  key={color}
                  onClick={() => handleSelectColor(color)}
                  className={`px-6 py-1 rounded-full border text-sm font-medium transition-all duration-200 ${
                    selectedColor === color
                      ? "bg-sky-600 text-white border-sky-600 shadow-lg scale-105"
                      : "bg-white text-gray-700 border-gray-300 hover:border-sky-500 hover:shadow"
                  }`}
                >
                  {color}
                </button>
              ))}
            </div>
          </div>

          {/* Quantity */}
          <div className="flex flex-row gap-5 items-center">
            <h4 className="text-base font-semibold">Chọn số lượng:</h4>
            <input
              type="number"
              min={1}
              max={selectedVariant?.stock || 1}
              value={quantity}
              onChange={(e) => handleQuantityChange(Number(e.target.value))}
              className="w-32 px-2 py-1 border rounded-xl text-center text-sm font-medium focus:outline-none focus:ring-2 focus:ring-sky-500 shadow-sm"
            />
          </div>

          {/* Nút hành động */}
          <div className="flex gap-5 pt-4">
            <button
              onClick={handleAddToCart}
              className="flex-1 flex items-center justify-center gap-2 bg-sky-600 text-white text-lg px-6 py-4 rounded-2xl shadow-lg hover:bg-sky-700 hover:scale-[1.02] transition-transform duration-300"
            >
              <ShoppingCart size={20} />
              Thêm vào giỏ hàng
            </button>
            <button
              onClick={() => toast.info("⚡ Mua ngay xử lý sau (placeholder)!")}
              className="flex-1 border-2 border-sky-600 text-sky-600 px-6 py-4 rounded-2xl font-semibold text-lg hover:bg-sky-50 transition-all duration-300 hover:scale-[1.02]"
            >
              Mua ngay
            </button>
          </div>

          {/* Mô tả sản phẩm */}
          <div className="pt-10 border-t border-gray-400 mt-8">
            <h5 className="text-2xl font-bold mb-4 text-gray-700">
              Mô tả sản phẩm
            </h5>
            {selectedVariant && (
              <>
                <p className="text-gray-700">
                  <strong>SKU:</strong> {selectedVariant.sku}
                </p>
                <p className="text-gray-700">
                  <strong>Chất liệu:</strong> {selectedVariant.material}
                </p>
              </>
            )}
            <p className="text-gray-600 leading-relaxed whitespace-pre-line">
              <strong>Mô tả chi tiết: </strong>
              {productDetail?.description}
            </p>
          </div>

          {/* Form đánh giá */}
          <ProductReviewForm />

          {/* Đánh giá của khách hàng */}
          <ProductReviewList />
        </div>
      </div>

      {/* Sản phẩm liên quan */}
      <ProductsRelated productsRelated={productsRelated} />
    </div>
  );
};

export default ProductDetailPage;
