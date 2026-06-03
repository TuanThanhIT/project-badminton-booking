import { useState, useEffect } from "react";
import type { ReactNode } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  Plus,
  MapPin,
  Phone,
  Clock,
  DollarSign,
  Edit2,
  Wrench,
  XCircle,
  Image as ImageIcon,
  Upload,
  StoreIcon,
} from "lucide-react";

import {
  FormCreateCourtSchema,
  FormCreateCourtPriceSchema,
  type FormCreateCourt,
  type FormCreateCourtPrice,
} from "../../schemas/FormCourtSchema";

import { useAppDispatch, useAppSelector } from "../../redux/hook";
import {
  createCourt,
  createCourtPrice,
  getCourts,
  getCourtPrices,
  closeCourt,
  maintenanceCourt,
  updateCourt,
  uploadCourtImage,
} from "../../redux/slices/manager/courtSlice";
import { getMyBranch } from "../../redux/slices/manager/branchSlice";
import { toast } from "react-toastify";
import { showConfirmDialog } from "../../utils/confirmDialog";
import {
  ManagerEmptyState,
  ManagerModalOverlay,
  ManagerPageHeader,
  managerCardClass,
  managerInputClass,
  managerPrimaryButtonClass,
  managerSecondaryButtonClass,
} from "../../components/commons/manager/ManagerPage";
import TablePagination from "../../components/ui/TablePagination";

const COURT_LIMIT = 9;

const BranchPage = () => {
  const dispatch = useAppDispatch();
  const [showForm, setShowForm] = useState(false);
  const [showPriceForm, setShowPriceForm] = useState(false);
  const [editingCourt, setEditingCourt] = useState<any>(null);
  const [uploadingCourtImage, setUploadingCourtImage] = useState(false);
  const [courtPage, setCourtPage] = useState(1);

  const { courts, courtPrices } = useAppSelector((state) => state.managerCourt);
  const { branch } = useAppSelector((state) => state.managerBranch);

  const {
    register,
    handleSubmit,
    reset,
    setValue,
    watch,
    formState: { errors },
  } = useForm<FormCreateCourt>({
    resolver: zodResolver(FormCreateCourtSchema),
  });
  const courtThumbnailUrl = watch("thumbnailUrl");

  const {
    register: registerPrice,
    handleSubmit: handleSubmitPrice,
    reset: resetPrice,
    formState: { errors: errorsPrice },
  } = useForm<FormCreateCourtPrice>({
    resolver: zodResolver(FormCreateCourtPriceSchema),
  });

  const onSubmit = async (data: FormCreateCourt) => {
    try {
      if (editingCourt) {
        await dispatch(
          updateCourt({ courtId: editingCourt.id, data }),
        ).unwrap();
        toast.success("Cập nhật sân thành công");
      } else {
        await dispatch(createCourt(data)).unwrap();
        toast.success("Tạo sân thành công");
      }
      await dispatch(getCourts());
      closeModal();
    } catch (error) {
      console.log(error);
      toast.error("Không thể lưu thông tin sân");
    }
  };

  const onSubmitPrice = async (data: FormCreateCourtPrice) => {
    try {
      await dispatch(createCourtPrice(data)).unwrap();
      toast.success("Thêm giá sân thành công");
      await dispatch(getCourtPrices());
      closePriceForm();
    } catch (error) {
      console.log(error);
      toast.error("Không thể thêm giá sân");
    }
  };

  const handleUploadCourtImage = async (file?: File) => {
    if (!file) return;

    try {
      setUploadingCourtImage(true);
      const result = await dispatch(uploadCourtImage(file)).unwrap();
      setValue("thumbnailUrl", result.url, {
        shouldDirty: true,
        shouldValidate: true,
      });
    } catch (error) {
      console.log(error);
      toast.error("Upload ảnh sân thất bại");
    } finally {
      setUploadingCourtImage(false);
    }
  };

  const closeModal = () => {
    setShowForm(false);
    setEditingCourt(null);
    setUploadingCourtImage(false);
    reset();
  };

  const closePriceForm = () => {
    setShowPriceForm(false);
    resetPrice();
  };

  const handleMaintenanceCourt = async (courtId: number) => {
    const confirmed = await showConfirmDialog(
      "Chuyển sân sang bảo trì?",
      "Sân sẽ tạm ngưng nhận lịch mới cho đến khi được mở lại.",
      "Bảo trì",
      "Hủy",
      "warning",
    );
    if (!confirmed) return;

    await dispatch(maintenanceCourt(courtId));
    dispatch(getCourts());
  };

  const handleCloseCourt = async (courtId: number) => {
    const confirmed = await showConfirmDialog(
      "Đóng sân này?",
      "Sân sẽ không hiển thị để khách đặt lịch mới.",
      "Đóng sân",
      "Hủy",
      "danger",
    );
    if (!confirmed) return;

    await dispatch(closeCourt(courtId));
    dispatch(getCourts());
  };

  useEffect(() => {
    dispatch(getCourts());
    dispatch(getCourtPrices());
    dispatch(getMyBranch());
  }, [dispatch]);

  const courtTotalPages = Math.ceil(courts.length / COURT_LIMIT);
  const paginatedCourts = courts.slice(
    (courtPage - 1) * COURT_LIMIT,
    courtPage * COURT_LIMIT,
  );

  useEffect(() => {
    if (courtPage > courtTotalPages && courtTotalPages > 0) {
      setCourtPage(courtTotalPages);
    }
  }, [courtPage, courtTotalPages]);

  // Helper cho trạng thái sân
  const getStatusBadge = (status: string) => {
    const styles: any = {
      AVAILABLE: "bg-green-100 text-green-700 border-green-200",
      MAINTENANCE: "bg-yellow-100 text-yellow-700 border-yellow-200",
      CLOSED: "bg-red-100 text-red-700 border-red-200",
    };
    return styles[status] || "bg-gray-100 text-gray-700";
  };

  return (
    <div className="space-y-8">
      <ManagerPageHeader
        eyebrow="Manager bookings"
        title="Quản lý sân cầu lông"
        description="Quản lý sân, giá thuê và trạng thái vận hành của chi nhánh."
        metrics={[
          { label: "Số sân", value: courts.length },
          { label: "Bảng giá", value: courtPrices.length },
        ]}
        actions={
          <div className="flex gap-3">
            <button
              onClick={() => setShowPriceForm(true)}
              className={managerSecondaryButtonClass}
            >
              <DollarSign size={18} /> Thêm giá sân
            </button>
            <button
              onClick={() => setShowForm(true)}
              className={managerPrimaryButtonClass}
            >
              <Plus size={18} /> Thêm sân mới
            </button>
          </div>
        }
      />

      {/* BRANCH INFO CARD */}
      {branch && (
        <div
          className={`${managerCardClass} p-6 flex flex-col md:flex-row justify-between items-center transition-all`}
        >
          <div className="flex gap-6 items-center">
            <div className="w-16 h-16 bg-sky-50 rounded-2xl flex items-center justify-center text-sky-700">
              <StoreIcon size={32} />
            </div>
            <div>
              <h2 className="text-xl font-bold text-gray-800">
                {branch.branchName}
              </h2>
              <div className="flex flex-col gap-1 mt-2">
                <p className="text-gray-500 flex items-center gap-2 text-sm">
                  <MapPin size={14} className="text-sky-600" /> {branch.address}
                  , {branch.districtName}, {branch.provinceName}
                </p>
                <p className="text-gray-500 flex items-center gap-2 text-sm">
                  <Phone size={14} className="text-sky-600" />{" "}
                  {branch.phoneNumber}
                </p>
              </div>
            </div>
          </div>
          <div className="mt-4 md:mt-0">
            <span
              className={`inline-flex items-center px-4 py-1.5 rounded-full text-sm font-bold border-2 ${
                branch.isActive
                  ? "bg-green-50 text-green-600 border-green-100"
                  : "bg-red-50 text-red-600 border-red-100"
              }`}
            >
              <span
                className={`w-2 h-2 rounded-full mr-2 ${branch.isActive ? "bg-green-500" : "bg-red-500"}`}
              ></span>
              {branch.isActive ? "Đang hoạt động" : "Ngưng hoạt động"}
            </span>
          </div>
        </div>
      )}

      {/* MODAL FORM CREATE/EDIT COURT */}
      {showForm && (
        <ManagerModalOverlay>
          <div className="w-full max-w-xl rounded-2xl bg-white shadow-sm animate-in fade-in zoom-in duration-200">
            <div className="flex items-center justify-between border-b border-slate-200 px-6 py-4">
              <div>
                <h2 className="text-lg font-bold text-slate-900">
                  {editingCourt ? "Cập nhật sân" : "Tạo sân mới"}
                </h2>
                <p className="text-sm text-slate-500">
                  {editingCourt
                    ? "Điều chỉnh thông tin hiển thị của sân trong chi nhánh."
                    : "Thêm sân vào chi nhánh để khách có thể xem và đặt lịch."}
                </p>
              </div>
              <button
                onClick={closeModal}
                className="flex h-9 w-9 items-center justify-center rounded-xl text-slate-500 hover:bg-slate-100"
                type="button"
              >
                <XCircle className="h-5 w-5" />
              </button>
            </div>
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-5 p-6">
              <div className="grid gap-4 md:grid-cols-2">
                <ManagerField label="Tên sân" error={errors.courtName?.message}>
                  <input
                    {...register("courtName")}
                    className={`w-full ${managerInputClass}`}
                    placeholder="VD: Sân 01"
                  />
                </ManagerField>

                <ManagerField
                  label="Vị trí sân"
                  error={errors.location?.message}
                >
                  <input
                    {...register("location")}
                    className={`w-full ${managerInputClass}`}
                    placeholder="VD: Khu A"
                  />
                </ManagerField>
              </div>

              <ManagerField
                label="Hình ảnh (URL)"
                error={errors.thumbnailUrl?.message}
              >
                <input
                  {...register("thumbnailUrl")}
                  className={`w-full ${managerInputClass}`}
                  placeholder="https://..."
                />
                <label className="mt-3 flex cursor-pointer items-center justify-center gap-2 rounded-xl border border-dashed border-sky-300 bg-sky-50 px-4 py-3 text-sm font-semibold text-sky-700 transition-colors hover:bg-sky-100">
                  <Upload size={18} />
                  {uploadingCourtImage ? "Đang upload..." : "Upload ảnh từ máy"}
                  <input
                    type="file"
                    accept="image/*"
                    className="hidden"
                    disabled={uploadingCourtImage}
                    onChange={(event) => {
                      const file = event.target.files?.[0];
                      handleUploadCourtImage(file);
                      event.target.value = "";
                    }}
                  />
                </label>
                {courtThumbnailUrl ? (
                  <div className="mt-3 overflow-hidden rounded-xl border border-gray-200 bg-gray-50">
                    <img
                      src={courtThumbnailUrl}
                      alt="Court preview"
                      className="h-32 w-full object-cover"
                    />
                  </div>
                ) : null}
              </ManagerField>

              <div className="flex justify-end gap-3 border-t border-slate-100 pt-5">
                <button
                  type="button"
                  onClick={closeModal}
                  className={managerSecondaryButtonClass}
                >
                  Hủy
                </button>
                <button type="submit" className={managerPrimaryButtonClass}>
                  {editingCourt ? "Lưu thay đổi" : "Tạo sân"}
                </button>
              </div>
            </form>
          </div>
        </ManagerModalOverlay>
      )}

      {/* MODAL PRICE FORM */}
      {showPriceForm && (
        <ManagerModalOverlay>
          <div className="w-full max-w-xl rounded-2xl bg-white shadow-sm animate-in fade-in zoom-in duration-200">
            <div className="flex items-center justify-between border-b border-slate-200 px-6 py-4">
              <div>
                <h2 className="text-lg font-bold text-slate-900">
                  Thêm bảng giá sân
                </h2>
                <p className="text-sm text-slate-500">
                  Thiết lập giá thuê theo thứ và khung giờ của chi nhánh.
                </p>
              </div>
              <button
                onClick={closePriceForm}
                className="flex h-9 w-9 items-center justify-center rounded-xl text-slate-500 hover:bg-slate-100"
                type="button"
              >
                <XCircle className="h-5 w-5" />
              </button>
            </div>
            <form
              onSubmit={handleSubmitPrice(onSubmitPrice)}
              className="space-y-5 p-6"
            >
              <div className="grid gap-4 md:grid-cols-2">
                <ManagerField
                  label="Thứ trong tuần"
                  error={errorsPrice.dayOfWeek?.message}
                  className="md:col-span-2"
                >
                  <select
                    {...registerPrice("dayOfWeek")}
                    className={`w-full ${managerInputClass}`}
                  >
                    <option value="">Chọn thứ</option>
                    {[
                      ["Monday", "Thứ hai"],
                      ["Tuesday", "Thứ ba"],
                      ["Wednesday", "Thứ tư"],
                      ["Thursday", "Thứ năm"],
                      ["Friday", "Thứ sáu"],
                      ["Saturday", "Thứ bảy"],
                      ["Sunday", "Chủ nhật"],
                    ].map(([value, label]) => (
                      <option key={value} value={value}>
                        {label}
                      </option>
                    ))}
                  </select>
                </ManagerField>

                <ManagerField
                  label="Bắt đầu"
                  error={errorsPrice.startTime?.message}
                >
                  <input
                    type="time"
                    {...registerPrice("startTime")}
                    className={`w-full ${managerInputClass}`}
                  />
                </ManagerField>

                <ManagerField
                  label="Kết thúc"
                  error={errorsPrice.endTime?.message}
                >
                  <input
                    type="time"
                    {...registerPrice("endTime")}
                    className={`w-full ${managerInputClass}`}
                  />
                </ManagerField>

                <ManagerField
                  label="Giá sân (VNĐ)"
                  error={errorsPrice.price?.message}
                  className="md:col-span-2"
                >
                  <input
                    type="number"
                    min={1000}
                    step={1000}
                    {...registerPrice("price", { valueAsNumber: true })}
                    className={`w-full ${managerInputClass}`}
                    placeholder="50000"
                  />
                </ManagerField>

                <ManagerField
                  label="Loại khung giờ"
                  error={errorsPrice.periodType?.message}
                  className="md:col-span-2"
                >
                  <select
                    {...registerPrice("periodType")}
                    className={`w-full ${managerInputClass}`}
                  >
                    <option value="">Chọn loại</option>
                    <option value="DAYTIME">Ban ngày (DAYTIME)</option>
                    <option value="EVENING">Buổi tối (EVENING)</option>
                    <option value="WEEKEND">Cuối tuần (WEEKEND)</option>
                  </select>
                </ManagerField>
              </div>

              <div className="flex justify-end gap-3 border-t border-slate-100 pt-5">
                <button
                  type="button"
                  onClick={closePriceForm}
                  className={managerSecondaryButtonClass}
                >
                  Hủy
                </button>
                <button type="submit" className={managerPrimaryButtonClass}>
                  Lưu bảng giá
                </button>
              </div>
            </form>
          </div>
        </ManagerModalOverlay>
      )}

      {/* LIST COURTS SECTION */}
      <section>
        <div className="flex items-center gap-2 mb-6">
          <div className="h-8 w-1.5 bg-sky-600 rounded-full"></div>
          <h2 className="text-xl font-bold text-slate-900">Danh sách sân</h2>
          <span className="ml-2 px-2 py-0.5 bg-sky-50 text-sky-700 text-xs font-bold rounded-md">
            {courts.length} sân
          </span>
        </div>

        {courts.length ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {paginatedCourts.map((court) => (
              <div
                key={court.id}
                className="group bg-white rounded-2xl overflow-hidden border border-slate-200 transition-all duration-300"
              >
                <div className="relative h-52 overflow-hidden">
                  <img
                    src={
                      court.thumbnailUrl ||
                      "https://images.unsplash.com/photo-1626224580194-27088b901b0b?q=80&w=2070&auto=format&fit=crop"
                    }
                    alt={court.courtName}
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                  />
                  <div className="absolute top-4 right-4">
                    <span
                      className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider border shadow-sm ${getStatusBadge(court.courtStatus)}`}
                    >
                      {court.courtStatus}
                    </span>
                  </div>
                </div>

                <div className="p-6">
                  <h3 className="font-bold text-xl text-slate-900 mb-1">
                    {court.courtName}
                  </h3>
                  <p className="text-slate-500 flex items-center gap-1.5 text-sm mb-4">
                    <MapPin size={14} /> {court.location}
                  </p>

                  <div className="grid grid-cols-3 gap-2 mt-4 pt-4 border-t border-gray-50">
                    <button
                      onClick={() => {
                        setShowForm(true);
                        setEditingCourt(court);
                        reset({
                          courtName: court.courtName,
                          location: court.location,
                          thumbnailUrl: court.thumbnailUrl,
                        });
                      }}
                      className="flex flex-col items-center gap-1 py-2 rounded-xl hover:bg-sky-50 text-sky-700 transition-colors"
                    >
                      <Edit2 size={16} />
                      <span className="text-[10px] font-bold">SỬA</span>
                    </button>
                    <button
                      onClick={() => handleMaintenanceCourt(court.id)}
                      className="flex flex-col items-center gap-1 py-2 rounded-xl hover:bg-yellow-50 text-yellow-600 transition-colors"
                    >
                      <Wrench size={16} />
                      <span className="text-[10px] font-bold">BẢO TRÌ</span>
                    </button>
                    <button
                      onClick={() => handleCloseCourt(court.id)}
                      className="flex flex-col items-center gap-1 py-2 rounded-xl hover:bg-red-50 text-red-600 transition-colors"
                    >
                      <XCircle size={16} />
                      <span className="text-[10px] font-bold">ĐÓNG</span>
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <ManagerEmptyState
            icon={ImageIcon}
            title="Chưa có sân nào"
            description="Thêm sân mới để khách có thể xem lịch và đặt sân tại chi nhánh."
          />
        )}
        {courts.length ? (
          <div className="mt-4 overflow-hidden rounded-2xl border border-slate-200 bg-white">
            <TablePagination
              page={courtPage}
              totalPages={courtTotalPages}
              total={courts.length}
              onPage={setCourtPage}
              unit="sân"
            />
          </div>
        ) : null}
      </section>

      {/* LIST COURT PRICES SECTION */}
      <section>
        <div className="flex items-center gap-2 mb-6">
          <div className="h-8 w-1.5 bg-sky-600 rounded-full"></div>
          <h2 className="text-xl font-bold text-slate-900">Cấu hình giá sân</h2>
        </div>

        <div className={`${managerCardClass} overflow-hidden`}>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-slate-100 bg-slate-50 text-left text-xs uppercase tracking-wide text-slate-500">
                  <th className="px-4 py-3 font-semibold">#</th>
                  <th className="px-4 py-3 font-semibold">Thứ</th>
                  <th className="px-4 py-3 font-semibold">Khung giờ</th>
                  <th className="px-4 py-3 font-semibold">Phân loại</th>
                  <th className="px-4 py-3 text-right font-semibold">
                    Giá tiền
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 [&_td]:align-top">
                {courtPrices.map((item, index) => (
                  <tr
                    key={item.id}
                    className="hover:bg-sky-50/60 transition-colors"
                  >
                    <td className="px-4 py-3 text-slate-400">{index + 1}</td>
                    <td className="px-4 py-3 text-slate-700">
                      {item.dayOfWeek}
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2 text-slate-600">
                        <Clock size={14} className="text-sky-600" />
                        <span>
                          {item.startTime} - {item.endTime}
                        </span>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <span className="rounded bg-slate-100 px-2 py-1 text-xs font-bold uppercase text-slate-600">
                        {item.periodType}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-right">
                      <span className="font-bold text-sky-700">
                        {item.price.toLocaleString()}{" "}
                        <span className="text-xs">VNĐ</span>
                      </span>
                    </td>
                  </tr>
                ))}
                {courtPrices.length === 0 && (
                  <tr>
                    <td colSpan={5} className="px-4 py-12">
                      <ManagerEmptyState
                        icon={DollarSign}
                        title="Chưa có cấu hình giá sân"
                        description="Thêm giá theo ngày và khung giờ để hệ thống tính tiền đặt sân."
                      />
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </section>
    </div>
  );
};

const ManagerField = ({
  label,
  error,
  children,
  className = "",
}: {
  label: string;
  error?: string;
  children: ReactNode;
  className?: string;
}) => (
  <div className={className}>
    <label className="mb-1 block text-xs font-medium text-slate-600">
      {label}
    </label>
    {children}
    {error ? <p className="mt-1 text-xs text-rose-600">{error}</p> : null}
  </div>
);

export default BranchPage;
