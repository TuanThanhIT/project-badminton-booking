import crypto from "crypto";
import axios from "axios";
import ApiError from "../../utils/ApiError.js";
import { StatusCodes } from "http-status-codes";
import { Payment, Order, Booking, PaymentBooking } from "../../models/index.js";
import dotenv from "dotenv";

dotenv.config();

const PARTNER_CODE = process.env.PARTNER_CODE;
const ACCESS_KEY = process.env.ACCESS_KEY;
const SECRET_KEY = process.env.SECRET_KEY;

// URL IPN MoMo gọi về server backend
const IPN_URL = "https://370032c4c32f.ngrok-free.app/user/momo/momo-webhook";

/**
 * Tạo giao dịch thanh toán MoMo
 * - Gửi request đến MoMo để lấy payUrl
 * - MoMo sẽ redirect + webhook IPN
 */
const createPaymentService = async (
  entityId,
  amount,
  orderInfo,
  type = "order"
) => {
  try {
    // URL frontend khi user thanh toán xong (redirect)
    const REDIRECT_URL = `http://localhost:5173/momo-return?type=${type}`;

    const momoOrderId = `${entityId}_${Date.now()}`; // Format chuẩn: {id}_{timestamp}
    const requestId = `${PARTNER_CODE}${Date.now()}`;
    const requestType = "captureWallet";

    /**
     * extraData phải ENCODE base64
     * để MoMo trả lại y nguyên trong webhook
     */
    const extraData = Buffer.from(JSON.stringify({ type })).toString("base64");

    const intAmount = Math.round(amount);

    /**
     * rawSignature tạo theo đúng thứ tự của MoMo
     * KHÔNG ĐƯỢC đổi vị trí tham số
     */

    console.log("===== MOMO DEBUG =====");
    console.log("PARTNER_CODE:", PARTNER_CODE);
    console.log("ACCESS_KEY:", ACCESS_KEY);
    console.log("SECRET_KEY:", SECRET_KEY?.slice(0, 6) + "***");
    console.log("amount:", intAmount);
    console.log("orderInfo:", orderInfo);
    console.log("extraData:", extraData);

    const rawSignature =
      `accessKey=${ACCESS_KEY}&amount=${intAmount}&extraData=${extraData}` +
      `&ipnUrl=${IPN_URL}&orderId=${momoOrderId}&orderInfo=${orderInfo}` +
      `&partnerCode=${PARTNER_CODE}&redirectUrl=${REDIRECT_URL}` +
      `&requestId=${requestId}&requestType=${requestType}`;

    const signature = crypto
      .createHmac("sha256", SECRET_KEY)
      .update(rawSignature)
      .digest("hex");

    // Body gửi đến MoMo
    const body = {
      partnerCode: PARTNER_CODE,
      accessKey: ACCESS_KEY,
      requestId,
      amount: String(intAmount),
      orderId: momoOrderId,
      orderInfo,
      redirectUrl: REDIRECT_URL,
      ipnUrl: IPN_URL,
      extraData, // ⭐ Base64 encoded
      requestType,
      signature,
      lang: "vi",
    };

    // Gọi API MoMo tạo thanh toán
    const momoRes = await axios.post(
      "https://test-payment.momo.vn/v2/gateway/api/create",
      body,
      { headers: { "Content-Type": "application/json" } }
    );
    // ⭐ LOG RESPONSE
    console.log("===== MOMO RESPONSE =====");
    console.log(momoRes.data);

    return momoRes.data;
  } catch (error) {
    console.log("===== MOMO ERROR =====");
    console.log(error?.response?.data || error);
    throw new ApiError(StatusCodes.INTERNAL_SERVER_ERROR, error);
  }
};

/**
 * Xử lý thanh toán thành công (gọi từ webhook)
 * - type = "order" → update bảng Order + Payment
 * - type = "booking" → update bảng Booking + PaymentBooking
 */
const paymentSuccessService = async (
  entityId,
  amount,
  transId,
  type = "order"
) => {
  try {
    if (type === "order") {
      // --- Xử lý đơn hàng ---
      const order = await Order.findByPk(entityId);
      if (!order)
        throw new ApiError(StatusCodes.NOT_FOUND, "Đơn hàng không tồn tại!");

      await order.update({
        orderStatus: "Paid",
        totalAmount: amount,
      });

      const payment = await Payment.findOne({ where: { orderId: entityId } });
      if (!payment)
        throw new ApiError(
          StatusCodes.NOT_FOUND,
          "Thanh toán cho đơn hàng không tồn tại!"
        );

      await payment.update({
        transId,
        paidAt: new Date(),
        paymentAmount: Number(amount),
        paymentStatus: "Success",
      });
    } else if (type === "booking") {
      // --- Xử lý booking ---
      const booking = await Booking.findByPk(entityId);
      if (!booking)
        throw new ApiError(StatusCodes.NOT_FOUND, "Booking không tồn tại!");

      await booking.update({
        bookingStatus: "Paid",
        totalAmount: amount,
      });

      const paymentBooking = await PaymentBooking.findOne({
        where: { bookingId: entityId },
      });

      if (!paymentBooking)
        throw new ApiError(
          StatusCodes.NOT_FOUND,
          "Thanh toán cho booking không tồn tại!"
        );

      await paymentBooking.update({
        transId,
        paidAt: new Date(),
        paymentAmount: Number(amount),
        paymentStatus: "Success",
      });
    }
  } catch (error) {
    if (error instanceof ApiError) throw error;
    throw new ApiError(StatusCodes.INTERNAL_SERVER_ERROR, error);
  }
};

const momoService = {
  createPaymentService,
  paymentSuccessService,
};

export default momoService;
