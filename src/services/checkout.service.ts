import type { CartItem } from '../interfaces';
import { api } from './api.config';

interface CreateOrderDto {
  items: { productId: string | number; quantity: number }[];
  shippingAddressId: string;
}

export const checkoutService = {
  async getDefaultAddressId(): Promise<string> {
    try {
      const response = await api.get('/addresses');
      const addresses = response.data;

      if (!addresses || addresses.length === 0) {
        throw new Error('No shipping addresses found. Please add an address first.');
      }

      const defaultAddress = addresses.find((addr: any) => addr.isDefault) || addresses[0];
      
      return defaultAddress.id;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Could not retrieve shipping address');
    }
  },

  async createOrder(cartItems: CartItem[]) {
    const shippingAddressId = await this.getDefaultAddressId();

    const payload: CreateOrderDto = {
      items: cartItems.map((item) => ({
        productId: item.product.id,
        quantity: item.quantity,
      })),
      shippingAddressId,
    };

    try {
      const response = await api.post('/orders', payload);
      return response.data; 
    } catch (error: any) {
      const message = error.response?.data?.message || 'Failed to create order';
      throw new Error(Array.isArray(message) ? message[0] : message);
    }
  },

  async createPaymentIntent(orderId: string) {
    try {
      const response = await api.post('/payments/create-intent', { orderId });
      return response.data;
    } catch (error: any) {
      const message = error.response?.data?.message || 'Failed to create payment intent';
      throw new Error(message);
    }
  },
};