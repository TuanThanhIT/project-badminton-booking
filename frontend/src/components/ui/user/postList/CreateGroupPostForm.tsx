import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import { CalendarDays, MapPin, MessageCircle, Users } from "lucide-react";
import { useAppDispatch, useAppSelector } from "../../../../redux/hook";
import {
  createPost,
  clearLastCreatedPost,
} from "../../../../redux/slices/user/postSlice";
import type { CreatePostRequest, GroupFormData } from "../../../../types/post";
import LoadingButton from "../../common/LoadingButton";
import {
  FormCreateGroupPostSchema,
  type FormCreateGroupPost,
} from "../../../../schemas/FormCreateGroupPostSchema";
import { GROUP_LEVEL_OPTIONS } from "../../../../utils/constants/postConstant";

const weekdayOptions = [
  { d: 2, label: "Thứ 2" },
  { d: 3, label: "Thứ 3" },
  { d: 4, label: "Thứ 4" },
  { d: 5, label: "Thứ 5" },
  { d: 6, label: "Thứ 6" },
  { d: 7, label: "Thứ 7" },
  { d: 1, label: "Chủ nhật" },
];

type CreateGroupPostFormProps = {
  initialValues?: Partial<FormCreateGroupPost>;
  submitText?: string;
  onSubmitForm?: (data: FormCreateGroupPost) => Promise<void> | void;
  redirectOnSuccess?: boolean;
};

const inputClass =
  "w-full rounded-2xl border border-slate-200 bg-white px-4 py-3.5 text-[15px] text-slate-800 outline-none transition-all placeholder:text-slate-400 shadow-sm hover:border-sky-200 hover:bg-sky-50/20 focus:border-sky-400 focus:bg-white focus:ring-1 focus:ring-sky-100/70";

const labelClass = "block text-[13px] font-medium text-slate-600 mb-1.5";

const errorClass = "text-red-500 text-xs font-medium mt-1.5";

const sectionClass =
  "rounded-3xl border border-slate-200/80 bg-white p-4 sm:p-5 space-y-4 shadow-[0_8px_28px_rgba(15,23,42,0.04)]";

const checkboxClass =
  "flex items-center gap-3 rounded-2xl bg-slate-50 border border-slate-200 px-4 py-3 text-sm font-semibold text-slate-700 cursor-pointer hover:bg-sky-50 hover:border-sky-200 transition-all";

const sectionTitleClass = "text-base font-semibold text-slate-800";

const pillBaseClass =
  "px-4 py-2 rounded-full border text-sm font-semibold transition-all";

const mapGroupLevelToPostFormDataLevel = (
  level: FormCreateGroupPost["formData"]["levelWanted"],
): GroupFormData["levelWanted"] => {
  switch (level) {
    case "BEGINNER":
    case "RECREATIONAL":
      return "Mới chơi";
    case "INTERMEDIATE":
      return "Trung bình";
    case "ADVANCED":
    case "COMPETITIVE":
      return "Cao";
    default:
      return "Trung bình";
  }
};

const CreateGroupPostForm = ({
  initialValues,
  submitText = "Đăng bài",
  onSubmitForm,
  redirectOnSuccess = true,
}: CreateGroupPostFormProps) => {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();

  const loading = useAppSelector((state) =>
    Boolean(state.ui.loadingMap["post/createPost"]),
  );

  const lastCreatedPost = useAppSelector((state) => state.post.lastCreatedPost);

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    reset,
    formState: { errors },
  } = useForm<FormCreateGroupPost>({
    resolver: zodResolver(FormCreateGroupPostSchema),
    mode: "onChange",
    defaultValues: {
      title: "",
      content: "",
      type: "GROUP",
      formData: {
        area: {
          city: "",
          district: "",
        },
        weeklySchedule: {
          weekdays: [2, 5],
          startTime: "",
          endTime: "",
        },
        levelWanted: "INTERMEDIATE",
        contact: {
          inApp: true,
          zaloGroupLink: "",
        },
      },
      ...initialValues,
    },
  });

  const weekdays = watch("formData.weeklySchedule.weekdays");

  useEffect(() => {
    if (!redirectOnSuccess) return;
    if (lastCreatedPost?.type !== "GROUP") return;

    toast.success("Đăng bài nhóm thành công!");
    reset();

    const timer = setTimeout(() => {
      dispatch(clearLastCreatedPost());
      navigate("/posts", { replace: true });
    }, 500);

    return () => clearTimeout(timer);
  }, [dispatch, lastCreatedPost, navigate, reset, redirectOnSuccess]);

  const toggleWeekday = (day: number) => {
    const current = weekdays ?? [];
    const next = current.includes(day)
      ? current.filter((value) => value !== day)
      : [...current, day];

    setValue("formData.weeklySchedule.weekdays", next, {
      shouldValidate: true,
    });
  };

  const onSubmit = async (formValue: FormCreateGroupPost) => {
    if (onSubmitForm) {
      await onSubmitForm(formValue);
      return;
    }

    try {
      const formData: GroupFormData = {
        ...formValue.formData,
        levelWanted: mapGroupLevelToPostFormDataLevel(
          formValue.formData.levelWanted,
        ),
      };

      const data: CreatePostRequest = {
        title: formValue.title,
        content: formValue.content,
        type: formValue.type,
        formData,
      };

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
          placeholder="Nhóm đánh cố định T2-T5 sân A"
        />

        {errors.title && <p className={errorClass}>{errors.title.message}</p>}
      </div>

      <div>
        <label className={labelClass}>Nội dung</label>
        <textarea
          {...register("content")}
          className={`${inputClass} min-h-[120px] resize-none leading-relaxed`}
          placeholder="Mục tiêu nhóm, quy định, chi phí..."
        />

        {errors.content && (
          <p className={errorClass}>{errors.content.message}</p>
        )}
      </div>

      <div className={sectionClass}>
        <div className="flex items-center gap-2">
          <MapPin size={19} className="text-sky-600" />
          <h3 className={sectionTitleClass}>Khu vực hoạt động</h3>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className={labelClass}>Thành phố / tỉnh</label>
            <input
              {...register("formData.area.city")}
              className={inputClass}
              placeholder="VD: TP.HCM, Đà Nẵng..."
            />

            {errors.formData?.area?.city && (
              <p className={errorClass}>{errors.formData.area.city.message}</p>
            )}
          </div>

          <div>
            <label className={labelClass}>Quận / huyện</label>
            <input
              {...register("formData.area.district")}
              className={inputClass}
              placeholder="VD: Quận 7, Thủ Đức..."
            />

            {errors.formData?.area?.district && (
              <p className={errorClass}>
                {errors.formData.area.district.message}
              </p>
            )}
          </div>
        </div>
      </div>

      <div className={sectionClass}>
        <div className="flex items-center gap-2">
          <CalendarDays size={19} className="text-sky-600" />
          <h3 className={sectionTitleClass}>Lịch chơi theo tuần</h3>
        </div>

        <div>
          <label className={labelClass}>Các ngày chơi</label>
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

          {errors.formData?.weeklySchedule?.weekdays && (
            <p className={errorClass}>
              {errors.formData.weeklySchedule.weekdays.message}
            </p>
          )}
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className={labelClass}>Giờ bắt đầu</label>
            <input
              type="time"
              {...register("formData.weeklySchedule.startTime")}
              className={inputClass}
            />

            {errors.formData?.weeklySchedule?.startTime && (
              <p className={errorClass}>
                {errors.formData.weeklySchedule.startTime.message}
              </p>
            )}
          </div>

          <div>
            <label className={labelClass}>Giờ kết thúc</label>
            <input
              type="time"
              {...register("formData.weeklySchedule.endTime")}
              className={inputClass}
            />

            {errors.formData?.weeklySchedule?.endTime && (
              <p className={errorClass}>
                {errors.formData.weeklySchedule.endTime.message}
              </p>
            )}
          </div>
        </div>
      </div>

      <div className={sectionClass}>
        <div className="flex items-center gap-2">
          <Users size={19} className="text-sky-600" />
          <h3 className={sectionTitleClass}>Yêu cầu thành viên</h3>
        </div>

        <div>
          <label className={labelClass}>Trình độ mong muốn</label>
          <select
            {...register("formData.levelWanted")}
            className={`${inputClass} max-w-full md:max-w-md`}
          >
            {GROUP_LEVEL_OPTIONS.map((o) => (
              <option key={o.value} value={o.value}>
                {o.label}
              </option>
            ))}
          </select>

          {errors.formData?.levelWanted && (
            <p className={errorClass}>{errors.formData.levelWanted.message}</p>
          )}
        </div>
      </div>

      <div className={sectionClass}>
        <div className="flex items-center gap-2">
          <MessageCircle size={19} className="text-sky-600" />
          <h3 className={sectionTitleClass}>Thông tin liên hệ</h3>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <label className={checkboxClass}>
            <input
              type="checkbox"
              {...register("formData.contact.inApp")}
              className="h-4 w-4 accent-sky-600"
            />
            Nhận tin nhắn trên website
          </label>

          <div>
            <label className={labelClass}>Link nhóm Zalo</label>
            <input
              {...register("formData.contact.zaloGroupLink")}
              className={inputClass}
              placeholder="https://zalo.me/g/xxxx"
            />

            {errors.formData?.contact?.zaloGroupLink && (
              <p className={errorClass}>
                {errors.formData.contact.zaloGroupLink.message}
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

export default CreateGroupPostForm;
