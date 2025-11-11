import crypto from "crypto";
import momoService from "../../services/customer/momoService.js";

// Tạo payment
const createMoMoPayment = async (req, res, next) => {
  try {
    const { orderId, amount, orderInfo } = req.body;
    const result = await momoService.createPaymentService(
      orderId,
      amount,
      orderInfo
    );
    return res.status(201).json(result);
  } catch (error) {
    next(error);
  }
};

// Xử lý webhook MoMo gửi về
const handleMoMoWebhook = async (req, res) => {
  const SECRET_KEY = process.env.SECRET_KEY; // Private key dùng để xác thực chữ ký
  const ACCESS_KEY = process.env.ACCESS_KEY; // Public key, cũng tham gia tạo chữ ký

  const payload = req.body; // JSON MoMo gửi về

  const {
    partnerCode,
    accessKey,
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
  } = payload;

  // Tạo rawSignature theo chuẩn MoMo IPN v2
  // ⚠️ LƯU Ý: phải đủ field và đúng thứ tự mới hợp lệ
  const rawSignature =
    `accessKey=${ACCESS_KEY}` +
    `&amount=${amount}` +
    `&extraData=${extraData || ""}` +
    `&message=${message}` +
    `&orderId=${orderId}` +
    `&orderInfo=${orderInfo}` +
    `&orderType=${orderType}` +
    `&partnerCode=${partnerCode}` +
    `&payType=${payType}` +
    `&requestId=${requestId}` +
    `&responseTime=${responseTime}` +
    `&resultCode=${resultCode}` +
    `&transId=${transId}`;

  // Tạo chữ ký HMAC SHA256 từ rawSignature
  const expectedSignature = crypto
    .createHmac("sha256", SECRET_KEY)
    .update(rawSignature)
    .digest("hex");

  // Kiểm tra chữ ký gửi từ MoMo có hợp lệ không
  if (expectedSignature !== signature) {
    console.warn("INVALID SIGNATURE", {
      expected: expectedSignature,
      received: signature,
      rawSignature,
    });
    return res.status(400).json({ message: "Invalid signature" });
  }

  // Nếu orderId được tạo theo format orderId_timestamp, tách orderId gốc
  const originalOrderId = orderId.split("_")[0];

  // Nếu MoMo báo thanh toán thành công (resultCode = 0)
  if (Number(resultCode) === 0) {
    await momoService.paymentSuccessService(originalOrderId, amount, transId);
  }

  // Trả về MoMo xác nhận đã nhận webhook thành công
  return res.status(200).json({ message: "OK" });
};

/* LƯU Ý:
1. SECRET_KEY phải đúng và giữ bí mật tuyệt đối.
2. rawSignature phải đủ field và đúng thứ tự, nếu sai => Invalid signature.
3. Không dùng rawSignature từ createPayment cho webhook, phải tạo riêng theo payload nhận được.
4. IPN webhook đảm bảo backend nhận được kết quả chính xác, không phụ thuộc trình duyệt.
*/

const momoController = {
  createMoMoPayment,
  handleMoMoWebhook,
};
export default momoController;
