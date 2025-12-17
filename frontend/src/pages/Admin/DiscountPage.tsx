import { useEffect, useState } from "react";
import { useAppDispatch, useAppSelector } from "../../store/hook";
import { Loader2, Plus } from "lucide-react";
import { toast } from "react-toastify";
import DiscountTable from "../../components/ui/admin/DiscountTable";
import AddDiscountForm from "../../components/ui/admin/AddDiscountForm";
import type { formAddDiscountSchema } from "../../schemas/FormAddDiscountSchema";
import type {
  AdminAddDiscountRequest,
  AdminDiscountRequest,
} from "../../types/discount";
import {
  addDiscount,
  getDiscounts,
  getDiscountBookings,
  updateDiscountActive,
  updateDiscountActiveLocal,
  deleteDiscount,
  deleteDiscountLocal,
  setDiscountsLocal,
  updateDiscountBookingActive,
  updateDiscountBookingActiveLocal,
  deleteDiscountBookingLocal,
  deleteDiscountBooking,
  setDiscountBookingsLocal,
  addDiscountBooking,
} from "../../store/slices/admin/discountSlice";
import Pagination from "../../components/ui/admin/Pagination";
import Swal from "sweetalert2";

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
  const [addType, setAddType] = useState<"ORDER" | "BOOKING">("ORDER");

  // Pagination
  const [pageDiscount, setPageDiscount] = useState(1);
  const [pageBooking, setPageBooking] = useState(1);
  const limit = 10;

  // Filter / Order

  const [usedOrder, setUsedOrder] = useState("all");
  const [typeOrder, setTypeOrder] = useState("all");
  const [usedBooking, setUsedBooking] = useState("all");
  const [typeBooking, setTypeBooking] = useState("all");

  // --- Error handling ---
  useEffect(() => {
    if (error) {
      toast.error(error);
    }
  }, [error]);

  // --- Fetch discounts ---
  useEffect(() => {
    const data: AdminDiscountRequest = {
      page: pageDiscount,
      limit,
      isUsed:
        usedOrder === "all" ? undefined : usedOrder === "true" ? true : false,
      type: typeOrder === "all" ? undefined : typeOrder,
    };
    dispatch(getDiscounts({ data }));
  }, [dispatch, pageDiscount, usedOrder, typeOrder]);

  // --- Fetch discount bookings ---
  useEffect(() => {
    const data: AdminDiscountRequest = {
      page: pageBooking,
      limit,
      isUsed: usedBooking === "all" ? undefined : usedBooking === "true",
      type: typeBooking === "all" ? undefined : typeBooking,
    };
    dispatch(getDiscountBookings({ data }));
  }, [dispatch, pageBooking, usedBooking, typeBooking]);

  // ================= ADD DISCOUNT (CHUNG) =================
  const onSubmit = async (dt: formAddDiscountSchema) => {
    const data: AdminAddDiscountRequest = {
      code: dt.code,
      type: dt.type,
      value: Number(dt.value),
      startDate: dt.startDate,
      endDate: dt.endDate,
      minOrderAmount: Number(dt.minOrderAmount),
      minBookingAmount: Number(dt.minOrderAmount),
    };

    try {
      if (addType === "ORDER") {
        const res = await dispatch(addDiscount({ data2: data })).unwrap();
        toast.success(res.message);
        dispatch(
          getDiscounts({
            data: {
              page: pageDiscount,
              limit,
              isUsed:
                usedOrder === "all"
                  ? undefined
                  : usedOrder === "true"
                  ? true
                  : false,
              type: typeOrder === "all" ? undefined : typeOrder,
            },
          })
        );
      } else {
        const res = await dispatch(
          addDiscountBooking({ data2: data })
        ).unwrap();
        toast.success(res.message);
        dispatch(
          getDiscountBookings({
            data: {
              page: pageBooking,
              limit,
              isUsed:
                usedBooking === "all"
                  ? undefined
                  : usedBooking === "true"
                  ? true
                  : false,
              type: typeBooking === "all" ? undefined : typeBooking,
            },
          })
        );
      }

      setOpenAdd(false);
    } catch {
      // lỗi đã xử lý ở slice
    }
  };

  // --- Toggle lock ---
  const handleToggleLock = async (id: number) => {
    const result = await Swal.fire({
      title: "Xác nhận thay đổi trạng thái",
      text: "Bạn có chắc chắn muốn thay đổi trạng thái của mã này không?",
      icon: "question",
      showCancelButton: true,
      confirmButtonText: "Chắc chắn",
      cancelButtonText: "Hủy",
    });
    if (result.isConfirmed) {
      dispatch(updateDiscountActiveLocal({ discountId: id }));
      try {
        const data = { discountId: id };
        const res = await dispatch(updateDiscountActive({ data })).unwrap();
        toast.success(res.message);
      } catch {
        dispatch(updateDiscountActiveLocal({ discountId: id }));
      }
    }
  };

  // --- Delete discount ---
  const handleDeleteDiscount = async (id: number) => {
    const result = await Swal.fire({
      title: "Xác nhận xóa mã giảm giá",
      text: "Bạn có chắc chắn muốn xóa mã giảm giá này không?",
      icon: "question",
      showCancelButton: true,
      confirmButtonText: "Chắc chắn",
      cancelButtonText: "Hủy",
    });
    if (result.isConfirmed) {
      if (!discounts) return;
      const prevDiscounts = { ...discounts };
      dispatch(deleteDiscountLocal({ discountId: id }));
      try {
        const data = { discountId: id };
        const res = await dispatch(deleteDiscount({ data })).unwrap();
        toast.success(res.message);
      } catch {
        dispatch(setDiscountsLocal({ prevDiscounts }));
      }
    }
  };

  // --- Toggle lock ---
  const handleToggleLockBooking = async (id: number) => {
    const result = await Swal.fire({
      title: "Xác nhận thay đổi trạng thái",
      text: "Bạn có chắc chắn muốn thay đổi trạng thái của mã này không?",
      icon: "question",
      showCancelButton: true,
      confirmButtonText: "Chắc chắn",
      cancelButtonText: "Hủy",
    });
    if (result.isConfirmed) {
      dispatch(updateDiscountBookingActiveLocal({ discountId: id }));
      try {
        const data = { discountId: id };
        const res = await dispatch(
          updateDiscountBookingActive({ data })
        ).unwrap();
        toast.success(res.message);
      } catch {
        dispatch(updateDiscountBookingActiveLocal({ discountId: id }));
      }
    }
  };

  // --- Delete discount ---
  const handleDeleteDiscountBooking = async (id: number) => {
    const result = await Swal.fire({
      title: "Xác nhận xóa mã giảm giá",
      text: "Bạn có chắc chắn muốn xóa mã giảm giá này không?",
      icon: "question",
      showCancelButton: true,
      confirmButtonText: "Chắc chắn",
      cancelButtonText: "Hủy",
    });
    if (result.isConfirmed) {
      if (!discounts) return;
      const prevDiscounts = { ...discounts };
      dispatch(deleteDiscountBookingLocal({ discountId: id }));
      try {
        const data = { discountId: id };
        const res = await dispatch(deleteDiscountBooking({ data })).unwrap();
        toast.success(res.message);
      } catch {
        dispatch(setDiscountBookingsLocal({ prevDiscounts }));
      }
    }
  };

  // --- Loading ---
  if (loadingDiscount || loadingDiscountBooking) {
    return (
      <div className="flex flex-col justify-center items-center h-[60vh] text-sky-600">
        <Loader2 className="w-10 h-10 animate-spin mb-3" />
        <p className="text-lg font-medium">Đang tải...</p>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-10 bg-gray-50 min-h-screen">
      {/* ================== ORDER DISCOUNT ================== */}
      <section className="bg-white rounded-2xl border border-gray-200 p-10 space-y-6">
        {/* Header + Filter + Add */}
        <div className="flex flex-col xl:flex-row xl:items-center xl:justify-between gap-6">
          <h1 className="inline-flex items-center gap-2 text-2xl font-bold text-sky-700 mb-8 relative">
            Khuyến mãi đơn hàng
            <span className="absolute left-0 -bottom-3 w-1/2 h-1 bg-sky-400 rounded-sm"></span>
          </h1>
          <div className="flex flex-wrap items-end gap-4">
            <div className="flex flex-col">
              <label className="text-sm text-gray-600 mb-1">
                Trạng thái sử dụng
              </label>
              <select
                className="px-3 py-2 border rounded-lg"
                value={usedOrder}
                onChange={(e) => setUsedOrder(e.target.value)}
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
                value={typeOrder}
                onChange={(e) => setTypeOrder(e.target.value)}
              >
                <option value="all">Tất cả</option>
                <option value="PERCENT">Phần trăm</option>
                <option value="AMOUNT">Tiền mặt</option>
              </select>
            </div>
            <button
              onClick={() => {
                setOpenAdd(true);
                setAddType("ORDER");
              }}
              className="flex items-center px-2 py-2 bg-sky-600 text-white rounded-lg hover:bg-sky-700"
            >
              <Plus className="w-4 h-4 mr-2" />
              Thêm khuyến mãi
            </button>
          </div>
        </div>

        {/* Table */}
        <DiscountTable
          discounts={discounts?.discounts || []}
          page={pageDiscount}
          limit={limit}
          onToggleLock={handleToggleLock}
          onDeleteDiscount={handleDeleteDiscount}
        />

        {/* --- Pagination Backend --- */}
        <Pagination
          page={pageDiscount}
          total={discounts?.total || 0}
          onPrev={() => setPageDiscount((prev) => Math.max(prev - 1, 1))}
          onNext={() =>
            setPageDiscount((prev) =>
              prev < Math.ceil((discounts?.total || 0) / 10) ? prev + 1 : prev
            )
          }
        />
      </section>

      {/* ================== BOOKING DISCOUNT ================== */}
      <section className="bg-white rounded-2xl border border-gray-200 p-10 space-y-6">
        {/* Header + Filter + Add */}
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

            {/* Nút thêm khuyến mãi */}
            <button
              onClick={() => {
                setOpenAdd(true);
                setAddType("BOOKING");
              }}
              className="flex items-center px-2 py-2 bg-sky-600 text-white rounded-lg hover:bg-sky-700"
            >
              <Plus className="w-4 h-4 mr-2" />
              Thêm khuyến mãi
            </button>
          </div>
        </div>

        {/* Table */}
        <DiscountTable
          discounts={discountBookings?.discountBookings || []}
          page={pageBooking}
          limit={limit}
          onToggleLock={handleToggleLockBooking}
          onDeleteDiscount={handleDeleteDiscountBooking}
        />

        {/* Pagination */}
        <Pagination
          page={pageBooking}
          total={discountBookings?.total || 0}
          onPrev={() => setPageBooking((prev) => Math.max(prev - 1, 1))}
          onNext={() =>
            setPageBooking((prev) =>
              prev < Math.ceil((discountBookings?.total || 0) / limit)
                ? prev + 1
                : prev
            )
          }
        />
      </section>

      {/* --- Add Discount Form --- */}
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
