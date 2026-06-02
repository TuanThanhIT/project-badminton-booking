import { useState, useEffect, useRef } from "react";
import { Store, X, Upload, ChevronDown, ChevronUp } from "lucide-react";
import { toast } from "react-toastify";
import { MapContainer, TileLayer, Marker, useMapEvents, useMap } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import adminBranchService, {
  type CreateBranchData,
  type UpdateBranchData,
} from "../../../../services/admin/branchService";
import adminUploadService from "../../../../services/admin/uploadService";
import type { AdminBranch } from "../../../../types/admin";
import AdminModal, {
  adminInputClass,
  adminPrimaryButtonClass,
  adminSecondaryButtonClass,
  adminTextAreaClass,
} from "../AdminModal";
import {
  AdminBranchFormSchema,
  AdminBranchUpdateFormSchema,
} from "../../../../schemas/AdminFormSchemas";
import locationService from "../../../../services/user/locationService";
import type { District, Province, Ward } from "../../../../types/address";

delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
  iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
  shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
});

const MAP_DEFAULT_CENTER: [number, number] = [10.7769, 106.7009];

const ChangeMapView = ({ center }: { center: [number, number] }) => {
  const map = useMap();
  map.setView(center, 15);
  return null;
};

type BranchFormModalProps = {
  branch?: AdminBranch | null;
  onClose: () => void;
  onSuccess: () => void;
};

const BranchFormModal = ({ branch, onClose, onSuccess }: BranchFormModalProps) => {
  const isEdit = !!branch;

  const [form, setForm] = useState<CreateBranchData>({
    branchName: "", phoneNumber: "", description: "", address: "",
    districtName: "", provinceName: "", wardName: "",
    provinceId: 0, districtId: 0, wardCode: "", latitude: 0, longitude: 0,
  });
  const [loading, setLoading]         = useState(false);
  const [errors,  setErrors]          = useState<Record<string, string>>({});
  const [previewDesc, setPreviewDesc] = useState(false);
  const [showTechnical, setShowTechnical] = useState(false);
  const [marker, setMarker] = useState<[number, number] | null>(null);
  const [provinces, setProvinces] = useState<Province[]>([]);
  const [districts, setDistricts] = useState<District[]>([]);
  const [wards, setWards] = useState<Ward[]>([]);
  const [loadingProvinces, setLoadingProvinces] = useState(false);
  const [loadingDistricts, setLoadingDistricts] = useState(false);
  const [loadingWards, setLoadingWards] = useState(false);
  const [images, setImages]           = useState<{ id: number; imageUrl: string }[]>([]);
  const [uploadingImg, setUploadingImg] = useState(false);
  const imgInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const loadProvinces = async () => {
      try {
        setLoadingProvinces(true);
        const data = await locationService.getProvincesService();
        setProvinces(data);
      } catch {
        toast.error("Không lấy được dữ liệu tỉnh/thành từ GHN");
      } finally {
        setLoadingProvinces(false);
      }
    };

    loadProvinces();
  }, []);

  useEffect(() => {
    if (branch) {
      adminBranchService.getAdminBranchDetailService(branch.id).then((res) => {
        const d = (res.data as any).data;
        setForm({
          branchName: d.branchName || "", phoneNumber: d.phoneNumber || "",
          description: d.description || "", address: d.address || "",
          districtName: d.districtName || "", provinceName: d.provinceName || "",
          wardName: d.wardName || "", provinceId: d.provinceId || 0,
          districtId: d.districtId || 0, wardCode: d.wardCode || "",
          latitude: d.latitude || 0, longitude: d.longitude || 0,
          ghnShopId: d.ghnShopId || undefined,
        });
        if (d.latitude && d.longitude) setMarker([d.latitude, d.longitude]);
        setImages(d.images || []);
      });
    }
  }, [branch]);

  useEffect(() => {
    if (!form.provinceId) {
      setDistricts([]);
      return;
    }

    const loadDistricts = async () => {
      try {
        setLoadingDistricts(true);
        const data = await locationService.getDistrictsService(form.provinceId);
        setDistricts(data);
      } catch {
        toast.error("Không lấy được dữ liệu quận/huyện từ GHN");
      } finally {
        setLoadingDistricts(false);
      }
    };

    loadDistricts();
  }, [form.provinceId]);

  useEffect(() => {
    if (!form.districtId) {
      setWards([]);
      return;
    }

    const loadWards = async () => {
      try {
        setLoadingWards(true);
        const data = await locationService.getWardsService(form.districtId);
        setWards(data);
      } catch {
        toast.error("Không lấy được dữ liệu phường/xã từ GHN");
      } finally {
        setLoadingWards(false);
      }
    };

    loadWards();
  }, [form.districtId]);

  const handleAddImage = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !branch) return;
    setUploadingImg(true);
    try {
      const uploadRes = await adminUploadService.uploadImageService(file);
      const imageUrl  = (uploadRes.data as any).data?.url;
      const res = await adminBranchService.addBranchImageService(branch.id, { imageUrl });
      setImages((prev) => [...prev, (res.data as any).data]);
      toast.success("Đã thêm ảnh");
    } catch { toast.error("Upload ảnh thất bại"); }
    finally {
      setUploadingImg(false);
      if (imgInputRef.current) imgInputRef.current.value = "";
    }
  };

  const handleDeleteImage = async (imageId: number) => {
    if (!branch) return;
    try {
      await adminBranchService.deleteBranchImageService(branch.id, imageId);
      setImages((prev) => prev.filter((img) => img.id !== imageId));
      toast.success("Đã xóa ảnh");
    } catch { toast.error("Không thể xóa ảnh"); }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const parsed = (isEdit ? AdminBranchUpdateFormSchema : AdminBranchFormSchema).safeParse(form);
    if (!parsed.success) {
      setErrors(Object.fromEntries(parsed.error.issues.map((issue) => [issue.path[0], issue.message])));
      return;
    }
    setErrors({});
    setLoading(true);
    try {
      if (isEdit) {
        const upd: UpdateBranchData = {
          branchName: form.branchName, phoneNumber: form.phoneNumber,
          description: form.description, address: form.address,
          districtName: form.districtName, provinceName: form.provinceName,
          wardName: form.wardName, provinceId: form.provinceId,
          districtId: form.districtId, wardCode: form.wardCode,
          latitude: form.latitude || undefined,
          longitude: form.longitude || undefined,
        };
        await adminBranchService.updateBranchService(branch!.id, upd);
        toast.success("Cập nhật chi nhánh thành công");
      } else {
        await adminBranchService.createBranchService(form);
        toast.success("Tạo chi nhánh thành công");
      }
      onSuccess(); onClose();
    } catch (err: any) {
      toast.error(err?.message || "Có lỗi xảy ra");
    } finally { setLoading(false); }
  };

  type FieldDef = { label: string; key: keyof CreateBranchData; type?: string; rows?: number };
  const basicFields: FieldDef[] = [
    { label: "Tên chi nhánh *", key: "branchName" },
    { label: "Số điện thoại *", key: "phoneNumber" },
    { label: "Mô tả",           key: "description", rows: 3 },
    { label: "Địa chỉ *",       key: "address" },
  ];
  const technicalFields: FieldDef[] = [
    { label: "GHN Shop ID",   key: "ghnShopId",  type: "number" },
  ];

  const handleProvinceChange = (value: string) => {
    const provinceId = Number(value) || 0;
    const province = provinces.find((item) => item.ProvinceID === provinceId);
    setForm((prev) => ({
      ...prev,
      provinceId,
      provinceName: province?.ProvinceName || "",
      districtId: 0,
      districtName: "",
      wardCode: "",
      wardName: "",
    }));
    setDistricts([]);
    setWards([]);
    setErrors((prev) => ({
      ...prev,
      provinceId: "",
      provinceName: "",
      districtId: "",
      districtName: "",
      wardCode: "",
      wardName: "",
    }));
  };

  const handleDistrictChange = (value: string) => {
    const districtId = Number(value) || 0;
    const district = districts.find((item) => item.DistrictID === districtId);
    setForm((prev) => ({
      ...prev,
      districtId,
      districtName: district?.DistrictName || "",
      wardCode: "",
      wardName: "",
    }));
    setWards([]);
    setErrors((prev) => ({
      ...prev,
      districtId: "",
      districtName: "",
      wardCode: "",
      wardName: "",
    }));
  };

  const handleWardChange = (value: string) => {
    const ward = wards.find((item) => item.WardCode === value);
    setForm((prev) => ({
      ...prev,
      wardCode: value,
      wardName: ward?.WardName || "",
    }));
    setErrors((prev) => ({ ...prev, wardCode: "", wardName: "" }));
  };

  const MapClick = () => {
    useMapEvents({
      click(e) {
        const lat = e.latlng.lat;
        const lng = e.latlng.lng;
        setMarker([lat, lng]);
        setForm((prev) => ({ ...prev, latitude: lat, longitude: lng }));
        setErrors((prev) => ({ ...prev, latitude: "" }));
      },
    });
    return marker ? <Marker position={marker} /> : null;
  };

  return (
    <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-5xl max-h-[90vh] overflow-y-auto border border-gray-200">
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 bg-gray-50 rounded-t-2xl sticky top-0 z-10">
          <div className="flex items-center gap-2">
            <Store className="w-5 h-5 text-sky-600" />
            <h2 className="text-base font-bold text-gray-800">
              {isEdit ? "Cập nhật chi nhánh" : "Tạo chi nhánh mới"}
            </h2>
          </div>
          <button onClick={onClose} className="w-7 h-7 rounded-lg hover:bg-gray-200 flex items-center justify-center transition">
            <X className="w-4 h-4 text-gray-500" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 grid grid-cols-1 md:grid-cols-3 gap-4">
          {basicFields.map(({ label, key, type, rows }) =>
            key === "description" ? (
              <div key={key} className="md:col-span-3">
                <div className="flex items-center justify-between mb-1">
                  <label className="text-sm font-semibold text-slate-700">{label}</label>
                  {String(form[key] ?? "") && (
                    <button type="button" onClick={() => setPreviewDesc(!previewDesc)}
                      className="text-xs text-sky-600 hover:text-sky-700 font-medium transition">
                      {previewDesc ? "Chỉnh sửa" : "Xem trước"}
                    </button>
                  )}
                </div>
                {previewDesc ? (
                  <div
                    className="w-full min-h-[80px] max-h-[220px] overflow-y-auto px-3 py-2 rounded-lg border border-sky-200 bg-sky-50/30 text-sm prose prose-sm max-w-none"
                    dangerouslySetInnerHTML={{ __html: String(form[key] ?? "") }}
                  />
                ) : (
                  <textarea rows={rows || 3} value={String(form[key] ?? "")}
                    onChange={(e) => { setForm({ ...form, [key]: e.target.value }); setErrors({ ...errors, [key]: "" }); }}
                    className={`w-full resize-none ${adminTextAreaClass}`} />
                )}
                {errors[key] && <p className="mt-1 text-xs text-rose-600">{errors[key]}</p>}
              </div>
            ) : (
              <div key={key} className={rows ? "md:col-span-3" : ""}>
                <label className="block text-xs font-medium text-gray-700 mb-1">{label}</label>
                {rows ? (
                  <textarea rows={rows} value={String(form[key] ?? "")}
                    onChange={(e) => { setForm({ ...form, [key]: e.target.value }); setErrors({ ...errors, [key]: "" }); }}
                    className={`w-full resize-none ${adminTextAreaClass}`} />
                ) : (
                  <input type={type || "text"} value={String(form[key] ?? "")}
                    onChange={(e) => {
                      const val = type === "number" ? (e.target.value === "" ? 0 : Number(e.target.value)) : e.target.value;
                      setForm({ ...form, [key]: val }); setErrors({ ...errors, [key]: "" });
                    }}
                    className={`w-full ${adminInputClass}`} />
                )}
                {errors[key] && <p className="mt-1 text-xs text-rose-600">{errors[key]}</p>}
              </div>
            )
          )}

          {/* Map picker */}
          <div className="md:col-span-3">
            <div className="mb-1 flex items-center justify-between">
              <label className="text-sm font-semibold text-slate-700">
                Vị trí trên bản đồ {!isEdit && <span className="text-red-500">*</span>}
              </label>
              {marker ? (
                <span className="text-xs text-gray-400 font-mono">
                  {marker[0].toFixed(6)}, {marker[1].toFixed(6)}
                </span>
              ) : (
                <span className="text-xs text-gray-400 italic">Bấm vào bản đồ để chọn vị trí</span>
              )}
            </div>
            {errors.latitude && <p className="mb-1 text-xs text-rose-600">{errors.latitude}</p>}
            <div className="h-[280px] rounded-xl overflow-hidden border border-gray-300">
              <MapContainer center={marker ?? MAP_DEFAULT_CENTER} zoom={13} style={{ height: "100%", width: "100%" }}>
                <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
                {marker && <ChangeMapView center={marker} />}
                <MapClick />
              </MapContainer>
            </div>
          </div>

          {/* Technical fields - collapsible */}
          <div className="md:col-span-3">
            <button type="button" onClick={() => setShowTechnical(!showTechnical)}
              className="w-full flex items-center justify-between px-3 py-2 rounded-lg bg-gray-50 border border-gray-200 text-xs font-semibold text-gray-500 hover:bg-gray-100 transition">
              <span>Cài đặt kỹ thuật (GHN, tọa độ)</span>
              {showTechnical ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
            </button>
            {showTechnical && (
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mt-3 p-3 rounded-lg bg-gray-50/60 border border-gray-100">
                {technicalFields.map(({ label, key, type }) => (
                  <div key={key}>
                    <label className="mb-1 block text-sm font-semibold text-slate-700">{label}</label>
                    <input type={type || "text"} value={String(form[key] ?? "")}
                      onChange={(e) => {
                        const val = type === "number" ? (e.target.value === "" ? 0 : Number(e.target.value)) : e.target.value;
                        setForm({ ...form, [key]: val }); setErrors({ ...errors, [key]: "" });
                      }}
                      className={`w-full ${adminInputClass}`} />
                    {errors[key] && <p className="mt-1 text-xs text-rose-600">{errors[key]}</p>}
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Image management — edit mode only */}
          {isEdit && (
            <div className="md:col-span-3">
              <div className="flex items-center justify-between mb-2">
                <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
                  Hình ảnh ({images.length})
                </label>
                <button type="button" onClick={() => imgInputRef.current?.click()} disabled={uploadingImg}
                  className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-medium bg-sky-50 text-sky-600 hover:bg-sky-100 border border-sky-200 transition disabled:opacity-60">
                  {uploadingImg
                    ? <div className="w-3 h-3 border-2 border-sky-500 border-t-transparent rounded-full animate-spin" />
                    : <Upload className="w-3 h-3" />}
                  Thêm ảnh
                </button>
                <input ref={imgInputRef} type="file" accept="image/*" className="hidden" onChange={handleAddImage} />
              </div>
              {images.length > 0 ? (
                <div className="grid grid-cols-2 md:grid-cols-5 gap-2">
                  {images.map((img) => (
                    <div key={img.id} className="relative group rounded-xl overflow-hidden border border-gray-200 aspect-square bg-gray-50">
                      <img src={img.imageUrl} alt="" className="w-full h-full object-cover" />
                      <button type="button" onClick={() => handleDeleteImage(img.id)}
                        className="absolute top-1 right-1 w-5 h-5 rounded-full bg-red-500 text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition shadow">
                        <X className="w-3 h-3" />
                      </button>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="flex flex-col items-center py-5 rounded-xl border border-dashed border-gray-200 bg-gray-50">
                  <Upload className="w-5 h-5 text-gray-300 mb-1" />
                  <p className="text-xs text-gray-400">Chưa có hình ảnh · Nhấn "Thêm ảnh" để upload</p>
                </div>
              )}
            </div>
          )}

          <div className="md:col-span-3 flex gap-3 pt-2 border-t border-gray-100">
            <button type="button" onClick={onClose}
              className={adminSecondaryButtonClass}>
              Hủy
            </button>
            <button type="submit" disabled={loading}
              className={adminPrimaryButtonClass}>
              {loading ? "Đang lưu..." : isEdit ? "Cập nhật" : "Tạo chi nhánh"}
            </button>
          </div>
        </form>
    </AdminModal>
  );
};

export default BranchFormModal;
