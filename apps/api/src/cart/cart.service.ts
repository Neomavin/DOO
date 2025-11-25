import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class CartService {
  constructor(private prisma: PrismaService) {}

  async getCart(userId: string) {
    return this.prisma.cartItem.findMany({
      where: { userId },
      include: {
        product: {
          include: {
            restaurant: true,
            category: true,
          },
        },
      },
    });
  }

  async addItem(userId: string, productId: string, quantity: number) {
    const existing = await this.prisma.cartItem.findUnique({
      where: {
        userId_productId: { userId, productId },
      },
    });

    if (existing) {
      return this.prisma.cartItem.update({
        where: { id: existing.id },
        data: { quantity: existing.quantity + quantity },
      });
    }

    return this.prisma.cartItem.create({
      data: { userId, productId, quantity },
    });
  }

  async updateQuantity(userId: string, itemId: string, quantity: number) {
    return this.prisma.cartItem.update({
      where: { id: itemId, userId },
      data: { quantity },
    });
  }

  async removeItem(userId: string, itemId: string) {
    return this.prisma.cartItem.delete({
      where: { id: itemId, userId },
    });
  }

  async clearCart(userId: string) {
    return this.prisma.cartItem.deleteMany({
      where: { userId },
    });
  }
}
