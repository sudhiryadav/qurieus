import { NextResponse } from "next/server";
import { authOptions } from "@/utils/auth";
import { prisma } from "@/utils/prismaDB";
import { errorResponse } from "@/utils/responser";
import { getServerSession } from "next-auth";
import { logger } from "@/lib/logger";
import { RequireRoles } from "@/utils/roleGuardsDecorator";
import { UserRole, AgentChatStatus } from "@prisma/client";
import { sendEmail } from "@/lib/email";

export const PUT = RequireRoles([UserRole.AGENT])(async (request: Request, context: { params: Promise<{ chatId: string }> }) => {
  let agentId = '';
  let chatId = '';
  let newStatus = '';
  
  try {
    const session = await getServerSession(authOptions);
    agentId = session!.user!.id;
    
    // Safely extract params with error handling
    let params;
    try {
      params = await context.params;
    } catch (paramsError) {
      logger.error("Agent Status API: Failed to extract params", { 
        error: paramsError instanceof Error ? paramsError.message : String(paramsError)
      });
      return errorResponse({ error: "Invalid request parameters", status: 400 });
    }
    
    if (!params || !params.chatId) {
      // Fallback: try to extract chatId from URL
      const url = new URL(request.url);
      const pathParts = url.pathname.split('/');
      const chatIdFromUrl = pathParts[pathParts.length - 2]; // /api/agent/chats/{chatId}/status
      
      if (chatIdFromUrl && chatIdFromUrl !== 'status') {
        logger.warn("Agent Status API: Using chatId from URL as fallback", { 
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

    const body = await request.json();
    newStatus = body.status;

    if (!newStatus || !['RESOLVED', 'CLOSED'].includes(newStatus)) {
      return errorResponse({ error: "Invalid status. Must be 'RESOLVED' or 'CLOSED'", status: 400 });
    }

    // Convert string to enum value
    const statusEnum = newStatus as AgentChatStatus;

    // Verify agent is assigned to this chat
    const agentChat = await prisma.agentChat.findUnique({
      where: { conversationId: chatId },
      select: { agentId: true, status: true, conversationId: true }
    });

    if (!agentChat || agentChat.agentId !== agentId) {
      return errorResponse({ error: "Access denied - Not assigned to this chat", status: 403 });
    }

    if (agentChat.status === AgentChatStatus.CLOSED) {
      return errorResponse({ error: "Chat is already closed", status: 400 });
    }

    // Update chat status
    const updatedChat = await prisma.agentChat.update({
      where: { conversationId: chatId },
      data: { 
        status: statusEnum,
        endedAt: new Date()
      }
    });

    // Get conversation and user info for notifications
    const conversation = await prisma.chatConversation.findUnique({
      where: { id: chatId },
      select: {
        user: { select: { email: true, name: true } },
        visitorId: true,
      }
    });

    // Add a system message to the conversation to notify the user
    const completionMessage = statusEnum === 'RESOLVED' 
      ? `✅ Your chat has been resolved by ${session!.user!.name}. Thank you for contacting us!`
      : `🔒 Your chat has been closed by ${session!.user!.name}. If you need further assistance, please start a new conversation.`;

    await prisma.chatMessage.create({
      data: {
        conversationId: chatId,
        content: completionMessage,
        role: 'system',
        createdAt: new Date()
      }
    });

    // If chat is resolved, send email notification to the user
    if (statusEnum === 'RESOLVED' && conversation?.user?.email) {
      await sendEmail({
        to: conversation.user.email,
        subject: 'Your support chat has been resolved',
        template: 'chat-resolved-notification',
        context: {
          userName: conversation.user.name || 'User',
          chatId,
          agentName: session!.user!.name,
        },
      });
    }

    // Emit Socket.IO event for real-time updates
    try {
      const io = (global as any).io;
      if (io) {
        io.to(chatId).emit('chat_status', {
          status: newStatus.toLowerCase(),
          meta: { 
            agentId, 
            agentName: session!.user!.name,
            completionMessage,
            chatCompleted: true
          }
        });
      }
    } catch (socketError) {
      logger.warn("Agent Status API: Failed to emit Socket.IO event", { 
        error: socketError instanceof Error ? socketError.message : String(socketError)
      });
    }

    logger.info("Agent Status API: Chat status updated", { 
      agentId, 
      chatId, 
      oldStatus: agentChat.status, 
      newStatus 
    });

    return NextResponse.json({ 
      success: true, 
      chat: updatedChat,
      message: `Chat marked as ${newStatus.toLowerCase()}`
    });

  } catch (error) {
    logger.error("Agent Status API: Error updating chat status", { 
      error: error instanceof Error ? error.message : String(error),
      stack: error instanceof Error ? error.stack : undefined,
      agentId,
      chatId,
      newStatus
    });
    return errorResponse({ error: "An error occurred while updating chat status", status: 500 });
  }
}); 