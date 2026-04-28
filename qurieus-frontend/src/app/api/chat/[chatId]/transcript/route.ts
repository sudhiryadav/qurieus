import { NextResponse } from "next/server";
import { prisma } from "@/utils/prismaDB";
import { errorResponse } from "@/utils/responser";
import { logger } from "@/lib/logger";

export const GET = async (request: Request, context: { params: Promise<{ chatId: string }> }) => {
  let chatId = '';
  
  try {
    // Safely extract params with error handling
    let params;
    try {
      params = await context.params;
    } catch (paramsError) {
      logger.error("Chat Transcript API: Failed to extract params", { 
        error: paramsError instanceof Error ? paramsError.message : String(paramsError)
      });
      return errorResponse({ error: "Invalid request parameters", status: 400 });
    }
    
    if (!params || !params.chatId) {
      // Fallback: try to extract chatId from URL
      const url = new URL(request.url);
      const pathParts = url.pathname.split('/');
      const chatIdFromUrl = pathParts[pathParts.length - 2]; // /api/chat/{chatId}/transcript
      
      if (chatIdFromUrl && chatIdFromUrl !== 'transcript') {
        logger.warn("Chat Transcript API: Using chatId from URL as fallback", { 
          params, 
          chatIdFromUrl 
        });
        chatId = chatIdFromUrl;
      } else {
        return errorResponse({ error: "Missing chat ID", status: 400 });
      }
    } else {
      chatId = params.chatId;
    }

    // Get conversation and messages
    const conversation = await prisma.chatConversation.findUnique({
      where: { id: chatId },
      include: {
        messages: {
          orderBy: { createdAt: 'asc' },
          select: {
            content: true,
            role: true,
            createdAt: true,
            agentId: true
          }
        },
        user: {
          select: {
            name: true,
            email: true
          }
        }
      }
    });

    if (!conversation) {
      return errorResponse({ error: "Conversation not found", status: 404 });
    }

    // Format transcript
    const transcriptLines = [
      `Chat Transcript`,
      `Conversation ID: ${chatId}`,
      `Date: ${new Date().toLocaleDateString()}`,
      `Time: ${new Date().toLocaleTimeString()}`,
      `User: ${conversation.user?.name || 'Anonymous'}`,
      `Email: ${conversation.user?.email || 'Not provided'}`,
      ``,
      `--- Messages ---`,
      ``
    ];

    conversation.messages.forEach((message) => {
      const timestamp = new Date(message.createdAt).toLocaleString();
      const role = message.role === 'user' ? 'You' : 
                   message.role === 'assistant' ? 'AI Assistant' : 
                   message.role === 'agent' ? 'Human Agent' : 
                   message.role === 'system' ? 'System' : 'Unknown';
      
      transcriptLines.push(`${timestamp} - ${role}:`);
      transcriptLines.push(message.content);
      transcriptLines.push('');
    });

    const transcript = transcriptLines.join('\n');

    // Return as downloadable file
    return new NextResponse(transcript, {
      status: 200,
      headers: {
        'Content-Type': 'text/plain',
        'Content-Disposition': `attachment; filename="chat-transcript-${chatId}-${new Date().toISOString().split('T')[0]}.txt"`
      }
    });

  } catch (error) {
    logger.error("Chat Transcript API: Error generating transcript", { 
      error: error instanceof Error ? error.message : String(error),
      stack: error instanceof Error ? error.stack : undefined,
      chatId
    });
    return errorResponse({ error: "An error occurred while generating transcript", status: 500 });
  }
}; 