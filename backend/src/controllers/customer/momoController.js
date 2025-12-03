import crypto from "crypto";
import momoService from "../../services/customer/momoService.js";

/**
 * Tạo link thanh toán MoMo
 */
const createMoMoPayment = async (req, res, next) => {
  try {
    const { entityId, amount, orderInfo, type } = req.body;

    const result = await momoService.createPaymentService(
      entityId,
      amount,
      orderInfo,
      type
    );

    return res.status(201).json(result);
  } catch (error) {
    next(error);
  }
};

/**
 * Xử lý webhook IPN MoMo
 * Đây là endpoint MoMo gọi về để báo trạng thái giao dịch
 */
const handleMoMoWebhook = async (req, res) => {
  console.log("===> WEBHOOK RECEIVED <===");
  console.log(req.body);

  const {
    partnerCode,
    orderId,
    requestId,
    amount,
    orderInfo,
    orderType,
    transId,
    message,
    payType,
    responseTime,
    extraData,
    signature,
    resultCode,
  } = req.body;

  const SECRET_KEY = process.env.SECRET_KEY;
  const ACCESS_KEY = process.env.ACCESS_KEY;

  /**
   * MoMo yêu cầu rawSignature phải tạo theo đúng thứ tự
   * KHÔNG ĐƯỢC ĐỔI VỊ TRÍ hoặc BỎ FIELD
   */
  const rawSignature =
    `accessKey=${ACCESS_KEY}` +
    `&amount=${amount}` +
    `&extraData=${extraData}` +
    `&message=${message}` +
    `&orderId=${orderId}` +
    `&orderInfo=${orderInfo}` +
    `&orderType=${orderType}` + // bắt buộc có
    `&partnerCode=${partnerCode}` +
    `&payType=${payType}` +
    `&requestId=${requestId}` +
    `&responseTime=${responseTime}` +
    `&resultCode=${resultCode}` +
    `&transId=${transId}`;

  // Tạo chữ ký để so sánh
  const expectedSignature = crypto
    .createHmac("sha256", SECRET_KEY)
    .update(rawSignature)
    .digest("hex");

  console.log("expectedSignature:", expectedSignature);
  console.log("signature:", signature);

  // Sai signature → từ chối webhook
  if (expectedSignature !== signature) {
    console.log("❌ Sai chữ ký, từ chối webhook");
    return res.status(400).json({ message: "Invalid signature" });
  }

  // Lấy id thực của đơn hàng (orderId = "{id}_{timestamp}_{requestId}")
  const originalEntityId = orderId.split("_")[0];

  // Giải mã extraData
  let type = "order";
  try {
    type = JSON.parse(Buffer.from(extraData, "base64").toString()).type;
  } catch (err) {
    console.log("⚠️ extraData decode error:", err);
  }

  // Nếu thanh toán thành công
  if (Number(resultCode) === 0) {
    await momoService.paymentSuccessService(
      originalEntityId,
      amount,
      transId,
      type
    );
  }

  // MoMo yêu cầu trả resultCode = 0
  return res.status(200).json({ message: "OK" });
};

/**
 * LƯU Ý QUAN TRỌNG:
 * ✔ rawSignature phải giống 100% tài liệu MoMo (đúng thứ tự)
 * ✔ SECRET_KEY & ACCESS_KEY phải trùng với Dashboard
 * ✔ Không dùng rawSignature bên "create payment" cho webhook
 * ✔ Webhook có thể gọi nhiều lần → backend phải xử lý idempotent
 * ✔ Hãy luôn log webhook để debug khi cần
 */
const momoController = {
  createMoMoPayment,
  handleMoMoWebhook,
};

export default momoController;
