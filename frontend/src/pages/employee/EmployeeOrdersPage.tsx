import { useEffect, useMemo, useState } from "react";
import {
  AlertTriangle,
  Ban,
  Box,
  Building2,
  CalendarClock,
  CheckCircle2,
  Clock3,
  Loader2,
  Package,
  PackageCheck,
  RefreshCw,
  RotateCcw,
  Search,
  Truck,
  User,
  Wallet,
  XCircle,
} from "lucide-react";
import { toast } from "react-toastify";
import { useAppDispatch, useAppSelector } from "../../redux/hook";
import {
  approveCancelEmployeeOrder,
  approveReturnEmployeeOrder,
  completeReturnEmployeeOrder,
  confirmEmployeeOrder,
  forceReturnGHNEmployeeOrder,
  getEmployeeOrderDetail,
  getEmployeeOrders,
  prepareEmployeeOrder,
  readyToShipEmployeeOrder,
  rejectCancelEmployeeOrder,
  shipEmployeeOrder,
} from "../../redux/slices/employee/orderSlice";
import type {
  EmployeeOrder,
  OrderStatus,
  ShippingStatus,
} from "../../types/order";
import { showConfirmDialog } from "../../utils/confirmDialog";
import { formatOrderCode, formatOrderItemCode } from "../../utils/order";

const ORDER_TABS: { value: OrderStatus | "ALL"; label: string }[] = [
  { value: "ALL", label: "Tất cả" },
  { value: "PENDING", label: "Chờ xác nhận" },
  { value: "CONFIRMED", label: "Đã xác nhận" },
  { value: "PREPARING", label: "Đang soạn" },
  { value: "READY_TO_SHIP", label: "Chờ GHN" },
  { value: "SHIPPING", label: "Đang giao" },
  { value: "CANCEL_REQUESTED", label: "Yêu cầu hủy" },
  { value: "RETURN_REQUESTED", label: "Yêu cầu trả" },
  { value: "RETURNING", label: "Đang hoàn" },
  { value: "COMPLETED", label: "Giao thành công" },
  { value: "FAILED", label: "Giao thất bại" },
  { value: "CANCELLED", label: "Bị hủy" },
  { value: "RETURNED", label: "Đã hoàn" },
];

const ORDER_LABEL: Record<OrderStatus, string> = {
  PENDING: "Chờ xác nhận",
  CONFIRMED: "Đã xác nhận",
  PREPARING: "Đang chuẩn bị",
  READY_TO_SHIP: "Sẵn sàng giao",
  SHIPPING: "Đang giao",
  CANCEL_REQUESTED: "Yêu cầu hủy",
  CANCELLED: "Bị hủy",
  RETURN_REQUESTED: "Yêu cầu trả hàng",
  RETURNING: "Đang hoàn hàng",
  RETURNED: "Đã hoàn",
  COMPLETED: "Giao thành công",
  FAILED: "Giao thất bại",
};

const SHIPPING_LABEL: Record<ShippingStatus, string> = {
  PENDING: "Chưa tạo vận đơn",
  CREATED: "Đã tạo vận đơn",
  PICKING: "GHN đang lấy",
  PICKED: "GHN đã lấy",
  IN_TRANSIT: "Đang vận chuyển",
  DELIVERING: "Đang giao",
  DELIVERED: "Giao thành công",
  FAILED: "Giao thất bại",
  RETURNING: "Đang hoàn",
  RETURNED: "Đã hoàn",
  CANCELLED: "Đã hủy giao hàng",
};

const statusClass: Record<OrderStatus, string> = {
  PENDING: "bg-amber-50 text-amber-700 border-amber-200",
  CONFIRMED: "bg-sky-50 text-sky-700 border-sky-200",
  PREPARING: "bg-indigo-50 text-indigo-700 border-indigo-200",
  READY_TO_SHIP: "bg-cyan-50 text-cyan-700 border-cyan-200",
  SHIPPING: "bg-blue-50 text-blue-700 border-blue-200",
  CANCEL_REQUESTED: "bg-orange-50 text-orange-700 border-orange-200",
  CANCELLED: "bg-red-50 text-red-700 border-red-200",
  RETURN_REQUESTED: "bg-purple-50 text-purple-700 border-purple-200",
  RETURNING: "bg-fuchsia-50 text-fuchsia-700 border-fuchsia-200",
  RETURNED: "bg-slate-100 text-slate-700 border-slate-200",
  COMPLETED: "bg-emerald-50 text-emerald-700 border-emerald-200",
  FAILED: "bg-red-50 text-red-700 border-red-200",
};

const PAYMENT_LABEL: Record<string, string> = {
  COD: "Thanh toán khi nhận hàng",
  CASH: "Tiền mặt",
  BANK: "Chuyển khoản",
  VNPAY: "VNPay",
  WALLET: "Ví B-Hub",
  UNPAID: "Chưa thanh toán",
  PENDING: "Chờ thanh toán",
  PAID: "Đã thanh toán",
  PARTIALLY_REFUNDED: "Hoàn tiền một phần",
  REFUNDED: "Đã hoàn tiền",
  FAILED: "Thanh toán thất bại",
};

const paymentStatusClass: Record<string, string> = {
  UNPAID: "bg-slate-50 text-slate-600 border-slate-200",
  PENDING: "bg-amber-50 text-amber-700 border-amber-200",
  PAID: "bg-emerald-50 text-emerald-700 border-emerald-200",
  PARTIALLY_REFUNDED: "bg-violet-50 text-violet-700 border-violet-200",
  REFUNDED: "bg-violet-50 text-violet-700 border-violet-200",
  FAILED: "bg-red-50 text-red-700 border-red-200",
};

const paymentDotClass: Record<string, string> = {
  UNPAID: "bg-slate-400",
  PENDING: "bg-amber-500",
  PAID: "bg-emerald-500",
  PARTIALLY_REFUNDED: "bg-violet-500",
  REFUNDED: "bg-violet-500",
  FAILED: "bg-red-500",
};

const ACTIVE_DELIVERY_STATUSES: ShippingStatus[] = [
  "PICKED",
  "IN_TRANSIT",
  "DELIVERING",
];

const formatCurrency = (value: number) =>
  new Intl.NumberFormat("vi-VN", {
    style: "currency",
    currency: "VND",
    maximumFractionDigits: 0,
  }).format(value || 0);

const formatDateTime = (value?: string | null) => {
  if (!value) return "--";
  return new Date(value).toLocaleString("vi-VN", {
    hour: "2-digit",
    minute: "2-digit",
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });
};

const getToday = () =>
  new Date().toLocaleDateString("en-CA", {
    timeZone: "Asia/Ho_Chi_Minh",
  });

const EmployeeOrdersPage = () => {
  const dispatch = useAppDispatch();
  const { orders, selectedOrder, summary, pagination } = useAppSelector(
    (state) => state.employeeOrder,
  );
  const loadingMap = useAppSelector((state) => state.ui.loadingMap);

  const [status, setStatus] = useState<OrderStatus | "ALL">("ALL");
  const [keyword, setKeyword] = useState("");
  const [date, setDate] = useState("");
  const [page, setPage] = useState(1);
  const [rejectingOrder, setRejectingOrder] = useState<EmployeeOrder | null>(
    null,
  );
  const [rejectReason, setRejectReason] = useState("");

  const listLoading = loadingMap["employeeOrder/getEmployeeOrders"];
  const detailLoading = loadingMap["employeeOrder/getEmployeeOrderDetail"];
  const actionLoading = useMemo(
    () =>
      Object.entries(loadingMap).some(
        ([key, value]) =>
          key.startsWith("employeeOrder/") &&
          !key.includes("getEmployee") &&
          value,
      ),
    [loadingMap],
  );

  const fetchOrders = () => {
    dispatch(
      getEmployeeOrders({
        params: {
          status: status === "ALL" ? undefined : status,
          keyword,
          date: date || undefined,
          page,
          limit: 12,
        },
      }),
    );
  };

  useEffect(() => {
    const timer = window.setTimeout(fetchOrders, 300);
    return () => window.clearTimeout(timer);
  }, [dispatch, status, keyword, date, page]);

  useEffect(() => {
    if (!selectedOrder && orders[0]) {
      dispatch(getEmployeeOrderDetail({ orderId: orders[0].id }));
    }
  }, [dispatch, orders, selectedOrder]);

  const selectOrder = (order: EmployeeOrder) => {
    dispatch(getEmployeeOrderDetail({ orderId: order.id }));
  };

  const runAction = async (
    title: string,
    action: () => Promise<{ message: string }>,
  ) => {
    const confirmed = await showConfirmDialog(
      "Xác nhận thao tác",
      title,
      "Xác nhận",
      "Đóng",
    );
    if (!confirmed) return;

    try {
      const res = await action();
      toast.success(res.message);
      fetchOrders();
      if (selectedOrder) {
        dispatch(getEmployeeOrderDetail({ orderId: selectedOrder.id }));
      }
    } catch {
      // global middleware handles API errors
    }
  };

  const rejectCancel = async () => {
    if (!rejectingOrder) return;
    const reason = rejectReason.trim();
    if (!reason) {
      toast.warning("Vui lòng nhập lý do từ chối");
      return;
    }

    const orderId = rejectingOrder.id;
    try {
      const res = await dispatch(
        rejectCancelEmployeeOrder({ orderId, data: { reason } }),
      ).unwrap();
      toast.success(res.message);
      setRejectingOrder(null);
      setRejectReason("");
      fetchOrders();
      dispatch(getEmployeeOrderDetail({ orderId }));
    } catch {
      // global middleware handles API errors
    }
  };

  const primaryActions = (order: EmployeeOrder) => {
    const id = order.id;

    if (order.orderStatus === "PENDING") {
      return [
        {
          label: "Xác nhận",
          icon: CheckCircle2,
          className: "bg-sky-600 hover:bg-sky-700 text-white",
          onClick: () =>
            runAction("Xác nhận đơn hàng này?", () =>
              dispatch(confirmEmployeeOrder({ orderId: id })).unwrap(),
            ),
        },
      ];
    }

    if (order.orderStatus === "CONFIRMED") {
      return [
        {
          label: "Bắt đầu soạn",
          icon: Box,
          className: "bg-indigo-600 hover:bg-indigo-700 text-white",
          onClick: () =>
            runAction("Chuyển đơn sang trạng thái đang chuẩn bị?", () =>
              dispatch(prepareEmployeeOrder({ orderId: id })).unwrap(),
            ),
        },
      ];
    }

    if (order.orderStatus === "PREPARING") {
      return [
        {
          label: "Đóng gói xong",
          icon: PackageCheck,
          className: "bg-cyan-600 hover:bg-cyan-700 text-white",
          onClick: () =>
            runAction("Đánh dấu đơn đã sẵn sàng giao?", () =>
              dispatch(readyToShipEmployeeOrder({ orderId: id })).unwrap(),
            ),
        },
      ];
    }

    if (order.orderStatus === "READY_TO_SHIP") {
      return [
        {
          label: "Tạo GHN",
          icon: Truck,
          className: "bg-blue-600 hover:bg-blue-700 text-white",
          onClick: () =>
            runAction("Tạo vận đơn GHN cho đơn này?", () =>
              dispatch(shipEmployeeOrder({ orderId: id })).unwrap(),
            ),
        },
      ];
    }

    if (order.orderStatus === "CANCEL_REQUESTED") {
      if (ACTIVE_DELIVERY_STATUSES.includes(order.shippingStatus)) {
        return [
          {
            label: "Từ chối hủy",
            icon: XCircle,
            className: "bg-slate-800 hover:bg-slate-900 text-white",
            onClick: () => {
              setRejectingOrder(order);
              setRejectReason("");
            },
          },
        ];
      }

      return [
        {
          label: "Duyệt hủy",
          icon: Ban,
          className:
            "bg-red-500 text-white shadow-sm shadow-red-100 hover:bg-red-600 hover:shadow-md hover:shadow-red-100 disabled:bg-slate-300 disabled:shadow-none",
          onClick: () =>
            runAction("Duyệt hủy đơn và xử lý hoàn tiền nếu có?", () =>
              dispatch(approveCancelEmployeeOrder({ orderId: id })).unwrap(),
            ),
        },
        {
          label: "Từ chối hủy",
          icon: XCircle,
          className:
            "border border-slate-200 bg-white text-slate-600 hover:border-slate-300 hover:bg-slate-50 hover:text-slate-800",
          onClick: () => {
            setRejectingOrder(order);
            setRejectReason("");
          },
        },
      ];
    }

    if (order.orderStatus === "RETURN_REQUESTED") {
      return [
        {
          label: "Duyệt trả hàng",
          icon: RotateCcw,
          className: "bg-purple-600 hover:bg-purple-700 text-white",
          onClick: () =>
            runAction("Duyệt yêu cầu trả hàng?", () =>
              dispatch(approveReturnEmployeeOrder({ orderId: id })).unwrap(),
            ),
        },
      ];
    }

    if (order.orderStatus === "RETURNING") {
      return [
        {
          label: "Đã nhận hàng hoàn",
          icon: PackageCheck,
          className: "bg-emerald-600 hover:bg-emerald-700 text-white",
          onClick: () =>
            runAction("Xác nhận shop đã nhận hàng hoàn?", () =>
              dispatch(completeReturnEmployeeOrder({ orderId: id })).unwrap(),
            ),
        },
      ];
    }

    if (order.orderStatus === "FAILED" && order.shippingStatus === "FAILED") {
      return [
        {
          label: "Chuyển hoàn hàng",
          icon: RotateCcw,
          className: "bg-orange-600 hover:bg-orange-700 text-white",
          onClick: () =>
            runAction("Chuyển đơn sang luồng hoàn hàng về shop?", () =>
              dispatch(forceReturnGHNEmployeeOrder({ orderId: id })).unwrap(),
            ),
        },
      ];
    }

    return [];
  };

  const selectedActions = selectedOrder ? primaryActions(selectedOrder) : [];
  const selectedPaymentStatus =
    selectedOrder?.payment?.paymentStatus || "UNPAID";
  const selectedPaymentMethod = selectedOrder?.payment?.paymentMethod || "--";

  return (
    <div className="min-h-full overflow-y-auto bg-slate-50 px-3 py-4 sm:px-5 xl:h-[calc(100vh-84px)] xl:overflow-hidden 2xl:px-8">
      <div className="mx-auto grid min-h-0 w-full max-w-[1880px] items-stretch gap-5 xl:h-full xl:grid-cols-[1.15fr_1.25fr]">
        {/* LEFT: ORDER LIST */}
        <section className="flex min-h-[620px] min-w-0 flex-col rounded-3xl border border-slate-200 bg-white p-4 shadow-sm sm:p-5 xl:h-full xl:min-h-0">
          <div className="mb-3 flex shrink-0 flex-col justify-between gap-2 lg:flex-row lg:items-center">
            <div>
              <p className="text-sm font-bold text-sky-700">
                Vận hành đơn hàng
              </p>
              <h2 className="mt-1 text-2xl font-extrabold text-slate-800">
                Đơn hàng cần xử lý
              </h2>
              <p className="mt-1 text-sm text-slate-500">
                Theo dõi đơn, thanh toán và trạng thái giao hàng của khách.
              </p>
            </div>

            <button
              onClick={fetchOrders}
              className="inline-flex h-9 items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-3 text-xs font-semibold text-slate-700 transition hover:border-sky-200 hover:bg-sky-50 hover:text-sky-700"
            >
              <RefreshCw className="h-3.5 w-3.5" />
              Làm mới
            </button>
          </div>

          <div className="mb-3 grid shrink-0 gap-2 lg:grid-cols-[1fr_155px]">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-500" />
              <input
                value={keyword}
                onChange={(event) => {
                  setKeyword(event.target.value);
                  setPage(1);
                }}
                placeholder="Tìm mã đơn, tên, SĐT, mã GHN..."
                className="h-10 w-full rounded-xl border border-slate-200 bg-slate-50 pl-9 pr-3 text-xs font-normal text-slate-700 outline-none transition placeholder:text-slate-500 focus:border-sky-400 focus:bg-white focus:ring-1 focus:ring-sky-100"
              />
            </div>

            <input
              type="date"
              value={date}
              onChange={(event) => {
                setDate(event.target.value);
                setPage(1);
              }}
              max={getToday()}
              className="h-10 rounded-xl border border-slate-200 bg-slate-50 px-3 text-xs font-medium text-slate-700 outline-none transition focus:border-sky-400 focus:bg-white focus:ring-1 focus:ring-sky-100"
            />
          </div>

          <div className="mb-3 flex shrink-0 gap-2 overflow-x-auto pb-1">
            {ORDER_TABS.map((tab) => (
              <button
                key={tab.value}
                onClick={() => {
                  setStatus(tab.value);
                  setPage(1);
                }}
                className={`shrink-0 rounded-xl border px-3 py-1.5 text-xs font-semibold transition ${
                  status === tab.value
                    ? "border-sky-300 bg-sky-50 text-sky-700 shadow-sm"
                    : "border-slate-200 bg-white text-slate-600 hover:border-slate-300 hover:bg-slate-50 hover:text-slate-800"
                }`}
              >
                {tab.label}
                {tab.value !== "ALL" && summary[tab.value] ? (
                  <span className="ml-2 rounded-full bg-white px-1.5 py-0.5 text-[11px] font-medium">
                    {summary[tab.value]}
                  </span>
                ) : null}
              </button>
            ))}
          </div>

          <div className="relative min-h-0 flex-1 overflow-y-auto pb-4 pr-1">
            <div className="space-y-3">
              {orders.map((order) => {
                const active = selectedOrder?.id === order.id;
                const urgent =
                  order.orderStatus === "CANCEL_REQUESTED" ||
                  order.orderStatus === "RETURN_REQUESTED";
                const paymentStatus = order.payment?.paymentStatus || "UNPAID";

                return (
                  <button
                    key={order.id}
                    onClick={() => selectOrder(order)}
                    className={`group w-full rounded-[16px] border px-5 py-4 text-left transition ${
                      active
                        ? "border-sky-300 bg-sky-50 shadow-sm"
                        : urgent
                          ? "border-orange-200 bg-orange-50/70 hover:bg-orange-50"
                          : "border-slate-200 bg-white hover:border-sky-200 hover:bg-sky-50/40 hover:shadow-sm"
                    }`}
                  >
                    <div className="grid min-w-0 gap-3 lg:grid-cols-[1fr_auto]">
                      <div className="min-w-0">
                        <div className="flex min-w-0 flex-wrap items-center gap-2">
                          <p className="font-mono text-[15px] font-bold leading-none text-sky-700">
                            {formatOrderItemCode(order.id)}
                          </p>

                          <span
                            className={`inline-flex items-center rounded-full border px-2.5 py-1 text-[10px] font-medium leading-none ${
                              statusClass[order.orderStatus]
                            }`}
                          >
                            {ORDER_LABEL[order.orderStatus]}
                          </span>

                          <span
                            className={`inline-flex items-center rounded-full border px-2.5 py-1 text-[10px] font-medium leading-none ${
                              paymentStatusClass[paymentStatus] ||
                              paymentStatusClass.UNPAID
                            }`}
                          >
                            <span
                              className={`mr-1.5 h-1.5 w-1.5 rounded-full ${
                                paymentDotClass[paymentStatus] ||
                                paymentDotClass.UNPAID
                              }`}
                            />
                            {PAYMENT_LABEL[paymentStatus] || paymentStatus}
                          </span>
                        </div>

                        <span className="mt-1.5 block truncate font-mono text-[11px] font-medium text-slate-500">
                          Nhóm #
                          {formatOrderCode(
                            order.orderGroupId,
                            order.createdDate,
                          )}
                        </span>

                        <div className="mt-4 flex min-w-0 items-start gap-3 rounded-2xl py-3">
                          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-sky-100 text-sky-600">
                            <User className="h-4 w-4" />
                          </div>

                          <div className="min-w-0 flex-1">
                            <div className="flex min-w-0 flex-wrap items-center gap-x-2 gap-y-1">
                              <p className="truncate text-sm font-semibold text-slate-700">
                                {order.shippingName}
                              </p>

                              <span className="text-slate-300">•</span>

                              <p className="text-xs font-normal text-slate-500">
                                {order.shippingPhone}
                              </p>
                            </div>

                            <p className="mt-1.5 line-clamp-2 min-w-0 text-xs font-normal leading-5 text-slate-500">
                              {order.shippingAddress}
                            </p>
                          </div>
                        </div>
                      </div>

                      <div className="flex shrink-0 flex-col items-end gap-3 pt-0.5">
                        <p className="whitespace-nowrap rounded-2xl bg-sky-100 px-3.5 py-2 text-sm font-bold leading-none text-sky-700">
                          {formatCurrency(order.totalAmount)}
                        </p>

                        <p className="whitespace-nowrap text-[11px] font-normal text-slate-500">
                          {formatDateTime(order.createdDate)}
                        </p>
                      </div>
                    </div>
                  </button>
                );
              })}

              {!listLoading && orders.length === 0 && (
                <div className="grid min-h-[260px] place-items-center rounded-2xl border border-dashed border-slate-300 bg-slate-50 text-center">
                  <div>
                    <PackageCheck className="mx-auto h-9 w-9 text-slate-300" />
                    <p className="mt-3 text-xs font-medium text-slate-500">
                      Không có đơn hàng phù hợp bộ lọc.
                    </p>
                  </div>
                </div>
              )}
            </div>

            {listLoading && (
              <div className="absolute inset-0 grid place-items-center rounded-2xl bg-white/70 backdrop-blur-[1px]">
                <Loader2 className="h-5 w-5 animate-spin text-sky-600" />
              </div>
            )}
          </div>

          <div className="mt-4 flex shrink-0 items-center justify-between border-t border-slate-100 py-3 text-xs">
            <span className="font-medium text-slate-500">
              Tổng {pagination.total} đơn
            </span>

            <div className="flex items-center gap-1.5">
              <button
                onClick={() => setPage((value) => Math.max(1, value - 1))}
                disabled={page <= 1}
                className="rounded-lg border border-slate-200 bg-white px-3 py-1.5 font-medium text-slate-600 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-40"
              >
                Trước
              </button>

              <span className="rounded-lg bg-slate-100 px-3 py-1.5 font-semibold text-slate-700">
                {pagination.page}/{Math.max(1, pagination.totalPages)}
              </span>

              <button
                onClick={() =>
                  setPage((value) => Math.min(pagination.totalPages, value + 1))
                }
                disabled={page >= pagination.totalPages}
                className="rounded-lg border border-slate-200 bg-white px-3 py-1.5 font-medium text-slate-600 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-40"
              >
                Sau
              </button>
            </div>
          </div>
        </section>

        {/* RIGHT: ORDER DETAIL */}
        <section className="min-h-[620px] min-w-0 overflow-hidden rounded-[28px] border border-slate-200 bg-white p-4 shadow-sm sm:p-5 xl:h-full xl:min-h-0">
          {!selectedOrder ? (
            <div className="grid h-full min-h-0 place-items-center rounded-3xl bg-slate-50 text-center">
              <div>
                <PackageCheck className="mx-auto h-10 w-10 text-slate-500" />
                <p className="mt-3 text-sm font-semibold text-slate-500">
                  Chọn một đơn để xem chi tiết.
                </p>
              </div>
            </div>
          ) : (
            <div className="relative h-full min-h-0 overflow-y-auto pb-5 pr-1">
              {/* DETAIL HEADER */}
              <div className="mb-5 rounded-[28px] border border-sky-100 bg-gradient-to-br from-sky-50 via-white to-slate-50 p-5 shadow-sm">
                <div className="flex flex-col justify-between gap-5 lg:flex-row lg:items-start">
                  <div className="min-w-0">
                    <div className="flex min-w-0 flex-wrap items-center gap-2">
                      <h2 className="font-mono text-2xl font-bold text-sky-700">
                        {formatOrderItemCode(selectedOrder.id)}
                      </h2>

                      <span
                        className={`rounded-full border px-3 py-1 text-xs font-semibold ${
                          statusClass[selectedOrder.orderStatus]
                        }`}
                      >
                        {ORDER_LABEL[selectedOrder.orderStatus]}
                      </span>

                      <span
                        className={`rounded-full border px-3 py-1 text-xs font-semibold ${
                          paymentStatusClass[selectedPaymentStatus] ||
                          paymentStatusClass.UNPAID
                        }`}
                      >
                        <span
                          className={`mr-1.5 inline-block h-2 w-2 rounded-full ${
                            paymentDotClass[selectedPaymentStatus] ||
                            paymentDotClass.UNPAID
                          }`}
                        />
                        {PAYMENT_LABEL[selectedPaymentStatus] ||
                          selectedPaymentStatus}
                      </span>
                    </div>

                    <div className="mt-3 flex flex-wrap items-center gap-2">
                      <div className="inline-flex items-center gap-1.5 rounded-full border border-slate-200 bg-white px-3 py-1.5 text-xs font-medium text-slate-500">
                        <Building2 className="h-3.5 w-3.5 text-sky-500" />
                        <span>
                          {selectedOrder.branch?.branchName ||
                            "Chưa có chi nhánh"}
                        </span>
                      </div>

                      <div className="inline-flex items-center gap-1.5 rounded-full border border-slate-200 bg-white px-3 py-1.5 text-xs font-medium text-slate-500">
                        <CalendarClock className="h-3.5 w-3.5 text-sky-500" />
                        <span>{formatDateTime(selectedOrder.createdDate)}</span>
                      </div>
                    </div>
                  </div>

                  <div className="rounded-3xl bg-white px-5 py-4 shadow-sm lg:text-right">
                    <p className="text-xs font-medium uppercase tracking-wide text-slate-500">
                      Tổng thanh toán
                    </p>

                    <p className="mt-1 text-3xl font-bold text-sky-700">
                      {formatCurrency(selectedOrder.totalAmount)}
                    </p>
                  </div>
                </div>

                {selectedActions.length > 0 && (
                  <div className="mt-5 flex flex-wrap gap-2">
                    {selectedActions.map((action) => {
                      const Icon = action.icon;

                      return (
                        <button
                          key={action.label}
                          onClick={action.onClick}
                          disabled={actionLoading}
                          className={`inline-flex h-11 items-center justify-center gap-2 rounded-2xl px-4 text-sm font-semibold transition disabled:cursor-not-allowed disabled:bg-slate-300 ${action.className}`}
                        >
                          {actionLoading ? (
                            <Loader2 className="h-4 w-4 animate-spin" />
                          ) : (
                            <Icon className="h-4 w-4" />
                          )}
                          {action.label}
                        </button>
                      );
                    })}
                  </div>
                )}
              </div>

              {/* REASON ALERT */}
              {((selectedOrder.cancelReason &&
                !selectedOrder.cancelRejectReason) ||
                selectedOrder.cancelRejectReason ||
                selectedOrder.returnReason) && (
                <div className="mb-5 rounded-3xl border border-orange-100 bg-orange-50/80 p-4 text-sm text-orange-800">
                  <div className="flex items-start gap-2">
                    <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0" />
                    <div className="space-y-1">
                      {selectedOrder.cancelReason &&
                        !selectedOrder.cancelRejectReason && (
                          <p>
                            <span className="font-semibold">Lý do hủy:</span>{" "}
                            {selectedOrder.cancelReason}
                          </p>
                        )}

                      {selectedOrder.cancelRejectReason && (
                        <p>
                          <span className="font-semibold">
                            Lý do từ chối hủy:
                          </span>{" "}
                          {selectedOrder.cancelRejectReason}
                        </p>
                      )}

                      {selectedOrder.returnReason && (
                        <p>
                          <span className="font-semibold">Lý do trả hàng:</span>{" "}
                          {selectedOrder.returnReason}
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              )}

              {/* CUSTOMER + SHIPPING */}
              <div className="grid gap-4 lg:grid-cols-2">
                <div className="rounded-[24px] border border-slate-200 bg-white p-4 shadow-sm">
                  <h3 className="mb-4 flex items-center gap-2 text-sm font-bold text-slate-700">
                    <span className="grid h-9 w-9 place-items-center rounded-2xl bg-sky-50 text-sky-600">
                      <User className="h-4 w-4" />
                    </span>
                    Người nhận
                  </h3>

                  <div className="space-y-3">
                    <div className="rounded-2xl bg-slate-50 px-3 py-2.5">
                      <p className="mb-1 text-xs font-medium text-slate-500">
                        Tên khách hàng
                      </p>

                      <p className="truncate font-sans text-[13px] font-medium tracking-tight text-sky-700">
                        {selectedOrder.shippingName}
                      </p>
                    </div>

                    <div className="rounded-2xl bg-slate-50 px-3 py-2.5">
                      <p className="mb-1 text-xs font-medium text-slate-500">
                        Số điện thoại
                      </p>
                      <p className="truncate font-sans text-[13px] font-medium tracking-tight text-sky-700">
                        {selectedOrder.shippingPhone}
                      </p>
                    </div>

                    <div className="rounded-2xl bg-slate-50 px-3 py-2.5">
                      <p className="mb-1 text-xs font-medium text-slate-500">
                        Địa chỉ nhận hàng
                      </p>
                      <p className="truncate font-sans text-[13px] font-medium tracking-tight text-sky-700">
                        {selectedOrder.shippingAddress}
                      </p>
                    </div>
                  </div>
                </div>

                <div className="rounded-[24px] border border-slate-200 bg-white p-4 shadow-sm">
                  <h3 className="mb-4 flex items-center gap-2 text-sm font-bold text-slate-700">
                    <span className="grid h-9 w-9 place-items-center rounded-2xl bg-sky-50 text-sky-600">
                      <Truck className="h-4 w-4" />
                    </span>
                    Vận chuyển & thanh toán
                  </h3>

                  <div className="space-y-3">
                    <div className="rounded-2xl bg-slate-50 px-3 py-2.5">
                      <p className="mb-1 text-xs font-medium text-slate-500">
                        Mã vận đơn GHN
                      </p>
                      <p className="truncate font-sans text-[13px] font-medium tracking-tight text-sky-700">
                        {selectedOrder.shippingOrderCode || "Chưa tạo vận đơn"}
                      </p>
                    </div>
                    <div className="rounded-2xl bg-slate-50 px-3 py-2.5">
                      <p className="mb-1 text-xs font-medium text-slate-500">
                        Trạng thái giao hàng
                      </p>
                      <p className="truncate font-sans text-[13px] font-medium tracking-tight text-sky-700">
                        {SHIPPING_LABEL[selectedOrder.shippingStatus]}
                      </p>
                    </div>

                    <div className="rounded-2xl bg-slate-50 px-3 py-2.5">
                      <p className="mb-1 text-xs font-medium text-slate-500">
                        Thanh toán
                      </p>
                      <p className="truncate font-sans text-[13px] font-medium tracking-tight text-sky-700">
                        {PAYMENT_LABEL[selectedPaymentMethod] ||
                          selectedPaymentMethod}
                        <span className="mx-1.5 text-slate-300">•</span>
                        {PAYMENT_LABEL[selectedPaymentStatus] ||
                          selectedPaymentStatus}
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* PRODUCTS */}
              <div className="mt-5 overflow-hidden rounded-[24px] border border-slate-200 bg-white shadow-sm">
                <div className="border-b border-slate-100 bg-slate-50 px-4 py-3">
                  <h3 className="flex items-center gap-2 text-sm font-bold text-slate-700">
                    <Package className="h-4 w-4 text-sky-600" />
                    Sản phẩm trong đơn
                  </h3>
                </div>

                <div className="divide-y divide-slate-100">
                  {selectedOrder.details.map((item) => (
                    <div
                      key={item.id}
                      className="flex items-start justify-between gap-4 px-4 py-3 text-sm"
                    >
                      <div className="min-w-0">
                        <p className="line-clamp-2 font-semibold leading-5 text-slate-700">
                          {item.productName}
                        </p>
                        <p className="mt-1 text-xs font-normal text-slate-500">
                          {item.variantInfo || "Phân loại mặc định"} • Số lượng{" "}
                          {item.quantity}
                        </p>
                      </div>

                      <p className="shrink-0 whitespace-nowrap text-sm font-semibold text-slate-800">
                        {formatCurrency(item.subTotal)}
                      </p>
                    </div>
                  ))}
                </div>
              </div>

              {/* SHIPPING LOG + TOTAL */}
              <div className="mt-5 grid gap-4 lg:grid-cols-[1fr_300px]">
                <div className="rounded-[24px] border border-slate-200 bg-white p-4 shadow-sm">
                  <h3 className="mb-4 flex items-center gap-2 text-sm font-bold text-slate-700">
                    <Clock3 className="h-4 w-4 text-sky-600" />
                    Nhật ký vận chuyển
                  </h3>

                  <div className="max-h-56 space-y-3 overflow-y-auto pr-1">
                    {selectedOrder.shippingLogs.length ? (
                      selectedOrder.shippingLogs.map((log) => (
                        <div key={log.id} className="flex gap-3 text-sm">
                          <div className="mt-1.5 h-2 w-2 shrink-0 rounded-full bg-sky-500" />
                          <div className="min-w-0">
                            <p className="font-semibold text-slate-700">
                              {SHIPPING_LABEL[log.status] || log.status}
                            </p>
                            <p className="mt-0.5 text-xs font-normal text-slate-500">
                              {formatDateTime(log.eventTime)}
                            </p>
                          </div>
                        </div>
                      ))
                    ) : (
                      <p className="text-sm font-normal text-slate-500">
                        Chưa có nhật ký vận chuyển.
                      </p>
                    )}
                  </div>
                </div>

                <div className="rounded-[24px] border border-slate-200 bg-slate-50 p-4 shadow-sm">
                  <h3 className="mb-4 flex items-center gap-2 text-sm font-bold text-slate-700">
                    <Wallet className="h-4 w-4 text-sky-600" />
                    Tổng tiền
                  </h3>

                  <div className="space-y-2 text-sm text-slate-600">
                    <div className="flex justify-between gap-3">
                      <span>Tạm tính</span>
                      <span className="font-semibold text-slate-700">
                        {formatCurrency(selectedOrder.subtotal)}
                      </span>
                    </div>

                    <div className="flex justify-between gap-3">
                      <span>Phí giao</span>
                      <span className="font-semibold text-slate-700">
                        {formatCurrency(selectedOrder.shippingFee)}
                      </span>
                    </div>

                    <div className="border-t border-slate-200 pt-3">
                      <div className="flex justify-between gap-3 text-base font-semibold text-slate-800">
                        <span>Tổng</span>
                        <span>{formatCurrency(selectedOrder.totalAmount)}</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {detailLoading && (
                <div className="absolute inset-0 grid place-items-center rounded-3xl bg-white/70">
                  <Loader2 className="h-6 w-6 animate-spin text-sky-600" />
                </div>
              )}
            </div>
          )}
        </section>
      </div>

      {rejectingOrder && (
        <div className="fixed inset-0 z-50 grid place-items-center bg-slate-950/45 px-4 backdrop-blur-sm">
          <div className="w-full max-w-lg overflow-hidden rounded-[28px] border border-slate-200 bg-white shadow-2xl shadow-slate-950/10">
            {/* HEADER */}
            <div className="border-b border-slate-100 px-5 py-5">
              <div className="flex items-start justify-between gap-4">
                <div className="flex min-w-0 items-start gap-3">
                  <div className="grid h-11 w-11 shrink-0 place-items-center rounded-2xl bg-red-50 text-red-500">
                    <XCircle className="h-5 w-5" />
                  </div>

                  <div className="min-w-0">
                    <p className="text-sm font-bold text-red-600">
                      Từ chối yêu cầu hủy
                    </p>

                    <h3 className="mt-1 truncate text-xl font-extrabold text-slate-900">
                      {formatOrderItemCode(rejectingOrder.id)}
                    </h3>

                    <p className="mt-1 text-sm leading-6 text-slate-500">
                      Nhập lý do từ chối. Nội dung này sẽ được gửi cho khách
                      hàng.
                    </p>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => {
                    setRejectingOrder(null);
                    setRejectReason("");
                  }}
                  className="grid h-9 w-9 shrink-0 place-items-center rounded-xl text-slate-400 transition hover:bg-slate-100 hover:text-slate-700"
                >
                  <XCircle className="h-5 w-5" />
                </button>
              </div>
            </div>

            {/* BODY */}
            <div className="px-5 py-5">
              <label className="mb-2 block text-sm font-semibold text-slate-700">
                Lý do từ chối
              </label>

              <textarea
                value={rejectReason}
                onChange={(event) => setRejectReason(event.target.value)}
                rows={5}
                placeholder="Ví dụ: Đơn đã bàn giao vận chuyển nên không thể hủy trực tiếp..."
                className="
          w-full resize-none rounded-2xl border border-slate-200 bg-slate-50
          px-4 py-3 text-sm leading-6 text-slate-700 outline-none transition
          placeholder:text-slate-400
          focus:border-sky-400 focus:bg-white focus:ring-1 focus:ring-sky-100/70
        "
              />

              <p className="mt-2 text-xs leading-5 text-slate-500">
                Nên ghi lý do ngắn gọn, rõ ràng để khách hàng dễ hiểu.
              </p>
            </div>

            {/* ACTIONS */}
            <div className="flex flex-col-reverse gap-2 border-t border-slate-100 bg-slate-50/70 px-5 py-4 sm:flex-row sm:justify-end">
              <button
                type="button"
                onClick={() => {
                  setRejectingOrder(null);
                  setRejectReason("");
                }}
                className="
          inline-flex h-11 items-center justify-center rounded-2xl
          border border-slate-200 bg-white px-4 text-sm font-semibold text-slate-600
          transition-all duration-200
          hover:border-slate-300 hover:bg-slate-50 hover:text-slate-800
          active:scale-[0.98]
        "
              >
                Đóng
              </button>

              <button
                type="button"
                onClick={rejectCancel}
                disabled={actionLoading || !rejectReason.trim()}
                className="
          inline-flex h-11 items-center justify-center gap-2 rounded-2xl
          bg-red-500 px-4 text-sm font-semibold text-white
          shadow-sm shadow-red-100
          transition-all duration-200
          hover:bg-red-600 hover:shadow-md hover:shadow-red-100
          active:scale-[0.98]
          disabled:cursor-not-allowed disabled:bg-slate-300 disabled:shadow-none
        "
              >
                {actionLoading ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <XCircle className="h-4 w-4" />
                )}
                Từ chối yêu cầu
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default EmployeeOrdersPage;
