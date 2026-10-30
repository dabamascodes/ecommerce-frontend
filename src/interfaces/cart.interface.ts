import type { Product } from './product.interface';

export interface CartItem {
  product: Product;
  quantity: number;
  selectedSize?: string;
}

export interface Cart {
  id?: string;
  items: CartItem[];
  totalItems: number;
  totalPrice: number;
}