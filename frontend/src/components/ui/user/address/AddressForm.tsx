import { MapPinCheckIcon, MapPinOff, Plus } from "lucide-react";
import { useEffect, useState } from "react";
import { useAppSelector } from "../../../../redux/hook";
import type { Address } from "../../../../types/address";

type AddressFormProps = {
  setOpen: (open: boolean) => void;
  setOpenAdd: (open: boolean) => void;
  onSelect: (id: number) => void;
  onDelete: (id: number) => void;
  onEdit: (addr: Address) => void;
};

const AddressForm = ({
  setOpen,
  setOpenAdd,
  onSelect,
  onDelete,
  onEdit,
}: AddressFormProps) => {
  const addresses = useAppSelector(
    (state) => state.address.userAddresses?.addresses || [],
  );

  const defaultAddress = addresses.find((a) => a.isDefault);

  const addressSelectedId = localStorage.getItem("addressSelectedId");

  const [selected, setSelected] = useState<number | undefined>(() => {
    if (addressSelectedId) {
      return Number(addressSelectedId);
    } else {
      return defaultAddress?.id;
    }
  });

  useEffect(() => {
    if (!addresses.length) return;
    const exist = addresses.find((a) => a.id === selected);
    if (!exist) {
      const defaultAddr = addresses.find((a) => a.isDefault);
      if (defaultAddr) {
        setSelected(defaultAddr.id);
      }
    }
  }, [addresses, selected]);

  const handleConfirm = () => {
    if (selected) {
      onSelect(selected);
      setOpen(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
      <div className="bg-white w-[70vw] h-[70vh] max-w-[900px] rounded-xl shadow-xl flex flex-col">
        {/* HEADER */}
        <div className="border-b border-gray-600 px-8 py-5 flex justify-between items-center shrink-0">
          <h2 className="text-xl font-semibold flex items-center gap-2">
            <MapPinCheckIcon size={20} className="text-sky-500" />
            Địa chỉ của tôi
          </h2>

          <button
            onClick={() => setOpen(false)}
            className="text-slate-500 hover:text-black text-lg"
          >
            ✕
          </button>
        </div>

        {/* BODY - SCROLL */}
        <div className="flex-1 overflow-y-auto">
          {addresses.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-center px-6">
              <MapPinOff size={48} className="text-slate-300 mb-3" />

              <p className="text-slate-600 font-medium">Chưa có địa chỉ nào</p>

              <p className="text-slate-400 text-sm mt-1">
                Hãy thêm địa chỉ để tiếp tục đặt hàng
              </p>
            </div>
          ) : (
            addresses.map((addr) => (
              <div
                key={addr.id}
                className="px-8 py-6 border-b border-gray-300 flex items-start gap-5 hover:bg-slate-50 transition"
              >
                {/* RADIO */}
                <input
                  type="radio"
                  name="address"
                  checked={selected === addr.id}
                  onChange={() => setSelected(addr.id)}
                  className="mt-2 w-4 h-4 accent-sky-500 cursor-pointer"
                />

                {/* INFO */}
                <div className="flex-1">
                  <div className="flex items-center gap-3 flex-wrap">
                    <span className="font-semibold text-slate-800">
                      {addr.fullName}
                    </span>

                    <span className="text-slate-500">{addr.phoneNumber}</span>

                    <span className="border text-xs px-2 py-0.5 rounded text-slate-600">
                      {addr.label === "HOME" ? "Nhà riêng" : "Văn phòng"}
                    </span>

                    {addr.isDefault && (
                      <span className="text-xs bg-sky-100 text-sky-600 px-2 py-0.5 rounded">
                        Mặc định
                      </span>
                    )}
                  </div>

                  <p className="text-sm text-slate-600 mt-2 max-w-[650px]">
                    {`${addr.address}, ${addr.wardName}, ${addr.districtName}, ${addr.provinceName}`}
                  </p>
                </div>

                <div className="flex flex-col gap-2">
                  {/* UPDATE */}
                  <button
                    onClick={() => onEdit(addr)}
                    className="text-sky-500 hover:underline text-sm font-medium"
                  >
                    Cập nhật
                  </button>

                  <button
                    onClick={() => onDelete(addr.id)}
                    className="text-sky-500 hover:underline text-sm font-medium"
                  >
                    Xóa
                  </button>
                </div>
              </div>
            ))
          )}
        </div>

        {/* FOOTER */}
        <div className="flex justify-between items-center px-8 py-6 border-t border-gray-600 shrink-0">
          <button
            onClick={() => {
              setOpen(false);
              setOpenAdd(true);
            }}
            className="flex items-center gap-2 border border-sky-500 text-sky-500 px-4 py-2 rounded hover:bg-sky-50"
          >
            <Plus size={18} />
            Thêm địa chỉ mới
          </button>

          <button
            onClick={handleConfirm}
            className="bg-sky-500 text-white px-6 py-2 rounded hover:bg-sky-600"
          >
            Xác nhận
          </button>
        </div>
      </div>
    </div>
  );
};

export default AddressForm;
