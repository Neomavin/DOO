import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { OrdersGateway } from '../orders/orders.gateway';

const ACTIVE_STATUSES = ['NEW', 'ACCEPTED', 'PREPARING', 'READY', 'PICKED_UP', 'ON_ROUTE'];

@Injectable()
export class CouriersService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly ordersGateway: OrdersGateway,
  ) {}

  private orderInclude = {
    restaurant: {
      select: {
        id: true,
        name: true,
        lat: true,
        lng: true,
        logoUrl: true,
        etaMinutes: true,
      },
    },
    address: true,
    user: {
      select: {
        id: true,
        name: true,
        phone: true,
      },
    },
  } as const;

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

  async getAvailableOrders() {
    const orders = await this.prisma.order.findMany({
      where: {
        courierId: null,
        status: 'READY',
      },
      include: this.orderInclude,
      orderBy: { createdAt: 'asc' },
    });

    return this.parseOrders(orders);
  }

  async getActiveOrder(courierId: string) {
    const order = await this.prisma.order.findFirst({
      where: {
        courierId,
        status: { notIn: ['DELIVERED', 'CANCELLED'] },
      },
      include: this.orderInclude,
      orderBy: { createdAt: 'desc' },
    });

    return this.parseOrder(order);
  }

  async getOrderById(courierId: string, orderId: string) {
    const order = await this.prisma.order.findUnique({
      where: { id: orderId },
      include: this.orderInclude,
    });

    if (!order) {
      throw new NotFoundException('Pedido no encontrado');
    }

    if (order.courierId && order.courierId !== courierId) {
      throw new ForbiddenException('No tienes acceso a este pedido');
    }

    return this.parseOrder(order);
  }

  async ensureNoActiveOrder(courierId: string) {
    const active = await this.prisma.order.findFirst({
      where: {
        courierId,
        status: { notIn: ['DELIVERED', 'CANCELLED'] },
      },
    });

    if (active) {
      throw new BadRequestException('Ya tienes un pedido activo');
    }
  }

  async acceptOrder(courierId: string, orderId: string) {
    await this.ensureNoActiveOrder(courierId);

    const order = await this.prisma.order.findUnique({
      where: { id: orderId },
    });

    if (!order || order.status !== 'READY' || order.courierId) {
      throw new BadRequestException('Este pedido ya no está disponible');
    }

    const updated = await this.prisma.order.update({
      where: { id: orderId },
      data: {
        courierId,
        acceptedAt: new Date(),
        status: 'ACCEPTED',
      },
      include: this.orderInclude,
    });

    this.ordersGateway.emitOrderStatusChange(updated.userId, updated.id, updated.status);
    this.ordersGateway.emitOrderUpdate(updated.userId, updated);

    return this.parseOrder(updated);
  }

  async rejectOrder(_courierId: string, orderId: string) {
    const order = await this.prisma.order.findUnique({ where: { id: orderId } });
    if (!order) {
      throw new NotFoundException('Pedido no encontrado');
    }
    if (order.status !== 'READY' || order.courierId) {
      throw new BadRequestException('Este pedido ya fue asignado');
    }
    return { success: true };
  }

  private async ensureOwnedOrder(courierId: string, orderId: string) {
    const order = await this.prisma.order.findUnique({
      where: { id: orderId },
      include: this.orderInclude,
    });

    if (!order) {
      throw new NotFoundException('Pedido no encontrado');
    }
    if (order.courierId !== courierId) {
      throw new ForbiddenException('No tienes acceso a este pedido');
    }
    return order;
  }

  async markPickedUp(courierId: string, orderId: string) {
    await this.ensureOwnedOrder(courierId, orderId);

    const updated = await this.prisma.order.update({
      where: { id: orderId },
      data: {
        pickedUpAt: new Date(),
        status: 'ON_ROUTE',
      },
      include: this.orderInclude,
    });

    this.ordersGateway.emitOrderStatusChange(updated.userId, updated.id, updated.status);
    this.ordersGateway.emitOrderUpdate(updated.userId, updated);

    return this.parseOrder(updated);
  }

  async markDelivered(courierId: string, orderId: string, confirmationCode?: string) {
    const order = await this.ensureOwnedOrder(courierId, orderId);

    if (order.confirmationCode && order.confirmationCode !== confirmationCode) {
      throw new BadRequestException('Código de confirmación inválido');
    }

    const updated = await this.prisma.order.update({
      where: { id: orderId },
      data: {
        deliveredAt: new Date(),
        status: 'DELIVERED',
      },
      include: this.orderInclude,
    });

    this.ordersGateway.emitOrderStatusChange(updated.userId, updated.id, updated.status);
    this.ordersGateway.emitOrderUpdate(updated.userId, updated);

    return this.parseOrder(updated);
  }

  async getHistory(courierId: string) {
    const orders = await this.prisma.order.findMany({
      where: {
        courierId,
        status: 'DELIVERED',
      },
      include: this.orderInclude,
      orderBy: { deliveredAt: 'desc' },
    });

    return this.parseOrders(orders);
  }

  async getEarnings(courierId: string) {
    const [aggregate, totalDelivered] = await Promise.all([
      this.prisma.order.aggregate({
        where: { courierId, status: 'DELIVERED' },
        _sum: {
          deliveryCents: true,
        },
      }),
      this.prisma.order.count({ where: { courierId, status: 'DELIVERED' } }),
    ]);

    return {
      totalDeliveries: totalDelivered,
      totalEarnedCents: aggregate._sum.deliveryCents ?? 0,
    };
  }

  async updateAvailability(courierId: string, isAvailable: boolean) {
    const user = await this.prisma.user.update({
      where: { id: courierId },
      data: { isAvailable },
      select: {
        id: true,
        isAvailable: true,
      },
    });

    return user;
  }

  async updateLocation(courierId: string, lat: number, lng: number) {
    const activeOrder = await this.prisma.order.findFirst({
      where: {
        courierId,
        status: { in: ACTIVE_STATUSES },
      },
      select: {
        id: true,
        userId: true,
      },
    });

    if (activeOrder) {
      this.ordersGateway.emitCourierLocation(activeOrder.userId, { lat, lng });
    }
  }
}
