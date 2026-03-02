import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/utils/auth";
import { prisma } from "@/utils/prismaDB";
import { RequireRoles } from "@/utils/roleGuardsDecorator";
import { UserRole } from "@prisma/client";
import { logger } from "@/lib/logger";
import s3Service from "@/lib/s3";
import { qdrant, getQdrantConfig } from "@/lib/qdrant";

async function deleteDocumentWithArtifacts(document: {
  id: string;
  userId: string;
  fileName: string | null;
  qdrantDocumentId: string | null;
  aiDocumentId: string | null;
}) {
  const qdrantId = document.qdrantDocumentId ?? document.aiDocumentId;
  if (qdrantId) {
    try {
      const config = getQdrantConfig();
      if (config.QDRANT_COLLECTION && config.QDRANT_URL) {
        await qdrant.delete(config.QDRANT_COLLECTION, {
          filter: {
            must: [
              { key: "user_id", match: { value: document.userId } },
              { key: "document_id", match: { value: qdrantId } },
            ],
          },
        });
        logger.info("Permanent delete: Deleted vectors from Qdrant", {
          documentId: document.id,
          qdrantId,
        });
      }
    } catch (err) {
      logger.warn("Permanent delete: Qdrant deletion failed", {
        documentId: document.id,
        error: err,
      });
    }
  }
  if (document.fileName) {
    try {
      await s3Service.deleteDocument(document.fileName);
      logger.info("Permanent delete: Deleted file from S3", {
        documentId: document.id,
        fileName: document.fileName,
      });
    } catch (err) {
      logger.warn("Permanent delete: S3 deletion failed", {
        documentId: document.id,
        error: err,
      });
    }
  }
  await prisma.document.delete({ where: { id: document.id } });
}

export const DELETE = RequireRoles([UserRole.SUPER_ADMIN])(
  async (
    request: NextRequest,
    context: { params: Promise<{ userId: string }> }
  ) => {
    try {
      const session = await getServerSession(authOptions);
      const { userId } = await context.params;
      const { searchParams } = new URL(request.url);
      const soft = searchParams.get("soft") === "true";
      const permanent = searchParams.get("permanent") === "true";

      if (!soft && !permanent) {
        return NextResponse.json(
          { error: "Specify soft=true or permanent=true" },
          { status: 400 }
        );
      }

      const user = await prisma.user.findUnique({
        where: { id: userId },
        select: { id: true, name: true, email: true, deleted_at: true },
      });

      if (!user) {
        return NextResponse.json({ error: "User not found" }, { status: 404 });
      }

      if (soft) {
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
          message: "User soft deleted successfully",
        });
      }

      if (permanent) {
        const documents = await prisma.document.findMany({
          where: { userId },
          select: {
            id: true,
            userId: true,
            fileName: true,
            qdrantDocumentId: true,
            aiDocumentId: true,
          },
        });

        for (const doc of documents) {
          await deleteDocumentWithArtifacts(doc);
        }

        await prisma.user.delete({
          where: { id: userId },
        });

        logger.info("User permanently deleted with all documents", {
          adminId: session!.user!.id,
          targetUserId: userId,
          documentsDeleted: documents.length,
        });

        return NextResponse.json({
          success: true,
          message: "User and all associated data permanently deleted",
        });
      }

      return NextResponse.json({ error: "Invalid request" }, { status: 400 });
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
