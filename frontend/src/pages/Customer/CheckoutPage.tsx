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
import { Loader2, MapPin, X } from "lucide-react";
import { useAppDispatch, useAppSelector } from "../../store/hook";
import { clearCartError } from "../../store/slices/cartSlice";
import {
  applyDiscount,
  clearDiscount,
  clearDiscountError,
} from "../../store/slices/discountSlice";

const CheckoutPage = () => {
  const dispatch = useAppDispatch();

  // --- Form cập nhật thông tin người dùng ---
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

  // --- Redux state ---
  const cart = useAppSelector((state) => state.cart.cart);
  const discount = useAppSelector((state) => state.discount.discount);
  const cartLoading = useAppSelector((state) => state.cart.loading);
  const discountLoading = useAppSelector((state) => state.discount.loading);
  const cartError = useAppSelector((state) => state.cart.error);
  const discountError = useAppSelector((state) => state.discount.error);

  // --- Lấy thông tin user ---
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

  // --- Hiển thị lỗi từ Redux ---
  useEffect(() => {
    const error = cartError || discountError;
    if (error) toast.error(error);
    if (cartError) dispatch(clearCartError());
    if (discountError) dispatch(clearDiscountError());
  }, [cartError, discountError, dispatch]);

  // --- Loading ---
  if (discountLoading || cartLoading) {
    return (
      <div className="flex flex-col justify-center items-center h-[60vh] text-sky-600">
        <Loader2 className="w-10 h-10 animate-spin mb-3" />
        <p className="text-lg font-medium">Đang tải dữ liệu...</p>
      </div>
    );
  }

  // --- Submit cập nhật thông tin ---
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

  // --- Áp mã giảm giá ---
  const handleDiscount = (code: string) => {
    if (!cart?.totalAmount)
      return toast.error("Không có sản phẩm trong giỏ hàng");
    dispatch(applyDiscount({ code, orderAmount: cart.totalAmount }));
    toast.success("Áp mã giảm giá sản phẩm thành công!");
  };

  return (
    <div className="p-6 bg-gradient-to-b from-[#E3F2FD] to-[#FFFFFF] min-h-screen">
      {/* ==== Thông tin thanh toán & nhận hàng ==== */}
      <div className="border rounded-xl bg-white p-5 shadow-md">
        <div className="flex items-center gap-2 text-[#0288D1] font-semibold mb-4 text-lg">
          <MapPin className="w-6 h-6" />
          <span>Thông Tin Thanh Toán & Nhận Hàng</span>
        </div>

        {userInfo && (
          <div className="flex justify-between items-center">
            <div className="text-gray-800 text-[16px] font-medium flex flex-wrap gap-3 leading-relaxed">
              <span className="font-semibold text-[17px] text-[#0277BD]">
                {userInfo.fullName}
              </span>
              <span className="text-gray-700">
                (+84) {userInfo.phoneNumber}
              </span>
              <span className="text-gray-700">• {userInfo.address}</span>
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
                  className="w-full border rounded-lg p-2.5 focus:ring-2 focus:ring-[#4FC3F7]"
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
                  className="w-full border rounded-lg p-2.5 focus:ring-2 focus:ring-[#4FC3F7]"
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
                  className="w-full border rounded-lg p-2.5 resize-none focus:ring-2 focus:ring-[#4FC3F7]"
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

      {/* ==== Giỏ hàng + Mã giảm giá ==== */}
      <div className="mt-6">
        {cart?.cartItems?.map((item) => (
          <ul key={item.id}>
            <li>{item.productName}</li>
            <li>{item.price}</li>
            <li>{item.quantity}</li>
            <li>{item.subTotal}</li>
          </ul>
        ))}
      </div>

      <div className="mt-4 flex gap-2">
        <input
          placeholder="Áp mã giảm giá"
          onChange={(e) => setCode(e.target.value)}
          className="border p-2 rounded-md"
        />
        <button
          onClick={() => handleDiscount(code)}
          className="bg-sky-500 text-white px-4 py-2 rounded-md hover:bg-sky-600"
        >
          Áp mã
        </button>
      </div>

      <div className="mt-3 text-lg font-semibold">
        Tổng tiền: {discount?.finalPrice ?? cart?.totalAmount}₫
      </div>
    </div>
  );
};

export default CheckoutPage;
