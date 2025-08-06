import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/utils/auth";
import { prisma } from "@/utils/prismaDB";
import { RequireRoles } from '@/utils/roleGuardsDecorator';
import { UserRole } from '@prisma/client';
import { logger } from "@/lib/logger";

export const GET = RequireRoles([UserRole.SUPER_ADMIN])(async (
  request: NextRequest,
  context: { params: Promise<{ userId: string }> }
) => {
  const startTime = Date.now();
  
  try {
    const session = await getServerSession(authOptions);
    const { userId } = await context.params;

    logger.info("User Documents API: Fetching documents for user", { 
      adminId: session!.user!.id, 
      targetUserId: userId 
    });

    // Verify the target user exists
    const targetUser = await prisma.user.findUnique({
      where: { id: userId },
      select: { id: true, name: true, email: true }
    });

    if (!targetUser) {
      logger.warn("User Documents API: Target user not found", { targetUserId: userId });
      return NextResponse.json(
        { error: "User not found" },
        { status: 404 }
      );
    }

    // Fetch documents for the target user
    const documents = await prisma.document.findMany({
      where: {
        userId: userId,
      },
      select: {
        id: true,
        title: true,
        fileName: true,
        originalName: true,
        fileType: true,
        fileSize: true,
        category: true,
        description: true,
        keywords: true,
        uploadedAt: true,
        createdAt: true,
        updatedAt: true,
        qdrantDocumentId: true,
        chunkCount: true,
        isProcessed: true,
        processedAt: true,
        metadata: true,
      },
      orderBy: {
        uploadedAt: 'desc',
      },
    });

    const responseTime = Date.now() - startTime;
    logger.info("User Documents API: Documents fetched successfully", { 
      adminId: session!.user!.id, 
      targetUserId: userId,
      documentCount: documents.length,
      responseTime 
    });

    return NextResponse.json({ 
      documents,
      user: targetUser
    });
  } catch (error: any) {
    const responseTime = Date.now() - startTime;
    logger.error("User Documents API: Error fetching documents", { 
      error: error.message, 
      responseTime,
      stack: error.stack 
    });
    
    console.error("Error fetching user documents:", error);
    return NextResponse.json(
      { error: "Failed to fetch documents" },
      { status: 500 },
    );
  }
}); 