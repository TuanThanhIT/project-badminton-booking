import { useEffect, useMemo, useRef, useState } from "react";
import { toast } from "react-toastify";
import {
  ArrowRight,
  CheckSquare2,
  Minus,
  PackageCheck,
  Plus,
  ShieldCheck,
  ShoppingCart,
  Square,
  Trash2,
  Wallet,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import debounce from "lodash/debounce";
import { useAppDispatch, useAppSelector } from "../../redux/hook";
import {
  deleteAllCartItem,
  deleteCartItem,
  deleteCartItemLocal,
  getCart,
  updateCartItem,
  updateQuantityLocal,
} from "../../redux/slices/user/cartSlice";
import type {
  CartItem,
  DeleteCartItemRequest,
  UpdateCartItemRequest,
} from "../../types/cart";
import { normalizeColor } from "../../utils/color";
import { COLOR_MAP } from "../../utils/constants/color";
import { showConfirmDialog } from "../../utils/confirmDialog";

const toMoneyNumber = (value: number | string | null | undefined) =>
  Number(value || 0);

const formatCurrency = (value: number | string | null | undefined) =>
  `${toMoneyNumber(value).toLocaleString("vi-VN")}₫`;

const getCartSelectionKey = (cartId: number) => `cartSelectedItemIds:${cartId}`;

const readSavedSelectedIds = (cartId: number) => {
  try {
    const rawSelectedIds = sessionStorage.getItem(getCartSelectionKey(cartId));
    const savedSelectedIds = rawSelectedIds ? JSON.parse(rawSelectedIds) : [];
    return Array.isArray(savedSelectedIds)
      ? savedSelectedIds.map(Number).filter(Boolean)
      : [];
  } catch {
    return [];
  }
};

const CartPage = () => {
  const dispatch = useAppDispatch();
  const cart = useAppSelector((state) => state.cart.cart);
  const navigate = useNavigate();
  const [selectedItemIds, setSelectedItemIds] = useState<number[]>([]);
  const hydratedCartIdRef = useRef<number | null>(null);

  useEffect(() => {
    dispatch(getCart());
  }, [dispatch]);

  useEffect(() => {
    if (!cart?.cartItems.length) {
      setSelectedItemIds([]);
      hydratedCartIdRef.current = cart?.id || null;
      if (cart?.id) {
        sessionStorage.removeItem(getCartSelectionKey(cart.id));
      }
      return;
    }

    setSelectedItemIds((current) => {
      const availableIds = cart.cartItems.map((item) => item.id);
      if (hydratedCartIdRef.current !== cart.id) {
        hydratedCartIdRef.current = cart.id;

        return readSavedSelectedIds(cart.id).filter((id) =>
          availableIds.includes(id),
        );
      }

      return current.filter((id) => availableIds.includes(id));
    });
  }, [cart?.cartItems]);

  useEffect(() => {
    if (!cart?.id || hydratedCartIdRef.current !== cart.id) return;

    sessionStorage.setItem(
      getCartSelectionKey(cart.id),
      JSON.stringify(selectedItemIds),
    );
  }, [cart?.id, selectedItemIds]);

  const selectedItems = useMemo(
    () =>
      cart?.cartItems.filter((item) => selectedItemIds.includes(item.id)) || [],
    [cart?.cartItems, selectedItemIds],
  );

  const selectedTotalAmount = useMemo(
    () =>
      selectedItems.reduce(
        (sum, item) => sum + toMoneyNumber(item.subTotal),
        0,
      ),
    [selectedItems],
  );

  const selectedTotalQuantity = useMemo(
    () =>
      selectedItems.reduce((sum, item) => sum + Number(item.quantity || 0), 0),
    [selectedItems],
  );

  const isAllSelected =
    !!cart?.cartItems.length &&
    selectedItemIds.length === cart.cartItems.length;

  const toggleSelectAll = () => {
    if (!cart) return;
    setSelectedItemIds(
      isAllSelected ? [] : cart.cartItems.map((item) => item.id),
    );
  };

  const toggleSelectItem = (cartItemId: number) => {
    setSelectedItemIds((current) =>
      current.includes(cartItemId)
        ? current.filter((id) => id !== cartItemId)
        : [...current, cartItemId],
    );
  };

  const handleRemove = async (cartItemId: number) => {
    const data: DeleteCartItemRequest = { cartItemId };
    dispatch(deleteCartItemLocal({ data }));

    dispatch(deleteCartItem({ data }))
      .unwrap()
      .then(() => {
        toast.success("Xóa sản phẩm khỏi giỏ hàng thành công!");
      });
  };

  const handleDeleteAll = async () => {
    await dispatch(deleteAllCartItem())
      .unwrap()
      .then(() => {
        toast.success("Xóa tất cả sản phẩm khỏi giỏ hàng thành công");
      });
  };

  const handleCheckout = async () => {
    if (!cart || selectedItemIds.length === 0) {
      toast.warn("Vui lòng chọn ít nhất một sản phẩm để thanh toán");
      return;
    }

    const isConfirmed = await showConfirmDialog(
      "Xác nhận thanh toán",
      "Bạn có muốn tiếp tục không?",
      "Thanh toán",
      "Hủy",
    );

    if (!isConfirmed) return;

    sessionStorage.setItem("checkoutCartId", String(cart.id));
    sessionStorage.setItem(
      "checkoutCartItemIds",
      JSON.stringify(selectedItemIds),
    );
    sessionStorage.removeItem("checkoutBuyNowItem");
    navigate("/checkout");
  };

  const debouncedUpdateRef = useRef(
    debounce(async (data: UpdateCartItemRequest) => {
      await dispatch(updateCartItem({ data }));
    }, 400),
  );

  useEffect(() => {
    return () => {
      debouncedUpdateRef.current.cancel?.();
    };
  }, []);

  const handleQuantityChange = (item: CartItem, value: number) => {
    if (value <= 0) return;

    if (value > item.totalStock) {
      toast.warn(`Chỉ còn ${item.totalStock} sản phẩm trong kho!`);
      value = item.totalStock;
    }

    const data: UpdateCartItemRequest = {
      cartItemId: item.id,
      quantity: value,
    };

    dispatch(updateQuantityLocal({ data }));
    debouncedUpdateRef.current(data);
  };

  if (!cart || cart.cartItems.length === 0) {
    return (
      <div className="min-h-screen bg-slate-50 px-4 py-12 sm:py-16">
        <div className="mx-auto grid max-w-6xl overflow-hidden rounded-[2rem] border border-slate-200 bg-white shadow-sm lg:grid-cols-[1.05fr_0.95fr]">
          <div className="flex flex-col justify-center p-8 sm:p-12">
            <div className="mb-6 flex h-16 w-16 items-center justify-center rounded-2xl bg-sky-50 text-sky-600">
              <ShoppingCart size={34} />
            </div>
            <p className="mb-3 text-sm font-semibold uppercase tracking-wide text-sky-600">
              Giỏ hàng B-Hub
            </p>
            <h1 className="text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl">
              Giỏ hàng của bạn đang trống
            </h1>
            <p className="mt-4 max-w-lg text-base leading-relaxed text-slate-500">
              Chọn vài sản phẩm cầu lông yêu thích, thêm vào giỏ rồi quay lại
              đây để kiểm tra trước khi thanh toán.
            </p>

            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <button
                onClick={() => navigate("/products")}
                className="inline-flex items-center justify-center gap-2 rounded-2xl bg-sky-600 px-6 py-3 text-sm font-semibold text-white transition-colors hover:bg-sky-700"
              >
                Mua sắm ngay
                <ArrowRight size={18} />
              </button>
              <button
                onClick={() => navigate("/home")}
                className="inline-flex items-center justify-center rounded-2xl border border-slate-200 bg-white px-6 py-3 text-sm font-semibold text-slate-700 transition-colors hover:bg-slate-50"
              >
                Về trang chủ
              </button>
            </div>
          </div>

          <div className="hidden bg-slate-100 p-8 lg:block">
            <div className="h-full rounded-[1.5rem] border border-white bg-white/70 p-6">
              <div className="grid h-full place-items-center rounded-[1.25rem] border border-dashed border-slate-300 bg-slate-50">
                <div className="text-center">
                  <div className="mx-auto mb-4 flex h-24 w-24 items-center justify-center rounded-[2rem] bg-white text-sky-600 shadow-sm">
                    <ShoppingCart size={48} />
                  </div>
                  <p className="font-semibold text-slate-800">
                    Chưa có sản phẩm
                  </p>
                  <p className="mt-1 text-sm text-slate-500">
                    Giỏ hàng sẽ hiển thị ở đây.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  const totalItems = cart.cartItems.reduce(
    (sum, item) => sum + Number(item.quantity || 0),
    0,
  );

  return (
    <div className="min-h-screen bg-slate-50">
      <section className="relative overflow-hidden bg-sky-950 py-14 sm:py-16 lg:py-20">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(56,189,248,0.24),transparent_35%),radial-gradient(circle_at_bottom_right,rgba(14,165,233,0.16),transparent_35%)]" />

        <div className="relative z-10 mx-auto max-w-7xl px-4 sm:px-6">
          <div className="grid gap-8 lg:grid-cols-[1fr_360px] lg:items-center">
            <div>
              <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/10 px-4 py-2 text-xs font-medium text-sky-100 sm:text-sm">
                <ShoppingCart size={16} className="text-sky-300" />
                Giỏ hàng B-Hub
              </div>

              <h1 className="text-3xl font-extrabold leading-tight tracking-tight text-white sm:text-4xl md:text-5xl">
                Kiểm tra lại <span className="text-sky-300">sản phẩm</span>{" "}
                trước khi thanh toán
              </h1>

              <p className="mt-4 max-w-2xl text-sm leading-relaxed text-sky-100 sm:text-base">
                Xem lại số lượng, thuộc tính sản phẩm và tổng tiền để hoàn tất
                đơn hàng nhanh chóng.
              </p>

              <div className="mt-6 flex flex-wrap gap-3 text-xs text-sky-100 sm:text-sm">
                <div className="flex items-center gap-2 rounded-full border border-white/10 bg-white/10 px-3 py-2 sm:px-4">
                  <PackageCheck size={16} />
                  {selectedItems.length} sản phẩm đã chọn
                </div>

                <div className="flex items-center gap-2 rounded-full border border-white/10 bg-white/10 px-3 py-2 sm:px-4">
                  <ShieldCheck size={16} />
                  Thanh toán an toàn
                </div>
              </div>
            </div>

            <div className="hidden lg:block">
              <div className="rounded-[2rem] border border-white/15 bg-white/10 p-5 shadow-2xl backdrop-blur-md">
                <div className="mb-5 flex h-14 w-14 items-center justify-center rounded-2xl bg-white/10 text-sky-200">
                  <Wallet size={30} />
                </div>

                <p className="text-lg font-semibold text-white">
                  Tổng tạm tính
                </p>
                <p className="mt-2 text-3xl font-semibold text-sky-300">
                  {formatCurrency(selectedTotalAmount)}
                </p>
                <p className="mt-2 text-sm leading-relaxed text-sky-100">
                  Có thể áp dụng mã giảm giá và phí giao hàng ở bước thanh toán.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      <main className="relative z-20 mx-auto -mt-8 max-w-7xl px-4 pb-14">
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-[1fr_340px]">
          {/* LEFT */}
          <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
            {/* HEADER */}
            <div className="flex flex-col gap-3 border-b border-slate-100 px-5 py-4 sm:flex-row sm:items-center sm:justify-between">
              <div className="flex items-start gap-3">
                <button
                  type="button"
                  onClick={toggleSelectAll}
                  className="mt-1 text-sky-600 transition hover:text-sky-700"
                  aria-label={isAllSelected ? "Bỏ chọn tất cả" : "Chọn tất cả"}
                >
                  {isAllSelected ? (
                    <CheckSquare2 size={20} />
                  ) : (
                    <Square size={20} />
                  )}
                </button>
                <div>
                  <h2 className="text-xl font-bold text-slate-800">
                    Sản phẩm trong giỏ
                  </h2>
                  <p className="mt-1 text-sm text-slate-500">
                    Đã chọn {selectedItems.length}/{cart.cartItems.length} dòng
                    • {selectedTotalQuantity}/{totalItems} sản phẩm
                  </p>
                </div>
              </div>

              <button
                onClick={handleDeleteAll}
                className="inline-flex w-fit items-center gap-2 rounded-xl border border-red-100 px-4 py-2 text-sm font-medium text-red-500 transition hover:bg-red-50"
              >
                <Trash2 size={16} />
                Xóa tất cả
              </button>
            </div>

            {/* LIST */}
            <div className="bg-white">
              {cart.cartItems.map((item: CartItem, index: number) => {
                const key = normalizeColor(item.color);
                const colorValue = COLOR_MAP[key] || "#ccc";
                const isLast = index === cart.cartItems.length - 1;

                return (
                  <article
                    key={item.id}
                    className={`
          grid grid-cols-1 gap-4 px-5 py-4 transition hover:bg-slate-50/60
          lg:grid-cols-[1fr_165px]
          ${!isLast ? "border-b border-slate-200" : ""}
        `}
                  >
                    {/* LEFT */}
                    <div className="flex min-w-0 items-center gap-4">
                      <button
                        type="button"
                        onClick={() => toggleSelectItem(item.id)}
                        className="shrink-0 text-sky-600 transition hover:text-sky-700"
                        aria-label={
                          selectedItemIds.includes(item.id)
                            ? "Bỏ chọn sản phẩm"
                            : "Chọn sản phẩm"
                        }
                      >
                        {selectedItemIds.includes(item.id) ? (
                          <CheckSquare2 size={18} />
                        ) : (
                          <Square size={18} />
                        )}
                      </button>
                      {/* IMAGE */}
                      <div className="flex h-36 w-36 shrink-0 items-center justify-center rounded-xl border border-slate-200 bg-white p-2">
                        <img
                          src={item.thumbnailUrl}
                          alt={item.productName}
                          className="h-full w-full object-contain"
                        />
                      </div>

                      {/* INFO + QUANTITY */}
                      <div className="flex min-w-0 flex-1 flex-col justify-center">
                        <h3 className="line-clamp-2 text-base font-semibold leading-snug text-slate-800">
                          {item.productName}
                        </h3>

                        <div className="mt-3 flex flex-wrap items-center gap-x-5 gap-y-2 text-sm text-slate-500">
                          <span>
                            Size:{" "}
                            <b className="font-semibold text-slate-700">
                              {item.size || "—"}
                            </b>
                          </span>

                          <span className="flex items-center gap-2">
                            Màu:
                            <span
                              className="h-4 w-4 rounded-full border border-slate-300"
                              style={{ backgroundColor: colorValue }}
                            />
                          </span>

                          <span>
                            Chất liệu:{" "}
                            <b className="font-semibold text-slate-700">
                              {item.material || "—"}
                            </b>
                          </span>
                        </div>

                        <div className="mt-4 flex flex-wrap items-center gap-3">
                          <div className="flex items-center overflow-hidden rounded-xl border border-slate-200 bg-white">
                            <button
                              type="button"
                              onClick={() =>
                                handleQuantityChange(item, item.quantity - 1)
                              }
                              disabled={item.quantity <= 1}
                              className="flex h-9 w-9 items-center justify-center text-slate-500 transition hover:bg-slate-100 disabled:cursor-not-allowed disabled:opacity-40"
                            >
                              <Minus size={15} />
                            </button>

                            <input
                              type="number"
                              min={1}
                              max={item.totalStock}
                              value={item.quantity}
                              onChange={(e) =>
                                handleQuantityChange(
                                  item,
                                  Number(e.target.value),
                                )
                              }
                              className="h-9 w-12 border-x border-slate-200 text-center text-sm font-semibold outline-none"
                            />

                            <button
                              type="button"
                              onClick={() =>
                                handleQuantityChange(item, item.quantity + 1)
                              }
                              disabled={item.quantity >= item.totalStock}
                              className="flex h-9 w-9 items-center justify-center text-slate-500 transition hover:bg-slate-100 disabled:cursor-not-allowed disabled:opacity-40"
                            >
                              <Plus size={15} />
                            </button>
                          </div>

                          <span className="text-xs text-slate-500">
                            Còn {item.totalStock} sản phẩm
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* RIGHT */}
                    <div
                      className="
            flex items-center justify-between gap-4 border-t border-slate-100 pt-4
            lg:flex-col lg:items-end lg:justify-center
            lg:border-l lg:border-t-0 lg:pl-5 lg:pt-0
          "
                    >
                      <div className="text-left lg:text-right">
                        <p className="text-xs text-slate-400">Đơn giá</p>
                        <p className="mt-1 text-sm font-semibold text-slate-700">
                          {formatCurrency(item.price)}
                        </p>

                        <div className="mt-2 border-t border-dashed border-slate-200 pt-2">
                          <p className="text-xs text-slate-400">Thành tiền</p>
                          <p className="mt-1 text-lg font-bold text-sky-600">
                            {formatCurrency(
                              toMoneyNumber(item.price) *
                                Number(item.quantity || 0),
                            )}
                          </p>
                        </div>
                      </div>

                      <button
                        onClick={() => handleRemove(item.id)}
                        title="Xóa sản phẩm"
                        aria-label="Xóa sản phẩm"
                        className="
              inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-lg
              border border-slate-200 bg-white text-slate-400 transition
              hover:border-red-100 hover:bg-red-50 hover:text-red-500
            "
                      >
                        <Trash2 size={15} />
                      </button>
                    </div>
                  </article>
                );
              })}
            </div>
          </section>

          {/* RIGHT */}
          <aside className="h-fit rounded-2xl border border-slate-200 bg-white p-5 shadow-sm lg:sticky lg:top-20">
            <div className="mb-5 flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-sky-50 text-sky-600">
                <Wallet size={20} />
              </div>

              <div>
                <h2 className="text-lg font-bold text-slate-800">
                  Tóm tắt đơn hàng
                </h2>
                <p className="text-sm text-slate-500">Thông tin thanh toán</p>
              </div>
            </div>

            <div className="space-y-3 text-sm">
              <div className="flex justify-between">
                <span className="text-slate-500">Tạm tính</span>
                <span className="font-semibold text-slate-800">
                  {formatCurrency(selectedTotalAmount)}
                </span>
              </div>

              <div className="flex justify-between">
                <span className="text-slate-500">Dòng sản phẩm</span>
                <span className="font-semibold text-slate-800">
                  {selectedItems.length}
                </span>
              </div>

              <div className="flex justify-between">
                <span className="text-slate-500">Tổng số lượng</span>
                <span className="font-semibold text-slate-800">
                  {selectedTotalQuantity}
                </span>
              </div>
            </div>

            <div className="my-5 border-t border-slate-100" />

            <div className="flex items-center justify-between">
              <span className="font-semibold text-slate-700">Tổng cộng</span>
              <span className="text-xl font-bold text-sky-600">
                {formatCurrency(selectedTotalAmount)}
              </span>
            </div>

            <p className="mt-2 text-xs leading-relaxed text-slate-500">
              Phí vận chuyển và mã giảm giá sẽ được tính ở bước thanh toán.
            </p>

            <button
              onClick={handleCheckout}
              disabled={!selectedItemIds.length}
              className={`mt-5 flex w-full items-center justify-center gap-2 rounded-xl px-5 py-3 text-sm font-semibold transition ${
                selectedItemIds.length
                  ? "bg-sky-600 text-white hover:bg-sky-700"
                  : "cursor-not-allowed bg-slate-200 text-slate-500"
              }`}
            >
              Thanh toán ({selectedItems.length})
              <ArrowRight size={17} />
            </button>

            <button
              onClick={() => navigate("/home")}
              className="mt-3 w-full rounded-xl border border-slate-200 px-5 py-3 text-sm font-medium text-slate-700 transition hover:bg-slate-50"
            >
              Tiếp tục mua sắm
            </button>
          </aside>
        </div>
      </main>
    </div>
  );
};

export default CartPage;
