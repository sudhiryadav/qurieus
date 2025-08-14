import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/utils/auth";
import { RequireRoles } from '@/utils/roleGuardsDecorator';
import { UserRole } from '@prisma/client';
import { logger } from "@/lib/logger";
import { fetchUserDocuments } from "@/lib/documentService";

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

    // Fetch documents for the target user with user info
    const { documents, user } = await fetchUserDocuments({ 
      userId, 
      includeUserInfo: true 
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
      user
    });
  } catch (error: any) {
    const responseTime = Date.now() - startTime;
    logger.error("User Documents API: Error fetching documents", { 
      error: error.message, 
      responseTime,
      stack: error.stack 
    });
    
    console.error("Error fetching user documents:", error);
    
    // Handle specific error for user not found
    if (error.message === "User not found") {
      return NextResponse.json(
        { error: "User not found" },
        { status: 404 }
      );
    }
    
    return NextResponse.json(
      { error: "Failed to fetch documents" },
      { status: 500 },
    );
  }
}); 