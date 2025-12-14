import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import {
  FormCancelOrderSchema,
  type formCancelOrder,
} from "../../../schemas/FormCancelOrderSchema";
import { X } from "lucide-react";

type CancelFormProps = {
  setOpenCancel: (open: boolean) => void;
  onSubmit: (data: formCancelOrder) => void;
  type: "product" | "booking";
  refundAmount?: number;
};

const CancelForm = (props: CancelFormProps) => {
  const { setOpenCancel, onSubmit, type, refundAmount } = props;

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<formCancelOrder>({
    resolver: zodResolver(FormCancelOrderSchema),
    mode: "onChange",
  });

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 px-4">
      <div className="bg-white rounded-3xl w-full max-w-md shadow-2xl p-6 relative border-t-4 border-gradient-to-r from-sky-400 to-sky-600">
        {/* Close button */}
        <button
          onClick={() => setOpenCancel(false)}
          className="absolute top-4 right-4 text-gray-400 hover:text-gray-800 transition"
        >
          <X size={24} />
        </button>

        {/* Header */}
        <h3 className="text-2xl font-bold mb-5 text-center text-sky-700">
          {type === "product" ? "Hủy đơn hàng" : "Hủy đặt sân"}
        </h3>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
          {/* Textarea */}
          <div>
            <textarea
              {...register("cancelReason")}
              rows={5}
              placeholder={
                type === "product"
                  ? "Nhập chi tiết lý do hủy đơn hàng..."
                  : "Nhập chi tiết lý do hủy sân..."
              }
              className="w-full rounded-2xl p-4 border border-gray-300 bg-gray-50 shadow-sm focus:outline-none focus:ring-2 focus:ring-sky-300 focus:border-transparent placeholder-gray-400 resize-none transition"
            />
            {errors.cancelReason && (
              <p className="text-red-500 text-sm mt-1">
                {errors.cancelReason.message}
              </p>
            )}
          </div>

          {/* Refund amount */}
          {refundAmount && (
            <div className="p-3 bg-green-50 border border-green-200 rounded-lg text-green-800 font-semibold text-center">
              Số tiền cần hoàn lại cho khách:{" "}
              {refundAmount.toLocaleString("vi-VN")}₫
            </div>
          )}

          {/* Buttons */}
          <div className="flex justify-end gap-3 flex-wrap">
            <button
              type="button"
              onClick={() => setOpenCancel(false)}
              className="px-5 py-2 rounded-full border border-gray-300 text-gray-600 hover:bg-gray-100 transition font-medium"
            >
              Đóng
            </button>
            <button
              type="submit"
              className="px-5 py-2 rounded-full bg-sky-600 text-white font-semibold hover:bg-sky-700 transition shadow-md"
            >
              Gửi
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CancelForm;
