import { syncPendingSubscriptions } from "../lib/syncPendingSubscriptions";

syncPendingSubscriptions().then(() => {
  console.log("Pending subscriptions sync complete.");
  process.exit(0);
}); 