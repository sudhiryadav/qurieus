import { NextResponse } from "next/server";
import { authOptions } from "@/utils/auth";
import { prisma } from "@/utils/prismaDB";
import { errorResponse } from "@/utils/responser";
import { getServerSession } from "next-auth";
import { logger } from "@/lib/logger";
import { RequireRoles } from "@/utils/roleGuardsDecorator";
import { UserRole } from "@prisma/client";

export const POST = RequireRoles([UserRole.AGENT])(async (request: Request, context: { params: Promise<{ chatId: string }> }) => {
  let agentId = '';
  let chatId = '';
  let content = '';
  
  try {
    const session = await getServerSession(authOptions);
    agentId = session!.user!.id;
    const params = await context.params;
    chatId = params.chatId;
    const body = await request.json();
    content = body.content;
    if (!content || typeof content !== 'string' || !content.trim()) {
      return errorResponse({ error: "Message content required", status: 400 });
    }

    // Verify conversation exists
    const conversation = await prisma.chatConversation.findUnique({
      where: { id: chatId },
      select: { id: true }
    });
    
    if (!conversation) {
      logger.error("Agent Message API: Conversation not found", { chatId });
      return errorResponse({ error: "Conversation not found", status: 404 });
    }

    // Verify agent is assigned to this chat
    const agentChat = await prisma.agentChat.findUnique({
      where: { conversationId: chatId },
      select: { agentId: true, status: true, conversationId: true }
    });
    if (!agentChat || agentChat.agentId !== agentId) {
      logger.warn("Agent Message API: Agent not assigned to chat", { agentId, chatId });
      return errorResponse({ error: "Access denied - Not assigned to this chat", status: 403 });
    }
    if (agentChat.status === "RESOLVED" || agentChat.status === "CLOSED") {
      return errorResponse({ error: "Cannot post to a resolved or closed chat", status: 400 });
    }

    // Verify agent exists in User table
    const agentUser = await prisma.user.findUnique({
      where: { id: agentId },
      select: { id: true, role: true }
    });
    
    if (!agentUser) {
      logger.error("Agent Message API: Agent user not found", { agentId });
      return errorResponse({ error: "Agent not found", status: 404 });
    }
    
    if (agentUser.role !== "AGENT") {
      logger.error("Agent Message API: User is not an agent", { agentId, role: agentUser.role });
      return errorResponse({ error: "User is not an agent", status: 403 });
    }

    // Create chat message as agent
    logger.info("Agent Message API: Creating message", { 
      conversationId: chatId,
      content: content.substring(0, 100) + (content.length > 100 ? '...' : ''),
      role: 'agent',
      agentId
    });
    
    const message = await prisma.chatMessage.create({
      data: {
        conversationId: chatId,
        content,
        role: 'agent',
        agentId: agentId
      }
    });

    // Optionally, update chat status to ACTIVE if first agent message
    if (agentChat.status === "PENDING") {
      await prisma.agentChat.update({
        where: { conversationId: chatId },
        data: { status: "ACTIVE" }
      });
    }

    // Emit Socket.IO event for real-time updates
    try {
      const io = (global as any).io;
      if (io) {
        io.to(chatId).emit('chat_message', {
          id: message.id,
          content: message.content,
          role: message.role,
          agentId: message.agentId,
          createdAt: message.createdAt,
          conversationId: message.conversationId
        });

        // If this is the first agent message, emit status update
        if (agentChat.status === "PENDING") {
          io.to(chatId).emit('chat_status', {
            status: 'agent_joined',
            meta: { agentId, agentName: session!.user!.name }
          });
        }
      }
    } catch (socketError) {
      logger.warn("Agent Message API: Failed to emit Socket.IO event", { 
        error: socketError instanceof Error ? socketError.message : String(socketError)
      });
    }

    logger.info("Agent Message API: Agent posted message", { agentId, chatId, messageId: message.id });
    return NextResponse.json({ success: true, message });
  } catch (error) {
    logger.error("Agent Message API: Error posting message", { 
      error: error instanceof Error ? error.message : String(error),
      stack: error instanceof Error ? error.stack : undefined,
      agentId,
      chatId,
      content: content?.substring(0, 100) + (content?.length > 100 ? '...' : '')
    });
    return errorResponse({ error: "An error occurred while posting message", status: 500 });
  }
}); 