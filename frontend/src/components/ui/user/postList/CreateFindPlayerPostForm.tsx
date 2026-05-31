import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { CalendarDays, MapPin, MessageCircle, Users } from "lucide-react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  FormCreateFindPlayerPostSchema,
  type formCreateFindPlayerPost,
} from "../../../../schemas/FormCreateFindPlayerPostSchema";
import { useAppDispatch, useAppSelector } from "../../../../redux/hook";
import {
  createPost,
  clearLastCreatedPost,
} from "../../../../redux/slices/user/postSlice";
import { getAllCourts } from "../../../../redux/slices/user/courtSlice";
import { toast } from "react-toastify";
import LoadingButton from "../../common/LoadingButton";
import { getBranchOptions } from "../../../../redux/slices/user/branchSlice";
import { FIND_PLAYER_LEVEL_VALUES } from "../../../../utils/constants/postConstant";
import { PLAYER_LEVEL_LABEL } from "../../../../utils/constants/profileConstant";
import type { FindPlayerFormData } from "../../../../types/post";

type CreateFindPlayerPostFormProps = {
  initialValues?: Partial<formCreateFindPlayerPost>;
  submitText?: string;
  onSubmitForm?: (data: formCreateFindPlayerPost) => Promise<void> | void;
  redirectOnSuccess?: boolean;
};

const inputClass =
  "w-full rounded-2xl border border-slate-200 bg-white px-4 py-3.5 text-[15px] text-slate-800 outline-none transition-all placeholder:text-slate-400 shadow-sm hover:border-sky-200 hover:bg-sky-50/20 focus:border-sky-400 focus:bg-white focus:ring-1 focus:ring-sky-100/70";

const labelClass = "block text-[13px] font-semibold text-slate-600 mb-1.5";

const errorClass = "text-red-500 text-xs font-medium mt-1.5";

const sectionClass =
  "rounded-3xl border border-slate-200/80 bg-white p-4 sm:p-5 space-y-4 shadow-[0_8px_28px_rgba(15,23,42,0.04)]";

const checkboxClass =
  "flex items-center gap-3 rounded-2xl bg-slate-50 border border-slate-200 px-4 py-3 text-sm font-semibold text-slate-700 cursor-pointer hover:bg-sky-50 hover:border-sky-200 transition-all";

const sectionTitleClass = "text-base font-bold text-slate-800";

const mapFindPlayerLevelToPostFormDataLevel = (
  level: formCreateFindPlayerPost["formData"]["playerRequirement"]["level"],
): FindPlayerFormData["playerRequirement"]["level"] => {
  switch (level) {
    case "BEGINNER":
    case "RECREATIONAL":
      return "Mới chơi";
    case "INTERMEDIATE":
      return "Trung bình";
    case "ADVANCED":
    case "COMPETITIVE":
      return "Cao";
    case "CUSTOM":
      return "Tùy chỉnh";
    default:
      return "Trung bình";
  }
};

const CreateFindPlayerPostForm = ({
  initialValues,
  submitText = "Đăng bài",
  onSubmitForm,
  redirectOnSuccess = true,
}: CreateFindPlayerPostFormProps) => {
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
  } = useForm<formCreateFindPlayerPost>({
    resolver: zodResolver(FormCreateFindPlayerPostSchema),
    mode: "onChange",
    defaultValues: {
      title: "",
      content: "",
      type: "FIND_PLAYER",
      formData: {
        location: {
          branchId: 0,
          courtId: 0,
        },
        schedule: {
          date: "",
          startTime: "",
          endTime: "",
        },
        playerRequirement: {
          level: "INTERMEDIATE",
          customLevel: null,
          slotsNeeded: 1,
        },
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

  const level = watch("formData.playerRequirement.level");
  const selectedBranchId = watch("formData.location.branchId");

  const courtsByBranch = courts.filter(
    (court) => court.branchId === selectedBranchId,
  );

  useEffect(() => {
    dispatch(getBranchOptions());
    dispatch(getAllCourts());
  }, [dispatch]);

  useEffect(() => {
    setValue("formData.location.courtId", 0, { shouldValidate: true });
  }, [selectedBranchId, setValue]);

  const onSubmit = async (dt: formCreateFindPlayerPost) => {
    if (onSubmitForm) {
      await onSubmitForm(dt);
      return;
    }

    try {
      const formData: FindPlayerFormData = {
        ...dt.formData,
        playerRequirement: {
          ...dt.formData.playerRequirement,
          level: mapFindPlayerLevelToPostFormDataLevel(
            dt.formData.playerRequirement.level,
          ),
        },
      };

      await dispatch(
        createPost({
          data: {
            title: dt.title,
            content: dt.content,
            type: dt.type,
            formData,
          },
        }),
      ).unwrap();
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
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      <div>
        <label className={labelClass}>Tiêu đề</label>
        <input
          {...register("title")}
          className={inputClass}
          placeholder="VD: Tìm người chơi chung tối CN, sân Quận 7"
        />
        {errors.title && <p className={errorClass}>{errors.title.message}</p>}
      </div>

      <div>
        <label className={labelClass}>Mô tả</label>
        <textarea
          {...register("content")}
          className={`${inputClass} min-h-[120px] resize-none leading-relaxed`}
          placeholder="Trình độ, chia tiền sân, không khí mong muốn..."
        />
        {errors.content && (
          <p className={errorClass}>{errors.content.message}</p>
        )}
      </div>

      <div className={sectionClass}>
        <div className="flex items-center gap-2">
          <MapPin size={19} className="text-sky-600" />
          <h3 className={sectionTitleClass}>Địa điểm chơi</h3>
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
          <h3 className={sectionTitleClass}>Thời gian</h3>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div>
            <label className={labelClass}>Ngày</label>
            <input
              type="date"
              {...register("formData.schedule.date")}
              className={inputClass}
            />

            {errors.formData?.schedule?.date && (
              <p className={errorClass}>
                {errors.formData.schedule.date.message}
              </p>
            )}
          </div>

          <div>
            <label className={labelClass}>Giờ bắt đầu</label>
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
            <label className={labelClass}>Giờ kết thúc</label>
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
      </div>

      <div className={sectionClass}>
        <div className="flex items-center gap-2">
          <Users size={19} className="text-sky-600" />
          <h3 className={sectionTitleClass}>Yêu cầu người chơi</h3>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className={labelClass}>Trình độ</label>
            <select
              {...register("formData.playerRequirement.level")}
              className={inputClass}
            >
              {FIND_PLAYER_LEVEL_VALUES.map((val) => (
                <option key={val} value={val}>
                  {val === "CUSTOM" ? "Tùy chỉnh" : PLAYER_LEVEL_LABEL[val]}
                </option>
              ))}
            </select>

            {errors.formData?.playerRequirement?.level && (
              <p className={errorClass}>
                {errors.formData.playerRequirement.level.message}
              </p>
            )}
          </div>

          <div>
            <label className={labelClass}>Số slot cần thêm</label>
            <input
              type="number"
              min={1}
              {...register("formData.playerRequirement.slotsNeeded", {
                valueAsNumber: true,
              })}
              className={inputClass}
            />

            {errors.formData?.playerRequirement?.slotsNeeded && (
              <p className={errorClass}>
                {errors.formData.playerRequirement.slotsNeeded.message}
              </p>
            )}
          </div>

          {level === "CUSTOM" && (
            <div>
              <label className={labelClass}>Mô tả trình độ</label>
              <input
                {...register("formData.playerRequirement.customLevel")}
                className={inputClass}
                placeholder="VD: phong trào, đánh vui..."
              />

              {errors.formData?.playerRequirement?.customLevel && (
                <p className={errorClass}>
                  {errors.formData.playerRequirement.customLevel.message}
                </p>
              )}
            </div>
          )}
        </div>
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
            <label className={labelClass}>Zalo</label>
            <input
              {...register("formData.contact.zalo")}
              className={inputClass}
              placeholder="0901234567"
            />

            {errors.formData?.contact?.zalo && (
              <p className={errorClass}>
                {errors.formData.contact.zalo.message}
              </p>
            )}
          </div>
        </div>
      </div>

      <div>
        <label className={labelClass}>Ghi chú</label>
        <textarea
          {...register("formData.notes")}
          className={`${inputClass} min-h-[100px] resize-none leading-relaxed`}
          placeholder="Đi đúng giờ, vui vẻ, fair-play..."
        />

        {errors.formData?.notes && (
          <p className={errorClass}>{errors.formData.notes.message}</p>
        )}
      </div>

      <div className="flex justify-end pt-2">
        <LoadingButton loading={loading} type="submit">
          {submitText}
        </LoadingButton>
      </div>
    </form>
  );
};

export default CreateFindPlayerPostForm;
