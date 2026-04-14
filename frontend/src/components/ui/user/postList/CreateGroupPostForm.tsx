import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import { useAppDispatch, useAppSelector } from "../../../../redux/hook";
import {
  createPost,
  clearLastCreatedPost,
} from "../../../../redux/slices/user/postSlice";
import type { CreatePostRequest } from "../../../../types/post";
import LoadingButton from "../../common/LoadingButton";
import {
  FormCreateGroupPostSchema,
  type FormCreateGroupPost,
} from "../../../../schemas/FormCreateGroupPostSchema";
import { GROUP_LEVEL_OPTIONS } from "../../../../constants/postConstant";

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
        levelWanted: "Trung bình",
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
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <div>
        <label className="block font-medium mb-1">Tiêu đề</label>
        <input
          {...register("title")}
          className="w-full border rounded-md px-3 py-2"
          placeholder="Nhóm đánh cố định T2-T5 sân A"
        />
      </div>

      <div>
        <label className="block font-medium mb-1">Nội dung</label>
        <textarea
          {...register("content")}
          className="w-full border rounded-md px-3 py-2 min-h-[80px]"
          placeholder="Mục tiêu nhóm, quy định, chi phí..."
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block font-medium mb-1">Thành phố / tỉnh</label>
          <input
            {...register("formData.area.city")}
            className="w-full border rounded-md px-3 py-2"
            placeholder="VD: TP.HCM, Đà Nẵng..."
          />
        </div>
        <div>
          <label className="block font-medium mb-1">Quận / huyện</label>
          <input
            {...register("formData.area.district")}
            className="w-full border rounded-md px-3 py-2"
            placeholder="VD: Quận 7, Thủ Đức..."
          />
        </div>
      </div>

      <div>
        <label className="block font-medium mb-1">Lịch chơi theo tuần</label>
        <div className="flex flex-wrap gap-2">
          {weekdayOptions.map(({ d, label }) => {
            const checked = (weekdays ?? []).includes(d);
            return (
              <button
                key={d}
                type="button"
                onClick={() => toggleWeekday(d)}
                className={`px-4 py-2 rounded-lg border text-sm ${
                  checked
                    ? "bg-sky-600 text-white border-sky-600"
                    : "bg-white border-gray-300 text-gray-700"
                }`}
              >
                {label}
              </button>
            );
          })}
        </div>
        {errors.formData?.weeklySchedule?.weekdays && (
          <p className="text-red-500 text-sm mt-1">
            {errors.formData.weeklySchedule.weekdays.message}
          </p>
        )}
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block font-medium mb-1">Giờ bắt đầu</label>
          <input
            type="time"
            {...register("formData.weeklySchedule.startTime")}
            className="w-full border rounded-md px-3 py-2"
          />
        </div>
        <div>
          <label className="block font-medium mb-1">Giờ kết thúc</label>
          <input
            type="time"
            {...register("formData.weeklySchedule.endTime")}
            className="w-full border rounded-md px-3 py-2"
          />
          {errors.formData?.weeklySchedule?.endTime && (
            <p className="text-red-500 text-sm mt-1">
              {errors.formData.weeklySchedule.endTime.message}
            </p>
          )}
        </div>
      </div>

      <div>
        <label className="block font-medium mb-1">Trình độ mong muốn</label>
        <select
          {...register("formData.levelWanted")}
          className="w-full max-w-md border rounded-md px-3 py-2"
        >
          {GROUP_LEVEL_OPTIONS.map((o) => (
            <option key={o.value} value={o.value}>
              {o.label}
            </option>
          ))}
        </select>
        {errors.formData?.levelWanted && (
          <p className="text-red-500 text-sm mt-1">
            {errors.formData.levelWanted.message}
          </p>
        )}
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="flex items-center gap-2 mt-7">
          <input
            type="checkbox"
            {...register("formData.contact.inApp")}
            className="h-4 w-4"
          />
          <span>Nhận tin nhắn trực tiếp trên website</span>
        </div>
        <div>
          <label className="block font-medium mb-1">Link nhóm Zalo</label>
          <input
            {...register("formData.contact.zaloGroupLink")}
            className="w-full border rounded-md px-3 py-2"
            placeholder="https://zalo.me/g/xxxx"
          />
        </div>
      </div>

      <div className="flex justify-end">
        <LoadingButton loading={loading} type="submit">
          {submitText}
        </LoadingButton>
      </div>
    </form>
  );
};

export default CreateGroupPostForm;
