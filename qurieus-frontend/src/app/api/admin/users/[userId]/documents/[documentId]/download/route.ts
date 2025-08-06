import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/utils/auth";
import { prisma } from "@/utils/prismaDB";
import { RequireRoles } from '@/utils/roleGuardsDecorator';
import { UserRole } from '@prisma/client';
import { logger } from "@/lib/logger";

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
      documentId 
    });

    // Verify the target user exists
    const targetUser = await prisma.user.findUnique({
      where: { id: userId },
      select: { id: true, name: true, email: true }
    });

    if (!targetUser) {
      logger.warn("Admin Download API: Target user not found", { targetUserId: userId });
      return NextResponse.json(
        { error: "User not found" },
        { status: 404 }
      );
    }

    // Find the document belonging to the target user
    const document = await prisma.document.findFirst({
      where: {
        id: documentId,
        userId: userId,
      },
    });

    if (!document) {
      logger.warn("Admin Download API: Document not found", { 
        documentId, 
        targetUserId: userId 
      });
      return NextResponse.json(
        { error: "Document not found" },
        { status: 404 }
      );
    }

    // Set appropriate headers for file download
    const headers = new Headers();
    headers.set('Content-Type', document.fileType || 'application/octet-stream');
    headers.set('Content-Disposition', `attachment; filename="${document.originalName || document.fileName}"`);

    logger.info("Admin Download API: Document download successful", { 
      adminId: session!.user!.id, 
      targetUserId: userId,
      documentId,
      fileName: document.originalName || document.fileName
    });

    // Return the file data
    return new NextResponse(document.content, {
      headers,
    });
  } catch (error: any) {
    logger.error("Admin Download API: Error downloading document", { 
      error: error.message,
      stack: error.stack 
    });
    
    return NextResponse.json(
      { error: "Failed to download document" },
      { status: 500 }
    );
  }
}); 