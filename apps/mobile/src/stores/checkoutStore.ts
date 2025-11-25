import { create } from 'zustand';

export type PaymentSelection = 'card' | 'cash' | 'transfer';

interface CardDetails {
  holderName?: string;
  last4?: string;
}

interface CashDetails {
  amount?: string;
}

interface TransferDetails {
  reference?: string;
}

interface CheckoutState {
  notes: string;
  paymentMethod: PaymentSelection;
  cardDetails: CardDetails;
  cashDetails: CashDetails;
  transferDetails: TransferDetails;
  lastOrder: any | null;
  selectedAddressId: string | null;
  selectedAddressLabel?: string;
  setNotes: (notes: string) => void;
  selectPaymentMethod: (method: PaymentSelection) => void;
  setCardDetails: (details: CardDetails) => void;
  setCashDetails: (details: CashDetails) => void;
  setTransferDetails: (details: TransferDetails) => void;
  setLastOrder: (order: any | null) => void;
  setSelectedAddress: (id: string | null, label?: string) => void;
  reset: () => void;
}

export const useCheckoutStore = create<CheckoutState>((set) => ({
  notes: '',
  paymentMethod: 'card',
  cardDetails: {},
  cashDetails: {},
  transferDetails: {},
  lastOrder: null,
  selectedAddressId: null,
  setNotes: (notes) => set({ notes }),
  selectPaymentMethod: (method) => set({ paymentMethod: method }),
  setCardDetails: (details) => set({ cardDetails: { ...details } }),
  setCashDetails: (details) => set({ cashDetails: { ...details } }),
  setTransferDetails: (details) => set({ transferDetails: { ...details } }),
  setLastOrder: (order) => set({ lastOrder: order }),
  setSelectedAddress: (id, label) => set({ selectedAddressId: id, selectedAddressLabel: label }),
  reset: () =>
    set({
      notes: '',
      paymentMethod: 'card',
      cardDetails: {},
      cashDetails: {},
      transferDetails: {},
      lastOrder: null,
      selectedAddressId: null,
      selectedAddressLabel: undefined,
    }),
}));
