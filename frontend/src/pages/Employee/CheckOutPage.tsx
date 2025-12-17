import { useContext, useEffect, useState } from "react";
import {
  DollarSign,
  Loader2,
  LogOut,
  Clock,
  Calendar,
  User,
} from "lucide-react";
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
  const { setAuth, auth } = useContext(AuthContext);

  const navigate = useNavigate();
  const [amount, setAmount] = useState("");
  const dispatch = useAppDispatch();
  const { workShift, error, loading } = useAppSelector(
    (state) => state.workShiftEpl
  );

  useEffect(() => {
    const nowTime = new Date().toTimeString().split(" ")[0];
    dispatch(getWorkShift({ nowTime }));
  }, [dispatch]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
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
      }
    } catch (error) {
      // không xử lý
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
        <p className="text-lg font-semibold">Đang tải thông tin...</p>
      </div>
    );
  }

  return (
    <div className="flex-1 w-full bg-gray-50 flex items-center justify-center py-20 relative">
      {/* Nút Logout ở góc phải */}
      <button
        onClick={handleLogout}
        className="absolute top-10 right-10 flex items-center gap-2 px-4 py-2 rounded-full 
          bg-green-500 hover:bg-green-700 text-white font-semibold shadow-md transition"
      >
        <LogOut className="w-5 h-5" />
        Logout
      </button>

      <div className="w-full max-w-5xl md:grid md:grid-cols-2 bg-white rounded-3xl overflow-hidden shadow-xl border border-gray-200">
        {/* Hình minh họa */}
        <div className="hidden md:block relative">
          <img
            src="/img/cash.jpeg"
            alt="Cash Register"
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent rounded-l-3xl"></div>
          <div className="absolute bottom-5 left-5 text-white font-bold text-xl drop-shadow-lg">
            Chào mừng đến với quầy B-Hub
          </div>
        </div>

        {/* Form */}
        <div className="flex-1 flex items-center justify-center p-10 bg-white">
          <form
            className="w-full max-h-[90vh] flex flex-col gap-6 overflow-auto p-8 bg-white rounded-3xl shadow-xl border border-gray-200 hover:shadow-2xl transition-shadow duration-300"
            onSubmit={handleSubmit}
          >
            <h2 className="text-2xl text-gray-700 font-semibold mb-3 text-center">
              Tạm biệt, {auth.user.username}!
            </h2>
            <h2 className="text-2xl text-gray-700 font-semibold mb-3 text-center">
              Nhập tiền mặt hiện có quầy trước khi Đăng xuất
            </h2>

            <div className="flex flex-col gap-2">
              <label className="text-gray-700 font-medium text-lg">
                Số tiền VNĐ
              </label>
              <div className="relative">
                <DollarSign className="absolute left-4 top-1/2 -translate-y-1/2 text-sky-500 animate-pulse" />
                <input
                  type="number"
                  min={0}
                  placeholder="Nhập số tiền"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  className="w-full p-4 pl-12 rounded-2xl border border-gray-300 bg-gray-50 text-gray-800 placeholder-gray-400 text-lg focus:outline-none focus:ring-2 focus:ring-sky-300 shadow-sm transition-all duration-200"
                />
              </div>
              <p className="text-gray-400 text-sm">
                Nhập số tiền hiện có trong quầy trước khi Checkout ca.
              </p>

              {/* Thông tin ca làm nhỏ gọn */}
              {workShift && (
                <p className="mt-2 text-gray-500 text-sm flex items-center gap-6">
                  <span className="flex items-center gap-1">
                    <Clock className="w-4 h-4" /> {workShift.startTime} -{" "}
                    {workShift.endTime}
                  </span>
                  <span className="flex items-center gap-1">
                    <Calendar className="w-4 h-4" /> {workShift.workDate}
                  </span>
                  <span className="flex items-center gap-1">
                    <User className="w-4 h-4" /> {workShift.name}
                  </span>
                </p>
              )}
            </div>

            <button
              type="submit"
              className="mt-4 w-full md:w-auto bg-gradient-to-r from-sky-500 to-sky-600 hover:from-sky-600 hover:to-sky-700 text-white py-2 px-5 rounded-2xl font-semibold text-lg shadow-lg transition-all duration-300 transform hover:scale-105 self-center"
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
