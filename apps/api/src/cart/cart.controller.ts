import { Controller, Get, Post, Patch, Delete, Body, Param, UseGuards, Request } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { CartService } from './cart.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { AddCartItemDto } from './dto/add-cart-item.dto';
import { UpdateCartItemDto } from './dto/update-cart-item.dto';

@ApiTags('cart')
@Controller('cart')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class CartController {
  constructor(private cartService: CartService) {}

  @Get()
  @ApiOperation({ summary: 'Get user cart' })
  async getCart(@Request() req) {
    return this.cartService.getCart(req.user.id);
  }

  @Post('items')
  @ApiOperation({ summary: 'Add item to cart' })
  async addItem(@Request() req, @Body() body: AddCartItemDto) {
    return this.cartService.addItem(req.user.id, body.productId, body.quantity);
  }

  @Patch('items/:id')
  @ApiOperation({ summary: 'Update cart item quantity' })
  async updateQuantity(@Request() req, @Param('id') id: string, @Body() body: UpdateCartItemDto) {
    return this.cartService.updateQuantity(req.user.id, id, body.quantity);
  }

  @Delete('items/:id')
  @ApiOperation({ summary: 'Remove item from cart' })
  async removeItem(@Request() req, @Param('id') id: string) {
    return this.cartService.removeItem(req.user.id, id);
  }

  @Delete()
  @ApiOperation({ summary: 'Clear cart' })
  async clearCart(@Request() req) {
    return this.cartService.clearCart(req.user.id);
  }
}
