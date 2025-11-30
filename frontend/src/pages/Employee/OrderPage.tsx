import { useEffect, useState } from "react";
import { useAppDispatch, useAppSelector } from "../../store/hook";
import {
  cancelOrder,
  clearOrdersError,
  completeOrder,
  confirmOrder,
  getOrders,
} from "../../store/slices/employee/orderSlice";
import type {
  OrderCancelEplRequest,
  OrderEplRequest,
  OrderEplResponse,
} from "../../types/order";

import {
  Package,
  CalendarClock,
  DollarSign,
  MapPin,
  Loader2,
  Search,
  XCircle,
  CheckCircle,
} from "lucide-react";
import { toast } from "react-toastify";
import Swal from "sweetalert2";
import CancelForm from "../../components/ui/CancelForm";

const TABS = [
  { key: "All", label: "Tất cả" },
  { key: "Pending", label: "Đang chờ" },
  { key: "Paid", label: "Đã thanh toán" },
  { key: "Confirmed", label: "Đã xác nhận" },
  { key: "Completed", label: "Hoàn thành" },
  { key: "Cancelled", label: "Đã hủy" },
] as const;

const STATUS_LABEL: Record<string, string> = {
  Pending: "Đang chờ",
  Paid: "Đã thanh toán",
  Confirmed: "Đã xác nhận",
  Completed: "Hoàn thành",
  Cancelled: "Đã hủy",
};

const statusCardColor: Record<string, string> = {
  Pending: "bg-yellow-50 text-yellow-700 border-yellow-200",
  Paid: "bg-blue-50 text-blue-700 border-blue-200",
  Confirmed: "bg-orange-50 text-orange-700 border-orange-200",
  Completed: "bg-green-50 text-green-700 border-green-200",
  Cancelled: "bg-red-50 text-red-700 border-red-200",
};

const OrderPage = () => {
  const dispatch = useAppDispatch();
  const { orders, loading, error } = useAppSelector((state) => state.orderEpl);
  const [activeTab, setActiveTab] = useState("All");
  const [openCancel, setOpenCancel] = useState(false);
  const [refundAmount, setRefundAmount] = useState<number>();
  const [orderId, setOrderId] = useState<number>(0);

  // State tìm kiếm và ngày
  const [searchText, setSearchText] = useState("");
  const [selectedDate, setSelectedDate] = useState("");

  useEffect(() => {
    const params: OrderEplRequest = {
      status: activeTab === "All" ? "" : activeTab,
      // Bạn sẽ gửi searchText và selectedDate cho backend nếu cần
      keyword: searchText,
      date: selectedDate,
    };
    dispatch(getOrders({ data: params }));
  }, [activeTab, searchText, selectedDate, dispatch]);

  const filteredOrders =
    activeTab === "All"
      ? orders
      : orders.filter((o) => o.orderStatus === activeTab);

  useEffect(() => {
    if (error) {
      toast.error(error);
      dispatch(clearOrdersError());
    }
  }, [error, dispatch]);

  const handleConfirmOrder = async (orderId: number) => {
    try {
      const result = await Swal.fire({
        title: "Xác nhận đơn hàng",
        text: "Bạn có chắc chắn muốn xác nhận đơn hàng này không?",
        icon: "warning",
        showCancelButton: true,
        confirmButtonText: "Chắc chắn",
        cancelButtonText: "Không",
      });
      if (result.isConfirmed) {
        const data = { orderId };
        const res = await dispatch(confirmOrder({ data })).unwrap();
        toast.success(res.message);
        const params: OrderEplRequest = {
          status: activeTab === "All" ? "" : activeTab,
          // Bạn sẽ gửi searchText và selectedDate cho backend nếu cần
          keyword: searchText,
          date: selectedDate,
        };
        dispatch(getOrders({ data: params }));
      }
    } catch (error) {
      // Không xử lý lỗi nữa
    }
  };

  const handleCompleteOrder = async (orderId: number) => {
    try {
      const result = await Swal.fire({
        title: "Xác nhận hoàn thành đơn hàng",
        text: "Bạn có chắc chắn muốn hoàn thành đơn hàng này không?",
        icon: "warning",
        showCancelButton: true,
        confirmButtonText: "Chắc chắn",
        cancelButtonText: "Không",
      });
      if (result.isConfirmed) {
        const data = { orderId };
        const res = await dispatch(completeOrder({ data })).unwrap();
        toast.success(res.message);
        const params: OrderEplRequest = {
          status: activeTab === "All" ? "" : activeTab,
          // Bạn sẽ gửi searchText và selectedDate cho backend nếu cần
          keyword: searchText,
          date: selectedDate,
        };
        dispatch(getOrders({ data: params }));
      }
    } catch (error) {
      // Không xử lý lỗi nữa
    }
  };

  const onSubmit = async (dt: any) => {
    try {
      const data: OrderCancelEplRequest = {
        orderId,
        cancelReason: dt.cancelReason,
      };
      const res = await dispatch(cancelOrder({ data })).unwrap();
      toast.success(res.message);
      const params: OrderEplRequest = {
        status: activeTab === "All" ? "" : activeTab,
        // Bạn sẽ gửi searchText và selectedDate cho backend nếu cần
        keyword: searchText,
        date: selectedDate,
      };
      dispatch(getOrders({ data: params }));
      setOpenCancel(false);
      setRefundAmount(undefined);
    } catch (error) {
      // không xử lý lỗi nữa
    }
  };

  const countByStatus = {
    All: orders.length,
    Pending: orders.filter((o) => o.orderStatus === "Pending").length,
    Paid: orders.filter((o) => o.orderStatus === "Paid").length,
    Confirmed: orders.filter((o) => o.orderStatus === "Confirmed").length,
    Completed: orders.filter((o) => o.orderStatus === "Completed").length,
    Cancelled: orders.filter((o) => o.orderStatus === "Cancelled").length,
  };

  const renderFormCancel = () => (
    <CancelForm
      onSubmit={onSubmit}
      setOpenCancel={setOpenCancel}
      type="product"
      refundAmount={refundAmount}
    />
  );

  const renderCard = (order: OrderEplResponse, index: number) => {
    const status = order.orderStatus;

    return (
      <div
        key={order.id || index}
        className="relative border-l-2 border-sky-100 pl-6 mb-8"
      >
        {/* Dot trạng thái */}
        <div
          className={`absolute -left-[10px] top-2 w-5 h-5 rounded-full ring-4 ring-white shadow-sm ${
            statusCardColor[status]?.includes("yellow")
              ? "bg-yellow-500"
              : statusCardColor[status]?.includes("blue")
              ? "bg-blue-500"
              : statusCardColor[status]?.includes("orange")
              ? "bg-orange-500"
              : statusCardColor[status]?.includes("green")
              ? "bg-green-500"
              : "bg-red-500"
          }`}
        />

        <div className="bg-white border border-gray-100 rounded-2xl shadow-sm hover:shadow-md transition-all duration-300 p-5">
          {/* Header */}
          <div className="flex justify-between items-start mb-4 flex-wrap gap-2">
            <h3 className="text-lg font-bold text-gray-800 flex items-center gap-2">
              <Package className="w-5 h-5 text-sky-600" />
              Đơn hàng #{String(order.id).padStart(3, "0")}
            </h3>
            <div
              className={`px-4 py-1.5 rounded-full text-sm font-semibold border ${statusCardColor[status]}`}
            >
              {STATUS_LABEL[status]}
            </div>
          </div>

          {/* User info */}
          <div className="bg-gray-50 border border-gray-100 rounded-lg p-4 mb-4">
            <h4 className="font-medium text-gray-700 mb-2">
              Thông tin người đặt
            </h4>
            <div className="text-sm text-gray-600 space-y-1">
              <div>
                <span className="font-semibold">Họ tên:</span>{" "}
                {order.user.Profile?.fullName}
              </div>
              <div>
                <span className="font-semibold">Username:</span>{" "}
                {order.user.username}
              </div>
              <div>
                <span className="font-semibold">Địa chỉ:</span>{" "}
                {order.user.Profile?.address}
              </div>
              <div>
                <span className="font-semibold">SĐT:</span>{" "}
                {order.user.Profile?.phoneNumber}
              </div>
              <div className="flex items-center gap-1 mt-1 text-gray-500 text-sm">
                <CalendarClock className="w-4 h-4 text-sky-600" />
                <span>
                  {new Date(order.createdDate).toLocaleString("vi-VN")}
                </span>
              </div>
            </div>
          </div>

          {/* Order items */}
          <div className="divide-y divide-gray-200 mb-4">
            {order.orderDetails.map((od, i) => (
              <div key={i} className="py-4 flex items-center gap-4">
                <div className="w-20 h-20 rounded-lg overflow-hidden border border-gray-200 flex-shrink-0">
                  <img
                    src={od.varient.product.thumbnailUrl}
                    alt={od.varient.product.productName}
                    className="w-full h-full object-cover"
                  />
                </div>
                <div className="flex-1">
                  <h4 className="font-semibold text-gray-800">
                    {od.varient.product.productName}
                  </h4>
                  <div className="text-xs text-gray-600 flex gap-2 mt-1 flex-wrap">
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
                <p className="font-semibold text-sky-700 text-right whitespace-nowrap">
                  {od.subTotal.toLocaleString("vi-VN")}₫
                </p>
              </div>
            ))}
          </div>

          {/* Footer */}
          <div className="flex justify-between items-center text-sm text-gray-600 flex-wrap gap-4">
            <div className="flex items-center gap-2 text-gray-700">
              <MapPin className="w-4 h-4 text-sky-600" />
              <span>Thanh toán:</span>
              <span className="font-medium text-gray-800">
                {order.payment.paymentMethod}
              </span>
            </div>

            <div className="flex items-center gap-3">
              <div className="flex items-center gap-2 text-sky-700 font-bold text-lg">
                <DollarSign className="w-4 h-4" />
                <span>{order.totalAmount.toLocaleString("vi-VN")}₫</span>
              </div>

              {/* Nút hành động theo trạng thái */}
              <div className="flex gap-2">
                {(order.orderStatus === "Pending" ||
                  order.orderStatus === "Paid") && (
                  <>
                    {/* Nút Hủy */}
                    <button
                      onClick={() => {
                        if (order.orderStatus === "Pending") {
                          setOpenCancel(true);
                          setOrderId(order.id);
                        } else if (order.orderStatus === "Paid") {
                          setRefundAmount(order.totalAmount);
                          setOpenCancel(true);
                          setOrderId(order.id);
                        }
                      }}
                      className="flex items-center gap-1 px-3 py-1.5 rounded-full bg-red-50 text-red-700 border border-red-200 shadow-sm text-sm font-medium"
                    >
                      <XCircle size={16} />
                      Hủy
                    </button>

                    {/* Nút Xác nhận */}
                    <button
                      onClick={() => {
                        handleConfirmOrder(order.id);
                      }}
                      className="flex items-center gap-1 px-3 py-1.5 rounded-full bg-green-50 text-green-700 border border-green-200 shadow-sm text-sm font-medium"
                    >
                      <CheckCircle size={16} />
                      Xác nhận
                    </button>
                  </>
                )}

                {order.orderStatus === "Confirmed" && (
                  <>
                    {/* Nút Hủy */}
                    <button
                      onClick={() => {
                        if (order.payment.paymentMethod === "COD") {
                          setOpenCancel(true);
                          setOrderId(order.id);
                        } else if (order.payment.paymentMethod === "MOMO") {
                          setRefundAmount(order.totalAmount);
                          setOpenCancel(true);
                          setOrderId(order.id);
                        }
                      }}
                      className="flex items-center gap-1 px-3 py-1.5 rounded-full bg-red-50 text-red-700 border border-red-200 shadow-sm text-sm font-medium"
                    >
                      <XCircle size={16} />
                      Hủy
                    </button>

                    {/* Nút Hoàn Thành */}
                    <button
                      onClick={() => {
                        handleCompleteOrder(order.id);
                      }}
                      className="flex items-center gap-1 px-3 py-1.5 rounded-full bg-green-50 text-green-700 border border-green-200 shadow-sm text-sm font-medium"
                    >
                      <CheckCircle size={16} />
                      Hoàn Thành
                    </button>
                  </>
                )}
              </div>
            </div>
          </div>

          {/* Note */}
          {order.note && (
            <div className="mt-4 p-3 bg-gray-50 border border-gray-100 rounded-lg text-gray-700 text-sm">
              <span className="font-medium">Ghi chú:</span> {order.note}
            </div>
          )}
        </div>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-white p-10 sm:px-6">
      <div className="max-w-5xl mx-auto">
        <h1 className="text-3xl font-bold text-sky-800 mb-6 flex gap-2 items-center">
          <Package className="w-8 h-8 text-sky-700" />
          Quản lý đơn hàng
        </h1>

        {/* Search + Date */}
        <div className="flex flex-wrap justify-between items-center gap-4 mb-6">
          {/* Input ngày */}
          <div className="flex items-center gap-2">
            <label className="text-sm text-gray-600">Ngày:</label>
            <input
              type="date"
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
              className="border border-gray-300 rounded-full px-4 py-2 text-sm bg-white text-gray-700 cursor-pointer"
            />
          </div>
          {/* Input tìm kiếm */}
          <div className="flex items-center gap-2 w-84 bg-white border border-gray-300 rounded-full px-4 py-2">
            <Search className="w-5 h-5 text-gray-400" />
            <input
              type="text"
              placeholder="Tìm theo tên hoặc SĐT khách hàng"
              value={searchText}
              onChange={(e) => setSearchText(e.target.value)}
              className="flex-1 outline-none text-sm placeholder-gray-400"
            />
          </div>
        </div>

        {/* Tabs */}
        <div className="flex flex-wrap gap-3 mb-6">
          {TABS.map((t) => (
            <button
              key={t.key}
              onClick={() => setActiveTab(t.key)}
              className={`px-4 py-2 rounded-full text-sm font-medium border transition flex items-center gap-2 ${
                activeTab === t.key
                  ? "bg-sky-600 text-white border-sky-600 shadow"
                  : "bg-white text-gray-700 border-gray-200 hover:bg-sky-50"
              }`}
            >
              <span>{STATUS_LABEL[t.key] || t.label}</span>
              <span className="bg-gray-200 text-gray-700 text-xs font-semibold px-2 py-0.5 rounded-full">
                {countByStatus[t.key as keyof typeof countByStatus] || 0}
              </span>
            </button>
          ))}
        </div>

        {/* Order list */}
        {loading ? (
          <div className="flex flex-col items-center justify-center py-20">
            <Loader2 className="w-10 h-10 text-sky-600 animate-spin mb-3" />
            <p className="text-gray-600 font-medium">Đang tải đơn hàng...</p>
          </div>
        ) : filteredOrders.length > 0 ? (
          <div className="space-y-6">{filteredOrders.map(renderCard)}</div>
        ) : (
          <div className="text-center py-16 bg-white rounded-2xl shadow-sm border border-gray-100">
            <Package className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-700 mb-1">
              Không có đơn hàng
            </h3>
            <p className="text-sm text-gray-500">
              Hiện tại chưa có đơn hàng cho trạng thái này.
            </p>
          </div>
        )}
      </div>

      {openCancel && renderFormCancel()}
    </div>
  );
};

export default OrderPage;
