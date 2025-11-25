import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class CategoriesService {
  constructor(private prisma: PrismaService) {}

  async findAll() {
    return this.prisma.category.findMany();
  }

  async findById(id: string) {
    return this.prisma.category.findUnique({
      where: { id },
      include: {
        products: {
          include: {
            restaurant: true,
          },
        },
      },
    });
  }
}
