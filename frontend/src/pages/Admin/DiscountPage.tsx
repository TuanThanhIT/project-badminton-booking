// src/pages/admin/DiscountPage.tsx
import React, { useEffect, useState } from "react";
import { Loader2, Plus } from "lucide-react";
import { useAppDispatch, useAppSelector } from "../../store/hook";
import { toast } from "react-toastify";
import {
  clearDiscountError,
  deleteDiscountLocal,
  getDiscountBookings,
  getDiscounts,
  updateDiscountActiveLocal,
} from "../../store/slices/admin/discountSlice";
import type { AdminDiscountRequest } from "../../types/discount";
import DiscountTable from "../../components/ui/admin/DiscountTable";
import AddDiscountForm from "../../components/ui/admin/AddDiscountForm";
import Pagination from "../../components/ui/admin/Pagination";

const DiscountPage: React.FC = () => {
  const dispatch = useAppDispatch();
  const {
    discounts,
    discountBookings,
    error,
    loadingDiscount,
    loadingDiscountBooking,
    loadingAdd,
  } = useAppSelector((state) => state.discountAdmin);

  const [openAdd, setOpenAdd] = useState(false);

  const [pageDiscount, setPageDiscount] = useState(1);
  const [pageBooking, setPageBooking] = useState(1);
  const limit = 10;

  // Order
  const [usedOrder, setUsedOrder] = useState("all");
  const [typeOrder, setTypeOrder] = useState("all");

  // Booking
  const [usedBooking, setUsedBooking] = useState("all");
  const [typeBooking, setTypeBooking] = useState("all");

  // --- Error ---
  useEffect(() => {
    if (error) {
      toast.error(error);
      dispatch(clearDiscountError());
    }
  }, [error, dispatch]);

  useEffect(() => {
    const data: AdminDiscountRequest = {
      page: pageDiscount,
      limit,
      isUsed: usedOrder === "all" ? undefined : usedOrder === "true",
      type: typeOrder === "all" ? undefined : typeOrder,
    };
    dispatch(getDiscounts({ data }));
  }, [dispatch, pageDiscount, usedOrder, typeOrder]);

  useEffect(() => {
    const data: AdminDiscountRequest = {
      page: pageBooking,
      limit,
      isUsed: usedBooking === "all" ? undefined : usedBooking === "true",
      type: typeBooking === "all" ? undefined : typeBooking,
    };
    dispatch(getDiscountBookings({ data }));
  }, [dispatch, pageBooking, usedBooking, typeBooking]);

  return (
    <div className="p-6 space-y-10 bg-gray-50 min-h-screen">
      {/* ================== ORDER DISCOUNT ================== */}
      <section className="bg-white rounded-2xl border border-gray-200 p-10 space-y-6">
        {/* Header */}
        <div className="flex flex-col xl:flex-row xl:items-center xl:justify-between gap-6">
          <h1 className="inline-flex items-center gap-2 text-2xl font-bold text-sky-700 mb-8 relative">
            Khuyến mãi đơn hàng
            <span className="absolute left-0 -bottom-3 w-1/2 h-1 bg-sky-400 rounded-sm"></span>
          </h1>

          <div className="flex flex-wrap items-end gap-4">
            {/* Used */}
            <div className="flex flex-col">
              <label className="text-sm text-gray-600 mb-1">
                Trạng thái sử dụng
              </label>
              <select
                className="px-3 py-2 border rounded-lg focus:ring-1 focus:ring-sky-400"
                value={usedOrder}
                onChange={(e) => setUsedOrder(e.target.value)}
              >
                <option value="all">Tất cả</option>
                <option value="true">Đã sử dụng</option>
                <option value="false">Chưa sử dụng</option>
              </select>
            </div>

            {/* Type */}
            <div className="flex flex-col">
              <label className="text-sm text-gray-600 mb-1">
                Loại giảm giá
              </label>
              <select
                className="px-3 py-2 border rounded-lg focus:ring-1 focus:ring-sky-400"
                value={typeOrder}
                onChange={(e) => setTypeOrder(e.target.value)}
              >
                <option value="all">Tất cả</option>
                <option value="PERCENT">Phần trăm</option>
                <option value="AMOUNT">Tiền mặt</option>
              </select>
            </div>

            <button
              onClick={() => setOpenAdd(true)}
              className="flex items-center px-5 py-2 bg-sky-600 text-white rounded-lg hover:bg-sky-700 transition"
            >
              <Plus className="w-4 h-4 mr-2" />
              Thêm khuyến mãi
            </button>
          </div>
        </div>
        {/* Table */}
        {loadingDiscount ? (
          <div className="flex justify-center py-10 text-sky-600">
            <Loader2 className="w-8 h-8 animate-spin" />
          </div>
        ) : (
          <DiscountTable
            discounts={discounts?.discounts || []}
            page={pageDiscount}
            limit={limit}
            onToggleLock={(id) =>
              dispatch(updateDiscountActiveLocal({ discountId: id }))
            }
            onDeleteDiscount={(id) =>
              dispatch(deleteDiscountLocal({ discountId: id }))
            }
          />
        )}
        {/* --- Pagination Backend --- */}{" "}
        <Pagination
          page={pageDiscount}
          total={discounts?.total || 0}
          onPrev={() => setPageDiscount((prev) => Math.max(prev - 1, 1))}
          onNext={() =>
            setPageDiscount((prev) =>
              prev * limit < (discounts?.total || 0) ? prev + 1 : prev
            )
          }
        />
      </section>

      <section className="bg-white rounded-2xl border border-gray-200 p-10 space-y-6">
        {/* Header */}
        <div className="flex flex-col xl:flex-row xl:items-center xl:justify-between gap-6">
          <h1 className="inline-flex items-center gap-2 text-2xl font-bold text-sky-700 mb-8 relative">
            Khuyến mãi đặt sân
            <span className="absolute left-0 -bottom-3 w-1/2 h-1 bg-sky-400 rounded-sm"></span>
          </h1>

          <div className="flex flex-wrap items-end gap-4">
            <div className="flex flex-col">
              <label className="text-sm text-gray-600 mb-1">
                Trạng thái sử dụng
              </label>
              <select
                className="px-3 py-2 border rounded-lg"
                value={usedBooking}
                onChange={(e) => setUsedBooking(e.target.value)}
              >
                <option value="all">Tất cả</option>
                <option value="true">Đã sử dụng</option>
                <option value="false">Chưa sử dụng</option>
              </select>
            </div>

            <div className="flex flex-col">
              <label className="text-sm text-gray-600 mb-1">
                Loại giảm giá
              </label>
              <select
                className="px-3 py-2 border rounded-lg"
                value={typeBooking}
                onChange={(e) => setTypeBooking(e.target.value)}
              >
                <option value="all">Tất cả</option>
                <option value="PERCENT">Phần trăm</option>
                <option value="AMOUNT">Tiền mặt</option>
              </select>
            </div>

            <button
              onClick={() => setOpenAdd(true)}
              className="flex items-center px-5 py-2 bg-sky-600 text-white rounded-lg hover:bg-sky-700"
            >
              <Plus className="w-4 h-4 mr-2" />
              Thêm khuyến mãi
            </button>
          </div>
        </div>
        {loadingDiscountBooking ? (
          <div className="flex justify-center py-10 text-sky-600">
            <Loader2 className="w-8 h-8 animate-spin" />
          </div>
        ) : (
          <DiscountTable
            discounts={discountBookings?.discountBookings || []}
            page={pageBooking}
            limit={limit}
            onToggleLock={() => {}}
            onDeleteDiscount={() => {}}
          />
        )}
        {/* --- Pagination Backend --- */}{" "}
        <Pagination
          page={pageBooking}
          total={discountBookings?.total || 0}
          onPrev={() => setPageBooking((prev) => Math.max(prev - 1, 1))}
          onNext={() =>
            setPageBooking((prev) =>
              prev * limit < (discountBookings?.total || 0) ? prev + 1 : prev
            )
          }
        />
      </section>

      {openAdd && (
        <AddDiscountForm
          onSubmit={() => {}}
          setOpenAdd={setOpenAdd}
          loadingAdd={loadingAdd}
        />
      )}
    </div>
  );
};

export default DiscountPage;
