import { io } from 'socket.io-client';

let socket;

export const connectSocket = (userId, role) => {
  if (socket?.connected) return socket;
  socket = io(process.env.REACT_APP_SOCKET_URL || 'http://localhost:5000', { transports: ['websocket'] });
  socket.on('connect', () => {
    socket.emit('join', `user-${userId}`);
    if (role === 'vendor') socket.emit('join', `vendor-${userId}`);
    console.log('Socket connected:', socket.id);
  });
  return socket;
};

export const getSocket = () => socket;
export const disconnectSocket = () => { if (socket) socket.disconnect(); };
