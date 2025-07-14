import { io, Socket } from 'socket.io-client';

// Socket.IO client instance
let socket: Socket | null = null;

// Initialize Socket.IO connection
export const initSocket = (userId?: string, agentId?: string) => {
  if (socket) {
    return socket;
  }

  const socketUrl = process.env.NEXT_PUBLIC_SOCKET_URL || 
    (typeof window !== 'undefined' ? window.location.origin : 'http://localhost:8000');

  socket = io(socketUrl, {
    autoConnect: true,
    transports: ['websocket', 'polling']
  });

  // Connection event handlers
  socket.on('connect', () => {
    console.log('Socket.IO connected:', socket?.id);
  });

  socket.on('disconnect', () => {
    console.log('Socket.IO disconnected');
  });

  socket.on('connect_error', (error) => {
    console.error('Socket.IO connection error:', error);
  });

  return socket;
};

// Get current socket instance
export const getSocket = () => {
  if (!socket) {
    return initSocket();
  }
  return socket;
};

// Join a chat room
export const joinChat = (chatId: string, userId?: string, agentId?: string, role: 'user' | 'agent' = 'user') => {
  const socket = getSocket();
  socket.emit('join', { chatId, userId, agentId, role });
};

// Leave a chat room
export const leaveChat = (chatId: string) => {
  const socket = getSocket();
  socket.emit('leave', { chatId });
};

// Send a chat message
export const sendChatMessage = (chatId: string, message: any) => {
  const socket = getSocket();
  socket.emit('chat_message', { chatId, message });
};

// Update chat status
export const updateChatStatus = (chatId: string, status: string, meta?: any) => {
  const socket = getSocket();
  socket.emit('chat_status', { chatId, status, meta });
};

// Update agent status
export const updateAgentStatus = (agentId: string, isOnline: boolean, isAvailable: boolean) => {
  const socket = getSocket();
  socket.emit('agent_status', { agentId, isOnline, isAvailable });
};

// Listen for chat messages
export const onChatMessage = (callback: (message: any) => void) => {
  const socket = getSocket();
  socket.on('chat_message', callback);
  return () => socket.off('chat_message', callback);
};

// Listen for chat status updates
export const onChatStatus = (callback: (data: { status: string; meta?: any }) => void) => {
  const socket = getSocket();
  socket.on('chat_status', callback);
  return () => socket.off('chat_status', callback);
};

// Listen for agent status updates
export const onAgentStatusUpdate = (callback: (data: { agentId: string; isOnline: boolean; isAvailable: boolean }) => void) => {
  const socket = getSocket();
  socket.on('agent_status_update', callback);
  return () => socket.off('agent_status_update', callback);
};

// Disconnect socket
export const disconnectSocket = () => {
  if (socket) {
    socket.disconnect();
    socket = null;
  }
};

// Clean up all listeners
export const cleanupSocket = () => {
  if (socket) {
    socket.removeAllListeners();
    socket.disconnect();
    socket = null;
  }
}; 