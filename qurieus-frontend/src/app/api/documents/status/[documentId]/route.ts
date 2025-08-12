import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/utils/auth";
import { logger } from "@/lib/logger";
import axios from "axios";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ documentId: string }> }
) {
  const startTime = Date.now();
  
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.id) {
      logger.warn("Document Status API: No authenticated session found");
      return NextResponse.json(
        { error: "Authentication required" },
        { status: 401 }
      );
    }

    const { documentId } = await params;

    logger.info("Document Status API: Checking document status", { 
      userId: session.user.id,
      documentId
    });

    // Get document status from FastAPI backend
    const backendResponse = await axios.get(
      `${process.env.BACKEND_URL}/api/v1/documents/status/${documentId}`,
      {
        headers: {
          "X-API-Key": process.env.BACKEND_API_KEY!,
        },
      }
    );

    logger.info("Document Status API: FastAPI backend response received", {
      status: backendResponse.status,
      data: backendResponse.data
    });

    const responseTime = Date.now() - startTime;
    logger.info("Document Status API: Status check completed successfully", { 
      userId: session.user.id,
      documentId,
      responseTime 
    });
    
    return NextResponse.json(backendResponse.data);
  } catch (error: any) {
    const responseTime = Date.now() - startTime;
    logger.error("Document Status API: Error checking document status", { 
      error: error.message, 
      responseTime,
      stack: error.stack 
    });
    
    console.error("Error checking document status:", {
      error: error.message,
      stack: error.stack,
      cause: error.cause,
    });

    return NextResponse.json(
      {
        error: "Failed to check document status",
        details: error.message,
      },
      { status: 500 },
    );
  }
}

