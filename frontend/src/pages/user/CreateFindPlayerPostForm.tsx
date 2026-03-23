import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  FormCreateFindPlayerPostSchema,
  type formCreateFindPlayerPost,
} from "../../schemas/FormCreateFindPlayerPostSchema";
import { useAppDispatch, useAppSelector } from "../../redux/hook";
import { createPost, clearLastCreatedPost } from "../../redux/slices/user/postSlice";
import type { CreatePostRequest } from "../../types/post";
import { toast } from "react-toastify";
import LoadingButton from "../../components/ui/common/LoadingButton";

const CreateFindPlayerPostForm = () => {
  const dispatch = useAppDispatch();
  const loading = useAppSelector((state) => state.ui.loadingCount > 0);
  const lastCreatedPost = useAppSelector((state) => state.post.lastCreatedPost);

  const {
    register,
    handleSubmit,
    watch,
    reset,
    formState: { errors },
  } = useForm<formCreateFindPlayerPost>({
    resolver: zodResolver(FormCreateFindPlayerPostSchema),
    mode: "onChange",
    defaultValues: {
      title: "",
      content: "",
      type: "Find_player",
      formData: {
        location: { branchId: 0, courtId: 0 },
        schedule: { date: "", startTime: "", endTime: "" },
        playerRequirement: {
          level: "Intermediate",
          customLevel: null,
          slotsNeeded: 1,
        },
        cost: { method: "Tiền mặt", note: "" },
        contact: { inApp: true, phone: "", zalo: "" },
        notes: "",
      },
    },
  });

  const level = watch("formData.playerRequirement.level");

  const onSubmit = (dt: formCreateFindPlayerPost) => {
    const data: CreatePostRequest = {
      title: dt.title,
      content: dt.content,
      type: dt.type,
      formData: dt.formData,
    };
    dispatch(createPost({ data })).unwrap();
  };

  useEffect(() => {
    if (lastCreatedPost) {
      toast.success("Đăng bài tìm người chơi thành công!");
      reset();
      dispatch(clearLastCreatedPost());
    }
  }, [lastCreatedPost, reset, dispatch]);

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      {/* Tiêu đề */}
      <div>
        <label className="block font-medium mb-1">Tiêu đề</label>
        <input
          {...register("title")}
          className="w-full border rounded-md px-3 py-2"
          placeholder="VD: Tìm người chơi chung tối CN, sân Quận 7"
        />
        {errors.title && (
          <p className="text-red-500 text-sm mt-1">{errors.title.message}</p>
        )}
      </div>

      {/* Mô tả */}
      <div>
        <label className="block font-medium mb-1">Mô tả</label>
        <textarea
          {...register("content")}
          className="w-full border rounded-md px-3 py-2 min-h-[80px]"
          placeholder="Trình độ, chia tiền sân, không khí mong muốn..."
        />
        {errors.content && (
          <p className="text-red-500 text-sm mt-1">{errors.content.message}</p>
        )}
      </div>

      {/* Địa điểm */}
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block font-medium mb-1">Chi nhánh</label>
          <input
            type="number"
            {...register("formData.location.branchId", { valueAsNumber: true })}
            className="w-full border rounded-md px-3 py-2"
            placeholder="ID chi nhánh"
          />
          {errors.formData?.location?.branchId && (
            <p className="text-red-500 text-sm mt-1">
              {errors.formData.location.branchId.message}
            </p>
          )}
        </div>
        <div>
          <label className="block font-medium mb-1">Sân</label>
          <input
            type="number"
            {...register("formData.location.courtId", { valueAsNumber: true })}
            className="w-full border rounded-md px-3 py-2"
            placeholder="ID sân"
          />
          {errors.formData?.location?.courtId && (
            <p className="text-red-500 text-sm mt-1">
              {errors.formData.location.courtId.message}
            </p>
          )}
        </div>
      </div>

      {/* Thời gian */}
      <div className="grid grid-cols-3 gap-4">
        <div>
          <label className="block font-medium mb-1">Ngày</label>
          <input
            type="date"
            {...register("formData.schedule.date")}
            className="w-full border rounded-md px-3 py-2"
          />
          {errors.formData?.schedule?.date && (
            <p className="text-red-500 text-sm mt-1">
              {errors.formData.schedule.date.message}
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
        </div>
        <div>
          <label className="block font-medium mb-1">Giờ kết thúc</label>
          <input
            type="time"
            {...register("formData.schedule.endTime")}
            className="w-full border rounded-md px-3 py-2"
          />
        </div>
      </div>

      {/* Yêu cầu người chơi */}
      <div className="grid grid-cols-3 gap-4">
        <div>
          <label className="block font-medium mb-1">Trình độ</label>
          <select
            {...register("formData.playerRequirement.level")}
            className="w-full border rounded-md px-3 py-2"
          >
            <option value="Beginner">Mới chơi</option>
            <option value="Intermediate">Trung bình</option>
            <option value="Advanced">Cao</option>
            <option value="Custom">Tùy chỉnh</option>
          </select>
        </div>
        <div>
          <label className="block font-medium mb-1">Số slot cần thêm</label>
          <input
            type="number"
            min={1}
            {...register("formData.playerRequirement.slotsNeeded", {
              valueAsNumber: true,
            })}
            className="w-full border rounded-md px-3 py-2"
          />
        </div>
        {level === "Custom" && (
          <div>
            <label className="block font-medium mb-1">Mô tả trình độ</label>
            <input
              {...register("formData.playerRequirement.customLevel")}
              className="w-full border rounded-md px-3 py-2"
              placeholder="VD: phong trào, đánh vui..."
            />
          </div>
        )}
      </div>

      {/* Chi phí */}
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block font-medium mb-1">Hình thức thanh toán</label>
          <input
            {...register("formData.cost.method")}
            className="w-full border rounded-md px-3 py-2"
            placeholder="VD: Tiền mặt"
          />
        </div>
        <div>
          <label className="block font-medium mb-1">Ghi chú chi phí</label>
          <input
            {...register("formData.cost.note")}
            className="w-full border rounded-md px-3 py-2"
            placeholder="VD: Tiền sân chia đều, cầu tự túc"
          />
        </div>
      </div>

      {/* Liên hệ */}
      <div className="grid grid-cols-3 gap-4">
        <div className="flex items-center gap-2">
          <input
            type="checkbox"
            {...register("formData.contact.inApp")}
            className="h-4 w-4"
          />
          <span>Nhận tin nhắn trong app</span>
        </div>
        <div>
          <label className="block font-medium mb-1">Số điện thoại</label>
          <input
            {...register("formData.contact.phone")}
            className="w-full border rounded-md px-3 py-2"
            placeholder="0901234567"
          />
        </div>
        <div>
          <label className="block font-medium mb-1">Zalo</label>
          <input
            {...register("formData.contact.zalo")}
            className="w-full border rounded-md px-3 py-2"
            placeholder="0901234567"
          />
        </div>
      </div>

      {/* Ghi chú */}
      <div>
        <label className="block font-medium mb-1">Ghi chú thêm</label>
        <textarea
          {...register("formData.notes")}
          className="w-full border rounded-md px-3 py-2 min-h-[60px]"
          placeholder="Đi đúng giờ, vui vẻ, fair-play..."
        />
      </div>

      <div className="flex justify-end">
        <LoadingButton loading={loading} type="submit">
          Đăng bài
        </LoadingButton>
      </div>
    </form>
  );
};

export default CreateFindPlayerPostForm;