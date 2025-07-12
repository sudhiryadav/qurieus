import { syncPendingSubscriptions } from "../lib/syncPendingSubscriptions";
import { logger } from "../src/lib/logger";

syncPendingSubscriptions().then(() => {
  logger.info("Pending subscriptions sync complete.");
  process.exit(0);
}); 