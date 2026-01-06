import { useEffect, useState, useCallback } from "react";
import { useAppDispatch, useAppSelector } from "../../store/hook";
import { toast } from "react-toastify";
import debounce from "lodash.debounce";
import Swal from "sweetalert2";

import {
  CalendarClock,
  Check,
  CheckCircle,
  DollarSign,
  FileClock,
  Loader2,
  Package2,
  Search,
  Smartphone,
  Wallet,
} from "lucide-react";

import ItemList from "../../components/ui/customer+employee/ItemList";
import DraftBox from "../../components/ui/customer+employee/DraftBox";

import {
  clearCourtError,
  getCourtSchedules,
} from "../../store/slices/employee/courtSlice";
import {
  clearBeverageError,
  getBeverages,
} from "../../store/slices/employee/beverageSlice";
import {
  clearProductError,
  getProducts,
} from "../../store/slices/employee/productSlice";
import {
  clearOfflineBooking,
  clearOfflineError,
  createOfflineBooking,
  updateOfflineBooking,
} from "../../store/slices/employee/offlineSlice";
import { getDrafts } from "../../store/slices/employee/draftSlice";

import type { CourtScheduleEplResponse } from "../../types/court";
import type { ProductEplResponse } from "../../types/product";
import type { BeverageEplResponse } from "../../types/beverage";
import type { UpdateOfflineBookingRequest } from "../../types/offline";

const EmployeePage = () => {
  const dispatch = useAppDispatch();

  // ------------------- STATE -------------------
  const [date, setDate] = useState("");
  const [activeTab, setActiveTab] = useState<"beverage" | "product">(
    "beverage"
  );

  const [searchBeverage, setSearchBeverage] = useState("");
  const [searchProduct, setSearchProduct] = useState("");

  const [selectedCourtSlots, setSelectedCourtSlots] =
    useState<CourtScheduleEplResponse>([]);
  const [selectedProducts, setSelectedProducts] = useState<ProductEplResponse>(
    []
  );
  const [selectedBeverages, setSelectedBeverages] =
    useState<BeverageEplResponse>([]);

  const [loadingInitial, setLoadingInitial] = useState(true);
  const [paymentMethod, setPaymentMethod] = useState<"Cash" | "Momo">("Cash");

  // ------------------- SELECTORS -------------------
  const courtSchedules = useAppSelector((s) => s.courtEpl.courtSchedules);
  const courtError = useAppSelector((s) => s.courtEpl.error);

  const beverages = useAppSelector((s) => s.beverageEpl.beverages);
  const beverageError = useAppSelector((s) => s.beverageEpl.error);
  const beverageLoading = useAppSelector((s) => s.beverageEpl.loading);

  const products = useAppSelector((s) => s.productEpl.products);
  const productError = useAppSelector((s) => s.productEpl.error);
  const productLoading = useAppSelector((s) => s.productEpl.loading);

  const offlineBooking = useAppSelector((s) => s.offlineEpl.offlineBooking);
  const offlineError = useAppSelector((s) => s.offlineEpl.error);

  // ------------------- FETCH INITIAL DATA -------------------
  useEffect(() => {
    const fetchInitial = async () => {
      setLoadingInitial(true);
      try {
        await dispatch(getCourtSchedules({ data: { date } }));
        await Promise.all([
          dispatch(getBeverages({ dta: { keyword: "" } })),
          dispatch(getProducts({ dt: { keyword: "" } })),
        ]);
      } catch (err) {
        console.error(err);
      } finally {
        setLoadingInitial(false);
      }
    };
    fetchInitial();
  }, [dispatch, date]);

  // ------------------- DEBOUNCED SEARCH -------------------
  const fetchDebounce = useCallback(
    debounce((tab: "beverage" | "product", keyword: string) => {
      if (tab === "beverage") dispatch(getBeverages({ dta: { keyword } }));
      else dispatch(getProducts({ dt: { keyword } }));
    }, 500),
    [dispatch]
  );

  useEffect(() => {
    if (activeTab === "beverage") fetchDebounce("beverage", searchBeverage);
  }, [searchBeverage, fetchDebounce]);

  useEffect(() => {
    if (activeTab === "product") fetchDebounce("product", searchProduct);
  }, [searchProduct, fetchDebounce]);

  // ------------------- HANDLE ERRORS -------------------
  useEffect(() => {
    const error = courtError || beverageError || productError || offlineError;
    if (error) {
      toast.error(error);
      if (courtError) dispatch(clearCourtError());
      if (beverageError) dispatch(clearBeverageError());
      if (productError) dispatch(clearProductError());
      if (offlineError) dispatch(clearOfflineError());
    }
  }, [courtError, beverageError, productError, offlineError, dispatch]);

  // ------------------- GRID DATA -------------------
  const timeHeaders = Array.from(
    new Set(courtSchedules.map((s) => s.startTime.slice(0, 5)))
  );
  const courtNames = Array.from(
    new Set(courtSchedules.map((s) => s.court.name))
  );

  // ------------------- HANDLERS -------------------
  const handleAdd = (item: any) => {
    if (activeTab === "beverage")
      setSelectedBeverages((prev) => [...prev, item]);
    else setSelectedProducts((prev) => [...prev, item]);
  };

  const handleRemove = (item: any) => {
    if (activeTab === "beverage")
      setSelectedBeverages((prev) => prev.filter((i) => i.id !== item.id));
    else setSelectedProducts((prev) => prev.filter((i) => i.id !== item.id));
  };

  const handleCheckoutDraft = async (draftId: number) => {
    const result = await Swal.fire({
      title: "Xác nhận thanh toán",
      text: "Bạn có chắc muốn tiến hành thanh toán cho đơn này?",
      icon: "question",
      showCancelButton: true,
      confirmButtonText: "Chắc chắn",
      cancelButtonText: "Hủy",
    });

    if (result.isConfirmed) {
      const res = await dispatch(createOfflineBooking({ data: { draftId } }));
      if (createOfflineBooking.fulfilled.match(res)) {
        toast.success("Tạo thanh toán thành công!");
        dispatch(getDrafts());
      }
    }
  };

  const handleCompletePayment = async () => {
    if (!offlineBooking) return;

    const result = await Swal.fire({
      title: "Xác nhận hoàn thành thanh toán",
      text: "Bạn có chắc chắn muốn hoàn thành thanh toán này không?",
      icon: "question",
      showCancelButton: true,
      confirmButtonText: "Chắc chắn",
      cancelButtonText: "Hủy",
    });

    if (result.isConfirmed) {
      const data: UpdateOfflineBookingRequest = {
        offlineBookingId: offlineBooking.id,
        paymentMethod,
        total: offlineBooking.total,
      };
      const res = await dispatch(updateOfflineBooking({ data })).unwrap();
      toast.success(res.message);
      dispatch(clearOfflineBooking());
    }
  };

  // ------------------- RENDER -------------------
  return (
    <div className="w-full flex flex-col p-4 bg-gray-100 gap-4">
      {/* 3 Cột chính */}
      <div className="flex gap-4 h-[600px] overflow-hidden">
        {/* Cột 1: Danh sách đồ uống / sản phẩm */}
        <div className="flex-1 bg-white rounded-xl shadow p-4 flex flex-col overflow-hidden">
          <div className="flex items-center gap-2 text-2xl font-bold mb-4 text-sky-700 tracking-wide">
            <Package2 className="w-7 h-7" />
            Danh sách đồ uống / sản phẩm
          </div>

          {/* Tabs */}
          <div className="flex gap-3 border-b border-gray-400 pb-2 mb-3">
            {["beverage", "product"].map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab as any)}
                className={`px-4 py-2 text-sm font-medium rounded-lg transition ${
                  activeTab === tab
                    ? "bg-blue-700 text-white shadow"
                    : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                }`}
              >
                {tab === "beverage" ? "Nước uống" : "Sản phẩm"}
              </button>
            ))}
          </div>

          {/* Search */}
          <div className="relative mb-3">
            <input
              type="text"
              placeholder={`Tìm ${
                activeTab === "beverage" ? "nước uống" : "sản phẩm"
              }...`}
              className="w-full border border-gray-300 rounded-lg pl-10 pr-3 py-2 text-sm focus:outline-none"
              value={activeTab === "beverage" ? searchBeverage : searchProduct}
              onChange={(e) =>
                activeTab === "beverage"
                  ? setSearchBeverage(e.target.value)
                  : setSearchProduct(e.target.value)
              }
            />
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
          </div>

          {/* Scroll list */}
          <div className="flex-1 overflow-y-auto flex flex-col gap-3">
            {(activeTab === "beverage" ? beverageLoading : productLoading) ||
            loadingInitial ? (
              Array.from({ length: 5 }).map((_, idx) => (
                <div
                  key={idx}
                  className="h-10 bg-gray-200 animate-pulse rounded"
                />
              ))
            ) : (
              <ItemList
                key={activeTab} // ⭐ FIX LẪN DATA
                items={activeTab === "beverage" ? beverages : products}
                activeTab={activeTab}
                onAdd={handleAdd}
                onRemove={handleRemove}
              />
            )}
          </div>
        </div>

        {/* Cột 2: Đơn tạm / Thông tin */}
        <div className="flex-1 bg-white rounded-xl shadow p-4 flex flex-col overflow-hidden">
          <div className="flex items-center gap-2 text-2xl font-bold mb-4 text-sky-700 tracking-wide">
            <FileClock className="w-7 h-7" />
            Đơn tạm thời
          </div>
          <div className="flex-1 overflow-y-auto">
            <DraftBox
              selectedCourtSlots={selectedCourtSlots}
              selectedProducts={selectedProducts}
              selectedBeverages={selectedBeverages}
              checkOut={handleCheckoutDraft}
              setSelectedCourtSlots={setSelectedCourtSlots}
              setSelectedBeverages={setSelectedBeverages}
              setSelectedProducts={setSelectedProducts}
            />
          </div>
        </div>

        {/* Cột 3: Hoàn tất thanh toán */}
        <div className="flex-1 bg-white rounded-xl shadow p-6 flex flex-col overflow-hidden">
          <div className="flex items-center gap-2 text-2xl font-bold mb-4 text-sky-700 tracking-wide">
            <CheckCircle className="w-7 h-7" />
            Hoàn tất thanh toán
          </div>
          <div className="flex-1 overflow-y-auto flex flex-col gap-4">
            {/* Thông tin đơn hàng */}
            <div className="bg-gray-50 p-4 rounded-xl shadow-inner space-y-2">
              <div className="text-gray-600 text-sm">Mã đơn</div>
              <div className="text-lg font-semibold text-gray-900">
                {offlineBooking?.id
                  ? `#ORD-${offlineBooking.id.toString().padStart(5, "0")}`
                  : "—"}
              </div>
              <div className="text-gray-600 text-sm mt-2">Khách hàng</div>
              <div className="text-gray-800 font-medium">
                {offlineBooking?.nameCustomer || "—"}
              </div>
              <div className="text-gray-600 text-sm mt-2">Tổng tiền</div>
              <div className="text-green-700 font-bold text-lg">
                {offlineBooking?.total?.toLocaleString() || "0"} đ
              </div>
            </div>

            {/* Phương thức thanh toán */}
            <div>
              <div className="flex items-center gap-2 mb-3 text-[#0288D1] font-semibold text-lg">
                <Wallet className="w-5 h-5 text-[#0288D1]" />
                <span>Chọn phương thức thanh toán</span>
              </div>
              <div className="flex flex-col sm:flex-row gap-4">
                {[
                  {
                    id: "Cash",
                    title: "Thanh toán bằng tiền mặt",
                    subtitle: "trực tiếp tại quầy",
                    icon: <DollarSign className="w-8 h-8 text-[#0288D1]" />,
                  },
                  {
                    id: "Momo",
                    title: "Thanh toán qua Momo",
                    subtitle: "quét mã tại quầy",
                    icon: <Smartphone className="w-8 h-8 text-[#0288D1]" />,
                  },
                ].map((method) => (
                  <label
                    key={method.id}
                    className={`relative flex items-center gap-4 cursor-pointer border rounded-xl p-4 transition
                      ${
                        paymentMethod === method.id
                          ? "bg-[#E3F2FD] border-[#0288D1] shadow-md"
                          : "hover:bg-[#E3F2FD] border-gray-300"
                      }`}
                  >
                    <input
                      type="radio"
                      checked={paymentMethod === method.id}
                      onChange={() => setPaymentMethod(method.id as any)}
                      className="absolute opacity-0 w-0 h-0"
                    />
                    {method.icon}
                    <div className="flex flex-col">
                      <span className="font-semibold text-gray-800 text-base">
                        {method.title}
                      </span>
                      <span className="text-sm text-gray-500">
                        {method.subtitle}
                      </span>
                    </div>
                    {paymentMethod === method.id && (
                      <div className="ml-auto text-white bg-[#0288D1] w-6 h-6 rounded-full flex items-center justify-center">
                        <Check className="w-4 h-4" />
                      </div>
                    )}
                  </label>
                ))}
              </div>
            </div>

            {/* Nút hoàn thành */}
            <div className="mt-6 flex justify-end">
              <button
                onClick={handleCompletePayment}
                disabled={!offlineBooking}
                className="px-6 py-2 bg-green-600 text-white font-semibold rounded-xl hover:bg-green-700 transition text-lg"
              >
                Hoàn thành
              </button>
            </div>
          </div>
        </div>
      </div>
      {/* COURT GRID */}
      <div className="bg-white rounded-xl shadow p-4 flex flex-col relative">
        <div className="flex justify-between items-center mb-4">
          <h2 className="flex items-center gap-2 text-2xl font-bold mb-4 text-sky-700 tracking-wide">
            <CalendarClock className="w-7 h-7" />
            Chọn sân & khung giờ
          </h2>
          <div className="flex items-center gap-2 bg-white border border-gray-300 rounded-lg px-3 py-2">
            <label htmlFor="date" className="text-gray-600 text-sm font-medium">
              Chọn ngày:
            </label>
            <input
              id="date"
              type="date"
              className="border-none focus:ring-0 focus:outline-none text-sm"
              value={date}
              onChange={(e) => setDate(e.target.value)}
            />
          </div>
        </div>

        <div className="overflow-x-auto">
          <div className="inline-block min-w-max">
            <div
              className="grid gap-1"
              style={{
                gridTemplateColumns: `150px repeat(${timeHeaders.length}, 80px)`,
              }}
            >
              <div className="font-bold text-gray-700 h-10 flex items-center justify-center sticky left-0 bg-white z-10">
                Sân / Giờ
              </div>
              {timeHeaders.map((t) => (
                <div
                  key={t}
                  className="text-center font-semibold text-gray-600 h-10 flex items-center justify-center"
                >
                  {t}
                </div>
              ))}

              {courtNames.map((courtName) => (
                <div key={courtName} className="contents">
                  <div className="flex items-center font-semibold text-gray-700 pr-2 h-10 sticky left-0 bg-white z-10 border-r">
                    {courtName}
                  </div>
                  {timeHeaders.map((hour) => {
                    const slot = courtSchedules.find(
                      (s) =>
                        s.court.name === courtName &&
                        s.startTime.startsWith(hour)
                    );

                    if (!slot)
                      return (
                        <div
                          key={hour}
                          className="h-10 rounded bg-gray-300 cursor-not-allowed"
                          title="Không khả dụng"
                        />
                      );

                    const isSelected = selectedCourtSlots.some(
                      (s) => s.id === slot.id
                    );
                    const isDisabled = !slot.isAvailable;

                    return (
                      <div
                        key={hour}
                        onClick={() => {
                          if (isDisabled) return;
                          if (isSelected) {
                            setSelectedCourtSlots((prev) =>
                              prev.filter((s) => s.id !== slot.id)
                            );
                          } else if (selectedCourtSlots.length < 3) {
                            setSelectedCourtSlots((prev) => [...prev, slot]);
                          }
                        }}
                        title={isDisabled ? "Không khả dụng" : ""}
                        className={`h-10 rounded flex items-center justify-center cursor-pointer text-white font-medium transition
                    ${
                      isDisabled
                        ? "bg-gray-300 cursor-not-allowed"
                        : isSelected
                        ? "bg-green-600 hover:bg-green-700"
                        : "bg-blue-200 hover:bg-green-400"
                    }`}
                      ></div>
                    );
                  })}
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Legend */}
        <div className="mt-10 text-sm flex gap-4">
          <span className="font-bold">Ghi chú:</span>
          <div className="flex items-center gap-1">
            <div className="w-4 h-4 bg-orange-100 rounded"></div> Có thể chọn
          </div>
          <div className="flex items-center gap-1">
            <div className="w-4 h-4 bg-green-500 rounded"></div> Đã chọn
          </div>
          <div className="flex items-center gap-1">
            <div className="w-4 h-4 bg-gray-300 rounded"></div> Không khả dụng
          </div>
        </div>

        {loadingInitial && (
          <div className="absolute inset-0 bg-white/50 flex flex-col justify-center items-center">
            <Loader2 className="w-12 h-12 animate-spin text-blue-500 mb-3" />
            <p className="text-lg font-medium text-blue-600">
              Đang tải dữ liệu...
            </p>
          </div>
        )}
      </div>
      ;
    </div>
  );
};

export default EmployeePage;
