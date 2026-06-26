import "./ghnWebhookWorker.js";
import "./aiTrainingWorker.js";
import { scheduleNightlyTraining } from "../queues/aiTrainingQueue.js";

const bootstrap = async () => {
  try {
    await scheduleNightlyTraining();
  } catch (err) {
    console.error("[worker] Failed to schedule nightly AI training:", err.message);
  }
  console.log("[worker] All workers started (ghn-webhook, ai-model-training).");
};

bootstrap();
