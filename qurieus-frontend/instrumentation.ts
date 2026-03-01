/**
 * Runs when the Next.js server starts (before handling requests).
 * Loads cron jobs: Paddle sync, trial management, Qdrant keep-alive.
 */
export async function register() {
  if (process.env.NEXT_RUNTIME === "nodejs") {
    await import("./lib/cron");
  }
}
