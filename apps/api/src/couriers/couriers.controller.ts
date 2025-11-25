import { Body, Controller, Get, Param, Patch, Post, Request, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { CouriersService } from './couriers.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { UpdateAvailabilityDto } from './dto/update-availability.dto';
import { UpdateLocationDto } from './dto/update-location.dto';
import { DeliverOrderDto } from './dto/deliver-order.dto';

@ApiTags('couriers')
@ApiBearerAuth()
@Controller('couriers')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('COURIER')
export class CouriersController {
  constructor(private readonly couriersService: CouriersService) {}

  @Get('available-orders')
  getAvailable() {
    return this.couriersService.getAvailableOrders();
  }

  @Get('active-order')
  getActive(@Request() req) {
    return this.couriersService.getActiveOrder(req.user.id);
  }

  @Get('orders/:id')
  getOrder(@Request() req, @Param('id') id: string) {
    return this.couriersService.getOrderById(req.user.id, id);
  }

  @Post('orders/:id/accept')
  accept(@Request() req, @Param('id') id: string) {
    return this.couriersService.acceptOrder(req.user.id, id);
  }

  @Post('orders/:id/reject')
  reject(@Request() req, @Param('id') id: string) {
    return this.couriersService.rejectOrder(req.user.id, id);
  }

  @Patch('orders/:id/pickup')
  pickup(@Request() req, @Param('id') id: string) {
    return this.couriersService.markPickedUp(req.user.id, id);
  }

  @Patch('orders/:id/deliver')
  deliver(@Request() req, @Param('id') id: string, @Body() body: DeliverOrderDto) {
    return this.couriersService.markDelivered(req.user.id, id, body.confirmationCode);
  }

  @Patch('availability')
  toggleAvailability(@Request() req, @Body() body: UpdateAvailabilityDto) {
    return this.couriersService.updateAvailability(req.user.id, body.isAvailable);
  }

  @Post('location')
  async updateLocation(@Request() req, @Body() body: UpdateLocationDto) {
    await this.couriersService.updateLocation(req.user.id, body.lat, body.lng);
    return { success: true };
  }

  @Get('history')
  getHistory(@Request() req) {
    return this.couriersService.getHistory(req.user.id);
  }

  @Get('earnings')
  getEarnings(@Request() req) {
    return this.couriersService.getEarnings(req.user.id);
  }
}
