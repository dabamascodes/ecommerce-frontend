import { api } from './api.config';
import type { Product } from '../interfaces';

export const productService = {
  getProducts: async (limit = 8, offset = 0, search = ''): Promise<Product[]|any> => {
    const response = await api.get<Product[]>('/products', {
      params: {
        limit,
        offset,
        ...(search.trim() ? { search: search.trim() } : {}),
      },
    });
    return response.data;
  },

  getProductBySlug: async (slug: string): Promise<Product> => {
    const response = await api.get<Product>(`/products/${slug}`);
    return response.data;
  },
};