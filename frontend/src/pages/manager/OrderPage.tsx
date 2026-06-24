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
  managerInputClass,
} from "../../components/commons/manager/ManagerPage";
import TablePagination from "../../components/ui/user/pagination/TablePagination";

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

const LIMIT = 10;

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

const PAYMENT_METHOD_LABEL: Record<string, string> = {
  COD: "Thanh toán khi nhận hàng",
  CASH: "Tiền mặt",
  BANK: "Chuyển khoản",
  VNPAY: "VNPay",
  WALLET: "Ví B-Hub",
};

const PAYMENT_STATUS_LABEL: Record<string, string> = {
  UNPAID: "Chưa thanh toán",
  PENDING: "Chờ thanh toán",
  PAID: "Đã thanh toán",
  FAILED: "Thanh toán thất bại",
  REFUNDED: "Đã hoàn tiền",
  PARTIALLY_REFUNDED: "Hoàn tiền một phần",
  CANCELLED: "Đã hủy",
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
        limit: LIMIT,
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
    () =>
      orders.reduce((sum, order) => sum + Number(order.totalAmount || 0), 0),
    [orders],
  );
  const selectedDetails = selectedOrder?.details || [];
  const selectedShippingLogs = selectedOrder?.shippingLogs || [];

  const selectOrder = (order: ManagerOrder) => {
    dispatch(getManagerOrderDetail({ orderId: order.id }));
  };

  const getTabCount = (value: OrderStatus | "ALL") => {
    if (value === "ALL") return summary.totalOrders || pagination.total || 0;
    return summary[value] || 0;
  };

  return (
    <div className="space-y-6">
      <ManagerPageHeader
        eyebrow="Manager orders"
        title="Quản lý đơn hàng"
        description="Theo dõi đơn hàng online, thanh toán và vận chuyển của chi nhánh."
        metrics={[
          { label: "Tổng đơn", value: summary.totalOrders || pagination.total },
          {
            label: "Giá trị đang xem",
            value: formatCurrency(totalVisibleAmount),
          },
        ]}
      />

      <section className="overflow-hidden rounded-[1.5rem] border border-slate-200 bg-white shadow-sm">
        <div className="grid gap-3 border-b border-slate-100 bg-slate-50/70 p-4 lg:grid-cols-[minmax(0,1fr)_190px_auto] lg:items-end">
          <label>
            <span className="mb-1 block text-xs font-medium text-slate-600">
              Tìm kiếm
            </span>
            <div className="relative">
              <Search className="absolute left-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-slate-400" />
              <input
                value={keyword}
                onChange={(event) => {
                  setKeyword(event.target.value);
                  setPage(1);
                }}
                placeholder="Mã đơn, tên, SĐT, mã GHN..."
                className={`w-full pl-8 ${managerInputClass}`}
              />
            </div>
          </label>
          <label>
            <span className="mb-1 block text-xs font-medium text-slate-600">
              Ngày đặt
            </span>
            <input
              type="date"
              value={date}
              max={getToday()}
              onChange={(event) => {
                setDate(event.target.value);
                setPage(1);
              }}
              className={`w-full ${managerInputClass}`}
            />
          </label>
          <button
            type="button"
            onClick={fetchOrders}
            className="inline-flex h-10 items-center justify-center gap-1.5 rounded-lg border border-slate-200 bg-white px-3 text-[13px] font-semibold text-slate-600 transition hover:border-sky-300 hover:bg-sky-50 hover:text-sky-700"
          >
            <RefreshCw className="h-3.5 w-3.5" />
            Làm mới
          </button>
        </div>

        <div className="px-4 py-3">
          <div className="flex flex-wrap gap-1.5 rounded-2xl border border-slate-200 bg-white p-1.5 shadow-inner shadow-slate-100">
          {ORDER_TABS.map((tab) => (
            <button
              key={tab.value}
              onClick={() => {
                setStatus(tab.value);
                setPage(1);
              }}
              className={`group shrink-0 rounded-xl border px-3.5 py-2 text-[13px] font-bold transition-all duration-200 ${
                status === tab.value
                  ? "border-sky-600 bg-gradient-to-r from-sky-600 to-cyan-500 text-white shadow-md shadow-sky-100"
                  : "border-transparent text-slate-500 hover:border-sky-200 hover:bg-sky-50 hover:text-sky-700"
              }`}
            >
              {tab.label}
              <span
                className={`ml-2 rounded-full px-1.5 py-0.5 text-[11px] font-bold transition ${
                  status === tab.value
                    ? "bg-white/20 text-white"
                    : "bg-white text-sky-700 ring-1 ring-sky-100 group-hover:bg-white"
                }`}
              >
                {getTabCount(tab.value)}
              </span>
            </button>
          ))}
          </div>
        </div>
      </section>

      <div className="grid gap-5 xl:h-[calc(100dvh-330px)] xl:min-h-[560px] xl:grid-cols-[420px_minmax(0,1fr)] xl:items-stretch">
        <section className="flex min-h-[560px] flex-col overflow-hidden rounded-[1.5rem] border border-slate-200 bg-white shadow-sm xl:h-full xl:min-h-0">
          <div className="flex shrink-0 items-center justify-between border-b border-slate-100 bg-white px-4 py-3">
            <div>
              <h2 className="text-base font-bold text-slate-900">
                Danh sách đơn
              </h2>
              <p className="text-xs font-medium text-slate-500">
                {pagination.total || orders.length} đơn phù hợp
              </p>
            </div>
            {loading && (
              <span className="rounded-md bg-slate-100 px-2 py-1 text-xs font-bold text-slate-500">
                Đang tải
              </span>
            )}
          </div>
          <div className="min-h-0 flex-1 space-y-3 overflow-y-auto bg-slate-50/60 p-4">
            {orders.length ? (
              orders.map((order) => (
                <button
                  key={order.id}
                  type="button"
                  onClick={() => selectOrder(order)}
                  className={`w-full rounded-2xl border bg-white p-4 text-left shadow-sm transition hover:-translate-y-0.5 ${
                    selectedOrder?.id === order.id
                      ? "border-sky-400 ring-2 ring-sky-100"
                      : "border-slate-200 hover:border-sky-200"
                  }`}
                >
                  <div className="flex flex-wrap items-center justify-between gap-2">
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
                    <p className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-500">
                      <Clock3 className="h-3.5 w-3.5 text-sky-500" />
                      {formatDateTime(order.createdAt)}
                    </p>
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

          <TablePagination
            page={pagination.page || page}
            totalPages={pagination.totalPages || 1}
            total={pagination.total || orders.length}
            onPage={setPage}
            unit="đơn"
            compact
          />
        </section>

        <section className="min-h-[560px] overflow-y-auto rounded-[1.5rem] border border-slate-200 bg-white p-5 shadow-sm xl:h-full xl:min-h-0">
          {selectedOrder ? (
            <div className="space-y-5">
              <div className="flex flex-wrap items-start justify-between gap-4 rounded-2xl border border-sky-100 bg-gradient-to-br from-sky-50 to-white p-5">
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
                  <p className="text-xs font-bold text-slate-500">
                    Tổng thanh toán
                  </p>
                  <p className="text-2xl font-bold text-slate-900">
                    {formatCurrency(selectedOrder.totalAmount)}
                  </p>
                </div>
              </div>

              <div className="grid gap-4 lg:grid-cols-2">
                <InfoPanel icon={UserRound} title="Người nhận">
                  <InfoRow
                    label="Tên khách"
                    value={selectedOrder.shippingName}
                  />
                  <InfoRow
                    label="Số điện thoại"
                    value={selectedOrder.shippingPhone}
                  />
                  <InfoRow
                    label="Địa chỉ"
                    value={selectedOrder.shippingAddress}
                  />
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

                <InfoPanel icon={CreditCard} title="Thanh toán">
                  <InfoRow
                    label="Phương thức"
                    value={
                      PAYMENT_METHOD_LABEL[
                        selectedOrder.payment?.paymentMethod || ""
                      ] ||
                      selectedOrder.payment?.paymentMethod ||
                      "--"
                    }
                  />
                  <InfoRow
                    label="Trạng thái"
                    value={
                      PAYMENT_STATUS_LABEL[
                        selectedOrder.payment?.paymentStatus || "UNPAID"
                      ] ||
                      selectedOrder.payment?.paymentStatus ||
                      "Chưa thanh toán"
                    }
                  />
                  <InfoRow
                    label="Tạm tính"
                    value={formatCurrency(selectedOrder.subtotal)}
                  />
                  <InfoRow
                    label="Phí giao"
                    value={formatCurrency(selectedOrder.shippingFee)}
                  />
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
  <div className="rounded-2xl border border-slate-200 bg-slate-50/60 p-4">
    <h3 className="mb-3 flex items-center gap-2 text-sm font-bold text-slate-800">
      <span className="grid h-9 w-9 place-items-center rounded-xl bg-sky-50 text-sky-600">
        <Icon className="h-4 w-4" />
      </span>
      {title}
    </h3>
    <div className="space-y-2.5">{children}</div>
  </div>
);

const InfoRow = ({ label, value }: { label: string; value: string }) => (
  <div className="rounded-xl bg-white px-3 py-2 text-sm ring-1 ring-slate-100">
    <p className="text-xs font-bold text-slate-500">{label}</p>
    <p className="mt-1 break-words font-semibold text-slate-800">{value}</p>
  </div>
);

export default OrderPage;
