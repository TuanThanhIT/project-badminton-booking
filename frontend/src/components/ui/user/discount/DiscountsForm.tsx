import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { Percent, TicketPercent, X } from "lucide-react";
import type { DiscountData } from "../../../../types/discount";
import {
  FormDiscountSchema,
  type FormDiscount,
} from "../../../../schemas/FormDiscountSchema";
import { formatPrice } from "../../../../utils/checkout";

type DiscountsFormProps = {
  setOpenDiscount: (open: boolean) => void;
  onSubmit: (data: FormDiscount) => void;
  discounts: DiscountData[];
  storageKey?: string;
};

const DiscountsForm = ({
  setOpenDiscount,
  onSubmit,
  discounts,
  storageKey = "discountCode",
}: DiscountsFormProps) => {
  const codeSaved = localStorage.getItem(storageKey);

  console.log("discounts>>", discounts);

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
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/45 px-4">
      <div className="flex max-h-[82vh] w-full max-w-2xl flex-col overflow-hidden rounded-[2rem] border border-slate-200 bg-white shadow-2xl">
        <div className="flex shrink-0 items-center justify-between border-b border-slate-100 px-5 py-4 sm:px-6">
          <div>
            <h3 className="flex items-center gap-2 text-lg font-semibold text-slate-800">
              <Percent className="h-5 w-5 text-sky-600" />
              Mã giảm giá
            </h3>
            <p className="mt-1 text-sm text-slate-500">
              Chọn hoặc nhập mã giảm giá cho đơn hàng.
            </p>
          </div>

          <button
            type="button"
            onClick={() => setOpenDiscount(false)}
            className="flex h-10 w-10 items-center justify-center rounded-full text-slate-400 transition hover:bg-slate-100 hover:text-slate-700"
          >
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="min-h-0 flex-1">
          <div className="max-h-[48vh] space-y-3 overflow-y-auto bg-slate-50/70 p-4 sm:p-5">
            {discounts.length === 0 ? (
              <div className="rounded-3xl border border-dashed border-slate-300 bg-white px-6 py-12 text-center text-sm text-slate-500">
                Hiện chưa có mã giảm giá phù hợp.
              </div>
            ) : (
              discounts.map((d) => {
                const isSelected = code === d.code;

                return (
                  <button
                    type="button"
                    key={d.id}
                    onClick={() => handleSelectDiscount(d.code)}
                    className={`flex w-full items-stretch gap-4 rounded-3xl border bg-white p-4 text-left transition-all ${
                      isSelected
                        ? "border-sky-300 shadow-[0_10px_26px_rgba(14,165,233,0.1)]"
                        : "border-slate-200 hover:border-sky-200"
                    }`}
                  >
                    <div className="flex min-w-[104px] flex-col items-center justify-center rounded-2xl bg-sky-600 px-4 py-3 text-white">
                      <span className="text-xs opacity-90">GIẢM</span>
                      <span className="mt-1 text-lg font-semibold">
                        {d.type === "AMOUNT"
                          ? formatPrice(d.value)
                          : `${d.value}%`}
                      </span>
                    </div>

                    <div className="min-w-0 flex-1">
                      <p className="font-semibold text-slate-800">
                        Mã: <span className="text-sky-700">{d.code}</span>
                      </p>
                      <p className="mt-1 text-sm leading-6 text-slate-600">
                        {d.type === "AMOUNT"
                          ? `Giảm ${formatPrice(d.value)} cho đơn từ ${formatPrice(
                              d.minAmount,
                            )}`
                          : `Giảm ${d.value}% tối đa ${formatPrice(
                              d.maxDiscount,
                            )} cho đơn từ ${formatPrice(d.minAmount)}`}
                      </p>
                      <p className="mt-1 text-xs text-slate-400">
                        HSD: {d.endDate}
                      </p>
                    </div>

                    <span
                      className={`self-center rounded-full px-3 py-1.5 text-xs font-medium ${
                        isSelected
                          ? "bg-sky-500 text-white"
                          : "bg-slate-100 text-slate-600"
                      }`}
                    >
                      {isSelected ? "Đã chọn" : "Chọn"}
                    </span>
                  </button>
                );
              })
            )}
          </div>

          <div className="space-y-4 border-t border-slate-100 p-5 sm:p-6">
            <div>
              <label className="mb-2 block text-sm font-medium text-slate-600">
                Hoặc nhập mã
              </label>
              <div className="relative">
                <TicketPercent className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-400" />
                <input
                  placeholder="Nhập mã giảm giá"
                  value={code || ""}
                  onChange={handleInputChange}
                  className="w-full rounded-2xl border border-slate-200 bg-slate-50 py-3 pl-11 pr-4 text-sm text-slate-700 outline-none transition-all placeholder:text-slate-400 focus:border-sky-400 focus:bg-white focus:ring-4 focus:ring-sky-100"
                />
              </div>
              <input type="hidden" {...register("code")} />
              {errors.code && (
                <p className="mt-1 text-sm text-red-500">
                  {errors.code.message}
                </p>
              )}
              {isSameAsSaved && !isEmpty && (
                <p className="mt-1 text-xs text-slate-400">
                  Mã này đã được áp dụng.
                </p>
              )}
            </div>

            <div className="flex justify-end gap-3">
              <button
                type="button"
                onClick={() => setOpenDiscount(false)}
                className="rounded-2xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-medium text-slate-600 transition hover:bg-slate-50"
              >
                Hủy
              </button>

              <button
                type="submit"
                disabled={isDisableApply}
                className={`rounded-2xl px-5 py-2.5 text-sm font-semibold transition ${
                  isDisableApply
                    ? "cursor-not-allowed bg-slate-200 text-slate-500"
                    : "bg-sky-500 text-white hover:bg-sky-600"
                }`}
              >
                Áp dụng
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};

export default DiscountsForm;
