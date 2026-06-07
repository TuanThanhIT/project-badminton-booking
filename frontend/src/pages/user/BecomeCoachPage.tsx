import { useCallback, useEffect, useRef, useState } from "react";
import { Link, Navigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  Award,
  CheckCircle2,
  ClipboardCheck,
  FileImage,
  GraduationCap,
  ImagePlus,
  Loader2,
  Megaphone,
  Send,
  ShieldCheck,
  Users,
  X,
} from "lucide-react";
import { toast } from "react-toastify";
import coachApplicationService from "../../services/user/coachApplicationService";
import { useAppSelector } from "../../redux/hook";
import {
  FormBecomeCoachSchema,
  type FormBecomeCoach,
  type FormBecomeCoachInput,
} from "../../schemas/FormBecomeCoachSchema";
import type {
  CoachApplication,
  CoachApplicationStatus,
} from "../../types/coachApplication";
import { ROLE_NAME } from "../../utils/constants/role";

const inputClass =
  "mt-1.5 w-full rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 text-sm text-slate-800 outline-none transition placeholder:text-slate-400 hover:border-sky-300 focus:border-sky-500 focus:ring-1 focus:ring-sky-100";

const labelClass = "text-sm font-semibold text-slate-700";

const STATUS_META: Record<
  CoachApplicationStatus,
  { title: string; desc: string; badge: string; icon: typeof Loader2 }
> = {
  PENDING: {
    title: "Đang chờ duyệt",
    desc: "Hồ sơ đã được gửi tới admin.",
    badge: "border-amber-200 bg-amber-50 text-amber-800",
    icon: ShieldCheck,
  },
  APPROVED: {
    title: "Đã được duyệt",
    desc: "Tài khoản đã có quyền huấn luyện viên.",
    badge: "border-emerald-200 bg-emerald-50 text-emerald-800",
    icon: CheckCircle2,
  },
  REJECTED: {
    title: "Cần bổ sung hồ sơ",
    desc: "Bạn có thể chỉnh sửa và gửi lại yêu cầu.",
    badge: "border-red-200 bg-red-50 text-red-700",
    icon: FileImage,
  },
};

const coachOnboardingSteps = [
  {
    title: "Gửi hồ sơ HLV",
    desc: "Điền kinh nghiệm, chứng chỉ, giới thiệu bản thân và ảnh minh chứng để admin có đủ thông tin xét duyệt.",
    icon: ClipboardCheck,
  },
  {
    title: "Chờ admin duyệt",
    desc: "Admin kiểm tra hồ sơ. Nếu thiếu thông tin, bạn có thể chỉnh sửa và gửi lại theo lý do từ chối.",
    icon: ShieldCheck,
  },
  {
    title: "Được mở quyền HLV",
    desc: "Khi hồ sơ được duyệt, tài khoản chuyển sang vai trò huấn luyện viên và có thể tạo bài đăng lớp học.",
    icon: CheckCircle2,
  },
  {
    title: "Tạo lớp học",
    desc: "Vào mục đăng bài, chọn loại Lớp học, nhập lịch học, địa điểm, học phí, số lượng học viên và thông tin liên hệ.",
    icon: Megaphone,
  },
  {
    title: "Quản lý học viên",
    desc: "Theo dõi đăng ký, duyệt hoặc từ chối học viên, thêm học viên thủ công, chat nhóm lớp và gửi thông báo.",
    icon: Users,
  },
];

const BecomeCoachPage = () => {
  const user = useAppSelector((state) => state.auth.user);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [application, setApplication] = useState<CoachApplication | null>(null);
  const [loadingApp, setLoadingApp] = useState(true);
  const [certificateImages, setCertificateImages] = useState<string[]>([]);
  const [uploadingImages, setUploadingImages] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<FormBecomeCoachInput, unknown, FormBecomeCoach>({
    resolver: zodResolver(FormBecomeCoachSchema),
    defaultValues: {
      experienceYears: 0,
      certificate: "",
      introduction: "",
      phoneContact: "",
    },
  });

  const fetchApplication = useCallback(async () => {
    setLoadingApp(true);
    try {
      const res = await coachApplicationService.getMyApplicationService();
      const data = res.data.data;
      setApplication(data);
      if (data?.status === "REJECTED") {
        reset({
          experienceYears: data.experienceYears,
          certificate: data.certificate || "",
          introduction: data.introduction || "",
          phoneContact: data.phoneContact || "",
        });
        setCertificateImages(data.certificateImages || []);
      }
    } catch (err: any) {
      toast.error(
        err?.response?.data?.message || "Không thể tải trạng thái hồ sơ",
      );
    } finally {
      setLoadingApp(false);
    }
  }, [reset]);

  useEffect(() => {
    fetchApplication();
  }, [fetchApplication]);

  if (user?.role === ROLE_NAME.COACH) {
    return <Navigate to="/profile" replace />;
  }

  if (user?.role !== ROLE_NAME.USER) {
    return (
      <div className="min-h-screen bg-slate-50 px-4 py-16 text-center">
        <p className="text-slate-600">
          Chỉ tài khoản User mới có thể gửi hồ sơ huấn luyện viên.
        </p>
        <Link
          to="/profile"
          className="mt-4 inline-flex text-sm font-semibold text-sky-700 hover:underline"
        >
          Về hồ sơ
        </Link>
      </div>
    );
  }

  const showForm = !application || application.status === "REJECTED";
  const statusMeta = application ? STATUS_META[application.status] : null;
  const StatusIcon = statusMeta?.icon || ShieldCheck;

  const handleImagePick = async (
    event: React.ChangeEvent<HTMLInputElement>,
  ) => {
    const files = Array.from(event.target.files || []);
    if (!files.length) return;
    if (certificateImages.length + files.length > 5) {
      toast.error("Tối đa 5 ảnh chứng chỉ");
      return;
    }

    setUploadingImages(true);
    try {
      const res =
        await coachApplicationService.uploadCertificateImagesService(files);
      const urls = res.data.data?.urls || [];
      setCertificateImages((prev) => [...prev, ...urls].slice(0, 5));
      toast.success("Đã tải ảnh chứng chỉ");
    } catch (err: any) {
      toast.error(err?.response?.data?.message || "Không thể tải ảnh");
    } finally {
      setUploadingImages(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  const onSubmit = async (values: FormBecomeCoach) => {
    setSubmitting(true);
    try {
      const res = await coachApplicationService.submitApplicationService({
        experienceYears: values.experienceYears,
        certificate: values.certificate,
        introduction: values.introduction,
        phoneContact: values.phoneContact || undefined,
        certificateImages,
      });
      setApplication(res.data.data);
      toast.success("Đã gửi hồ sơ huấn luyện viên");
    } catch (err: any) {
      toast.error(err?.response?.data?.message || "Không thể gửi hồ sơ");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-700">
      <section className="bg-[#0b3f56] text-white">
        <div className="mx-auto max-w-7xl px-4 pb-28 pt-14 sm:px-6 lg:pt-16">
          <div className="grid gap-8 lg:grid-cols-[1fr_auto] lg:items-center">
            <div className="max-w-3xl">
              <div className="mb-8 inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/10 px-4 py-2 text-sm font-semibold text-sky-100">
                <GraduationCap size={16} className="text-sky-200" />
                Hồ sơ huấn luyện viên
              </div>
              <h1 className="text-4xl font-bold leading-tight sm:text-5xl">
                Đăng ký làm huấn luyện viên
              </h1>
              <p className="mt-5 max-w-2xl text-lg leading-8 text-sky-50">
                Hoàn thiện hồ sơ chuyên môn để mở quyền tạo và quản lý lớp học
                trên B-Hub.
              <p className="mt-3 max-w-2xl text-sm leading-6 text-sky-100">
                Quy trình: gửi hồ sơ HLV, chờ admin duyệt, sau khi được duyệt bạn vào mục đăng bài để tạo bài loại Lớp học và quản lý học viên trong khu vực huấn luyện viên.
              </p>
              </p>
            </div>

            <div className="grid grid-cols-2 gap-3 sm:min-w-[360px]">
              {[
                { icon: Award, value: "5 ảnh", label: "Chứng chỉ tối đa" },
                { icon: ShieldCheck, value: "Admin", label: "Duyệt hồ sơ" },
              ].map((item) => (
                <div
                  key={item.label}
                  className="rounded-2xl border border-white/10 bg-white/10 px-5 py-4"
                >
                  <item.icon size={18} className="text-sky-200" />
                  <p className="mt-4 text-2xl font-bold leading-none">
                    {item.value}
                  </p>
                  <p className="mt-2 text-sm text-sky-100">{item.label}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      <main className="relative z-10 mx-auto -mt-16 max-w-7xl px-4 pb-12 sm:px-6">
        <section className="mb-6 overflow-hidden rounded-[2rem] border border-slate-200 bg-white shadow-sm">
          <div className="border-b border-slate-100 p-5 sm:p-6">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
              <div>
                <p className="text-sm font-semibold uppercase tracking-wide text-sky-700">
                  Quy trình đăng ký và mở lớp
                </p>
                <h2 className="mt-1 text-xl font-bold text-slate-950">
                  Từ hồ sơ HLV đến lớp học đầu tiên
                </h2>
                <p className="mt-2 max-w-3xl text-sm leading-6 text-slate-600">
                  Người dùng gửi hồ sơ để trở thành HLV. Sau khi admin duyệt, HLV tạo bài đăng loại Lớp học, nhận đăng ký của học viên và quản lý lớp trong khu vực huấn luyện viên.
                </p>
              </div>
              <Link
                to="/create-post?type=CLASS"
                className="inline-flex h-10 w-fit items-center justify-center rounded-xl border border-sky-200 bg-sky-50 px-4 text-sm font-semibold text-sky-700 transition hover:bg-sky-100"
              >
                Tạo lớp sau khi được duyệt
              </Link>
            </div>
          </div>

          <div className="grid gap-3 bg-slate-50/70 p-4 sm:grid-cols-2 sm:p-5 lg:grid-cols-5">
            {coachOnboardingSteps.map((step, index) => {
              const Icon = step.icon;
              return (
                <article
                  key={step.title}
                  className="rounded-2xl border border-slate-200 bg-white p-4"
                >
                  <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-sky-50 text-sky-600">
                      <Icon className="h-5 w-5" />
                    </div>
                    <span className="rounded-full bg-slate-100 px-2 py-0.5 text-xs font-bold text-slate-500">
                      {index + 1}
                    </span>
                  </div>
                  <h3 className="mt-4 text-sm font-bold text-slate-950">
                    {step.title}
                  </h3>
                  <p className="mt-2 text-sm leading-6 text-slate-600">
                    {step.desc}
                  </p>
                </article>
              );
            })}
          </div>
        </section>

        <section className="overflow-hidden rounded-[2rem] border border-slate-200 bg-white shadow-sm">
          {loadingApp ? (
            <div className="flex min-h-[420px] items-center justify-center text-slate-500">
              <Loader2 className="mr-2 h-5 w-5 animate-spin text-sky-600" />
              Đang tải...
            </div>
          ) : (
            <div className="grid lg:grid-cols-[minmax(0,1fr)_340px]">
              <div className="p-5 sm:p-6">
                {application && statusMeta ? (
                  <div
                    className={`mb-5 rounded-2xl border p-4 ${statusMeta.badge}`}
                  >
                    <div className="flex gap-3">
                      <StatusIcon className="mt-0.5 h-5 w-5 shrink-0" />
                      <div>
                        <p className="font-semibold">{statusMeta.title}</p>
                        <p className="mt-1 text-sm opacity-90">
                          {statusMeta.desc}
                        </p>
                        {application.status === "PENDING" ? (
                          <p className="mt-2 text-xs opacity-75">
                            Gửi lúc{" "}
                            {new Date(application.createdAt).toLocaleString(
                              "vi-VN",
                            )}
                          </p>
                        ) : null}
                        {application.status === "REJECTED" &&
                        application.rejectReason ? (
                          <p className="mt-2 text-sm">
                            Lý do: {application.rejectReason}
                          </p>
                        ) : null}
                      </div>
                    </div>
                  </div>
                ) : null}

                {showForm ? (
                  <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
                    <div className="grid gap-4 sm:grid-cols-2">
                      <div>
                        <label className={labelClass}>
                          Số năm kinh nghiệm *
                        </label>
                        <input
                          type="number"
                          min={0}
                          max={50}
                          {...register("experienceYears")}
                          className={inputClass}
                        />
                        {errors.experienceYears ? (
                          <p className="mt-1 text-xs text-red-600">
                            {errors.experienceYears.message}
                          </p>
                        ) : null}
                      </div>

                      <div>
                        <label className={labelClass}>SĐT / Zalo liên hệ</label>
                        <input
                          {...register("phoneContact")}
                          placeholder="0912345678"
                          className={inputClass}
                        />
                        {errors.phoneContact ? (
                          <p className="mt-1 text-xs text-red-600">
                            {errors.phoneContact.message}
                          </p>
                        ) : null}
                      </div>
                    </div>

                    <div>
                      <label className={labelClass}>
                        Chứng chỉ / bằng cấp *
                      </label>
                      <input
                        {...register("certificate")}
                        placeholder="VD: Chứng chỉ huấn luyện cầu lông cấp cơ sở"
                        className={inputClass}
                      />
                      {errors.certificate ? (
                        <p className="mt-1 text-xs text-red-600">
                          {errors.certificate.message}
                        </p>
                      ) : null}
                    </div>

                    <div>
                      <label className={labelClass}>
                        Giới thiệu bản thân *
                      </label>
                      <textarea
                        rows={5}
                        {...register("introduction")}
                        placeholder="Kinh nghiệm huấn luyện, phong cách dạy, thành tích..."
                        className={inputClass}
                      />
                      {errors.introduction ? (
                        <p className="mt-1 text-xs text-red-600">
                          {errors.introduction.message}
                        </p>
                      ) : null}
                    </div>

                    <div>
                      <div className="flex items-center justify-between gap-3">
                        <label className={labelClass}>Ảnh chứng chỉ</label>
                        <span className="text-xs text-slate-500">
                          {certificateImages.length}/5 ảnh
                        </span>
                      </div>

                      <div className="mt-3 grid grid-cols-3 gap-3 sm:grid-cols-5">
                        {certificateImages.map((url) => (
                          <div
                            key={url}
                            className="relative aspect-square overflow-hidden rounded-2xl border border-slate-200 bg-slate-50"
                          >
                            <img
                              src={url}
                              alt=""
                              className="h-full w-full object-cover"
                            />
                            <button
                              type="button"
                              onClick={() =>
                                setCertificateImages((prev) =>
                                  prev.filter((item) => item !== url),
                                )
                              }
                              className="absolute right-1 top-1 rounded-full bg-slate-950/60 p-1 text-white transition hover:bg-slate-950/80"
                            >
                              <X className="h-3 w-3" />
                            </button>
                          </div>
                        ))}

                        {certificateImages.length < 5 ? (
                          <button
                            type="button"
                            disabled={uploadingImages}
                            onClick={() => fileInputRef.current?.click()}
                            className="flex aspect-square flex-col items-center justify-center rounded-2xl border border-dashed border-slate-300 bg-slate-50 text-slate-500 transition hover:border-sky-400 hover:bg-sky-50 hover:text-sky-700 disabled:opacity-60"
                          >
                            {uploadingImages ? (
                              <Loader2 className="h-5 w-5 animate-spin" />
                            ) : (
                              <>
                                <ImagePlus className="h-5 w-5" />
                                <span className="mt-1 text-xs font-medium">
                                  Thêm ảnh
                                </span>
                              </>
                            )}
                          </button>
                        ) : null}
                      </div>

                      <input
                        ref={fileInputRef}
                        type="file"
                        accept="image/*"
                        multiple
                        className="hidden"
                        onChange={handleImagePick}
                      />
                    </div>

                    <button
                      type="submit"
                      disabled={submitting}
                      className="inline-flex h-11 w-full items-center justify-center gap-2 rounded-xl bg-sky-600 px-4 text-sm font-semibold text-white transition hover:bg-sky-700 disabled:opacity-50"
                    >
                      {submitting ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : (
                        <Send className="h-4 w-4" />
                      )}
                      Gửi hồ sơ
                    </button>
                  </form>
                ) : null}

                {application?.status === "APPROVED" ? (
                  <Link
                    to="/profile"
                    className="inline-flex h-11 items-center gap-2 rounded-xl border border-sky-200 bg-sky-50 px-4 text-sm font-semibold text-sky-700 transition hover:bg-sky-100"
                  >
                    <GraduationCap className="h-4 w-4" />
                    Về hồ sơ
                  </Link>
                ) : null}
              </div>

              <aside className="border-t border-slate-200 bg-slate-50 p-5 sm:p-6 lg:border-l lg:border-t-0">
                <p className="text-sm font-bold text-slate-950">Hồ sơ gồm</p>
                <div className="mt-5 space-y-4">
                  {[
                    "Kinh nghiệm dạy",
                    "Chứng chỉ hoặc bằng cấp",
                    "Giới thiệu chuyên môn",
                    "Ảnh minh chứng",
                  ].map((item, index) => (
                    <div
                      key={item}
                      className="flex items-center gap-3 text-sm text-slate-700"
                    >
                      <span className="flex h-8 w-8 items-center justify-center rounded-full bg-sky-100 text-xs font-bold text-sky-700">
                        {index + 1}
                      </span>
                      <span className="font-medium">{item}</span>
                    </div>
                  ))}
                </div>

                <div className="mt-6 rounded-2xl border border-sky-100 bg-white p-4">
                  <p className="text-sm font-bold text-slate-950">
                    Sau khi được duyệt
                  </p>
                  <div className="mt-3 space-y-3 text-sm leading-6 text-slate-600">
                    <p>
                      1. Vào Đăng bài và chọn loại Lớp học.
                    </p>
                    <p>
                      2. Nhập lịch học, chi nhánh, học phí, số lượng học viên và cách liên hệ.
                    </p>
                    <p>
                      3. Theo dõi lớp tại Khu vực huấn luyện viên để duyệt học viên, nhắn tin và gửi thông báo.
                    </p>
                  </div>
                </div>
              </aside>
            </div>
          )}
        </section>
      </main>
    </div>
  );
};

export default BecomeCoachPage;
