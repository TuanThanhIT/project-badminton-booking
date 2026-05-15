import { zodResolver } from "@hookform/resolvers/zod";
import { CreditCard, Wallet, X } from "lucide-react";
import { useState, type ChangeEvent } from "react";
import { useForm } from "react-hook-form";
import {
  FormWalletDepositSchema,
  type formWalletDeposit,
} from "../../../../schemas/FormWalletDepositSchema";

type DepositFormProps = {
  setOpenDeposit: (open: boolean) => void;
  onSubmit: (data: formWalletDeposit) => void;
};

const quickAmounts = [50000, 100000, 200000, 500000, 1000000];

const DepositForm = ({ setOpenDeposit, onSubmit }: DepositFormProps) => {
  const [selectedAmount, setSelectedAmount] = useState<number | null>(null);

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm<formWalletDeposit>({
    resolver: zodResolver(FormWalletDepositSchema),
    mode: "onChange",
  });

  const amount = watch("amount");

  const handleSelectAmount = (value: number) => {
    setSelectedAmount(value);
    setValue("amount", value, { shouldValidate: true });
  };

  const handleInputChange = (e: ChangeEvent<HTMLInputElement>) => {
    setSelectedAmount(null);
    setValue("amount", Number(e.target.value), { shouldValidate: true });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/50 px-4">
      <div className="relative w-full max-w-md overflow-hidden rounded-[2rem] border border-slate-200 bg-white shadow-2xl">
        <div className="flex items-start justify-between gap-4 border-b border-slate-200 p-5">
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-sky-50 text-sky-600">
              <CreditCard size={21} />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-slate-900">
                Nạp tiền vào ví
              </h3>
              <p className="mt-1 text-sm text-slate-500">
                Thanh toán qua VNPay để cộng tiền vào ví.
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={() => setOpenDeposit(false)}
            className="flex h-10 w-10 items-center justify-center rounded-xl border border-slate-200 text-slate-500 transition hover:bg-slate-50 hover:text-slate-800"
          >
            <X size={18} />
          </button>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-5 p-5">
          <div>
            <p className="mb-3 text-sm font-medium text-slate-700">
              Chọn nhanh số tiền
            </p>
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
              {quickAmounts.map((value) => (
                <button
                  key={value}
                  type="button"
                  onClick={() => handleSelectAmount(value)}
                  className={`rounded-2xl border px-3 py-2.5 text-sm font-medium transition-all ${
                    selectedAmount === value
                      ? "border-sky-500 bg-sky-600 text-white shadow-lg shadow-sky-100"
                      : "border-slate-200 bg-slate-50 text-slate-700 hover:border-sky-200 hover:bg-sky-50 hover:text-sky-700"
                  }`}
                >
                  {value.toLocaleString("vi-VN")}đ
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="mb-2 block text-sm font-medium text-slate-700">
              Hoặc nhập số tiền
            </label>
            <div className="relative">
              <Wallet className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-400" />
              <input
                type="number"
                placeholder="Nhập số tiền"
                value={amount || ""}
                onChange={handleInputChange}
                className="w-full rounded-2xl border border-slate-300 bg-white py-3 pl-12 pr-4 text-sm text-slate-800 outline-none transition placeholder:text-slate-400 focus:border-sky-500 focus:ring-4 focus:ring-sky-100"
              />
            </div>

            <input type="hidden" {...register("amount")} />
            {errors.amount && (
              <p className="mt-2 text-sm font-medium text-rose-600">
                {errors.amount.message}
              </p>
            )}
          </div>

          <div className="flex justify-end gap-3 border-t border-slate-100 pt-5">
            <button
              type="button"
              onClick={() => setOpenDeposit(false)}
              className="rounded-2xl border border-slate-200 bg-white px-5 py-2.5 text-sm font-medium text-slate-600 transition hover:bg-slate-50"
            >
              Hủy
            </button>

            <button
              type="submit"
              className="rounded-2xl bg-sky-600 px-5 py-2.5 text-sm font-semibold text-white shadow-lg shadow-sky-100 transition hover:bg-sky-700 active:scale-[0.98]"
            >
              Nạp tiền
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default DepositForm;
