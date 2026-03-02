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
    });

    if (!document) {
      logger.warn("Document Download API: Document not found or access denied", {
        userId: session.user.id,
        documentId: id,
      });
      return NextResponse.json({ error: "Document not found" }, { status: 404 });
    }

    const fileBuffer = await getDocumentDownloadBuffer(document);

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

    const status = error.message?.includes("not found") ? 404 : 500;
    return NextResponse.json(
      { error: error.message || "Internal server error" },
      { status }
    );
  }
}
