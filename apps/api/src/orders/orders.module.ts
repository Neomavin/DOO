import { Module } from '@nestjs/common';
import { OrdersService } from './orders.service';
import { OrdersController } from './orders.controller';
import { RestaurantOrdersController } from './restaurant-orders.controller';
import { OrdersGateway } from './orders.gateway';

@Module({
  controllers: [OrdersController, RestaurantOrdersController],
  providers: [OrdersService, OrdersGateway],
  exports: [OrdersService, OrdersGateway],
})
export class OrdersModule {}
