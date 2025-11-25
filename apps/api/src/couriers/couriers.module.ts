import { Module } from '@nestjs/common';
import { CouriersController } from './couriers.controller';
import { CouriersService } from './couriers.service';
import { PrismaModule } from '../prisma/prisma.module';
import { OrdersModule } from '../orders/orders.module';
import { AuthModule } from '../auth/auth.module';

@Module({
  imports: [PrismaModule, OrdersModule, AuthModule],
  controllers: [CouriersController],
  providers: [CouriersService],
})
export class CouriersModule {}
