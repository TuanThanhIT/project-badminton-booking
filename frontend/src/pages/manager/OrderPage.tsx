import { useEffect, useMemo, useState } from "react";
import type { ReactNode } from "react";
import {
  Clock3,
  CreditCard,
  Package,
  ReceiptText,
  RefreshCw,
  Search,
  Truck,
  UserRound,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { useAppDispatch, useAppSelector } from "../../redux/hook";
import {
  getManagerOrderDetail,
  getManagerOrders,
} from "../../redux/slices/manager/orderSlice";
import type {
  ManagerOrder,
  OrderStatus,
  ShippingStatus,
} from "../../types/order";
import { formatOrderItemCode } from "../../utils/order";

const ORDER_TABS: { value: OrderStatus | "ALL"; label: string }[] = [
  { value: "ALL", label: "Tat ca" },
  { value: "PENDING", label: "Cho xac nhan" },
  { value: "CONFIRMED", label: "Da xac nhan" },
  { value: "PREPARING", label: "Dang soan" },
  { value: "READY_TO_SHIP", label: "Cho giao" },
  { value: "SHIPPING", label: "Dang giao" },
  { value: "CANCEL_REQUESTED", label: "Yeu cau huy" },
  { value: "RETURN_REQUESTED", label: "Yeu cau tra" },
  { value: "COMPLETED", label: "Hoan tat" },
  { value: "CANCELLED", label: "Da huy" },
];

const ORDER_LABEL: Record<OrderStatus, string> = {
  PENDING: "Cho xac nhan",
  CONFIRMED: "Da xac nhan",
  PREPARING: "Dang chuan bi",
  READY_TO_SHIP: "San sang giao",
  SHIPPING: "Dang giao",
  CANCEL_REQUESTED: "Yeu cau huy",
  CANCELLED: "Da huy",
  RETURN_REQUESTED: "Yeu cau tra hang",
  RETURNING: "Dang hoan hang",
  RETURNED: "Da hoan",
  COMPLETED: "Hoan tat",
  FAILED: "That bai",
};

const SHIPPING_LABEL: Record<ShippingStatus, string> = {
  PENDING: "Chua tao van don",
  CREATED: "Da tao van don",
  PICKING: "Dang lay hang",
  PICKED: "Da lay hang",
  IN_TRANSIT: "Dang van chuyen",
  DELIVERING: "Dang giao",
  DELIVERED: "Giao thanh cong",
  FAILED: "Giao that bai",
  RETURNING: "Dang hoan",
  RETURNED: "Da hoan",
  CANCELLED: "Da huy giao hang",
};

const statusClass: Record<OrderStatus, string> = {
  PENDING: "border-amber-200 bg-amber-50 text-amber-700",
  CONFIRMED: "border-sky-200 bg-sky-50 text-sky-700",
  PREPARING: "border-indigo-200 bg-indigo-50 text-indigo-700",
  READY_TO_SHIP: "border-cyan-200 bg-cyan-50 text-cyan-700",
  SHIPPING: "border-blue-200 bg-blue-50 text-blue-700",
  CANCEL_REQUESTED: "border-orange-200 bg-orange-50 text-orange-700",
  CANCELLED: "border-red-200 bg-red-50 text-red-700",
  RETURN_REQUESTED: "border-purple-200 bg-purple-50 text-purple-700",
  RETURNING: "border-fuchsia-200 bg-fuchsia-50 text-fuchsia-700",
  RETURNED: "border-slate-200 bg-slate-100 text-slate-700",
  COMPLETED: "border-emerald-200 bg-emerald-50 text-emerald-700",
  FAILED: "border-red-200 bg-red-50 text-red-700",
};

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

///MANAGER
const OrderPage = () => {
  const dispatch = useAppDispatch();
  const { orders, selectedOrder, summary, pagination, loading } =
    useAppSelector((state) => state.managerOrder);

  const [status, setStatus] = useState<OrderStatus | "ALL">("ALL");
  const [keyword, setKeyword] = useState("");
  const [date, setDate] = useState("");
  const [page, setPage] = useState(1);

  const fetchOrders = () => {
    dispatch(
      getManagerOrders({
        status: status === "ALL" ? undefined : status,
        keyword: keyword.trim() || undefined,
        date: date || undefined,
        page,
        limit: 12,
      }),
    );
  };

  useEffect(() => {
    const timer = window.setTimeout(fetchOrders, 300);
    return () => window.clearTimeout(timer);
  }, [dispatch, status, keyword, date, page]);

  useEffect(() => {
    if (!selectedOrder && orders[0]) {
      dispatch(getManagerOrderDetail({ orderId: orders[0].id }));
    }
  }, [dispatch, orders, selectedOrder]);

  const totalVisibleAmount = useMemo(
    () => orders.reduce((sum, order) => sum + Number(order.totalAmount || 0), 0),
    [orders],
  );
  const selectedDetails = selectedOrder?.details || [];
  const selectedShippingLogs = selectedOrder?.shippingLogs || [];

  const selectOrder = (order: ManagerOrder) => {
    dispatch(getManagerOrderDetail({ orderId: order.id }));
  };

  return (
    <div className="space-y-5">
      <section className="overflow-hidden rounded-lg border border-slate-200 bg-white shadow-sm">
        <div className="grid gap-4 border-b border-slate-100 bg-slate-950 p-5 text-white lg:grid-cols-[1fr_auto] lg:items-center">
          <div>
            <p className="text-xs font-bold uppercase text-sky-200">
              ///MANAGER orders
            </p>
            <h1 className="mt-1 text-2xl font-black">Quan ly don hang</h1>
            <p className="mt-2 text-sm text-slate-300">
              Theo doi don hang online, thanh toan va van chuyen cua chi nhanh.
            </p>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="rounded-lg border border-white/10 bg-white/10 p-4">
              <p className="text-xs uppercase text-slate-300">Tong don</p>
              <p className="mt-1 text-2xl font-black">
                {summary.totalOrders || pagination.total}
              </p>
            </div>
            <div className="rounded-lg border border-white/10 bg-white/10 p-4">
              <p className="text-xs uppercase text-slate-300">Gia tri dang xem</p>
              <p className="mt-1 text-2xl font-black">
                {formatCurrency(totalVisibleAmount)}
              </p>
            </div>
          </div>
        </div>

        <div className="grid gap-3 p-4 lg:grid-cols-[1fr_180px_auto]">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
            <input
              value={keyword}
              onChange={(event) => {
                setKeyword(event.target.value);
                setPage(1);
              }}
              placeholder="Tim ma don, ten, sdt, ma GHN..."
              className="h-11 w-full rounded-lg border border-slate-200 bg-slate-50 pl-9 pr-3 text-sm outline-none focus:border-sky-400 focus:bg-white"
            />
          </div>
          <input
            type="date"
            value={date}
            max={getToday()}
            onChange={(event) => {
              setDate(event.target.value);
              setPage(1);
            }}
            className="h-11 rounded-lg border border-slate-200 bg-slate-50 px-3 text-sm outline-none focus:border-sky-400 focus:bg-white"
          />
          <button
            type="button"
            onClick={fetchOrders}
            className="inline-flex h-11 items-center justify-center gap-2 rounded-lg border border-slate-200 px-4 text-sm font-bold text-slate-700 hover:bg-slate-50"
          >
            <RefreshCw className="h-4 w-4" />
            Lam moi
          </button>
        </div>

        <div className="flex gap-2 overflow-x-auto border-t border-slate-100 px-4 py-3">
          {ORDER_TABS.map((tab) => (
            <button
              key={tab.value}
              onClick={() => {
                setStatus(tab.value);
                setPage(1);
              }}
              className={`shrink-0 rounded-lg border px-3 py-2 text-xs font-bold transition ${
                status === tab.value
                  ? "border-sky-300 bg-sky-50 text-sky-700"
                  : "border-slate-200 bg-white text-slate-600 hover:bg-slate-50"
              }`}
            >
              {tab.label}
              {tab.value !== "ALL" && summary[tab.value] ? (
                <span className="ml-2 rounded-full bg-white px-1.5 py-0.5 text-[11px]">
                  {summary[tab.value]}
                </span>
              ) : null}
            </button>
          ))}
        </div>
      </section>

      <div className="grid gap-5 xl:grid-cols-[0.95fr_1.25fr]">
        <section className="min-h-[560px] rounded-lg border border-slate-200 bg-white p-4 shadow-sm">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-lg font-black text-slate-900">Danh sach don</h2>
            {loading && (
              <span className="rounded-md bg-slate-100 px-2 py-1 text-xs font-bold text-slate-500">
                Dang tai
              </span>
            )}
          </div>
          <div className="space-y-3">
            {orders.length ? (
              orders.map((order) => (
                <button
                  key={order.id}
                  type="button"
                  onClick={() => selectOrder(order)}
                  className={`w-full rounded-lg border p-4 text-left transition ${
                    selectedOrder?.id === order.id
                      ? "border-sky-300 bg-sky-50"
                      : "border-slate-200 bg-white hover:border-sky-200 hover:bg-sky-50/40"
                  }`}
                >
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="font-mono text-sm font-black text-sky-700">
                      {formatOrderItemCode(order.id)}
                    </span>
                    <span
                      className={`rounded-full border px-2 py-1 text-[11px] font-bold ${
                        statusClass[order.orderStatus]
                      }`}
                    >
                      {ORDER_LABEL[order.orderStatus]}
                    </span>
                  </div>
                  <div className="mt-3 grid gap-2 text-sm text-slate-600">
                    <p className="font-semibold text-slate-800">
                      {order.shippingName} - {order.shippingPhone}
                    </p>
                    <p>{formatDateTime(order.createdAt)}</p>
                    <p className="font-black text-slate-900">
                      {formatCurrency(order.totalAmount)}
                    </p>
                  </div>
                </button>
              ))
            ) : (
              <div className="rounded-lg border border-dashed border-slate-300 py-16 text-center text-sm font-semibold text-slate-500">
                Chua co don hang phu hop.
              </div>
            )}
          </div>

          <div className="mt-4 flex items-center justify-between border-t border-slate-100 pt-4 text-sm">
            <button
              disabled={page <= 1}
              onClick={() => setPage((current) => Math.max(1, current - 1))}
              className="rounded-lg border border-slate-200 px-3 py-2 font-bold disabled:cursor-not-allowed disabled:opacity-40"
            >
              Truoc
            </button>
            <span className="font-semibold text-slate-500">
              Trang {pagination.page}/{pagination.totalPages || 1}
            </span>
            <button
              disabled={page >= (pagination.totalPages || 1)}
              onClick={() => setPage((current) => current + 1)}
              className="rounded-lg border border-slate-200 px-3 py-2 font-bold disabled:cursor-not-allowed disabled:opacity-40"
            >
              Sau
            </button>
          </div>
        </section>

        <section className="min-h-[560px] rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
          {selectedOrder ? (
            <div className="space-y-5">
              <div className="flex flex-wrap items-start justify-between gap-4 rounded-lg bg-slate-50 p-4">
                <div>
                  <div className="flex flex-wrap items-center gap-2">
                    <h2 className="font-mono text-2xl font-black text-sky-700">
                      {formatOrderItemCode(selectedOrder.id)}
                    </h2>
                    <span
                      className={`rounded-full border px-3 py-1 text-xs font-bold ${
                        statusClass[selectedOrder.orderStatus]
                      }`}
                    >
                      {ORDER_LABEL[selectedOrder.orderStatus]}
                    </span>
                  </div>
                  <p className="mt-2 text-sm font-semibold text-slate-500">
                    Tao luc {formatDateTime(selectedOrder.createdAt)}
                  </p>
                </div>
                <div className="text-left lg:text-right">
                  <p className="text-xs font-bold uppercase text-slate-500">
                    Tong thanh toan
                  </p>
                  <p className="text-2xl font-black text-slate-900">
                    {formatCurrency(selectedOrder.totalAmount)}
                  </p>
                </div>
              </div>

              <div className="grid gap-4 lg:grid-cols-2">
                <InfoPanel icon={UserRound} title="Nguoi nhan">
                  <InfoRow label="Ten khach" value={selectedOrder.shippingName} />
                  <InfoRow label="So dien thoai" value={selectedOrder.shippingPhone} />
                  <InfoRow label="Dia chi" value={selectedOrder.shippingAddress} />
                </InfoPanel>

                <InfoPanel icon={Truck} title="Van chuyen">
                  <InfoRow
                    label="Trang thai"
                    value={SHIPPING_LABEL[selectedOrder.shippingStatus]}
                  />
                  <InfoRow
                    label="Ma GHN"
                    value={selectedOrder.shippingOrderCode || "Chua tao"}
                  />
                  <InfoRow
                    label="Du kien giao"
                    value={formatDateTime(selectedOrder.estimatedDelivery)}
                  />
                </InfoPanel>
              </div>

              <InfoPanel icon={Package} title="San pham trong don">
                <div className="divide-y divide-slate-100">
                  {selectedDetails.map((item) => (
                    <div
                      key={item.id}
                      className="grid gap-2 py-3 text-sm sm:grid-cols-[1fr_auto]"
                    >
                      <div>
                        <p className="font-bold text-slate-800">
                          {item.productName}
                        </p>
                        <p className="text-xs font-semibold text-slate-500">
                          {item.variantInfo || "Mac dinh"} - SL {item.quantity}
                        </p>
                      </div>
                      <p className="font-black text-slate-900">
                        {formatCurrency(item.subTotal)}
                      </p>
                    </div>
                  ))}
                </div>
              </InfoPanel>

              <div className="grid gap-4 lg:grid-cols-[1fr_280px]">
                <InfoPanel icon={Clock3} title="Nhat ky van chuyen">
                  <div className="max-h-52 space-y-3 overflow-y-auto">
                  {selectedShippingLogs.length ? (
                    selectedShippingLogs.map((log) => (
                        <div key={log.id} className="flex gap-3 text-sm">
                          <span className="mt-1.5 h-2 w-2 rounded-full bg-sky-500" />
                          <div>
                            <p className="font-bold text-slate-700">
                              {SHIPPING_LABEL[log.status] || log.status}
                            </p>
                            <p className="text-xs text-slate-500">
                              {formatDateTime(log.eventTime)}
                            </p>
                          </div>
                        </div>
                      ))
                    ) : (
                      <p className="text-sm font-semibold text-slate-500">
                        Chua co nhat ky van chuyen.
                      </p>
                    )}
                  </div>
                </InfoPanel>

                <InfoPanel icon={CreditCard} title="Thanh toan">
                  <InfoRow
                    label="Phuong thuc"
                    value={selectedOrder.payment?.paymentMethod || "--"}
                  />
                  <InfoRow
                    label="Trang thai"
                    value={selectedOrder.payment?.paymentStatus || "UNPAID"}
                  />
                  <InfoRow label="Tam tinh" value={formatCurrency(selectedOrder.subtotal)} />
                  <InfoRow label="Phi giao" value={formatCurrency(selectedOrder.shippingFee)} />
                </InfoPanel>
              </div>
            </div>
          ) : (
            <div className="grid min-h-[500px] place-items-center text-center">
              <div>
                <ReceiptText className="mx-auto h-10 w-10 text-slate-300" />
                <p className="mt-3 text-sm font-semibold text-slate-500">
                  Chon mot don hang de xem chi tiet.
                </p>
              </div>
            </div>
          )}
        </section>
      </div>
    </div>
  );
};

type PanelProps = {
  icon: LucideIcon;
  title: string;
  children: ReactNode;
};

const InfoPanel = ({ icon: Icon, title, children }: PanelProps) => (
  <div className="rounded-lg border border-slate-200 bg-white p-4">
    <h3 className="mb-3 flex items-center gap-2 text-sm font-black text-slate-800">
      <span className="grid h-9 w-9 place-items-center rounded-lg bg-sky-50 text-sky-600">
        <Icon className="h-4 w-4" />
      </span>
      {title}
    </h3>
    {children}
  </div>
);

const InfoRow = ({ label, value }: { label: string; value: string }) => (
  <div className="mb-2 rounded-lg bg-slate-50 px-3 py-2 text-sm last:mb-0">
    <p className="text-xs font-bold uppercase text-slate-500">{label}</p>
    <p className="mt-1 break-words font-semibold text-slate-800">{value}</p>
  </div>
);

export default OrderPage;
