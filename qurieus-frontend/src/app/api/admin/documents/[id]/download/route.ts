import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/utils/auth";
import prisma from "@/lib/prisma";
import s3Service from "@/lib/s3";
import { logger } from "@/lib/logger";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: "Authentication required" },
        { status: 401 }
      );
    }

    // Check if user is admin
    if (session.user.role !== 'ADMIN') {
      logger.warn("Admin Document Download API: User is not admin", {
        userId: session.user.id,
        userRole: session.user.role
      });
      return NextResponse.json(
        { error: "Admin access required" },
        { status: 403 }
      );
    }

    logger.info("Admin Document Download API: Processing download request", { 
      userId: session.user.id,
      documentId: id
    });

    // Find the document (admin can access any document)
    const document = await prisma.document.findUnique({
      where: {
        id,
      },
    });

    logger.info("Admin Document Download API: Database query result", {
      userId: session.user.id,
      documentId: id,
      documentFound: !!document,
      documentData: document ? {
        id: document.id,
        fileName: document.fileName,
        originalName: document.originalName,
        fileType: document.fileType,
        userId: document.userId
      } : null
    });

    if (!document) {
      logger.warn("Admin Document Download API: Document not found", {
        userId: session.user.id,
        documentId: id
      });
      return NextResponse.json(
        { error: "Document not found" },
        { status: 404 }
      );
    }

    // Check if document has S3 key
    if (!document.fileName) {
      logger.error("Admin Document Download API: Document missing S3 key", {
        userId: session.user.id,
        documentId: id
      });
      return NextResponse.json(
        { error: "Document file not found" },
        { status: 404 }
      );
    }

    try {
      // Get the file from S3
      const fileBuffer = await s3Service.getDocumentAsBuffer(document.fileName);
      
      logger.info("Admin Document Download API: File retrieved from S3 successfully", {
        userId: session.user.id,
        documentId: id,
        fileName: document.fileName,
        fileSize: fileBuffer.length
      });

      // Set appropriate headers for file download
      const headers = new Headers();
      headers.set('Content-Type', document.fileType || 'application/octet-stream');
      headers.set('Content-Disposition', `attachment; filename="${document.originalName}"`);
      headers.set('Content-Length', fileBuffer.length.toString());

      // Return the file data
      const responseBody = new Uint8Array(fileBuffer);
      return new NextResponse(responseBody, {
        headers,
      });
    } catch (s3Error: any) {
      const errorMessage = s3Error instanceof Error ? s3Error.message : String(s3Error);
      logger.error("Admin Document Download API: S3 download error", {
        userId: session.user.id,
        documentId: id,
        fileName: document.fileName,
        error: errorMessage
      });
      
      return NextResponse.json(
        { error: "Failed to retrieve file from storage" },
        { status: 500 }
      );
    }
  } catch (error: any) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    logger.error("Admin Document Download API: Unexpected error", {
      error: errorMessage,
      stack: error.stack
    });
    
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
} 