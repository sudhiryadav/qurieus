# Socket.IO Integration for Real-Time Chat

This document explains the Socket.IO integration for real-time chat functionality in the Qurieus application.

## Overview

The application now includes real-time chat capabilities using Socket.IO, allowing:
- Real-time message delivery between users and agents
- Chat status updates (escalation, agent joined, etc.)
- Agent availability status updates
- Presence tracking

## Architecture

### Backend (server.js)
- Custom Next.js server that runs both the Next.js app and Socket.IO server
- Socket.IO server handles chat rooms, message broadcasting, and status updates
- API routes can emit Socket.IO events for real-time updates

### Frontend
- Socket.IO client utilities in `src/utils/socket.ts`
- React hooks in `src/hooks/useSocket.ts` for easy integration
- Automatic connection management and cleanup

## Key Features

### 1. Chat Rooms
- Each chat conversation has its own room
- Users and agents join rooms to receive real-time updates
- Messages are broadcast to all participants in the room

### 2. Event Types
- `chat_message`: New message in a chat
- `chat_status`: Status updates (escalated, agent joined, etc.)
- `agent_status`: Agent availability updates

### 3. Real-Time Updates
- When a chat is escalated, users are notified immediately
- When an agent joins a chat, users see the notification
- Agent messages appear instantly for users

## Usage

### In React Components

```tsx
import { useSocket, useChatMessages, useChatStatus } from '@/hooks/useSocket';

function ChatComponent({ chatId, userId }) {
  const { sendMessage, isConnected } = useSocket({
    chatId,
    userId,
    role: 'user'
  });

  const messages = useChatMessages(chatId);
  const { status, meta } = useChatStatus(chatId);

  const handleSendMessage = (content) => {
    sendMessage(content);
  };

  return (
    <div>
      <div>Connection: {isConnected ? 'Connected' : 'Disconnected'}</div>
      <div>Status: {status}</div>
      {/* Chat UI */}
    </div>
  );
}
```

### In API Routes

```tsx
// Emit a message to a chat room
const io = (global as any).io;
if (io) {
  io.to(chatId).emit('chat_message', messageData);
}
```

## Deployment

### Environment Variables
- `NEXT_PUBLIC_SOCKET_URL`: Socket.IO server URL (optional, defaults to same origin)
- `SOCKET_PORT`: Port for Socket.IO server (defaults to 8000)

### Docker Deployment
The Socket.IO server is integrated into the main application server, so no additional containers are needed.

### Production Considerations
1. **CORS**: Configure CORS origins in production
2. **Load Balancing**: Socket.IO supports sticky sessions for load balancing
3. **Redis Adapter**: For horizontal scaling, consider adding Redis adapter
4. **Monitoring**: Monitor Socket.IO connection counts and performance

## API Integration

### Agent Message API
- `POST /api/agent/chats/[chatId]/messages`
- Automatically emits Socket.IO events when messages are posted
- Updates chat status when agent joins

### Query API
- Automatically emits escalation events when AI cannot answer
- Notifies users in real-time when chat is escalated

## Troubleshooting

### Common Issues
1. **Connection Failed**: Check CORS settings and Socket.IO server URL
2. **Messages Not Received**: Verify room joining and event listeners
3. **Memory Leaks**: Ensure proper cleanup in useEffect hooks

### Debug Mode
Enable debug logging by setting `NODE_ENV=development` to see Socket.IO connection logs.

## Future Enhancements

1. **File Uploads**: Real-time file sharing in chats
2. **Typing Indicators**: Show when someone is typing
3. **Read Receipts**: Track message read status
4. **Push Notifications**: Browser notifications for new messages
5. **Chat History**: Real-time sync of chat history 