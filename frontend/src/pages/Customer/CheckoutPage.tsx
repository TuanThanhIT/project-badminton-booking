import { useEffect, useState } from "react";
import type { ProfileResponse, UpdateUserInfoRequest } from "../../types/user";
import type { ApiErrorType } from "../../types/error";
import { toast } from "react-toastify";
import userService from "../../services/userService";
import {
  FormUpdateUserInfoSchema,
  type formUpdateUserInfo,
} from "../../schemas/FormUpdateUserInfoSchema";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  Loader2,
  MapPin,
  X,
  Package,
  CreditCard,
  ArrowRight,
  Ticket,
  StickyNote,
  Wallet,
} from "lucide-react";
import { useAppDispatch, useAppSelector } from "../../store/hook";
import { clearCartError } from "../../store/slices/cartSlice";
import {
  applyDiscount,
  clearDiscount,
  clearDiscountError,
} from "../../store/slices/discountSlice";
import { useNavigate } from "react-router-dom";
import discountService from "../../services/discountService";

const CheckoutPage = () => {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<formUpdateUserInfo>({
    resolver: zodResolver(FormUpdateUserInfoSchema),
    mode: "onChange",
  });

  const [userInfo, setUserInfo] = useState<ProfileResponse>();
  const [openUpdate, setOpenUpdate] = useState(false);
  const [code, setCode] = useState("");
  const [note, setNote] = useState("");
  const [paymentMethod, setPaymentMethod] = useState<"COD" | "MOMO">("COD");
  const [checkApply, setCheckApply] = useState<boolean>(false);

  const cart = useAppSelector((state) => state.cart.cart);
  const discount = useAppSelector((state) => state.discount.discount);
  const cartLoading = useAppSelector((state) => state.cart.loading);
  const discountLoading = useAppSelector((state) => state.discount.loading);
  const cartError = useAppSelector((state) => state.cart.error);
  const discountError = useAppSelector((state) => state.discount.error);

  useEffect(() => {
    const fetchUserInfo = async () => {
      try {
        const res = await userService.getProfileService();
        setUserInfo(res.data);
        reset({
          fullName: res.data.fullName,
          phoneNumber: res.data.phoneNumber,
          address: res.data.address,
        });
      } catch (error) {
        const apiError = error as ApiErrorType;
        toast.error(apiError.userMessage);
      }
    };
    fetchUserInfo();
  }, [reset]);

  useEffect(() => {
    dispatch(clearDiscount());
  }, [dispatch]);

  useEffect(() => {
    const error = cartError || discountError;
    if (error) toast.error(error);
    if (cartError) dispatch(clearCartError());
    if (discountError) dispatch(clearDiscountError());
  }, [cartError, discountError, dispatch]);

  if (discountLoading || cartLoading) {
    return (
      <div className="flex flex-col justify-center items-center h-[60vh] text-sky-600">
        <Loader2 className="w-10 h-10 animate-spin mb-3" />
        <p className="text-lg font-medium">Đang tải dữ liệu...</p>
      </div>
    );
  }

  const onSubmit = async (data: UpdateUserInfoRequest) => {
    try {
      const res = await userService.updateUserInfoService(data);
      setUserInfo(res.data);
      setOpenUpdate(false);
      toast.success("Cập nhật thông tin giao hàng thành công!");
    } catch (error) {
      const apiError = error as ApiErrorType;
      toast.error(apiError.userMessage);
    }
  };

  const handleDiscount = async (code: string) => {
    if (!cart?.totalAmount) {
      toast.error("Không có sản phẩm trong giỏ hàng");
      return;
    }
    try {
      await dispatch(
        applyDiscount({ code, orderAmount: cart.totalAmount })
      ).unwrap();
      setCheckApply(true);
      toast.success("Áp mã giảm giá sản phẩm thành công!");
    } catch {
      // lỗi đã toast ở useEffect
    }
  };

  const handleCheckout = async () => {
    if (checkApply) {
      try {
        await discountService.updateDiscountService(code);
      } catch (error) {
        const apiError = error as ApiErrorType;
        toast.error(apiError.userMessage);
      }
    }
    if (paymentMethod === "COD") {
      navigate("/orders/success");
    }
  };

  return (
    <div className="p-6 bg-gradient-to-b from-[#E3F2FD] to-white min-h-screen">
      {/* ==== Thông tin giao hàng ==== */}
      <div className="border rounded-xl bg-white p-6 shadow-md">
        <div className="flex items-center gap-2 text-[#0288D1] font-semibold mb-4 text-lg">
          <MapPin className="w-6 h-6" />
          <span>Thông Tin Thanh Toán & Nhận Hàng</span>
        </div>

        {userInfo && (
          <div className="flex justify-between items-center flex-wrap gap-2">
            <div className="text-gray-800 font-medium">
              <span className="font-semibold text-[#0277BD] text-[17px]">
                {userInfo.fullName}
              </span>{" "}
              | (+84) {userInfo.phoneNumber}
              <p className="text-gray-700">{userInfo.address}</p>
            </div>
            <button
              onClick={() => setOpenUpdate(true)}
              className="text-[#0288D1] hover:text-[#01579B] font-medium transition"
            >
              Thay Đổi
            </button>
          </div>
        )}
      </div>

      {/* ==== Form cập nhật thông tin ==== */}
      {openUpdate && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl w-[420px] shadow-2xl p-6 relative border-t-4 border-[#4FC3F7]">
            <button
              onClick={() => setOpenUpdate(false)}
              className="absolute top-3 right-3 text-gray-500 hover:text-gray-800"
            >
              <X size={20} />
            </button>

            <h3 className="text-lg font-semibold mb-4 text-center text-[#0288D1]">
              Cập nhật thông tin giao hàng
            </h3>

            <form
              onSubmit={handleSubmit(onSubmit)}
              className="space-y-4 text-gray-700"
            >
              <div>
                <label className="block mb-1 font-medium">Họ và tên</label>
                <input
                  {...register("fullName")}
                  className="w-full rounded-xl p-3 shadow-sm focus:shadow-md focus:ring-2 focus:ring-sky-300 outline-none transition bg-white"
                />
                {errors.fullName && (
                  <p className="text-red-500 text-sm mt-1">
                    {errors.fullName.message}
                  </p>
                )}
              </div>

              <div>
                <label className="block mb-1 font-medium">Số điện thoại</label>
                <input
                  {...register("phoneNumber")}
                  className="w-full rounded-xl p-3 shadow-sm focus:shadow-md focus:ring-2 focus:ring-sky-300 outline-none transition bg-white"
                />
                {errors.phoneNumber && (
                  <p className="text-red-500 text-sm mt-1">
                    {errors.phoneNumber.message}
                  </p>
                )}
              </div>

              <div>
                <label className="block mb-1 font-medium">Địa chỉ</label>
                <textarea
                  {...register("address")}
                  rows={2}
                  className="w-full rounded-xl p-3 shadow-sm focus:shadow-md focus:ring-2 focus:ring-sky-300 outline-none transition bg-white resize-none"
                ></textarea>
                {errors.address && (
                  <p className="text-red-500 text-sm mt-1">
                    {errors.address.message}
                  </p>
                )}
              </div>

              <div className="flex justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setOpenUpdate(false)}
                  className="px-4 py-2 border rounded-lg hover:bg-[#E1F5FE] text-[#0288D1]"
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-[#4FC3F7] text-white rounded-lg hover:bg-[#03A9F4]"
                >
                  Lưu
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ==== Danh sách sản phẩm ==== */}
      <div className="mt-6 border rounded-xl bg-white p-6 shadow-sm">
        <div className="flex items-center gap-2 mb-4 text-[#0288D1] font-semibold text-lg">
          <Package className="w-6 h-6" />
          <span>Đơn Hàng Của Bạn</span>
        </div>

        {!cart?.cartItems?.length ? (
          <div className="flex flex-col items-center justify-center py-16 text-gray-500">
            <div className="bg-sky-100 p-6 rounded-full mb-4 shadow-inner">
              <CreditCard className="w-14 h-14 text-sky-500" />
            </div>
            <p className="text-lg font-semibold text-gray-800">
              Không có sản phẩm để thanh toán
            </p>
            <p className="text-sm text-gray-500 mt-1 mb-6 text-center">
              Hãy thêm sản phẩm vào giỏ hàng trước khi tiến hành thanh toán nhé!
              💙
            </p>
            <button
              onClick={() => navigate("/home")}
              className="flex items-center gap-2 px-5 py-2 bg-sky-500 hover:bg-sky-600 text-white font-semibold rounded-lg shadow-sm transition-all"
            >
              <span>Mua sắm ngay</span>
              <ArrowRight size={18} />
            </button>
          </div>
        ) : (
          <>
            <div className="space-y-3">
              {cart.cartItems.map((item) => (
                <div
                  key={item.id}
                  className="flex items-center justify-between bg-white rounded-xl shadow-sm hover:shadow-md transition-all border border-sky-100 hover:border-sky-200 p-3"
                >
                  {/* Thumbnail + thông tin */}
                  <div className="flex items-center gap-4">
                    <div className="w-16 h-16 rounded-lg overflow-hidden flex-shrink-0 bg-sky-50">
                      <img
                        src={item.thumbnailUrl || "/placeholder.png"}
                        alt={item.productName}
                        className="w-full h-full object-cover hover:scale-105 transition-transform"
                      />
                    </div>

                    <div className="flex flex-col justify-center">
                      <p className="font-semibold text-gray-800 text-base">
                        {item.productName}
                      </p>
                      <p className="text-sm text-gray-500 mt-0.5">
                        SL:{" "}
                        <span className="text-gray-700">{item.quantity}</span> ×{" "}
                        <span className="font-medium text-gray-700">
                          {item.price.toLocaleString()}₫
                        </span>
                      </p>
                    </div>
                  </div>

                  {/* Giá tổng */}
                  <div className="text-right">
                    <p className="font-bold text-sky-600 text-lg">
                      {item.subTotal.toLocaleString()}₫
                    </p>
                  </div>
                </div>
              ))}
            </div>

            {/* Mã giảm giá */}
            <div className="mt-6">
              <div className="flex items-center gap-2 mb-2 text-[#0288D1] font-semibold text-lg">
                <Ticket className="w-5 h-5" />
                <span>Mã giảm giá</span>
              </div>

              <div className="flex gap-2">
                <input
                  value={code}
                  placeholder="Nhập mã giảm giá"
                  onChange={(e) => setCode(e.target.value)}
                  className="flex-1 rounded-xl p-3 shadow-sm focus:shadow-md focus:ring-2 focus:ring-sky-300 outline-none transition bg-white placeholder:text-gray-400"
                />
                <button
                  onClick={() => handleDiscount(code)}
                  className="bg-[#0288D1] text-white px-5 py-2 rounded-xl hover:bg-[#0277BD] shadow-sm hover:shadow-md transition font-medium"
                >
                  Áp mã
                </button>
              </div>
            </div>

            {/* Ghi chú đơn hàng */}
            <div className="mt-6">
              <div className="flex items-center gap-2 mb-2 text-[#0288D1] font-semibold text-lg">
                <StickyNote className="w-5 h-5" />
                <span>Ghi chú đơn hàng</span>
              </div>

              <textarea
                value={note}
                onChange={(e) => setNote(e.target.value)}
                rows={2}
                placeholder="VD: Giao trong giờ hành chính, gọi trước khi đến..."
                className="w-full rounded-xl p-3 shadow-sm focus:shadow-md focus:ring-2 focus:ring-sky-300 outline-none transition bg-white resize-none placeholder:text-gray-400"
              />
            </div>

            {/* Phương thức thanh toán */}
            <div className="mt-4">
              <div className="flex items-center gap-2 mb-2 text-[#0288D1] font-semibold text-lg">
                <Wallet className="w-5 h-5" />
                <span>Phương thức thanh toán</span>
              </div>
              <div className="flex flex-col sm:flex-row gap-4">
                <label className="flex items-center gap-2 cursor-pointer border rounded-lg p-3 hover:bg-[#E1F5FE]/50 transition">
                  <input
                    type="radio"
                    checked={paymentMethod === "COD"}
                    onChange={() => setPaymentMethod("COD")}
                    className="accent-[#0288D1]"
                  />
                  <span>Thanh toán khi nhận hàng (COD)</span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer border rounded-lg p-3 hover:bg-[#E1F5FE]/50 transition">
                  <input
                    type="radio"
                    checked={paymentMethod === "MOMO"}
                    onChange={() => setPaymentMethod("MOMO")}
                    className="accent-[#0288D1]"
                  />
                  <span>Thanh toán online qua Momo</span>
                </label>
              </div>
            </div>

            {/* Tổng tiền */}
            <div className="mt-8 bg-gradient-to-r from-sky-50 to-white border border-sky-100 rounded-xl shadow-sm px-6 py-4 flex justify-between items-center">
              <span className="text-xl font-semibold text-gray-800">
                Tổng tiền
              </span>
              <span className="text-2xl font-bold text-[#0288D1] tracking-wide">
                {(discount?.finalPrice ?? cart?.totalAmount)?.toLocaleString()}₫
              </span>
            </div>

            <button
              onClick={handleCheckout}
              className="w-full mt-5 py-3 bg-[#0288D1] text-white rounded-xl font-medium hover:bg-[#0277BD] transition flex items-center justify-center gap-2 shadow-md hover:shadow-lg"
            >
              <CreditCard size={20} />
              {paymentMethod === "COD"
                ? "Đặt hàng (Thanh toán khi nhận hàng)"
                : "Thanh toán qua Momo"}
            </button>
          </>
        )}
      </div>
    </div>
  );
};

export default CheckoutPage;
