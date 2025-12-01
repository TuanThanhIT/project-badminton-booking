import { useEffect, useState, useCallback } from "react";
import { useAppDispatch, useAppSelector } from "../../store/hook";
import { toast } from "react-toastify";
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
import debounce from "lodash.debounce";
import { Loader2, Search } from "lucide-react";
import ItemList from "../../components/ui/ItemList";

const EmployeePage = () => {
  const [date, setDate] = useState("");
  const [activeTab, setActiveTab] = useState<"beverage" | "product">(
    "beverage"
  );
  const [selectedCourtSlots, setSelectedCourtSlots] = useState<number[]>([]);
  const [searchBeverage, setSearchBeverage] = useState("");
  const [searchProduct, setSearchProduct] = useState("");
  const [loadingInitial, setLoadingInitial] = useState(true);

  const dispatch = useAppDispatch();

  const courtSchedules = useAppSelector((s) => s.courtEpl.courtSchedules);
  const courtError = useAppSelector((s) => s.courtEpl.error);

  const beverages = useAppSelector((s) => s.beverageEpl.beverages);
  const beverageError = useAppSelector((s) => s.beverageEpl.error);
  const beverageLoading = useAppSelector((s) => s.beverageEpl.loading);

  const products = useAppSelector((s) => s.productEpl.products);
  const productError = useAppSelector((s) => s.productEpl.error);
  const productLoading = useAppSelector((s) => s.productEpl.loading);

  // ------------------- INITIAL FETCH COURTS + EMPTY LIST -------------------
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

  // ------------------- DEBOUNCE SEARCH FOR ACTIVE TAB -------------------
  const fetchDebounce = useCallback(
    debounce((tab: "beverage" | "product", keyword: string) => {
      if (tab === "beverage") dispatch(getBeverages({ dta: { keyword } }));
      else dispatch(getProducts({ dt: { keyword } }));
    }, 500),
    [dispatch]
  );

  useEffect(() => {
    if (activeTab === "beverage") {
      fetchDebounce("beverage", searchBeverage);
    }
  }, [searchBeverage, fetchDebounce]);

  useEffect(() => {
    if (activeTab === "product") {
      fetchDebounce("product", searchProduct);
    }
  }, [searchProduct, fetchDebounce]);

  // ------------------- HANDLE ERRORS -------------------
  useEffect(() => {
    const error = courtError || beverageError || productError;
    if (error) {
      toast.error(error);
      if (courtError) dispatch(clearCourtError());
      if (beverageError) dispatch(clearBeverageError());
      if (productError) dispatch(clearProductError());
    }
  }, [courtError, beverageError, productError, dispatch]);

  // ------------------- GRID DATA -------------------
  const timeHeaders = Array.from(
    new Set(courtSchedules.map((s) => s.startTime.slice(0, 5)))
  );
  const courtNames = Array.from(
    new Set(courtSchedules.map((s) => s.court.name))
  );

  // ------------------- RENDER -------------------
  return (
    <div className="w-full flex flex-col p-4 bg-gray-100 gap-4">
      <div className="flex-[0.5] flex gap-4">
        {/* Ô đồ uống / sản phẩm */}
        <div className="flex-1 bg-white rounded-xl shadow p-4 flex flex-col overflow-hidden">
          <div className="text-lg font-bold mb-3 text-blue-900 tracking-wide">
            Danh sách đồ uống / sản phẩm
          </div>

          {/* Tabs */}
          <div className="flex gap-3 border-b pb-2 mb-3">
            <button
              onClick={() => setActiveTab("beverage")}
              className={`px-4 py-2 text-sm font-medium rounded-lg transition ${
                activeTab === "beverage"
                  ? "bg-blue-600 text-white shadow"
                  : "bg-gray-100 text-gray-700 hover:bg-gray-200"
              }`}
            >
              Nước uống
            </button>
            <button
              onClick={() => setActiveTab("product")}
              className={`px-4 py-2 text-sm font-medium rounded-lg transition ${
                activeTab === "product"
                  ? "bg-blue-600 text-white shadow"
                  : "bg-gray-100 text-gray-700 hover:bg-gray-200"
              }`}
            >
              Sản phẩm
            </button>
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

          {/* Scroll list với chiều cao cố định */}
          <div
            className="overflow-y-auto flex flex-col gap-3"
            style={{ minHeight: "220px", maxHeight: "220px" }}
          >
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
                items={activeTab === "beverage" ? beverages : products}
                activeTab={activeTab}
                onAdd={(item) => console.log("Thêm:", item)}
              />
            )}
          </div>
        </div>

        {/* Draft */}
        <div className="flex-1 bg-white rounded-xl shadow p-4 overflow-y-auto">
          <div className="text-lg font-semibold mb-3">
            Draft Box / Thông tin
          </div>
          <div className="text-gray-500">Nội dung draft...</div>
        </div>

        {/* Thanh toán */}
        <div className="flex-1 bg-white rounded-xl shadow p-4">
          <div className="text-lg font-semibold mb-3">Thanh toán</div>
          <div className="text-gray-500">Chưa có giao dịch</div>
        </div>
      </div>

      {/* COURT GRID */}
      <div className="bg-white rounded-xl shadow p-4 flex flex-col relative">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-2xl font-bold text-blue-900 tracking-wide">
            Danh sách sân cầu lông
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
                    const selected = slot
                      ? selectedCourtSlots.includes(slot.id)
                      : false;
                    const isAvailable = !!slot;
                    return (
                      <div
                        key={hour}
                        onClick={() => {
                          if (!isAvailable) return;
                          if (selected)
                            setSelectedCourtSlots((prev) =>
                              prev.filter((x) => x !== slot!.id)
                            );
                          else if (selectedCourtSlots.length < 3)
                            setSelectedCourtSlots((prev) => [
                              ...prev,
                              slot!.id,
                            ]);
                        }}
                        className={`h-10 rounded flex items-center justify-center cursor-pointer text-white font-medium transition
                          ${
                            !isAvailable
                              ? "bg-gray-300 cursor-not-allowed"
                              : selected
                              ? "bg-green-500 hover:bg-green-600"
                              : "bg-orange-100 hover:bg-green-300"
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
            <div className="w-4 h-4 bg-red-100 rounded"></div> Có thể chọn
          </div>
          <div className="flex items-center gap-1">
            <div className="w-4 h-4 bg-green-500 rounded"></div> Đã chọn
          </div>
          <div className="flex items-center gap-1">
            <div className="w-4 h-4 bg-gray-300 rounded"></div> Không khả dụng
          </div>
        </div>

        {/* Optional initial loader */}
        {loadingInitial && (
          <div className="absolute inset-0 bg-white/50 flex flex-col justify-center items-center">
            <Loader2 className="w-12 h-12 animate-spin text-blue-500 mb-3" />
            <p className="text-lg font-medium text-blue-600">
              Đang tải dữ liệu...
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default EmployeePage;
