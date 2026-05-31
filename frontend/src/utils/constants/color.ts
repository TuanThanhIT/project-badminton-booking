export const COLOR_MAP: Record<string, string> = {
  đo: "#ef4444",
  xanh: "#3b82f6",
  "xanh la": "#22c55e",
  vang: "#eab308",
  den: "#000000",
  trang: "#ffffff",
  xam: "#6b7280",
  hong: "#ec4899",
  tim: "#a855f7",
  cam: "#f97316",
};

export const ORDER_STATUS_COLOR: Record<string, string> = {
  PENDING: "bg-yellow-100 text-yellow-700",
  CONFIRMED: "bg-blue-100 text-blue-700",
  PREPARING: "bg-indigo-100 text-indigo-700",
  READY_TO_SHIP: "bg-purple-100 text-purple-700",
  SHIPPING: "bg-sky-100 text-sky-700",
  CANCEL_REQUESTED: "bg-orange-100 text-orange-700",
  CANCELLED: "bg-gray-200 text-gray-600",
  RETURN_REQUESTED: "bg-amber-100 text-amber-700",
  RETURNING: "bg-orange-100 text-orange-700",
  RETURNED: "bg-pink-100 text-pink-700",
  COMPLETED: "bg-green-100 text-green-700",
  FAILED: "bg-red-100 text-red-700",
};
