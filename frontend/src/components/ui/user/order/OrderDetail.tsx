import { useAppSelector } from "../../../../redux/hook";
import { ORDER_STATUS_COLOR } from "../../../../utils/constants/color";
import {
  ORDER_STATUS_LABEL,
  SHIPPING_STATUS_LABEL,
} from "../../../../utils/constants/orderLabel";

import {
  MapPin,
  Truck,
  Package,
  Clock,
  CheckCircle,
  Circle,
  ListOrdered,
  CheckCircle2,
} from "lucide-react";
import { formatOrderItemCode } from "../../../../utils/order";
import { ORDER_STATUS } from "../../../../utils/constants/orderStatus";

const OrderDetail = () => {
  const { orderDetailData, orderTrackingItem, orderTrackingProgressItem } =
    useAppSelector((state) => state.order);

  if (!orderDetailData) return null;

  const isShipping = orderDetailData.status === "SHIPPING";

  return (
    <div className="bg-white border border-gray-200 p-6 rounded-xl shadow-sm hover:shadow-md transition space-y-6">
      {/* HEADER */}
      <div className="flex justify-between items-center">
        <p className="font-bold text-lg text-gray-800">
          Đơn {formatOrderItemCode(orderDetailData.orderId)}
        </p>

        <span
          className={`px-3 py-1 text-sm rounded-full flex items-center gap-1 bg-gray-100 text-gray-700 ${ORDER_STATUS_COLOR[orderDetailData.status]}`}
        >
          <ListOrdered size={14} />
          {ORDER_STATUS_LABEL[orderDetailData.status]}
        </span>
      </div>

      {/* ADDRESS */}
      <div className="bg-white border border-gray-200 rounded-2xl overflow-hidden shadow-sm hover:shadow-md transition">
        <div className="flex items-center gap-3 px-5 py-4 bg-gray-50 border-b border-gray-200">
          <div className="bg-red-100 p-2 rounded-lg">
            <MapPin size={16} className="text-red-500" />
          </div>

          <p className="font-semibold text-gray-800">Địa chỉ nhận hàng</p>
        </div>

        <div className="px-5 py-4 space-y-2">
          <p className="font-medium text-gray-800">
            {orderDetailData.address.name}
          </p>

          <p className="text-sm text-gray-600">
            {orderDetailData.address.phone}
          </p>

          <div className="h-px bg-gray-100 my-2" />

          <p className="text-sm text-gray-500 leading-relaxed">
            {orderDetailData.address.address}
          </p>
        </div>
      </div>

      {/* PROGRESS */}
      <div>
        <p className="font-semibold mb-3 flex items-center gap-2 text-gray-800">
          <Truck size={16} />
          Tiến trình vận chuyển
        </p>

        {isShipping ? (
          <div className="flex justify-between relative">
            {orderTrackingProgressItem?.map((step, idx) => (
              <div key={idx} className="flex flex-col items-center flex-1">
                {step.current ? (
                  <Truck className="text-sky-600 animate-pulse" />
                ) : step.done ? (
                  <CheckCircle className="text-emerald-500" />
                ) : (
                  <Circle className="text-gray-300" />
                )}

                <p className="text-xs mt-1 text-center text-gray-500">
                  {SHIPPING_STATUS_LABEL[step.step]}
                </p>
              </div>
            ))}

            <div className="absolute top-3 left-0 right-0 h-[2px] bg-gray-200 -z-10" />
          </div>
        ) : (
          <div className="flex items-center gap-3 bg-gray-50 border border-gray-200 rounded-xl p-4 shadow-sm">
            <div className="text-sky-500">
              {orderDetailData.status === ORDER_STATUS.PENDING && (
                <Clock size={18} />
              )}
              {orderDetailData.status === ORDER_STATUS.CONFIRMED && (
                <CheckCircle2 size={18} />
              )}
              {orderDetailData.status === ORDER_STATUS.PREPARING && (
                <Package size={18} />
              )}
              {orderDetailData.status === ORDER_STATUS.READY_TO_SHIP && (
                <Truck size={18} />
              )}
            </div>

            <p className="text-sm text-gray-700 font-medium">
              {orderDetailData.status === ORDER_STATUS.PENDING &&
                "Đơn hàng đang chờ xử lý"}
              {orderDetailData.status === ORDER_STATUS.CONFIRMED &&
                "Đơn hàng đã được xác nhận"}
              {orderDetailData.status === ORDER_STATUS.PREPARING &&
                "Shop đang chuẩn bị hàng"}
              {orderDetailData.status === ORDER_STATUS.READY_TO_SHIP &&
                "Đơn hàng đang chờ bàn giao cho đơn vị vận chuyển"}
            </p>
          </div>
        )}
      </div>

      {/* ITEMS */}
      <div>
        <p className="font-semibold mb-3 flex items-center gap-2 text-gray-800">
          <Package size={16} />
          Sản phẩm
        </p>

        <div className="space-y-4">
          {orderDetailData.items.map((item, idx) => (
            <div
              key={idx}
              className="flex gap-4 border border-gray-200 rounded-xl p-3 shadow-sm hover:shadow-md transition"
            >
              <img
                src={item.thumbnailUrl}
                className="w-20 h-24 object-cover rounded-lg border border-gray-200"
              />

              <div className="flex-1">
                <p className="font-medium text-gray-800">{item.name}</p>

                {item.variantInfo && (
                  <p className="text-sm text-gray-500 mt-1">
                    {item.variantInfo}
                  </p>
                )}

                <div className="flex justify-between mt-3">
                  <span className="text-sm text-gray-500">
                    {item.quantity} × {Number(item.price).toLocaleString()}đ
                  </span>

                  <span className="font-semibold text-red-500">
                    {(item.price * item.quantity).toLocaleString()}đ
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* TIMELINE */}
      <div>
        <p className="font-semibold mb-2 flex items-center gap-2 text-gray-800">
          <Clock size={16} />
          Lịch sử giao hàng
        </p>

        <div className="space-y-3">
          {orderTrackingItem?.map((item, idx) => (
            <div key={idx} className="flex gap-3 items-start">
              <CheckCircle className="text-sky-500 mt-1" size={14} />
              <div>
                <p className="font-medium text-gray-800">{item.label}</p>
                <p className="text-xs text-gray-500">
                  {new Date(item.time).toLocaleString("vi-VN")}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* TOTAL */}
      <div className="border-t border-gray-200 pt-4 space-y-3">
        <div className="flex justify-between text-gray-700">
          <span>Tạm tính</span>
          <span className="font-medium">
            {Number(orderDetailData.fee.subtotal).toLocaleString()}đ
          </span>
        </div>

        <div className="flex justify-between text-emerald-600">
          <span>Phí vận chuyển</span>
          <span className="font-medium">
            {Number(orderDetailData.fee.shipping).toLocaleString()}đ
          </span>
        </div>

        <div className="border-t border-gray-200 pt-3 flex justify-between font-bold text-lg">
          <span>Tổng đơn</span>
          <span className="text-red-500">
            {Number(orderDetailData.fee.total).toLocaleString()}đ
          </span>
        </div>
      </div>
    </div>
  );
};

export default OrderDetail;
