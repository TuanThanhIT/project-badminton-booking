import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useNavigate } from "react-router-dom";
import { MapPin, MessageCircle, Target } from "lucide-react";
import { toast } from "react-toastify";
import {
  FormCreateFindCoachPostSchema,
  type formCreateFindCoachPost,
} from "../../../../schemas/FormCreateFindCoachPostSchema";
import { useAppDispatch, useAppSelector } from "../../../../redux/hook";
import { getAllBranches } from "../../../../redux/slices/user/branchSlice";
import {
  clearLastCreatedPost,
  createPost,
} from "../../../../redux/slices/user/postSlice";
import type { CreatePostRequest } from "../../../../types/post";
import LoadingButton from "../../common/LoadingButton";
import { PLAYER_LEVEL_OPTIONS } from "../../../../utils/constants/profileConstant";

type CreateFindCoachPostFormProps = {
  initialValues?: Partial<formCreateFindCoachPost>;
  submitText?: string;
  onSubmitForm?: (data: formCreateFindCoachPost) => Promise<void> | void;
  redirectOnSuccess?: boolean;
};

const inputClass =
  "w-full rounded-2xl border border-slate-200 bg-white px-4 py-3.5 text-[15px] text-slate-800 outline-none transition-all placeholder:text-slate-400 shadow-sm hover:border-sky-200 hover:bg-sky-50/20 focus:border-sky-400 focus:bg-white focus:ring-1 focus:ring-sky-100/70";
const labelClass = "block text-[13px] font-medium text-slate-600 mb-1.5";
const errorClass = "text-red-500 text-xs font-medium mt-1.5";
const sectionClass =
  "rounded-3xl border border-slate-200/80 bg-white p-4 sm:p-5 space-y-4 shadow-[0_8px_28px_rgba(15,23,42,0.04)]";

const CreateFindCoachPostForm = ({
  initialValues,
  submitText = "Đăng bài tìm người giảng dạy",
  onSubmitForm,
  redirectOnSuccess = true,
}: CreateFindCoachPostFormProps) => {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const branches = useAppSelector((state) => state.branch.branches);
  const loading = useAppSelector((state) =>
    Boolean(state.ui.loadingMap["post/createPost"]),
  );
  const lastCreatedPost = useAppSelector((state) => state.post.lastCreatedPost);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<formCreateFindCoachPost>({
    resolver: zodResolver(FormCreateFindCoachPostSchema),
    mode: "onChange",
    defaultValues: {
      title: "",
      content: "",
      type: "FIND_COACH",
      formData: {
        location: { branchId: 0 },
        currentLevel: "BEGINNER",
        goal: "",
        scheduleNote: "",
        budget: "",
        contact: {
          inApp: true,
          phone: "",
          zalo: "",
        },
        notes: "",
      },
      ...initialValues,
    },
  });

  useEffect(() => {
    dispatch(getAllBranches());
  }, [dispatch]);

  const onSubmit = async (dt: formCreateFindCoachPost) => {
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
    if (lastCreatedPost?.type !== "FIND_COACH") return;

    toast.success("Đã đăng bài tìm người giảng dạy!");
    reset();
    const timer = setTimeout(() => {
      dispatch(clearLastCreatedPost());
      navigate("/posts", { replace: true });
    }, 500);

    return () => clearTimeout(timer);
  }, [dispatch, lastCreatedPost, navigate, redirectOnSuccess, reset]);

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      <div>
        <label className={labelClass}>Tiêu đề</label>
        <input
          {...register("title")}
          className={inputClass}
          placeholder="Cần tìm người giảng dạy cầu lông buổi tối"
        />
        {errors.title && <p className={errorClass}>{errors.title.message}</p>}
      </div>

      <div>
        <label className={labelClass}>Nội dung</label>
        <textarea
          {...register("content")}
          className={`${inputClass} min-h-[110px] resize-none leading-relaxed`}
          placeholder="Mô tả ngắn về nhu cầu học, mục tiêu và tình trạng hiện tại..."
        />
        {errors.content && <p className={errorClass}>{errors.content.message}</p>}
      </div>

      <div className={sectionClass}>
        <div className="flex items-center gap-2">
          <MapPin size={19} className="text-sky-600" />
          <h3 className="text-base font-semibold text-slate-800">Địa điểm mong muốn</h3>
        </div>
        <select
          {...register("formData.location.branchId", { valueAsNumber: true })}
          className={inputClass}
        >
          <option value={0}>-- Chọn chi nhánh --</option>
          {branches.map((branch) => (
            <option key={branch.id} value={branch.id}>
              {[branch.branchName, branch.address, branch.districtName]
                .filter(Boolean)
                .join(" - ")}
            </option>
          ))}
        </select>
        {errors.formData?.location?.branchId && (
          <p className={errorClass}>{errors.formData.location.branchId.message}</p>
        )}
      </div>

      <div className={sectionClass}>
        <div className="flex items-center gap-2">
          <Target size={19} className="text-sky-600" />
          <h3 className="text-base font-semibold text-slate-800">Nhu cầu học</h3>
        </div>

        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          <div>
            <label className={labelClass}>Trình độ hiện tại</label>
            <select {...register("formData.currentLevel")} className={inputClass}>
              {PLAYER_LEVEL_OPTIONS.map((o) => (
                <option key={o.value} value={o.value}>
                  {o.label}
                </option>
              ))}
            </select>
            {errors.formData?.currentLevel && (
              <p className={errorClass}>{errors.formData.currentLevel.message}</p>
            )}
          </div>

          <div>
            <label className={labelClass}>Ngân sách</label>
            <input
              {...register("formData.budget")}
              className={inputClass}
              placeholder="VD: 200k/buổi, 1tr/tháng..."
            />
          </div>
        </div>

        <div>
          <label className={labelClass}>Mục tiêu học</label>
          <input
            {...register("formData.goal")}
            className={inputClass}
            placeholder="VD: sửa kỹ thuật, tăng thể lực, học đánh đôi..."
          />
          {errors.formData?.goal && (
            <p className={errorClass}>{errors.formData.goal.message}</p>
          )}
        </div>

        <div>
          <label className={labelClass}>Thời gian có thể học</label>
          <input
            {...register("formData.scheduleNote")}
            className={inputClass}
            placeholder="VD: tối 2-4-6, sau 19h"
          />
          {errors.formData?.scheduleNote && (
            <p className={errorClass}>{errors.formData.scheduleNote.message}</p>
          )}
        </div>
      </div>

      <div className={sectionClass}>
        <div className="flex items-center gap-2">
          <MessageCircle size={19} className="text-sky-600" />
          <h3 className="text-base font-semibold text-slate-800">Liên hệ</h3>
        </div>

        <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
          <label className="flex items-center gap-3 rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm font-semibold text-slate-700">
            <input
              type="checkbox"
              {...register("formData.contact.inApp")}
              className="h-4 w-4 accent-sky-600"
            />
            Nhận tin trên web
          </label>

          <input
            {...register("formData.contact.phone")}
            className={inputClass}
            placeholder="Số điện thoại"
          />
          <input
            {...register("formData.contact.zalo")}
            className={inputClass}
            placeholder="Zalo"
          />
        </div>
      </div>

      <div>
        <label className={labelClass}>Ghi chú</label>
        <textarea
          {...register("formData.notes")}
          className={`${inputClass} min-h-[90px] resize-none leading-relaxed`}
          placeholder="Thông tin thêm nếu cần..."
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

export default CreateFindCoachPostForm;
