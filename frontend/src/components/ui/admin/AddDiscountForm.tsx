import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { X, Loader2, Save } from "lucide-react";
import {
  FormAddDiscountSchema,
  type formAddDiscountSchema,
} from "../../../schemas/FormAddDiscountSchema";

type AddDiscountFormProps = {
  setOpenAdd: (open: boolean) => void;
  onSubmit: (data: formAddDiscountSchema) => void;
  loadingAdd: boolean;
};

const AddDiscountForm = ({
  setOpenAdd,
  onSubmit,
  loadingAdd,
}: AddDiscountFormProps) => {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<formAddDiscountSchema>({
    resolver: zodResolver(FormAddDiscountSchema),
    mode: "onChange",
  });

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 px-4">
      <div className="bg-white rounded-3xl w-full max-w-md shadow-2xl p-6 relative border-t-4 border-gradient-to-r from-sky-400 to-sky-600">
        {/* Close button */}
        <button
          onClick={() => setOpenAdd(false)}
          className="absolute top-4 right-4 text-gray-400 hover:text-gray-800 transition"
        >
          <X size={24} />
        </button>

        {/* Header */}
        <h3 className="text-2xl font-bold mb-5 text-center text-sky-700">
          Thêm khuyến mãi
        </h3>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-3">
          {/* Code */}
          <div className="flex flex-col">
            <label className="text-sm text-gray-600 mb-0.5">Mã giảm giá</label>
            <input
              {...register("code")}
              placeholder="Nhập mã giảm giá"
              className="w-full rounded-2xl p-2.5 border border-gray-300 bg-gray-50 shadow-sm focus:outline-none focus:ring-2 focus:ring-sky-300"
            />
            {errors.code && (
              <p className="text-red-500 text-xs mt-0.5">
                {errors.code.message}
              </p>
            )}
          </div>

          {/* Type */}
          <div className="flex flex-col">
            <label className="text-sm text-gray-600 mb-0.5">
              Loại giảm giá
            </label>
            <select
              {...register("type")}
              className="w-full rounded-2xl p-2.5 border border-gray-300 bg-gray-50 shadow-sm focus:outline-none focus:ring-2 focus:ring-sky-300"
            >
              <option value="">Chọn loại giảm giá</option>
              <option value="PERCENT">Phần trăm</option>
              <option value="AMOUNT">Tiền mặt</option>
            </select>
            {errors.type && (
              <p className="text-red-500 text-xs mt-0.5">
                {errors.type.message}
              </p>
            )}
          </div>

          {/* Value */}
          <div className="flex flex-col">
            <label className="text-sm text-gray-600 mb-0.5">Giá trị</label>
            <input
              type="text"
              {...register("value")}
              placeholder="Nhập giá trị giảm giá"
              className="w-full rounded-2xl p-2.5 border border-gray-300 bg-gray-50 shadow-sm focus:outline-none focus:ring-2 focus:ring-sky-300"
            />
            {errors.value && (
              <p className="text-red-500 text-xs mt-0.5">
                {errors.value.message}
              </p>
            )}
          </div>

          {/* Start & End Date */}
          <div className="flex flex-col">
            <label className="text-sm text-gray-600 mb-0.5">Ngày bắt đầu</label>
            <input
              type="date"
              {...register("startDate")}
              className="w-full rounded-2xl p-2.5 border border-gray-300 bg-gray-50 shadow-sm focus:outline-none focus:ring-2 focus:ring-sky-300"
            />
            {errors.startDate && (
              <p className="text-red-500 text-xs mt-0.5">
                {errors.startDate.message}
              </p>
            )}
          </div>

          <div className="flex flex-col">
            <label className="text-sm text-gray-600 mb-0.5">
              Ngày kết thúc
            </label>
            <input
              type="date"
              {...register("endDate")}
              className="w-full rounded-2xl p-2.5 border border-gray-300 bg-gray-50 shadow-sm focus:outline-none focus:ring-2 focus:ring-sky-300"
            />
            {errors.endDate && (
              <p className="text-red-500 text-xs mt-0.5">
                {errors.endDate.message}
              </p>
            )}
          </div>

          {/* Min Order */}
          <div className="flex flex-col">
            <label className="text-sm text-gray-600 mb-0.5">
              Ngưỡng áp dụng
            </label>
            <input
              {...register("minOrderAmount")}
              placeholder="Nhập ngưỡng áp dụng tối thiểu"
              className="w-full rounded-2xl p-2.5 border border-gray-300 bg-gray-50 shadow-sm focus:outline-none focus:ring-2 focus:ring-sky-300"
            />
            {errors.minOrderAmount && (
              <p className="text-red-500 text-xs mt-0.5">
                {errors.minOrderAmount.message}
              </p>
            )}
          </div>

          {/* Buttons */}
          <div className="flex justify-end gap-2 flex-wrap">
            <button
              type="button"
              onClick={() => setOpenAdd(false)}
              className="px-4 py-1.5 rounded-full border text-gray-600 hover:bg-gray-100"
            >
              Đóng
            </button>
            <button
              type="submit"
              disabled={loadingAdd}
              className="px-4 py-1.5 rounded-full bg-sky-600 text-white font-semibold hover:bg-sky-700 flex items-center justify-center gap-2"
            >
              {loadingAdd ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Đang lưu...
                </>
              ) : (
                <>
                  <Save className="w-4 h-4" />
                  Lưu
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddDiscountForm;
