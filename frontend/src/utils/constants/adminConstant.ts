export const ROLE_TAG: Record<string, { color: string; label: string }> = {
  ADMIN:    { color: "bg-red-100 text-red-700 border-red-200",          label: "Quản trị viên" },
  MANAGER:  { color: "bg-blue-100 text-blue-700 border-blue-200",       label: "Quản lý" },
  EMPLOYEE: { color: "bg-orange-100 text-orange-700 border-orange-200", label: "Nhân viên" },
  USER:     { color: "bg-green-100 text-green-700 border-green-200",    label: "Người dùng" },
  COACH:    { color: "bg-yellow-100 text-yellow-700 border-yellow-200", label: "Dạy cầu lông" },
};

export const ROLE_OPTIONS = [
  { label: "Tất cả",     value: "" },
  { label: "Người dùng", value: "USER" },
  { label: "Dạy cầu lông", value: "COACH" },
  { label: "Quản lý",    value: "MANAGER" },
  { label: "Nhân viên",  value: "EMPLOYEE" },
];

export const GENDER_LABEL: Record<string, string> = {
  male: "Nam", female: "Nữ", other: "Khác",
};

export const ORDER_STATUS_CONFIG: Record<string, { label: string; color: string }> = {
  PENDING:       { label: "Chờ xác nhận",  color: "bg-yellow-50 text-yellow-700 border-yellow-200" },
  CONFIRMED:     { label: "Đã xác nhận",   color: "bg-blue-50 text-blue-700 border-blue-200" },
  PREPARING:     { label: "Đang chuẩn bị", color: "bg-purple-50 text-purple-700 border-purple-200" },
  READY_TO_SHIP: { label: "Sẵn sàng giao", color: "bg-indigo-50 text-indigo-700 border-indigo-200" },
  SHIPPING:      { label: "Đang giao",     color: "bg-sky-50 text-sky-700 border-sky-200" },
  COMPLETED:     { label: "Hoàn thành",    color: "bg-green-50 text-green-700 border-green-200" },
  CANCELLED:     { label: "Đã hủy",        color: "bg-red-50 text-red-600 border-red-200" },
};

export const BOOKING_STATUS_CONFIG: Record<string, { label: string; color: string }> = {
  PENDING:   { label: "Chờ xác nhận",  color: "bg-yellow-50 text-yellow-700 border-yellow-200" },
  CONFIRMED: { label: "Đã xác nhận",   color: "bg-blue-50 text-blue-700 border-blue-200" },
  PAID:      { label: "Đã thanh toán", color: "bg-green-50 text-green-700 border-green-200" },
  COMPLETED: { label: "Hoàn thành",    color: "bg-emerald-50 text-emerald-700 border-emerald-200" },
  CANCELLED: { label: "Đã hủy",        color: "bg-red-50 text-red-600 border-red-200" },
};

import { ArrowUpCircle, ArrowDownCircle, RefreshCw, CreditCard } from "lucide-react";

export const TX_TYPE_CONFIG: Record<string, { label: string; color: string; icon: typeof CreditCard }> = {
  DEPOSIT:  { label: "Nạp tiền",   color: "text-green-600 bg-green-50 border-green-200",    icon: ArrowUpCircle },
  PAYMENT:  { label: "Thanh toán", color: "text-red-600 bg-red-50 border-red-200",          icon: ArrowDownCircle },
  REFUND:   { label: "Hoàn tiền",  color: "text-blue-600 bg-blue-50 border-blue-200",       icon: RefreshCw },
  WITHDRAW: { label: "Rút tiền",   color: "text-orange-600 bg-orange-50 border-orange-200", icon: ArrowDownCircle },
};

export const TX_STATUS_CONFIG: Record<string, { label: string; color: string }> = {
  PENDING:   { label: "Chờ xử lý",  color: "bg-yellow-50 text-yellow-700 border-yellow-200" },
  SUCCESS:   { label: "Thành công", color: "bg-green-50 text-green-700 border-green-200" },
  FAILED:    { label: "Thất bại",   color: "bg-red-50 text-red-600 border-red-200" },
  CANCELLED: { label: "Đã hủy",    color: "bg-gray-50 text-gray-500 border-gray-200" },
};

export const WITHDRAW_STATUS_CONFIG: Record<string, { label: string; color: string }> = {
  PENDING:   { label: "Chờ OTP",     color: "bg-orange-50 text-orange-700 border-orange-200" },
  CONFIRMED: { label: "Đã xác nhận", color: "bg-blue-50 text-blue-700 border-blue-200" },
  SUCCESS:   { label: "Hoàn thành",  color: "bg-green-50 text-green-700 border-green-200" },
  FAILED:    { label: "Từ chối",     color: "bg-red-50 text-red-600 border-red-200" },
  CANCELLED: { label: "Đã hủy",     color: "bg-gray-50 text-gray-500 border-gray-200" },
};

export const fmtCurrency = (n: number) => n.toLocaleString("vi-VN") + "đ";
export const fmtDate = (s: string) => new Date(s).toLocaleDateString("vi-VN");
