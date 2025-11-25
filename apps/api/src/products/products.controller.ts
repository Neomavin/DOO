import { Body, Controller, Delete, Get, Param, Put, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { ProductsService } from './products.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { UpdateProductDto } from './dto/update-product.dto';

@ApiTags('products')
@Controller('products')
export class ProductsController {
  constructor(private productsService: ProductsService) {}

  @Get()
  @ApiOperation({ summary: 'Get all products' })
  async findAll() {
    return this.productsService.findAll();
  }

  @Get('restaurant/:restaurantId')
  @ApiOperation({ summary: 'Get products by restaurant' })
  async findByRestaurant(@Param('restaurantId') restaurantId: string) {
    return this.productsService.findByRestaurant(restaurantId);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get product by ID' })
  async findById(@Param('id') id: string) {
    return this.productsService.findById(id);
  }

  @Put(':id')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Update product by ID' })
  async update(@Param('id') id: string, @Body() body: UpdateProductDto) {
    return this.productsService.update(id, body);
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Delete product by ID' })
  async remove(@Param('id') id: string) {
    return this.productsService.remove(id);
  }
}
