# Cron Jobs

## Paddle Subscription Sync

To ensure all pending Paddle transactions are synced to subscriptions, schedule the following cron job to run every 5 minutes:

```
*/5 * * * * cd /path/to/qurieus-frontend && yarn ts-node scripts/syncPendingSubscriptions.ts >> scripts/cron.log 2>&1
```

- This will run the sync script every 5 minutes and log output to `scripts/cron.log`.
- Make sure you have `ts-node` installed and your environment variables set up for Paddle API access.
- You can add this line to your crontab by running `crontab -e` and pasting the line above.

## Qdrant Cloud Keep-Alive

Qdrant Cloud free tier clusters are **suspended after 1 week of inactivity** and **deleted after 4 weeks** if not reactivated. See [Qdrant Cloud docs](https://qdrant.tech/documentation/cloud/create-cluster).

To prevent suspension, run the keep-alive script every 3 days (or rely on the in-app cron which runs automatically):

```
0 6 */3 * * cd /path/to/qurieus-frontend && yarn ts-node scripts/keepQdrantActive.ts >> scripts/cron.log 2>&1
```

- Requires `QDRANT_URL`, `QDRANT_COLLECTION`, and `QDRANT_API_KEY` in `.env`.
- The app also runs this automatically via instrumentation (every 3 days at 6 AM). 