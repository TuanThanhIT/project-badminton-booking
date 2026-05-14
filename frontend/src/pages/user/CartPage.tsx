import { useEffect, useRef } from "react";
import { toast } from "react-toastify";
import {
  ArrowRight,
  Minus,
  PackageCheck,
  Plus,
  ShieldCheck,
  ShoppingCart,
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
import { showConfirmDialog } from "../../utils/swalHelper";

const formatCurrency = (value: number) => `${value.toLocaleString()}₫`;

const CartPage = () => {
  const dispatch = useAppDispatch();
  const cart = useAppSelector((state) => state.cart.cart);
  const navigate = useNavigate();

  useEffect(() => {
    dispatch(getCart());
  }, [dispatch]);

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
    const isConfirmed = await showConfirmDialog(
      "Xác nhận thanh toán",
      "Bạn có muốn tiếp tục không?",
      "Thanh toán",
      "Hủy",
    );

    if (!isConfirmed) return;
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
              Chọn vài sản phẩm cầu lông yêu thích, thêm vào giỏ rồi quay lại đây để kiểm tra trước khi thanh toán.
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
                  <p className="font-semibold text-slate-800">Chưa có sản phẩm</p>
                  <p className="mt-1 text-sm text-slate-500">Giỏ hàng sẽ hiển thị ở đây.</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  const totalItems = cart.cartItems.reduce(
    (sum, item) => sum + item.quantity,
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
                  {cart.cartItems.length} sản phẩm
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

                <p className="text-lg font-semibold text-white">Tổng tạm tính</p>
                <p className="mt-2 text-3xl font-semibold text-sky-300">
                  {formatCurrency(cart.totalAmount)}
                </p>
                <p className="mt-2 text-sm leading-relaxed text-sky-100">
                  Có thể áp dụng mã giảm giá và phí giao hàng ở bước thanh toán.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      <main className="relative z-20 mx-auto -mt-8 max-w-7xl px-3 pb-14 sm:-mt-10 sm:px-4">
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-3 lg:gap-8">
          <section className="overflow-hidden rounded-2xl border border-white bg-white/90 shadow-[0_12px_45px_rgba(15,23,42,0.08)] backdrop-blur-sm sm:rounded-[2rem] lg:col-span-2">
            <div className="flex flex-col gap-3 border-b border-slate-100 bg-white p-4 sm:flex-row sm:items-center sm:justify-between sm:p-6">
              <div>
                <h2 className="text-lg font-semibold text-slate-800 sm:text-xl">
                  Sản phẩm trong giỏ
                </h2>
                <p className="mt-1 text-sm text-slate-500">
                  {cart.cartItems.length} dòng sản phẩm • {totalItems} sản phẩm
                </p>
              </div>

              <button
                onClick={handleDeleteAll}
                className="inline-flex w-fit items-center gap-2 rounded-full border border-red-100 bg-red-50 px-4 py-2 text-sm font-medium text-red-500 transition-all hover:bg-red-100 hover:text-red-600"
              >
                <Trash2 size={16} />
                Xóa tất cả
              </button>
            </div>

            <div className="space-y-4 bg-slate-50/70 p-3 sm:p-5">
              {cart.cartItems.map((item: CartItem) => {
                const key = normalizeColor(item.color);
                const colorValue = COLOR_MAP[key] || "#ccc";

                return (
                  <article
                    key={item.id}
                    className="grid grid-cols-[104px_1fr] gap-4 rounded-[1.5rem] border border-slate-200 bg-white p-4 shadow-sm transition-colors hover:border-slate-300 sm:grid-cols-[150px_minmax(0,1fr)_220px] sm:items-stretch sm:gap-6 sm:p-5"
                  >
                    <div className="h-32 w-full overflow-hidden rounded-2xl border border-slate-200 bg-slate-50 p-2 sm:h-full sm:min-h-40">
                      <img
                        src={item.thumbnailUrl}
                        alt={item.productName}
                        className="h-full w-full object-contain transition-transform duration-500 hover:scale-[1.03]"
                      />
                    </div>

                    <div className="min-w-0 py-1">
                      <h3 className="line-clamp-2 text-base font-semibold leading-snug text-slate-900 sm:text-lg">
                        {item.productName}
                      </h3>

                      <div className="mt-4 grid gap-x-8 gap-y-3 text-sm text-slate-600 sm:grid-cols-2">
                        <div className="flex items-center gap-3">
                          <span className="min-w-20 text-slate-400">Size</span>
                          <span className="font-medium text-slate-800">
                            {item.size || "—"}
                          </span>
                        </div>

                        <div className="flex items-center gap-3">
                          <span className="min-w-20 text-slate-400">Màu</span>
                          <span
                            className="h-5 w-5 rounded-full ring-1 ring-slate-300"
                            style={{
                              backgroundColor: colorValue,
                              border:
                                key === "trang" ? "1px solid #ddd" : undefined,
                            }}
                          />
                        </div>

                        <div className="flex items-center gap-3 sm:col-span-2">
                          <span className="min-w-20 text-slate-400">Chất liệu</span>
                          <span className="line-clamp-1 font-medium text-slate-800">
                            {item.material || "—"}
                          </span>
                        </div>
                      </div>

                      <div className="mt-5 flex flex-wrap items-center gap-3">
                        <div className="flex items-center gap-2 rounded-2xl border border-slate-200 bg-white px-3 py-2 shadow-sm">
                          <label className="text-xs font-medium text-slate-500">
                            Số lượng
                          </label>
                          <button
                            type="button"
                            onClick={() =>
                              handleQuantityChange(item, item.quantity - 1)
                            }
                            disabled={item.quantity <= 1}
                            className="flex h-8 w-8 items-center justify-center rounded-lg text-slate-500 transition-colors hover:bg-slate-100 disabled:cursor-not-allowed disabled:opacity-40"
                            aria-label="Giảm số lượng"
                          >
                            <Minus size={15} />
                          </button>
                          <input
                            type="number"
                            min={1}
                            max={item.totalStock}
                            value={item.quantity}
                            onChange={(e) =>
                              handleQuantityChange(item, Number(e.target.value))
                            }
                            className="w-14 rounded-lg border border-slate-200 bg-slate-50 px-2 py-1 text-center text-sm font-semibold text-slate-800 outline-none transition focus:border-sky-400 focus:ring-2 focus:ring-sky-100"
                          />
                          <button
                            type="button"
                            onClick={() =>
                              handleQuantityChange(item, item.quantity + 1)
                            }
                            disabled={item.quantity >= item.totalStock}
                            className="flex h-8 w-8 items-center justify-center rounded-lg text-slate-500 transition-colors hover:bg-slate-100 disabled:cursor-not-allowed disabled:opacity-40"
                            aria-label="Tăng số lượng"
                          >
                            <Plus size={15} />
                          </button>
                        </div>

                        <span className="text-xs text-slate-500">
                          Còn {item.totalStock} sản phẩm
                        </span>
                      </div>
                    </div>

                    <div className="col-span-2 flex items-center justify-between rounded-2xl border border-slate-100 bg-slate-50 p-4 sm:col-span-1 sm:flex-col sm:items-end sm:justify-between sm:p-5">
                      <div className="text-left sm:text-right">
                        <p className="text-xs font-medium text-slate-400">Đơn giá</p>
                        <p className="mt-1 text-base font-semibold text-slate-800">
                          {formatCurrency(item.price)}
                        </p>
                        <p className="mt-3 text-xs font-medium text-slate-400">
                          Thành tiền
                        </p>
                        <p className="mt-1 text-lg font-semibold text-slate-900">
                          {formatCurrency(item.price * item.quantity)}
                        </p>
                      </div>

                      <button
                        onClick={() => handleRemove(item.id)}
                        title="Xóa"
                        className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm font-medium text-slate-500 transition-all hover:border-red-100 hover:bg-red-50 hover:text-red-500"
                      >
                        <Trash2 size={16} />
                        <span className="sm:hidden">Xóa</span>
                      </button>
                    </div>
                  </article>
                );
              })}
            </div>
          </section>

          <aside className="h-fit lg:sticky lg:top-20">
            <div className="overflow-hidden rounded-2xl border border-white bg-white/90 shadow-[0_12px_45px_rgba(15,23,42,0.08)] backdrop-blur-sm sm:rounded-[2rem]">
              <div className="border-b border-slate-100 bg-white p-5 sm:p-6">
                <div className="flex items-center gap-3">
                  <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-sky-50 text-sky-600">
                    <Wallet size={22} />
                  </div>

                  <div>
                    <h2 className="text-lg font-semibold text-slate-800 sm:text-xl">
                      Tóm tắt đơn hàng
                    </h2>
                    <p className="text-sm text-slate-500">
                      Kiểm tra trước khi thanh toán
                    </p>
                  </div>
                </div>
              </div>

              <div className="space-y-4 p-5 sm:p-6">
                <div className="space-y-3 text-sm">
                  <div className="flex justify-between gap-4 text-slate-600">
                    <span>Tạm tính</span>
                    <span className="font-medium text-slate-700">
                      {formatCurrency(cart.totalAmount)}
                    </span>
                  </div>

                  <div className="flex justify-between gap-4 text-slate-600">
                    <span>Số dòng sản phẩm</span>
                    <span className="font-medium text-slate-700">
                      {cart.cartItems.length}
                    </span>
                  </div>

                  <div className="flex justify-between gap-4 text-slate-600">
                    <span>Tổng số lượng</span>
                    <span className="font-medium text-slate-700">
                      {totalItems}
                    </span>
                  </div>
                </div>

                <div className="rounded-2xl border border-sky-100 bg-sky-50/70 p-4">
                  <div className="flex justify-between gap-4">
                    <span className="font-semibold text-slate-700">Tổng cộng</span>
                    <span className="text-xl font-semibold text-sky-700">
                      {formatCurrency(cart.totalAmount)}
                    </span>
                  </div>

                  <p className="mt-2 text-xs leading-relaxed text-slate-500">
                    Phí vận chuyển và mã giảm giá sẽ được tính ở bước thanh toán.
                  </p>
                </div>

                <button
                  onClick={handleCheckout}
                  className="group flex w-full items-center justify-center gap-2 rounded-2xl bg-sky-500 px-5 py-3.5 text-sm font-semibold text-white shadow-lg shadow-sky-100 transition-all hover:bg-sky-600 active:scale-[0.98]"
                >
                  Thanh toán
                  <ArrowRight
                    size={18}
                    className="transition-transform group-hover:translate-x-1"
                  />
                </button>

                <button
                  onClick={() => navigate("/home")}
                  className="w-full rounded-2xl border border-slate-200 bg-white px-5 py-3 text-sm font-medium text-slate-700 transition-all hover:border-sky-200 hover:bg-sky-50 hover:text-sky-700"
                >
                  Tiếp tục mua sắm
                </button>
              </div>
            </div>
          </aside>
        </div>
      </main>
    </div>
  );
};

export default CartPage;
