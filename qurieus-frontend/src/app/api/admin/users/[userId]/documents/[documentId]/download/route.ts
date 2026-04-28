import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/utils/auth";
import { prisma } from "@/utils/prismaDB";
import { RequireRoles } from "@/utils/roleGuardsDecorator";
import { UserRole } from "@prisma/client";
import { logger } from "@/lib/logger";
import { getDocumentDownloadBuffer } from "@/lib/documentService";

export const GET = RequireRoles([UserRole.SUPER_ADMIN])(async (
  request: NextRequest,
  context: { params: Promise<{ userId: string; documentId: string }> }
) => {
  try {
    const session = await getServerSession(authOptions);
    const { userId, documentId } = await context.params;

    logger.info("Admin Download API: Downloading document for user", {
      adminId: session!.user!.id,
      targetUserId: userId,
      documentId,
    });

    const targetUser = await prisma.user.findUnique({
      where: { id: userId },
      select: { id: true, name: true, email: true },
    });

    if (!targetUser) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    const document = await prisma.document.findFirst({
      where: { id: documentId, userId },
      select: {
        id: true,
        fileName: true,
        fileUrl: true,
        fileType: true,
        originalName: true,
        content: true,
        status: true,
      },
    });

    if (!document) {
      logger.warn("Admin Download API: Document not found", {
        documentId,
        targetUserId: userId,
      });
      return NextResponse.json({ error: "Document not found" }, { status: 404 });
    }

    let fileBuffer: Buffer;
    try {
      fileBuffer = await getDocumentDownloadBuffer(document);
    } catch (s3Error: any) {
      const isKeyNotFound =
        s3Error?.message?.includes("does not exist") ||
        s3Error?.name === "NoSuchKey" ||
        s3Error?.Code === "NoSuchKey";

      if (isKeyNotFound && document.content) {
        // Fallback: document was processed by backend but file not in S3 (e.g. admin upload flow)
        fileBuffer = Buffer.from(document.content, "utf-8");
        logger.info("Admin Download API: Serving from DB content (S3 key not found)", {
          documentId,
          targetUserId: userId,
        });
      } else if (isKeyNotFound) {
        return NextResponse.json(
          {
            error:
              "Document file not found in storage. It may still be processing or the file may not have been stored.",
          },
          { status: 404 }
        );
      } else {
        throw s3Error;
      }
    }

    const headers = new Headers();
    headers.set("Content-Type", document.fileType || "application/octet-stream");
    headers.set(
      "Content-Disposition",
      `attachment; filename="${document.originalName || document.fileName}"`
    );
    headers.set("Content-Length", fileBuffer.length.toString());

    logger.info("Admin Download API: Document download successful", {
      adminId: session!.user!.id,
      targetUserId: userId,
      documentId,
      fileName: document.originalName || document.fileName,
    });

    const responseBody = new Uint8Array(fileBuffer);
    return new NextResponse(responseBody, { headers });
  } catch (error: any) {
    logger.error("Admin Download API: Error downloading document", {
      error: error.message,
      stack: error.stack,
    });

    const isNotFound =
      error.message?.includes("not found") ||
      error.message?.includes("does not exist") ||
      error.name === "NoSuchKey";
    const status = isNotFound ? 404 : 500;
    return NextResponse.json(
      { error: error.message || "Failed to download document" },
      { status }
    );
  }
}); 