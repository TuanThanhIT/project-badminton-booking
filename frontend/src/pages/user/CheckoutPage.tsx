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
  Truck,
  CheckCircle,
  FileText,
  CreditCard,
  Ticket,
  Store,
  MapPin,
  Layers,
  HomeIcon,
  AlertTriangle,
  WalletCards,
  Receipt,
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
  createOrder,
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
  PAYMENT_METHOD,
  paymentMethodList,
  type PaymentMethod,
} from "../../utils/constants/paymentMethod";
import type { CreateOrderRequest } from "../../types/order";
import { useNavigate } from "react-router-dom";
import { showConfirmDialog } from "../../utils/swalHelper";
import type { OtpFlowData, OtpSendRequest } from "../../types/auth";
import { OTP_TYPE } from "../../utils/constants/otpType";
import { otpSend, setOtpFlow } from "../../redux/slices/user/authSlice";

const CheckoutPage = () => {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
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
  const user = useAppSelector((state) => state.auth.user);

  const [openAddress, setOpenAddress] = useState(false);
  const [openAddAddress, setOpenAddAddress] = useState(false);
  const [editingAddress, setEditingAddress] = useState<Address | null>(null);
  const [openDiscount, setOpenDiscount] = useState(false);

  const [note, setNote] = useState("");
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>(
    PAYMENT_METHOD.COD.value,
  );

  const iconMap = {
    cod: <HomeIcon size={18} />,
    vnpay: <CreditCard size={18} />,
    wallet: <WalletCards size={18} />,
  } as const;
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
      amount: checkoutPreview.group.total,
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
    return mergeCheckoutItems(checkoutPreview?.group?.orders || []);
  }, [checkoutPreview]);

  const isMultiBranch = (checkoutPreview?.group?.orders?.length || 0) > 1;

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
      })
      .catch(() => {
        localStorage.removeItem("discountCode");
      });
  };

  const handleCreateOrder = async () => {
    if (!cart || !selectedAddress || !user) return;

    const confirmed = await showConfirmDialog(
      "Xác nhận đặt hàng",
      paymentMethod === PAYMENT_METHOD.COD.value
        ? "Đơn hàng sẽ được thanh toán khi nhận hàng. Tiếp tục?"
        : paymentMethod === PAYMENT_METHOD.VNPAY.value
          ? "Bạn sẽ được chuyển đến cổng thanh toán. Tiếp tục?"
          : "Bạn sẽ được chuyển đến bước xác nhận OTP. Tiếp tục?",

      "Xác nhận",
      "Hủy",
    );

    if (!confirmed) return;

    const data: CreateOrderRequest = {
      cartId: cart.id,
      addressId: selectedAddress.id,
      paymentMethod,
      note,
    };

    await dispatch(createOrder({ data }))
      .unwrap()
      .then((res) => {
        if (paymentMethod === PAYMENT_METHOD.COD.value) {
          toast.success("Đặt hàng thành công");
          setTimeout(() => {
            navigate(`/order-result?orderGroupId=${res.data.orderGroupId}`);
          }, 2000);
        } else if (paymentMethod === PAYMENT_METHOD.WALLET.value) {
          const dt: OtpFlowData = {
            orderGroupId: res.data.orderGroupId,
            email: user.email,
            type: OTP_TYPE.WALLET_PAYMENT,
          };
          const data: OtpSendRequest = {
            email: user.email,
            type: OTP_TYPE.WALLET_PAYMENT,
          };
          toast.success("Gửi yêu cầu thanh toán bằng ví thanh toán thành công");
          dispatch(otpSend({ data }));
          dispatch(setOtpFlow({ data: dt }));
          setTimeout(() => {
            navigate("/verify-otp");
          }, 2000);
        } else {
          if (res.data.paymentUrl) {
            window.location.href = res.data.paymentUrl;
          }
        }
      });
  };

  /* ================== UI ================== */
  return (
    <div className="bg-gradient-to-br from-sky-50 via-white to-sky-100 min-h-screen">
      <div className="w-[90%] mx-auto pt-20 pb-16 grid grid-cols-1 lg:grid-cols-3 gap-10">
        {/* LEFT */}
        <div className="lg:col-span-2 space-y-5">
          {/* HEADER */}
          <div className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm transition relative overflow-hidden">
            {/* TOP ACCENT BAR */}
            <div className="absolute top-0 left-0 w-full h-[3px] bg-gradient-to-r from-sky-400 to-sky-600" />

            <div className="flex justify-between items-center">
              {/* LEFT */}
              <div className="flex items-center gap-4">
                {/* ICON */}
                <div className="bg-sky-100 p-3 rounded-xl shadow-sm">
                  <Receipt size={22} className="text-sky-600" />
                </div>

                {/* TEXT */}
                <div>
                  <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
                    BHub
                    <span className="text-sky-600 font-semibold">
                      / Thanh toán
                    </span>
                  </h2>

                  <p className="text-sm text-gray-500 mt-1">
                    Xác nhận thông tin trước khi đặt hàng
                  </p>
                </div>
              </div>

              {isMultiBranch && (
                <div className="flex items-center gap-2 bg-sky-100 text-sky-700 px-3 py-1.5 rounded-full text-sm font-medium">
                  <Truck size={16} />
                  Nhiều cửa hàng
                </div>
              )}
            </div>
          </div>

          {/* ADDRESS */}
          <div className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm">
            <div className="flex justify-between items-start">
              <div>
                <h2 className="flex items-center gap-2 text-sky-600 font-semibold text-lg">
                  <MapPin size={20} />
                  Địa chỉ nhận hàng
                </h2>

                {selectedAddress ? (
                  <div className="mt-3 text-base space-y-2">
                    <div className="flex gap-2">
                      <span className="text-gray-500 min-w-[120px]">
                        Người nhận:
                      </span>
                      <span className="font-semibold text-gray-900">
                        {selectedAddress.fullName}
                      </span>
                    </div>

                    <div className="flex gap-2">
                      <span className="text-gray-500 min-w-[120px]">SĐT:</span>
                      <span className="text-gray-700 font-semibold">
                        {selectedAddress.phoneNumber}
                      </span>
                    </div>

                    <div className="flex gap-2">
                      <span className="text-gray-500 min-w-[120px]">
                        Địa chỉ:
                      </span>
                      <span className="text-gray-700 font-semibold">
                        {selectedAddress.address}, {selectedAddress.wardName},{" "}
                        {selectedAddress.districtName},{" "}
                        {selectedAddress.provinceName}
                      </span>
                    </div>
                  </div>
                ) : (
                  <div className="flex items-center gap-3 bg-red-50 px-4 py-3 rounded-xl mt-3 border border-red-200">
                    <AlertTriangle size={20} className="text-red-500" />
                    <div>
                      <p className="text-red-600 font-semibold">
                        Chưa có địa chỉ nhận hàng
                      </p>
                      <p className="text-sm text-gray-600">
                        Thêm địa chỉ để tiếp tục
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

          {/* ORDER GROUP */}
          {checkoutPreview?.group && (
            <div className="bg-white border border-gray-200 rounded-xl p-6 space-y-6 shadow-sm">
              {/* TITLE */}
              <div className="flex justify-between pb-3 border-b border-gray-200">
                <div className="flex items-center gap-2 text-sky-700 font-bold text-lg">
                  <Layers size={20} />
                  Đơn hàng ({checkoutPreview.group.orders.length})
                </div>
              </div>

              {/* LIST */}
              <div className="space-y-6">
                {checkoutPreview.group.orders.map(
                  (order: any, index: number) => (
                    <div
                      key={order.orderTempId}
                      className="bg-gray-50 border border-gray-200 rounded-xl p-5 space-y-5"
                    >
                      {/* HEADER */}
                      <div className="flex justify-between items-center border-b border-gray-200 pb-2">
                        <div className="flex items-center gap-2 text-gray-800 font-semibold">
                          <Store size={18} />
                          {order.branchName}
                        </div>

                        <div className="flex items-center gap-3">
                          <span className="text-xs bg-white border border-gray-200 px-2 py-1 rounded">
                            Đơn #{index + 1}
                          </span>

                          <span className="text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded">
                            {order.weight} kg
                          </span>
                        </div>
                      </div>

                      {/* ITEMS */}
                      <div className="divide-y divide-gray-200">
                        {order.items.map((item: any) => (
                          <div key={item.variantId} className="flex gap-4 py-4">
                            <img
                              src={item.thumbnail}
                              className="w-20 h-24 object-cover rounded-lg border border-gray-200"
                            />

                            <div className="flex-1">
                              <p className="font-semibold text-gray-800">
                                {item.productName}
                              </p>

                              <p className="text-sm text-gray-500 mt-1">
                                Màu: {item.color} • Size: {item.size}
                              </p>

                              <div className="flex justify-between mt-3">
                                <span className="text-sm text-gray-500">
                                  {item.quantity} × {formatPrice(item.price)}
                                </span>

                                <span className="font-semibold text-sky-600">
                                  {formatPrice(item.lineTotal)}
                                </span>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>

                      {/* SHIPPING */}
                      <div className="flex justify-between pt-3 border-t border-gray-200">
                        <div>
                          <p className="font-medium text-gray-800 flex items-center gap-2">
                            <Truck size={16} />
                            Giao hàng
                          </p>

                          <p className="text-sm text-gray-500">
                            Giao nhanh & tiết kiệm
                          </p>

                          <div className="text-sm mt-1">
                            <ShippingTime group={order} />
                          </div>
                        </div>

                        <div className="text-right">
                          <p className="text-xs text-gray-500">Phí ship</p>
                          <p className="font-semibold text-red-500">
                            {formatPrice(order.shippingFee)}
                          </p>
                        </div>
                      </div>
                    </div>
                  ),
                )}
              </div>

              {/* ACTION */}
              <div className="border-t border-gray-200 pt-6 space-y-4">
                <div className="flex justify-between items-center">
                  <div className="flex items-center gap-2 font-semibold">
                    <Ticket size={18} />
                    Mã giảm giá
                  </div>

                  <button
                    onClick={() => setOpenDiscount(true)}
                    className="bg-sky-500 text-white px-4 py-2 rounded-lg text-sm"
                  >
                    {checkoutPreview?.group?.discount?.code
                      ? "Đổi mã"
                      : "Chọn mã"}
                  </button>
                </div>

                <textarea
                  value={note}
                  onChange={(e) => setNote(e.target.value)}
                  className="w-full border border-gray-200 rounded-lg p-3 text-sm"
                />
              </div>
            </div>
          )}

          {/* PAYMENT */}
          <div className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm">
            <h2 className="font-semibold text-sky-700 mb-4 text-lg flex items-center gap-2">
              <CreditCard size={20} />
              Thanh toán
            </h2>

            <div className="grid grid-cols-3 gap-4">
              {paymentMethodList.map((method) => (
                <div
                  key={method.value}
                  onClick={() => setPaymentMethod(method.value)}
                  className={`p-4 border rounded-xl cursor-pointer transition ${
                    paymentMethod === method.value
                      ? "border-sky-500 bg-sky-50"
                      : "border-gray-200 hover:border-sky-400"
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div className="bg-sky-100 p-2 rounded">
                      {iconMap[method.icon]}
                    </div>

                    <div>
                      <p className="text-sm font-medium text-gray-800">
                        {method.label}
                      </p>
                      <p className="text-xs text-gray-500">{method.desc}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* RIGHT */}
        <div>
          <div className="bg-white border border-gray-200 rounded-xl p-6 sticky top-20 shadow-sm">
            <h2 className="font-semibold text-sky-700 mb-4 text-lg">
              Tóm tắt đơn hàng
            </h2>

            <div className="flex justify-between text-gray-700 mb-2">
              <span>Tạm tính</span>
              <span>{formatPrice(checkoutPreview?.group?.subTotal || 0)}</span>
            </div>

            <div className="flex justify-between text-gray-700 mb-2">
              <span>Phí ship</span>
              <span>
                {formatPrice(checkoutPreview?.group?.shippingFeeTotal || 0)}
              </span>
            </div>

            <div className="flex justify-between text-gray-700 mb-2">
              <span>Sản phẩm</span>
              <span>{mergedItems.length}</span>
            </div>

            <div className="h-[1px] bg-gray-200 my-3" />

            <div className="flex justify-between font-semibold text-xl">
              <span>Tổng</span>
              <span className="text-sky-600">
                {formatPrice(checkoutPreview?.group?.total || 0)}
              </span>
            </div>

            <button
              onClick={handleCreateOrder}
              disabled={!selectedAddress}
              className={`w-full mt-5 py-3 rounded-xl font-medium ${
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
      {/* MODAL */}{" "}
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
      )}{" "}
      {openAddAddress && (
        <AddOrUpdateAddressForm
          address={editingAddress || undefined}
          setOpenAdd={setOpenAddAddress}
          setOpen={setOpenAddress}
          onSubmitAddress={handleAddAddress}
          onUpdateAddress={handleUpdateAddress}
          setEditing={setEditingAddress}
        />
      )}{" "}
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
