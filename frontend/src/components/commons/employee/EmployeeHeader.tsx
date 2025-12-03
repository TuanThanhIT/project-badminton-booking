import { useContext, useEffect } from "react";
import { Calendar, Home, LogOut, Package, UserPlus } from "lucide-react";
import { NavLink, useNavigate } from "react-router-dom";
import { AuthContext } from "../../contexts/authContext";
import { useAppDispatch, useAppSelector } from "../../../store/hook";
import type { WorkShiftRequest } from "../../../types/workShift";
import {
  clearWorkShiftError,
  getWorkShift,
  getWorkShifts,
} from "../../../store/slices/employee/workShiftSlice";
import { toast } from "react-toastify";

const EmployeeHeader = () => {
  const { auth, setAuth } = useContext(AuthContext);
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const { workShifts, workShift, error } = useAppSelector(
    (state) => state.workShiftEpl
  );

  useEffect(() => {
    const today = new Date().toISOString().split("T")[0];
    const data: WorkShiftRequest = { date: today };
    dispatch(getWorkShifts({ data }));
  }, [dispatch]);

  useEffect(() => {
    if (workShifts.length > 0) {
      const nowTime = new Date().toTimeString().split(" ")[0];
      dispatch(getWorkShift({ nowTime }));
    }
  }, [workShifts, dispatch]);

  useEffect(() => {
    toast.error(error);
    if (error) {
      dispatch(clearWorkShiftError());
    }
  }, [dispatch, error]);

  const handleLogout = () => {
    setAuth({
      isAuthenticated: false,
      user: { id: 0, email: "", username: "", role: "" },
    });

    localStorage.clear();
    localStorage.removeItem("persist:root");
    navigate("/employee/login");
  };

  // Ngày hôm nay
  const today = new Date();
  const formattedDate = today.toLocaleDateString("vi-VN", {
    weekday: "long",
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });

  return (
    <header className="bg-[#1e3a8a] text-white flex justify-between items-center px-8 py-4 shadow-lg">
      {/* Logo + Ca làm */}
      <div className="flex items-center gap-6">
        <div className="flex items-center cursor-pointer">
          <img
            src="/img/logo_badminton.jpg"
            alt="Logo"
            className="w-12 h-12 rounded-lg shadow-md mr-3 border border-white/20"
          />
          <h1 className="text-2xl font-bold tracking-wide">B-Hub</h1>
        </div>

        {/* Ca làm */}
        <div className="flex flex-col leading-tight">
          <p className="font-semibold text-gray-100 text-sm">
            Ca: {workShift?.name} ({workShift?.startTime} - {workShift?.endTime}
            )
          </p>
          <p className="text-gray-300 text-xs">{formattedDate}</p>
        </div>
      </div>

      {/* Nav giữa */}
      <nav className="flex items-center gap-1 bg-white/10 rounded-full px-2 py-1 backdrop-blur-sm border border-white/10">
        <NavLink
          to="/employee/home"
          className={({ isActive }) =>
            `flex items-center gap-2 px-4 py-2 rounded-full transition text-sm font-medium
        ${
          isActive
            ? "bg-white text-[#1e3a8a]"
            : "text-gray-100 hover:bg-white/20"
        }`
          }
        >
          <Home className="w-5 h-5" />
          <span>Trang chủ</span>
        </NavLink>

        <NavLink
          to="/employee/bookings"
          className={({ isActive }) =>
            `flex items-center gap-2 px-4 py-2 rounded-full transition text-sm font-medium
        ${
          isActive
            ? "bg-white text-[#1e3a8a]"
            : "text-gray-100 hover:bg-white/20"
        }`
          }
        >
          <Calendar className="w-5 h-5" />
          <span>Lịch đặt sân</span>
        </NavLink>

        <NavLink
          to="/employee/orders"
          className={({ isActive }) =>
            `flex items-center gap-2 px-4 py-2 rounded-full transition text-sm font-medium
        ${
          isActive
            ? "bg-white text-[#1e3a8a]"
            : "text-gray-100 hover:bg-white/20"
        }`
          }
        >
          <Package className="w-5 h-5" />
          <span>Đơn đặt hàng</span>
        </NavLink>
      </nav>

      {/* Profile + Logout */}
      <div className="flex items-center gap-4">
        <NavLink
          to="/employee/profile"
          className="flex items-center gap-2 px-4 py-2 rounded-full 
               bg-white/20 hover:bg-white/30
               transition text-sm font-medium shadow-md"
        >
          <UserPlus className="w-5 h-5" />
          <span className="font-medium">{auth.user.username}</span>
        </NavLink>

        <button
          onClick={handleLogout}
          className="flex items-center gap-2 px-4 py-2 rounded-full 
               bg-red-500 hover:bg-red-600 transition shadow-md text-sm font-medium"
        >
          <LogOut className="w-5 h-5" />
          Logout
        </button>
      </div>
    </header>
  );
};

export default EmployeeHeader;
