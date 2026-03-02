import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/utils/auth";
import prisma from "@/lib/prisma";
import { logger } from "@/lib/logger";
import { getDocumentDownloadBuffer } from "@/lib/documentService";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      logger.warn("Document Download API: No authenticated session found");
      return NextResponse.json(
        { error: "Authentication required" },
        { status: 401 }
      );
    }

    const document = await prisma.document.findUnique({
      where: { id, userId: session.user.id },
      select: {
        id: true,
        fileName: true,
        fileUrl: true,
        fileType: true,
        originalName: true,
        content: true,
      },
    });

    if (!document) {
      logger.warn("Document Download API: Document not found or access denied", {
        userId: session.user.id,
        documentId: id,
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
        fileBuffer = Buffer.from(document.content, "utf-8");
        logger.info("Document Download API: Serving from DB content (S3 key not found)", {
          userId: session.user.id,
          documentId: id,
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

    logger.info("Document Download API: File retrieved successfully", {
      userId: session.user.id,
      documentId: id,
      fileSize: fileBuffer.length,
    });

    const headers = new Headers();
    headers.set("Content-Type", document.fileType || "application/octet-stream");
    headers.set("Content-Disposition", `attachment; filename="${document.originalName}"`);
    headers.set("Content-Length", fileBuffer.length.toString());

    return new NextResponse(fileBuffer, { headers });
  } catch (error: any) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    logger.error("Document Download API: Unexpected error", {
      error: errorMessage,
      stack: error.stack,
    });

    const isNotFound =
      error.message?.includes("not found") ||
      error.message?.includes("does not exist") ||
      error.name === "NoSuchKey";
    const status = isNotFound ? 404 : 500;
    return NextResponse.json(
      { error: error.message || "Internal server error" },
      { status }
    );
  }
}
