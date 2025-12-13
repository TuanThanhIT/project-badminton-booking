// src/pages/admin/DiscountPage.tsx
import React, { useEffect, useState } from "react";
import { Loader2, Plus } from "lucide-react";
import { useAppDispatch, useAppSelector } from "../../store/hook";
import { toast } from "react-toastify";
import {
  addDiscount,
  clearDiscountError,
  deleteDiscount,
  deleteDiscountLocal,
  getDiscounts,
  setDiscountsLocal,
  updateDiscountActive,
  updateDiscountActiveLocal,
} from "../../store/slices/admin/discountSlice";
import type {
  AdminAddDiscountRequest,
  AdminDiscountRequest,
} from "../../types/discount";
import DiscountTable from "../../components/ui/admin/DiscountTable";
import AddDiscountForm from "../../components/ui/admin/AddDiscountForm";
import type { formAddDiscountSchema } from "../../schemas/FormAddDiscountSchema";

const DiscountPage: React.FC = () => {
  const dispatch = useAppDispatch();
  const { discounts, error, loading, loadingAdd } = useAppSelector(
    (state) => state.discountAdmin
  );

  const [openAdd, setOpenAdd] = useState(false);

  const [page, setPage] = useState(1);
  const limit = 10;

  // --- Filter state ---
  const [isUsedFilter, setIsUsedFilter] = useState<string>("all"); // all, true, false
  const [typeFilter, setTypeFilter] = useState<string>("all"); // all, PERCENT, AMOUNT

  // --- Xử lý lỗi ---
  useEffect(() => {
    if (error) {
      toast.error(error);
      dispatch(clearDiscountError());
    }
  }, [error, dispatch]);

  useEffect(() => {
    // --- Lấy dữ liệu từ backend ---
    const data: AdminDiscountRequest = {
      page,
      limit,
      isUsed:
        isUsedFilter === "all"
          ? undefined
          : isUsedFilter === "true"
          ? true
          : false,
      type: typeFilter === "all" ? undefined : typeFilter,
    };
    dispatch(getDiscounts({ data }));
  }, [dispatch, page, isUsedFilter, typeFilter]);

  // --- Loading ---
  if (loading) {
    return (
      <div className="flex flex-col justify-center items-center h-[60vh] text-sky-600">
        <Loader2 className="w-10 h-10 animate-spin mb-3" />
        <p className="text-lg font-medium">Đang tải...</p>
      </div>
    );
  }

  const onSubmit = async (dt: formAddDiscountSchema) => {
    try {
      const data2: AdminAddDiscountRequest = {
        code: dt.code,
        type: dt.type,
        value: Number(dt.value),
        startDate: dt.startDate,
        endDate: dt.endDate,
        minOrderAmount: Number(dt.minOrderAmount),
      };
      const res = await dispatch(addDiscount({ data2 })).unwrap();
      toast.success(res.message);
      const data: AdminDiscountRequest = {
        page,
        limit,
        isUsed:
          isUsedFilter === "all"
            ? undefined
            : isUsedFilter === "true"
            ? true
            : false,
        type: typeFilter === "all" ? undefined : typeFilter,
      };
      dispatch(getDiscounts({ data }));
    } catch {
      // ko xử lý ở đây
    }
  };
  const handleToggleLock = async (id: number) => {
    const discountId = id;
    dispatch(updateDiscountActiveLocal({ discountId }));
    try {
      const data = { discountId };
      const res = await dispatch(updateDiscountActive({ data })).unwrap();
      toast.success(res.message);
    } catch (error) {
      dispatch(updateDiscountActiveLocal({ discountId }));
    }
  };

  const handleDeleteDiscount = async (id: number) => {
    const discountId = id;
    if (!discounts) return;
    const prevDiscounts = { ...discounts };
    dispatch(deleteDiscountLocal({ discountId }));
    try {
      const data = { discountId };
      const res = await dispatch(deleteDiscount({ data })).unwrap();
      toast.success(res.message);
    } catch (error) {
      setDiscountsLocal({ prevDiscounts });
    }
  };

  return (
    <div className="p-4">
      {/* --- Header + Filter + Button --- */}
      <section className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-4 gap-4">
        <h1 className="text-2xl font-bold">Khuyến mãi đơn hàng</h1>

        <div className="flex flex-col sm:flex-row sm:items-end gap-4">
          {/* Filter IsUsed */}
          <div className="flex flex-col">
            <label className="text-sm text-gray-600 mb-1">Đã sử dụng</label>
            <select
              className="px-3 py-1 border rounded-md focus:ring-1 focus:ring-sky-400 focus:outline-none"
              value={isUsedFilter}
              onChange={(e) => setIsUsedFilter(e.target.value)}
            >
              <option value="all">Tất cả</option>
              <option value="true">Đã sử dụng</option>
              <option value="false">Chưa sử dụng</option>
            </select>
          </div>

          {/* Filter Type */}
          <div className="flex flex-col">
            <label className="text-sm text-gray-600 mb-1">Loại giảm giá</label>
            <select
              className="px-3 py-1 border rounded-md focus:ring-1 focus:ring-sky-400 focus:outline-none"
              value={typeFilter}
              onChange={(e) => setTypeFilter(e.target.value)}
            >
              <option value="all">Tất cả</option>
              <option value="PERCENT">Phần trăm</option>
              <option value="AMOUNT">Tiền mặt</option>
            </select>
          </div>

          {/* Button Thêm */}
          <button
            onClick={() => setOpenAdd(true)}
            className="flex items-center px-4 py-2 bg-sky-600 text-white rounded-md hover:bg-sky-700 transition mt-2 sm:mt-6"
          >
            <Plus className="w-4 h-4 mr-2" />
            Thêm khuyến mãi
          </button>
        </div>
      </section>

      {/* --- Table --- */}
      <DiscountTable
        discounts={discounts?.discounts || []}
        page={page}
        limit={limit}
        onToggleLock={handleToggleLock}
        onDeleteDiscount={handleDeleteDiscount}
      />

      {/* --- Pagination Backend --- */}
      <div className="flex items-center justify-between py-4">
        <div className="flex items-center gap-2">
          <button
            className="px-3 py-1 bg-gray-200 rounded-md hover:bg-gray-300 disabled:opacity-50 disabled:cursor-not-allowed transition"
            onClick={() => setPage((prev) => Math.max(prev - 1, 1))}
            disabled={page <= 1}
            title="Trang trước"
          >
            « Trước
          </button>
          <button
            className="px-3 py-1 bg-gray-200 rounded-md hover:bg-gray-300 disabled:opacity-50 disabled:cursor-not-allowed transition"
            onClick={() =>
              setPage((prev) =>
                prev < Math.ceil((discounts?.total || 0) / limit)
                  ? prev + 1
                  : prev
              )
            }
            disabled={page >= Math.ceil((discounts?.total || 0) / limit)}
            title="Trang sau"
          >
            Sau »
          </button>
        </div>
        <div className="text-sm text-gray-600">
          Trang {page} /{" "}
          {Math.max(Math.ceil((discounts?.total || 0) / limit), 1)}
        </div>
      </div>

      {openAdd && (
        <AddDiscountForm
          onSubmit={onSubmit}
          setOpenAdd={setOpenAdd}
          loadingAdd={loadingAdd}
        />
      )}
    </div>
  );
};

export default DiscountPage;
