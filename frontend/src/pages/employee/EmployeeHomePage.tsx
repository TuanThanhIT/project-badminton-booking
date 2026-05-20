import { useEffect, useMemo, useState } from "react";
import {
  Banknote,
  CalendarClock,
  Check,
  ClipboardList,
  CreditCard,
  Landmark,
  Loader2,
  PackagePlus,
  Plus,
  RefreshCw,
  Search,
  Trash2,
  WalletCards,
} from "lucide-react";
import { toast } from "react-toastify";
import { useNavigate } from "react-router-dom";
import { useAppDispatch, useAppSelector } from "../../redux/hook";
import {
  checkoutCounterDraft,
  createCounterDraft,
  deleteCounterDraft,
  getCounterBeverages,
  getCounterCourtBoard,
  getCounterDrafts,
  getCounterProducts,
  getCounterSession,
  updateCounterDraft,
} from "../../redux/slices/employee/counterSlice";
import type {
  CounterBeverage,
  CounterCourtSlot,
  CounterDraft,
  CounterItem,
  CounterProduct,
} from "../../types/employeeCounter";

const getToday = () =>
  new Date().toLocaleDateString("en-CA", {
    timeZone: "Asia/Ho_Chi_Minh",
  });

const formatCurrency = (value: number) =>
  new Intl.NumberFormat("vi-VN", {
    style: "currency",
    currency: "VND",
    maximumFractionDigits: 0,
  }).format(value || 0);

const timeShort = (value: string) => value?.slice(0, 5);

const SLOT_BOOKING_LABEL: Record<string, string> = {
  PENDING: "Chờ xử lý",
  CONFIRMED: "Đã xác nhận",
  CANCEL_REQUESTED: "Yêu cầu hủy",
  COMPLETED: "Hoàn thành",
  CANCELLED: "Đã hủy",
  FAILED: "Thất bại",
};

const SLOT_PAYMENT_LEGEND = [
  {
    status: "UNPAID",
    label: "Chưa thanh toán",
    className: "bg-sky-100 border-sky-300",
  },
  {
    status: "PENDING",
    label: "Đang thanh toán",
    className: "bg-amber-100 border-amber-400",
  },
  {
    status: "PAID",
    label: "Đã thanh toán",
    className: "bg-emerald-100 border-emerald-300",
  },
  {
    status: "FAILED",
    label: "Thanh toán lỗi",
    className: "bg-rose-100 border-rose-300",
  },
];

const getSlotLockedText = (slot?: CounterCourtSlot) => {
  if (!slot) return "Không có dữ liệu";
  if (slot.lockReason === "PAST") return "Đã qua giờ";
  if (slot.lockReason === "NO_PRICE") return "Chưa có giá";
  if (slot.booking?.status) {
    return SLOT_BOOKING_LABEL[slot.booking.status] || "Đã giữ sân";
  }
  return "Đã khóa";
};

const getSlotPaymentClass = (slot?: CounterCourtSlot) => {
  const status = slot?.booking?.paymentStatus || "UNPAID";
  if (status === "PAID") return "bg-emerald-100 text-emerald-950";
  if (status === "PENDING") return "bg-amber-100 text-amber-950";
  if (status === "FAILED") return "bg-rose-100 text-rose-950";
  return "bg-sky-100 text-sky-950";
};

const isProduct = (item: CounterItem): item is CounterProduct & CounterItem =>
  item.type === "product";

const emptyImage = "/img/logo_badminton.jpg";

const EmployeeHomePage = () => {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();

  const { session, products, beverages, courtBoard, drafts } = useAppSelector(
    (state) => state.employeeCounter,
  );

  const loadingMap = useAppSelector((state) => state.ui.loadingMap);

  const [activeTab, setActiveTab] = useState<"counter" | "booking">("counter");
  const [itemTab, setItemTab] = useState<"beverage" | "product">("beverage");
  const [keyword, setKeyword] = useState("");
  const [date, setDate] = useState(getToday());
  const [nameCustomer, setNameCustomer] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [selectedDraftId, setSelectedDraftId] = useState<number | null>(null);
  const [note, setNote] = useState("");
  const [cartItems, setCartItems] = useState<CounterItem[]>([]);
  const [selectedSlots, setSelectedSlots] = useState<CounterCourtSlot[]>([]);
  const [paymentMethod, setPaymentMethod] = useState<"CASH" | "VNPAY" | "BANK">(
    "CASH",
  );
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);

  const sessionLoading = loadingMap["employeeCounter/getCounterSession"];

  const inventoryLoading =
    loadingMap["employeeCounter/getCounterProducts"] ||
    loadingMap["employeeCounter/getCounterBeverages"];

  const boardLoading = loadingMap["employeeCounter/getCounterCourtBoard"];

  const draftActionLoading =
    loadingMap["employeeCounter/createCounterDraft"] ||
    loadingMap["employeeCounter/updateCounterDraft"] ||
    loadingMap["employeeCounter/checkoutCounterDraft"] ||
    loadingMap["employeeCounter/deleteCounterDraft"];

  useEffect(() => {
    dispatch(getCounterSession())
      .unwrap()
      .catch(() => navigate("/employee/cash-register"));

    dispatch(getCounterDrafts());
  }, [dispatch, navigate]);

  useEffect(() => {
    const timer = window.setTimeout(() => {
      if (itemTab === "product") dispatch(getCounterProducts({ keyword }));
      if (itemTab === "beverage") dispatch(getCounterBeverages({ keyword }));
    }, 300);

    return () => window.clearTimeout(timer);
  }, [dispatch, itemTab, keyword]);

  useEffect(() => {
    dispatch(getCounterCourtBoard({ date }));
  }, [dispatch, date]);

  const currentDraft = drafts.find((draft) => draft.id === selectedDraftId);
  const canOperate = Boolean(session?.canOperateCounter);

  const cartTotal = useMemo(
    () =>
      cartItems.reduce(
        (sum, item) => sum + Number(item.price || 0) * item.quantity,
        0,
      ),
    [cartItems],
  );

  const courtTotal = useMemo(
    () => selectedSlots.reduce((sum, item) => sum + Number(item.price || 0), 0),
    [selectedSlots],
  );

  const grandTotal = cartTotal + courtTotal;

  const markOrderDirty = () => {
    if (selectedDraftId) setHasUnsavedChanges(true);
  };

  const getDraftCustomerDisplay = (draft?: CounterDraft | null) => {
    if (draft) {
      return draft.phoneNumber
        ? `${draft.nameCustomer} - ${draft.phoneNumber}`
        : draft.nameCustomer;
    }

    const name = nameCustomer || currentDraft?.nameCustomer || "Khách vãng lai";
    const phone = phoneNumber || currentDraft?.phoneNumber || "";
    return phone ? `${name} - ${phone}` : name;
  };

  const applyDraftToForm = (draft: CounterDraft) => {
    setSelectedDraftId(draft.id);
    setNameCustomer(draft.nameCustomer);
    setPhoneNumber(draft.phoneNumber || "");
    setNote(draft.note || "");

    setSelectedSlots(
      draft.courtItems.map((item) => ({
        key: `draft-${draft.id}-${item.id}`,
        courtId: item.courtId,
        courtName: item.courtName,
        location: "",
        playDate: item.playDate,
        startTime: item.startTime,
        endTime: item.endTime,
        price: item.price,
        status: "AVAILABLE",
        booking: null,
      })),
    );

    setCartItems([
      ...draft.productItems.map((item) => ({
        id: item.productVariantId,
        variantId: item.productVariantId,
        productId: 0,
        type: "product" as const,
        productName: item.productName,
        thumbnailUrl: item.thumbnailUrl,
        price: item.price,
        stock: item.quantity,
        quantity: item.quantity,
      })),
      ...draft.beverageItems.map((item) => ({
        id: item.beverageId,
        type: "beverage" as const,
        beverageName: item.beverageName,
        thumbnailUrl: item.thumbnailUrl,
        price: item.price,
        stock: item.quantity,
        quantity: item.quantity,
      })),
    ]);

    setHasUnsavedChanges(false);
  };

  const resetOrder = () => {
    if (
      hasUnsavedChanges &&
      !window.confirm(
        "Đơn hiện tại có thay đổi chưa lưu. Tạo đơn mới và bỏ qua thay đổi?",
      )
    ) {
      return;
    }

    setSelectedDraftId(null);
    setNameCustomer("");
    setPhoneNumber("");
    setNote("");
    setCartItems([]);
    setSelectedSlots([]);
    setHasUnsavedChanges(false);
  };

  const loadDraft = (draft: CounterDraft) => {
    if (
      hasUnsavedChanges &&
      !window.confirm(
        "Đơn hiện tại có thay đổi chưa lưu. Tải lại đơn và bỏ qua thay đổi?",
      )
    ) {
      return;
    }

    applyDraftToForm(draft);
  };

  const handleCancelDraftChanges = () => {
    if (!currentDraft) {
      setHasUnsavedChanges(false);
      return;
    }

    applyDraftToForm(currentDraft);
    toast.info("Đã hủy thay đổi chưa lưu.");
  };

  const addProduct = (product: CounterProduct) => {
    if (!canOperate)
      return toast.warning("Chỉ nhân viên đứng quầy mới thao tác đơn.");

    markOrderDirty();

    setCartItems((prev) => {
      const existed = prev.find(
        (item) => item.type === "product" && item.id === product.id,
      );

      if (existed) {
        if (existed.quantity >= product.stock) return prev;

        return prev.map((item) =>
          item.type === "product" && item.id === product.id
            ? { ...item, quantity: item.quantity + 1 }
            : item,
        );
      }

      return [{ ...product, type: "product", quantity: 1 }, ...prev];
    });
  };

  const addBeverage = (beverage: CounterBeverage) => {
    if (!canOperate)
      return toast.warning("Chỉ nhân viên đứng quầy mới thao tác đơn.");

    markOrderDirty();

    setCartItems((prev) => {
      const existed = prev.find(
        (item) => item.type === "beverage" && item.id === beverage.id,
      );

      if (existed) {
        if (existed.quantity >= beverage.stock) return prev;

        return prev.map((item) =>
          item.type === "beverage" && item.id === beverage.id
            ? { ...item, quantity: item.quantity + 1 }
            : item,
        );
      }

      return [{ ...beverage, type: "beverage", quantity: 1 }, ...prev];
    });
  };

  const updateQuantity = (target: CounterItem, quantity: number) => {
    markOrderDirty();

    setCartItems((prev) =>
      prev
        .map((item) =>
          item.type === target.type && item.id === target.id
            ? {
                ...item,
                quantity: Math.max(
                  1,
                  Math.min(quantity, item.stock || quantity),
                ),
              }
            : item,
        )
        .filter((item) => item.quantity > 0),
    );
  };

  const removeItem = (target: CounterItem) => {
    markOrderDirty();

    setCartItems((prev) =>
      prev.filter(
        (item) => !(item.type === target.type && item.id === target.id),
      ),
    );
  };

  const toggleSlot = (slot: CounterCourtSlot) => {
    if (!canOperate)
      return toast.warning("Chỉ nhân viên đứng quầy mới thao tác đơn.");

    if (slot.status === "LOCKED") return;

    markOrderDirty();

    setSelectedSlots((prev) => {
      const existed = prev.some((item) => item.key === slot.key);
      if (existed) return prev.filter((item) => item.key !== slot.key);
      return [...prev, slot];
    });
  };

  const handleCreateDraft = async () => {
    if (!canOperate)
      return toast.warning("Chỉ nhân viên đứng quầy mới tạo đơn.");
    if (!nameCustomer.trim()) return toast.error("Nhập tên khách hàng.");
    if (!phoneNumber.trim())
      return toast.error("Nhập số điện thoại khách hàng.");

    try {
      const res = await dispatch(
        createCounterDraft({
          nameCustomer: nameCustomer.trim(),
          phoneNumber: phoneNumber.trim(),
        }),
      ).unwrap();

      setSelectedDraftId(res.data.id);
      setHasUnsavedChanges(
        Boolean(cartItems.length || selectedSlots.length || note.trim()),
      );

      toast.success(res.message);
    } catch {
      // global middleware handles API errors
    }
  };

  const handleSaveDraft = async (silent = false) => {
    if (!selectedDraftId) {
      toast.error("Tạo hoặc chọn đơn tạm trước.");
      return false;
    }

    if (!canOperate) {
      toast.warning("Chỉ nhân viên đứng quầy mới cập nhật đơn.");
      return false;
    }
    if (!nameCustomer.trim()) {
      toast.error("Nhập tên khách hàng.");
      return false;
    }
    if (!phoneNumber.trim()) {
      toast.error("Nhập số điện thoại khách hàng.");
      return false;
    }

    try {
      await dispatch(
        updateCounterDraft({
          draftId: selectedDraftId,
          data: {
            nameCustomer: nameCustomer.trim(),
            phoneNumber: phoneNumber.trim(),
            note,
            courtItems: selectedSlots.map((slot) => ({
              courtId: slot.courtId,
              playDate: slot.playDate,
              startTime: slot.startTime,
              endTime: slot.endTime,
            })),
            productItems: cartItems.filter(isProduct).map((item) => ({
              productVariantId: item.id,
              quantity: item.quantity,
            })),
            beverageItems: cartItems
              .filter((item) => item.type === "beverage")
              .map((item) => ({
                beverageId: item.id,
                quantity: item.quantity,
              })),
          },
        }),
      ).unwrap();

      if (!silent) toast.success("Đã lưu thay đổi đơn.");

      setHasUnsavedChanges(false);
      dispatch(getCounterCourtBoard({ date }));

      return true;
    } catch {
      // global middleware handles API errors
      return false;
    }
  };

  const handleCheckout = async () => {
    if (!selectedDraftId) return toast.error("Chọn đơn cần thanh toán.");

    if (!canOperate)
      return toast.warning("Chỉ nhân viên đứng quầy mới thanh toán.");

    try {
      const saved = await handleSaveDraft(true);
      if (!saved) return;

      const res = await dispatch(
        checkoutCounterDraft({
          draftId: selectedDraftId,
          data: { paymentMethod },
        }),
      ).unwrap();

      toast.success(res.message);
      resetOrder();
      setHasUnsavedChanges(false);
      dispatch(getCounterDrafts());
      dispatch(getCounterCourtBoard({ date }));
      dispatch(getCounterSession());
    } catch {
      // global middleware handles API errors
    }
  };

  const handleDeleteDraft = async (draftId: number) => {
    try {
      await dispatch(deleteCounterDraft({ draftId })).unwrap();

      if (selectedDraftId === draftId) {
        setSelectedDraftId(null);
        setNameCustomer("");
        setNote("");
        setCartItems([]);
        setSelectedSlots([]);
        setHasUnsavedChanges(false);
      }

      toast.success("Đã xoá đơn tạm.");
      dispatch(getCounterCourtBoard({ date }));
    } catch {
      // global middleware handles API errors
    }
  };

  const inventory = itemTab === "product" ? products : beverages;

  if (sessionLoading && !session) {
    return (
      <div className="flex h-full items-center justify-center bg-slate-50">
        <div className="inline-flex items-center gap-3 rounded-2xl border border-slate-200 bg-white px-5 py-4 text-slate-600 shadow-sm">
          <Loader2 className="h-5 w-5 animate-spin text-sky-600" />
          Đang kiểm tra ca làm...
        </div>
      </div>
    );
  }

  return (
    <div className="h-full overflow-auto bg-slate-50 px-4 py-4 sm:px-6">
      <div className="mx-auto flex max-w-[1840px] flex-col gap-4">
        <section className="grid gap-3 lg:grid-cols-[1.2fr_0.8fr]">
          <div className="rounded-3xl border border-slate-200 bg-white p-4 shadow-sm">
            <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
              <div>
                <p className="text-sm font-bold text-sky-700">
                  Vận hành tại quầy
                </p>

                <h2 className="mt-1 text-2xl font-extrabold text-slate-800">
                  {session?.branch?.branchName || "Chi nhánh hiện tại"}
                </h2>

                <p className="mt-1 text-sm text-slate-500">
                  {session?.workShift.shiftName} •{" "}
                  {timeShort(session?.workShift.startTime || "")} -{" "}
                  {timeShort(session?.workShift.endTime || "")}
                </p>
              </div>

              <div className="grid grid-cols-2 gap-3 sm:min-w-[360px]">
                <div className="rounded-2xl bg-slate-50 px-4 py-3">
                  <p className="text-xs font-semibold text-slate-500">
                    Tiền dự kiến
                  </p>
                  <p className="mt-1 text-lg font-extrabold text-slate-800">
                    {formatCurrency(session?.cashRegister?.expectedCash || 0)}
                  </p>
                </div>

                <div className="rounded-2xl bg-emerald-50 px-4 py-3">
                  <p className="text-xs font-semibold text-emerald-700">
                    Quyền thao tác
                  </p>
                  <p className="mt-1 text-lg font-extrabold text-emerald-800">
                    {session?.canOperateCounter ? "Quầy" : "Hỗ trợ"}
                  </p>
                </div>
              </div>
            </div>
          </div>

          <div className="rounded-3xl border border-slate-200 bg-white p-4 shadow-sm">
            <div className="flex rounded-2xl bg-slate-100 p-1">
              {[
                { id: "counter", label: "Xử lý đơn", icon: PackagePlus },
                { id: "booking", label: "Sơ đồ sân", icon: CalendarClock },
              ].map((tab) => {
                const Icon = tab.icon;

                return (
                  <button
                    key={tab.id}
                    onClick={() =>
                      setActiveTab(tab.id as "counter" | "booking")
                    }
                    className={`flex flex-1 items-center justify-center gap-2 rounded-xl px-3 py-3 text-sm font-bold transition ${
                      activeTab === tab.id
                        ? "bg-white text-sky-700 shadow-sm"
                        : "text-slate-600 hover:text-slate-800"
                    }`}
                  >
                    <Icon className="h-4 w-4" />
                    {tab.label}
                  </button>
                );
              })}
            </div>
          </div>
        </section>

        {activeTab === "counter" ? (
          <section className="grid h-[calc(100vh-220px)] min-h-[760px] items-stretch gap-5 overflow-hidden xl:grid-cols-[0.9fr_1.12fr_1.08fr]">
            {/* LEFT - BÁN TẠI QUẦY */}
            <div className="flex h-full min-h-0 flex-col overflow-hidden rounded-3xl border border-slate-200 bg-white p-4 shadow-sm">
              <div className="mb-4 flex items-center justify-between gap-3">
                <h3 className="text-lg font-semibold text-slate-700">
                  Bán tại quầy
                </h3>

                <button
                  onClick={() => {
                    dispatch(getCounterProducts({ keyword }));
                    dispatch(getCounterBeverages({ keyword }));
                  }}
                  className="grid h-10 w-10 place-items-center rounded-2xl border border-slate-200 text-slate-500 transition hover:bg-slate-50"
                >
                  <RefreshCw className="h-4 w-4" />
                </button>
              </div>

              <div className="mb-3 grid grid-cols-2 rounded-2xl bg-slate-100 p-1">
                <button
                  onClick={() => setItemTab("beverage")}
                  className={`rounded-xl px-3 py-2 text-sm font-medium transition ${
                    itemTab === "beverage"
                      ? "bg-white text-sky-700 shadow-sm"
                      : "text-slate-500 hover:text-slate-800"
                  }`}
                >
                  Đồ uống
                </button>

                <button
                  onClick={() => setItemTab("product")}
                  className={`rounded-xl px-3 py-2 text-sm font-medium transition ${
                    itemTab === "product"
                      ? "bg-white text-sky-700 shadow-sm"
                      : "text-slate-500 hover:text-slate-800"
                  }`}
                >
                  Sản phẩm
                </button>
              </div>

              <div className="relative mb-4">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-500" />

                <input
                  value={keyword}
                  onChange={(event) => setKeyword(event.target.value)}
                  placeholder="Tìm nhanh..."
                  className="h-11 w-full rounded-2xl border border-slate-200 bg-slate-50 pl-10 pr-3 text-sm text-slate-700 outline-none transition placeholder:text-slate-500 focus:border-sky-400 focus:bg-white focus:ring-1 focus:ring-sky-100"
                />
              </div>

              <div className="min-h-0 flex-1 space-y-3 overflow-y-auto pr-1">
                {inventoryLoading && (
                  <div className="rounded-2xl bg-slate-50 p-4 text-sm text-slate-500">
                    Đang tải danh sách...
                  </div>
                )}

                {!inventoryLoading &&
                  inventory.map((item) => {
                    const title =
                      itemTab === "product"
                        ? (item as CounterProduct).productName
                        : (item as CounterBeverage).beverageName;

                    return (
                      <div
                        key={`${itemTab}-${item.id}`}
                        className="flex items-center gap-3 rounded-2xl border border-slate-200 bg-white p-3 transition hover:border-slate-300 hover:bg-slate-50"
                      >
                        <img
                          src={item.thumbnailUrl || emptyImage}
                          alt={title}
                          className="h-14 w-14 rounded-2xl object-cover"
                        />

                        <div className="min-w-0 flex-1">
                          <p
                            className="truncate text-sm font-medium text-slate-700"
                            title={title}
                          >
                            {title}
                          </p>

                          <p className="mt-1 text-sm font-semibold text-sky-700">
                            {formatCurrency(item.price)}
                          </p>

                          <p className="text-xs font-medium text-slate-500">
                            Tồn: {item.stock}
                          </p>
                        </div>

                        <button
                          onClick={() =>
                            itemTab === "product"
                              ? addProduct(item as CounterProduct)
                              : addBeverage(item as CounterBeverage)
                          }
                          disabled={!canOperate || item.stock <= 0}
                          className="grid h-10 w-10 shrink-0 place-items-center rounded-2xl bg-sky-600 text-white transition hover:bg-sky-700 disabled:cursor-not-allowed disabled:bg-slate-300"
                        >
                          <Plus className="h-5 w-5" />
                        </button>
                      </div>
                    );
                  })}
              </div>
            </div>

            {/* CENTER - ĐƠN TẠM */}
            <div className="flex h-full min-h-0 flex-col overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm">
              <div className="shrink-0 border-b border-slate-100 p-4">
                <div className="flex items-center justify-between gap-3">
                  <div>
                    <h3 className="flex items-center gap-2 text-lg font-semibold text-slate-700">
                      <ClipboardList className="h-5 w-5 text-sky-600" />
                      Đơn tạm
                    </h3>

                    <p className="mt-1 text-xs font-medium text-slate-500">
                      {drafts.length} đơn đang mở
                    </p>
                  </div>

                  <button
                    onClick={resetOrder}
                    className="h-10 rounded-2xl border border-slate-200 px-4 text-sm font-medium text-slate-600 transition hover:bg-slate-50"
                  >
                    Đơn mới
                  </button>
                </div>

                <div className="mt-4 grid grid-cols-[1fr_160px_82px] gap-2">
                  <input
                    value={nameCustomer}
                    onChange={(event) => {
                      setNameCustomer(event.target.value);
                      markOrderDirty();
                    }}
                    placeholder="Tên khách vãng lai"
                    className="h-11 min-w-0 rounded-2xl border border-slate-200 bg-slate-50 px-4 text-sm font-medium text-slate-700 outline-none transition placeholder:text-slate-400 focus:border-sky-400 focus:bg-white focus:ring-1 focus:ring-sky-100"
                  />

                  <input
                    value={phoneNumber}
                    onChange={(event) => {
                      setPhoneNumber(event.target.value);
                      markOrderDirty();
                    }}
                    placeholder="Số điện thoại"
                    className="h-11 min-w-0 rounded-2xl border border-slate-200 bg-slate-50 px-4 text-sm font-medium text-slate-700 outline-none transition placeholder:text-slate-400 focus:border-sky-400 focus:bg-white focus:ring-1 focus:ring-sky-100"
                  />

                  <button
                    onClick={handleCreateDraft}
                    disabled={draftActionLoading || !canOperate}
                    className="h-11 rounded-2xl bg-sky-600 text-sm font-medium text-white transition hover:bg-sky-700 disabled:cursor-not-allowed disabled:bg-slate-300"
                  >
                    Tạo đơn
                  </button>
                </div>
              </div>

              <div className="min-h-0 flex-1 overflow-hidden p-4">
                <div className="flex h-full min-h-0 flex-col">
                  <div className="shrink-0">
                    <div className="mb-2 flex items-center justify-between">
                      <p className="text-sm font-medium text-slate-700">
                        Danh sách đơn
                      </p>

                      <span className="rounded-full bg-slate-100 px-2.5 py-1 text-xs font-medium text-slate-500">
                        {drafts.length}
                      </span>
                    </div>

                    <div className="max-h-[150px] overflow-y-auto pr-1">
                      {drafts.length ? (
                        <div className="space-y-2">
                          {drafts.map((draft) => {
                            const active = selectedDraftId === draft.id;

                            return (
                              <button
                                key={draft.id}
                                onClick={() => loadDraft(draft)}
                                className={`w-full rounded-2xl border p-3 text-left transition ${
                                  active
                                    ? "border-sky-300 bg-sky-50"
                                    : "border-slate-200 bg-white hover:border-slate-300 hover:bg-slate-50"
                                }`}
                              >
                                <div className="flex items-start justify-between gap-3">
                                  <div className="min-w-0">
                                    <div className="flex items-center gap-2">
                                      <span
                                        className={`rounded-full px-2 py-0.5 text-xs font-medium ${
                                          active
                                            ? "bg-sky-100 text-sky-700"
                                            : "bg-slate-100 text-slate-500"
                                        }`}
                                      >
                                        #{draft.id}
                                      </span>

                                      <p
                                        className="truncate text-sm font-medium text-slate-700"
                                        title={getDraftCustomerDisplay(draft)}
                                      >
                                        {getDraftCustomerDisplay(draft)}
                                      </p>
                                    </div>

                                    <p className="mt-1 text-xs font-medium text-slate-500">
                                      Đơn tạm tại quầy
                                    </p>
                                  </div>

                                  <div className="shrink-0 text-right">
                                    <p className="text-sm font-semibold text-slate-700">
                                      {formatCurrency(draft.totalAmount)}
                                    </p>

                                    {active && (
                                      <span className="mt-1 inline-flex rounded-full bg-white px-2 py-0.5 text-[11px] font-medium text-sky-600">
                                        Đang chọn
                                      </span>
                                    )}
                                  </div>
                                </div>
                              </button>
                            );
                          })}
                        </div>
                      ) : (
                        <div className="grid h-24 place-items-center rounded-2xl border border-dashed border-slate-300 bg-slate-50 text-center">
                          <div>
                            <ClipboardList className="mx-auto h-6 w-6 text-slate-300" />
                            <p className="mt-2 text-sm font-medium text-slate-500">
                              Chưa có đơn tạm
                            </p>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="mt-4 flex min-h-0 flex-1 flex-col rounded-3xl border border-slate-200 bg-white p-4">
                    <div className="shrink-0 border-b border-slate-100 pb-4">
                      <div className="flex items-start justify-between gap-4">
                        <div className="min-w-0">
                          <p className="text-xs font-medium text-slate-500">
                            Chi tiết đơn
                          </p>

                          <p
                            className="mt-1 truncate text-base font-medium text-slate-700"
                            title={getDraftCustomerDisplay()}
                          >
                            {getDraftCustomerDisplay()}
                          </p>
                        </div>

                        <div className="shrink-0 text-right">
                          <p className="text-xs font-medium text-slate-500">
                            Tổng tiền
                          </p>

                          <p className="mt-1 text-base font-semibold text-slate-700">
                            {formatCurrency(
                              grandTotal || currentDraft?.totalAmount || 0,
                            )}
                          </p>
                        </div>
                      </div>
                    </div>

                    {hasUnsavedChanges && (
                      <div className="mt-3 flex shrink-0 items-center justify-between gap-3 rounded-2xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800">
                        <div>
                          <p className="font-semibold">
                            Đơn có thay đổi chưa lưu
                          </p>
                          <p className="mt-0.5 text-xs font-medium text-amber-700">
                            Bấm Lưu ngay để cập nhật đơn, hoặc Hoàn tất sẽ tự
                            lưu trước khi thanh toán.
                          </p>
                        </div>

                        <div className="flex shrink-0 items-center gap-2">
                          <button
                            onClick={handleCancelDraftChanges}
                            disabled={draftActionLoading}
                            className="inline-flex h-9 items-center justify-center rounded-xl border border-amber-200 bg-white px-4 text-xs font-semibold text-amber-700 transition hover:bg-amber-100 disabled:cursor-not-allowed disabled:text-slate-300"
                          >
                            Hủy
                          </button>

                          <button
                            onClick={() => handleSaveDraft()}
                            disabled={!canOperate || draftActionLoading}
                            className="inline-flex h-9 items-center justify-center rounded-xl bg-amber-500 px-4 text-xs font-semibold text-white transition hover:bg-amber-600 disabled:cursor-not-allowed disabled:bg-slate-300"
                          >
                            Lưu ngay
                          </button>
                        </div>
                      </div>
                    )}

                    {!cartItems.length && !selectedSlots.length ? (
                      <div className="grid min-h-0 flex-1 place-items-center text-center">
                        <div>
                          <ClipboardList className="mx-auto h-8 w-8 text-slate-300" />
                          <p className="mt-3 text-sm font-medium text-slate-500">
                            Chưa có thông tin trong đơn
                          </p>
                        </div>
                      </div>
                    ) : (
                      <div className="min-h-0 flex-1 overflow-y-auto pt-4 pr-1">
                        <div className="space-y-4">
                          {selectedSlots.length > 0 && (
                            <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white">
                              <div className="flex items-center justify-between border-b border-slate-100 bg-slate-50 px-4 py-2.5">
                                <p className="text-sm font-semibold text-slate-700">
                                  Sân đã chọn
                                  <span className="ml-1 font-medium text-slate-500">
                                    ({selectedSlots.length})
                                  </span>
                                </p>
                              </div>

                              <div className="divide-y divide-slate-100">
                                {selectedSlots.map((slot) => (
                                  <div
                                    key={slot.key}
                                    className="flex items-center justify-between gap-3 px-4 py-3"
                                  >
                                    <div className="min-w-0">
                                      <p className="truncate text-sm font-semibold text-slate-700">
                                        {slot.courtName}
                                      </p>
                                      <p className="mt-0.5 text-xs font-medium text-slate-500">
                                        {timeShort(slot.startTime)} -{" "}
                                        {timeShort(slot.endTime)}
                                      </p>
                                    </div>

                                    <button
                                      onClick={() => toggleSlot(slot)}
                                      className="shrink-0 rounded-xl px-2.5 py-1 text-xs font-medium text-red-500 transition hover:bg-red-50"
                                    >
                                      Bỏ
                                    </button>
                                  </div>
                                ))}
                              </div>
                            </div>
                          )}

                          {cartItems.length > 0 && (
                            <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white">
                              <div className="flex items-center justify-between border-b border-slate-100 bg-slate-50 px-4 py-2.5">
                                <p className="text-sm font-semibold text-slate-700">
                                  Mặt hàng
                                  <span className="ml-1 font-medium text-slate-500">
                                    ({cartItems.length})
                                  </span>
                                </p>
                              </div>

                              <div className="divide-y divide-slate-100">
                                {cartItems.map((item) => {
                                  const itemName = isProduct(item)
                                    ? item.productName
                                    : item.beverageName;

                                  return (
                                    <div
                                      key={`${item.type}-${item.id}`}
                                      className="grid grid-cols-[48px_1fr_auto] items-center gap-3 px-4 py-3"
                                    >
                                      <img
                                        src={item.thumbnailUrl || emptyImage}
                                        alt={itemName}
                                        className="h-12 w-12 rounded-xl object-cover"
                                      />

                                      <div className="min-w-0">
                                        <p
                                          className="truncate text-sm font-semibold text-slate-700"
                                          title={itemName}
                                        >
                                          {itemName}
                                        </p>

                                        <p className="mt-0.5 text-xs font-medium text-slate-500">
                                          {formatCurrency(item.price)}
                                        </p>
                                      </div>

                                      <div className="flex shrink-0 items-center gap-2">
                                        <input
                                          type="number"
                                          min={1}
                                          value={item.quantity}
                                          onChange={(event) =>
                                            updateQuantity(
                                              item,
                                              Number(event.target.value),
                                            )
                                          }
                                          className="h-9 w-14 rounded-xl border border-slate-200 bg-slate-50 text-center text-sm font-semibold text-slate-700 outline-none transition focus:border-sky-400 focus:bg-white focus:ring-2 focus:ring-sky-100"
                                        />

                                        <button
                                          onClick={() => removeItem(item)}
                                          className="grid h-9 w-9 place-items-center rounded-xl text-red-500 transition hover:bg-red-50"
                                        >
                                          <Trash2 className="h-4 w-4" />
                                        </button>
                                      </div>
                                    </div>
                                  );
                                })}
                              </div>
                            </div>
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* RIGHT - THANH TOÁN */}
            <div className="flex h-full min-h-0 flex-col overflow-hidden rounded-3xl border border-slate-200 bg-white p-4 shadow-sm">
              <div className="mb-3 flex shrink-0 items-center justify-between">
                <h3 className="flex items-center gap-2 text-lg font-semibold text-slate-700">
                  <WalletCards className="h-5 w-5 text-sky-600" />
                  Thanh toán
                </h3>

                <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-medium text-slate-500">
                  #{selectedDraftId || "--"}
                </span>
              </div>

              <div className="shrink-0 rounded-3xl border border-slate-200 bg-slate-50 p-3">
                <div className="grid grid-cols-2 gap-3">
                  <div className="rounded-2xl bg-white px-4 py-3">
                    <p className="text-xs font-medium text-slate-500">
                      Tiền sân
                    </p>
                    <p className="mt-1 text-base font-semibold text-slate-700">
                      {formatCurrency(courtTotal)}
                    </p>
                  </div>

                  <div className="rounded-2xl bg-white px-4 py-3">
                    <p className="text-xs font-medium text-slate-500">
                      Hàng bán
                    </p>
                    <p className="mt-1 text-base font-semibold text-slate-700">
                      {formatCurrency(cartTotal)}
                    </p>
                  </div>
                </div>

                <div className="mt-3 rounded-2xl bg-white px-4 py-3">
                  <p className="text-xs font-medium uppercase tracking-wide text-slate-500">
                    Tổng thanh toán
                  </p>

                  <p className="mt-1 text-2xl font-semibold text-slate-800">
                    {formatCurrency(
                      grandTotal || currentDraft?.totalAmount || 0,
                    )}
                  </p>
                </div>
              </div>

              <textarea
                value={note}
                onChange={(event) => {
                  setNote(event.target.value);
                  markOrderDirty();
                }}
                placeholder="Ghi chú cho đơn..."
                className="mt-3 h-20 w-full shrink-0 resize-none rounded-3xl border border-slate-200 bg-white p-4 text-sm text-slate-700 outline-none placeholder:text-slate-400 focus:border-sky-400 focus:ring-1 focus:ring-sky-100"
              />

              <div className="mt-4 shrink-0">
                <h4 className="mb-2 text-sm font-semibold text-slate-700">
                  Phương thức thanh toán
                </h4>

                <div className="grid gap-2">
                  {[
                    {
                      id: "CASH",
                      label: "Tiền mặt",
                      description: "Tại quầy",
                      icon: Banknote,
                    },
                    {
                      id: "BANK",
                      label: "Ngân hàng",
                      description: "Chuyển khoản",
                      icon: Landmark,
                    },
                    {
                      id: "VNPAY",
                      label: "VNPay",
                      description: "Quét mã",
                      icon: CreditCard,
                    },
                  ].map((method) => {
                    const Icon = method.icon;
                    const active = paymentMethod === method.id;

                    return (
                      <button
                        key={method.id}
                        onClick={() =>
                          setPaymentMethod(
                            method.id as "CASH" | "VNPAY" | "BANK",
                          )
                        }
                        className={`flex h-[58px] items-center gap-3 rounded-2xl border px-3 text-left transition ${
                          active
                            ? "border-sky-300 bg-sky-50"
                            : "border-slate-200 bg-white hover:border-slate-300 hover:bg-slate-50"
                        }`}
                      >
                        <span
                          className={`grid h-10 w-10 shrink-0 place-items-center rounded-2xl ${
                            active
                              ? "bg-sky-100 text-sky-600"
                              : "bg-slate-100 text-slate-500"
                          }`}
                        >
                          <Icon className="h-4 w-4" />
                        </span>

                        <span className="min-w-0 flex-1">
                          <span className="block text-sm font-medium text-slate-700">
                            {method.label}
                          </span>

                          <span className="mt-0.5 block text-xs font-medium text-slate-500">
                            {method.description}
                          </span>
                        </span>

                        {active && (
                          <span className="grid h-6 w-6 shrink-0 place-items-center rounded-full bg-sky-600 text-white">
                            <Check className="h-3.5 w-3.5" />
                          </span>
                        )}
                      </button>
                    );
                  })}
                </div>
              </div>

              <div className="mt-auto shrink-0 pt-4">
                <button
                  onClick={handleCheckout}
                  disabled={
                    !selectedDraftId || draftActionLoading || !canOperate
                  }
                  className="inline-flex h-12 w-full items-center justify-center gap-2 rounded-2xl bg-sky-600 text-sm font-semibold text-white transition hover:bg-sky-700 disabled:cursor-not-allowed disabled:bg-slate-300"
                >
                  {draftActionLoading ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <Check className="h-4 w-4" />
                  )}
                  Hoàn tất
                </button>

                {selectedDraftId && (
                  <button
                    onClick={() => handleDeleteDraft(selectedDraftId)}
                    disabled={draftActionLoading || !canOperate}
                    className="mt-2 inline-flex h-10 w-full items-center justify-center gap-2 rounded-2xl text-sm font-medium text-red-500 transition hover:bg-red-50 disabled:cursor-not-allowed disabled:text-slate-300"
                  >
                    <Trash2 className="h-4 w-4" />
                    Xoá đơn tạm
                  </button>
                )}
              </div>
            </div>
          </section>
        ) : (
          <section className="rounded-3xl border border-slate-200 bg-white p-4 shadow-sm">
            <div className="mb-4 flex flex-col justify-between gap-3 sm:flex-row sm:items-center">
              <div>
                <h3 className="text-lg font-extrabold text-slate-800">
                  Sơ đồ sân theo chi nhánh
                </h3>
                <p className="mt-1 text-sm text-slate-500">
                  Lưới sân từ 06:00 đến 23:00, mỗi ô 30 phút. Giờ đã qua sẽ tự
                  khóa.
                </p>
              </div>

              <input
                type="date"
                value={date}
                onChange={(event) => setDate(event.target.value)}
                className="h-11 rounded-2xl border border-slate-200 px-4 text-sm font-semibold outline-none focus:border-sky-400 focus:ring-1 focus:ring-sky-100"
              />
            </div>

            <div className="relative overflow-x-auto rounded-2xl border border-slate-200">
              <div className="min-w-max">
                <div
                  className="grid bg-slate-100"
                  style={{
                    gridTemplateColumns: `170px repeat(${
                      courtBoard?.timeSlots.length || 1
                    }, 150px)`,
                  }}
                >
                  <div className="sticky left-0 z-10 flex h-16 items-center border-b border-r border-slate-200 bg-slate-100 px-4 text-sm font-extrabold">
                    Sân / Giờ
                  </div>

                  {courtBoard?.timeSlots.map((slot) => (
                    <div
                      key={`${slot.startTime}-${slot.endTime}`}
                      className="flex h-16 flex-col items-center justify-center border-b border-r border-slate-200 px-3 text-center text-xs font-extrabold text-slate-600"
                    >
                      <p>{timeShort(slot.startTime)}</p>
                      <p className="mt-0.5 text-[10px] font-semibold text-slate-500">
                        {timeShort(slot.endTime)}
                      </p>
                    </div>
                  ))}

                  {courtBoard?.courts.map((court) => (
                    <div key={court.id} className="contents">
                      <div className="sticky left-0 z-10 flex h-24 items-center border-b border-r border-slate-200 bg-white px-4 text-sm font-extrabold text-slate-800">
                        {court.courtName}
                      </div>

                      {courtBoard.timeSlots.map((time) => {
                        const slot = courtBoard.slots.find(
                          (item) =>
                            item.courtId === court.id &&
                            item.startTime === time.startTime &&
                            item.endTime === time.endTime,
                        );

                        const locked = slot?.status === "LOCKED";
                        const selected =
                          !locked &&
                          selectedSlots.some((item) => item.key === slot?.key);
                        const past = slot?.lockReason === "PAST";
                        const noPrice = slot?.lockReason === "NO_PRICE";

                        return (
                          <button
                            key={`${court.id}-${time.startTime}`}
                            onClick={() => slot && toggleSlot(slot)}
                            disabled={!slot || locked}
                            className={`h-24 overflow-hidden border-b border-r border-slate-200 p-2 text-center text-[11px] transition ${
                              selected
                                ? "bg-sky-600 text-white"
                                : past
                                  ? "bg-slate-200 text-slate-500"
                                  : noPrice
                                    ? "bg-slate-100 text-slate-500"
                                    : locked && slot?.booking
                                      ? getSlotPaymentClass(slot)
                                      : locked
                                        ? "bg-orange-100 text-orange-900"
                                        : "bg-white text-slate-600 hover:bg-sky-50"
                            }`}
                          >
                            {slot ? (
                              locked ? (
                                <div className="flex h-full flex-col items-center justify-center gap-1">
                                  <div className="min-w-0">
                                    <p
                                      className="line-clamp-2 font-extrabold leading-tight"
                                      title={
                                        slot.booking?.customerDisplay ||
                                        slot.booking?.customerName ||
                                        getSlotLockedText(slot)
                                      }
                                    >
                                      {slot.booking?.customerDisplay ||
                                        slot.booking?.customerName ||
                                        getSlotLockedText(slot)}
                                    </p>

                                    {slot.booking ? (
                                      <p className="mt-1 text-center font-semibold">
                                        {getSlotLockedText(slot)}
                                      </p>
                                    ) : (
                                      <p className="mt-1">
                                        {timeShort(slot.startTime)}
                                      </p>
                                    )}
                                  </div>

                                  {slot.booking && (
                                    <p className="font-bold">
                                      #{slot.booking.referenceId}
                                    </p>
                                  )}
                                </div>
                              ) : (
                                <div className="flex h-full flex-col items-center justify-center">
                                  <p className="font-extrabold">Trống</p>
                                  <p className="mt-1">
                                    {formatCurrency(slot.price)}
                                  </p>
                                </div>
                              )
                            ) : (
                              <div className="flex h-full items-center justify-center text-slate-500">
                                Không có giá
                              </div>
                            )}
                          </button>
                        );
                      })}
                    </div>
                  ))}
                </div>
              </div>

              {boardLoading && (
                <div className="absolute inset-0 grid place-items-center bg-white/70">
                  <Loader2 className="h-6 w-6 animate-spin text-sky-600" />
                </div>
              )}
            </div>

            <div className="mt-4 rounded-2xl border border-slate-200 bg-slate-50 p-4">
              <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
                <div>
                  <p className="text-sm font-extrabold text-slate-800">
                    Chú thích sơ đồ sân
                  </p>
                  <p className="mt-1 text-xs font-medium text-slate-500">
                    Màu ô thể hiện trạng thái thanh toán, chữ trong ô thể hiện
                    trạng thái lịch sân.
                    <br />
                    Lịch đã hủy hoặc đã hoàn tiền sẽ mở sân lại và hiển thị như
                    ô trống.
                  </p>
                </div>
                <div className="flex flex-wrap gap-2">
                  {SLOT_PAYMENT_LEGEND.map((item) => (
                    <div
                      key={item.status}
                      className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white px-3 py-2 text-xs font-bold text-slate-700"
                    >
                      <span
                        className={`h-3 w-3 rounded-full border ${item.className}`}
                      />
                      {item.label}
                    </div>
                  ))}
                  <div className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white px-3 py-2 text-xs font-bold text-slate-700">
                    <span className="h-3 w-3 rounded-full border border-sky-400 bg-sky-600" />
                    Đang chọn
                  </div>
                  <div className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white px-3 py-2 text-xs font-bold text-slate-700">
                    <span className="h-3 w-3 rounded-full border border-slate-300 bg-slate-200" />
                    Đã qua giờ
                  </div>
                </div>
              </div>
            </div>
          </section>
        )}
      </div>
    </div>
  );
};

export default EmployeeHomePage;
