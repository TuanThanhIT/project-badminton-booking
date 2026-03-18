import React, { useEffect, useMemo, useRef, useState } from "react";
import {
  useNavigate,
  useOutletContext,
  useParams,
  useSearchParams,
} from "react-router-dom";
import { MapPin, ShoppingCart } from "lucide-react";
import type {
  ProductDetailRequest,
  ProductQueriesRequest,
  ProductVariant,
} from "../../types/product";
import { useAppDispatch, useAppSelector } from "../../redux/hook";
import {
  getProductDetail,
  getProductsByFilter,
} from "../../redux/slices/user/productSlice";
import Breadcrumb from "../../components/ui/user/Breadcrumb";
import type { Branch } from "../../types/branch";
import ProductsRelated from "../../components/ui/user/ProductsRelated";
import type { AddCartItemRequest, Cart } from "../../types/cart";
import {
  addCartItem,
  getCart,
  restoreCartLocal,
} from "../../redux/slices/user/cartSlice";
import { toast } from "react-toastify";
import { normalizeColor } from "../../utils/color";
import { COLOR_MAP } from "../../constants/color";
import { flyToCart } from "../../utils/flyToCart";

// --- format tiền ---
const formatPrice = (n: number) =>
  n.toLocaleString("vi-VN", { maximumFractionDigits: 0 }) + "₫";

const ProductDetailPage: React.FC = () => {
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const productDetail = useAppSelector((state) => state.product.productDetail);
  const products = useAppSelector((state) => state.product.products?.products);
  const cart = useAppSelector((state) => state.cart.cart);

  // Xử lý giao diện thêm vào giỏ hàng
  const imgRef = useRef<HTMLImageElement | null>(null);
  const { cartRef } = useOutletContext<{
    cartRef: React.RefObject<HTMLDivElement>;
  }>();

  // --- Params & Search ---
  const { id } = useParams();
  const productId = Number(id);
  const [searchParams] = useSearchParams();

  const cateId = Number(searchParams.get("cateId") ?? 0);
  const cateName = searchParams.get("cateName") ?? "";
  const groupName = searchParams.get("groupName") ?? "";

  const [mainImage, setMainImage] = useState<string | null>(null);
  const [selectedSize, setSelectedSize] = useState<string | null>(null);
  const [selectedColor, setSelectedColor] = useState<string | null>(null);
  const [selectedVariant, setSelectedVariant] = useState<ProductVariant | null>(
    null,
  );
  const [quantity, setQuantity] = useState<number>(1);
  const [branches, setBranches] = useState<Branch[]>([]);

  useEffect(() => {
    const data: ProductDetailRequest = {
      productId,
    };
    dispatch(getProductDetail({ data }));
    dispatch(getCart());
  }, [dispatch, productId]);

  useEffect(() => {
    const data: ProductQueriesRequest = {
      cateId,
      productId,
    };
    dispatch(getProductsByFilter({ data }));
  }, [dispatch, cateId, productId]);

  useEffect(() => {
    if (productDetail !== undefined) {
      if (productDetail?.images.length > 0) {
        setMainImage(productDetail.images[0].imageUrl);
      }
      if (productDetail.variants.length > 0) {
        const first = productDetail.variants[0];
        const brs = [
          ...new Map(
            productDetail.variants.map((v) => [v.branch.id, v.branch]),
          ).values(),
        ];
        setSelectedSize(first.size);
        setSelectedColor(first.color);
        setSelectedVariant(first);
        setBranches(brs);
      }
    }
  }, [productDetail]);

  // --- Lọc size / color ---
  const sizes = useMemo(() => {
    if (!productDetail) return [];
    return Array.from(new Set(productDetail.variants.map((v) => v.size)));
  }, [productDetail]);

  const colors = useMemo(() => {
    if (!productDetail || !selectedSize) return [];
    const filtered = productDetail.variants.filter(
      (v) => v.size === selectedSize,
    );
    return Array.from(new Set(filtered.map((v) => v.color)));
  }, [productDetail, selectedSize]);

  // --- Handlers chọn size / color ---
  const handleSelectSize = (size: string) => {
    setSelectedSize(size);

    // Lọc các variant theo size mới
    const variantsOfSize = productDetail?.variants.filter(
      (v) => v.size === size,
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
    const variant = productDetail?.variants.find(
      (v) => v.size === selectedSize && v.color === color,
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
  const handleAddItemToCart = async () => {
    if (!selectedVariant) return;
    const variantId = selectedVariant.id;
    const data: AddCartItemRequest = { quantity, variantId };
    const result = await dispatch(addCartItem({ data }));

    if (addCartItem.fulfilled.match(result)) {
      if (imgRef.current && cartRef.current) {
        flyToCart(imgRef.current, cartRef.current);
      }
      toast.success("Sản phẩm được thêm vào giỏ hàng thành công");
    } else if (addCartItem.rejected.match(result)) {
      if (!cart) return;
      const prevCart: Cart = { ...cart };
      dispatch(restoreCartLocal({ prevCart }));
    }
  };

  // const handleBuyNow = async () => {
  //   const result = await Swal.fire({
  //     title: "Xác nhận mua ngay",
  //     text: "Bạn có chắc chắn muốn mua ngay sản phẩm này?",
  //     icon: "question",
  //     showCancelButton: true,
  //     confirmButtonText: "Chắc chắn",
  //     cancelButtonText: "Hủy",
  //   });

  //   if (result.isConfirmed) {
  //     if (!selectedVariant) {
  //       toast.error("Vui lòng chọn size và màu!");
  //       return;
  //     }
  //     const varientId = selectedVariant.id;
  //     await dispatch(deleteAllCart());
  //     await dispatch(addCart({ quantity, varientId }));
  //     navigate("/checkout");
  //   }
  // };

  // // -- Lấy đánh giá
  // useEffect(() => {
  //   const data = { productId: product_id };
  //   dispatch(getProductFeedback({ data }));
  // }, [dispatch]);

  return (
    <div>
      {/* Breadcrumb */}
      <div className="bg-white px-6 py-4 border-b border-gray-400">
        <Breadcrumb
          cateId={cateId}
          cateName={cateName}
          groupName={groupName}
          productId={productId}
          productName={productDetail?.productName}
        />
      </div>
      <div className="container mx-auto py-12">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-12">
          {/* Hình ảnh */}
          <div className="md:col-span-5 flex flex-col items-center space-y-4">
            <div className="w-full bg-white border rounded-2xl border-gray-400 p-6 flex items-center justify-center transition-all">
              {mainImage ? (
                <img
                  src={mainImage}
                  ref={imgRef}
                  alt={productDetail?.productName}
                  className="w-full max-h-[600px] object-contain rounded-2xl"
                />
              ) : (
                <div className="w-full h-[600px] bg-gray-100 rounded-2xl" />
              )}
            </div>

            <div className="w-full flex gap-4 overflow-x-auto p-2">
              {productDetail?.images.map((img) => (
                <button
                  key={img.id}
                  onClick={() => setMainImage(img.imageUrl)}
                  className={`shrink-0 w-24 h-24 rounded-2xl border-1 overflow-hidden transition-all duration-300 ${
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
                {colors.map((color) => {
                  const key = normalizeColor(color);
                  const isSelected = selectedColor?.includes(color);

                  return (
                    <div
                      key={color}
                      onClick={() => handleSelectColor(color)}
                      className={`w-8 h-8 rounded-full cursor-pointer transition
          ${isSelected ? "ring-1 ring-black ring-offset-2" : "border border-gray-400"}
        `}
                      style={{
                        backgroundColor: COLOR_MAP[key] || "#ccc",
                        border: key === "trang" ? "1px solid #ddd" : undefined,
                      }}
                      title={color}
                    />
                  );
                })}
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
                onClick={handleAddItemToCart}
                className="flex-1 flex items-center justify-center gap-2 bg-sky-600 text-white text-lg px-6 py-4 rounded-2xl shadow-lg hover:bg-sky-700 hover:scale-[1.02] transition-transform duration-300"
              >
                <ShoppingCart size={20} />
                Thêm vào giỏ hàng
              </button>
              <button
                // onClick={() => handleBuyNow()}
                className="flex-1 border-2 border-sky-600 text-sky-600 px-6 py-4 rounded-2xl font-semibold text-lg hover:bg-sky-50 transition-all duration-300 hover:scale-[1.02]"
              >
                Mua ngay
              </button>
            </div>

            {/* Mô tả sản phẩm */}
            <div className="border-t border-gray-400 mt-8">
              <h2 className="text-2xl font-bold text-gray-800 mb-6 mt-8">
                Mô tả sản phẩm
              </h2>

              {/* thông tin nhanh */}
              {selectedVariant && (
                <div className="flex flex-wrap gap-4 mb-6">
                  <div className="flex items-center gap-2 bg-gray-50 border border-gray-200 px-4 py-2 rounded-lg">
                    <span className="text-gray-500 text-sm font-medium">
                      SKU
                    </span>
                    <span className="font-semibold text-gray-800">
                      {selectedVariant.sku}
                    </span>
                  </div>

                  <div className="flex items-center gap-2 bg-gray-50 border border-gray-200 px-4 py-2 rounded-lg">
                    <span className="text-gray-500 text-sm font-medium">
                      Chất liệu
                    </span>
                    <span className="font-semibold text-gray-800">
                      {selectedVariant.material}
                    </span>
                  </div>
                </div>
              )}

              {/* description */}
              <div
                className="prose max-w-none text-gray-700 mb-8"
                dangerouslySetInnerHTML={{
                  __html: productDetail?.description ?? "",
                }}
              />

              {/* chi nhánh */}
              <div className="mt-8 bg-gray-50 border border-gray-200 rounded-xl p-5">
                <p className="font-semibold text-gray-800 mb-4 flex items-center gap-2">
                  <MapPin size={18} className="text-blue-500" />
                  Có tại cửa hàng
                </p>

                <div className="flex flex-wrap gap-3">
                  {branches.map((br) => (
                    <button
                      onClick={() => navigate(`/branches/${br.id}`)}
                      className="px-4 py-1.5 text-sm font-medium bg-white border border-gray-300 rounded-full text-gray-700 hover:bg-gray-100 transition"
                    >
                      {br.branchName}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Đánh giá của khách hàng */}
            <div className="border-t border-gray-400 mt-8">
              <h2 className="text-2xl font-bold text-gray-800 mb-6 mt-8">
                Đánh giá của khách hàng
              </h2>
              {/* <ReviewList
                  productFeedbacks={productFeedbacks}
                  type="product"
                /> */}
            </div>
          </div>
        </div>

        {/* Sản phẩm liên quan */}
        <div className="pt-10 border-t border-gray-400 mt-8">
          <h3 className="text-2xl font-bold mb-6 text-gray-700">
            Sản phẩm liên quan
          </h3>
          <div className="max-w-7xl mx-auto">
            <ProductsRelated productsRelated={products} groupName={groupName} />
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductDetailPage;
