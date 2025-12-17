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
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* ===== OVERLAY ===== */}
      <div
        className="absolute inset-0 bg-black/40"
        onClick={() => setOpenAdd(false)}
      />

      {/* ===== MODAL ===== */}
      <div className="relative bg-white w-full max-w-md rounded-2xl shadow-xl overflow-hidden">
        {/* ===== HEADER ===== */}
        <div className="flex items-center justify-between px-6 py-4 border-b bg-gray-50">
          <h2 className="text-lg font-semibold text-gray-800">
            Thêm khuyến mãi
          </h2>
          <button
            onClick={() => setOpenAdd(false)}
            className="p-1 rounded hover:bg-gray-200"
          >
            <X className="w-5 h-5 text-gray-600" />
          </button>
        </div>

        {/* ===== BODY ===== */}
        <form onSubmit={handleSubmit(onSubmit)} className="p-6 space-y-4">
          {/* Mã giảm giá */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Mã giảm giá
            </label>
            <input
              {...register("code")}
              placeholder="Nhập mã giảm giá"
              className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm
                         focus:outline-none focus:ring-2 focus:ring-sky-400"
            />
            {errors.code && (
              <p className="text-red-500 text-sm mt-1">{errors.code.message}</p>
            )}
          </div>

          {/* Loại giảm giá */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Loại giảm giá
            </label>
            <select
              {...register("type")}
              className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm
                         focus:outline-none focus:ring-2 focus:ring-sky-400"
            >
              <option value="">Chọn loại giảm giá</option>
              <option value="PERCENT">Phần trăm</option>
              <option value="AMOUNT">Tiền mặt</option>
            </select>
            {errors.type && (
              <p className="text-red-500 text-sm mt-1">{errors.type.message}</p>
            )}
          </div>

          {/* Giá trị */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Giá trị
            </label>
            <input
              {...register("value")}
              placeholder="Nhập giá trị giảm"
              className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm
                         focus:outline-none focus:ring-2 focus:ring-sky-400"
            />
            {errors.value && (
              <p className="text-red-500 text-sm mt-1">
                {errors.value.message}
              </p>
            )}
          </div>

          {/* Ngày bắt đầu */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Ngày bắt đầu
            </label>
            <input
              type="date"
              {...register("startDate")}
              className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm
                         focus:outline-none focus:ring-2 focus:ring-sky-400"
            />
            {errors.startDate && (
              <p className="text-red-500 text-sm mt-1">
                {errors.startDate.message}
              </p>
            )}
          </div>

          {/* Ngày kết thúc */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Ngày kết thúc
            </label>
            <input
              type="date"
              {...register("endDate")}
              className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm
                         focus:outline-none focus:ring-2 focus:ring-sky-400"
            />
            {errors.endDate && (
              <p className="text-red-500 text-sm mt-1">
                {errors.endDate.message}
              </p>
            )}
          </div>

          {/* Ngưỡng áp dụng */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Ngưỡng áp dụng
            </label>
            <input
              {...register("minOrderAmount")}
              placeholder="Nhập giá trị đơn tối thiểu"
              className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm
                         focus:outline-none focus:ring-2 focus:ring-sky-400"
            />
            {errors.minOrderAmount && (
              <p className="text-red-500 text-sm mt-1">
                {errors.minOrderAmount.message}
              </p>
            )}
          </div>

          {/* ===== FOOTER ===== */}
          <div className="flex justify-end gap-3 pt-4 border-t">
            <button
              type="button"
              onClick={() => setOpenAdd(false)}
              className="px-4 py-2 border rounded-lg text-gray-700 hover:bg-gray-100"
            >
              Hủy
            </button>
            <button
              type="submit"
              disabled={loadingAdd}
              className="px-4 py-2 bg-sky-600 hover:bg-sky-700 text-white rounded-lg
                         flex items-center gap-2 disabled:opacity-60"
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
