import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import {
  AlertTriangle,
  CheckCircle,
  CreditCard,
  FileText,
  HomeIcon,
  Layers,
  MapPin,
  Receipt,
  Store,
  Ticket,
  Truck,
  WalletCards,
} from "lucide-react";
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
  applyDiscount,
  calculateShipping,
  createOrder,
  getCheckoutPreview,
} from "../../redux/slices/user/orderSlice";
import { getDiscountsCheckout } from "../../redux/slices/user/discountSlice";
import { otpSend, setOtpFlow } from "../../redux/slices/user/authSlice";
import AddressForm from "../../components/ui/user/address/AddressForm";
import AddOrUpdateAddressForm from "../../components/ui/user/address/AddOrUpdateAddressForm";
import ShippingTime from "../../components/ui/user/address/ShippingTime";
import DiscountsForm from "../../components/ui/user/discount/DiscountsForm";
import type { AddOrUpdateAddressPayload } from "../../schemas/FormAddAddressSchema";
import type {
  Address,
  AddUserAddressRequest,
  DeleteUserAddressRequest,
  UpdateUserAddressRequest,
} from "../../types/address";
import type {
  ApplyDiscountRequest,
  DiscountRequest,
} from "../../types/discount";
import type { FormDiscount } from "../../schemas/FormDiscountSchema";
import {
  PAYMENT_METHOD,
  paymentMethodList,
  type PaymentMethod,
} from "../../utils/constants/paymentMethod";
import type { BuyNowItemRequest, CreateOrderRequest } from "../../types/order";
import type { OtpFlowData, OtpSendRequest } from "../../types/auth";
import { OTP_TYPE } from "../../utils/constants/otpType";
import { formatPrice, mergeCheckoutItems } from "../../utils/checkout";
import { showConfirmDialog } from "../../utils/confirmDialog";

const iconMap = {
  cod: <HomeIcon size={18} />,
  vnpay: <CreditCard size={18} />,
  wallet: <WalletCards size={18} />,
} as const;

const CheckoutPage = () => {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();

  const addresses = useAppSelector(
    (state) => state.address.userAddresses?.addresses,
  );
  const selectedAddress = useAppSelector(
    (state) => state.address.selectedAddress,
  );
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
  const [checkoutCartId, setCheckoutCartId] = useState<number | null>(null);
  const [checkoutCartItemIds, setCheckoutCartItemIds] = useState<number[]>([]);
  const [checkoutBuyNowItem, setCheckoutBuyNowItem] =
    useState<BuyNowItemRequest | null>(null);

  useEffect(() => {
    dispatch(getUserAddress());
  }, [dispatch]);

  useEffect(() => {
    const rawCartId = sessionStorage.getItem("checkoutCartId");
    const rawCartItemIds = sessionStorage.getItem("checkoutCartItemIds");
    const rawBuyNowItem = sessionStorage.getItem("checkoutBuyNowItem");

    try {
      const parsedIds = rawCartItemIds ? JSON.parse(rawCartItemIds) : [];
      const ids = Array.isArray(parsedIds)
        ? parsedIds.map(Number).filter(Boolean)
        : [];
      const parsedBuyNowItem = rawBuyNowItem ? JSON.parse(rawBuyNowItem) : null;
      const buyNowItem =
        parsedBuyNowItem?.variantId && parsedBuyNowItem?.quantity
          ? {
              variantId: Number(parsedBuyNowItem.variantId),
              quantity: Number(parsedBuyNowItem.quantity),
            }
          : null;

      if (!rawCartId || (!ids.length && !buyNowItem)) {
        toast.warn("Vui lòng chọn sản phẩm cần thanh toán");
        navigate("/cart");
        return;
      }

      setCheckoutCartId(Number(rawCartId));
      setCheckoutCartItemIds(ids);
      setCheckoutBuyNowItem(buyNowItem);
    } catch {
      toast.warn("Danh sách sản phẩm thanh toán không hợp lệ");
      navigate("/cart");
    }
  }, [navigate]);

  const checkoutPayload = useMemo(
    () =>
      checkoutBuyNowItem
        ? { buyNowItem: checkoutBuyNowItem }
        : { cartItemIds: checkoutCartItemIds },
    [checkoutBuyNowItem, checkoutCartItemIds],
  );

  const hasCheckoutPayload =
    !!checkoutBuyNowItem || checkoutCartItemIds.length > 0;

  useEffect(() => {
    if (!checkoutCartId || !hasCheckoutPayload || !selectedAddress) return;

    const fetchData = async () => {
      await dispatch(
        getCheckoutPreview({
          data: {
            cartId: checkoutCartId,
            addressId: selectedAddress.id,
            ...checkoutPayload,
          },
        }),
      )
        .unwrap()
        .then(async (res) => {
          if (!res.data.isShippingCalculated) {
            await dispatch(
              calculateShipping({
                data: { cartId: checkoutCartId },
              }),
            );
          }
        });
    };

    fetchData();
  }, [
    dispatch,
    checkoutCartId,
    checkoutPayload,
    hasCheckoutPayload,
    selectedAddress,
  ]);

  useEffect(() => {
    if (!checkoutPreview) return;
    const data: DiscountRequest = {
      amount: checkoutPreview.group.total,
    };
    dispatch(getDiscountsCheckout({ data }));
  }, [dispatch, checkoutPreview]);

  useEffect(() => {
    if (!addresses?.length || selectedAddress) return;

    const savedId = localStorage.getItem("addressSelectedId");
    let foundAddress: Address | undefined;

    if (savedId) foundAddress = addresses.find((a) => a.id === Number(savedId));
    if (!foundAddress) foundAddress = addresses.find((a) => a.isDefault);
    if (!foundAddress) foundAddress = addresses[0];

    if (foundAddress) {
      dispatch(setSelectedAddress(foundAddress));
      localStorage.setItem("addressSelectedId", String(foundAddress.id));
    }
  }, [addresses, selectedAddress, dispatch]);

  const mergedItems = useMemo(() => {
    return mergeCheckoutItems(checkoutPreview?.group?.orders || []);
  }, [checkoutPreview]);

  const isMultiBranch = (checkoutPreview?.group?.orders?.length || 0) > 1;

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
    if (!checkoutCartId) return;
    const data: ApplyDiscountRequest = {
      code: dt.code,
      cartId: checkoutCartId,
    };
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
    if (!checkoutCartId || !hasCheckoutPayload || !selectedAddress || !user)
      return;

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
      cartId: checkoutCartId,
      addressId: selectedAddress.id,
      ...checkoutPayload,
      paymentMethod,
      note,
    };

    await dispatch(createOrder({ data }))
      .unwrap()
      .then((res) => {
        if (paymentMethod === PAYMENT_METHOD.COD.value) {
          toast.success("Đặt hàng thành công");
          sessionStorage.removeItem("checkoutCartId");
          sessionStorage.removeItem("checkoutCartItemIds");
          sessionStorage.removeItem("checkoutBuyNowItem");
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
          toast.success("Gửi yêu cầu thanh toán bằng ví thành công");
          dispatch(otpSend({ data }));
          dispatch(setOtpFlow({ data: dt }));
          setTimeout(() => {
            navigate("/verify-otp");
          }, 2000);
        } else if (res.data.paymentUrl) {
          window.location.href = res.data.paymentUrl;
        }
      });
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-700">
      <section className="relative overflow-hidden bg-sky-950 py-12 sm:py-14 lg:py-16">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(56,189,248,0.24),transparent_35%),radial-gradient(circle_at_bottom_right,rgba(14,165,233,0.16),transparent_35%)]" />
        <div className="relative z-10 mx-auto max-w-7xl px-4 sm:px-6">
          <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
            <div>
              <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/10 px-4 py-2 text-sm font-medium text-sky-100">
                <Receipt size={16} className="text-sky-300" />
                B-Hub Checkout
              </div>
              <h1 className="text-3xl font-extrabold leading-tight tracking-tight text-white sm:text-4xl md:text-5xl">
                Thanh toán đơn hàng
              </h1>
              <p className="mt-4 max-w-2xl text-sm leading-relaxed text-sky-100 sm:text-base">
                Kiểm tra địa chỉ, phương thức thanh toán và tổng tiền trước khi
                hoàn tất đơn hàng.
              </p>
            </div>

            {isMultiBranch && (
              <div className="inline-flex w-fit items-center gap-2 rounded-full border border-white/15 bg-white/10 px-4 py-2 text-sm font-medium text-sky-100">
                <Truck size={16} />
                Giao từ nhiều chi nhánh
              </div>
            )}
          </div>
        </div>
      </section>

      <main className="relative z-10 mx-auto -mt-8 grid max-w-7xl grid-cols-1 gap-6 px-4 pb-14 sm:px-6 lg:grid-cols-[minmax(0,1fr)_380px] lg:gap-8">
        <div className="space-y-5">
          <section className="rounded-[2rem] border border-slate-200 bg-white p-5 shadow-[0_14px_36px_rgba(15,23,42,0.08)] sm:p-6">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
              <div className="min-w-0">
                <h2 className="flex items-center gap-2 text-lg font-semibold text-slate-800">
                  <MapPin size={20} className="text-sky-600" />
                  Địa chỉ nhận hàng
                </h2>

                {selectedAddress ? (
                  <div className="mt-4 rounded-2xl border border-slate-200 bg-slate-50/70 p-4">
                    <div className="flex flex-wrap items-center gap-2">
                      <p className="font-semibold text-slate-900">
                        {selectedAddress.fullName}
                      </p>
                      <span className="h-1 w-1 rounded-full bg-slate-300" />
                      <p className="font-medium text-slate-700">
                        {selectedAddress.phoneNumber}
                      </p>
                    </div>
                    <p className="mt-2 text-sm leading-6 text-slate-600">
                      {selectedAddress.address}, {selectedAddress.wardName},{" "}
                      {selectedAddress.districtName},{" "}
                      {selectedAddress.provinceName}
                    </p>
                  </div>
                ) : (
                  <div className="mt-4 flex items-center gap-3 rounded-2xl border border-red-100 bg-red-50 px-4 py-3">
                    <AlertTriangle size={20} className="text-red-500" />
                    <div>
                      <p className="font-semibold text-red-600">
                        Chưa có địa chỉ nhận hàng
                      </p>
                      <p className="text-sm text-slate-600">
                        Thêm địa chỉ để tiếp tục đặt hàng.
                      </p>
                    </div>
                  </div>
                )}
              </div>

              <button
                onClick={() => setOpenAddress(true)}
                className={`shrink-0 rounded-2xl px-4 py-2.5 text-sm font-medium text-white transition-all ${
                  selectedAddress
                    ? "bg-sky-500 hover:bg-sky-600"
                    : "bg-red-500 hover:bg-red-600"
                }`}
              >
                {selectedAddress ? "Thay đổi" : "Thêm địa chỉ"}
              </button>
            </div>
          </section>

          {checkoutPreview?.group && (
            <section className="rounded-[2rem] border border-slate-200 bg-white shadow-[0_14px_36px_rgba(15,23,42,0.08)]">
              <div className="flex items-center justify-between border-b border-slate-100 p-5 sm:p-6">
                <h2 className="flex items-center gap-2 text-lg font-semibold text-slate-800">
                  <Layers size={20} className="text-sky-600" />
                  Đơn hàng ({checkoutPreview.group.orders.length})
                </h2>
                <span className="rounded-full border border-slate-200 bg-slate-50 px-3 py-1 text-xs font-medium text-slate-500">
                  {mergedItems.length} sản phẩm
                </span>
              </div>

              <div className="space-y-4 bg-slate-50/70 p-4 sm:p-5">
                {checkoutPreview.group.orders.map(
                  (order: any, index: number) => (
                    <article
                      key={order.orderTempId}
                      className="overflow-hidden rounded-3xl border border-slate-200 bg-white"
                    >
                      <div className="flex flex-col gap-3 border-b border-slate-100 p-4 sm:flex-row sm:items-center sm:justify-between">
                        <div className="flex items-center gap-3">
                          <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-sky-50 text-sky-600">
                            <Store size={18} />
                          </div>
                          <div>
                            <p className="font-semibold text-slate-800">
                              {order.branchName}
                            </p>
                            <p className="text-xs text-slate-500">
                              Đơn #{index + 1} • {order.weight} kg
                            </p>
                          </div>
                        </div>
                      </div>

                      <div className="divide-y divide-slate-100 px-4">
                        {order.items.map((item: any) => (
                          <div
                            key={item.variantId}
                            className="grid grid-cols-[72px_1fr] gap-3 py-4 sm:grid-cols-[80px_1fr_auto]"
                          >
                            <img
                              src={item.thumbnail}
                              alt={item.productName}
                              className="h-20 w-18 rounded-xl border border-slate-200 object-cover sm:h-24 sm:w-20"
                            />

                            <div className="min-w-0">
                              <p className="line-clamp-2 font-medium leading-snug text-slate-800">
                                {item.productName}
                              </p>
                              <p className="mt-1 text-sm text-slate-500">
                                Màu: {item.color} • Size: {item.size}
                              </p>
                              <p className="mt-2 text-sm text-slate-500">
                                {item.quantity} × {formatPrice(item.price)}
                              </p>
                            </div>

                            <div className="col-span-2 text-right sm:col-span-1">
                              <p className="font-semibold text-sky-700">
                                {formatPrice(item.lineTotal)}
                              </p>
                            </div>
                          </div>
                        ))}
                      </div>

                      <div className="flex flex-col gap-3 border-t border-slate-100 bg-slate-50/70 p-4 sm:flex-row sm:items-center sm:justify-between">
                        <div>
                          <p className="flex items-center gap-2 font-medium text-slate-800">
                            <Truck size={16} className="text-sky-600" />
                            Giao hàng
                          </p>
                          <p className="mt-1 text-sm text-slate-500">
                            Giao nhanh & tiết kiệm
                          </p>
                          <div className="mt-1 text-sm text-slate-600">
                            <ShippingTime group={order} />
                          </div>
                        </div>

                        <div className="text-left sm:text-right">
                          <p className="text-xs text-slate-500">Phí ship</p>
                          <p className="font-semibold text-slate-800">
                            {formatPrice(order.shippingFee)}
                          </p>
                        </div>
                      </div>
                    </article>
                  ),
                )}
              </div>

              <div className="space-y-4 border-t border-slate-100 p-5 sm:p-6">
                <div className="flex items-center justify-between gap-4">
                  <div className="flex items-center gap-2 font-semibold text-slate-800">
                    <Ticket size={18} className="text-sky-600" />
                    Mã giảm giá
                  </div>

                  <button
                    onClick={() => setOpenDiscount(true)}
                    className="rounded-2xl bg-sky-500 px-4 py-2.5 text-sm font-medium text-white transition-all hover:bg-sky-600"
                  >
                    {checkoutPreview?.group?.discount?.code
                      ? "Đổi mã"
                      : "Chọn mã"}
                  </button>
                </div>

                <div>
                  <label className="mb-2 flex items-center gap-2 text-sm font-medium text-slate-600">
                    <FileText size={16} className="text-sky-600" />
                    Ghi chú đơn hàng
                  </label>
                  <textarea
                    value={note}
                    onChange={(e) => setNote(e.target.value)}
                    placeholder="Nhập ghi chú cho đơn hàng nếu cần..."
                    className="min-h-24 w-full resize-none rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-700 outline-none transition-all placeholder:text-slate-400 focus:border-sky-400 focus:bg-white focus:ring-1 focus:ring-sky-100"
                  />
                </div>
              </div>
            </section>
          )}

          <section className="rounded-[2rem] border border-slate-200 bg-white p-5 shadow-[0_14px_36px_rgba(15,23,42,0.08)] sm:p-6">
            <h2 className="mb-4 flex items-center gap-2 text-lg font-semibold text-slate-800">
              <CreditCard size={20} className="text-sky-600" />
              Phương thức thanh toán
            </h2>

            <div className="grid grid-cols-1 gap-3 md:grid-cols-3">
              {paymentMethodList.map((method) => (
                <button
                  type="button"
                  key={method.value}
                  onClick={() => setPaymentMethod(method.value)}
                  className={`rounded-2xl border p-4 text-left transition-all ${
                    paymentMethod === method.value
                      ? "border-sky-300 bg-sky-50 shadow-sm"
                      : "border-slate-200 bg-white hover:border-sky-200 hover:bg-sky-50/60"
                  }`}
                >
                  <div className="flex items-start gap-3">
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-sky-100 text-sky-700">
                      {iconMap[method.icon]}
                    </div>
                    <div className="min-w-0">
                      <p className="font-medium text-slate-800">
                        {method.label}
                      </p>
                      <p className="mt-1 text-xs leading-5 text-slate-500">
                        {method.desc}
                      </p>
                    </div>
                  </div>
                </button>
              ))}
            </div>
          </section>
        </div>

        <aside className="h-fit lg:sticky lg:top-20">
          <div className="overflow-hidden rounded-[2rem] border border-slate-200 bg-white shadow-[0_14px_36px_rgba(15,23,42,0.08)]">
            <div className="border-b border-slate-100 p-5 sm:p-6">
              <h2 className="flex items-center gap-2 text-lg font-semibold text-slate-800">
                <Receipt size={20} className="text-sky-600" />
                Tóm tắt đơn hàng
              </h2>
            </div>

            <div className="space-y-4 p-5 sm:p-6">
              <div className="space-y-3 text-sm">
                <div className="flex justify-between gap-4 text-slate-600">
                  <span>Tạm tính</span>
                  <span className="font-medium text-slate-800">
                    {formatPrice(checkoutPreview?.group?.subTotal || 0)}
                  </span>
                </div>

                <div className="flex justify-between gap-4 text-slate-600">
                  <span>Phí ship</span>
                  <span className="font-medium text-slate-800">
                    {formatPrice(checkoutPreview?.group?.shippingFeeTotal || 0)}
                  </span>
                </div>

                {(checkoutPreview?.group?.discount?.amount ?? 0) > 0 && (
                  <div className="flex items-center justify-between gap-4 text-emerald-600">
                    <span>Giảm giá</span>
                    <span className="font-medium">
                      -
                      {formatPrice(
                        checkoutPreview?.group?.discount?.amount ?? 0,
                      )}
                    </span>
                  </div>
                )}

                <div className="flex justify-between gap-4 text-slate-600">
                  <span>Sản phẩm</span>
                  <span className="font-medium text-slate-800">
                    {mergedItems.length}
                  </span>
                </div>
              </div>

              <div className="rounded-2xl border border-sky-100 bg-sky-50/70 p-4">
                <div className="flex justify-between gap-4">
                  <span className="font-semibold text-slate-700">
                    Tổng cộng
                  </span>
                  <span className="text-xl font-semibold text-sky-700">
                    {formatPrice(checkoutPreview?.group?.total || 0)}
                  </span>
                </div>
              </div>

              {!selectedAddress && (
                <div className="flex items-start gap-2 rounded-2xl border border-red-100 bg-red-50 p-3 text-sm text-red-600">
                  <AlertTriangle size={17} className="mt-0.5 shrink-0" />
                  Vui lòng thêm địa chỉ nhận hàng để đặt hàng.
                </div>
              )}

              <button
                onClick={handleCreateOrder}
                disabled={!selectedAddress || !hasCheckoutPayload}
                className={`flex w-full items-center justify-center gap-2 rounded-2xl px-5 py-3.5 text-sm font-semibold transition-all ${
                  selectedAddress && hasCheckoutPayload
                    ? "bg-sky-500 text-white shadow-lg shadow-sky-100 hover:bg-sky-600 active:scale-[0.98]"
                    : "cursor-not-allowed bg-slate-200 text-slate-500"
                }`}
              >
                <CheckCircle size={18} />
                {selectedAddress ? "Đặt hàng" : "Chưa có địa chỉ"}
              </button>
            </div>
          </div>
        </aside>
      </main>

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
