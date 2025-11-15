import { useEffect, useState } from "react";
import { useAppDispatch, useAppSelector } from "../../store/hook";
import { toast } from "react-toastify";
import {
  cancelOrder,
  clearOrdersError,
  getOrders,
} from "../../store/slices/orderSlice";
import {
  Loader2,
  Package,
  CalendarClock,
  DollarSign,
  XCircle,
  CreditCard,
  X,
  MapPin,
} from "lucide-react";
import { useForm } from "react-hook-form";
import {
  FormCancelOrderSchema,
  type formCancelOrder,
} from "../../schemas/FormCancelOrderSchema";
import { zodResolver } from "@hookform/resolvers/zod";
import type { ApiErrorType } from "../../types/error";
import type {
  MomoPaymentRequest,
  OrderCancelRequest,
  OrderResponse,
} from "../../types/order";
import OrderService from "../../services/orderService";

const statusColor = {
  Pending: "bg-yellow-50 text-yellow-700 border-yellow-200",
  Paid: "bg-blue-50 text-blue-700 border-blue-200",
  Confirmed: "bg-purple-50 text-purple-700 border-purple-200",
} as const;

type ActiveStatus = keyof typeof statusColor;

const statusLabelVN: Record<ActiveStatus | "All", string> = {
  All: "Tất cả",
  Pending: "Đang chờ",
  Paid: "Đã thanh toán",
  Confirmed: "Đã xác nhận",
};

const OrderPage = () => {
  const dispatch = useAppDispatch();
  const { orders, loading, error } = useAppSelector((s) => s.order);
  const [filterStatus, setFilterStatus] = useState<ActiveStatus | "All">("All");
  const [openCancel, setOpenCancel] = useState(false);
  const [orderId, setOrderId] = useState<number>(0);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<formCancelOrder>({
    resolver: zodResolver(FormCancelOrderSchema),
    mode: "onChange",
  });

  useEffect(() => {
    dispatch(getOrders());
  }, [dispatch]);

  useEffect(() => {
    if (error) {
      toast.error(error);
      dispatch(clearOrdersError());
    }
  }, [error, dispatch]);

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-b from-sky-50 to-white">
        <Loader2 className="w-10 h-10 text-sky-600 animate-spin mb-3" />
        <p className="text-gray-600 font-medium">Đang tải đơn hàng...</p>
      </div>
    );
  }

  const activeOrders = orders.filter((o) =>
    ["Pending", "Paid", "Confirmed"].includes(o.orderStatus)
  );

  const filteredOrders =
    filterStatus === "All"
      ? activeOrders
      : activeOrders.filter((o) => o.orderStatus === filterStatus);

  const handlePaymentAgain = async (orderId: number, totalAmount: number) => {
    try {
      const momoOrderId = `${orderId}_${Date.now()}`;
      const data: MomoPaymentRequest = {
        orderId: momoOrderId,
        amount: totalAmount,
        orderInfo: `Thanh toán đơn hàng #${orderId}`,
      };
      const res = await OrderService.createMoMoPaymentService(data);
      if (res.data.payUrl) {
        window.location.href = res.data.payUrl;
      } else toast.error("Không tạo được đường dẫn thanh toán Momo");
    } catch (error: any) {
      const apiError = error as ApiErrorType;
      toast.error(apiError.userMessage || "Tạo thanh toán Momo thất bại");
    }
  };

  const renderOrderCard = (order: OrderResponse, index: number) => {
    const statusStyle = {
      Pending:
        "bg-yellow-50 text-yellow-700 border-yellow-200 flex items-center gap-1",
      Paid: "bg-blue-50 text-blue-700 border-blue-200 flex items-center gap-1",
      Confirmed:
        "bg-orange-50 text-orange-700 border-orange-200 flex items-center gap-1",
    } as const;

    return (
      <div
        key={order.id || index}
        className="relative border-l-2 border-sky-100 pl-6 mb-8"
      >
        {/* Chấm trạng thái */}
        <div
          className={`absolute -left-[10px] top-2 w-5 h-5 rounded-full ring-4 ring-white shadow-sm ${
            order.orderStatus === "Pending"
              ? "bg-yellow-500"
              : order.orderStatus === "Paid"
              ? "bg-blue-500"
              : "bg-orange-500"
          }`}
        />

        {/* Card chính */}
        <div className="bg-white border border-gray-100 rounded-2xl shadow-sm hover:shadow-md transition-all duration-300 p-5">
          {/* Header */}
          <div className="flex flex-wrap justify-between items-start mb-4">
            <div>
              <h3 className="text-lg font-semibold text-gray-800 flex items-center gap-2">
                <Package className="w-5 h-5 text-sky-600" />
                Đơn hàng #{String(index + 1).padStart(3, "0")}
              </h3>
              <div className="flex items-center gap-2 text-sm text-gray-500 mt-1">
                <CalendarClock className="w-4 h-4 text-sky-600" />
                <span>
                  {new Date(order.createdDate).toLocaleString("vi-VN")}
                </span>
              </div>
            </div>
            <div
              className={`px-3 py-1.5 rounded-full text-sm font-semibold border ${
                statusStyle[order.orderStatus as keyof typeof statusStyle]
              }`}
            >
              {statusLabelVN[order.orderStatus as keyof typeof statusLabelVN]}
            </div>
          </div>

          {/* Items */}
          <div className="divide-y divide-gray-100 mb-4">
            {order.orderDetails.map((od, idx) => (
              <div
                key={idx}
                className="py-4 flex items-center justify-between gap-4"
              >
                <div className="flex gap-4 flex-1">
                  <div className="w-16 h-16 rounded-lg overflow-hidden border border-gray-200 bg-gray-50 flex-shrink-0">
                    <img
                      src={od.varient.product.thumbnailUrl}
                      alt={od.varient.product.productName}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div>
                    <h4 className="font-medium text-gray-800 truncate">
                      {od.varient.product.productName}
                    </h4>
                    <div className="text-xs text-gray-600 flex flex-wrap gap-2 mt-1">
                      <span>Màu: {od.varient.color}</span>
                      <span>•</span>
                      <span>Size: {od.varient.size}</span>
                      {od.varient.material && (
                        <>
                          <span>•</span>
                          <span>Chất liệu: {od.varient.material}</span>
                        </>
                      )}
                    </div>
                    <p className="text-sm text-gray-700 mt-1">
                      SL: {od.quantity}
                    </p>
                  </div>
                </div>
                <p className="font-semibold text-sky-700 whitespace-nowrap">
                  {od.subTotal.toLocaleString("vi-VN")}₫
                </p>
              </div>
            ))}
          </div>

          {/* Footer */}
          <div className="mt-4 flex justify-between items-center text-sm text-gray-600 flex-wrap gap-3">
            <div className="flex items-center gap-2 text-gray-700 flex-1 min-w-[120px]">
              <MapPin className="w-4 h-4 text-sky-600" />
              <span>Thanh toán:</span>
              <span className="font-medium text-gray-800">
                {order.payment.paymentMethod}
              </span>
            </div>
            <div className="flex items-center gap-2 text-sky-700 font-bold text-lg min-w-[120px]">
              <DollarSign className="w-4 h-4" />
              <span>{order.totalAmount.toLocaleString("vi-VN")}₫</span>
            </div>
            <div className="flex items-center gap-2 flex-wrap">
              {order.payment.paymentMethod === "Momo" &&
                order.orderStatus === "Pending" && (
                  <button
                    onClick={() =>
                      handlePaymentAgain(order.id, order.totalAmount)
                    }
                    className="flex items-center gap-1 px-3 py-1.5 rounded-full bg-green-50 text-green-700 border border-green-200 hover:bg-green-100 shadow-sm text-sm font-medium"
                  >
                    <CreditCard size={16} />
                    Thanh toán
                  </button>
                )}
              {(order.orderStatus === "Pending" ||
                order.orderStatus === "Paid") && (
                <button
                  onClick={() => {
                    setOrderId(order.id);
                    setOpenCancel(true);
                  }}
                  className="flex items-center gap-1 px-3 py-1.5 rounded-full bg-red-50 text-red-700 border border-red-200 hover:bg-red-100 shadow-sm text-sm font-medium"
                >
                  <XCircle size={16} />
                  Hủy
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    );
  };

  const onSubmit = async (dt: any) => {
    try {
      const data: OrderCancelRequest = {
        orderId,
        cancelReason: dt.cancelReason,
      };
      const res = await dispatch(cancelOrder({ data })).unwrap();
      toast.success(res.message);
      await dispatch(getOrders());
      setOpenCancel(false);
    } catch (error) {
      // không xử lý lỗi nữa
    }
  };

  const renderFormCancel = () => (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
      <div className="bg-white rounded-2xl w-[420px] shadow-2xl p-6 relative border-t-4 border-sky-400">
        <button
          onClick={() => setOpenCancel(false)}
          className="absolute top-3 right-3 text-gray-500 hover:text-gray-800"
        >
          <X size={20} />
        </button>

        <h3 className="text-2xl font-semibold mb-4 text-center text-sky-700">
          Lý do hủy đơn hàng
        </h3>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
          <div>
            <textarea
              {...register("cancelReason")}
              rows={4}
              placeholder="Nhập lý do hủy đơn hàng..."
              className="w-full rounded-xl p-3 border border-gray-400 bg-white shadow-sm resize-none focus:outline-none focus:ring-0 focus:border-gray-400"
            />
            {errors.cancelReason && (
              <p className="text-red-500 text-sm mt-1">
                {errors.cancelReason.message}
              </p>
            )}
          </div>

          <div className="flex justify-end gap-3">
            <button
              type="button"
              onClick={() => setOpenCancel(false)}
              className="px-4 py-2 rounded-full border border-gray-200 text-gray-600 hover:bg-gray-50 transition"
            >
              Đóng
            </button>
            <button
              type="submit"
              className="px-4 py-2 rounded-full bg-sky-500 text-white font-medium hover:bg-sky-600 transition"
            >
              Gửi
            </button>
          </div>
        </form>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-white p-10 sm:px-6">
      <div className="max-w-5xl mx-auto">
        {/* Header */}
        <div className="flex items-center gap-3 mb-8">
          <Package className="w-8 h-8 text-sky-700" />
          <h1 className="text-3xl font-bold text-sky-800">Đơn hàng của bạn</h1>
        </div>

        {/* Filter buttons */}
        <div className="flex flex-wrap gap-3 mb-10">
          {(["All", "Pending", "Paid", "Confirmed"] as const).map((status) => {
            const count =
              status === "All"
                ? activeOrders.length
                : activeOrders.filter((o) => o.orderStatus === status).length;

            return (
              <button
                key={status}
                onClick={() => setFilterStatus(status)}
                className={`flex items-center gap-2 px-4 py-2 rounded-full font-medium text-sm border transition ${
                  filterStatus === status
                    ? "bg-sky-600 text-white border-sky-600 shadow"
                    : "bg-white text-gray-700 border-gray-200 hover:bg-sky-50 hover:border-sky-200"
                }`}
              >
                {statusLabelVN[status]}
                <span
                  className={`px-2 py-0.5 rounded-full text-xs font-semibold ${
                    filterStatus === status
                      ? "bg-white text-sky-700"
                      : "bg-gray-100 text-gray-700"
                  }`}
                >
                  {count}
                </span>
              </button>
            );
          })}
        </div>

        {/* Order list */}
        {filteredOrders.length > 0 ? (
          <div className="space-y-6">{filteredOrders.map(renderOrderCard)}</div>
        ) : (
          <div className="text-center py-16 bg-white rounded-2xl shadow-sm border border-gray-100">
            <Package className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-700 mb-1">
              Không có đơn hàng
            </h3>
            <p className="text-sm text-gray-500">
              Hiện tại bạn chưa có đơn hàng nào cho trạng thái này.
            </p>
          </div>
        )}

        {openCancel && renderFormCancel()}
      </div>
    </div>
  );
};

export default OrderPage;
