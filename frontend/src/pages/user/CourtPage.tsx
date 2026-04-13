import React, { useState, useMemo, useEffect } from "react";
import {
  Calendar,
  Clock,
  MapPin,
  ChevronRight,
  Star,
  AlertCircle,
  Search,
  ChevronDown,
  CheckCircle2,
  Ticket,
  Zap,
  Info,
} from "lucide-react";

import { useAppDispatch, useAppSelector } from "../../redux/hook";
import { getAllBranches } from "../../redux/slices/user/branchSlice";
import { getAvailableCourts } from "../../redux/slices/user/courtSlice";
import {
  checkBookingDiscount,
  clearDiscount,
} from "../../redux/slices/user/discountSlice";

interface Court {
  id: number;
  name: string;
  type: string;
  price: number;
  rating: number;
  image: string;
  status: "available" | "booked" | "maintenance";
}

interface Branch {
  id: number;
  name: string;
  location: string;
  city: string;
}

const CourtPage: React.FC = () => {
  const dispatch = useAppDispatch();
  const { branchSimpleList } = useAppSelector((state) => state.branch);
  const { availableCourts } = useAppSelector((state) => state.court);
  const { discount, loading: discountLoading } = useAppSelector(
    (state) => state.discount,
  );

  const [searchTerm, setSearchTerm] = useState("");
  const [isOpenBranch, setIsOpenBranch] = useState(false);
  const [selectedBranch, setSelectedBranch] = useState<Branch | null>(null);
  const [selectedCourt, setSelectedCourt] = useState<Court | null>(null);
  const [startTime, setStartTime] = useState("08:00");
  const [endTime, setEndTime] = useState("10:00");
  const [bookingDate, setBookingDate] = useState(
    new Date().toISOString().split("T")[0],
  );
  const [voucher, setVoucher] = useState("");
  const [isApplied, setIsApplied] = useState(false);

  useEffect(() => {
    dispatch(getAllBranches());
  }, [dispatch]);

  useEffect(() => {
    if (!selectedBranch) return;
    const timeout = setTimeout(() => {
      dispatch(
        getAvailableCourts({
          branchId: selectedBranch.id,
          date: bookingDate,
          startTime,
          endTime,
        }),
      );
    }, 300);
    return () => clearTimeout(timeout);
  }, [dispatch, selectedBranch, bookingDate, startTime, endTime]);

  const branches: Branch[] = useMemo(() => {
    return (branchSimpleList || []).map((b) => ({
      id: b.id,
      name: b.branchName,
      location: "Khu vực TP. Hồ Chí Minh",
      city: "TP. Hồ Chí Minh",
    }));
  }, [branchSimpleList]);

  useEffect(() => {
    if (branches.length > 0 && !selectedBranch) setSelectedBranch(branches[0]);
  }, [branches, selectedBranch]);

  useEffect(() => {
    dispatch(clearDiscount());
    setIsApplied(false);
  }, [selectedCourt, startTime, endTime, dispatch]);

  const courts: Court[] = useMemo(() => {
    return (availableCourts || []).map((c) => ({
      id: c.id,
      name: c.courtName,
      type: "Sân tiêu chuẩn",
      price: c.totalPrice,
      rating: 4.9,
      image:
        c.thumbnailUrl ||
        "https://images.unsplash.com/photo-1626224580194-860047ee93b9?q=80&w=800&auto=format&fit=crop",
      status: c.status as any,
    }));
  }, [availableCourts]);

  const filteredBranches = branches.filter((b) =>
    b.name.toLowerCase().includes(searchTerm.toLowerCase()),
  );

  const handleApplyVoucher = () => {
    if (!voucher || subTotal <= 0) return;
    dispatch(checkBookingDiscount({ code: voucher, bookingAmount: subTotal }));
    setIsApplied(true);
  };

  const duration = useMemo(() => {
    const [sH, sM] = startTime.split(":").map(Number);
    const [eH, eM] = endTime.split(":").map(Number);
    const start = sH + sM / 60;
    const end = eH + eM / 60;
    return end > start ? end - start : 0;
  }, [startTime, endTime]);

  const subTotal = selectedCourt ? selectedCourt.price * duration : 0;
  const finalTotal = discount ? discount.finalAmount : subTotal;

  return (
    <div className="bg-[#F8FAFC] min-h-screen font-sans pb-20 text-slate-900">
      {/* HEADER */}
      <section className="bg-[#0F172A] pt-16 pb-32 px-6 text-white relative">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-8">
          <div className="w-full md:w-1/2">
            <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight mb-3">
              B-HUB <span className="text-sky-400">COURTS</span>
            </h1>
            <p className="text-slate-400 text-lg">
              Trải nghiệm thảm tiêu chuẩn BWF chuyên nghiệp.
            </p>
          </div>

          {/* BRANCH SELECTOR - FIXED POSITIONING */}
          <div className="relative w-full md:w-[400px] z-[100]">
            <label className="block text-[10px] uppercase font-bold text-slate-400 mb-2 ml-1 tracking-widest">
              Chi nhánh yêu thích
            </label>
            <button
              onClick={() => setIsOpenBranch(!isOpenBranch)}
              className="w-full bg-white/5 hover:bg-white/10 border border-white/10 p-4 rounded-2xl flex items-center justify-between transition-all backdrop-blur-md"
            >
              <div className="flex items-center gap-4">
                <div className="bg-sky-500 p-2 rounded-xl">
                  <MapPin size={20} className="text-white" />
                </div>
                <div className="text-left">
                  <p className="text-sm font-bold truncate max-w-[200px]">
                    {selectedBranch?.name || "Chọn chi nhánh"}
                  </p>
                  <p className="text-[11px] text-slate-400">
                    {selectedBranch?.city}
                  </p>
                </div>
              </div>
              <ChevronDown
                size={20}
                className={`text-slate-400 transition-transform ${isOpenBranch ? "rotate-180" : ""}`}
              />
            </button>

            {isOpenBranch && (
              <div className="absolute top-[calc(100%+8px)] left-0 w-full bg-white rounded-2xl shadow-2xl border border-slate-100 overflow-hidden text-slate-800 animate-in fade-in zoom-in-95 duration-200">
                <div className="p-4 border-b flex items-center gap-3 bg-slate-50">
                  <Search size={18} className="text-slate-400" />
                  <input
                    type="text"
                    placeholder="Tìm theo tên..."
                    className="bg-transparent outline-none text-sm w-full font-medium"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                </div>
                <div className="max-h-60 overflow-y-auto">
                  {filteredBranches.map((b) => (
                    <button
                      key={b.id}
                      onClick={() => {
                        setSelectedBranch(b);
                        setIsOpenBranch(false);
                      }}
                      className="w-full p-4 text-left hover:bg-sky-50 flex items-center justify-between border-b border-slate-50 last:border-none"
                    >
                      <div>
                        <p className="font-bold text-sm">{b.name}</p>
                        <p className="text-[11px] text-slate-400">
                          {b.location}
                        </p>
                      </div>
                      {selectedBranch?.id === b.id && (
                        <CheckCircle2 size={18} className="text-sky-500" />
                      )}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* MAIN CONTENT */}
      <div className="max-w-7xl mx-auto px-6 -mt-16 relative z-10">
        <div className="grid lg:grid-cols-12 gap-8 items-start">
          <div className="lg:col-span-8 space-y-8">
            {/* TIME FILTER */}
            <div className="bg-white p-6 rounded-[2rem] shadow-xl border border-white flex flex-wrap md:flex-nowrap items-center gap-6">
              <div className="flex-1 min-w-[140px]">
                <label className="text-[11px] font-bold text-slate-400 uppercase mb-2 block ml-1">
                  Ngày đặt
                </label>
                <input
                  type="date"
                  value={bookingDate}
                  onChange={(e) => setBookingDate(e.target.value)}
                  className="w-full bg-slate-50 p-3 rounded-xl font-bold outline-none border-none focus:ring-2 focus:ring-sky-500 transition-all"
                />
              </div>
              <div className="flex-1 min-w-[120px]">
                <label className="text-[11px] font-bold text-slate-400 uppercase mb-2 block ml-1">
                  Bắt đầu
                </label>
                <input
                  type="time"
                  value={startTime}
                  onChange={(e) => setStartTime(e.target.value)}
                  className="w-full bg-slate-50 p-3 rounded-xl font-bold outline-none border-none focus:ring-2 focus:ring-sky-500 transition-all"
                />
              </div>
              <div className="flex-1 min-w-[120px]">
                <label className="text-[11px] font-bold text-slate-400 uppercase mb-2 block ml-1">
                  Kết thúc
                </label>
                <input
                  type="time"
                  value={endTime}
                  onChange={(e) => setEndTime(e.target.value)}
                  className="w-full bg-slate-50 p-3 rounded-xl font-bold outline-none border-none focus:ring-2 focus:ring-sky-500 transition-all"
                />
              </div>
            </div>

            {/* COURT LIST */}
            <div>
              <div className="flex items-center gap-3 mb-6">
                <h2 className="text-xl font-extrabold">Danh sách sân</h2>
                <span className="bg-sky-100 text-sky-600 py-1 px-3 rounded-lg text-xs font-bold">
                  {courts.length} Sân trống
                </span>
              </div>

              {duration <= 0 ? (
                <div className="bg-orange-50 border border-orange-100 p-8 rounded-[2rem] text-center">
                  <AlertCircle className="mx-auto text-orange-400 mb-2" />
                  <p className="font-bold text-orange-800">
                    Thời gian không hợp lệ
                  </p>
                </div>
              ) : (
                <div className="grid md:grid-cols-2 gap-6">
                  {courts.map((court) => (
                    <div
                      key={court.id}
                      onClick={() => setSelectedCourt(court)}
                      className={`bg-white p-4 rounded-[2rem] cursor-pointer transition-all border-2 ${selectedCourt?.id === court.id ? "border-sky-500 shadow-2xl scale-[1.02]" : "border-transparent shadow-md hover:shadow-xl"}`}
                    >
                      <img
                        src={court.image}
                        className="h-44 w-full object-cover rounded-[1.5rem] mb-4"
                        alt={court.name}
                      />
                      <div className="flex justify-between items-center px-2">
                        <div>
                          <h3 className="font-bold text-lg">{court.name}</h3>
                          <p className="text-xs text-slate-400 uppercase">
                            {court.type}
                          </p>
                        </div>
                        <div className="text-right">
                          <p className="text-sky-600 font-bold text-lg">
                            {court.price.toLocaleString()}đ
                          </p>
                          <div className="flex items-center gap-1 justify-end text-yellow-500">
                            <Star size={12} fill="currentColor" />{" "}
                            <span className="text-xs font-bold text-slate-600">
                              4.9
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* SIDEBAR - STAYS IN PLACE */}
          <div className="lg:col-span-4 lg:sticky lg:top-8 z-20">
            <div className="bg-[#0F172A] text-white p-8 rounded-[2.5rem] shadow-2xl border border-white/5">
              <h2 className="text-2xl font-black mb-8 flex items-center gap-3">
                <div className="w-8 h-8 bg-sky-500 rounded-lg flex items-center justify-center">
                  <ChevronRight size={20} />
                </div>
                Thanh toán
              </h2>

              {selectedCourt && duration > 0 ? (
                <div className="space-y-6">
                  <div className="bg-white/5 border border-white/10 rounded-2xl p-4 flex justify-between items-center">
                    <div>
                      <p className="text-[10px] uppercase font-bold text-slate-500">
                        Sân đã chọn
                      </p>
                      <p className="font-bold text-sky-400">
                        {selectedCourt.name}
                      </p>
                    </div>
                    <p className="font-bold">{duration} giờ</p>
                  </div>

                  <div className="space-y-3 text-sm border-b border-white/10 pb-6">
                    <div className="flex justify-between text-slate-400">
                      <span>Tạm tính:</span>
                      <span className="text-white font-bold">
                        {subTotal.toLocaleString()}đ
                      </span>
                    </div>
                    <div className="flex gap-2">
                      <input
                        value={voucher}
                        onChange={(e) => {
                          setVoucher(e.target.value);
                          dispatch(clearDiscount());
                          setIsApplied(false);
                        }}
                        placeholder="Mã giảm giá"
                        className="bg-white/5 border border-white/10 rounded-xl px-4 py-2 flex-1 text-sm outline-none focus:border-sky-500 transition-all"
                      />
                      <button
                        onClick={handleApplyVoucher}
                        disabled={discountLoading}
                        className="bg-sky-500 px-4 rounded-xl text-xs font-bold hover:bg-sky-400 disabled:opacity-50"
                      >
                        {discountLoading ? "..." : "ÁP DỤNG"}
                      </button>
                    </div>
                    {discount && (
                      <div className="flex justify-between text-emerald-400 text-xs font-bold">
                        <span>Đã giảm:</span>
                        <span>-{discount.discountValue.toLocaleString()}đ</span>
                      </div>
                    )}
                  </div>

                  <div className="flex justify-between items-end">
                    <div>
                      <p className="text-[10px] uppercase font-bold text-slate-500 tracking-widest">
                        Tổng cộng
                      </p>
                      <p className="text-3xl font-black">
                        {finalTotal.toLocaleString()}đ
                      </p>
                    </div>
                    <div className="bg-sky-500/20 text-sky-400 p-2 rounded-lg">
                      <Info size={18} />
                    </div>
                  </div>

                  <button className="w-full bg-sky-500 hover:bg-sky-400 py-4 rounded-2xl font-black transition-all shadow-lg shadow-sky-500/20 active:scale-95">
                    XÁC NHẬN ĐẶT SÂN
                  </button>
                </div>
              ) : (
                <div className="py-12 text-center opacity-30 italic text-sm">
                  Vui lòng chọn sân để thanh toán
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CourtPage;
