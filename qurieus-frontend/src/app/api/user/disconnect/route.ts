import { NextRequest, NextResponse } from "next/server";
import { logger } from "@/lib/logger";
import { handleUserDisconnect } from "@/lib/agentChatRecovery";
import { errorResponse } from "@/utils/responser";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { conversationId, visitorId } = body;

    if (!conversationId) {
      return errorResponse({ 
        error: "conversationId is required", 
        status: 400 
      });
    }

    logger.info("User Disconnect API: Processing disconnect", { 
      conversationId, 
      visitorId 
    });

    // Handle the user disconnect
    const success = await handleUserDisconnect(conversationId);

    if (success) {
      logger.info("User Disconnect API: Successfully processed disconnect", { 
        conversationId 
      });
      
      return NextResponse.json({ 
        success: true, 
        message: "User disconnect processed successfully" 
      });
    } else {
      logger.info("User Disconnect API: No action needed for disconnect", { 
        conversationId 
      });
      
      return NextResponse.json({ 
        success: true, 
        message: "No action needed" 
      });
    }

  } catch (error) {
    logger.error("User Disconnect API: Error processing disconnect", { 
      error: error instanceof Error ? error.message : String(error)
    });
    
    return errorResponse({ 
      error: "An error occurred while processing disconnect", 
      status: 500 
    });
  }
} 