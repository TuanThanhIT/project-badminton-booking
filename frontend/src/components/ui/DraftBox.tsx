import { useEffect, useState } from "react";
import { useAppDispatch, useAppSelector } from "../../store/hook";
import { toast } from "react-toastify";
import {
  clearDraftError,
  createAndUpdateDraft,
  createDraft,
  getDraft,
  getDrafts,
} from "../../store/slices/employee/draftSlice";
import type {
  AddDraftBookingRequest,
  DraftBookingRequest,
  UpdateDraftBookingRequest,
} from "../../types/draft";
import type { CourtScheduleEplResponse } from "../../types/court";
import type { ProductEplResponse } from "../../types/product";
import type { BeverageEplResponse } from "../../types/beverage";
import { getCourtSchedules } from "../../store/slices/employee/courtSlice";
import { clearOfflineError } from "../../store/slices/employee/offlineSlice";

interface DraftBoxProps {
  selectedCourtSlots: CourtScheduleEplResponse;
  selectedProducts: ProductEplResponse;
  selectedBeverages: BeverageEplResponse;
  checkOut: (draftId: number) => void;
}

const DraftBoxDemo = ({
  selectedCourtSlots,
  selectedProducts,
  selectedBeverages,
  checkOut,
}: DraftBoxProps) => {
  const dispatch = useAppDispatch();
  const draftBookings = useAppSelector((state) => state.draftEpl.draftBookings);
  const draftError = useAppSelector((state) => state.draftEpl.error);
  const offlineError = useAppSelector((state) => state.offlineEpl.error);

  const [customerName, setCustomerName] = useState("");
  const [openDraftId, setOpenDraftId] = useState<number | null>(null);
  const [currentDraft, setCurrentDraft] = useState<any | null>(null);
  const [productQuantities, setProductQuantities] = useState<
    Record<number, number>
  >({});
  const [beverageQuantities, setBeverageQuantities] = useState<
    Record<number, number>
  >({});
  const [note, setNote] = useState("");

  // Fetch drafts
  useEffect(() => {
    dispatch(getDrafts());
  }, [dispatch]);

  // Fetch draft detail when open
  useEffect(() => {
    if (openDraftId !== null) {
      const data: DraftBookingRequest = { draftId: openDraftId };
      dispatch(getDraft({ data }))
        .unwrap()
        .then((res) => {
          setCurrentDraft(res);

          // Sync quantities
          const prodQty: Record<number, number> = {};
          res.products?.forEach((p: any) => {
            prodQty[p.productVarientId] = p.quantity;
          });
          setProductQuantities(prodQty);

          const bevQty: Record<number, number> = {};
          res.beverages?.forEach((b: any) => {
            bevQty[b.beverageId] = b.quantity;
          });
          setBeverageQuantities(bevQty);

          setNote(res.note || "");
        });
    } else {
      setCurrentDraft(null);
    }
  }, [dispatch, openDraftId]);

  // Handle error
  useEffect(() => {
    const error = offlineError || draftError;
    if (error) {
      toast.error(error);
      if (offlineError) {
        dispatch(clearOfflineError());
      }
      if (draftError) {
        dispatch(clearDraftError());
      }
    }
  }, [offlineError, draftError, dispatch]);

  // Create draft
  const handleCreateDraft = async () => {
    if (!customerName.trim()) return toast.error("Nhập tên khách hàng!");
    const data: AddDraftBookingRequest = { nameCustomer: customerName };
    try {
      const res = await dispatch(createDraft({ data })).unwrap();
      toast.success(res.message);

      setCustomerName("");
      setOpenDraftId(null);
      setCurrentDraft(null);
      setProductQuantities({});
      setBeverageQuantities({});
      setNote("");

      dispatch(getDrafts());
    } catch {
      // no-op
    }
  };

  // Toggle draft content
  const toggleDraft = (draftId: number) => {
    setOpenDraftId(openDraftId === draftId ? null : draftId);
  };

  // Determine what to show
  const courtSlotsToShow = currentDraft?.courtSchedules?.length
    ? currentDraft.courtSchedules
    : selectedCourtSlots;

  const productsToShow = currentDraft?.products?.length
    ? currentDraft.products
    : selectedProducts;

  const beveragesToShow = currentDraft?.beverages?.length
    ? currentDraft.beverages
    : selectedBeverages;

  // Totals
  const totalCourtPrice = courtSlotsToShow.reduce(
    (sum: any, x: any) => sum + x.price,
    0
  );
  const totalProductPrice = productsToShow.reduce(
    (sum: any, p: any) =>
      sum + p.price * (productQuantities[p.productVarientId || p.id] || 1),
    0
  );
  const totalBeveragePrice = beveragesToShow.reduce(
    (sum: any, b: any) =>
      sum + b.price * (beverageQuantities[b.beverageId || b.id] || 1),
    0
  );
  const totalAll = totalCourtPrice + totalProductPrice + totalBeveragePrice;

  // Prepare payload for save
  const preparePayload = () => {
    const productsForApi = productsToShow.map((p: any) => ({
      id: p.productVarientId || p.id,
      quantity: productQuantities[p.productVarientId || p.id] || 1,
      subTotal: p.price * (productQuantities[p.productVarientId || p.id] || 1),
    }));

    const beveragesForApi = beveragesToShow.map((b: any) => ({
      id: b.beverageId || b.id,
      quantity: beverageQuantities[b.beverageId || b.id] || 1,
      subTotal: b.price * (beverageQuantities[b.beverageId || b.id] || 1),
    }));

    return { productsForApi, beveragesForApi };
  };

  // Save draft
  const handleSaveDraft = async (draftId: number) => {
    try {
      const payload = preparePayload();
      const courtSchedules = courtSlotsToShow.map((c: any) => ({
        courtScheduleId: c.courtScheduleId || c.id,
        price: c.price,
      }));

      const products = payload.productsForApi.map((p: any) => ({
        productVarientId: p.id,
        quantity: p.quantity,
        subTotal: p.subTotal,
      }));

      const beverages = payload.beveragesForApi.map((b: any) => ({
        beverageId: b.id,
        quantity: b.quantity,
        subTotal: b.subTotal,
      }));

      const data: UpdateDraftBookingRequest = {
        draftId,
        total: totalAll,
        note,
        courtSchedules,
        products,
        beverages,
      };

      const res = await dispatch(createAndUpdateDraft({ data })).unwrap();
      toast.success(res.message);
      const date = "";
      dispatch(getCourtSchedules({ data: { date } }));
    } catch (error) {
      // no-op
    }
  };

  return (
    <div className="flex flex-col gap-4 bg-white p-5 rounded-xl max-w-md">
      {/* Customer input + Create draft */}
      <div className="flex gap-3">
        <input
          type="text"
          placeholder="Nhập tên khách hàng"
          value={customerName}
          onChange={(e) => setCustomerName(e.target.value)}
          className="flex-1 border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-400 focus:outline-none transition"
        />
        <button
          onClick={handleCreateDraft}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 transition"
        >
          Tạo đơn
        </button>
      </div>

      {/* Draft list */}
      <div className="flex flex-col gap-2 max-h-[26rem] overflow-y-auto">
        {draftBookings.length === 0 && (
          <div className="text-gray-400 text-center py-4">Chưa có đơn nào</div>
        )}

        {draftBookings.map((d) => (
          <div
            key={d.id}
            className="border border-gray-200 rounded-lg shadow-sm hover:shadow-md transition"
          >
            {/* Draft header */}
            <div
              onClick={() => toggleDraft(d.id)}
              className="flex justify-between items-center p-3 cursor-pointer bg-gray-100 hover:bg-gray-200 transition"
            >
              <span className="font-medium text-gray-800">
                {d.nameCustomer}
              </span>
              <span className="font-semibold text-gray-700">
                {openDraftId === d.id ? "▲" : "▼"}
              </span>
            </div>

            {/* Draft content */}
            <div
              className={`overflow-hidden transition-all duration-300 w-full ${
                openDraftId === d.id ? "max-h-[60rem]" : "max-h-0"
              }`}
            >
              <div className="flex flex-col gap-6 p-5 bg-gray-50 border-t border-gray-200 rounded-b-xl w-full">
                {/* COURT SLOTS */}
                <div className="bg-white rounded-lg shadow p-4 w-full">
                  <p className="font-semibold text-gray-800 mb-3 text-lg">
                    Sân đã chọn
                  </p>
                  {courtSlotsToShow.length > 0 ? (
                    <div className="flex flex-col gap-3">
                      {courtSlotsToShow.map((slot: any) => (
                        <div
                          key={slot.courtScheduleId || slot.id}
                          className="flex justify-between items-center text-sm text-gray-700"
                        >
                          {/* Tên sân */}
                          <span className="font-medium text-gray-900">
                            {slot.courtName || slot.court?.name}
                          </span>

                          {/* Khung giờ */}
                          <span className="ml-2 px-2 py-0.5 bg-blue-100 text-blue-800 rounded-full text-xs font-semibold">
                            {slot.startTime} - {slot.endTime}
                          </span>

                          {/* Giá */}
                          <span className="font-semibold text-blue-600 ml-2">
                            {slot.price.toLocaleString()} đ
                          </span>
                        </div>
                      ))}
                      <div className="text-right text-blue-900 text-sm font-medium mt-1">
                        Tổng sân: {totalCourtPrice.toLocaleString()} đ
                      </div>
                    </div>
                  ) : (
                    <p className="text-gray-400 text-sm">Không có sân nào</p>
                  )}
                </div>

                {/* PRODUCTS */}
                <div className="bg-white rounded-lg shadow p-4 w-full">
                  <p className="font-semibold text-gray-800 mb-3 text-lg">
                    Sản phẩm đã chọn
                  </p>
                  {productsToShow.length > 0 ? (
                    <div className="flex flex-col gap-3">
                      {productsToShow.map((p: any) => (
                        <div
                          key={p.productVarientId || p.id}
                          className="flex justify-between items-center gap-3 text-sm text-gray-700 w-full"
                        >
                          <div className="flex-1 truncate">
                            <span className="font-medium text-gray-900">
                              {p.productName}
                            </span>
                            {p.size && p.color && (
                              <span className="text-xs text-gray-500">
                                {" "}
                                ({p.size} - {p.color})
                              </span>
                            )}
                          </div>
                          <input
                            type="number"
                            min={1}
                            value={
                              productQuantities[p.productVarientId || p.id] || 1
                            }
                            onChange={(e) =>
                              setProductQuantities({
                                ...productQuantities,
                                [p.productVarientId || p.id]: Math.max(
                                  1,
                                  parseInt(e.target.value)
                                ),
                              })
                            }
                            className="w-20 px-2 py-1 border border-gray-300 rounded text-sm focus:ring-1 focus:ring-blue-400 focus:outline-none"
                          />
                          <span className="font-semibold text-orange-600">
                            {(
                              p.price *
                              (productQuantities[p.productVarientId || p.id] ||
                                1)
                            ).toLocaleString()}{" "}
                            đ
                          </span>
                        </div>
                      ))}
                      <div className="text-right text-orange-900 text-sm font-medium mt-1">
                        Tổng sản phẩm: {totalProductPrice.toLocaleString()} đ
                      </div>
                    </div>
                  ) : (
                    <p className="text-gray-400 text-sm">Không có sản phẩm</p>
                  )}
                </div>

                {/* BEVERAGES */}
                <div className="bg-white rounded-lg shadow p-4 w-full">
                  <p className="font-semibold text-gray-800 mb-3 text-lg">
                    Đồ uống đã chọn
                  </p>
                  {beveragesToShow.length > 0 ? (
                    <div className="flex flex-col gap-3">
                      {beveragesToShow.map((b: any) => (
                        <div
                          key={b.beverageId || b.id}
                          className="flex justify-between items-center gap-3 text-sm text-gray-700 w-full"
                        >
                          <div className="flex-1 truncate font-medium text-gray-900">
                            {b.name}
                          </div>
                          <input
                            type="number"
                            min={1}
                            value={
                              beverageQuantities[b.beverageId || b.id] || 1
                            }
                            onChange={(e) =>
                              setBeverageQuantities({
                                ...beverageQuantities,
                                [b.beverageId || b.id]: Math.max(
                                  1,
                                  parseInt(e.target.value)
                                ),
                              })
                            }
                            className="w-20 px-2 py-1 border border-gray-300 rounded text-sm focus:ring-1 focus:ring-purple-400 focus:outline-none"
                          />
                          <span className="font-semibold text-purple-600">
                            {(
                              b.price *
                              (beverageQuantities[b.beverageId || b.id] || 1)
                            ).toLocaleString()}{" "}
                            đ
                          </span>
                        </div>
                      ))}
                      <div className="text-right text-purple-900 text-sm font-medium mt-1">
                        Tổng nước: {totalBeveragePrice.toLocaleString()} đ
                      </div>
                    </div>
                  ) : (
                    <p className="text-gray-400 text-sm">Không có đồ uống</p>
                  )}
                </div>

                {/* NOTE */}
                <div className="bg-white rounded-lg shadow p-4 w-full">
                  <p className="font-semibold text-gray-800 mb-2 text-lg">
                    Ghi chú
                  </p>
                  <textarea
                    value={note}
                    onChange={(e) => setNote(e.target.value)}
                    placeholder="Nhập ghi chú (nếu cần)..."
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-400 focus:outline-none transition"
                  />
                </div>

                {/* TOTAL & ACTIONS */}
                <div className="flex flex-col sm:flex-row justify-between items-center gap-2 w-full">
                  <div className="text-base font-semibold text-green-700">
                    Tổng cộng: {totalAll.toLocaleString()} đ
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={() => handleSaveDraft(d.id)}
                      className="px-4 py-1.5 bg-green-500 text-white rounded-md hover:bg-green-600 transition text-sm"
                    >
                      Lưu
                    </button>
                    <button
                      onClick={() => checkOut(d.id)}
                      className="px-4 py-1.5 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition text-sm"
                    >
                      Thanh toán
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default DraftBoxDemo;
