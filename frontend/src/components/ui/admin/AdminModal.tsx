import type { ReactNode } from "react";
import { X } from "lucide-react";

type AdminModalProps = {
  title: string;
  icon?: ReactNode;
  onClose: () => void;
  children: ReactNode;
  maxWidth?: string;
  description?: string;
};

export const adminInputClass =
  "h-11 rounded-xl border border-slate-200 bg-white px-3 text-sm font-medium text-slate-800 outline-none transition focus:border-sky-500 focus:ring-1 focus:ring-sky-100";

export const adminTextAreaClass =
  "rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm font-medium text-slate-800 outline-none transition focus:border-sky-500 focus:ring-1 focus:ring-sky-100";

export const adminPrimaryButtonClass =
  "inline-flex h-11 items-center justify-center gap-2 rounded-xl bg-sky-600 px-4 text-sm font-bold text-white shadow-sm transition hover:bg-sky-700 disabled:cursor-not-allowed disabled:opacity-70";

export const adminSecondaryButtonClass =
  "inline-flex h-11 items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-4 text-sm font-bold text-slate-700 shadow-sm transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-70";

export const AdminModalOverlay = ({ children }: { children: ReactNode }) => (
  <div className="fixed inset-0 z-[1000] flex min-h-dvh w-screen items-center justify-center overflow-y-auto bg-slate-950/60 p-4 backdrop-blur-sm">
    {children}
  </div>
);

export const AdminField = ({
  label,
  error,
  children,
  className = "",
}: {
  label: string;
  error?: string;
  children: ReactNode;
  className?: string;
}) => (
  <div className={className}>
    <label className="mb-1 block text-sm font-semibold text-slate-700">
      {label}
    </label>
    {children}
    {error ? <p className="mt-1 text-xs text-rose-600">{error}</p> : null}
  </div>
);

const AdminModal = ({
  title,
  icon,
  onClose,
  children,
  maxWidth = "max-w-lg",
  description,
}: AdminModalProps) => (
  <AdminModalOverlay>
    <div className={`flex w-full ${maxWidth} max-h-[calc(100dvh-3rem)] flex-col overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm`}>
      <div className="flex shrink-0 items-center justify-between border-b border-slate-200 bg-white px-6 py-4">
        <div className="flex items-center gap-2">
          {icon}
          <div>
            <h2 className="text-lg font-bold text-slate-900">{title}</h2>
            {description ? (
              <p className="text-sm text-slate-500">{description}</p>
            ) : null}
          </div>
        </div>
        <button
          onClick={onClose}
          className="flex h-9 w-9 items-center justify-center rounded-xl text-slate-500 transition hover:bg-slate-100"
          type="button"
        >
          <X className="h-5 w-5" />
        </button>
      </div>
      <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain [scrollbar-gutter:stable]">
        {children}
      </div>
    </div>
  </AdminModalOverlay>
);

export default AdminModal;
