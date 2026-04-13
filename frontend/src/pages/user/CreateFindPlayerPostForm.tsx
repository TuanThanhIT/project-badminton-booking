import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  FormCreateFindPlayerPostSchema,
  type formCreateFindPlayerPost,
} from "../../schemas/FormCreateFindPlayerPostSchema";
import { useAppDispatch, useAppSelector } from "../../redux/hook";
import { createPost, clearLastCreatedPost } from "../../redux/slices/user/postSlice";
import { getAllBranch } from "../../redux/slices/user/branchSlice";
import { getAllCourts } from "../../redux/slices/user/courtSlice";
import type { CreatePostRequest } from "../../types/post";
import { toast } from "react-toastify";
import LoadingButton from "../../components/ui/common/LoadingButton";

type CreateFindPlayerPostFormProps = {
  initialValues?: Partial<formCreateFindPlayerPost>;
  submitText?: string;
  onSubmitForm?: (data: formCreateFindPlayerPost) => Promise<void> | void;
  redirectOnSuccess?: boolean;
};

const CreateFindPlayerPostForm = ({
  initialValues,
  submitText = "Đăng bài",
  onSubmitForm,
  redirectOnSuccess = true,
}: CreateFindPlayerPostFormProps) => {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const loading = useAppSelector((state) => Boolean(state.ui.loadingMap["post/createPost"]));
  const lastCreatedPost = useAppSelector((state) => state.post.lastCreatedPost);
  const branches = useAppSelector((state) => state.branch.branches);
  const courts = useAppSelector((state) => state.court.courts);

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    reset,
    formState: { errors },
  } = useForm<formCreateFindPlayerPost>({
    resolver: zodResolver(FormCreateFindPlayerPostSchema),
    mode: "onChange",
    defaultValues: {
      title: "",
      content: "",
      type: "FIND_PLAYER",
      formData: {
        location: { branchId: 0, courtId: 0 },
        schedule: { date: "", startTime: "", endTime: "" },
        playerRequirement: {
          level: "Trung bình",
          customLevel: null,
          slotsNeeded: 1,
        },
        contact: { inApp: true, phone: "", zalo: "" },
        notes: "",
      },
      ...initialValues,
    },
  });

  const level = watch("formData.playerRequirement.level");
  const selectedBranchId = watch("formData.location.branchId");
  const courtsByBranch = courts.filter((court) => court.branchId === selectedBranchId);

  useEffect(() => {
    dispatch(getAllBranch());
    dispatch(getAllCourts());
  }, [dispatch]);

  useEffect(() => {
    setValue("formData.location.courtId", 0, { shouldValidate: true });
  }, [selectedBranchId, setValue]);

  const onSubmit = async (dt: formCreateFindPlayerPost) => {
    const data: CreatePostRequest = {
      title: dt.title,
      content: dt.content,
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
    if (!lastCreatedPost) return;
    toast.success("Đăng bài tìm người chơi thành công!");
    reset();
    const timer = setTimeout(() => {
      dispatch(clearLastCreatedPost());
      navigate("/posts", { replace: true });
    }, 500);
    return () => clearTimeout(timer);
  }, [lastCreatedPost, reset, dispatch, navigate, redirectOnSuccess]);

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
          <select
            {...register("formData.location.branchId", { valueAsNumber: true })}
            className="w-full border rounded-md px-3 py-2"
          >
            <option value={0}>-- Chọn chi nhánh --</option>
            {branches.map((branch) => (
              <option key={branch.id} value={branch.id}>
                {branch.branchName}
              </option>
            ))}
          </select>
          {errors.formData?.location?.branchId && (
            <p className="text-red-500 text-sm mt-1">
              {errors.formData.location.branchId.message}
            </p>
          )}
        </div>
        <div>
          <label className="block font-medium mb-1">Sân</label>
          <select
            {...register("formData.location.courtId", { valueAsNumber: true })}
            className="w-full border rounded-md px-3 py-2"
          >
            <option value={0}>-- Chọn sân --</option>
            {courtsByBranch.map((court) => (
              <option key={court.id} value={court.id}>
                {court.courtName}
              </option>
            ))}
          </select>
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
            <option value="Mới chơi">Mới chơi</option>
            <option value="Trung bình">Trung bình</option>
            <option value="Cao">Cao</option>
            <option value="Tùy chỉnh">Tùy chỉnh</option>
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
        {level === "Tùy chỉnh" && (
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

      {/* Liên hệ */}
      <div className="grid grid-cols-3 gap-4">
        <div className="flex items-center gap-2">
          <input
            type="checkbox"
            {...register("formData.contact.inApp")}
            className="h-4 w-4"
          />
          <span>Nhận tin nhắn trực tiếp trên website</span>
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
        <label className="block font-medium mb-1">Ghi chú</label>
        <textarea
          {...register("formData.notes")}
          className="w-full border rounded-md px-3 py-2 min-h-[60px]"
          placeholder="Đi đúng giờ, vui vẻ, fair-play..."
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

export default CreateFindPlayerPostForm;