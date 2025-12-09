import { useContext, useEffect, useState } from "react";
import { DollarSign, Loader2, LogOut } from "lucide-react";
import { useAppDispatch, useAppSelector } from "../../store/hook";
import { toast } from "react-toastify";
import {
  clearWorkShiftError,
  getWorkShift,
  updateCheckOut,
} from "../../store/slices/employee/workShiftSlice";
import { AuthContext } from "../../components/contexts/authContext";
import { useNavigate } from "react-router-dom";
import Swal from "sweetalert2";

const CheckOutPage = () => {
  const { setAuth } = useContext(AuthContext);
  const navigate = useNavigate();
  const [amount, setAmount] = useState("");
  const [isConfirmed, setIsConfirmed] = useState(false); // trạng thái đã xác nhận
  const dispatch = useAppDispatch();
  const { workShift, error, loading } = useAppSelector(
    (state) => state.workShiftEpl
  );

  useEffect(() => {
    const nowTime = new Date().toTimeString().split(" ")[0];
    dispatch(getWorkShift({ nowTime }));
  }, [dispatch]);

  const handleSubmit = async (e: React.FormEvent) => {
    try {
      const result = await Swal.fire({
        title: "Xác nhận Checkout",
        text: "Bạn có chắc chắn muốn thực hiện Checkout ca làm?",
        icon: "question",
        showCancelButton: true,
        confirmButtonText: "Chắc chắn",
        cancelButtonText: "Hủy",
      });

      if (result.isConfirmed) {
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
          checkOutTime: nowTime,
          closeCash: Number(amount),
        };
        const res = await dispatch(updateCheckOut({ data })).unwrap();
        toast.success(res.message);

        // Bật nút Logout sau khi xác nhận thành công
        setIsConfirmed(true);
      }
    } catch (error) {
      // không xử lý nữa
    }
  };

  const handleLogout = () => {
    setAuth({
      isAuthenticated: false,
      user: { id: 0, email: "", username: "", role: "" },
    });

    localStorage.clear();
    localStorage.removeItem("persist:root");
    toast.success("Đăng xuất thành công!");
    setTimeout(() => {
      navigate("/employee/login");
    }, 1000);
  };

  useEffect(() => {
    if (error) {
      toast.error(error);
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
    <div className="flex-1 w-full bg-white flex flex-col items-center justify-center py-10 relative">
      {/* Nút Logout ở góc phải */}
      <button
        onClick={handleLogout}
        disabled={!isConfirmed} // khóa nếu chưa xác nhận
        className={`absolute top-10 right-10 flex items-center gap-2 px-4 py-2 rounded-full 
          transition shadow-md text-sm font-medium
          ${
            isConfirmed
              ? "bg-green-500 hover:bg-green-700 text-white"
              : "bg-gray-300 text-gray-500 cursor-not-allowed"
          }`}
      >
        <LogOut className="w-5 h-5" />
        Logout
      </button>

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
              Nhập tiền mặt hiện có quầy trước khi Đăng xuất
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

export default CheckOutPage;
