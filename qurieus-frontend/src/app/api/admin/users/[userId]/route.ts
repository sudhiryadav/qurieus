import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/utils/auth";
import { prisma } from "@/utils/prismaDB";
import { RequireRoles } from "@/utils/roleGuardsDecorator";
import { UserRole } from "@prisma/client";
import { logger } from "@/lib/logger";

export const DELETE = RequireRoles([UserRole.SUPER_ADMIN])(
  async (
    request: NextRequest,
    context: { params: Promise<{ userId: string }> }
  ) => {
    try {
      const session = await getServerSession(authOptions);
      const { userId } = await context.params;

      const user = await prisma.user.findUnique({
        where: { id: userId },
        select: { id: true, name: true, email: true, deleted_at: true },
      });

      if (!user) {
        return NextResponse.json({ error: "User not found" }, { status: 404 });
      }

      await prisma.user.update({
        where: { id: userId },
        data: { deleted_at: new Date(), is_active: false },
      });

      logger.info("User soft deleted", {
        adminId: session!.user!.id,
        targetUserId: userId,
      });

      return NextResponse.json({
        success: true,
        message: "User deleted successfully",
      });
    } catch (error: any) {
      logger.error("Admin user delete error", {
        error: error.message,
        stack: error.stack,
      });
      return NextResponse.json(
        { error: error.response?.data?.error || "Failed to delete user" },
        { status: 500 }
      );
    }
  }
);
