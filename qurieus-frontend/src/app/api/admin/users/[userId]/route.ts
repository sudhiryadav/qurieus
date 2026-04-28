import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/utils/auth";
import { prisma } from "@/utils/prismaDB";
import { RequireRoles } from "@/utils/roleGuardsDecorator";
import { UserRole } from "@prisma/client";
import { logger } from "@/lib/logger";
import crypto from "crypto";
import { sendEmail } from "@/lib/email";

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

      // Soft delete user, but also generate a short-lived code that super admins
      // can use to perform a permanent hard delete (data + vectors + S3 cleanup).
      const now = new Date();
      const hardDeleteCode = crypto.randomBytes(4).toString("hex").toUpperCase(); // 8 chars
      const passwordResetTokenExp = new Date(now);
      passwordResetTokenExp.setMinutes(passwordResetTokenExp.getMinutes() + 10);

      await prisma.user.update({
        where: { id: userId },
        data: {
          deleted_at: now,
          is_active: false,
          // Reuse the existing token fields (password reset) as a short-lived hard-delete code.
          passwordResetToken: hardDeleteCode,
          passwordResetTokenExp,
        },
      });

      // Send the 10-minute permanent-delete code to all super admins.
      const superAdmins = await prisma.user.findMany({
        where: { role: UserRole.SUPER_ADMIN, is_active: true },
        select: { id: true, email: true, name: true },
      });

      if (!superAdmins.length) {
      } else {
        const emailPromises = superAdmins.map(async (admin) => {
          if (!admin.email) return;
          try {
            await sendEmail({
              to: admin.email,
              subject: "Permanent delete confirmation code (10 minutes)",
              template: "hard-delete-user",
              context: {
                code: hardDeleteCode,
                expiresAt: passwordResetTokenExp.toISOString(),
                deletedUserName: user.name,
                deletedUserEmail: user.email,
                hardDeleteUserId: userId,
              },
            });
          } catch (emailError) {
            logger.error("Failed to send hard-delete code email", {
              adminId: admin.id,
              adminEmail: admin.email,
              targetUserId: userId,
              error: emailError instanceof Error ? emailError.message : String(emailError),
            });
          }
        });
        await Promise.all(emailPromises);
      }

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
