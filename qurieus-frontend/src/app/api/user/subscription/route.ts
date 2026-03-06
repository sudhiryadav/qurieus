import { getServerSession } from "next-auth";
import { NextResponse } from "next/server";
import { prisma } from "@/utils/prismaDB";
import { authOptions } from "@/utils/auth";
import { RequireRoles } from '@/utils/roleGuardsDecorator';
import { UserRole } from '@prisma/client';

export const GET = RequireRoles([UserRole.USER,UserRole.SUPER_ADMIN])(async () => {
  try {
    const session = await getServerSession(authOptions);

    const subscription = await prisma.userSubscription.findFirst({
      where: {
        userId: session!.user!.id,
      },
      orderBy: {
        createdAt: "desc",
      },
      include: {
        plan: true,
      },
    });

    if (!subscription) {
      return NextResponse.json(null);
    }

    // Check if Free Trial has expired and update status on-the-fly
    // (cron may not have run yet; ensures subscription page shows correct status)
    if (
      subscription.plan.name === "Free Trial" &&
      subscription.status === "active" &&
      subscription.currentPeriodEnd < new Date()
    ) {
      const updated = await prisma.userSubscription.update({
        where: { id: subscription.id },
        data: { status: "expired" },
        include: { plan: true },
      });
      return NextResponse.json(updated);
    }

    return NextResponse.json(subscription);
  } catch (error) {
    console.error("Error fetching subscription:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}); 