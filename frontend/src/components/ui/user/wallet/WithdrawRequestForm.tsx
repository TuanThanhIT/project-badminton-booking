import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { CreditCard, X, Landmark, User, Hash, Wallet } from "lucide-react";
import { useState, useEffect } from "react";
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

  // register amount thủ công (vì dùng custom input)
  useEffect(() => {
    register("amount");
  }, [register]);

  const amount = watch("amount");
  const selectedBank = watch("bankName");

  const handleSelectAmount = (value: number) => {
    setSelectedAmount(value);
    setValue("amount", value, { shouldValidate: true });
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSelectedAmount(null);
    setValue("amount", Number(e.target.value), {
      shouldValidate: true,
    });
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 px-4">
      <div className="bg-gradient-to-br from-white to-sky-50 rounded-3xl w-full max-w-2xl shadow-2xl p-5 relative border border-gray-200">
        {/* CLOSE */}
        <button
          onClick={() => setOpenWithdraw(false)}
          className="absolute top-4 right-4 text-gray-400 hover:text-gray-800"
        >
          <X size={22} />
        </button>

        {/* HEADER */}
        <div className="flex items-center gap-2 mb-4">
          <CreditCard className="w-6 h-6 text-sky-500" />
          <div>
            <h3 className="text-xl font-bold text-gray-800">
              Yêu cầu rút tiền
            </h3>
            <p className="text-sm text-gray-500">
              Nhập thông tin tài khoản để nhận tiền
            </p>
          </div>
        </div>

        {/* FORM */}
        <form
          onSubmit={handleSubmit(onSubmit)}
          className="grid grid-cols-1 md:grid-cols-2 gap-4"
        >
          {/* LEFT */}
          <div className="space-y-4">
            {/* QUICK AMOUNT */}
            <div>
              <p className="text-sm font-medium text-gray-700 mb-2">
                Chọn số tiền
              </p>

              <div className="grid grid-cols-3 gap-2">
                {quickAmounts.map((value, idx) => {
                  const gradients = [
                    "from-green-400 to-green-500",
                    "from-yellow-400 to-yellow-500",
                    "from-pink-400 to-pink-500",
                    "from-purple-400 to-purple-500",
                    "from-indigo-400 to-indigo-500",
                  ];

                  const gradient = gradients[idx % gradients.length];

                  return (
                    <button
                      key={value}
                      type="button"
                      onClick={() => handleSelectAmount(value)}
                      className={`py-2 rounded-xl text-sm font-medium transition-all duration-150 shadow-sm ${
                        selectedAmount === value
                          ? `bg-gradient-to-r ${gradient} text-white shadow-md scale-105`
                          : "bg-white hover:bg-gray-100 text-gray-700 border border-gray-200"
                      }`}
                    >
                      {value.toLocaleString()}đ
                    </button>
                  );
                })}
              </div>
            </div>

            {/* INPUT AMOUNT */}
            <div>
              <p className="text-sm font-medium text-gray-700 mb-2">
                Hoặc nhập số tiền
              </p>

              <div className="relative">
                <Wallet className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                  type="number"
                  placeholder="Nhập số tiền"
                  value={amount || ""}
                  onChange={handleInputChange}
                  className="w-full pl-10 pr-3 py-3 rounded-xl border border-gray-300 focus:outline-none focus:ring-2 focus:ring-sky-400 bg-white"
                />
              </div>

              {errors.amount && (
                <p className="text-red-500 text-sm mt-1">
                  {errors.amount.message}
                </p>
              )}
            </div>
          </div>

          {/* RIGHT */}
          <div className="space-y-4">
            {/* BANK */}
            <div>
              <p className="text-sm font-medium text-gray-700 mb-2">
                Ngân hàng
              </p>

              {/* QUICK BANK */}
              <div className="flex flex-wrap gap-2 mb-2">
                {popularBanks.map((bank) => (
                  <button
                    key={bank}
                    type="button"
                    onClick={() =>
                      setValue("bankName", bank, { shouldValidate: true })
                    }
                    className={`px-3 py-1.5 rounded-lg text-sm border flex items-center gap-1 transition ${
                      selectedBank === bank
                        ? "bg-sky-500 text-white border-sky-500 shadow"
                        : "bg-white hover:bg-gray-100 text-gray-700 border-gray-200"
                    }`}
                  >
                    <Landmark className="w-3 h-3" />
                    {bank}
                  </button>
                ))}
              </div>

              {/* SELECT */}
              <div className="relative">
                <Landmark className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
                <select
                  {...register("bankName")}
                  className="w-full pl-10 pr-3 py-3 rounded-xl border border-gray-300 focus:outline-none focus:ring-2 focus:ring-sky-400 bg-white"
                >
                  <option value="">-- Chọn ngân hàng khác --</option>
                  {allBanks.map((bank) => (
                    <option key={bank} value={bank}>
                      {bank}
                    </option>
                  ))}
                </select>
              </div>

              {errors.bankName && (
                <p className="text-red-500 text-sm mt-1">
                  {errors.bankName.message}
                </p>
              )}
            </div>

            {/* BANK ACCOUNT */}
            <div className="relative">
              <Hash className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                placeholder="Số tài khoản"
                className="w-full pl-10 pr-3 py-3 rounded-xl border border-gray-300 focus:outline-none focus:ring-2 focus:ring-sky-400"
                {...register("bankAccount")}
              />
              {errors.bankAccount && (
                <p className="text-red-500 text-sm mt-1">
                  {errors.bankAccount.message}
                </p>
              )}
            </div>

            {/* ACCOUNT HOLDER */}
            <div className="relative">
              <User className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                placeholder="Tên chủ tài khoản"
                className="w-full pl-10 pr-3 py-3 rounded-xl border border-gray-300 focus:outline-none focus:ring-2 focus:ring-sky-400"
                {...register("accountHolder")}
              />
              {errors.accountHolder && (
                <p className="text-red-500 text-sm mt-1">
                  {errors.accountHolder.message}
                </p>
              )}
            </div>
          </div>

          {/* ACTION */}
          <div className="col-span-1 md:col-span-2 flex justify-end gap-3 pt-2">
            <button
              type="button"
              onClick={() => setOpenWithdraw(false)}
              className="px-4 py-2 rounded-xl bg-gray-100 hover:bg-gray-200"
            >
              Hủy
            </button>

            <LoadingButton loading={loading} type="submit">
              Gửi yêu cầu
            </LoadingButton>
          </div>
        </form>
      </div>
    </div>
  );
};

export default WithdrawRequestForm;
