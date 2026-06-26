import React, { useEffect, useMemo, useRef, useState } from "react";

import {
  useNavigate,
  useOutletContext,
  useParams,
  useSearchParams,
} from "react-router-dom";

import {
  MapPin,
  ShoppingCart,
  Star,
  ShieldCheck,
  Truck,
  RotateCcw,
  Minus,
  Plus,
  CheckCircle2,
} from "lucide-react";

import type {
  ProductDetailRequest,
  ProductVariant,
} from "../../types/product";

import { useAppDispatch, useAppSelector } from "../../redux/hook";

import {
  getProductDetail,
  getProductFeedback,
} from "../../redux/slices/user/productSlice";

import Breadcrumb from "../../components/ui/user/category/Breadcrumb";
import ProductRecommendationWidget from "../../components/ui/user/product/ProductRecommendationWidget";

import type { AddCartItemRequest } from "../../types/cart";

import { addCartItem, getCart } from "../../redux/slices/user/cartSlice";

import { toast } from "react-toastify";

import { getColorHex } from "../../utils/color";
import { flyToCart } from "../../utils/flyToCart";

import type { BranchStock } from "../../types/branch";

import ReviewList from "../../components/ui/user/product/ReviewList";
import TablePagination from "../../components/ui/user/pagination/TablePagination";

const formatPrice = (n: number) =>
  n.toLocaleString("vi-VN", {
    maximumFractionDigits: 0,
  }) + "₫";

const ProductDetailPage: React.FC = () => {
  const navigate = useNavigate();

  const dispatch = useAppDispatch();

  const productDetail = useAppSelector((state) => state.product.productDetail);
  const cart = useAppSelector((state) => state.cart.cart);

  const productFeedback = useAppSelector(
    (state) => state.product.productFeedback,
  );

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

  const [reviewPage, setReviewPage] = useState(1);

  const [ratingFilter, setRatingFilter] = useState<number | undefined>(
    undefined,
  );

  useEffect(() => {
    const data: ProductDetailRequest = {
      productId,
    };

    dispatch(getProductDetail({ data }));

    dispatch(getCart());
  }, [dispatch, productId]);

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

  useEffect(() => {
    dispatch(
      getProductFeedback({
        data: {
          productId,
          page: reviewPage,
          limit: 5,
          rating: ratingFilter,
        },
      }),
    );
  }, [dispatch, productId, reviewPage, ratingFilter]);

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

    const data: AddCartItemRequest = {
      quantity,
      variantId,
    };

    await dispatch(addCartItem({ data }))
      .unwrap()
      .then(() => {
        if (imgRef.current && cartRef.current) {
          flyToCart(imgRef.current, cartRef.current);
        }

        toast.success("Sản phẩm được thêm vào giỏ hàng thành công");
      });
  };

  const handleBuyNow = async () => {
    if (!selectedVariant) return;

    const cartId = cart?.id || (await dispatch(getCart()).unwrap()).data.id;

    sessionStorage.setItem("checkoutCartId", String(cartId));
    sessionStorage.removeItem("checkoutCartItemIds");
    sessionStorage.setItem(
      "checkoutBuyNowItem",
      JSON.stringify({
        variantId: selectedVariant.id,
        quantity,
      }),
    );

    navigate("/checkout");
  };

  return (
    <div className="min-h-screen bg-slate-50">
      {/* BREADCRUMB */}
      <div className="border-b border-slate-200 bg-white">
        <div className="mx-auto max-w-[1450px] px-4 py-4 sm:px-6">
          <Breadcrumb
            cateId={cateId}
            cateName={cateName}
            groupName={groupName}
            productId={productId}
            productName={productDetail?.productName}
          />
        </div>
      </div>

      <div className="mx-auto max-w-[1450px] px-4 py-8 sm:px-6">
        {/* PRODUCT HERO */}
        <div
          className="
            rounded-[36px] border border-slate-200 bg-white
            p-4 shadow-sm
            lg:p-6
          "
        >
          <div
            className="
              grid grid-cols-1 gap-7
              xl:grid-cols-[500px_minmax(0,1fr)]
            "
          >
            {/* LEFT IMAGE */}
            <div>
              <div
                className="
                  group overflow-hidden rounded-[32px]
                  border border-slate-200
                  bg-slate-100
                "
              >
                <div className="relative aspect-[1/1.05] overflow-hidden">
                  {selectedVariant?.discount ? (
                    <div
                      className="
                        absolute left-5 top-5 z-10 rounded-full
                        bg-red-500 px-4 py-1.5
                        text-sm font-semibold text-white shadow
                      "
                    >
                      -{selectedVariant.discount}%
                    </div>
                  ) : null}

                  {mainImage ? (
                    <img
                      src={mainImage}
                      ref={imgRef}
                      alt={productDetail?.productName}
                      className="
                        h-full w-full object-cover
                        transition duration-500
                        group-hover:scale-105
                      "
                    />
                  ) : (
                    <div className="h-full w-full animate-pulse bg-slate-200" />
                  )}
                </div>
              </div>

              {/* THUMB */}
              <div className="mt-4 flex gap-3 overflow-x-auto pb-2">
                {productDetail?.images.map((img) => (
                  <button
                    key={img.id}
                    onClick={() => setMainImage(img.imageUrl)}
                    className={`
                      relative h-20 w-20 shrink-0 overflow-hidden
                      rounded-2xl border bg-white p-1
                      transition-all
                      ${
                        mainImage === img.imageUrl
                          ? "border-sky-500 shadow-md ring-1 ring-sky-100"
                          : "border-slate-200 hover:border-sky-300"
                      }
                    `}
                  >
                    <img
                      src={img.imageUrl}
                      alt="thumbnail"
                      className="h-full w-full rounded-xl object-cover"
                    />
                  </button>
                ))}
              </div>
            </div>

            {/* RIGHT INFO */}
            <div className="flex flex-col">
              {/* BRAND */}
              <div className="mb-3 flex flex-wrap items-center gap-2">
                <span
                  className="
                    rounded-full bg-sky-50 px-3 py-1
                    text-xs font-medium uppercase tracking-wide text-sky-700
                  "
                >
                  {productDetail?.brand}
                </span>

                <span
                  className="
                    inline-flex items-center gap-1 rounded-full
                    bg-emerald-50 px-3 py-1
                    text-xs font-medium text-emerald-700
                  "
                >
                  <CheckCircle2 size={13} />
                  Chính hãng
                </span>
              </div>

              {/* TITLE */}
              <h1
                className="
                  text-3xl font-bold leading-tight
                  tracking-tight text-slate-950
                  xl:text-[38px]
                "
              >
                {productDetail?.productName}
              </h1>

              {/* RATING */}
              {productFeedback && (
                <div className="mt-4 flex flex-wrap items-center gap-3">
                  <div className="flex items-center gap-1">
                    {Array.from({ length: 5 }).map((_, i) => (
                      <Star
                        key={i}
                        size={17}
                        className={
                          i < Math.round(productFeedback.averageRating)
                            ? "fill-yellow-400 stroke-yellow-400"
                            : "stroke-slate-300"
                        }
                      />
                    ))}
                  </div>

                  <span className="text-sm font-semibold text-slate-800">
                    {productFeedback.averageRating}/5
                  </span>

                  <span className="text-sm text-slate-500">
                    ({productFeedback.totalFeedbacks} đánh giá)
                  </span>
                </div>
              )}

              {/* PRICE CARD */}
              {selectedVariant && (
                <div
                  className="
                    mt-6 rounded-[28px]
                    border border-sky-100
                    bg-gradient-to-br from-sky-50 via-white to-cyan-50
                    p-6
                  "
                >
                  <div className="flex flex-wrap items-end gap-3">
                    <div className="text-4xl font-bold tracking-tight text-sky-700">
                      {formatPrice(selectedVariant.discountPrice)}
                    </div>

                    {selectedVariant.discount > 0 && (
                      <>
                        <div className="pb-1 text-lg text-slate-400 line-through">
                          {formatPrice(selectedVariant.price)}
                        </div>

                        <span className="rounded-full bg-red-500 px-3 py-1 text-sm font-semibold text-white">
                          -{selectedVariant.discount}%
                        </span>
                      </>
                    )}
                  </div>

                  <div className="mt-4 flex flex-wrap items-center gap-3 text-sm">
                    <span className="inline-flex items-center gap-2 rounded-full bg-white px-3 py-1.5 text-slate-700 shadow-sm">
                      <span className="h-2.5 w-2.5 rounded-full bg-emerald-500" />
                      Còn{" "}
                      <b className="text-slate-950">
                        {selectedVariant.totalStock}
                      </b>{" "}
                      sản phẩm
                    </span>
                  </div>
                </div>
              )}

              {/* BENEFITS */}
              <div className="mt-5 grid grid-cols-1 gap-3 md:grid-cols-3">
                <div
                  className="
                    rounded-2xl border border-slate-200 bg-white p-4
                    transition hover:border-sky-200 hover:bg-sky-50/40
                  "
                >
                  <Truck size={22} className="text-sky-600" />

                  <p className="mt-3 text-sm font-semibold text-slate-900">
                    Giao hàng nhanh
                  </p>

                  <p className="mt-1 text-xs leading-5 text-slate-500">
                    Nhận hàng từ 1-3 ngày
                  </p>
                </div>

                <div
                  className="
                    rounded-2xl border border-slate-200 bg-white p-4
                    transition hover:border-sky-200 hover:bg-sky-50/40
                  "
                >
                  <ShieldCheck size={22} className="text-sky-600" />

                  <p className="mt-3 text-sm font-semibold text-slate-900">
                    Hàng chính hãng
                  </p>

                  <p className="mt-1 text-xs leading-5 text-slate-500">
                    Cam kết 100%
                  </p>
                </div>

                <div
                  className="
                    rounded-2xl border border-slate-200 bg-white p-4
                    transition hover:border-sky-200 hover:bg-sky-50/40
                  "
                >
                  <RotateCcw size={22} className="text-sky-600" />

                  <p className="mt-3 text-sm font-semibold text-slate-900">
                    Đổi trả dễ dàng
                  </p>

                  <p className="mt-1 text-xs leading-5 text-slate-500">
                    Hỗ trợ nhanh chóng
                  </p>
                </div>
              </div>

              {/* OPTIONS CARD */}
              <div
                className="
    mt-5 overflow-hidden rounded-[28px]
    border border-slate-200 bg-white
    shadow-sm
  "
              >
                {/* OPTION BODY */}
                <div className="grid grid-cols-1 divide-y divide-slate-100 lg:grid-cols-2 lg:divide-x lg:divide-y-0">
                  {/* SIZE */}
                  <div className="p-5">
                    <div className="mb-4 flex items-center justify-between gap-3">
                      <div>
                        <h4 className="text-sm font-semibold text-slate-900">
                          Kích thước
                        </h4>
                        <p className="mt-1 text-xs text-slate-500">
                          Chọn size phù hợp với bạn
                        </p>
                      </div>

                      {selectedSize && (
                        <span
                          className="
              rounded-full bg-sky-50 px-3 py-1
              text-xs font-medium text-sky-700
            "
                        >
                          {selectedSize}
                        </span>
                      )}
                    </div>

                    <div className="flex flex-wrap gap-2.5">
                      {sizes.map((sz) => (
                        <button
                          key={sz}
                          onClick={() => handleSelectSize(sz)}
                          className={`
              flex h-11 min-w-12 items-center justify-center
              rounded-2xl border px-4
              text-sm font-semibold transition-all
              ${
                selectedSize === sz
                  ? "border-sky-600 bg-sky-600 text-white shadow-md shadow-sky-100"
                  : "border-slate-200 bg-slate-50 text-slate-700 hover:border-sky-300 hover:bg-sky-50 hover:text-sky-700"
              }
            `}
                        >
                          {sz}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* COLOR */}
                  <div className="p-5">
                    <div className="mb-4 flex items-center justify-between gap-3">
                      <div>
                        <h4 className="text-sm font-semibold text-slate-900">
                          Màu sắc
                        </h4>
                        <p className="mt-1 text-xs text-slate-500">
                          Màu hiện có của sản phẩm
                        </p>
                      </div>

                      {selectedColor && (
                        <span
                          className="
              rounded-full bg-slate-100 px-3 py-1
              text-xs font-medium text-slate-700
            "
                        >
                          {selectedColor}
                        </span>
                      )}
                    </div>

                    <div className="flex flex-wrap gap-3">
                      {colors.map((color) => {
                        const isSelected = selectedColor === color;

                        return (
                          <button
                            key={color}
                            onClick={() => handleSelectColor(color)}
                            title={color}
                            className={`
                relative flex h-11 w-11 items-center justify-center
                rounded-2xl border bg-white transition-all
                ${
                  isSelected
                    ? "border-sky-500 shadow-md ring-1 ring-sky-100"
                    : "border-slate-200 hover:border-sky-300 hover:shadow-sm"
                }
              `}
                          >
                            <span
                              className="h-7 w-7 rounded-xl border border-slate-200"
                              style={{
                                backgroundColor: getColorHex(color),
                              }}
                            />

                            {isSelected && (
                              <span
                                className="
                    absolute -right-1 -top-1
                    h-3.5 w-3.5 rounded-full
                    border-2 border-white bg-sky-500
                  "
                              />
                            )}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                </div>

                {/* QUANTITY + ACTION */}
                <div className="border-t border-slate-100 bg-slate-50/70 p-5">
                  {/* QUANTITY */}
                  <div className="mb-4">
                    <div className="flex items-center gap-4">
                      <h4 className="shrink-0 text-sm font-semibold text-slate-900">
                        Số lượng
                      </h4>

                      <div
                        className="
        flex h-10 w-[132px] shrink-0 items-center overflow-hidden
        rounded-xl border border-slate-200 bg-white
        shadow-sm
      "
                      >
                        <button
                          type="button"
                          onClick={() => handleQuantityChange(quantity - 1)}
                          className="
          flex h-full w-10 items-center justify-center
          text-slate-500 transition
          hover:bg-slate-100 hover:text-slate-900
        "
                        >
                          <Minus size={15} />
                        </button>

                        <input
                          type="number"
                          min={1}
                          max={selectedVariant?.totalStock || 1}
                          value={quantity}
                          onChange={(e) =>
                            handleQuantityChange(Number(e.target.value))
                          }
                          className="
          h-full w-full border-x border-slate-200
          bg-white text-center text-sm font-semibold text-slate-900
          outline-none
        "
                        />

                        <button
                          type="button"
                          onClick={() => handleQuantityChange(quantity + 1)}
                          className="
          flex h-full w-10 items-center justify-center
          text-slate-500 transition
          hover:bg-slate-100 hover:text-slate-900
        "
                        >
                          <Plus size={15} />
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* ACTIONS */}
                  <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                    <button
                      onClick={handleAddItemToCart}
                      className="
        flex h-[52px] items-center justify-center gap-2
        rounded-2xl bg-sky-600 px-6
        text-sm font-semibold text-white
        shadow-lg shadow-sky-100
        transition-all duration-200
        hover:-translate-y-0.5 hover:bg-sky-700 hover:shadow-xl
        active:scale-[0.98]
      "
                    >
                      <ShoppingCart size={19} />
                      Thêm vào giỏ hàng
                    </button>

                    <button
                      onClick={handleBuyNow}
                      className="
        h-[52px] rounded-2xl border border-sky-600
        bg-white px-6
        text-sm font-semibold text-sky-700
        transition-all duration-200
        hover:-translate-y-0.5 hover:bg-sky-50 hover:shadow-md
        active:scale-[0.98]
      "
                    >
                      Mua ngay
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* DESCRIPTION */}
        <div className="mt-8 rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
          <h2 className="mb-6 text-2xl font-semibold text-slate-900">
            Mô tả sản phẩm
          </h2>

          {selectedVariant && (
            <div className="mb-6 flex flex-wrap gap-2">
              <span className="rounded-full border border-slate-200 bg-slate-50 px-3 py-1 text-sm text-slate-600">
                SKU: {selectedVariant.sku}
              </span>

              <span className="rounded-full border border-slate-200 bg-slate-50 px-3 py-1 text-sm text-slate-600">
                Chất liệu: {selectedVariant.material}
              </span>
            </div>
          )}

          <div className="mb-8">
            <p className="mb-3 flex items-center gap-2 font-semibold text-slate-800">
              <MapPin size={18} className="text-sky-500" />
              Có tại cửa hàng
            </p>

            <div className="flex flex-wrap gap-2">
              {branches.map((br) => (
                <button
                  key={br.id}
                  onClick={() => navigate(`/branches/${br.id}`)}
                  className="
                    rounded-full border border-slate-200
                    bg-white px-3 py-1.5 text-sm
                    text-slate-600 transition
                    hover:border-sky-400
                    hover:bg-sky-50
                    hover:text-sky-700
                  "
                >
                  {br.branchName}
                  <span className="ml-1 text-slate-400">({br.stock})</span>
                </button>
              ))}
            </div>
          </div>

          <div
            className="prose max-w-none prose-img:rounded-2xl prose-p:text-slate-700"
            dangerouslySetInnerHTML={{
              __html: productDetail?.description ?? "",
            }}
          />
        </div>

        {/* REVIEW */}
        <div className="mt-8 rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
          <div className="mb-8 flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
            <div>
              <h2 className="text-2xl font-semibold text-slate-900">
                Đánh giá sản phẩm
              </h2>

              <p className="mt-1 text-sm text-slate-500">
                Khách hàng nói gì về sản phẩm này
              </p>
            </div>

            {productFeedback && (
              <div className="flex items-center gap-5 rounded-2xl border border-slate-200 bg-slate-50 px-5 py-4">
                <div>
                  <div className="text-4xl font-bold leading-none text-slate-900">
                    {productFeedback.averageRating}
                  </div>

                  <p className="mt-1 text-xs text-slate-500">
                    {productFeedback.totalFeedbacks} đánh giá
                  </p>
                </div>

                <div className="flex items-center gap-1">
                  {Array.from({
                    length: 5,
                  }).map((_, i) => (
                    <Star
                      key={i}
                      size={18}
                      className={
                        i < Math.round(productFeedback.averageRating)
                          ? "fill-yellow-400 stroke-yellow-400"
                          : "stroke-slate-300"
                      }
                    />
                  ))}
                </div>
              </div>
            )}
          </div>

          <div className="mb-8 flex flex-wrap gap-3">
            <button
              onClick={() => {
                setRatingFilter(undefined);
                setReviewPage(1);
              }}
              className={`
                rounded-full border px-4 py-2
                text-sm font-medium transition-all
                ${
                  ratingFilter === undefined
                    ? "border-sky-600 bg-sky-600 text-white"
                    : "border-slate-300 bg-white text-slate-600 hover:border-sky-400 hover:text-sky-700"
                }
              `}
            >
              Tất cả
            </button>

            {[5, 4, 3, 2, 1].map((star) => (
              <button
                key={star}
                onClick={() => {
                  setRatingFilter(star);
                  setReviewPage(1);
                }}
                className={`
                  flex items-center gap-1 rounded-full
                  border px-4 py-2 text-sm
                  font-medium transition-all
                  ${
                    ratingFilter === star
                      ? "border-sky-600 bg-sky-600 text-white"
                      : "border-slate-300 bg-white text-slate-600 hover:border-sky-400 hover:text-sky-700"
                  }
                `}
              >
                <Star size={14} className="fill-yellow-400 stroke-yellow-400" />
                {star}
              </button>
            ))}
          </div>

          <ReviewList productFeedbacks={productFeedback} />

          {productFeedback && productFeedback.totalPages > 1 && (
            <div className="mt-5 overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
              <TablePagination
                page={productFeedback.page}
                totalPages={productFeedback.totalPages}
                total={productFeedback.totalFeedbacks}
                unit="đánh giá"
                compact
                onPage={setReviewPage}
              />
            </div>
          )}
        </div>

        {/* AI: THƯỜNG ĐƯỢC MUA KÈM */}
        <div className="mt-8">
          <ProductRecommendationWidget mode="related" productId={productId} />
        </div>

        {/* AI: GỢI Ý CHO BẠN */}
        <div className="mt-8">
          <ProductRecommendationWidget mode="user" />
        </div>
      </div>
    </div>
  );
};

export default ProductDetailPage;
