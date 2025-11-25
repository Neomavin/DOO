import { io, Socket } from 'socket.io-client';

const SOCKET_URL = process.env.EXPO_PUBLIC_API_URL?.replace(/^http/, 'ws') || 'ws://localhost:4000';

let socket: Socket | null = null;

export const getSocket = () => {
  if (!socket) {
    socket = io(SOCKET_URL, {
      transports: ['websocket'],
    });
  }
  return socket;
};

export const disconnectSocket = () => {
  socket?.disconnect();
  socket = null;
};
