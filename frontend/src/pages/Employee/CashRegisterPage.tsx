import { useEffect, useState } from "react";
import { DollarSign, Loader2 } from "lucide-react";
import { useAppDispatch, useAppSelector } from "../../store/hook";
import { toast } from "react-toastify";
import {
  clearWorkShiftError,
  getWorkShift,
  updateWorkShift,
} from "../../store/slices/employee/workShiftSlice";
import { useNavigate } from "react-router-dom";

const CashRegisterPage = () => {
  const [amount, setAmount] = useState("");
  const dispatch = useAppDispatch();
  const { workShift, error, loading } = useAppSelector(
    (state) => state.workShiftEpl
  );
  const navigate = useNavigate();

  useEffect(() => {
    const nowTime = new Date().toTimeString().split(" ")[0];
    dispatch(getWorkShift({ nowTime }));
  }, [dispatch]);

  const handleSubmit = async (e: React.FormEvent) => {
    try {
      e.preventDefault();
      if (!amount || Number(amount) <= 0) {
        toast.error("Vui lòng nhập số tiền hợp lệ!");
        return;
      }
      if (!workShift) {
        toast.error("Không xác định được ca hiện tại!");
        return;
      }
      const nowTime = new Date().toTimeString().split(" ")[0];
      const id = workShift.id;
      const data = {
        workShiftId: id,
        checkInTime: nowTime,
        openCash: Number(amount),
      };
      const res = await dispatch(updateWorkShift({ data })).unwrap();
      toast.success(res.message);
      setTimeout(() => {
        navigate("/employee/home");
      }, 2000);
    } catch (error) {
      // không xử lý nữa
    }
  };

  useEffect(() => {
    toast.error(error);
    if (error) {
      dispatch(clearWorkShiftError());
    }
  }, [dispatch, error]);

  if (loading) {
    return (
      <div className="flex flex-col justify-center items-center h-[60vh] text-sky-700">
        <Loader2 className="w-10 h-10 animate-spin mb-3" />
        <p className="text-lg font-semibold">Đang cập nhật...</p>
      </div>
    );
  }

  return (
    <div className="flex-1 w-full bg-white flex items-center justify-center py-25">
      <div className="w-full max-w-4xl md:grid md:grid-cols-2 bg-white rounded-3xl border border-gray-300 overflow-hidden">
        {/* Hình minh họa */}
        <div className="hidden md:block">
          <img
            src="/img/cash.jpeg"
            alt="Cash Register"
            className="w-full h-full object-cover"
          />
        </div>

        {/* Form */}
        <div className="flex-1 flex items-center justify-center p-10">
          <form
            className="w-full max-h-[90vh] flex flex-col gap-6 overflow-auto"
            onSubmit={handleSubmit}
          >
            <h2 className="text-3xl font-extrabold text-sky-600 text-center mb-8">
              Nhập tiền mặt hiện có tại quầy
            </h2>

            <div className="flex flex-col gap-2">
              <label className="text-gray-700 font-medium text-lg">
                Số tiền VNĐ
              </label>
              <div className="relative">
                <DollarSign className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
                <input
                  type="number"
                  min={0}
                  placeholder="Nhập số tiền"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  className="w-full p-4 pl-12 rounded-2xl border border-gray-300 bg-white text-gray-800 placeholder-gray-400 text-lg focus:outline-none focus:ring-2 focus:ring-sky-300 shadow-sm transition-all duration-200"
                />
              </div>
            </div>

            <button
              type="submit"
              className="mt-4 w-full md:w-auto bg-gradient-to-r from-sky-500 to-sky-600 hover:from-sky-600 hover:to-sky-700 text-white py-2 px-5 rounded-2xl font-semibold text-lg shadow-lg transition-all duration-200 self-center"
            >
              Xác nhận
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default CashRegisterPage;
