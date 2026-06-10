import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useAppDispatch, useAppSelector } from "../../redux/hook";
import type { BranchDetailRequest } from "../../types/branch";
import {
  MapPin,
  Phone,
  ArrowLeft,
  Info,
  Clock,
  User,
  CalendarCheck2,
  ImageIcon,
  Building2,
  ShieldCheck,
  Navigation,
  Mail,
  Loader2,
  CheckCircle2,
  Star,
  MessageSquare,
  Send,
} from "lucide-react";
import { getBranchDetail } from "../../redux/slices/user/branchSlice";
import { upsertBranchFeedback } from "../../redux/slices/user/feedbackSlice";
import type { FeedbackRating } from "../../types/feedback";
import { toast } from "react-toastify";
import TablePagination from "../../components/ui/user/pagination/TablePagination";

const BRANCH_REVIEW_LIMIT = 5;

const BranchDetailPage = () => {
  const { branchId } = useParams();
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const { branchDetail } = useAppSelector((state) => state.branch);

  const [activeImage, setActiveImage] = useState<string>("");
  const [reviewRating, setReviewRating] = useState<FeedbackRating>(5);
  const [reviewContent, setReviewContent] = useState("");
  const [reviewSubmitting, setReviewSubmitting] = useState(false);
  const [reviewPage, setReviewPage] = useState(1);

  useEffect(() => {
    if (branchId) {
      const data: BranchDetailRequest = { branchId: Number(branchId) };
      dispatch(getBranchDetail({ data }));
    }
  }, [branchId, dispatch]);

  useEffect(() => {
    if (branchDetail?.images?.length) {
      setActiveImage(branchDetail.images[0].imageUrl);
    }
  }, [branchDetail]);

  useEffect(() => {
    if (branchDetail?.myFeedback) {
      setReviewRating(branchDetail.myFeedback.rating as FeedbackRating);
      setReviewContent(branchDetail.myFeedback.content);
    } else {
      setReviewRating(5);
      setReviewContent("");
    }
  }, [branchDetail?.myFeedback]);

  useEffect(() => {
    setReviewPage(1);
  }, [branchId]);

  const renderStars = (rating: number, size = 18) =>
    Array.from({ length: 5 }, (_, index) => {
      const active = index < Math.round(Number(rating || 0));

      return (
        <Star
          key={index}
          size={size}
          className={
            active ? "fill-amber-400 text-amber-400" : "text-slate-300"
          }
        />
      );
    });

  const handleSubmitReview = async () => {
    if (!branchId || !branchDetail?.canReview) return;

    const content = reviewContent.trim();

    if (!content) {
      toast.warning("Vui lòng nhập nội dung đánh giá");
      return;
    }

    setReviewSubmitting(true);

    try {
      await dispatch(
        upsertBranchFeedback({
          branchId: Number(branchId),
          content,
          rating: reviewRating,
        }),
      ).unwrap();

      toast.success(
        branchDetail.myFeedback
          ? "Cập nhật đánh giá chi nhánh thành công"
          : "Đánh giá chi nhánh thành công",
      );

      dispatch(getBranchDetail({ data: { branchId: Number(branchId) } }));
    } catch (error: any) {
      toast.error(
        error?.response?.data?.message ||
          error?.message ||
          "Không thể lưu đánh giá chi nhánh",
      );
    } finally {
      setReviewSubmitting(false);
    }
  };

  const formatReviewDate = (value?: string) => {
    if (!value) return "";
    return new Date(value).toLocaleDateString("vi-VN");
  };

  if (!branchDetail) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center gap-3 bg-slate-50 text-slate-600">
        <div className="flex h-16 w-16 items-center justify-center rounded-3xl bg-sky-50 text-sky-600 shadow-sm">
          <Loader2 className="h-8 w-8 animate-spin" />
        </div>

        <p className="text-sm font-medium">Đang tải thông tin chi nhánh...</p>
      </div>
    );
  }

  const images = branchDetail.images || [];
  const displayImage = activeImage || images[0]?.imageUrl || "";
  const branchFeedbacks = branchDetail.feedbacks || [];
  const reviewTotalPages = Math.max(
    1,
    Math.ceil(branchFeedbacks.length / BRANCH_REVIEW_LIMIT),
  );
  const currentReviewPage = Math.min(reviewPage, reviewTotalPages);
  const paginatedBranchFeedbacks = branchFeedbacks.slice(
    (currentReviewPage - 1) * BRANCH_REVIEW_LIMIT,
    currentReviewPage * BRANCH_REVIEW_LIMIT,
  );

  return (
    <div className="min-h-screen bg-[#f8fafc] pb-16">
      <main className="mx-auto max-w-[1280px] px-3 py-5 sm:px-4 sm:py-7 lg:px-6">
        {/* TOP BAR */}
        <div className="mb-5 flex items-center justify-between gap-4">
          <button
            onClick={() => navigate(-1)}
            className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-700 shadow-sm transition-all hover:border-sky-200 hover:bg-sky-50 hover:text-sky-700"
          >
            <ArrowLeft size={17} />
            Quay lại
          </button>

          <div className="hidden items-center gap-2 rounded-full border border-sky-100 bg-sky-50 px-4 py-2 text-sm font-medium text-sky-700 sm:inline-flex">
            <Building2 size={16} />
            Chi tiết chi nhánh
          </div>
        </div>

        {/* HERO / GALLERY */}
        <section className="overflow-hidden rounded-[2rem] border border-slate-200 bg-white shadow-[0_12px_35px_rgba(15,23,42,0.08)]">
          <div className="relative">
            {displayImage ? (
              <img
                src={displayImage}
                alt={branchDetail.branchName}
                className="h-[260px] w-full object-cover sm:h-[360px] lg:h-[440px]"
              />
            ) : (
              <div className="flex h-[260px] w-full items-center justify-center bg-slate-100 text-slate-400 sm:h-[360px] lg:h-[440px]">
                <ImageIcon size={42} />
              </div>
            )}

            <div className="absolute inset-0 bg-gradient-to-t from-slate-950/70 via-slate-950/10 to-transparent" />

            <div className="absolute bottom-0 left-0 right-0 p-4 sm:p-6 lg:p-8">
              <div className="max-w-3xl">
                <div className="mb-3 inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/15 px-4 py-2 text-xs font-medium text-white backdrop-blur-sm">
                  <MapPin size={15} className="text-sky-200" />
                  Chi nhánh B-Hub
                </div>

                <h1 className="text-2xl font-semibold leading-tight text-white sm:text-4xl">
                  {branchDetail.branchName}
                </h1>

                <p className="mt-3 max-w-2xl text-sm leading-relaxed text-slate-100 sm:text-base">
                  {branchDetail.fullAddress}
                </p>
              </div>
            </div>
          </div>

          {/* THUMBNAILS */}
          {images.length > 0 && (
            <div className="border-t border-slate-100 bg-white p-3 sm:p-4">
              <div className="flex gap-3 overflow-x-auto pb-1">
                {images.map((img) => {
                  const active = activeImage === img.imageUrl;

                  return (
                    <button
                      key={img.id}
                      type="button"
                      onClick={() => setActiveImage(img.imageUrl)}
                      className={`shrink-0 overflow-hidden rounded-2xl border p-1 transition-all ${
                        active
                          ? "border-sky-400 bg-sky-50 shadow-md shadow-sky-100"
                          : "border-slate-200 bg-white hover:border-sky-200 hover:bg-sky-50"
                      }`}
                    >
                      <img
                        src={img.imageUrl}
                        alt=""
                        className="h-20 w-28 rounded-xl object-cover sm:h-24 sm:w-36"
                      />
                    </button>
                  );
                })}
              </div>
            </div>
          )}
        </section>

        {/* CONTENT */}
        <div className="mt-6 grid grid-cols-1 gap-6 lg:grid-cols-[minmax(0,1fr)_380px] xl:grid-cols-[minmax(0,1fr)_420px]">
          {/* LEFT */}
          <div className="min-w-0 space-y-6">
            {/* QUICK INFO */}
            <section className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div className="rounded-[2rem] border border-slate-200 bg-white p-5 shadow-[0_8px_26px_rgba(15,23,42,0.05)]">
                <div className="flex items-start gap-3">
                  <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl border border-sky-100 bg-sky-50 text-sky-600">
                    <MapPin size={21} />
                  </div>

                  <div className="min-w-0">
                    <p className="text-sm font-medium text-slate-500">
                      Địa chỉ
                    </p>
                    <p className="mt-1 text-sm font-medium leading-relaxed text-slate-800">
                      {branchDetail.fullAddress}
                    </p>
                  </div>
                </div>
              </div>

              <div className="rounded-[2rem] border border-slate-200 bg-white p-5 shadow-[0_8px_26px_rgba(15,23,42,0.05)]">
                <div className="flex items-start gap-3">
                  <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl border border-emerald-100 bg-emerald-50 text-emerald-600">
                    <Phone size={21} />
                  </div>

                  <div className="min-w-0">
                    <p className="text-sm font-medium text-slate-500">
                      Điện thoại
                    </p>
                    <p className="mt-1 text-sm font-medium text-slate-800">
                      {branchDetail.phoneNumber}
                    </p>
                  </div>
                </div>
              </div>
            </section>

            {/* MANAGERS */}
            {branchDetail.managers?.length > 0 && (
              <section className="overflow-hidden rounded-[2rem] border border-slate-200 bg-white shadow-[0_12px_35px_rgba(15,23,42,0.08)]">
                <div className="border-b border-slate-200 bg-white p-5 sm:p-6">
                  <div className="flex items-center gap-3">
                    <div className="flex h-11 w-11 items-center justify-center rounded-2xl border border-sky-100 bg-sky-50 text-sky-600">
                      <User size={21} />
                    </div>

                    <div>
                      <h2 className="text-lg font-semibold text-slate-900">
                        Quản lý chi nhánh
                      </h2>
                      <p className="mt-1 text-sm text-slate-600">
                        Thông tin người phụ trách tại chi nhánh.
                      </p>
                    </div>
                  </div>
                </div>

                <div className="space-y-3 bg-slate-100/60 p-3 sm:p-5">
                  {branchDetail.managers.map((manager, index) => (
                    <div
                      key={index}
                      className="rounded-3xl border border-slate-200 bg-white p-4 shadow-sm transition-all hover:border-sky-200 hover:bg-sky-50/30"
                    >
                      <div className="flex items-start gap-4">
                        <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl border border-sky-100 bg-sky-50 text-sky-600">
                          <Info size={22} />
                        </div>

                        <div className="min-w-0 flex-1">
                          <p className="text-base font-semibold text-slate-900">
                            {manager.fullName || "Chưa cập nhật tên"}
                          </p>

                          <div className="mt-3 space-y-2 text-sm">
                            <p className="flex items-center gap-2 text-slate-600">
                              <Mail
                                size={15}
                                className="shrink-0 text-sky-600"
                              />
                              <span className="truncate">
                                {manager.email || "Chưa cập nhật email"}
                              </span>
                            </p>

                            <p className="flex items-center gap-2 text-slate-600">
                              <Phone
                                size={15}
                                className="shrink-0 text-emerald-600"
                              />
                              <span>
                                {manager.phoneNumber ||
                                  "Chưa cập nhật số điện thoại"}
                              </span>
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </section>
            )}

            {/* DESCRIPTION */}
            <section className="overflow-hidden rounded-[2rem] border border-slate-200 bg-white shadow-[0_12px_35px_rgba(15,23,42,0.08)]">
              <div className="border-b border-slate-200 bg-white p-5 sm:p-6">
                <div className="flex items-center gap-3">
                  <div className="flex h-11 w-11 items-center justify-center rounded-2xl border border-sky-100 bg-sky-50 text-sky-600">
                    <Info size={21} />
                  </div>

                  <div>
                    <h2 className="text-lg font-semibold text-slate-900">
                      Giới thiệu chi nhánh
                    </h2>
                    <p className="mt-1 text-sm text-slate-600">
                      Thông tin tổng quan và tiện ích tại chi nhánh.
                    </p>
                  </div>
                </div>
              </div>

              <div className="bg-slate-100/60 p-3 sm:p-5">
                <div
                  className="
                    rounded-3xl border border-slate-200 bg-white p-5 text-sm leading-relaxed text-slate-700 shadow-sm sm:p-6
                    [&_p]:mb-3 [&_p]:leading-relaxed
                    [&_strong]:font-semibold [&_strong]:text-slate-900
                    [&_ul]:list-disc [&_ul]:pl-5
                    [&_li]:mb-1.5
                  "
                  dangerouslySetInnerHTML={{
                    __html: branchDetail.description,
                  }}
                />
              </div>
            </section>

            {/* REVIEWS */}
            <section className="overflow-hidden rounded-[2rem] border border-slate-200 bg-white shadow-[0_12px_35px_rgba(15,23,42,0.08)]">
              <div className="border-b border-slate-200 bg-white p-5 sm:p-6">
                <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                  <div className="flex items-center gap-3">
                    <div className="flex h-11 w-11 items-center justify-center rounded-2xl border border-amber-100 bg-amber-50 text-amber-600">
                      <MessageSquare size={21} />
                    </div>

                    <div>
                      <h2 className="text-lg font-semibold text-slate-900">
                        Đánh giá chi nhánh
                      </h2>
                      <p className="mt-1 text-sm text-slate-600">
                        Chọn sao và chia sẻ trải nghiệm của bạn tại chi nhánh.
                      </p>
                    </div>
                  </div>

                  <div className="rounded-2xl border border-amber-100 bg-amber-50 px-4 py-3">
                    <div className="flex items-center gap-2">
                      <span className="text-2xl font-bold text-amber-600">
                        {branchDetail.feedbackSummary?.averageRating || 0}
                      </span>

                      <div>
                        <div className="flex items-center gap-0.5">
                          {renderStars(
                            branchDetail.feedbackSummary?.averageRating || 0,
                            16,
                          )}
                        </div>
                        <p className="mt-0.5 text-xs font-medium text-amber-700">
                          {branchDetail.feedbackSummary?.totalFeedbacks || 0}{" "}
                          đánh giá
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <div className="space-y-4 bg-slate-100/60 p-3 sm:p-5">
                <div className="rounded-3xl border border-slate-200 bg-white p-4 shadow-sm sm:p-5">
                  <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                    <div>
                      <p className="text-base font-semibold text-slate-900">
                        {branchDetail.myFeedback
                          ? "Cập nhật đánh giá của bạn"
                          : "Viết đánh giá của bạn"}
                      </p>
                      <p className="mt-1 text-sm text-slate-600">
                        Mỗi tài khoản có một đánh giá cho mỗi chi nhánh.
                      </p>
                    </div>

                    <div className="flex items-center gap-1 rounded-2xl border border-amber-100 bg-amber-50 px-2 py-1">
                      {([1, 2, 3, 4, 5] as FeedbackRating[]).map((rating) => (
                        <button
                          key={rating}
                          type="button"
                          onClick={() => {
                            if (branchDetail.canReview) {
                              setReviewRating(rating);
                            }
                          }}
                          disabled={!branchDetail.canReview}
                          className="rounded-xl p-1.5 transition-all hover:bg-amber-100 disabled:cursor-not-allowed disabled:opacity-60"
                          aria-label={`Chọn ${rating} sao`}
                        >
                          <Star
                            size={26}
                            className={
                              rating <= reviewRating
                                ? "fill-amber-400 text-amber-400"
                                : "text-slate-300"
                            }
                          />
                        </button>
                      ))}
                    </div>
                  </div>

                  {!branchDetail.canReview && (
                    <div className="mt-4 rounded-2xl border border-sky-100 bg-sky-50 p-3 text-sm leading-relaxed text-sky-800">
                      Bạn chỉ có thể gửi đánh giá sau khi có đơn hàng hoàn thành
                      hoặc lịch đặt sân hoàn thành tại chi nhánh này.
                    </div>
                  )}

                  <textarea
                    value={reviewContent}
                    onChange={(event) => setReviewContent(event.target.value)}
                    rows={4}
                    maxLength={1000}
                    disabled={!branchDetail.canReview}
                    placeholder="Chia sẻ cảm nhận của bạn về chi nhánh..."
                    className="mt-4 w-full resize-none rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm leading-relaxed text-slate-800 outline-none transition-all placeholder:text-slate-400 focus:border-sky-300 focus:bg-white focus:ring-1 focus:ring-sky-50 disabled:cursor-not-allowed disabled:text-slate-400"
                  />

                  <div className="mt-3 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                    <span className="text-xs text-slate-500">
                      {reviewContent.length}/1000 ký tự
                    </span>

                    <button
                      type="button"
                      onClick={handleSubmitReview}
                      disabled={reviewSubmitting || !branchDetail.canReview}
                      className="inline-flex items-center justify-center gap-2 rounded-2xl bg-sky-500 px-5 py-3 text-sm font-semibold text-white shadow-lg shadow-sky-100 transition-all hover:bg-sky-600 disabled:cursor-not-allowed disabled:opacity-70"
                    >
                      {reviewSubmitting ? (
                        <Loader2 size={18} className="animate-spin" />
                      ) : (
                        <Send size={18} />
                      )}

                      {branchDetail.myFeedback ? "Cập nhật" : "Gửi đánh giá"}
                    </button>
                  </div>
                </div>

                <div className="space-y-3">
                  {branchFeedbacks.length ? (
                    paginatedBranchFeedbacks.map((feedback) => (
                      <div
                        key={feedback.id}
                        className="rounded-3xl border border-slate-200 bg-white p-4 shadow-sm"
                      >
                        <div className="flex items-start gap-3">
                          <img
                            src={feedback.user.avatar}
                            alt={feedback.user.fullName || feedback.user.email}
                            className="h-11 w-11 rounded-2xl object-cover"
                          />

                          <div className="min-w-0 flex-1">
                            <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
                              <div className="min-w-0">
                                <p className="truncate text-sm font-semibold text-slate-900">
                                  {feedback.user.fullName ||
                                    feedback.user.email}
                                </p>

                                <div className="mt-1 flex items-center gap-1">
                                  {renderStars(feedback.rating, 15)}
                                </div>
                              </div>

                              <span className="text-xs font-medium text-slate-500">
                                {formatReviewDate(feedback.updatedAt)}
                              </span>
                            </div>

                            <p className="mt-3 whitespace-pre-line text-sm leading-relaxed text-slate-700">
                              {feedback.content}
                            </p>
                          </div>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="rounded-3xl border border-slate-200 bg-white p-5 text-center text-sm text-slate-500 shadow-sm">
                      Chưa có đánh giá nào cho chi nhánh này.
                    </div>
                  )}

                  {branchFeedbacks.length > BRANCH_REVIEW_LIMIT && (
                    <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
                      <TablePagination
                        page={currentReviewPage}
                        totalPages={reviewTotalPages}
                        total={branchFeedbacks.length}
                        unit="đánh giá"
                        compact
                        onPage={setReviewPage}
                      />
                    </div>
                  )}
                </div>
              </div>
            </section>

            {/* MAP */}
            <section className="overflow-hidden rounded-[2rem] border border-slate-200 bg-white shadow-[0_12px_35px_rgba(15,23,42,0.08)]">
              <div className="border-b border-slate-200 bg-white p-5 sm:p-6">
                <div className="flex items-center gap-3">
                  <div className="flex h-11 w-11 items-center justify-center rounded-2xl border border-sky-100 bg-sky-50 text-sky-600">
                    <Navigation size={21} />
                  </div>

                  <div>
                    <h2 className="text-lg font-semibold text-slate-900">
                      Vị trí chi nhánh
                    </h2>
                    <p className="mt-1 text-sm text-slate-600">
                      Xem vị trí chi nhánh trên bản đồ.
                    </p>
                  </div>
                </div>
              </div>

              <div className="bg-slate-100/60 p-3 sm:p-5">
                <div className="overflow-hidden rounded-3xl border border-slate-200 bg-white p-3 shadow-sm">
                  <iframe
                    title="map"
                    src={`https://www.google.com/maps?q=${branchDetail.latitude},${branchDetail.longitude}&z=16&output=embed`}
                    className="h-[320px] w-full rounded-2xl border-0 sm:h-[420px]"
                    loading="lazy"
                  />
                </div>
              </div>
            </section>
          </div>

          {/* RIGHT SIDEBAR */}
          <aside className="min-w-0 lg:sticky lg:top-6 lg:h-fit">
            <div className="overflow-hidden rounded-[2rem] border border-slate-200 bg-white shadow-[0_12px_35px_rgba(15,23,42,0.08)]">
              <div className="border-b border-slate-200 bg-white p-5 sm:p-6">
                <div className="flex items-start gap-3">
                  <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl border border-sky-100 bg-sky-50 text-sky-600">
                    <CalendarCheck2 size={23} />
                  </div>

                  <div>
                    <h3 className="text-lg font-semibold text-slate-900">
                      Đặt sân tại chi nhánh
                    </h3>

                    <p className="mt-1 text-sm leading-relaxed text-slate-600">
                      Chọn lịch và giữ sân nhanh chóng tại{" "}
                      <span className="font-medium text-slate-800">
                        {branchDetail.branchName}
                      </span>
                      .
                    </p>
                  </div>
                </div>
              </div>

              <div className="space-y-4 bg-slate-100/60 p-3 sm:p-5">
                <div className="rounded-3xl border border-slate-200 bg-white p-4 shadow-sm">
                  <div className="space-y-3 text-sm">
                    <div className="flex items-center justify-between gap-4">
                      <span className="flex items-center gap-2 text-slate-600">
                        <Clock size={16} className="text-sky-600" />
                        Giờ mở cửa
                      </span>
                      <span className="font-semibold text-slate-800">
                        06:00 - 23:00
                      </span>
                    </div>

                    <div className="flex items-center justify-between gap-4">
                      <span className="text-slate-600">Số lượng sân</span>
                      <span className="font-semibold text-slate-800">
                        10 sân
                      </span>
                    </div>

                    <div className="flex items-center justify-between gap-4">
                      <span className="text-slate-600">Đặt sân online</span>
                      <span className="inline-flex items-center gap-1 rounded-full border border-emerald-100 bg-emerald-50 px-2.5 py-1 text-xs font-medium text-emerald-700">
                        <CheckCircle2 size={13} />
                        Có hỗ trợ
                      </span>
                    </div>
                  </div>
                </div>

                <div className="rounded-3xl border border-sky-100 bg-sky-50 p-4">
                  <div className="flex items-start gap-3">
                    <ShieldCheck
                      size={19}
                      className="mt-0.5 shrink-0 text-sky-700"
                    />

                    <p className="text-sm leading-relaxed text-sky-800">
                      Hệ thống sẽ giữ sân trong{" "}
                      <span className="font-semibold">5 phút</span> sau khi đặt.
                      Vui lòng hoàn tất thanh toán để xác nhận lịch.
                    </p>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => {
                    navigate(`/courts?branchId=${branchDetail.id}`);
                  }}
                  className="flex w-full items-center justify-center gap-2 rounded-2xl bg-sky-500 px-5 py-4 text-sm font-semibold text-white shadow-lg shadow-sky-100 transition-all hover:bg-sky-600 active:scale-[0.98]"
                >
                  <CalendarCheck2 size={20} />
                  Đặt sân ngay
                </button>

                <button
                  type="button"
                  className="flex w-full items-center justify-center gap-2 rounded-2xl border border-slate-200 bg-white px-5 py-3.5 text-sm font-medium text-slate-700 transition-all hover:border-sky-200 hover:bg-sky-50 hover:text-sky-700"
                >
                  <Phone size={18} />
                  Liên hệ chi nhánh
                </button>
              </div>
            </div>
          </aside>
        </div>
      </main>
    </div>
  );
};

export default BranchDetailPage;
