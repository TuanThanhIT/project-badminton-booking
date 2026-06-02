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
import {
  ManagerEmptyState,
  ManagerPageHeader,
  managerCardClass,
  managerInputClass,
  managerSecondaryButtonClass,
} from "../../components/commons/manager/ManagerPage";

const ORDER_TABS: { value: OrderStatus | "ALL"; label: string }[] = [
  { value: "ALL", label: "Tất cả" },
  { value: "PENDING", label: "Chờ xác nhận" },
  { value: "CONFIRMED", label: "Đã xác nhận" },
  { value: "PREPARING", label: "Đang soạn" },
  { value: "READY_TO_SHIP", label: "Chờ giao" },
  { value: "SHIPPING", label: "Đang giao" },
  { value: "CANCEL_REQUESTED", label: "Yêu cầu hủy" },
  { value: "RETURN_REQUESTED", label: "Yêu cầu trả" },
  { value: "COMPLETED", label: "Hoàn tất" },
  { value: "CANCELLED", label: "Đã hủy" },
];

const ORDER_LABEL: Record<OrderStatus, string> = {
  PENDING: "Chờ xác nhận",
  CONFIRMED: "Đã xác nhận",
  PREPARING: "Đang chuẩn bị",
  READY_TO_SHIP: "Sẵn sàng giao",
  SHIPPING: "Đang giao",
  CANCEL_REQUESTED: "Yêu cầu hủy",
  CANCELLED: "Đã hủy",
  RETURN_REQUESTED: "Yêu cầu trả hàng",
  RETURNING: "Đang hoàn hàng",
  RETURNED: "Đã hoàn",
  COMPLETED: "Hoàn tất",
  FAILED: "Thất bại",
};

const SHIPPING_LABEL: Record<ShippingStatus, string> = {
  PENDING: "Chưa tạo vận đơn",
  CREATED: "Đã tạo vận đơn",
  PICKING: "Đang lấy hàng",
  PICKED: "Đã lấy hàng",
  IN_TRANSIT: "Đang vận chuyển",
  DELIVERING: "Đang giao",
  DELIVERED: "Giao thành công",
  FAILED: "Giao thất bại",
  RETURNING: "Đang hoàn",
  RETURNED: "Đã hoàn",
  CANCELLED: "Đã hủy giao hàng",
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
      <ManagerPageHeader
        eyebrow="Manager orders"
        title="Quản lý đơn hàng"
        description="Theo dõi đơn hàng online, thanh toán và vận chuyển của chi nhánh."
        metrics={[
          { label: "Tổng đơn", value: summary.totalOrders || pagination.total },
          { label: "Giá trị đang xem", value: formatCurrency(totalVisibleAmount) },
        ]}
      />

      <section className={`${managerCardClass} overflow-hidden`}>
        <div className="grid gap-3 p-4 lg:grid-cols-[1fr_180px_auto]">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
            <input
              value={keyword}
              onChange={(event) => {
                setKeyword(event.target.value);
                setPage(1);
              }}
              placeholder="Tìm mã đơn, tên, SĐT, mã GHN..."
              className={`w-full bg-slate-50 pl-9 ${managerInputClass}`}
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
            className={managerInputClass}
          />
          <button
            type="button"
            onClick={fetchOrders}
            className={managerSecondaryButtonClass}
          >
            <RefreshCw className="h-4 w-4" />
            Làm mới
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
              className={`shrink-0 rounded-xl border px-3 py-2 text-xs font-bold transition ${
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
        <section className={`min-h-[560px] p-4 ${managerCardClass}`}>
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-lg font-bold text-slate-900">Danh sách đơn</h2>
            {loading && (
              <span className="rounded-md bg-slate-100 px-2 py-1 text-xs font-bold text-slate-500">
                Đang tải
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
                  className={`w-full rounded-2xl border p-4 text-left transition ${
                    selectedOrder?.id === order.id
                      ? "border-sky-300 bg-sky-50"
                      : "border-slate-200 bg-white hover:border-sky-200 hover:bg-sky-50/40"
                  }`}
                >
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="font-mono text-sm font-bold text-sky-700">
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
                    <p className="font-bold text-slate-900">
                      {formatCurrency(order.totalAmount)}
                    </p>
                  </div>
                </button>
              ))
            ) : (
              <ManagerEmptyState
                icon={ReceiptText}
                title="Chưa có đơn hàng phù hợp"
                description="Thử đổi trạng thái, ngày hoặc từ khóa tìm kiếm để xem đơn hàng khác."
              />
            )}
          </div>

          <div className="mt-4 flex items-center justify-between border-t border-slate-100 pt-4 text-sm">
            <button
              disabled={page <= 1}
              onClick={() => setPage((current) => Math.max(1, current - 1))}
              className="rounded-lg border border-slate-200 px-3 py-2 font-bold disabled:cursor-not-allowed disabled:opacity-40"
            >
              Trước
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

        <section className={`min-h-[560px] p-5 ${managerCardClass}`}>
          {selectedOrder ? (
            <div className="space-y-5">
              <div className="flex flex-wrap items-start justify-between gap-4 rounded-2xl bg-slate-50 p-4">
                <div>
                  <div className="flex flex-wrap items-center gap-2">
                    <h2 className="font-mono text-2xl font-bold text-sky-700">
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
                    Tạo lúc {formatDateTime(selectedOrder.createdAt)}
                  </p>
                </div>
                <div className="text-left lg:text-right">
                  <p className="text-xs font-bold uppercase text-slate-500">
                    Tổng thanh toán
                  </p>
                  <p className="text-2xl font-bold text-slate-900">
                    {formatCurrency(selectedOrder.totalAmount)}
                  </p>
                </div>
              </div>

              <div className="grid gap-4 lg:grid-cols-2">
                <InfoPanel icon={UserRound} title="Người nhận">
                  <InfoRow label="Tên khách" value={selectedOrder.shippingName} />
                  <InfoRow label="Số điện thoại" value={selectedOrder.shippingPhone} />
                  <InfoRow label="Địa chỉ" value={selectedOrder.shippingAddress} />
                </InfoPanel>

                <InfoPanel icon={Truck} title="Vận chuyển">
                  <InfoRow
                    label="Trạng thái"
                    value={SHIPPING_LABEL[selectedOrder.shippingStatus]}
                  />
                  <InfoRow
                    label="Mã GHN"
                    value={selectedOrder.shippingOrderCode || "Chưa tạo"}
                  />
                  <InfoRow
                    label="Dự kiến giao"
                    value={formatDateTime(selectedOrder.estimatedDelivery)}
                  />
                </InfoPanel>
              </div>

              <InfoPanel icon={Package} title="Sản phẩm trong đơn">
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
                          {item.variantInfo || "Mặc định"} - SL {item.quantity}
                        </p>
                      </div>
                      <p className="font-bold text-slate-900">
                        {formatCurrency(item.subTotal)}
                      </p>
                    </div>
                  ))}
                </div>
              </InfoPanel>

              <div className="grid gap-4 lg:grid-cols-[1fr_280px]">
                <InfoPanel icon={Clock3} title="Nhật ký vận chuyển">
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
                        Chưa có nhật ký vận chuyển.
                      </p>
                    )}
                  </div>
                </InfoPanel>

                <InfoPanel icon={CreditCard} title="Thanh toan">
                  <InfoRow
                    label="Phương thức"
                    value={selectedOrder.payment?.paymentMethod || "--"}
                  />
                  <InfoRow
                    label="Trạng thái"
                    value={selectedOrder.payment?.paymentStatus || "UNPAID"}
                  />
                  <InfoRow label="Tạm tính" value={formatCurrency(selectedOrder.subtotal)} />
                  <InfoRow label="Phí giao" value={formatCurrency(selectedOrder.shippingFee)} />
                </InfoPanel>
              </div>
            </div>
          ) : (
            <ManagerEmptyState
              icon={ReceiptText}
              title="Chọn một đơn hàng để xem chi tiết"
              description="Thông tin khách hàng, vận chuyển và sản phẩm sẽ hiển thị tại đây."
            />
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
  <div className="rounded-2xl border border-slate-200 bg-white p-4">
    <h3 className="mb-3 flex items-center gap-2 text-sm font-bold text-slate-800">
      <span className="grid h-9 w-9 place-items-center rounded-xl bg-sky-50 text-sky-600">
        <Icon className="h-4 w-4" />
      </span>
      {title}
    </h3>
    {children}
  </div>
);

const InfoRow = ({ label, value }: { label: string; value: string }) => (
  <div className="mb-2 rounded-xl bg-slate-50 px-3 py-2 text-sm last:mb-0">
    <p className="text-xs font-bold uppercase text-slate-500">{label}</p>
    <p className="mt-1 break-words font-semibold text-slate-800">{value}</p>
  </div>
);

export default OrderPage;
