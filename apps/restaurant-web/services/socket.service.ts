import { io, Socket } from 'socket.io-client';

const SOCKET_URL = process.env.NEXT_PUBLIC_API_URL?.replace('/api', '') || 'http://localhost:4000';

class SocketService {
  private socket: Socket | null = null;
  private listeners: Map<string, Function[]> = new Map();

  connect(restaurantId: string) {
    if (this.socket?.connected) return;

    this.socket = io(SOCKET_URL, {
      transports: ['websocket'],
      reconnection: true,
      reconnectionDelay: 1000,
      reconnectionAttempts: 5,
    });

    this.socket.on('connect', () => {
      console.log('🔌 Socket conectado (Restaurant)');
      this.socket?.emit('joinRestaurant', { restaurantId });
    });

    this.socket.on('disconnect', () => {
      console.log('❌ Socket desconectado (Restaurant)');
    });

    this.socket.on('connect_error', (error) => {
      console.error('Socket connection error:', error);
    });

    // Restaurar listeners después de reconectar
    this.listeners.forEach((callbacks, event) => {
      callbacks.forEach((callback) => {
        this.socket?.on(event, callback as any);
      });
    });
  }

  disconnect() {
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
      this.listeners.clear();
    }
  }

  on<T = any>(event: string, callback: (data: T) => void) {
    if (!this.listeners.has(event)) {
      this.listeners.set(event, []);
    }
    this.listeners.get(event)?.push(callback);
    this.socket?.on(event, callback as any);
  }

  off(event: string, callback?: Function) {
    if (callback) {
      const callbacks = this.listeners.get(event) || [];
      const index = callbacks.indexOf(callback);
      if (index > -1) {
        callbacks.splice(index, 1);
      }
      this.socket?.off(event, callback as any);
    } else {
      this.listeners.delete(event);
      this.socket?.off(event);
    }
  }

  emit(event: string, data?: any) {
    this.socket?.emit(event, data);
  }

  isConnected(): boolean {
    return this.socket?.connected ?? false;
  }
}

export default new SocketService();
