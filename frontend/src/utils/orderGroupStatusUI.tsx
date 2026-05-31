import { Ban, CheckCircle, Clock, XCircle } from "lucide-react";
import type { LucideIcon } from "lucide-react";

export const ORDER_GROUP_STATUS_UI: Record<
  string,
  {
    label: string;
    className: string;
    icon: LucideIcon;
  }
> = {
  PENDING_PAYMENT: {
    label: "Chờ thanh toán",
    className: "bg-amber-100 text-amber-700",
    icon: Clock,
  },
  PAID: {
    label: "Đã thanh toán",
    className: "bg-emerald-100 text-emerald-700",
    icon: CheckCircle,
  },
  FAILED: {
    label: "Thanh toán thất bại",
    className: "bg-rose-100 text-rose-700",
    icon: XCircle,
  },
  CANCELLED: {
    label: "Đã hủy",
    className: "bg-slate-200 text-slate-600",
    icon: Ban,
  },
};
