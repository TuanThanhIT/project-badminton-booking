import asyncHandler from "../../middlewares/asyncHandler.js";
import { ghnWebhookQueue } from "../../queues/ghnWebhookQueue.js";

const normalizeGHNWebhookPayload = (payload = {}) => ({
  ...payload,
  OrderCode:
    payload.OrderCode ||
    payload.order_code ||
    payload.orderCode ||
    payload.ClientOrderCode ||
    payload.client_order_code,
  Status: payload.Status || payload.status,
  Time: payload.Time || payload.time || payload.updated_at || payload.updatedAt,
});

const ghnWebhookHandlerController = asyncHandler(async (req, res) => {
  const data = normalizeGHNWebhookPayload(req.body);

  // validate basic
  if (!data?.OrderCode || !data?.Status) {
    return res.status(200).json({});
  }

  // jobId để tránh enqueue trùng
  await ghnWebhookQueue.add("ghn-webhook", data);

  // luôn trả 200
  return res.status(200).json({ success: true });
});

const ghnWebhookController = {
  ghnWebhookHandlerController,
};

export default ghnWebhookController;
