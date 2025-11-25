import { Controller, Get, Post, Patch, Body, Param, UseGuards, Request } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { OrdersService } from './orders.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { CreateOrderDto } from './dto/create-order.dto';
import { UpdateOrderStatusDto } from './dto/update-status.dto';
import { RejectOrderDto } from './dto/reject-order.dto';

@ApiTags('orders')
@Controller('orders')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class OrdersController {
  constructor(private ordersService: OrdersService) {}

  @Post()
  @ApiOperation({ summary: 'Create order' })
  async create(@Request() req, @Body() body: CreateOrderDto) {
    return this.ordersService.create(req.user.id, body);
  }

  @Get()
  @ApiOperation({ summary: 'Get user orders' })
  async findByUser(@Request() req) {
    return this.ordersService.findByUser(req.user.id);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get order by ID' })
  async findById(@Param('id') id: string) {
    return this.ordersService.findById(id);
  }

  @Patch(':id/status')
  @ApiOperation({ summary: 'Update order status' })
  async updateStatus(@Param('id') id: string, @Body() body: UpdateOrderStatusDto) {
    return this.ordersService.updateStatus(id, body.status);
  }

  // Endpoints para restaurantes
  @Patch(':id/accept')
  @UseGuards(RolesGuard)
  @Roles('RESTAURANT')
  @ApiOperation({ summary: 'Restaurant accepts order' })
  async acceptOrder(@Param('id') id: string, @Request() req) {
    return this.ordersService.acceptOrder(id, req.user.id);
  }

  @Patch(':id/reject')
  @UseGuards(RolesGuard)
  @Roles('RESTAURANT')
  @ApiOperation({ summary: 'Restaurant rejects order' })
  async rejectOrder(@Param('id') id: string, @Body() body: RejectOrderDto) {
    return this.ordersService.rejectOrder(id, body.reason);
  }

  @Patch(':id/ready')
  @UseGuards(RolesGuard)
  @Roles('RESTAURANT')
  @ApiOperation({ summary: 'Mark order as ready for pickup' })
  async markReady(@Param('id') id: string) {
    return this.ordersService.markReady(id);
  }

  @Get('restaurant/:restaurantId')
  @UseGuards(RolesGuard)
  @Roles('RESTAURANT')
  @ApiOperation({ summary: 'Get orders for restaurant' })
  async findByRestaurant(@Param('restaurantId') restaurantId: string) {
    return this.ordersService.findByRestaurant(restaurantId);
  }
}
