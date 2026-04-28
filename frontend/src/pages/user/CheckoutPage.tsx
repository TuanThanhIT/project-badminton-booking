import { useEffect, useMemo, useState } from "react";
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
  ShieldCheck,
  Truck,
  CheckCircle,
  FileText,
  CreditCard,
  Wallet,
  Ticket,
  Store,
  MapPin,
  Layers,
  Ruler,
  Palette,
  HomeIcon,
  AlertTriangle,
  Wallet2Icon,
  WalletCards,
} from "lucide-react";

import AddressForm from "../../components/ui/user/address/AddressForm";
import AddOrUpdateAddressForm from "../../components/ui/user/address/AddOrUpdateAddressForm";

import type { AddOrUpdateAddressPayload } from "../../schemas/FormAddAddressSchema";
import type {
  Address,
  AddUserAddressRequest,
  DeleteUserAddressRequest,
  UpdateUserAddressRequest,
} from "../../types/address";

import { toast } from "react-toastify";
import {
  applyDiscount,
  calculateShipping,
  getCheckoutPreview,
} from "../../redux/slices/user/orderSlice";
import { formatPrice, mergeCheckoutItems } from "../../utils/checkout";
import ShippingTime from "../../components/ui/user/address/ShippingTime";
import { getDiscountsCheckout } from "../../redux/slices/user/discountSlice";
import type {
  ApplyDiscountRequest,
  DiscountRequest,
} from "../../types/discount";
import DiscountsForm from "../../components/ui/user/discount/DiscountsForm";
import type { FormDiscount } from "../../schemas/FormDiscountSchema";
import {
  paymentMethods,
  type PaymentMethod,
} from "../../constants/paymentMethod";

const CheckoutPage = () => {
  const dispatch = useAppDispatch();
  const addresses = useAppSelector(
    (state) => state.address.userAddresses?.addresses,
  );
  const selectedAddress = useAppSelector(
    (state) => state.address.selectedAddress,
  );
  const cart = useAppSelector((state) => state.cart.cart);
  const checkoutPreview = useAppSelector(
    (state) => state.order.checkoutPreview,
  );
  const discounts = useAppSelector((state) => state.discount.discounts);

  const [openAddress, setOpenAddress] = useState(false);
  const [openAddAddress, setOpenAddAddress] = useState(false);
  const [editingAddress, setEditingAddress] = useState<Address | null>(null);
  const [openDiscount, setOpenDiscount] = useState(false);

  const [note, setNote] = useState("");
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>("COD");

  /* ================== LOAD ================== */
  useEffect(() => {
    dispatch(getUserAddress());
  }, [dispatch]);

  useEffect(() => {
    if (!cart || !selectedAddress) return;

    const fetchData = async () => {
      await dispatch(
        getCheckoutPreview({
          data: {
            cartId: cart.id,
            addressId: selectedAddress.id,
          },
        }),
      )
        .unwrap()
        .then(async (res) => {
          if (!res.data.isShippingCalculated) {
            await dispatch(
              calculateShipping({
                data: { cartId: cart.id },
              }),
            );
          }
        });
    };

    fetchData();
  }, [dispatch, cart, selectedAddress]);

  useEffect(() => {
    if (!checkoutPreview) return;
    const data: DiscountRequest = {
      amount: checkoutPreview.total,
    };
    dispatch(getDiscountsCheckout({ data }));
  }, [dispatch, checkoutPreview]);

  /* ================== AUTO SELECT ADDRESS ================== */
  useEffect(() => {
    if (!addresses?.length) return;
    if (selectedAddress) return;

    const savedId = localStorage.getItem("addressSelectedId");

    let foundAddress = null;

    if (savedId) {
      foundAddress = addresses.find((a) => a.id === Number(savedId));
    }
    if (!foundAddress) {
      foundAddress = addresses.find((a) => a.isDefault);
    }
    if (!foundAddress) {
      foundAddress = addresses[0];
    }
    if (foundAddress) {
      dispatch(setSelectedAddress(foundAddress));
      localStorage.setItem("addressSelectedId", String(foundAddress.id));
    }
  }, [addresses, selectedAddress, dispatch]);

  /* ================== DATA ================== */
  const mergedItems = useMemo(() => {
    return mergeCheckoutItems(checkoutPreview?.groups || []);
  }, [checkoutPreview]);

  const isMultiBranch = (checkoutPreview?.groups?.length || 0) > 1;

  /* ================== HANDLERS ================== */
  const handleAddAddress = async (dt: AddOrUpdateAddressPayload) => {
    if (!dt.latitude || !dt.longitude) return;
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
      .then(() => {
        toast.success("Thêm địa chỉ mới thành công");
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
    const data: DeleteUserAddressRequest = { addressId };

    dispatch(deleteUserAddressLocal({ data }));
    dispatch(deleteUserAddress({ data }))
      .unwrap()
      .then(() => toast.success("Xóa địa chỉ thành công"));
  };

  const handleApplyDiscount = (dt: FormDiscount) => {
    if (!cart) return;
    const data: ApplyDiscountRequest = { code: dt.code, cartId: cart.id };
    dispatch(applyDiscount({ data }))
      .unwrap()
      .then(() => {
        toast.success("Áp mã giảm giá thành công");
        localStorage.setItem("discountCode", dt.code);
        setOpenDiscount(false);
      });
  };

  /* ================== UI ================== */
  return (
    <div className="bg-white min-h-screen">
      <div className="w-[90%] mx-auto pt-20 pb-16 grid grid-cols-1 lg:grid-cols-3 gap-10">
        {/* LEFT */}
        <div className="lg:col-span-2 space-y-5">
          {/* HEADER */}
          <div className="bg-white border border-sky-700 rounded-xl p-6 shadow-sm">
            <div className="flex justify-between items-center">
              <div>
                <h1 className="text-3xl font-bold text-gray-900">
                  BHub <span className="text-sky-600">/ Thanh toán</span>
                </h1>
                <p className="text-base text-gray-600 mt-1">
                  Xác nhận thông tin trước khi đặt hàng
                </p>
              </div>

              {isMultiBranch && (
                <div className="flex items-center gap-2 bg-sky-100 text-sky-700 px-3 py-1.5 rounded-full text-sm font-medium">
                  <Truck size={16} />
                  Nhiều kho
                </div>
              )}
            </div>
          </div>

          <div className="bg-white border border-sky-700 rounded-xl p-6 shadow-sm">
            <div className="flex justify-between items-start">
              <div>
                <h2 className="flex items-center gap-2 text-sky-600 font-semibold text-lg">
                  <MapPin size={20} />
                  Địa chỉ nhận hàng
                </h2>

                {/* ===== CASE: CÓ ĐỊA CHỈ ===== */}
                {selectedAddress ? (
                  <div className="mt-3 text-base space-y-1">
                    <p className="font-semibold text-gray-900">
                      {selectedAddress.fullName}
                    </p>
                    <p className="text-gray-700">
                      {selectedAddress.phoneNumber}
                    </p>
                    <p className="text-gray-700">
                      {selectedAddress.address}, {selectedAddress.districtName},{" "}
                      {selectedAddress.provinceName}
                    </p>
                  </div>
                ) : (
                  <div className="flex items-center gap-3 bg-gradient-to-r from-red-50 to-orange-50 px-4 py-3 rounded-xl shadow-sm mt-2">
                    <div className="bg-red-100 p-2 rounded-full">
                      <AlertTriangle size={20} className="text-red-500" />
                    </div>

                    <div className="flex-1">
                      <p className="text-red-600 font-semibold">
                        Chưa có địa chỉ nhận hàng
                      </p>
                      <p className="text-sm text-slate-600">
                        Thêm địa chỉ để xem phí ship và tiếp tục đặt hàng
                      </p>
                    </div>
                  </div>
                )}
              </div>

              <button
                onClick={() => setOpenAddress(true)}
                className={`px-4 py-2 rounded-lg text-sm font-medium ${
                  selectedAddress
                    ? "bg-sky-500 hover:bg-sky-600 text-white"
                    : "bg-red-500 hover:bg-red-600 text-white"
                }`}
              >
                {selectedAddress ? "Thay đổi" : "Thêm địa chỉ"}
              </button>
            </div>
          </div>

          {checkoutPreview?.groups?.map((group: any) => (
            <div
              key={group.groupId}
              className="bg-white border border-sky-700 rounded-xl p-6 space-y-6 shadow-sm"
            >
              {/* SHOP */}
              <div className="flex justify-between items-center pb-3 border-b border-sky-400">
                <div className="flex items-center gap-2 text-sky-600 font-semibold text-xl">
                  <Store size={22} />
                  {group.branchName}
                </div>

                <span className="text-sm bg-sky-50 text-sky-600 px-3 py-1 rounded-full font-medium">
                  {group.weight} kg
                </span>
              </div>

              {/* ITEMS */}
              <div className="divide-y divide-gray-200">
                {group.items.map((item: any) => (
                  <div key={item.variantId} className="flex gap-4 py-4">
                    <img
                      src={item.thumbnail}
                      className="w-24 h-28 object-cover rounded-lg border border-gray-200"
                    />

                    <div className="flex-1 flex flex-col justify-between">
                      <div>
                        <p className="text-base font-semibold text-gray-800">
                          {item.productName}
                        </p>

                        <div className="text-sm text-gray-600 mt-2 space-y-1">
                          <div className="flex items-center gap-1.5">
                            <Palette size={14} />
                            Màu: {item.color}
                          </div>

                          <div className="flex items-center gap-1.5">
                            <Ruler size={14} />
                            Size: {item.size}
                          </div>
                        </div>
                      </div>

                      <div className="flex justify-between items-center mt-4">
                        <p className="text-sm text-gray-600">
                          SL: {item.quantity} × {formatPrice(item.price)}
                        </p>

                        <p className="text-xl font-bold text-sky-600">
                          {formatPrice(item.lineTotal)}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* DIVIDER */}
              <div className="border-t border-sky-400" />

              {/* SHIPPING */}
              <div className="flex justify-between items-start">
                <div>
                  <div className="flex items-center gap-2 text-lg font-semibold text-gray-800">
                    <Truck size={20} />
                    Giao hàng tiêu chuẩn
                  </div>

                  <p className="text-sm text-gray-600 mt-1">
                    Giao nhanh & tiết kiệm
                  </p>

                  <div className="mt-1 text-sm text-gray-700">
                    <ShippingTime group={group} />
                  </div>
                </div>

                <div className="text-right">
                  <p className="text-sm text-gray-500">Phí ship</p>
                  <p className="text-lg font-bold text-red-500">
                    {formatPrice(group.shippingFee)}
                  </p>
                </div>
              </div>

              {/* DIVIDER */}
              <div className="border-t border-sky-400" />

              {/* VOUCHER */}
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <div className="flex items-center gap-2 text-lg font-semibold">
                    <Ticket size={20} />
                    Mã giảm giá
                  </div>

                  <button
                    onClick={() => setOpenDiscount(true)}
                    className="bg-sky-500 hover:bg-sky-600 text-white px-4 py-2 rounded-lg text-sm font-medium"
                  >
                    {checkoutPreview?.discount?.code ? "Đổi mã" : "Chọn mã"}
                  </button>
                </div>

                {(checkoutPreview?.discount?.amount ?? 0) > 0 && (
                  <div className="flex justify-between items-center text-base py-2">
                    <span className="text-gray-700">
                      Giảm giá
                      <span className="ml-2 px-2 py-0.5 bg-green-100 text-green-600 text-xs font-semibold rounded">
                        {checkoutPreview?.discount?.code}
                      </span>
                    </span>

                    <span className="text-green-600 font-semibold">
                      -{formatPrice(checkoutPreview?.discount?.amount ?? 0)}
                    </span>
                  </div>
                )}
              </div>

              {/* DIVIDER */}
              <div className="border-t border-sky-400" />

              {/* NOTE */}
              <div>
                <div className="flex items-center gap-2 text-lg font-semibold mb-2">
                  <FileText size={20} />
                  Ghi chú
                </div>

                <textarea className="w-full border border-gray-400 rounded-lg p-3 text-sm focus:ring-2 focus:ring-sky-200 outline-none" />
              </div>
            </div>
          ))}

          {/* PAYMENT */}
          <div className="bg-white border border-sky-700 rounded-xl p-6 shadow-sm">
            <h2 className="font-semibold text-sky-700 mb-4 text-lg flex items-center gap-2">
              <CreditCard size={20} />
              Thanh toán
            </h2>

            <div className="grid grid-cols-3 gap-4">
              {paymentMethods.map((m) => (
                <div
                  key={m}
                  onClick={() => setPaymentMethod(m)}
                  className={`p-4 border rounded-xl flex items-center justify-between cursor-pointer transition
        ${
          paymentMethod === m
            ? "border-sky-500 bg-sky-50"
            : "border-gray-300 hover:border-sky-400"
        }`}
                >
                  <div className="flex items-center gap-3">
                    <div className="bg-sky-100 p-2 rounded">
                      {m === "COD" && <HomeIcon size={18} />}
                      {m === "VNPAY" && <CreditCard size={18} />}
                      {m === "WALLET" && <WalletCards size={18} />}
                    </div>

                    <div>
                      <p className="text-sm font-medium text-gray-800">
                        {m === "COD" && "Thanh toán khi nhận hàng"}
                        {m === "VNPAY" && "Thanh toán VNPay"}
                        {m === "WALLET" && "Ví thanh toán BHub"}
                      </p>

                      <p className="text-xs text-gray-600">
                        {m === "COD" && "COD"}
                        {m === "VNPAY" && "ATM / QR / Visa"}
                        {m === "WALLET" && "Số dư trong ví"}
                      </p>
                    </div>
                  </div>

                  {paymentMethod === m && (
                    <CheckCircle className="text-sky-500" size={18} />
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* RIGHT */}
        <div>
          <div className="bg-white border border-sky-700 rounded-xl p-6 sticky top-20 shadow-sm">
            <h2 className="font-semibold text-sky-700 mb-4 text-lg">
              Tóm tắt đơn hàng
            </h2>

            <div className="flex justify-between text-base mb-2 text-gray-700">
              <span>Tạm tính</span>
              <span>{formatPrice(checkoutPreview?.subTotal || 0)}</span>
            </div>

            <div className="flex justify-between text-base mb-2 text-gray-700">
              <span>Phí ship</span>
              <span>{formatPrice(checkoutPreview?.shippingFeeTotal || 0)}</span>
            </div>

            <div className="flex justify-between text-base mb-2 text-gray-700">
              <span>Sản phẩm</span>
              <span>{mergedItems.length}</span>
            </div>

            {/* DISCOUNT */}
            {(checkoutPreview?.discount?.amount ?? 0) > 0 && (
              <div className="flex justify-between items-center text-base mb-2 text-green-600">
                <span className="text-gray-600">Giảm giá</span>
                <span>
                  -{formatPrice(checkoutPreview?.discount?.amount ?? 0)}
                </span>
              </div>
            )}

            <div className="h-[2px] bg-gray-300 my-3 rounded-full" />

            <div className="flex justify-between font-semibold text-xl">
              <span>Tổng</span>
              <span className="text-sky-600">
                {formatPrice(checkoutPreview?.total || 0)}
              </span>
            </div>

            <button
              disabled={!selectedAddress}
              className={`w-full mt-5 py-3 rounded-xl font-medium text-base ${
                selectedAddress
                  ? "bg-sky-500 hover:bg-sky-600 text-white"
                  : "bg-gray-300 text-gray-500 cursor-not-allowed"
              }`}
            >
              {selectedAddress ? "Đặt hàng" : "Vui lòng thêm địa chỉ"}
            </button>
          </div>
        </div>
      </div>
      {/* MODAL */}
      {openAddress && addresses && (
        <AddressForm
          setOpen={setOpenAddress}
          setOpenAdd={setOpenAddAddress}
          onSelect={(id) => {
            const addr = addresses.find((a) => a.id === id);
            if (addr) {
              dispatch(setSelectedAddress(addr));
              localStorage.setItem("addressSelectedId", String(id));
            }
          }}
          onDelete={handleDeleteAddress}
          onEdit={(addr) => {
            setEditingAddress(addr);
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
      {openDiscount && (
        <DiscountsForm
          setOpenDiscount={setOpenDiscount}
          onSubmit={handleApplyDiscount}
          discounts={discounts}
        />
      )}
    </div>
  );
};

export default CheckoutPage;
