import api from './api';

export interface Address {
  id: string;
  label: string;
  line1: string;
  line2?: string;
  city: string;
  isDefault: boolean;
  lat: number;
  lng: number;
}

class AddressesService {
  async getAddresses() {
    const { data } = await api.get<Address[]>('/addresses');
    return data;
  }

  async createAddress(payload: Omit<Address, 'id' | 'isDefault'> & { isDefault?: boolean }) {
    const { data } = await api.post<Address>('/addresses', payload);
    return data;
  }

  async updateAddress(id: string, payload: Partial<Address>) {
    const { data } = await api.patch<Address>(`/addresses/${id}`, payload);
    return data;
  }

  async deleteAddress(id: string) {
    await api.delete(`/addresses/${id}`);
  }
}

export default new AddressesService();
