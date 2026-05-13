import React, { useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import {
  ArrowLeft,
  Ticket,
  CreditCard,
  Wallet,
  Banknote,
  CheckCircle2,
  Calendar,
  Clock,
  MapPin,
  ShieldCheck,
} from "lucide-react";

// Định nghĩa Interface cho Voucher (Mock dữ liệu)
interface Voucher {
  id: number;
  code: string;
  value: number;
  type: "PERCENT" | "AMOUNT";
  description: string;
}

const MOCK_VOUCHERS: Voucher[] = [
  {
    id: 1,
    code: "CHAOSAN10",
    value: 10,
    type: "PERCENT",
    description: "Giảm 10% cho khách mới",
  },
  {
    id: 2,
    code: "VIPSALE50",
    value: 50000,
    type: "AMOUNT",
    description: "Giảm thẳng 50k cho thành viên VIP",
  },
];

const PaymentPage = () => {
  const { state } = useLocation();
  const navigate = useNavigate();

  // Tránh lỗi nếu state null
  if (!state) {
    return (
      <div className="p-10 text-center font-bold">
        Không tìm thấy thông tin thanh toán!
      </div>
    );
  }

  const [selectedMethod, setSelectedMethod] = useState<string>("VNPAY");
  const [selectedVoucher, setSelectedVoucher] = useState<Voucher | null>(null);

  // Tính toán số tiền
  const discountAmount = selectedVoucher
    ? selectedVoucher.type === "PERCENT"
      ? (state.totalAmount * selectedVoucher.value) / 100
      : selectedVoucher.value
    : 0;

  const finalTotal = state.totalAmount - discountAmount;

  const handlePayNow = () => {
    console.log("Proceeding to pay:", {
      method: selectedMethod,
      voucher: selectedVoucher,
      amount: finalTotal,
    });
    alert(`Đang chuyển hướng thanh toán qua ${selectedMethod}...`);
    // Logic gọi API thanh toán ở đây
  };

  return (
    <div className="bg-slate-50 min-h-screen pb-20">
      {/* HEADER */}
      <section className="bg-white border-b border-slate-200 pt-10 pb-6 px-6 sticky top-0 z-10">
        <div className="max-w-5xl mx-auto flex items-center gap-4">
          <button
            onClick={() => navigate(-1)}
            className="p-3 hover:bg-slate-100 rounded-full transition"
          >
            <ArrowLeft size={24} />
          </button>
          <h1 className="text-2xl font-black text-slate-900">
            XÁC NHẬN THANH TOÁN
          </h1>
        </div>
      </section>

      <main className="max-w-5xl mx-auto px-6 mt-8">
        <div className="grid lg:grid-cols-12 gap-8">
          {/* CỘT TRÁI: THÔNG TIN CHI TIẾT */}
          <div className="lg:col-span-7 space-y-6">
            {/* THÔNG TIN SÂN */}
            <div className="bg-white rounded-3xl p-6 shadow-sm border border-slate-200">
              <h2 className="text-lg font-black mb-4 flex items-center gap-2">
                <CheckCircle2 className="text-sky-500" size={20} />
                Chi tiết đặt sân
              </h2>

              <div className="space-y-4">
                <div className="flex items-start gap-4 p-4 bg-slate-50 rounded-2xl">
                  <div className="bg-sky-500 p-3 rounded-xl text-white">
                    <MapPin size={24} />
                  </div>
                  <div>
                    <h3 className="font-bold text-slate-900">
                      {state.courtName}
                    </h3>
                    <p className="text-sm text-slate-500">{state.branchName}</p>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4 text-sm font-medium">
                  <div className="flex items-center gap-3 p-3 border border-slate-100 rounded-xl">
                    <Calendar className="text-slate-400" size={18} />
                    <span>
                      {state.type === "daily"
                        ? state.bookingDate
                        : `${state.startDate} → ${state.endDate}`}
                    </span>
                  </div>
                  <div className="flex items-center gap-3 p-3 border border-slate-100 rounded-xl">
                    <Clock className="text-slate-400" size={18} />
                    <span>
                      {state.startTime} - {state.endTime}
                    </span>
                  </div>
                </div>

                {state.type === "monthly" && (
                  <div className="text-xs text-slate-500 font-bold bg-sky-50 p-3 rounded-lg flex justify-between">
                    <span>LỊCH TRÌNH: {state.daysOfWeek?.join(", ")}</span>
                    <span>TỔNG: {state.totalSessions} BUỔI</span>
                  </div>
                )}
              </div>
            </div>

            {/* CHỌN VOUCHER */}
            <div className="bg-white rounded-3xl p-6 shadow-sm border border-slate-200">
              <h2 className="text-lg font-black mb-4 flex items-center gap-2">
                <Ticket className="text-orange-500" size={20} />
                Ưu đãi & Voucher
              </h2>
              <div className="space-y-3">
                {MOCK_VOUCHERS.map((v) => (
                  <label
                    key={v.id}
                    className={`flex items-center justify-between p-4 border-2 rounded-2xl cursor-pointer transition ${selectedVoucher?.id === v.id ? "border-sky-500 bg-sky-50" : "border-slate-100"}`}
                  >
                    <div className="flex items-center gap-4">
                      <div className="bg-orange-100 p-2 rounded-lg text-orange-600">
                        <Ticket size={20} />
                      </div>
                      <div>
                        <p className="font-black text-slate-800">{v.code}</p>
                        <p className="text-xs text-slate-500">
                          {v.description}
                        </p>
                      </div>
                    </div>
                    <input
                      type="radio"
                      name="voucher"
                      className="hidden"
                      onChange={() => setSelectedVoucher(v)}
                    />
                    {selectedVoucher?.id === v.id && (
                      <CheckCircle2 size={20} className="text-sky-500" />
                    )}
                  </label>
                ))}
              </div>
            </div>

            {/* PHƯƠNG THỨC THANH TOÁN */}
            <div className="bg-white rounded-3xl p-6 shadow-sm border border-slate-200">
              <h2 className="text-lg font-black mb-4 flex items-center gap-2">
                <CreditCard className="text-purple-500" size={20} />
                Phương thức thanh toán
              </h2>
              <div className="grid gap-3">
                {[
                  {
                    id: "VNPAY",
                    name: "Cổng thanh toán VNPAY",
                    icon: <CreditCard />,
                    desc: "Thanh toán qua ngân hàng, QR code",
                  },
                  {
                    id: "WALLET",
                    name: "Ví hệ thống",
                    icon: <Wallet />,
                    desc: "Sử dụng số dư ví cá nhân",
                  },
                  {
                    id: "COD",
                    name: "Thanh toán tại quầy",
                    icon: <Banknote />,
                    desc: "Trả tiền trực tiếp khi tới sân",
                  },
                ].map((m) => (
                  <button
                    key={m.id}
                    onClick={() => setSelectedMethod(m.id)}
                    className={`flex items-center gap-4 p-4 rounded-2xl border-2 transition ${selectedMethod === m.id ? "border-sky-500 bg-sky-50" : "border-slate-100"}`}
                  >
                    <div
                      className={`${selectedMethod === m.id ? "text-sky-500" : "text-slate-400"}`}
                    >
                      {m.icon}
                    </div>
                    <div className="text-left flex-1">
                      <p className="font-bold text-slate-800 leading-none">
                        {m.name}
                      </p>
                      <span className="text-xs text-slate-500">{m.desc}</span>
                    </div>
                    <div
                      className={`w-6 h-6 rounded-full border-2 flex items-center justify-center ${selectedMethod === m.id ? "border-sky-500 bg-sky-500" : "border-slate-200"}`}
                    >
                      {selectedMethod === m.id && (
                        <div className="w-2 h-2 bg-white rounded-full" />
                      )}
                    </div>
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* CỘT PHẢI: BẢNG TỔNG TIỀN (STICKY) */}
          <div className="lg:col-span-5">
            <div className="bg-slate-900 text-white rounded-3xl p-8 sticky top-32 shadow-xl space-y-6">
              <h2 className="text-xl font-black pb-4 border-b border-slate-700">
                Tóm tắt thanh toán
              </h2>

              <div className="space-y-4 text-sm font-medium">
                <div className="flex justify-between text-slate-400">
                  <span>Giá gốc</span>
                  <span className="text-white">
                    {state.totalAmount.toLocaleString()}đ
                  </span>
                </div>

                <div className="flex justify-between text-slate-400">
                  <span>Giảm giá voucher</span>
                  <span className="text-orange-400">
                    -{discountAmount.toLocaleString()}đ
                  </span>
                </div>

                <div className="flex justify-between text-slate-400">
                  <span>Phí dịch vụ</span>
                  <span className="text-white">0đ</span>
                </div>

                <div className="pt-4 border-t border-slate-700 flex justify-between items-end">
                  <span className="text-lg font-bold">Tổng cộng</span>
                  <div className="text-right">
                    <p className="text-3xl font-black text-sky-400">
                      {finalTotal.toLocaleString()}đ
                    </p>
                    <p className="text-[10px] text-slate-500 uppercase tracking-widest mt-1">
                      Đã bao gồm VAT
                    </p>
                  </div>
                </div>
              </div>

              <div className="bg-slate-800/50 p-4 rounded-2xl flex gap-3 items-center border border-slate-700">
                <ShieldCheck className="text-emerald-500" size={30} />
                <p className="text-[11px] text-slate-400">
                  Thông tin thanh toán của bạn được bảo mật tuyệt đối theo tiêu
                  chuẩn quốc tế.
                </p>
              </div>

              <button
                onClick={handlePayNow}
                className="w-full py-5 bg-sky-500 hover:bg-sky-400 text-white rounded-2xl font-black text-lg transition-all shadow-lg shadow-sky-500/20 active:scale-[0.98]"
              >
                XÁC NHẬN & THANH TOÁN
              </button>

              <p className="text-center text-xs text-slate-500">
                Bằng việc nhấn nút, bạn đồng ý với các điều khoản của hệ thống.
              </p>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default PaymentPage;
