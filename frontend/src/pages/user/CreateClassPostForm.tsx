import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";

import {
  FormCreateClassPostSchema,
  type formCreateClassPost,
} from "../../schemas/FormCreateClassPostSchema";

import { useAppDispatch, useAppSelector } from "../../redux/hook";
import { createPost, clearLastCreatedPost } from "../../redux/slices/user/postSlice";
import type { CreatePostRequest } from "../../types/post";
import { toast } from "react-toastify";
import LoadingButton from "../../components/ui/common/LoadingButton";

const CreateClassPostForm = () => {
  const dispatch = useAppDispatch();
  const loading = useAppSelector((state) => state.ui.loadingCount > 0);
  const lastCreatedPost = useAppSelector((state) => state.post.lastCreatedPost);

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
      type: "Class",
      formData: {
        inputLevel: "Beginner",
        ageRange: "16+",
        schedule: {
          weekdays: [2, 4, 6],
          startTime: "19:00",
          endTime: "21:00",
          startDate: "2026-04-01",
        },
        location: {
          branchId: 1,
          address: "...",
        },
        maxStudents: 10,
        tuition: {
          type: "monthly",
          amount: 500000,
          currency: "VND",
          note: "Đóng đầu tháng",
        },
        registerEndDate: "2026-03-28",
        paymentMethod: "onsite",
        contact: {
          inAppChat: true,
          phone: "0901234567",
          zalo: "0901234567",
        },
        notes: "Có buổi học thử. Mang vợt nếu có.",
      },
    },
  });

  const weekdays = watch("formData.schedule.weekdays");

  const toggleWeekday = (d: number) => {
    const current = weekdays ?? [];
    const next = current.includes(d) ? current.filter((x) => x !== d) : [...current, d];
    setValue("formData.schedule.weekdays", next, { shouldValidate: true });
  };

  const onSubmit = (dt: formCreateClassPost) => {
    const data: CreatePostRequest = {
      title: dt.title,
      content: dt.content ?? "",
      type: dt.type,
      formData: dt.formData,
    };
    dispatch(createPost({ data })).unwrap();
  };

  useEffect(() => {
    if (lastCreatedPost) {
      toast.success("Đăng bài lớp học thành công!");
      reset();
      dispatch(clearLastCreatedPost());
    }
  }, [lastCreatedPost, reset, dispatch]);

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

      {/* Trình độ đầu vào & Độ tuổi */}
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block font-medium mb-1">Trình độ đầu vào</label>
          <input
            {...register("formData.inputLevel")}
            className="w-full border rounded-md px-3 py-2"
            placeholder="Ví dụ: Beginner, Intermediate..."
          />
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
            placeholder="Ví dụ: 16+, 18-25..."
          />
          {errors.formData?.ageRange && (
            <p className="text-red-500 text-sm mt-1">
              {errors.formData.ageRange.message}
            </p>
          )}
        </div>
      </div>

      {/* Weekdays (7 boxes) */}
      <div>
        <label className="block font-medium mb-1">Chọn các ngày học trong tuần</label>
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

      {/* Thời gian học */}
      <div className="grid grid-cols-3 gap-4">
        <div>
          <label className="block font-medium mb-1">Ngày bắt đầu</label>
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
          <label className="block font-medium mb-1">Giờ bắt đầu</label>
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
          <label className="block font-medium mb-1">Giờ kết thúc</label>
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

      {/* Địa điểm học */}
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block font-medium mb-1">Chi nhánh (ID)</label>
          <input
            type="number"
            {...register("formData.location.branchId", { valueAsNumber: true })}
            className="w-full border rounded-md px-3 py-2"
            placeholder="Nhập mã chi nhánh..."
          />
          {errors.formData?.location?.branchId && (
            <p className="text-red-500 text-sm mt-1">
              {errors.formData.location.branchId.message}
            </p>
          )}
        </div>
        <div>
          <label className="block font-medium mb-1">Địa chỉ</label>
          <input
            {...register("formData.location.address")}
            className="w-full border rounded-md px-3 py-2"
            placeholder="Nhập địa chỉ sân..."
          />
          {errors.formData?.location?.address && (
            <p className="text-red-500 text-sm mt-1">
              {errors.formData.location.address.message}
            </p>
          )}
        </div>
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

      {/* Học phí */}
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block font-medium mb-1">Loại học phí</label>
          <input
            {...register("formData.tuition.type")}
            className="w-full border rounded-md px-3 py-2"
            placeholder="Theo tháng, theo buổi..."
          />
        </div>
        <div>
          <label className="block font-medium mb-1">Số tiền</label>
          <input
            type="number"
            {...register("formData.tuition.amount", { valueAsNumber: true })}
            className="w-full border rounded-md px-3 py-2"
            placeholder="Nhập số tiền..."
          />
        </div>
        <div>
          <label className="block font-medium mb-1">Đơn vị tiền tệ</label>
          <input
            {...register("formData.tuition.currency")}
            className="w-full border rounded-md px-3 py-2"
            placeholder="VND, USD..."
          />
        </div>
        <div>
          <label className="block font-medium mb-1">Ghi chú học phí</label>
          <input
            {...register("formData.tuition.note")}
            className="w-full border rounded-md px-3 py-2"
            placeholder="Ví dụ: Đóng đầu tháng, giảm giá..."
          />
        </div>
      </div>

      {/* Đăng ký & thanh toán */}
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block font-medium mb-1">Hạn đăng ký</label>
          <input
            type="date"
            {...register("formData.registerEndDate")}
            className="w-full border rounded-md px-3 py-2"
          />
        </div>
        <div>
          <label className="block font-medium mb-1">Hình thức thanh toán</label>
          <input
            {...register("formData.paymentMethod")}
            className="w-full border rounded-md px-3 py-2"
            placeholder="Tại sân, chuyển khoản..."
          />
        </div>
      </div>

      {/* Liên hệ */}
      <div className="grid grid-cols-3 gap-4">
        <div className="flex items-center gap-2">
          <input
            type="checkbox"
            {...register("formData.contact.inAppChat")}
            className="h-4 w-4"
          />
          <span>Nhắn tin trong app</span>
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
        <label className="block font-medium mb-1">Ghi chú thêm</label>
        <textarea
          {...register("formData.notes")}
          className="w-full border rounded-md px-3 py-2 min-h-[60px]"
          placeholder="Nhập ghi chú thêm nếu có..."
        />
      </div>

      <div className="flex justify-end">
        <LoadingButton loading={loading} type="submit">
          Đăng lớp
        </LoadingButton>
      </div>
    </form>
  );
};

export default CreateClassPostForm;

