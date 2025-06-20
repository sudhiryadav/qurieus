import { Prisma } from "@prisma/client";

export type SubscriptionPlanWithPaddle = Prisma.SubscriptionPlanGetPayload<{
  include: { paddleConfig: true };
}>; 