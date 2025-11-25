import {
  WebSocketGateway,
  WebSocketServer,
  SubscribeMessage,
  OnGatewayConnection,
  OnGatewayDisconnect,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';

@WebSocketGateway({
  cors: {
    origin: ['http://localhost:8081', 'http://localhost:8082', 'exp://localhost:8081'],
    credentials: true,
  },
})
export class OrdersGateway implements OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer()
  server: Server;

  private userSockets: Map<string, string> = new Map(); // userId -> socketId
  private restaurantSockets: Map<string, string> = new Map(); // restaurantId -> socketId

  handleConnection(client: Socket) {
    console.log(`Client connected: ${client.id}`);
  }

  handleDisconnect(client: Socket) {
    console.log(`Client disconnected: ${client.id}`);
    // Remover del mapa de usuarios
    for (const [userId, socketId] of this.userSockets.entries()) {
      if (socketId === client.id) {
        this.userSockets.delete(userId);
        break;
      }
    }
  }

  @SubscribeMessage('join')
  handleJoin(client: Socket, userId: string) {
    this.userSockets.set(userId, client.id);
    console.log(`User ${userId} joined with socket ${client.id}`);
    return { event: 'joined', data: { userId } };
  }

  @SubscribeMessage('joinRestaurant')
  handleJoinRestaurant(client: Socket, restaurantId: string) {
    this.restaurantSockets.set(restaurantId, client.id);
    console.log(`Restaurant ${restaurantId} joined with socket ${client.id}`);
    return { event: 'joined', data: { restaurantId } };
  }

  // Emitir actualización de pedido a un usuario específico
  emitOrderUpdate(userId: string, order: any) {
    const socketId = this.userSockets.get(userId);
    if (socketId) {
      this.server.to(socketId).emit('orderUpdate', order);
    }
  }

  // Emitir actualización de estado de pedido
  emitOrderStatusChange(userId: string, orderId: string, status: string) {
    const socketId = this.userSockets.get(userId);
    if (socketId) {
      this.server.to(socketId).emit('orderStatusChange', {
        orderId,
        status,
        timestamp: new Date(),
      });
    }
  }

  // Emitir ubicación del repartidor
  emitCourierLocation(userId: string, location: { lat: number; lng: number }) {
    const socketId = this.userSockets.get(userId);
    if (socketId) {
      this.server.to(socketId).emit('courierLocation', location);
    }
  }

  // Broadcast a todos los clientes conectados
  broadcastNotification(notification: any) {
    this.server.emit('notification', notification);
  }

  // Emitir nuevo pedido a un restaurante específico
  emitNewOrderToRestaurant(restaurantId: string, order: any) {
    const socketId = this.restaurantSockets.get(restaurantId);
    if (socketId) {
      this.server.to(socketId).emit('newOrder', order);
      console.log(`New order emitted to restaurant ${restaurantId}`);
    } else {
      console.log(`Restaurant ${restaurantId} not connected`);
    }
  }

  // Emitir actualización de pedido a restaurante
  emitOrderUpdateToRestaurant(restaurantId: string, order: any) {
    const socketId = this.restaurantSockets.get(restaurantId);
    if (socketId) {
      this.server.to(socketId).emit('orderUpdate', order);
    }
  }
}
