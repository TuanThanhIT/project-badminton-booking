import { NavLink, useNavigate } from "react-router-dom";
import { LogOut, Sun, Moon, BellRing, User, Search } from "lucide-react";
import { useContext, useEffect, useState } from "react";
import { AuthContext } from "../../contexts/authContext";
import { useAppDispatch, useAppSelector } from "../../../store/hook";
import { toast } from "react-toastify";
import { useRealtime } from "../../../hooks/useRealtime";
import {
  addLocalNotification,
  clearNotificationError,
  getNotifications,
  updateAllLocalNotification,
  updateAllNotification,
  updateLocalNotification,
  updateNotification,
} from "../../../store/slices/admin/notificationSlice";

const ThemeToggle = () => {
  const [darkMode, setDarkMode] = useState(false);
  return (
    <button
      onClick={() => setDarkMode(!darkMode)}
      className={`relative w-12 h-6 flex items-center rounded-full p-1 border transition-colors
        ${
          darkMode
            ? "bg-gray-700 border-gray-600"
            : "bg-gray-200 border-gray-300"
        }`}
    >
      <span
        className={`absolute flex items-center justify-center w-5 h-5 rounded-full transition-transform duration-300
          ${darkMode ? "translate-x-6 bg-gray-900" : "translate-x-0 bg-white"}`}
      >
        {darkMode ? (
          <Moon size={13} className="text-white" />
        ) : (
          <Sun size={13} className="text-yellow-500" />
        )}
      </span>
    </button>
  );
};

const Header = () => {
  const navigate = useNavigate();
  const { auth, setAuth } = useContext(AuthContext);
  const dispatch = useAppDispatch();
  const [isOpen, setIsOpen] = useState(false);
  const [notificationId, setNotificationId] = useState(0);

  const notifications = useAppSelector(
    (state) => state.notificationAdm.notifications
  );
  const notificationError = useAppSelector(
    (state) => state.notificationAdm.error
  );
  const token = localStorage.getItem("access_token");
  const { notification } = useRealtime(token ?? "");
  const unreadCount = notifications.filter((n) => !n.isRead).length;

  const toggleNotifications = () => setIsOpen(!isOpen);

  useEffect(() => {
    dispatch(getNotifications());
  }, [dispatch]);

  useEffect(() => {
    if (!notification) return;
    dispatch(addLocalNotification({ notification }));
  }, [dispatch, notification]);

  useEffect(() => {
    if (notificationError) {
      toast.error(notificationError);
      const data = { notificationId };
      dispatch(updateLocalNotification(data));
      dispatch(clearNotificationError());
    }
  }, [dispatch, notificationError, notificationId]);

  const markRead = async (id: number) => {
    try {
      setNotificationId(id);
      const data = { notificationId: id };
      dispatch(updateLocalNotification(data));
      const res = await dispatch(updateNotification({ data })).unwrap();
      toast.success(res.message);
    } catch {
      // ignore
    }
  };

  const markReadAll = async () => {
    try {
      dispatch(updateAllLocalNotification());
      const res = await dispatch(updateAllNotification()).unwrap();
      toast.success(res.message);
    } catch {
      // ignore
    }
  };

  const handleLogout = () => {
    setAuth({
      isAuthenticated: false,
      user: { id: 0, email: "", username: "", role: "" },
    });
    localStorage.clear();
    navigate("/admin/login");
  };

  return (
    <header className="sticky top-0 z-40 flex items-center justify-between px-6 h-20 bg-white text-gray-800 border-b border-gray-300">
      <div className="flex items-center w-full max-w-md">
        <div className="flex items-center w-full px-4 py-2.5 bg-white border border-gray-300 rounded-xl shadow-sm transition-all focus-within:border-sky-400 focus-within:ring-2 focus-within:ring-sky-300">
          <Search className="w-5 h-5 text-gray-400 mr-3" />
          <input
            type="text"
            placeholder="Tìm kiếm nhanh..."
            className="flex-1 bg-transparent outline-none text-sm text-gray-700 placeholder-gray-400"
          />
        </div>
      </div>

      <nav className="flex items-center gap-4">
        {/* Notification */}
        <div className="relative">
          <button
            onClick={toggleNotifications}
            className="relative p-2 rounded-xl text-gray-800 hover:text-sky-600 hover:bg-sky-50 transition"
          >
            <BellRing className="w-5 h-5" />
            {unreadCount > 0 && (
              <span className="absolute top-0 right-0 w-3 h-3 bg-red-500 rounded-full animate-pulse" />
            )}
          </button>

          {isOpen && (
            <div className="absolute right-0 mt-2 w-80 bg-white shadow-xl rounded-xl overflow-hidden z-50 border border-gray-200">
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
                      onClick={isUnread ? () => markRead(n.id) : undefined}
                      className={`flex flex-col gap-1 px-4 py-3 transition group relative border-b border-gray-300 ${
                        isUnread
                          ? "cursor-pointer bg-sky-50 hover:bg-sky-100"
                          : "cursor-default bg-white"
                      }`}
                    >
                      {isUnread && (
                        <div className="absolute left-4 top-1/2 -translate-y-1/2 w-2 h-2 bg-blue-600 rounded-full animate-pulse" />
                      )}
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
          to="/admin/profile"
          className="flex items-center gap-2 px-3 py-2 rounded-xl text-gray-800 font-medium hover:bg-sky-50 hover:text-sky-600 transition"
        >
          <User className="w-5 h-5" />
          <span className="hidden sm:block">{auth.user.username}</span>
        </NavLink>

        <div className="w-px h-6 bg-gray-300" />
        <ThemeToggle />
        <div className="w-px h-6 bg-gray-300" />

        <button
          onClick={handleLogout}
          className="flex items-center gap-2 px-3 py-2 rounded-xl text-gray-800 font-medium hover:bg-red-50 hover:text-red-600 transition"
        >
          <LogOut className="w-5 h-5" />
          <span className="hidden sm:block">Đăng xuất</span>
        </button>
      </nav>
    </header>
  );
};

export default Header;
