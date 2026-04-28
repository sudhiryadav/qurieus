import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/utils/auth";
import { prisma } from "@/utils/prismaDB";
import { logger } from "@/lib/logger";

export async function GET(
  request: NextRequest,
  context: { params: Promise<{ aiDocumentId: string }> }
) {
  const startTime = Date.now();
  
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: "Authentication required" },
        { status: 401 }
      );
    }

    const userId = session.user.id;
    const userRole = (session.user as { role?: string })?.role;
    const isAdmin = userRole === 'ADMIN' || userRole === 'SUPER_ADMIN';
    const { aiDocumentId } = await context.params;

    logger.info("Document Status API: Checking status for AI document", { 
      userId, 
      aiDocumentId,
      isAdmin 
    });

    // Check if the document exists. Admins can check any document (e.g. when uploading for another user).
    const document = await prisma.document.findFirst({
      where: isAdmin
        ? { aiDocumentId }
        : { aiDocumentId, userId },
      select: {
        id: true,
        title: true,
        status: true,
        isProcessed: true,
        processedAt: true,
        content: true,
      },
    });

    if (!document) {
      logger.warn("Document Status API: Document not found", { 
        userId, 
        aiDocumentId 
      });
      return NextResponse.json(
        { error: "Document not found" },
        { status: 404 }
      );
    }

    // Check processing status from AI service (FastAPI)
    try {
      const aiServiceUrl = process.env.BACKEND_URL;
      const aiApiKey = process.env.BACKEND_API_KEY;

      if (!aiServiceUrl || !aiApiKey) {
        throw new Error("AI service not configured");
      }

      const response = await fetch(
        `${aiServiceUrl}/api/v1/documents/status/${aiDocumentId}`,
        {
          method: 'GET',
          headers: {
            'X-API-Key': aiApiKey,
          },
        },
      );

      if (!response.ok) {
        const errorText = await response.text();
        logger.error("Document Status API: AI service error", { 
          userId, 
          status: response.status, 
          error: errorText 
        });
        throw new Error(`AI service error: ${response.status} - ${errorText}`);
      }

      const result = await response.json();

      // If processing is complete, update the database
      if (result.status?.status === 'COMPLETED') {
        logger.info("Document Status API: Processing completed, updating database", {
          userId,
          documentId: document.id,
          aiDocumentId,
        });

        await prisma.document.update({
          where: { id: document.id },
          data: {
            status: 'PROCESSED',
            isProcessed: true,
            processedAt: new Date(),
            content: result.status.content || null,
          },
        });

        // Update the document object for response
        document.status = 'PROCESSED';
        document.isProcessed = true;
        document.processedAt = new Date();
        document.content = result.status.content || null;
      } else if (
        result.status?.status === 'NOT_FOUND' &&
        document.status === 'PROCESSING'
      ) {
        // Backend keeps status in memory only; NOT_FOUND usually means backend restarted
        // or processing finished and state was lost. Unstick the document so the UI updates.
        logger.info("Document Status API: Backend returned NOT_FOUND for PROCESSING document, marking as PROCESSED", {
          userId,
          documentId: document.id,
          aiDocumentId,
        });

        await prisma.document.update({
          where: { id: document.id },
          data: {
            status: 'PROCESSED',
            isProcessed: true,
            processedAt: new Date(),
          },
        });

        document.status = 'PROCESSED';
        document.isProcessed = true;
        document.processedAt = new Date();
      }

      const responseTime = Date.now() - startTime;
      logger.info("Document Status API: Status check completed", { 
        userId, 
        documentId: document.id,
        aiDocumentId,
        status: document.status,
        responseTime 
      });

      return NextResponse.json({
        success: true,
        document: {
          id: document.id,
          title: document.title,
          status: document.status,
          isProcessed: document.isProcessed,
          processedAt: document.processedAt,
          content: document.content,
        },
        aiServiceStatus: result.status,
      });

    } catch (error) {
      logger.error("Document Status API: Error checking AI service status", { 
        userId, 
        aiDocumentId,
        error: error instanceof Error ? error.message : String(error) 
      });

      // Return current database status even if AI service check fails
      return NextResponse.json({
        success: true,
        document: {
          id: document.id,
          title: document.title,
          status: document.status,
          isProcessed: document.isProcessed,
          processedAt: document.processedAt,
          content: document.content,
        },
        aiServiceStatus: null,
        error: "Failed to check AI service status",
      });
    }

  } catch (error: any) {
    const responseTime = Date.now() - startTime;
    logger.error("Document Status API: Status check failed", { 
      error: error.message, 
      responseTime,
      stack: error.stack 
    });
    
    return NextResponse.json(
      { error: "Failed to check document status" },
      { status: 500 }
    );
  }
}
