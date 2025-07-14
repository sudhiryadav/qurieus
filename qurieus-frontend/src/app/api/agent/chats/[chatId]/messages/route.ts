import { NextResponse } from "next/server";
import { authOptions } from "@/utils/auth";
import { prisma } from "@/utils/prismaDB";
import { errorResponse } from "@/utils/responser";
import { getServerSession } from "next-auth";
import { logger } from "@/lib/logger";
import { RequireRoles } from "@/utils/roleGuardsDecorator";
import { UserRole } from "@prisma/client";

export const POST = RequireRoles([UserRole.AGENT])(async (request: Request, context: { params: Promise<{ chatId: string }> }) => {
  try {
    const session = await getServerSession(authOptions);
    const agentId = session!.user!.id;
    const { chatId } = await context.params;
    const body = await request.json();
    const { content } = body;
    if (!content || typeof content !== 'string' || !content.trim()) {
      return errorResponse({ error: "Message content required", status: 400 });
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

    // Create chat message as agent
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
      error: error instanceof Error ? error.message : String(error)
    });
    return errorResponse({ error: "An error occurred while posting message", status: 500 });
  }
}); 