import { useEffect, useState } from "react";
import { useAppDispatch, useAppSelector } from "../../store/hook";
import { toast } from "react-toastify";
import { clearOrdersError, getOrders } from "../../store/slices/orderSlice";
import {
  Package,
  CalendarClock,
  DollarSign,
  MapPin,
  CheckCircle2,
  XCircle,
  Loader2,
  Calendar,
  Clock,
  Edit2,
  Star,
} from "lucide-react";
import ReviewForm, { type formRating } from "../../components/ui/ReviewForm";
import {
  addProductFeedback,
  clearProductFeedbackError,
  updateProductFeedback,
} from "../../store/slices/productFeedbackSlice";

const HistoryPage = () => {
  const dispatch = useAppDispatch();
  const orders = useAppSelector((s) => s.order.orders);
  const orderError = useAppSelector((s) => s.order.error);
  const orderLoading = useAppSelector((s) => s.order.loading);
  const feedbackError = useAppSelector((s) => s.productFeedback.error);

  const [openReviewForm, setOpenReviewForm] = useState(false);
  const [orderDetailId, setOrderDetailId] = useState(0);
  const [update, setUpdate] = useState(false);

  const [filterStatus, setFilterStatus] = useState<
    "All" | "Completed" | "Cancelled"
  >("All");

  useEffect(() => {
    dispatch(getOrders());
  }, [dispatch]);

  useEffect(() => {
    const error = orderError || feedbackError;
    if (error) {
      toast.error(error);
      if (orderError) {
        dispatch(clearOrdersError());
      }
      if (feedbackError) {
        dispatch(clearProductFeedbackError());
      }
    }
  }, [orderError, feedbackError, dispatch]);

  const filteredOrders = orders.filter((o) =>
    filterStatus === "All"
      ? o.orderStatus === "Completed" || o.orderStatus === "Cancelled"
      : o.orderStatus === filterStatus
  );

  if (orderLoading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-b from-sky-50 to-white">
        <Loader2 className="w-10 h-10 text-sky-600 animate-spin mb-3" />
        <p className="text-gray-600 font-medium">
          Đang tải lịch sử đơn hàng...
        </p>
      </div>
    );
  }

  const statusStyle = {
    Completed:
      "bg-green-50 text-green-700 border-green-200 flex items-center gap-1",
    Cancelled: "bg-red-50 text-red-700 border-red-200 flex items-center gap-1",
  } as const;

  const statusLabel = {
    Completed: "Hoàn tất",
    Cancelled: "Đã hủy",
  } as const;

  const handleSubmitForm = async (dt: formRating) => {
    const content = dt.content;
    const rating = dt.rating;
    const data = {
      content,
      rating,
      orderDetailId,
    };
    if (!update) {
      const productFeedback = await dispatch(addProductFeedback({ data }));
      if (addProductFeedback.fulfilled.match(productFeedback)) {
        toast.success(productFeedback.payload.message);
      }
    } else {
      const productFeedback = await dispatch(updateProductFeedback({ data }));
      if (updateProductFeedback.fulfilled.match(productFeedback)) {
        toast.success(productFeedback.payload.message);
      }
    }
    await dispatch(getOrders());
  };

  const renderReviewForm = () => {
    return (
      <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
        <ReviewForm
          setOpenReviewForm={setOpenReviewForm}
          onSubmit={handleSubmitForm}
          update={update}
          setUpdate={setUpdate}
          orderDetailId={orderDetailId}
        />
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-sky-50 to-white py-12 px-4 sm:px-6">
      <div className="max-w-4xl mx-auto">
        {/* HEADER */}
        <div className="flex items-center gap-3 mb-8">
          <Package className="w-8 h-8 text-sky-700" />
          <h1 className="text-3xl font-bold text-sky-800">Lịch sử đơn hàng</h1>
        </div>

        {/* FILTER TABS */}
        <div className="flex flex-wrap gap-3 mb-10">
          {(["All", "Completed", "Cancelled"] as const).map((status) => {
            const active = filterStatus === status;
            const count =
              status === "All"
                ? orders.filter(
                    (o) =>
                      o.orderStatus === "Completed" ||
                      o.orderStatus === "Cancelled"
                  ).length
                : orders.filter((o) => o.orderStatus === status).length;
            return (
              <button
                key={status}
                onClick={() => setFilterStatus(status)}
                className={`flex items-center gap-2 px-4 py-2 rounded-full font-medium text-sm transition-all duration-200 border ${
                  active
                    ? "bg-sky-600 text-white border-sky-600"
                    : "bg-white text-gray-700 border-gray-200 hover:border-sky-300 hover:text-sky-700"
                }`}
              >
                <span>
                  {status === "All"
                    ? "Tất cả"
                    : status === "Completed"
                    ? "Hoàn tất"
                    : "Đã hủy"}
                </span>
                <span
                  className={`px-2 py-0.5 rounded-full text-xs font-semibold ${
                    active
                      ? "bg-white/20 text-white"
                      : "bg-sky-100 text-sky-700"
                  }`}
                >
                  {count}
                </span>
              </button>
            );
          })}
        </div>

        {/* NỘI DUNG */}
        {filteredOrders.length === 0 ? (
          <div className="bg-white border border-gray-100 rounded-2xl shadow-sm p-10 text-center max-w-2xl mx-auto mt-10">
            <div className="bg-gray-100 border-2 border-dashed rounded-xl w-28 h-28 mx-auto mb-5 flex items-center justify-center">
              <Package className="w-12 h-12 text-gray-400" />
            </div>
            <h2 className="text-lg font-medium text-gray-700 mb-1">
              Không có đơn hàng phù hợp
            </h2>
            <p className="text-sm text-gray-500">
              Khi bạn hoàn tất hoặc hủy đơn hàng, chúng sẽ xuất hiện ở đây.
            </p>
          </div>
        ) : (
          <div className="relative ">
            {filteredOrders.map((order, index) => {
              const status = order.orderStatus as keyof typeof statusStyle;
              return (
                <div
                  key={order.id || index}
                  className="relative border-l-2 border-sky-100 pl-6 mb-8"
                >
                  {/* Chấm timeline */}
                  <div
                    className={`absolute -left-[10px] top-2 w-5 h-5 rounded-full ring-4 ring-white shadow-sm ${
                      status === "Completed" ? "bg-green-500" : "bg-red-500"
                    }`}
                  ></div>

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
                            {new Date(order.createdDate).toLocaleString(
                              "vi-VN"
                            )}
                          </span>
                        </div>
                      </div>
                      <div
                        className={`px-3 py-1.5 rounded-full text-sm font-semibold border ${statusStyle[status]}`}
                      >
                        {status === "Completed" ? (
                          <CheckCircle2 className="w-4 h-4" />
                        ) : (
                          <XCircle className="w-4 h-4" />
                        )}
                        {statusLabel[status]}
                      </div>
                    </div>

                    {/* Items */}
                    <div className="divide-y divide-gray-100 mb-4">
                      {order.orderDetails.map((od, idx) => (
                        <div key={idx} className="py-4 flex flex-col gap-4">
                          {/* Hàng trên: ảnh + info bên trái, giá bên phải */}
                          <div className="flex flex-row justify-between items-center w-full">
                            <div className="flex gap-4 flex-shrink-0 min-w-0">
                              <div className="w-16 h-16 rounded-lg overflow-hidden border border-gray-200 bg-gray-50 flex-shrink-0">
                                <img
                                  src={od.varient.product.thumbnailUrl}
                                  alt={od.varient.product.productName}
                                  className="w-full h-full object-cover"
                                />
                              </div>
                              <div className="min-w-0">
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
                                      <span>
                                        Chất liệu: {od.varient.material}
                                      </span>
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

                          {/* Hàng dưới: review */}
                          {od.review !== undefined && (
                            <div className="flex items-center gap-3 mt-2">
                              {od.review ? (
                                <>
                                  <Edit2 size={16} className="text-green-500" />
                                  <p className="text-gray-700 text-sm font-medium">
                                    Đã đánh giá sản phẩm
                                  </p>
                                  <button
                                    onClick={() => {
                                      setOpenReviewForm(true);
                                      setOrderDetailId(od.id);
                                      setUpdate(true);
                                    }}
                                    className="ml-auto bg-gradient-to-r from-orange-400 to-orange-600 text-white px-3 py-1 rounded-lg shadow-sm hover:opacity-90 transition-opacity duration-200"
                                  >
                                    Sửa đánh giá
                                  </button>
                                </>
                              ) : (
                                <>
                                  <Star size={16} className="text-yellow-400" />
                                  <p className="text-gray-700 text-sm font-medium">
                                    Chưa đánh giá sản phẩm
                                  </p>
                                  <button
                                    onClick={() => {
                                      setOpenReviewForm(true);
                                      setOrderDetailId(od.id);
                                    }}
                                    className="ml-auto bg-gradient-to-r from-green-600 to-green-500 text-white px-3 py-1 rounded-lg shadow-sm hover:opacity-90 transition-opacity duration-200"
                                  >
                                    Đánh giá
                                  </button>
                                </>
                              )}
                            </div>
                          )}
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
                        <span>
                          {order.totalAmount.toLocaleString("vi-VN")}₫
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* PHẦN ĐẶT SÂN */}
        <section className="mt-20">
          <div className="flex items-center gap-3 mb-8">
            <Calendar className="w-8 h-8 text-emerald-700" />
            <h2 className="text-3xl font-bold text-emerald-800">
              Lịch sử đặt sân
            </h2>
          </div>

          <div className="bg-white border border-gray-100 rounded-2xl shadow-sm p-10 text-center max-w-2xl mx-auto">
            <div className="bg-emerald-50 border-2 border-dashed border-emerald-100 rounded-full w-28 h-28 mx-auto mb-6 flex items-center justify-center">
              <Clock className="w-12 h-12 text-emerald-500" />
            </div>
            <h3 className="text-xl font-semibold text-emerald-800 mb-2">
              Tính năng đặt sân đang được phát triển
            </h3>
            <p className="text-gray-600 max-w-md mx-auto">
              Chúng tôi đang hoàn thiện hệ thống đặt sân trực tuyến. Bạn sẽ sớm
              có thể xem lại lịch sử đặt sân, thời gian và trạng thái ngay tại
              đây.
            </p>
          </div>
        </section>
      </div>

      {openReviewForm && renderReviewForm()}
    </div>
  );
};

export default HistoryPage;
