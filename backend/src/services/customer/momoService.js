import crypto from "crypto";
import axios from "axios";
import ApiError from "../../utils/ApiError.js";
import { StatusCodes } from "http-status-codes";
import Payment from "../../models/payment.js";
import Order from "../../models/order.js";

const PARTNER_CODE = process.env.PARTNER_CODE; // Mã merchant do MoMo cấp, xác định cửa hàng/ứng dụng
const ACCESS_KEY = process.env.ACCESS_KEY; // Public key, tham gia tạo chữ ký để MoMo xác nhận request
const SECRET_KEY = process.env.SECRET_KEY; // Private key, dùng tạo HMAC SHA256, bảo đảm request không bị giả mạo
const REDIRECT_URL = "http://localhost:5173/orders/momo-return"; // URL redirect khách sau thanh toán
const IPN_URL = "https://c39148f0d6ba.ngrok-free.app/user/momo/momo-webhook"; // URL backend nhận thông báo thanh toán từ MoMo (server-to-server)

const createPaymentService = async (orderId, amount, orderInfo) => {
  try {
    // Tạo orderId riêng cho MoMo bằng cách ghép order gốc + timestamp
    const momoOrderId = `${orderId}_${Date.now()}`;
    // Tạo requestId duy nhất
    const requestId = PARTNER_CODE + Date.now();
    const requestType = "captureWallet"; // Loại thanh toán ví MoMo
    const extraData = "";

    // Chuyển amount sang số nguyên (MoMo yêu cầu)
    const intAmount = Math.round(amount);

    // Tạo chuỗi rawSignature để ký HMAC SHA256
    const rawSignature =
      `accessKey=${ACCESS_KEY}&amount=${intAmount}&extraData=${extraData}` +
      `&ipnUrl=${IPN_URL}&orderId=${momoOrderId}&orderInfo=${orderInfo}` +
      `&partnerCode=${PARTNER_CODE}&redirectUrl=${REDIRECT_URL}` +
      `&requestId=${requestId}&requestType=${requestType}`;

    // Tạo chữ ký HMAC SHA256 với SECRET_KEY
    const signature = crypto
      .createHmac("sha256", SECRET_KEY)
      .update(rawSignature)
      .digest("hex");

    // Payload JSON gửi lên MoMo
    const body = {
      partnerCode: PARTNER_CODE,
      accessKey: ACCESS_KEY,
      requestId,
      amount: String(intAmount),
      orderId: momoOrderId,
      orderInfo,
      redirectUrl: REDIRECT_URL,
      ipnUrl: IPN_URL,
      extraData,
      requestType,
      signature,
      lang: "vi",
    };

    // Gửi request tạo payment lên MoMo và nhận kết quả
    const momoRes = await axios.post(
      "https://test-payment.momo.vn/v2/gateway/api/create",
      body,
      { headers: { "Content-Type": "application/json" } }
    );

    return momoRes.data; // Trả về dữ liệu MoMo, có payUrl để redirect khách
  } catch (error) {
    throw new ApiError(StatusCodes.INTERNAL_SERVER_ERROR, error);
  }
};

const paymentSuccessService = async (orderId, amount, transId) => {
  try {
    const order = await Order.findByPk(orderId);
    if (!order) {
      throw new ApiError(StatusCodes.NOT_FOUND, "Đơn hàng không tồn tại!");
    }
    await order.update({ orderStatus: "Paid", totalAmount: amount });

    const payment = await Payment.findOne({ where: { orderId } });
    if (!payment) {
      throw new ApiError(
        StatusCodes.NOT_FOUND,
        "Thanh toán cho đơn hàng không tồn tại!"
      );
    }

    const paidAt = new Date();

    await payment.update({
      transId,
      paidAt,
      paymentAmount: Number(amount),
      paymentStatus: "Success",
    });
  } catch (error) {
    if (error instanceof ApiError) {
      throw error;
    }
    throw new ApiError(StatusCodes.INTERNAL_SERVER_ERROR, error);
  }
};

const momoService = {
  createPaymentService,
  paymentSuccessService,
};

export default momoService;
