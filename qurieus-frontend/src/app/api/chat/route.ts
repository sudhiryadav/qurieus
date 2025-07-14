import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/utils/auth";
import axios from "@/lib/axios";
import { logger } from "@/lib/logger";
import { RequireUser } from '@/utils/roleGuardsDecorator';

export const POST = RequireUser("Chat API")(async (request: Request, user: any) => {
  const startTime = Date.now();
  const userId = user.id;
  
  try {
    const body = await request.json();
    const { message, documentId } = body;

    logger.info("Chat API: Processing chat message", { 
      userId, 
      documentId, 
      messageLength: message?.length || 0 
    });

    if (!message) {
      logger.warn("Chat API: Missing message in request", { userId });
      return NextResponse.json(
        { error: "Message is required" },
        { status: 400 }
      );
    }

    const response = await axios.post(
      `${process.env.BACKEND_URL}/api/chat`,
      {
        message,
        userId: userId,
        documentId,
      },
      {
        responseType: "stream",
      }
    );

    const responseTime = Date.now() - startTime;
    logger.info("Chat API: Chat message processed successfully", { 
      userId, 
      documentId, 
      responseTime 
    });

    return new NextResponse(response.data, {
      headers: {
        "Content-Type": "text/event-stream",
        "Cache-Control": "no-cache",
        Connection: "keep-alive",
      },
    });
  } catch (error: any) {
    const responseTime = Date.now() - startTime;
    logger.error("Chat API: Error processing chat message", { 
      userId, 
      error: error.message, 
      responseTime,
      stack: error.stack 
    });
    
    console.error("Error in chat:", error);
    return NextResponse.json(
      { error: error.response?.data?.error || "Failed to process chat message" },
      { status: error.response?.status || 500 }
    );
  }
}); 