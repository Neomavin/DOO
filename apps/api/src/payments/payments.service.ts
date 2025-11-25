import { Injectable } from '@nestjs/common';

@Injectable()
export class PaymentsService {
  // Mock payment service - simula Stripe/PixelPay
  async createPaymentIntent(amountCents: number, currency: string = 'HNL') {
    // Simular creación de payment intent
    const paymentIntentId = `pi_mock_${Date.now()}`;
    
    return {
      id: paymentIntentId,
      amount: amountCents,
      currency,
      status: 'requires_payment_method',
      clientSecret: `${paymentIntentId}_secret_${Math.random().toString(36).substring(7)}`,
    };
  }

  async confirmPayment(paymentIntentId: string, paymentMethodId?: string) {
    // Simular confirmación de pago
    // En producción, aquí se haría la llamada a Stripe/PixelPay
    
    // Simular un pequeño delay
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    // 90% de probabilidad de éxito
    const success = Math.random() > 0.1;
    
    if (success) {
      return {
        id: paymentIntentId,
        status: 'succeeded',
        amount: 0,
        currency: 'HNL',
        paymentMethod: paymentMethodId || 'pm_mock_card',
      };
    } else {
      throw new Error('Payment failed - Insufficient funds');
    }
  }

  async refundPayment(paymentIntentId: string, amountCents?: number) {
    // Simular reembolso
    await new Promise(resolve => setTimeout(resolve, 500));
    
    return {
      id: `re_mock_${Date.now()}`,
      paymentIntent: paymentIntentId,
      amount: amountCents || 0,
      status: 'succeeded',
    };
  }

  async getPaymentMethods() {
    // Retornar métodos de pago disponibles
    return [
      {
        id: 'card',
        name: 'Tarjeta de Crédito/Débito',
        icon: '💳',
        enabled: true,
      },
      {
        id: 'cash',
        name: 'Efectivo',
        icon: '💵',
        enabled: true,
      },
      {
        id: 'transfer',
        name: 'Transferencia',
        icon: '🏦',
        enabled: true,
      },
    ];
  }
}
