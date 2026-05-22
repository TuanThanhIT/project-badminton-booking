import {
  AlertTriangle,
  CheckCircle2,
  HelpCircle,
  X,
  XCircle,
} from "lucide-react";
import { useEffect, useMemo, useState, type ReactNode } from "react";
import { ConfirmDialogContext } from "../confirmDialog/confirmDialogContext";
import {
  bindConfirmDialog,
  type ConfirmDialogPayload,
  type ConfirmDialogVariant,
} from "../../../utils/confirmDialogStore";

const variantConfig = {
  question: {
    icon: HelpCircle,
    iconBox: "bg-sky-50 text-sky-600 ring-sky-100",
    confirm:
      "bg-sky-600 text-white shadow-sm shadow-sky-100 hover:bg-sky-700 hover:shadow-md hover:shadow-sky-100",
    badge: "text-sky-700",
  },
  danger: {
    icon: XCircle,
    iconBox: "bg-red-50 text-red-500 ring-red-100",
    confirm:
      "bg-red-500 text-white shadow-sm shadow-red-100 hover:bg-red-600 hover:shadow-md hover:shadow-red-100",
    badge: "text-red-600",
  },
  warning: {
    icon: AlertTriangle,
    iconBox: "bg-amber-50 text-amber-500 ring-amber-100",
    confirm:
      "bg-amber-500 text-white shadow-sm shadow-amber-100 hover:bg-amber-600 hover:shadow-md hover:shadow-amber-100",
    badge: "text-amber-600",
  },
  success: {
    icon: CheckCircle2,
    iconBox: "bg-emerald-50 text-emerald-600 ring-emerald-100",
    confirm:
      "bg-emerald-500 text-white shadow-sm shadow-emerald-100 hover:bg-emerald-600 hover:shadow-md hover:shadow-emerald-100",
    badge: "text-emerald-600",
  },
};

const getVariantByConfirmText = (
  confirmText?: string,
): ConfirmDialogVariant => {
  const text = confirmText?.toLowerCase() || "";

  if (
    text.includes("hủy") ||
    text.includes("xóa") ||
    text.includes("từ chối") ||
    text.includes("hoàn tiền")
  ) {
    return "danger";
  }

  if (text.includes("hoàn thành") || text.includes("thành công")) {
    return "success";
  }

  if (text.includes("thu tiền")) {
    return "warning";
  }

  return "question";
};

const ConfirmDialogProvider = ({ children }: { children: ReactNode }) => {
  const [dialog, setDialog] = useState<ConfirmDialogPayload | null>(null);
  const [resolver, setResolver] = useState<((value: boolean) => void) | null>(
    null,
  );
  const [closing, setClosing] = useState(false);

  const closeDialog = (value: boolean) => {
    setClosing(true);

    window.setTimeout(() => {
      resolver?.(value);
      setDialog(null);
      setResolver(null);
      setClosing(false);
    }, 120);
  };

  const openConfirm = (payload: ConfirmDialogPayload) => {
    return new Promise<boolean>((resolve) => {
      setDialog({
        confirmText: "Đồng ý",
        cancelText: "Hủy",
        ...payload,
      });

      setResolver(() => resolve);
    });
  };

  useEffect(() => {
    return bindConfirmDialog(openConfirm);
  }, []);

  useEffect(() => {
    if (!dialog) return;

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        closeDialog(false);
      }
    };

    window.addEventListener("keydown", handleKeyDown);

    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [dialog, resolver]);

  const value = useMemo(() => ({ openConfirm }), []);

  const variant =
    dialog?.variant || getVariantByConfirmText(dialog?.confirmText);

  const config = variantConfig[variant];
  const Icon = config.icon;

  return (
    <ConfirmDialogContext.Provider value={value}>
      {children}

      {dialog && (
        <div
          className={`
            fixed inset-0 z-[9999] grid place-items-center px-4
            bg-slate-950/45 backdrop-blur-sm
            transition-opacity duration-150
            ${closing ? "opacity-0" : "opacity-100"}
          `}
        >
          <button
            type="button"
            aria-label="Đóng hộp thoại xác nhận"
            className="absolute inset-0"
            onClick={() => closeDialog(false)}
          />

          <div
            className={`
              relative z-10 w-full max-w-xl overflow-hidden rounded-[32px]
              border border-slate-200 bg-white shadow-2xl shadow-slate-950/10
              transition-all duration-150
              ${closing ? "scale-95 opacity-0" : "scale-100 opacity-100"}
            `}
          >
            {/* HEADER */}
            <div className="px-7 pt-7">
              <div className="flex items-start justify-between gap-5">
                <div className="flex min-w-0 items-start gap-4">
                  <div
                    className={`grid h-16 w-16 shrink-0 place-items-center rounded-[1.35rem] ring-1 ${config.iconBox}`}
                  >
                    <Icon className="h-8 w-8" />
                  </div>

                  <div className="min-w-0 pt-0.5">
                    <p className={`text-sm font-bold ${config.badge}`}>
                      Xác nhận thao tác
                    </p>

                    <h3 className="mt-1.5 text-2xl font-extrabold leading-snug text-slate-900">
                      {dialog.title}
                    </h3>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => closeDialog(false)}
                  className="grid h-10 w-10 shrink-0 place-items-center rounded-2xl text-slate-400 transition hover:bg-slate-100 hover:text-slate-700"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>
            </div>

            {/* BODY */}
            {dialog.text && (
              <div className="px-7 py-5">
                <p className="text-[18px] leading-7 text-slate-500">
                  {dialog.text}
                </p>
              </div>
            )}

            {/* ACTIONS */}
            <div className="flex flex-col-reverse gap-2 border-t border-slate-100 bg-slate-50/70 px-7 py-5 sm:flex-row sm:justify-end">
              <button
                type="button"
                onClick={() => closeDialog(false)}
                className="
                  inline-flex h-12 items-center justify-center rounded-2xl
                  border border-slate-200 bg-white px-5 text-sm font-semibold text-slate-600
                  transition-all duration-200
                  hover:border-slate-300 hover:bg-slate-50 hover:text-slate-800
                  active:scale-[0.98]
                "
              >
                {dialog.cancelText || "Hủy"}
              </button>

              <button
                type="button"
                onClick={() => closeDialog(true)}
                className={`
                  inline-flex h-12 items-center justify-center gap-2 rounded-2xl
                  px-5 text-sm font-semibold
                  transition-all duration-200 active:scale-[0.98]
                  ${config.confirm}
                `}
              >
                <CheckCircle2 className="h-4 w-4" />
                {dialog.confirmText || "Đồng ý"}
              </button>
            </div>
          </div>
        </div>
      )}
    </ConfirmDialogContext.Provider>
  );
};

export default ConfirmDialogProvider;
