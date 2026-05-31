import { type InputHTMLAttributes, type ReactNode, useState } from "react";
import { AlertCircle, CheckCircle, Eye, EyeOff } from "lucide-react";
import { getStrengthBlocks } from "../../../utils/password";

type PasswordInputProps = InputHTMLAttributes<HTMLInputElement> & {
  registration?: Record<string, unknown>;
  leftIcon?: ReactNode;
  showStrength?: boolean;
  strengthValue?: string;
};

const PasswordInput = ({
  registration,
  leftIcon,
  showStrength = false,
  strengthValue,
  className = "",
  ...props
}: PasswordInputProps) => {
  const [showPassword, setShowPassword] = useState(false);
  const strength = showStrength
    ? getStrengthBlocks(strengthValue || String(props.value || ""))
    : null;

  return (
    <div>
      <div className="relative">
        {leftIcon && (
          <span className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-slate-400">
            {leftIcon}
          </span>
        )}

        <input
          {...props}
          {...registration}
          type={showPassword ? "text" : "password"}
          className={`${className} pr-11`}
        />

        <button
          type="button"
          onClick={() => setShowPassword((value) => !value)}
          aria-label={showPassword ? "Ẩn mật khẩu" : "Hiện mật khẩu"}
          className="absolute right-4 top-1/2 grid h-8 w-8 -translate-y-1/2 place-items-center rounded-xl text-slate-400 transition hover:bg-slate-100 hover:text-slate-700"
        >
          {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
        </button>
      </div>

      {strength && strengthValue && (
        <div className="mt-2 flex items-center gap-3">
          <div className="flex h-2 flex-1 gap-1 overflow-hidden rounded">
            {strength.blocks.map((active, idx) => (
              <div
                key={idx}
                className={`flex-1 transition-all duration-300 ${
                  active ? strength.color : "bg-gray-200"
                }`}
              />
            ))}
          </div>

          <div className="flex items-center gap-1 text-sm font-medium">
            {strength.level === "Yếu" && (
              <div className="flex items-center gap-1 text-red-500">
                <AlertCircle className="h-4 w-4" /> Yếu
              </div>
            )}
            {strength.level === "Trung bình" && (
              <div className="flex items-center gap-1 text-yellow-400">
                <AlertCircle className="h-4 w-4" /> Trung bình
              </div>
            )}
            {strength.level === "Mạnh" && (
              <div className="flex items-center gap-1 text-green-500">
                <CheckCircle className="h-4 w-4" /> Mạnh
              </div>
            )}
            {strength.level === "Rất mạnh" && (
              <div className="flex items-center gap-1 text-green-700">
                <CheckCircle className="h-4 w-4" /> Rất mạnh
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default PasswordInput;
