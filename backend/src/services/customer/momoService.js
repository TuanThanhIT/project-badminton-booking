import crypto from "crypto";
import axios from "axios";
import { Payment, Order, Booking, PaymentBooking } from "../../models/index.js";
import dotenv from "dotenv";
import sequelize from "../../config/db.js";

dotenv.config();

const PARTNER_CODE = process.env.PARTNER_CODE;
const ACCESS_KEY = process.env.ACCESS_KEY;
const SECRET_KEY = process.env.SECRET_KEY;

// URL IPN MoMo gọi về server backend
const IPN_URL = "https://34cfb6aa80bb.ngrok-free.app/user/momo/momo-webhook";

/**
 * Tạo giao dịch thanh toán MoMo
 * - Gửi request đến MoMo để lấy payUrl
 * - MoMo sẽ redirect + webhook IPN
 */
const createPaymentService = async (data) => {
  const { entityId, amount, orderInfo, type = "order" } = data;
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
    extraData,
    requestType,
    signature,
    lang: "vi",
  };

  // Gọi API MoMo tạo thanh toán
  const momoRes = await axios.post(
    "https://test-payment.momo.vn/v2/gateway/api/create",
    body,
    { headers: { "Content-Type": "application/json" } },
  );

  return momoRes.data;
};

/**
 * Xử lý thanh toán thành công (gọi từ webhook)
 * - type = "order" → update bảng Order + Payment
 * - type = "booking" → update bảng Booking + PaymentBooking
 */
const paymentSuccessService = async (data) => {
  const { entityId, amount, transId, type = "order" } = data;
  return sequelize.transaction(async (t) => {
    if (type === "order") {
      // --- Xử lý đơn hàng ---
      const order = await Order.findByPk(entityId, { transaction: t });
      if (!order) throw new NotFoundError("Đơn hàng không tồn tại");

      await order.update(
        {
          orderStatus: "Paid",
          totalAmount: amount,
        },
        { transaction: t },
      );

      const payment = await Payment.findOne({
        where: { orderId: entityId },
        transaction: t,
      });
      if (!payment)
        throw new NotFoundError("Thanh toán cho đơn hàng không tồn tại");

      await payment.update(
        {
          transId,
          paidAt: new Date(),
          paymentAmount: Number(amount),
          paymentStatus: "Success",
        },
        { transaction: t },
      );
    } else if (type === "booking") {
      // --- Xử lý booking ---
      const booking = await Booking.findByPk(entityId, { transaction: t });
      if (!booking) throw new NotFoundError("Booking không tồn tại");

      await booking.update(
        {
          bookingStatus: "Paid",
          totalAmount: amount,
        },
        { transaction: t },
      );

      const paymentBooking = await PaymentBooking.findOne({
        where: { bookingId: entityId },
        transaction: t,
      });

      if (!paymentBooking)
        throw new NotFoundError("Thanh toán cho booking không tồn tại");

      await paymentBooking.update(
        {
          transId,
          paidAt: new Date(),
          paymentAmount: Number(amount),
          paymentStatus: "Success",
        },
        { transaction: t },
      );
    }
  });
};

const momoService = {
  createPaymentService,
  paymentSuccessService,
};

export default momoService;
