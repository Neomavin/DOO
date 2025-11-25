import { Controller, Get, Param, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { OrdersService } from './orders.service';

@ApiTags('orders')
@Controller('restaurants/:restaurantId/orders')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class RestaurantOrdersController {
  constructor(private ordersService: OrdersService) {}

  @Get()
  @ApiOperation({ summary: 'List orders for a restaurant' })
  async findByRestaurant(@Param('restaurantId') restaurantId: string) {
    return this.ordersService.findByRestaurant(restaurantId);
  }
}
