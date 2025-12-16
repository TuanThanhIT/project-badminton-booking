import crypto from "crypto";
import axios from "axios";
import ApiError from "../../utils/ApiError.js";
import { StatusCodes } from "http-status-codes";
import { Payment, Order, Booking, PaymentBooking } from "../../models/index.js";
import sequelize from "../../config/db.js";

const PARTNER_CODE = process.env.PARTNER_CODE;
const ACCESS_KEY = process.env.ACCESS_KEY;
const SECRET_KEY = process.env.SECRET_KEY;

const IPN_URL = "https://4e19788eee03.ngrok-free.app/user/momo/momo-webhook";

const createPaymentService = async (
  entityId,
  amount,
  orderInfo,
  type = "order"
) => {
  try {
    const REDIRECT_URL = `http://localhost:5173/momo-return?type=${type}`;

    const momoOrderId = `${entityId}_${Date.now()}`;
    const requestId = `${PARTNER_CODE}${Date.now()}`;
    const requestType = "captureWallet";

    const extraData = Buffer.from(JSON.stringify({ type })).toString("base64");

    const intAmount = Math.round(amount);

    const rawSignature =
      `accessKey=${ACCESS_KEY}&amount=${intAmount}&extraData=${extraData}` +
      `&ipnUrl=${IPN_URL}&orderId=${momoOrderId}&orderInfo=${orderInfo}` +
      `&partnerCode=${PARTNER_CODE}&redirectUrl=${REDIRECT_URL}` +
      `&requestId=${requestId}&requestType=${requestType}`;

    const signature = crypto
      .createHmac("sha256", SECRET_KEY)
      .update(rawSignature)
      .digest("hex");

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

    const momoRes = await axios.post(
      "https://test-payment.momo.vn/v2/gateway/api/create",
      body,
      { headers: { "Content-Type": "application/json" } }
    );

    return momoRes.data;
  } catch (error) {
    throw new ApiError(StatusCodes.INTERNAL_SERVER_ERROR, error);
  }
};

const paymentSuccessService = async (
  entityId,
  amount,
  transId,
  type = "order"
) => {
  const t = await sequelize.transaction();
  try {
    if (type === "order") {
      const order = await Order.findByPk(entityId, { transaction: t });
      if (!order)
        throw new ApiError(StatusCodes.NOT_FOUND, "Đơn hàng không tồn tại!");

      await order.update(
        { orderStatus: "Paid", totalAmount: amount },
        { transaction: t }
      );

      const payment = await Payment.findOne({
        where: { orderId: entityId },
        transaction: t,
      });
      if (!payment)
        throw new ApiError(
          StatusCodes.NOT_FOUND,
          "Thanh toán cho đơn hàng không tồn tại!"
        );

      await payment.update(
        {
          transId,
          paidAt: new Date(),
          paymentAmount: Number(amount),
          paymentStatus: "Success",
        },
        { transaction: t }
      );
    } else if (type === "booking") {
      const booking = await Booking.findByPk(entityId, { transaction: t });
      if (!booking)
        throw new ApiError(StatusCodes.NOT_FOUND, "Booking không tồn tại!");

      await booking.update(
        { bookingStatus: "Paid", totalAmount: amount },
        { transaction: t }
      );

      const paymentBooking = await PaymentBooking.findOne({
        where: { bookingId: entityId },
        transaction: t,
      });

      if (!paymentBooking)
        throw new ApiError(
          StatusCodes.NOT_FOUND,
          "Thanh toán cho booking không tồn tại!"
        );

      await paymentBooking.update(
        {
          transId,
          paidAt: new Date(),
          paymentAmount: Number(amount),
          paymentStatus: "Success",
        },
        { transaction: t }
      );
    }

    await t.commit();
  } catch (error) {
    await t.rollback();
    if (error instanceof ApiError) throw error;
    throw new ApiError(StatusCodes.INTERNAL_SERVER_ERROR, error);
  }
};

const momoService = {
  createPaymentService,
  paymentSuccessService,
};

export default momoService;
