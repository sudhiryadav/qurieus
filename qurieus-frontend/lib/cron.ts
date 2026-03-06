import cron from "node-cron";
import { syncPendingSubscriptions } from "./syncPendingSubscriptions";
import { checkTrialExpiration, sendTrialExpiringWarnings } from "./trialManagement";
import { keepQdrantActive } from "@/lib/keepQdrantActive";

// Qdrant Cloud free tier: clusters suspend after 1 week of inactivity, deleted after 4 weeks.
// Ping every 3 days to prevent suspension. See: https://qdrant.tech/documentation/cloud/create-cluster
cron.schedule("0 6 */3 * *", async () => {
  console.log("[CRON] Running Qdrant keep-alive...");
  try {
    const result = await keepQdrantActive();
    if (result.success) {
      console.log("[CRON] Qdrant keep-alive complete.");
    } else {
      console.warn("[CRON] Qdrant keep-alive failed:", result.error);
    }
  } catch (err) {
    console.error("[CRON] Error in Qdrant keep-alive:", err);
  }
});

cron.schedule("*/5 * * * *", async () => {
  console.log("[CRON] Running Paddle sync job...");
  try {
    await syncPendingSubscriptions();
    console.log("[CRON] Paddle sync job complete.");
  } catch (err) {
    console.error("[CRON] Error in Paddle sync job:", err);
  }
});

// Check trial expiration and send warnings daily at 6:00 AM UTC
// (Running hourly caused duplicate emails; daily is sufficient for trial management)
cron.schedule("0 6 * * *", async () => {
  console.log("[CRON] Running trial management...");
  try {
    await checkTrialExpiration();
    await sendTrialExpiringWarnings();
    console.log("[CRON] Trial management complete.");
  } catch (err) {
    console.error("[CRON] Error in trial management:", err);
  }
}); 