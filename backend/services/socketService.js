let io = null;

const initSocket = (server) => {
  const { Server } = require('socket.io');
  io = new Server(server, {
    cors: {
      origin: process.env.CLIENT_URL || '*',
      methods: ['GET', 'POST', 'PUT', 'DELETE'],
    },
  });

  io.on('connection', (socket) => {
    console.log(`[Socket.io] Client connected: ${socket.id}`);

    // Join user-specific notification room
    socket.on('join', (userId) => {
      if (userId) {
        socket.join(`user_${userId}`);
        console.log(`[Socket.io] User ${userId} joined personal room user_${userId}`);
      }
    });

    // Leave room
    socket.on('leave', (userId) => {
      if (userId) {
        socket.leave(`user_${userId}`);
      }
    });

    socket.on('disconnect', () => {
      console.log(`[Socket.io] Client disconnected: ${socket.id}`);
    });
  });

  return io;
};

const getIO = () => {
  if (!io) {
    console.warn('[Socket.io Warning] Socket.io not initialized yet.');
    return {
      emit: () => {},
      to: () => ({ emit: () => {} }),
    };
  }
  return io;
};

module.exports = { initSocket, getIO };
