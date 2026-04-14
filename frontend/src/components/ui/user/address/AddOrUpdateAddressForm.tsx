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
import { MapPinHouse, X } from "lucide-react";

import type {
  Address,
  District,
  Province,
  Ward,
} from "../../../../types/address";

import locationService from "../../../../services/user/locationService";

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

  const [marker, setMarker] = useState<[number, number] | null>(null);

  const [provinces, setProvinces] = useState<Province[]>([]);
  const [districts, setDistricts] = useState<District[]>([]);
  const [wards, setWards] = useState<Ward[]>([]);

  const [loadingEdit, setLoadingEdit] = useState(false);

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
    if (!provinceId || loadingEdit) return;

    const load = async () => {
      try {
        const data = await locationService.getDistrictsService(
          Number(provinceId),
        );

        setDistricts(data);
        setValue("districtId", "");
        setValue("wardCode", "");
        setWards([]);
      } catch {
        toast.error("Không lấy được dữ liệu quận");
      }
    };

    load();
  }, [provinceId]);

  /* LOAD WARDS */
  useEffect(() => {
    if (!districtId || loadingEdit) return;

    const load = async () => {
      try {
        const data = await locationService.getWardsService(Number(districtId));

        setWards(data);
        setValue("wardCode", "");
      } catch {
        toast.error("Không lấy được dữ liệu phường");
      }
    };

    load();
  }, [districtId]);

  /* LOAD DATA WHEN EDIT */
  useEffect(() => {
    if (!address) return;

    const loadEdit = async () => {
      try {
        setLoadingEdit(true);

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
          wardCode: String(address.wardCode),
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
      } finally {
        setLoadingEdit(false);
      }
    };

    loadEdit();
  }, [address]);

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
            className="w-9 h-9 flex items-center justify-center rounded-full hover:bg-sky-500"
          >
            <X size={18} />
          </button>
        </div>

        {/* BODY */}
        <form
          onSubmit={handleSubmit(onSubmit)}
          className="p-6 grid grid-cols-2 gap-3 overflow-y-auto"
        >
          <div>
            <label>Họ và tên</label>
            <input className="input" {...register("fullName")} />
            <p className="error">{errors.fullName?.message}</p>
          </div>

          <div>
            <label>Số điện thoại</label>
            <input className="input" {...register("phoneNumber")} />
            <p className="error">{errors.phoneNumber?.message}</p>
          </div>

          <div>
            <label>Tỉnh</label>
            <select className="input" {...register("provinceId")}>
              <option value="">Chọn tỉnh</option>
              {provinces.map((p) => (
                <option key={p.ProvinceID} value={p.ProvinceID}>
                  {p.ProvinceName}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label>Quận</label>
            <select className="input" {...register("districtId")}>
              <option value="">Chọn quận</option>
              {districts.map((d) => (
                <option key={d.DistrictID} value={d.DistrictID}>
                  {d.DistrictName}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label>Phường</label>
            <select className="input" {...register("wardCode")}>
              <option value="">Chọn phường</option>
              {wards.map((w) => (
                <option key={w.WardCode} value={w.WardCode}>
                  {w.WardName}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label>Địa chỉ</label>
            <input className="input" {...register("address")} />
          </div>

          {/* MAP */}
          <div className="col-span-2 h-[320px] rounded-xl overflow-hidden border">
            <MapContainer
              center={marker || defaultCenter}
              zoom={15}
              style={{ height: "100%" }}
            >
              <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
              {marker && <ChangeMapView center={marker} />}
              <MapClick />
            </MapContainer>
          </div>
        </form>

        {/* FOOTER */}
        <div className="p-5 flex justify-end gap-3 border-t">
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
        .input{
          width:100%;
          padding:8px;
          border:1px solid #e5e7eb;
          border-radius:8px;
        }

        .input:focus{
          border-color:#38bdf8;
          outline:none;
        }

        .error{
          font-size:12px;
          color:#ef4444;
        }
      `}</style>
    </div>
  );
};

export default AddOrUpdateAddressForm;
