import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/utils/auth";
import { prisma } from "@/utils/prismaDB";
import { RequireRoles } from "@/utils/roleGuardsDecorator";
import { UserRole } from "@prisma/client";

/**
 * POST: Admin directly extends a user's Free Trial (unlimited times)
 * Body: { extensionDays?: number, newPeriodEnd?: string }
 * - extensionDays: add N days from now (or from current end if still active)
 * - newPeriodEnd: set exact end date (ISO string). Takes precedence over extensionDays if both provided.
 */
export const POST = RequireRoles([UserRole.ADMIN, UserRole.SUPER_ADMIN])(
  async (req: NextRequest, { params }: { params: Promise<{ userId: string }> }) => {
    try {
      const { userId } = await params;
      const body = await req.json().catch(() => ({}));

      const extensionDays = body.extensionDays != null ? Number(body.extensionDays) : null;
      const newPeriodEndStr = body.newPeriodEnd;

      if (!extensionDays && !newPeriodEndStr) {
        return NextResponse.json(
          { error: "Provide either extensionDays or newPeriodEnd" },
          { status: 400 }
        );
      }

      const subscription = await prisma.userSubscription.findFirst({
        where: {
          userId,
          plan: { name: "Free Trial" },
        },
        include: { plan: true },
      });

      if (!subscription) {
        return NextResponse.json(
          { error: "User has no Free Trial subscription" },
          { status: 404 }
        );
      }

      let newPeriodEnd: Date;

      if (newPeriodEndStr) {
        newPeriodEnd = new Date(newPeriodEndStr);
        if (isNaN(newPeriodEnd.getTime())) {
          return NextResponse.json(
            { error: "Invalid newPeriodEnd date format" },
            { status: 400 }
          );
        }
      } else if (extensionDays != null && extensionDays > 0) {
        const now = new Date();
        const currentEnd = new Date(subscription.currentPeriodEnd);
        const baseDate = currentEnd > now ? currentEnd : now;
        newPeriodEnd = new Date(baseDate);
        newPeriodEnd.setDate(newPeriodEnd.getDate() + extensionDays);
      } else {
        return NextResponse.json(
          { error: "extensionDays must be a positive number" },
          { status: 400 }
        );
      }

      await prisma.userSubscription.update({
        where: { id: subscription.id },
        data: {
          status: "active",
          currentPeriodEnd: newPeriodEnd,
          nextBillingDate: newPeriodEnd,
        },
      });

      return NextResponse.json({
        success: true,
        message: `Trial extended. New end date: ${newPeriodEnd.toLocaleDateString()}`,
        newPeriodEnd: newPeriodEnd.toISOString(),
      });
    } catch (error) {
      console.error("Error extending trial:", error);
      return NextResponse.json(
        { error: "Internal server error" },
        { status: 500 }
      );
    }
  }
);
