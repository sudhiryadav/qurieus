import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/utils/auth";
import { prisma } from "@/utils/prismaDB";
import { RequireRoles, invalidateUserCache } from "@/utils/roleGuardsDecorator";
import { UserRole } from "@prisma/client";
import { logger } from "@/lib/logger";
import { qdrant, getQdrantConfig } from "@/lib/qdrant";
import { s3Service } from "@/lib/s3";
import { DeleteObjectCommand, S3Client } from "@aws-sdk/client-s3";

export const POST = RequireRoles([UserRole.SUPER_ADMIN])(
  async (
    request: NextRequest,
    context: { params: Promise<{ userId: string }> }
  ) => {
    try {
      const session = await getServerSession(authOptions);
      const { userId } = await context.params;

      const body = await request.json().catch(() => ({}));
      const { code } = body as { code?: string };

      if (!code || typeof code !== "string") {
        return NextResponse.json({ error: "Missing code" }, { status: 400 });
      }

      const user = await prisma.user.findUnique({
        where: { id: userId },
        select: {
          id: true,
          name: true,
          email: true,
          image: true,
          deleted_at: true,
          passwordResetToken: true,
          passwordResetTokenExp: true,
        },
      });

      if (!user) {
        return NextResponse.json({ error: "User not found" }, { status: 404 });
      }

      if (!user.deleted_at) {
        return NextResponse.json(
          { error: "User must be soft deleted before permanent deletion" },
          { status: 400 }
        );
      }

      const exp = user.passwordResetTokenExp;
      const tokenMatches = user.passwordResetToken === code;
      if (!tokenMatches || !exp || exp.getTime() < Date.now()) {
        return NextResponse.json(
          { error: "Invalid or expired code" },
          { status: 400 }
        );
      }

      // Best-effort external cleanup (S3 + Qdrant). We do this before DB delete so we can
      // still read the user's document file/vector identifiers.
      const documents = await prisma.document.findMany({
        where: { userId },
        select: {
          id: true,
          fileName: true,
          qdrantDocumentId: true,
          aiDocumentId: true,
          isProcessed: true,
          status: true,
        },
      });

      // Best-effort: delete avatar from S3 (user.image stores the S3 key).
      if (user.image) {
        try {
          const bucket = process.env.AWS_S3_BUCKET;
          const region = process.env.AWS_REGION;
          const accessKeyId = process.env.AWS_ACCESS_KEY_ID;
          const secretAccessKey = process.env.AWS_SECRET_ACCESS_KEY;

          if (bucket && region && accessKeyId && secretAccessKey) {
            const s3Client = new S3Client({
              region,
              credentials: { accessKeyId, secretAccessKey },
            });

            await s3Client.send(
              new DeleteObjectCommand({ Bucket: bucket, Key: user.image })
            );
          }
        } catch (avatarError: unknown) {
          logger.warn("Hard delete: failed to delete avatar from S3", {
            targetUserId: userId,
            error: avatarError instanceof Error ? avatarError.message : String(avatarError),
          });
        }
      }

      const qdrantConfig = getQdrantConfig();
      for (const doc of documents) {
        const qdrantIdToDelete = doc.qdrantDocumentId ?? doc.aiDocumentId ?? null;

        if (qdrantIdToDelete && qdrantConfig.QDRANT_COLLECTION && qdrantConfig.QDRANT_URL) {
          try {
            const filter = {
              must: [
                { key: "user_id", match: { value: userId } },
                { key: "document_id", match: { value: qdrantIdToDelete } },
              ],
            };
            await qdrant.delete(qdrantConfig.QDRANT_COLLECTION, { filter });
          } catch (qdrantError: unknown) {
            logger.warn("Hard delete: failed to delete Qdrant vectors", {
              targetUserId: userId,
              documentId: doc.id,
              qdrantIdToDelete,
              error: qdrantError instanceof Error ? qdrantError.message : String(qdrantError),
            });
          }
        }

        if (doc.fileName) {
          try {
            await s3Service.deleteDocument(doc.fileName);
          } catch (s3Error: unknown) {
            logger.warn("Hard delete: failed to delete S3 document", {
              targetUserId: userId,
              documentId: doc.id,
              fileName: doc.fileName,
              error: s3Error instanceof Error ? s3Error.message : String(s3Error),
            });
          }
        }
      }

      // DB cleanup: delete all data that references the user, including the parts that
      // don't have onDelete: Cascade in Prisma schema.
      await prisma.$transaction(async (tx) => {
        // Detach child users in the UserAgents relationship if this user is a parent.
        await tx.user.updateMany({
          where: { parentUserId: userId },
          data: { parentUserId: null },
        });

        // If any visitor records were converted into this user, detach them.
        await tx.visitorInfo.updateMany({
          where: { convertedUserId: userId },
          data: { convertedUserId: null },
        });

        // Delete non-cascading FK references first.
        await tx.userSubscription.deleteMany({ where: { userId } });
        await tx.pendingSubscription.deleteMany({ where: { userId } });
        await tx.queryAnalytics.deleteMany({ where: { userId } });
        await tx.visitorSession.deleteMany({ where: { userId } });

        // Tickets where this user is either creator or assignee.
        await tx.supportTicket.deleteMany({
          where: {
            OR: [{ createdById: userId }, { assignedToId: userId }],
          },
        });

        // Chat data:
        const conversations = await tx.chatConversation.findMany({
          where: { userId },
          select: { id: true },
        });
        const conversationIds = conversations.map((c) => c.id);

        if (conversationIds.length) {
          // Chat messages must be removed before deleting conversations (no cascade on the relation).
          await tx.chatMessage.deleteMany({
            where: { conversationId: { in: conversationIds } },
          });
          await tx.agentChat.deleteMany({
            where: { conversationId: { in: conversationIds } },
          });
          await tx.chatConversation.deleteMany({
            where: { id: { in: conversationIds } },
          });
        }

        // If this user acted as an agent in other conversations, remove those references too.
        await tx.chatMessage.deleteMany({ where: { agentId: userId } });
        await tx.agentChat.deleteMany({ where: { agentId: userId } });

        // Finally delete the user (cascades for most children).
        await tx.user.delete({ where: { id: userId } });
      });

      await invalidateUserCache(userId);

      logger.info("User hard deleted", {
        adminId: session?.user?.id,
        targetUserId: userId,
      });

      return NextResponse.json({
        success: true,
        message: "User permanently deleted",
      });
    } catch (error: unknown) {
      logger.error("Hard delete user error", {
        error: error instanceof Error ? error.message : String(error),
        stack: error instanceof Error ? error.stack : undefined,
      });
      return NextResponse.json(
        { error: "Failed to permanently delete user" },
        { status: 500 }
      );
    }
  }
);

