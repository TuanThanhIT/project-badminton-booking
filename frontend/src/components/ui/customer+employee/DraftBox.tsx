import { useEffect, useState } from "react";
import { useAppDispatch, useAppSelector } from "../../../store/hook";
import { toast } from "react-toastify";
import {
  clearDraftError,
  createAndUpdateDraft,
  createDraft,
  deleteDraft,
  deleteDraftLocal,
  getDraft,
  getDrafts,
  resetDraftLocal,
} from "../../../store/slices/employee/draftSlice";
import type {
  AddDraftBookingRequest,
  DeleteDraftRequest,
  DraftBookingListResponse,
  DraftBookingRequest,
  UpdateDraftBookingRequest,
} from "../../../types/draft";
import type { CourtScheduleEplResponse } from "../../../types/court";
import type { ProductEplResponse } from "../../../types/product";
import type { BeverageEplResponse } from "../../../types/beverage";
import { getCourtSchedules } from "../../../store/slices/employee/courtSlice";
import { clearOfflineError } from "../../../store/slices/employee/offlineSlice";
import { FileClock, Trash2 } from "lucide-react";

interface DraftBoxProps {
  selectedCourtSlots: CourtScheduleEplResponse;
  selectedProducts: ProductEplResponse;
  selectedBeverages: BeverageEplResponse;
  checkOut: (draftId: number) => void;
  setSelectedCourtSlots: React.Dispatch<
    React.SetStateAction<CourtScheduleEplResponse>
  >;
  setSelectedBeverages: React.Dispatch<
    React.SetStateAction<BeverageEplResponse>
  >;
  setSelectedProducts: React.Dispatch<React.SetStateAction<ProductEplResponse>>;
}

/* ================= LOCAL DRAFT STATE ================= */
type DraftLocalState = {
  productQuantities: Record<number, number>;
  beverageQuantities: Record<number, number>;
  note: string;
};

const DraftBox = ({
  selectedCourtSlots,
  selectedProducts,
  selectedBeverages,
  checkOut,
  setSelectedBeverages,
  setSelectedProducts,
  setSelectedCourtSlots,
}: DraftBoxProps) => {
  const dispatch = useAppDispatch();
  const draftBookings = useAppSelector((s) => s.draftEpl.draftBookings);
  const draftError = useAppSelector((s) => s.draftEpl.error);
  const offlineError = useAppSelector((s) => s.offlineEpl.error);

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

  const [savedDrafts, setSavedDrafts] = useState<Record<number, boolean>>({});

  // cache state theo từng draft
  const [draftLocalState, setDraftLocalState] = useState<
    Record<number, DraftLocalState>
  >({});

  /* ================= FETCH DRAFT LIST ================= */
  useEffect(() => {
    dispatch(getDrafts());
  }, [dispatch]);

  /* ================= RESET ================= */
  const reset = () => {
    setCustomerName("");
    setOpenDraftId(null);
    setCurrentDraft(null);
    setProductQuantities({});
    setBeverageQuantities({});
    setNote("");
    setSelectedBeverages([]);
    setSelectedProducts([]);
    setSelectedCourtSlots([]);
  };

  /* ================= FETCH DRAFT DETAIL ================= */
  useEffect(() => {
    if (openDraftId === null) {
      setCurrentDraft(null);
      return;
    }

    const fetchDraft = async () => {
      try {
        const data: DraftBookingRequest = { draftId: openDraftId };
        const res = await dispatch(getDraft({ data })).unwrap();
        setCurrentDraft(res);

        const prodQty: Record<number, number> = {};
        res.products?.forEach(
          (p: any) => (prodQty[p.productVarientId] = p.quantity)
        );

        const bevQty: Record<number, number> = {};
        res.beverages?.forEach((b: any) => (bevQty[b.beverageId] = b.quantity));

        const cached = draftLocalState[openDraftId];

        if (cached) {
          setProductQuantities(cached.productQuantities);
          setBeverageQuantities(cached.beverageQuantities);
          setNote(cached.note);
        } else {
          setProductQuantities(prodQty);
          setBeverageQuantities(bevQty);
          setNote(res.note || "");

          setDraftLocalState((prev) => ({
            ...prev,
            [openDraftId]: {
              productQuantities: prodQty,
              beverageQuantities: bevQty,
              note: res.note || "",
            },
          }));
        }
      } catch {
        // ignore
      }
    };

    fetchDraft();
  }, [dispatch, openDraftId, draftLocalState]);

  /* ================= HANDLE ERRORS ================= */
  useEffect(() => {
    const error = draftError || offlineError;
    if (error) {
      toast.error(error);
      if (draftError) dispatch(clearDraftError());
      if (offlineError) dispatch(clearOfflineError());
    }
  }, [draftError, offlineError, dispatch]);

  /* ================= CREATE DRAFT ================= */
  const handleCreateDraft = async () => {
    if (!customerName.trim()) return toast.error("Nhập tên khách hàng!");
    const data: AddDraftBookingRequest = { nameCustomer: customerName };
    try {
      const res = await dispatch(createDraft({ data })).unwrap();
      toast.success(res.message);
      reset();
      dispatch(getDrafts());
    } catch {
      // no-op
    }
  };

  /* ================= TOGGLE DRAFT ================= */
  const toggleDraft = (draftId: number) => {
    // lưu state draft hiện tại
    if (openDraftId !== null) {
      setDraftLocalState((prev) => ({
        ...prev,
        [openDraftId]: {
          productQuantities,
          beverageQuantities,
          note,
        },
      }));
    }

    setOpenDraftId(openDraftId === draftId ? null : draftId);
  };

  /* ================= DETERMINE ITEMS ================= */
  const courtSlotsToShow = currentDraft?.courtSchedules?.length
    ? currentDraft.courtSchedules
    : selectedCourtSlots;

  const productsToShow = currentDraft?.products?.length
    ? currentDraft.products
    : selectedProducts;

  const beveragesToShow = currentDraft?.beverages?.length
    ? currentDraft.beverages
    : selectedBeverages;

  /* ================= TOTALS ================= */
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

  /* ================= PREPARE PAYLOAD ================= */
  const preparePayload = () => ({
    productsForApi: productsToShow.map((p: any) => ({
      id: p.productVarientId || p.id,
      quantity: productQuantities[p.productVarientId || p.id] || 1,
      subTotal: p.price * (productQuantities[p.productVarientId || p.id] || 1),
    })),
    beveragesForApi: beveragesToShow.map((b: any) => ({
      id: b.beverageId || b.id,
      quantity: beverageQuantities[b.beverageId || b.id] || 1,
      subTotal: b.price * (beverageQuantities[b.beverageId || b.id] || 1),
    })),
  });

  /* ================= SAVE DRAFT ================= */
  const handleSaveDraft = async (draftId: number) => {
    try {
      const payload = preparePayload();
      const data: UpdateDraftBookingRequest = {
        draftId,
        total: totalAll,
        note,
        courtSchedules: courtSlotsToShow.map((c: any) => ({
          courtScheduleId: c.courtScheduleId || c.id,
          price: c.price,
        })),
        products: payload.productsForApi.map((p: any) => ({
          productVarientId: p.id,
          quantity: p.quantity,
          subTotal: p.subTotal,
        })),
        beverages: payload.beveragesForApi.map((b: any) => ({
          beverageId: b.id,
          quantity: b.quantity,
          subTotal: b.subTotal,
        })),
      };

      const res = await dispatch(createAndUpdateDraft({ data })).unwrap();
      toast.success(res.message);
      dispatch(getCourtSchedules({ data: { date: "" } }));

      setSavedDrafts((prev) => ({ ...prev, [draftId]: true }));

      // update cache
      setDraftLocalState((prev) => ({
        ...prev,
        [draftId]: {
          productQuantities,
          beverageQuantities,
          note,
        },
      }));
    } catch {
      // no-op
    }
  };

  const handleDeleteDraft = async (draftId: number) => {
    const prevDraftBookings: DraftBookingListResponse = [...draftBookings];
    try {
      const data: DeleteDraftRequest = { draftId };
      dispatch(deleteDraftLocal({ data }));
      const res = await dispatch(deleteDraft({ data })).unwrap();
      toast.success(res.message);
    } catch (error) {
      dispatch(resetDraftLocal({ prevDraftBookings }));
    }
  };

  // ------------------- RENDER -------------------
  return (
    <div className="flex flex-col gap-4 bg-white p-5 rounded-xl flex-1">
      {/* Customer input */}
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
          className="px-4 py-2 bg-blue-700 text-white rounded-lg font-semibold hover:bg-blue-800 transition"
        >
          Tạo đơn
        </button>
      </div>

      {/* Draft list */}
      <div className="flex flex-col gap-2 max-h-[26rem] overflow-y-auto">
        {draftBookings.length === 0 && (
          <div className="flex flex-col items-center justify-center py-10 text-gray-500">
            <div className="w-14 h-14 mb-3 rounded-full bg-blue-50 flex items-center justify-center">
              <FileClock className="w-7 h-7 text-blue-500" />
            </div>
            <p className="text-base font-medium">Chưa có đơn tạm nào</p>
            <p className="text-sm text-gray-400 mt-1">
              Nhập tên khách hàng để tạo đơn mới
            </p>
          </div>
        )}

        {draftBookings.map((d) => (
          <div
            key={d.id}
            className="border border-gray-200 rounded-lg shadow-sm hover:shadow-md transition"
          >
            {/* Header */}
            <div
              onClick={() => toggleDraft(d.id)}
              className="flex justify-between items-center p-3 cursor-pointer bg-gray-100 hover:bg-gray-200 transition"
            >
              <span className="font-medium text-gray-800">
                {d.nameCustomer}
              </span>

              <div className="flex items-center gap-3">
                {/* Nút xóa */}
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    handleDeleteDraft(d.id);
                  }}
                  className="p-1 rounded-full hover:bg-red-100 text-red-500 hover:text-red-600 transition"
                  title="Xóa draft"
                >
                  <Trash2 size={16} />
                </button>

                {/* Mũi tên */}
                <span className="font-semibold text-gray-700">
                  {openDraftId === d.id ? "▲" : "▼"}
                </span>
              </div>
            </div>

            {/* Content */}
            <div
              className={`overflow-hidden transition-all duration-300 ${
                openDraftId === d.id ? "max-h-[60rem]" : "max-h-0"
              }`}
            >
              <div className="flex flex-col gap-6 p-5 bg-gray-50 border-t border-gray-200 rounded-b-xl">
                {/* Court Slots */}
                <div className="bg-white rounded-lg shadow p-4">
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
                          <span className="font-medium text-gray-900">
                            {slot.courtName || slot.court?.name}
                          </span>
                          <span className="ml-2 px-2 py-0.5 bg-blue-100 text-blue-800 rounded-full text-xs font-semibold">
                            {slot.startTime} - {slot.endTime}
                          </span>
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

                {/* Products */}
                <div className="bg-white rounded-lg shadow p-4">
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

                {/* Beverages */}
                <div className="bg-white rounded-lg shadow p-4">
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

                {/* Note */}
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

                {/* Total & Actions */}
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
                      disabled={!savedDrafts[d.id]}
                      className={`px-4 py-1.5 rounded-md text-sm transition ${
                        savedDrafts[d.id]
                          ? "bg-blue-600 text-white hover:bg-blue-700"
                          : "bg-gray-300 text-gray-500 cursor-not-allowed"
                      }`}
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

export default DraftBox;
