import {
  CheckCircle,
  Clock,
  XCircle,
  Ban,
  CheckCircle2,
  Package,
  Truck,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { ORDER_STATUS } from "./constants/orderStatus";

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
    className: "bg-yellow-100 text-yellow-600",
    icon: Clock, // ✅ component
  },
  PAID: {
    label: "Đã thanh toán",
    className: "bg-green-100 text-green-600",
    icon: CheckCircle,
  },
  FAILED: {
    label: "Thanh toán thất bại",
    className: "bg-red-100 text-red-600",
    icon: XCircle,
  },
  CANCELLED: {
    label: "Đã hủy",
    className: "bg-gray-200 text-gray-600",
    icon: Ban,
  },
};
