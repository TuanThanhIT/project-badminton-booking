import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import type { DiscountData } from "../../../../types/discount";
import {
  FormDiscountSchema,
  type FormDiscount,
} from "../../../../schemas/FormDiscountSchema";
import { TicketPercent, X, Percent } from "lucide-react";
import { formatPrice } from "../../../../utils/checkout";

type DiscountsFormProps = {
  setOpenDiscount: (open: boolean) => void;
  onSubmit: (data: FormDiscount) => void;
  discounts: DiscountData[];
};

const DiscountsForm = ({
  setOpenDiscount,
  onSubmit,
  discounts,
}: DiscountsFormProps) => {
  const codeSaved = localStorage.getItem("discountCode");

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm<FormDiscount>({
    resolver: zodResolver(FormDiscountSchema),
    mode: "onChange",
    defaultValues: {
      code: codeSaved || "",
    },
  });

  const code = watch("code");

  const isSameAsSaved = code === codeSaved;
  const isEmpty = !code?.trim();

  const isDisableApply = isSameAsSaved || isEmpty;

  const handleSelectDiscount = (value: string) => {
    setValue("code", value, { shouldValidate: true });
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setValue("code", e.target.value, { shouldValidate: true });
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 px-4">
      <div className="bg-white rounded-2xl w-full max-w-2xl shadow-2xl p-6 relative border border-gray-200">
        {/* CLOSE */}
        <button
          onClick={() => setOpenDiscount(false)}
          className="absolute top-4 right-4 text-gray-400 hover:text-gray-800"
        >
          <X size={22} />
        </button>

        {/* HEADER */}
        <div className="flex items-center gap-2 mb-5">
          <Percent className="w-10 h-10 text-sky-500" />
          <div>
            <h3 className="text-xl font-bold text-gray-800">Mã giảm giá</h3>
            <p className="text-sm text-gray-500">Chọn hoặc nhập mã giảm giá</p>
          </div>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
          {/* LIST DISCOUNT */}
          <div className="space-y-3 max-h-[350px] overflow-y-auto pr-1">
            {discounts.map((d) => {
              const isSelected = code === d.code;

              return (
                <div
                  key={d.id}
                  onClick={() => handleSelectDiscount(d.code)}
                  className={`flex items-center gap-4 p-4 rounded-xl border cursor-pointer transition
                ${
                  isSelected
                    ? "border-sky-500 bg-sky-50 shadow-md"
                    : "border-gray-300 hover:border-sky-400 hover:shadow-sm"
                }`}
                >
                  {/* LEFT (VOUCHER STYLE) */}
                  <div className="bg-sky-600 text-white px-5 py-4 rounded-lg flex flex-col justify-center items-center min-w-[110px] relative">
                    <span className="text-xs opacity-90">GIẢM</span>

                    <span className="text-xl font-bold">
                      {d.type === "AMOUNT"
                        ? formatPrice(d.value)
                        : `${d.value}%`}
                    </span>

                    {/* notch */}
                    <div className="absolute left-0 top-1/2 -translate-y-1/2 h-8 w-3 bg-white rounded-r-full"></div>
                    <div className="absolute right-0 top-1/2 -translate-y-1/2 h-8 w-3 bg-white rounded-l-full"></div>
                  </div>

                  {/* CONTENT */}
                  <div className="flex flex-col flex-1">
                    <p className="font-bold text-gray-800">
                      Mã: <span className="text-sky-600">{d.code}</span>
                    </p>

                    <p className="text-sm text-gray-600 mt-1">
                      {d.type === "AMOUNT"
                        ? `Giảm ${formatPrice(d.value)} cho đơn từ ${formatPrice(
                            d.minAmount,
                          )}`
                        : `Giảm ${d.value}% (tối đa ${formatPrice(
                            d.maxDiscount,
                          )}) cho đơn từ ${formatPrice(d.minAmount)}`}
                    </p>

                    <p className="text-xs text-gray-500 mt-1">
                      HSD: {d.endDate}
                    </p>
                  </div>

                  {/* RIGHT BUTTON */}
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleSelectDiscount(d.code);
                    }}
                    className={`px-4 py-2 rounded-lg text-sm font-medium transition
                  ${
                    isSelected
                      ? "bg-sky-500 text-white"
                      : "bg-gray-100 hover:bg-gray-200 text-gray-700"
                  }`}
                  >
                    {isSelected ? "Đã chọn" : "Chọn"}
                  </button>
                </div>
              );
            })}
          </div>

          {/* INPUT CODE */}
          <div>
            <p className="text-sm font-medium text-gray-700 mb-2">
              Hoặc nhập mã
            </p>

            <div className="relative">
              <TicketPercent className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                placeholder="Nhập mã giảm giá"
                value={code || ""}
                onChange={handleInputChange}
                className="w-full pl-10 pr-3 py-3 rounded-xl border border-gray-300 focus:ring-2 focus:ring-sky-400 outline-none"
              />
            </div>

            <input type="hidden" {...register("code")} />

            {errors.code && (
              <p className="text-red-500 text-sm mt-1">{errors.code.message}</p>
            )}
          </div>

          {/* ACTION */}
          <div className="flex justify-end gap-3 mt-4">
            <button
              type="button"
              onClick={() => setOpenDiscount(false)}
              className="px-4 py-2 rounded-xl bg-gray-100 hover:bg-gray-200"
            >
              Hủy
            </button>

            <button
              type="submit"
              disabled={isDisableApply}
              className={`px-5 py-2 rounded-xl font-semibold transition
    ${
      isDisableApply
        ? "bg-gray-300 text-gray-500 cursor-not-allowed"
        : "bg-sky-500 hover:bg-sky-600 text-white"
    }`}
            >
              Áp dụng
            </button>
          </div>
        </form>

        {isSameAsSaved && !isEmpty && (
          <p className="text-xs text-gray-400 mt-1">Mã này đã được áp dụng</p>
        )}
      </div>
    </div>
  );
};

export default DiscountsForm;
