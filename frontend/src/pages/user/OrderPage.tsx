import { useEffect, useState } from "react";
import { useAppDispatch, useAppSelector } from "../../redux/hook";
import {
  getUserOrders,
  getOrderDetail,
  getOrderTracking,
  getTrackingProgress,
} from "../../redux/slices/user/orderSlice";

import { ORDER_STATUS_LABEL } from "../../utils/constants/orderLabel";
import { ORDER_STATUS_COLOR } from "../../utils/constants/color";
import OrderDetail from "../../components/ui/user/order/OrderDetail";
import { formatOrderCode, formatOrderItemCode } from "../../utils/order";
import { ArrowRight, Package, PackageSearch } from "lucide-react";
import { ORDER_GROUP_STATUS_UI } from "../../utils/orderGroupStatusUI";

const TABS = [
  { key: "ALL", label: "Tất cả" },
  { key: "PENDING_PAYMENT", label: "Chờ thanh toán" },
  { key: "PAID", label: "Đã thanh toán" },
  { key: "FAILED", label: "Thất bại" },
  { key: "CANCELLED", label: "Đã hủy" },
];

const OrderPage = () => {
  const dispatch = useAppDispatch();
  const { userOrderGroup } = useAppSelector((state) => state.order);

  const [selectedOrderId, setSelectedOrderId] = useState<number | null>(null);
  const [tab, setTab] = useState("ALL");

  useEffect(() => {
    dispatch(getUserOrders());
  }, []);

  const handleSelectOrder = (orderId: number) => {
    setSelectedOrderId(orderId);

    dispatch(getOrderDetail({ data: { orderId } }));
    dispatch(getOrderTracking({ data: { orderId } }));
    dispatch(getTrackingProgress({ data: { orderId } }));
  };

  const filtered = userOrderGroup
    ?.filter((g) => tab === "ALL" || g.status === tab)
    ?.map((g) => ({
      ...g,
    }));

  return (
    <div className="bg-gradient-to-br from-sky-100 via-white to-sky-200 min-h-screen p-10 flex gap-6">
      {/* LEFT */}
      <div className="w-1/2 space-y-4">
        {/* HEADER */}
        <div className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm hover:shadow-md transition relative overflow-hidden">
          <div className="absolute top-0 left-0 w-full h-[3px] bg-gradient-to-r from-sky-400 to-sky-600" />

          <div className="flex justify-between items-center">
            {/* LEFT */}
            <div className="flex items-center gap-4">
              <div className="bg-sky-100 p-3 rounded-xl">
                <Package size={22} className="text-sky-600" />
              </div>

              <div>
                <h2 className="text-2xl font-bold text-gray-900">
                  Đơn hàng của tôi
                </h2>
                <p className="text-sm text-gray-500 mt-1">
                  Theo dõi và quản lý đơn hàng dễ dàng
                </p>
              </div>
            </div>

            {/* RIGHT */}
            <div className="flex flex-col items-center text-center">
              <p className="text-xs text-gray-500 uppercase tracking-wide">
                Tổng đơn
              </p>
              <p className="text-2xl font-bold text-sky-600 mt-1">
                {filtered?.length || 0}
              </p>
            </div>
          </div>
        </div>

        {/* TABS */}
        <div className="flex gap-2">
          {TABS.map((t) => (
            <button
              key={t.key}
              onClick={() => setTab(t.key)}
              className={`px-4 py-1.5 rounded-full text-sm font-medium transition
          ${
            tab === t.key
              ? "bg-sky-500 text-white shadow-sm"
              : "bg-white border border-gray-200 text-gray-600 hover:border-sky-400 hover:bg-sky-50"
          }`}
            >
              {t.label}
            </button>
          ))}
        </div>

        {/* LIST */}
        {filtered?.map((group) => {
          const key = group.status?.toUpperCase();

          const statusUI =
            ORDER_GROUP_STATUS_UI[key] || ORDER_GROUP_STATUS_UI.PENDING_PAYMENT;

          const Icon = statusUI.icon;

          return (
            <div
              key={group.orderGroupId}
              className="bg-white border border-gray-200 p-4 rounded-xl shadow-sm hover:shadow-md hover:-translate-y-[2px] transition"
            >
              {/* GROUP HEADER */}
              <div className="flex justify-between items-center mb-4 gap-6 flex-wrap p-4 bg-white border-b border-gray-200">
                {/* LEFT */}
                <div>
                  <p className="text-lg font-bold text-gray-800">
                    # {formatOrderCode(group.orderGroupId, group.createdDate)}
                  </p>

                  <div className="flex items-center gap-2 mt-1">
                    <span
                      className={`flex items-center gap-1 text-xs px-2 py-0.5 rounded-full font-medium ${statusUI.className}`}
                    >
                      <Icon size={12} />
                      {statusUI.label}
                    </span>

                    <span className="text-xs text-gray-600">
                      • {group.orders.length} đơn nhỏ
                    </span>
                  </div>
                </div>

                {/* RIGHT */}
                <div className="flex items-center gap-4">
                  <div className="text-center min-w-[110px]">
                    <p className="text-[11px] text-gray-500 uppercase">
                      Tiền hàng
                    </p>
                    <p className="font-semibold text-gray-700">
                      {Number(group.totalAmount).toLocaleString()}đ
                    </p>
                  </div>

                  <div className="text-center min-w-[110px]">
                    <p className="text-[11px] text-gray-500 uppercase">
                      Phí ship
                    </p>
                    <p className="font-semibold text-sky-600">
                      {Number(group.totalShippingFee).toLocaleString()}đ
                    </p>
                  </div>

                  <div className="text-center min-w-[130px]">
                    <p className="text-[11px] text-gray-500 uppercase">
                      Tổng thanh toán
                    </p>
                    <p className="font-bold text-red-500 text-lg">
                      {Number(group.finalAmount).toLocaleString()}đ
                    </p>
                  </div>
                </div>
              </div>

              {/* ORDERS */}
              {group.orders.map((order) => (
                <div
                  key={order.orderId}
                  onClick={() => handleSelectOrder(order.orderId)}
                  className={`border border-gray-200 rounded-xl p-4 mb-3 cursor-pointer transition-all group
              ${
                selectedOrderId === order.orderId
                  ? "border-sky-400 bg-sky-50 shadow-md"
                  : "hover:border-sky-400 hover:bg-sky-50 hover:shadow-md hover:-translate-y-[2px]"
              }`}
                >
                  {/* HEADER */}
                  <div className="flex justify-between items-center mb-4">
                    <span
                      className={`text-xs px-3 py-1 rounded-full font-medium ${ORDER_STATUS_COLOR[order.orderStatus]}`}
                    >
                      {ORDER_STATUS_LABEL[order.orderStatus]}
                    </span>

                    <span className="text-xs font-mono bg-gray-100 text-gray-700 px-2.5 py-1 rounded-md border border-gray-200">
                      {formatOrderItemCode(order.orderId)}
                    </span>
                  </div>

                  {/* ITEMS */}
                  <div className="space-y-3">
                    {order.items.map((item, idx) => (
                      <div key={idx} className="flex gap-3">
                        <img
                          src={item.thumbnailUrl}
                          className="w-14 h-16 object-cover rounded-lg border border-gray-200"
                        />

                        <div className="flex-1">
                          <p className="text-sm font-medium text-gray-800 line-clamp-2">
                            {item.name}
                          </p>

                          <div className="flex justify-between mt-1 text-sm">
                            <span className="text-gray-500">
                              x{item.quantity}
                            </span>

                            <span className="text-red-500 font-semibold">
                              {Number(item.price).toLocaleString()}đ
                            </span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* HINT */}
                  <div className="mt-2 flex items-center gap-1 text-xs text-sky-500 opacity-0 group-hover:opacity-100 transition">
                    <span>Bấm để xem chi tiết</span>
                    <ArrowRight size={14} />
                  </div>
                </div>
              ))}
            </div>
          );
        })}
      </div>

      {/* RIGHT */}
      <div className="w-1/2">
        {selectedOrderId ? (
          <div className="bg-white border border-gray-200 rounded-xl shadow-sm">
            <OrderDetail />
          </div>
        ) : (
          <div className="bg-white border border-gray-200 rounded-xl p-12 flex flex-col items-center justify-center text-center shadow-sm">
            <div className="bg-sky-50 p-4 rounded-full mb-4">
              <PackageSearch size={36} className="text-sky-500" />
            </div>

            <p className="text-lg font-semibold text-gray-700">
              Chưa chọn đơn hàng
            </p>
            <p className="text-sm text-gray-500 mt-1">
              Vui lòng chọn một đơn để xem chi tiết
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default OrderPage;
