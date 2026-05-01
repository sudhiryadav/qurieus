// Load .env first so process.env is populated before Next.js and any other code runs
require('dotenv').config({ path: require('path').join(__dirname, '.env') });

const { createServer } = require('http');
const { parse } = require('url');
const next = require('next');
const { Server } = require('socket.io');
const { getToken } = require('next-auth/jwt');

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

  // Require an authenticated NextAuth session for all socket connections.
  io.use(async (socket, next) => {
    try {
      const cookie = socket.handshake.headers.cookie;
      if (!cookie) {
        return next(new Error('Unauthorized'));
      }

      const token = await getToken({
        req: { headers: { cookie } },
        secret: process.env.NEXTAUTH_SECRET,
        secureCookie: process.env.NODE_ENV === 'production',
      });

      if (!token?.id) {
        return next(new Error('Unauthorized'));
      }

      socket.data.user = {
        id: token.id,
        role: token.role,
      };
      return next();
    } catch (error) {
      return next(new Error('Unauthorized'));
    }
  });

  io.on('connection', (socket) => {

    // Join chat room
    socket.on('join', ({ chatId, userId, agentId, role }) => {
      const authUserId = socket.data?.user?.id;
      if (!authUserId || !chatId) {
        socket.emit('socket_error', { error: 'Unauthorized or invalid room' });
        return;
      }

      // Prevent client-side identity spoofing by enforcing authenticated identity.
      if ((userId && userId !== authUserId) || (agentId && agentId !== authUserId)) {
        socket.emit('socket_error', { error: 'Identity mismatch' });
        return;
      }

      socket.join(chatId);
      userSockets.set(authUserId, socket.id);
    });

    // Handle chat message event
    socket.on('chat_message', ({ chatId, message }) => {
      if (chatId && message) {
        // Broadcast to all in the chat room (except sender)
        socket.to(chatId).emit('chat_message', message);
      }
    });

    // Handle chat status update (e.g., agent joined, chat resolved)
    socket.on('chat_status', ({ chatId, status, meta }) => {
      if (chatId && status) {
        io.to(chatId).emit('chat_status', { status, meta });
      }
    });

    // Handle agent availability updates
    socket.on('agent_status', ({ agentId, isOnline, isAvailable }) => {
      // Broadcast to relevant parties (e.g., admin dashboard)
      socket.broadcast.emit('agent_status_update', { agentId, isOnline, isAvailable });
    });

    socket.on('disconnect', () => {
      // Remove from presence map
      for (const [id, sockId] of userSockets.entries()) {
        if (sockId === socket.id) userSockets.delete(id);
      }
    });
  });

  // Make io available globally for API routes
  global.io = io;

  server.listen(port, () => {
  });
}); 