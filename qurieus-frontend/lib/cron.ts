import cron from "node-cron";
import { syncPendingSubscriptions } from "./syncPendingSubscriptions";
import { checkTrialExpiration, sendTrialExpiringWarnings } from "./trialManagement";

cron.schedule("*/5 * * * *", async () => {
  console.log("[CRON] Running Paddle sync job...");
  try {
    await syncPendingSubscriptions();
    console.log("[CRON] Paddle sync job complete.");
  } catch (err) {
    console.error("[CRON] Error in Paddle sync job:", err);
  }
});

// Check trial expiration and send warnings every hour
cron.schedule("0 * * * *", async () => {
  console.log("[CRON] Running trial management...");
  try {
    await checkTrialExpiration();
    await sendTrialExpiringWarnings();
    console.log("[CRON] Trial management complete.");
  } catch (err) {
    console.error("[CRON] Error in trial management:", err);
  }
}); 