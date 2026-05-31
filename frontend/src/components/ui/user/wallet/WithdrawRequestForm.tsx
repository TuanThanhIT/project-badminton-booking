import { zodResolver } from "@hookform/resolvers/zod";
import { CreditCard, Hash, Landmark, User, Wallet, X } from "lucide-react";
import { useEffect, useState, type ChangeEvent } from "react";
import { useForm } from "react-hook-form";
import {
  FormWithdrawRequestSchema,
  type formWithdrawRequest,
} from "../../../../schemas/FormWithdrawRequestSchema";
import LoadingButton from "../../common/LoadingButton";

type WithdrawRequestFormProps = {
  setOpenWithdraw: (open: boolean) => void;
  onSubmit: (data: formWithdrawRequest) => void;
  loading: boolean;
};

const quickAmounts = [50000, 100000, 200000, 500000, 1000000];

const popularBanks = ["Vietcombank", "BIDV", "Techcombank", "MB Bank", "ACB"];

const allBanks = [
  "Vietcombank",
  "BIDV",
  "Techcombank",
  "MB Bank",
  "ACB",
  "Sacombank",
  "VPBank",
  "TPBank",
  "Agribank",
  "SHB",
  "HDBank",
  "OCB",
];

const inputClass =
  "w-full rounded-2xl border border-slate-300 bg-white py-3 pl-12 pr-4 text-sm text-slate-800 outline-none transition placeholder:text-slate-400 focus:border-sky-500 focus:ring-1 focus:ring-sky-100";

const WithdrawRequestForm = ({
  setOpenWithdraw,
  onSubmit,
  loading,
}: WithdrawRequestFormProps) => {
  const [selectedAmount, setSelectedAmount] = useState<number | null>(null);

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm<formWithdrawRequest>({
    resolver: zodResolver(FormWithdrawRequestSchema),
    mode: "onChange",
  });

  useEffect(() => {
    register("amount");
  }, [register]);

  const amount = watch("amount");
  const selectedBank = watch("bankName");

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
      <div className="relative max-h-[92vh] w-full max-w-2xl overflow-y-auto rounded-[2rem] border border-slate-200 bg-white shadow-2xl">
        <div className="flex items-start justify-between gap-4 border-b border-slate-200 p-5">
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-sky-50 text-sky-600">
              <CreditCard size={21} />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-slate-900">
                Yêu cầu rút tiền
              </h3>
              <p className="mt-1 text-sm text-slate-500">
                Nhập tài khoản ngân hàng để nhận tiền sau khi xác thực OTP.
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={() => setOpenWithdraw(false)}
            className="flex h-10 w-10 items-center justify-center rounded-xl border border-slate-200 text-slate-500 transition hover:bg-slate-50 hover:text-slate-800"
          >
            <X size={18} />
          </button>
        </div>

        <form
          onSubmit={handleSubmit(onSubmit)}
          className="grid gap-5 p-5 md:grid-cols-2"
        >
          <div className="space-y-5">
            <div>
              <p className="mb-3 text-sm font-medium text-slate-700">
                Chọn nhanh số tiền
              </p>
              <div className="grid grid-cols-2 gap-3">
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
                Số tiền cần rút
              </label>
              <div className="relative">
                <Wallet className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-400" />
                <input
                  type="number"
                  placeholder="Nhập số tiền"
                  value={amount || ""}
                  onChange={handleInputChange}
                  className={inputClass}
                />
              </div>
              {errors.amount && (
                <p className="mt-2 text-sm font-medium text-rose-600">
                  {errors.amount.message}
                </p>
              )}
            </div>
          </div>

          <div className="space-y-5">
            <div>
              <label className="mb-2 block text-sm font-medium text-slate-700">
                Ngân hàng
              </label>
              <div className="mb-3 flex flex-wrap gap-2">
                {popularBanks.map((bank) => (
                  <button
                    key={bank}
                    type="button"
                    onClick={() =>
                      setValue("bankName", bank, { shouldValidate: true })
                    }
                    className={`inline-flex items-center gap-1.5 rounded-xl border px-3 py-1.5 text-sm font-medium transition ${
                      selectedBank === bank
                        ? "border-sky-500 bg-sky-600 text-white"
                        : "border-slate-200 bg-white text-slate-700 hover:bg-sky-50 hover:text-sky-700"
                    }`}
                  >
                    <Landmark className="h-3.5 w-3.5" />
                    {bank}
                  </button>
                ))}
              </div>

              <div className="relative">
                <Landmark className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-400" />
                <select {...register("bankName")} className={inputClass}>
                  <option value="">-- Chọn ngân hàng --</option>
                  {allBanks.map((bank) => (
                    <option key={bank} value={bank}>
                      {bank}
                    </option>
                  ))}
                </select>
              </div>
              {errors.bankName && (
                <p className="mt-2 text-sm font-medium text-rose-600">
                  {errors.bankName.message}
                </p>
              )}
            </div>

            <div>
              <label className="mb-2 block text-sm font-medium text-slate-700">
                Số tài khoản
              </label>
              <div className="relative">
                <Hash className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-400" />
                <input
                  placeholder="Nhập số tài khoản"
                  className={inputClass}
                  {...register("bankAccount")}
                />
              </div>
              {errors.bankAccount && (
                <p className="mt-2 text-sm font-medium text-rose-600">
                  {errors.bankAccount.message}
                </p>
              )}
            </div>

            <div>
              <label className="mb-2 block text-sm font-medium text-slate-700">
                Tên chủ tài khoản
              </label>
              <div className="relative">
                <User className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-400" />
                <input
                  placeholder="Nhập tên chủ tài khoản"
                  className={inputClass}
                  {...register("accountHolder")}
                />
              </div>
              {errors.accountHolder && (
                <p className="mt-2 text-sm font-medium text-rose-600">
                  {errors.accountHolder.message}
                </p>
              )}
            </div>
          </div>

          <div className="flex justify-end gap-3 border-t border-slate-100 pt-5 md:col-span-2">
            <button
              type="button"
              onClick={() => setOpenWithdraw(false)}
              className="rounded-2xl border border-slate-200 bg-white px-5 py-2.5 text-sm font-medium text-slate-600 transition hover:bg-slate-50"
            >
              Hủy
            </button>

            <LoadingButton
              loading={loading}
              type="submit"
              className="rounded-2xl px-5 py-2.5 text-sm font-semibold shadow-lg shadow-sky-100"
            >
              Gửi yêu cầu
            </LoadingButton>
          </div>
        </form>
      </div>
    </div>
  );
};

export default WithdrawRequestForm;
