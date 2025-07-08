import { Prisma, User } from "@prisma/client";

export type SubscriptionPlanWithPaddle = Prisma.SubscriptionPlanGetPayload<{
  include: { paddleConfig: true };
}>; 

export type UserSubscription = Prisma.UserSubscriptionGetPayload<{
  include: { plan: true };
}> & { planSnapshot?: any };

export type SubscriptionPlan = Prisma.SubscriptionPlanGetPayload<{
  include: { paddleConfig: true };
}>;

export type UserSubscriptionWithUserAndPlan = UserSubscription & {
  user: User;
  plan: SubscriptionPlan;
};