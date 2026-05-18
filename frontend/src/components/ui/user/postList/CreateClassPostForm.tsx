import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useNavigate } from "react-router-dom";
import { CalendarDays, MapPin, MessageCircle, Users } from "lucide-react";

import {
  FormCreateClassPostSchema,
  type formCreateClassPost,
} from "../../../../schemas/FormCreateClassPostSchema";

import { useAppDispatch, useAppSelector } from "../../../../redux/hook";
import {
  createPost,
  clearLastCreatedPost,
} from "../../../../redux/slices/user/postSlice";
import type { CreatePostRequest } from "../../../../types/post";
import { toast } from "react-toastify";
import LoadingButton from "../../common/LoadingButton";
import { CLASS_INPUT_LEVEL_OPTIONS } from "../../../../utils/constants/postConstant";
import { getAllBranches } from "../../../../redux/slices/user/branchSlice";

type CreateClassPostFormProps = {
  initialValues?: Partial<formCreateClassPost>;
  submitText?: string;
  onSubmitForm?: (data: formCreateClassPost) => Promise<void> | void;
  redirectOnSuccess?: boolean;
};

const inputClass =
  "w-full rounded-2xl border border-slate-200 bg-white px-4 py-3.5 text-[15px] text-slate-800 outline-none transition-all placeholder:text-slate-400 shadow-sm hover:border-sky-200 hover:bg-sky-50/20 focus:border-sky-400 focus:bg-white focus:ring-4 focus:ring-sky-100/70";

const labelClass = "block text-[13px] font-semibold text-slate-600 mb-1.5";

const errorClass = "text-red-500 text-xs font-medium mt-1.5";

const sectionClass =
  "rounded-3xl border border-slate-200/80 bg-white p-4 sm:p-5 space-y-4 shadow-[0_8px_28px_rgba(15,23,42,0.04)]";

const checkboxClass =
  "flex items-center gap-3 rounded-2xl bg-slate-50 border border-slate-200 px-4 py-3 text-sm font-semibold text-slate-700 cursor-pointer hover:bg-sky-50 hover:border-sky-200 transition-all";

const sectionTitleClass = "text-base font-bold text-slate-800";

const pillBaseClass =
  "px-4 py-2 rounded-full border text-sm font-semibold transition-all";

const weekdayOptions = [
  { d: 2, label: "Thứ 2" },
  { d: 3, label: "Thứ 3" },
  { d: 4, label: "Thứ 4" },
  { d: 5, label: "Thứ 5" },
  { d: 6, label: "Thứ 6" },
  { d: 7, label: "Thứ 7" },
  { d: 1, label: "Chủ nhật" },
];

const CreateClassPostForm = ({
  initialValues,
  submitText = "Đăng lớp",
  onSubmitForm,
  redirectOnSuccess = true,
}: CreateClassPostFormProps) => {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();

  const loading = useAppSelector((state) =>
    Boolean(state.ui.loadingMap["post/createPost"]),
  );

  const lastCreatedPost = useAppSelector((state) => state.post.lastCreatedPost);
  const branches = useAppSelector((state) => state.branch.branches);

  const {
    register,
    handleSubmit,
    watch,
    reset,
    setValue,
    formState: { errors },
  } = useForm<formCreateClassPost>({
    resolver: zodResolver(FormCreateClassPostSchema),
    mode: "onChange",
    defaultValues: {
      title: "",
      content: "",
      type: "CLASS",
      formData: {
        inputLevel: "INTERMEDIATE",
        ageRange: "",
        schedule: {
          weekdays: [2, 4, 6],
          startTime: "19:00",
          endTime: "21:00",
          startDate: "",
        },
        location: {
          branchId: 0,
        },
        maxStudents: 10,
        tuitionFee: "",
        contact: {
          inAppChat: true,
          phone: "",
          zalo: "",
        },
        notes: "",
      },
      ...initialValues,
    },
  });

  const weekdays = watch("formData.schedule.weekdays");

  const toggleWeekday = (d: number) => {
    const current = weekdays ?? [];
    const next = current.includes(d)
      ? current.filter((x) => x !== d)
      : [...current, d];

    setValue("formData.schedule.weekdays", next, { shouldValidate: true });
  };

  useEffect(() => {
    dispatch(getAllBranches());
  }, [dispatch]);

  const onSubmit = async (dt: formCreateClassPost) => {
    const data: CreatePostRequest = {
      title: dt.title,
      content: dt.content ?? "",
      type: dt.type,
      formData: dt.formData,
    };

    if (onSubmitForm) {
      await onSubmitForm(dt);
      return;
    }

    try {
      await dispatch(createPost({ data })).unwrap();
    } catch {
      toast.error("Đăng bài thất bại. Vui lòng thử lại.");
    }
  };

  useEffect(() => {
    if (!redirectOnSuccess) return;
    if (lastCreatedPost?.type !== "CLASS") return;

    toast.success("Đăng bài lớp học thành công!");
    reset();

    const timer = setTimeout(() => {
      dispatch(clearLastCreatedPost());
      navigate("/posts", { replace: true });
    }, 500);

    return () => clearTimeout(timer);
  }, [dispatch, lastCreatedPost, navigate, reset, redirectOnSuccess]);

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      <div>
        <label className={labelClass}>Tiêu đề</label>
        <input
          {...register("title")}
          className={inputClass}
          placeholder="Lớp căn bản tối 2–4–6"
        />
        {errors.title && <p className={errorClass}>{errors.title.message}</p>}
      </div>

      <div>
        <label className={labelClass}>Nội dung</label>
        <textarea
          {...register("content")}
          className={`${inputClass} min-h-[120px] resize-none leading-relaxed`}
          placeholder="Nội dung học, mục tiêu, yêu cầu..."
        />
        {errors.content && (
          <p className={errorClass}>{errors.content.message}</p>
        )}
      </div>

      <div className={sectionClass}>
        <div className="flex items-center gap-2">
          <Users size={19} className="text-sky-600" />
          <h3 className={sectionTitleClass}>Thông tin học viên</h3>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className={labelClass}>Trình độ đầu vào</label>
            <select {...register("formData.inputLevel")} className={inputClass}>
              {CLASS_INPUT_LEVEL_OPTIONS.map((o) => (
                <option key={o.value} value={o.value}>
                  {o.label}
                </option>
              ))}
            </select>

            {errors.formData?.inputLevel && (
              <p className={errorClass}>{errors.formData.inputLevel.message}</p>
            )}
          </div>

          <div>
            <label className={labelClass}>Độ tuổi</label>
            <input
              {...register("formData.ageRange")}
              className={inputClass}
              placeholder="VD: 6–25 tuổi"
            />

            {errors.formData?.ageRange && (
              <p className={errorClass}>{errors.formData.ageRange.message}</p>
            )}
          </div>

          <div>
            <label className={labelClass}>Số học viên tối đa</label>
            <input
              type="number"
              {...register("formData.maxStudents", { valueAsNumber: true })}
              className={inputClass}
              placeholder="VD: 10"
            />

            {errors.formData?.maxStudents && (
              <p className={errorClass}>
                {errors.formData.maxStudents.message}
              </p>
            )}
          </div>
        </div>
      </div>

      <div className={sectionClass}>
        <div className="flex items-center gap-2">
          <CalendarDays size={19} className="text-sky-600" />
          <h3 className={sectionTitleClass}>Lịch học</h3>
        </div>

        <div>
          <label className={labelClass}>Các ngày trong tuần</label>
          <div className="flex flex-wrap gap-2">
            {weekdayOptions.map(({ d, label }) => {
              const checked = (weekdays ?? []).includes(d);

              return (
                <button
                  key={d}
                  type="button"
                  onClick={() => toggleWeekday(d)}
                  className={`${pillBaseClass} ${
                    checked
                      ? "bg-sky-50 text-sky-800 border-sky-300 shadow-sm"
                      : "bg-white text-slate-700 border-slate-200 hover:border-sky-200 hover:bg-sky-50 hover:text-sky-700"
                  }`}
                >
                  {label}
                </button>
              );
            })}
          </div>

          {errors.formData?.schedule?.weekdays && (
            <p className={errorClass}>
              {errors.formData.schedule.weekdays.message}
            </p>
          )}
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div>
            <label className={labelClass}>Ngày bắt đầu khóa</label>
            <input
              type="date"
              {...register("formData.schedule.startDate")}
              className={inputClass}
            />

            {errors.formData?.schedule?.startDate && (
              <p className={errorClass}>
                {errors.formData.schedule.startDate.message}
              </p>
            )}
          </div>

          <div>
            <label className={labelClass}>Giờ vào lớp</label>
            <input
              type="time"
              {...register("formData.schedule.startTime")}
              className={inputClass}
            />

            {errors.formData?.schedule?.startTime && (
              <p className={errorClass}>
                {errors.formData.schedule.startTime.message}
              </p>
            )}
          </div>

          <div>
            <label className={labelClass}>Giờ tan lớp</label>
            <input
              type="time"
              {...register("formData.schedule.endTime")}
              className={inputClass}
            />

            {errors.formData?.schedule?.endTime && (
              <p className={errorClass}>
                {errors.formData.schedule.endTime.message}
              </p>
            )}
          </div>
        </div>

        <p className="text-sm text-slate-500 leading-relaxed">
          Khung giờ trên áp dụng cho mỗi buổi vào các thứ đã chọn. Nếu lịch đặc
          biệt, ghi thêm ở phần nội dung hoặc ghi chú.
        </p>
      </div>

      <div className={sectionClass}>
        <div className="flex items-center gap-2">
          <MapPin size={19} className="text-sky-600" />
          <h3 className={sectionTitleClass}>Địa điểm dạy học</h3>
        </div>

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
                {[
                  branch.branchName,
                  branch.address,
                  branch.wardName,
                  branch.districtName,
                  branch.provinceName,
                ]
                  .filter(Boolean)
                  .join(" · ")}
              </option>
            ))}
          </select>

          {errors.formData?.location?.branchId && (
            <p className={errorClass}>
              {errors.formData.location.branchId.message}
            </p>
          )}
        </div>
      </div>

      <div>
        <label className={labelClass}>Học phí</label>
        <textarea
          {...register("formData.tuitionFee")}
          className={`${inputClass} min-h-[100px] resize-none leading-relaxed`}
          placeholder="VD: 2 triệu/khóa, 500k/tháng × 3 tháng, đóng đầu kỳ…"
        />

        {errors.formData?.tuitionFee && (
          <p className={errorClass}>{errors.formData.tuitionFee.message}</p>
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
              {...register("formData.contact.inAppChat")}
              className="h-4 w-4 accent-sky-600"
            />
            Nhận tin nhắn trên website
          </label>

          <div>
            <label className={labelClass}>Số điện thoại</label>
            <input
              {...register("formData.contact.phone")}
              className={inputClass}
              placeholder="Nhập số điện thoại..."
            />
          </div>

          <div>
            <label className={labelClass}>Zalo</label>
            <input
              {...register("formData.contact.zalo")}
              className={inputClass}
              placeholder="Nhập số Zalo..."
            />
          </div>
        </div>
      </div>

      <div>
        <label className={labelClass}>Ghi chú</label>
        <textarea
          {...register("formData.notes")}
          className={`${inputClass} min-h-[100px] resize-none leading-relaxed`}
          placeholder="Thông tin thêm nếu cần…"
        />
      </div>

      <div className="flex justify-end pt-2">
        <LoadingButton loading={loading} type="submit">
          {submitText}
        </LoadingButton>
      </div>
    </form>
  );
};

export default CreateClassPostForm;
