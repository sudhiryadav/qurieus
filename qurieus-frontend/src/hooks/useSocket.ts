import { useEffect, useRef, useCallback, useState } from 'react';
import { 
  initSocket, 
  joinChat, 
  leaveChat, 
  sendChatMessage, 
  onChatMessage, 
  onChatStatus,
  onAgentStatusUpdate,
  disconnectSocket,
  cleanupSocket
} from '@/utils/socket';

interface UseSocketOptions {
  chatId?: string;
  userId?: string;
  agentId?: string;
  role?: 'user' | 'agent';
  autoConnect?: boolean;
}

interface UseSocketReturn {
  sendMessage: (content: string) => void;
  joinChatRoom: (chatId: string) => void;
  leaveChatRoom: (chatId: string) => void;
  isConnected: boolean;
}

export const useSocket = ({
  chatId,
  userId,
  agentId,
  role = 'user',
  autoConnect = true
}: UseSocketOptions = {}): UseSocketReturn => {
  const socketRef = useRef<any>(null);
  const isConnectedRef = useRef(false);

  // Initialize socket connection
  useEffect(() => {
    if (autoConnect) {
      socketRef.current = initSocket(userId, agentId);
      
      socketRef.current.on('connect', () => {
        isConnectedRef.current = true;
      });

      socketRef.current.on('disconnect', () => {
        isConnectedRef.current = false;
      });
    }

    return () => {
      if (socketRef.current) {
        cleanupSocket();
      }
    };
  }, [autoConnect, userId, agentId]);

  // Join chat room when chatId changes
  useEffect(() => {
    if (chatId && socketRef.current && isConnectedRef.current) {
      joinChat(chatId, userId, agentId, role);
    }
  }, [chatId, userId, agentId, role]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (chatId) {
        leaveChat(chatId);
      }
    };
  }, [chatId]);

  const sendMessage = useCallback((content: string) => {
    if (chatId && socketRef.current) {
      sendChatMessage(chatId, {
        content,
        timestamp: new Date().toISOString(),
        senderId: userId || agentId,
        role
      });
    }
  }, [chatId, userId, agentId, role]);

  const joinChatRoom = useCallback((newChatId: string) => {
    if (socketRef.current && isConnectedRef.current) {
      joinChat(newChatId, userId, agentId, role);
    }
  }, [userId, agentId, role]);

  const leaveChatRoom = useCallback((chatIdToLeave: string) => {
    if (socketRef.current) {
      leaveChat(chatIdToLeave);
    }
  }, []);

  return {
    sendMessage,
    joinChatRoom,
    leaveChatRoom,
    isConnected: isConnectedRef.current
  };
};

  // Hook for listening to chat messages
export const useChatMessages = (chatId?: string) => {
  const [messages, setMessages] = useState<any[]>([]);

  useEffect(() => {
    if (!chatId) return;

    const unsubscribe = onChatMessage((message) => {
      if (message.conversationId === chatId) {
        setMessages((prev: any[]) => {
          // Check if message already exists by ID or content + timestamp
          const exists = prev.some(existingMsg => 
            existingMsg.id === message.id || 
            (existingMsg.content === message.content && 
             Math.abs(new Date(existingMsg.createdAt).getTime() - new Date(message.createdAt).getTime()) < 5000) // Within 5 seconds
          );
          
          if (!exists) {
            return [...prev, message];
          }
          return prev;
        });
      }
    });

    return () => {
      if (unsubscribe) unsubscribe();
    };
  }, [chatId]);

  return messages;
};

// Hook for listening to chat status updates
export const useChatStatus = (chatId?: string) => {
  const [status, setStatus] = useState<string>('active');
  const [meta, setMeta] = useState<any>(null);

  useEffect(() => {
    if (!chatId) return;

    const unsubscribe = onChatStatus((data) => {
      setStatus(data.status);
      setMeta(data.meta);
    });

    return () => {
      if (unsubscribe) unsubscribe();
    };
  }, [chatId]);

  return { status, meta };
};

// Hook for listening to agent status updates
export const useAgentStatus = () => {
  const [agentStatuses, setAgentStatuses] = useState<Record<string, { isOnline: boolean; isAvailable: boolean }>>({});

  useEffect(() => {
    const unsubscribe = onAgentStatusUpdate((data) => {
      setAgentStatuses((prev: Record<string, { isOnline: boolean; isAvailable: boolean }>) => ({
        ...prev,
        [data.agentId]: {
          isOnline: data.isOnline,
          isAvailable: data.isAvailable
        }
      }));
    });

    return () => {
      if (unsubscribe) unsubscribe();
    };
  }, []);

  return agentStatuses;
}; 