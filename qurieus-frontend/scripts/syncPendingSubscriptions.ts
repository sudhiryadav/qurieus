import { syncPendingSubscriptions } from "../lib/syncPendingSubscriptions";
import { logger } from "../src/lib/logger";

syncPendingSubscriptions().then(() => {
  process.exit(0);
}); 