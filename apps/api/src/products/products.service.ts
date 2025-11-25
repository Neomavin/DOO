import { Injectable, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';

@Injectable()
export class ProductsService {
  constructor(private prisma: PrismaService) { }

  async findAll() {
    // Public endpoint: only return products that have been approved
    return this.prisma.product.findMany({
      where: { status: 'APPROVED' },
      include: {
        category: true,
        restaurant: true,
      },
    });
  }

  async findByRestaurant(restaurantId: string) {
    return this.prisma.product.findMany({
      where: { restaurantId },
      include: {
        category: true,
      },
    });
  }

  // New method to list products by status (admin)
  async findByStatus(status?: string) {
    const whereClause = status ? { status } : {};
    return this.prisma.product.findMany({
      where: whereClause,
      include: { category: true, restaurant: true },
    });
  }

  async findById(id: string) {
    return this.prisma.product.findUnique({
      where: { id },
      include: {
        category: true,
        restaurant: true,
      },
    });
  }

  private resolvePriceCents(payload: { price?: number; priceCents?: number }) {
    if (typeof payload.priceCents === 'number') return payload.priceCents;
    if (typeof payload.price === 'number') return Math.round(payload.price * 100);
    return null;
  }

  async create(restaurantId: string, data: CreateProductDto) {
    const priceCents = this.resolvePriceCents(data);
    if (priceCents === null) {
      throw new BadRequestException('price or priceCents is required');
    }

    return this.prisma.product.create({
      data: {
        restaurantId,
        categoryId: data.categoryId,
        name: data.name,
        description: data.description,
        priceCents,
        imageUrl: data.imageUrl,
        isFeatured: data.isFeatured ?? false,
        available: data.available ?? true,
        prepTimeMinutes: data.prepTimeMinutes ?? 15,
        ingredients: data.ingredients,
      },
    });
  }

  async update(id: string, data: UpdateProductDto) {
    const updateData: any = {
      name: data.name,
      description: data.description,
      imageUrl: data.imageUrl,
      categoryId: data.categoryId,
      isFeatured: data.isFeatured,
      prepTimeMinutes: data.prepTimeMinutes,
      ingredients: data.ingredients,
      available: data.available,
    };

    const priceCents = this.resolvePriceCents(data);
    if (priceCents !== null) {
      updateData.priceCents = priceCents;
    }

    Object.keys(updateData).forEach((key) => {
      if (typeof updateData[key] === 'undefined') {
        delete updateData[key];
      }
    });

    return this.prisma.product.update({
      where: { id },
      data: updateData,
    });
  }

  async remove(id: string) {
    return this.prisma.product.delete({
      where: { id },
    });
  }

  // Admin method to update product status (approve/reject)
  async updateStatus(id: string, status: string, rejectionReason?: string) {
    const data: any = { status };
    if (rejectionReason) {
      data.rejectionReason = rejectionReason;
    }
    return this.prisma.product.update({
      where: { id },
      data,
    });
  }
}
