import cron from "node-cron";
import { syncPendingSubscriptions } from "./syncPendingSubscriptions";

cron.schedule("*/5 * * * *", async () => {
  console.log("[CRON] Running Paddle sync job...");
  try {
    await syncPendingSubscriptions();
    console.log("[CRON] Paddle sync job complete.");
  } catch (err) {
    console.error("[CRON] Error in Paddle sync job:", err);
  }
}); 