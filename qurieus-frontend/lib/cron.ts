import cron from "node-cron";
import { syncPendingSubscriptions } from "./syncPendingSubscriptions";
import {
  checkTrialExpiration,
  sendPaidSubscriptionRenewalWarnings,
  sendTrialExpiringWarnings,
} from "./trialManagement";
import { keepQdrantActive } from "@/lib/keepQdrantActive";

// Qdrant Cloud free tier: clusters suspend after 1 week of inactivity, deleted after 4 weeks.
// Ping daily at 6 AM UTC to prevent suspension. See: https://qdrant.tech/documentation/cloud/create-cluster
cron.schedule("0 6 * * *", async () => {
  try {
    const result = await keepQdrantActive();
    if (result.success) {
    } else {
    }
  } catch (err) {
  }
});

cron.schedule("*/5 * * * *", async () => {
  try {
    await syncPendingSubscriptions();
  } catch (err) {
  }
});

// Check trial expiration and send warnings daily at 6:00 AM UTC
// (Running hourly caused duplicate emails; daily is sufficient for trial management)
cron.schedule("0 6 * * *", async () => {
  try {
    await checkTrialExpiration();
    await sendTrialExpiringWarnings();
    await sendPaidSubscriptionRenewalWarnings();
  } catch (err) {
  }
}); 