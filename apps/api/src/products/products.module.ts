import { Module } from '@nestjs/common';
import { ProductsService } from './products.service';
import { ProductsController } from './products.controller';
import { RestaurantProductsController } from './restaurant-products.controller';
import { AdminProductsController } from './admin-products.controller';

@Module({
  controllers: [ProductsController, RestaurantProductsController, AdminProductsController],
  providers: [ProductsService],
  exports: [ProductsService],
})
export class ProductsModule { }
