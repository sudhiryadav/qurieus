# Paddle Subscription Sync Cron Job

To ensure all pending Paddle transactions are synced to subscriptions, schedule the following cron job to run every 5 minutes:

```
*/5 * * * * cd /Users/sudhir/Documents/Projects/frontslash/qurieus/qurieus-frontend && yarn ts-node scripts/syncPendingSubscriptions.ts >> scripts/cron.log 2>&1
```

- This will run the sync script every 5 minutes and log output to `scripts/cron.log`.
- Make sure you have `ts-node` installed and your environment variables set up for Paddle API access.
- You can add this line to your crontab by running `crontab -e` and pasting the line above. 