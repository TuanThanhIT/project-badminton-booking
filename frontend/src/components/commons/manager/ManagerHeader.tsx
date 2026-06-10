import { useEffect, useRef, useState } from "react";
import { Bell, CheckCheck, MessageCircle, Search } from "lucide-react";
import { useNavigate } from "react-router-dom";

import { useAppDispatch, useAppSelector } from "../../../redux/hook";
import {
  getNotifications,
  markAllNotificationsRead,
  markNotificationRead,
} from "../../../redux/slices/user/notificationSlice";
import { getManagerConversations } from "../../../redux/slices/manager/conversationSlice";

const ManagerHeader = () => {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const notificationRef = useRef<HTMLDivElement | null>(null);

  const { user, accessToken } = useAppSelector((state) => state.auth);
  const { branch } = useAppSelector((state) => state.managerBranch);
  const {
    notifications,
    unreadCount,
    loading: notificationLoading,
  } = useAppSelector((state) => state.notification);
  const unreadMessages = useAppSelector((state) =>
    state.managerConversation.conversations.reduce(
      (sum, conversation) => sum + (conversation.unreadCount || 0),
      0,
    ),
  );

  const [isNotificationOpen, setIsNotificationOpen] = useState(false);

  useEffect(() => {
    if (!accessToken) return;
    dispatch(getNotifications({ data: { page: 1, limit: 8 } }));
    dispatch(getManagerConversations());
  }, [dispatch, accessToken]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        notificationRef.current &&
        !notificationRef.current.contains(event.target as Node)
      ) {
        setIsNotificationOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleOpenNotifications = () => {
    setIsNotificationOpen((prev) => !prev);
    if (!isNotificationOpen && accessToken) {
      dispatch(getNotifications({ data: { page: 1, limit: 8 } }));
    }
  };

  const handleMarkRead = (notificationId: number) => {
    dispatch(markNotificationRead({ notificationId }));
  };

  const handleMarkAllRead = () => {
    if (!unreadCount) return;
    dispatch(markAllNotificationsRead());
  };

  const displayName = user?.username || "Manager";
  const initial = displayName.charAt(0).toUpperCase();
  const branchName = branch?.branchName || "Quản lý cửa hàng";

  return (
    <header className="flex h-20 shrink-0 items-center justify-between border-b border-slate-200 bg-white px-4 sm:px-6 lg:px-8">
      <div className="min-w-0">
        <h2 className="truncate text-xl font-semibold text-slate-800">
          Quản lý cửa hàng
        </h2>
        <p className="mt-1 hidden text-sm font-normal text-slate-500 sm:block">
          Theo dõi hoạt động chi nhánh B-Hub trong ngày
        </p>
      </div>

      <div className="flex items-center gap-3">
        <div className="relative hidden xl:block">
          <Search className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Tìm kiếm..."
            className="h-11 w-[420px] rounded-xl border border-slate-200 bg-white pl-11 pr-3 text-sm text-slate-700 outline-none transition placeholder:text-slate-400 focus:border-sky-400 focus:ring-2 focus:ring-sky-100 2xl:w-[520px]"
          />
        </div>

        <button
          type="button"
          onClick={() => navigate("/manager/messages")}
          className="relative flex h-12 w-12 items-center justify-center rounded-2xl border border-slate-200 bg-white transition hover:border-sky-200 hover:bg-sky-50"
          title="Tin nhắn"
        >
          <MessageCircle className="h-5 w-5 text-sky-700" />
          {unreadMessages > 0 && (
            <span className="absolute -right-1.5 -top-1.5 flex h-5 min-w-5 items-center justify-center rounded-full bg-orange-400 px-1 text-[10px] font-semibold text-white">
              {unreadMessages > 99 ? "99+" : unreadMessages}
            </span>
          )}
        </button>

        <div ref={notificationRef} className="relative">
          <button
            type="button"
            onClick={handleOpenNotifications}
            className={`relative flex h-12 w-12 items-center justify-center rounded-2xl border bg-white transition ${
              isNotificationOpen
                ? "border-sky-200 bg-sky-50"
                : "border-slate-200 hover:border-sky-200 hover:bg-sky-50"
            }`}
            title="Thông báo"
          >
            <Bell className="h-5 w-5 text-sky-700" />
            {unreadCount > 0 && (
              <span className="absolute -right-1.5 -top-1.5 flex h-5 min-w-5 items-center justify-center rounded-full bg-orange-400 px-1 text-[10px] font-semibold text-white">
                {unreadCount > 99 ? "99+" : unreadCount}
              </span>
            )}
          </button>

          {isNotificationOpen && (
            <div className="absolute right-0 top-14 z-50 w-[min(92vw,420px)] overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-lg">
              <div className="flex items-center justify-between border-b border-slate-100 p-4">
                <div>
                  <p className="text-base font-semibold text-slate-900">
                    Thông báo
                  </p>
                  <p className="text-xs text-slate-500">
                    {unreadCount > 0
                      ? `${unreadCount} thông báo chưa đọc`
                      : "Tất cả đã đọc"}
                  </p>
                </div>
                <button
                  type="button"
                  onClick={handleMarkAllRead}
                  disabled={!unreadCount}
                  className="inline-flex items-center gap-1.5 rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-xs font-medium text-slate-600 transition hover:border-sky-200 hover:bg-sky-50 hover:text-sky-700 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  <CheckCheck size={14} />
                  Đọc tất cả
                </button>
              </div>

              <div className="max-h-[420px] overflow-y-auto p-2">
                {notificationLoading ? (
                  <div className="p-8 text-center text-sm text-slate-500">
                    Đang tải thông báo...
                  </div>
                ) : notifications.length === 0 ? (
                  <div className="p-8 text-center">
                    <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-2xl bg-sky-50 text-sky-600">
                      <Bell size={22} />
                    </div>
                    <p className="font-medium text-slate-800">
                      Chưa có thông báo
                    </p>
                    <p className="mt-1 text-sm text-slate-500">
                      Đơn hàng, lịch sân và tồn kho của chi nhánh sẽ hiển thị
                      tại đây.
                    </p>
                  </div>
                ) : (
                  notifications.map((notification) => (
                    <button
                      key={notification.id}
                      type="button"
                      onClick={() => handleMarkRead(notification.id)}
                      className={`mb-1 w-full rounded-xl p-3 text-left transition ${
                        notification.isRead
                          ? "hover:bg-slate-50"
                          : "bg-sky-50/80 hover:bg-sky-100"
                      }`}
                    >
                      <div className="flex gap-3">
                        <span
                          className={`mt-1 h-2.5 w-2.5 shrink-0 rounded-full ${
                            notification.isRead ? "bg-slate-300" : "bg-sky-500"
                          }`}
                        />
                        <div className="min-w-0 flex-1">
                          <div className="flex items-start justify-between gap-3">
                            <p className="line-clamp-1 font-semibold text-slate-900">
                              {notification.title}
                            </p>
                            {!notification.isRead && (
                              <span className="shrink-0 rounded-full bg-white px-2 py-1 text-[10px] font-semibold text-sky-700 ring-1 ring-sky-100">
                                Mới
                              </span>
                            )}
                          </div>
                          <p className="mt-1 line-clamp-2 text-sm leading-5 text-slate-600">
                            {notification.message}
                          </p>
                          <p className="mt-2 text-xs text-slate-400">
                            {new Date(notification.createdAt).toLocaleString(
                              "vi-VN",
                            )}
                          </p>
                        </div>
                      </div>
                    </button>
                  ))
                )}
              </div>
            </div>
          )}
        </div>

        <div className="hidden h-12 min-w-[210px] items-center gap-3 rounded-2xl border border-slate-200 bg-white px-3 lg:flex">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-sky-600 font-semibold text-white">
            {initial}
          </div>

          <div className="min-w-0 flex-1">
            <p className="truncate text-sm font-semibold leading-5 text-slate-900">
              {displayName}
            </p>
            <p
              className="truncate text-xs font-medium leading-4 text-sky-700"
              title={branchName}
            >
              {branchName}
            </p>
          </div>
        </div>
      </div>
    </header>
  );
};

export default ManagerHeader;
