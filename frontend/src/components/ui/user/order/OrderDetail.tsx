import { useState } from "react";
import { createPortal } from "react-dom";
import {
  CheckCircle,
  CheckCircle2,
  Circle,
  Clock,
  Ban,
  CreditCard,
  ListOrdered,
  MapPin,
  Package,
  Phone,
  ReceiptText,
  RotateCcw,
  Star,
  Truck,
  User,
} from "lucide-react";
import { toast } from "react-toastify";
import { useAppDispatch, useAppSelector } from "../../../../redux/hook";
import {
  createFeedback,
  updateFeedback,
} from "../../../../redux/slices/user/feedbackSlice";
import {
  getOrderDetail,
  getOrderTracking,
  getTrackingProgress,
} from "../../../../redux/slices/user/orderSlice";
import type {
  CreateFeedbackRequest,
  UpdateFeedbackRequest,
} from "../../../../types/feedback";
import { ORDER_STATUS_COLOR } from "../../../../utils/constants/color";
import {
  ORDER_STATUS_LABEL,
  SHIPPING_STATUS_LABEL,
} from "../../../../utils/constants/orderLabel";
import { ORDER_STATUS } from "../../../../utils/constants/orderStatus";
import {
  REVIEW_STATUS,
  REVIEW_STATUS_LABEL,
} from "../../../../utils/constants/review";
import { formatOrderItemCode } from "../../../../utils/order";
import CancelOrderModal from "./CancelOrderModal";
import ReturnOrderModal from "./ReturnOrderModal";
import type { formRating } from "./ReviewForm";
import ReviewForm from "./ReviewForm";

const sectionClass =
  "rounded-3xl border border-slate-200/80 bg-white p-4 shadow-[0_8px_22px_rgba(15,23,42,0.035)] sm:p-5";

const titleClass =
  "mb-3 flex items-center gap-2 text-base font-semibold text-slate-800";
const labelClass = "text-xs font-medium text-slate-400";
const valueClass = "mt-1 text-sm font-medium text-slate-700";

const OrderDetail = () => {
  const dispatch = useAppDispatch();
  const { orderDetailData, orderTrackingItem, orderTrackingProgressItem } =
    useAppSelector((state) => state.order);

  const submitLoading = useAppSelector(
    (state) =>
      state.ui.loadingMap["feedback/createFeedback"] ||
      state.ui.loadingMap["feedback/updateFeedback"],
  );

  const [openReviewForm, setOpenReviewForm] = useState(false);
  const [update, setUpdate] = useState(false);
  const [selectedItem, setSelectedItem] = useState<any>(null);
  const [openCancelModal, setOpenCancelModal] = useState(false);
  const [openReturnModal, setOpenReturnModal] = useState(false);

  if (!orderDetailData) return null;

  const cancellableStatuses = [
    ORDER_STATUS.PENDING,
    ORDER_STATUS.CONFIRMED,
    ORDER_STATUS.PREPARING,
    ORDER_STATUS.READY_TO_SHIP,
    ORDER_STATUS.SHIPPING,
    ORDER_STATUS.FAILED,
  ];

  const canRequestCancel = cancellableStatuses.some(
    (status) => status === orderDetailData.status,
  );

  const canRequestReturn =
    orderDetailData.status === ORDER_STATUS.COMPLETED &&
    orderDetailData.shippingStatus === "DELIVERED";

  const showShippingProgress =
    orderDetailData.status === ORDER_STATUS.SHIPPING ||
    orderDetailData.status === ORDER_STATUS.COMPLETED;

  const progressDoneCount =
    orderTrackingProgressItem?.filter((step) => step.done).length || 0;
  const progressTotal = orderTrackingProgressItem?.length || 1;
  const progressPercent = (progressDoneCount / progressTotal) * 100;

  const handleOpenCreateReview = (item: any) => {
    setSelectedItem(item);
    setUpdate(false);
    setOpenReviewForm(true);
  };

  const handleOpenUpdateReview = (item: any) => {
    setSelectedItem(item);
    setUpdate(true);
    setOpenReviewForm(true);
  };

  const refreshCurrentOrder = async () => {
    await Promise.all([
      dispatch(getOrderDetail({ data: { orderId: orderDetailData.orderId } })),
      dispatch(
        getOrderTracking({ data: { orderId: orderDetailData.orderId } }),
      ),
      dispatch(
        getTrackingProgress({ data: { orderId: orderDetailData.orderId } }),
      ),
    ]);
  };

  const handleSubmitReview = async (data: formRating) => {
    if (!selectedItem) return;

    try {
      if (update) {
        const payload: UpdateFeedbackRequest = {
          orderId: orderDetailData.orderId,
          variantId: selectedItem.variantId,
          content: data.content,
          rating: data.rating,
        };
        await dispatch(updateFeedback(payload)).unwrap();
        toast.success("Cập nhật đánh giá thành công");
      } else {
        const payload: CreateFeedbackRequest = {
          orderId: orderDetailData.orderId,
          variantId: selectedItem.variantId,
          content: data.content,
          rating: data.rating,
        };
        await dispatch(createFeedback(payload)).unwrap();
        toast.success("Đánh giá sản phẩm thành công");
      }

      await dispatch(
        getOrderDetail({ data: { orderId: orderDetailData.orderId } }),
      );
      setOpenReviewForm(false);
      setSelectedItem(null);
      setUpdate(false);
    } catch (error: any) {
      toast.error(error?.message || "Có lỗi xảy ra");
    }
  };

  return (
    <>
      <div className="bg-white">
        <div className="relative border-b border-slate-100 bg-white p-4 sm:p-5">
          <div className="absolute left-0 top-0 h-[3px] w-full bg-gradient-to-r from-sky-300 via-sky-400 to-sky-500" />

          <div className="flex flex-col gap-4">
            <div className="flex items-start justify-between gap-3">
              <div className="flex items-center gap-3">
                <div className="flex h-12 w-12 items-center justify-center rounded-2xl border border-sky-100 bg-sky-50 text-sky-600">
                  <ReceiptText size={22} />
                </div>

                <div>
                  <p className="text-xs font-medium text-slate-400">
                    Chi tiết đơn
                  </p>
                  <h2 className="mt-0.5 text-lg font-semibold text-slate-800">
                    {formatOrderItemCode(orderDetailData.orderId)}
                  </h2>
                </div>
              </div>

              <div className="flex shrink-0 flex-col justify-end gap-2">
                <span
                  className={`mt-2 inline-flex w-fit items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-medium shadow-sm ${ORDER_STATUS_COLOR[orderDetailData.status]}`}
                >
                  <ListOrdered size={14} />
                  {ORDER_STATUS_LABEL[orderDetailData.status]}
                </span>
              </div>
            </div>

            <div className="rounded-3xl border border-sky-100 bg-sky-50/70 p-4">
              <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <p className="text-xs font-medium text-sky-600">
                    Tổng thanh toán
                  </p>
                  <p className="mt-1 text-2xl font-semibold text-sky-700">
                    {Number(orderDetailData.fee.total).toLocaleString()}đ
                  </p>
                </div>

                {(canRequestCancel || canRequestReturn) && (
                  <div className="flex flex-wrap gap-2 sm:justify-end">
                  {canRequestCancel && (
                    <button
                      type="button"
                      onClick={() => setOpenCancelModal(true)}
                      className="inline-flex h-9 items-center justify-center gap-1.5 rounded-xl border border-red-200 bg-red-50 px-3.5 text-sm font-semibold text-red-600 transition-colors hover:border-red-300 hover:bg-red-100"
                    >
                      <Ban size={15} />
                      {orderDetailData.status === ORDER_STATUS.PENDING
                        ? "Hủy đơn"
                        : "Yêu cầu hủy"}
                    </button>
                  )}

                  {canRequestReturn && (
                    <button
                      type="button"
                      onClick={() => setOpenReturnModal(true)}
                      className="inline-flex h-9 items-center justify-center gap-1.5 rounded-xl border border-orange-200 bg-orange-50 px-3.5 text-sm font-semibold text-orange-600 transition-colors hover:border-orange-300 hover:bg-orange-100"
                    >
                      <RotateCcw size={15} />
                      Yêu cầu trả
                    </button>
                  )}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        <div className="space-y-5 bg-slate-50/70 p-3 sm:p-5">
          <section className={sectionClass}>
            <p className={titleClass}>
              <MapPin size={18} className="text-sky-600" />
              Người nhận
            </p>

            <div className="space-y-3">
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                <div className="rounded-2xl border border-slate-100 bg-slate-50 px-4 py-3">
                  <div className="flex items-center gap-2 text-slate-400">
                    <User size={15} />
                    <p className={labelClass}>Họ tên</p>
                  </div>
                  <p className={valueClass}>{orderDetailData.address.name}</p>
                </div>

                <div className="rounded-2xl border border-slate-100 bg-slate-50 px-4 py-3">
                  <div className="flex items-center gap-2 text-slate-400">
                    <Phone size={15} />
                    <p className={labelClass}>Điện thoại</p>
                  </div>
                  <p className={valueClass}>{orderDetailData.address.phone}</p>
                </div>
              </div>

              <div className="rounded-2xl border border-slate-100 bg-slate-50 px-4 py-3">
                <p className={labelClass}>Địa chỉ giao hàng</p>
                <p className="mt-1 text-sm leading-relaxed text-slate-600">
                  {orderDetailData.address.address}
                </p>
              </div>
            </div>
          </section>

          <section className={sectionClass}>
            <p className={titleClass}>
              <Truck size={18} className="text-sky-600" />
              Trạng thái vận chuyển
            </p>

            {showShippingProgress ? (
              <div className="overflow-hidden rounded-3xl border border-slate-200/80 bg-white shadow-sm">
                <div className="border-b border-slate-100 bg-slate-50 px-4 py-4">
                  <p className="text-sm font-semibold text-slate-800">
                    Tiến trình đơn hàng
                  </p>
                  <p className="text-xs text-slate-500">
                    Cập nhật theo trạng thái mới nhất
                  </p>
                </div>

                <div className="relative overflow-x-auto p-5">
                  <div className="relative min-w-[520px]">
                    <div className="absolute left-10 right-10 top-6 h-[3px] rounded-full bg-slate-200" />
                    <div
                      className="absolute left-10 top-6 h-[3px] rounded-full bg-sky-400 transition-all duration-500"
                      style={{
                        width: `calc((100% - 5rem) * ${progressPercent / 100})`,
                      }}
                    />

                    <div className="relative flex justify-between">
                      {orderTrackingProgressItem?.map((step, idx) => (
                        <div
                          key={`${step.step}-${idx}`}
                          className="flex flex-1 flex-col items-center"
                        >
                          <div
                            className={`flex h-12 w-12 items-center justify-center rounded-full border-2 transition-all duration-300 ${
                              step.current
                                ? "scale-105 border-sky-500 bg-sky-50 text-sky-600 shadow-md"
                                : step.done
                                  ? "border-emerald-500 bg-emerald-500 text-white shadow-sm"
                                  : "border-slate-300 bg-white text-slate-400"
                            }`}
                          >
                            {step.current ? (
                              <Truck size={18} className="animate-pulse" />
                            ) : step.done ? (
                              <CheckCircle size={18} />
                            ) : (
                              <Circle size={18} />
                            )}
                          </div>

                          <p
                            className={`mt-2 max-w-[86px] text-center text-[11px] font-medium leading-snug ${
                              step.current
                                ? "text-sky-600"
                                : step.done
                                  ? "text-emerald-600"
                                  : "text-slate-400"
                            }`}
                          >
                            {SHIPPING_STATUS_LABEL[step.step]}
                          </p>
                        </div>
                      ))}
                    </div>
                  </div>

                  {orderDetailData.status === ORDER_STATUS.COMPLETED && (
                    <div className="mt-6 flex items-center justify-center">
                      <div className="inline-flex items-center gap-2 rounded-full bg-emerald-50 px-4 py-2 text-sm font-medium text-emerald-600 ring-1 ring-emerald-100">
                        <CheckCircle2 size={18} />
                        Đơn hàng đã giao thành công
                      </div>
                    </div>
                  )}
                </div>
              </div>
            ) : (
              <div className="flex items-start gap-3 rounded-3xl border border-slate-200 bg-slate-50 p-4">
                <div className="mt-0.5 text-sky-600">
                  {orderDetailData.status === ORDER_STATUS.PENDING && (
                    <Clock size={19} />
                  )}
                  {orderDetailData.status === ORDER_STATUS.CONFIRMED && (
                    <CheckCircle2 size={19} />
                  )}
                  {orderDetailData.status === ORDER_STATUS.PREPARING && (
                    <Package size={19} />
                  )}
                  {orderDetailData.status === ORDER_STATUS.READY_TO_SHIP && (
                    <Truck size={19} />
                  )}
                </div>

                <div>
                  <p className="text-sm font-medium text-slate-700">
                    {orderDetailData.status === ORDER_STATUS.PENDING &&
                      "Đơn hàng đang chờ xử lý"}
                    {orderDetailData.status === ORDER_STATUS.CONFIRMED &&
                      "Đơn hàng đã được xác nhận"}
                    {orderDetailData.status === ORDER_STATUS.PREPARING &&
                      "Shop đang chuẩn bị hàng"}
                    {orderDetailData.status === ORDER_STATUS.READY_TO_SHIP &&
                      "Đơn hàng đang chờ bàn giao cho đơn vị vận chuyển"}
                  </p>
                  <p className="mt-1 text-xs leading-relaxed text-slate-500">
                    Tiến trình chi tiết sẽ hiển thị khi đơn hàng bắt đầu vận
                    chuyển.
                  </p>
                </div>
              </div>
            )}
          </section>

          <section className={sectionClass}>
            <p className={titleClass}>
              <Package size={18} className="text-sky-600" />
              Sản phẩm trong đơn
            </p>

            <div className="space-y-3">
              {orderDetailData.items.map((item, idx) => (
                <div
                  key={`${item.name}-${idx}`}
                  className="grid grid-cols-[76px_1fr] gap-3 rounded-3xl border border-slate-200/80 bg-white p-3 shadow-sm transition-all hover:border-sky-200 hover:bg-sky-50/20 sm:grid-cols-[88px_1fr]"
                >
                  <img
                    src={item.thumbnailUrl}
                    alt={item.name}
                    className="h-24 w-full rounded-2xl border border-slate-100 object-cover shadow-sm"
                  />

                  <div className="min-w-0">
                    <p className="line-clamp-2 text-sm font-medium leading-snug text-slate-800">
                      {item.name}
                    </p>
                    {item.variantInfo && (
                      <p className="mt-1 text-xs leading-relaxed text-slate-500">
                        {item.variantInfo}
                      </p>
                    )}

                    <div className="mt-3 flex flex-wrap items-center justify-between gap-2">
                      <span className="rounded-full bg-slate-50 px-3 py-1 text-xs font-medium text-slate-500">
                        {item.quantity} x {Number(item.price).toLocaleString()}đ
                      </span>
                      <span className="text-sm font-semibold text-sky-700">
                        {(item.price * item.quantity).toLocaleString()}đ
                      </span>
                    </div>

                    <div className="mt-3 flex justify-end">
                      {item.reviewStatus !== REVIEW_STATUS.NOT_ELIGIBLE ? (
                        <button
                          type="button"
                          onClick={() => {
                            if (item.reviewStatus === REVIEW_STATUS.REVIEWED) {
                              handleOpenUpdateReview(item);
                            } else {
                              handleOpenCreateReview(item);
                            }
                          }}
                          className={`inline-flex h-9 items-center gap-1.5 rounded-full px-3 text-xs font-medium shadow-sm transition-all ${
                            item.reviewStatus === REVIEW_STATUS.REVIEWED
                              ? "bg-amber-50 text-amber-600 ring-1 ring-amber-100 hover:bg-amber-100"
                              : "bg-sky-50 text-sky-700 ring-1 ring-sky-100 hover:bg-sky-100"
                          }`}
                        >
                          <Star
                            size={14}
                            className={
                              item.reviewStatus === REVIEW_STATUS.REVIEWED
                                ? "fill-amber-500 text-amber-500"
                                : "fill-sky-500 text-sky-500"
                            }
                          />
                          {item.reviewStatus === REVIEW_STATUS.REVIEWED
                            ? REVIEW_STATUS_LABEL.REVIEWED
                            : REVIEW_STATUS_LABEL.CAN_REVIEW}
                        </button>
                      ) : (
                        <div className="inline-flex h-9 items-center rounded-full bg-slate-100 px-3 text-xs font-medium text-slate-500">
                          {REVIEW_STATUS_LABEL.NOT_ELIGIBLE}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </section>

          <section className={sectionClass}>
            <p className={titleClass}>
              <Clock size={18} className="text-sky-600" />
              Lịch sử giao hàng
            </p>

            {orderTrackingItem && orderTrackingItem.length > 0 ? (
              <div className="relative pl-8">
                <div className="absolute bottom-2 left-3 top-2 w-[2px] rounded-full bg-slate-200" />
                <div className="space-y-4">
                  {orderTrackingItem.map((item, idx) => (
                    <div
                      key={`${item.status}-${item.time}-${idx}`}
                      className="relative"
                    >
                      <div className="absolute -left-[27px] top-4">
                        <div className="flex h-5 w-5 items-center justify-center rounded-full border-4 border-white bg-sky-500 shadow-sm" />
                      </div>
                      <div className="rounded-3xl border border-slate-200 bg-white px-4 py-3 shadow-sm">
                        <p className="flex items-center gap-2 text-sm font-medium text-slate-800">
                          <span className="flex h-6 w-6 items-center justify-center rounded-full bg-sky-50 text-[11px] font-medium text-sky-600">
                            {idx + 1}
                          </span>
                          {item.label || SHIPPING_STATUS_LABEL[item.status]}
                        </p>
                        <p className="mt-1 pl-8 text-xs text-slate-500">
                          {new Date(item.time).toLocaleDateString("vi-VN")} -{" "}
                          {new Date(item.time).toLocaleTimeString("vi-VN", {
                            hour: "2-digit",
                            minute: "2-digit",
                          })}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              <div className="rounded-3xl border border-slate-200 bg-slate-50 p-4 text-sm text-slate-500">
                Chưa có lịch sử giao hàng.
              </div>
            )}
          </section>

          <section className="overflow-hidden rounded-3xl border border-slate-200/80 bg-white shadow-[0_8px_22px_rgba(15,23,42,0.035)]">
            <div className="border-b border-slate-100 bg-slate-50 px-4 py-3 sm:px-5">
              <p className="flex items-center gap-2 font-semibold text-slate-800">
                <ReceiptText size={18} className="text-sky-600" />
                Chi tiết thanh toán
              </p>
            </div>

            <div className="space-y-3 p-4 sm:p-5">
              <div className="flex justify-between gap-4 text-sm">
                <span className="text-slate-500">Tạm tính</span>
                <span className="font-medium text-slate-700">
                  {Number(orderDetailData.fee.subtotal).toLocaleString()}đ
                </span>
              </div>
              <div className="flex justify-between gap-4 text-sm">
                <span className="text-slate-500">Phí vận chuyển</span>
                <span className="font-medium text-emerald-600">
                  {Number(orderDetailData.fee.shipping).toLocaleString()}đ
                </span>
              </div>
              <div className="border-t border-slate-100 pt-3" />
              <div className="rounded-2xl border border-sky-100 bg-sky-50/70 p-4">
                <div className="flex items-center justify-between gap-4">
                  <span className="flex items-center gap-2 font-semibold text-slate-700">
                    <CreditCard size={17} className="text-sky-600" />
                    Tổng đơn
                  </span>
                  <span className="text-xl font-semibold text-sky-700">
                    {Number(orderDetailData.fee.total).toLocaleString()}đ
                  </span>
                </div>
              </div>
            </div>
          </section>
        </div>
      </div>

      <CancelOrderModal
        orderId={orderDetailData.orderId}
        isPending={orderDetailData.status === ORDER_STATUS.PENDING}
        isOpen={openCancelModal}
        onClose={() => setOpenCancelModal(false)}
        onSuccess={refreshCurrentOrder}
      />

      <ReturnOrderModal
        orderId={orderDetailData.orderId}
        isOpen={openReturnModal}
        onClose={() => setOpenReturnModal(false)}
        onSuccess={refreshCurrentOrder}
      />

      {openReviewForm &&
        selectedItem &&
        createPortal(
          <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-slate-950/45 p-4 backdrop-blur-sm">
            <button
              type="button"
              className="absolute inset-0"
              aria-label="Đóng form đánh giá"
              onClick={() => {
                setOpenReviewForm(false);
                setSelectedItem(null);
                setUpdate(false);
              }}
            />

            <div className="relative z-10 w-full max-w-md">
              <ReviewForm
                loading={submitLoading}
                update={update}
                orderId={orderDetailData.orderId}
                variantId={selectedItem.variantId}
                setOpenReviewForm={setOpenReviewForm}
                onSubmit={handleSubmitReview}
              />
            </div>
          </div>,
          document.body,
        )}
    </>
  );
};

export default OrderDetail;
