import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/utils/auth";
import { prisma } from "@/utils/prismaDB";
import { RequireRoles } from "@/utils/roleGuardsDecorator";
import { UserRole } from "@prisma/client";

/**
 * POST: Request a one-time trial extension (only when trial has expired, only once per user)
 */
export const POST = RequireRoles([UserRole.USER, UserRole.ADMIN, UserRole.SUPER_ADMIN])(
  async (req: NextRequest) => {
    try {
      const session = await getServerSession(authOptions);
      const userId = session!.user!.id;

      // Find user's Free Trial subscription (must be expired)
      const subscription = await prisma.userSubscription.findFirst({
        where: {
          userId,
          plan: { name: "Free Trial" },
          status: "expired",
        },
        include: { plan: true },
      });

      if (!subscription) {
        return NextResponse.json(
          { error: "No expired Free Trial subscription found. Only expired trials can request extension." },
          { status: 400 }
        );
      }

      // Check if user has already used their one-time extension (has any approved request)
      const existingApproved = await prisma.trialExtensionRequest.findFirst({
        where: {
          userId,
          status: "APPROVED",
        },
      });

      if (existingApproved) {
        return NextResponse.json(
          { error: "You have already used your one-time trial extension. Please upgrade to a paid plan or contact support." },
          { status: 400 }
        );
      }

      // Check if there's already a pending request
      const existingPending = await prisma.trialExtensionRequest.findFirst({
        where: {
          userId,
          status: "PENDING",
        },
      });

      if (existingPending) {
        return NextResponse.json(
          { error: "You already have a pending extension request. Please wait for admin approval." },
          { status: 400 }
        );
      }

      // Create the extension request
      const request = await prisma.trialExtensionRequest.create({
        data: {
          userId,
          userSubscriptionId: subscription.id,
          status: "PENDING",
          extensionDays: 7,
        },
        include: { user: { select: { name: true, email: true } } },
      });

      return NextResponse.json({
        success: true,
        request: {
          id: request.id,
          status: request.status,
          requestedAt: request.requestedAt,
          extensionDays: request.extensionDays,
        },
        message: "Trial extension request submitted. An admin will review it shortly.",
      });
    } catch (error) {
      console.error("Error creating trial extension request:", error);
      return NextResponse.json(
        { error: "Internal server error" },
        { status: 500 }
      );
    }
  }
);

/**
 * GET: Check user's trial extension request status
 */
export const GET = RequireRoles([UserRole.USER, UserRole.ADMIN, UserRole.SUPER_ADMIN])(
  async () => {
    try {
      const session = await getServerSession(authOptions);
      const userId = session!.user!.id;

      const requests = await prisma.trialExtensionRequest.findMany({
        where: { userId },
        orderBy: { createdAt: "desc" },
      });

      const latest = requests[0];
      const hasUsedExtension = requests.some((r) => r.status === "APPROVED");

      return NextResponse.json({
        latestRequest: latest
          ? {
              id: latest.id,
              status: latest.status,
              requestedAt: latest.requestedAt,
              approvedAt: latest.approvedAt,
              extensionDays: latest.extensionDays,
              newPeriodEnd: latest.newPeriodEnd,
              rejectionReason: latest.rejectionReason,
            }
          : null,
        hasUsedExtension,
        canRequestExtension: !latest || (latest.status !== "PENDING" && !hasUsedExtension),
      });
    } catch (error) {
      console.error("Error fetching trial extension status:", error);
      return NextResponse.json(
        { error: "Internal server error" },
        { status: 500 }
      );
    }
  }
);
