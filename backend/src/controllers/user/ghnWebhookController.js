import asyncHandler from "../../middlewares/asyncHandler.js";
import { ghnWebhookQueue } from "../../queues/ghnWebhookQueue.js";

const ghnWebhookHandlerController = asyncHandler(async (req, res) => {
  const data = req.body;

  // validate basic
  if (!data?.OrderCode || !data?.Status) {
    return res.status(200).json({});
  }

  // jobId để tránh enqueue trùng
  const jobId = `${data.OrderCode}-${data.Status}-${data.Time || ""}`;

  await ghnWebhookQueue.add("ghn-webhook", data, { jobId });

  // luôn trả 200
  return res.status(200).json({ success: true });
});

const ghnWebhookController = {
  ghnWebhookHandlerController,
};

export default ghnWebhookController;
