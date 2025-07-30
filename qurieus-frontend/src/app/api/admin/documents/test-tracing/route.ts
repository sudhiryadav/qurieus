import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/utils/auth";
import { prisma } from "@/utils/prismaDB";
import { logger } from "@/lib/logger";
import { RequireRoles } from '@/utils/roleGuardsDecorator';
import { UserRole } from '@prisma/client';
import { traceQdrantResults } from "@/utils/documentTracing";

export const POST = RequireRoles([UserRole.SUPER_ADMIN])(async (request: NextRequest) => {
  const startTime = Date.now();
  let userId: string | undefined;
  
  try {
    const session = await getServerSession(authOptions);
    userId = session!.user!.id;
    const body = await request.json();
    const { qdrantResults } = body;

    logger.info("Test Tracing API: Testing document tracing", { userId });

    if (!qdrantResults || !Array.isArray(qdrantResults)) {
      return NextResponse.json(
        { error: "qdrantResults array is required" },
        { status: 400 }
      );
    }

    // Test the tracing functionality
    const tracedResults = await traceQdrantResults(qdrantResults, userId);

    // Get some sample documents to verify the schema
    const sampleDocuments = await prisma.document.findMany({
      where: {
        userId: userId,
      },
      select: {
        id: true,
        title: true,
        qdrantDocumentId: true,
        chunkCount: true,
        isProcessed: true,
        chunks: {
          select: {
            id: true,
            chunkIndex: true,
            qdrantPointId: true,
          },
          take: 3,
        },
      },
      take: 3,
    });

    const responseTime = Date.now() - startTime;
    logger.info("Test Tracing API: Tracing test completed", { 
      userId, 
      tracedResultsCount: tracedResults.length,
      sampleDocumentsCount: sampleDocuments.length,
      responseTime 
    });

    return NextResponse.json({
      success: true,
      tracedResults,
      sampleDocuments,
      message: "Document tracing test completed successfully",
    });
  } catch (error: any) {
    const responseTime = Date.now() - startTime;
    logger.error("Test Tracing API: Error during tracing test", { 
      userId, 
      error: error.message, 
      responseTime,
      stack: error.stack 
    });
    
    console.error("Error during tracing test:", error);
    return NextResponse.json(
      { error: "Failed to test document tracing", details: error.message },
      { status: 500 }
    );
  }
}); 