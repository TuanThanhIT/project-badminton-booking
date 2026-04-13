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
  type formAddAddress,
} from "../../../schemas/FormAddAddressSchema";

import { useAppSelector } from "../../../redux/hook";
import { toast } from "react-toastify";
import { Building2, Home, MapPinHouse, X } from "lucide-react";
import type { Address, District, Province, Ward } from "../../../types/address";
import locationService from "../../../services/user/locationService";

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
    formState: { errors },
  } = useForm<formAddAddress>({
    resolver: zodResolver(FormAddAddressSchema),
    defaultValues: {
      fullName: "",
      phoneNumber: "",
      address: "",
      provinceCode: "",
      districtCode: "",
      wardCode: "",
      label: "HOME",
      latitude: null,
      longitude: null,
      isDefault: !hasDefault,
    },
  });

  const isDefaultValue = watch("isDefault");

  /* FIX: nếu chưa có default thì tick luôn */
  useEffect(() => {
    if (!hasDefault && !isEdit) {
      setValue("isDefault", true);
    }
  }, [hasDefault, isEdit, setValue]);

  const [marker, setMarker] = useState<[number, number] | null>(null);

  const [provinces, setProvinces] = useState<Province[]>([]);
  const [districts, setDistricts] = useState<District[]>([]);
  const [wards, setWards] = useState<Ward[]>([]);

  const provinceCode = watch("provinceCode");
  const districtCode = watch("districtCode");

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
    if (!provinceCode) return;

    const load = async () => {
      try {
        const res = await locationService.getDistrictsService(
          Number(provinceCode),
        );
        setDistricts(res.districts);
      } catch {
        toast.error("Không lấy được dữ liệu quận");
      }
    };

    load();
  }, [provinceCode]);

  /* LOAD WARDS */
  useEffect(() => {
    if (!districtCode) return;

    const load = async () => {
      try {
        const res = await locationService.getWardsService(Number(districtCode));
        setWards(res.wards);
      } catch {
        toast.error("Không lấy được dữ liệu phường");
      }
    };

    load();
  }, [districtCode]);

  /* LOAD DATA WHEN EDIT */
  useEffect(() => {
    if (!address) return;

    const loadEdit = async () => {
      try {
        const resDistrict = await locationService.getDistrictsService(
          Number(address.provinceCode),
        );

        const resWard = await locationService.getWardsService(
          Number(address.districtCode),
        );

        setDistricts(resDistrict.districts);
        setWards(resWard.wards);

        reset({
          fullName: address.fullName,
          phoneNumber: address.phoneNumber,
          address: address.address,
          provinceCode: String(address.provinceCode),
          districtCode: String(address.districtCode),
          wardCode: String(address.wardCode),
          label: address.label,
          latitude: address.latitude,
          longitude: address.longitude,
          isDefault: address.isDefault,
        });

        if (address.latitude && address.longitude) {
          setMarker([address.latitude, address.longitude]);
        }
      } catch {
        toast.error("Không load được địa chỉ khi update");
      }
    };

    loadEdit();
  }, [address, reset]);

  const MapClick = () => {
    useMapEvents({
      click(e) {
        setMarker([e.latlng.lat, e.latlng.lng]);

        setValue("latitude", e.latlng.lat);
        setValue("longitude", e.latlng.lng);
      },
    });

    return marker ? <Marker position={marker} /> : null;
  };

  const onSubmit = (data: formAddAddress) => {
    if (!marker) {
      toast.error("Vui lòng chọn vị trí trên bản đồ");
      return;
    }

    const [lat, lng] = marker;

    const provinceName = provinces.find(
      (p) => p.code === Number(data.provinceCode),
    )?.name;

    const districtName = districts.find(
      (d) => d.code === Number(data.districtCode),
    )?.name;

    const wardName = wards.find((w) => w.code === Number(data.wardCode))?.name;

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
            onClick={() => {
              setOpenAdd(false);
              setOpen(true);
              setEditing(null);
            }}
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
                {errors.provinceCode?.message || " "}
              </p>
            </div>
            <select className="input" {...register("provinceCode")}>
              <option value="">Chọn tỉnh</option>
              {provinces.map((p) => (
                <option key={p.code} value={p.code}>
                  {p.name}
                </option>
              ))}
            </select>
          </div>

          {/* DISTRICT */}
          <div>
            <div className="flex flex-row items-center justify-between">
              <label className="block mb-1">Quận / Huyện</label>
              <p className="text-red-500 text-xs min-h-[1.5rem] transition-all duration-200">
                {errors.districtCode?.message || " "}
              </p>
            </div>
            <select className="input" {...register("districtCode")}>
              <option value="">Chọn quận</option>
              {districts.map((d) => (
                <option key={d.code} value={d.code}>
                  {d.name}
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
                <option key={w.code} value={w.code}>
                  {w.name}
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
          <button
            onClick={() => {
              setOpenAdd(false);
              setOpen(true);
              setEditing(null);
            }}
            className="px-4 py-2 rounded border"
          >
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
