import { useEffect, useRef } from "react";
import { toast } from "react-toastify";
import { ArrowRight, ShoppingCart, Trash2 } from "lucide-react";
import { useNavigate } from "react-router-dom";
import debounce from "lodash/debounce";
import { useAppDispatch, useAppSelector } from "../../redux/hook";
import {
  deleteAllCartItem,
  deleteCartItem,
  deleteCartItemLocal,
  restoreCartLocal,
  updateCartItem,
  updateQuantityLocal,
} from "../../redux/slices/user/cartSlice";
import type {
  Cart,
  CartItem,
  DeleteCartItemRequest,
  UpdateCartItemRequest,
} from "../../types/cart";
import { normalizeColor } from "../../utils/color";
import { COLOR_MAP } from "../../constants/color";

const CartPage = () => {
  const dispatch = useAppDispatch();
  const cart = useAppSelector((state) => state.cart.cart);
  const navigate = useNavigate();

  const handleRemove = async (cartItemId: number) => {
    const data: DeleteCartItemRequest = { cartItemId };
    dispatch(deleteCartItemLocal({ data }));
    const res = dispatch(deleteCartItem({ data }));
    if (deleteCartItem.fulfilled.match(res)) {
      toast.success("Xóa sản phẩm khỏi giỏ hàng thành công!");
    } else if (deleteCartItem.rejected.match(res)) {
      if (!cart) return;
      const prevCart: Cart = { ...cart };
      dispatch(restoreCartLocal({ prevCart }));
    }
  };

  const handleDeleteAll = async () => {
    const res = await dispatch(deleteAllCartItem());
    if (deleteAllCartItem.fulfilled.match(res)) {
      toast.success("Xóa tất cả sản phẩm khỏi giỏ hàng thành công");
    } else if (deleteAllCartItem.rejected.match(res)) {
      if (!cart) return;
      const prevCart: Cart = { ...cart };
      dispatch(restoreCartLocal({ prevCart }));
    }
  };

  // const handleCheckout = async () => {
  //   const result = await Swal.fire({
  //     title: "Xác nhận thanh toán",
  //     text: "Bạn có chắc chắn thanh toán cho các sản phẩm trong giỏ hàng?",
  //     icon: "question",
  //     showCancelButton: true,
  //     confirmButtonText: "Chắc chắn",
  //     cancelButtonText: "Hủy",
  //   });
  //   if (result.isConfirmed) {
  //     navigate("/checkout");
  //   }
  // };

  // Xử lý update quantity
  const debouncedUpdateRef = useRef(
    debounce(async (data: UpdateCartItemRequest) => {
      const result = await dispatch(updateCartItem({ data }));
      if (updateCartItem.rejected.match(result)) {
        if (!cart) return;
        const prevCart: Cart = { ...cart };
        dispatch(restoreCartLocal({ prevCart }));
      }
    }, 400),
  );

  useEffect(() => {
    return () => {
      debouncedUpdateRef.current.cancel?.(); // hủy debounce khi unmount
    };
  }, []);

  const handleQuantityChange = (item: CartItem, value: number) => {
    if (value <= 0) return;
    if (value > item.stock) {
      toast.warn(`Chỉ còn ${item.stock} sản phẩm trong kho!`);
      value = item.stock;
    }
    const data: UpdateCartItemRequest = {
      cartItemId: item.id,
      quantity: value,
    };
    dispatch(updateQuantityLocal({ data }));
    debouncedUpdateRef.current(data);
  };

  // --- Empty cart ---
  if (!cart || cart.cartItems.length === 0) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center w-full py-16">
        <ShoppingCart size={64} className="text-sky-400 mb-6" />

        <h3 className="text-2xl font-semibold text-gray-700 mb-3">
          Giỏ hàng trống
        </h3>

        <p className="text-base text-gray-500 text-center max-w-md mb-6">
          Hãy thêm sản phẩm để tiếp tục mua sắm nhé! 💙
        </p>

        <button
          onClick={() => navigate("/home")}
          className="flex items-center gap-2 px-6 py-3 bg-sky-500 hover:bg-sky-600 text-white font-medium rounded-lg transition"
        >
          <span>Mua sắm ngay</span>
          <ArrowRight size={20} />
        </button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white py-10 px-20">
      <div className="max-w-8xl mx-auto">
        {/* Header */}
        <div className="mb-10 text-center">
          <div className="flex items-center justify-center gap-3 mb-3">
            <div className="bg-blue-100 p-3 rounded-full">
              <ShoppingCart size={28} className="text-blue-600" />
            </div>
            <h1 className="text-3xl font-extrabold text-gray-800 tracking-tight">
              Giỏ hàng của bạn
            </h1>
          </div>
          <p className="text-gray-500 text-sm md:text-base">
            Xem lại sản phẩm trước khi thanh toán
          </p>
          <div className="mx-auto mt-3 w-16 h-1 bg-gradient-to-r from-blue-400 to-blue-600 rounded-full"></div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Danh sách sản phẩm */}
          <div className="lg:col-span-2 bg-white rounded-2xl border border-gray-300 p-6">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-lg font-semibold text-gray-800">
                Sản phẩm ({cart.cartItems.length})
              </h2>
              <button
                onClick={handleDeleteAll}
                className="text-red-500 hover:text-red-600 text-lg font-bold underline"
              >
                Xóa tất cả
              </button>
            </div>

            <div className="space-y-4">
              {cart.cartItems.map((item: CartItem) => {
                const key = normalizeColor(item.color);
                return (
                  <div
                    key={item.id}
                    className="flex items-stretch gap-5 bg-white p-10 transition-all border-t border-t-gray-300"
                  >
                    {/* Ảnh sản phẩm */}
                    <div className="flex-shrink-0">
                      <img
                        src={item.thumbnailUrl}
                        alt={item.productName}
                        className="w-36 h-full object-cover rounded-xl border border-gray-100"
                      />
                    </div>

                    {/* Thông tin chính */}
                    <div className="flex-1 flex flex-col justify-between py-2">
                      <div>
                        <h3 className="font-semibold text-gray-800 text-lg">
                          {item.productName}
                        </h3>

                        <div className="flex flex-wrap items-center gap-x-6 text-sm text-gray-600 mt-1">
                          {/* SIZE */}
                          <div className="flex items-center gap-1">
                            <span className="font-semibold text-gray-700">
                              Size:
                            </span>
                            <span>{item.size || "—"}</span>
                          </div>

                          {/* COLOR */}
                          <div className="flex items-center gap-2">
                            <span className="font-semibold text-gray-700">
                              Màu:
                            </span>

                            <div
                              className="w-5 h-5 rounded-full ring-1 ring-black ring-offset-2"
                              style={{
                                backgroundColor: COLOR_MAP[key] || "#ccc",
                                border:
                                  key === "trang"
                                    ? "1px solid #ddd"
                                    : undefined,
                              }}
                            />
                          </div>

                          {/* MATERIAL */}
                          <div className="flex items-center gap-1">
                            <span className="font-semibold text-gray-700">
                              Chất liệu:
                            </span>
                            <span>{item.material || "—"}</span>
                          </div>
                        </div>
                        {/* Giá đơn vị */}
                        <p className="text-sky-600 font-semibold mt-2 text-base">
                          {item.price.toLocaleString()}₫
                        </p>
                      </div>

                      {/* Số lượng */}
                      <div className="flex items-center gap-3 mt-3">
                        <div className="flex items-center gap-2 text-sm text-gray-600">
                          <label className="font-medium">Số lượng:</label>
                          <input
                            type="number"
                            min={1}
                            max={item.stock}
                            value={item.quantity}
                            onChange={(e) =>
                              handleQuantityChange(item, Number(e.target.value))
                            }
                            className="w-16 border border-gray-300 rounded-md px-2 py-1 text-center focus:ring-1 focus:ring-sky-400 outline-none text-gray-700"
                          />
                        </div>
                        <span className="text-xs text-gray-400">
                          (Còn {item.stock})
                        </span>
                      </div>
                    </div>

                    {/* Giá tổng + nút xóa */}
                    <div className="flex flex-col items-end justify-between py-2">
                      <p className="font-bold text-gray-800 text-lg">
                        {(item.price * item.quantity).toLocaleString()}₫
                      </p>
                      <button
                        onClick={() => handleRemove(item.id)}
                        title="Xóa"
                        className="flex items-center gap-1 text-red-500 hover:text-red-600 border rounded-full p-2"
                      >
                        <Trash2 size={15} />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Tóm tắt đơn hàng */}
          <div className="bg-white rounded-2xl border border-gray-300 p-6 h-fit sticky top-20">
            <h2 className="text-xl font-semibold text-gray-800 mb-2">
              Tóm tắt đơn hàng
            </h2>

            <div className="h-1 w-20 bg-gradient-to-r from-sky-400 to-sky-600 rounded-full mb-4"></div>

            <div className="space-y-3 text-sm text-gray-600">
              <div className="flex justify-between">
                <span>Tạm tính</span>
                <span>{cart.totalAmount.toLocaleString()}₫</span>
              </div>

              <div className="flex justify-between">
                <span>Tổng số mặt hàng</span>
                <span>{cart.cartItems.length}</span>
              </div>

              <div className="border-t border-gray-200 my-3"></div>

              <div className="flex justify-between text-base font-semibold text-gray-800">
                <span>Tổng cộng</span>
                <span className="text-sky-600 text-lg font-bold">
                  {cart.totalAmount.toLocaleString()}₫
                </span>
              </div>
            </div>

            <button
              // onClick={handleCheckout}
              className="w-full mt-6 py-3 bg-sky-500 hover:bg-sky-600 text-white font-semibold rounded-lg shadow-sm transition"
            >
              Thanh toán
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CartPage;
