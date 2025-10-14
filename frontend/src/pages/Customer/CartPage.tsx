import { useEffect, useRef } from "react";
import { useAppDispatch, useAppSelector } from "../../store/hook";
import {
  clearError,
  deleteAllCart,
  deleteCart,
  fetchCart,
  updateQuantity,
  updateQuantityLocal,
} from "../../store/slices/cartSlice";
import { toast } from "react-toastify";
import { ArrowRight, ShoppingCart, Trash2 } from "lucide-react";
import { useNavigate } from "react-router-dom";
import debounce from "lodash/debounce";

const CartPage = () => {
  const dispatch = useAppDispatch();
  const { cart, loading, error } = useAppSelector((state) => state.cart);
  const navigate = useNavigate();

  // --- Fetch cart khi component mount ---
  useEffect(() => {
    dispatch(fetchCart());
  }, [dispatch]);

  // --- Hiển thị lỗi từ state. Đã xử lý lỗi hết ở state rồi nên ko cần try catch ở đây nữa ---
  useEffect(() => {
    if (error) {
      toast.error(error);
      dispatch(clearError());
    }
  }, [error, dispatch]);

  // --- Ref cho debounce quantity update ---
  const debouncedUpdateRef = useRef(
    debounce(async (cartItemId: number, quantity: number) => {
      await dispatch(updateQuantity({ cartItemId, quantity }));
    }, 400)
  );

  useEffect(() => {
    return () => {
      debouncedUpdateRef.current.cancel?.(); // hủy debounce khi unmount
    };
  }, []);

  // --- Handlers ---
  const handleRemove = async (cartItemId: number) => {
    dispatch(deleteCart(cartItemId));
    toast.success("Xóa sản phẩm khỏi giỏ hàng thành công!");
  };

  const handleDeleteAll = () => {
    dispatch(deleteAllCart());
    toast.success("Xóa tất cả sản phẩm khỏi giỏ hàng thành công");
  };

  const handleCheckout = () => {
    navigate("/checkout");
  };

  const handleQuantityChange = (item: any, val: number) => {
    if (val <= 0) return;
    if (val > item.stock) {
      toast.warn(`Chỉ còn ${item.stock} sản phẩm trong kho!`);
      val = item.stock;
    }
    // Cập nhật UI ngay
    dispatch(updateQuantityLocal({ cartItemId: item.id, quantity: val }));
    // Gọi API sau 400ms debounce
    debouncedUpdateRef.current(item.id, val);
  };

  // --- Loading ---
  if (loading) {
    return (
      <div className="flex justify-center items-center h-[60vh] text-sky-600 text-lg font-medium">
        Đang tải giỏ hàng...
      </div>
    );
  }

  // --- Empty cart ---
  if (!cart || cart.cartItems.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-[70vh] bg-gradient-to-b from-sky-50 to-white">
        <div className="bg-white px-8 py-10 rounded-2xl shadow-lg border border-sky-100 flex flex-col items-center">
          <div className="p-5 bg-sky-100 rounded-full mb-5">
            <ShoppingCart size={60} className="text-sky-500" />
          </div>
          <h2 className="text-2xl font-bold text-gray-800 mb-2">
            Giỏ hàng trống
          </h2>
          <p className="text-gray-500 text-sm mb-6 text-center max-w-xs">
            Có vẻ như bạn chưa thêm sản phẩm nào vào giỏ. Hãy khám phá và chọn
            ngay món yêu thích nhé! 💙
          </p>
          <button
            onClick={() => navigate("/home")}
            className="flex items-center gap-2 px-5 py-2 bg-sky-500 hover:bg-sky-600 text-white font-semibold rounded-lg shadow-sm transition-all"
          >
            <span>Mua sắm ngay</span>
            <ArrowRight size={18} />
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-10 px-4">
      <div className="max-w-7xl mx-auto">
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
          <div className="lg:col-span-2 bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-lg font-semibold text-gray-800">
                Sản phẩm ({cart.cartItems.length})
              </h2>
              <button
                onClick={handleDeleteAll}
                className="text-red-500 hover:text-red-600 text-sm font-medium"
              >
                Xóa tất cả
              </button>
            </div>

            <div className="divide-y divide-gray-100">
              {cart.cartItems.map((item) => (
                <div
                  key={item.id}
                  className="flex flex-col sm:flex-row sm:items-center gap-4 py-5"
                >
                  <img
                    src={item.thumbnailUrl}
                    alt={item.productName}
                    className="w-30 h-30 object-cover rounded-xl border border-gray-100 shadow-sm"
                  />
                  <div className="flex-1">
                    <h3 className="font-semibold text-gray-800 line-clamp-2">
                      {item.productName}
                    </h3>
                    <p className="text-sky-600 font-bold mt-1">
                      {item.price.toLocaleString()}₫
                    </p>

                    {/* Số lượng + tồn kho */}
                    <div className="mt-3">
                      <div className="flex items-center gap-2">
                        <label className="text-sm text-gray-600">
                          Số lượng:
                        </label>
                        <input
                          type="number"
                          min={1}
                          max={item.stock}
                          value={item.quantity}
                          onChange={(e) =>
                            handleQuantityChange(item, Number(e.target.value))
                          }
                          className="w-20 border border-gray-300 rounded-md px-2 py-1 text-center focus:ring-2 focus:ring-sky-400 outline-none text-gray-700 cursor-pointer"
                        />
                      </div>
                      <p className="text-xs text-gray-500 mt-1">
                        Tồn kho:{" "}
                        <span className="text-gray-700 font-medium">
                          {item.stock}
                        </span>
                      </p>
                    </div>
                  </div>

                  <div className="flex flex-col items-end gap-3">
                    <p className="font-semibold text-gray-700">
                      {(item.price * item.quantity).toLocaleString()}₫
                    </p>
                    <button
                      onClick={() => handleRemove(item.id)}
                      className="flex items-center gap-1 text-sm text-red-500 hover:text-red-600"
                    >
                      <Trash2 size={15} /> Xóa
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Tóm tắt đơn hàng */}
          <div className="bg-white rounded-2xl shadow-md border border-gray-200 p-6 h-fit sticky top-20">
            <h2 className="text-xl font-semibold text-gray-800 mb-4">
              Tóm tắt đơn hàng
            </h2>

            <div className="space-y-3 text-sm text-gray-600">
              <div className="flex justify-between">
                <span>Tạm tính</span>
                <span>{cart.totalAmount.toLocaleString()}₫</span>
              </div>
              <div className="flex justify-between">
                <span>Phí vận chuyển</span>
                <span className="text-green-600 font-medium">Miễn phí</span>
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
              onClick={handleCheckout}
              className="w-full mt-6 py-3 bg-sky-500 hover:bg-sky-600 text-white font-semibold rounded-lg shadow-sm transition"
            >
              Mua hàng
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CartPage;
