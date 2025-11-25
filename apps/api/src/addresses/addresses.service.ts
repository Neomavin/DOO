import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class AddressesService {
  constructor(private prisma: PrismaService) {}

  async findByUser(userId: string) {
    return this.prisma.address.findMany({
      where: { userId },
      orderBy: { isDefault: 'desc' },
    });
  }

  async create(userId: string, data: any) {
    // Si es la dirección por defecto, desmarcar las demás
    if (data.isDefault) {
      await this.prisma.address.updateMany({
        where: { userId, isDefault: true },
        data: { isDefault: false },
      });
    }

    return this.prisma.address.create({
      data: {
        userId,
        ...data,
      },
    });
  }

  async update(id: string, userId: string, data: any) {
    // Si se marca como default, desmarcar las demás
    if (data.isDefault) {
      await this.prisma.address.updateMany({
        where: { userId, isDefault: true },
        data: { isDefault: false },
      });
    }

    return this.prisma.address.update({
      where: { id, userId },
      data,
    });
  }

  async delete(id: string, userId: string) {
    return this.prisma.address.delete({
      where: { id, userId },
    });
  }
}
