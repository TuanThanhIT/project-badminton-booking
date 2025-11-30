import { useEffect, useState } from "react";
import { useAppDispatch, useAppSelector } from "../../store/hook";
import {
  getDiscount,
  getDiscountBooking,
} from "../../store/slices/customer/discountSlice";
import { toast } from "react-toastify";
import { X, TicketPercent } from "lucide-react";
import type { DiscountListResponse } from "../../types/discount";

const DiscountSection = () => {
  const dispatch = useAppDispatch();
  const { discountBookings, discounts } = useAppSelector(
    (state) => state.discount
  );

  const [open, setOpen] = useState(false);
  const [discount, setDiscount] = useState<DiscountListResponse>();

  const formatDateTime = (isoString?: string) => {
    if (!isoString) return "";
    const date = new Date(isoString);
    return date.toLocaleString("vi-VN", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  useEffect(() => {
    dispatch(getDiscount());
    dispatch(getDiscountBooking());
  }, [dispatch]);

  const renderVoucherList = (
    list: DiscountListResponse[],
    title: string,
    type: "booking" | "product"
  ) => (
    <>
      <h2 className="text-xl font-bold mb-4 flex items-center gap-2 text-sky-700">
        <TicketPercent size={22} />
        {title}
      </h2>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
        {list.length === 0 && (
          <div className="col-span-full flex flex-col items-center justify-center py-10 text-center">
            <div className="w-16 h-16 flex items-center justify-center bg-sky-100 text-sky-600 rounded-full shadow-inner mb-3">
              🎫
            </div>
            <h3 className="text-lg font-semibold text-gray-700">
              Hiện chưa có voucher nào
            </h3>
            <p className="text-gray-500 text-sm mt-1">
              Hãy quay lại sau để nhận ưu đãi mới nhất từ B-Hub!
            </p>
          </div>
        )}

        {list.map((d) => {
          const minAmount =
            type === "booking" ? d.minBookingAmount : d.minOrderAmount;
          return (
            <div
              key={d.code}
              className="w-full flex items-center gap-4 bg-white rounded-xl shadow-md p-3 border border-gray-400 hover:shadow-lg transition"
            >
              {/* Khối trái */}
              <div className="bg-sky-600 text-white px-5 py-4 rounded-lg flex flex-col justify-center items-center min-w-[90px] relative">
                <span className="text-xs font-semibold opacity-90">TẶNG</span>
                <span className="text-2xl font-bold">
                  {d.type === "AMOUNT" ? `${d.value}₫` : `${d.value}%`}
                </span>
                <div className="absolute left-0 top-1/2 -translate-y-1/2 h-8 w-3 bg-white rounded-r-full"></div>
                <div className="absolute right-0 top-1/2 -translate-y-1/2 h-8 w-3 bg-white rounded-l-full"></div>
              </div>

              {/* Khối nội dung */}
              <div className="flex flex-col flex-grow">
                <h4 className="font-bold text-gray-800">NHẬP MÃ: {d.code}</h4>
                <p className="text-gray-600 text-sm">
                  {d.type === "AMOUNT"
                    ? `- Giảm ${d.value}₫ cho thanh toán từ ${minAmount}₫.`
                    : `- Giảm ${d.value}% cho thanh toán từ ${minAmount}₫.`}
                </p>

                {/* Buttons */}
                <div className="flex items-center gap-4 mt-2">
                  <button
                    onClick={() => {
                      navigator.clipboard.writeText(d.code);
                      toast.success(`Đã sao chép mã: ${d.code}`);
                    }}
                    className="px-4 py-1.5 bg-sky-600 text-white rounded-full text-sm font-semibold hover:bg-sky-700 transition"
                  >
                    Sao chép mã
                  </button>

                  <button
                    onClick={() => {
                      setDiscount(d);
                      setOpen(true);
                    }}
                    className="text-sky-600 text-sm font-medium hover:underline"
                  >
                    Điều kiện
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </>
  );

  return (
    <div className="w-full">
      {/* Voucher đặt sân */}
      {renderVoucherList(discountBookings, "Voucher đặt sân", "booking")}

      {/* Voucher mua hàng */}
      {renderVoucherList(discounts, "Voucher mua hàng", "product")}

      {/* Modal */}
      {open && discount && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl w-[420px] shadow-2xl relative border-t-4 py-5 border-sky-400">
            <button
              onClick={() => setOpen(false)}
              className="absolute top-3 right-3 text-gray-500 hover:text-gray-800"
            >
              <X size={20} />
            </button>

            <div className="flex flex-col gap-2 px-5">
              <h3 className="text-center font-bold text-lg text-gray-700">
                NHẬP MÃ: {discount.code}
              </h3>

              <div className="bg-gray-100 p-3 rounded-lg">
                <p>
                  Mã khuyến mãi: <b>{discount.code}</b>
                </p>
              </div>

              <div className="mt-1">
                <p className="font-medium mb-1">Điều kiện áp dụng:</p>
                <p className="text-gray-600 text-sm">
                  {discount.type === "AMOUNT"
                    ? `- Giảm ${discount.value}₫ cho hóa đơn từ ${
                        discount.minBookingAmount ?? discount.minOrderAmount
                      }₫.`
                    : `- Giảm ${discount.value}% cho hóa đơn từ ${
                        discount.minBookingAmount ?? discount.minOrderAmount
                      }₫.`}
                </p>
                <p className="text-gray-600 text-sm">
                  - Áp dụng từ: <b>{formatDateTime(discount.startDate)}</b> đến{" "}
                  <b>{formatDateTime(discount.endDate)}</b>.
                </p>
              </div>

              <div className="grid grid-cols-2 gap-3 mt-4">
                <button
                  onClick={() => {
                    navigator.clipboard.writeText(discount.code);
                    toast.success(`Đã sao chép mã: ${discount.code}`);
                  }}
                  className="py-2 bg-sky-600 text-white rounded-full text-sm font-semibold hover:bg-sky-700 transition"
                >
                  Sao chép mã
                </button>

                <button
                  onClick={() => setOpen(false)}
                  className="py-2 text-blue-900 border border-sky-300 rounded-full text-sm font-semibold transition"
                >
                  Đóng
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default DiscountSection;
