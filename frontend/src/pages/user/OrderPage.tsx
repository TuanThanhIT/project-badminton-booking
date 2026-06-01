import { useEffect, useMemo, useState } from "react";
import {
  ArrowRight,
  Calendar,
  ChevronDown,
  ClipboardList,
  Filter,
  PackageSearch,
  ReceiptText,
  RotateCcw,
  ShoppingBag,
  Truck,
  WalletCards,
  X,
} from "lucide-react";
import { useAppDispatch, useAppSelector } from "../../redux/hook";
import {
  clearOrderDetail,
  getOrderDetail,
  getOrderTracking,
  getTrackingProgress,
  getUserOrders,
} from "../../redux/slices/user/orderSlice";
import OrderDetail from "../../components/ui/user/order/OrderDetail";
import PaginatedItems from "../../components/ui/user/pagination/PaginatedItems";
import { ORDER_STATUS_COLOR } from "../../utils/constants/color";
import { ORDER_STATUS_LABEL } from "../../utils/constants/orderLabel";
import { formatOrderCode, formatOrderItemCode } from "../../utils/order";
import { ORDER_GROUP_STATUS_UI } from "../../utils/orderGroupStatusUI";

const TABS = [
  { key: "ALL", label: "Tất cả" },
  { key: "PENDING_PAYMENT", label: "Chờ thanh toán" },
  { key: "PAID", label: "Đã thanh toán" },
  { key: "FAILED", label: "Thất bại" },
  { key: "CANCELLED", label: "Đã hủy" },
];

const inputClass =
  "w-full appearance-none rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-700 outline-none transition-all hover:border-sky-200 hover:bg-white focus:border-sky-400 focus:bg-white focus:ring-1 focus:ring-sky-100 placeholder:text-slate-400";

const labelClass = "text-[13px] font-medium text-slate-600";

const OrderPage = () => {
  const dispatch = useAppDispatch();

  const { userOrderGroup, userOrderPagination } = useAppSelector(
    (state) => state.order,
  );

  const [selectedOrderId, setSelectedOrderId] = useState<number | null>(null);

  const [filters, setFilters] = useState({
    status: "ALL",
    page: 1,
    limit: 5,
    dateFrom: "",
    dateTo: "",
    sort: "newest" as "newest" | "oldest",
  });

  useEffect(() => {
    dispatch(
      getUserOrders({
        data: {
          status: filters.status,
          page: filters.page,
          limit: filters.limit,
          dateFrom: filters.dateFrom || undefined,
          dateTo: filters.dateTo || undefined,
          sort: filters.sort,
        },
      }),
    );
  }, [dispatch, filters]);

  const groups = userOrderGroup || [];

  const stats = useMemo(() => {
    const visibleOrders = groups.reduce(
      (sum, group) => sum + group.orders.length,
      0,
    );

    const visibleTotal = groups.reduce(
      (sum, group) => sum + Number(group.finalAmount || 0),
      0,
    );

    return {
      groups: groups.length,
      orders: visibleOrders,
      total: visibleTotal,
    };
  }, [groups]);

  const activeTabLabel =
    TABS.find((tab) => tab.key === filters.status)?.label || "Tất cả";

  const handleSelectOrder = (orderId: number) => {
    dispatch(clearOrderDetail());
    setSelectedOrderId(orderId);
    dispatch(getOrderDetail({ data: { orderId } }));
    dispatch(getOrderTracking({ data: { orderId } }));
    dispatch(getTrackingProgress({ data: { orderId } }));
  };

  const handleCloseDetail = () => {
    setSelectedOrderId(null);
    dispatch(clearOrderDetail());
  };

  const resetFilters = () => {
    setFilters({
      status: "ALL",
      page: 1,
      limit: 5,
      dateFrom: "",
      dateTo: "",
      sort: "newest",
    });
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-700">
      <section className="relative overflow-hidden bg-sky-950">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(56,189,248,0.22),transparent_34%),radial-gradient(circle_at_bottom_right,rgba(14,165,233,0.14),transparent_32%)]" />

        <div className="relative mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:py-12">
          <div className="flex flex-col gap-8 lg:flex-row lg:items-end lg:justify-between">
            <div>
              <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/10 px-4 py-2 text-sm font-medium text-sky-100">
                <ReceiptText size={16} className="text-sky-300" />
                Trung tâm đơn hàng
              </div>

              <h1 className="text-3xl font-extrabold leading-tight tracking-tight text-white sm:text-4xl md:text-5xl">
                Đơn hàng của tôi
              </h1>

              <p className="mt-4 max-w-2xl text-base leading-relaxed text-sky-100 sm:text-lg">
                Theo dõi thanh toán, vận chuyển và xem chi tiết từng đơn hàng đã
                đặt tại B-Hub.
              </p>
            </div>

            <div className="grid grid-cols-3 gap-3 lg:min-w-[420px]">
              {[
                { icon: ShoppingBag, label: "Nhóm đơn", value: stats.groups },
                { icon: Truck, label: "Đơn nhỏ", value: stats.orders },
                {
                  icon: WalletCards,
                  label: "Tổng hiển thị",
                  value: `${stats.total.toLocaleString()}đ`,
                },
              ].map((item) => (
                <div
                  key={item.label}
                  className="rounded-2xl border border-white/10 bg-white/10 px-3 py-4 text-white backdrop-blur-sm sm:px-4"
                >
                  <item.icon size={18} className="mb-2 text-sky-200" />

                  <p className="truncate text-xl font-semibold leading-none sm:text-2xl">
                    {item.value}
                  </p>

                  <p className="mt-2 text-xs text-sky-100">{item.label}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      <main className="relative z-10 mx-auto -mt-6 max-w-7xl px-4 pb-10 sm:px-6">
        {/* FILTER */}
        <section className="mb-6 overflow-hidden rounded-[2rem] border border-slate-200/80 bg-white shadow-[0_14px_36px_rgba(15,23,42,0.08)]">
          <div className="flex flex-col gap-4 border-b border-slate-100 p-5 lg:flex-row lg:items-center lg:justify-between">
            <div className="flex items-center gap-3">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl border border-sky-100 bg-sky-50 text-sky-600">
                <Filter size={21} />
              </div>

              <div>
                <h2 className="text-lg font-semibold text-slate-800">
                  Bộ lọc đơn hàng
                </h2>

                <p className="text-sm text-slate-500">
                  Đang xem:{" "}
                  <span className="font-medium text-sky-700">
                    {activeTabLabel}
                  </span>
                </p>
              </div>
            </div>

            <button
              type="button"
              onClick={resetFilters}
              className="group inline-flex w-fit items-center gap-2 rounded-2xl border border-slate-200 bg-slate-50 px-4 py-2.5 text-sm font-medium text-slate-600 transition-all hover:border-rose-100 hover:bg-rose-50 hover:text-rose-600"
            >
              <RotateCcw
                size={15}
                className="transition-transform duration-300 group-hover:rotate-180"
              />
              Xóa bộ lọc
            </button>
          </div>

          <div className="space-y-5 p-5">
            <div className="flex gap-2 overflow-x-auto pb-1">
              {TABS.map((tab) => (
                <button
                  key={tab.key}
                  type="button"
                  onClick={() =>
                    setFilters((prev) => ({
                      ...prev,
                      status: tab.key,
                      page: 1,
                    }))
                  }
                  className={`shrink-0 rounded-2xl border px-4 py-2.5 text-sm font-medium transition-all ${
                    filters.status === tab.key
                      ? "border-sky-300 bg-sky-50 text-sky-800 shadow-sm"
                      : "border-slate-200 bg-white text-slate-600 hover:border-sky-200 hover:bg-sky-50 hover:text-sky-700"
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>

            <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
              <div className="space-y-2">
                <label className={labelClass}>Sắp xếp</label>

                <div className="relative">
                  <select
                    className={`${inputClass} pr-10`}
                    value={filters.sort}
                    onChange={(e) =>
                      setFilters((prev) => ({
                        ...prev,
                        sort: e.target.value as "newest" | "oldest",
                        page: 1,
                      }))
                    }
                  >
                    <option value="newest">Mới nhất</option>
                    <option value="oldest">Cũ nhất</option>
                  </select>

                  <ChevronDown
                    size={16}
                    className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 text-slate-400"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className={labelClass}>Từ ngày</label>

                <div className="relative">
                  <input
                    type="date"
                    className={`${inputClass} pl-11`}
                    value={filters.dateFrom}
                    onChange={(e) =>
                      setFilters((prev) => ({
                        ...prev,
                        dateFrom: e.target.value,
                        page: 1,
                      }))
                    }
                  />

                  <Calendar
                    size={16}
                    className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className={labelClass}>Đến ngày</label>

                <div className="relative">
                  <input
                    type="date"
                    className={`${inputClass} pl-11`}
                    value={filters.dateTo}
                    onChange={(e) =>
                      setFilters((prev) => ({
                        ...prev,
                        dateTo: e.target.value,
                        page: 1,
                      }))
                    }
                  />

                  <Calendar
                    size={16}
                    className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"
                  />
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ORDER LIST BLOCK */}
        <section className="min-w-0 overflow-hidden rounded-[2rem] border border-slate-200/80 bg-white shadow-[0_14px_36px_rgba(15,23,42,0.08)]">
          {/* HEADER DANH SÁCH */}
          <div className="flex flex-col gap-4 border-b border-slate-100 p-5 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-center gap-3">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl border border-sky-100 bg-sky-50 text-sky-600">
                <ClipboardList size={21} />
              </div>

              <div>
                <h2 className="text-lg font-semibold text-slate-800">
                  Danh sách đơn hàng
                </h2>

                <p className="mt-1 text-sm text-slate-500">
                  Bấm vào một đơn nhỏ để mở chi tiết hóa đơn và vận chuyển.
                </p>
              </div>
            </div>

            <span className="w-fit rounded-full border border-slate-200 bg-slate-50 px-4 py-2 text-xs font-medium text-slate-500">
              {userOrderPagination?.total || 0} kết quả
            </span>
          </div>

          {/* BODY DANH SÁCH */}
          <div className="bg-slate-50/70 p-5">
            {groups.length === 0 ? (
              <div className="flex flex-col items-center justify-center rounded-[2rem] border border-dashed border-slate-300 bg-white px-6 py-16 text-center shadow-sm">
                <div className="mb-4 rounded-3xl bg-sky-50 p-4 text-sky-600">
                  <PackageSearch size={36} />
                </div>

                <p className="text-lg font-semibold text-slate-800">
                  Không có đơn hàng
                </p>

                <p className="mt-2 max-w-md text-sm leading-relaxed text-slate-500">
                  Không tìm thấy đơn hàng phù hợp với bộ lọc hiện tại.
                </p>
              </div>
            ) : (
              <div className="space-y-5">
                {groups.map((group) => {
                  const key = group.status?.toUpperCase();
                  const statusUI =
                    ORDER_GROUP_STATUS_UI[key] ||
                    ORDER_GROUP_STATUS_UI.PENDING_PAYMENT;
                  const Icon = statusUI.icon;

                  return (
                    <article
                      key={group.orderGroupId}
                      className="overflow-hidden rounded-[2rem] border border-slate-200 bg-white shadow-sm transition-all hover:border-slate-300 hover:shadow-md"
                    >
                      {/* HEADER NHÓM ĐƠN */}
                      <div className="border-b border-slate-100 bg-white p-5">
                        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                          <div className="flex items-center gap-3">
                            <div className="flex h-11 w-11 items-center justify-center rounded-2xl border border-sky-100 bg-sky-50 text-sky-600">
                              <ClipboardList size={20} />
                            </div>

                            <div>
                              <p className="text-xs font-medium uppercase tracking-wide text-slate-400">
                                Mã nhóm đơn
                              </p>

                              <p className="text-lg font-semibold text-slate-800">
                                #
                                {formatOrderCode(
                                  group.orderGroupId,
                                  group.createdAt,
                                )}
                              </p>
                            </div>
                          </div>

                          <div className="flex flex-wrap items-center gap-2">
                            <span
                              className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-medium ${statusUI.className}`}
                            >
                              <Icon size={14} />
                              {statusUI.label}
                            </span>

                            <span className="rounded-full border border-slate-200 bg-slate-50 px-3 py-1.5 text-xs font-medium text-slate-500">
                              {group.orders.length} đơn nhỏ
                            </span>
                          </div>
                        </div>
                      </div>

                      {/* BODY: 70% ĐƠN NHỎ - 30% TỔNG TIỀN */}
                      <div className="grid grid-cols-1 gap-5 bg-slate-50/60 p-5 xl:grid-cols-[7fr_3fr]">
                        {/* LEFT: DANH SÁCH ĐƠN NHỎ */}
                        <div className="min-w-0 space-y-3">
                          {group.orders.map((order) => (
                            <button
                              key={order.orderId}
                              type="button"
                              onClick={() => handleSelectOrder(order.orderId)}
                              className="
          group w-full cursor-pointer rounded-2xl
          border border-slate-200 bg-white p-4 text-left
          transition-all hover:border-sky-200 hover:bg-sky-50/40
        "
                            >
                              {/* HEADER ĐƠN CON */}
                              <div className="mb-3 flex flex-wrap items-center justify-between gap-3">
                                <span
                                  className={`inline-flex rounded-full px-3.5 py-1.5 text-sm font-bold ${ORDER_STATUS_COLOR[order.orderStatus]}`}
                                >
                                  {ORDER_STATUS_LABEL[order.orderStatus]}
                                </span>

                                <span className="inline-flex rounded-full border border-slate-200 bg-slate-50 px-3.5 py-1.5 text-sm font-semibold text-slate-700">
                                  {formatOrderItemCode(order.orderId)}
                                </span>
                              </div>

                              {/* ITEMS */}
                              <div className="space-y-2">
                                {order.items.slice(0, 2).map((item, idx) => (
                                  <div
                                    key={`${order.orderId}-${idx}`}
                                    className="
                grid grid-cols-[76px_1fr_auto] items-center gap-4
                rounded-2xl border border-slate-100 bg-slate-50/60 p-3
              "
                                  >
                                    <img
                                      src={item.thumbnailUrl}
                                      alt={item.name}
                                      className="h-20 w-16 shrink-0 rounded-xl border border-slate-100 object-cover"
                                    />

                                    <div className="min-w-0">
                                      <p className="line-clamp-2 text-base font-bold leading-snug text-slate-800">
                                        {item.name}
                                      </p>

                                      <div className="mt-2 flex flex-wrap items-center gap-2">
                                        <span className="rounded-full bg-white px-3 py-1 text-sm font-semibold text-slate-600">
                                          x{item.quantity}
                                        </span>
                                      </div>
                                    </div>

                                    <div className="shrink-0 text-right">
                                      <p className="text-base font-extrabold text-sky-700">
                                        {Number(item.price).toLocaleString()}đ
                                      </p>
                                    </div>
                                  </div>
                                ))}
                              </div>

                              {order.items.length > 2 && (
                                <p className="mt-3 text-sm font-semibold text-slate-500">
                                  +{order.items.length - 2} sản phẩm khác
                                </p>
                              )}

                              {/* FOOTER */}
                              <div className="mt-3 flex items-center justify-end border-t border-slate-100 pt-3">
                                <div className="flex items-center gap-1.5 text-sm font-bold text-sky-600">
                                  <span>Xem chi tiết</span>

                                  <ArrowRight
                                    size={16}
                                    className="transition-transform group-hover:translate-x-0.5"
                                  />
                                </div>
                              </div>
                            </button>
                          ))}
                        </div>

                        {/* RIGHT: TỔNG TIỀN */}
                        <aside className="h-fit rounded-2xl border border-slate-200 bg-white p-4 xl:sticky xl:top-5">
                          <div className="mb-4 flex items-center gap-2 border-b border-slate-100 pb-4">
                            <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-sky-50 text-sky-600">
                              <WalletCards size={20} />
                            </div>

                            <div>
                              <p className="text-sm font-bold text-slate-800">
                                Tổng thanh toán
                              </p>

                              <p className="text-xs text-slate-500">
                                Thông tin nhóm đơn
                              </p>
                            </div>
                          </div>

                          <div className="space-y-2">
                            <div className="flex items-center justify-between border-b border-slate-100 py-2.5">
                              <span className="text-sm font-medium text-slate-500">
                                Tiền hàng
                              </span>

                              <span className="text-sm font-bold text-slate-800">
                                {Number(group.totalAmount).toLocaleString()}đ
                              </span>
                            </div>

                            <div className="flex items-center justify-between border-b border-slate-100 py-2.5">
                              <span className="text-sm font-medium text-slate-500">
                                Phí ship
                              </span>

                              <span className="text-sm font-bold text-slate-800">
                                {Number(
                                  group.totalShippingFee,
                                ).toLocaleString()}
                                đ
                              </span>
                            </div>

                            <div className="flex items-center justify-between rounded-2xl bg-sky-50 px-4 py-3">
                              <span className="text-sm font-bold text-sky-700">
                                Tổng
                              </span>

                              <span className="text-lg font-extrabold text-sky-700">
                                {Number(group.finalAmount).toLocaleString()}đ
                              </span>
                            </div>
                          </div>
                        </aside>
                      </div>
                    </article>
                  );
                })}
              </div>
            )}

            <div className="mt-5">
              <PaginatedItems
                total={userOrderPagination?.total || 0}
                limit={filters.limit}
                page={filters.page}
                onPageChange={(page: number) =>
                  setFilters((prev) => ({ ...prev, page }))
                }
              />
            </div>
          </div>
        </section>
      </main>

      {selectedOrderId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/55 p-4 backdrop-blur-sm">
          <button
            type="button"
            aria-label="Đóng chi tiết đơn hàng"
            className="absolute inset-0"
            onClick={handleCloseDetail}
          />

          <div className="relative z-10 flex max-h-[92vh] w-full max-w-5xl flex-col overflow-hidden rounded-[2rem] border border-slate-200 bg-white shadow-2xl">
            <div className="flex shrink-0 items-center justify-between border-b border-slate-100 bg-white px-5 py-4">
              <div>
                <p className="text-xs font-medium uppercase tracking-wide text-sky-600">
                  Chi tiết đơn hàng
                </p>

                <h2 className="mt-1 text-lg font-semibold text-slate-900">
                  {formatOrderItemCode(selectedOrderId)}
                </h2>
              </div>

              <button
                type="button"
                onClick={handleCloseDetail}
                className="flex h-10 w-10 items-center justify-center rounded-xl bg-slate-100 text-slate-500 transition hover:bg-slate-200 hover:text-slate-700"
                aria-label="Đóng"
              >
                <X size={21} />
              </button>
            </div>

            <div className="min-h-0 flex-1 overflow-y-auto bg-slate-50">
              <OrderDetail />
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default OrderPage;
