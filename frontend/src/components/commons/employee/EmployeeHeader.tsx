import { useContext, useEffect, useState } from "react";
import { Calendar, Home, LogOutIcon, Package, UserPlus } from "lucide-react";
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
import Swal from "sweetalert2";
import { useRealtime } from "../../../hooks/useRealtime";
import {
  addLocalNotification,
  clearNotificationError,
  getNotifications,
  updateAllLocalNotification,
  updateAllNotification,
  updateLocalNotification,
  updateNotification,
} from "../../../store/slices/employee/notificationSlice";

const EmployeeHeader = () => {
  const { auth } = useContext(AuthContext);
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const [isOpen, setIsOpen] = useState(false);
  const [notificationId, setNotificationId] = useState(0);

  const workShift = useAppSelector((state) => state.workShiftEpl.workShift);
  const workShifts = useAppSelector((state) => state.workShiftEpl.workShifts);
  const workShiftError = useAppSelector((state) => state.workShiftEpl.error);
  const notifications = useAppSelector(
    (state) => state.notificationEpl.notifications
  );
  const notificationError = useAppSelector(
    (state) => state.notificationEpl.error
  );

  const token = localStorage.getItem("access_token");
  const { notification } = useRealtime(token ?? "");
  const unreadCount = notifications.filter((n) => !n.isRead).length;

  // Hàm toggle hiển thị popup
  const toggleNotifications = () => setIsOpen(!isOpen);

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
    const error = workShiftError || notificationError;
    if (error) {
      toast.error(error);
      if (workShiftError) {
        dispatch(clearWorkShiftError());
      }
      if (notificationError) {
        const data = { notificationId };
        dispatch(updateLocalNotification(data));
        dispatch(clearNotificationError());
      }
    }
  }, [dispatch, workShiftError, notificationError, notificationId]);

  useEffect(() => {
    dispatch(getNotifications());
  }, [dispatch]);

  useEffect(() => {
    if (!notification) return;
    dispatch(addLocalNotification({ notification }));
  }, [dispatch, notification]);

  // Ngày hôm nay
  const today = new Date();
  const formattedDate = today.toLocaleDateString("vi-VN", {
    weekday: "long",
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });

  const handleCheckOut = async () => {
    const result = await Swal.fire({
      title: "Xác nhận Checkout",
      text: "Bạn có chắc chắn muốn checkout ca làm không?",
      icon: "question",
      showCancelButton: true,
      confirmButtonText: "Chắc chắn",
      cancelButtonText: "Hủy",
    });

    if (result.isConfirmed) {
      navigate("/employee/check-out");
    }
  };

  const markRead = async (notificationId: number) => {
    try {
      setNotificationId(notificationId);
      const data = { notificationId };
      dispatch(updateLocalNotification(data));
      const res = await dispatch(updateNotification({ data })).unwrap();
      toast.success(res.message);
    } catch {
      // không xử lý lỗi ở đây
    }
  };

  const markReadAll = async () => {
    try {
      dispatch(updateAllLocalNotification());
      const res = await dispatch(updateAllNotification()).unwrap();
      toast.success(res.message);
    } catch {
      // không xử lý lỗi ở đây
    }
  };

  return (
    <header className="bg-sky-900 text-white flex justify-between items-center px-8 py-8 shadow-lg">
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
        {/* Notification Icon + Popup */}
        <div className="relative">
          <button
            onClick={toggleNotifications}
            className="relative p-2 rounded-full hover:bg-white/20 transition"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-6 w-6"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={2}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C8.67 6.165 7 8.388 7 11v3.159c0 .538-.214 1.055-.595 1.436L5 17h5m0 0v1a3 3 0 006 0v-1m-6 0h6"
              />
            </svg>

            {unreadCount > 0 && (
              <span className="absolute -top-1 right-1 bg-red-500 text-white text-xs w-5 h-5 rounded-full flex items-center justify-center shadow-md">
                {unreadCount}
              </span>
            )}
          </button>

          {/* Popup thông báo */}
          {isOpen && (
            <div className="absolute -right-20 mt-2 w-80 bg-white shadow-xl rounded-xl overflow-hidden z-50 border border-gray-200">
              <div className="flex justify-between items-center px-4 py-2 border-b border-gray-300">
                <p className="font-medium text-gray-700">Thông báo</p>
                <button
                  onClick={markReadAll}
                  className="text-xs text-blue-600 hover:underline"
                >
                  Đánh dấu tất cả đã đọc
                </button>
              </div>
              <div className="max-h-60 overflow-y-auto">
                {notifications.length === 0 && (
                  <p className="p-4 text-gray-500 text-sm text-center">
                    Không có thông báo
                  </p>
                )}
                {notifications.map((n, idx) => {
                  const isUnread = !n.isRead;

                  return (
                    <div
                      key={idx}
                      onClick={isUnread ? () => markRead(n.id) : undefined} // ❌ Đã đọc thì không cho bấm
                      className={`
        flex flex-col gap-1 px-4 py-3 transition group relative border-b border-gray-300
        ${
          isUnread
            ? "cursor-pointer bg-sky-50 hover:bg-sky-100"
            : "cursor-default bg-white"
        }
      `}
                    >
                      {/* Chấm xanh nếu chưa đọc */}
                      {isUnread && (
                        <div className="absolute left-4 top-1/2 -translate-y-1/2">
                          <div className="w-2 h-2 bg-blue-600 rounded-full animate-pulse"></div>
                        </div>
                      )}

                      {/* Dấu check nếu đã đọc */}
                      {!isUnread && (
                        <div className="absolute right-4 top-1/2 -translate-y-1/2 text-green-600">
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            className="h-4 w-4"
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                            strokeWidth={3}
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              d="M5 13l4 4L19 7"
                            />
                          </svg>
                        </div>
                      )}

                      <div className={isUnread ? "ml-4" : "ml-0"}>
                        <p className="text-sm font-semibold text-gray-800 group-hover:text-blue-600">
                          {n.title || "Thông báo"}
                        </p>
                        <p className="text-xs text-gray-600">{n.message}</p>
                        <span className="text-xs text-gray-400">
                          {new Date(n.createdDate).toLocaleString("vi-VN", {
                            weekday: "short",
                            day: "2-digit",
                            month: "2-digit",
                            year: "numeric",
                            hour: "2-digit",
                            minute: "2-digit",
                          })}
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>

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
          onClick={handleCheckOut}
          className={
            "flex items-center gap-2 px-4 py-2 rounded-full transition shadow-md text-sm font-medium bg-green-500 hover:bg-green-700 text-white"
          }
        >
          <LogOutIcon className="w-5 h-5" />
          Checkout
        </button>
      </div>
    </header>
  );
};

export default EmployeeHeader;
