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

// Keep Modal instances warm every 10 minutes
cron.schedule("*/10 * * * *", async () => {
  console.log("[CRON] Running Modal keep-warm...");
  try {
    const modalKeepWarmUrl = process.env.MODAL_KEEP_WARM_URL;
    const modalApiKey = process.env.MODAL_DOT_COM_X_API_KEY;

    if (modalKeepWarmUrl && modalApiKey) {
      const response = await fetch(modalKeepWarmUrl, {
        method: 'GET',
        headers: { 'x-api-key': modalApiKey },
        signal: AbortSignal.timeout(30000), // 30 seconds timeout
      });

      if (response.ok) {
        console.log("[CRON] Modal instances kept warm successfully");
      } else {
        console.warn("[CRON] Modal keep-warm failed:", response.status);
      }
    } else {
      console.warn("[CRON] Modal keep-warm skipped - missing environment variables");
    }
  } catch (err) {
    console.error("[CRON] Error in Modal keep-warm:", err);
  }
}); 