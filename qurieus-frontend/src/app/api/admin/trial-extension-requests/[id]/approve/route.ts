import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/utils/auth";
import { prisma } from "@/utils/prismaDB";
import { RequireRoles } from "@/utils/roleGuardsDecorator";
import { UserRole } from "@prisma/client";

/**
 * POST: Approve a trial extension request
 * Body: { extensionDays?: number } - optional, defaults to 7
 */
export const POST = RequireRoles([UserRole.ADMIN, UserRole.SUPER_ADMIN])(
  async (req: NextRequest, { params }: { params: Promise<{ id: string }> }) => {
    try {
      const session = await getServerSession(authOptions);
      const { id } = await params;

      const body = await req.json().catch(() => ({}));
      const extensionDays = body.extensionDays ?? 7;

      const request = await prisma.trialExtensionRequest.findUnique({
        where: { id },
        include: { user: true },
      });

      if (!request) {
        return NextResponse.json({ error: "Request not found" }, { status: 404 });
      }

      if (request.status !== "PENDING") {
        return NextResponse.json(
          { error: `Request is already ${request.status}` },
          { status: 400 }
        );
      }

      const subscription = await prisma.userSubscription.findUnique({
        where: { id: request.userSubscriptionId },
        include: { plan: true },
      });

      if (!subscription || subscription.plan.name !== "Free Trial") {
        return NextResponse.json(
          { error: "Associated subscription not found or not a Free Trial" },
          { status: 400 }
        );
      }

      const now = new Date();
      const currentEnd = new Date(subscription.currentPeriodEnd);
      const baseDate = currentEnd > now ? currentEnd : now;
      const newPeriodEnd = new Date(baseDate);
      newPeriodEnd.setDate(newPeriodEnd.getDate() + extensionDays);

      await prisma.$transaction([
        prisma.userSubscription.update({
          where: { id: subscription.id },
          data: {
            status: "active",
            currentPeriodEnd: newPeriodEnd,
            nextBillingDate: newPeriodEnd,
          },
        }),
        prisma.trialExtensionRequest.update({
          where: { id },
          data: {
            status: "APPROVED",
            extensionDays,
            newPeriodEnd,
            approvedById: session!.user!.id,
            approvedAt: new Date(),
          },
        }),
      ]);

      return NextResponse.json({
        success: true,
        message: `Trial extended by ${extensionDays} days. New end date: ${newPeriodEnd.toLocaleDateString()}`,
      });
    } catch (error) {
      return NextResponse.json(
        { error: "Internal server error" },
        { status: 500 }
      );
    }
  }
);
