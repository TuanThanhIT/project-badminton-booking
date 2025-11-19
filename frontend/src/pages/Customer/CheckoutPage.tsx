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
  Truck,
  DollarSign,
  Smartphone,
  Check,
} from "lucide-react";
import { useAppDispatch, useAppSelector } from "../../store/hook";
import { clearCartError } from "../../store/slices/cartSlice";
import {
  applyDiscount,
  clearDiscountError,
  updateDiscount,
} from "../../store/slices/discountSlice";
import { useNavigate } from "react-router-dom";
import { addOrder, clearOrdersError } from "../../store/slices/orderSlice";
import type { AddOrderRequest, MomoPaymentRequest } from "../../types/order";
import OrderService from "../../services/orderService";

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
  const [finalPrice, setFinalPrice] = useState<number>();

  const cart = useAppSelector((state) => state.cart.cart);
  const discount = useAppSelector((state) => state.discount.discount);
  const cartLoading = useAppSelector((state) => state.cart.loading);
  const discountLoading = useAppSelector((state) => state.discount.loading);
  const cartError = useAppSelector((state) => state.cart.error);
  const discountError = useAppSelector((state) => state.discount.error);
  const orderError = useAppSelector((state) => state.order.error);

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
    const error = cartError || discountError || orderError;
    if (error) toast.error(error);
    if (cartError) dispatch(clearCartError());
    if (discountError) {
      dispatch(clearDiscountError());
      setCode("");
    }
    if (orderError) dispatch(clearOrdersError());
  }, [cartError, discountError, orderError, dispatch]);

  if (discountLoading || cartLoading) {
    return (
      <div className="flex flex-col justify-center items-center h-[60vh] text-[#0288D1]">
        <Loader2 className="w-10 h-10 animate-spin mb-3" />
        <p className="text-lg font-semibold">Đang tải dữ liệu...</p>
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
    try {
      if (!cart?.totalAmount) {
        toast.error("Không có sản phẩm trong giỏ hàng");
        return;
      }
      const res = await dispatch(
        applyDiscount({ code, orderAmount: cart.totalAmount })
      ).unwrap();
      setCheckApply(true);
      setFinalPrice(res.finalPrice);
      toast.success("Áp mã giảm giá sản phẩm thành công!");
    } catch (error) {
      // lỗi đã xử lý cục bộ
    }
  };

  const handleCheckout = async () => {
    if (checkApply && code) {
      await dispatch(updateDiscount({ code }));
    }

    const orderDetails =
      cart?.cartItems?.map((item) => ({
        quantity: item.quantity,
        subTotal: item.subTotal,
        varientId: item.varientId,
      })) || [];

    const orderData: AddOrderRequest = {
      orderStatus: "Pending",
      totalAmount: discount?.finalPrice ?? cart?.totalAmount ?? 0,
      code,
      note,
      orderDetails,
      paymentAmount: discount?.finalPrice ?? cart?.totalAmount ?? 0,
      paymentMethod,
      paymentStatus: "Pending",
    };

    const resultAction = await dispatch(addOrder({ data: orderData }));

    if (addOrder.fulfilled.match(resultAction)) {
      const orderId = resultAction.payload.orderId;
      if (paymentMethod === "COD") {
        toast.success(resultAction.payload.message);
        setTimeout(() => navigate("/orders/success"), 2000);
      } else if (paymentMethod === "MOMO") {
        try {
          const momoOrderId = `${orderId}_${Date.now()}`;
          const data: MomoPaymentRequest = {
            orderId: momoOrderId,
            amount: orderData.paymentAmount,
            orderInfo: `Thanh toán đơn hàng #${orderId}`,
          };
          const res = await OrderService.createMoMoPaymentService(data);
          if (res.data.payUrl) {
            window.location.href = res.data.payUrl;
          } else {
            toast.error("Không tạo được đường dẫn thanh toán Momo");
          }
        } catch (error: any) {
          const apiError = error as ApiErrorType;
          toast.error(apiError.userMessage || "Tạo thanh toán Momo thất bại");
        }
      }
    }
  };

  return (
    <div className="p-6 bg-white min-h-screen">
      {/* ==== Thông tin giao hàng ==== */}
      <div className="border border-gray-300 rounded-xl bg-white p-6">
        <div className="flex items-center gap-2 text-[#0288D1] font-semibold mb-4 text-lg">
          <MapPin className="w-6 h-6 text-[#0288D1]" />
          <span>Thông Tin Thanh Toán & Nhận Hàng</span>
        </div>

        {userInfo && (
          <div className="flex justify-between items-center flex-wrap gap-2">
            <div className="text-gray-800 font-medium">
              <span className="font-semibold text-[#0288D1] text-[17px]">
                {userInfo.fullName}
              </span>{" "}
              | (+84) {userInfo.phoneNumber}
              <p className="text-gray-700">{userInfo.address}</p>
            </div>
            <button
              onClick={() => setOpenUpdate(true)}
              className="text-[#0288D1] hover:text-[#01579B] font-semibold transition"
            >
              Thay Đổi
            </button>
          </div>
        )}
      </div>

      {/* ==== Form cập nhật thông tin ==== */}
      {openUpdate && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl w-[420px] shadow-2xl p-6 relative border-t-4 border-[#0288D1]">
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
                  className="w-full rounded-xl p-3 shadow-sm focus:shadow-md focus:ring-2 focus:ring-[#0288D1] outline-none transition bg-white"
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
                  className="w-full rounded-xl p-3 shadow-sm focus:shadow-md focus:ring-2 focus:ring-[#0288D1] outline-none transition bg-white"
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
                  className="w-full rounded-xl p-3 shadow-sm focus:shadow-md focus:ring-2 focus:ring-[#0288D1] outline-none transition bg-white resize-none"
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
                  className="px-4 py-2 bg-[#0288D1] text-white rounded-lg hover:bg-[#0277BD]"
                >
                  Lưu
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ==== Danh sách sản phẩm ==== */}
      <div className="mt-6 border border-gray-300 rounded-xl bg-white p-6">
        <div className="flex items-center gap-2 mb-4 text-[#0288D1] font-semibold text-lg">
          <Package className="w-6 h-6 text-[#0288D1]" />
          <span>Đơn Hàng Của Bạn</span>
        </div>

        {!cart?.cartItems?.length ? (
          <div className="flex flex-col items-center justify-center py-16 text-gray-500">
            <div className="bg-sky-100 p-6 rounded-full mb-4 shadow-inner">
              <CreditCard className="w-14 h-14 text-[#0288D1]" />
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
              className="flex items-center gap-2 px-5 py-2 bg-[#0288D1] hover:bg-[#0277BD] text-white font-semibold rounded-lg shadow-sm transition-all"
            >
              <span>Mua sắm ngay</span>
              <ArrowRight size={18} />
            </button>
          </div>
        ) : (
          <>
            {/* Cart Items */}
            <div className="space-y-3">
              {cart.cartItems.map((item) => (
                <div
                  key={item.id}
                  className="flex items-center justify-between bg-white rounded-xl shadow-sm hover:shadow-md transition-all border border-[#0288D1]/30 p-3"
                >
                  <div className="flex items-center gap-4">
                    <div className="w-16 h-16 rounded-lg overflow-hidden flex-shrink-0 bg-[#E3F2FD]">
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
                  <div className="text-right">
                    <p className="font-bold text-[#0288D1] text-lg">
                      {item.subTotal.toLocaleString()}₫
                    </p>
                  </div>
                </div>
              ))}
            </div>

            {/* Mã giảm giá */}
            <div className="mt-6">
              <div className="flex items-center gap-2 mb-2 text-[#0288D1] font-semibold text-lg">
                <Ticket className="w-5 h-5 text-[#0288D1]" />
                <span>Mã giảm giá</span>
              </div>
              <div className="flex gap-2">
                <input
                  value={code}
                  placeholder="Nhập mã giảm giá"
                  onChange={(e) => setCode(e.target.value)}
                  className="flex-1 rounded-xl p-3 border border-gray-300 focus:shadow-md focus:ring-2 focus:ring-[#0288D1] outline-none transition bg-white placeholder:text-gray-400"
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
                <StickyNote className="w-5 h-5 text-[#0288D1]" />
                <span>Ghi chú đơn hàng</span>
              </div>
              <textarea
                value={note}
                onChange={(e) => setNote(e.target.value)}
                rows={2}
                placeholder="VD: Giao trong giờ hành chính, gọi trước khi đến..."
                className="w-full rounded-xl p-3 border border-gray-300 focus:shadow-md focus:ring-2 focus:ring-[#0288D1] outline-none transition bg-white resize-none placeholder:text-gray-400"
              />
            </div>

            {/* Phương thức thanh toán */}
            <div className="mt-4">
              <div className="flex items-center gap-2 mb-3 text-[#0288D1] font-semibold text-lg">
                <Wallet className="w-5 h-5 text-[#0288D1]" />
                <span>Phương thức thanh toán</span>
              </div>

              <div className="flex flex-col sm:flex-row gap-4">
                {/* COD */}
                <label
                  className={`relative flex items-center gap-4 cursor-pointer border rounded-xl p-4 transition 
                  ${
                    paymentMethod === "COD"
                      ? "bg-[#E3F2FD] border-[#0288D1] shadow-md"
                      : "hover:bg-[#E3F2FD] border-gray-300"
                  }`}
                >
                  <input
                    type="radio"
                    checked={paymentMethod === "COD"}
                    onChange={() => setPaymentMethod("COD")}
                    className="absolute opacity-0 w-0 h-0"
                  />
                  <DollarSign className="w-8 h-8 text-[#0288D1] flex-shrink-0" />
                  <div className="flex flex-col">
                    <span className="font-semibold text-gray-800 text-base">
                      Thanh toán khi nhận hàng
                    </span>
                    <span className="text-sm text-gray-500">(COD)</span>
                  </div>
                  {paymentMethod === "COD" && (
                    <div className="ml-auto text-white bg-[#0288D1] w-6 h-6 rounded-full flex items-center justify-center">
                      <Check className="w-4 h-4" />
                    </div>
                  )}
                </label>

                {/* MoMo */}
                <label
                  className={`relative flex items-center gap-4 cursor-pointer border rounded-xl p-4 transition 
                  ${
                    paymentMethod === "MOMO"
                      ? "bg-[#E3F2FD] border-[#0288D1] shadow-md"
                      : "hover:bg-[#E3F2FD] border-gray-300"
                  }`}
                >
                  <input
                    type="radio"
                    checked={paymentMethod === "MOMO"}
                    onChange={() => setPaymentMethod("MOMO")}
                    className="absolute opacity-0 w-0 h-0"
                  />
                  <Smartphone className="w-8 h-8 text-[#0288D1] flex-shrink-0" />
                  <div className="flex flex-col">
                    <span className="font-semibold text-gray-800 text-base">
                      Thanh toán online
                    </span>
                    <span className="text-sm text-gray-500">qua MoMo</span>
                  </div>
                  {paymentMethod === "MOMO" && (
                    <div className="ml-auto text-white bg-[#0288D1] w-6 h-6 rounded-full flex items-center justify-center">
                      <Check className="w-4 h-4" />
                    </div>
                  )}
                </label>
              </div>
            </div>

            {/* Phí vận chuyển */}
            <div className="mt-4 flex items-center gap-2 mb-2 text-[#0288D1] font-semibold text-lg">
              <Truck className="w-5 h-5 text-[#0288D1]" />
              <span>Phí vận chuyển</span>
              <span className="ml-auto text-green-700 font-medium">
                Miễn phí
              </span>
            </div>

            {/* Tổng tiền */}
            <div className="mt-8 bg-gradient-to-r from-sky-50 to-white border border-sky-100 rounded-xl shadow-sm px-6 py-4 flex justify-between items-center">
              <span className="text-xl font-semibold text-[#0288D1]">
                Tổng tiền
              </span>
              <span className="text-2xl font-bold text-[#0288D1] tracking-wide">
                {(finalPrice ?? cart?.totalAmount)?.toLocaleString()}₫
              </span>
            </div>

            {/* Button thanh toán */}
            <button
              onClick={handleCheckout}
              className="w-full mt-5 py-3 bg-[#0288D1] text-white rounded-xl font-semibold hover:bg-[#0277BD] transition flex items-center justify-center gap-2 shadow-md hover:shadow-lg"
            >
              <CreditCard size={20} />
              {paymentMethod === "COD"
                ? "Đặt hàng ngay - Thanh toán khi nhận hàng"
                : "Thanh toán an toàn qua Momo"}
            </button>
          </>
        )}
      </div>
    </div>
  );
};

export default CheckoutPage;
