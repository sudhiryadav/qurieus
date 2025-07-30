import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/utils/auth";
import { prisma } from "@/utils/prismaDB";
import { logger } from "@/lib/logger";
import { RequireRoles } from '@/utils/roleGuardsDecorator';
import { UserRole } from '@prisma/client';
import { getDocumentChunks, getDocumentStats } from "@/utils/documentTracing";

export const GET = RequireRoles([UserRole.SUPER_ADMIN, UserRole.USER])(async (
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) => {
  const startTime = Date.now();
  let userId: string | undefined;
  
  try {
    const session = await getServerSession(authOptions);
    userId = session!.user!.id;
    const { id: documentId } = await context.params;

    logger.info("Document Chunks API: Fetching chunks", { userId, documentId });

    // Verify document ownership
    const document = await prisma.document.findFirst({
      where: {
        id: documentId,
        userId: userId,
      },
      select: {
        id: true,
        title: true,
        originalName: true,
        chunkCount: true,
        isProcessed: true,
        processedAt: true,
        qdrantDocumentId: true,
      },
    });

    if (!document) {
      logger.warn("Document Chunks API: Document not found", { userId, documentId });
      return NextResponse.json(
        { error: "Document not found" },
        { status: 404 }
      );
    }

    // Get document stats
    const stats = await getDocumentStats(documentId, userId);
    
    // Get chunks
    const chunks = await getDocumentChunks(documentId, userId);

    const responseTime = Date.now() - startTime;
    logger.info("Document Chunks API: Chunks fetched successfully", { 
      userId, 
      documentId,
      chunkCount: chunks.length,
      responseTime 
    });

    return NextResponse.json({
      document: {
        id: document.id,
        title: document.title,
        fileName: document.originalName,
        chunkCount: document.chunkCount,
        isProcessed: document.isProcessed,
        processedAt: document.processedAt,
        qdrantDocumentId: document.qdrantDocumentId,
      },
      stats,
      chunks,
      totalChunks: chunks.length,
    });
  } catch (error: any) {
    const responseTime = Date.now() - startTime;
    logger.error("Document Chunks API: Error fetching chunks", { 
      userId, 
      error: error.message, 
      responseTime,
      stack: error.stack 
    });
    
    console.error("Error fetching document chunks:", error);
    return NextResponse.json(
      { error: "Failed to fetch document chunks" },
      { status: 500 }
    );
  }
}); 