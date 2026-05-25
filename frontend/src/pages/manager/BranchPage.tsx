import { useState, useEffect } from "react";
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
  Calendar,
  Image as ImageIcon,
  ChevronRight,
  Info,
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
} from "../../redux/slices/manager/courtSlice";
import { getMyBranch } from "../../redux/slices/manager/branchSlice";

const BranchPage = () => {
  const dispatch = useAppDispatch();
  const [showForm, setShowForm] = useState(false);
  const [showPriceForm, setShowPriceForm] = useState(false);
  const [editingCourt, setEditingCourt] = useState<any>(null);

  const { courts, courtPrices } = useAppSelector((state) => state.managerCourt);
  const { branch } = useAppSelector((state) => state.managerBranch);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<FormCreateCourt>({
    resolver: zodResolver(FormCreateCourtSchema),
  });

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
        alert("Cập nhật sân thành công");
      } else {
        await dispatch(createCourt(data)).unwrap();
        alert("Tạo sân thành công");
      }
      await dispatch(getCourts());
      closeModal();
    } catch (error) {
      console.log(error);
    }
  };

  const onSubmitPrice = async (data: FormCreateCourtPrice) => {
    try {
      await dispatch(createCourtPrice(data)).unwrap();
      alert("Thêm giá sân thành công");
      resetPrice();
      setShowPriceForm(false);
    } catch (error) {
      console.log(error);
    }
  };

  const closeModal = () => {
    setShowForm(false);
    setEditingCourt(null);
    reset();
  };

  const handleMaintenanceCourt = async (courtId: number) => {
    await dispatch(maintenanceCourt(courtId));
    dispatch(getCourts());
  };

  const handleCloseCourt = async (courtId: number) => {
    await dispatch(closeCourt(courtId));
    dispatch(getCourts());
  };

  useEffect(() => {
    dispatch(getCourts());
    dispatch(getCourtPrices());
    dispatch(getMyBranch());
  }, [dispatch]);

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
    <div className="p-8 bg-gray-50 min-h-screen">
      {/* HEADER SECTION */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
        <div>
          <h1 className="text-3xl font-extrabold text-gray-900 tracking-tight">
            Quản lý cửa hàng
          </h1>
          <p className="text-gray-500 flex items-center gap-1 mt-1">
            <Info size={16} /> Quản lý hoạt động và cấu hình chi nhánh B-Hub
          </p>
        </div>
        <div className="flex gap-3">
          <button
            onClick={() => setShowPriceForm(true)}
            className="flex items-center gap-2 bg-white border border-orange-200 text-orange-600 px-5 py-2.5 rounded-xl font-semibold shadow-sm hover:bg-orange-50 transition-all"
          >
            <DollarSign size={18} /> Thêm giá sân
          </button>
          <button
            onClick={() => setShowForm(true)}
            className="flex items-center gap-2 bg-blue-600 text-white px-5 py-2.5 rounded-xl font-semibold shadow-md hover:bg-blue-700 transition-all transform hover:-translate-y-0.5"
          >
            <Plus size={18} /> Thêm sân mới
          </button>
        </div>
      </div>

      {/* BRANCH INFO CARD */}
      {branch && (
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 mb-10 flex flex-col md:flex-row justify-between items-center transition-all hover:shadow-md">
          <div className="flex gap-6 items-center">
            <div className="w-16 h-16 bg-blue-100 rounded-2xl flex items-center justify-center text-blue-600">
              <ImageIcon size={32} />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-gray-800">
                {branch.branchName}
              </h2>
              <div className="flex flex-col gap-1 mt-2">
                <p className="text-gray-500 flex items-center gap-2 text-sm">
                  <MapPin size={14} className="text-blue-500" />{" "}
                  {branch.address}, {branch.districtName}, {branch.provinceName}
                </p>
                <p className="text-gray-500 flex items-center gap-2 text-sm">
                  <Phone size={14} className="text-blue-500" />{" "}
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
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl w-full max-w-md shadow-2xl overflow-hidden animate-in fade-in zoom-in duration-200">
            <div className="p-6 border-b flex justify-between items-center bg-gray-50">
              <h3 className="text-xl font-bold">
                {editingCourt ? "Cập nhật sân" : "Tạo sân mới"}
              </h3>
              <button
                onClick={closeModal}
                className="p-2 hover:bg-gray-200 rounded-full transition-colors"
              >
                <XCircle size={20} />
              </button>
            </div>
            <form onSubmit={handleSubmit(onSubmit)} className="p-6 space-y-5">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Tên sân
                </label>
                <input
                  {...register("courtName")}
                  className="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:ring-2 focus:ring-blue-500 outline-none transition-all"
                  placeholder="VD: Sân 01"
                />
                {errors.courtName && (
                  <p className="text-red-500 text-xs mt-1">
                    {errors.courtName.message}
                  </p>
                )}
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Vị trí trong kho
                </label>
                <input
                  {...register("location")}
                  className="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:ring-2 focus:ring-blue-500 outline-none transition-all"
                  placeholder="VD: Khu A"
                />
                {errors.location && (
                  <p className="text-red-500 text-xs mt-1">
                    {errors.location.message}
                  </p>
                )}
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Hình ảnh (URL)
                </label>
                <input
                  {...register("thumbnailUrl")}
                  className="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:ring-2 focus:ring-blue-500 outline-none transition-all"
                  placeholder="https://..."
                />
              </div>
              <button
                type="submit"
                className="w-full bg-blue-600 text-white py-3 rounded-xl font-bold shadow-lg hover:bg-blue-700 transition-all mt-4"
              >
                {editingCourt ? "Lưu thay đổi" : "Tạo sân ngay"}
              </button>
            </form>
          </div>
        </div>
      )}

      {/* MODAL PRICE FORM */}
      {showPriceForm && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl w-full max-w-md shadow-2xl animate-in fade-in zoom-in duration-200">
            <div className="p-6 border-b flex justify-between items-center bg-gray-50">
              <h3 className="text-xl font-bold text-orange-600">
                Thêm bảng giá sân
              </h3>
              <button
                onClick={() => setShowPriceForm(false)}
                className="p-2 hover:bg-gray-200 rounded-full"
              >
                <XCircle size={20} />
              </button>
            </div>
            <form
              onSubmit={handleSubmitPrice(onSubmitPrice)}
              className="p-6 space-y-4"
            >
              <div className="grid grid-cols-2 gap-4">
                <div className="col-span-2">
                  <label className="text-sm font-medium">Thứ trong tuần</label>
                  <select
                    {...registerPrice("dayOfWeek")}
                    className="w-full mt-1 px-4 py-2 border rounded-xl"
                  >
                    <option value="">Chọn thứ</option>
                    {[
                      "Monday",
                      "Tuesday",
                      "Wednesday",
                      "Thursday",
                      "Friday",
                      "Saturday",
                      "Sunday",
                    ].map((d) => (
                      <option key={d} value={d}>
                        {d}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-600">
                    Bắt đầu
                  </label>
                  <input
                    type="time"
                    {...registerPrice("startTime")}
                    className="w-full mt-1 px-4 py-2 border rounded-xl"
                  />
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-600">
                    Kết thúc
                  </label>
                  <input
                    type="time"
                    {...registerPrice("endTime")}
                    className="w-full mt-1 px-4 py-2 border rounded-xl"
                  />
                </div>
                <div className="col-span-2">
                  <label className="text-sm font-medium">Giá sân (VNĐ)</label>
                  <input
                    type="number"
                    {...registerPrice("price", { valueAsNumber: true })}
                    className="w-full mt-1 px-4 py-2 border rounded-xl"
                    placeholder="50000"
                  />
                </div>
                <div className="col-span-2">
                  <label className="text-sm font-medium">Loại khung giờ</label>
                  <select
                    {...registerPrice("periodType")}
                    className="w-full mt-1 px-4 py-2 border rounded-xl"
                  >
                    <option value="">Chọn loại</option>
                    <option value="DAYTIME">Ban ngày (DAYTIME)</option>
                    <option value="EVENING">Buổi tối (EVENING)</option>
                    <option value="WEEKEND">Cuối tuần (WEEKEND)</option>
                  </select>
                </div>
              </div>
              <button
                type="submit"
                className="w-full bg-orange-500 text-white py-3 rounded-xl font-bold shadow-lg hover:bg-orange-600 transition-all mt-4"
              >
                Lưu bảng giá
              </button>
            </form>
          </div>
        </div>
      )}

      {/* LIST COURTS SECTION */}
      <section className="mb-12">
        <div className="flex items-center gap-2 mb-6">
          <div className="h-8 w-1.5 bg-blue-600 rounded-full"></div>
          <h2 className="text-2xl font-bold text-gray-800">Danh sách sân</h2>
          <span className="ml-2 px-2 py-0.5 bg-blue-100 text-blue-600 text-xs font-bold rounded-md">
            {courts.length} sân
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {courts.map((court) => (
            <div
              key={court.id}
              className="group bg-white rounded-[2rem] overflow-hidden shadow-sm border border-gray-100 hover:shadow-xl transition-all duration-300"
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
                <h3 className="font-extrabold text-xl text-gray-800 mb-1">
                  {court.courtName}
                </h3>
                <p className="text-gray-400 flex items-center gap-1.5 text-sm mb-4">
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
                    className="flex flex-col items-center gap-1 py-2 rounded-xl hover:bg-blue-50 text-blue-600 transition-colors"
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
      </section>

      {/* LIST COURT PRICES SECTION */}
      <section>
        <div className="flex items-center gap-2 mb-6">
          <div className="h-8 w-1.5 bg-orange-500 rounded-full"></div>
          <h2 className="text-2xl font-bold text-gray-800">Cấu hình giá sân</h2>
        </div>

        <div className="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-gray-50 text-gray-500 uppercase text-[10px] font-bold tracking-widest">
                  <th className="px-6 py-4">Thứ</th>
                  <th className="px-6 py-4">Khung giờ</th>
                  <th className="px-6 py-4">Phân loại</th>
                  <th className="px-6 py-4 text-right">Giá tiền</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {courtPrices.map((item) => (
                  <tr
                    key={item.id}
                    className="hover:bg-orange-50/30 transition-colors"
                  >
                    <td className="px-6 py-4 font-bold text-gray-700">
                      {item.dayOfWeek}
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2 text-gray-600">
                        <Clock size={14} className="text-orange-400" />
                        <span className="font-medium">
                          {item.startTime} - {item.endTime}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className="px-2 py-1 bg-gray-100 text-gray-600 rounded text-[10px] font-bold uppercase tracking-tighter">
                        {item.periodType}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <span className="text-lg font-black text-orange-600 tracking-tight">
                        {item.price.toLocaleString()}{" "}
                        <span className="text-xs">VNĐ</span>
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </section>
    </div>
  );
};

export default BranchPage;
