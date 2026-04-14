import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import {
  FormWalletDepositSchema,
  type formWalletDeposit,
} from "../../../../schemas/FormWalletDepositSchema";
import { CreditCard, Wallet, X } from "lucide-react";
import { useState } from "react";

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
    setValue("amount", value);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSelectedAmount(null);
    setValue("amount", Number(e.target.value));
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 px-4">
      <div className="bg-gradient-to-br from-white to-sky-50 rounded-3xl w-full max-w-md shadow-2xl p-6 relative border border-gray-200">
        {/* CLOSE */}
        <button
          onClick={() => setOpenDeposit(false)}
          className="absolute top-4 right-4 text-gray-400 hover:text-gray-800 transition-colors"
        >
          <X size={22} />
        </button>

        {/* HEADER */}
        <div className="flex items-center gap-2 mb-4">
          <CreditCard className="w-6 h-6 text-sky-500" />
          <div>
            <h3 className="text-xl font-bold text-gray-800">Nạp tiền</h3>
            <p className="text-sm text-gray-500">
              Nhập số tiền bạn muốn nạp vào ví
            </p>
          </div>
        </div>

        <p className="text-sm font-medium text-gray-700 mb-2">Chọn số tiền</p>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
          {/* QUICK AMOUNT */}
          <div className="grid grid-cols-3 gap-3">
            {quickAmounts.map((value, idx) => {
              // tạo gradient cho từng nút, kiểu vòng lặp 3 màu
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
                  className={`py-2 rounded-xl text-sm font-medium transition transform hover:-translate-y-0.5 hover:scale-105 duration-150 shadow-sm ${
                    selectedAmount === value
                      ? `bg-gradient-to-r ${gradient} text-white shadow-lg`
                      : "bg-gray-50 hover:bg-gray-100 text-gray-700 border border-gray-200"
                  }`}
                >
                  {value.toLocaleString()}
                </button>
              );
            })}
          </div>

          {/* INPUT */}
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

            <input type="hidden" {...register("amount")} />
            {errors.amount && (
              <p className="text-red-500 text-sm mt-1">
                {errors.amount.message}
              </p>
            )}
          </div>

          {/* ACTION */}
          <div className="flex justify-end gap-3 mt-4">
            <button
              type="button"
              onClick={() => setOpenDeposit(false)}
              className="px-4 py-2 rounded-xl bg-gray-100 hover:bg-gray-200 text-gray-700 transition-shadow shadow-sm"
            >
              Hủy
            </button>

            <button
              type="submit"
              className="px-5 py-2 rounded-xl bg-gradient-to-r from-sky-500 to-indigo-500 text-white font-semibold hover:from-sky-600 hover:to-indigo-600 shadow-lg transform hover:-translate-y-0.5 hover:scale-105 transition-all duration-150"
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
