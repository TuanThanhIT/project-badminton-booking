import { CheckCircle, XCircle, ArrowLeft } from "lucide-react";
import { useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import type { WalletCallbackRequest } from "../../types/wallet";
import { useAppDispatch } from "../../redux/hook";
import { walletCallback } from "../../redux/slices/user/walletSlice";
import { toast } from "react-toastify";

const WalletDepositResult = () => {
  const dispatch = useAppDispatch();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  // 👉 Lấy params từ URL
  const vnp_Amount = searchParams.get("vnp_Amount") ?? "";
  const vnp_BankCode = searchParams.get("vnp_BankCode") ?? "";
  const vnp_ResponseCode = searchParams.get("vnp_ResponseCode") ?? "";
  const vnp_TransactionStatus = searchParams.get("vnp_TransactionStatus") ?? "";
  const vnp_TxnRef = searchParams.get("vnp_TxnRef") ?? "";
  const vnp_SecureHash = searchParams.get("vnp_SecureHash") ?? "";
  const vnp_TransactionNo = searchParams.get("vnp_TransactionNo") ?? "";
  const vnp_OrderInfo = searchParams.get("vnp_OrderInfo") ?? "";
  const vnp_PayDate = searchParams.get("vnp_PayDate") ?? "";
  const vnp_TmnCode = searchParams.get("vnp_TmnCode") ?? "";
  const vnp_BankTranNo = searchParams.get("vnp_BankTranNo") ?? "";
  const vnp_CardType = searchParams.get("vnp_CardType") ?? "";

  // 👉 check params cơ bản
  const hasValidParams = vnp_TxnRef && vnp_Amount && vnp_ResponseCode;
  const amount = Number(vnp_Amount) / 100;

  // 👉 xác định trạng thái giao dịch
  const isSuccess =
    hasValidParams &&
    vnp_ResponseCode === "00" &&
    vnp_TransactionStatus === "00";

  useEffect(() => {
    if (!hasValidParams) return;

    const key = `vnpay_${vnp_TxnRef}`;

    // ✅ chỉ call API khi SUCCESS và chưa call lần nào
    if (isSuccess && !sessionStorage.getItem(key)) {
      sessionStorage.setItem(key, "done");

      const payload: WalletCallbackRequest = {
        vnp_Amount,
        vnp_BankCode,
        vnp_BankTranNo,
        vnp_CardType,
        vnp_OrderInfo,
        vnp_PayDate,
        vnp_ResponseCode,
        vnp_TmnCode,
        vnp_TransactionNo,
        vnp_TransactionStatus,
        vnp_TxnRef,
        vnp_SecureHash,
      };

      dispatch(walletCallback({ data: payload }))
        .unwrap()
        .then(() => toast.success("Nạp tiền vào ví thành công"))
        .catch(() => toast.error("Lỗi khi cập nhật ví"));
    }

    // ❌ nếu fail → show toast (chỉ show 1 lần)
    if (!isSuccess && !sessionStorage.getItem(key)) {
      sessionStorage.setItem(key, "done");
      toast.error(
        hasValidParams
          ? "Thanh toán thất bại hoặc bị hủy"
          : "Không có dữ liệu giao dịch",
      );
    }
  }, [vnp_TxnRef, hasValidParams]);

  // 👉 Background gradient theo trạng thái
  const containerBg = hasValidParams
    ? isSuccess
      ? "bg-gradient-to-br from-green-50 via-white to-green-100"
      : "bg-gradient-to-br from-red-50 via-white to-red-100"
    : "bg-gradient-to-br from-gray-50 via-white to-gray-100";

  // Icon trạng thái
  const StatusIcon = hasValidParams
    ? isSuccess
      ? CheckCircle
      : XCircle
    : XCircle;

  // Text trạng thái
  const statusTitle = hasValidParams
    ? isSuccess
      ? "Nạp tiền thành công"
      : "Thanh toán thất bại"
    : "Không có dữ liệu giao dịch";

  const statusDesc = hasValidParams
    ? isSuccess
      ? "Giao dịch đã được xử lý thành công"
      : "Giao dịch không thành công hoặc đã bị hủy"
    : "Vui lòng kiểm tra lại đường dẫn hoặc giao dịch";

  const statusColor = hasValidParams
    ? isSuccess
      ? "text-green-600"
      : "text-red-500"
    : "text-gray-400";

  return (
    <div className="flex justify-center items-center my-10 px-4">
      <div
        className={`rounded-3xl border border-gray-300 w-full max-w-5xl p-12 flex flex-col justify-between ${containerBg}`}
      >
        {/* TOP */}
        <div>
          <div className="flex items-center gap-10 mb-10">
            <StatusIcon className={`w-24 h-24 shrink-0 ${statusColor}`} />
            <div>
              <h2 className="text-4xl font-bold text-gray-800">
                {statusTitle}
              </h2>
              <p className="text-gray-600 text-lg mt-2">{statusDesc}</p>
            </div>
          </div>

          {/* INFO GRID */}
          <div
            className={`grid grid-cols-3 gap-6 p-6 rounded-xl ${
              hasValidParams
                ? isSuccess
                  ? "bg-gradient-to-br from-green-50 via-white to-green-100"
                  : "bg-gradient-to-br from-red-50 via-white to-red-100"
                : "bg-gradient-to-br from-gray-50 via-white to-gray-100"
            }`}
          >
            <div>
              <p className="text-sm text-gray-500">Số tiền</p>
              <p className="text-lg font-semibold text-gray-800">
                {vnp_Amount && hasValidParams
                  ? amount.toLocaleString() + " VND"
                  : "--"}
              </p>
            </div>

            <div>
              <p className="text-sm text-gray-500">Ngân hàng</p>
              <p className="text-lg font-semibold text-gray-800">
                {vnp_BankCode && hasValidParams ? vnp_BankCode : "VNPay"}
              </p>
            </div>

            <div>
              <p className="text-sm text-gray-500">Mã giao dịch</p>
              <p className="text-lg font-semibold text-gray-800 truncate">
                {vnp_TxnRef && hasValidParams ? vnp_TxnRef : "--"}
              </p>
            </div>

            <div>
              <p className="text-sm text-gray-500">Trạng thái</p>
              <p className={`text-lg font-semibold ${statusColor}`}>
                {hasValidParams
                  ? isSuccess
                    ? "Thành công"
                    : "Thất bại"
                  : "Không có dữ liệu"}
              </p>
            </div>

            <div>
              <p className="text-sm text-gray-500">Mã giao dịch nội bộ</p>
              <p className="text-lg font-semibold text-gray-800">
                {vnp_TransactionNo || "--"}
              </p>
            </div>

            <div>
              <p className="text-sm text-gray-500">Thông tin đơn hàng</p>
              <p className="text-lg font-semibold text-gray-800 truncate">
                {vnp_OrderInfo || "--"}
              </p>
            </div>

            <div>
              <p className="text-sm text-gray-500">Ngày thanh toán</p>
              <p className="text-lg font-semibold text-gray-800">
                {vnp_PayDate || "--"}
              </p>
            </div>

            <div>
              <p className="text-sm text-gray-500">Mã điểm thanh toán</p>
              <p className="text-lg font-semibold text-gray-800">
                {vnp_TmnCode || "--"}
              </p>
            </div>

            <div>
              <p className="text-sm text-gray-500">Mã giao dịch ngân hàng</p>
              <p className="text-lg font-semibold text-gray-800">
                {vnp_BankTranNo || "--"}
              </p>
            </div>

            <div>
              <p className="text-sm text-gray-500">Loại thẻ</p>
              <p className="text-lg font-semibold text-gray-800">
                {vnp_CardType || "--"}
              </p>
            </div>
          </div>
        </div>

        {/* ACTION */}
        <div className="flex justify-end mt-10">
          <button
            onClick={() => navigate("/wallet")}
            className="flex items-center gap-3 px-6 py-3 rounded-xl bg-blue-500 hover:bg-blue-600 text-white font-semibold transition"
          >
            <ArrowLeft className="w-6 h-6" />
            Quay lại ví
          </button>
        </div>
      </div>
    </div>
  );
};

export default WalletDepositResult;
