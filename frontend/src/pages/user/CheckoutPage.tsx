import { useEffect, useState } from "react";
import { useAppDispatch, useAppSelector } from "../../redux/hook";
import {
  addUserAddress,
  deleteUserAddress,
  deleteUserAddressLocal,
  getUserAddress,
  setSelectedAddress,
  updateUserAddress,
  updateUserAddressLocal,
} from "../../redux/slices/user/addressSlice";

import {
  MapPin,
  ShoppingCart,
  Truck,
  CreditCard,
  ShieldCheck,
  Plus,
} from "lucide-react";
import AddressForm from "../../components/ui/user/address/AddressForm";
import type { AddOrUpdateAddressPayload } from "../../schemas/FormAddAddressSchema";
import type {
  Address,
  AddUserAddressRequest,
  DeleteUserAddressRequest,
  UpdateUserAddressRequest,
} from "../../types/address";
import { toast } from "react-toastify";
import AddOrUpdateAddressForm from "../../components/ui/user/address/AddOrUpdateAddressForm";

const CheckoutPage = () => {
  const dispatch = useAppDispatch();

  const addresses = useAppSelector(
    (state) => state.address.userAddresses?.addresses,
  );
  const [openAddress, setOpenAddress] = useState<boolean>(false);
  const [openAddAddress, setOpenAddAddress] = useState<boolean>(false);
  const [editingAddress, setEditingAddress] = useState<Address | null>(null);

  const selectedAddress = useAppSelector(
    (state) => state.address.selectedAddress,
  );

  // const cart = useAppSelector((state) => state.cart.cart);

  useEffect(() => {
    dispatch(getUserAddress());
  }, [dispatch]);

  useEffect(() => {
    if (!addresses?.length) return;
    const saved = localStorage.getItem("addressSelectedId");
    if (saved) {
      const id = Number(saved);
      const found = addresses.find((a) => a.id === id);

      if (found) {
        dispatch(setSelectedAddress(found));
        return;
      }
    }
    const defaultAddr = addresses.find((a) => a.isDefault);
    if (defaultAddr) {
      dispatch(setSelectedAddress(defaultAddr));
    }
  }, [addresses, dispatch]);

  const handleAddAddress = async (dt: AddOrUpdateAddressPayload) => {
    if (!dt.latitude || !dt.longitude) return;
    console.log("abc>>>", dt);
    const data: AddUserAddressRequest = {
      fullName: dt.fullName,
      phoneNumber: dt.phoneNumber,
      address: dt.address,
      provinceName: dt.provinceName,
      districtName: dt.districtName,
      wardName: dt.wardName,
      provinceId: dt.provinceId,
      districtId: dt.districtId,
      wardCode: dt.wardCode,
      label: dt.label,
      longitude: dt.longitude,
      latitude: dt.latitude,
      isDefault: dt.isDefault,
    };
    await dispatch(addUserAddress({ data }))
      .unwrap()
      .then((res) => {
        toast.success("Thêm địa chỉ mới thành công");
        const newId = res.data.id;
        localStorage.setItem("addressSelectedId", String(newId));
        dispatch(setSelectedAddress(res.data));
      });
  };

  const handleUpdateAddress = async (dt: AddOrUpdateAddressPayload) => {
    if (!dt.latitude || !dt.longitude || !dt.addressId) return;

    const data: UpdateUserAddressRequest = {
      fullName: dt.fullName,
      phoneNumber: dt.phoneNumber,
      address: dt.address,
      provinceName: dt.provinceName,
      districtName: dt.districtName,
      wardName: dt.wardName,
      provinceId: dt.provinceId,
      districtId: dt.districtId,
      wardCode: dt.wardCode,
      label: dt.label,
      longitude: dt.longitude,
      latitude: dt.latitude,
      isDefault: dt.isDefault,
      addressId: dt.addressId,
    };
    await dispatch(updateUserAddressLocal({ data }));
    await dispatch(updateUserAddress({ data }))
      .unwrap()
      .then(() => {
        toast.success("Cập nhật địa chỉ thành công");
        setEditingAddress(null);
      });
  };

  const handleDeleteAddress = (addressId: number) => {
    if (!addresses?.length) return;
    const data: DeleteUserAddressRequest = { addressId };
    const defaultAddr = addresses.find((a) => a.isDefault);
    dispatch(deleteUserAddressLocal({ data }));
    if (selectedAddress?.id === addressId && defaultAddr) {
      dispatch(setSelectedAddress(defaultAddr));
      localStorage.setItem("addressSelectedId", String(defaultAddr.id));
    }
    dispatch(deleteUserAddress({ data }))
      .unwrap()
      .then(() => {
        toast.success("Xóa địa chỉ thành công");
      });
  };

  return (
    <div className="min-h-screen bg-slate-50">
      {/* HEADER */}
      <div className="bg-white border-b">
        <div className="w-[80%] mx-auto py-6 flex items-center gap-3">
          <CreditCard className="text-sky-500" size={28} />
          <h1 className="text-2xl font-bold text-slate-800">Thanh toán</h1>
        </div>
      </div>

      <div className="w-[80%] mx-auto mt-8 grid grid-cols-3 gap-6">
        {/* LEFT */}
        <div className="col-span-2 space-y-6">
          {/* ĐỊA CHỈ */}
          <div className="bg-white rounded-xl shadow-sm p-6">
            <div className="flex items-center gap-2 mb-4">
              <MapPin className="text-sky-500" />
              <h2 className="font-semibold text-lg">Địa chỉ nhận hàng</h2>
            </div>

            {!selectedAddress ? (
              <div className="flex items-center justify-between">
                <div className="text-slate-500">Chưa có địa chỉ nhận hàng</div>

                <button
                  onClick={() => setOpenAddress(true)}
                  className="flex items-center gap-1 text-sky-500 hover:text-sky-600 font-medium text-sm"
                >
                  <Plus size={16} />
                  Thiết lập địa chỉ
                </button>
              </div>
            ) : (
              <div className="flex justify-between items-start">
                <div>
                  <div className="flex items-center gap-3">
                    <span className="font-semibold">
                      {selectedAddress.fullName}
                    </span>

                    <span className="text-slate-500">
                      {selectedAddress.phoneNumber}
                    </span>

                    <span className="bg-sky-100 text-sky-600 text-xs px-2 py-1 rounded">
                      {selectedAddress.isDefault
                        ? "Địa chỉ mặc định"
                        : "Địa chỉ khác"}
                    </span>
                  </div>

                  <p className="text-slate-600 mt-2">
                    {`${selectedAddress.address}, ${selectedAddress.wardName}, ${selectedAddress.districtName}, ${selectedAddress.provinceName}`}
                  </p>
                </div>

                <button
                  onClick={() => setOpenAddress(true)}
                  className="text-sky-500 hover:underline"
                >
                  Thay đổi
                </button>
              </div>
            )}
          </div>

          {/* DANH SÁCH SẢN PHẨM */}
          <div className="bg-white rounded-xl shadow-sm p-6">
            <div className="flex items-center gap-2 mb-6">
              <ShoppingCart className="text-sky-500" />
              <h2 className="font-semibold text-lg">Sản phẩm</h2>
            </div>

            <table className="w-full">
              <thead className="text-sm text-slate-500 border-b">
                <tr>
                  <th className="text-left py-3">Sản phẩm</th>
                  <th className="text-right">Giá</th>
                  <th className="text-center">Số lượng</th>
                  <th className="text-right">Tổng</th>
                </tr>
              </thead>

              <tbody>
                {/* TODO: map cart items */}
                <tr className="border-b">
                  <td className="py-4 flex items-center gap-4">
                    <img
                      src="https://via.placeholder.com/80"
                      className="w-16 h-16 rounded"
                    />

                    <div>
                      <p className="font-medium">Áo cầu lông Yonex</p>
                      <p className="text-sm text-slate-500">
                        Màu: Đen - Size: L
                      </p>
                    </div>
                  </td>

                  <td className="text-right">350.000đ</td>

                  <td className="text-center">1</td>

                  <td className="text-right font-semibold">350.000đ</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        {/* RIGHT */}
        <div className="space-y-6">
          {/* TÓM TẮT */}
          <div className="bg-white rounded-xl shadow-sm p-6">
            <h2 className="font-semibold text-lg mb-6">Tóm tắt đơn hàng</h2>

            <div className="space-y-3 text-sm">
              <div className="flex justify-between">
                <span>Tạm tính</span>
                <span>350.000đ</span>
              </div>

              <div className="flex justify-between">
                <span className="flex items-center gap-2">
                  <Truck size={16} />
                  Phí vận chuyển
                </span>

                <span>0đ</span>
              </div>
            </div>

            <div className="border-t mt-4 pt-4 flex justify-between font-bold text-lg">
              <span>Tổng cộng</span>
              <span className="text-sky-500">350.000đ</span>
            </div>

            <button className="mt-6 w-full bg-sky-500 hover:bg-sky-600 text-white py-3 rounded-lg font-semibold flex items-center justify-center gap-2">
              <CreditCard size={18} />
              Đặt hàng
            </button>
          </div>

          {/* BẢO MẬT */}
          <div className="bg-sky-50 border border-sky-100 rounded-lg p-4 flex gap-3">
            <ShieldCheck className="text-sky-500" />

            <p className="text-sm text-slate-600">
              Thanh toán an toàn với mã hóa SSL.
            </p>
          </div>
        </div>

        {openAddress && addresses && (
          <AddressForm
            setOpen={setOpenAddress}
            setOpenAdd={setOpenAddAddress}
            onSelect={(id) => {
              localStorage.setItem("addressSelectedId", JSON.stringify(id));

              const address = addresses.find((a) => a.id === id);
              if (address) {
                dispatch(setSelectedAddress(address));
              }
            }}
            onDelete={handleDeleteAddress}
            onEdit={(addr) => {
              setEditingAddress(addr);
              setOpenAddress(false);
              setOpenAddAddress(true);
            }}
          />
        )}

        {openAddAddress && (
          <AddOrUpdateAddressForm
            address={editingAddress || undefined}
            setOpenAdd={setOpenAddAddress}
            setOpen={setOpenAddress}
            onSubmitAddress={handleAddAddress}
            onUpdateAddress={handleUpdateAddress}
            setEditing={setEditingAddress}
          />
        )}
      </div>
    </div>
  );
};

export default CheckoutPage;
