const { createServer } = require('http');
const { parse } = require('url');
const next = require('next');
const { Server } = require('socket.io');

const dev = process.env.NODE_ENV !== 'production';
const hostname = 'localhost';
const port = process.env.PORT || 8000;

// Prepare the Next.js app
const app = next({ dev, hostname, port });
const handle = app.getRequestHandler();

app.prepare().then(() => {
  const server = createServer(async (req, res) => {
    try {
      const parsedUrl = parse(req.url, true);
      await handle(req, res, parsedUrl);
    } catch (err) {
      console.error('Error occurred handling', req.url, err);
      res.statusCode = 500;
      res.end('internal server error');
    }
  });

  // Create Socket.IO server attached to the same HTTP server
  const io = new Server(server, {
    cors: {
      origin: process.env.NODE_ENV === 'production' 
        ? [process.env.NEXT_PUBLIC_APP_URL, process.env.FRONTEND_URL].filter(Boolean)
        : '*',
      methods: ['GET', 'POST']
    }
  });

  // Socket.IO event handlers
  const userSockets = new Map();

  io.on('connection', (socket) => {
    console.log('Client connected:', socket.id);

    // Join chat room
    socket.on('join', ({ chatId, userId, agentId, role }) => {
      console.log('Socket.IO: Join request received:', { chatId, userId, agentId, role });
      if (chatId) {
        socket.join(chatId);
        console.log(`${role} joined chat room:`, chatId);
        console.log('Socket.IO: Room members:', io.sockets.adapter.rooms.get(chatId)?.size || 0);
      }
      if (userId) userSockets.set(userId, socket.id);
      if (agentId) userSockets.set(agentId, socket.id);
    });

    // Handle chat message event
    socket.on('chat_message', ({ chatId, message }) => {
      if (chatId && message) {
        // Broadcast to all in the chat room (except sender)
        socket.to(chatId).emit('chat_message', message);
        console.log('Message broadcasted to chat:', chatId);
      }
    });

    // Handle chat status update (e.g., agent joined, chat resolved)
    socket.on('chat_status', ({ chatId, status, meta }) => {
      if (chatId && status) {
        io.to(chatId).emit('chat_status', { status, meta });
        console.log('Status update broadcasted to chat:', chatId, status);
      }
    });

    // Handle agent availability updates
    socket.on('agent_status', ({ agentId, isOnline, isAvailable }) => {
      // Broadcast to relevant parties (e.g., admin dashboard)
      socket.broadcast.emit('agent_status_update', { agentId, isOnline, isAvailable });
    });

    socket.on('disconnect', () => {
      console.log('Client disconnected:', socket.id);
      // Remove from presence map
      for (const [id, sockId] of userSockets.entries()) {
        if (sockId === socket.id) userSockets.delete(id);
      }
    });
  });

  // Make io available globally for API routes
  global.io = io;

  server.listen(port, () => {
    console.log(`> Ready on http://${hostname}:${port}`);
    console.log(`> Socket.IO server running on port ${port}`);
  });
}); 