import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { UpdateScheduleDto } from './dto/update-schedule.dto';
import { isRestaurantOpen, getRestaurantStatus } from '../common/utils/schedule.utils';

@Injectable()
export class RestaurantsService {
  constructor(private prisma: PrismaService) {}

  async findAll() {
    return this.prisma.restaurant.findMany({
      orderBy: { rating: 'desc' },
    });
  }

  async findById(id: string) {
    return this.prisma.restaurant.findUnique({
      where: { id },
      include: {
        products: {
          include: {
            category: true,
          },
        },
      },
    });
  }

  async findFeatured() {
    return this.prisma.restaurant.findMany({
      where: { isOpen: true },
      orderBy: { rating: 'desc' },
      take: 6,
    });
  }

  async search(query: string) {
    return this.prisma.restaurant.findMany({
      where: {
        OR: [
          { name: { contains: query } },
        ],
        isOpen: true,
      },
    });
  }

  async updateSchedule(id: string, updateScheduleDto: UpdateScheduleDto) {
    return this.prisma.restaurant.update({
      where: { id },
      data: {
        openTime: updateScheduleDto.openTime,
        closeTime: updateScheduleDto.closeTime,
        closedDays: updateScheduleDto.closedDays,
      },
    });
  }

  /**
   * Agrega el estado calculado de abierto/cerrado a un restaurante
   */
  private enrichWithScheduleStatus(restaurant: any) {
    const status = getRestaurantStatus({
      openTime: restaurant.openTime,
      closeTime: restaurant.closeTime,
      closedDays: restaurant.closedDays,
    });

    return {
      ...restaurant,
      isCurrentlyOpen: status.isOpen,
      scheduleStatus: status.message,
    };
  }
}
