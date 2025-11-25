import { Body, Controller, Get, Param, Post, UseGuards } from '@nestjs/common';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { ProductsService } from './products.service';
import { CreateProductDto } from './dto/create-product.dto';

@ApiTags('restaurants')
@Controller('restaurants/:restaurantId/products')
export class RestaurantProductsController {
  constructor(private productsService: ProductsService) { }

  @Get()
  @ApiOperation({ summary: 'List products for a restaurant' })
  async list(@Param('restaurantId') restaurantId: string) {
    return this.productsService.findByRestaurant(restaurantId);
  }

  @Post()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('RESTAURANT')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Create product for restaurant' })
  async create(@Param('restaurantId') restaurantId: string, @Body() body: CreateProductDto) {
    return this.productsService.create(restaurantId, body);
  }
}
