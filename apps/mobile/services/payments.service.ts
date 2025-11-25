import api from './api';

export interface PaymentMethod {
  id: string;
  name: string;
  icon: string;
  enabled: boolean;
}

export interface PaymentIntent {
  id: string;
  amount: number;
  currency: string;
  status: string;
  clientSecret: string;
}

export interface PaymentConfirmation {
  id: string;
  status: string;
  paymentMethod: string;
  amount: number;
  currency: string;
}

class PaymentsService {
  async getMethods() {
    const { data } = await api.get<PaymentMethod[]>('/payments/methods');
    return data;
  }

  async createIntent(amountCents: number, currency = 'HNL') {
    const { data } = await api.post<PaymentIntent>('/payments/create-intent', {
      amountCents,
      currency,
    });
    return data;
  }

  async confirmPayment(paymentIntentId: string, paymentMethodId?: string) {
    const { data } = await api.post<PaymentConfirmation>('/payments/confirm', {
      paymentIntentId,
      paymentMethodId,
    });
    return data;
  }
}

export default new PaymentsService();
