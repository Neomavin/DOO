import { Controller, Post, Get, Body, Param, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { PaymentsService } from './payments.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CreatePaymentIntentDto, ConfirmPaymentDto, RefundPaymentDto } from './dto/create-payment-intent.dto';

@ApiTags('payments')
@Controller('payments')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class PaymentsController {
  constructor(private paymentsService: PaymentsService) {}

  @Post('create-intent')
  @ApiOperation({ summary: 'Create payment intent' })
  async createPaymentIntent(@Body() body: CreatePaymentIntentDto) {
    return this.paymentsService.createPaymentIntent(body.amountCents, body.currency);
  }

  @Post('confirm')
  @ApiOperation({ summary: 'Confirm payment' })
  async confirmPayment(@Body() body: ConfirmPaymentDto) {
    return this.paymentsService.confirmPayment(body.paymentIntentId, body.paymentMethodId);
  }

  @Post('refund/:id')
  @ApiOperation({ summary: 'Refund payment' })
  async refundPayment(@Param('id') id: string, @Body() body: RefundPaymentDto) {
    return this.paymentsService.refundPayment(id, body.amountCents);
  }

  @Get('methods')
  @ApiOperation({ summary: 'Get available payment methods' })
  async getPaymentMethods() {
    return this.paymentsService.getPaymentMethods();
  }
}
