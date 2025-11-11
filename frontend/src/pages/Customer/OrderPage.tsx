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
  Calendar,
  DollarSign,
  XCircle,
  X,
  CreditCard,
} from "lucide-react";
import { useForm } from "react-hook-form";
import {
  FormCancelOrderSchema,
  type formCancelOrder,
} from "../../schemas/FormCancelOrderSchema";
import { zodResolver } from "@hookform/resolvers/zod";
import type { ApiErrorType } from "../../types/error";
import { da } from "zod/v4/locales";
import type {
  MomoPaymentRequest,
  OrderCancelRequest,
  OrderResponse,
} from "../../types/order";
import OrderService from "../../services/orderService";

const statusColor = {
  Pending: "bg-yellow-100 text-yellow-700",
  Paid: "bg-blue-100 text-blue-700",
  Confirmed: "bg-purple-100 text-purple-700",
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
  const orderLoading = useAppSelector((state) => state.order.loading);
  const orderError = useAppSelector((state) => state.order.error);
  const orders = useAppSelector((state) => state.order.orders);

  const [filterStatus, setFilterStatus] = useState<ActiveStatus | "All">("All");
  const [openCancel, setOpenCancel] = useState<boolean>(false);
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
    if (orderError) {
      toast.error(orderError);
      dispatch(clearOrdersError());
    }
  }, [orderError, dispatch]);

  if (orderLoading) {
    return (
      <div className="flex flex-col justify-center items-center h-[60vh] text-sky-600">
        <Loader2 className="w-10 h-10 animate-spin mb-3" />
        <p className="text-lg font-medium">Đang tải dữ liệu...</p>
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
      } else {
        toast.error("Không tạo được đường dẫn thanh toán Momo");
      }
    } catch (error: any) {
      const apiError = error as ApiErrorType;
      toast.error(apiError.userMessage || "Tạo thanh toán Momo thất bại");
    }
  };

  const renderOrderCard = (order: OrderResponse, index: number) => {
    return (
      <div
        key={order.id || index}
        className="border border-gray-300 bg-white rounded-xl shadow-sm transition p-4"
      >
        {/* Header: Thông tin đơn hàng + Trạng thái */}
        <div className="flex justify-between items-center mb-4 flex-wrap sm:flex-nowrap gap-2">
          {/* Thông tin đơn hàng (bên trái) */}
          <div className="flex flex-col sm:flex-row sm:items-center sm:gap-4">
            <div className="flex items-center gap-2">
              <Package className="w-5 h-5 text-sky-600" />
              <span className="font-medium text-sky-700">
                Đơn hàng #{index + 1}
              </span>
            </div>

            <div className="flex items-center gap-2 text-gray-700 mt-1 sm:mt-0 text-sm">
              <DollarSign className="w-4 h-4 text-sky-600" />
              <span className="font-medium">
                {order.totalAmount.toLocaleString()}₫
              </span>
            </div>

            <div className="flex items-center gap-2 text-gray-700 mt-1 sm:mt-0 text-sm">
              <Calendar className="w-4 h-4 text-sky-600" />
              <span>{new Date(order.createdDate).toLocaleString()}</span>
            </div>

            <div className="flex items-center gap-2 mt-1 sm:mt-0">
              <span className="px-3 py-1 rounded-full text-sm font-medium bg-gray-100 text-gray-700 select-none">
                {order.payment.paymentMethod}
              </span>
            </div>
          </div>

          {/* Trạng thái (bên phải) */}
          <div className="flex-shrink-0 flex items-center gap-2">
            <span className="text-gray-600 text-sm font-medium select-none">
              Trạng thái:
            </span>
            <span
              className={`px-3 py-1 rounded-lg text-sm font-semibold shadow-sm ${
                statusColor[order.orderStatus as ActiveStatus]
              }`}
            >
              {statusLabelVN[order.orderStatus as ActiveStatus]}
            </span>
          </div>
        </div>

        {/* Chi tiết sản phẩm */}
        <div className="space-y-3 mb-3">
          {order.orderDetails.map((od: any, idx: number) => (
            <div
              key={idx}
              className="flex justify-between items-center border border-sky-100 rounded-xl p-2 hover:border-sky-300 transition"
            >
              <div className="flex gap-3">
                <div className="w-14 h-14 rounded-lg overflow-hidden bg-sky-50">
                  <img
                    src={od.varient.product.thumbnailUrl}
                    alt={od.varient.product.productName}
                    className="w-full h-full object-cover"
                  />
                </div>
                <div>
                  <h4 className="font-medium text-gray-800 text-sm">
                    {od.varient.product.productName}
                  </h4>
                  <p className="text-xs text-gray-600">
                    Màu: {od.varient.color} | Size: {od.varient.size} | Chất
                    liệu: {od.varient.material}
                  </p>
                  <p className="text-sm text-gray-700 mt-1">
                    SL: {od.quantity}
                  </p>
                </div>
              </div>
              <p className="font-medium text-sky-600 text-sm">
                {od.subTotal.toLocaleString()}₫
              </p>
            </div>
          ))}
        </div>

        {/* Nút thao tác (bên dưới) */}
        <div className="flex items-center justify-end gap-3 flex-wrap mt-2">
          {order.payment.paymentMethod === "Momo" &&
            order.orderStatus === "Pending" && (
              <button
                onClick={() => handlePaymentAgain(order.id, order.totalAmount)}
                className="flex items-center gap-1 px-3 py-1 min-h-[32px] bg-green-500 text-white rounded-lg hover:bg-green-600 shadow-md transition text-sm font-medium"
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
              className="flex items-center gap-1 px-3 py-1 min-h-[32px] bg-red-500 text-white rounded-lg hover:bg-red-600 shadow-md transition text-sm font-medium"
            >
              <XCircle size={16} />
              Hủy
            </button>
          )}
        </div>
      </div>
    );
  };

  const onSubmit = async (dt: any) => {
    try {
      const cancelReason = dt.cancelReason;
      const data: OrderCancelRequest = { orderId, cancelReason };
      const res = await dispatch(cancelOrder({ data })).unwrap();
      toast.success(res.message);
      await dispatch(getOrders());
      setOpenCancel(false);
    } catch (error) {
      // không xử lý do xử lý cục bộ rồi
    }
  };

  const renderFormCancel = () => {
    return (
      <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
        <div className="bg-white rounded-2xl w-[420px] shadow-2xl p-6 relative border-t-4 border-[#4FC3F7]">
          <button
            onClick={() => {
              setOpenCancel(false);
            }}
            className="absolute top-3 right-3 text-gray-500 hover:text-gray-800"
          >
            <X size={20} />
          </button>

          <h3 className="text-lg font-semibold mb-4 text-center text-[#0288D1]">
            Lý do hủy đơn hàng
          </h3>

          <form
            onSubmit={handleSubmit(onSubmit)}
            className="space-y-5 text-gray-700"
          >
            <div className="space-y-2">
              <label className="block font-medium text-gray-800">
                Nhập lý do hủy đơn (tối thiểu 20 ký tự):
              </label>

              <textarea
                {...register("cancelReason")}
                rows={4}
                placeholder="Nhập lý do hủy đơn hàng..."
                className="w-full rounded-xl p-3 border border-gray-300 bg-white shadow-sm 
                 focus:outline-none focus:ring-2 focus:ring-sky-300 focus:border-transparent
                 transition resize-none"
              />

              {errors.cancelReason && (
                <p className="text-red-500 text-sm">
                  {errors.cancelReason.message}
                </p>
              )}
            </div>

            <div className="flex justify-end gap-3 pt-3">
              <button
                type="button"
                onClick={() => setOpenCancel(false)}
                className="px-4 py-2 border border-sky-100 rounded-lg text-sky-700 hover:bg-sky-50 transition"
              >
                Hủy
              </button>

              <button
                type="submit"
                className="px-4 py-2 bg-sky-500 text-white rounded-lg hover:bg-sky-600 transition shadow-sm"
              >
                Gửi
              </button>
            </div>
          </form>
        </div>
      </div>
    );
  };

  return (
    <div className="p-6 bg-gradient-to-b from-[#E3F2FD] to-white min-h-screen flex flex-col py-10">
      {/* Header */}
      <div className="mb-8 text-center">
        <div className="flex items-center justify-center gap-3 mb-3">
          <div className="bg-sky-100 p-2 rounded-full">
            <Package size={28} className="text-sky-600" />
          </div>
          <h1 className="text-3xl font-extrabold text-gray-800 tracking-tight">
            Đơn hàng của bạn
          </h1>
        </div>

        <p className="text-gray-500 text-sm md:text-base">
          Xem lại các đơn hàng đang xử lý
        </p>

        <div className="mx-auto mt-3 w-16 h-1.5 bg-gradient-to-r from-sky-400 to-sky-600 rounded-full"></div>
      </div>

      {/* Filter tabs */}
      <div className="flex gap-4 mb-6 border-b border-gray-500 pb-2">
        {(
          ["All", "Pending", "Paid", "Confirmed"] as (ActiveStatus | "All")[]
        ).map((status) => {
          // Tính số lượng đơn cho mỗi tab
          const count =
            status === "All"
              ? orders.length
              : orders.filter((o) => o.orderStatus === status).length;

          return (
            <button
              key={status}
              onClick={() => setFilterStatus(status)}
              className={`px-5 py-2.5 font-medium transition-all flex items-center gap-2 ${
                filterStatus === status
                  ? "text-white bg-sky-600 rounded-lg shadow-sm"
                  : "text-gray-700 hover:text-sky-600"
              }`}
            >
              <span>{statusLabelVN[status]}</span>
              <span className="bg-gray-200 text-gray-800 text-xs font-semibold px-2 py-0.5 rounded-full">
                {count}
              </span>
            </button>
          );
        })}
      </div>

      {/* Content */}
      <div className="flex-1 flex flex-col">
        {filteredOrders.length ? (
          <div className="space-y-3">{filteredOrders.map(renderOrderCard)}</div>
        ) : (
          <div className="flex-1 flex flex-col items-center justify-center">
            <Package size={64} className="text-sky-400 mb-4" />
            <h3 className="text-xl font-semibold text-gray-700 mb-2">
              Không có đơn hàng
            </h3>
            <p className="text-sm text-gray-500 text-center max-w-xs">
              Hiện tại bạn chưa có đơn hàng nào cho trạng thái này.
            </p>
          </div>
        )}
      </div>

      {openCancel && renderFormCancel()}
    </div>
  );
};

export default OrderPage;
