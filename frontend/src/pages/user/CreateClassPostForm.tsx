import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";

import { useNavigate } from "react-router-dom";

import {
  FormCreateClassPostSchema,
  type formCreateClassPost,
} from "../../schemas/FormCreateClassPostSchema";

import { useAppDispatch, useAppSelector } from "../../redux/hook";
import { createPost, clearLastCreatedPost } from "../../redux/slices/user/postSlice";
import { getAllBranch } from "../../redux/slices/user/branchSlice";
import type { CreatePostRequest } from "../../types/post";
import { toast } from "react-toastify";
import LoadingButton from "../../components/ui/common/LoadingButton";
import { CLASS_INPUT_LEVEL_OPTIONS } from "../../constants/postConstant";

type CreateClassPostFormProps = {
  initialValues?: Partial<formCreateClassPost>;
  submitText?: string;
  onSubmitForm?: (data: formCreateClassPost) => Promise<void> | void;
  redirectOnSuccess?: boolean;
};

const CreateClassPostForm = ({
  initialValues,
  submitText = "Đăng lớp",
  onSubmitForm,
  redirectOnSuccess = true,
}: CreateClassPostFormProps) => {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const loading = useAppSelector((state) => Boolean(state.ui.loadingMap["post/createPost"]));
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
        inputLevel: "Trung bình",
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
    const next = current.includes(d) ? current.filter((x) => x !== d) : [...current, d];
    setValue("formData.schedule.weekdays", next, { shouldValidate: true });
  };

  useEffect(() => {
    dispatch(getAllBranch());
  }, [dispatch]);

  /**
   * Đăng bài: Redux gọi POST /user/posts. Axios gửi một JSON body (Content-Type: application/json).
   * Cấu trúc: { title, content?, type: "CLASS", formData: { ... } } — formData là object JS,
   * được serialize thành chuỗi JSON trong body HTTP (không phải chuỗi riêng lẻ; server parse JSON rồi lưu formData vào DB).
   */
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
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      {/* Title */}
      <div>
        <label className="block font-medium mb-1">Tiêu đề</label>
        <input
          {...register("title")}
          className="w-full border rounded-md px-3 py-2"
          placeholder="Lớp căn bản tối 2–4–6"
        />
        {errors.title && (
          <p className="text-red-500 text-sm mt-1">{errors.title.message}</p>
        )}
      </div>

      {/* Content */}
      <div>
        <label className="block font-medium mb-1">Nội dung</label>
        <textarea
          {...register("content")}
          className="w-full border rounded-md px-3 py-2 min-h-[80px]"
          placeholder="Nội dung học, mục tiêu, yêu cầu..."
        />
        {errors.content && (
          <p className="text-red-500 text-sm mt-1">{errors.content.message}</p>
        )}
      </div>

      {/* Trình độ: chọn nhanh; độ tuổi: nhập tự do (vd 6–25, từ 8 tuổi…) */}
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block font-medium mb-1">Trình độ đầu vào</label>
          <select
            {...register("formData.inputLevel")}
            className="w-full border rounded-md px-3 py-2 bg-white"
          >
            {CLASS_INPUT_LEVEL_OPTIONS.map((o) => (
              <option key={o.value} value={o.value}>
                {o.label}
              </option>
            ))}
          </select>
          {errors.formData?.inputLevel && (
            <p className="text-red-500 text-sm mt-1">
              {errors.formData.inputLevel.message}
            </p>
          )}
        </div>
        <div>
          <label className="block font-medium mb-1">Độ tuổi</label>
          <input
            {...register("formData.ageRange")}
            className="w-full border rounded-md px-3 py-2"
            placeholder="VD: 6–25 tuổi, hoặc từ 8 tuổi trở lên"
          />
          {errors.formData?.ageRange && (
            <p className="text-red-500 text-sm mt-1">
              {errors.formData.ageRange.message}
            </p>
          )}
        </div>
      </div>

      {/* Một khối lịch: thứ + ngày bắt đầu + giờ (không trùng ô “giờ học” tách riêng) */}
      <div className="rounded-lg border border-gray-200 bg-gray-50/80 p-4 space-y-4">
        <p className="text-sm font-semibold text-gray-800">Lịch học</p>

      <div>
        <label className="block font-medium mb-1">Các ngày trong tuần</label>
        <div className="flex flex-wrap gap-3">
          {[
            { d: 2, label: "Thứ 2" },
            { d: 3, label: "Thứ 3" },
            { d: 4, label: "Thứ 4" },
            { d: 5, label: "Thứ 5" },
            { d: 6, label: "Thứ 6" },
            { d: 7, label: "Thứ 7" },
            { d: 1, label: "Chủ nhật" },
          ].map(({ d, label }) => {
            const checked = (weekdays ?? []).includes(d);
            return (
              <button
                key={d}
                type="button"
                onClick={() => toggleWeekday(d)}
                className={`px-4 py-2 rounded-lg border text-sm ${
                  checked
                    ? "bg-sky-600 text-white border-sky-600"
                    : "bg-white text-gray-700 border-gray-300 hover:bg-gray-50"
                }`}
              >
                {label}
              </button>
            );
          })}
        </div>
        {errors.formData?.schedule?.weekdays && (
          <p className="text-red-500 text-sm mt-1">
            {errors.formData.schedule.weekdays.message}
          </p>
        )}
      </div>

      <div className="grid grid-cols-3 gap-4">
        <div>
          <label className="block font-medium mb-1">Ngày bắt đầu khóa</label>
          <input
            type="date"
            {...register("formData.schedule.startDate")}
            className="w-full border rounded-md px-3 py-2"
          />
          {errors.formData?.schedule?.startDate && (
            <p className="text-red-500 text-sm mt-1">
              {errors.formData.schedule.startDate.message}
            </p>
          )}
        </div>
        <div>
          <label className="block font-medium mb-1">Giờ vào lớp</label>
          <input
            type="time"
            {...register("formData.schedule.startTime")}
            className="w-full border rounded-md px-3 py-2"
          />
          {errors.formData?.schedule?.startTime && (
            <p className="text-red-500 text-sm mt-1">
              {errors.formData.schedule.startTime.message}
            </p>
          )}
        </div>
        <div>
          <label className="block font-medium mb-1">Giờ tan lớp</label>
          <input
            type="time"
            {...register("formData.schedule.endTime")}
            className="w-full border rounded-md px-3 py-2"
          />
          {errors.formData?.schedule?.endTime && (
            <p className="text-red-500 text-sm mt-1">
              {errors.formData.schedule.endTime.message}
            </p>
          )}
        </div>
      </div>
      <p className="text-xs text-gray-500">
        Khung giờ trên áp dụng cho mỗi buổi vào các thứ đã chọn (cùng giờ mỗi tuần). Nếu lịch đặc biệt, ghi thêm ở phần nội dung hoặc Ghi chú.
      </p>
      </div>

      {/* Địa điểm: chỉ chi nhánh */}
      <div>
        <label className="block font-medium mb-1">Chi nhánh (địa điểm dạy học)</label>
        <select
          {...register("formData.location.branchId", { valueAsNumber: true })}
          className="w-full border rounded-md px-3 py-2 bg-white max-w-xl"
        >
          <option value={0}>-- Chọn chi nhánh --</option>
          {branches.map((branch) => (
            <option key={branch.id} value={branch.id}>
              {[branch.branchName, branch.address, branch.district, branch.city].filter(Boolean).join(" · ")}
            </option>
          ))}
        </select>
        {errors.formData?.location?.branchId && (
          <p className="text-red-500 text-sm mt-1">
            {errors.formData.location.branchId.message}
          </p>
        )}
      </div>

      {/* Số lượng học viên tối đa */}
      <div>
        <label className="block font-medium mb-1">Số lượng học viên tối đa</label>
        <input
          type="number"
          {...register("formData.maxStudents", { valueAsNumber: true })}
          className="w-full border rounded-md px-3 py-2"
          placeholder="Nhập số lượng tối đa..."
        />
        {errors.formData?.maxStudents && (
          <p className="text-red-500 text-sm mt-1">
            {errors.formData.maxStudents.message}
          </p>
        )}
      </div>

      {/* Học phí — một ô mô tả tự do */}
      <div>
        <label className="block font-medium mb-1">Học phí</label>
        <textarea
          {...register("formData.tuitionFee")}
          className="w-full border rounded-md px-3 py-2 min-h-[72px]"
          placeholder="VD: 2 triệu/khóa, 500k/tháng × 3 tháng, đóng đầu kỳ…"
        />
        {errors.formData?.tuitionFee && (
          <p className="text-red-500 text-sm mt-1">{errors.formData.tuitionFee.message}</p>
        )}
      </div>

      {/* Liên hệ */}
      <div className="grid grid-cols-3 gap-4">
        <div className="flex items-center gap-2">
          <input
            type="checkbox"
            {...register("formData.contact.inAppChat")}
            className="h-4 w-4"
          />
          <span>Nhận tin nhắn trực tiếp trên website</span>
        </div>
        <div>
          <label className="block font-medium mb-1">Số điện thoại</label>
          <input
            {...register("formData.contact.phone")}
            className="w-full border rounded-md px-3 py-2"
            placeholder="Nhập số điện thoại..."
          />
        </div>
        <div>
          <label className="block font-medium mb-1">Zalo</label>
          <input
            {...register("formData.contact.zalo")}
            className="w-full border rounded-md px-3 py-2"
            placeholder="Nhập số Zalo..."
          />
        </div>
      </div>

      {/* Ghi chú */}
      <div>
        <label className="block font-medium mb-1">Ghi chú</label>
        <textarea
          {...register("formData.notes")}
          className="w-full border rounded-md px-3 py-2 min-h-[60px]"
          placeholder="Thông tin thêm nếu cần…"
        />
      </div>

      <div className="flex justify-end">
        <LoadingButton loading={loading} type="submit">
          {submitText}
        </LoadingButton>
      </div>
    </form>
  );
};

export default CreateClassPostForm;

