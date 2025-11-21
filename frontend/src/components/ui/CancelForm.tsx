import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import {
  FormCancelOrderSchema,
  type formCancelOrder,
} from "../../schemas/FormCancelOrderSchema";
import { X } from "lucide-react";

type CancelFormProps = {
  setOpenCancel: (open: boolean) => void;
  onSubmit: (data: formCancelOrder) => void;
  type: "product" | "booking";
};

const CancelForm = (props: CancelFormProps) => {
  const { setOpenCancel, onSubmit, type } = props;
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<formCancelOrder>({
    resolver: zodResolver(FormCancelOrderSchema),
    mode: "onChange",
  });

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
      <div className="bg-white rounded-2xl w-[420px] shadow-2xl p-6 relative border-t-4 border-sky-400">
        <button
          onClick={() => setOpenCancel(false)}
          className="absolute top-3 right-3 text-gray-500 hover:text-gray-800"
        >
          <X size={20} />
        </button>

        <h3 className="text-2xl font-semibold mb-4 text-center text-sky-700">
          {type === "product" ? "Lý do hủy đơn hàng" : "Lý do hủy sân"}
        </h3>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
          <div>
            <textarea
              {...register("cancelReason")}
              rows={4}
              placeholder={
                type === "product"
                  ? "Nhập chi tiết lý do hủy đơn hàng ..."
                  : "Nhập chi tiết lý do hủy sân..."
              }
              className="w-full rounded-xl p-3 border border-gray-400 bg-white shadow-sm resize-none focus:outline-none focus:ring-0 focus:border-gray-400"
            />
            {errors.cancelReason && (
              <p className="text-red-500 text-sm mt-1">
                {errors.cancelReason.message}
              </p>
            )}
          </div>

          <div className="flex justify-end gap-3">
            <button
              type="button"
              onClick={() => setOpenCancel(false)}
              className="px-4 py-2 rounded-full border border-gray-200 text-gray-600 hover:bg-gray-50 transition"
            >
              Đóng
            </button>
            <button
              type="submit"
              className="px-4 py-2 rounded-full bg-sky-500 text-white font-medium hover:bg-sky-600 transition"
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
