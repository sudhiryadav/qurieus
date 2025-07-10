import { prisma } from "@/utils/prismaDB";

/**
 * Ensures only one subscription is active for a user at a time
 * @param userId - The user ID
 * @param excludeSubscriptionId - Optional subscription ID to exclude from deactivation (the one being activated)
 */
export async function ensureSingleActiveSubscription(
  userId: string, 
  excludeSubscriptionId?: string
) {
  const whereClause: any = {
    userId,
    status: "active",
  };

  // Exclude the subscription being activated if provided
  if (excludeSubscriptionId) {
    whereClause.id = {
      not: excludeSubscriptionId
    };
  }

  // Deactivate all other active subscriptions
  const result = await prisma.userSubscription.updateMany({
    where: whereClause,
    data: {
      status: "inactive",
    },
  });

  console.log(`Deactivated ${result.count} other active subscriptions for user ${userId}`);
  return result;
}

/**
 * Activates a subscription and ensures it's the only active one
 * @param subscriptionId - The subscription ID to activate
 * @param userId - The user ID
 * @param updateData - Additional data to update on the subscription
 */
export async function activateSubscription(
  subscriptionId: string,
  userId: string,
  updateData: any = {}
) {
  // First, deactivate all other subscriptions
  await ensureSingleActiveSubscription(userId, subscriptionId);

  // Then activate the target subscription
  return await prisma.userSubscription.update({
    where: { id: subscriptionId },
    data: {
      status: "active",
      ...updateData,
    },
  });
} 