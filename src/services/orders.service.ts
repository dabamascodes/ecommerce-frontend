import { api } from './api.config';
import type { Order } from '../interfaces';

export const ordersService = {
  getMyOrders: async (limit = 10, offset = 0): Promise<Order[]> => {
    const { data } = await api.get<Order[]>('/orders', {
      params: { limit, offset },
    });
    return data;
  },

  getOrderById: async (id: string): Promise<Order> => {
    const { data } = await api.get<Order>(`/orders/${id}`);
    return data;
  },

  cancelOrder: async (id: string): Promise<Order> => {
    const { data } = await api.patch<Order>(`/orders/${id}/cancel`);
    return data;
  },
};