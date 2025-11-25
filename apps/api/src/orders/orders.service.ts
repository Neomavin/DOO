import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateOrderDto } from './dto/create-order.dto';
import { ORDER_STATUSES } from './dto/update-status.dto';
import { OrdersGateway } from './orders.gateway';

@Injectable()
export class OrdersService {
  constructor(
    private prisma: PrismaService,
    private ordersGateway: OrdersGateway,
  ) {}

  private serializeItems(items: any) {
    if (typeof items === 'string') return items;
    try {
      return JSON.stringify(items ?? []);
    } catch {
      return '[]';
    }
  }

  private parseOrder<T extends { items: string | null }>(order: T | null) {
    if (!order) return order;
    try {
      return {
        ...order,
        items: order.items ? JSON.parse(order.items) : [],
      };
    } catch {
      return { ...order, items: [] };
    }
  }

  private parseOrders<T extends { items: string | null }>(orders: T[]) {
    return orders.map((order) => this.parseOrder(order));
  }

  async create(userId: string, data: CreateOrderDto) {
    const order = await this.prisma.order.create({
      data: {
        userId,
        restaurantId: data.restaurantId,
        addressId: data.addressId,
        items: this.serializeItems(data.items),
        subtotalCents: data.subtotalCents,
        taxCents: data.taxCents,
        deliveryCents: data.deliveryCents,
        totalCents: data.totalCents,
        paymentMethod: data.paymentMethod,
        notes: data.notes,
      },
      include: {
        restaurant: true,
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            phone: true,
          },
        },
        address: true,
      },
    });

    // Notificar al restaurante via WebSocket
    this.ordersGateway.emitNewOrderToRestaurant(data.restaurantId, this.parseOrder(order));

    return this.parseOrder(order);
  }

  async findByUser(userId: string) {
    const orders = await this.prisma.order.findMany({
      where: { userId },
      include: {
        restaurant: true,
        address: true,
      },
      orderBy: { createdAt: 'desc' },
    });
    return this.parseOrders(orders);
  }

  async findById(id: string) {
    const order = await this.prisma.order.findUnique({
      where: { id },
      include: {
        restaurant: true,
        address: true,
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            phone: true,
          },
        },
      },
    });
    return this.parseOrder(order);
  }

  async updateStatus(id: string, status: string) {
    if (!ORDER_STATUSES.includes(status as any)) {
      throw new BadRequestException(`Invalid status: ${status}`);
    }
    const order = await this.prisma.order.update({
      where: { id },
      data: { status },
    });
    return this.parseOrder(order);
  }

  async findByRestaurant(restaurantId: string) {
    const orders = await this.prisma.order.findMany({
      where: { restaurantId },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            phone: true,
          },
        },
        address: true,
      },
      orderBy: { createdAt: 'desc' },
    });
    return this.parseOrders(orders);
  }

  /**
   * Restaurante acepta el pedido
   */
  async acceptOrder(orderId: string, userId: string) {
    const order = await this.prisma.order.findUnique({
      where: { id: orderId },
      include: {
        restaurant: true,
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            phone: true,
          },
        },
        address: true,
      },
    });

    if (!order) {
      throw new NotFoundException('Pedido no encontrado');
    }

    if (order.status !== 'NEW') {
      throw new BadRequestException('Este pedido ya fue procesado');
    }

    const updatedOrder = await this.prisma.order.update({
      where: { id: orderId },
      data: {
        status: 'ACCEPTED',
        acceptedAt: new Date(),
      },
      include: {
        restaurant: true,
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            phone: true,
          },
        },
        address: true,
      },
    });

    // Notificar al cliente via WebSocket
    this.ordersGateway.emitOrderStatusChange(order.userId, orderId, 'ACCEPTED');
    this.ordersGateway.emitOrderUpdate(order.userId, this.parseOrder(updatedOrder));

    return this.parseOrder(updatedOrder);
  }

  /**
   * Restaurante rechaza el pedido
   */
  async rejectOrder(orderId: string, reason: string) {
    const order = await this.prisma.order.findUnique({
      where: { id: orderId },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            phone: true,
          },
        },
      },
    });

    if (!order) {
      throw new NotFoundException('Pedido no encontrado');
    }

    if (order.status !== 'NEW') {
      throw new BadRequestException('Este pedido ya fue procesado');
    }

    const updatedOrder = await this.prisma.order.update({
      where: { id: orderId },
      data: {
        status: 'CANCELLED',
      },
      include: {
        restaurant: true,
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            phone: true,
          },
        },
        address: true,
      },
    });

    // Notificar al cliente via WebSocket
    this.ordersGateway.emitOrderStatusChange(order.userId, orderId, 'CANCELLED');
    this.ordersGateway.emitOrderUpdate(order.userId, this.parseOrder(updatedOrder));

    return this.parseOrder(updatedOrder);
  }

  /**
   * Restaurante marca el pedido como listo para recoger
   */
  async markReady(orderId: string) {
    const order = await this.prisma.order.findUnique({
      where: { id: orderId },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            phone: true,
          },
        },
      },
    });

    if (!order) {
      throw new NotFoundException('Pedido no encontrado');
    }

    if (order.status !== 'ACCEPTED' && order.status !== 'PREPARING') {
      throw new BadRequestException('El pedido debe estar aceptado o en preparación');
    }

    const updatedOrder = await this.prisma.order.update({
      where: { id: orderId },
      data: {
        status: 'READY',
      },
      include: {
        restaurant: true,
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            phone: true,
          },
        },
        address: true,
      },
    });

    // Notificar al cliente
    this.ordersGateway.emitOrderStatusChange(order.userId, orderId, 'READY');
    this.ordersGateway.emitOrderUpdate(order.userId, this.parseOrder(updatedOrder));

    // Notificar a couriers disponibles (broadcast)
    this.ordersGateway.broadcastNotification({
      type: 'newOrderReady',
      orderId,
      restaurantId: order.restaurantId,
    });

    return this.parseOrder(updatedOrder);
  }
}
