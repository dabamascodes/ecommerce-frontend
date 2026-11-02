import { api } from './api.config';
import type { CartItem, Address } from '../interfaces';

interface CreateOrderDto {
  items: { productId: string | number; quantity: number }[];
  shippingAddressId: string;
}

export const checkoutService = {
  async getUserAddresses(): Promise<Address[]> {
    try {
      const response = await api.get('/addresses');
      return response.data || [];
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Could not retrieve shipping addresses');
    }
  },

  async getDefaultAddressId(): Promise<string> {
    const addresses = await this.getUserAddresses();
    if (!addresses || addresses.length === 0) {
      throw new Error('No shipping addresses found. Please add an address first.');
    }
    const defaultAddress = addresses.find((addr) => addr.isDefault) || addresses[0];
    return defaultAddress.id;
  },

  async createOrder(cartItems: CartItem[], selectedAddressId?: string) {
    const shippingAddressId = selectedAddressId || (await this.getDefaultAddressId());

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

  async cancelOrder(orderId: string) {
    try {
      const response = await api.patch(`/orders/${orderId}/cancel`);
      return response.data;
    } catch (error: any) {
      const message = error.response?.data?.message || 'Failed to cancel order';
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

  async validateCart(cartItems: CartItem[]) {
    const payload = {
      items: cartItems.map(item => ({
        productId: item.product.id,
        quantity: item.quantity,
        price: Number(item.product.price),
      })),
    };
    const response = await api.post('/products/validate-cart', payload);
    return response.data;
  }
};