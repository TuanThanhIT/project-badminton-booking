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

import { getAllCourts } from "../../../../redux/slices/user/courtSlice";
import type { CreatePostRequest } from "../../../../types/post";
import LoadingButton from "../../common/LoadingButton";
import {
  FormCreateTournamentPostSchema,
  type FormCreateTournamentPost,
} from "../../../../schemas/FormCreateTournamentPostSchema";
import { TOURNAMENT_CATEGORY_OPTIONS } from "../../../../constants/postConstant";
import { getBranchOptions } from "../../../../redux/slices/user/branchSlice";

type CreateTournamentPostFormProps = {
  initialValues?: Partial<FormCreateTournamentPost>;
  submitText?: string;
  onSubmitForm?: (data: FormCreateTournamentPost) => Promise<void> | void;
  redirectOnSuccess?: boolean;
};

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
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <div>
        <label className="block font-medium mb-1">Tiêu đề</label>
        <input
          {...register("title")}
          className="w-full border rounded-md px-3 py-2"
          placeholder="Giải phong trào Thủ Đức Open 2026"
        />
        {errors.title && (
          <p className="text-red-500 text-sm mt-1">{errors.title.message}</p>
        )}
      </div>

      <div>
        <label className="block font-medium mb-1">Nội dung</label>
        <textarea
          {...register("content")}
          className="w-full border rounded-md px-3 py-2 min-h-[80px]"
          placeholder="Thể lệ, hạng mục, phí đăng ký..."
        />
      </div>

      <div>
        <label className="block font-medium mb-1">Ban tổ chức</label>
        <input
          {...register("formData.organizerName")}
          className="w-full border rounded-md px-3 py-2"
          placeholder="Tên đơn vị tổ chức"
        />
        {errors.formData?.organizerName && (
          <p className="text-red-500 text-sm mt-1">
            {errors.formData.organizerName.message}
          </p>
        )}
      </div>

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
        </div>
      </div>

      <div className="grid grid-cols-3 gap-4">
        <div>
          <label className="block font-medium mb-1">Mở đăng ký</label>
          <input
            type="date"
            {...register("formData.registration.startDate")}
            className="w-full border rounded-md px-3 py-2"
          />
        </div>
        <div>
          <label className="block font-medium mb-1">Kết thúc đăng ký</label>
          <input
            type="date"
            {...register("formData.registration.endDate")}
            className="w-full border rounded-md px-3 py-2"
          />
        </div>
        <div>
          <label className="block font-medium mb-1">Ngày diễn ra giải</label>
          <input
            type="date"
            {...register("formData.eventDate")}
            className="w-full border rounded-md px-3 py-2"
          />
        </div>
      </div>

      <div>
        <label className="block font-medium mb-2">Hạng mục</label>
        <p className="text-xs text-gray-500 mb-2">
          Tích chọn các hạng mục tổ chức (có thể chọn nhiều).
        </p>
        <div className="flex flex-wrap gap-x-4 gap-y-2 rounded-lg border border-gray-200 bg-gray-50/80 p-3">
          {TOURNAMENT_CATEGORY_OPTIONS.map((opt) => (
            <label
              key={opt.value}
              className="inline-flex items-center gap-2 cursor-pointer text-sm text-gray-800 select-none"
            >
              <input
                type="checkbox"
                className="h-4 w-4 rounded border-gray-300 text-sky-600 focus:ring-sky-500"
                checked={selectedCategories.includes(opt.value)}
                onChange={() => toggleCategory(opt.value)}
              />
              <span>{opt.label}</span>
            </label>
          ))}
        </div>
        {errors.formData?.categories && (
          <p className="text-red-500 text-sm mt-1">
            {errors.formData.categories.message}
          </p>
        )}
      </div>

      <div className="flex items-center gap-2">
        <input
          type="checkbox"
          {...register("formData.contact.inApp")}
          className="h-4 w-4"
        />
        <span>Nhận tin nhắn trực tiếp trên website</span>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block font-medium mb-1">Số điện thoại</label>
          <input
            {...register("formData.contact.phone")}
            className="w-full border rounded-md px-3 py-2"
            placeholder="0901234567"
          />
        </div>
        <div>
          <label className="block font-medium mb-1">Email</label>
          <input
            {...register("formData.contact.email")}
            className="w-full border rounded-md px-3 py-2"
            placeholder="abc@example.com"
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

export default CreateTournamentPostForm;
