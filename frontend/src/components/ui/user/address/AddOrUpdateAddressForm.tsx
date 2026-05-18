import { useEffect, useState } from "react";
import {
  MapContainer,
  TileLayer,
  Marker,
  useMapEvents,
  useMap,
} from "react-leaflet";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { type LatLngExpression } from "leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import { toast } from "react-toastify";
import { Building2, Home, MapPinHouse, X } from "lucide-react";
import {
  FormAddAddressSchema,
  type AddOrUpdateAddressPayload,
  type FormAddAddress,
} from "../../../../schemas/FormAddAddressSchema";
import { useAppSelector } from "../../../../redux/hook";
import type {
  Address,
  District,
  Province,
  Ward,
} from "../../../../types/address";
import locationService from "../../../../services/user/locationService";
import { showConfirmDialog } from "../../../../utils/swalHelper";

delete (L.Icon.Default.prototype as any)._getIconUrl;

L.Icon.Default.mergeOptions({
  iconRetinaUrl:
    "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
  iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
  shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
});

const defaultCenter: LatLngExpression = [10.7769, 106.7009];

const inputClass =
  "w-full rounded-2xl border border-slate-300 bg-white px-4 py-2.5 text-sm text-slate-700 outline-none transition placeholder:text-slate-400 hover:border-sky-300 focus:border-sky-500 focus:ring-4 focus:ring-sky-100";

const labelClass = "text-sm font-medium text-slate-600";

const ChangeMapView = ({ center }: { center: [number, number] }) => {
  const map = useMap();
  map.setView(center, 15);
  return null;
};

type Props = {
  setOpenAdd: (open: boolean) => void;
  setOpen: (open: boolean) => void;
  onSubmitAddress: (data: AddOrUpdateAddressPayload) => void;
  onUpdateAddress?: (data: AddOrUpdateAddressPayload) => void;
  address?: Address;
  setEditing: (data: Address | null) => void;
};

const AddOrUpdateAddressForm = ({
  setOpenAdd,
  setOpen,
  onSubmitAddress,
  onUpdateAddress,
  address,
  setEditing,
}: Props) => {
  const hasDefault = useAppSelector(
    (state) => state.address.userAddresses?.hasDefault,
  );

  const isEdit = !!address;

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    reset,
    formState: { errors, isDirty },
  } = useForm<FormAddAddress>({
    resolver: zodResolver(FormAddAddressSchema),
    defaultValues: {
      fullName: "",
      phoneNumber: "",
      address: "",
      provinceId: "",
      districtId: "",
      wardCode: "",
      label: "HOME",
      latitude: null,
      longitude: null,
      isDefault: !hasDefault,
    },
  });

  const provinceId = watch("provinceId");
  const districtId = watch("districtId");
  const isDefaultValue = watch("isDefault");
  const labelValue = watch("label");

  const [marker, setMarker] = useState<[number, number] | null>(null);
  const [provinces, setProvinces] = useState<Province[]>([]);
  const [districts, setDistricts] = useState<District[]>([]);
  const [wards, setWards] = useState<Ward[]>([]);

  useEffect(() => {
    if (!hasDefault && !isEdit) setValue("isDefault", true);
  }, [hasDefault, isEdit, setValue]);

  useEffect(() => {
    const load = async () => {
      try {
        const data = await locationService.getProvincesService();
        setProvinces(data);
      } catch {
        toast.error("Không lấy được dữ liệu tỉnh");
      }
    };

    load();
  }, []);

  useEffect(() => {
    if (!provinceId) return;

    const load = async () => {
      try {
        const data = await locationService.getDistrictsService(Number(provinceId));
        setDistricts(data);

        if (!isEdit) {
          setValue("districtId", "");
          setValue("wardCode", "");
          setWards([]);
        }
      } catch {
        toast.error("Không lấy được dữ liệu quận");
      }
    };

    load();
  }, [provinceId, isEdit, setValue]);

  useEffect(() => {
    if (!districtId) return;

    const load = async () => {
      try {
        const data = await locationService.getWardsService(Number(districtId));
        setWards(data);

        if (!isEdit) setValue("wardCode", "");
      } catch {
        toast.error("Không lấy được dữ liệu phường");
      }
    };

    load();
  }, [districtId, isEdit, setValue]);

  useEffect(() => {
    if (!address) return;

    const loadEdit = async () => {
      try {
        const resDistrict = await locationService.getDistrictsService(
          Number(address.provinceId),
        );
        const resWard = await locationService.getWardsService(
          Number(address.districtId),
        );

        setDistricts(resDistrict);
        setWards(resWard);

        reset({
          fullName: address.fullName,
          phoneNumber: address.phoneNumber,
          address: address.address,
          provinceId: String(address.provinceId),
          districtId: String(address.districtId),
          wardCode: address.wardCode,
          label: address.label as "HOME" | "OFFICE",
          latitude: address.latitude,
          longitude: address.longitude,
          isDefault: address.isDefault,
        });

        if (address.latitude && address.longitude) {
          setMarker([address.latitude, address.longitude]);
        }
      } catch {
        toast.error("Không load được địa chỉ");
      }
    };

    loadEdit();
  }, [address, reset]);

  const MapClick = () => {
    useMapEvents({
      click(e) {
        const lat = e.latlng.lat;
        const lng = e.latlng.lng;
        setMarker([lat, lng]);
        setValue("latitude", lat);
        setValue("longitude", lng);
      },
    });

    return marker ? <Marker position={marker} /> : null;
  };

  const onSubmit = (data: FormAddAddress) => {
    if (!marker) {
      toast.error("Vui lòng chọn vị trí trên bản đồ");
      return;
    }

    const [lat, lng] = marker;
    const provinceName = provinces.find(
      (p) => p.ProvinceID === Number(data.provinceId),
    )?.ProvinceName;
    const districtName = districts.find(
      (d) => d.DistrictID === Number(data.districtId),
    )?.DistrictName;
    const wardName = wards.find((w) => w.WardCode === data.wardCode)?.WardName;

    if (!provinceName || !districtName || !wardName) return;

    const payload: AddOrUpdateAddressPayload = {
      ...data,
      latitude: lat,
      longitude: lng,
      provinceName,
      districtName,
      wardName,
      addressId: address?.id,
    };

    if (isEdit && onUpdateAddress) onUpdateAddress(payload);
    else onSubmitAddress(payload);

    setOpenAdd(false);
    setOpen(true);
  };

  const handleClose = async () => {
    if (isDirty) {
      const confirmedExit = await showConfirmDialog(
        "Xác nhận thoát",
        "Bạn có thay đổi chưa lưu. Bạn có chắc muốn thoát không?",
        "Chắc chắn",
        "Hủy",
      );

      if (!confirmedExit) return;
    }

    setOpenAdd(false);
    setOpen(true);
    setEditing(null);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/45 px-4">
      <div className="flex h-[86vh] w-full max-w-5xl flex-col overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-2xl">
        <div className="flex shrink-0 items-center justify-between border-b border-slate-100 px-5 py-4 sm:px-6">
          <div>
            <h2 className="flex items-center gap-2 text-lg font-semibold text-slate-800">
              <MapPinHouse size={20} className="text-sky-600" />
              {isEdit ? "Cập nhật địa chỉ" : "Thêm địa chỉ mới"}
            </h2>
            <p className="mt-1 text-sm text-slate-500">
              Điền thông tin và chọn vị trí giao hàng trên bản đồ.
            </p>
          </div>

          <button
            type="button"
            onClick={handleClose}
            className="flex h-10 w-10 items-center justify-center rounded-full text-slate-400 transition hover:bg-slate-100 hover:text-slate-700"
          >
            <X size={20} />
          </button>
        </div>

        <div className="min-h-0 flex-1 overflow-y-auto bg-slate-50 p-4 sm:p-5">
          <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
            <div className="space-y-4 rounded-2xl border border-slate-200 bg-white p-4 sm:p-5">
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div>
                  <div className="mb-1.5 flex items-center justify-between gap-3">
                    <label className={labelClass}>Họ và tên</label>
                    <p className="text-xs text-red-500">{errors.fullName?.message || " "}</p>
                  </div>
                  <input className={inputClass} {...register("fullName")} />
                </div>

                <div>
                  <div className="mb-1.5 flex items-center justify-between gap-3">
                    <label className={labelClass}>Số điện thoại</label>
                    <p className="text-xs text-red-500">{errors.phoneNumber?.message || " "}</p>
                  </div>
                  <input className={inputClass} {...register("phoneNumber")} />
                </div>

                <div>
                  <div className="mb-1.5 flex items-center justify-between gap-3">
                    <label className={labelClass}>Tỉnh / Thành phố</label>
                    <p className="text-xs text-red-500">{errors.provinceId?.message || " "}</p>
                  </div>
                  <select className={inputClass} {...register("provinceId")}>
                    <option value="">Chọn tỉnh</option>
                    {provinces.map((p) => (
                      <option key={p.ProvinceID} value={p.ProvinceID}>
                        {p.ProvinceName}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <div className="mb-1.5 flex items-center justify-between gap-3">
                    <label className={labelClass}>Quận / Huyện</label>
                    <p className="text-xs text-red-500">{errors.districtId?.message || " "}</p>
                  </div>
                  <select className={inputClass} {...register("districtId")}>
                    <option value="">Chọn quận</option>
                    {districts.map((d) => (
                      <option key={d.DistrictID} value={d.DistrictID}>
                        {d.DistrictName}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <div className="mb-1.5 flex items-center justify-between gap-3">
                    <label className={labelClass}>Phường / Xã</label>
                    <p className="text-xs text-red-500">{errors.wardCode?.message || " "}</p>
                  </div>
                  <select className={inputClass} {...register("wardCode")}>
                    <option value="">Chọn phường</option>
                    {wards.map((w) => (
                      <option key={w.WardCode} value={w.WardCode}>
                        {w.WardName}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <div className="mb-1.5 flex items-center justify-between gap-3">
                    <label className={labelClass}>Địa chỉ chính xác</label>
                    <p className="text-xs text-red-500">{errors.address?.message || " "}</p>
                  </div>
                  <input className={inputClass} {...register("address")} />
                </div>
              </div>

              <div>
                <p className="mb-2 text-sm font-medium text-slate-600">Loại địa chỉ</p>
                <div className="grid grid-cols-2 gap-3">
                  {[
                    { value: "HOME", label: "Nhà riêng", icon: Home },
                    { value: "OFFICE", label: "Văn phòng", icon: Building2 },
                  ].map((item) => {
                    const Icon = item.icon;
                    const active = labelValue === item.value;
                    return (
                      <label
                        key={item.value}
                        className={`flex cursor-pointer items-center gap-2 rounded-xl border px-4 py-2.5 text-sm font-medium transition ${
                          active
                            ? "border-sky-300 bg-sky-50 text-sky-700"
                            : "border-slate-200 bg-white text-slate-600 hover:border-slate-300"
                        }`}
                      >
                        <input
                          type="radio"
                          value={item.value}
                          {...register("label")}
                          className="sr-only"
                        />
                        <Icon size={16} />
                        {item.label}
                      </label>
                    );
                  })}
                </div>
              </div>

              <label className="flex items-center gap-3 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm text-slate-600">
                <input
                  type="checkbox"
                  {...register("isDefault")}
                  checked={isDefaultValue}
                  disabled={(!isEdit && !hasDefault) || (isEdit && address?.isDefault)}
                  onChange={(e) => {
                    if (!e.target.checked) return;
                    setValue("isDefault", true);
                  }}
                  className="h-4 w-4 accent-sky-600"
                />
                <span>Đặt làm mặc định</span>
              </label>
            </div>

            <div className="rounded-2xl border border-slate-200 bg-white p-4 sm:p-5">
              <div className="mb-3 flex items-center justify-between gap-3">
                <div>
                  <p className="font-semibold text-slate-800">Vị trí trên bản đồ</p>
                  <p className="mt-1 text-sm text-slate-500">
                    Bấm vào bản đồ để đặt ghim giao hàng.
                  </p>
                </div>
                <p className="text-xs text-red-500">{errors.latitude?.message || " "}</p>
              </div>

              <div className="h-[420px] overflow-hidden rounded-xl border border-slate-200">
                <MapContainer
                  center={defaultCenter}
                  zoom={15}
                  style={{ height: "100%" }}
                >
                  <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
                  {marker && <ChangeMapView center={marker} />}
                  <MapClick />
                </MapContainer>
              </div>
            </div>
          </div>
        </div>

        <div className="flex shrink-0 justify-end gap-3 border-t border-slate-100 px-5 py-4 sm:px-6">
          <button
            type="button"
            onClick={handleClose}
            className="rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-medium text-slate-600 transition hover:bg-slate-50"
          >
            Trở lại
          </button>

          <button
            type="button"
            onClick={handleSubmit(onSubmit)}
            className="rounded-xl bg-sky-600 px-6 py-2.5 text-sm font-semibold text-white transition hover:bg-sky-700"
          >
            {isEdit ? "Cập nhật" : "Lưu"}
          </button>
        </div>
      </div>
    </div>
  );
};

export default AddOrUpdateAddressForm;
