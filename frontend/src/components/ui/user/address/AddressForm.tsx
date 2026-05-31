import { MapPinCheckIcon, MapPinOff, Pencil, Plus, Trash2, X } from "lucide-react";
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
    if (addressSelectedId) return Number(addressSelectedId);
    return defaultAddress?.id;
  });

  useEffect(() => {
    if (!addresses.length) return;
    const exist = addresses.find((a) => a.id === selected);
    if (!exist) {
      const defaultAddr = addresses.find((a) => a.isDefault);
      if (defaultAddr) setSelected(defaultAddr.id);
    }
  }, [addresses, selected]);

  const handleConfirm = () => {
    if (!selected) return;
    onSelect(selected);
    setOpen(false);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4">
      <div className="flex h-[76vh] w-full max-w-4xl flex-col overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-xl">
        <div className="flex shrink-0 items-center justify-between border-b border-slate-200 px-5 py-4 sm:px-6">
          <div>
            <h2 className="flex items-center gap-2 text-lg font-semibold text-slate-800">
              <MapPinCheckIcon size={20} className="text-sky-600" />
              Địa chỉ của tôi
            </h2>
            <p className="mt-1 text-sm text-slate-500">
              Chọn địa chỉ giao hàng cho đơn hàng này.
            </p>
          </div>

          <button
            type="button"
            onClick={() => setOpen(false)}
            className="flex h-9 w-9 items-center justify-center rounded-lg text-slate-400 transition hover:bg-slate-100 hover:text-slate-700"
          >
            <X size={19} />
          </button>
        </div>

        <div className="min-h-0 flex-1 overflow-y-auto bg-slate-50 p-4 sm:p-5">
          {addresses.length === 0 ? (
            <div className="flex h-full flex-col items-center justify-center rounded-2xl border border-dashed border-slate-300 bg-white px-6 text-center">
              <MapPinOff size={44} className="mb-3 text-slate-300" />
              <p className="font-medium text-slate-700">Chưa có địa chỉ nào</p>
              <p className="mt-1 text-sm text-slate-500">
                Hãy thêm địa chỉ để tiếp tục đặt hàng.
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {addresses.map((addr) => {
                const checked = selected === addr.id;
                return (
                  <label
                    key={addr.id}
                    className={`block cursor-pointer rounded-2xl border bg-white p-4 transition ${
                      checked
                        ? "border-sky-400"
                        : "border-slate-200 hover:border-slate-300"
                    }`}
                  >
                    <div className="flex items-start gap-4">
                      <input
                        type="radio"
                        name="address"
                        checked={checked}
                        onChange={() => setSelected(addr.id)}
                        className="mt-1 h-4 w-4 cursor-pointer accent-sky-600"
                      />

                      <div className="min-w-0 flex-1">
                        <div className="flex flex-wrap items-center gap-2">
                          <span className="font-semibold text-slate-800">
                            {addr.fullName}
                          </span>
                          <span className="text-sm text-slate-500">
                            {addr.phoneNumber}
                          </span>
                          <span className="rounded-lg border border-slate-200 bg-white px-2.5 py-1 text-xs font-medium text-slate-600">
                            {addr.label === "HOME" ? "Nhà riêng" : "Văn phòng"}
                          </span>
                          {addr.isDefault && (
                            <span className="rounded-lg border border-sky-100 bg-sky-50 px-2.5 py-1 text-xs font-medium text-sky-700">
                              Mặc định
                            </span>
                          )}
                        </div>

                        <p className="mt-2 text-sm leading-6 text-slate-600">
                          {`${addr.address}, ${addr.wardName}, ${addr.districtName}, ${addr.provinceName}`}
                        </p>
                      </div>

                      <div className="flex shrink-0 gap-2">
                        <button
                          type="button"
                          onClick={(e) => {
                            e.preventDefault();
                            onEdit(addr);
                          }}
                          className="flex h-9 w-9 items-center justify-center rounded-lg border border-slate-200 text-slate-500 transition hover:bg-slate-50 hover:text-sky-600"
                        >
                          <Pencil size={15} />
                        </button>
                        <button
                          type="button"
                          onClick={(e) => {
                            e.preventDefault();
                            onDelete(addr.id);
                          }}
                          className="flex h-9 w-9 items-center justify-center rounded-lg border border-slate-200 text-slate-500 transition hover:bg-slate-50 hover:text-red-500"
                        >
                          <Trash2 size={15} />
                        </button>
                      </div>
                    </div>
                  </label>
                );
              })}
            </div>
          )}
        </div>

        <div className="flex shrink-0 flex-col gap-3 border-t border-slate-200 px-5 py-4 sm:flex-row sm:items-center sm:justify-between sm:px-6">
          <button
            type="button"
            onClick={() => {
              setOpen(false);
              setOpenAdd(true);
            }}
            className="inline-flex items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-medium text-slate-700 transition hover:bg-slate-50"
          >
            <Plus size={18} />
            Thêm địa chỉ mới
          </button>

          <button
            type="button"
            onClick={handleConfirm}
            disabled={!selected}
            className="rounded-xl bg-sky-600 px-6 py-2.5 text-sm font-semibold text-white transition hover:bg-sky-700 disabled:cursor-not-allowed disabled:bg-slate-200 disabled:text-slate-500"
          >
            Xác nhận
          </button>
        </div>
      </div>
    </div>
  );
};

export default AddressForm;
