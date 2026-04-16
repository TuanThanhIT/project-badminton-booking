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
import Breadcrumb from "../../components/ui/user/category/Breadcrumb";
import ProductsRelated from "../../components/ui/user/product/ProductsRelated";
import type { AddCartItemRequest } from "../../types/cart";
import { addCartItem, getCart } from "../../redux/slices/user/cartSlice";
import { toast } from "react-toastify";
import { normalizeColor } from "../../utils/color";
import { COLOR_MAP } from "../../constants/color";
import { flyToCart } from "../../utils/flyToCart";
import type { BranchStock } from "../../types/branch";

const formatPrice = (n: number) =>
  n.toLocaleString("vi-VN", { maximumFractionDigits: 0 }) + "₫";

const ProductDetailPage: React.FC = () => {
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const productDetail = useAppSelector((state) => state.product.productDetail);
  const products = useAppSelector((state) => state.product.products?.products);

  const imgRef = useRef<HTMLImageElement | null>(null);
  const { cartRef } = useOutletContext<{
    cartRef: React.RefObject<HTMLDivElement>;
  }>();

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
  const [branches, setBranches] = useState<BranchStock[]>([]);

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
    if (!productDetail) return;

    if (productDetail.images.length > 0) {
      setMainImage(productDetail.images[0].imageUrl);
    }

    if (productDetail.variants.length > 0) {
      const first = productDetail.variants[0];

      const brs = [
        ...new Map(
          productDetail.variants
            .flatMap((v) => v.branches)
            .map((b) => [b.id, b]),
        ).values(),
      ];

      setSelectedSize(first.size);
      setSelectedColor(first.color);
      setSelectedVariant(first);
      setBranches(brs);
    }
  }, [productDetail]);

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

  const handleSelectSize = (size: string) => {
    setSelectedSize(size);

    const variantsOfSize = productDetail?.variants.filter(
      (v) => v.size === size,
    );

    if (variantsOfSize && variantsOfSize.length > 0) {
      const firstColor = variantsOfSize[0].color;
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
    else if (val > selectedVariant.totalStock)
      setQuantity(selectedVariant.totalStock);
    else setQuantity(val);
  };

  const handleAddItemToCart = async () => {
    if (!selectedVariant) return;

    const variantId = selectedVariant.id;
    const data: AddCartItemRequest = { quantity, variantId };

    await dispatch(addCartItem({ data }))
      .unwrap()
      .then(() => {
        if (imgRef.current && cartRef.current) {
          flyToCart(imgRef.current, cartRef.current);
        }
        toast.success("Sản phẩm được thêm vào giỏ hàng thành công");
      });
  };

  return (
    <div>
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
          {/* Images */}
          <div className="md:col-span-5 flex flex-col items-center space-y-4">
            <div className="w-full bg-white border rounded-2xl border-gray-400 p-6 flex items-center justify-center">
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
                  className={`shrink-0 w-24 h-24 rounded-2xl border overflow-hidden ${
                    mainImage === img.imageUrl
                      ? "border-sky-600 ring-2 ring-sky-300"
                      : "border-gray-300"
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

          {/* Product info */}
          <div className="md:col-span-7 space-y-5">
            <h1 className="text-4xl font-extrabold text-gray-700">
              {productDetail?.productName}
            </h1>

            <p className="text-lg text-gray-500">
              Thương hiệu:{" "}
              <span className="font-semibold">{productDetail?.brand}</span>
            </p>

            {selectedVariant && (
              <div className="bg-sky-50 p-5 rounded-2xl">
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
                  Còn lại: <strong>{selectedVariant.totalStock}</strong> sản
                  phẩm
                </p>
              </div>
            )}

            {/* Size */}
            <div className="flex gap-5 items-center">
              <h4 className="font-semibold">Chọn size:</h4>

              {sizes.map((sz) => (
                <button
                  key={sz}
                  onClick={() => handleSelectSize(sz)}
                  className={`px-6 py-1 rounded-full border ${
                    selectedSize === sz
                      ? "bg-sky-600 text-white"
                      : "border-gray-300"
                  }`}
                >
                  {sz}
                </button>
              ))}
            </div>

            {/* Color */}
            <div className="flex gap-5 items-center">
              <h4 className="font-semibold">Chọn màu sắc:</h4>

              <div className="flex gap-3">
                {colors.map((color) => {
                  const key = normalizeColor(color);
                  const isSelected = selectedColor === color;

                  return (
                    <div
                      key={color}
                      onClick={() => handleSelectColor(color)}
                      className={`w-8 h-8 rounded-full cursor-pointer ${
                        isSelected ? "ring-2 ring-black" : "border"
                      }`}
                      style={{
                        backgroundColor: COLOR_MAP[key] || "#ccc",
                      }}
                    />
                  );
                })}
              </div>
            </div>

            {/* Quantity */}
            <div className="flex gap-5 items-center">
              <h4 className="font-semibold">Số lượng:</h4>

              <input
                type="number"
                min={1}
                max={selectedVariant?.totalStock || 1}
                value={quantity}
                onChange={(e) => handleQuantityChange(Number(e.target.value))}
                className="w-24 border rounded text-center"
              />
            </div>

            {/* Actions */}
            <div className="flex gap-5 pt-4">
              <button
                onClick={handleAddItemToCart}
                className="flex-1 flex items-center justify-center gap-2 bg-sky-600 text-white px-6 py-4 rounded-2xl"
              >
                <ShoppingCart size={20} />
                Thêm vào giỏ hàng
              </button>

              <button className="flex-1 border-2 border-sky-600 text-sky-600 px-6 py-4 rounded-2xl">
                Mua ngay
              </button>
            </div>

            {/* Description */}
            <div className="border-t border-gray-400 mt-8">
              <h2 className="text-2xl font-bold mt-8 mb-6">Mô tả sản phẩm</h2>

              {selectedVariant && (
                <div className="flex gap-4 mb-6">
                  <div className="bg-gray-50 border px-4 py-2 rounded-lg">
                    SKU: {selectedVariant.sku}
                  </div>

                  <div className="bg-gray-50 border px-4 py-2 rounded-lg">
                    Chất liệu: {selectedVariant.material}
                  </div>
                </div>
              )}

              <div
                className="prose max-w-none"
                dangerouslySetInnerHTML={{
                  __html: productDetail?.description ?? "",
                }}
              />

              {/* Branch */}
              <div className="mt-8 bg-gray-50 border rounded-xl p-5">
                <p className="font-semibold mb-4 flex items-center gap-2">
                  <MapPin size={18} />
                  Có tại cửa hàng
                </p>

                <div className="flex flex-wrap gap-3">
                  <div className="flex flex-wrap gap-3">
                    {branches.map((br) => (
                      <button
                        key={br.id}
                        onClick={() => navigate(`/branches/${br.id}`)}
                        className="px-4 py-1.5 text-sm font-medium bg-white border border-gray-300 rounded-full text-gray-700 hover:bg-gray-100 transition"
                      >
                        {br.branchName} ({br.stock})
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Related */}
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
