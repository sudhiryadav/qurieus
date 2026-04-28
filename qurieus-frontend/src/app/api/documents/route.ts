import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/utils/auth";
import { logger } from "@/lib/logger";
import { fetchUserDocuments } from "@/lib/documentService";

export async function GET(request: Request) {
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

    // Fetch documents for the current user
    const { documents } = await fetchUserDocuments({ userId });

    const responseTime = Date.now() - startTime;
    logger.info("Documents API: Documents fetched successfully", { 
      userId, 
      documentCount: documents.length,
      responseTime 
    });

    return NextResponse.json({ documents });
  } catch (error: any) {
    const responseTime = Date.now() - startTime;
    logger.error("Documents API: Error fetching documents", { 
      error: error.message, 
      responseTime,
      stack: error.stack 
    });
    
    return NextResponse.json(
      { error: "Failed to fetch documents" },
      { status: 500 }
    );
  }
}

