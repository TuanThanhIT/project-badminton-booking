import { useState } from "react";
import { AlertCircle, CheckCircle, Eye, EyeOff } from "lucide-react";
import { getStrengthBlocks } from "../../../utils/password";

const PasswordInput = ({ register, field, value }: any) => {
  const [showPassword, setShowPassword] = useState(false);
  const strength = getStrengthBlocks(value || "");

  return (
    <div>
      <div className="relative">
        <input
          type={showPassword ? "text" : "password"}
          placeholder="Nhập mật khẩu"
          {...register(field)}
          className="w-full border border-gray-400 p-2 px-4 rounded-md outline-none pr-10"
        />

        <button
          type="button"
          onClick={() => setShowPassword(!showPassword)}
          className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
        >
          {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
        </button>
      </div>

      {/* Thanh đánh giá mật khẩu gọn + icon Lucide */}
      {value && (
        <div className="mt-2 flex items-center gap-3">
          {/* Thanh block */}
          <div className="flex-1 flex gap-1 h-2 rounded overflow-hidden">
            {strength.blocks.map((active, idx) => (
              <div
                key={idx}
                className={`flex-1 transition-all duration-300 ${
                  active ? strength.color : "bg-gray-200"
                }`}
              ></div>
            ))}
          </div>

          {/* Text + icon */}
          <div className="flex items-center gap-1 text-sm font-medium">
            {strength.level === "Yếu" && (
              <div className="flex items-center gap-1 text-red-500">
                <AlertCircle className="w-4 h-4" /> Yếu
              </div>
            )}
            {strength.level === "Trung bình" && (
              <div className="flex items-center gap-1 text-yellow-400">
                <AlertCircle className="w-4 h-4" /> Trung bình
              </div>
            )}
            {strength.level === "Mạnh" && (
              <div className="flex items-center gap-1 text-green-500">
                <CheckCircle className="w-4 h-4" /> Mạnh
              </div>
            )}
            {strength.level === "Rất mạnh" && (
              <div className="flex items-center gap-1 text-green-700">
                <CheckCircle className="w-4 h-4" /> Rất mạnh
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default PasswordInput;
