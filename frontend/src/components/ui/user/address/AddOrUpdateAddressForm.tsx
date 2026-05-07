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

import {
  FormAddAddressSchema,
  type AddOrUpdateAddressPayload,
  type FormAddAddress,
} from "../../../../schemas/FormAddAddressSchema";

import { useAppSelector } from "../../../../redux/hook";
import { toast } from "react-toastify";
import { Building2, Home, MapPinHouse, X } from "lucide-react";

import type {
  Address,
  District,
  Province,
  Ward,
} from "../../../../types/address";

import locationService from "../../../../services/user/locationService";
import { showConfirmDialog } from "../../../../utils/swalHelper";

/* FIX LEAFLET ICON */
delete (L.Icon.Default.prototype as any)._getIconUrl;

L.Icon.Default.mergeOptions({
  iconRetinaUrl:
    "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
  iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
  shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
});

const defaultCenter: LatLngExpression = [10.7769, 106.7009];

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

  const [marker, setMarker] = useState<[number, number] | null>(null);

  const [provinces, setProvinces] = useState<Province[]>([]);
  const [districts, setDistricts] = useState<District[]>([]);
  const [wards, setWards] = useState<Ward[]>([]);

  useEffect(() => {
    if (!hasDefault && !isEdit) {
      setValue("isDefault", true);
    }
  }, [hasDefault, isEdit, setValue]);

  /* LOAD PROVINCES */
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

  /* LOAD DISTRICTS */
  useEffect(() => {
    if (!provinceId) return;

    const load = async () => {
      try {
        const data = await locationService.getDistrictsService(
          Number(provinceId),
        );

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

  /* LOAD WARDS */
  useEffect(() => {
    if (!districtId) return;

    const load = async () => {
      try {
        const data = await locationService.getWardsService(Number(districtId));

        setWards(data);

        if (!isEdit) {
          setValue("wardCode", "");
        }
      } catch {
        toast.error("Không lấy được dữ liệu phường");
      }
    };

    load();
  }, [districtId, isEdit, setValue]);

  /* LOAD DATA WHEN EDIT */
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

  /* MAP CLICK */
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

    if (isEdit && onUpdateAddress) {
      onUpdateAddress(payload);
    } else {
      onSubmitAddress(payload);
    }

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
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
      <div className="bg-white w-[70vw] h-[70vh] max-w-[900px] rounded-xl shadow-xl flex flex-col">
        {/* HEADER */}
        <div className="flex items-center justify-between px-6 py-4 bg-sky-600 text-white rounded-t-xl">
          <div className="flex items-center gap-2 text-lg font-semibold">
            <MapPinHouse size={20} />
            {isEdit ? "Cập nhật địa chỉ" : "Thêm địa chỉ mới"}
          </div>

          <button
            onClick={handleClose}
            className="w-9 h-9 flex items-center justify-center rounded-full hover:bg-slate-100 text-slate-800"
          >
            <X size={18} />
          </button>
        </div>

        {/* BODY */}
        <div className="p-6 grid grid-cols-2 gap-3 overflow-y-auto">
          {/* FULL NAME */}
          <div>
            <div className="flex flex-row items-center justify-between">
              <label className="block  mb-1">Họ và tên</label>
              <p className="text-red-500 text-xs min-h-[1.5rem] transition-all duration-200">
                {errors.fullName?.message || " "}
              </p>
            </div>
            <input className="input" {...register("fullName")} />
          </div>

          {/* PHONE */}
          <div>
            <div className="flex flex-row items-center justify-between">
              <label className="block mb-1">Số điện thoại</label>
              <p className="text-red-500 text-xs min-h-[1.5rem] transition-all duration-200">
                {errors.phoneNumber?.message || " "}
              </p>
            </div>
            <input className="input" {...register("phoneNumber")} />
          </div>

          {/* PROVINCE */}
          <div>
            <div className="flex flex-row items-center justify-between">
              <label className="block  mb-1">Tỉnh / Thành phố</label>
              <p className="text-red-500 text-xs min-h-[1.5rem] transition-all duration-200">
                {errors.provinceId?.message || " "}
              </p>
            </div>
            <select className="input" {...register("provinceId")}>
              <option value="">Chọn tỉnh</option>
              {provinces.map((p) => (
                <option key={p.ProvinceID} value={p.ProvinceID}>
                  {p.ProvinceName}
                </option>
              ))}
            </select>
          </div>

          {/* DISTRICT */}
          <div>
            <div className="flex flex-row items-center justify-between">
              <label className="block mb-1">Quận / Huyện</label>
              <p className="text-red-500 text-xs min-h-[1.5rem] transition-all duration-200">
                {errors.districtId?.message || " "}
              </p>
            </div>
            <select className="input" {...register("districtId")}>
              <option value="">Chọn quận</option>
              {districts.map((d) => (
                <option key={d.DistrictID} value={d.DistrictID}>
                  {d.DistrictName}
                </option>
              ))}
            </select>
          </div>

          {/* WARD */}
          <div>
            <div className="flex flex-row items-center justify-between">
              <label className="block mb-1">Phường / Xã</label>
              <p className="text-red-500 text-xs min-h-[1.5rem] transition-all duration-200">
                {errors.fullName?.message || " "}
              </p>
            </div>
            <select className="input" {...register("wardCode")}>
              <option value="">Chọn phường</option>
              {wards.map((w) => (
                <option key={w.WardCode} value={w.WardCode}>
                  {w.WardName}
                </option>
              ))}
            </select>
          </div>

          {/* ADDRESS */}
          <div>
            <div className="flex flex-row items-center justify-between">
              <label className="block  mb-1">Địa chỉ chính xác</label>
              <p className="text-red-500 text-xs min-h-[1.5rem] transition-all duration-200">
                {errors.address?.message || " "}
              </p>
            </div>
            <input className="input" {...register("address")} />
          </div>

          {/* LABEL */}
          <div className="col-span-2">
            <div className="flex gap-6">
              <label className="flex items-center gap-2 cursor-pointer">
                <input type="radio" value="HOME" {...register("label")} />
                Nhà riêng
                <Home size={16} className="text-sky-500" />
              </label>

              <label className="flex items-center gap-2 cursor-pointer">
                <input type="radio" value="OFFICE" {...register("label")} />
                Văn phòng
                <Building2 size={16} className="text-sky-500" />
              </label>
            </div>
          </div>

          {/* DEFAULT CHECKBOX */}
          <div className="col-span-2 flex items-center gap-2">
            <input
              type="checkbox"
              {...register("isDefault")}
              checked={isDefaultValue}
              disabled={
                (!isEdit && !hasDefault) || (isEdit && address?.isDefault)
              }
              onChange={(e) => {
                if (!e.target.checked) return;
                setValue("isDefault", true);
              }}
            />
            <span>Đặt làm mặc định</span>
          </div>

          {/* MAP */}
          <div className="col-span-2">
            <p className="text-red-500 text-xs min-h-[1.5rem] transition-all duration-200 text-end">
              {errors.latitude?.message || " "}
            </p>

            <div className="h-[320px] rounded-xl overflow-hidden border">
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

        {/* FOOTER */}
        <div className="p-5 flex justify-end gap-3 border-t border-gray-600">
          <button onClick={handleClose} className="px-4 py-2 rounded border">
            Trở lại
          </button>

          <button
            onClick={handleSubmit(onSubmit)}
            className="px-6 py-2 bg-sky-500 text-white rounded"
          >
            {isEdit ? "Cập nhật" : "Lưu"}
          </button>
        </div>
      </div>

      <style>{`
        .input {
          width: 100%;
          padding: 8px 10px;
          border: 1px solid #e5e7eb;
          border-radius: 8px;
          outline: none;
        }

        .input:focus {
          border-color: #38bdf8;
          box-shadow: 0 0 0 2px rgba(56,189,248,0.2);
        }
      `}</style>
    </div>
  );
};

export default AddOrUpdateAddressForm;
