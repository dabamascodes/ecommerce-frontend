import type { Product } from './product.interface';
import type { Address } from './address.interface';

export type OrderStatus = 'PENDING' | 'PAID' | 'CANCELLED' | 'PROCESSING' | 'SHIPPED' | 'DELIVERED';

export const OrderStatus = {
  PENDING: 'PENDING' as OrderStatus,
  PAID: 'PAID' as OrderStatus,
  CANCELLED: 'CANCELLED' as OrderStatus,
  PROCESSING: 'PROCESSING' as OrderStatus,
  SHIPPED: 'SHIPPED' as OrderStatus,
  DELIVERED: 'DELIVERED' as OrderStatus,
};

export interface OrderItem {
  id: string;
  quantity: number;
  price: number;
  product: Product;
}

export interface Order {
  id: string;
  subtotal: number;
  discount: number;
  tax: number;
  total: number;
  status: OrderStatus;
  createdAt: string;
  shippingAddress: Address;
  orderItems: OrderItem[];
}