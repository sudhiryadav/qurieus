import { NextResponse } from "next/server";
import { prisma } from "@/utils/prismaDB";
import { Prisma } from "@prisma/client";
import { OptionalAuth } from "@/utils/roleGuardsDecorator";

export type SubscriptionPlanWithPaddle = Prisma.SubscriptionPlanGetPayload<{
  include: { paddleConfig: true };
}>;

export const GET = OptionalAuth("Subscription Plans API")(async (request: Request, user: any) => {
  try {
    const plans: SubscriptionPlanWithPaddle[] = await prisma.subscriptionPlan.findMany({
      where: { isActive: true },
      orderBy: { price: "asc" },
      include: {
        paddleConfig: true,
      },
    });

    return NextResponse.json(plans);
  } catch (error) {
    console.error("Error fetching subscription plans:", error);
    return NextResponse.json(
      { error: "Failed to fetch subscription plans" },
      { status: 500 }
    );
  }
}); 