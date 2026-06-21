import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import {
  CalendarDays,
  MapPin,
  MessageCircle,
  Trophy,
  Users,
} from "lucide-react";
import { useAppDispatch, useAppSelector } from "../../../../redux/hook";
import {
  createPost,
  clearLastCreatedPost,
} from "../../../../redux/slices/user/postSlice";

import { getAllCourts } from "../../../../redux/slices/user/courtSlice";
import type { CreatePostRequest } from "../../../../types/post";
import LoadingButton from "../../common/LoadingButton";
import {
  FormCreateTournamentPostSchema,
  type FormCreateTournamentPost,
} from "../../../../schemas/FormCreateTournamentPostSchema";
import { TOURNAMENT_CATEGORY_OPTIONS } from "../../../../utils/constants/postConstant";
import { getBranchOptions } from "../../../../redux/slices/user/branchSlice";

type CreateTournamentPostFormProps = {
  initialValues?: Partial<FormCreateTournamentPost>;
  submitText?: string;
  onSubmitForm?: (data: FormCreateTournamentPost) => Promise<void> | void;
  redirectOnSuccess?: boolean;
};

const inputClass =
  "w-full rounded-xl border border-slate-200/90 bg-white px-3.5 py-2.5 text-sm text-slate-800 outline-none transition-colors placeholder:text-slate-400 hover:border-slate-300 focus:border-sky-400 focus:ring-2 focus:ring-sky-100/70";

const labelClass = "block text-[13px] font-medium text-slate-600 mb-1.5";

const errorClass = "text-red-500 text-xs font-medium mt-1.5";

const sectionClass =
  "rounded-3xl border border-slate-200/80 bg-white p-4 sm:p-5 space-y-4 shadow-[0_8px_28px_rgba(15,23,42,0.04)]";

const checkboxClass =
  "flex items-center gap-3 rounded-2xl bg-slate-50 border border-slate-200 px-4 py-3 text-sm font-semibold text-slate-700 cursor-pointer hover:bg-sky-50 hover:border-sky-200 transition-all";

const sectionTitleClass = "text-base font-semibold text-slate-800";

const pillBaseClass =
  "px-4 py-2 rounded-full border text-sm font-semibold transition-all";

const CreateTournamentPostForm = ({
  initialValues,
  submitText = "Đăng bài",
  onSubmitForm,
  redirectOnSuccess = true,
}: CreateTournamentPostFormProps) => {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();

  const loading = useAppSelector((state) =>
    Boolean(state.ui.loadingMap["post/createPost"]),
  );

  const lastCreatedPost = useAppSelector((state) => state.post.lastCreatedPost);
  const branches = useAppSelector((state) => state.branch.branchOptions);
  const courts = useAppSelector((state) => state.court.courts);

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    reset,
    formState: { errors },
  } = useForm<FormCreateTournamentPost>({
    resolver: zodResolver(FormCreateTournamentPostSchema),
    mode: "onChange",
    defaultValues: {
      title: "",
      content: "",
      type: "TOURNAMENT",
      formData: {
        organizerName: "",
        location: {
          branchId: 0,
          courtId: 0,
        },
        registration: {
          startDate: "",
          endDate: "",
        },
        eventDate: "",
        categories: [],
        contact: {
          phone: "",
          email: "",
          inApp: true,
        },
      },
      ...initialValues,
    },
  });

  const selectedBranchId = watch("formData.location.branchId");
  const selectedCategories = watch("formData.categories") ?? [];

  const courtsByBranch = courts.filter(
    (court) => court.branchId === selectedBranchId,
  );

  const toggleCategory = (value: string) => {
    const current = selectedCategories;
    const next = current.includes(value)
      ? current.filter((c) => c !== value)
      : [...current, value];

    setValue("formData.categories", next, { shouldValidate: true });
  };

  useEffect(() => {
    dispatch(getBranchOptions());
    dispatch(getAllCourts());
  }, [dispatch]);

  useEffect(() => {
    setValue("formData.location.courtId", 0, { shouldValidate: true });
  }, [selectedBranchId, setValue]);

  useEffect(() => {
    if (!redirectOnSuccess) return;
    if (lastCreatedPost?.type !== "TOURNAMENT") return;

    toast.success("Đăng bài giải đấu thành công!");
    reset();

    const timer = setTimeout(() => {
      dispatch(clearLastCreatedPost());
      navigate("/posts", { replace: true });
    }, 500);

    return () => clearTimeout(timer);
  }, [dispatch, lastCreatedPost, navigate, reset, redirectOnSuccess]);

  const onSubmit = async (formValue: FormCreateTournamentPost) => {
    const data: CreatePostRequest = {
      title: formValue.title,
      content: formValue.content,
      type: formValue.type,
      formData: formValue.formData,
    };

    if (onSubmitForm) {
      await onSubmitForm(formValue);
      return;
    }

    try {
      await dispatch(createPost({ data })).unwrap();
    } catch {
      toast.error("Đăng bài thất bại. Vui lòng thử lại.");
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      <div>
        <label className={labelClass}>Tiêu đề</label>
        <input
          {...register("title")}
          className={inputClass}
          placeholder="Giải phong trào Thủ Đức Open 2026"
        />

        {errors.title && <p className={errorClass}>{errors.title.message}</p>}
      </div>

      <div>
        <label className={labelClass}>Nội dung</label>
        <textarea
          {...register("content")}
          className={`${inputClass} min-h-[104px] resize-none leading-relaxed`}
          placeholder="Thể lệ, hạng mục, phí đăng ký..."
        />

        {errors.content && (
          <p className={errorClass}>{errors.content.message}</p>
        )}
      </div>

      <div className={sectionClass}>
        <div className="flex items-center gap-2">
          <Trophy size={19} className="text-sky-600" />
          <h3 className={sectionTitleClass}>Thông tin giải đấu</h3>
        </div>

        <div>
          <label className={labelClass}>Ban tổ chức</label>
          <input
            {...register("formData.organizerName")}
            className={inputClass}
            placeholder="Tên đơn vị tổ chức"
          />

          {errors.formData?.organizerName && (
            <p className={errorClass}>
              {errors.formData.organizerName.message}
            </p>
          )}
        </div>
      </div>

      <div className={sectionClass}>
        <div className="flex items-center gap-2">
          <MapPin size={19} className="text-sky-600" />
          <h3 className={sectionTitleClass}>Địa điểm tổ chức</h3>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className={labelClass}>Chi nhánh</label>
            <select
              {...register("formData.location.branchId", {
                valueAsNumber: true,
              })}
              className={inputClass}
            >
              <option value={0}>-- Chọn chi nhánh --</option>
              {branches.map((branch) => (
                <option key={branch.id} value={branch.id}>
                  {branch.branchName}
                </option>
              ))}
            </select>

            {errors.formData?.location?.branchId && (
              <p className={errorClass}>
                {errors.formData.location.branchId.message}
              </p>
            )}
          </div>

          <div>
            <label className={labelClass}>Sân</label>
            <select
              {...register("formData.location.courtId", {
                valueAsNumber: true,
              })}
              className={inputClass}
            >
              <option value={0}>-- Chọn sân --</option>
              {courtsByBranch.map((court) => (
                <option key={court.id} value={court.id}>
                  {court.courtName}
                </option>
              ))}
            </select>

            {errors.formData?.location?.courtId && (
              <p className={errorClass}>
                {errors.formData.location.courtId.message}
              </p>
            )}
          </div>
        </div>
      </div>

      <div className={sectionClass}>
        <div className="flex items-center gap-2">
          <CalendarDays size={19} className="text-sky-600" />
          <h3 className={sectionTitleClass}>Thời gian giải đấu</h3>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div>
            <label className={labelClass}>Mở đăng ký</label>
            <input
              type="date"
              {...register("formData.registration.startDate")}
              className={inputClass}
            />

            {errors.formData?.registration?.startDate && (
              <p className={errorClass}>
                {errors.formData.registration.startDate.message}
              </p>
            )}
          </div>

          <div>
            <label className={labelClass}>Kết thúc đăng ký</label>
            <input
              type="date"
              {...register("formData.registration.endDate")}
              className={inputClass}
            />

            {errors.formData?.registration?.endDate && (
              <p className={errorClass}>
                {errors.formData.registration.endDate.message}
              </p>
            )}
          </div>

          <div>
            <label className={labelClass}>Ngày diễn ra giải</label>
            <input
              type="date"
              {...register("formData.eventDate")}
              className={inputClass}
            />

            {errors.formData?.eventDate && (
              <p className={errorClass}>{errors.formData.eventDate.message}</p>
            )}
          </div>
        </div>
      </div>

      <div className={sectionClass}>
        <div className="flex items-center gap-2">
          <Users size={19} className="text-sky-600" />
          <h3 className={sectionTitleClass}>Hạng mục thi đấu</h3>
        </div>

        <p className="text-sm text-slate-500 leading-relaxed">
          Tích chọn các hạng mục tổ chức, có thể chọn nhiều hạng mục.
        </p>

        <div className="flex flex-wrap gap-2">
          {TOURNAMENT_CATEGORY_OPTIONS.map((opt) => {
            const checked = selectedCategories.includes(opt.value);

            return (
              <button
                key={opt.value}
                type="button"
                onClick={() => toggleCategory(opt.value)}
                className={`${pillBaseClass} ${
                  checked
                    ? "bg-sky-50 text-sky-800 border-sky-300 shadow-sm"
                    : "bg-white text-slate-700 border-slate-200 hover:border-sky-200 hover:bg-sky-50 hover:text-sky-700"
                }`}
              >
                {opt.label}
              </button>
            );
          })}
        </div>

        {errors.formData?.categories && (
          <p className={errorClass}>{errors.formData.categories.message}</p>
        )}
      </div>

      <div className={sectionClass}>
        <div className="flex items-center gap-2">
          <MessageCircle size={19} className="text-sky-600" />
          <h3 className={sectionTitleClass}>Thông tin liên hệ</h3>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <label className={checkboxClass}>
            <input
              type="checkbox"
              {...register("formData.contact.inApp")}
              className="h-4 w-4 accent-sky-600"
            />
            Nhận tin nhắn trên website
          </label>

          <div>
            <label className={labelClass}>Số điện thoại</label>
            <input
              {...register("formData.contact.phone")}
              className={inputClass}
              placeholder="0901234567"
            />

            {errors.formData?.contact?.phone && (
              <p className={errorClass}>
                {errors.formData.contact.phone.message}
              </p>
            )}
          </div>

          <div>
            <label className={labelClass}>Email</label>
            <input
              {...register("formData.contact.email")}
              className={inputClass}
              placeholder="abc@example.com"
            />

            {errors.formData?.contact?.email && (
              <p className={errorClass}>
                {errors.formData.contact.email.message}
              </p>
            )}
          </div>
        </div>
      </div>

      <div className="flex justify-end pt-2">
        <LoadingButton loading={loading} type="submit">
          {submitText}
        </LoadingButton>
      </div>
    </form>
  );
};

export default CreateTournamentPostForm;
