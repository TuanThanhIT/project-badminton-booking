import { useCallback, useEffect, useRef, useState } from "react";
import { Link, Navigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  GraduationCap,
  ImagePlus,
  Loader2,
  Send,
  X,
} from "lucide-react";
import { toast } from "react-toastify";
import { useAppSelector } from "../../redux/hook";
import { ROLE_NAME } from "../../utils/constants/role";
import coachApplicationService from "../../services/user/coachApplicationService";
import type { CoachApplication } from "../../types/coachApplication";
import {
  FormBecomeCoachSchema,
  type FormBecomeCoach,
} from "../../schemas/FormBecomeCoachSchema";

const inputClass =
  "mt-1.5 w-full rounded-2xl border border-slate-300 bg-white px-4 py-3 text-sm text-slate-800 outline-none transition focus:border-sky-500 focus:ring-1 focus:ring-sky-100";

const STATUS_META = {
  PENDING: {
    title: "Đang chờ duyệt",
    desc: "Yêu cầu của bạn đã được gửi tới admin. Vui lòng chờ phản hồi.",
    badge: "bg-amber-50 text-amber-800 border-amber-200",
  },
  APPROVED: {
    title: "Đã được duyệt",
    desc: "Chúc mừng! Hãy đăng xuất và đăng nhập lại để sử dụng tính năng dạy cầu lông.",
    badge: "bg-emerald-50 text-emerald-800 border-emerald-200",
  },
  REJECTED: {
    title: "Bị từ chối",
    desc: "Bạn có thể chỉnh sửa hồ sơ và gửi lại yêu cầu.",
    badge: "bg-red-50 text-red-700 border-red-200",
  },
} as const;

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
  } = useForm<FormBecomeCoach>({
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
      if (data && data.status === "REJECTED") {
        reset({
          experienceYears: data.experienceYears,
          certificate: data.certificate || "",
          introduction: data.introduction || "",
          phoneContact: data.phoneContact || "",
        });
        setCertificateImages(data.certificateImages || []);
      }
    } catch {
      toast.error("Không thể tải trạng thái yêu cầu");
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
      <div className="mx-auto max-w-lg px-4 py-16 text-center">
        <p className="text-slate-600">Chỉ tài khoản User mới gửi yêu cầu dạy cầu lông.</p>
        <Link to="/profile" className="mt-4 inline-block text-sky-600 hover:underline">
          Về hồ sơ
        </Link>
      </div>
    );
  }

  const showForm =
    !application ||
    application.status === "REJECTED";

  const handleImagePick = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (!files.length) return;
    if (certificateImages.length + files.length > 5) {
      toast.error("Tối đa 5 ảnh chứng chỉ");
      return;
    }
    setUploadingImages(true);
    try {
      const res = await coachApplicationService.uploadCertificateImagesService(files);
      const urls = res.data.data?.urls || [];
      setCertificateImages((prev) => [...prev, ...urls].slice(0, 5));
      toast.success("Đã tải ảnh chứng chỉ");
    } catch (err: any) {
      toast.error(err?.message || "Không thể tải ảnh");
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
      toast.success("Đã gửi yêu cầu đăng ký dạy cầu lông");
    } catch (err: any) {
      toast.error(err?.message || "Không thể gửi yêu cầu");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 pb-16">
      <section className="border-b border-slate-200 bg-white">
        <div className="mx-auto max-w-3xl px-4 py-8 sm:px-6">
          <p className="text-sm font-semibold uppercase tracking-wide text-sky-600">
            Dạy cầu lông
          </p>
          <h1 className="mt-1 text-2xl font-extrabold text-slate-900">
            Đăng ký dạy cầu lông
          </h1>
          <p className="mt-2 text-sm leading-6 text-slate-600">
            Gửi hồ sơ để admin xem xét và cấp quyền dạy cầu lông trên B-Hub.
          </p>
        </div>
      </section>

      <main className="mx-auto max-w-3xl space-y-6 px-4 py-8 sm:px-6">
        {loadingApp ? (
          <div className="flex items-center justify-center py-16 text-slate-500">
            <Loader2 className="mr-2 h-5 w-5 animate-spin" />
            Đang tải...
          </div>
        ) : (
          <>
            {application && application.status !== "REJECTED" && (
              <div
                className={`rounded-2xl border p-5 ${STATUS_META[application.status].badge}`}
              >
                <p className="font-semibold">{STATUS_META[application.status].title}</p>
                <p className="mt-1 text-sm opacity-90">
                  {STATUS_META[application.status].desc}
                </p>
                {application.status === "PENDING" && (
                  <p className="mt-2 text-xs opacity-75">
                    Gửi lúc{" "}
                    {new Date(application.createdDate).toLocaleString("vi-VN")}
                  </p>
                )}
              </div>
            )}

            {application?.status === "REJECTED" && (
              <div className={`rounded-2xl border p-5 ${STATUS_META.REJECTED.badge}`}>
                <p className="font-semibold">{STATUS_META.REJECTED.title}</p>
                {application.rejectReason && (
                  <p className="mt-1 text-sm">
                    Lý do: {application.rejectReason}
                  </p>
                )}
                <p className="mt-2 text-sm opacity-90">{STATUS_META.REJECTED.desc}</p>
              </div>
            )}

            {showForm && (
              <form
                onSubmit={handleSubmit(onSubmit)}
                className="space-y-5 rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm"
              >
                <div>
                  <label className="text-sm font-medium text-slate-700">
                    Số năm kinh nghiệm *
                  </label>
                  <input
                    type="number"
                    min={0}
                    max={50}
                    {...register("experienceYears")}
                    className={inputClass}
                  />
                  {errors.experienceYears && (
                    <p className="mt-1 text-xs text-red-600">
                      {errors.experienceYears.message}
                    </p>
                  )}
                </div>

                <div>
                  <label className="text-sm font-medium text-slate-700">
                    Chứng chỉ / bằng cấp *
                  </label>
                  <input
                    {...register("certificate")}
                    placeholder="VD: Chứng chỉ dạy cầu lông cấp cơ sở..."
                    className={inputClass}
                  />
                  {errors.certificate && (
                    <p className="mt-1 text-xs text-red-600">
                      {errors.certificate.message}
                    </p>
                  )}
                </div>

                <div>
                  <label className="text-sm font-medium text-slate-700">
                    Giới thiệu bản thân *
                  </label>
                  <textarea
                    rows={5}
                    {...register("introduction")}
                    placeholder="Kinh nghiệm huấn luyện, phong cách dạy, thành tích..."
                    className={inputClass}
                  />
                  {errors.introduction && (
                    <p className="mt-1 text-xs text-red-600">
                      {errors.introduction.message}
                    </p>
                  )}
                </div>

                <div>
                  <label className="text-sm font-medium text-slate-700">
                    SĐT / Zalo liên hệ
                  </label>
                  <input
                    {...register("phoneContact")}
                    placeholder="0912345678"
                    className={inputClass}
                  />
                </div>

                <div>
                  <label className="text-sm font-medium text-slate-700">
                    Ảnh chứng chỉ (tối đa 5)
                  </label>
                  <div className="mt-2 flex flex-wrap gap-3">
                    {certificateImages.map((url) => (
                      <div
                        key={url}
                        className="relative h-20 w-20 overflow-hidden rounded-xl border border-slate-200"
                      >
                        <img src={url} alt="" className="h-full w-full object-cover" />
                        <button
                          type="button"
                          onClick={() =>
                            setCertificateImages((prev) =>
                              prev.filter((item) => item !== url),
                            )
                          }
                          className="absolute right-0.5 top-0.5 rounded-full bg-black/50 p-0.5 text-white"
                        >
                          <X className="h-3 w-3" />
                        </button>
                      </div>
                    ))}
                    {certificateImages.length < 5 && (
                      <button
                        type="button"
                        disabled={uploadingImages}
                        onClick={() => fileInputRef.current?.click()}
                        className="flex h-20 w-20 flex-col items-center justify-center rounded-xl border border-dashed border-slate-300 text-slate-500 hover:border-sky-400 hover:text-sky-600"
                      >
                        {uploadingImages ? (
                          <Loader2 className="h-5 w-5 animate-spin" />
                        ) : (
                          <>
                            <ImagePlus className="h-5 w-5" />
                            <span className="mt-1 text-[10px]">Thêm ảnh</span>
                          </>
                        )}
                      </button>
                    )}
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
                  className="inline-flex w-full items-center justify-center gap-2 rounded-2xl bg-sky-600 px-4 py-3 text-sm font-semibold text-white hover:bg-sky-700 disabled:opacity-50"
                >
                  {submitting ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <Send className="h-4 w-4" />
                  )}
                  Gửi yêu cầu
                </button>
              </form>
            )}

            {application?.status === "APPROVED" && (
              <Link
                to="/profile"
                className="inline-flex items-center gap-2 rounded-2xl border border-sky-200 bg-sky-50 px-4 py-3 text-sm font-semibold text-sky-700 hover:bg-sky-100"
              >
                <GraduationCap className="h-4 w-4" />
                Về hồ sơ
              </Link>
            )}
          </>
        )}
      </main>
    </div>
  );
};

export default BecomeCoachPage;
