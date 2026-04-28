import { prisma } from "@/utils/prismaDB";
import axios from "axios";
import { upsertUserSubscriptionFromPaddle } from "@/lib/paddle";

export async function syncPendingSubscriptions() {
  const pending = await prisma.pendingSubscription.findMany();

  for (const record of pending) {
    try {
      // Fetch transaction details from Paddle
      const response = await axios.get(
        `https://api.paddle.com/transactions/${record.transactionId}`,
        {
          headers: {
            Authorization: `Bearer ${process.env.PADDLE_API_KEY}`,
            "Content-Type": "application/json",
          },
        }
      );
      const transaction = response.data.data;
      const subscriptionId = transaction.subscription_id; // Adjust if field name differs

      if (subscriptionId) {
        // Fetch subscription details
        const subRes = await axios.get(
          `https://api.paddle.com/subscriptions/${subscriptionId}`,
          {
            headers: {
              Authorization: `Bearer ${process.env.PADDLE_API_KEY}`,
              "Content-Type": "application/json",
            },
          }
        );
        const subscription = subRes.data.data;

        // Upsert into UserSubscription
        await upsertUserSubscriptionFromPaddle(subscription, record.userId);

        // Remove from pending
        await prisma.pendingSubscription.delete({ where: { id: record.id } });
      }
    } catch (err) {
    }
  }
} 