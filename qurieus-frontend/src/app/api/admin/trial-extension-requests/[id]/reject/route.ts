import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/utils/auth";
import { prisma } from "@/utils/prismaDB";
import { RequireRoles } from "@/utils/roleGuardsDecorator";
import { UserRole } from "@prisma/client";

/**
 * POST: Reject a trial extension request
 * Body: { reason?: string } - optional rejection reason
 */
export const POST = RequireRoles([UserRole.ADMIN, UserRole.SUPER_ADMIN])(
  async (req: NextRequest, { params }: { params: Promise<{ id: string }> }) => {
    try {
      const session = await getServerSession(authOptions);
      const { id } = await params;

      const body = await req.json().catch(() => ({}));
      const rejectionReason = body.reason ?? null;

      const request = await prisma.trialExtensionRequest.findUnique({
        where: { id },
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

      await prisma.trialExtensionRequest.update({
        where: { id },
        data: {
          status: "REJECTED",
          rejectionReason,
          approvedById: session!.user!.id,
          approvedAt: new Date(),
        },
      });

      return NextResponse.json({
        success: true,
        message: "Trial extension request rejected",
      });
    } catch (error) {
      console.error("Error rejecting trial extension:", error);
      return NextResponse.json(
        { error: "Internal server error" },
        { status: 500 }
      );
    }
  }
);
